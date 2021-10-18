## 0.1.14-alpha.211018 (2021-10-18)

### Features

增加 `defineXxx` 方法（[define-utils.ts](lib\utils\define-utils.ts)）方便创建参数给 `SyGrid` 和 `SyTable` 使用。
因为类型重构，故相关组件进行兼容性升级：
- `SyGrid` v1.18.0.211016 
- `SyTable` v1.6.0.211018

## 0.1.13-alpha.210927 (2021-09-27)

### Features

`SyGrid` v1.17.0.210927   
feat: 字段属性 `props.fieldList[].submitDataPreHandler` 获取提交数据前对值进行处理的函数，为 @beta 版本。
feat: 字段属性 `props.fieldList[].isSubmitNullWhenEmpty` 当值为空时是否提交null值

## 0.1.12-alpha.210922 (2021-09-22)

### Bug Fixes

`SyTable` v1.5.1.210922    fix: 粘贴新增行失效（this变成undefined，猜测可能是升级vue之后不支持了）

## 0.1.11-alpha.210917 (2021-09-17)

### Bug Fixes

`SyGrid` v1.16.1.210917   fix: jsonObject 类型不输入时会报错。现在不输入会返回 null。

## 0.1.10-alpha.210916 (2021-09-16)

### Features

`SyGrid` v1.16.0.210916   增加数据类型`props.fieldList[].dataType==='jsonObject'`，获取提交数据时为json对象，含有默认校验

## 0.1.9-alpha.210915 (2021-09-15)

### Bug Fixes

排除 `element-plus` 打包依赖

## 0.1.8-alpha.210913 (2021-09-13)

### Changes

⚡ `CompUtils` 改为 `SyCompUtils`

### Features

新增 `UI` （ui.ts） UI工具类

## 0.1.7-alpha.210913 (2021-09-13)

### Features

新增 `CompUtils`（sy-comp-utils.ts） 组件相关工具类
v0.1.0.210913    格式化校验文本

## 0.1.6-alpha.210909 (2021-09-09)

### Bug Fixes

关闭某行eslint避免报错

## 0.1.5-alpha.210909 (2021-09-09)

### Features

`Rule`（valid-rule.js） v2.3.0.210909~v2.4.0.210909    增加cron相关校验、增加java类名相关校验

## 0.1.4-alpha.210909 (2021-09-09)

### Features

将 basetype.js 所有方法暴露出来

## 0.1.3-alpha.210909 (2021-09-09)

### Features

新增工具类 `Rule`（valid-rule.js），用于快速校验。

## 0.1.2-alpha.210909 (2021-09-09)

### Features

`SyTable` v1.5.0.210909    feat:新增插槽`operation`，对操作列进行修改

使用 eslint 对 lib/** 进行检测

## 0.1.1-alpha.210908 (2021-09-08)

### Bug Fixes

修复一些bug

## 0.1.0-alpha.210908 (2021-09-08)

### Features

单独抽取成插件进行打包

支持 `SyGrid`、`SyTable`