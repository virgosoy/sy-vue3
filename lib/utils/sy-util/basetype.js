/**
 * 基础数据类型工具类
 * @version 0.0.1-alpha.210908  增加常量 isAbsent
 * @changeLog
 *      0.0.1-alpha.210908  增加常量 isAbsent
 *      0.0.1-alpha.210423
 */

/**
 * 检查数组是否全部包含指定的数组元素
 * @param {Array} origin 被查询的数组
 * @param {Array} findArr 查询的数组（含要指定的元素）
 */
export const includesAll = (origin, findArr) => findArr.every(fv => origin.includes(fv))

/**
 * 根据 key-value 在数组的元素中查找（全等），第一个符合条件立即返回其索引
 * @param {Array<object>} arr 被查找的数组
 * @param {String} key 被查找的key
 * @param {*} value 查找的值，使用全等判断
 */
export function findIndex(arr,key,value){
    for(let i = 0; i < arr.length; i++){
        if(arr[i][key] === value){
            return i
        }
    }
}

/**
 * 根据 key-value 在数组的元素中查找（全等），第一个符合条件立即返回其元素
 * @param {Array<object>} arr 被查找的数组
 * @param {String} key 被查找的key
 * @param {*} value 查找的值，使用全等判断
 * @since 0.0.1-alpha.210423
 */
export function find(arr,key,value){
    return arr[findIndex(arr,key,value)]
}

/**
 * 检查对象是否为 undefined
 * @param {any} obj 
 * @since 0.0.1-alpha.210414
 */
export const isUndefined = (obj) => typeof obj === 'undefined'

/**
 * 检查对象是否为 null
 * @param {any}} obj 
 * @since 0.0.1-alpha.210423
 */
export const isNull = (obj) => obj === null

/**
 * 缺省值，为了 vue3 的 prop 中区分判断无传参和传入undefined而出现。\
 * 并通过 import 解决新版本的vue（^3.2.6）报错的问题
 * @since 0.0.1-alpha.210908
 */
export const isAbsent = Symbol() 