# Theme axes

Theme = function(axes?) → CSS string.
Every theme is a function accepting an optional axes object. Each interprets axes differently.
Support varies per theme — see the table at the bottom.


## Core axes (all themes)

The six axes below are accepted by every theme. Per-theme extras are noted in each theme's signature.


## Color

### `shade`

The background color. Hex or oklch. Everything else derives from it.

Dark shades (L < 0.5) flip the panel to dark mode — light text, dark surfaces.
Default: `'#f5f4f2'`.


### `accent`

The interactive/brand color. CSS color string, or a number 0–1 to derive from shade's hue with boosted chroma.

- `'#5588cc'` — blue
- `'#ff6600'` — orange
- `'oklch(.6 .2 310)'` — purple
- `0.6` — shade's hue at lightness 0.6, chroma ≥ 0.15

Default: `'#2563eb'`.


### `contrast` *(glass only)*

Luminance spread between roles (bg → surface → dim → text). Passed through `resolveRoles`.

0 = subtle, everything close together. 1 = stark, high-accessibility ratios.
Below 0.3 may fail WCAG.
Default: `1`. Range 0–2.


## Shape

### `spacing`

Padding, gaps, margins. How much air between elements.

0.5 = tight. 1 = comfortable. 2 = generous.
Default: `1`. Range 0.5–2.


### `size`

Overall scale — type size, control dimensions, layout grid unit.

Orthogonal to spacing: size scales elements, spacing scales the gaps.
 Default: `1`. Range 0.5–2.


### `roundness`

Corner radius. 0 = sharp rectangles. 1 = gentle curves. 2 = pills.
Default: `0.5`. Range 0–2.


## Surface

### `depth` *(neu, skeu)*

How much things lift off the surface. Same value, different physics per theme:

| Theme | depth at 1 |
|-------|-----------|
| neu | ±5px paired light/dark shadows |
| skeu | directional shadow, physical weight |

Default: `1` (neu), `1` (skeu). Range 0–∞ (values > 1 amplify the effect).


### `weight`

Font weight and icon stroke thickness. Affects title, labels, chevrons.

100 = thin. 400 = normal. 900 = black.
Default varies per theme (e.g. `400` for soft, `700` for brutal). Range 100–900.


### `bevel` *(skeu, brutal)*

Structural edge width. In `skeu` it controls the relief gradient intensity (0–∞, default `1`). In `brutal` it is the border thickness in px (default `3`).


### `blur` *(glass only)*

`backdrop-filter: blur(${blur}px)`. Default `18`. Controls frosted-glass intensity.


## Character

### `texture` (planned)

Pattern overlaid on backgrounds: flat, dots, crosses, grid, paper.
Default: `flat`.


### `font` (planned)

Typographic family: geometric, humanist, mono, serif.
Default: `geometric`.


## Time

### `motion` (planned)

Duration and intensity of transitions. Theme picks the curve, user picks the speed.
0 = instant, no animation. 1 = expressive, bouncy.
Respects `prefers-reduced-motion: reduce` → clamps to 0.
Default: `0.5`. Range 0–1.


---


## Summary

Core axes (accepted by all themes):

| Axis | Range | Default (soft) | What it does |
|------|-------|----------------|-------------|
| shade | hex/oklch | `#f5f4f2` | background color; L < 0.5 → dark mode |
| accent | color or 0–1 | `#2563eb` | interactive/brand hue |
| spacing | 0.5–2 | `1` | air between elements |
| size | 0.5–2 | `1` | element and type scale (`--u = 4*size px`) |
| roundness | 0–2 | `1` | corner radius |
| weight | 100–900 | `400` | font weight |

Theme-specific extras:

| Axis | Themes | What it does |
|------|--------|-------------|
| depth | neu, skeu | shadow/elevation intensity |
| bevel | skeu, brutal | relief intensity (skeu) or border width in px (brutal) |
| blur | glass | `backdrop-filter` blur radius in px |
| contrast | glass | luminance spread between roles (via `resolveRoles`) |

| Group | Axes |
|-------|------|
| Color | shade, accent |
| Shape | spacing, size, roundness |
| Surface | weight, depth, bevel, blur, contrast |


## Orthogonality

Each axis moves one thing:

- shade ≠ accent — shade is the surface; accent is the interactive hue
- spacing ≠ size — spacing is air between elements; size is element scale
- depth ≠ weight — depth is shadow/elevation; weight is typographic heaviness
- bevel (skeu) ≠ bevel (brutal) — same name, different semantics per theme


## What's not an axis

| Rejected | Why |
|----------|-----|
| border style | defined by theme (bevel, functional, paired) |
| shadow model | defined by theme (hard, soft, paired, blur) |
| light direction | only skeu needs it — theme-specific |
| layout/width | responsive concern, not visual style |
| type scale | folds into size |
