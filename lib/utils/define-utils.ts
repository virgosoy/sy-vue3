
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
type PropOfSelectDialog = {
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
type SelectListGenerator = () => Promise<Array<string>> | Array<string>

/**
 * 选择下拉框相关设置
 */
type PropOfSelect = {
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
export type SyGridFieldProp<K extends string = string> = {
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
} & SyGridInnerFieldProp

/**
 * 内置属性
 */
type SyGridInnerFieldProp = {
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
// export function defineSyGridFieldList(options : Array<Omit<SyGridFieldProp, keyof InnerFieldProp>>) : Array<SyGridFieldProp>
// export function defineSyGridFieldList<E>(options : Array<Omit<SyGridFieldProp, keyof InnerFieldProp>>, typeInstance : E) : Array<SyGridFieldProp<E>>
export function defineSyGridFieldList
        <E extends Record<string, any> = Record<string, any>>
        (options : Array<Omit<SyGridFieldProp<keyof E & string>, keyof SyGridInnerFieldProp>>, typeInstance ?: E){
    return options as Array<SyGridFieldProp<keyof E & string>>
}

/**
 * 设置，值全为可选
 */
export type SyGridSetting = {
    /** 是否默认空值为空字符串 */
    isDefaultEmptyStringOfValue?: boolean
    /** 是否为只读模式 */
    isReadMode?: boolean
}

/**
 * 定义 SyGrid 组件的 setting 参数值
 * @param options 
 * @returns 
 */
export function defineSyGridSetting(options : SyGridSetting){
    return options
}

//#endregion SyGrid

//#region SyTable

/**
 * 数据行对象
 */
export type SyTableRow = Object & SyTableInnerRow

/**
 * 内置表格行对象
 */
export type SyTableInnerRow = {
    /** 内置id */
    _syRowId: number
}

/**
 * 千分位文本输入框配置项
 */
type CurrencyOption = {
    /** 精度，默认为无限 */
    digit?: number
}

/**
 * 列属性
 */
export type SyTableFieldProp<K extends string = string> = {
    /** 表格数据的key */
    key: K
    /** 显示名 */
    label: string
    /**
     * 数据类型，默认text，有 
     *          - text  普通文本（目前没特殊用途）
     *          - fixed   只读不可变，一般是后端传递过来
     *          - percent   百分比文本输入框（注意：显示值与真实值不同）
     *          - currency  千分位文本输入框（注意：显示值与真实值不同）
     */
    dataType?: 'text' | 'fixed' | 'percent' | 'currency'
    /** 可选，当 dataType==='currecy' 时有效，千分位文本输入框配置项 */
    currencyOption?: CurrencyOption
    /** 表格css宽度 */
    width?: string
    /** 是否前端表格显示，默认 true */
    isShow?: boolean
    /** 是否发送给后端，默认 true */
    isSend?: boolean
    /** 可选，校验规则函数 */
    validRule?: Function
    /** 可选，选择列表/选择列表生成器，如果有此参数则会提供下拉列表，否则不会提供 */
    selectList?: ((row: SyTableRow) => Promise<string[]>) | string[]
    /** 可选，新行默认值生成器，回调函数返回值将作为新行创建时的默认值。无配置则不处理。 */
    defaultValue?: () => any
} & SyTableInnerFieldProp

/**
 * 内置属性
 */
type SyTableInnerFieldProp = {
    /** 内置属性，只读 */
    _readonly: boolean
}

/**
 * 定义 SyTable 组件的 columnPropList 参数值
 * @param options
 * @param typeInstance 可选，类型实例，用于约束key的值
 */
export function defineSyTableFieldList<E = any>
        (options : Array<Omit<SyTableFieldProp<keyof E & string>, keyof SyTableInnerFieldProp>>, typeInstance ?: E){
    return options as Array<SyTableFieldProp<keyof E & string>>
}

/**
 * 设置，全部值均为可选
 */
export type SyTableSetting<K extends string = string> = {
    /** 操作列宽度，css字符串 */
    opWidth?: string
    /** 序号列宽度，css字符串 */
    orderWidth?: string
    /** 最小行数（含）。删除/获取提交数据不控制，仅校验时使用 */
    minRowCount?: number
    /** 最大行数（含），-1 为无限）。删除/获取提交数据不控制；新增行会控制，校验时使用 */
    maxRowCount?: number
    /** 排序key名，无配置表示没有排序 */
    orderKey?: K
    /** 只读行处理器，传入一个回调函数，返回该行是否只读。无配置表示都不只读。 */
    readonlyRowHandler?: ({rowData, rowIndexOfShow} : {rowData : SyTableRow, rowIndexOfShow : number})=>boolean
    /** 不可删除行处理器，传入一个回调函数，返回该行是否可删。无配置表示都可删。 */
    deleteRowHandler?: ({rowData, rowIndexOfShow} : {rowData : SyTableRow, rowIndexOfShow : number})=>boolean
    /** 是否可增加行 */
    canAddRow?: boolean
    /** 是否可删除行 */
    canRemoveRow?: boolean
    /**
     * 是否可任意位置增加行（侧边的+号）
     *      会受 `canAddRow = false` 影响，即前提为 `canAddRow = true` 配置才有效
     */
    canAddRowOfAnyWhere?: boolean
    /** 是否为只读模式 */
    isReadMode?: boolean
}

/**
 * 定义 SyTable 组件的 setting 参数值
 * @param options 
 * @returns 
 */
export function defineSyTableSetting(options : SyTableSetting){
    return options
}

//#endregion SyTable