Purpose-built parameter controls that _feel right_. Miniature app helper, not app settings replacer.

## Docs (source of truth)
- `docs/axes.md` — theme axes
- `docs/themes.md` — foundational themes
- `docs/options.md` — panel options
- `docs/controls.md` — control types
- `docs/signals.md` — signals pattern

## Rules
- If unclear or missing, ask. Do not guess.
- Prefer deletion over expansion.
- If not written, it is undecided.

## Structure
- `/control/*` — controls. `/control/control.js` is base wrapper.
- `/theme/*` — `theme(axes?) → CSS string`. Peers, not hierarchy.
- `/index.js` — settings(), infer(), register().

## Architecture
Controls are signal decorators: `factory(sig, opts) → sig` with `.el`, `[Symbol.dispose]`.
- `control.js` wraps template with label/hint/title structure, mounts, handles dispose
- Controls pass state explicitly: `value: sig, set: v => { sig.value = v }`
- No implicit injection — control.js knows nothing about value/set
- Sprae auto-unwraps signals in templates. `:value` is two-way for inputs.

Panel flow: `settings() → theme <style> + panel el + root folder + onchange effect`
- Folder is self-sufficient: imports infer, receives controls registry
- Folder state is `sprae/store` — reactive proxy, one signal per prop
- Controls receive store's internal signals directly
- onchange wired at settings() level via single effect

Theme: `theme(axes?) → CSS string → <style>`. Nested CSS. Axes control intent, theme computes implementation.
