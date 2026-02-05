# Controls Research

Control = function(params) → UI + value binding

Each control **knows its domain**. A slider isn't just a draggable bar — it understands logarithmic scales, tactile feedback, pointer lock. A color picker isn't just HSL sliders — it understands perceptual spaces, contrast, harmony.

---

## Design Principles

1. **Domain expertise** — Each control deeply understands its problem space
2. **Subtypes over proliferation** — `boolean:toggle` not separate `Toggle` component
3. **Sensible defaults** — Works without config, powerful with it
4. **Composition** — Complex controls built from primitives
5. **Extensibility** — Custom type for anything we didn't anticipate

---

## Control Taxonomy

```
┌─────────────────────────────────────────────────────────────┐
│ PRIMITIVES                                                  │
│   boolean · number · text                                   │
├─────────────────────────────────────────────────────────────┤
│ CONSTRAINED                                                 │
│   slider · knob · vector · range                            │
├─────────────────────────────────────────────────────────────┤
│ SELECTION                                                   │
│   select · color · font                                     │
├─────────────────────────────────────────────────────────────┤
│ MEDIA                                                       │
│   file · image · audio                                      │
├─────────────────────────────────────────────────────────────┤
│ VISUALIZATION (read-only)                                   │
│   graph · meter · waveform                                  │
├─────────────────────────────────────────────────────────────┤
│ COMPLEX                                                     │
│   curve · gradient · matrix                                 │
├─────────────────────────────────────────────────────────────┤
│ STRUCTURE                                                   │
│   folder · separator · info                                 │
├─────────────────────────────────────────────────────────────┤
│ ESCAPE HATCH                                                │
│   custom                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Boolean

True/false state.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `checkbox` | ☑ / ☐ | Forms, multiple options |
| `toggle` | ●───○ | Settings, on/off states |
| `switch` | ON/OFF | Labeled binary choice |
| `button` | [Press] | Momentary or toggle action |

### Params

```ts
interface BooleanParams {
  type?: 'checkbox' | 'toggle' | 'switch' | 'button'
  label?: string
  labels?: [string, string]  // [off, on] for switch type
  disabled?: boolean
}
```

### Domain Knowledge

- **Accessibility**: Must be keyboard navigable, screen reader compatible
- **Touch targets**: Minimum 44px for mobile
- **State indication**: Clear visual distinction between on/off
- **Intermediate states**: Some contexts need indeterminate (partial selection)

---

## 2. Number

Numeric value input.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `input` | [___▲▼] | General numeric entry |
| `stepper` | [−][+] | Discrete steps |
| `spinner` | Compact arrows | Space-constrained |

### Params

```ts
interface NumberParams {
  type?: 'input' | 'stepper' | 'spinner'
  min?: number
  max?: number
  step?: number
  precision?: number        // decimal places
  unit?: string             // 'px', '%', 'deg', 'Hz', 'dB', 'ms'
  format?: (n: number) => string
  parse?: (s: string) => number
  softMin?: number          // visual hint, not hard limit
  softMax?: number
}
```

### Domain Knowledge

- **Units**: Display and parse units (100px, 50%, 440Hz)
- **Precision**: Auto-detect from step, or explicit
- **Scrubbing**: Drag on label to adjust value (like Figma)
- **Keyboard**: Arrow keys for increment, shift+arrow for 10x
- **Validation**: Clamp to range, reject invalid input
- **Formatting**: Scientific notation for large/small values

---

## 3. Text

String value input.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `input` | Single line | Names, short values |
| `textarea` | Multiline | Descriptions, long text |
| `password` | ••••••• | Secrets |
| `pin` | [_][_][_][_] | OTP, codes |
| `code` | Monospace | Code snippets |

### Params

```ts
interface TextParams {
  type?: 'input' | 'textarea' | 'password' | 'pin' | 'code'
  placeholder?: string
  maxLength?: number
  minLength?: number
  mask: string
  rows?: number             // for textarea
  pattern?: RegExp
  validate?: (s: string) => boolean | string  // true, false, or error message
  language?: string         // for code: 'js', 'css', 'json'
  autoGrow?: boolean        // textarea grows with content
  spellCheck?: boolean
}
```

### Domain Knowledge

- **Validation**: Real-time feedback, not just on submit
- **Auto-grow**: Textarea expands to fit content
- **Code editing**: Syntax highlighting, bracket matching
- **JSON**: Parse validation, pretty print
- **Password**: Show/hide toggle, strength indicator

---

## 4. Slider

Constrained numeric with visual track.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `linear` | ●━━━━━ | General ranges |
| `log` | ●━━━━━ (log scale) | Audio gain, frequency |
| `exp` | ●━━━━━ (exp scale) | Easing, curves |
| `range` | ○━━━●━━━○ | Min/max intervals |
| `stepped` | ●━┃━┃━┃━ | Discrete values |

### Params

```ts
interface SliderParams {
  type?: 'linear' | 'log' | 'exp' | 'range' | 'stepped'
  min: number
  max: number
  step?: number
  steps?: number[]          // explicit step values
  marks?: boolean | number[] | Record<number, string>  // tick marks
  origin?: number           // center point (for bipolar)
  orientation?: 'horizontal' | 'vertical'

  // Advanced interaction
  pointerLock?: boolean     // infinite drag, cursor hidden
  precision?: 'normal' | 'fine'  // shift-drag for fine control
  haptic?: boolean          // vibrate on steps (mobile)

  // Display
  showValue?: boolean
  formatValue?: (n: number) => string
  fillFrom?: 'start' | 'end' | 'origin'
}
```

### Domain Knowledge

**Logarithmic scales:**
```
Linear:  0 ──────────────────── 100
Log:     0.01 ─── 0.1 ─── 1 ─── 10 ─── 100

// dB scale: -60dB to +12dB feels linear
// Frequency: 20Hz to 20kHz feels linear
// Human perception is logarithmic for many quantities
```

**Pointer lock:**
- Cursor disappears, can drag infinitely
- Essential for precision work (audio, 3D)
- Accumulates delta, not position
- Shift+drag for 10x precision

**Origin point:**
- Pan control: origin at center (0)
- EQ gain: origin at 0dB
- Fills from origin to current value

**Tactile feedback:**
- Subtle vibration on step boundaries
- Stronger vibration on snap points
- Settable by theme (terminal: none, analog: strong)

**Keyboard:**
- Arrow keys: ±1 step
- Page up/down: ±10 steps
- Home/End: min/max
- Shift+arrow: fine adjustment

---

## 5. Knob

Rotary control. Could be slider subtype, but interaction is distinct.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `bounded` | 270° arc | Volume, pan, most params |
| `infinite` | 360°+ continuous | Jog wheels, scrubbing |
| `detent` | Click stops | Stepped selection |

### Params

```ts
interface KnobParams {
  type?: 'bounded' | 'infinite' | 'detent'
  min?: number
  max?: number
  step?: number
  detents?: number[]        // snap points

  // Rotation
  startAngle?: number       // degrees, default -135
  endAngle?: number         // degrees, default +135

  // Interaction
  sensitivity?: number      // degrees per pixel
  pointerLock?: boolean

  // Visual
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  bipolar?: boolean         // center = zero
}
```

### Domain Knowledge

**Interaction modes:**
- **Circular**: Drag in circular motion (intuitive but imprecise)
- **Linear**: Drag up/down or left/right (more precise)
- **Radial**: Drag away from center = more sensitive

**Infinite knobs:**
- No min/max, accumulates turns
- Used for: jog wheels, scrolling, continuous parameters
- Reports: delta rotation, not absolute position

**Visual states:**
- Current value indicator (line, dot, fill)
- Scale marks around the arc
- Bipolar: center dot, fill from center

---

## 6. Vector

Multi-dimensional numeric values.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `inputs` | [X][Y][Z] | Precise numeric entry |
| `pad` | 2D crosshair area | Position, offset |
| `joystick` | Spring-return pad | Continuous control |
| `linked` | 🔗 X ─ Y ─ Z | Proportional values |

### Params

```ts
interface VectorParams {
  type?: 'inputs' | 'pad' | 'joystick' | 'linked'
  dimensions?: 2 | 3 | 4
  labels?: string[]         // ['X', 'Y', 'Z', 'W'] or ['R', 'G', 'B', 'A']
  min?: number | number[]
  max?: number | number[]
  step?: number | number[]

  // For pad/joystick
  bounds?: 'square' | 'circle'
  pointerLock?: boolean

  // For linked
  linkable?: boolean        // show link toggle
  linked?: boolean          // default state
}
```

### Domain Knowledge

**XY Pad:**
- Crosshair shows current position
- Can constrain to square or circle
- Grid lines optional
- Pointer lock for precision

**Joystick:**
- Springs back to center on release
- Reports delta while held
- Deadzone near center
- Used for: panning, continuous adjustment

**Linked values:**
- Lock icon to toggle linking
- Changing one changes all proportionally
- Common for: scale, size, margins

---

## 7. Select

Choice from predefined options.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `dropdown` | [Option ▼] | Many options, compact |
| `radio` | ○ A ○ B ● C | Few options, always visible |
| `buttons` | [A][B][C] | Actions or modes |
| `segmented` | [A│B│C] | Mutually exclusive modes |
| `search` | [🔍 Type...] | Many options, filterable |
| `multi` | [Tag][Tag][+] | Multiple selections |
| `chips` | Inline chips | Tags, categories |

### Params

```ts
interface SelectParams {
  type?: 'dropdown' | 'radio' | 'buttons' | 'segmented' | 'search' | 'multi' | 'chips'
  options: Array<string | { label: string, value: any, icon?: string, disabled?: boolean }>

  // For search
  searchable?: boolean
  creatable?: boolean       // allow new values

  // For multi
  maxSelections?: number

  // Display
  placeholder?: string
  clearable?: boolean
}
```

### Domain Knowledge

**Option grouping:**
```ts
options: [
  { group: 'Fruits', items: ['Apple', 'Banana'] },
  { group: 'Vegetables', items: ['Carrot', 'Potato'] }
]
```

**Virtual scrolling:**
- For very long lists (1000+ items)
- Only render visible items

**Keyboard navigation:**
- Type to filter/jump
- Arrow keys to navigate
- Enter to select
- Escape to close

---

## 8. Color

Color value in various formats.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `picker` | Full HSL/HSV wheel | Complete control |
| `swatch` | [■] click to open | Inline, space-saving |
| `swatches` | [■][■][■][■] | Preset palette |
| `input` | [#FF0000] | Direct hex entry |

### Params

```ts
interface ColorParams {
  type?: 'picker' | 'swatch' | 'swatches' | 'input'
  format?: 'hex' | 'rgb' | 'hsl' | 'hsv' | 'oklch'
  alpha?: boolean
  presets?: string[]        // preset colors

  // Picker options
  mode?: 'wheel' | 'box'    // color wheel vs SV box

  // Output
  outputFormat?: 'hex' | 'rgb' | 'hsl' | 'oklch' | 'object'
}
```

### Domain Knowledge

**Color spaces:**
```
sRGB    → What browsers render
HSL/HSV → Intuitive for humans (hue, saturation, lightness)
OKLCH   → Perceptually uniform (better for gradients, manipulation)
```

**A color picker should know:**
- Perceptual uniformity (OKLCH > HSL for even gradients)
- Gamut mapping (P3, Rec2020 displays)
- Contrast checking (WCAG against background)
- Harmony suggestions (complementary, triadic, etc.)

**Eyedropper:**
- Pick color from anywhere on screen
- Uses `EyeDropper` API (Chrome/Edge)

**History:**
- Recently used colors
- Persisted per session or globally

---

## 9. Font

Font family and typography control.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `family` | [Inter ▼] with preview | Font selection |
| `stack` | System stack builder | Fallback chains |
| `pair` | Heading + Body | Font pairing |
| `scale` | Size scale preview | Typographic rhythm |

### Params

```ts
interface FontParams {
  type?: 'family' | 'stack' | 'pair' | 'scale'

  // For family
  fonts?: string[] | 'system' | 'google' | 'custom'
  categories?: ('serif' | 'sans' | 'mono' | 'display' | 'handwriting')[]

  // For pair
  roles?: ['heading', 'body'] | ['display', 'text', 'mono']

  // For scale
  baseSize?: number
  ratio?: number  // 1.25, 1.333, 1.5, etc.
}
```

### Domain Knowledge

**Font classification:**
```
Serif       → Baskerville, Garamond, Georgia
Sans-serif  → Inter, Helvetica, Arial
Monospace   → JetBrains Mono, Fira Code
Display     → Playfair, Lobster
Handwriting → Caveat, Dancing Script
```

**Font pairing wisdom:**
- Contrast without clash (serif heading + sans body)
- Same x-height for harmony
- Shared designer/era often pairs well

**Typographic scale:**
```
1.25 (Major third):  12, 15, 18.75, 23.4, 29.3
1.333 (Perfect fourth): 12, 16, 21.3, 28.4, 37.9
1.5 (Perfect fifth): 12, 18, 27, 40.5, 60.75
```

**Loading:**
- Show font preview using actual font
- Lazy-load fonts on demand
- Show fallback while loading

---

## 10. File

File and media input.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `file` | [Browse...] | General files |
| `drop` | Drag & drop zone | Prominent upload |
| `image` | Preview + upload | Images with preview |
| `audio` | Waveform + upload | Audio with playback |
| `paste` | Paste target | Clipboard content |

### Params

```ts
interface FileParams {
  type?: 'file' | 'drop' | 'image' | 'audio' | 'paste'
  accept?: string           // MIME types: 'image/*', '.pdf,.doc'
  multiple?: boolean
  maxSize?: number          // bytes
  maxFiles?: number

  // For image
  preview?: boolean
  crop?: boolean | { aspect: number }

  // For audio
  waveform?: boolean
  playback?: boolean
}
```

### Domain Knowledge

**Validation:**
- File type validation (MIME + extension)
- Size limits with helpful messages
- Image dimension limits

**Preview:**
- Thumbnail generation
- EXIF orientation handling
- Progressive loading

**Audio:**
- Waveform visualization
- Duration display
- Playback controls

---

## 11. Graph

Read-only visualization.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `line` | Time-series line | Values over time |
| `meter` | VU-style bar | Levels, progress |
| `waveform` | Audio waveform | Audio visualization |
| `spectrum` | Frequency bars | FFT display |
| `fps` | FPS counter | Performance |

### Params

```ts
interface GraphParams {
  type?: 'line' | 'meter' | 'waveform' | 'spectrum' | 'fps'
  min?: number
  max?: number
  history?: number          // buffer size for line

  // Display
  color?: string
  fill?: boolean
  grid?: boolean

  // For meter
  peak?: boolean            // show peak hold
  stereo?: boolean          // L/R channels

  // For spectrum
  fftSize?: number
  smoothing?: number
}
```

### Domain Knowledge

**Time-series:**
- Efficient ring buffer for history
- RequestAnimationFrame for smooth updates
- Auto-scaling Y axis option

**Audio metering:**
- Peak hold (slow decay)
- RMS vs peak display
- dBFS scale

**Spectrum:**
- Logarithmic frequency scale
- Smoothing for visual appeal
- Octave bands vs linear bins

---

## 12. Curve

Bezier and envelope editors.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `bezier` | Cubic bezier | Easing curves |
| `envelope` | ADSR shape | Audio envelopes |
| `spline` | Multi-point | Complex curves |
| `gradient` | Color gradient | Color transitions |

### Params

```ts
interface CurveParams {
  type?: 'bezier' | 'envelope' | 'spline' | 'gradient'

  // For bezier
  presets?: Array<[number, number, number, number]>  // P1x, P1y, P2x, P2y

  // For envelope
  stages?: ('attack' | 'decay' | 'sustain' | 'release')[]

  // For spline
  maxPoints?: number
  closed?: boolean

  // For gradient
  colorSpace?: 'srgb' | 'oklch'
  stops?: Array<{ position: number, color: string }>
}
```

### Domain Knowledge

**Bezier easing:**
- Standard presets: ease, ease-in, ease-out, ease-in-out
- CSS-compatible output: `cubic-bezier(0.4, 0, 0.2, 1)`
- Visual grid showing input vs output

**ADSR envelope:**
- Attack: time to reach peak
- Decay: time to reach sustain level
- Sustain: level while held
- Release: time to reach zero
- Output: array of points or parameterized

**Gradient:**
- Add/remove/move color stops
- Interpolation in perceptual space (OKLCH)
- Output as CSS gradient or stop array

---

## 13. Folder

Grouping and structure.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `folder` | ▶ Collapsible | Grouped settings |
| `section` | — Header — | Non-collapsible group |
| `tabs` | [A][B][C] | Alternative views |
| `row` | Inline group | Compact related inputs |

### Params

```ts
interface FolderParams {
  type?: 'folder' | 'section' | 'tabs' | 'row'
  label?: string
  collapsed?: boolean       // for folder
  icon?: string

  // For tabs
  tabs?: string[]
}
```

---

## 14. Custom

Escape hatch for anything else.

### Params

```ts
interface CustomParams {
  render: (container: HTMLElement, value: any, onChange: (v: any) => void) => void | (() => void)
  value?: any

  // Optional standard params
  label?: string
  width?: number | string
  height?: number | string
}
```

### Example

```js
settings({
  myWidget: {
    type: 'custom',
    value: { x: 0, y: 0 },
    render(el, value, onChange) {
      // Create your UI
      const canvas = document.createElement('canvas')
      el.appendChild(canvas)

      // Return cleanup function
      return () => canvas.remove()
    }
  }
})
```

---

## 15. Button

Action triggers and CTAs. Unlike boolean (stateful), button is for **triggering actions**.

### Subtypes

| Subtype | Visual | Best for |
|---------|--------|----------|
| `action` | [Save] | Single action (default) |
| `group` | [A][B][C] | Related actions row |
| `split` | [Save ▼] | Primary + overflow menu |
| `toggle` | [●] / [○] | Stateful toggle |
| `icon` | [🔊] | Compact, icon-only |

### Params

```ts
interface ButtonParams {
  type?: 'action' | 'group' | 'split' | 'toggle' | 'icon'

  // Content
  label?: string | Signal<string>
  icon?: string | Signal<string>

  // Style
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'

  // State
  disabled?: boolean | Signal<boolean>
  loading?: boolean | Signal<boolean>
  pressed?: boolean | Signal<boolean>  // for toggle

  // Interaction
  onClick?: () => void | Promise<void>
  onToggle?: (pressed: boolean) => void
  confirm?: boolean | string  // require double-click

  // For group
  buttons?: Array<{
    label?: string
    icon?: string
    onClick: () => void
    disabled?: boolean | Signal<boolean>
  }>

  // For split
  primary?: { label: string, icon?: string, onClick: () => void }
  menu?: Array<{ label: string, icon?: string, onClick: () => void }>
}
```

### Inference

```js
settings({
  // Function → button:action
  save: () => saveDocument(),

  // Named function → label from name
  'Save Document': () => save(),

  // Async function → shows loading state
  sync: async () => await syncData(),
})
```

### Examples

```js
settings({
  // Simple action
  reset: () => resetAll(),

  // Styled CTA
  publish: {
    type: 'button',
    label: 'Publish',
    variant: 'primary',
    icon: 'upload',
    onClick: () => publish()
  },

  // Destructive with confirmation
  delete: {
    type: 'button',
    label: 'Delete',
    variant: 'danger',
    confirm: 'Delete permanently?',
    onClick: () => deleteItem()
  },

  // Button group (toolbar style)
  alignment: {
    type: 'button:group',
    buttons: [
      { icon: 'align-left', onClick: () => align('left') },
      { icon: 'align-center', onClick: () => align('center') },
      { icon: 'align-right', onClick: () => align('right') },
    ]
  },

  // Toggle button
  mute: {
    type: 'button:toggle',
    icon: 'volume',
    pressed: isMuted,  // signal
    onToggle: (muted) => setMute(muted)
  },

  // Split button (primary + menu)
  export: {
    type: 'button:split',
    primary: { label: 'Export PNG', onClick: () => exportPNG() },
    menu: [
      { label: 'Export SVG', onClick: () => exportSVG() },
      { label: 'Export PDF', onClick: () => exportPDF() },
    ]
  }
})
```

### Domain Knowledge

- **Async handling**: Show loading spinner, disable during async operation
- **Confirm pattern**: Double-click or modal for destructive actions
- **Keyboard**: Enter/Space to activate
- **Touch**: Min 44px touch target
- **Focus management**: After action, where does focus go?

---

## Component Relationships

```
number ──┬── slider (constrained, visual)
         └── knob (constrained, rotary)

text ────┬── textarea (multiline)
         ├── code (syntax)
         └── json (validated)

select ──┬── radio (always visible)
         ├── buttons (action-like)
         └── segmented (ios-style)

file ────┬── image (preview)
         └── audio (waveform)

graph ───┬── meter (level)
         ├── waveform (audio)
         └── spectrum (fft)

curve ───┬── bezier (easing)
         ├── envelope (adsr)
         └── gradient (color)
```

---

## Control Signatures

Every control follows this pattern:

```ts
interface Control<T> {
  // Identity
  type: string
  subtype?: string

  // Value
  value: T

  // Binding
  key?: string              // state key to bind
  onChange?: (value: T) => void

  // Display
  label?: string | { text: string, icon?: string }
  icon?: string             // icon-only (label becomes tooltip)
  disabled?: boolean
  hidden?: boolean

  // Help
  description?: string      // Always visible, below control
  tooltip?: string          // On hover/focus, additional context

  // Layout
  width?: number | string
  inline?: boolean
}
```

```
LABEL ONLY (default)
┌──────────────────────────────┐
│ Volume          [────●────]  │
└──────────────────────────────┘

ICON + LABEL
┌──────────────────────────────┐
│ 🔊 Volume       [────●────]  │
└──────────────────────────────┘

ICON ONLY (label becomes tooltip)
┌──────────────────────────────┐
│ 🔊              [────●────]  │  ← hover shows "Volume"
└──────────────────────────────┘

WITH DESCRIPTION (always visible)
┌──────────────────────────────┐
│ Volume          [────●────]  │
│ Controls the master output   │  ← description
└──────────────────────────────┘

WITH TOOLTIP (on hover)
┌──────────────────────────────┐
│ Volume          [────●────]  │
│               ┌─────────────┐│
│               │Shift+drag   ││  ← tooltip
│               │for precision││
│               └─────────────┘│
└──────────────────────────────┘
```

## Inference Rules

Automatic type detection from values. The goal: **write values, get controls**.

### Basic Type Inference

```js
settings({
  // BOOLEAN → toggle
  enabled: true,
  visible: false,

  // NUMBER → depends on value
  count: 42,               // → number:input (integer)
  volume: 0.5,             // → slider (0-1 float detected)
  angle: 180,              // → number:input (or slider if in common range)

  // STRING → depends on content
  name: 'hello',           // → text:input
  bio: 'Multi\nline',      // → text:textarea (contains newline)
  color: '#ff0000',        // → color:swatch
  color2: 'rgb(255,0,0)',  // → color:swatch
  color3: 'hsl(0,100%,50%)', // → color:swatch

  // ARRAY → depends on contents
  position: [0, 0],        // → vector:inputs (2d, numbers)
  position3d: [0, 0, 0],   // → vector:inputs (3d)
  rgba: [255, 0, 0, 1],    // → color (4 numbers, last ≤1)
  options: ['a', 'b', 'c'], // → select:dropdown (strings)

  // FUNCTION → button
  onClick: () => {},
  reset: () => state.reset(),

  // OBJECT → folder (recursive)
  transform: {
    x: 0,
    y: 0,
    scale: 1,
  },
})
```

### Inference Heuristics

**Numbers:**
```js
// 0-1 float → slider (normalized range)
opacity: 0.5,        // → slider { min: 0, max: 1 }

// Integer → number input
count: 42,           // → number:input

// Common angle ranges → slider with marks
rotation: 90,        // → slider { min: 0, max: 360, marks: [0, 90, 180, 270] }
// (heuristic: 0, 90, 180, 270, 360 are angle-like)

// Negative values → bipolar slider
pan: 0,              // → slider { min: -1, max: 1, origin: 0 }
// (heuristic: default 0, common audio/position pattern)
```

**Strings:**
```js
// Hex color
color: '#ff0000',    // → color:swatch

// RGB/HSL color
color: 'rgb(255, 0, 0)',     // → color:swatch
color: 'hsl(0, 100%, 50%)',  // → color:swatch

// URL pattern
url: 'https://...',  // → text:input (with URL validation)

// Email pattern
email: 'a@b.com',    // → text:input (with email validation)

// Multi-line
text: 'line1\nline2', // → text:textarea

// JSON-like
data: '{"a": 1}',    // → text:code (language: json)
```

**Arrays:**
```js
// Numbers → vector
[0, 0]           // → vector:inputs (2d)
[0, 0, 0]        // → vector:inputs (3d)
[0, 0, 0, 0]     // → vector:inputs (4d)

// 4 numbers with last ≤1 → color (rgba)
[255, 0, 0, 0.5] // → color:picker (rgba detected)

// Strings → select (first = value, rest = options)
['apple', 'banana', 'cherry']
// → select:dropdown { value: 'apple', options: ['apple', 'banana', 'cherry'] }

// Mixed → custom handling needed
```

**Objects:**
```js
// Plain object → folder
{
  position: { x: 0, y: 0 },  // → folder "position" with x, y controls
}

// Object with `value` or `type` key → explicit control config
{
  volume: { value: 0.5, min: 0, max: 1, step: 0.01 },
  // → slider with explicit params
}
```

### Explicit Type Override

When inference isn't right, specify explicitly:

```js
settings({
  // Force slider for integer
  level: { type: 'slider', value: 5, min: 0, max: 10 },

  // Force number input for 0-1 float
  precise: { type: 'number', value: 0.5, step: 0.001 },

  // Force textarea for single line
  notes: { type: 'text:textarea', value: '' },

  // Force specific select style
  mode: {
    type: 'select:segmented',
    value: 'a',
    options: ['a', 'b', 'c']
  },

  // Specify knob instead of slider
  pan: { type: 'knob', value: 0, min: -1, max: 1 },
})
```

### Type Syntax

```
type: 'control'           // default subtype
type: 'control:subtype'   // explicit subtype

// Examples:
'boolean'          → boolean:toggle
'boolean:checkbox' → boolean:checkbox
'slider'           → slider:linear
'slider:log'       → slider:log
'select'           → select:dropdown
'select:segmented' → select:segmented
```

### Value + Options Pattern

```js
settings({
  // Shorthand: array of strings
  fruit: ['apple', 'banana', 'cherry'],
  // → select, value = 'apple', options = all

  // Explicit: object with value + options
  fruit: {
    value: 'banana',  // current value
    options: ['apple', 'banana', 'cherry'],
  },
  // → select, value = 'banana'

  // With labels
  size: {
    value: 'm',
    options: [
      { value: 's', label: 'Small' },
      { value: 'm', label: 'Medium' },
      { value: 'l', label: 'Large' },
    ],
  },
})
```

### Special Patterns

```js
settings({
  // Range slider (two values)
  range: [20, 80],           // → slider:range { value: [20, 80] }

  // Explicit range
  frequency: {
    type: 'slider:range',
    value: [200, 2000],
    min: 20,
    max: 20000,
    log: true,
  },

  // Button with label
  save: {
    type: 'button',
    label: 'Save',
    onClick: () => save()
  },
  // or just:
  'Save': () => save(),  // key becomes label

  // Read-only display
  fps: { type: 'graph:fps', value: fpsSignal },

  // File input
  image: { type: 'file:image', value: null },
})
```

### Nested Folders

```js
settings({
  // Auto-folder from object
  transform: {
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: 1,
  },
  // Creates:
  // └─ Transform (folder)
  //    ├─ Position (folder)
  //    │  ├─ X (number)
  //    │  └─ Y (number)
  //    ├─ Rotation (slider)
  //    └─ Scale (number)

  // Explicit folder with options
  appearance: {
    type: 'folder',
    collapsed: true,
    children: {
      color: '#ff0000',
      opacity: 0.8,
    },
  },
})
```

### Inference Priority

When multiple interpretations are possible:

```
1. Explicit type wins             { type: 'slider', value: 5 }
2. Value or type key triggers object mode { value: 0.5, min: 0, max: 1 }
3. Content-based heuristics       '#ff0000' → color
4. Type-based fallback            number → number:input
```

### Edge Cases

```js
settings({
  // Empty string → text:input (not inferred)
  name: '',

  // null/undefined → hidden or error
  nothing: null,  // likely error or skip

  // Empty array → need explicit type
  items: [],  // ambiguous, needs { type: 'select', options: [] }

  // Single-item array → still select (with one option)
  only: ['one'],

  // Very large number → number:input (not slider)
  big: 1000000,

  // Negative float → might be bipolar slider
  balance: -0.3,  // → slider { min: -1, max: 1 }? or number?
})
```

### Customizing Inference

```js
// Global inference rules
settings.inference = {
  // Custom pattern matcher
  patterns: [
    { match: /^#[0-9a-f]{6}$/i, type: 'color' },
    { match: v => v >= 0 && v <= 1, type: 'slider' },
  ],

  // Disable auto-inference
  strict: true,  // require explicit types
}
```

**Inference heuristics:**
- `true/false` → boolean
- `0-1` float → slider with 0-1 range
- Integer → number
- String starting with `#` or `rgb`/`hsl` → color
- Array of 2-4 numbers → vector
- Array of strings → select (first is value)
- Function → button
- Object → folder (recursive)


## Coverage Matrix

| Use Case | Control | Subtype | Key Feature |
|----------|---------|---------|-------------|
| On/off toggle | boolean | toggle | iOS-style |
| Feature flag | boolean | checkbox | Traditional |
| Volume control | slider | log | Logarithmic feel |
| Frequency | slider | log | 20Hz-20kHz |
| Pan left/right | slider | linear | Bipolar, origin=0 |
| Discrete steps | slider | stepped | Snap points |
| Min/max range | slider | range | Two handles |
| Rotary control | knob | bounded | Analog feel |
| Jog wheel | knob | infinite | DJ-style |
| Position | vector | pad | 2D crosshair |
| Joystick | vector | joystick | Spring-return |
| Scale (locked) | vector | linked | Proportional |
| Preset select | select | segmented | iOS-style |
| Font choice | font | family | Preview |
| Theme color | color | picker | Full control |
| Accent color | color | swatch | Compact |
| File upload | file | drop | Drag & drop |
| Audio preview | file | audio | Waveform |
| FPS display | graph | fps | Performance |
| Audio level | graph | meter | VU-style |
| Easing curve | curve | bezier | Animation |
| Color ramp | curve | gradient | Transitions |


## Specialized Domain Controls

Controls that know specific domains deeply. Could be core or plugins.

### Pen / Path
**Domain:** Drawing, SVG, vector graphics

```
┌─────────────────────────┐
│    ●───●                │
│       \                 │
│        ●──●             │
│            \___●        │
└─────────────────────────┘
```

| Subtype | Output | Use case |
|---------|--------|----------|
| `freehand` | Point array | Signatures, sketches |
| `bezier` | SVG path | Smooth curves |
| `polygon` | Point array | Shapes, regions |
| `line` | Start/end points | Connections |

**Domain knowledge:**
- Pressure sensitivity (stylus)
- Smoothing algorithms
- Simplification (reduce points)
- SVG path syntax (`M`, `L`, `C`, `Q`)
- Closed vs open paths

**Fits:** Own control `pen` or `path`

---

### Piano / Keyboard
**Domain:** Music, MIDI, audio

```
┌─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┐
│ │█││█│ │ │█││█││█│ │
│ │█││█│ │ │█││█││█│ │
│ └┬┘└┬┘ │ └┬┘└┬┘└┬┘ │
│  │  │  │  │  │  │  │
└──┴──┴──┴──┴──┴──┴──┘
   C  D  E  F  G  A  B
```

| Subtype | Output | Use case |
|---------|--------|----------|
| `note` | Single note | Note selection |
| `chord` | Note array | Chord input |
| `range` | [low, high] | Range selection |
| `roll` | Note + velocity + time | Sequencer |

**Domain knowledge:**
- MIDI note numbers (60 = C4)
- Note names (C, C#, Db)
- Octave ranges
- Velocity sensitivity
- Frequency conversion (440Hz = A4)

**Output formats:**
```js
{ note: 'C4', midi: 60, freq: 261.63, velocity: 0.8 }
```

**Fits:** Plugin `piano` — niche but deep domain

---

### Matrix
**Domain:** Transforms, graphics, math

```
┌─────────────────┐
│ 1.0  0.0  0.0  │
│ 0.0  1.0  0.0  │
│ 0.0  0.0  1.0  │
└─────────────────┘
```

| Subtype | Size | Use case |
|---------|------|----------|
| `2x2` | 4 values | 2D rotation/scale |
| `3x3` | 9 values | 2D transform + translate |
| `4x4` | 16 values | 3D transform |
| `color` | 4x5 | Color matrix filter |
| `kernel` | 3x3, 5x5 | Convolution filters |

**Domain knowledge:**
- Identity matrix presets
- Common transforms (rotate, scale, skew)
- Matrix multiplication preview
- Determinant (invertibility)
- Decomposition (separate rotation/scale/translation)

**Fits:** Own control `matrix` or `vector:matrix`

---

### EQ / Equalizer
**Domain:** Audio, frequency, mixing

```
      │    ●
      │   ╱ ╲      ●
   0dB├──●───╲────╱─●──
      │       ╲  ╱
      │        ●
      └──────────────────
      20Hz           20kHz
```

| Subtype | Output | Use case |
|---------|--------|----------|
| `graphic` | Band gains array | Fixed bands |
| `parametric` | [{freq, gain, Q}] | Adjustable bands |
| `shelf` | {low, high} | Simple tone |
| `curve` | Transfer function | Visual EQ |

**Domain knowledge:**
- Frequency scales (logarithmic)
- dB gain scales
- Q factor (bandwidth)
- Filter types (lowpass, highpass, peak, shelf, notch)
- Frequency response visualization
- Common presets (flat, bass boost, vocal, etc.)

**Fits:** Plugin `eq` — specialized audio domain

---

### Shader / GLSL
**Domain:** Graphics, WebGL, visual effects

```
┌─────────────────────────┐
│ uniform float time;     │
│ void main() {           │
│   vec2 uv = gl_Frag...  │
│   gl_FragColor = ...    │
│ }                       │
├─────────────────────────┤
│ [Live Preview Canvas]   │
└─────────────────────────┘
```

| Subtype | Features |
|---------|----------|
| `fragment` | Fragment shader editor |
| `vertex` | Vertex shader editor |
| `full` | Both + uniforms panel |

**Domain knowledge:**
- GLSL syntax highlighting
- Uniform extraction & auto-binding
- Error messages with line numbers
- Live preview with hot reload
- Common uniforms (time, resolution, mouse)
- Texture slot management

**Beyond text:code because:**
- Live visual preview
- Uniform introspection
- Error visualization in preview
- Performance metrics

**Fits:** Plugin `shader` — needs WebGL context

---

### Mic / Audio Input
**Domain:** Recording, voice, real-time audio

```
┌─────────────────────────────┐
│  ◉ REC   ▁▃▅▇▅▃▁▂▄▆▄▂     │
│          ════════════       │
│  00:03.2        [■ Stop]    │
└─────────────────────────────┘
```

| Subtype | Output | Use case |
|---------|--------|----------|
| `record` | Audio blob | Voice memos, recordings |
| `stream` | MediaStream | Real-time processing |
| `level` | Number (0-1) | Input monitoring |
| `pitch` | Frequency | Tuners, pitch detection |
| `speech` | Text | Voice-to-text |

**Domain knowledge:**
- getUserMedia API / permissions
- Audio context, sample rate
- Recording state machine (idle → recording → paused → stopped)
- Waveform visualization (live)
- Level metering (RMS, peak)
- Audio encoding (wav, webm, mp3)
- Device selection (which mic)

**Output formats:**
```js
// record
{ blob: Blob, duration: 3.2, format: 'webm' }

// stream
{ stream: MediaStream, analyser: AnalyserNode }

// level
0.73  // current RMS level 0-1

// pitch
{ freq: 440, note: 'A4', cents: +5 }

// speech
{ text: 'hello world', confidence: 0.95 }
```

**Fits:** Could be:
- `file:mic` (alongside file:audio for uploads)
- Own control `mic` (distinct interaction)
- Plugin (needs Web Audio API, permissions)

**Distinction from file:audio:**
| | file:audio | mic |
|--|------------|-----|
| Source | Existing file | Live capture |
| Interaction | Upload/preview | Record/monitor |
| Output | File reference | Audio blob/stream |
| Permissions | None | Microphone access |

---

### Waveform / Oscillator
**Domain:** Audio synthesis, sound design

```
┌─────────────────────────┐
│ ╱╲  ╱╲  ╱╲  ╱╲  ╱╲     │  sine
│╱  ╲╱  ╲╱  ╲╱  ╲╱  ╲    │
├─────────────────────────┤
│ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐    │  square
│─┘ └─┘ └─┘ └─┘ └─┘ └    │
└─────────────────────────┘
```

| Subtype | Output |
|---------|--------|
| `basic` | Waveform type select |
| `custom` | Wavetable array |
| `additive` | Harmonic amplitudes |

**Domain knowledge:**
- Basic waveforms (sine, square, saw, triangle)
- Harmonics and overtones
- Wavetable synthesis
- PWM (pulse width)

**Fits:** Could be `select:waveform` or plugin `oscillator`

---

## Control Placement Summary

| Control | Where it fits | Why |
|---------|---------------|-----|
| **pen** | Own control or `curve:path` | 2D freeform, unique interaction |
| **piano** | Plugin | Niche domain, deep MIDI knowledge |
| **matrix** | Own control | Grid layout, transform math |
| **eq** | Plugin | Audio-specific, complex viz |
| **shader** | Plugin | Needs WebGL, live preview |
| **waveform** | `select:waveform` or plugin | Could be simple select or full editor |
| **mic** | `file:mic` or plugin | Needs permissions, Web Audio API |

---

## Future / Plugin Candidates

| Control | Domain | Why Plugin |
|---------|--------|------------|
| `date` | Calendar picker | Date lib dependency, locale |
| `time` | Time picker | Locale complexity |
| `piano` | Musical keyboard | MIDI knowledge |
| `eq` | Equalizer | Audio-specific |
| `shader` | GLSL editor | WebGL dependency |
| `spring` | Physics params | Animation-specific |
| `path` | SVG path editor | Complex drawing UI |
| `matrix` | Transform matrix | 3D-specific math |
| `code` | Full editor | Monaco/CM dependency |
| `spectrum` | FFT display | Web Audio dependency |
| `envelope` | ADSR editor | Audio synthesis |
| `mic` | Audio recording | Permissions, Web Audio |
| `camera` | Video/photo capture | Permissions, MediaStream |

---

## Resolved Questions

1. **Knob vs Slider** → **Separate control**
   - Interaction is fundamentally different (rotary vs linear)
   - Knob has unique concerns: arc angle, infinite rotation, detents
   - Slider has unique concerns: range handles, orientation, marks
   - Both share: min/max, step, pointer lock — but that's params, not identity

2. **Vector dimensions** → **Param, not subtype**
   - `dimensions: 2 | 3 | 4` is cleaner than `vector2`, `vector3`
   - The interaction (pad, inputs, joystick) is the subtype
   - Dimension count is just configuration

3. **Color format** → **Configurable, preserve input**
   - Input `#ff0000` → output `#ff0000` (unless told otherwise)
   - Internal math in OKLCH for perceptual correctness
   - `outputFormat` param for explicit conversion

4. **Graph interactivity** → **Read-only by default**
   - Graphs visualize, they don't edit
   - If you need editable time-series → use `curve:spline`
   - Keep concerns separated

5. **Gradient** → **Under `curve`, not `color`**
   - Gradient is multi-stop interpolation — that's a curve
   - `color` is single value selection
   - `curve:gradient` is the right home

---

## Deep Domain Knowledge

### Slider: Audio Domain

A slider for audio **must** understand:

```
LINEAR (position)    LOGARITHMIC (volume)    LOGARITHMIC (frequency)
0 ─────── 100        -∞dB ──── 0dB           20Hz ──────── 20kHz
                     ▲                        ▲
                     Perceived loudness       Perceived pitch
                     doubles every +6dB       doubles every octave
```

**dB Scale implementation:**
```js
// UI position (0-1) → dB value
function posToDB(pos, minDB = -60, maxDB = 6) {
  if (pos === 0) return -Infinity
  return minDB + pos * (maxDB - minDB)
}

// dB value → UI position (0-1)
function dbToPos(db, minDB = -60, maxDB = 6) {
  if (db === -Infinity) return 0
  return (db - minDB) / (maxDB - minDB)
}
```

**Frequency scale implementation:**
```js
// UI position (0-1) → frequency
function posToFreq(pos, minHz = 20, maxHz = 20000) {
  return minHz * Math.pow(maxHz / minHz, pos)
}

// Frequency → UI position (0-1)
function freqToPos(freq, minHz = 20, maxHz = 20000) {
  return Math.log(freq / minHz) / Math.log(maxHz / minHz)
}
```

### Slider: Precision Interaction

**Pointer lock mode:**
```
Normal drag:     Cursor follows thumb, limited to track width
Pointer lock:    Cursor disappears, infinite drag accumulates delta

When to use:
- Fine parameter adjustment (audio, 3D)
- Values that benefit from > 1000 steps of precision
- Professional tools expecting this behavior
```

**Multi-precision:**
```
Normal drag:       1x precision (1px = 1 step)
Shift + drag:      0.1x precision (10px = 1 step)
Ctrl + drag:       10x precision (1px = 10 steps)

Distance from track:
- Dragging further from track = finer control
- Like Ableton Live's vertical distance sensitivity
```

### Knob: Interaction Models

Three ways to interact with a rotary control:

```
CIRCULAR (intuitive, imprecise)
┌─────────────┐
│      ●      │  Drag in circular motion around center
│    ╱   ╲    │  Natural but hard to be precise
│   ●     ●   │  Good for: quick adjustments
│    ╲   ╱    │
│      ●      │
└─────────────┘

LINEAR (precise, less intuitive)
┌─────────────┐
│      ↑      │  Drag up/down or left/right
│      │      │  Precise and predictable
│    ●─┼─●    │  Good for: fine tuning
│      │      │
│      ↓      │
└─────────────┘

RADIAL (adaptive)
┌─────────────┐
│    ╲   ╱    │  Sensitivity based on distance from center
│     ╲ ╱     │  Close = coarse, far = fine
│ ─────●───── │  Best of both worlds
│     ╱ ╲     │  Used by: Native Instruments, Ableton
│    ╱   ╲    │
└─────────────┘
```

### Knob: Infinite Rotation

For jog wheels, scrolling, unbounded parameters:

```js
interface InfiniteKnob {
  // No min/max - accumulates forever
  value: number           // Current accumulated value
  sensitivity: number     // Degrees per unit
  acceleration: boolean   // Faster spin = faster change

  // Reports delta, not absolute
  onChange: (delta: number) => void
}
```

**Use cases:**
- DJ jog wheels (scrubbing audio)
- Timeline scrubbing
- Unbounded numeric input
- Scroll/zoom controls

### Color: Perceptual Correctness

**The problem with HSL:**
```
HSL "50% lightness" at different hues:
  Yellow (60°):  Very bright (L* ≈ 97 in CIELAB)
  Blue (240°):   Quite dark (L* ≈ 32 in CIELAB)

Result: "Uniform" lightness slider produces wildly different perceived brightness
```

**OKLCH solves this:**
```
OKLCH uses perceptually uniform lightness
  L = 0.5 looks equally bright regardless of hue
  Chroma (C) is perceptually uniform saturation
  Hue (H) has more even perceptual spacing

For gradients, harmonies, and manipulation: always use OKLCH internally
```

**Gamut mapping:**
```
sRGB gamut:  The colors most displays can show
P3 gamut:    Wider, modern Apple displays
OKLCH can represent colors outside sRGB

When user picks out-of-gamut color:
1. Show warning indicator
2. Offer gamut-mapped alternative
3. Store original, display mapped
```

### Font: Classification System

```
SERIF
├── Old Style (Garamond, Palatino) — humanist, organic
├── Transitional (Baskerville, Georgia) — refined, balanced
├── Modern/Didone (Bodoni, Didot) — high contrast, elegant
└── Slab (Rockwell, Roboto Slab) — heavy serifs, sturdy

SANS-SERIF
├── Grotesque (Helvetica, Arial) — neutral, ubiquitous
├── Neo-grotesque (Univers, SF Pro) — refined grotesque
├── Geometric (Futura, Avenir) — circle/square based
└── Humanist (Fira, Source Sans) — calligraphic roots

MONOSPACE
├── Traditional (Courier) — typewriter style
├── Modern (JetBrains Mono, Fira Code) — ligatures, readable
└── Stylized (Space Mono, IBM Plex Mono) — personality

DISPLAY
├── Decorative — attention-grabbing headlines
├── Script — handwriting simulation
└── Novelty — themed, expressive
```

### Font: Pairing Heuristics

```
SAFE PAIRS (contrast without clash)
  Serif heading + Sans body       (classic)
  Geometric heading + Humanist body (modern)
  Display heading + Neutral body  (editorial)

SAME FAMILY (guaranteed harmony)
  Roboto + Roboto Slab
  IBM Plex Sans + IBM Plex Serif + IBM Plex Mono

MATCH X-HEIGHT (visual harmony)
  Fonts with similar x-height align better
  Check: lowercase letters should appear same size

MATCH ERA/DESIGNER
  Fonts from same period or designer often pair well
  Futura + Memphis (both 1920s geometric)
```

### Font: Typographic Scale

```
RATIO OPTIONS
  1.067  Minor second   (tight)
  1.125  Major second   (compact)
  1.200  Minor third    (readable)
  1.250  Major third    (comfortable) ← default
  1.333  Perfect fourth (spacious)
  1.414  Augmented fourth
  1.500  Perfect fifth  (dramatic)
  1.618  Golden ratio   (classic)

GENERATED SCALE (base: 16px, ratio: 1.25)
  xs:    10.24px
  sm:    12.80px
  base:  16.00px
  lg:    20.00px
  xl:    25.00px
  2xl:   31.25px
  3xl:   39.06px
```

### Vector: XY Pad Precision

**Pointer lock for pads:**
```
Without pointer lock:
  - Limited to pad boundaries
  - Cursor position = value position
  - Max precision = pad pixel width

With pointer lock:
  - Cursor disappears
  - Infinite drag in any direction
  - Accumulates delta
  - Shift + drag for 10x precision
  - Essential for precise positioning
```

**Grid and guides:**
```
- Optional snap grid
- Magnetic center (snap to 0,0)
- Magnetic edges (snap to boundaries)
- Crosshair lines extending to edges
- Coordinate display (optional)
```

---

## Theme × Control Interaction

Controls render differently based on theme physics:

### Boolean Toggle

```css
/* Swiss: minimal, functional */
[data-theme="swiss"] .toggle {
  border: 1px solid var(--border);
  background: var(--muted);
  border-radius: 999px;
}
[data-theme="swiss"] .toggle.on {
  background: var(--accent);
}

/* Terminal: raw, angular */
[data-theme="terminal"] .toggle {
  border: 1px solid currentColor;
  background: transparent;
  border-radius: 0;
}
[data-theme="terminal"] .toggle.on::before {
  content: '●';
}

/* Analog: physical, dimensional */
[data-theme="analog"] .toggle {
  background: linear-gradient(to bottom, var(--muted), var(--surface));
  box-shadow:
    inset 0 1px 2px rgba(0,0,0,0.2),
    0 1px 0 rgba(255,255,255,0.1);
  border-radius: 999px;
}

/* Neo: bold, offset shadows */
[data-theme="neo"] .toggle {
  border: 2px solid black;
  box-shadow: 3px 3px 0 black;
  border-radius: 999px;
}
```

### Slider Track

```css
/* Swiss: hairline */
.track { height: 2px; background: var(--border); }

/* Terminal: visible structure */
.track { height: 1px; background: currentColor; }

/* Analog: dimensional groove */
.track {
  height: 6px;
  background: var(--muted);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
  border-radius: 3px;
}

/* Morphism: inset soft */
.track {
  height: 8px;
  background: var(--bg);
  box-shadow:
    inset 2px 2px 4px rgba(0,0,0,0.1),
    inset -2px -2px 4px rgba(255,255,255,0.7);
  border-radius: 4px;
}
```

### Knob Rendering

```css
/* Swiss: pure circle, accent fill */
.knob {
  background: var(--accent);
  border: none;
  box-shadow: none;
}

/* Analog: 3D, metallic */
.knob {
  background: linear-gradient(135deg, #e0e0e0, #a0a0a0);
  border: 1px solid #888;
  box-shadow:
    0 2px 4px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.5);
}
.knob::after {
  /* indicator line */
  background: #333;
  box-shadow: 0 0 2px rgba(0,0,0,0.5);
}

/* Terminal: minimal indicator */
.knob {
  background: transparent;
  border: 1px solid currentColor;
}
.knob::after {
  background: currentColor;
}
```

---

## Implementation Notes

### Value Normalization

All controls internally work with normalized values where possible:

```js
// Slider stores 0-1 internally
// Converts to user range on read/write
class Slider {
  #normalized = 0.5

  get value() {
    return this.#denormalize(this.#normalized)
  }

  set value(v) {
    this.#normalized = this.#normalize(v)
  }

  #normalize(v) {
    if (this.log) {
      return Math.log(v / this.min) / Math.log(this.max / this.min)
    }
    return (v - this.min) / (this.max - this.min)
  }

  #denormalize(n) {
    if (this.log) {
      return this.min * Math.pow(this.max / this.min, n)
    }
    return this.min + n * (this.max - this.min)
  }
}
```

### Event Debouncing

```js
// High-frequency controls (slider, knob, pad) need throttling
// But final value must always fire

class Control {
  #rafId = null
  #pendingValue = null

  setValue(v) {
    this.#pendingValue = v

    if (!this.#rafId) {
      this.#rafId = requestAnimationFrame(() => {
        this.onChange?.(this.#pendingValue)
        this.#rafId = null
      })
    }
  }

  // On pointer up, flush immediately
  commit() {
    if (this.#rafId) {
      cancelAnimationFrame(this.#rafId)
      this.#rafId = null
    }
    if (this.#pendingValue !== null) {
      this.onChange?.(this.#pendingValue)
      this.#pendingValue = null
    }
  }
}
```

### Keyboard Navigation

Every control must be fully keyboard accessible:

```
FOCUS
  Tab / Shift+Tab    Move between controls

BOOLEAN
  Space / Enter      Toggle

NUMBER / SLIDER / KNOB
  ↑ / →              Increment
  ↓ / ←              Decrement
  Shift + arrow      Fine (0.1x)
  Ctrl + arrow       Coarse (10x)
  Home               Min value
  End                Max value

SELECT
  ↑ / ↓              Navigate options
  Enter              Select
  Escape             Close
  Type               Filter/jump

VECTOR PAD
  Arrow keys         Move in direction
  Shift + arrow      Fine movement

COLOR
  Arrow keys         Navigate picker
  Tab                Switch between H/S/L
```

---

## Reactive Architecture

Any param can be a signal. When a signal changes, the control must update.

### The Problem

```js
settings({
  volume: volumeSignal,              // signal, updates externally
  disabled: isProcessing,            // signal
  options: availableOptions,         // signal, list can change
  label: computed(() => `Vol: ${volumeSignal.value}`)  // derived
})

// When volumeSignal changes → slider must update
// When isProcessing changes → control must disable
// When options change → dropdown must rebuild
```

### Architecture Options

**Option A: Template-based (Sprae)**
```js
// Current approach
const template = `
  <input type="range" :value="_val" :disabled="disabled" />
`
sprae(el, { _val: signal(0.5), disabled: signal(false) })

// ✓ Declarative, clean templates
// ✓ Already in use
// ✗ Templates are static structure
// ✗ Hard to do conditional rendering
// ✗ Rebuilding complex controls (dropdowns) is awkward
```

**Option B: Tagged templates (htm)**
```js
import { html, render } from 'htm/preact'

function Slider({ value, onChange, disabled }) {
  return html`
    <input
      type="range"
      value=${value}
      disabled=${disabled}
      onInput=${e => onChange(+e.target.value)}
    />`
}

// ✓ JSX-like, full JS power
// ✓ Conditional rendering easy
// ✓ Works with signals (Preact Signals)
// ✗ Adds dependency (preact/htm)
// ✗ Virtual DOM overhead
```

**Option C: Fine-grained signals (SolidJS-style)**
```js
import { signal, effect } from './signals'

function slider(params) {
  const el = document.createElement('div')
  const input = document.createElement('input')
  input.type = 'range'

  // Subscribe to signals directly
  effect(() => {
    input.value = params.value()
  })
  effect(() => {
    input.disabled = params.disabled?.() ?? false
  })

  input.oninput = (e) => {
    params.value(+e.target.value)
    params.onChange?.(+e.target.value)
  }

  el.appendChild(input)
  return el
}

// ✓ Surgical updates (no diffing)
// ✓ Zero framework overhead
// ✓ Signals are first-class
// ✓ Full control over DOM
// ✗ More verbose
// ✗ Manual cleanup needed
```

**Option D: Hybrid (Sprae for structure + signals for dynamic)**
```js
// Template for static structure
const template = `
  <div class="s-slider">
    <input type="range" ref="input" />
    <span class="s-value" ref="display"></span>
  </div>
`

function slider(params) {
  const el = document.createElement('div')
  el.innerHTML = template
  const input = el.querySelector('[ref=input]')
  const display = el.querySelector('[ref=display]')

  // Fine-grained reactive bindings
  effect(() => input.value = params.value())
  effect(() => display.textContent = params.format?.(params.value()) ?? params.value())
  effect(() => input.disabled = params.disabled?.() ?? false)

  return el
}

// ✓ Templates for readability
// ✓ Signals for reactivity
// ✓ No virtual DOM
// ✓ Explicit, debuggable
```

### Recommendation: Option D (Hybrid)

For a control library:

1. **Templates for structure** — Controls have predictable DOM, no need for dynamic rendering
2. **Signals for state** — Fine-grained updates without diffing
3. **Effects for binding** — Explicit subscription to signals
4. **No framework dependency** — Works anywhere

### Signal Contract

Any param value can be:
```ts
type MaybeSignal<T> = T | Signal<T> | (() => T)

// Control code normalizes:
function unwrap<T>(v: MaybeSignal<T>): T {
  if (typeof v === 'function') return v()
  if (v && typeof v.value !== 'undefined') return v.value
  return v
}

function subscribe<T>(v: MaybeSignal<T>, fn: (val: T) => void): () => void {
  if (typeof v === 'function') {
    return effect(() => fn(v()))
  }
  if (v && typeof v.subscribe === 'function') {
    return v.subscribe(fn)
  }
  // Static value, call once
  fn(v)
  return () => {}
}
```

### Minimal Signal Implementation

```js
// Tiny signal implementation (~50 lines)
let currentEffect = null

function signal(initial) {
  let value = initial
  const subscribers = new Set()

  const s = () => {
    if (currentEffect) subscribers.add(currentEffect)
    return value
  }
  s.value = value  // also expose as .value
  s.set = (v) => {
    value = v
    s.value = v
    subscribers.forEach(fn => fn())
  }
  s.subscribe = (fn) => {
    subscribers.add(fn)
    return () => subscribers.delete(fn)
  }

  return s
}

function effect(fn) {
  const execute = () => {
    currentEffect = execute
    fn()
    currentEffect = null
  }
  execute()
  return () => { /* cleanup */ }
}

function computed(fn) {
  const s = signal(undefined)
  effect(() => s.set(fn()))
  return s
}
```

### When Controls Rebuild vs Update

**Update in place** (efficient):
- Value changes → update input value
- Disabled changes → toggle disabled attribute
- Label changes → update text content

**Rebuild required** (expensive):
- Options change → rebuild dropdown list
- Type changes → replace entire control
- Children change → rebuild folder contents

```js
// Smart rebuild with keyed diffing
function updateOptions(select, newOptions) {
  const existing = new Map(
    [...select.options].map(o => [o.value, o])
  )

  newOptions.forEach((opt, i) => {
    if (existing.has(opt.value)) {
      // Reuse existing option, just reorder
      select.insertBefore(existing.get(opt.value), select.options[i])
    } else {
      // Create new option
      const el = document.createElement('option')
      el.value = opt.value
      el.textContent = opt.label
      select.insertBefore(el, select.options[i])
    }
  })

  // Remove extras
  while (select.options.length > newOptions.length) {
    select.remove(select.options.length - 1)
  }
}
```

### Sprae Compatibility

Sprae uses a similar model internally. To integrate:

```js
import sprae, { signal } from 'sprae'

// Option 1: Use sprae's signals
const value = signal(0.5)
sprae(el, { value })

// Option 2: Bridge external signals
function bridgeSignal(external) {
  const internal = signal(external())
  external.subscribe(v => internal.value = v)
  return internal
}
```

### Summary

| Approach | Pros | Cons | Fit |
|----------|------|------|-----|
| **Sprae only** | Already in use, declarative | Rigid templates | Static controls ✓ |
| **htm/Preact** | Powerful, JSX-like | Dependency, VDOM | Complex UIs |
| **Pure signals** | Fastest, explicit | Verbose | Perf-critical |
| **Hybrid** | Best of both | Slightly complex | **Recommended** |

**Recommendation**: Use **templates for structure** (HTML strings or sprae) + **fine-grained signals** for reactive bindings. No virtual DOM, no diffing, surgical updates.
