<script lang="tsx">
/**
 * 日期控件
 * @version 0.0-alpha.9.210609  增加z-index，防止被遮挡；增加白色背景色，防止穿透背景
 * @changelog
 *          0.0-alpha.9.210609  增加z-index，防止被遮挡；增加白色背景色，防止穿透背景
 *          0.0-alpha.8.210602  高亮今天
 *          0.0-alpha.7.210602 点击插件外隐藏插件。依赖 SyGlobalClickPlugin ^2.0.2
 *          0.0-alpha.6 样式修改
 *          0.0-alpha.5 可控制显示隐藏。通过`props.active`，可双向绑定。
 *          0.0-alpha.4 显示与选择分离。可支持切换月份时不修改选择的值。
 *          0.0-alpha.3 支持默认为空值
 *          0.0-alpha.2 修正名字、对传递值进行处理
 *          0.0-alpha.1 完成简单界面部分，与选择部分
 * @dependOn 
 *      vue ^3.0.5
 *      SyGlobalClickPlugin ^2.0.2
 * @todoList
 *      - [x] 高亮今天
 *      - [ ] 快速跳转到今天
 *      - [ ] 选择修改年-月
 *      - [ ] 手动关闭插件
 */
// FIXME: 日期选择框被element-plus的tabs挡住了。
import { computed, defineComponent, onMounted, onUnmounted, ref, toRefs, watchEffect } from 'vue'
import { add as gcpAdd, remove as gcpRemove, Setting as GcpSetting} from './SyGlobalClickPlugin'
interface DayItem{
    type: 'prev' | 'now' | 'next' | 'none'
    year: number
    month: number
    day: number
}

interface YearMonth{
    year: number
    month: number
}

export default defineComponent({
    props: {
        /**
         * 是否激活（显示）
         */
        active:{
            type: Boolean,
            default: false
        },
        modelValue:{
            type: String,
            required: true
        }
    },
    emits: ['update:modelValue', 'update:active'],
    setup(props, context) {

        //#region 基础
        /**
         * 控件的输出值
         */
        const value = computed({
            get(){
                return props.modelValue
            },
            set(val : string){
                context.emit('update:modelValue', val)
            }
        })
        
        const weekItemList = ref(['日','一','二','三','四','五','六'])
        const dayItemList = ref(new Array(42) as DayItem[])
        
        //#endregion

        //#region 显示

        /**
         * 显示的年月
         */
        const displayYearMonth = ref({
            year: 0,
            month: 0,
        } as YearMonth)

        
        // 渲染控件的日部分
        watchEffect(() => {
            renderDay()
        })
        
        /**
         * 渲染控件的日部分
         */
        function renderDay(){
            const monthStart = new Date(displayYearMonth.value.year, displayYearMonth.value.month - 1, 1)

            const weekDayOfMonthStart = monthStart.getDay()

            const monthEnd = new Date(monthStart)
            monthEnd.setMonth(monthStart.getMonth() + 1)
            monthEnd.setDate(0)

            const daysOfmonth = monthEnd.getDate()

            const prevMonthEnd = new Date(monthStart)
            prevMonthEnd.setDate(0)

            const nextMonthStart = new Date(monthEnd)
            nextMonthStart.setDate(monthEnd.getDate() + 1)

            const daysOfprevMonth = prevMonthEnd.getDate()
            const currentYear = displayYearMonth.value.year
            const currentMonth = displayYearMonth.value.month
            const yearOfPrevMonth = prevMonthEnd.getFullYear()
            const monthOfPrevMonth = prevMonthEnd.getMonth() + 1
            const yearOfNextMonth = nextMonthStart.getFullYear()
            const monthOfNextMonth = nextMonthStart.getMonth() + 1

            let d = 1
            for(let i = 0; i < daysOfmonth; i++){
                dayItemList.value[i + weekDayOfMonthStart] = {type: 'now', year: currentYear, month: currentMonth, day: d++}
            }
            for(let i = 0; i < weekDayOfMonthStart; i++){
                dayItemList.value[i] = { type: 'prev', year: yearOfPrevMonth, month: monthOfPrevMonth, day: daysOfprevMonth - weekDayOfMonthStart + i + 1 }
            }
            d = 1
            for(let i = weekDayOfMonthStart + daysOfmonth; i < dayItemList.value.length; i++){
                dayItemList.value[i] = { type: 'next', year: yearOfNextMonth, month: monthOfNextMonth , day: d++ }
            }
        }

        //#endregion

        //#region 选择

        /**
         * 选中的日期元素
         */
        const selectedDate = ref({
            type: 'none',
            year: 0,
            month: 0, // 1月为1
            day: 0,
        } as DayItem)

        /**
         * 选中的日期索引
         */
        const selectedIndex = computed(() => {
            if(selectedDate.value.type === 'none'){
                return -1 // 让其选不中
            }
            // 找不到会返回 -1，当显示的日期不包含选择日期时会有此情况。
            return dayItemList.value.findIndex(v => 
                    v.year === selectedDate.value.year && v.month === selectedDate.value.month && v.day === selectedDate.value.day)
        })

        /**
         * 选中的值
         */
        const selectedValue = computed(()=>{
            if(selectedDate.value.type === 'none'){
                return ''
            }
            return `${(selectedDate.value.year+'').padStart(4,'0')}-${(selectedDate.value.month+'').padStart(2,'0')}-${(selectedDate.value.day+'').padStart(2,'0')}`
        })

        // value 修改触发 selectedDate 的修改
        watchEffect(() => {
            if(typeof value.value === undefined || value.value === ''){
                const date = new Date()
                selectedDate.value = {
                    type: 'none',
                    year: 0,
                    month: 0,
                    day: 0,
                }
                // 渲染控件日部分使用
                displayYearMonth.value = {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                }
            }else{
                const date = new Date(value.value)
                selectedDate.value = {
                    type: 'now',
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                }
                // 渲染控件日部分使用
                displayYearMonth.value = {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                }
            }
        })

        /** 
         * 选择日期
         */
        function selectDay(dayItem : DayItem, index: number){
            selectedDate.value = dayItem
            value.value = selectedValue.value
            context.emit('update:active', false)
        }

        //#endregion

        //#region 全局点击事件

        const rootDom = ref(null as unknown as HTMLDivElement)

        let gcpSetting : GcpSetting
        onMounted(() => {
            gcpSetting = {
                dom: rootDom.value,
                unclickHandlerInCapturePhase: () => context.emit('update:active', false)
            }
            gcpAdd(gcpSetting)
        })

        onUnmounted(() => {
            gcpRemove(gcpSetting)
        })

        //#endregion

        //#region 切换

        /**
         * 上一月
         */
        function prevMonth(){
            if(displayYearMonth.value.month === 1){
                displayYearMonth.value.year = displayYearMonth.value.year - 1
                displayYearMonth.value.month = 12
            }else{
                displayYearMonth.value.month = displayYearMonth.value.month - 1
            }
        }

        /**
         * 下一月
         */
        function nextMonth(){
            if(displayYearMonth.value.month === 12){
                displayYearMonth.value.year = displayYearMonth.value.year + 1
                displayYearMonth.value.month = 1
            }else{
                displayYearMonth.value.month = displayYearMonth.value.month + 1
            }
        }

        //#endregion

        //#region 今天高亮
        
        /**
         * 今日所在的 index
         */
        const todayDayItemIndex = computed(() => {
            const date = new Date()
            // 如果不在返回内会返回 -1
            return dayItemList.value.findIndex(v => 
                    v.year === date.getFullYear() && v.month === (date.getMonth() + 1) && v.day === date.getDate())
        })

        //#endregion

        return () => (
            <div class="sy-datepicker"
                    class={{'sy-datepicker--active' : props.active}}
                    ref={rootDom}>
                <div class="sy-datepicker__year-month-bar">
                    <div class="sy-datepicker__ctl-month-btn sy-datepicker__prev-month-btn"
                            onClick={prevMonth}>&lt;</div>
                    <div class="sy-datepicker__year-month">{displayYearMonth.value.year.toString().padStart(4, '0')}-{displayYearMonth.value.month.toString().padStart(2, '0')}</div>
                    <div class="sy-datepicker__ctl-month-btn sy-datepicker__next-month-btn"
                            onClick={nextMonth}>&gt;</div>
                </div>
                <div class="sy-datepicker__week-bar">
                    {weekItemList.value.map(v => <div class="sy-datepicker__week-item">{v}</div>)}
                </div>
                <div class="sy-datepicker__day-box">
                    {dayItemList.value.map((v,i) => 
                        <div class="sy-datepicker__day-item"
                                class={{
                                    'sy-datepicker__day-item--gray' : v.type !== 'now',
                                    'sy-datepicker__day-item--active' : i === selectedIndex.value,
                                    'sy-datepicker__day-item--today' : i === todayDayItemIndex.value,
                                }}
                                onClick={() => selectDay(v,i)}>{v.day}</div>)}
                </div>
            </div>
        )
    },
})
</script>

<style scoped>
    *{
        --primary-color: #409EFF;
        --primary-light-color: #d9ecff; 
        --danger-dark-color: #F44;
        --danger-color: #F56C6C; /* 文字色可用 */
        --danger-light-color: #fde2e2; /* 背景色可用 */
        --danger-light-2-color: #fef0f0;
        --info-color: #909399;
        --info-light-color: #e9e9eb;

        --selected-color: rgb(0, 255, 242);
        --year-month-bar--height: 24px;
    }
    .sy-datepicker{
        display: none;

        position: absolute;
        z-index: 1;
        
        box-sizing: border-box;
        padding: 4px;
        border: 1px solid var(--info-light-color);
        border-radius: 3px;
        width: 200px;
        
        font-size: 12px;

        background: #fff;
        
        user-select: none; /* 用户不可选 */
    }
    .sy-datepicker--active{
        display: block;
    }
    .sy-datepicker__year-month-bar{
        display: flex;
        justify-content: space-between;
        height: var(--year-month-bar--height);
    }
    .sy-datepicker__ctl-month-btn{
        width: var(--year-month-bar--height);
        text-align: center;
        cursor: pointer;
    }
    .sy-datepicker__ctl-month-btn:hover{
        background: #ccc;
    }
    .sy-datepicker__week-bar{
        display: flex;
        justify-content: space-around;
    }
    .sy-datepicker__day-box{
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        /* grid-template-rows: repeat(auto-fill, 1fr); */
        text-align: center;
    }
    .sy-datepicker__day-item{
        cursor: pointer;
    }
    .sy-datepicker__day-item:hover{
        background: #ccc;
        border-radius: 50%;
    }
    .sy-datepicker__day-item--gray{
        color: #ccc;
    }
    .sy-datepicker__day-item--today{
        color: var(--primary-color);
        font-weight: bold;
    }
    .sy-datepicker__day-item--active{
        background: var(--selected-color);
        border-radius: 50%;
    }
</style>