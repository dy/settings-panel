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

`onAccent` chooses black or white from hex / numeric-OKLCH fill luminance.
CSS colors outside the parser's supported formats pass through unchanged and
retain white ink; their contrast must be supplied by the theme or host.

**Contrast** (`theme/color.js`): `luminance(color)` and `contrast(a, b)` follow the
[WCAG 2.x formula](https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio).
`ink(bg, ratio = 4.5, tone?)` returns ink that reaches `ratio` on `bg`: an intended
`tone` that already passes is kept; otherwise only its lightness moves, preserving hue
and chroma. Without a tone it returns the most muted passing neutral. Use 4.5 for
text and 3 for control boundaries ([WCAG 1.4.11](https://www.w3.org/TR/WCAG22/#non-text-contrast)),
so hints and idle tracks stay readable on every shade instead of on one tuned palette.
`mix(a, b, t, space = 'srgb')` mixes as CSS `color-mix()` does (in sRGB, `b` laid at opacity `t` over
`a`); pass `'oklab'` for `color-mix(in oklab, …)`. Placeholders, the search field's included, read 4.5:1
on every face of their field: at rest, hovered and focused.

**Mixins** (`theme/mixins.js`): `bevel(grad, w)`, `bevelRing(grad, w)`, `hardShadow(x, y, color)`, `neuShadow(dist, blur, dark, light)`, `neuInset(dist, blur, dark, light)`.

**Metrics** (`theme/metrics.js`): `metrics(axes, baseline)` turns a baseline in native px into the [shared dimensional tokens](axes.md#shared-dimensional-tokens). The baseline names its `body`, the px its labels and values read at, when that is not its font size; `size: 1` draws that body at 13px. Lengths go through `--length`; `scale(size, body)` is the same factor for lengths computed in JS.

`brutal.js` is the simplest complete example: one control height, one plate-shadow helper, `resolveRoles` for color.

**Base owns structure, themes paint** (`theme/base.js`, in `@layer s-base`): layout, collapse, a label's title text kept out of the flow and hidden until its `?` is hovered, swatches that keep their size and wrap, a slider's tooltip readout floating over the thumb, vector fields without spin buttons, each axis keeping room for its value and the row wrapping when they no longer fit. Accessibility too: the `?` is in the tab order and reveals its text on keyboard focus (`aria-describedby`, `role="tooltip"`); under forced colours (Windows contrast themes) the native boxes, radios and sliders carry state and the chosen segment takes Highlight, since state drawn with backgrounds, shadows or masks would vanish. Beyond structure, base gives title text only the panel ground and an inset, so a theme that paints these parts keeps its look; `test/metrics.spec.js` holds every theme to them.


## The Foundational Themes

| # | Name | Status | Import | Structural Distinction | Iconic Reference |
|---|------|--------|--------|----------------------|------------------|
| 1 | **soft** | ✅ shipped | `theme/default` | Subtle shadows, generous radius, gentle transitions | Linear, Tailwind UI, Figma |
| 2 | **swiss** | ✅ shipped | `theme/swiss` | No shadows, grid-pure, typographic hierarchy only | Braun, Stripe, FabFilter |
| 3 | **skeu** | ✅ shipped | `theme/skeu` | Keycaps cut from one material, engraved wells; calibrated to the material study's Customize row | iOS 1-6, Universal Audio |
| 4 | **brutal** | ✅ shipped | `theme/brutal` | Hard offset shadows (no blur), thick borders | Gumroad |
| 5 | **neu** | ✅ shipped | `theme/neu` | Directional rim, contact + ambient shadows, one molded material | Neumorphism / claymorphism |
| 6 | **glass** | ✅ shipped | `theme/glass` | backdrop-filter blur, transparency, thin light borders | macOS Big Sur, Windows 11 |
| 7 | **lab01** | ✅ shipped | `theme/lab01` | Frosted glass + gradient borders + noise texture | lab01.dev |
| 8 | **control-panel** | ✅ shipped | `theme/control-panel` | freeman-lab/control-panel reproduction | control-panel |
| 9 | **editorial** | ✅ shipped | `theme/editorial` | An ink-framed reader sheet: right-aligned labels, rules under the value column, typographic choices | E-reader settings (Kindle, Apple Books), iA Writer |
| 10 | **terminal** | ✅ shipped | `theme/terminal` | Monospace on a character-cell grid, inverse video, no depth | Bloomberg, vim, Ableton |
| 11 | **industrial** | ✅ shipped | `theme/industrial` | The panel is a chassis, folders its modules cut by etched seams; labels printed over controls; keys, faders, encoders, LEDs and a black screen; accent = interaction | [DMX-FIELD](../test/cases/industrial.html) mockup, Teenage Engineering OP-1 field, Braun, Nothing |
| 12 | **retro** | ✅ shipped | `theme/retro` | Bevel via border colour (two 1px rings, light top-left, dark bottom-right), system palette, pixel system type | Windows 98 |
| 13 | **porcelain** | ✅ shipped | `theme/porcelain` | Glazed ceramic lip, embossed face, mineral frame | Porcelain / ceramic relief |
| 14 | **studio** | ✅ shipped | `theme/studio` | The row is the instrument: a slider's fill is its row, the label rides on it; states are ink alpha steps, no accent | [DialKit](https://github.com/joshpuckett/dialkit) |
| 15 | **synth** | ✅ shipped | `theme/synth` | Colour as function: each group wears its own hue on title, fill, thumb and selection; white cards on a grey tray | [Ableton Learning Synths](https://learningsynths.ableton.com/en/playground) |
| 16 | **imgui** | ✅ shipped | `theme/imgui` | Dear ImGui reproduction (StyleColorsDark): framed widgets left, labels right, collapsing-header bars, a pixel font | [Dear ImGui](https://github.com/ocornut/imgui) demo window |
| 17 | **bitmap** | ✅ shipped | `theme/bitmap` | Two inks only: greys are dither patterns, state inverts, every glyph a measured 1-bit pixel map | Macintosh System 6/7 (Susan Kare) |
| 18 | **dialkit** | ✅ shipped | `theme/dialkit` | DialKit reproduction: the row is the slider, Off / On booleans, one quiet ink | DialKit |
| 19 | **matte** | ✅ shipped | `theme/matte` | Quiet skeuomorphism: one matte plate, low domed keys, shallow wells | Skeu's original design |
| 21 | **tracked** | ✅ shipped | `theme/tracked` | Capitals tracked wide over dark wells; a bar of the accent, groups as tonal bands; square-knob switches, a thin-rail slider | A phone settings screen the owner supplied (source unknown) |
| 20 | **json** | ✅ shipped | `theme/json` | The panel as the JSON object it edits: `"key": value` lines, folders as nested `{ }`, each value its control set as a literal | VS Code's JSON tokens (Default Light+ / Dark+) |

### What each structurally owns (can't be faked by another)

- **soft**: the *mainstream default* — nothing extreme, everything gentle
- **swiss**: *absence* of depth is the statement — shadows would break it
- **editorial**: *the reader's sheet*: rules drawn under the value column only, choices set as type rather than controls
- **studio**: *the row as instrument*: no separate track; label and value ride on the fill itself
- **synth**: *colour as function*: the hue belongs to the group, not the panel; cards on a tray, a label line over a hairline
- **bitmap**: *the 1-bit model*: two inks, greys only as dither, selection and press by inversion, nothing antialiased
- **terminal**: *the character-cell grid* — every size is a whole number of `ch` × lines; no depth, state is inverse video
- **industrial**: *the chassis and its modules*: labels printed over controls, hardware parts (keys with LEDs, faders, encoders, a black screen), groups of encoders and faders laid out as a bank
- **brutal**: *hard offset shadow* (4px 4px 0 black) — unique depth model
- **glass**: *backdrop-filter* — unique CSS mechanism, unique depth
- **neu**: *directional relief in one molded material* — rim, contact and ambient lighting
- **porcelain**: *a glazed face seated in a mineral frame* — ceramic lip and embossed relief
- **skeu**: *keycaps cut from one material* (grain or wood), engraved wells — calibrated surface
- **matte**: *one matte plate*, low domed keys and shallow wells — relief without texture
- **retro**: *bevel via border-color* (light top-left, dark bottom-right) — unique border model
- **json**: *the data as its own interface*: no chrome, the state's literal syntax is the layout


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
| 1-bit / classic Mac | bitmap |
| Industrial | industrial |
| Editorial / print | editorial |
| Design-tool dials | studio |
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
9. **terminal** — character-cell grid, inverse video
10. **porcelain**: glazed ceramic relief
11. **editorial**: the reader's settings sheet
12. **studio**: the row as instrument
13. **synth**: colour as function
14. **imgui**: the immediate-mode tool window (classic)
15. **retro**: Windows 98, bevels in border colour
16. **bitmap**: the 1-bit Macintosh
17. **industrial**: the chassis and its modules



## Structural Rules Per Theme

### soft (default)
- Controls sit in sockets cut into one material: a raised capsule rides in a groove whose wall is darkest at its outer top edge, with a catch-light on the lip below
- Fields and tracks are sunken faces in sockets; the segmented control is one track with the selection raised inside it
- Radius: capsules at roundness 1 (radius = height / 2)
- Socket: a tenth of the key's height wide, the study's (14px round a 144px key), so a seated key stands as far past the family's measure as the study's Upgrade key past its neighbours
- Tones come from the shade by two rules fitted on the study's three finishes: a crevice multiplies the material by itself, a lit face rises by L(1 − L)
- A socket is a groove, not an outline: its floor fills the ring's sides and bottom, light from above shades it: its wall is a crescent along the ring's outer top edge, its floor fills the rest of the ring a little lowered and narrowed (a hairline of wall at the sides), the crevice is a crisp crescent under the key as wide as the wall's (about 1px, the chalk study's) and the lower floor deepens the groove under it, so the ends read as one even band (two bands there read as a doubled border), and on a mid-tone material (bronze, gold, copper, sage) the groove's tones, its crevice under the key too, are drawn back toward the shade until the floor holds 1.3:1 against it (chalk's own), softer than the bronze study at the owner's request; the key's cast is light (at most .3) and its lip catches more light
- The groove takes the palette's ink hue where it has one (chalk's blue-grey, as the study draws its sockets): a groove tone gains seven times the ink's chroma per unit of lightness it falls below the shade, unless its own chroma is more. On a pale finish the face falls a little further toward its lower edge (L⁴/33) and the lower rim's light fades (it catches nothing on chalk); the floor under the key is the deeper floor tone all the way to the lip
- The accent marks on-states only (slider fill, switch track, checks, focus); primary and secondary are a bright and a flat key, never an accent slab
- Lettering in the ink, embossed, at least 4.5:1 on every surface it sits on; `texture` adds grain, or wood figure on raised faces
- Calibrated against the study's Upgrade row

- Type: body 13 at size 1; one secondary step, 12/14 of body (hints, readouts, mark labels, tooltips, separator labels, knob values); title 15/14
- One slider: plain, interval and the colour's alpha share the 6px socket and the 18px cap; the alpha shows its checkerboard and ramp in the groove
- Rhythm: every row (switch, checkbox, info, folder title) sits on the control height; folder contents keep the row gap; chevrons, checks and stepper chevrons share one stroke

### swiss
- Shadows: none
- Borders: 1px functional (informational, not decorative)
- Radius: 0 (enforced)
- Typography, one size per role: Oswald for the title (42) and actions (19.2, capitals); DM Sans 12 for labels and folder titles (capitals), list options, hints, separator labels, tooltips and axis letters; DM Serif Display 16 for values, whose short figures read as 14px text; the serif at 14 for readouts, slider tooltips and knob values; code in monospace at 14
- Surface: transparent; the host background remains visible through fields and rows
- Grid: mathematical, visible in alignment; what ends a row (a select's chevron, the steppers, a slider's value, the fold's chevron) stands the labels' inset off its edge, mirroring where the labels start
- Rhythm: one pitch for every single-line control, segment and heading (40px at the native body); a label sits on its control's first line; checkbox and radio lists keep the reference's smaller 26px step, each option with a gutter cell that takes its mark
- Slider: the value cell is the instrument (Studio's row-as-slider, square): the row's tone fills the cell up to the value, a hairline of the accent stands at the fill's edge, the value sits at the cell's end; an interval fills between its two hairlines across the whole cell, its two values inside the cell at its ends; the colour's alpha keeps a hairline rule with the accent up to a square. Switch: a square track in the row's tone with a square knob of the page's colour, the ink when on; toggle: two segments, Off | On, the chosen one in the row's tone. A colour fills a square cell at its field's start, closed by the column's rule; a swatch is a plain square of itself, no frame. Lists mark a ticked option with a check and the chosen radio with a dot. Values set lining, tabular figures (the serif's fallback is Times New Roman, whose figures line; Georgia's are old-style). Actions keep the one pitch. A focused field is ringed by a hairline of the ink at 40%. A field with no label starts its text where the labels do. A folder's chevron and a number's steppers stand where the select's chevron does; a number's field takes its cell. The select is an open cell with the stepper's chevron
- Feel: an outlined form over its surroundings, with deliberate typographic contrast

### editorial
- The reference: an e-reader Settings sheet over a page of book text
- Frame: a solid 2px ink border, square corners, no shadow, on pale paper (default `#dfe0e4`); a dark shade gives an ink sheet
- Masthead: bold upper-case title on one dark hairline; the fold control is a grey pill reading Hide / Show
- Rows: muted labels right-aligned in a 28% column; each value closed by a pale rule drawn under the value column only; a row's rule turns ink while its field has focus
- Choices: typographic, the active one in full ink and the rest muted, nothing boxed; per-option `style` carries a size ramp or an icon mask (`--icon`); booleans read Off / On the same way
- Slider: a hairline, filled in ink up to an ink dot; end labels inline via `marks: { 0: 'Low', 1: 'High' }`
- Actions: pills, the primary solid ink with small tracked capitals, the secondary grey
- Tones are ink mixed into the paper at the reference's measured ratios (masthead rule 65 %, row rules 13 %, slider groove 22 %); tones under or behind lettering rise until it reads 4.5:1: labels 52 → 56 %, grey pill 39 → 48 % on the reference paper (more where a paper needs it), and hints share the labels' tone where 40 % would not read; accent is the focus ring only; `rule` sets the row-rule weight
- Type: body 13 for labels, values, choices and folder titles; 11 for hints, readouts, tooltips and the small tracked capitals (.1em): actions and the fold pill as the reference sets them, separator labels and slider end labels
- Rhythm: one 40px pitch, folders included (the reference's 56 left each value floating far above its rule); values fill their row, a wrapping palette keeps the row's air above and below; number steppers always shown. The slider dot and the radio, checkbox and list marks are one 12px mark; the alpha slider is the hairline with the colour's ramp
- Feel: a reader's settings sheet; quiet, typographic, generous rows

### studio
- Panel: an opaque sheet in a 7px rim of its own colour at 15% opacity, so the rim keeps the shade's hue and never reads lighter than the sheet; rows 11px from its sides, 8.5px apart, measured on the owner's shot of the light reference and held to it (`test/calibration/studio.png`, 29715 px of 685k differ: chiefly the labels, which the shot sets at 2.7:1 and Studio at 4.5:1, aimed at 4.6 since the browser composites the row's wash a level off; then the rim, 7px of the sheet's own colour at 15% where the shot's is 5px of white at about 45% (29497 when it was a step lighter at 30%; a lighter rim read wrong on mid shades; 29694 before a swatch's edge became shade inside it in place of a grey ring round it), and the colour rows, whose code Studio prints before the swatch where the shot shows the swatch alone: the owner's calls)
- Rows: every control is a soft pill of one ink at low alpha inside a hairline of slightly more ink; label left, value right; nothing inside a row is boxed again: choices, Off / On and a vector's parts are words at its end. Labels take the lightest ink that reads 4.5:1 on every ground they lie on (row, hovered row, slider fill, selected face), a step back from the values
- Slider: the row is the slider; the fill grows from the row edge to the value and ends in the row's own rounded corner, the label rides on it, a hairline handle sits one inset inside the fill's end (visible at rest on every shade, darker under the pointer, taller in a drag); the value is as wide as its text, so the caret's area is the value; stepped sliders with `marks: true` show dots for the steps ahead; under the pointer, every slider without marks shows its steps as dots along the whole row, under the fill and past it, clear of the label and the value (one per step, one per tenth past ten; none under the value), stronger in hand: DialKit's hashmarks, as dots, each where the handle stands at that step; in hand the label steps aside only while the handle passes over it, and the dots it kept clear show behind it as it fades; the clearings end midway between dots, so no dot is cut. An open vector pad is three rows tall, as wide as its ratio allows. A toggle is a key inset in the row; swatches wrap at the row's end at 18px. Dragging the readout drags the fill at the track's own value per pixel. A range (`slider:range`) is the same instrument with two handles: the fill spans low to high, a handle inside each end, the values at the row's end as `low – high`; a press anywhere on the row (but its values) moves the nearer handle, and in hand the label steps aside while a handle passes over it. The colour's alpha slider keeps a knob over its ramp
- Number: its steppers are the select's up/down chevron just after the value, always shown; each half of the row's height takes a press for its step. Lists (radio, checkboxes), a textarea and info take the text's 88px label column; lists and textareas read from the row's top inset. A label wraps rather than crop, except a slider's. Knob and XY rows are inset top and bottom.
- Text: a field read from the left after an 88px label column; a long value wraps and grows the row, five lines at most; focused, the row's wash marks it
- Buttons are rows of their own: the row's height and corners, no row painted round them
- Boolean: the switch, its knob springing across and stretching toward its travel while pressed (the reference's own); `boolean:segmented` reads Off / On at the row's end, the chosen word marked by a pill of the ink
- Segmented select: its choices are words at the row's end, the chosen one marked as Off / On is
- Vector: its parts are words at the row's end, each letter a step back from its number; an open pad (`pad`) takes the row's width under them, a faint grid in the row's ink with the dot, shaped by `--pad-ratio`
- Headers: `separator:labeled` is an uppercase tracked eyebrow; folders keep a sentence-case title and chevron
- Color: the code, then a circular swatch, at the row's end, edged inside it by the ink at an alpha (shade on a light panel, light on a dark one; no ring round it); select: value at the row's end with an up/down chevron; the whole row opens the menu, which where selects are customizable is a sheet of the panel's rows under it, the chosen one checked
- Color model: no accent axis; every state is a lightness or alpha step of one ink derived from `shade`. The ink has one polarity: on a mid shade (copper) a darker ground that dark lettering cannot hold at its ratio keeps the dark ink rather than flipping to white, so labels and values never split into light and dark
- Feel: a design tool's dial panel, direct and quiet

### synth
- The reference: Ableton Learning Synths, the Playground (2019); calibrated against its graph-free render (`test/calibration/ableton*.png`)
- Structure: the panel is a white card; each folder is the next card, cut off by an 8px band of tray; no borders, no shadows, square corners
- Colour is function: a group's hue colours its title, slider fill, ring thumb, selection, checks and pad. It comes from the panel's `accent`, from `hues` cycled over its folders, or from a folder's or row's own `style: '--accent: …'`; the default cycle is oscillator blue, amplitude green, filter yellow, modulation red
- A row carrying its own hue shows its value in it, like the original's modulation rows
- Rows: a slider is a label line with the value at its end over a 2px hairline and a 15.75px ring thumb, filling from zero (a range crossing zero fills both ways); other controls sit under a 1.5 label line; fields, selects and buttons are grey wells with a 4px radius
- Segmented: chips on a 5% wash of the hue, the selected chip filled; per-option `--icon` draws a glyph (the LFO waveforms)
- Text never wears the raw hue: titles and readouts take the hue moved to 4.5:1 against the card; lettering on a fill is the card colour where it reads, else the ink, else white or black; marks that show state (slider fill and thumb, switch, checks, radios, the selected chip, pad, knob pointer) take the hue moved to 3:1 against the card, a segmented row's against its wash, a number's stepper arrows against its field; the toggle and a pressed button keep the raw hue, their lettering stating the state
- Tones: tray, track and field derive from `shade` (the card) by the original's light and dark steps; ink indigo `#00004c`, or `#b3b3b3` on dark
- Type: Outfit (standing in for Ableton Sans), 12px for every text role (labels, values, hints, readouts, mark labels, axis letters, tooltips), as the original sets its captions at body size in a quieter ink; card titles 16.8px (1.4em), the original's one role-specific size
- Boxes: fields, selects and buttons 28px; segmented chips 25.5px; the original's two control heights
- One slider: plain, interval and the colour's alpha share the 2px hairline and the 15.75px ring thumb in the hue; the alpha's hairline is the colour's ramp over a one-row checkerboard
- Boolean rows are one field high, so switch, checkbox and toggle rows share a pitch; number steppers are the dropdown's caret
- Feel: a teaching instrument; quiet cards, every colour names a function

### tracked
- The reference: a phone settings screen the owner supplied (a blue bar with a bolt; Notifications, Style, Auto refresh), reproduced in [its case](../demo/cases/tracked.html); the picture is not yet in `test/calibration`, so the theme is not yet held to it
- Lettering: every label and heading in capitals tracked wide (labels .3em at 10px, headings .5em at 12px, 800, as the picture sets them against its rows), Montserrat standing in for the picture's geometric sans; near-white on the slate sheet, held to 4.5:1 on the sheet and in the wells
- The title is a bar of the accent across the sheet, its mark centred and white wherever white holds 3:1 on the accent
- Groups are bands across the sheet, every other one lifted an eighth toward white, each headed by a darker bar with corners of 4px
- Controls are wells cut a step below the sheet (45% toward black), corners of 4px: a switch is a well with a square knob (grey at the left off, the accent at the right on), a select and a colour are wells with a small triangle at their end (the colour a wide swatch, its code kept off screen), a segmented choice is a strip of the bar's tone with the chosen one sunk to the well's, number steppers two small triangles, a checkbox and a radio a well with the accent inside
- The slider is the exception, a thin rail: the accent to the value, white past it, a round accent knob
- A row without a label gives its control the whole row
- On a light sheet the steps are shallower (wells 13% toward black, the bar 7%), the bands a shade below the sheet, and the rail past the value a well's tone where white would vanish
- Axes: shade (the sheet), accent (bar, on-states, fill), spacing, size, weight
- Feel: a mobile settings sheet; quiet slate, one bright colour where things are on

### dialkit
- The reference: DialKit 2.0.2's popover (Josh Puckett, `dialkit/vanilla`), its README example in dark and light, rendered from the package's own build (`demo/_ref/dialkit-ref.html`); every value from its `styles.css`
- Rows: 36px, 6px apart, one ink at 5% (light 4%) on the panel, 8px radius; labels 13px 500 at 70% ink (light 60%), values in the UI face, numbers and colour codes in Geist Mono (falling back to the system monospace, as native does)
- Slider: the row is the slider: the fill (ink 11%) runs to the value, the label 10px in rides on it, the value sits 12px from the end; under the pointer or in a drag the fill deepens to 15%, the value whitens, the 3×20px handle grows in 9px inside the fill's end (half ink hovered, 90% dragged) and 1×8px hashmarks show at every step, or every tenth past ten steps; a click springs the fill and handle to the step under it (native's spring: 0.25s, bounce 0.1), the number included: it is part of the track until the pointer rests on it 0.8s, when it underlines and a click edits it. Native's handle dims where it would cross the label or value; ours does not, as that needs the label measured
- Boolean: Off / On, the chosen word on an ink-11% pill that slides between the words in 200ms; a checkbox keeps a 20px box of the same inks
- Select: the value and a chevron at 60%; the whole row opens the menu, which where selects are customizable is native's own: a sheet under the row of 36px options, the chosen one on ink 11%
- Text: a long value wraps, Enter breaks the line, and the row grows, five lines at most, as native's autosize; the field is as wide as its value (six characters at least), so the focus line runs under the value, not the row. Number: the field as wide as its value, its steppers the select's chevron up and down beside it, each half of the row's height a press
- Range: the slider with two handles: the fill spans low to high, a handle 9px inside each end under the pointer, the values at the row's end as `low – high`; in hand a slider's label steps aside while a handle passes over it
- Colour: the code, then a 20px swatch with 5px corners that grows 8% under the pointer
- Pad: a caption and an X and Y field in three equal cells, the square surface below with a line every sixth (`vector` with `pad: 'open'`); the point travels a plane 12px in from the surface's edges and rings while dragged
- Curve: native's easing editor as a group of its own: the title between hairlines, the 256:180 graph with its dashed reference, tangents, endpoint dots and ringed handles, fitted as native fits it, then the points as one Ease row (`0, 0, 0.58, 1`). Native's Type (Easing / Time / Physics) and Duration rows belong to its transition value, which a curve does not have; its chevron folds a group a curve is not
- Graph: no native counterpart; drawn as the pad is, a caption cell and a plain surface below, three rows high
- Folders: a first group shares the header's hairline; native draws a second rule there when more groups follow (its own rule covers a sole first group only)
- Folders: a 13px semibold title and chevron, 36px tall, between hairlines at 6% ink; buttons are rows with centred 60% labels
- Panel: 280px wide, 14px radius, a 10% hairline, native's shadow; the 15px title and a close cross over a hairline. Native's version menu and copy key are its preset UI, which the panel has no element for
- Colour model: native's white (dark) or black (light) alphas over any shade; a placeholder, native's 40% tertiary, is lifted to 4.5:1 on its row
- Studio is the original this replica stands beside: the same row idiom, set apart by outlined rows, rounded fill ends, a hairline handle at rest, a switch, a left-read text column, marks at rest and eyebrow separators

### imgui
- The reference: the Dear ImGui 1.92.9b demo window (`imgui_demo.cpp`), Widgets > Basic, in `StyleColorsDark()`, captured from the original (sokol-samples `imgui-sapp`, WebAssembly); colours from `imgui_draw.cpp`, metrics from `ImGuiStyle::ImGuiStyle()` in `imgui.cpp`
- Rows: the framed widget left, the label right after ItemInnerSpacing.x in a FontSize × 12 column (at most 40%), as the demo's PushItemWidth sets it; checkbox and radio labels follow the box; buttons fit their text
- Frames: FrameBg fills, no border, no rounding, FramePadding (4, 3); frame height FontSize + 2 × FramePadding.y (19px)
- Slider: the frame is the track; a GrabMinSize (12px) grab inset 2px, one value wide on integer ranges; the value centred over the frame, and focused it becomes the slider's text input
- Number: InputInt(), the field then − and + buttons of frame height
- Folders: CollapsingHeader() bars in Header, half the window padding wider than the content, with RenderArrow() triangles; a section is a leaf tree node, its children one IndentSpacing (21px) in
- Separators: Separator() 1px; labelled, SeparatorText(), a 3px rule 20px in
- Color: the value, then a ColorButton() swatch: a 1px FrameBg ring over ImGui's 128/204 alpha checkerboard
- Window: a TitleBgActive title bar with the collapse triangle, a 1px Border, WindowBg at .94 alpha; collapsed, TitleBgCollapsed
- Typography: ProggyClean (MIT, embedded); ImGui's 13px is a 16px CSS em, the baseline where ImGui puts it
- Colour model: ImGui's floats converted as ColorConvertFloat4ToU32 does, alpha kept so the browser blends as the GPU does; a light shade switches to StyleColorsLight(); an accent re-tones the blue roles; every palette holds text at 4.5:1 and grabs and checks at 3:1: derived ones are fitted whole, ImGui's own two move only their failing tones (TextDisabled `#808080` → `#858584` dark, `#999999` → `#6d6d6d` light; the dark ButtonActive under white text `#0f87fa` → `#0074e6`; the light grab and check mark `#4296fa` → `#1e76d7` / `#378bee`)
- Focus: NavCursor, a 2px rectangle 3px outside the item
- Feel: a debug window inside a running app: dense, flat, every control a filled box

### bitmap
- The reference: System 7.0's Easy Access control panel on a 1-bit Mac Plus, run in Infinite Mac; [Macintosh demo](../demo/cases/macintosh.html); calibrated row by row (`test/calibration/macintosh-*.png`), leaving out the captions under radio rows, which have no panel element
- Two inks: paper is `shade`; ink is black or white by its lightness, or `accent` (moved to 4.5:1 if short); a dark shade inverts
- Greys are patterns only: 50% greys a disabled control (every other pixel removed), 25% fills slider tracks, a dotted rule separates, six 1px stripes fill the title bar
- The window: 1px frame and 1px drop shadow; 19px striped title bar with the close box at left (the fold; collapsed, the window is its title bar, as WindowShade); the filter sits where the zoom box would
- Glyphs are the original's pixels: 12px radio buttons and check boxes (title to the right), push buttons with a 4px pixel corner, the default ring on the primary of a primary/secondary pair, pop-ups with the offset shadow and down arrow, little arrows on number fields
- Selection and press invert: chosen segment, pressed button, on switch and toggle, selected text
- Rows: Geneva 9 labels right-aligned in a 95px column (at most 42% of the row), 2px above a 12px control's title like static text; radio buttons run in a row; a section's first unlabeled control rides on its Chicago heading
- Slider: the scroll bar, a 25% grey track and a white scroll box; the interval and the colour's alpha are the same scroll bar, the interval's band solid ink, the alpha's grey replaced by the checkerboard and ramp
- Type: Chicago 12 for title and headings, Geneva 9 elsewhere: the reference titles its check boxes and radio buttons in the window's font (the Control Manager's useWFont), so push buttons and pop-ups take it too (clones by Giles Booth, CC BY, embedded); `font` replaces the body face at 12px, aliased
- Whole pixels: glyphs are crisp at whole multiples of the original's pixels, `size` 9 / 13 and 18 / 13 (half steps on 2x screens), and scale smoothly between, like every theme's, so at `size` 1 (Geneva 9 at 13px); `spacing` rounds to the pixel; `weight` 600+ is QuickDraw bold
- Boxes: System 7's control heights, text fields 16, pop-ups 18, push buttons and segmented 20 (not in the Easy Access reference, so not calibrated)
- Feel: the first Macintosh; every pixel placed by hand

### terminal
- Shadows: none — state is inverse video (selected, pressed) and a cursor bar (focus)
- Borders: one 1px frame, the title cut into its top edge; folders indent behind a tree guide
- Radius: 0, except the knob, whose dial turns
- Typography: **monospace everywhere**, one cell size for every role, secondary text dim rather than smaller; every dimension a whole number of `ch` × lines (`leading` axis sets the cell height)
- Surface: solid; dark default, a light shade gives a paper terminal
- Color: text, dim, line and well are one contrast ladder off the shade; accent is the phosphor (on, selected, live values); dim text on a well (unselected segment, off toggle, read-only field, placeholder) is lifted to 4.5:1 there, a field's placeholder and read-only value on its hovered and focused well too
- Glyphs: `[x]` checkbox, `( )` / `(•)` radio, `[ RUN ]` button, `[+]` / `[-]` fold
- Density: one line per row
- Rows: a control sits on its label's first line, so wrapped labels and two-line controls keep the line grid
- One slider: plain, interval and the colour's alpha are a bar of cells under a block cursor; the alpha's cells lie over the checkerboard and ramp
- Feel: every pixel earns its place

### industrial
- The reference: "DMX-FIELD", a lighting-desk mockup in the OP-1 field idiom (an image the owner supplied; author unknown, no live original); [Industrial demo](../test/cases/industrial.html); calibrated in eight parts (`test/calibration/industrial-*.png`), leaving out the speaker grille and the screen's waveform, which have no panel element
- Chassis: the panel is a matte body (`shade`, lit ±.009 L top to bottom) in a 1px edge, lighter on top and darker below, radius 10.5, standing on a long soft shadow
- Modules: folders are modules cut apart by etched seams (1px dark over 1px light); a panel of modules sets them side by side where they fit, a module 218px wide (four round keys) and a bank taking the room left; seams at the panel's edge are clipped away; a separator is a seam
- Labels: printed over their control in Courier New 10px capitals at 4.5:1 on the body (keys' lettering system-ui 12.5px: the reference's two printed sizes); a boolean's beside its key; a hint under its label
- Keys: white caps on a 2px lip and a soft contact shadow, radius 5, system-ui 12.5px; a single button is a wide key, a group round keys (a capsule when the word is long), the primary (`variant: 'primary'`, or the non-secondary of a pair) in accent ink; segmented: key tiles sharing the row, the chosen one pressed in with accent ink
- Faders: a 15px groove the length of the cap's travel with a centre line; a 33×49 white cap with an engraved line that turns accent in hand; no fill, the cap is the value
- Encoders: a 39px cap in its own colour (`--accent` on the control, default the accent) in a 59px well; the cap and its pointer turn, its light and shadow do not
- Booleans: a 33px black key with an LED lit in the accent (or the key's own `--accent`) with a halo; checkbox a small square key, toggle a key reading OFF / ON
- Screen: values sit on it: text, number, textarea, colour codes and the dropdown's choice (its caret lit) are black glass in a 3.5px bezel, Courier New in `#c1c1c1`, 30px tall, a line of print lower than a key; a number's step keys are two square keys beside it, down then up; consecutive info rows are lines on one screen; the XY pad is a square screen with a lit dot
- Bank: a group holding only encoders, faders, keys and seams, with at least two encoders or faders (none with marks, a tooltip or two thumbs), lays out as hardware: encoders in a row at their own pitch, labels under; a seam; faders upright in equal columns over their keys, labels over; a value shows in place of its label while the control is touched
- Gravity: in a panel taller than its content, key rows settle at the bottom
- Accent = interaction: focus (3:1), primary and chosen keys, a fader's line in hand, a lit LED; lettering in the accent is moved to 4.5:1 against the key it sits on, its dish as well as its rim, raised or pressed
- A dark shade gives an anodised black body: keys lift by larger steps, black keys gain a 3:1 rim
- Type: Courier New and system-ui, matched by measurement on macOS; other platforms fall back to their own monospace and sans
- Glyphs: carets and plus/minus 12px with a 1.5px stroke on every key; the colour's alpha slider is a fader too, on its own line under the colour cap and its code, its groove showing the checkerboard and ramp
- Feel: the machine is the interface

### json
- The panel is the JSON object of its state: `{` for the title, `}` at the end, one `"key": value` line per entry (the schema key, not the label), a comma when another entry follows; folders nest as `"key": { … }`, indented 2ch, collapsed to `{…}`
- Values stay their controls, set as literals sized to their text and selectable: text, a dropdown's choice and a colour are quoted strings (the dropdown opens its options, the colour keeps its swatch); a number, a slider's readout and a knob's value are numbers (they edit; the readout and a number's `: ` scrub); a boolean reads `true` / `false` and toggles on click; a range and a vector are `[a, b]`, each part its own field; an XY pad is `[x, y]` laid over the pad, which drags; choices in a row (segmented, radio, checkboxes) stand as quoted strings, the chosen ones lit
- Punctuation (keys, braces, quotes, commas) is drawn by CSS: a text selection copies the values, not the JSON; a host copies the state itself
- Not data: buttons are their names called, `name()`; separators are blank lines; hints and tooltips are left out
- Colour: VS Code's Default Light+ / Dark+ JSON tokens (`microsoft/vscode`, `extensions/theme-defaults`), keys, strings, numbers and `true` / `false` each held to 4.5:1 on the shade; `accent` recolours the keys
- Type: the platform's monospace, 12px, one line per entry
- Feel: the state, as you would paste it

### brutal
- Shadows: **hard offset, no blur** (4px 4px 0 black)
- Borders: **thick** (2-4px), always black/dark
- Radius: 0 or small (0-4px)
- Typography: bold sans, can be quirky
- Surface: solid, high saturation, can clash
- Gradients: none
- Type: secondary text 11 (hints, readouts, marks, tooltips, separator labels, axis letters); colour codes in the body face
- One slider: plain, interval and alpha share the bordered track and the ink-block thumb
- Glyphs: one 2.5px stroke for chevrons, steppers and checks; every raised plate lifts on hover
- Feel: raw, confrontational, playful punk

### glass
- A pane of liquid glass over the scene (backdrop blur, tint, rim and one specular); its controls are lenses lying on it. The pane's rim and specular are the glass's own colour lifted (OKLCH), white on a clear pane and a saturated pale gold on a yellow one, never white over colour; a lens's edges keep white light, as the material study shows them
- A lens: a face lit from above, a deeper body toward the bottom, a hairline edge, a bright rim under the top edge, a caustic just above the bottom edge, and a short shadow
- Raised lenses: primary buttons, the fold button, the selected segment, thumbs and knobs; flush lenses without a shadow: fields, select, tracks and the segmented track
- Secondary buttons are clear glass; the accent fills on-states only
- Lettering in the ink, cut into the glass; needs an interesting background behind it
- Lettering holds 4.5:1 over its scene, a backdrop up to .35 lighter or .16 darker (OKLab L) than its shade: muted text and placeholders lighten to read there, and the tint thickens only where the ink itself would not (slate, mid greys). A dark glass on a white page is outside that: give it its scene
- Calibrated against the study's Think row
- Light by default, as the original: a chalk pane (`#f1f2f4`) with a blue accent
- A folded folder ends in the separator's cut line, so a stack of folded folders reads as rows
- A lens's lower edge is darker, where the glass thickens toward the pane (the chalk study's Think key): a translucent line of the surface's deep tone, set apart from the lighter contact shadow under it
- On-states are the system's own (after glassyui's switch and slider, themselves after iOS): an on switch or a checked box is the accent flat with only a soft shade under its top edge; the slider is a thin rail of the ink at a fifth with the accent flat to the value; knobs and thumbs are white, lifted by a soft shadow, no edge of their own (a lit rim, a lens over the accent or a pale ring round the fill glared on the colour)

- One slider: rail and white thumb shared by plain, interval and alpha. The folder well is concentric with its lenses

### neu
- One material: controls are the surface pushed up (buttons, knobs, the selected segment) or pressed in (fields, tracks, checkbox, radio)
- A raised part has a rim on the lit edge, a halo toward the light (at the measured spill, the chalk study's lit top edge; it once stood at .6, which read as too faint a top), a hairline crease a little over a pixel under the part, a thin bright glint hugging the lit edge on a pale material (the chalk study's Search key; none on bronze or graphite), a contact shadow and a soft cast shadow; its face shades from the lit edge to the far one
- Light is the shade screened with itself and shadow the shade multiplied by itself, so shadows on warm material run saturated and red while neutrals stay neutral
- Lit from straight above by default; depth, diffusion, lighting contrast, direction and texture strength tune independently
- Calibrated against the study's Search row; the [Neu demo](../test/cases/neu.html) has a Material folder with the three finishes

- Radii: keys and one-line wells are capsules, as in the rest of the family; a text area keeps the wells' radius; folder trays concentric with the keys at their edge, the plate the family's (a capsule's radius and a quarter of the padding)
- One slider: one pill for plain, interval and alpha. Ink laid in a groove (the fill, an on switch, the alpha ramp) covers the floor's catch-light and lies in the lip's shade; a knob riding in a groove spills no light, which would fog the ink beside it

### porcelain
- A white ceramic face with subtle flowing relief, seated in a pale mineral frame; a coloured light `shade` (gold, rose) sets the stone in its own hue, a little lighter than the body, and its glaze is the body lightened, never white
- A crisp beveled lip catches the light; recessed fields and glazed thumbs share that construction
- Serif labels and blue-grey ink, with explicit keyboard focus outlines
- `shade` tints the body, `accent` the ink/actions, `bevel` scales the lip, `grain` the relief
- All panel textures are embedded SVG; the demo's marble background is a local SVG asset
- Type: one body size (14px native, 13 at size 1) for labels, values, buttons and folder titles; Georgia for labels, buttons, folders and the title, the system sans for values; secondary 12px native (hints, readouts, mark labels, tooltips, separator labels); title 1.4em Georgia
- Boxes: every box (field, select, button, segment, toggle) and every row at the control height; the alpha slider shares the 6px groove and the 14×22 glazed thumb

### skeu
- Keycaps: an outline one unit wide all round, one layer of shade laid over the key (its colour at an opacity, set to give the study's tone over the lit rim, so the face shows through it), which falls deeper by itself over the face at the rounded ends, as the study's do (a second layer there doubled them) where the key turns from the light (the chalk study's Customize key), a bright rim, a face lighter than the plate, a front wall, a dark base line and a short shadow; the base line and the wall above it lie inside the key's box (the family's measure), under the silhouette edge, so the silhouette wraps them round the ends as one edge; anything drawn below the box (the wall, then the base line) drew a second crescent outside the silhouette there; the base line is 1 unit, the wall 2 at depth 1, as the chalk study measures them; a pressed key travels .75 units down; lettering is engraved
- Wells for fields, tracks, checkbox and radio; the segmented control is one sunken track with the selected key raised in it
- The primary is a lifted key, the secondary sits flush with the plate; on-states take the accent
- Tones are measured on the key in each of the study's finishes and interpolated by lightness for other palettes; darker tones take the material squared, so bronze reddens and neutrals stay neutral
- `texture`: grain (default) or wood (planed-face figure on keys, grain on the plate); `grid` overlays dots, lines or crosses
- Calibrated against the study's Customize row

- Caps: anything dragged (slider thumbs, the switch knob, pad dot, knob) is a cap: the key's tones on a dome, its rim, silhouette, base line and shadow, no wall, grain without figure. Shadows are translucent: the calibrated tone over the plate, darker over any fill, so no part glows against the light
- Type: body 13 at size 1 (the editable readout is a field, so body); secondary 12/14 of body; title 1.125em
- Rhythm: every row on the control height; a folder title is a row with its engraved rule at its foot; contents keep the row gap. Readouts fit their value (at least three figures) with the field's inset; segmented options take their label's width plus an equal share. One glyph stroke and a 3.5u box

### matte
- One matte material lit softly from above: the panel is a molded plate with a top-to-bottom falloff and a fine grain
- Fields, tracks and checkboxes are shallow wells (a shaded lip on top, a catch-light on the lower edge); selects, segments, steppers and buttons are low domed keys with a crisp rim and a contact shadow; the slider knob is a domed cap
- The catch-light is the material's own: on a light material, the body lifted toward white in its own hue (near-white on chalk, a warm light on bronze and gold); on a dark one, light scaled by the material's lightness
- States move in the material: a pressed key loses its contact shadow without moving, a checked switch fills its channel with the accent, a selected segment latches down; a radio is the checkbox's well, round, with the accent's dot; a number's steppers are the select's engraved chevron up and down inside its field; a knob's dome keeps its light while its needle turns
- The accent defaults to a deeper tone of the shade, so the theme stays monotone; the primary button is a key in the accent
- Axes: `depth` (throw and relief), `bevel` (edge crispness), `roundness` (square to round, keys and knob alike), `grid` (dots, lines, crosses); a ramp function may supply the whole shade
- Type and rhythm: body 13 at size 1, hints and readouts a step smaller; every key and field on the control height, the legend a bevel above centre
- Skeu's original design (c5ff871), kept under its own name; the material study's Customize row is skeu's

### retro
- The reference: Windows 98, Control Panel > Keyboard Properties (Speed tab), booted in v86 and captured at whole guest pixels; calibrated part by part (`test/calibration/win98-*.png`: title bar, group caption, trackbar ends, field, buttons, typed field)
- Depth is border colour only: two 1px rings in DrawEdge order. Raised (buttons, thumbs, the window frame): highlight and 3D light top-left, dark shadow and shadow bottom-right. Sunken (fields, the slider channel, check boxes): the reverse. Etched (group boxes, separators): shadow over highlight. Edges stay whole pixels at any size
- Radius 0, no shadow, no gradient; a pressed or checked toggle (segmented, toggle) sinks into the dithered face
- Window: an 18px title bar in the accent with a bold caption; the fold control is a 16×14 caption button (minimize when open, maximize when folded)
- Rows: captions above their control, 12px between rows (the Speed tab's 23 is its case's); check boxes (13×13) and radios (12×12) carry theirs 6px to the right; folders are etched group boxes with the caption cut into the top edge, collapsible ones with a tree +/- box
- Trackbar: an 11×21 pointed thumb over a 4px sunken channel, ticks below; `marks` with text on the two ends only puts those captions beside the channel (the channel inset 8px from them, as native), inner captions sit under their ticks; with no end captions the channel lines up with the fields
- Buttons: 75×23, right-aligned; the primary is the default button with a 1px frame; focus is a dotted rectangle 4px in
- Fields: a sunken window, text centred on it and 4px in; tooltips are InfoBackground `#ffffe1` in a 1px frame
- Colour: `shade` is the 3D face and the bevel tones derive from it (the classic face `#c0c0c0` gives white / `#808080` / black); a dark shade flips the text, sinks the fields and holds the highlight at 3:1; `accent` is the title bar and the selection highlight (`#000080`). The emulator's 16-colour DAC draws navy as `#0000a8` and the face as `#c0c7c8`; the theme keeps the Windows Standard scheme
- Type: MS Sans Serif 8pt for every role, as Windows 98 sets captions, values and tips in one size, the title bar in bold, through a CC BY-SA 3.0 pixel copy (FontStruct, by "lou") embedded in the theme; crisp at its native 11px and 22px (`size` 11/13 and 22/13), soft between
- Ranges: a range and the colour's alpha use the trackbar's selection channel (TBS_ENABLESELRANGE): the same pointed thumb, box and channel ends, the channel opened to 8px from the same top so the selection, or the checkerboard and ramp, shows in it
- Feel: nostalgic, OS-native, 1998

## Brand Mapping

| Brand | Theme | Why |
|-------|-------|-----|
| Braun | swiss | Rams' "less but better" |
| Stripe | swiss | Clean grids, generous space |
| FabFilter | swiss | Functional, readable, no flair |
| Figma | swiss | Grid-driven, functional color |
| Linear | swiss | Dark, sparse, keyboard-first |
| Apple (2013+) | swiss | Typographic, whitespace-driven |
| Notion | editorial | Serif option, reading-optimized |
| iA Writer | editorial | Print heritage, type-first |
| Medium (early) | editorial | Editorial, generous margins |
| Apple Books / Kindle | editorial | Reader settings sheet, rule lines, typographic choices |
| DialKit | dialkit (replica), studio (original) | Rows as dials, labels over the fill |
| Ableton (Learning Synths) | synth | A colour per function, quiet cards |
| Dear ImGui | imgui | Filled frames, labels right, pixel font |
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
| Macintosh System 6/7 | bitmap | 1-bit, dither, Chicago and Geneva |
| Tailwind UI | soft | Gentle shadows, generous radius |
| Radix / shadcn | soft | Subtle depth, smooth transitions |


## Material studies

The [material study](../demo/cases/materials.html) sets the four material themes as the study
they reproduce draws them: a row of keys each, Neu, Glass, Soft and Skeu, in one of its three
finishes at a time (Chalk, Bronze, Graphite), on that finish's surface. The study draws the same pair of
controls four ways: Neu raises the surface itself, Glass lays a lens on it, Soft seats a pill
in a groove, and Skeu cuts a keycap with a lip. Each theme was calibrated against its row with
averaged vertical profiles (halo, rim, face, lip, shadow) at the panel's own scale.

The four share one measure, so switching between them moves nothing: at the 14px body, 34px keys
and fields, 14 between rows and under the title, 22 round the panel; the title row at the control
height with a round key of that height; a row with a hint sets its label on the control's line and
the hint below. Roundness is one scale: at 1 keys and one-line fields are capsules (height / 2), and
the panel rounds by a capsule's radius and a quarter of its padding, (height / 2 + padding / 4) × roundness. A theme's
material reaches past the measure without moving it: soft's socket, skeu's lip, neu's halo.

The [cases](../demo/cases/index.html) also include [Porcelain](../demo/cases/variants.html#porcelain): a glazed
ceramic face, mineral rim and embossed relief, with light-adjustment controls.

Save keeps a snapshot for the current session; Reset restores it (or the initial
values before the first Save).

Glass works without page-provided SVG filters. Its shade tints the backdrop to
support readable text; blur controls the frost. The experimental lens remains
available in [the glass demo](../test/cases/glass.html#lens) through the optional
`--glass-refraction` CSS property. A host may override `--glass-backdrop` too.

Lab01 uses `--row-gap` for sibling controls and folder contents, a smaller
`--card-label-gap` between a card picker and its label, and shared header/content
edge padding. All three track the spacing axis. Open panel content allows
shadows and keyboard focus rings to extend beyond its layout box. A segmented
control is one sunken track (the secondary plate) with the selection raised inside
it as a beveled plate; image-card pickers keep their framed photos. A collapsed
folder closes with the footer's rule (dark and light hairlines, overlaid), not a
solid line. Every on-state (switch, checkbox, radio, toggle, the interval band) takes the switch's on-fill, near
white on dark materials and near black on light ones, with lettering in the opposite ink; the default
accent is the shade itself, so it cannot mark state. Lettering reads 4.5:1 on the panel over its own
shade, under the corner light too: the source's alphas where they read, else the lowest that does (dark
hints .47, light .62; gold labels and hints .88); reached slider marks take the on fill; gold's secondary
button is white on a plate darkened until it reads. Type: body 13 Geist Mono, hints also 13 (the source sets its hint at the label's size, dimmed by ink
alpha); secondary 12 (readouts, mark labels, tooltips, separator labels); title 20 Geist. Boxed rows
(fields, select, slider, segmented, toggle, buttons) are 38; switch, checkbox and info rows one smaller
step, 34, the source's switch row. The alpha slider shares the groove, bevel and glass thumb.


## Gallery and live preview

The [main gallery](../index.html) renders one shared miniature specimen for every
engine: **Layer**, Blend select, Opacity slider, Enabled toggle, Apply effect button.
The larger preview adds Name, Tint, toggle help text, and a secondary Reset action. Values survive theme and axis changes;
the panel's Reset restores the specimen while keeping the selected axes.

The **Look bar** above the catalog and the preview holds the axes every theme shares:
Light, Accent, Density, Corners, Scale, and Body font. Each one restyles every
thumbnail and the live preview at once. All start **native**: Light = Native shows
each theme exactly as its own defaults paint it, Accent = Auto uses the theme's own
accent under Native and the colormap's accent otherwise, and Corners, Scale, and
Density omit the axis so the theme's own default applies. Reset look returns to
native, the selected theme's own axes too. A theme ignores axes it does not support.

Under the preview sit the selected theme's own
axes (for example Neu's depth and light angle, Glass's blur and tint, Brutal's border
and offset, Editorial's rule weight). Each theme keeps its own values, which also
restyle its thumbnail; a theme without them shows none. The registry of themes, the
colormaps, each theme's supported axes, and its extras lives in
[`demo/themes.js`](../demo/themes.js); adding a theme is one entry there.

Panels are mounted once. Their `theme` option is a function reading the gallery
store, so axis changes rewrite each panel's stylesheet in place; the live preview
remounts only when the selected theme changes.

The colormap selector runs from dark to light: Dark, Graphite, Slate, Copper, Gold,
Bronze, Gray, Sage, Silver, Ivory, Chalk, and Light. Light is pure white (`#ffffff`) with
a blue accent, matching the native DevTools light palette; Chalk stays off-white
(`#f1f2f4`). Dark uses Lab01’s near-black `#111111`. Chalk, Bronze and Graphite
(`#1e1e1e`) are sampled from one material study, surface and lettering ink alike,
and carry the texture of their material (grain, wood, grain) to themes that declare
`ink` and `texture`. Each map sets the surface palette and suggests an accent;
choosing a custom accent keeps it across maps, and Auto restores the native accent.
Themes interpret the colors through their own materials: Swiss remains transparent,
while Glass reveals the palette-colored backdrop. Silver and Gold supply color,
not an added metallic finish. Classic themes adapt their text and field roles;
their standalone native defaults remain unchanged. Lighting direction stays fixed.
Shared links store `colormap` (`native` when unset); older `time` links map to the
nearest palette. Non-native extras of the selected theme are stored as `x-<axis>`.

All engines now expose size, density, and body font using the
[shared dimensional tokens](axes.md#shared-dimensional-tokens). Native typefaces
and compact baselines remain theme defaults, as proportions: at `size: 1` every
theme's body (labels and values) is 13px, so the gallery compares them at one
reading size. The pixel measures on this page are each theme's native ones, which
its case page draws by passing `size: body / 13` (OUI `10 / 13`, Bitmap `9 / 13`). The gallery surround is deliberately
distinct from panel fills so flat themes retain visible edges. Swiss intentionally
stays transparent, placing rules and typography over the host background; its
`shade` selects the ink contrast. UIL uses flexible label/value columns; Apple reproduces macOS 26
System Settings (a grouped Form): one continuous sheet, borderless text fields, pop-up buttons and
hairline row dividers, with row heights measured against the native controls.

The classics are calibrated against their originals: each case page with a native switch renders the
original library beside ours (`?render=native`), and the difference is measured in pixels. A replica
keeps its original's look, not its defects: where an original clips a value or misses WCAG contrast
(text 4.5:1, state marks 3:1), the theme fixes it, the theme file names the original value and its ratio,
and the budget records the departure. dat.gui is pixel-identical at rest; Leva, Control Panel, OUI,
ControlKit, Dear ImGui, lab01 and the Industrial keys differ where such a fix moves a failing colour (Leva also shows values its
original clips); Tweakpane, ControlKit and UIL differ where the original draws something the panel has
no element for (vector number formatting, sprite arrows, UIL's bottom close bar). Figma and Apple, which cannot be embedded, are
measured against the UI3 specification and a native macOS render. Dear ImGui is captured from its WebAssembly demo,
Learning Synths from its live page, Windows 98 from the real system booted in v86 and System 7.0 from
a Mac Plus in Infinite Mac, all by scripted steps (capture.mjs `page` mode); their budgets
are the elements the panel lacks: ImGui's drag fields, per-button colours, RGBA component fields and
the 4px Spacing() under the hello line (measured apart, title bar and body), Learning Synths' title-row
widgets (its graphs are hidden in the original before capture, since the panel has no graph).

Within each replica the type, boxes and sliders follow one system. Type: one body size and one
secondary step under it (hints, mark and separator labels, tooltips, axis letters, knob and pad values).
Exceptions follow the original: ControlKit's chrome buttons letter 10px bold uppercase and its group titles
12px; DevTools' action buttons and segments are Chrome's 12px system-ui 24px pills, its `?` tooltip Chrome's
12px tooltip, and knob and pad values read at the declaration size; Figma sets every text at UI3's 11px,
secondary by tone; UIL prints knob and pad values at body size; Leva's in-field axis glyphs keep native's
.8em; Dear ImGui uses its one pixel font for everything. Boxes: one height per theme, except Apple
(borderless 16pt fields beside 24pt controls, row heights per control as a native Form measures them: 37,
38, 41, 45, and 44 for a button-only row), DevTools (inline declarations beside 24px pills) and OUI (native's
25px buttons, 15px boxed readout). The colour's alpha slider is each theme's own slider (track, thumb,
states) over a checkerboard and the colour's ramp; thumbless themes (ControlKit, OUI) mark the value with
a 2px ink handle; Figma puts it on its own line under the field, Apple before the value and well; Tweakpane
shows it inline though native keeps alpha in its popup.

[`test/calibration.spec.js`](../test/calibration.spec.js) keeps them there. Each original's render
(and lab01.dev's three themes) is stored in `test/calibration/`, captured once from the original;
each case may differ from it by at most its budget (dat.gui 0 px; UIL 23; Leva 2434; Tweakpane 3622,
whose alpha slider shows inline where the original keeps it in a popup; Control Panel 7787, light 6894,
its buttons and selects at the body size where the original leaks the browser's 13.3px, and its text box at the others' 20px where the original's is 22 (a 3px gap under it, 5 everywhere else); its checkbox and radio are the original's 18px, 2px low in the 20px line as there (8565 and 9876 when they filled the line); ControlKit 8142,
its select and button at its fields' 25px; OUI 13432, its dropdown on the half-row column its text and colour fields take, where the original sizes it to its value (12892 before); ImGui title 96, body 93472,
light 81316; DialKit title 0 (dark and light) and body 1114, light 1145, the body measured from the header's hairline because the original's version menu and copy key have no element in the panel, and one of each of its controls, first row to the pad's foot, 115, light 1109 (the placeholder lifted to 4.5:1); Learning Synths 108833, dark 123245, of 3.4M px; Windows 98 in seven parts, 0 to 642 px each, except the title bar's 24176, which is the
emulator's 16-colour navy `#0000a8` against the scheme's `#000080`; the typed field 556 since its text is centred, the owner's call, where the Speed tab sets it 1px higher; System 7 in nine parts, 92 to 1024
px each, the font clones' glyphs). The DMX-FIELD mockup, which exists only as a picture, is measured in
eight parts (capture.mjs `image` mode), 112 to 19152 px each: our module titles push the parts down, the
picture lets fader travel run into the keys below, and its MASTER encoder is smaller and sits at the far right. The encoders' part rose from 5135 to 5148 px when the case page centred the desk: their gradients rasterise a little differently at another position, the theme unchanged. The material study itself is held as pictures too: its four rows of keys in each finish (`study-*`, the [Materials case](../demo/cases/materials.html)), 16528 to 47144 px of about 347k (chalk against the owner's higher-resolution study since soft took its tinted groove; with the four themes' edges set against it, chalk 15756 → 15549 and graphite 19337 → 19231 fell, bronze 44996 → 45653 rose, the most with soft's ring made even round its ends; then all three rose a little, chalk 15619, graphite 19552, bronze 46542, when skeu's wall moved inside its box, and again, chalk 16531, graphite 20275, bronze 47193, when its base line moved inside too and soft's wall and crevice became even 1px crescents at the owner's request; then fell to 16526, 20161 and 47181 when skeu's silhouette edge became one unit all round, and rose to 16583, 20171 and 47187 when that edge became translucent shade, the same tone over the rim, at the owner's request; then fell to 16528, 20069 and 47144 when the ends lost their second layer of shade and chalk's edge took the high-resolution study's tone), bronze the most as the picture's wood is warmer than the finish (they rose from 13367 and 42882 with the rounds that made skeu's and soft's keys more pronounced and soft's sockets 4px wide at the owner's request, then fell from 13581 and 43225 when the case let each theme draw its keys at the study's height, capsules again, soft's socket took the study's tenth of the key and skeu's key its lip below the face; the part each change contributes is not isolated; bronze rose 42474 → 43085 and graphite 19336 → 19352 when soft's groove softened, then bronze 43085 → 45119 and graphite → 19369 when its crevice, cast and lip softened too, as chalk fell 12499 → 12382; the page now holds the study's rows alone). The material rows (materials.json) rose where the owner asked for the family's one measure, 34px keys and fields 14 apart in soft, skeu, glass and neu: skeu's top edge (bronze 2.8 → 3.1, graphite 1.6 → 2, a fixed wall on a taller key), and soft's halo, lower edge and shadow with the wider socket and the taller key (bronze above 2.9 → 3.4, bottom edge 2.5 → 3.1, below 1.3 → 1.8; graphite above .5 → .8, below .7 → 1.3; chalk below 1.1 → 1.2). They fell again, twelve zones in all, with soft's socket at the study's width (among them bronze above 3.4 → 2.9, bottom edge 3.1 → 2.8, below 1.8 → 1.3; graphite above .8 → .6, below 1.3 → .9) and skeu's lip below its face, its rim a quarter unit wider to keep its share of the taller key (among them graphite bottom edge 1.3 → 1.1, chalk top edge 1 → .9). Skeu's bronze bottom edge rose 2.3 → 2.5 when its wall moved inside the box, ending the doubled border at its ends; with its base line inside the box too (the second crescent at the lower ends gone), graphite's bottom edge rose 1.1 → 1.3 and bronze's fell 2.5 → 2; its silhouette edge then one unit all round, as the study draws it round the top too, the top edges fell (bronze 3.1 → 2, graphite 2 → .7) and the bottom edges (graphite 1.3 → .8, chalk 1.7 → 1.3), bronze's bottom edge rising 2 → 2.1. Chalk's top edge rose 1.9 → 2.2 when its edge took the high-resolution study's tone (225 over the rim, where the old study read 233): the band now has the study's tone but stands half a pixel lower in the profile. Glass's chalk bottom edge fell 1.2 → 1.1 with the lens's darker lower edge and lighter contact shadow. Soft's bronze row rose when its groove was softened past the study at the owner's request (top edge 1.4 → 2.2, bottom edge 2.8 → 3.5), and again with its crevice, cast and lip (above 2.9 → 3.9, top edge 2.2 → 3.2, bottom edge 3.5 → 7.9, below 1.3 → 3.3); chalk's shadow fell (below 1.1 → .9). The chalk rows are now held to the owner's higher-resolution study (1165×1364): soft's groove tinted by the ink, its face and floor fitted to it, every soft/chalk zone under 1 ΔE ×100 (above .76, top edge .66, face .18, bottom edge .75, below .31); the other rows' budgets re-measured against it (skeu's top edge 1.9 the most), and soft/bronze's fell with the firmer floor (above 3.8, bottom edge 7.3, below 3.2); its halo stayed at 3.8 when the ring's ends became one band. Glass's graphite halo rose (above 2.2 → 2.7) when the pane took the family's concentric radius, which reshapes the pane behind the key. Five more pictures the owner supplied are drawn by the closest existing theme, each case scaled and cropped to fit by least squares or by measured centres (capture.mjs records the transform), and held at what they differ today: a dashboard by synth 281613 px, a wallet dialog by lab01 476353, a round key by soft 242097 (226956 before soft's sockets widened to 4px, 231513 before they narrowed to the study's tenth of the key: this picture's socket is wider than the study's, and the study decides; 234524 before the groove softened, 237508 before its crevice, cast and lip did, 237911 before its ring took the light from above, 239157 before its ends became one band), an actions palette by studio 530716 (530410 before studio's rim took the sheet's own colour, 480409 before studio took its reference's row gap and insets; its crop does not align with the panel, so the number says little until the picture is recaptured), an element inspector by figma 79580 (79457 before figma's progress came to end under the thumb's centre). Those are far from the pictures: no theme has their knobs, chips or list rows; the budgets measure the distance, they do not excuse it. The material themes are held to the study the same way: each of the
twelve rows keeps its averaged button profile within its zone budgets. Unlike snapshots, these
references cannot be regenerated from our own render.

**DevTools** (`theme/devtools.js`) defaults to Chrome's white Styles-pane palette:
red property names, neutral CSS values, inline punctuation, and compact monospace rows.
Its palette follows Chromium's [design tokens](https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/design_system_tokens.css).
The [declaration editor](../test/cases/devtools.html) switches between native Light
(`#ffffff`) and Dark (`#282828`) without resetting edits; gallery colormaps tint
these surfaces. Native sliders, checkboxes, and action buttons remain interactive.
Use `devtools()` for Light or `devtools({ shade: '#282828' })` for Dark.

Search and Originals/Classics filters compose. Use theme gives the JavaScript for the
theme and axes on screen; All controls opens the [controls page](../demo/controls.html)
in a dialog, in that theme with those axes. The URL keeps the theme and axes (not edited
sample values). The page scrolls as one: the header and Look bar stay at the top and the
preview beside the catalog, a panel of its own, its actions (All controls, Use theme) by the theme's name; Cases and
Controls are links in the header, by the source link. Selecting a card on mobile returns
to the preview. The [playground](../demo/playground.html) retains the original editor.

The gallery shell uses Sprae for lists, filters, selection, axis bindings, and
export state. Inputs pair `:value` with `:change`; ARIA states use explicit strings.
Theme navigation batches state and history updates so synchronous effects preserve
the Back stack. Preview mounting runs untracked, keeping edits from remounting the
panel; replacing a preview disposes its controls and stylesheet.
