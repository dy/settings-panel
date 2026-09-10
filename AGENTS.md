Purpose-built parameter controls that _feel right_. Miniature app helper, not app settings replacer.

## Docs (source of truth)
- `docs/axes.md` — theme axes (core + per-theme extras)
- `docs/themes.md` — themes: 10 shipped + planned (research doc with Status column)
- `docs/options.md` — panel options
- `docs/controls.md` — **research/design doc**; has "Implemented today" banner at top
- `docs/signals.md` — signals pattern

## Rules
- If unclear or missing, ask. Do not guess.
- Prefer deletion over expansion.
- If not written, it is undecided.
- Never apply symptomatic fixes (disabling, hiding, workarounds). Find and fix root cause.

## Structure
- `/control/*` — controls. `/control/control.js` is base wrapper.
- `/theme/*` — `theme(axes?) → CSS string`. Peers, not hierarchy.
  - `theme/color.js` — `resolveRoles`, `resolveAccent`, `parseColor`, `normalizeHex`
  - `theme/mixins.js` — `bevel`, `bevelRing`, `hardShadow`, `neuShadow`, `neuInset`
  - `theme/base.js` — shared structural reset
  - `theme/metrics.js` — shared size, spacing, and body-font tokens; themes provide their baselines
- `/index.js` — `settings()`, `infer()`, `register()`.
- `/signals.js` — decorators + re-exports: `signal`, `effect`, `computed`, `batch`, `untracked`, `store`, `use`.

## Control Registry (index.js)
Registered: `boolean`, `number`, `slider`, `select`, `color`, `text`, `textarea`, `button`, `info`.
Structural (handled separately, not in registry): `folder`, `separator`.

## Inference summary (`infer()`)
- `true/false` → boolean
- fractional 0–1 float → slider; integer (incl. 0, 1) → number; NaN/Infinity → number(0)
- `'#hex'` / `'rgb()'` / `'hsl()'` → color; bare hex without `#` is NOT a color
- multiline string → textarea; other string → text
- `[r,g,b,a]` 8-bit + alpha 0–1 → color:rgba; numeric 2–4 arrays → text(JSON)
- array of strings → select; function → button; all-function dict → button group
- `{type}` → explicit; `{min/max}` → slider; `{options}` → select; `{value}` → infer value

## Architecture
Controls are signal decorators: `factory(sig, opts) → sig` with `.el`, `[Symbol.dispose]`.
- `control.js` wraps template with label/hint/title structure, mounts, handles dispose
- Controls pass state explicitly: `value: sig, set: v => { sig.value = v }`
- No implicit injection — control.js knows nothing about value/set
- Sprae auto-unwraps signals in templates. `:value` writes state to input properties; `:change` or explicit input/change handlers write back.
- Colon variant syntax parsed in `settings()` factory loop: `'select:segmented'` → `type='select', variant='segmented'`

Panel flow: `settings() → theme <style> + panel el + controls + onchange effect`
- State is `sprae/store` — reactive proxy, one signal per prop
- Controls receive store's internal signals directly (`store[_signals][key]`)
- `collapsed` signal → two-way bind via `toggle` event + `effect`
- `key` option → keyboard shortcut wired via `keydown` on `document`
- `persist: true|string` → localStorage; restores falsy values (`false`, `0`, `''`)
- `onchange`/`onChange` both accepted

Theme: `theme(axes?) → CSS string → <style>`. Nested CSS. Axes control intent, theme computes implementation.
- `brutal.js` is the minimal canonical new-theme example (uses `resolveRoles`; one plate-shadow helper)
- New themes: `brutal`, `neu`, `glass` use `resolveRoles` + mixins from `theme/color.js` + `theme/mixins.js`
- Package: v2.0.0. Dependency: `sprae ^13.9.2` only (`sube` removed).
