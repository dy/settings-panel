# settings-panel [![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

Simple settings panel for your app, demo or tests.

[![settings-panel](https://raw.githubusercontent.com/dfcreative/settings-panel/gh-pages/images/preview.png "settings-panel")](http://dfcreative.github.io/settings-panel/)

In the preview there is a _typer_ theme, for other themes or customizations see [demo](http://dfcreative.github.io/settings-panel/).

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
    title: 'Settings'
  }
);
```

[**Run this in requirebin**](http://requirebin.com/?gist=21fc39f7f206ca50a4d5cd7298f8b9f8)

## let settings = require('settings-panel')(fields, options?)

Create a settings object and it's GUI panel based on list of fields and adjusted by options. The first argument is a list or object with name/descriptor pairs.

For example,

```javascript
//array
let settings = createPanel([
  {id: 'fieldA', type: 'checkbox', ...},
  {id: 'fieldB', type: 'number', ...},
  ...
])

//object
let settings = createPanel({
  fieldA: {
    type: 'checkbox',
    order: 0,
    label: 'My Checkbox',
    value: true,
    change: value => {}
  },
  fieldB: {
    order: 1,
    type: 'number',
    ...
  },
  ...
})

settings.fieldA // true
settings.fieldA = false // GUI is updated
```

### field properties

Property | Meaning
---|---
`id` | Used as key to identify the field. If undefined, the label will be used instead.
`value` | Initial value of the field.
`default` | Explicitly defines default value, if differs from the initial value.
`type` | One of `range`, `interval`, `checkbox`, `color`, `select`, `switch`, `raw`, `textarea`, `text` or any `<input>` type, see table below. If undefined, type will be guessed from the value.
`order` | Will specify position of the field in panel, lower values go first.
`label` | Label for the input. If label is `false`, no label will be displayed.
`title` | Display text in field tooltip.
`hidden` | Hides field visually, but preserves its value.
`disabled` | Disables the input, making it inactive. It is still visible.
`change` | Invoked each time the field value changed, whether through `input` or API.
`min`, `max`, `step[s]` | `'range'` or `'number'` limits.
`scale` | `linear` or `log`
`options` | `select`, `switch` and `checkbox` can specify `options`, either as an `Array` (in which case the value is the same as the option text) or as an object with key/value pairs mapping to value value/label pairs.
`placeholder` | Used for `text` and `textarea` fields.
`content` | Defines raw content of an element
`help` |
`readonly` |
<!-- `before`, `after` | Define an html to display before or after the element, can be a string, an element or a function returning one of the two. That may come handy in displaying help, info or validation messages, separators, additional buttons, range limits etc - anything related to the element. -->
<!-- `input` | callback, invoked if value changed. -->
<!-- `init` | invoked once component is set up. -->
<!-- `orientation` | Defines position of a label relative to the input, one of `top`, `left`, `right`, `bottom`. Redefines `options.orientation`. -->
<!-- `style` | appends additinal style to the field, can be a css object or css string. -->

### types

Type | Meaning
---|---
`range` |
`interval` |
`checkbox` |
`color` |
`select` |
`switch` |
`textarea` |
`text` |
`number` |
<!-- `pad` | -->
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


### options

Specify appearance of the panel. For example

```js
let settings = createPanel(fields, {
  container: document.body,
  title: 'Settings',
  position: 'left',
  collapsible: false,
  theme: 'flat',
  palette: ['black', 'white']
})
```

Option | Default | Meaning
---|---|---
`title` | `'Settings'` | Title at the top.
`container` | `document.body` | Element or selector to place panel into.
`position` | `'top-right'` | One of `top-left`, `top`, `top-right`, `right`, `bottom-right`, `bottom`, `bottom-left`, `left`, `center`.
`theme` | `'flat'` | One of `control`, `dat`, `dragon`, `flat`, `typer`. See [`theme`](https://github.com/dfcreative/settings-panel/tree/master/theme) folder for full list of available themes. You can create own theme by providing a function returning a string with css rules.
`palette`, `colors` | `['black', 'white']` | Colors for the theme.
`background` | `` | Background color, separate from `palette`.
`collapsed` | `false` | Collapse to options sign.
`font` | `13` | Customize font/font-size.
`change` | `` | The callback is invoked every time settings changed.
<!-- `labelWidth` | `'9em'` | -->
<!-- `inputHeight` | `'1.6em'` | -->
<!-- `fontFamily` | `'sans-serif'` | -->
<!-- `css` | `''` | additional css, aside from the theme’s one. Useful for custom styling -->
<!-- `className` | `'` | appends additional className to the panel element. -->
})

## See also

> [control-panel](https://github.com/freeman-lab/control-panel) — original forked settings panel.<br/>
> [oui](https://github.com/wearekuva/oui) — sci-ish panel.<br/>
> [dat.gui](https://github.com/dataarts/dat.gui) — other oldschool settings panel.<br/>
> [quicksettings](https://github.com/bit101/quicksettings) — an alternative versatile settings panel.<br/>
> [dis-gui](https://github.com/wwwtyro/dis-gui) — remake on dat.gui.<br/>
