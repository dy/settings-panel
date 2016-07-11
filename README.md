# settings-panel


## Usage

[![npm install settings-panel](https://nodei.co/npm/settings-panel.png?mini=true)](https://npmjs.org/package/settings-panel/)

```javascript
var createPanel = require('settings-panel')

var panel = createPanel([
  {type: 'range', name: 'my range', min: 0, max: 100, value: 20},
  {type: 'range', name: 'log range', min: 0.1, max: 100, value: 20, scale: 'log'},
  {type: 'text', name: 'my text', value: 'my cool setting', help: 'why this is cool'},
  {type: 'checkbox', name: 'my checkbox', value: true},
  {type: 'color', name: 'my color', format: 'rgb', value: 'rgb(10,200,0)', change: value => console.log(value)},
  {type: 'button', name: 'gimme an alert', change: () => alert('hello!')},
  {type: 'select', name: 'select one', values: ['option 1', 'option 2'], value: 'option 1'}
],
  {theme: 'light'}
);
```

## API

#### `panel = control([input1, input2, ...], [opts])`

The first argument is a list of inputs. Each one must have a `type`, `name` and `help` property, and can have an `value` property with an initial value. Also it may have a `change` callback, which will be invoked if value changed. For example,

```javascript
{type: 'checkbox', name: 'My Checkbox', initial: true, change: function (value) {}}
```

Each `type` must be one of `range` • `input` • `checkbox` • `color` • `interval` • `select`. Each `label` must be unique.

Some types have additional properties:
- Inputs of type `range` can specify a `min`, `max`, and `step` (or integer `steps`). Scale can be either `'linear'` (default) or `'log'`. If a log scale, the sign of `min`, `max`, and `initial` must be the same and only `steps` is permitted (since the step size is not constant on a log scale).
- Inputs of type `color` can specify a `format` as either `rgb` • `hex` • `array`
- Inputs of type `button` can specify an `action` callback. Button inputs are not reflected in the state and do not trigger an `'input'` event.
- Inputs of type `interval` obey the same semantics as `range` inputs, except the input and ouput is a two-element array corresponding to the low/high bounds, e.g. `initial: [1, 7.5]`.
- Inputs of type `select` can specify a list of options, either as an `Array` (in which case the value is the same as the option text) or as an object containing key/value pairs (in which case the key/value pair maps to value value/label pairs).

The following optional parameters can also be passed as `opts`
- `root` root element to which to append the panel
- `theme` can specify `light` • `dark` or provide an object (see [`themes.js`](themes.js) for format)
- `title` a title to add to the top of the panel
- `width` width of panel in pixels
- `position` where to place the panel as `top-left` • `top-right` • `bottom-left` • `bottom-right`, if `undefined` will just use relative positioning

#### `panel.on('input', cb(data))`

This event is emitted every time any one of the inputs change. The callback argument `data` will contain the state of all inputs keyed by label such as:

```javascript
{'my checkbox': false, 'my range': 75}
```

#### `panel.get()`


## See also

* [prama](https://github.com/dfcreative/prama) — wrapper for super-control-panel, providing popup, button, state management etc.
* [control-panel](https://github.com/freeman-lab/control-panel) — original forked settings panel.
* [dat.gui](https://github.com/dataarts/dat.gui) — other oldschool settings panel.