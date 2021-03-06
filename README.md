# Vue 3 + Typescript + Vite

This template should help get you started developing with Vue 3 and Typescript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)

## Type Support For `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates. However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can enable Volar's `.vue` type support plugin by running `Volar: Switch TS Plugin on/off` from VSCode command palette.

# TODO-LIST WITH PROJECT

- [ ] eslint support ts
- [ ] refactor valid-rule.js similar code
- [x] 增加 `defineXxx` 工具类方便参数的定义
- [ ] SyGrid 和 SyTable 组件支持tip

# How to Start

execute `npm run build` to build in `/dist`.

copy `*.css` , `*.es.js` and `*.es.js.map` in `/dist` to other project when you want use.

import `*.css` and something from `*.es.js` when you use in other project.