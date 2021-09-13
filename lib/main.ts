// 组件
import SyGrid from './components/SyGrid.vue'
import SyTable from './components/SyTable.vue'
// 组件相关工具类
export * as CompUtils from './utils/sy-comp-utils'
// 工具类
import Rule from './utils/valid-rule.js'
import UI from './utils/ui'
export * from './utils/sy-util/basetype'

export {
    // 组件
    SyGrid,
    SyTable,
    // 工具类
    Rule,
    UI
}