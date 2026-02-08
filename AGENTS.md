Panel with controls designed for purpose that _feel right_.

## Goal

* Miniature and easy to plug app helper.
* NOT app setings replacer: controls are designed for specific purpose, not generic.
* NOT center of attention: should not switch focus from the main app - just neat useful controls matching visually.
* NOT style/theme generator: it may happen so that the theme has elaborate controls for theme picker, but it has no goal to become generic theme descriptor.

## Differentiation

* Parameter controls that are presentation-ready, not just functional.
* Each combination of any theme params should look beautiful
* Controls designed for purpose that _feel right_.
	* Log slider that *is* logarithmic
	* Palette picker that *understands* color
	* XY pad with pointerlock precision
	* Waveform display that *knows* audio
	* Font picker that *knows* font

## Principles

	* Quality > quantity
	* Each type crafted for its purpose
	* Resist feature-count pressure
	* No React lock-in, no plugin ecosystem complexity

## Technical Direction

	* Signals-based reactivity
	* 0 dependencies
	* Framework-agnostic (vanilla JS, sprae-compatible)
	* Open, minimal API


## Source of truth:
- `docs/axes.md` — 12 theme axes (lightness, accent, temperature, ..., motion).
- `docs/themes.md` — 10 foundational themes (soft, swiss, classic, ..., retro).
- `docs/options.md` — panel options (container, title, theme, collapsed, persist, key, onChange).
- `docs/controls.md` — control types.
- `docs/signals.md` — signals pattern, switching implementations, passing signals.

## Rules:
- If unclear or missing, ask. Do not guess.
- Prefer deletion over expansion.
- Respect existing decisions unless told to revise.

If not written, it is undecided.

## Structure

- `/control/*` - control components. Not utils or factories.
- `/theme/*` - theme files. Each theme is a function(axes) → CSS string. Self-contained, peer to others.
- `/index.js` - main entry, settings(), infer(), register().

## Architecture

Data-first: controls are signal decorators, not custom elements.
- `control(signal, opts)` → decorated signal with `.el` and `[Symbol.dispose]()`
- Templates bind to `value` (auto-unwrapped signal) and `set` (write channel)
- No intermediate signals unless needed (e.g., log scale slider)

**Panel is decoupled from controls:**
- settings() = theme CSS + panel container + root folder + onchange effect
- Folder is self-sufficient: imports infer, receives controls registry
- Folder state is `sprae/store` — reactive proxy, one signal per prop
- Controls receive store's internal signals directly (no duplication)
- No type-specific checks in panel (no `if (type === 'folder')`)
- No callback threading (no notify/render/path passed through tree)
- onchange wired at settings() level via single effect on all state keys

**Theme pattern:**
- theme(axes?) → CSS string → `<style>`
- 11 universal axes: lightness, accent, contrast,
  spacing, size, roundness, depth, weight, texture, font, motion
- Axes control intent, theme computes implementation
- Theme as signal for live re-theming

Control pattern in `/control/*.js`:
```js
import control from './control.js'
export default (sig, opts) =>
  control(sig, { type: 'my', template: `<input :value="value" />`, ...opts })
```

## Code

- Core must be minimal, modular. Do not bundle all themes.
- Use nested CSS over flat CSS.
- Themes are peers, not layered hierarchy.
- Bind templates directly to source signal, avoid intermediate state.
- Sprae auto-unwraps signals: templates use `value` (read) and `set` (write).
- Sprae `:value` is two-way binding for inputs.
- For explicit writes, controls override `set` in opts (e.g., clamping).
