# Theme Parameters

Theme = function(params) → CSS

Themes receive universal params and interpret them through their own physics.
Some params map directly. Others go through the theme's "stylizer."


## Universal Params (every theme receives)

### 1. Palette
The color system. Can be preset, custom, or derived.

**Core roles (7):**
| Role | Purpose | Example |
|------|---------|---------|
| `bg` | Page/app background | `hsl(220 15% 97%)` |
| `surface` | Cards, panels, elevated areas | `hsl(0 0% 100%)` |
| `text` | Primary text, headings | `hsl(220 20% 10%)` |
| `dim` | Secondary text, labels, hints | `hsl(220 10% 45%)` |
| `border` | Default borders, dividers | `hsl(220 10% 85%)` |
| `accent` | Interactive elements, links, focus | `hsl(220 90% 54%)` |
| `muted` | Subtle backgrounds, disabled, hover | `hsl(220 10% 92%)` |

**Semantic roles (4, optional layer):**
| Role | Purpose | Default derivation |
|------|---------|-------------------|
| `danger` | Destructive actions, errors | red family |
| `warning` | Caution, pending | amber family |
| `success` | Confirmation, complete | green family |
| `info` | Informational | blue family |

**Palette modifiers:**
- `temperature` (0–1): cool ↔ warm hue shift
- `saturation` (0–1): muted ↔ vivid
- `lightness` (0–1): dark mode ↔ light mode (or use presets)

**Preset palettes (time of day):**
| Preset | Character |
|--------|-----------|
| `midnight` | Deep, restful, near-black bg |
| `evening` | Dim, purple-tinted, winding down |
| `day` | Bright, clear, productive |
| `golden` | Warm, sunset, amber accents |
| `dawn` | Soft, muted, gentle awakening |

---

### 2. Density
Spacing scale. Affects padding, gaps, margins, touch targets.

| Value | Character | Use case |
|-------|-----------|----------|
| 0 | Ultra-compact | Data-dense dashboards, terminals |
| 0.25 | Compact | Power user tools, Ableton |
| 0.5 | Balanced | Default, general use |
| 0.75 | Comfortable | Consumer apps, reading |
| 1 | Spacious | Marketing, luxury, presentation |

**Derived values:**
```
--space-unit: calc(4px + density * 8px)     // 4px → 12px
--space-xs: calc(var(--space-unit) * 0.5)
--space-sm: var(--space-unit)
--space-md: calc(var(--space-unit) * 2)
--space-lg: calc(var(--space-unit) * 3)
--space-xl: calc(var(--space-unit) * 5)
```

---

### 3. Contrast
Foreground/background luminance relationship.

| Value | Character |
|-------|-----------|
| 0 | Subtle, whispered, low-contrast |
| 0.5 | Balanced |
| 1 | Maximum, stark, high drama |

**Affects:**
- Text/bg luminance ratio
- Border visibility (opacity)
- Shadow intensity
- Focus ring prominence

**Accessibility note:** Contrast < 0.4 may fail WCAG. Theme can enforce minimum.

---

### 4. Weight
Visual heaviness. Border thickness, font weight, icon stroke.

| Value | Character |
|-------|-----------|
| 0 | Hairline, whisper-thin |
| 0.5 | Medium, balanced |
| 1 | Heavy, bold, chunky |

**Derived:**
```
--border-width: calc(1px + weight * 2px)    // 1px → 3px
--font-weight-normal: calc(400 + weight * 100)
--font-weight-bold: calc(500 + weight * 200)
--stroke-width: calc(1.5 + weight * 1)
```

---

### 5. Depth
Z-layering intensity. Theme interprets through its shadow physics.

| Value | Character |
|-------|-----------|
| 0 | Flat, no elevation |
| 0.5 | Subtle layering |
| 1 | Deep, dramatic elevation |

**Theme interpretation:**
| Theme | depth: 0.8 produces... |
|-------|------------------------|
| swiss | nothing (flat by philosophy) |
| terminal | 3-4px hard offset |
| analog | 16px blur, 6px y-offset, highlight |
| morphism | 8px paired shadow separation |
| glass | 20px blur, 0.3 opacity |
| neo | 6px hard offset, black |

---

### 6. Roundness
Corner radius scale.

| Value | Character |
|-------|-----------|
| 0 | Sharp, angular |
| 0.5 | Subtle softness |
| 1 | Pill, fully rounded |

**Theme constraints:**
- `terminal`: forces 0 (sharp is philosophy)
- `neo`: max 0.3 (keeps brutalist edge)
- `morphism`: min 0.6 (softness required)

**Derived:**
```
--radius-sm: calc(roundness * 4px)
--radius-md: calc(roundness * 8px)
--radius-lg: calc(roundness * 16px)
--radius-full: 9999px
```

---

### 7. Typography
Font family class. Theme may constrain options.

| Value | Character | Examples |
|-------|-----------|----------|
| `geometric` | Clean, constructed | DM Sans, Inter, Geist |
| `humanist` | Warm, friendly | Source Sans, Fira Sans |
| `mono` | Technical, code | JetBrains Mono, Fira Code |
| `serif` | Classic, editorial | Libre Baskerville, Georgia |
| `display` | Expressive | Space Grotesk, Clash |

**Theme constraints:**
- `terminal`: mono only
- `classic`: serif default, humanist allowed
- `swiss`: geometric only

**Scale modifier:**
- `scale` (0.8–1.2): Relative type size


## Theme-Defined (not user params)

These are determined by the theme's physics, not user choice:

### Border Style
| Theme | Border physics |
|-------|----------------|
| swiss | Hairline functional borders |
| terminal | 1px solid, status colors |
| analog | Can include bevel (highlight + shadow) |
| morphism | None or very subtle |
| glass | Thin white/light, 1px |
| neo | Thick black, 2-4px |
| win95 | Inset/outset bevel system |

### Shadow Style
| Theme | Shadow physics |
|-------|----------------|
| swiss | None (maybe focus ring) |
| terminal | Hard offset only, no blur |
| analog | Realistic directional, blurred |
| morphism | Paired (dark + light) |
| glass | Blur-based, not shadow |
| neo | Hard offset, black, no blur |

### Animation
| Theme | Motion physics |
|-------|----------------|
| swiss | Minimal, functional |
| terminal | Instant or none |
| analog | Physical, eased |
| morphism | Soft, slow |
| glass | Smooth, floating |
| neo | Snappy, bouncy |

---

## Theme-Specific Params

Exposed only when relevant theme is selected.

| Theme | Param | Range | Purpose |
|-------|-------|-------|---------|
| glass | `blur` | 8–32px | Backdrop blur intensity |
| glass | `opacity` | 0.5–0.95 | Surface transparency |
| analog | `material` | wood, metal, leather, fabric | Texture |
| analog | `lighting` | 0–360° | Light direction (see below) |
| neo | `offset` | 2–8px | Shadow offset distance |
| win95 | `3d-depth` | 0–1 | Bevel intensity |

### Lighting × Mode Interaction (analog)

For the `analog` theme, `lighting` direction combines with palette mode:

| Mode | Shadow character |
|------|------------------|
| `day` | Cast shadows — sharp, directional from lighting angle |
| `golden` | Warm cast shadows — longer, amber-tinted |
| `dawn` / `evening` | Diffuse shadows — softer blur, less directional |
| `midnight` | Ambient only — minimal shadows, glow highlights |

```css
/* day + lighting: 315° (top-left) */
box-shadow: 4px 4px 8px rgba(0,0,0,0.25);

/* dawn + lighting: 315° */
box-shadow: 4px 4px 16px rgba(0,0,0,0.12);  /* softer, more diffuse */

/* midnight — glow instead of shadow */
box-shadow: 0 0 12px rgba(255,255,255,0.05);
```

This lets analog theme produce realistic lighting without adding universal complexity.

---

## Param UI Grouping

| Group | Params | Visibility |
|-------|--------|------------|
| Essential | Theme, Palette, Density | Always |
| Advanced | Contrast, Weight, Depth, Roundness | Collapsible |
| Typography | Font family, Scale | Separate section |
| Theme-specific | Per-theme params | Conditional |

---

## Palette Derivation

### Core Insight

Most palettes reduce to:
1. One luminance ramp (bg → text)
2. One accent color
3. Temperature/saturation modifiers

### Minimal API

```js
palette('#4F46E5')                    // accent only
palette('#4F46E5', { mode: 'dark' })  // + mode
palette({ accent, mode, temperature, saturation, contrast })  // full
```

### Libraries

| Library | Use |
|---------|-----|
| culori | OKLCH conversion, contrast |
| rampensau | Luminance ramp generation |
| poline | Smooth interpolation |
