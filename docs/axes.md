# Theme axes

Theme = function(axes?) → CSS string.
Every theme is a function accepting an optional axes object. Size, spacing, and
body-font customization share a contract; material and palette axes vary by theme.


## Core axes (all themes)

Every theme accepts `size`, `spacing`, and `font`. Other axes depend on the theme;
the gallery exposes the supported controls. Fixed native palettes retain their colors.


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


## Shape

### `spacing`

Padding, gaps, margins. How much air between elements.

0.5 = tight. 1 = comfortable. 2 = generous.
Default: `1`. Range 0.5–2.


### `size`

Overall scale — type size, control dimensions, layout grid unit. At `1`, each
theme uses its native baseline; `1.2` scales its type by 20%.

Orthogonal to spacing: size scales elements, spacing scales the gaps.
 Default: `1`. Range 0.5–2.


### `roundness`

Corner radius. 0 = sharp rectangles. 1 = gentle curves. 2 = pills.
Default: `0.5`. Range 0–2.


## Surface

### `depth` *(neu, skeu, glass)*

How much things lift off the surface. Same value, different physics per theme:

| Theme | depth at 1 |
|-------|-----------|
| neu | 6px directional cast, close contact shadow, fine rim |
| skeu | directional shadow, physical weight |
| glass | edge rim and surface reflection intensity |

Default: `1` (neu), `1` (skeu). Range 0–∞ (values > 1 amplify the effect).


### `weight`

Font weight and icon stroke thickness. Affects title, labels, chevrons.

100 = thin. 400 = normal. 900 = black.
Default varies per theme (e.g. `400` for soft, `500` for brutal). Range 100–900.


### `bevel` *(skeu, brutal, porcelain)*

Structural edge width. In `skeu` it controls the relief gradient intensity (0–∞, default `1`). In `brutal` it is the border thickness in px (default `2`). In `porcelain` it scales the ceramic lip (default `1`, 5px at size 1).


### `blur` *(glass only)*

`backdrop-filter: blur(${blur}px)`. Default `24`. Controls frosted-glass intensity.


### `tint` *(glass only)*

Density of the shade-colored glass backing. 0 = clear, 1 = the default optical
tint. Bright or busy scenes need enough tint to keep the text readable.

### `softness` *(neu only)*

Blur relative to shadow distance. Default `1`; lower values give a crisper
molded edge, higher values a softer relief. It changes the broad shadows; the
contact edge remains crisp. Depth and lighting contrast are independent.

### `contrast` *(neu only)*

Shadow and highlight strength, independent of depth. Default `1`, range 0–2.
At `0` the lighting disappears; raised faces remain opaque.

### `light` *(neu only)*

Light-source direction in CSS degrees: 0 = top, 90 = right, 180 = bottom,
270 = left. Default `315` (upper left); shadows fall in the opposite direction.
Raised edges, inset wells, and face gradients share the same light.

### `offset` *(brutal only)*

Hard-shadow throw in px; control press travel derives from the same value.
Default `4`.

### `grain` *(brutal, neu, porcelain)*

Texture intensity; `0` disables it. Brutal uses halftone dots (default `0`),
Neu uses fine matte grain (default `.3`, range 0–1), and Porcelain uses flowing
embossed relief (default `1`, range 0–2).

## Character

### `texture` (planned)

Pattern overlaid on backgrounds: flat, dots, crosses, grid, paper.
Default: `flat`.


### `font`

Body font family as a CSS font-family string. Omit it to retain the theme's face;
for example `font: 'system-ui, sans-serif'`. Display headings and specialized code
fields can keep their own typography. The gallery offers Theme font, System, and
Monospace. This changes the family, independently of size and spacing.


## Time

### `motion` (planned)

Duration and intensity of transitions. Theme picks the curve, user picks the speed.
0 = instant, no animation. 1 = expressive, bouncy.
Respects `prefers-reduced-motion: reduce` → clamps to 0.
Default: `0.5`. Range 0–1.


---


## Summary

Axes (palette and shape support varies):

| Axis | Range | Default (soft) | What it does |
|------|-------|----------------|-------------|
| shade | hex/oklch | `#f5f4f2` | background color; L < 0.5 → dark mode |
| accent | color or 0–1 | `#2563eb` | interactive/brand hue |
| spacing | 0.5–2 | `1` | air between elements |
| size | 0.5–2 | `1` | element and type scale (`--u = 4*size px`) |
| font | CSS font-family | theme default | body typeface |
| roundness | 0–2 | `1` | corner radius |
| weight | 100–900 | `400` | font weight |

Theme-specific extras:

| Axis | Themes | What it does |
|------|--------|-------------|
| depth | neu, skeu, glass | shadow/elevation or optical rim intensity |
| bevel | skeu, brutal, porcelain | relief intensity, ink border width, or ceramic lip |
| blur | glass | `backdrop-filter` blur radius in px |
| leading | terminal | line height as a multiple of the type size — the cell height (default `1.6`) |
| tint | glass | shade-colored backing density |
| softness | neu | ambient diffusion relative to shadow distance |
| contrast | neu | shadow/highlight strength |
| light | neu | light-source direction in CSS degrees |
| offset | brutal | hard-shadow throw in px |
| grain | brutal, neu, porcelain | halftone, matte grain, or embossed relief |

| Group | Axes |
|-------|------|
| Color | shade, accent |
| Shape | spacing, size, roundness |
| Surface | weight, depth, bevel, blur, tint, softness, contrast, light, offset, grain |


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

## Shared dimensional tokens

`theme/metrics.js` turns a theme's pixel baseline into the same CSS variables.
The themes remain peers; they supply their baseline next to their color tokens.
No runtime stylesheet rewriting or CSS zoom is involved.

| Token | Meaning |
|-------|---------|
| `--size`, `--spacing` | independent scale factors, clamped to 0.5–2 |
| `--length` | one baseline pixel multiplied by size |
| `--space` | one baseline pixel multiplied by size and spacing |
| `--u` | theme grid unit multiplied by size |
| `--font-family`, `--font-size`, `--line-height` | body typography |
| `--control-height` | line height plus density-scaled internal space |
| `--inset` | padding inside a control |
| `--row-gap`, `--column-gap` | space between controls and between label/value columns |
| `--section-gap` | separation between header, content, and actions |
| `--panel-padding` | panel edge inset |

Legacy `--pad` and `--lh` alias the common inset and line height. Theme-specific
geometry (bevels, switch proportions, Swiss display type, Terminal character cells)
remains local. Terminal derives its line height from its `leading` axis and snaps
the cell to its character grid.

Baselines intentionally differ: OUI uses 10px type, dat.gui/Tweakpane/Figma 11px,
DevTools 12px, Apple/Lab01 13px, and the material themes 14px. A native inspector
can have zero row gap while Neu has a 16px gap for its shadows. At `size: 1,
spacing: 1`, those are ordinary baseline parameters. Density changes their space,
never their font size. Hosts can override individual role tokens without replacing
the theme's colors or material rules.
