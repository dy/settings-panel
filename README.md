# settings-panel

Controls designed for purpose that _feel right_.

- **Data-first** — pass values, get a reactive panel. No boilerplate.
- **Domain knowledge** — log slider *is* logarithmic. Color picker *understands* perceptual space.
- **11 axes** — lightness, accent, contrast, spacing, size, roundness, depth, weight, texture, font, motion.
- **10 themes** — soft, swiss, classic, terminal, industrial, brutal, glass, neu, skeu, retro. Each with its own physics.

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
| `boolean` | `true`, `false` | Toggle switch |
| `number` | `123`, `0.5` | Linear/log scales, step, constraints |
| `text` | `'string'` | Single/multi-line |
| `color` | `'#hex'`, `'rgb()'` | Perceptual color spaces |
| `select` | `{ options: [] }` | Dropdown, buttons, radio |
| `slider` | `{ min, max }` | Continuous range |
| `button` | `() => {}` | Action trigger |
| `folder` | `'group.key'` dot-notation | Collapsible group |

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

| Theme | Soul |
|-------|------|
| `soft` | Gentle shadows, generous radius. The safe default. |
| `swiss` | No shadows. Typography carries all hierarchy. |
| `classic` | Serif. Rule lines. Print margins. Centuries of wisdom. |
| `terminal` | Monospace. Zero radius. Max density. Every pixel earns it. |
| `industrial` | Exposed structure. The label IS the decoration. |
| `brutal` | Hard offset shadows. Thick borders. No apology. |
| `glass` | Backdrop blur. Transparency. Thin light borders. |
| `neu` | Paired shadows. Same-color surface. Soft extrusion. |
| `skeu` | Real textures. Directional lighting. Physical affordances. |
| `retro` | Bevel borders. System colors. 1995. |

```js
import settings from 'settings-panel'
import soft from 'settings-panel/theme/soft'

settings(controls, {
  theme: soft({ lightness: 0.13, accent: '#8855cc', spacing: 0.3 })
})
```

[Theme axes](docs/axes.md): lightness, accent, contrast, spacing, size, roundness, depth, weight, texture, font, motion — each theme interprets through its own physics.


## [Options](docs/options.md)

```js
settings(controls, {
  container: '#app',
  title: 'Settings',
  theme: soft({ lightness: 0.13 }),
  collapsed: false,
  persist: 'my-app',
  key: 'h',
  onChange: (state) => console.log(state)
})
```

## [Signals](docs/signals.md)

State is signals store. Subscribe via `effect`, pass signals as values or themes, swap implementation via `use()`.

```js
import settings, { effect } from 'settings-panel'

const state = settings({ volume: 0.8 })

effect(() => audio.gain.value = state.volume)
```

```js
// Use @preact/signals instead of built-in
import { use } from 'settings-panel'
import * as signals from '@preact/signals'
use(signals)
```


## Alternatives

<sup>[tweakpane](https://github.com/cocopon/tweakpane) · [leva](https://github.com/pmndrs/leva) · [lil-gui](https://github.com/georgealways/lil-gui) · [dat.gui](https://github.com/dataarts/dat.gui)</sup>

<p align=center><a href="https://github.com/krsnzd/license/">ॐ</a></p>
