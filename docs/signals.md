# Signal Decorators

Primitives for reactive state. Each decorator takes a signal, returns a signal, does something on the side.

---

## Pattern

```js
const enhanced = decorator(signal, options?)
```

1. **Takes** a signal (or value → creates signal)
2. **Returns** the same or derived signal
3. **Side effect**: persist, sync, render, observe, etc.

```js
// Storage
const vol = persist(signal(0.5), 'volume')  // side effect: localStorage

// UI
const vol = slider(signal(0.5), opts)       // side effect: render control

// Same pattern. Signal IS the API.
vol.value = 0.8
```

---

## Why Decorators

**Composition over inheritance:**
```js
const vol = persist(throttle(signal(0.5), 16), 'vol')
```

**Separation of concerns:**
- Signal = state
- Decorator = behavior
- UI = side effect

**No framework lock-in:**
- Works with any signal implementation
- `from()` adapts Preact, Solid, TC39 proposal

---

## API Shape

Based on Preact-style signals (widely adopted, ergonomic):

```js
sig.value        // read (tracked)
sig.value = x    // write
sig.peek?.()     // read (untracked)

effect(() => {
  console.log(sig.value)  // runs when sig changes
})
```

---

## Disposal

Decorators with resources (listeners, timers, DOM) implement `Symbol.dispose`:

```js
const sig = persist(signal(0), 'key')
sig[Symbol.dispose]()  // cleanup

// Or with `using` (when available):
using sig = persist(signal(0), 'key')
// auto-disposed at scope end
```

---

## Adapters

```js
import { from } from './signals.js'

from({ value: 0 })           // Preact-style → pass through
from({ get, set })           // TC39 proposal → wrap
from([getter, setter])       // Solid-style → wrap
from(0.5)                    // plain value → create signal
```

---

## Categories

| Category | Examples |
|----------|----------|
| **Storage** | `persist`, `session` |
| **Time** | `throttle`, `debounce`, `delay`, `interval`, `countdown` |
| **Browser** | `media`, `online`, `visibility`, `idle` |
| **DOM** | `intersect`, `visible` |
| **Control** | `slider`, `toggle`, `select`, `color`, ... |

---

## Controls as Decorators

A control is a decorator whose side effect is rendering UI:

```js
// Settings panel internally:
const state = {}
for (const [key, def] of Object.entries(controls)) {
  const sig = signal(def.value)
  const decorated = control(sig, { ...def, container: panel })

  Object.defineProperty(state, key, {
    get: () => decorated.value,
    set: (v) => { decorated.value = v }
  })
}
return state
```

No custom elements. Just functions returning signals.
