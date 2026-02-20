# Panel Options

```js
const state = settings(schema, options?)
```


## Options

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `container` | `string \| Element` | `document.body` | Mount target (selector or element) |
| `title` | `string` | `'Settings'` | Panel header text |
| `theme` | `string \| (state) → CSS \| false` | `base` | Visual style |
| `collapsed` | `boolean \| Signal` | `false` | Fold state |
| `persist` | `boolean \| string` | `false` | Save/restore values via localStorage |
| `key` | `string` | — | Keyboard shortcut to toggle panel |
| `onChange` | `(state) => void` | — | Called on any value change |


### `theme`

CSS injection for the panel. Applied before controls are created (so `getComputedStyle` works during init).

```js
// Built-in default theme
import base from 'settings-panel/theme/default'
theme: base()

// Static CSS string
theme: '.s-panel { background: #111; }'

// Reactive function: receives resolved state (with persisted values merged),
// re-called automatically on any state change.
// Panel manages the <style> element — no external style juggling needed.
import skeu from 'settings-panel/theme/skeu'
theme: (state) => skeu({ shade: state.shade, accent: state.accent })

// Disable — manage your own <style> externally
theme: false
```


### `collapsed`

When collapsed, only the title bar shows. Click header to expand.
Pass a signal for programmatic control — this is the universal
toggle mechanism for any interaction model.

```js
const open = signal(false)
settings(schema, { collapsed: open })

// Wire to anything:
button.onclick = () => open.value = !open.value  // button trigger
hotkey('h', () => open.value = !open.value)       // custom hotkey
open.value = false                                // programmatic
```


### `persist`

```js
persist: true          // key = 'settings-panel'
persist: 'my-app'      // custom key
```


### `key`

Keyboard shortcut to toggle collapsed state.

```js
key: 'h'               // press 'h' to toggle
key: 'ctrl+shift+s'    // modifier combo
```


### `onChange`

Called after any value changes. Receives the full state.

```js
onChange: (state) => console.log(state.volume)
```


## Return Value

**Pure values.** The returned state contains only schema values.
Read/write updates UI bidirectionally.

```js
const state = settings({ volume: 0.8, muted: false })

state.volume = 0.5        // UI updates
state.muted                // read current value
```

Cleanup via dispose:

```js
state[Symbol.dispose]()    // removes panel, styles, effects
```


## Interaction Models

The panel is a div with controls. How it appears is your choice.
`collapsed` signal is the universal mechanism.

| Model | How |
|-------|-----|
| **Always open** | Default. Mount into a positioned container. |
| **Hotkey toggle** | `key: 'h'` or wire `collapsed` signal to your own handler |
| **Button trigger** | Wire `collapsed` signal to a button click |
| **Sidebar** | Mount into a sidebar element |
| **Modal/overlay** | Mount into a modal, toggle `collapsed` |

Panel doesn't manage position or trigger chrome.
Mount it where you want, toggle it how you want.


## Full Example

```js
import settings from 'settings-panel'
import soft from 'settings-panel/theme/default'

const state = settings({
  volume: 0.8,
  quality: ['low', 'medium', 'high'],
  color: '#ff6600',
  advanced: { type: 'folder', label: 'Advanced' },
  'advanced.debug': false,
  'advanced.rate': { value: 1, min: 0, max: 10, step: 0.1 },
}, {
  title: 'Audio',
  theme: soft({ lightness: 0.13, accent: 210 }),
  persist: 'my-app',
  key: 'h',
  onChange: (s) => console.log(s.volume),
})

state.volume = 0.5  // UI updates
state.debug          // flat access (not state.advanced.debug)
```


## What's NOT an option (and why)

| Rejected | Why | How instead |
|----------|-----|-------------|
| `width` | CSS concern | Theme axis or container CSS |
| `zIndex` | CSS concern | Container CSS |
| `position` | CSS concern | Mount into a positioned container |
| `animation` | Theme concern | Theme handles it; respects `prefers-reduced-motion` |
| `visible` | Redundant | `collapsed` to fold, `dispose()` to remove, CSS to hide |
| `draggable` | Niche | Future concern, not core |
| `retheme()` | State = values only | Pass `theme: (state) => css` — reactive by design |
