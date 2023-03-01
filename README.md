# settings-panel [![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

Simple settings panel for your app, demo or tests.

[![settings-panel](https://raw.githubusercontent.com/dfcreative/settings-panel/gh-pages/images/preview.png "settings-panel")](http://dy.github.io/settings-panel/)

In the preview there is a _typer_ theme, for other themes or customizations see [demo](http://dy.github.io/settings-panel/).

## Usage

[![npm install settings-panel](https://nodei.co/npm/settings-panel.png?mini=true)](https://npmjs.org/package/settings-panel/)

```javascript
var createPanel = require('settings-panel')

var panel = createPanel([
  {type: 'range', label: 'my range', min: 0, max: 100, value: 20},
  {type: 'range', label: 'log range', min: 0.1, max: 100, value: 20, scale: 'log'},
  {type: 'text', label: 'my text', value: 'my cool setting', help: 'why this is cool'},
  {type: 'checkbox', label: 'my checkbox', value: true},
  {type: 'color', label: 'my color', format: 'rgb', value: 'rgb(10,200,0)', change: value => console.log(value)},
  {type: 'button', label: 'gimme an alert', change: () => alert('hello!')},
  {type: 'select', label: 'select one', options: ['option 1', 'option 2'], value: 'option 1'}
],
  {
    title: 'Settings',
    style: 'position: absolute; right: 0; z-index: 1'
  }
);
```

[**Run this in requirebin**](http://requirebin.com/?gist=21fc39f7f206ca50a4d5cd7298f8b9f8)

## API

`const Panel = require('settings-panel')`
<details><summary>**`let panel = new Panel(fields, options?)`**</summary>

The first argument is a list of fields or object with id/field pairs. Each field may have following properties:

* `type` one of `range` • `interval` • `checkbox` • `color` • `select` • `switch` • `raw` • `textarea` • `text` or any `<input>` type. If undefined, type will be detected from the value.
* `id` used as key to identify the field. If undefined, the label will be used instead.
* `label` label for the input. If label is false, it will be hidden.
* `value` current value of the field.
* `default` explicitly defines default value, if differs from the initial value.
* `orientation` defines position of a label relative to the input, one of `top`, `left`, `right`, `bottom`. Redefines `options.orientation`.
* `style` appends additinal style to the field, can be a css object or css string.
* `hidden` defines whether field should be visually hidden, but present as a value.
* `disabled` just disables the input, making it inactive.
* `input` callback, invoked if value changed.
* `init` invoked once component is set up.
* `change` invoked each time the field value changed, whether through `input` or API.
* `before` and `after` define an html to display before or after the element, can be a string, an element or a function returning one of the two. That may come handy in displaying help, info or validation messages, separators, additional buttons, range limits etc - anything related to the element.
* `title` will display text in tooltip.

For example,

```javascript
{type: 'checkbox', label: 'My Checkbox', value: true, input: value => {}}
```

Some types have additional properties:

- `range` can specify a `min`, `max`, and `step` (or integer `steps`). Scale can be either `'linear'` (default) or `'log'`. If a log scale, the sign of `min`, `max`, and `value` must be the same and only `steps` is permitted (since the step size is not constant on a log scale). It also takes `precision` optional parameter for the displayed value.
- `interval` obeys the same semantics as `range` inputs, except the input and ouput is a two-element array corresponding to the low/high bounds, e.g. `value: [1, 7.5]`.
- `color` can specify a `format` as either `rgb` • `hex` • `array`
- `select`, `switch` and `checkbox` can specify `options`, either as an `Array` (in which case the value is the same as the option text) or as an object containing key/value pairs (in which case the key/value pair maps to value value/label pairs).
- `text` and `textarea` can specify `placeholder`.
- `raw` can define `content` method, returning HTML string, element or documentFragment.

#### options

```js
// element to which to append the panel
container: document.body,

// a title to add to the top of the panel
title: 'Settings',

// specifies label position relative to the input: `top` • `left` • `bottom` • `right`
orientation: 'left',

// collapse by clicking on title
collapsible: false,

// use a theme, see `theme` folder.
// available themes: typer, flat, control, dragon
theme: require('settings-panel/theme/none'),

//theme customization, can redefine theme defaults
palette: ['black', 'white'],
labelWidth: '9em',
inputHeight: '1.6em',
fontFamily: 'sans-serif',
fontSize: 13,

//additional css, aside from the theme’s one. Useful for custom styling
css: '',

//appends additional className to the panel element.
className: ''
```

</details>
<details><summary>**`panel.on(event, callback)`**</summary>

Attach callback to `change`, `input` or `init` event.

The callback will recieve `name`, `data` and `state` arguments:

```javascript
panel.on('change', (name, value, state) => {
  // name === 'my checkbox'
  // value === false
  // state === {'my checkbox': false, 'my range': 75, ...}
});
```

</details>
<details><summary>**`panel.get(name?)`**</summary>

Get the value of a field defined by `name`. Or get full list of values, if `name` is undefined.

</details>
<details><summary>**`panel.set(name, value|options)`**</summary>

Update specific field, with value or field options. You can also pass an object or array to update multiple fields:

```js
panel.set({ 'my range': { min: -100, value: 200}, 'my color': '#fff' });
```

</details>
<details><summary>**`panel.update(options?)`**</summary>

Rerender panel with new options. Options may include values for the theme, like `palette`, `fontSize`, `fontFamily`, `labelWidth`, `padding` etc, see specific theme file for possible options.

</details>

## Spotted in the wild

> [plot-grid](https://dy.github.io/plot-grid)<br/>
> [app-audio](https://dy.github.io/app-audio)<br/>
> [gl-waveform](https://dy.github.io/gl-waveform)<br/>

## See also

> [control-panel](https://github.com/freeman-lab/control-panel) — original forked settings panel.<br/>
> [oui](https://github.com/wearekuva/oui) — sci-ish panel.<br/>
> [dat.gui](https://github.com/dataarts/dat.gui) — other oldschool settings panel.<br/>
> [quicksettings](https://github.com/bit101/quicksettings) — an alternative versatile settings panel.<br/>
> [dis-gui](https://github.com/wwwtyro/dis-gui) — remake on dat.gui.<br/>
