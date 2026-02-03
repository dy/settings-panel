# settings-panel [![unstable](https://img.shields.io/badge/stability-unstable-green.svg)](http://github.com/badges/stability-badges)

Easy settings for an app, prototype, demo or tests.

<!-- TODO: really simple tiny cute image here -->
[![settings-panel](https://raw.githubusercontent.com/dfcreative/settings-panel/gh-pages/images/preview.png "settings-panel")](http://dfcreative.github.io/settings-panel/)

_typer_ theme, for other themes see [demo](http://dfcreative.github.io/settings-panel/).


## Usage

Pass initial values to `settings` function, it will display panel with controls and return live state:

```js
import settings from 'settings-panel'

let state = settings({
  // primitive (auto-inferred control)
  enabled: false, // checkbox
  count: 123, // spinner
  name: 'Hello world', // text
  bg: '#aabbcc', // color picker
  position: [0, 0], // XY pad
  mode: { value: 'a', options: ['b', 'c'] }, // select
  reset: () => console.log('Reset'), // button
}, {
  ...options
})

// read
state.enabled // false
state.mode // 'a'

// update
state.count++
state.position = [ 1, -1 ]
```

Values can be either _primitives_, _descriptors_ or _controls_.

### Primitives

Control for a primitive is auto-inferred from value:

```js
false             // checkbox

42                // number
0.5               // slider (if range 0-1)

"text"            // text
"long text\n..."  // textarea
"#ff0000"       // color picker
"rgb(...)"        // color picker
"2024-03-15"      // date picker
"14:30"           // time picker
"https://..."     // url
"user@mail.com"   // email
"100px"           // length
"45deg"           // angle
"2s"              // duration
"const x = 1"     // code editor
'{"a":1}'         // json editor

[1, 2]            // xy pad
[1, 2, 3]         // vec3
[x, y, z, w]      // vec4
[[1,2],[3,4]]     // matrix
['a', 'b', 'c']   // tag input

{value, min, max} // range
{value, options}  // select
{...nested}       // group

() => {}          // button

File object       // file input

new Date()        // dateTime Picker

null/undefined    // optional/empty state
```

### Descriptor

Descriptor object:

Property | Default | Meaning
---|---|---
`value` | `null` | Property value.
`label` | `id` | Label for the control.
`title` | `label` | Tooltip text.
`hidden` | `false` | Hides control from panel.
`disabled` | `false` | Disables control interactivity.
`copy` | `false` | Display copy button

Control-specific properties:

Property | Default | Meaning
---|---|---
`min`, `max` | `0..100` | Numeric controls range.
`step`, `steps` | `1` | Numeric control step or stops.
`multi` | detected from `value` | Multiselect.
`format` | `'hex'` | Defines color format
`options` | `[]` | Choice options, either an array `['value1', 'value2', ...]` or an object `{label1: value1, label2: value2}`.
`placeholder` | `null` | Textual controls placeholder.

### Controls

Specific controls define how value is being presented. Same primitive can have different control.

#### `text`
#### `textarea`
#### `password`
#### `pin`
#### `slider`
#### `range`
#### `number`
#### `color`
#### `swatches`
#### `gradient`
#### `font`
#### `checkbox`
#### `toggle`
#### `switch`
#### `select`
#### `radio`
#### `date`
#### `time`
#### `interval`
#### `vec2`
#### `vec3`
#### `vec4`
#### `graph`
#### `folder`
#### `button`
#### `button group`
#### `sampler`
#### `tab`
#### `separator`
#### `file`
#### `bitmap`
  + drag-drop
#### `brush`
#### `image`
#### `audio`
#### `media`
#### `fps`
#### `wave`
#### `spectrum`
#### `curve`
https://leva.pmnd.rs/?path=/story/plugins-bezier--default-bezier
#### `wheel`
#### `knob`
#### `joystick`
#### `pad`
#### `plot`
#### `matrix`
#### `histogram`
#### `eq`
#### `spring`
#### `path`
#### `info`
#### `piano`
#### `playback`
#### `list`
#### `key-value`
#### `code` (json/etc)
#### `shader`


---

#### `options`

Adjusts look of the panel:

```js
settings(fields, {
  container: document.body,
  collapsed: false,
  fill: true, // take all horizontal space
  drag: true,
  title: ''//
  filter: true,
  position: 'top-right', // t, tr, r, br, b, bl, l, tl
  colors: ['black', 'white'],
  persist: true,
  theme: 'default',
  onchange: () => {...}
})
```

Option | Default | Meaning
---|---|---
`container` | `document.body` | The container element or selector.
`align` | `'top-right'` | One of `top-left`, `top`, `top-right`, `right`, `bottom-right`, `bottom`, `bottom-left`, `left`, `center` or array with top-left corner coordinates `[x, y]`.
`colors` | `['black', 'white']` | Theme palette.
`background` | theme default | Panel background color.
`className` | `settings-panel` | Class name to add to list of classes.

Rest of the options are passed to `theme`.


---

### `effect(() => {})`

Fired every time any value changes:

```js
let settings = createSettings({
  cancel: {label: 'Cancel', type: 'button', input: e => alert('cancel')},
  ok: {label: 'Ok', type: 'button', input: e => alert('ok')}
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


## Controls

```js
let settings = createSettings({
  switch: { label: 'Switch', type: 'switch', value: 'One', options: ['One', 'Two', 'Three']},
  range: { label: 'Range', value: 97},
  interval: { label: 'Interval', type: 'range', multiple: true, value: [33, 77]},
  checkbox: { label: 'Checkbox group', type: 'checkbox', value: ['b', 'c'],
    options: {a: 'Option A', b: 'Option B', c: 'Option C'}
  },
  text: { label: 'Text', value: 'my setting'},
  color: { label: 'Color', value: 'rgb(100, 200, 100)'},
  select: { label: 'Select', value: 'State One', options: ['State One', 'State Two', 'State Three']},
  textarea: { label: 'Textarea', type: 'textarea', placeholder: 'long text...'},
  cancel: {label: 'Cancel', type: 'button', input: e => alert('cancel')},
  ok: {label: 'Ok', type: 'button', input: e => alert('ok')}
})
```

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


### Themes

To enable specific panel theme, use `import theme from 'settings-panel/theme/<theme>')`.
You can write your own theme by looking at the example of one of the themes.


## Alternatives

* [tweakpane](https://github.com/cocopon/tweakpane)
* [leva](https://github.com/pmndrs/leva)
* [uil](https://github.com/lo-th/uil)
* [control-kit](https://github.com/automat/controlkit.js/)
* [lil-gui](https://github.com/georgealways/lil-gui)
* [control-panel](https://github.com/freeman-lab/control-panel)
* [oui](https://github.com/wearekuva/oui)
* [dat.gui](https://github.com/dataarts/dat.gui)
* [quicksettings](https://github.com/Iced-Tea/quicksettings)
* [dis-gui](https://github.com/wwwtyro/dis-gui)
* [virtual-form](https://github.com/yoshuawuyts/virtual-form)

## License

© 2025 Dmitry Iv. MIT License
