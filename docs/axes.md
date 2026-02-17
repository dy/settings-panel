# Theme Axes

Theme = function(axes) → CSS string.
Every theme receives the same 11 axes. Each interprets them through its own physics.


## Color — the palette

### 1. `lightness`

**How dark or bright.** The L channel — the single biggest visual shift.

| 0 | 0.5 | 1 |
|---|-----|---|
| Pitch dark. Terminal at night. | Dim. Muted workspace. | Bright. White page, dark ink. |

0–1. Default: `0.97`.
Below 0.5 is dark mode (light text on dark background).


### 2. `accent`

**The signature color.** CSS color for interactive and brand elements.

Accepts any CSS color, or a number 0–1 to derive from shade:
- `accent: '#5588cc'` — blue
- `accent: '#ff6600'` — orange
- `accent: 'oklch(.6 .2 310)'` — purple
- `accent: 0.6` — shade hue at lightness 0.6, chroma ≥ 0.15

Default: `'#2563eb'`.

Number accent uses shade's hue with boosted chroma — harmonious
with the background. The theme computes the right lightness and
chroma for the accent based on lightness/contrast axes.


### 3. `contrast`

**The drama between light and dark.** Luminance ratio between roles
(bg → surface → dim → text).

| 0 | 0.5 | 1 |
|---|-----|---|
| Whispered. Airy. Subtle. | Clear. Readable. | Stark. Dramatic. High-accessibility. |

0–1. Default: `0.5`.
Below 0.3 may fail WCAG — themes can enforce a floor.


## Shape — space and geometry

### 4. `spacing`

**How much air.** Padding, gaps, and margins between elements.

| 0 | 0.5 | 1 |
|---|-----|---|
| Tight. Small type. Compact. | Balanced. Comfortable. | Airy. Large type. Room to breathe. |

0–1. Default: `0.5`.


### 5. `size`

**The scale.** Overall size of type, controls, and the layout grid unit.

| 0 | 0.5 | 1 |
|---|-----|---|
| Compact. Small type. Dense controls. | Balanced. Comfortable. | Large. Prominent. Spacious controls. |

0–1. Default: `0.5`.
Orthogonal to spacing — size scales elements, spacing scales the air between them.


### 6. `roundness`

**The geometry.** Corner radius from sharp to pill.

| 0 | 0.5 | 1 |
|---|-----|---|
| Angular. Crisp. Decisive. | Gentle. Approachable. | Soft. Rounded. Friendly. |

0–1. Default: `0.5`.
Constraints: terminal forces 0, retro forces 0.


## Surface — physical feel

### 7. `depth`

**The elevation.** How much things lift off the surface.
Same value, different physics per theme:

| Theme | depth 0.8 |
|-------|-----------|
| soft | diffuse shadow, gentle lift |
| swiss | nothing — flatness is the statement |
| brutal | 5px 5px 0 black, hard offset |
| glass | backdrop-filter: blur(20px) |
| neu | ±6px paired light/dark shadows |
| skeu | directional shadow, physical weight |
| retro | bevel border intensifies |

0–1. Default: `0.4`.
This is where themes diverge most — depth reveals the structural soul.


### 9. `relief`

**The surface curvature.** Apparent 3D shape of controls via lighting gradient.
Buttons are convex (highlight top, shadow bottom). Inputs are concave (shadow top, highlight bottom).
Direction is semantic — the axis controls intensity only.

| 0 | 0.5 | 1 |
|---|-----|---|
| Flat. Digital. Clean. | Subtle roll. Tactile. | Full pillow/inset. Skeuomorphic. |

0–1. Default: `0`.
Classic toolkits call this `relief` (Tk: raised/sunken, GTK: shadow-type, Win32: edge style).


### 10. `weight`

**The heaviness.** Stroke width, border thickness, font-weight.

| 0 | 0.5 | 1 |
|---|-----|---|
| Hairline. Delicate. Whispered. | Balanced. Clear. | Chunky. Bold. Assertive. |

0–1. Default: `0.5`.


## Character — personality

### 11. `texture`

**The surface.** Pattern overlaid on backgrounds.

| Preset | Character |
|--------|-----------|
| `flat` | Clean. Nothing. |
| `dots` | Subtle circle grid. Halftone. |
| `crosses` | + marks. Graph paper. |
| `grid` | Fine lines. Technical. |
| `paper` | Noise grain. Organic. |

Default: `flat`.
Orthogonal to depth — you can have flat+dots or deep+dots.


### 12. `font`

**The voice.** Typographic family that sets the tone.

| Value | Character | Families |
|-------|-----------|----------|
| `geometric` | Clean, constructed, modern | Inter, DM Sans, Geist |
| `humanist` | Warm, friendly, readable | Source Sans, Fira Sans |
| `mono` | Technical, dense, precise | JetBrains Mono, Fira Code |
| `serif` | Classic, editorial, timeless | Georgia, Libre Baskerville |

Default: `geometric`.
Theme constraints: terminal forces `mono`, classic defaults `serif`.


## Time

### 13. `motion`

**The energy.** Duration and intensity of transitions and animations.
Theme chooses the curve (ease, linear, spring). User chooses the speed.

| 0 | 0.5 | 1 |
|---|-----|---|
| Instant. No animation. Reduced motion. | Smooth. Responsive. | Expressive. Playful. Bouncy. |

0–1. Default: `0.5`.
Respects `prefers-reduced-motion: reduce` → clamps to 0.

Same value, different character per theme:

| Theme | motion 0.7 |
|-------|------------|
| soft | 200ms ease-out |
| terminal | 50ms linear (always snappy) |
| brutal | 120ms linear (no cushion) |
| glass | 250ms spring |
| neu | 180ms ease-in-out |
| skeu | 300ms with inertia |


---


## Summary

| # | Axis | Type | Range | One word |
|---|------|------|-------|----------|
| 1 | `lightness` | 0–1 | dark ↔ bright | luminance |
| 2 | `accent` | color | CSS color | identity |
| 3 | `contrast` | 0–1 | subtle ↔ stark | drama |
| 4 | `spacing` | 0–1 | tight ↔ airy | space |
| 5 | `size` | 0–1 | compact ↔ large | scale |
| 6 | `roundness` | 0–1 | sharp ↔ pill | geometry |
| 7 | `depth` | 0–1 | flat ↔ dramatic | elevation |
| 8 | `weight` | 0–1 | hairline ↔ chunky | heaviness |
| 9 | `relief` | 0–1 | flat ↔ pillowy | curvature |
| 10 | `texture` | preset | flat / dots / crosses / grid / paper | surface |
| 11 | `font` | select | geometric / humanist / mono / serif | voice |
| 12 | `motion` | 0–1 | instant ↔ expressive | energy |

| Group | Axes | What it controls |
|-------|------|-----------------|
| **Color** | lightness, accent, contrast | The palette |
| **Shape** | spacing, size, roundness | Space, scale, and geometry |
| **Surface** | depth, weight, relief | Physical feel |
| **Character** | texture, font | Personality |
| **Time** | motion | Energy |


## Orthogonality

Every axis moves one thing no other axis touches:

- lightness ≠ contrast — lightness sets luminance level, contrast sets spread between roles
- accent ≠ contrast — accent = hue/identity, contrast = luminance ratios
- spacing ≠ size — spacing = air between, size = scale of elements
- spacing ≠ weight — spacing = space between, weight = thickness of
- depth ≠ weight — depth = shadow/elevation, weight = stroke/border
- texture ≠ depth — texture = pattern, depth = z-layering
- motion ≠ anything spatial — only axis that controls time
- font ≠ weight — font = family/voice, weight = thickness


## Palette derivation

All color roles computed from the 5 color axes:

```
lightness    →  luminance level (bg, surface, text, dim)
accent       →  interactive hue (highest chroma)
temperature  →  neutral hue offset (shifts bg/surface/text/border)
saturation   →  chroma scaling (proportional, accent stays loudest)
contrast     →  lightness step between roles
```

Color roles are outputs, not inputs:

| Role | Derived from |
|------|-------------|
| bg | lightness · level + temperature · hue + saturation · chroma |
| surface | slightly elevated from bg |
| text | opposite end of lightness + contrast |
| dim | midpoint, reduced contrast |
| border | between surface and text, low chroma |
| accent | accent hue + saturation · chroma + lightness-appropriate L |
| input | slightly recessed from surface |
| track | recessed from bg |
| danger | hue ~25 (red), L/C from lightness + saturation |
| warning | hue ~85 (yellow), L/C from lightness + saturation |
| success | hue ~145 (green), L/C from lightness + saturation |
| info | hue ~240 (blue), L/C from lightness + saturation |

Semantic colors are fixed hue positions. L and C computed from the same
axes as everything else — they automatically match the palette.


## Theme × Axis interaction

| Theme | Constrains | Emphasizes | Signature move |
|-------|-----------|------------|----------------|
| **soft** | — | depth, roundness | diffuse shadow |
| **swiss** | depth → 0 | weight, spacing | typographic hierarchy |
| **classic** | font → serif | contrast | rule lines, print margins |
| **terminal** | roundness → 0, font → mono, motion → low | spacing → low | semantic color only |
| **industrial** | — | weight, accent | labels as decoration |
| **brutal** | — | weight, depth | hard offset shadow |
| **glass** | — | depth, roundness, motion | backdrop-filter blur |
| **neu** | roundness ≥ 0.6 | depth | paired shadows |
| **skeu** | — | depth, texture, motion | realistic materials |
| **retro** | roundness → 0, motion → low | depth, weight | bevel borders |


## What's NOT an axis

| Rejected | Why |
|----------|-----|
| border style | Defined BY theme (bevel, functional, paired) |
| shadow model | Defined BY theme (hard, soft, paired, blur) |
| light direction | Only skeu needs it — theme-specific |
| layout/width | Responsive concern, not visual style |
| type scale | Folds into size — compact = smaller type, large = bigger |


## UI grouping

| Group | Axes | Visibility |
|-------|------|------------|
| Color | lightness, accent, contrast | always (lightness, accent); collapsible (contrast) |
| Shape | spacing, size, roundness | always |
| Surface | depth, weight | collapsible |
| Character | texture, font | collapsible |
| Time | motion | collapsible |
