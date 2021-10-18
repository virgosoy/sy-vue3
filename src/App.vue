<script setup lang="ts">
// import '../dist/style.css'
import { SyGrid, SyTable, Rule, SyCompUtils } from '../lib/main'

import { ref } from 'vue'

/**
 * 模拟网络请求
 */
async function webRequest(){
    return Promise.resolve(["异步1", "异步2"])
}

//#region SyGrid & SyTable
/**
 * 下拉列表的说明
 */
function selectListGenerator(type : number){
    switch(type) {
        case 1:
            // 如果希望只是一些固定值，那么可以直接
            return () => ["你", "我", "他"]
        case 2:
            // 如果希望是每次下拉都异步加载
            return async () => await webRequest()
        case 3:
            // 如果希望第一次下拉是异步然后缓存
            // eslint-disable-next-line no-case-declarations
            let cache : Array<string>
            return async () => {
                return cache ??= await webRequest()
            }
        case 4:
            // 如果希望立即异步加载，后面每次下拉都读缓存
            // eslint-disable-next-line no-case-declarations
            // let cache2 = await webRequest()
            // return () => cache2
            // 或
            // eslint-disable-next-line no-case-declarations
            let cache2 : {value ?: Array<string>} = {}
            webRequest().then(v => cache2.value = v)
            return () => cache2.value
    }
}

const mainFieldList = ref([
    {key: 'name', label: '姓名'},
    {key: 'number', label: '数字校验', validRule: Rule.numberOptional()},
    {key: 'cron', label: 'cron校验', validRule: Rule.cronOptional()},
    {key: 'javaClass', label: 'java类名校验', validRule: Rule.javaClassOptional()},
    {key: 'textarea', label: '文本域', dataType: 'textarea'},
    {key: 'jsonObject', label: 'jsonObject', dataType: 'jsonObject'},
    {key: 'select', label: '下拉值', dataType: 'select',
        selectOption: {
            selectList: selectListGenerator(3),
            refreshStrategy: 'drop',
        }
    },
    {key: 'submitDataPreHandler', label: '提交前处理', 
        submitDataPreHandler: (v : string) => v.length === 0 ? null : v,
    },
    {key: 'isSubmitNullWhenEmpty', label: '空值为null', 
        isSubmitNullWhenEmpty: true,
    },
    {key: 'end', label: '最后一个框'},
])

// 还是叫 mainData ?
const mainValue = ref({
})

// 还是叫 firstTableFieldList ?
// 还是教 firstFieldList
const firstLineFieldList = ref([
    {key: 'score', label: '分数'}
])

// 还是叫 firstLineDataList ?
// 还是叫 firstTableValueList ?
// 还是叫 firstValueList ?
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
    console.log(JSON.stringify(data))
}
//#endregion

//#region SyGrid & SyTable's defind
import { defineSyGridFieldList, defineSyTableFieldList, defineSyTableSetting } from '../lib/main'

const defineFieldList = ref(defineSyGridFieldList([
    {key: 'name', label: '姓名'},
    {key: 'age', label: '年龄'}
]))

type MyDTO = {
    a : string;
    b : string;
}

// 带元素类型的 jsdoc 用法（ts不适合）
const defineFieldList2 = ref(defineSyGridFieldList([
    // @ts-ignore
    {key: 'a', label: '姓名'},
    // @ts-ignore
    {key: 'b', label: '年龄'},
], /** @type {MyDTO}*/ ({})))

// 带元素类型的 ts 用法
const defineFieldList3 = ref(defineSyGridFieldList<MyDTO>([
    {key: 'a', label: '姓名'},
    {key: 'b', label: '年龄'},
]))

const defineTableFieldList = ref(defineSyTableFieldList<MyDTO>([
    {key: 'a', label: '姓名'},
    {key: 'b', label: '年龄'},
]))

const defineTableSetting = ref(defineSyTableSetting({
    isReadMode: true
}))

const defineValue = ref({})

//#endregion SyGrid & SyTable's defind

//#region SyDialog

import SyDialogUtil from '../lib/components/SyDialogUtil'

function syDialogShow(){
    SyDialogUtil.show(`你好`)
            .then((e) => console.log(e))
            .catch((e) => console.error(e))
}
function syDialogPrompt(){
    SyDialogUtil.prompt(`你好`, '我好')
            .then((e) => console.log(e))
            .catch((e) => console.error(e))
}

//#endregion

// import { isJavaClass } from '../lib/utils/sy-util/validate'
// window.isJavaClass = isJavaClass
</script>

<template>
    <SyGrid ref="mainGrid" :fieldList="mainFieldList" v-model:dataValue="mainValue" ></SyGrid>
    <SyGrid ref="mainGrid" :fieldList="defineFieldList" v-model:dataValue="defineValue" ></SyGrid>
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
    <button @click="syDialogShow">显示 SyDialog</button>
    <button @click="syDialogPrompt">SyDialog Prompt</button>
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
