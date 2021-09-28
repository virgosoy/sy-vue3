/**
 * 对话框工具类
 * @version 0.1.0.210127
 * @changelog
 *          0.1.0.210127    支持简单的文本，确定与取消事件
 * @dependOn
 *      vue ^3.0.11
 *      SyDialog.vue   ^0.1.0 
 * @doc
 *      
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
 * @param {{text: string}} options
 * @returns {Inst}
 */
function createInstance({text}){

    /** @type {{resolve: (value: any)=>void, reject:(reason?: any)=>void}} */
    let promiseStatus = null
    // 元素id
    const id = `sy-dialog__id-${seed++}`
    // 创建 VNode
    const vNode = h(SyDialog, {
        text,
        id,
        onBtnClick: (btnName) => {
            if(btnName === 'cancel'){
                promiseStatus.reject(btnName)
            }else{
                promiseStatus.resolve(btnName)
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
 * @returns {Promise} 点击按钮后触发，ok触发resolve()，cancel触发reject()
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
 * @param {import('vue').App} app 
 */
SyDialogUtil.install = function(app){
    // app.component(SyDialog)
    app.config.globalProperties.$syDialog = SyDialogUtil
}

export default SyDialogUtil

