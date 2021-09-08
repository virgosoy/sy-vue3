<script lang="tsx">
/**
 * 选择对话框
 * @version 0.1.2.210728 `props.dataList`传入函数再也不会警告了
 * @changeLog 
 *      0.1.2.210728 `props.dataList`传入函数再也不会警告了
 *      0.1.1.210712 事件submit在单选时事件对象为单个值，多选时为数组
 *      0.0.13.210712 全屏模式
 *      0.0.12.210709 fix: 修复默认搜索不生效
 *      🐞0.0.11.210709 传入数据(`props.dataList`)支持异步函数，支持自定义搜索器(`props.searchFilter`)    has bug
 *      0.0.10.210709 增加最大高度`props.setting.maxHeight`
 *      0.0.9.210708 增加清空搜索功能
 *      0.0.8.210708 增加外部控制显示组件`props.active`
 *      0.0.7.210708 多选单选选择框不同
 *      0.0.6.210707 增加v-model，为已选择列表；修改一下样式与文字
 *      0.0.5.210707 增加绝对定位设置
 *      0.0.4.210707 搜索无数据时给予显示
 *      0.0.3.210707 增加外部输入查询字符串功能
 *      0.0.2.210707 增加多选与单选的设置
 *      0.0.1.210707 基础的选择与查找功能
 * @dependOn 
 *      vue ^3.0.5
 *      Teleport需要外部#end-of-body
 * @todoList
 *      搜索可以异步搜索结果
 * 插槽：
 *      default：
 *          作用域：
 *          item - 数据列表中的项
 */
import { computed, defineComponent, PropType, ref, toRefs, watchEffect, Teleport } from 'vue'

type Setting = {
    /**
     * 最大高度
     */
    maxHeight: string
}
export default defineComponent({
    props:{
        // FIXME: 传递函数的时候前端有警告
        /**
         * 可选数据列表\
         * 可以是列表，也可以是生成列表的(异步)工厂函数\
         * 不推荐：在参数里面直接传入创建的函数，如()=>foo()，因为重新渲染时会被重复创建。建议直接传入函数如foo
         */
        dataList: {
            type: [Object, Function] as PropType<Array<any> | (() => Promise<Array<any>> | Array<any>)>,
            required: true
        },
        // FIXME: 如果是异步，那么每次dataList生成的对象会是不一样的，这时候已选择的东西就不会显示了
        /**
         * 已选择列表\
         * 建议使用双向数据绑定
         */
        modelValue: {
            type: Array as PropType<Array<any>>,
            required: false
        },
        /**
         * 是否可多选
         */
        multiple: {
            type: Boolean,
            required: false,
            default: false
        },
        /**
         * 查询字符串\
         * 可选，如果有传入的话不会显示内置输入框，否则会显示
         */
        search: {
            type: String,
            required: false
        },
        /**
         * 查询过滤器\
         * 可选，指定如何过滤搜索，对现有结果进行搜索。\
         * 默认查询item的所有字符串
         */
        searchFilter: {
            type: Function as PropType<(item : any, search : string) => boolean>,
            required: false
        },
        /**
         * 是否使用绝对定位
         */
        absolute: {
            type: Boolean,
            required: false,
            default: false
        },
        /**
         * 是否处于活动状态（显示）\
         * 建议使用双向数据绑定\
         * 可选，如果外部不传入的话，内部的active会一直都是true\
         * 如果外部有传入且双向数据绑定，点击确定和取消按钮都会使active变为false
         */
        active: {
            type: Boolean,
            required: false,
            default: true
        },
        // TODO: 全屏可以单独做成组件或指令？
        /**
         * 是否全屏显示\
         * 可选，默认不全屏
         */
        fullscreen: {
            type: Boolean,
            required: false,
            default: false
        },
        /**
         * 其他配置项
         */
        setting: {
            type: Object as PropType<Setting>,
            required: false,
            default: () => {
                return {maxHeight: '120px'}
            }
        }
    },
    /**
     * 事件：
     *      submit - 提交时触发
     *          事件对象：已选择的数据，多选时返回数组，单选时返回单个数据（无为undefined）
     *      cancel - 点击取消时触发
     *          事件对象：（无）
     */
    emits:['submit', 'cancel', 'update:modelValue', 'update:active'],
    setup(props, context) {
        const { dataList : dataListProp, multiple, absolute, fullscreen } = toRefs(props)

        //#region 通用
        const dataList = ref([] as Array<any>)
        //#endregion

        //#region 选择
        /**
         * 内部保存的选择列表，只在下面的computed使用，代替没有传入 v-model 的情况
         */
        const innerSelectedItemList = ref([] as Array<any>)
        const selectedItemList = computed({
            get(){
                if('modelValue' in props){
                    return props.modelValue!
                }else{
                    return innerSelectedItemList.value
                }
            },
            set(v : Array<any>){
                innerSelectedItemList.value = v
                context.emit('update:modelValue', v)
            }
        })

        function toggleSelectItem(item : any){
            let i = selectedItemList.value.indexOf(item)
            if(i !== -1){
                // 找到就移除
                selectedItemList.value.splice(i, 1)
            }else{
                if(!multiple.value && selectedItemList.value.length >= 1){
                    // 不是多选 并且 已经选择了1个及以上
                    // 先清空所有选择
                    selectedItemList.value.splice(0, selectedItemList.value.length)
                }
                // 找不到就插入
                selectedItemList.value.push(item)
            }
        }
        //#endregion

        //#region active（显示）
        const active = computed({
            get(){
                return props.active
            },
            set(v : boolean){
                context.emit('update:active', v)
            }
        })
        //#endregion

        //#region 按钮
        function submit(){
            // 如果外部没有提供 active 属性的话，此处触发 emit 会触发个寂寞，从而不会更新 active 的值
            // 符合我们想要的效果：外部没提供 active 属性时不改动 active
            active.value = false

            // 多选时返回数组，单选时返回单个数据（无为undefined）
            context.emit('submit', multiple.value ? selectedItemList.value : selectedItemList.value[0])
        }

        function resetSelect(){
            selectedItemList.value.splice(0, selectedItemList.value.length)
        }

        function cancel(){
            // 如果外部没有提供 active 属性的话，此处触发 emit 会触发个寂寞，从而不会更新 active 的值
            // 符合我们想要的效果：外部没提供 active 属性时不改动 active
            active.value = false

            context.emit('cancel')
        }
        //#endregion

        //#region 搜索
        
        /* 判断是否要显示内置输入框 */
        const isVisibleOfSearchInput = ref(false)
        if(!('search' in props)){
            isVisibleOfSearchInput.value = true
        }

        /* 要查询的文本 */
        // 查询文本，内置文本框时才使用，赋值用这个，外部的不会给此赋值
        const innerSearchText = ref('')
        // 读取查询文本用这个
        const searchText = computed(() => isVisibleOfSearchInput.value ? innerSearchText.value : props.search!)

        const searchFilter = computed(() => 
            'searchFilter' in props ? 
                props.searchFilter! : 
                (item : any, search : string) : boolean => {
                    if(typeof item === 'string'){
                        return item.includes(search)
                    }else if(typeof item === 'object'){
                        return Object.values(item).some(item => searchFilter.value(item, search))
                    }else{
                        return false
                    }
                })
        
        const visibleDataList = computed(() => {
            return dataList.value.filter(item => searchFilter.value(item, searchText.value))
        })

        function clearSearch(){
            innerSearchText.value = ''
        }
        //#endregion

        //#region 数据初始化
        watchEffect(async () => {
            if(typeof dataListProp.value === 'function'){
                dataList.value = await dataListProp.value()
            }else{
                dataList.value = dataListProp.value as Array<any>
            }
        })
        //#endregion
        
        return () => (
            <Teleport to="#end-of-body" disabled={!fullscreen.value} >
                <div class="sy-select-dialog" 
                    class={{'sy-select-dialog--absolute': absolute.value, 
                            'sy-select-dialog--active': active.value,
                            'sy-select-dialog--fullscreen': fullscreen.value}}>
                            
                    {/*全屏时需要遮罩层*/
                    fullscreen.value && active.value && <div class="sy-select-dialog__mask"></div>}

                    <div class="sy-select-dialog__main">
                        {isVisibleOfSearchInput.value && 
                            <div class="sy-select-dialog__search-wrap">
                                搜索：<input class="sy-select-dialog__search-input" v-model={innerSearchText.value}/>
                                <button type="button" onClick={() => clearSearch()}>清空搜索</button>
                            </div>}
                        <div class="sy-select-dialog__result-box"
                            style={{'--max-height': props.setting.maxHeight}}>
                            {visibleDataList.value.length === 0 && <div class="sy-select-dialog__result-no-data">no data found</div>}
                            {visibleDataList.value.map(v => 
                                <div class="sy-select-dialog__result-row" onClick={() => toggleSelectItem(v)}>
                                    <div class="sy-select-dialog__row-check">
                                        <div>{multiple.value ?
                                            (selectedItemList.value.includes(v) ? '✅' : '⬜'/*🧡🤍*/) :
                                            (selectedItemList.value.includes(v) ? '🔵' : '⚪')}</div>
                                    </div>
                                    <div>{context.slots.default?.({item: v})}</div>
                                </div>)}
                        </div>
                        <div class="sy-select-dialog__footer">
                            <div class="sy-select-dialog__operate-box">
                                <button type="button" onClick={submit}>确定</button>
                                <button type="button" onClick={resetSelect}>重置选择</button>
                                <button type="button" onClick={cancel}>取消</button>
                            </div>
                            <div>已选择{selectedItemList.value.length}/{dataList.value.length}项</div>
                        </div>
                    </div>
                </div>
            </Teleport>
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
        --info-light-2-color: #f4f4f5;
        --success-color: #67C23A;
        --success-light-color: #e1f3d8;
        --success-light-2-color: #f0f9eb;
    }

    .sy-select-dialog{
        display: none;
    }
    .sy-select-dialog--absolute{
        position: absolute;
    }
    .sy-select-dialog--active{
        display: block;
    }
    .sy-select-dialog--fullscreen.sy-select-dialog--active{
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .sy-select-dialog__mask{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
        background: rgba(0, 0, 0, 0.6);
    }

    /* 原root中部分移到main上 */
    .sy-select-dialog__main{
        background: #fff;
        border: 1px solid var(--info-color);
        border-radius: 5px;
        padding: 5px;
        box-shadow: 3px 3px 6px var(--info-color);
    }

    .sy-select-dialog__search-wrap{
        display: flex;
    }

    .sy-select-dialog__result-box{
        display: flex;
        flex-direction: column;
        border: 1px solid var(--info-color);
        /* 最大高度 */
        max-height: var(--max-height);
        overflow-y: auto;
    }

    .sy-select-dialog__result-no-data{
        text-align: center;
        color: var(--info-color);
    }
    .sy-select-dialog__result-row{
        display: flex;
    }
    .sy-select-dialog__result-row+.sy-select-dialog__result-row{
        border-top: 1px solid var(--info-color);
    }
    .sy-select-dialog__result-row:hover{
        background: var(--primary-light-color);
        cursor: pointer;
    }
    .sy-select-dialog__row-check{
        width: 24px;
        text-align: center;
    }
    .sy-select-dialog__footer{
        display: flex;
        justify-content: space-between;
    }
</style>