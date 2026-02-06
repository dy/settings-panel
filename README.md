# settings-panel

Parameter controls that _feel right_.

- **Presentation-ready** — fits product style, not just debug UI.
- **Domain knowledge** — log slider *is* logarithmic. Color picker *understands* perceptual space.
- **Themes as philosophies** — swiss, analog, terminal, glass. Each with its own physics.
- **Zero dependencies** — vanilla JS, signals reactivity, framework-agnostic.

<!-- [demo](https://dy.github.io/settings-panel/) -->

```js
import settings from 'settings-panel'

const state = settings({
  enabled: true,
  volume: 0.8,
  color: '#4a90d9',
  quality: ['auto', 'low', 'high'],
  reset: () => location.reload()
})

state.volume = 0.5  // UI updates
```


## [Controls](docs/controls.md)

| Type | Inferred from | Domain knowledge |
|------|---------------|------------------|
| `boolean` | `true`, `false` | Toggle, checkbox, switch variants |
| `number` | `123`, `0.5` | Linear/log scales, step, constraints |
| `text` | `'string'` | Single/multi-line, validation |
| `color` | `'#hex'`, `'rgb()'` | Perceptual spaces, harmony |
| `select` | `{ options: [] }` | Dropdown, radio, segmented |
| `slider` | `{ min, max }` | Pointer lock, tactile feel |
| `button` | `() => {}` | Momentary, toggle, hold |
| `folder` | `{ controls }` | Collapsible grouping |

```js
settings({
  // Inferred
  debug: false,
  gain: 0.5,

  // Explicit
  frequency: { type: 'slider', min: 20, max: 20000, scale: 'log' },
  palette: { type: 'color', format: 'hsl' }
})
```


## [Themes](docs/themes.md)

| Theme | Philosophy |
|-------|-----------|
| `swiss` | Invisible design — grids, no shadows |
| `terminal` | Information density — monospace, 1px |
| `industrial` | Exposed honesty — visible structure |
| `analog` | Physical metaphors — realistic shadows |
| `glass` | Layered blur — transparency, thin borders |
| `neo` | Raw boldness — hard shadows, thick borders |

```js
import settings from 'settings-panel'
import swiss from 'settings-panel/theme/swiss'

settings(controls, {
  theme: swiss({ palette: 'dark', density: 0.7 })
})
```

[Theme params](docs/params.md): `palette`, `mood`, `density`, `contrast`, `roundness` — each theme interprets through its own physics.


## [Options](docs/options.md)

```js
settings(controls, {
  container: document.body,
  title: 'Settings',
  theme: 'swiss',
  position: 'top-right',
  collapsed: false,
  draggable: true,
  persist: 'my-app',
  onchange: (state) => console.log(state)
})
```

### Subscribing to changes

```js
import settings, { effect } from 'settings-panel'

const state = settings({ volume: 0.5 })

// Option 1: callback (fires on any change)
settings({ volume: 0.5 }, {
  onchange: (state) => console.log(state.volume)
})

// Option 2: effect (signal-native, track specific keys)
effect(() => {
  console.log('volume changed:', state.volume)
})
```


## See also

[tweakpane](https://github.com/cocopon/tweakpane) · [leva](https://github.com/pmndrs/leva) · [lil-gui](https://github.com/georgealways/lil-gui) · [dat.gui](https://github.com/dataarts/dat.gui)

<p align=center><a href="https://github.com/krsnzd/license/">ॐ</a></p>
