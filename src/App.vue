<script setup lang="ts">
import '../dist/style.css'
// 如果不忽略 npm run build 会报错：
// @ts-ignore
import { SyGrid, SyTable } from '../dist/sy-vue3.es.js'

import { ref } from 'vue'


const mainFieldList = ref([
    {key: 'name', label: '姓名'}
])

const mainValue = ref({
})

const firstLineFieldList = ref([
    {key: 'score', label: '分数'}
])

const firstLineValueList = ref([
])
</script>

<template>
    <SyGrid :fieldList="mainFieldList" v-model:dataValue="mainValue" ></SyGrid>
    <SyTable :columnPropList="firstLineFieldList" v-model:tableDataList="firstLineValueList"></SyTable>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
