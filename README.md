# settings-panel [![unstable](https://img.shields.io/badge/stability-unstable-green.svg)](http://github.com/badges/stability-badges)

Turn an object into UI.

<!-- TODO: really simple tiny cute image here -->
[![settings-panel](https://raw.githubusercontent.com/dfcreative/settings-panel/gh-pages/images/preview.png "settings-panel")](http://dfcreative.github.io/settings-panel/)

_typer_ theme, for other themes see [demo](http://dfcreative.github.io/settings-panel/).

## Usage

[![npm install settings-panel](https://nodei.co/npm/settings-panel.png?mini=true)](https://npmjs.org/package/settings-panel/)

```js
let createSettings = require('settings-panel')

let panel = createSettings({
  number: 97,
  interval: [0, 100],
  checkbox: false,
  text: 'Hello world',
  color: '#aabbcc',
  toggle: ['A', 'B', 'C']
})

// update values
panel.number = 100
panel.interval = [10, 90]
panel.toggle = ['B', 'C']

// read values
panel.number // 100
panel.toggle // ['B', 'C']
```

### values = createSettings(values, options?)

Create panel from an object with values. Returns an object with the same values bound to UI − changing its properties updates UI and vice versa. That object can be used as options for other components.

#### `fields`

```js
// can be an object with values
settings = createSettings({
  value: 1,
  center: [2, 3],
  inversed: true,
  ...
})

// an array of fields
settings = createSettings([
  {id: 'fieldA', type: 'checkbox', value: true, ...},
  {id: 'fieldB', type: 'number', value: 50, ...},
  ...
])

// or dict of fields
settings = createSettings({
  fieldA: {
    order: 0,
    type: 'checkbox',
    label: 'My Checkbox',
    value: true
  },
  fieldB: {
    order: 1,
    type: 'number',
    ...
  },
  ...
})
```

Field descriptor may define:

Property | Default | Meaning
---|---|---
`id` | dashcased `label` | Property key.
`value` | `null` | Property value.
`type` | detected from `value` | Property control type, one of the table below or any `<input>` type.
`order` | incremental | Position of the control in panel.
`label` | camelcased `id` | Label for the control. `false` disables label.
`title` | `label` | Tooltip text.
`hidden` | `false` | Hides control from panel.
`disabled` | `false` | Disables control interactivity.
`width` | `'100%'` | [A ratio](https://npmjs.org/package/parse-fraction) (`'half'`, `'third'`), css width string or a number of pixels.
`change` | `() => {}` | Invoked when field value changes. If throws an error, the field validation tooltip is shown.

<!--
Field type specific properties:

Property | Default | Meaning
`min`, `max` | `0..100` | Numeric controls range.
`step`, `steps` | `1` | Numeric control step or stops.
`multi` | detected from `value` | Makes range an interval and select a multiselect.
`format` | `'hex'` | Defines color field format
`options` | `[]` | Choice control options, either an array `['Label1', 'Label2', ...]` or an object `{Label1: value1, Label2: value2}`.
`placeholder` | `null` | Textual controls placeholder.
-->

---

#### `options`

Adjusts appearance of the panel:

```js
createSettings(fields, {
  position: 'left',
  theme: require('settings-panel/theme/flat'),
  colors: ['black', 'white']
})
```

Option | Default | Meaning
---|---|---
`container` | `document.body` | The container element or selector.
`position` | `'top-right'` | One of `top-left`, `top`, `top-right`, `right`, `bottom-right`, `bottom`, `bottom-left`, `left`, `center` or array with top-left corner coordinates `[x, y]`.
`theme` | `'flat'` | One of `control`, `dat`, `dragon`, `flat`, `typer`. See [`all themes`](https://github.com/dfcreative/settings-panel/tree/master/theme).
`colors` | `['black', 'white']` | Theme palette.
`background` | theme default | Panel background color.
`className` | `settings-panel` | Class name to add to list of classes

---

#### `onchange`

Fired every time any value changes:

```js
let settings = createSettings({
  cancel: {label: 'Cancel', type: 'button', input: e => alert('cancel')},
  ok: {label: 'Ok', type: 'button', input: e => alert('ok')}
}, e => {
  console.log(e)
})

// read values
let [from, to] = settings.interval

// write values
settings.range = 50
Object.assign(settings, {color: '#aabbcc', textarea: 'Lorem Ipsum'})

// use as options for other components
myComponent.update(settings)

options.c = false // GUI is updated here
```

---

### settings.get(id)

Get field descriptor.

### settings.set(id, descriptor)

Update field descriptor.

### settings.add(field)

Add field.

### settings.delete(id)

Remove field.


## Controls

```js
let settings = createSettings({
  switch: { order: 0, label: 'Switch', type: 'switch', value: 'One', options: ['One', 'Two', 'Three']},
  range: { order: 0, label: 'Range', value: 97},
  interval: { order: 1, label: 'Interval', type: 'range', multiple: true, value: [33, 77]},
  checkbox: { order: 2, label: 'Checkbox group', type: 'checkbox', value: ['b', 'c'],
    options: {a: 'Option A', b: 'Option B', c: 'Option C'}
  },
  text: { order: 3, label: 'Text', value: 'my setting'},
  color: { order: 4, label: 'Color', value: 'rgb(100, 200, 100)'},
  select: { order: 5, label: 'Select', value: 'State One', options: ['State One', 'State Two', 'State Three']},
  textarea: { order: 6, label: 'Textarea', type: 'textarea', placeholder: 'long text...'},
  cancel: {label: 'Cancel', type: 'button', input: e => alert('cancel')},
  ok: {label: 'Ok', type: 'button', input: e => alert('ok')}
})
```

## Themes

```js
```

[Image here]

<!--
`title`, `header` |
`range`, `interval` |
`checkbox` |
`color` |
`select` |
`switch` |
`textarea` |
`text` |
`number` | -->
<!-- `canvas` | -->
<!-- `pad` | -->
<!-- `angle` | -->
<!-- `toggle` | -->
<!-- `gradient` | -->
<!-- `palette` | -->
<!-- `taglist` | -->
<!-- `file` | -->
<!-- `date` | -->
<!-- `time` | -->
<!-- `vec2`, `vec3`, `vec4` | -->
<!-- `volume` | -->
<!-- `log` | Logs output -->
<!-- `unit` | -->
<!-- `font` | -->
<!-- `ratio` | -->
<!-- `mic` | -->




## Analogs

* [control-panel](https://github.com/freeman-lab/control-panel) — original forked settings panel.
* [oui](https://github.com/wearekuva/oui) — sci-ish panel.
* [dat.gui](https://github.com/dataarts/dat.gui) — other oldschool settings panel.
* [quicksettings](https://github.com/bit101/quicksettings) — an alternative versatile settings panel.
* [dis-gui](https://github.com/wwwtyro/dis-gui) — remake on dat.gui.
* [virtual-form](https://github.com/yoshuawuyts/virtual-form) − virtual dom form creator.

## License

(c) 2017 Dmitry Yv. MIT License

