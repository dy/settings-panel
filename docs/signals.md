# Signals

State is signals. Controls decorate signals with UI. Everything composes.

```js
import settings, { signal, effect } from 'settings-panel'

const state = settings({ volume: 0.8 })

state.volume = 0.5  // UI updates

effect(() => {
  audio.gain.value = state.volume  // subscribes to changes
})
```

---

## Core

Re-exported from main entry. Preact-signals compatible API.

```js
import { signal, effect, computed, batch, untracked, use } from 'settings-panel'
```

| | |
|---|---|
| `signal(value)` | Reactive value. Read/write via `.value`. |
| `effect(fn)` | Runs `fn` when read signals change. Returns dispose. |
| `computed(fn)` | Derived read-only signal. Lazy, cached. |
| `batch(fn)` | Group writes — effects fire once at end. |
| `untracked(fn)` | Read without subscribing. |
| `use({ signal, effect, computed, batch })` | Swap signal implementation. Call before `settings()`. |

---

## Decorators

Signal → signal transforms. Each takes a signal, returns a signal with added behavior.

```js
import { from, persist, throttle, map, media } from 'settings-panel/signals'
```

**Adapt**

| | |
|---|---|
| `from(source)` | Normalize to signal. Accepts: `.value` (preact), `[get, set]` (solid), `.get/.set` (TC39), plain value. |
| `readonly(sig)` | Read-only view. `.value` reads, no writes. |
| `peek(sig)` | Read value without tracking. |
| `map(sig, fn)` | Derived signal via transform function. |

**Storage**

| | |
|---|---|
| `persist(sig, key)` | Sync to `localStorage`. Restores on create, saves on change. |

**Time**

| | |
|---|---|
| `throttle(sig, ms)` | Rate-limit updates. First passes immediately, rest throttled. |
| `debounce(sig, ms)` | Delay until quiet. Resets timer on each write. |
| `delay(sig, ms)` | Delay every update by `ms`. |
| `interval(ms)` | Counter incrementing every `ms`. |
| `countdown(n, ms)` | Counts down from `n` to 0. |
| `raf(fn?)` | Animation frame timestamp signal. |

**Browser**

| | |
|---|---|
| `media(query)` | `matchMedia` as signal. `media('(prefers-color-scheme: dark)')` |
| `online()` | `navigator.onLine` as signal. |
| `visibility()` | `document.visibilityState` as signal. |
| `idle(ms)` | `true` after `ms` of inactivity. |

**DOM**

| | |
|---|---|
| `intersect(el, opts?)` | Intersection ratio (0–1) as signal. |
| `visible(el, opts?)` | Boolean visibility as signal. |

All decorators with resources implement `Symbol.dispose`.

---

## Passing signals

Pass a signal as a control value — the control binds to it:

```js
const vol = signal(0.8)
const state = settings({ volume: vol })

vol.value = 0.3  // same as state.volume = 0.3
```

Pass a signal as a theme — re-themes live:

```js
const theme = signal(soft())
settings(controls, { theme })

theme.value = soft({ lightness: 0.13 })
```

---

## Switching implementation

```js
import { use } from 'settings-panel'
import * as signals from '@preact/signals'

use(signals)
```

Call before `settings()`. Works with: `@preact/signals`, `@preact/signals-core`, `usignal`, `@webreflection/signal`.

---

## Disposal

```js
const state = settings({ volume: 0.8 })
state[Symbol.dispose]()  // removes panel, stops effects
```
