/**
 * 对话框工具类
 * @version 0.3.0.210928    ⚡破坏性修改，不兼容旧版本：事件对象修改
 *                          增加prompt方法
 * @changelog
 *          0.3.0.210928    ⚡破坏性修改，不兼容旧版本：事件对象修改
 *                          增加prompt方法
 *          0.1.0.210127    支持简单的文本，确定与取消事件
 * @dependOn
 *      vue ^3.0.11
 *      SyDialog.vue   ^0.3.0 
 * @see SyDialog.vue 两者共用一套版本体系
 * 
 */

/**
 * 事件对象
 * @typedef {{
 *     buttonId: 'ok' | 'cancel'
 *     inputValue: string
 * }} EventObject
 * @link SyDialog.vue 0.3.0
 */

import { h, render } from 'vue'
import SyDialog from './SyDialog.vue'

/**
 * 实例列表
 * @typedef {{
 *  vNode: import('vue').VNode; 
 *  container: Element}} Inst
 * @type Array<Inst>
 */
const instanceList = []

/** 递增种子 */
let seed = 1

function SyDialogUtil(){
}

/**
 * @param {{text: string; useInput: boolean; defaultInputValue: string}} options
 * @returns {Promise<EventObject>} 点击按钮后触发，ok触发resolve(ev)，cancel触发reject(ev)
 */
function createInstance({text, useInput = false, defaultInputValue = ''}){

    /** @type {{resolve: (value: any)=>void, reject:(reason?: any)=>void}} */
    let promiseStatus = null
    // 元素id
    const id = `sy-dialog__id-${seed++}`
    // 创建 VNode
    const vNode = h(SyDialog, {
        text,
        id,
        useInput,
        defaultInputValue,
        onBtnClick: (/** @type {EventObject} */ev) => {
            if(ev.buttonId === 'cancel'){
                promiseStatus.reject(ev)
            }else{
                promiseStatus.resolve(ev)
            }
            close(id)
        }
    }, null)
    // 创建容器
    const container = document.createElement('div')
    // 渲染
    render(vNode, container)
    // 将对象添加到实例列表中
    instanceList.push({vNode,container})
    // 将容器添加到body上
    document.body.appendChild(container)

    return new Promise((resolve, reject)=>{
        promiseStatus = {resolve, reject}
    })
}

/**
 * 关闭对话框
 * @param {string} id 对话框的元素id
 */
function close(id){
    const index = instanceList.findIndex(({vNode})=>{
        const { id: _id } = vNode.component.props
        return id === _id
    })
    if(index === -1){
        return
    }
    const {container} = instanceList[index]
    // 从dom中移除
    document.body.removeChild(container)
    // 从列表中移除
    instanceList.splice(index, 1)
}

SyDialogUtil.close = close

/**
 * 显示对话框
 * @param {string} text 显示的简单文本
 * @returns {Promise<EventObject>} 点击按钮后触发，ok触发resolve(ev)，cancel触发reject(ev)
 */
SyDialogUtil.show = function(text){
    return createInstance({text})


    // const comp = createApp(SyDialog)
    // const div = document.createElement('div')
    // /** @type SyDialog */
    // const instance = comp.mount(div)
    // console.log(`instance`, instance)
    // document.body.appendChild(instance.$el)
    // instance.text = text
    // return instance.show()
}

/**
 * 显示 prompt 对话框
 * @param {string} text 提示文本
 * @param {string} defaultValue 可选，输入文本默认值
 */
SyDialogUtil.prompt = function(text, defaultValue = ''){
    return createInstance({text, useInput: true, defaultInputValue: defaultValue})
}

/**
 * @param {import('vue').App} app 
 */
SyDialogUtil.install = function(app){
    // app.component(SyDialog)
    app.config.globalProperties.$syDialog = SyDialogUtil
}

export default SyDialogUtil

