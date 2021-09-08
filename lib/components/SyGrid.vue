<script lang="jsx">
// @ts-check

/**
 * @version 1.15.2.210908    路径含有`@`的改为相对路径
 * @changlog
 *      1.15.2.210908    路径含有`@`的改为相对路径
 *      1.15.1.210917    修改一个变量未使用
 *      1.15.0.210819    增加多行文本框类型`props.fieldList[].dataType==='textarea'`；grid row 最大高度改为自动
 *      1.14.0.210819    增加字段占据整行的设置`props.fieldList[].isFullRow`
 *      1.13.2.210811    fix: 当非字段列表里面的数据变动时会报错
 *      1.13.1.210810    如果 SelectList 开启了过滤，那么第一次点击也会显示全部选项
 *      1.13.0.210810    SySelectMenu 升级，增加过滤`props.fieldList[].selectOption.enableFilter`
 *      1.12.0.210806    增加下拉列表配置`props.fieldList[].selectOption`，可选择下拉列表数据刷新策略
 *      1.11.0.210729   ⚡breaked change：校验返回对象修改
 *      1.10.0.210712   SySelectDialog插件的修改导致的修改
 *      1.9.0.210712    增加数据类型`props.fieldList[].dataType==='selectDialog'`
 *      1.8.0.210712    增加数据类型`props.fieldList[].dataType==='pick'`，用于点击时使用外部组件使用，无法键盘输入值
 *      1.7.0.210604    增加只读模式`props.setting.isReadMode`
 *      1.6.0.210602    fix: label触发文本框click导致选择日期插件后不会隐藏
 *      1.5.1.210602    增加附加属性初始化钩子、修正日期可隐藏
 *      1.5.0-alpha.210601 增加日期类型
 *      1.4.1.210530    下拉列表最小宽度改为160px，与输入框对齐
 *      1.4.0.210528    下拉类型增加下拉图标
 *      1.3.0.210527    隐藏字段
 *      1.2.0.210527    增加插槽
 *      1.1.0.210527    增加下拉列表
 * @dependOn
 *      vue
 *      async-validator
 *      SySelectMenu ^1.2.0
 *      SyDatePicker ^0.0-alpha.7
 *      SySelectDialog ^0.1.1
 * @todoList
    - [ ] 跨列单元格
    - 数据类型 dataType
        - [x] text 字符串
        - [x] fixed 固定不可编辑，可理解为只读
        - [x] date 日期
        - [x] select 下拉值
            - [ ] 只能选择不能自己输入
            - [ ] 联动查询
            - 显示值与真实值，使用2个字段，一个显示一个隐藏，然后外部用 watchEffect 联动
        - [ ] file 文件上传 // TODO
        - [ ] textarea 文本域 // TODO
    - 特殊属性
        - [x] isShow 是否显示数据
        - [x] isSend 是否发送数据给后端
        - [x] isRequired 是否必填（样式显示，不做校验）
        - [x] selectList 下拉列表数据异步函数
            - [ ] 优化响应式触发，目前只要一个改了就会全部触发
    - 数据校验
        - [x] 单个输入框触发事件（sy-invalid）
        - [x] 手动调用（不触发事件）
        - [ ] 数据初始化时校验
    - 数据联动
        - 外部使用 watchEffect
    - [x] 获取数据
    - 整体操作
        - [ ] 整单只读
    - 插槽
        - 字段值插槽 field-${key}
 */

/**
 * 插件使用说明
 * 支持的 v-slot 插槽：
 *      插槽属性：`field-${key}`
 *          key为字段，可以控制指定字段值的显示
 *          会覆盖原有默认输入框，故大部分属性会失效
 *          值为 {fieldProp, value}：
 *              fieldProp - 字段属性
 *              value - 字段值
 */
import { computed, ref, toRefs, watchEffect, defineComponent, watch } from 'vue'
import AsyncValidator from 'async-validator'
import { isUndefined } from '../utils/sy-util/basetype'
import SySelectMenu from './SySelectMenu.vue'
import SyDatePicker from './SyDatePicker.vue'
import SySelectDialog from './SySelectDialog.vue'
export default defineComponent({
    props:{
        /**
         * @typedef {Object} PropOfSelectDialog 选择对话框相关设置
         * @property {Array<any> | (() => Array<any> | Promise<Array<any>>)} dataList 数据列表
         * @property {(item : any) => void} onSubmit 提交回调函数
         * @property {(item : any) => string} template 模板dom
         */
        /** @typedef {() => Promise<Array<string>> | Array<string>} SelectListGenerator 下拉列表数据异步函数类型 */
        /**
         * @typedef {Object} PropOfSelect 选择下拉框相关设置
         * @property {SelectListGenerator} selectList 下拉列表数据异步函数
         * @property {'watchEffect' | 'drop' | 'once'} refreshStrategy 刷新策略
         *      - watchEffect 默认，使用 vue 的 watchEffect 触发
         *      - drop 下拉时触发
         *      - once 只触发一次，在加载时触发
         * @property {boolean} enableFilter 开启过滤（根据输入的值进行过滤），用的是 SySelectMenu 的功能，默认 false
         */
        /**
         * @typedef {Object} FieldProp 字段属性
         * @property {string} key 字段
         * @property {string} label 字段显示名
         * @property {'text' | 'fixed' | 'select' | 'selectDialog' | 'date' | 'pick' | 'textarea'} dataType 数据类型
         *      - text 字符串
         *      - fixed 只读固定
         *      - select 下拉选择
         *      - selectDialog 选择对话框（即SySelectDialog）
         *      - date 日期
         *      - pick 通过外部选择来修改值，值不可直接通过键盘输入，需通过事件（onClick）来进行修改。
         *      - textarea 多行文本框
         * @property {function} validRule 校验规则，自动封装字段后传入 AsyncValidator
         * @property {boolean} isShow 是否显示数据
         * @property {boolean} isSend 是否发送数据给后端
         * @property {boolean} isRequired 是否必填（样式显示，不做校验）
         * @property {SelectListGenerator} selectList 下拉列表数据异步函数
         * @property {?PropOfSelect} selectOption 下拉列表配置，可选
         * @property {(e : Event, {key} : {key :string}) => void} onClick dataType==='pick' 时有效，表示点击输入框时的事件处理
         * @property {PropOfSelectDialog} selectDialog 选择对话框相关设置
         * @property {boolean} isFullRow 可选，是否占据整行，默认值：false，如果 dataType==='textarea'，则默认为true
         * 
         * @property {string} _inputType 内置，input 的 type 值
         */
        /**
         * 字段列表与属性\
         * 并不需要数据中所有的字段都配置上
         */
        fieldList:{
            type: /** @type {import('vue').PropType<FieldProp[]>} */(Array),
            required: true,
        },
        /**
         * 数据
         */
        dataValue:{
            type: Object,
            required: true,
        },
        /**
         * 设置
         * @typedef {Object} Setting 设置
         * @property {boolean} isDefaultEmptyStringOfValue 是否默认空值为空字符串
         * @property {boolean} isReadMode 是否为只读模式
         */
        setting: {
            type: /** @type {import('vue').PropType<Setting>} */(Object),
            required: false,
        }
    },
    emits: [
        'update:dataValue', 
        /**
         * 单字段输入校验失败是触发（调用方法不会触发）
         * 事件对象为 GridValidateResultError
         * @see {GridValidateResultError}
         */
        'sy-invalid'
    ],
    setup(props, context){
        const { fieldList, dataValue, setting } = toRefs(props)
        console.log(fieldList.value)

        //#region 通用

        /**
         * 实际使用的设置
         * 不会修改原设置，因为用了Object.assign
         */
         const realSetting = computed(() => {
            const result = Object.assign({},
                    /* 默认值 */
                    {
                        isDefaultEmptyStringOfValue: true,
                        isReadMode: false,
                    },
                    setting?.value
            )
            return result
        })

        /**
         * 实际使用的字段属性列表
         * 不会修改原设置，因为用了Object.assign
         */
        const realFieldList = computed(() => {
            return fieldList.value.map(item => {
                const result = Object.assign({}, 
                        /* 默认值 */
                        {
                            dataType: 'text', 
                            isShow: true, 
                            isSend: true, 
                            isRequired: false,
                            isFullRow: false,
                        }, 
                        /* 影响默认值的属性 （false/true 会被拼接忽略）*/
                        item.dataType === 'textarea' && { isFullRow: true},
                        /* 设置值 */
                        item)

                /* 属性有多种配置的，进行统一 */
                // 下拉列表配置，优先级 selectList < selectOption
                if(typeof result.selectOption === 'undefined' 
                        && typeof result.selectList !=='undefined'){
                    result.selectOption = {
                        selectList: result.selectList,
                        refreshStrategy: 'watchEffect',
                        enableFilter: false,
                    }
                }

                // 全局设置对列设置的影响
                if(realSetting.value.isReadMode){
                    result.dataType = 'fixed'
                }
                // 隐藏属性
                result._inputType = 'text'
                return result
            })
        })

        /**
         * 可显示的字段属性列表
         */
        const fieldListForShow = computed(() => {
            return realFieldList.value.filter(v => v.isShow)
        })

        const innerDataValue = computed({
            get(){
                return dataValue.value
            },
            set(v){
                context.emit('update:dataValue', v)
            }
        })

        watchEffect(() => {
            // 默认空值转字符串
            if(realSetting.value.isDefaultEmptyStringOfValue){
                realFieldList.value.forEach(f => {
                    innerDataValue.value[f.key] ??= ''
                })
            }
        })

        //#endregion

        //#region 校验

        /**
         * 所有校验规则集合
         */
        const validRuleMap = computed(()=>
            realFieldList.value.reduce((obj, f) => {
                if(!isUndefined(f.validRule)){
                    obj[f.key] = f.validRule
                }
                return obj
            },/** @type {import('async-validator').Rules} */({}))
        )

        /**
         * @typedef {{[columnKey: string]: string}} InvalidRowMsgs 一行校验失败信息
         */
        /**
         * 无效单元格消息
         * 如果校验成功的话在这里是没对应数据的，只有校验失败的才会有
         */
        const invalidMsgs = ref(/** @type {InvalidRowMsgs} */({}))

        /**
         * 执行校验
         * @public
         */
        async function validate(){
            return validateAll()
        }

        /**
         * 输入框输入时校验
         * @param {string} fieldKey 字段key
         */
        async function inputValidate(fieldKey){
            try{
                await validateOne(fieldKey)
            }catch(gridValidateResultError){
                context.emit('sy-invalid', gridValidateResultError)
            }
        }

        /**
         * 校验单个
         * @param {string} fieldKey 字段key
         * @throws {GridValidateResultError} Promise.reject 校验失败时抛出
         */
        async function validateOne(fieldKey){
            if(isUndefined(validRuleMap.value[fieldKey])){
                return
            }
            const validRule = { [fieldKey]: validRuleMap.value[fieldKey] }
            const valueObj = { [fieldKey]: innerDataValue.value[fieldKey] }
            const validator = new AsyncValidator(validRule)
            return validator.validate(valueObj)
                .then(()=>{
                    // 校验成功
                    delete invalidMsgs.value[fieldKey]
                })
                .catch(({errors})=>{
                    // 校验失败
                    const message = errors.map((e)=>e.message).join(',')
                    invalidMsgs.value[fieldKey] = message
                    const label = realFieldList.value.find(f => f.key === key)?.label
                    throw /** @type {GridValidateResultError} */({[fieldKey] : {label, message}})
                })
        }

        /**
         * @typedef {{label: string | undefined, message: string}} GridItemValidateResultError 校验错误结果（单个字段校验的结果）
         */
        /**
         * @typedef {{[key: string]: GridItemValidateResultError}} GridValidateResultError 校验错误结果（总体结果）
         */
        /* 
         * 校验全部
         * @throws {GridValidateResultError} Promise.reject 时抛出
         */
        async function validateAll(){
            const validator = new AsyncValidator(validRuleMap.value);
            return validator.validate(innerDataValue.value)
                .catch(({fields})=>{
                    invalidMsgs.value = Object.entries(fields).reduce((obj,[key,errors])=>{
                        const message = errors.map((e)=>e.message).join(',')
                        const label = realFieldList.value.find(f => f.key === key)?.label
                        obj[key] = {label, message}
                        return obj
                    },/** @type {GridValidateResultError} */({}))
                    throw invalidMsgs.value
                })
        }

        //#endregion

        //#region 获取提交数据

        /**
         * 获取要提交的数据\
         * 以字段属性为准
         * @returns {Record<string, string>}
         * @public
         */
        function getSubmitData(){
            return realFieldList.value.filter(f => f.isSend).map(f => f.key).reduce((obj, key)=>{
                obj[key] = innerDataValue.value[key] ?? ''
                return obj
            },/** @type {Record<string, string>} */({}))
        }
        //#endregion

        //#region 附加数据

        /**
         * @typedef {Object} AttachData 附加数据
         * @property {boolean} isFocus 是否取得焦点
         * @property {Array<string>} selectList 下拉列表值数组
         * @property {boolean} datePickerActive 日期选择器是否激活
         * @property {boolean} activeOfSelectDialog 选择对话框是否激活
         * @property {boolean} isShowAllOptionOfSelectList 下拉选择是否显示所有选项（还可以考虑占位符方案，看后面有无必要：isShowPlaceholderAndAllOptionOfSelectList）
         */

        /**
         * 附加属性
         */
        const attachDatas = ref(/** @type {{[key: string]: AttachData}} */({}))

        /**
         * @typedef {(attachData : AttachData) => void} AttachDataInitHook
         */

        /**
         * 附加属性初始化钩子。内部不直接使用，内部 push 使用 @link addAttachDataInitHook
         * @type {AttachDataInitHook[]}
         */
        const attachDataInitHooks = []
        
        /**
         * 添加附加属性初始化钩子，添加的时候会执行一次
         * @param {AttachDataInitHook} hook
         */
        function addAttachDataInitHook(hook){
            attachDataInitHooks.push(hook)
            realFieldList.value.forEach(f => {
                attachDatas.value[f.key] ??= /** @type {AttachData}*/({})
                hook(attachDatas.value[f.key])
            })
        }

        // 属性有增加时重新运行附加属性初始化钩子
        // TODO: 可能会有相同key但实际不同字段的情况，或有key以删除导致有多余的attachData
        watchEffect(() => {
            realFieldList.value.forEach(f => {
                if(!(f.key in attachDatas.value)){
                    attachDatas.value[f.key] = /** @type {AttachData}*/({})
                    attachDataInitHooks.forEach(v => v(attachDatas.value[f.key]))
                }
            })
        })

        //#endregion

        //#region 下拉值

        //#region >下拉列表开启过滤第一次显示全部
        // 需要 >获取焦点控制显示

        // 初始化附加数据
        addAttachDataInitHook((v)=>v.isShowAllOptionOfSelectList = false)

        // 监听值的变动，只会监听字段列表中有的
        // 非 SelectList 的也会监听，但是无影响，就不过滤了
        watch(() => Object.entries(innerDataValue.value).map(([k,v]) => {
            return [k,v]
        }),(newVal, oldVal) => {
            // console.log({name: 'SyGrid-value-watch', newVal: JSON.stringify(newVal), oldVal: JSON.stringify(oldVal)})
            newVal // [k,v] = 数据的 key, value
                // 过滤去掉不是在字段列表里面配置的 key
                .filter(([k,v]) => realFieldList.value.some(f => f.key === k) )
                // 过滤去掉值没变化的 key
                .filter(([k,v]) => oldVal.find(([ok,ov])=>{
                    return ok === k
                })?.[1] !== v )
                .forEach(([k,v]) => {
                    // console.log({name: 'SyGrid-value-watch-modify', key: k})
                    // 如果有变动的话（key对应的value有变动）
                    attachDatas.value[k].isShowAllOptionOfSelectList = false
                })
        })

        // // debugger
        // watchEffect(() => {
        //     console.log(JSON.stringify(Object.fromEntries(Object.entries(attachDatas.value).map(([k,v]) => [k,v.isShowAllOptionOfSelectList]))))
        // })

        //#endregion >下拉列表开启过滤第一次显示全部

        //#region >获取焦点控制显示
        // 目前其实有输入框的都会触发到，但是没影响，就不做过滤了。

        /**
         * 获得焦点
         * @param {Event} ev 事件对象
         * @param {string} key 字段key
         */
        function focusin(ev, key){
            (attachDatas.value[key] ??= /** @type {AttachData}*/({})).isFocus = true
            // >下拉列表数据加载策略实现
            attachDatas.value[key].isShowAllOptionOfSelectList = true
        }

        /**
         * 失去焦点
         * @param {Event} ev 事件对象
         * @param {string} key 字段key
         */
        function focusout(ev, key) {
            (attachDatas.value[key] ??= /** @type {AttachData}*/({})).isFocus = false
            // >下拉列表数据加载策略实现
            attachDatas.value[key].isShowAllOptionOfSelectList = false
        }
        //#endregion >获取焦点控制显示

        //#region >下拉列表数据加载策略实现

        // 下拉列表数据响应式
        watchEffect(() => {
            realFieldList.value
                .filter(f => f.selectOption && f.selectOption.refreshStrategy === 'watchEffect' )
                .forEach(async f => {
                    // @ts-ignore
                    ;(attachDatas.value[f.key] ??= /** @type {AttachData}*/({})).selectList = await f.selectOption.selectList()
                })
        })

        // 下拉列表数据加载一次
        realFieldList.value
            .filter(f => f.selectOption && f.selectOption.refreshStrategy === 'once' )
            .forEach(async f => {
                // @ts-ignore
                ;(attachDatas.value[f.key] ??= /** @type {AttachData}*/({})).selectList = await f.selectOption.selectList()
            })

        // 下拉列表数据下拉时加载
        // 在这加载异步数据可能会慢
        // 如果需要快速显示下拉，但是数据是异步的话，可以在外部将异步数据加载完存放起来，然后下拉列表函数调用存放的数据
        // 这个看点击下拉和异步加载之间的平衡处理
        // @ts-ignore
        watch(() => realFieldList.value
                .filter(f => f.selectOption && f.selectOption.refreshStrategy === 'drop' )
                .map(f => [f.key, attachDatas.value[f.key]?.isFocus])
                .filter(([k,v]) => v)
                .map(([k,v]) => k),
            (/** @type {string[]} */ newVal, /** @type {string[]} */ oldVal) => {
                console.log({name: 'selectListWatch', newVal: JSON.stringify(newVal), oldVal: JSON.stringify(oldVal)})
                newVal.filter(v => !oldVal.includes(v)).forEach(async k => {
                    const func = /** @type {Function} */(realFieldList.value.find(f => f.key === k)?.selectOption?.selectList)
                    ;(attachDatas.value[k] ??= /** @type {AttachData}*/({})).selectList = await func()
                })
            }
        )
        //#endregion >下拉列表数据加载策略实现

        //#endregion

        //#region 日期

        /**
         * 单击输入框时触发
         * @param {Event} ev 事件对象
         * @param {string} key 字段key
         */
        function clickInput(ev, key){
            (attachDatas.value[key] ??= /** @type {AttachData}*/({})).datePickerActive = true
        }

        // 初始化附加数据
        addAttachDataInitHook((v)=>v.datePickerActive = false)
        //#endregion

        //#region selectDialog 选择对话框
        // 初始化附加数据
        addAttachDataInitHook((v)=>v.activeOfSelectDialog = false)
        //#endregion

        // 给外部调用
        context.expose({
            validate,
            getSubmitData,
        })

        return () => (
            <div class="sy-grid">
                {fieldListForShow.value.map(f => (
                    <div class={{
                            'sy-grid__item' : true,
                            'sy-grid__item--full-row' : f.isFullRow,
                        }}>
                        <div class="sy-grid__field-wrap"
                                class={{'sy-grid__field--required': f.isRequired}}>
                            <div class="sy-grid__field-label">{f.label}</div>
                            <div class="sy-grid__field-value-box">
                                {
                                    context.slots[`field-${f.key}`] ? 
                                        // 使用插槽
                                        context.slots[`field-${f.key}`]({fieldProp: f, value: innerDataValue.value[f.key]}) : 
                                        // 使用默认
                                        (() => {
                                            if(f.dataType === 'fixed'){
                                                return <div class="sy-grid__field-value-text">{innerDataValue.value[f.key]}</div>
                                            }else{
                                                const caret = <div class="sy-grid__field-input--caret"></div>
                                                const selectMenu = 
                                                        <SySelectMenu active={attachDatas.value[f.key]?.isFocus ?? false}
                                                                vModel={innerDataValue.value[f.key]}
                                                                loading={false}
                                                                list={attachDatas.value[f.key]?.selectList ?? []}
                                                                setting={{
                                                                    minWidth: '160px', 
                                                                    enableFilter: attachDatas.value[f.key].isShowAllOptionOfSelectList ? false : f.selectOption?.enableFilter ?? false
                                                                }}
                                                                >
                                                        </SySelectMenu>
                                                const selectDialogDom =
                                                        <SySelectDialog 
                                                                fullscreen
                                                                dataList={f.selectDialog?.dataList ?? []}
                                                                v-model={[attachDatas.value[f.key].activeOfSelectDialog, 'active']}
                                                                onSubmit={f.selectDialog?.onSubmit ?? (()=>{})}
                                                                v-slots={{default: ({item}) => f.selectDialog?.template?.(item) ?? item}}
                                                            >
                                                        </SySelectDialog>
                                                const datePicker = 
                                                        <SyDatePicker v-model={[attachDatas.value[f.key].datePickerActive, 'active']}
                                                            v-model={innerDataValue.value[f.key]}></SyDatePicker>
                                                const ipt = 
                                                        <input
                                                            class={{
                                                                'sy-grid__field-input': true,
                                                                'sy-grid__field-input--invalid': invalidMsgs.value[f.key],
                                                            }}
                                                            type={f._inputType} 
                                                            v-model={innerDataValue.value[f.key]}
                                                            onChange={() => inputValidate(f.key)}
                                                            onFocusin={(e) => focusin(e, f.key)}
                                                            onFocusout={(e) => focusout(e, f.key)} 
                                                            onClick={(e) => clickInput(e, f.key)}/>
                                                /* 复制于ipt，修改了一下 */
                                                const textareaVNode = 
                                                        <textarea 
                                                            class={{
                                                                'sy-grid__field-input': true,
                                                                'sy-grid__field-input--invalid': invalidMsgs.value[f.key],
                                                            }}
                                                            v-model={innerDataValue.value[f.key]}
                                                            onChange={() => inputValidate(f.key)}
                                                            onFocusin={(e) => focusin(e, f.key)}
                                                            onFocusout={(e) => focusout(e, f.key)} 
                                                            onClick={(e) => clickInput(e, f.key)}
                                                        ></textarea>
                                                /* 复制于ipt，修改了一下 */
                                                const pickIpt = 
                                                        <input
                                                            class={{
                                                                'sy-grid__field-input': true,
                                                                'sy-grid__field-input--pick': true,
                                                                'sy-grid__field-input--invalid': invalidMsgs.value[f.key],
                                                            }}
                                                            readonly
                                                            type={f._inputType} 
                                                            v-model={innerDataValue.value[f.key]}
                                                            onChange={() => inputValidate(f.key)}
                                                            onFocusin={(e) => focusin(e, f.key)}
                                                            onFocusout={(e) => focusout(e, f.key)} 
                                                            onClick={(e) => {
                                                                clickInput(e, f.key) 
                                                                f.onClick && f.onClick(e, {key: f.key})
                                                                attachDatas.value[f.key].activeOfSelectDialog = true
                                                            }}/>
                                                return <>
                                                        <div class="sy-grid__field-input-box">
                                                            {(f.dataType === 'pick' || f.dataType === 'selectDialog') ? pickIpt : 
                                                                f.dataType === 'textarea' ? textareaVNode : ipt}
                                                            {f.dataType === 'select' ? caret : ''}
                                                        </div>
                                                        {f.dataType === 'select' ? selectMenu : ''}
                                                        {f.dataType === 'selectDialog' && selectDialogDom}
                                                        {f.dataType === 'date' ? datePicker : ''}
                                                    </>
                                            }
                                        })()
                                }
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }
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
    }

    *{
        --font-color: #666;
        --font-size: 12px;
        --line-height: 16px;
    }
    .sy-grid{
        display: grid;
        grid-template-columns: repeat(auto-fill, 240px);
        grid-auto-rows: minmax(40px, auto);
        row-gap: 10px;
        column-gap: 20px;
        align-items: center;
    }

    /* grid-item */
    .sy-grid__item--full-row{
        grid-column-start: 1;
        grid-column-end: -1;
    }

    .sy-grid__field-wrap{
        display: flex;
        align-items: center;
    }

    /* flex-item */
    .sy-grid__field-label{
        box-sizing: border-box;
        width: 70px;
        text-align: end;
        flex: none;
        margin-right: 10px;
        /* padding-right: 3px; */
        font-size: var(--font-size);
        color: var(--font-color);
    }

    /* 必填样式 */
    .sy-grid__field--required .sy-grid__field-label::before{
        content: '*';
        color: red;
    }

    /* flex-item */
    .sy-grid__field-value-box{
        flex: auto;
        color: var(--font-color);
        font-size: var(--font-size);
        font-family: '微软雅黑';
    }
    /* 字段值文本 */
    .sy-grid__field-value-text{
        padding: 5px 7px;
    }
    .sy-grid__field-input-box{
        position: relative;
    }
    .sy-grid__field-input{
        box-sizing: border-box;
        padding: 5px 7px;
        width: 100%;
        border: 1px solid var(--info-color);
        border-radius: 3px;
        line-height: var(--line-height);
        font-size: var(--font-size);
        outline: none;
        color: var(--font-color);
    }
    .sy-grid__field-input--pick{
        cursor: pointer;
    }
    .sy-grid__field-input--invalid{
        background: var(--danger-light-color);
        color: var(--danger-color);
    }
    .sy-grid__field-input:focus{
        background: var(--primary-light-color);
        color: #000;
    }
    
    /* 下拉符号 */
    .sy-grid__field-input--caret{
        display: block;
        position: absolute;
        box-sizing: border-box;
        --size: 12px;
        width: var(--size);
        height: var(--size);
        top: calc( 50% - var(--size) / 4 );
        right: 10px;
        border: calc(var(--size) / 2) solid var(--info-color);
        border-left-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
    }
    .sy-grid__field-input-box:focus-within .sy-grid__field-input--caret{
        transform-origin: center 25%;
        transform: rotate(180deg);
    }
</style>