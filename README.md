# control-panel

[![NPM version][npm-image]][npm-url]
![experimental][experimental-image]
[![js-standard-style][standard-image]][standard-url]


Embeddable panel of inputs for adding parameter selection to your app or visualization. Modern and minimalist design. Fully encapsulated module including JS and CSS. Can easily be added to any app or page. Heavily inspired by [`dat-gui`](https://github.com/dataarts/dat.gui), but streamlined, simplified, and written as a npm module for use with browserify.

![dark](images/dark.png)![light](images/light.png)

----------------

> Supports the following input types

> `range` • `checkbox` • `text` • `color`

----------------

> Includes the following themes

> `dark` • `light`


## install

Add to your project with

```
npm install control-panel
```

## example

Create a panel with four elements and add to your page in the top right.

```javascript
var control = require('control-panel')

var panel = control([
  {type: 'range', label: 'range slider', min: 0, max: 100, initial: 20},
  {type: 'text', label: 'text', initial: 'my cool setting'},
  {type: 'checkbox', label: 'checkbox', initial: true},
  {type: 'color', label: 'color rgb', format: 'rgb', initial: 'rgb(100,200,100)'}
], 
  {theme: 'light', position: 'top-right'}
)
```

## usage

#### `panel = control([input1, input2, ...], [opts])`

The first argument is a list of items. Each one must have a `type` and `label` property, and can have an `initial` property with an initial value. For example,

```javascript
{type: 'checkbox', label: 'my checkbox', initial: true}
```

Each `type` must be one of `range` • `input` • `checkbox` • `color`. Each `label` must be unique. 

Some types have additional properties:
- Inputs of type `range` can specify a `min`, `max`, and `step`
- Inputs of type `color` can specify a `format` as either `rgb` • `hex` • `array`

The following optional parameters can also be passed as `opts`
- `root` root element to which to append the panel
- `theme` can specify `light` • `dark` or provide an object (see [`themes.js`](themes.js) for format)
- `title` a title to add to the top of the panel
- `position` where to place the panel as `top-left` • `top-right` • `bottom-left` • `bottom-right` 
- `width` width of panel in pixels

#### `panel.on('input')`

Emitted every time any of the inputs change. Returns an object with the state of all inputs by label.

[npm-image]: https://img.shields.io/badge/npm-v1.0.1-lightgray.svg?style=flat-square
[npm-url]: https://npmjs.org/package/control-panel
[standard-image]: https://img.shields.io/badge/code%20style-standard-lightgray.svg?style=flat-square
[standard-url]: https://github.com/feross/standard
[experimental-image]: https://img.shields.io/badge/stability-experimental-lightgray.svg?style=flat-square