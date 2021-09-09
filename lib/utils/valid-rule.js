/* eslint-disable no-unused-vars */

/**
 * 校验规则
 * @version 2.2.1.210909    `@`路径修改为相对路径
 * @changelog
 *      2.2.1.210909    `@`路径修改为相对路径
 *      2.2.0.210811    增加numberOptional
 *      2.1.0.210811    增加自定义校验器 customPredicateValidator、customSimpleValidator、customAsyncValidator、requiredAndCustomAsyncValidator，用于自定义校验规则用
 *      2.0.1.210806    inListRequired、inListOptional 支持传入函数了
 */


/**
 * @typedef {(t : T) => boolean} Predicate<T=any>
 */
/**
 * @typedef {(t : T) => String} ToStringFunction<T=any>
 */

import { isNumber, isInteger, isDate, isEmpty, isDateTime } from './sy-util/validate.js'

const Rule = {
    /**
     * 正数/0必填
     */
    positiveAndZeroNumberRequired:() => (rule, value, callback, source, options) => {
        var errors = []
        if (!isNumber(value)){
            errors.push(new Error('需要为数字'))
        }else if (value < 0) {
            errors.push(new Error('不能为负'))
        }
        callback(errors)
    },
    positiveAndZeroNumberOptional:() => (rule, value, callback, source, options) => {
        var errors = []
        if (isEmpty(value)){
            // 空则跳过
            callback(errors)
            return
        }
        if (!isNumber(value)){
            errors.push(new Error('需要为数字'))
        }else if (value < 0) {
            errors.push(new Error('不能为负'))
        }
        callback(errors)
    },
    /** 正整数/0 必填 */
    positiveAndZeroIntegerRequired:() => (rule, value, callback, source, options) => {
        var errors = []
        if (!isInteger(value)){
            errors.push(new Error('需要为整数'))
        }else if (value < 0) {
            errors.push(new Error('不能为负'))
        }
        callback(errors)
    },
    /** 正整数/0 可选 */
    positiveAndZeroIntegerOptional:() => (rule, value, callback, source, options) => {
        var errors = []
        if (isEmpty(value)){
            // 空则跳过
            callback(errors)
            return
        }
        if (!isInteger(value)){
            errors.push(new Error('需要为整数'))
        }else if (value < 0) {
            errors.push(new Error('不能为负'))
        }
        callback(errors)
    },
    /** 负数/0 可选 */
    negativeAndZeroNumberOptional:() => (rule, value, callback, source, options) => {
        var errors = []
        if (isEmpty(value)){
            // 空则跳过
            callback(errors)
            return
        }
        if (!isNumber(value)){
            errors.push(new Error('需要为数字'))
        }else if (value > 0) {
            errors.push(new Error('不能为正'))
        }
        callback(errors)
    },
    /** 
     * 数字 可选
     * @since 2.2.0.210811
     */
    numberOptional:() => (rule, value, callback, source, options) => {
        var errors = []
        if (isEmpty(value)){
            // 空则跳过
            callback(errors)
            return
        }
        if (!isNumber(value)){
            errors.push(new Error('需要为数字'))
        }
        callback(errors)
    },
    numberRequired:() => (rule, value, callback, source, options) => {
        var errors = []
        if (!isNumber(value)){
            errors.push(new Error('需要为数字'))
        }
        callback(errors)
    },
    dateOptional:() => (rule, value, callback, source, options) => {
        var errors = []
        if (value && !isDate(value)){
            errors.push(new Error('需要为日期'))
        }
        callback(errors)
    },
    dateTimeRequired:() => (rule, value, callback, source, options) => {
        var errors = []
        if (!isDateTime(value)){
            errors.push(new Error('需要为日期时间'))
        }
        callback(errors)
    },
    required:() => (rule, value, callback, source, options) => {
        var errors = []
        if (isEmpty(value)){
            errors.push(new Error('不能为空'))
        }
        callback(errors)
    },
    /**
     * 必填，自定义消息
     * 使用方法：Rule.requiredAndCustomMsg('哈哈哈') 没填写时校验报错提示“哈哈哈”
     * @param {*} msg 提示消息
     */
    requiredAndCustomMsg(msg){
        return (rule, value, callback, source, options) => {
            var errors = []
            if (isEmpty(value)){
                errors.push(new Error(msg))
            }
            callback(errors)
        }
    },
    /**
     * 长度控制且必须
     * 使用方法：Rule.lengthRequired(3, 6) 长度3到6
     * @param {Number} minLength 最小长度
     * @param {Number} maxLength 最大长度
     */
    lengthRequired(minLength, maxLength){
        return (rule, value, callback, source, options) => {
            var errors = []
            if (isEmpty(value)){
                errors.push(new Error('不能为空'))
            }else if( !(value.length >= (minLength ?? -1) && value.length <= (maxLength ?? Infinity)) ){
                let msg
                if(minLength === maxLength){
                    msg = `长度需为${minLength}`
                }else{
                    msg = `长度需在区间${
                        typeof minLength !== 'undefined' ? '[' + minLength : '(-∞'
                    },${
                        typeof maxLength !== 'undefined' ? maxLength + ']': '+∞)'
                    }`
                }
                errors.push(new Error(`${msg}`))
            }
            callback(errors)
        }
    },
    /**
     * 如果listValues是异步加载的，使用 listValues 传递函数，支持普通函数与异步函数\
     * 已过时的方式： (...args) => Rule.inListOptional(listValues)(...args)
     */
    inListRequired:(listValues) => async (rule, value, callback, source, options) => {
        let realListValues
        if(typeof listValues === 'function'){
            realListValues = await listValues()
        }else{
            realListValues = listValues
        }
        var errors = []
        if (isEmpty(value)){
            errors.push(new Error('不能为空'))
        }else if(!realListValues.includes(value)){
            errors.push(new Error('需在值列表内'))
        }
        callback(errors)
    },
    /**
     * 如果listValues是异步加载的，使用 listValues 传递函数，支持普通函数与异步函数\
     * 已过时的方式：(...args) => Rule.inListOptional(listValues)(...args)
     */
    inListOptional:(listValues) => async (rule, value, callback, source, options) => {
        let realListValues
        if(typeof listValues === 'function'){
            realListValues = await listValues()
        }else{
            realListValues = listValues
        }
        var errors = []
        if(value && !realListValues.includes(value)){
            errors.push(new Error('需在值列表内'))
        }
        callback(errors)
    },
    /**
     * 自定义断言校验
     * @param {Predicate} predicate 是否符合校验，参数为校验的值，回调函数，返回false则会报错
     * @param {string} msg 提示消息
     * @returns 
     * @since 2.1.0.210811
     */
    customPredicateValidator(predicate, msg){
        return (rule, value, callback, source, options) => {
            var errors = []
            if (!predicate(value)){
                errors.push(new Error(msg))
            }
            callback(errors)
        }
    },
    /**
     * 自定义简单校验
     * @param {ToStringFunction} validator 校验器，回调函数，参数为校验的值，返回报错信息，返回 falsy 如 undefind | '' 为校验通过
     * @returns 
     * @since 2.1.0.210811
     */
    customSimpleValidator(validator){
        return (rule, value, callback, source, options) => {
            var errors = []
            const msg = validator(value)
            if (msg) {
                errors.push(new Error(msg))
            }
            callback(errors)
        }
    },
    /**
     * 自定义异步校验
     * @param {(value : any) => Promise<void>} asyncValidator 校验器，回调函数，参数为校验的值
     *      - resolve 为校验成功
     *      - reject 为校验失败，reason 为 Error 对象，reason.message 为错误消息
     * @returns 
     * @since 2.1.0.210811
     */
    customAsyncValidator(asyncValidator){
        return async (rule, value, callback, source, options) => {
            var errors = []
            try{
                await asyncValidator(value)
            }catch(e){
                errors.push(e)
            }
            callback(errors)
        }
    },
    /**
     * 必填+自定义异步校验
     * @param {(value : any) => Promise<void>} asyncValidator 校验器，回调函数，参数为校验的值
     *      - resolve 为校验成功
     *      - reject 为校验失败，reason 为 Error 对象，reason.message 为错误消息
     * @returns 
     * @since 2.1.0.210811
     */
    requiredAndCustomAsyncValidator(asyncValidator){
        return async (rule, value, callback, source, options) => {
            var errors = []
            if (isEmpty(value)){
                errors.push(new Error('不能为空'))
            } else {
                try{
                    await asyncValidator(value)
                }catch(e){
                    errors.push(e)
                }
            }
            callback(errors)
        }
    },
} 

export default Rule