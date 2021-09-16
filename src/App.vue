<script setup lang="ts">
// import '../dist/style.css'
import { SyGrid, SyTable, Rule, SyCompUtils } from '../lib/main'

import { ref } from 'vue'


const mainFieldList = ref([
    {key: 'name', label: '姓名'},
    {key: 'number', label: '数字校验', validRule: Rule.numberOptional()},
    {key: 'cron', label: 'cron校验', validRule: Rule.cronOptional()},
    {key: 'javaClass', label: 'java类名校验', validRule: Rule.javaClassOptional()},
    {key: 'textarea', label: '文本域', dataType: 'textarea'},
    {key: 'jsonObject', label: 'jsonObject', dataType: 'jsonObject'},
    {key: 'end', label: '最后一个框'},
])

const mainValue = ref({
})

const firstLineFieldList = ref([
    {key: 'score', label: '分数'}
])

const firstLineValueList = ref([
])

const secondLineFieldList = ref([
    {key: 'score', label: '分数'}
])

const secondLineValueList = ref([
])

const secondLineSetting = {
    opWidth: '1000px'
}
const mainGrid = ref()
async function validate(){
    try {
        await mainGrid.value.validate()
        console.log('校验无错误')
    } catch(e) {
        console.log(e)
        const format = SyCompUtils.formatInvalidMessage([e])
        console.log(format)
    }
}
function submit(){
    const data = mainGrid.value.getSubmitData()
    console.log(data)
}
// import { isJavaClass } from '../lib/utils/sy-util/validate'
// window.isJavaClass = isJavaClass
</script>

<template>
    <SyGrid ref="mainGrid" :fieldList="mainFieldList" v-model:dataValue="mainValue" ></SyGrid>
    <button @click="validate">校验SyGrid</button>
    <button @click="submit">提交SyGrid</button>
    <SyTable :columnPropList="firstLineFieldList" v-model:tableDataList="firstLineValueList"></SyTable>
    <SyTable :columnPropList="secondLineFieldList" 
            v-model:tableDataList="secondLineValueList"
            :setting="secondLineSetting">
        <template v-slot:operation="{rowIndexOfShow, rowData, isReadonlyOfRow}">
            <span>{{ JSON.stringify({rowIndexOfShow, rowData, isReadonlyOfRow}) }}</span>
            <button>暂停</button>
            <button>恢复</button>
            <button>删除</button>
        </template>
    </SyTable>
</template>

<style>
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
</style>
