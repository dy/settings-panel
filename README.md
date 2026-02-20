# settings-panel

Settings panel for tweaking apps, demos or tests. Pass values, get controls.

[![preview](preview.png)](https://dy.github.io/settings-panel/)

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

Types are inferred from values.

| Type | Inferred from |
|------|---------------|
| `boolean` | `true`, `false` |
| `number` | `123` |
| `slider` | `0.5` (normalized 0-1), or `{ min, max }` |
| `text` | `'hello'` |
| `textarea` | `'line one\nline two'` (multiline) |
| `color` | `'#hex'`, `'rgb()'`, `'hsl()'` |
| `select` | `['a', 'b', 'c']` or `{ options: [] }` |
| `button` | `() => {}` |
| `folder` | `'group.key'` dot-notation |

```js
settings({
  // Inferred
  debug: false,
  gain: 0.5,

  // Explicit
  frequency: { type: 'slider', min: 20, max: 20000, scale: 'log' },
  palette: { type: 'color', variant: 'swatches' }
})
```


## Themes

Two themes today: `default` (browser baseline) and `skeu` (tactile, textured).

```js
import settings from 'settings-panel'
import skeu from 'settings-panel/theme/skeu'

settings(schema, {
  theme: skeu({ shade: '#1a1a1a', accent: '#8855cc', spacing: 0.3 })
})
```

Themes are functions: axes in, CSS out. Default axes: shade, accent, spacing, size, weight, roundness. Skeu adds: contrast, depth, relief, bevel, grid. See [axes](docs/axes.md).


## [Options](docs/options.md)

```js
settings(schema, {
  container: '#app',
  title: 'Settings',
  theme: skeu({ shade: '#2a2a2a' }),
  collapsed: false,
  persist: 'my-app',
  onChange: (state) => console.log(state)
})
```

## [Signals](docs/signals.md)

State is a signals store. Subscribe via `effect`, swap signal implementation via `use()`.

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

<sup>[tweakpane](https://github.com/cocopon/tweakpane) · [leva](https://github.com/pmndrs/leva) · [lil-gui](https://github.com/georgealways/lil-gui) · [uil](https://github.com/lo-th/uil) · [dat.gui](https://github.com/dataarts/dat.gui) · [control-panel](https://github.com/freeman-lab/control-panel) · [oui](https://github.com/wearekuva/oui)</sup>

<p align=center><a href="https://github.com/krsnzd/license/">ॐ</a></p>
