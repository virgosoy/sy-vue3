
/**
 * 全局单击插件 SyGlobalClickPlugin
 * @version 2.0.2.210602    增加捕获阶段事件
 * @changelog
 *          2.0.2.210602    增加捕获阶段事件
 *          2.0.1.210601    Setting类型修改与导出
 *          2.0.0.210531    使用ts编写
 *          0.1.0.200621
 */

/**
 * @interface Setting
 */
export interface Setting{
    dom: HTMLElement
    clickHandler ?: (ev: MouseEvent) => void // inBubblingPhase
    unclickHandler ?: (ev: MouseEvent) => void // inBubblingPhase
    clickHandlerInCapturePhase ?: (ev: MouseEvent) => void
    unclickHandlerInCapturePhase ?: (ev: MouseEvent) => void
}

/**
 * @type {Setting[]} 观察对象设置列表
 */
const observers : Setting[] = []

/**
 * 增加观察者
 * @param {Setting} setting
 */
export function add(setting: Setting){
    // console.log('增加观察者', setting)
    observers.push(setting)
}

/**
 * 移除观察者
 * @param {Setting} setting 
 */
export function remove(setting: Setting){
    // console.log('移除观察者', setting)
    let index = observers.indexOf(setting)
    if(index !== -1){
        observers.splice(index,1)
    }
}

/**
 * 全局点击时触发，在事件冒泡阶段
 * @param {MouseEvent} ev 
 */
function globalClick(ev: MouseEvent){
    observers.forEach(({dom,clickHandler = ()=>{},unclickHandler = ()=>{}}) => {
        if(ev.path.includes(dom)){
            // console.log('触发clickHandler', dom)
            clickHandler(ev)
        }else{
            // console.log('触发unclickHandler', dom)
            unclickHandler(ev)
        }
    })
}

/**
 * 全局点击时触发，在事件捕获阶段
 * @param {MouseEvent} ev 
 */
 function globalClickInCapturePhase(ev: MouseEvent){
    observers.forEach(({dom,clickHandlerInCapturePhase = ()=>{},unclickHandlerInCapturePhase = ()=>{}}) => {
        if(ev.path.includes(dom)){
            // console.log('触发clickHandlerInCapturePhase', dom)
            clickHandlerInCapturePhase(ev)
        }else{
            // console.log('触发unclickHandlerInCapturePhase', dom)
            unclickHandlerInCapturePhase(ev)
        }
    })
}

// 注册监听器
console.log('准备注册监听器')
document.addEventListener('click', globalClickInCapturePhase, true)
document.addEventListener('click', globalClick)
// document.removeEventListener('click', globalClick)
