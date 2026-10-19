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

The [theme gallery](index.html) compares identical specimens. Its Look bar (light,
accent, density, corners, scale, body font) restyles every theme at once, starting
from each theme's native look; Theme controls tune the selected theme's own axes.
Use theme exports the current JavaScript or CSS; the link button shares its axes.
Every theme supports size, density, and body-font tuning through
[shared dimensional tokens](docs/axes.md#shared-dimensional-tokens). The
[DevTools case](demo/cases/devtools.html) presents editable, syntax-colored declarations.
The original editor is available in the [playground](demo/playground.html).

Sixteen original themes, all functions: `theme(axes?) → CSS string`. The gallery also ships eleven faithful reproductions of classic panels (dat.gui, Tweakpane, Leva, DialKit, ControlKit, UIL, OUI, Dear ImGui, Figma, Apple, DevTools).

| Import | Name | Character |
|--------|------|-----------|
| `settings-panel/theme/default` | **soft** | Capsules seated in soft grooves, one material. The mainstream baseline. |
| `settings-panel/theme/swiss` | **swiss** | No shadows, grid-pure, typographic hierarchy. |
| `settings-panel/theme/editorial` | **editorial** | A reader's settings sheet: ink frame, rules under the values, typographic choices. |
| `settings-panel/theme/studio` | **studio** | The row is the instrument: labels ride the slider fill, values edit in place. |
| `settings-panel/theme/skeu` | **skeu** | Keycaps with a lip and a rim, engraved wells. |
| `settings-panel/theme/brutal` | **brutal** | Hard offset shadows, thick borders, zero radius. |
| `settings-panel/theme/terminal` | **terminal** | Monospace on a character-cell grid, inverse video, no depth. |
| `settings-panel/theme/neu` | **neu** | One material, raised and pressed by light from above. |
| `settings-panel/theme/porcelain` | **porcelain** | Glazed ceramic face, mineral rim, embossed relief. |
| `settings-panel/theme/glass` | **glass** | A liquid-glass pane; controls are lenses with a rim and a caustic. |
| `settings-panel/theme/lab01` | **lab01** | Frosted glass with gradient borders, noise texture. |
| `settings-panel/theme/synth` | **synth** | Each group in its own colour on white cards, hairline tracks and ring thumbs (after Ableton Learning Synths). |
| `settings-panel/theme/retro` | **retro** | Raised and sunken bevels in border colour, system grey, pixel type (after Windows 98). |
| `settings-panel/theme/bitmap` | **bitmap** | Two inks, greys only as dither, state by inversion (after the 1-bit Macintosh). |
| `settings-panel/theme/industrial` | **industrial** | A chassis of modules: printed labels, white keys, faders, encoders, LEDs, a black screen (after Teenage Engineering). |
| `settings-panel/theme/control-panel` | **control-panel** | freeman-lab/control-panel reproduction. |

```js
import settings from 'settings-panel'
import skeu from 'settings-panel/theme/skeu'

settings(schema, {
  theme: skeu({ shade: '#1a1a1a', accent: '#8855cc', spacing: 0.3 })
})
```

Themes are functions: axes in, CSS out. Core axes: `shade`, `accent`, `spacing`, `size`, `weight`, `roundness`. Some themes add extras: `skeu`/`brutal` add `bevel`; `neu` adds depth, diffusion, lighting contrast/direction, and texture strength; `neu`, `soft` and `skeu` take a palette's `ink` and `texture` (`glass` takes `ink`); `porcelain` adds a ceramic lip and embossed relief; `glass` adds `blur` and `tint`; `terminal` adds `leading`; `swiss` adds `hairline` and `scale`; `editorial` adds `rule`. See [axes](docs/axes.md).


## [Options](docs/options.md)

```js
settings(schema, {
  container: '#app',
  title: 'My Panel',
  theme: skeu({ shade: '#2a2a2a' }),
  collapsed: false,
  persist: 'my-app',
  key: 'h',
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


## Fonts

Themes that reproduce a pixel typeface embed a freely licensed copy: **retro** the "MS Sans Serif"
FontStructions by lou ([CC BY-SA 3.0](https://fontstruct.com/fontstructions/show/1384746)), **bitmap**
ChiKareGo2 and FindersKeepers by Giles Booth ([CC BY](https://www.pentacom.jp/pentacom/bitfontmaker2/gallery/?id=3780)),
**imgui** ProggyClean by Tristan Grimmer ([MIT](https://github.com/bluescan/proggyfonts)). **synth** expects
[Outfit](https://fonts.google.com/specimen/Outfit) (SIL OFL) from the host page.

## Alternatives

<sup>[tweakpane](https://github.com/cocopon/tweakpane) · [leva](https://github.com/pmndrs/leva) · [dialkit](https://github.com/joshpuckett/dialkit) · [lil-gui](https://github.com/georgealways/lil-gui) · [uil](https://github.com/lo-th/uil) · [dat.gui](https://github.com/dataarts/dat.gui) · [control-panel](https://github.com/freeman-lab/control-panel) · [oui](https://github.com/wearekuva/oui)</sup>

<p align=center><a href="https://github.com/krsnzd/license/">ॐ</a></p>
