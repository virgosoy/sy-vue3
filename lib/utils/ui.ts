/**
 * UI工具类，为了统一UI用，此库不允许被本项目其他东西所依赖，仅提供给外部用。
 * 
 * 建议本文件为单独文件，也不依赖本项目的其他文件
 * 
 * @version 0.1.0.210913
 * @changeLog
 *          0.1.0.210913
 * @depentOn
 *          element-plus 1.1.0-beta.9
 */

import { ElMessage, ElMessageBox } from "element-plus";


/**
 * 成功的消息
 * @param message 消息
 */
export function messageOfSuccess(message: string){
    ElMessage.success({message, type: 'success', showClose: true, duration: 3000})
}

/**
 * 失败的消息
 * @param message 消息
 */
export function messageOfError(message: string){
    ElMessage.error({message, type: 'error', showClose: true, duration: 3000})
}

/**
 * 弹出确认框
 * @param message 消息
 * @returns 
 */
export function confirm(message : string) : Promise<any>{
    return ElMessageBox.confirm(message, {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning',
    })
}

const UI = {
    messageOfSuccess,
    messageOfError,
    confirm,
}

export default UI