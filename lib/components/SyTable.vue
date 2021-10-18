<script lang="jsx">
// @ts-check

/**
 * @version 1.6.0.211018    refactor: 类型移动到 ../utils/define-utils.ts
 *                          feat: define-utils.ts 增加 defineSyTableXxx 方便属性构建时有代码提示
 * @changelog
 *          1.6.0.211018    refactor: 类型移动到 ../utils/define-utils.ts
 *                          feat: define-utils.ts 增加 defineSyTableXxx 方便属性构建时有代码提示
 *          1.5.1.210922    fix: 粘贴新增行失效（this变成undefined，猜测可能是升级vue之后不支持了）
 *          1.5.0.210909    feat:新增插槽`operation`，对操作列进行修改
 *          1.4.1.210908    路径含有`@`的改为相对路径
 *          1.4.0.210816    千分位文本输入框配置项`props.columnPropList[].currencyOption`
 *          1.3.0.210812    千分位文本输入框`props.columnPropList[].dataType='currency'`
 *          1.2.0.210812    百分比文本输入框`props.columnPropList[].dataType='percent'`
 *          1.1.1.210810    列插槽值增加单元格是否只读`isReadonly`
 *          1.1.0.210810    修正/忽略 ts 错误，兼容上个版本。
 *          1.0.9.210729    增加表名`props.tableName`，校验返回对象增加字段
 *          1.0.8.210728    feat: 新行默认值生成器`props.columnPropList[].defaultValue`
 *          1.0.7.210608    达到最大行数时不可新增行
 *          1.0.6.210608    新增控制每一行可否删除`props.setting.deleteRowHandler`
 *          1.0.5.210607    新增控制是否可任意位置增加行（侧边的+号）`props.setting.canAddRowOfAnyWhere`
 *          1.0.4.210607    控制多行只读增加参数获取显示行索引。`props.setting.readonlyRowHandler`回调函数增加参数`rowIndexOfShow`获取显示行索引，并将其遍历修改为遍历显示的数据
 *          1.0.3-alpha.210604    增加是否可删除行`props.setting.canRemoveRow`，完善只读模式
 *          1.0.2-alpha.210604    增加是否可新增行`props.setting.canAddRow`；半成品的只读模式
 *          1.0.1.210601    使用defineComponent
 *          1.0.0.210601
 * @depentOn
 *      vue ^3.2.10
 *      SyInputPercent ^0.1.0
 *      SyInputCurrency ^0.2.1
 * @doc
 *      重复功能配置规范
 *          - 编辑功能默认全开
 *          - 关了大的会导致小的全关，也就只有大的开了小的配置才生效，即权限是按严格的生效
 *              - 权限链在这不适用，因为小的是针对全部的数据做权限
 *              - 大表示粗权限，小表示细权限
 *              - 大小配置都没有时，默认（打开权限）
 *              - 只有大没有小时，大的生效（因为默认小的也是打开权限，当大的打开时小的也都是打开）
 *              - 只有小没有大时，小的生效（因为默认大的是打开权限）
 *              - 大小同时存在时
 *                  - ✖小的覆盖大的？
 *                  - ✖大的覆盖小的？
 *                  - ✔严格权限为准？
 *      规范变量名
 *          - rowData - 单行数据
 *      插件功能
 *          见`props`
 * @todoList
    - 基础编辑
        - [x] 修改
        - [x] 新增行
        - [x] 在某个位置新增单行
        - [ ] 批量新增行
        - [x] 删除当前行
            - [ ] 确认框
        - [x] 批量删除指定行
            - [ ] 确认框
        - [x] 多选
            - [ ] shift 连续多选
    - 单行列控制、类型、显示
        - 控制，以下均需要配合后端实现
            - [x] 不允许新增行`props.setting.canAddRow`
            - [ ] 不允许任意位置新增行，只允许新增到末尾/头部
            - [x] 不允许删除行`props.setting.canRemoveRow`
            - [ ] 不允许删除指定行
            - [x] 不允许修改指定行
            - [ ] 不允许修改指定列
        - 表级别限制
            - [x] 最小行数
            - [x] 最大行数
                - [ ] 最大行数新增限制
        - 数据类型（不含校验，控制显示样式与选择）
            - 获取与发送
                - 可修改，双向传输：一般字段
                - 不修改，双向传输：如id
                - 不获取只发送的：暂时没有，可以用双向传输
                - 只获取不发送的：如创建日期
                - 不获取不发送的：如总价
                - 获取的时候，后端控制前端要获取的数据，前端控制要发送给后端的数据
                - 也就只有，是否发送一个标志位
                - [x] isSend(props.columnPropList[].isSend)
                - [x] 生成发送数据
                    - [x] 数据为主，找到可发送的列组装结果
                    - [x] 列配置为主，找到可发送的数据组装结果
            - 是否包含在列属性
                - 所有无论是数据有没有此列，是不是发送到后端，是不是从后端获取，是不是只是作为变量使用，是不是只是计算值显示用，只要有用到，就要在列属性中包含。

            - 可输入，数据由用户决定（都是显示）（都要发送）
                - [x] text(props.columnPropList[].dataType=text) 字符串（目前没特殊用途）
                - [x] 少许下拉值（props.columnPropList[].selectList）
                - [ ] 日期
                - 是否会影响显示与发送？要强制还是一样配置？
                    - ✔确定显示和发送配置不被此配置更改
            - 不可输入（均可为显示/不显示）（均可发送/不发送）
                - [x] fixed(props.columnPropList[].dataType=fixed) 固定值（只读）
                - 计算值（父组件用watchEffect）（如果是不可输入的计算值可用类型 fixed）
                - 本地计算中间变量（可看成计算值的一种，所以一样用父组件watchEffect）（例如 此字段为 c = a * b，其他字段用了 d = c + 1）
                - [ ] 无变量（不存储列的值，显示由其他列计算得出。或者就是用插槽特殊显示，不会有值的列），
                    目前暂时用 isSend=false

            - 显示也可单独拎出来
                - [x] isShow(props.columnPropList[].isShow)
    - 批量操作
        - [x] excel粘贴
            - [x] 日期格式粘贴（粘贴显示值，故如果日期显示符合也是可以粘贴的）
        - [ ] 导出到剪贴板以便excel粘贴
        - [ ] 导出成excel
        - [ ] 批量编辑重复数据，方便用户对某几列赋值相同数据
    - 多行列控制
        - [x] 控制多行只读，使用回调函数`props.setting.readonlyRowHandler`
    - 总体控制
        - [ ] 只读模式`props.setting.isReadMode`
            - 需要完善其他控制后才可实现
    - 输入校验
        - [x] 单个输入框触发事件（emit.sy-invalid）
        - [x] 手动调用（不触发事件）
        - [ ] 数据初始化时校验
        - [x] 粘贴校验（触发单个单元格校验）
        - [ ] 动态必填显示
    - 数据超出部分显示
        - [x] 省略号
        - [ ] 多行
        - [ ] 多行+省略号
    - [ ] 分页操作
    - 宽度
        - [x] 可设置
        - [ ] 自适应
        - [ ] 宽度鼠标拖动
    - 附加列
        - [x] 序号
        - [ ] 操作
    - [ ] 提示
    - [ ] 隐藏
    - [ ] 多格选择复制
    - [x] 排序
        - props.setting.orderKey 设置排序字段的key，默认不排序
        - [ ] 拖动排序
    - 数据值
        - [ ] 显示值与真实值
        - [x] 默认值：新行默认值生成器`props.columnPropList[].defaultValue`
    - 下拉列表
        - [x] 列统一
        - [x] 列的每个格子特殊，根据行其他数据联动
            - [ ] 选择后的值也可以根据行数据联动
        - [x] 异步
            - [ ] 懒加载，只有点击的时候才去请求
            - [ ] 懒加载，未修改的不去重复请求
        - [x] 加载中loading
    - 外部控制内部
        - [x] 增加插槽 slots[`col-${props.columnPropList[].key}`] 用于外部控制显示
 */

/**
 *  插件使用说明：
    支持的 v-slot：
        插槽属性有 `col-${key}`
            key为列名，可以控制指定列的显示
            会覆盖原有默认输入框，故大部分属性会失效
            值为 {value, rowData, isReadonly}：
                value - 单元格的值
                rowData - 对应的行数据
                isReadonly - 单元格是否只读
        插槽属性有 `operation`
            指定操作列的显示
            值为 {rowIndexOfShow, rowData, isReadonlyOfRow}:
                rowIndexOfShow - 显示的行索引
                rowData - 对应的行数据
                isReadonlyOfRow - 行是否只读
 */
// FIXME: 设置最大高度时excel粘贴超过高度会报错
import { computed, ref, reactive, watchEffect, watch, defineComponent } from 'vue'
import { getExcelData, isExcel } from '../utils/sy-util/clipboard'
import { findIndex, isUndefined } from '../utils/sy-util/basetype'
import AsyncValidator from 'async-validator'
import SySelectMenu from './SySelectMenu.vue'
import SyInputPercent from './SyInputPercent.vue'
import SyInputCurrency from './SyInputCurrency.vue'
export default defineComponent({
    name: 'SyTable',
    props: {
        /**
         * @typedef {import('../utils/define-utils').SyTableFieldProp} ColumnProp
         */
        /**
         * @typedef {import('../utils/define-utils').SyTableInnerRow} InnerTableRow 内置表格行对象
         */
        /**
         * @typedef {import('../utils/define-utils').SyTableRow} TableRow 数据行对象
         */
        /**
         * 默认值见 realColumnPropList
         */
        columnPropList: {
            type: /** @type {import('vue').PropType<ColumnProp[]>} */ (Array), // 引用类型传入，会影响父组件传入的属性
            required: true
        },
        /**
         * 表格数据
         */
        tableDataList: {
            type: /** @type {import('vue').PropType<TableRow[]>} */ (Array), // 引用类型传入，会影响父组件传入的属性
            required: true
        },
        /**
         * 初始默认值见 innerSetting
         */
        setting: {
            type: /** @type {import('vue').PropType<import('../utils/define-utils').SyTableSetting>} */(Object), // 引用类型传入，会影响父组件传入的属性
            required: false,
            default: () => ({})
        },
        /**
         * 表格名
         * 用于校验信息返回使用，以定位到具体表
         */
        tableName: {
            type: String,
            required: false,
            default: '表'
        }
    },
    emits: [
        'update:tableDataList',
        /**
         * 校验失败触发事件（主动调用校验时不触发）
         * 事件类型为 TableItemValidateResultError[]
         */
        'sy-invalid'
    ],
    setup(props, context){

        //#region 通用

        /**
         * @typedef {Object} VisibleTablePosition 表格中的位置（可见）
         * @property {number} rowIndexOfShow 所在可见的行索引
         * @property {string} columnKey 列的key
         */

        /**
         * @typedef {Object} TablePosition 表格中的位置
         * @property {number} _syRowId 行的内部id
         * @property {string} columnKey 列的key
         */

        // const { tableDataList } = toRefs(props)

        /**
         * 表格名
         */
        const tableName = props.tableName

        /**
         * 表格数据\
         * 引用类型传入，会影响父组件传入的属性 
         */
        const _tableDataList = computed({
            get:()=>props.tableDataList,
            set:(v)=>{
                console.warn('不建议重新对props.tableDataList赋值')
                context.emit("update:tableDataList", v)
            },
        })

        /**
         * 实际使用的配置项\
         * 此属性不会双向绑定回去，因为 Object.assign({},...)
         */
         const innerSetting = computed(()=>{
            const result = Object.assign({},/** @type {import('../utils/define-utils').SyTableSetting} */({
                opWidth: '100px', 
                orderWidth: '40px', 
                minRowCount: 0,
                maxRowCount: -1,
                readonlyRowHandler(){
                    return false
                },
                deleteRowHandler(){
                    return true
                },
                canAddRow: true,
                canRemoveRow: true,
                canAddRowOfAnyWhere: true,
                isReadMode: false,
            }), props.setting)
            // 某些全局配置对其他全局配置的影响
            if(result.isReadMode){
                result.canAddRow = false
                result.canRemoveRow = false
                // 后面处理了这个
                // result.canAddRowOfAnyWhere = false
            }
            if(!result.canAddRow){
                // 如果不能加行那么也不能任意位置加行
                result.canAddRowOfAnyWhere = false
            }
            return result
        })

        /**
         * 实际使用的列配置\
         * 此属性不会双向绑定回去，因为 Object.assign({},...)
         */
        const realColumnPropList = computed(()=>{
            return props.columnPropList.map(item => {
                const result = Object.assign({}, 
                        // 默认值
                        /** @type {ColumnProp}*/
                        ({
                            width: '150px', 
                            dataType: 'text', 
                            currencyOption: {},
                            isShow: true, 
                            isSend: true,
                            defaultValue: undefined
                        }), item)
                // 全局设置对列设置的影响
                if(innerSetting.value.isReadMode){
                    result.dataType = 'fixed'
                }
                // 附加属性
                // 只读不可修改
                result._readonly = ['fixed'].includes(result.dataType)
                return result
            })
        })

        /**
         * tableData显示的hooks
         * @type {((tableDataClone: TableRow[])=>TableRow[])[]}
         */
        const tableDataShowHooks = []

        /**
         * 显示的数据\
         * 为浅克隆副本
         */
        const tableDataShow = computed(()=>{
            return tableDataShowHooks.reduce((result, func) => func(result), _tableDataList.value.slice())
        })

        /**
         * 显示的列，每个元素为列的属性
         */
        const columnShowList = computed(()=>{
            return realColumnPropList.value.filter(item => item.isShow)
        })
        /* ************************通用方法**************************** */
        
        /**
         * 查找显示的列索引
         * @param {VisibleTablePosition} position
         */
        function findShowColumnIndex(position){
            return findIndex(columnShowList.value, 'key', position.columnKey)
        }

        /**
         * 根据内部id(_syRowId)查找显示的行索引
         * @param {number} _syRowId
         */
        function findShowRowIndex(_syRowId){
            return findIndex(tableDataShow.value, '_syRowId', _syRowId)
        }

        // /**
        //  * 查找所有的列索引
        //  * @param {string} columnKey
        //  */
        // function findDataColumnIndex(columnKey){
        //     return findIndex(realColumnPropList.value, 'key', columnKey)
        // }

        /**
         * 根据内部id(_syRowId)查找元数据的行索引
         * @param {number} _syRowId
         */
        function findDataRowIndex(_syRowId){
            return findIndex(_tableDataList.value, '_syRowId', _syRowId)
        }

        //#endregion

        //#region 单行附加数据

        /**
         * 自增id
         */
        let nextRowId = 1;

        /**
         * @typedef {Object} AttachDataOfRow 行附加数据
         * @property {boolean} isCheck 选择框是否勾选
         * @property {boolean} isReadonly 行是否只读，默认false
         * @property {boolean} canDelete 行是否可删，默认true
         */

        /**
         * 附加数据\
         * key 为 _syRowId, value 为 对象，单行附加数据，单行附加数据的key和value均为自定义
         */
        const attachDatasOfRow = ref(/** @type {{[_syRowId: string]: AttachDataOfRow}} */({}))

        /**
         * 行附加数据初始化钩子\
         * 用于新增行或整体初始化时初始化附加对象\
         * 回调函数传递单行附加数据对象
         * @type {Array<(attachDataOfRow: AttachDataOfRow)=>void>}
         */
        const attachDataOfRowInitHooks = []

        /**
         * 附加数据增加\
         * 此方法不手动调用
         * @param {Number} _syRowId
         */
        function addAttachData(_syRowId){
            attachDatasOfRow.value[_syRowId] = /** @type {AttachDataOfRow} */({})
            attachDataOfRowInitHooks.forEach(handler => handler(attachDatasOfRow.value[_syRowId]))
        }

        /**
         * 附加数据删除\
         * 此方法不手动调用
         * @param {Number} _syRowId
         */
        function removeAttachData(_syRowId){
            delete attachDatasOfRow.value[_syRowId]
        }

        // TODO：把表格数据重新赋值也处理成hooks
        // TODO：修改附加数据的名称为 attachDataOfRow
        // 对表格重新赋值时触发
        // 初始化附加数据，对列表重新赋值时也重新初始化
        watch(_tableDataList, () => {
            console.log('watch触发')
            attachDatasOfRow.value = {}
            // TODO：fix第一次运行没有hook
            console.log(`attachDataOfRowInitHooks数量=${attachDataOfRowInitHooks.length}`)
            _tableDataList.value.forEach(item => {
                const _syRowId = nextRowId++
                // 增加唯一id
                item._syRowId = _syRowId
                // 附加值处理
                addAttachData(_syRowId)
            })
        },{
            immediate: true
        })
        //#endregion

        //#region 单元格附加数据

        /**
         * @typedef {Object} AttachDataOfCell 单元格附加数据（单个单元格）
         * @property {boolean} isFocus 单元格是否获得焦点
         * @property {string[]} selectList 单元格下拉列表值
         * @property {boolean} isSelectLoading 下拉列表是否loading
         */
        /**
         * 单元格附加对象
         * key 为 `${_syRowId}-${columnKey}`，value 为附加数据对象
         */
        const attachDatasOfCell = ref(/** @type {{[key: string]: AttachDataOfCell}}*/({}))

        //#endregion

        //#region 数据CRUD操作

        /**
         * 新增行按钮事件处理器\
         * 新增到最后一行
         */
        function addRowToLast(){
            addRow(props.tableDataList.length)
        }

        /**
         * 新行生成Hooks
         * @type {((newRow : TableRow, rowIndexOfShow : number) => TableRow)[]}
         */
        const newRowGeneraterHooks = []

        /**
         * 增加行
         * @param {number} rowIndexOfShow 插入的位置（坐标为显示的数据）,0为第一行之前
         */
        function addRow(rowIndexOfShow){
            // 校验
            if(innerSetting.value.maxRowCount !== -1 && _tableDataList.value.length >= innerSetting.value.maxRowCount){
                // TODO: 通过事件给予提示无法新增行
                return
            }
            
            // 真正的操作

            const _syRowId = nextRowId++;
            
            // 新行数据生成
            const newLine = newRowGeneraterHooks.reduce((result, func) => func(result, rowIndexOfShow), 
                    /** @type {TableRow}*/({_syRowId}))

            _tableDataList.value.splice(rowIndexOfShow, 0, newLine)
            // 附加数据增加
            addAttachData(_syRowId);
        }

        /**
         * 删除行
         * @param {number} indexOfShow 删除的位置,0为第一行
         */
        function removeRow(indexOfShow){
            const rowIndex = /** @type {number} */(findDataRowIndex(tableDataShow.value[indexOfShow]._syRowId))
            const [{_syRowId}] = _tableDataList.value.splice(rowIndex, 1)
            // 附加数据删除
            removeAttachData(_syRowId);
        }

        /**
         * 根据id删除行
         * @param {number[]} _syRowIdList 删除的id列表
         */
        function removeRowByIdList(_syRowIdList){
            _syRowIdList.forEach(_syRowId => {
                const indexOfShow = tableDataShow.value.findIndex(item => item._syRowId == _syRowId)
                if(indexOfShow != -1){
                    removeRow(indexOfShow)
                }
            })
        }

        //#endregion

        //#region 只读行

        // 初始化钩子
        attachDataOfRowInitHooks.push((attachDataOfRow) => {
            attachDataOfRow.isReadonly = false
        })

        // 重新计算只读行
        watchEffect(()=>{
            tableDataShow.value.forEach((rowData, rowIndexOfShow)=>{
                const isReadonlyOfRow = innerSetting.value.readonlyRowHandler({rowData, rowIndexOfShow})
                attachDatasOfRow.value[rowData._syRowId].isReadonly = isReadonlyOfRow
            })
        })
        
        // 初始化钩子
        attachDataOfRowInitHooks.push((attachDataOfRow) => {
            attachDataOfRow.canDelete = true
        })

        // 重新计算可删除行
        watchEffect(()=>{
            tableDataShow.value.forEach((rowData, rowIndexOfShow)=>{
                const isRowCanDelete = innerSetting.value.deleteRowHandler({rowData, rowIndexOfShow})
                attachDatasOfRow.value[rowData._syRowId].canDelete = isRowCanDelete
            })
        })
        
        //#endregion

        //#region 选择

        // 附加对象 key 增加 isCheck
        attachDataOfRowInitHooks.push(item => item.isCheck = false)

        const isCheckAll = ref(false)
        const isCheckIndeterminate = ref(false)
        
        /**
         * 点击选择全部按钮
         */
        function checkAll(){
            // 因为 isCheckIndeterminate 只有单向绑定，故利用点击来触发值的修改
            isCheckIndeterminate.value = false
        }
        
        // 响应式：全选/全不选
        watchEffect(()=>{
            // console.log({value:isCheckIndeterminate.value})
            if(!isCheckIndeterminate.value){
                Object.values(attachDatasOfRow.value).forEach(item => item.isCheck = isCheckAll.value);
            }
        })

        // 响应式：单选反向影响全选/全不选
        watchEffect(()=>{
            // 有一个勾选
            const someCheck = Object.values(attachDatasOfRow.value).some(item => item.isCheck)
            // 有一个没勾选
            const someNotCheck = Object.values(attachDatasOfRow.value).some(item => !item.isCheck)
            // console.log({someCheck,someNotCheck})
            if(!someCheck){
                isCheckAll.value = false
                isCheckIndeterminate.value = false
            }else if(!someNotCheck){
                isCheckAll.value = true
                isCheckIndeterminate.value = false
            }else{
                isCheckIndeterminate.value = true
            }
        })

        /**
         * 反选
         */
        function invertSelect(){
            Object.values(attachDatasOfRow.value).forEach(v => v.isCheck = !v.isCheck)
        }
        
        /**
         * 选择的 _syRowId 列表
         */
        const checkList = computed(() => Object.entries(attachDatasOfRow.value).filter(([,v])=> v.isCheck).map(([k,])=>+k) )

        /**
         * 删除选择的行
         */
        function removeRowByCheck(){
            const _syRowIdList = checkList.value.filter(_syRowId => attachDatasOfRow.value[_syRowId].canDelete)
            // TODO: 删除不了的提示，建议通过事件触发出去给外部处理
            removeRowByIdList(_syRowIdList)
        }

        //#endregion

        //#region excel粘贴

        // FIXME: 目前只读单元格也可以触发excel粘贴，虽然只读的不会赋值。（这个考虑要不要修改）

        /**
         * 输入框粘贴
         * @param {ClipboardEvent} ev 事件对象
         * @param {VisibleTablePosition} position
         */
        function inputPaste(ev, position){
            
            let transfer = /** @type {DataTransfer} */(ev.clipboardData)
            if(isExcel(transfer)){
                // 阻止默认粘贴
                ev.preventDefault()
                const aoa = getExcelData(transfer)
                // 获取粘贴位置的行/列索引
                const pasteColumnIndex = /** @type {number} */(findShowColumnIndex(position))
                const pasteRowindex = position.rowIndexOfShow

                for(let r = 0; r < aoa.length; r++){
                    const aoaRow = aoa[r]
                    const currentRowIndex = pasteRowindex + r
                    // 超过了数据的行
                    if(currentRowIndex >= tableDataShow.value.length){
                        // // 不允许新增行
                        // if(!innerSetting.value.canAddRow){
                        //     break
                        // }
                        // @ts-ignore
                        addRow(currentRowIndex)
                    }
                    for(let c = 0; c < aoaRow.length; c++){
                        let currentColumnIndex = pasteColumnIndex + c
                        // 超过了数据的列
                        if(currentColumnIndex >= columnShowList.value.length){
                            break
                        }
                        let columnProp = columnShowList.value[currentColumnIndex]
                        // 当前行数据
                        const currentRowData = _tableDataList.value[currentRowIndex]
                        // 不可更新的
                        if(columnProp._readonly || attachDatasOfRow.value[currentRowData._syRowId].isReadonly){
                            continue
                        }
                        let currentColumnKey = columnProp.key
                        let cellValue = aoaRow[c]
                        // @ts-ignore
                        currentRowData[currentColumnKey] = cellValue
                        // 触发校验
                        validateOneCellAndEmit({rowIndexOfShow: currentRowIndex, columnKey: currentColumnKey})
                    }
                }
            }
        }

        //#endregion

        //#region 校验

        /**
         * @typedef {{[_syRowId: string]: {[columnKey: string]: string}}} InvaildMsgs
         * 无效单元格
         * {[_syRowId]:{[columnKey]:errMsg, ...}, ...}
         * 如果校验成功的话在这里是没对应数据的，只有校验失败的才会有
         */
        const invalidMsgs = ref(/** @type {InvaildMsgs} */({}))

        /**
         * 校验规则Map
         */
        const validRuleMap = reactive(realColumnPropList.value.reduce((obj,item)=>{
            if(item.validRule){
                obj[item.key] = item.validRule
            }
            return obj
        },/** @type {{[field: string]: function}} */({})))

        /**
         * @typedef {Object} TableItemValidateResultError 校验错误结果（单个单元格或单行或表级别校验的结果）
         * @property {string} tableName 表格名
         * @property {?VisibleTablePosition} position 校验错误的位置，null 表示表级别的错误（如行数超过最大值）
         * @property {string | undefined} label 字段名
         * @property {string} message 错误消息
         */

        /**
         * 校验单个值
         * @param {VisibleTablePosition} position
         * @returns 校验失败时 Promise.reject 返回 TableItemValidateResultError[]
         */
        async function validateOneCell(position){
            const columnKey = position.columnKey
            if(isUndefined(validRuleMap[columnKey])){
                return
            }
            const rowData = tableDataShow.value[position.rowIndexOfShow]
            const _syRowId = rowData._syRowId

            const validRule = { [columnKey] : validRuleMap[columnKey] }
            
            // @ts-ignore
            const validator = new AsyncValidator(validRule)
            // @ts-ignore
            const valueObj = { [columnKey] : rowData[columnKey] }

            return validator.validate(valueObj)
                .then(()=>{
                    // 校验成功
                    if(isUndefined(invalidMsgs.value[_syRowId])){
                        invalidMsgs.value[_syRowId] = {}
                    }
                    delete invalidMsgs.value[_syRowId][columnKey]
                })
                .catch(({errors}) => {
                    // 校验失败
                    if(isUndefined(invalidMsgs.value[_syRowId])){
                        invalidMsgs.value[_syRowId] = {}
                    }
                    const message = errors.map(
                            (/** @type {import('async-validator').ValidateError}*/ e)=>e.message
                        ).join(',')
                    invalidMsgs.value[_syRowId][columnKey] = message
                    const label = realColumnPropList.value.find(v => v.key === columnKey)?.label
                    throw /** @type {TableItemValidateResultError[]}*/ ([{tableName, position, label, message}])
                })
        }

        /**
         * 校验全部
         * @returns 校验失败时 Promise.reject 返回 TableItemValidateResultError[]
         * @throws {TableItemValidateResultError[]}
         */
        async function validateAll(){
            // @ts-ignore
            const validator = new AsyncValidator(validRuleMap)
            invalidMsgs.value = {}

            const promiseArr = [];
            promiseArr.push(Promise.all(
                tableDataShow.value.map(async row => {
                    const _syRowId = row._syRowId
                    return validator.validate(row)
                        .then(()=>{
                            // 校验成功
                            // NO-OP
                        })
                        .catch(({fields})=>{
                            if(isUndefined(invalidMsgs.value[_syRowId])){
                                invalidMsgs.value[_syRowId] = {}
                            }
                            Object.entries(fields).forEach(([columnKey,errors])=>{
                                const message = errors.map((/** @type {any} */ e)=>e.message).join(',')
                                invalidMsgs.value[_syRowId][columnKey] = message
                            })
                        })
                })
            ).then(()=>getInvalidMsgsArray())
                .then((ev)=>{
                    if(ev.length !== 0){
                        throw ev
                    }
                })
            )

            promiseArr.push(
                // 校验行数
                new Promise((resolve, reject)=>{
                    if(_tableDataList.value.length < innerSetting.value.minRowCount){
                        reject(/** @type {TableItemValidateResultError[]} */([{tableName, position: null, message: `行数 ${_tableDataList.value.length} 少于最小行数 ${innerSetting.value.minRowCount}`}]))
                        return
                    }
                    if(innerSetting.value.maxRowCount !== -1 && _tableDataList.value.length > innerSetting.value.maxRowCount){
                        reject(/** @type {TableItemValidateResultError[]} */([{tableName, position: null, message: `行数 ${_tableDataList.value.length} 大于最大行数 ${innerSetting.value.maxRowCount}`}]))
                        return
                    }
                    resolve(undefined)
                })
            )

            return Promise.all(promiseArr)
        }

        /**
         * 输入框输入时校验
         * @param {VisibleTablePosition} position
         */
        async function validateOneCellAndEmit(position){
            try{
                await validateOneCell(position)
            }catch(validateResultErrors){
                context.emit('sy-invalid', validateResultErrors)
            }
        }
        
        /**
         * 获取无效信息数据
         */
        function getInvalidMsgsArray(){
            // 如果有数据则抛出校验失败事件
            // if(Object.values(invalidMsgs.value).map(v => Object.values(v)).flat().length !== 0){
            /** @type {TableItemValidateResultError[]} */
            const ev = []
            for(let _syRowId in invalidMsgs.value){
                const rowIndexOfShow = /** @type {number} */(findShowRowIndex(+_syRowId))
                const rowInvalid = invalidMsgs.value[_syRowId]
                for(let columnKey in rowInvalid){
                    const message = rowInvalid[columnKey]
                    const label = realColumnPropList.value.find(v => v.key === columnKey)?.label
                    ev.push({tableName, position: {rowIndexOfShow, columnKey}, label, message})
                }
            }
            return ev
        }

        // watchEffect(() => {
        //     const validator = new AsyncValidator(validRuleMap)
        //     _tableDataList.value.forEach(row => validator.validate(row).catch(({errors, fields})=>console.log({errors, fields})))
        // })

        /**
         * 给外部调用的
         * @public
         */
        async function validate(){
            return validateAll()
        }

        //#endregion

        //#region 获取提交数据

        /**
         * 获取要提交的数据\
         * 不触发校验
         * @param {{primary: 'column' | 'data', 
         *      filter: (row: InnerTableRow, index: number, array: InnerTableRow[])=>boolean}} option
         * 参数
         * - primary：主要数据获取，默认为column
         *   - column - 获取到数据的key以列为准
         *   - data - 获取到数据的key以现有数据为准
         * - filter: 数据过滤回调函数，先对行数据进行过滤，过滤出要提交的数据
         *   - row - 参数，每一行的数据
         *   - return - boolean，是否让此行数据返回出去
         *   增加此参数的原因是提交的数据并不一定是所有列，需要根据不提交的列过滤掉要提交的行，就无法在外部过滤，需要在这过滤。
         * @returns {object[]}
         * @public
         */
        function getSubmitData({primary = 'column', filter = ()=>true} = 
            {primary: 'column', filter: ()=>true}){
            const filterTableDataList = _tableDataList.value.filter(filter)
            if(primary === 'data'){
                let submitKeys = realColumnPropList.value.filter(item => item.isSend).map(item => item.key)
                return filterTableDataList.map(row => {
                    return Object.fromEntries(Object.entries(row)
                        .filter(([k,])=>submitKeys.includes(k)))
                })
            }else{
                let submitKeys = realColumnPropList.value.filter(f => f.isSend).map(f => f.key)
                return filterTableDataList.map(row => submitKeys.reduce((obj, key)=> {
                    // @ts-ignore
                    obj[key] = row[key] ?? ''
                    return obj
                },/** @type {any}*/({})))
            }
        }
        //#endregion

        //#region 排序
        
        /**
         * 第一个排序号
         */
        const FIRST_ORDER_NUMBER = 1

        tableDataShowHooks.push((datas)=>{
            const orderKey = innerSetting.value.orderKey
            if(!isUndefined(orderKey)){
                // datas是已经被slice()浅克隆的数组，不会改变原数组顺序
                // @ts-ignore
                const sortTableDataList = datas.sort((a,b) => a[orderKey] - b[orderKey])
                // 排序号重写
                // @ts-ignore
                sortTableDataList.forEach((v,i)=>v[orderKey] = FIRST_ORDER_NUMBER + i)
                // console.log(JSON.stringify(sortTableDataList))
                return sortTableDataList
            }
            return datas
        })

        newRowGeneraterHooks.push((rowData, rowIndexOfShow) => {
            const orderKey = innerSetting.value.orderKey
            if(!isUndefined(orderKey)){
                let newRowOrderNumber;
                // 如果没有数据
                if(tableDataShow.value.length === 0){
                    newRowOrderNumber = FIRST_ORDER_NUMBER
                }else{
                    // 获取插入后的前一个排序号，如果是最前那么为 第一个-1
                    // @ts-ignore
                    const prevOrderNumber = rowIndexOfShow <= 0 ? tableDataShow.value[0][orderKey] - 1 : tableDataShow.value[rowIndexOfShow - 1][orderKey]
                    // 获取插入后的后一个排序号，如果是最后那么为 最后一个+1
                    // @ts-ignore
                    const nextOrderNumber = rowIndexOfShow >= tableDataShow.value.length ? tableDataShow.value[tableDataShow.value.length - 1][orderKey] + 1 : tableDataShow.value[rowIndexOfShow][orderKey]
                    // 折中
                    newRowOrderNumber = (prevOrderNumber + nextOrderNumber) / 2
                }
                // @ts-ignore
                rowData[orderKey] = newRowOrderNumber
            }
            return rowData
        })
        //#endregion

        //#region 下拉列表

        // FIXME: 只读的时候能下拉修改值，正常应该不行

        /**
         * 单元格获取焦点
         * @param {FocusEvent} ev
         * @param {VisibleTablePosition} positionOfShow
         */
        function cellFocusin(ev, positionOfShow){
            const _syRowId = tableDataShow.value[positionOfShow.rowIndexOfShow]._syRowId
            // console.log({t: 'cellFocusin', ev, positionOfShow})
            const pos = `${_syRowId}-${positionOfShow.columnKey}`
            attachDatasOfCell.value[pos] ??= /** @type {AttachDataOfCell} */({})
            attachDatasOfCell.value[pos].isFocus = true
        }
        
        /**
         * 单元格失去焦点
         * @param {FocusEvent} ev
         * @param {VisibleTablePosition} positionOfShow
         */
        function cellFocusout(ev, positionOfShow){
            const _syRowId = tableDataShow.value[positionOfShow.rowIndexOfShow]._syRowId
            // console.log({t: 'cellFocusout',ev, positionOfShow})
            const pos = `${_syRowId}-${positionOfShow.columnKey}`;
            (attachDatasOfCell.value[pos] ??= /** @type {AttachDataOfCell} */({})).isFocus = false
        }
        
        /**
         * 下拉列表获取
         */
        watchEffect(() => {
            realColumnPropList.value.filter(prop => prop.selectList)
                .forEach(async (prop) => {
                    _tableDataList.value.forEach(async (row) => {
                        const pos = `${row._syRowId}-${prop.key}`;
                        let selectList
                        if(typeof prop.selectList === 'function'){
                            (attachDatasOfCell.value[pos] ??= /** @type {AttachDataOfCell} */({})).isSelectLoading = true;
                            // 清空下拉列表
                            (attachDatasOfCell.value[pos] ??= /** @type {AttachDataOfCell} */({})).selectList = []
                            try{
                                selectList = await prop.selectList(row)
                            }finally{
                                attachDatasOfCell.value[pos].isSelectLoading = false
                            }
                        }else{
                            selectList = prop.selectList
                        }
                        (attachDatasOfCell.value[pos] ??= /** @type {AttachDataOfCell} */({})).selectList = selectList
                    })
                })
        })

        //#endregion

        //#region 默认值
        newRowGeneraterHooks.push((newRow, rowIndexOfShow) => {
            realColumnPropList.value
                .filter(prop => prop.defaultValue)
                .forEach(prop => {
                    // @ts-ignore
                    newRow[prop.key] = prop.defaultValue()
                })
            return newRow
        })
        //#endregion

        // 导出给外部使用
        context.expose({
            validate,
            getSubmitData,
        })

        return () => (
            <div class="sy-table">
                <div class="sy-table__operation-tools">
                    {innerSetting.value.canAddRow ?
                        <button type="button" class="sy-table--btn" onClick={addRowToLast}>新增行</button> : ''}
                    {innerSetting.value.canRemoveRow ?
                        <button type="button" class="sy-table--btn" onClick={removeRowByCheck}>删除选择行</button> : ''}
                    <button type="button" class="sy-table--btn" onClick={invertSelect}>反选</button>
                </div>
                <table class="sy-table__table">
                    <thead>
                        <tr class="sy-table__header-row">
                            {/* 选择列 */}
                            <th class="sy-table__header-cell">
                                <div class="sy-table__hcell-box sy-table__add-row-wrap">
                                    <input class="sy-table__row-checkbox" type="checkbox" 
                                        // @ts-ignore
                                        indeterminate={isCheckIndeterminate.value}
                                        vModel={isCheckAll.value} onChange={checkAll}/>
                                    {/* 增加行，依赖父级class=sy-table__add-row-wrap */}
                                    {innerSetting.value.canAddRowOfAnyWhere ? 
                                        <div class="sy-table__add-row" onClick={()=>addRow(0)}></div> : ''}
                                </div>
                            </th>
                            {/* 序号列 */}
                            <th class="sy-table__header-cell">
                                <div class="sy-table__hcell-box"
                                    style={{width:innerSetting.value.orderWidth}}>
                                    序号
                                </div>
                            </th>
                            {columnShowList.value.map(columnProp => (
                                <th class="sy-table__header-cell"
                                    key={columnProp.key}>
                                    <div class="sy-table__hcell-box"
                                        style={{width:columnProp.width}}>
                                        { columnProp.label }
                                    </div>
                                </th>
                            ))}
                            {/* 操作列 */}
                            <th class="sy-table__header-cell">
                                <div class="sy-table__hcell-box"
                                    style={{width:innerSetting.value.opWidth}}>
                                    操作
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableDataShow.value.map((rowData, rowIndexOfShow) => (
                            <tr class="sy-table__body-row"
                                key={rowIndexOfShow}>
                                {/* 选择列 */}
                                <th class="sy-table__body-cell">
                                    <div class="sy-table__cell-box sy-table__add-row-wrap">
                                        <input class="sy-table__row-checkbox" type="checkbox" 
                                            v-model={attachDatasOfRow.value[rowData._syRowId].isCheck} />
                                        {/* 增加行，依赖父级class=sy-table__add-row-wrap */}
                                        {innerSetting.value.canAddRowOfAnyWhere ? 
                                            <div class="sy-table__add-row" onClick={()=>addRow(rowIndexOfShow+1)}></div> : ''}
                                    </div>
                                </th>
                                {/* 序号列 */}
                                <td class="sy-table__body-cell"
                                    style={{width:innerSetting.value.orderWidth}}>
                                    <div class="sy-table__cell-box sy-table__cell-box--align-center sy-table__cell-box--valign-center">
                                        {rowIndexOfShow + 1}
                                    </div>
                                </td>
                                {columnShowList.value.map(columnProp=>(
                                    /* 单元格 */
                                    <td class="sy-table__body-cell" 
                                        key={columnProp.key}>
                                        {/*< class="sy-table__cell-value">{ rowData[columnProp.key] }*/}
                                        <div class="sy-table__cell-box"
                                            // @ts-ignore
                                            class={{'sy-table__cell-box--invalid': invalidMsgs.value[rowData._syRowId]?.[columnProp.key]}}
                                            style={{width:columnProp.width}}
                                            onFocusin={(e) => cellFocusin(e, {rowIndexOfShow, columnKey: columnProp.key})}
                                            onFocusout={(e) => cellFocusout(e, {rowIndexOfShow, columnKey: columnProp.key})}>
                                            { context.slots[`col-${columnProp.key}`] ? 
                                                // 插槽
                                                // @ts-ignore
                                                context.slots[`col-${columnProp.key}`]({
                                                    // @ts-ignore
                                                    value: rowData[columnProp.key],
                                                    rowData, 
                                                    isReadonly: columnProp._readonly || attachDatasOfRow.value[rowData._syRowId].isReadonly
                                                }) :
                                                (
                                                <>
                                                    {
                                                        // 属性都是一样的，就标签不一样（现在多了几个专有属性）
                                                        columnProp.dataType === 'percent' 
                                                        ? 
                                                        <SyInputPercent
                                                            class="sy-table__cell-input" 
                                                            // @ts-ignore
                                                            class={{"sy-table__cell-input--readonly": columnProp._readonly || attachDatasOfRow.value[rowData._syRowId].isReadonly}}
                                                            // @ts-ignore
                                                            v-model={ rowData[columnProp.key] } 
                                                            readonly={columnProp._readonly || attachDatasOfRow.value[rowData._syRowId].isReadonly}
                                                            onPaste={(e) => inputPaste(e, {rowIndexOfShow, columnKey: columnProp.key})} 
                                                            onChange={() => validateOneCellAndEmit({rowIndexOfShow, columnKey: columnProp.key})}
                                                        >
                                                        </SyInputPercent>
                                                        :
                                                        (
                                                        columnProp.dataType === 'currency' 
                                                        ?
                                                        <SyInputCurrency
                                                            class="sy-table__cell-input" 
                                                            // @ts-ignore
                                                            class={{"sy-table__cell-input--readonly": columnProp._readonly || attachDatasOfRow.value[rowData._syRowId].isReadonly}}
                                                            // @ts-ignore
                                                            v-model={ rowData[columnProp.key] } 
                                                            readonly={columnProp._readonly || attachDatasOfRow.value[rowData._syRowId].isReadonly}
                                                            onPaste={(e) => inputPaste(e, {rowIndexOfShow, columnKey: columnProp.key})} 
                                                            onChange={() => validateOneCellAndEmit({rowIndexOfShow, columnKey: columnProp.key})}
                                                            // 专有的
                                                            digit={columnProp.currencyOption.digit}
                                                        ></SyInputCurrency>
                                                        :
                                                        <input class="sy-table__cell-input" 
                                                            // @ts-ignore
                                                            class={{"sy-table__cell-input--readonly": columnProp._readonly || attachDatasOfRow.value[rowData._syRowId].isReadonly}}
                                                            // @ts-ignore
                                                            v-model={ rowData[columnProp.key] } 
                                                            readonly={columnProp._readonly || attachDatasOfRow.value[rowData._syRowId].isReadonly}
                                                            onPaste={(e) => inputPaste(e, {rowIndexOfShow, columnKey: columnProp.key})} 
                                                            onChange={() => validateOneCellAndEmit({rowIndexOfShow, columnKey: columnProp.key})} />
                                                        )
                                                    }
                                                    {/* 如果有列表，并且有焦点，则显示组件 */
                                                    (columnProp.selectList && (attachDatasOfCell.value[`${rowData._syRowId}-${columnProp.key}`]?.isFocus ?? false)) ?
                                                        <SySelectMenu 
                                                            list={attachDatasOfCell.value[`${rowData._syRowId}-${columnProp.key}`]?.selectList ?? []}
                                                            loading={attachDatasOfCell.value[`${rowData._syRowId}-${columnProp.key}`]?.isSelectLoading ?? false}
                                                            // @ts-ignore
                                                            vModel={rowData[columnProp.key]} 
                                                            active={attachDatasOfCell.value[`${rowData._syRowId}-${columnProp.key}`]?.isFocus ?? false}>
                                                            </SySelectMenu> :
                                                        ''}
                                                </>
                                                )
                                            }
                                        </div>
                                    </td>
                                ))}
                                {/* 操作列 */}
                                <td class="sy-table__body-cell"
                                    style={{width:innerSetting.value.opWidth}}>
                                    <div class="sy-table__cell-box">
                                        { context.slots.operation?.({
                                                rowIndexOfShow, 
                                                rowData, 
                                                isReadonlyOfRow : attachDatasOfRow.value[rowData._syRowId].isReadonly
                                                }) // 操作列插槽
                                            ?? 
                                                // 默认插槽
                                                (
                                                /*权限按严格的不可删除来*/
                                                innerSetting.value.canRemoveRow && attachDatasOfRow.value[rowData._syRowId].canDelete ?
                                                    <button class="sy-table--btn sy-table--btn-danger" onClick={() => removeRow(rowIndexOfShow)}>删除</button> : ''
                                                )
                                        }
                                    </div>
                                </td>
                            </tr>))}
                    </tbody>
                </table>
            </div>
        )
    }
})
</script>

<style scoped>
    .sy-table *{
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

    /* #region */
    .sy-table--btn{
        cursor: pointer;
    }

    .sy-table--btn-danger{
        box-sizing: border-box;
        padding: 3px 10px;
        height: 24px;
        font-size: 14px;
        font-family: 微软雅黑;
        line-height: 1;
        background: var(--danger-color);
        border: var(--danger-color);
        color: #fff;
    }
    .sy-table--btn-danger:hover{
        background: var(--danger-dark-color);
    }
    /* #endregion */

    .sy-table__table{
        table-layout: fixed;
        border-collapse:collapse;
        margin-left: 24px;
        margin-bottom: 12px;
    }
    /* td */
    .sy-table__header-cell , .sy-table__body-cell{
        border: 1px solid #000;
        padding: 0;
        /* height: 24px; */
    }
    /* td>div */
    .sy-table__cell-box, .sy-table__hcell-box{
        box-sizing: border-box;
        height: 24px;
        /* background: red; */
        overflow: hidden;
        /* line-height: 24px; */
    }
    .sy-table__cell-box--align-center{
        text-align: center;
    }
    .sy-table__cell-box--valign-center{
        line-height: 24px;
    }
    /* 校验失败的class */
    .sy-table__cell-box--invalid .sy-table__cell-input{
        color: var(--danger-color);
        background: var(--danger-light-color);
    }

    .sy-table__cell-input{
        width: 100%;
        height: 100%;
        padding: 3px 5px;
        box-sizing: border-box;
        border: none;
        text-overflow: ellipsis;
    }
    .sy-table__cell-input:focus{
        background: lightblue;
        color: #000;
        /* outline: 1px solid lightseagreen; */
        outline: none;
    }
    /* 只读 */
    .sy-table__cell-input--readonly{
        background: lightgray;
    }
    .sy-table__cell-input--readonly:hover{
        cursor: not-allowed;
    }
    .sy-table__cell-input--readonly:focus{
        background: darkgray;
    }

    /* 增加行按钮 */
    .sy-table__add-row-wrap{
        position: relative;
        overflow: visible;
    }
    .sy-table__add-row {
        --color: var(--primary-color);
        --diameter: 24px;
        --border-width: 2px;
        box-sizing: border-box;
        width: var(--diameter);
        height: var(--diameter);
        position: absolute;
        bottom: calc(var(--diameter) / -2);
        left: calc(0px - var(--diameter));
        line-height: calc(var(--diameter) - var(--border-width) * 2);
        color: var(--color);
        cursor: pointer;
    }
    .sy-table__add-row::after{
        display: none;
        border: var(--border-width) solid var(--color);
        border-radius: 50%;
        content: "+";
        font-size: 20px;
        font-family: Arial;
        font-weight: 400;
    }
    .sy-table__add-row:hover::after{
        display: block;
    }

    .sy-table__row-checkbox{
        cursor: pointer;
    }
</style>