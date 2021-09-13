
/**
 * 组件相关工具类
 * @version 0.1.0.210913    格式化校验文本
 * @changeLog
 *          0.1.0.210913    格式化校验文本
 */

/**
 * @link SyGrid
 * @version 1.11.0
 */
type GridItemValidateResultError = {
    message: string;
    label: string | undefined;
}

/**
 * @link syGrid
 * @version 1.11.0
 */
type GridValidateResultError = {[key: string]: GridItemValidateResultError}

/**
 * @link SyTable
 * @version 1.0.9
 */
type VisibleTablePosition = {
    rowIndexOfShow: number
    columnKey: string
}

/**
 * @link SyTable 
 * @version 1.0.9
 */
type TableItemValidateResultError = {
    tableName: string
    position: VisibleTablePosition | null
    label: string | undefined
    message: string
}

/**
 * 格式化校验失败消息
 * @param errors 校验失败数组，如果是无论是 SyGrid 还是 SyTable 校验返回的结果，都应该只是这个参数的一个元素
 */
export function formatInvalidMessage(errors : Array<GridValidateResultError | Array<TableItemValidateResultError>>){
    return errors.map(v => Object.values(v)) // [[GridItemValidateResultError | TableItemValidateResultError]]
            .flat() // [GridItemValidateResultError | TableItemValidateResultError]
            .map((v : GridItemValidateResultError | TableItemValidateResultError) =>{
                // @ts-ignore
                const tableMsg = v.tableName ? `${v.tableName} ` : '主表 '
                // @ts-ignore
                const rowMsg = v.position ? `行 ${v.position.rowIndexOfShow + 1} ` : ''
                const labelMsg = v.label ? `【${v.label}】 ` : ''
                return `${tableMsg}${rowMsg}${labelMsg}有误：${v.message}`
            }) // [string]
}
