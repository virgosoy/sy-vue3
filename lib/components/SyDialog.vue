<template>
    <div :id="id">
        <div class="sy-dialog__mask"></div>
        <div class="sy-dialog__box">
            <div class="sy-dialog__text-area">{{ text }}</div>
            <div class="sy-dialog__btn-area">
                <button @click="okHandler()">ok</button>
                <button @click="cancelHandler()">cancel</button>
            </div>
        </div>
    </div>
</template>

<script>
/**
 * 对话框模板
 * @version 0.1.0.210127
 * @changelog 见 SyDialogUtil.js
 * @see SyDialogUtil.js
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
    --width: 240px;
    --height: 60px;
    position: fixed;
    z-index: 1001;
    width: var(--width);
    height: var(--height);
    left: calc(50% - var(--width) / 2);
    top: calc(50% - var(--height) / 2);
    background: #fff;
    border-radius: 5px;
}
.sy-dialog__mask{
    background: rgba(0,0,0,0.3);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
}
.sy-dialog__text-area{
    padding: 5px 10px;
}
.sy-dialog__btn-area{
    text-align: center;
}
.sy-dialog__btn-area button{
    cursor: pointer;
}
</style>