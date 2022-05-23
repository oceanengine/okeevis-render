# OKee Render

<p align="center">一个高性能的轻量级2d图形库</p>
<p align="center">
    <img src="https://img.shields.io/npm/v/@okeev/render" alt="npm version" />
    <img src="https://img.shields.io/badge/language-typescript-red.svg" />
    <img src="https://img.shields.io/bundlephobia/min/@okeev/render" alt="min size" />
</p>

[English](./README.md)　| 简体中文

## 特性

* svg /canvas双引擎, 使用相同的api
* 优秀的性能, 支持数十万图元渲染交互
* 支持web、node、小程序环境
* 支持插值动画和路径动画
* 支持虚拟dom更新及产生过渡效果
* 支持富文本组件


## 安装
> npm install @okeev/render

### 使用
```html
<div id="container" style="width: 600px;height: 480px"></div>
```

```js
import { Render, Rect } from '@okeev/render'

const or = new Render(document.getElementById('container'))

or.add(new Rect({
  x: 0,
  y: 0,
  width: 100,
  height: 100，
  fill: 'red'
}))
```

## License

MIT licensed