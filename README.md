# OKee Render

A fast lightweight 2D graphic library

## Features

* Both svg and canvas renderer support with same API
* Good performance with large amount of data
* Inheritable style attributes

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
  height: 100
}))
```

## License

MIT licensed