# OKee Render

一个轻量级的高性能 2d 图形库

## 特性

* svg /canvas双引擎, 使用相同的api
* 优秀的性能, 支持数十万图元渲染交互
* 可继承式样式属性

## 安装
> npm install @okee-uikit/render

### 使用
```html
<div id="container" style="width: 600px;height: 480px"></div>
```

```js
import { Render, Rect } from '@okee-uikit/render'

const or = new Render(document.getElementById('container'))

or.add(new Rect({
  x: 0,
  y: 0,
  width: 100,
  height: 100
}))
```

## License

MIT licensed