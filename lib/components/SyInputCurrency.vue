<script setup lang="ts">
    /**
     * 货币输入框，用法和 input 一样，但是是 change（.lazy）的时候才触发值的变动
     * @version 0.2.4.210908    isAbsent 通过 import 导入使用，新版 vue ^3.2.6 已经不支持之前的写法
     * @changeLog 
     *      0.2.4.210908    isAbsent 通过 import 导入使用，新版 vue ^3.2.6 已经不支持之前的写法
     *      0.2.3.210908    vue升级导致部分属性废弃，进行修正
     *      0.2.2.210823    fix: 第一次加载数据时没有显示数据
     *      0.2.1.210816    🐞fix: 若格式化后内容一样，则可无视精度（不触发 input value get响应式）：
     *                          内部值抛弃 computed，改为 ref，用 input 的 change 事件来更新内部值，触发响应式。
     *                      refactor: 四舍五入使用 bignumber.js
     *      0.2.0.210816    🐞feat: 保留小数位`props.digit` 依赖 bignumber.js ^9.0.1; refactor: 格式化/反格式化方法提取。
     *      0.1.1.210812    fix：传递数值类型会报错
     *      0.1.0.210812    🐞千分位分隔符，change（.lazy）的时候才触发值的变动，显示值含千分位，真实值不含。
     * @depentOn
     *      vue ^3.2.6
     *      bignumber.js ^9.0.1
     */

    import { isAbsent } from '../utils/sy-util/basetype.js'
    import {computed, defineEmits, defineProps, nextTick, onMounted, ref, watch} from 'vue'
    import BN from 'bignumber.js'

    const props = defineProps({
        modelValue: {
            type: String,
            default: ''
        },
        digit: {
            type: [Number, Symbol],
            default: isAbsent
        }
    })

    function format(originVal : string){
        const sps = (originVal + '').split('.')
        const re = /\d{1,3}(?=(\d{3})+$)/g
        const int = sps[0].replace(re, '$&,') // 整数部分含千分位
        let dig = sps[1]
        if(props.digit !== isAbsent){
            const digit = props.digit as number
            if(sps.length > 1){
                dig = new BN(`0.${dig}`)
                    .toFixed(digit)
                    .substring(2)
            }else{
                dig = '0'.repeat(digit)
            }
        }
        const formatVal = dig ? `${int}.${dig}` : int
        return formatVal
    }
    function deformat(formatVal : string){
        let originVal : string
        const trimComma = formatVal.replaceAll(/,/mg, '')
        if(props.digit !== isAbsent){
            originVal = new BN(trimComma)
                .toFixed(props.digit as number)
        }else{
            originVal = trimComma
        }
        return originVal
    }


    // const formatter = Intl.NumberFormat('zh-CN')
    const emits = defineEmits(['update:modelValue'])

    const innerValue = ref('')
    watch(() => props.modelValue, (newVal) => {
        console.log('SyInputCurrency-watch')
        innerValue.value = format(newVal)
    },{
        immediate: true
    })

    function change(){
        console.log('SyInputCurrency-change')
        const originVal = deformat(innerValue.value)
        emits('update:modelValue', originVal)
        innerValue.value = format(originVal)
    }

    const root = ref(null as unknown as HTMLInputElement)

    onMounted(() => {
    })
</script>

<template>
    <input ref="root" v-model.lazy="innerValue" @change="change"/>
</template>