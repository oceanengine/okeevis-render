# OKee Render

<p align="center">A fast lightweight 2D graphic library</p>
<p align="center">
    <img src="https://img.shields.io/npm/v/@okee-uikit/render" alt="npm version" />
    <img src="https://img.shields.io/badge/language-typescript-red.svg" />
    <img src="https://img.shields.io/bundlephobia/min/@okee-uikit/render" alt="min size" />
</p>

English | [简体中文](./README_CN.md)

## Features

* Both svg and canvas renderer support with same API
* Good performance with large amount of data
* Cross platform suppprt with web、node、mini-program
* Support interpolation animation, and path animation 
* Support start and end arrows on path
* Virutal dom update with transition animation
* Rich-text component

## Install
> npm install @okee-uikit/render

### Usage
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
  height: 100,
  fill: 'red'
}))
```

## License

MIT licensed