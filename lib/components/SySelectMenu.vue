<script lang="jsx">
// @ts-check
/**
 * 下拉选择框
 * @version 1.2.0.210810    增加过滤（根据输入的值筛选下拉列表）`props.setting.enableFilter`
 * @changelog
 *      1.2.0.210810    增加过滤（根据输入的值筛选下拉列表）`props.setting.enableFilter`
 *      1.1.1.210810    增加 `props.setting.maxHeight` 设置下拉列表最大高度
 *      1.1.0.210530    增加 `props.setting.minWidth` 设置下拉列表最小宽度、调整字体默认大小
 *      1.0.1.210528    增加z-index，防止被遮挡
 *      1.0.0.210526
 * @todoList
 *      - [ ] 下拉选项过多的处理方式（最大高度限制？）
 */
import { computed, defineComponent, toRefs } from 'vue'

export default defineComponent({
    props:{
        active:{
            type: Boolean,
            default: false
        },
        /**
         * v-model，选择的值
         */
        modelValue:{
            type: String,
            required: true
        },
        /**
         * 下拉列表
         */
        list:{
            type: /** @type {import('vue').PropType<string[]>} */(Array),
            required: true
        },
        /**
         * 是否加载中，如果为true，那么会显示loading项，但也依然还会显示list下拉项
         */
        loading:{
            type: Boolean,
            default: false
        },
        /**
         * @typedef {Object} Setting 设置
         * @property {string} minWidth 最小宽度css
         * @property {string} maxHeight 最大高度css
         * @property {boolean} enableFilter 开启过滤（根据输入的值筛选下拉列表）
         */
        setting: {
            type: /** @type {import('vue').PropType<Setting>} */(Object),
            required: false,
        }
    },
    emits:['update:modelValue'],
    setup(props, context) {
        const { list, loading, setting } = toRefs(props);
        const value = computed({
            get(){
                return props.modelValue
            },
            set(v){
                context.emit('update:modelValue', v)
            }
        })

        /**
         * 实际使用的配置
         * 不会修改传入的配置，因为用了 Object.assign
         */
        const realSetting = computed(()=>{
            /** @type {Setting} */
            const result = Object.assign({}, 
                    /* 默认值 */
                    {
                        minWidth: '100px',
                        maxHeight: '200px',
                        enableFilter: false,
                    },
                    setting?.value)
            return result
        })

        /**
         * 显示的列表
         */
        const visibleList = computed(() => {
            if(realSetting.value.enableFilter){
                return list.value.filter(v => v.includes(value.value))
            }else{
                return list.value
            }
        })

        return () => 
            <div class="sy-select-menu" 
                // @ts-ignore
                class={{'sy-select-menu--active': props.active}}
                style={{ minWidth: realSetting.value.minWidth }}>
                <div class="sy-select-menu__options-wrap"
                    style={{ maxHeight: realSetting.value.maxHeight }}>
                    <ul>
                        {visibleList.value.map((v) => <li class="sy-select-menu__option" onMousedown={() => value.value = v}>{v}</li>)}
                        { loading.value ? <li class="sy-select-menu__loading">loading</li> : '' }
                    </ul>
                </div>
            </div>
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

        --border-radius: 3px;
        --option-height: 18px;
        --font-size: 12px;
    }
    ul li{
        list-style-type: none;
    }
    .sy-select-menu{
        position: absolute;
        z-index: 1;
        display: none;
        background: #fff;
        border-radius: var(--border-radius);
        /* min-width: 100px; */
        font-size: var(--font-size);
        line-height: var(--option-height);
    }
    .sy-select-menu--active{
        display: block;
    }

    .sy-select-menu__options-wrap{
        border: 1px solid #000;
        border-radius: var(--border-radius);
        /* 限制最大高度 */
        /* max-height: 200px; vue 传入 */
        overflow-y: auto;
    }

    .sy-select-menu ul{
        margin: 3px 0;
        padding: 0;
    }
    .sy-select-menu li{
        min-height: var(--option-height);
        padding: 2px 5px;
    }
    .sy-select-menu__option{
        cursor: pointer;
    }
    .sy-select-menu__option:hover{
        background: var(--primary-color);
        color: #fff;
    }

    .sy-select-menu__loading{
        /* padding: 2px 5px; */
        cursor: not-allowed;
        color: var(--info-color);
        background: var(--info-light-color);
    }
</style>

