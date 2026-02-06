# Panel Options

Minimal panel configuration. Most things have sensible defaults.

```js
const state = settings(controls, options?)
```

---

## Options

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `container` | `string \| Element` | `document.body` | Mount target |
| `title` | `string` | `'Settings'` | Panel header |
| `theme` | `string \| Theme` | `'auto'` | Visual style + mode |
| `position` | `string` | `'top-right'` | Anchor corner |
| `width` | `number \| string` | `280` | Panel width |
| `zIndex` | `number` | `1000` | Layer order |
| `collapsed` | `boolean \| Signal` | `false` | Start collapsed |
| `visible` | `boolean \| Signal` | `true` | Show/hide |
| `draggable` | `boolean` | `false` | Allow reposition |
| `persist` | `boolean \| string` | `false` | localStorage key |
| `animation` | `boolean \| 'reduced'` | `'auto'` | Motion preference |
| `keyboard` | `boolean` | `true` | Global shortcuts |
| `onChange` | `(state) => void` | — | Change callback |

**Position values:**
```
'top-left'    'top-right'
'bottom-left' 'bottom-right'
```

**Theme values:**
```js
theme: 'swiss'                          // string shorthand
theme: 'auto'                           // derive from page CSS

// With params (import required)
import swiss from 'settings-panel/theme/swiss'
theme: swiss({ density: 0.5 })
```

See [params.md](params.md) for theme parameters (density, contrast, etc.).

---

## Return Value

Returns reactive store. Read/write updates UI.

```js
const state = settings({ volume: 0.5 })
state.volume = 0.8  // UI updates
```

Signals for panel state:
```js
const collapsed = signal(false)
settings(controls, { collapsed })
collapsed.value = true  // panel collapses
```

---

## Full Example

```js
const state = settings({
  volume: 0.8,
  quality: ['low', 'medium', 'high'],
  advanced: {
    debug: false,
  },
}, {
  container: '#app',
  theme: 'auto',
  title: 'Settings',
  persist: 'my-app',
})

// state.volume, state.quality, state.advanced.debug are all reactive
state.volume = 0.5  // UI updates
```
