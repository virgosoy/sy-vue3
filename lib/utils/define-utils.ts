
/**
 * 方便进行代码提示的define工具类
 * 参考 vue 的 defineComponent
 * https://github.com/vuejs/vue-next/blob/master/packages/runtime-core/src/apiDefineComponent.ts
 * @version N/A 无版本号，与各个组件同步
 * @changeLog 相关 defineXxx 方法记录到各个组件中
 */

//#region SyGrid
/**
 * 选择对话框相关设置
 */
export type PropOfSelectDialog = {
    /**
     * 数据列表
     */
    dataList : Array<any> | (() => Array<any> | Promise<Array<any>>)
    /**
     * 提交回调函数
     */
    onSubmit : (item : any) => void
    /**
     * 模板dom
     */
    template : (item : any) => string
}

/**
 * 下拉列表数据异步函数类型
 */
export type SelectListGenerator = () => Promise<Array<string>> | Array<string>

/**
 * 选择下拉框相关设置
 */
export type PropOfSelect = {
    /**
     * 下拉列表数据异步函数
     */
    selectList : SelectListGenerator
    /**
     * 刷新策略（此对象中必须，就是说如果配置了此对象，那么需要有这个值）
     *      - watchEffect 默认，使用 vue 的 watchEffect 触发
     *      - drop 下拉时触发
     *      - once 只触发一次，在加载时触发
     */
    refreshStrategy : 'watchEffect' | 'drop' | 'once'
    /**
     * 开启过滤（根据输入的值进行过滤），用的是 SySelectMenu 的功能，默认 false
     */
    enableFilter : boolean
}

/**
 * 字段属性
 */
export type FieldProp<K extends string = string> = {
    /**
     * 字段
     */
    key : K
    /**
     * 字段显示名
     */
    label : string
    /**
     * 数据类型，默认 text
     * - text 字符串
     * - fixed 只读固定
     * - select 下拉选择
     * - selectDialog 选择对话框（即SySelectDialog）
     * - date 日期
     * - pick 通过外部选择来修改值，值不可直接通过键盘输入，需通过事件（onClick）来进行修改。
     * - textarea 多行文本框
     * - jsonObject json对象。输入框为多行文本框；获取提交数据为json对象，不输入会返回null；内部保存的还是字符串。
     */
    dataType ?: 'text' | 'fixed' | 'select' | 'selectDialog' | 'date' | 'pick' | 'textarea' | 'jsonObject'
    /**
     * 校验规则，可选，自动封装字段后传入 AsyncValidator
     */
    validRule ?: Function,
    /**
     * 是否显示数据，默认 true
     */
    isShow ?: boolean,
    /**
     * 是否发送数据给后端，默认 true
     */
    isSend ?: boolean
    /**
     * 是否必填（样式显示，不做校验），默认 false
     */
    isRequired ?: boolean
    /**
     * 下拉列表数据异步函数。建议使用 selectOption.selectList 代替。
     */
    selectList ?: SelectListGenerator
    /**
     * 下拉列表配置，可选
     */
    selectOption ?: PropOfSelect
    /**
     * dataType==='pick' 时有效，表示点击输入框时的事件处理
     */
    onClick ?: (e : Event, {key} : {key :string}) => void
    /**
     * 选择对话框相关设置
     */
    selectDialog ?: PropOfSelectDialog
    /**
     * 可选，是否占据整行，默认值：false，如果 dataType==='textarea'，则默认为true
     */
    isFullRow ?: boolean
    /**
     * 可选，当值为空时是否提交null值，而非空字符串。默认为false，空字符串。
     *      此选项对 dataType === 'jsonObject' 无效，因为这个类型默认空就是返回 null
     *      isSubmitNullWhenEmpty 为 true 并且值为空时，submitDataPreHandler 不生效
     */
    isSubmitNullWhenEmpty ?: boolean
    /**
     * @beta可选，获取提交数据前对值进行处理的函数，参数 value 为原值，返回值为新值。默认不处理
     *      isSubmitNullWhenEmpty 为 true 并且值为空时，submitDataPreHandler 不生效
     */
    submitDataPreHandler ?: (value : any) => any
} & InnerFieldProp

/**
 * 内置属性
 */
type InnerFieldProp = {
    /**
     * 内置，input 的 type 值
     */
    _inputType : string
}

/**
 * 定义 SyGrid 组件的 fieldList 参数值
 * @param options 
 * @param typeInstance 可选，类型实例，用于规定key的范围
 * @returns 
 */
// export function defindSyGridFieldList(options : Array<Omit<FieldProp, keyof InnerFieldProp>>) : Array<FieldProp>
// export function defindSyGridFieldList<E>(options : Array<Omit<FieldProp, keyof InnerFieldProp>>, typeInstance : E) : Array<FieldProp<E>>
export function defindSyGridFieldList
        <E extends Record<string, any> = Record<string, any>>
        (options : Array<Omit<FieldProp<keyof E & string>, keyof InnerFieldProp>>, typeInstance ?: E){
    return options as Array<FieldProp<keyof E & string>>
}

//#endregion SyGrid