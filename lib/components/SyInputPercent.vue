<script setup lang="ts">
    /**
     * 百分比输入框，用法和 input 一样
     * @version 0.2.1.210908    升级vue导致部分属性废弃，进行修正
     * @changeLog 
     *          0.2.1.210908    升级vue导致部分属性废弃，进行修正
     *          0.2.0.210816    可指定格式化策略`props.formatStrategyType`
     *          0.1.1.210816    重构，准备使用格式化策略
     *          0.1.0.210812    input输入框，真实值去除所有%，显示值去除所有%后加%
     * @dependOn
     *      vue ^3.2.6
     */

    import {computed, defineEmits, defineProps} from 'vue'

    type formatStrategyType = 'hundredTimes' | 'percentSymbol' // 'oneTimes' | 

    const props = defineProps({
        modelValue: {
            type: String,
            default: ''
        },
        /**
         * - hundredTimes - 1.1% -> 1.1
         * - oneTimes - 1.1% -> 0.011
         * - percentSymbol -> 1.1% -> 1.1%
         */
        formatStrategyType: {
            type: String,
            default: 'hundredTimes'
        }
    })

    type FormatStrategy = {
        [strategy in formatStrategyType] : {
            format(originVal : string) : string,
            deformat(formatVal : string) : string
        }
    }
    const formatStrategy : FormatStrategy = {
        hundredTimes : {
            format(originVal){
                return originVal?.replaceAll(/%/mg, '') + '%'
            },
            deformat(formatVal){
                return formatVal.replaceAll(/%/mg, '')
            }
        },
        // FIXME: 精度问题
        // oneTimes : {
        //     format(originVal){
        //         return (+originVal * 100).toString().replaceAll(/%/mg, '') + '%'
        //     },
        //     deformat(formatVal){
        //         return (+formatVal.replaceAll(/%/mg, '') / 100).toString()
        //     }
        // },
        percentSymbol : {
            format(originVal){
                return originVal?.replaceAll(/%/mg, '') + '%'
            },
            deformat(formatVal){
                return formatVal.replaceAll(/%/mg, '') + '%'
            }
        }
    }
    function format(originVal : string){
        return formatStrategy[props.formatStrategyType as formatStrategyType].format(originVal)
    }
    function deformat(formatVal : string){
        return formatStrategy[props.formatStrategyType as formatStrategyType].deformat(formatVal)
    }


    const emits = defineEmits(['update:modelValue'])
    const value = computed({
        get(){
            const originVal = props.modelValue
            const formatVal = format(originVal)
            // if(!originVal?.endsWith('%')){
            //     formatVal = originVal + '%'
            // }else{
            //     formatVal = originVal
            // }
            return formatVal
        },
        set(formatVal : string){
            const originVal = deformat(formatVal)
            // if(formatVal.endsWith('%')){
            //     originVal = formatVal.substring(0, formatVal.length - 1)
            // }else{
            //     originVal = formatVal
            // }
            emits('update:modelValue', originVal)
        }
    })

</script>

<template>
    <input v-model="value" />
</template>