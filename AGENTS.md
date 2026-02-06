# AI WORKING AGREEMENT

The goal is panel with controls designed for purpose that _feel right_.

Source of truth:
- `.work/todo.md` — roadmap + progress. Do not invent tasks.
- `.work/research.md` — vision, constraints, decisions.
- `docs/*` – aspects.

Rules:
- If unclear or missing, ask. Do not guess.
- Prefer deletion over expansion.
- Respect existing decisions unless told to revise.

If not written, it is undecided.

## Structure

- `/control/*` - control components. Not utils or factories.
- `/theme/*` - theme files. Each theme is self-contained, peer to others (no foundational/base layer).
- `/signals.js` - signal utilities (from, map, persist, throttle, etc.)
- `/index.js` - main entry, settings(), infer(), register()

## Architecture

Data-first: controls are signal decorators, not custom elements.
- `control(signal, opts)` → decorated signal with `.el` and `[Symbol.dispose]()`
- Templates bind to `sig.value` directly via sprae
- No intermediate signals unless needed (e.g., log scale slider)

**Panel is decoupled from controls:**
- settings() = theme CSS + panel container + root folder + onchange wiring
- Folder is self-sufficient: imports infer, receives controls registry
- Folder state is `sprae/store` — reactive proxy, one signal per prop
- Controls receive store's internal signals directly (no duplication)
- No type-specific checks in panel (no `if (type === 'folder')`)
- No callback threading (no notify/render/path passed through tree)
- onchange wired at settings() level via effect on store state

Signal utilities in `/signals.js`:
- `from(source)` - normalize to signal (preact, solid, TC39, plain value)
- `map(sig, fn)` - derived signal with transform
- `persist(sig, key)` - localStorage sync
- `throttle(sig, ms)` - rate-limited updates

Control pattern in `/control/*.js`:
```js
import control from './control.js'
export default (sig, opts) =>
  control(sig, { type: 'my', template: `<input :value="sig" />`, ...opts })
```

## Code

- Core must be minimal, modular. Do not bundle all themes.
- Use nested CSS over flat CSS.
- Themes compose each other, not layered hierarchy.
- Bind templates directly to source signal, avoid intermediate state.
- Sprae auto-unwraps signals: use `sig` not `sig.value` in template reads.
- Sprae `:value` is two-way binding for inputs.
- For explicit writes, pass `set: v => { sig.value = v }` in state.
