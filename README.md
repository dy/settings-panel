# settings-panel

Simple settings panel for your app, demo or tests.

## Usage

[![npm install settings-panel](https://nodei.co/npm/settings-panel.png?mini=true)](https://npmjs.org/package/settings-panel/)

```javascript
var createPanel = require('settings-panel')

var panel = createPanel([
  {type: 'range', label: 'my range', min: 0, max: 100, value: 20},
  {type: 'range', label: 'log range', min: 0.1, max: 100, value: 20, scale: 'log'},
  {type: 'text', label: 'my text', value: 'my cool setting', help: 'why this is cool'},
  {type: 'checkbox', label: 'my checkbox', value: true},
  {type: 'color', label: 'my color', format: 'rgb', value: 'rgb(10,200,0)', input: value => console.log(value)},
  {type: 'button', label: 'gimme an alert', input: () => alert('hello!')},
  {type: 'select', label: 'select one', options: ['option 1', 'option 2'], value: 'option 1'}
],
  {
  	title: 'Settings',
  	theme: 'light'
  }
);
```

## API

#### `panel = control([field1, field2, ...], [opts])`

The first argument is a list of fields. Each one must have a `type`, `label` and `value` property with an initial value. Also it may have a `input` callback, which will be invoked if value changed. For example,

```javascript
{type: 'checkbox', name: 'My Checkbox', initial: true, change: function (value) {}}
```

Each `type` must be one of `range` • `interval` • `checkbox` • `color` • `select` • `switch` • `textarea` • `text` or any `<input>` type.

Each `label` must be unique.

Some types have additional properties:

- `range` can specify a `min`, `max`, and `step` (or integer `steps`). Scale can be either `'linear'` (default) or `'log'`. If a log scale, the sign of `min`, `max`, and `initial` must be the same and only `steps` is permitted (since the step size is not constant on a log scale).
- `interval` obey the same semantics as `range` inputs, except the input and ouput is a two-element array corresponding to the low/high bounds, e.g. `initial: [1, 7.5]`.
- `color` can specify a `format` as either `rgb` • `hex` • `array`
- `select` can specify a list of options, either as an `Array` (in which case the value is the same as the option text) or as an object containing key/value pairs (in which case the key/value pair maps to value value/label pairs).

The following optional parameters can also be passed as `opts`
- `container` element to which to append the panel
- `theme` can specify `light` • `dark` or provide an object (see [`themes.js`](themes.js) for format)
- `title` a title to add to the top of the panel

#### `panel.on('input', cb(data))`

This event is emitted every time any one of the inputs change. The callback argument `data` will contain the state of all inputs keyed by label such as:

```javascript
{'my checkbox': false, 'my range': 75}
```

#### `panel.get(name?)`

Get the value of a field defined by `name`. Or get full list of values, if `name` is undefined.

#### `panel.set(name, value|options)`

Update specific field, with value or field options. You can also pass an object or array to update multiple fields:

```js
panel.set({ 'my range': { min: -100, value: 200}, 'my color': '#fff' });
```


## See also

* [prama](https://github.com/dfcreative/prama) — wrapper for settings-panel, providing popup, button, state management etc.
* [control-panel](https://github.com/freeman-lab/control-panel) — original forked settings panel.
* [dat.gui](https://github.com/dataarts/dat.gui) — other oldschool settings panel.