# Theme axes

Theme = function(axes) → CSS string.
Every theme receives the same axes. Each interprets them differently.


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


### `contrast`

Luminance spread between roles (bg → surface → dim → text).

0 = subtle, everything close together. 1 = stark, high-accessibility ratios.
Below 0.3 may fail WCAG.
Default: `0.5`. Range 0–1.


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

### `depth`

How much things lift off the surface. Same value, different physics per theme:

| Theme | depth at 0.8 |
|-------|-------------|
| skeu | directional shadow, physical weight |
| glass | backdrop-filter: blur(20px) |
| brutal | 5px 5px 0 black, hard offset |
| neu | ±6px paired light/dark shadows |

This is where themes diverge most.
Default: `0.4`. Range 0–1.


### `weight`

Font weight and icon stroke thickness. Affects title, labels, chevrons.

100 = thin. 400 = normal. 900 = black.
Default: `400`. Range 100–900.


### `relief`

Surface curvature — convex buttons (highlight top, shadow bottom), concave inputs (shadow top, highlight bottom). The axis controls intensity, direction is semantic.

0 = flat digital surfaces. 1 = full pillow/inset, skeuomorphic.
Classic toolkits call this relief (Tk: raised/sunken, GTK: shadow-type, Win32: edge style).
Default: `0`. Range 0–1.


### `bevel`

Structural edge width in pixels. Outlines, box-shadow borders, separator lines. Independent of weight — this is about pixel-level edge definition, not typographic heaviness.

Default: `2`. Range 0–4. Skeu-specific.


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

| Axis | Range | Default | What it does |
|------|-------|---------|-------------|
| shade | hex/oklch | #f5f4f2 | background color, dark/light mode |
| accent | color or 0–1 | #2563eb | interactive/brand hue |
| contrast | 0–1 | 0.5 | luminance spread between roles |
| spacing | 0.5–2 | 1 | air between elements |
| size | 0–1 | 0.5 | element and type scale |
| roundness | 0–2 | 0.5 | corner radius |
| depth | 0–1 | 0.4 | shadow/elevation |
| weight | 100–900 | 400 | font weight, stroke thickness |
| relief | 0–1 | 0 | surface curvature (convex/concave) |
| bevel | 0–4 | 2 | structural edge width (px) |

| Group | Axes |
|-------|------|
| Color | shade, accent, contrast |
| Shape | spacing, size, roundness |
| Surface | depth, weight, relief, bevel |
| Character | texture, font |
| Time | motion |


## Orthogonality

Each axis moves one thing:

- shade ≠ contrast — shade sets luminance level, contrast sets spread between roles
- accent ≠ contrast — accent is hue/identity, contrast is luminance ratios
- spacing ≠ size — spacing is air between, size is scale of elements
- depth ≠ weight — depth is shadow/elevation, weight is stroke/border
- weight ≠ bevel — weight is typographic (font, icons), bevel is structural (edges, outlines)
- relief ≠ depth — relief is surface curvature (convex/concave), depth is z-elevation


## What's not an axis

| Rejected | Why |
|----------|-----|
| border style | defined by theme (bevel, functional, paired) |
| shadow model | defined by theme (hard, soft, paired, blur) |
| light direction | only skeu needs it — theme-specific |
| layout/width | responsive concern, not visual style |
| type scale | folds into size |
