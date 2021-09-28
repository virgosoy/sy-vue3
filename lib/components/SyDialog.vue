<template>
    <div :id="id">
        <div class="sy-dialog__mask">
            <div class="sy-dialog__box">
                <div class="sy-dialog__text-area">{{ text }}</div>
                <div class="sy-dialog__btn-area">
                    <button @click="okHandler()">ok</button>
                    <button @click="cancelHandler()">cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/**
 * 对话框模板
 * @version 0.2.0.210928    改为flex布局进行水平垂直居中，增加最大宽度避免溢出屏幕，按钮与边框增加间距
 * @changelog 
 *          0.2.0.210928    改为flex布局进行水平垂直居中，增加最大宽度避免溢出屏幕，按钮与边框增加间距
 *          0.1.0.210127    支持简单的文本，确定与取消事件
 * @see SyDialogUtil.js 两者共用一套版本体系
 * @doc
 *      事件：btnClick
 *          事件对象：
 *              'ok' - 确认按钮
 *              'cancel' - 取消按钮
 */
// import { ref } from 'vue'
export default {
    props:{
        id:{
            type: String,
            required: true
        },
        text:{
            type: String,
            required: true
        }
    },
    setup(props, context){

        const BTN_CLICK_EVENT_NAME = 'btnClick'
        function okHandler(){
            context.emit(BTN_CLICK_EVENT_NAME,'ok')
        }
        function cancelHandler(){
            context.emit(BTN_CLICK_EVENT_NAME,'cancel')
        }

        return { okHandler, cancelHandler }
    }
}
</script>

<style>
.sy-dialog__box{
    max-width: 100%;
    background: #fff;
    border-radius: 5px;
    word-break: break-all;
}
.sy-dialog__mask{
    background: rgba(0,0,0,0.3);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
}
.sy-dialog__text-area{
    padding: 5px 10px;
}
.sy-dialog__btn-area{
    padding-bottom: 5px;
    text-align: center;
}
.sy-dialog__btn-area button{
    cursor: pointer;
}
</style>