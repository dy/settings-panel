## Theme Taxonomy

Themes define visual *structure* — how depth works, how borders behave, how surfaces feel.
Lightness defines *luminance*. Axes define *tuning*. All orthogonal.

A theme is distinct only if it has a structural property that can't be achieved
by tweaking axes (density, roundness, depth, weight) of another theme.


## Authoring a theme

Every theme is `theme(axes?) → CSS string`. The canonical pattern for new themes:

```js
import baseCSS from './base.js'           // structural reset + shared layout
import { resolveRoles } from './color.js' // shade + accent → semantic role tokens
import { hardShadow, neuShadow, bevel } from './mixins.js'  // reusable CSS fragments

export default function myTheme({ shade = '#f5f4f2', accent, size = 1, ...rest } = {}) {
  const { dark, bg, fg, accent: acc, surface, border } = resolveRoles(shade, accent)
  // build CSS using role tokens...
  return baseCSS + '\n' + `.s-panel { --bg: ${bg}; ... }`
}
```

**`resolveRoles(shade, accent, { contrast })`** returns semantic tokens:
`dark`, `bg`, `surface`, `surface2`, `fg`, `fgMuted`, `border`, `divider`, `accent`, `onAccent`.

**Mixins** (`theme/mixins.js`): `bevel(grad, w)`, `bevelRing(grad, w)`, `hardShadow(x, y, color)`, `neuShadow(dist, blur, dark, light)`, `neuInset(dist, blur, dark, light)`.

`brutal.js` is the simplest complete example: ~250 lines, uses `resolveRoles` + `hardShadow`.


## The Foundational Themes

| # | Name | Status | Import | Structural Distinction | Iconic Reference |
|---|------|--------|--------|----------------------|------------------|
| 1 | **soft** | ✅ shipped | `theme/default` | Subtle shadows, generous radius, gentle transitions | Linear, Tailwind UI, Figma |
| 2 | **swiss** | ✅ shipped | `theme/swiss` | No shadows, grid-pure, typographic hierarchy only | Braun, Stripe, FabFilter |
| 3 | **skeu** | ✅ shipped | `theme/skeu` | Realistic textures, directional lighting, physical affordances | iOS 1-6, Universal Audio |
| 4 | **brutal** | ✅ shipped | `theme/brutal` | Hard offset shadows (no blur), thick borders | Gumroad |
| 5 | **neu** | ✅ shipped | `theme/neu` | Paired shadows (light+dark), same-surface color, no borders | Neumorphism / claymorphism |
| 6 | **glass** | ✅ shipped | `theme/glass` | backdrop-filter blur, transparency, thin light borders | macOS Big Sur, Windows 11 |
| 7 | **lab01** | ✅ shipped | `theme/lab01` | Frosted glass + gradient borders + noise texture | lab01.dev |
| 8 | **control-panel** | ✅ shipped | `theme/control-panel` | freeman-lab/control-panel reproduction | control-panel |
| 9 | **classic** | 🔲 planned | — | Serif typography, rule lines, print margins | Notion, iA Writer, The New Yorker |
| 10 | **terminal** | 🔲 planned | — | Monospace, 0 radius, 1px borders, max density | Bloomberg, vim, Ableton |
| 11 | **industrial** | 🔲 planned | — | Exposed structure, functional labels, accent = interaction | Teenage Engineering, Nothing |
| 12 | **retro** | 🔲 planned | — | Inset/outset bevel borders, system colors, pixel-crisp | Windows 95/98, classic GTK |

### What each structurally owns (can't be faked by another)

- **soft**: the *mainstream default* — nothing extreme, everything gentle
- **swiss**: *absence* of depth is the statement — shadows would break it
- **classic**: *serif* — the only theme where serif is the right call
- **terminal**: *monospace everywhere* — not just code, all text
- **industrial**: *the label IS the decoration* — POWER, SYNC, modular grid
- **brutal**: *hard offset shadow* (4px 4px 0 black) — unique depth model
- **glass**: *backdrop-filter* — unique CSS mechanism, unique depth
- **neu**: *paired inset/outset shadows on same-color surface* — unique
- **skeu**: *real material textures* (leather, brushed metal) — unique surface
- **retro**: *bevel via border-color* (light top-left, dark bottom-right) — unique border model


### What was merged (and why)

| Candidate | Absorbed Into | Reason |
|-----------|--------------|--------|
| flat / material / surface | **swiss** (depth=0) or **soft** (depth>0) | No unique structural property — just depth parameter |
| corporate / enterprise | **swiss** or **soft** | Palette + weight choices, not structure |
| claymorphism | **neu** + color param | Same paired-shadow model, just more colorful |
| aqua | **skeu** (gel material) | Skeuomorphism with a specific material — gel buttons |
| analog / instrument | **skeu** (audio material) | Skeuomorphism with metal/knob material |
| vaporwave / synthwave | palette, not theme | Apply neon palette to any theme's structure |
| neon / cyber | palette, not theme | Glow = colored box-shadow, works on any structure |
| minimal | **swiss** + sparse density | Minimalism is swiss with fewer elements |
| calm UI / friendly professional | **soft** | This IS soft — that's the whole point of soft |


## Coverage Matrix

| Trend/Movement | Covered By |
|----------------|------------|
| Flat design | swiss (depth=0) |
| Minimalism | swiss (sparse density) |
| Material Design | soft (structured elevation) |
| Brutalism (web) | brutal or terminal |
| Skeuomorphism | skeu |
| Neumorphism | neu |
| Claymorphism | neu (+ color, + roundness) |
| Glassmorphism | glass |
| Neobrutalism | brutal |
| Aquamorphism | skeu (gel material) |
| Win95 / system UI | retro |
| Industrial | industrial |
| Editorial / print | classic |
| Corporate / SaaS | swiss or soft |
| Vaporwave / synthwave | any theme + neon palette |


## Implementation Order

**Shipped (v2.0)**

1. **soft** — default, most users, lowest risk
2. **swiss** — restraint as a statement
3. **skeu** — textures, directional lighting
4. **brutal** — hard shadows, high impact
5. **neu** — paired shadows, tactile plastic
6. **glass** — backdrop-filter, frosted surfaces
7. **lab01** — frosted + gradient border + noise
8. **control-panel** — dat.gui-era reproduction

**Planned**

9. **classic** — serif, editorial
10. **terminal** — monospace + density
11. **industrial** — label-as-decoration
12. **retro** — bevel border model



## Structural Rules Per Theme

> Sections marked **(planned)** describe intended design, not yet implemented.

### soft (default)
- Shadows: subtle drop (0 2px 8px, low opacity)
- Borders: 1px, low contrast
- Radius: generous (8-14px)
- Typography: system sans, normal weight
- Surface: solid, gentle palette
- Transitions: smooth (140-200ms)
- Feel: approachable, safe, mainstream

### swiss
- Shadows: none (depth=0 enforced)
- Borders: 1px functional (informational, not decorative)
- Radius: subtle (2-4px) or none
- Typography: geometric sans (Inter, Helvetica), weight carries hierarchy
- Surface: solid, whitespace is active design element
- Grid: mathematical, visible in alignment
- Feel: invisible design — if you notice the UI, it failed

### classic *(planned)*
- Shadows: none or hairline rule
- Borders: rule lines (horizontal dividers, not boxes)
- Radius: 0 or very subtle (2px)
- Typography: **serif** (Georgia, Garamond), generous line-height (1.5+)
- Surface: paper/cream tones
- Margins: generous, controlled line length (~66ch)
- Feel: centuries of print wisdom, scholarly, timeless

### terminal *(planned)*
- Shadows: none
- Borders: 1px solid, or none
- Radius: 0 (enforced)
- Typography: **monospace everywhere**, small size (12px)
- Surface: solid, dark default
- Color: semantic only (green=ok, red=error, yellow=warn, cyan=info)
- Density: maximum
- Feel: every pixel earns its place

### industrial *(planned)*
- Shadows: none or minimal
- Borders: visible, structural (like panel seams)
- Radius: small (2-4px)
- Typography: industrial sans (DIN, Eurostile), uppercase labels
- Surface: matte, raw, modular panels
- Accent: high-visibility (orange, yellow) = interaction point
- Labels: literal function words as decoration ("VOLUME", "RATE")
- Feel: the machine is beautiful because it's a machine

### brutal
- Shadows: **hard offset, no blur** (4px 4px 0 black)
- Borders: **thick** (2-4px), always black/dark
- Radius: 0 or small (0-4px)
- Typography: bold sans, can be quirky
- Surface: solid, high saturation, can clash
- Gradients: none
- Feel: raw, confrontational, playful punk

### glass
- Shadows: subtle or none (blur IS the depth)
- Borders: **thin light stroke** (1px white/light at ~20% opacity)
- Radius: generous (12-20px)
- Typography: light/medium weight sans
- Surface: **transparent + backdrop-filter blur** (12-20px)
- Layers: stacked translucent surfaces
- Requires: interesting background behind it
- Feel: airy, premium, modern depth

### neu
- Shadows: **paired** — dark shadow (bottom-right) + light shadow (top-left)
- Borders: **none** (shadows define edges)
- Radius: very high (12-20px)
- Typography: medium weight sans
- Surface: **same color as background** (elements extrude from surface)
- Contrast: low (accessibility risk — must be careful)
- Inset state: invert shadow direction for pressed/active
- Feel: soft plastic, clay, quiet

### skeu
- Shadows: **directional, realistic** (consistent light source, usually top-left)
- Borders: material-dependent (brushed metal ridge, leather stitch)
- Radius: varies by material metaphor
- Typography: varies (can include engraved, embossed)
- Surface: **realistic textures** (leather grain, brushed aluminum, wood, felt)
- Gradients: physical (lighting, curvature)
- Affordances: buttons look pressable, sliders look grabbable
- Feel: the world before screens, analog warmth

### retro *(planned)*
- Shadows: none (depth via border colors)
- Borders: **inset/outset bevel** (light color top+left, dark color bottom+right, 2px)
- Radius: 0 (enforced)
- Typography: system/bitmap feel (small, pixel-aligned)
- Surface: solid system colors (silver/gray, teal, navy)
- Buttons: raised bevel (light top-left, dark bottom-right)
- Inputs: sunken bevel (dark top-left, light bottom-right)
- Feel: nostalgic, OS-native, 1995


## Brand Mapping

| Brand | Theme | Why |
|-------|-------|-----|
| Braun | swiss | Rams' "less but better" |
| Stripe | swiss | Clean grids, generous space |
| FabFilter | swiss | Functional, readable, no flair |
| Figma | swiss | Grid-driven, functional color |
| Linear | swiss | Dark, sparse, keyboard-first |
| Apple (2013+) | swiss | Typographic, whitespace-driven |
| Notion | classic | Serif option, reading-optimized |
| iA Writer | classic | Print heritage, type-first |
| Medium (early) | classic | Editorial, generous margins |
| Bloomberg | terminal | Max density, monospace, status colors |
| vim / htop | terminal | Every pixel earns its place |
| Ableton Live | terminal | Dense, functional, no decoration |
| Elektron | terminal | Monospace, utilitarian |
| Teenage Engineering | industrial | Exposed PCB, orange accent, modular |
| Nothing Phone | industrial | Visible structure, glyph interface |
| Gumroad | brutal | Hard shadows, thick borders, bold |
| macOS Big Sur | glass | Frosted panels, translucent layers |
| Windows 11 | glass | Mica/acrylic blur, thin borders |
| iOS 1–6 | skeu | Leather, wood, realistic shadows |
| Universal Audio | skeu | Photorealistic vintage gear |
| Waves Audio | skeu | Analog plugin replicas |
| Windows 95/98 | retro | Bevel borders, system palette |
| classic GTK | retro | Raised/sunken border model |
| Tailwind UI | soft | Gentle shadows, generous radius |
| Radix / shadcn | soft | Subtle depth, smooth transitions |
