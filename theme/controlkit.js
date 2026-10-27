/**
 * controlkit — calibrated to ControlKit.js's dark panel
 *
 * Custom shades derive missing color roles; explicit role axes take precedence.
 *
 * Signatures: a dense, flat near-black panel with gradient group-header bars, a
 * single burgundy-red thumbless slider fill (ControlKit's #b32435, lifted to read
 * 3:1 in its slot), a strict 30/70 label/control
 * split, and Arial type — the "Photoshop-panel" inspector look.
 * Ref: https://github.com/automat/controlkit.js
 *
 * Axes: shade (panel/chrome near-black), accent (slider/focus red), field (input fill).
 * Every other color in the file is one of two derived families, each an OKLCH
 * lightness/chroma/hue offset off an axis's own parsed color (skeu's `$` model):
 *   - shade-family: neutral panel chrome — bevels, buttons, folder bars, borders.
 *     A hued `shade` tints the whole chrome ramp, since C/H ride the live axis.
 *   - field-family: the cool content tint — labels, inset/sunken tone, pad detail.
 *     A retinted `field` retints labels/inset/pad together the same way.
 * Native constants that aren't a function of any axis in the real ControlKit skin
 * (pure ink/void, the OS checkbox) stay fixed.
 *
 * controlkit(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { parseColor, resolveAccent, toHex, clamp, ink as legible, mix } from './color.js'

const { max } = Math

export default function controlkit({
  shade = '#1a1a1a',
  accent = '#b32435',
  field,
  size = 1,
  spacing = 1,
  font,
} = {}) {
  const acc = resolveAccent(accent, shade)
  const surface = parseColor(shade)
  const dark = surface.L < .5
  field ??= shade === '#1a1a1a' ? '#222729' : toHex({ ...surface, L: clamp(surface.L + (dark ? .06 : -.06), 0, 1) })
  const ink = dark ? '#fff' : '#111'
  const voidC = '#000'

  // ── Derived tokens ──
  // Serialized as hex (not oklch()) so these can double as gradient/radial-gradient
  // stops: Chromium's default gradient interpolation space differs subtly enough
  // between oklch() and hex stops to dither a handful of in-between pixels off by
  // one — hex keeps every consumer (solid fill, gradient stop, box-shadow) on the
  // exact same rendering path the reference screenshots were measured against.
  const { C: surfaceC, H: surfaceH, L: surfaceL } = surface
  const { C: fieldC, H: fieldH, L: fieldL } = parseColor(field)
  const $ = (L, C, H) => toHex({ L: clamp(L, 0, 1), C: max(C, 0), H })
  // shade-family: lightness offset off shade's own OKLCH, chroma/hue carried live
  const s = (dL) => $(surfaceL + dL * (dark ? 1 : -1), surfaceC, surfaceH)
  // field-family: L/C/H offsets off field's own OKLCH, carried live
  const f = (dL, dC, dH) => $(fieldL + dL * (dark ? 1 : -1), fieldC + dC, fieldH + dH)

  const text = f(0.499901, 0.000862, 1.3708)          // #aeb5b8 row labels
  const muted = f(0.249410, -0.002218, 5.1557)        // #65696b panel title
  // Text at 4.5:1 where ControlKit's own falls short (WCAG 1.4.3), each tone lifted only as far as it
  // must: the title tone on the panel (3.1:1), and on a row (#2e2e2e, --row below) the hints and mark
  // labels drawn in it (2.4:1) and a separator's label (row text at 60%, 3.4:1)
  const row = mix(shade, '#fff', .087)
  const quiet = legible(row, 4.5, muted)
  const sepLabel = legible(row, 4.5, mix(row, text, .6))
  // and placeholders in the panel-title tone (4.1:1 on a field), on the field's lighter end under light
  // ink, its darker end under dark ink (the field's gradient lays 7.5% to 12.5% black over it)
  const placeholder = legible(mix(field, '#000', dark ? .075 : .125), 4.5, muted)
  const inset = f(-0.019865, -0.001096, 5.4017)       // #1e2224 slider slot, pad face
  const menuBg = f(-0.040128, -0.002141, 13.0758)     // #1a1d1f title hide button
  const bevelDk = s(0.021506)      // #1f1f1f
  const bevelLt = s(0.191334)      // #4a4a4a
  const bevelDarkDk = s(-0.031045) // #131313
  const bevelDarkLt = f(-0.007324, -0.001175, 5.3760) // #212527
  const chromeHot = s(0.172634)    // #454545 hover top, folder bar top
  const chromeHi = s(0.153708)     // #404040 button/select top
  const chromeLo = s(0.134538)     // #3b3b3b
  const rimHi = s(0.209821)        // #4f4f4f folder bar top edge
  const rimHot = s(0.220818)       // #525252 folder bar top edge, hovered
  const rimLo = s(0.050832)        // #262626 folder bar bottom edge
  const sectionBg = s(0.054954)    // #272727 nested folder bar
  const sectionRim = s(0.042538)   // #242424
  const sectionShutLo = s(0.122911) // #383838 collapsed nested bar bottom
  const sectionShutRim = s(0.18014) // #474747 collapsed nested bar top line, hovered
  const handleShade = s(-0.04937)  // #0f0f0f drop line under the slider fill
  const minmaxLabel = s(0.405623)  // #878787 range MIN/MAX
  const padCross = s(-0.004364)    // #191919
  const padAxis = f(0.083505, 0.002582, 13.1425)      // #363c40
  const padDotFill = f(0.113919, 0.011537, 9.8598)    // #39454c
  const padDotBg = f(0.202892, 0.006795, 5.4561)      // #535d62
  const fieldLine = f(-0.083613, -0.004313, 5.2852)   // #111314 color field + pad ring

  // ── Glyphs ──
  // ControlKit draws its arrows as 1x PNG sprites; each is redrawn here pixel for pixel
  // as SVG rects in axis-derived tones. A row char keys the palette, its uppercase
  // twin is the same tone at half alpha (the sprite's soft rim), '.' is clear.
  const sprite = (pal, ...rows) => {
    const rects = rows.flatMap((row, y) => [...row.matchAll(/([^.])\1*/g)].map(({ 0: run, 1: k, index: x }) => {
      const half = k !== k.toLowerCase()
      return `<rect x='${x}' y='${y}' width='${run.length}' height='1' fill='${pal[k.toLowerCase()]}'${half ? ` fill-opacity='.5'` : ''}/>`
    }))
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${rows[0].length} ${rows.length}' shape-rendering='crispEdges'>${rects.join('')}</svg>`
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  }
  const lip = f(0.146322, 0.0052, 11.3937)             // #454d52
  const glint = f(0.180447, 0.008, 3.1303)             // #4c575c
  // select: stacked up/down arrows (8×11)
  const selectPal = { o: inset, e: f(0.38343, -0.005315, 5.0609), g: f(0.469557, -0.000954, 9.9356), w: ink, h: glint }
  const selectArrow = sprite(selectPal, '...OO...', '..OeeO..', '.OewweO.', 'OewwwweO', 'HhhhhhhH', '........', 'OooooooO', 'HgwwwwgH', '.HgwwgH.', '..HggH..', '...HH...')
  // title hide/show button (8×5)
  const menuPal = { k: f(-0.092734, -0.004268, 5.3047), m: f(0.043985, 0.001803, 5.4576), n: f(0.170358, 0.007038, 5.5032), r: f(0.160216, 0.006093, 8.2317), q: lip }
  const menuHide = sprite(menuPal, '...KK...', '..KmmK..', '.KmnnmK.', 'KmnnnnmK', 'QqqqqqqQ')
  const menuShow = sprite(menuPal, 'KkkkkkkK', 'QrnnnnrQ', '.QrnnrQ.', '..QrrQ..', '...QQ...')
  // folder bar open/closed (8×5)
  const barPal = { z: voidC, y: s(0.378703), w: ink }
  const barOpen = sprite(barPal, '...ZZ...', '..ZyyZ..', '.ZywwyZ.', 'ZywwwwyZ', 'WwwwwwwW')
  const barShut = sprite(barPal, 'ZzzzzzzZ', 'WwwwwwwW', '.WwwwwW.', '..WwwW..', '...WW...')
  // nested folder bar open/closed (10×6)
  const subPal = { k: f(-0.126276, -0.004504, -26.9899), d: f(0.131071, 0.004322, 5.4479), n: f(0.352082, 0.013158, 7.173), m: f(0.268168, 0.011051, 7.4484), h: glint }
  const subOpen = sprite(subPal, '....KK....', '...KddK...', '..KdnndK..', '.KdnnnndK.', 'KdnnnnnndK', 'HhhhhhhhhH')
  const subShut = sprite(subPal, 'KkkkkkkkkK', 'HmnnnnnnmH', '.HmnnnnmH.', '..HmnnmH..', '...HmmH...', '....HH....')

  // Body 11px: ControlKit sets its labels and values in Arial at 11px.
  const body = 11
  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body, fontSize: 11, fontFamily: "Arial, sans-serif", lineHeight: 15.4, controlHeight: 25, inset: 4, rowGap: 0, columnGap: 0, sectionGap: 8, panelPadding: 0})}

  --bg: ${shade};
  --accent: ${legible(inset, 3, acc)};   /* the fill reads 3:1 in its slot (WCAG 1.4.11): ControlKit's #b32435 gives 2.5:1 */
  --field: ${field};

  --weight: 400;
  --r: calc(2 * var(--length));
  color-scheme: ${dark ? 'dark' : 'light'};

  --text: ${text};
  --muted: ${legible(shade, 4.5, muted)};
  --placeholder: ${placeholder};
  --quiet: ${quiet};
  --inset: ${inset};
  --row: color-mix(in srgb, var(--bg), white 8.7%);
  --field-bg: linear-gradient(var(--overlay-1), var(--overlay-2)), var(--field);
  --bevel-dk: ${bevelDk};
  --bevel-lt: ${bevelLt};
  --bevel: inset 0 0 0 1px var(--bevel-dk), inset -1px calc(2 * var(--length)) 0 0 var(--bevel-lt);
  /* same bevel technique, darker-toned — for chrome that sits on the near-black
     title rather than the light gray button gradient */
  --bevel-dark-dk: ${bevelDarkDk};
  --bevel-dark-lt: ${bevelDarkLt};
  --bevel-dark: inset 0 0 0 1px var(--bevel-dark-dk), inset -1px calc(2 * var(--length)) 0 0 var(--bevel-dark-lt);
  --menu-bg: ${menuBg};
  --chrome-hot: ${chromeHot};
  --chrome-hi: ${chromeHi};
  --chrome-lo: ${chromeLo};
  --chrome: linear-gradient(var(--chrome-hi), var(--chrome-lo));
  --chrome-hover: linear-gradient(var(--chrome-hot), var(--chrome-lo));
  --rim-hi: ${rimHi};
  --rim-hot: ${rimHot};
  --rim-lo: ${rimLo};
  --section-bg: ${sectionBg};
  --section-rim: ${sectionRim};
  --section-shut-lo: ${sectionShutLo};
  --section-shut-rim: ${sectionShutRim};
  --handle-shade: ${handleShade};
  --pad-cross: ${padCross};
  --pad-axis: ${padAxis};
  --field-line: ${fieldLine};
  --minmax-label: ${minmaxLabel};
  --ink: ${ink};
  --void: ${voidC};
  /* the original's lettering sits on a 1px black shadow (dark only); a light shade lifts its own colour instead, a
     faint highlight in its hue rather than white */
  --text-shadow: ${dark ? '#000' : `oklch(from ${shade} calc(l + .06) c h / .6)`};
  --shadow: rgba(0, 0, 0, .25);
  --overlay-1: rgba(0,0,0,.075);
  --overlay-2: rgba(0,0,0,.125);
  --overlay-3: rgba(0,0,0,.1);
  --overlay-4: rgba(0,0,0,.05);

  background: var(--bg);
  color: var(--text);

  width: calc(200 * var(--length));
  min-width: 0;
  max-width: calc(200 * var(--length));
  border-radius: calc(3 * var(--length));
  padding: var(--panel-padding);
  box-shadow: var(--shadow) 0 calc(2 * var(--length)) calc(2 * var(--length)) 0;
  /* native's overflow:hidden: the square title and last row take the rounded corners */
  overflow: clip;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Title (flat, same near-black as the panel — rows are what read lighter) ── */
  > summary, > .s-panel-title {
    background: var(--bg); color: var(--muted); font-weight: 700; height: calc(30 * var(--length)); padding: 0 calc(10 * var(--space)); font-size: calc(11 * var(--length)); line-height: calc(30 * var(--length)); text-shadow: 0 1px 0 var(--text-shadow);
    /* the 20px hide/show button: sprite swaps with state (native has no rotation) */
    &::after { content: ''; flex: none; width: calc(20 * var(--length)); height: calc(20 * var(--length)); margin-left: auto; background: ${menuShow} center / calc(8 * var(--length)) calc(5 * var(--length)) no-repeat, var(--menu-bg); border-radius: calc(2 * var(--length)); box-shadow: var(--bevel-dark); }
    &:hover::after { background-color: var(--void); }
  }
  .s-search-input::placeholder { color: var(--muted); }   /* in the title tone, on the title bar */
  &[open] > summary::after { background-image: ${menuHide}; }
  .s-panel-content { gap: var(--row-gap); padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Row: 30% label / 70% value, both top-anchored like native's floated cells ── */
  .s-control { gap: var(--column-gap); padding: 0 calc(10 * var(--space)); min-height: calc(35 * var(--length)); align-items: flex-start; background: var(--row); border-bottom: 1px solid var(--field); }
  /* a group's last row drops its divider (native li:last-of-type) */
  .s-control:not(.s-folder):last-child, .s-control:has(+ .s-folder) { border-bottom: 0; }
  /* ...but consecutive sub-groups keep native's divider between them */
  :is(.s-control:not(.s-folder), .s-section):has(+ .s-section) { border-bottom: 1px solid var(--section-rim); }
  .s-label-group { flex: 0 0 30%; width: 30%; min-width: 0; max-width: none; padding: calc(12 * var(--space)) calc(5 * var(--space)) 0 0; line-height: normal; }
  /* native ellipsizes in a 34px-tall box; clip (not hidden) with a 1px margin keeps the 1px text-shadow under descenders */
  .s-label-group .s-label { min-width: 0; overflow: clip; overflow-clip-margin: 1px; white-space: nowrap; text-overflow: ellipsis; color: var(--text); font-weight: 400; text-shadow: 1px 1px 0 var(--text-shadow); }
  .s-hint { color: var(--quiet); opacity: 1; }
  /* secondary text, one step under the body */
  :is(.s-hint, .s-mark-label, .s-separator-label, .s-tooltip, .s-title-text, .s-vec-label, .s-knob-val, .s-pad-val) { font-size: calc(10 * var(--length)); }
  .s-input { gap: calc(4 * var(--space)); align-items: flex-start; padding-top: calc(5 * var(--space)); }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--field-bg); color: var(--ink); border: none; border-radius: calc(2 * var(--length));
    height: var(--control-height); padding: 0 0 0 calc(8 * var(--space)); font: inherit; line-height: normal; text-shadow: 1px 1px 0 var(--text-shadow);
    box-shadow: inset 0 0 0 1px var(--bevel-dk);
    &::placeholder { color: var(--placeholder); }
    &:focus { outline: 0; }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number: a plain left-aligned text field, as native's NumberInput ── */
  .s-number { input[type="number"] { flex: 1; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Slider: 70% slot with a thumbless red fill, 25% readout flush right ── */
  .s-slider {
    &:not(.s-multiple) .s-input { padding-top: calc(6 * var(--space)); justify-content: space-between; gap: 0; }
    /* labelled marks hang in a line the row reserves under the track: the gap and a 1.25 line of the label */
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(14.5 * var(--length)); }
    .s-track { flex: 0 1 70%; height: var(--control-height); margin: 0; background: var(--inset); border-radius: calc(2 * var(--length)); padding: calc(3 * var(--space)) calc(3 * var(--space)) calc(2 * var(--space)); box-shadow: inset 0 0 0 1px var(--bevel-dk); cursor: ew-resize; }
    /* fill = handle face + its shading gradient over a 1px drop line, --p wide rounded to whole
       px like native's Math.round(intrpl * slotWidth) */
    input[type="range"] {
      width: 100%; height: 100%; -webkit-appearance: none; appearance: none; cursor: ew-resize; border: none; border-radius: 0;
      background: linear-gradient(transparent, var(--overlay-3)) 0 0 / round(var(--p, 0%), 1px) calc(100% - 1px) no-repeat, linear-gradient(var(--accent), var(--accent)) 0 0 / round(var(--p, 0%), 1px) calc(100% - 1px) no-repeat, linear-gradient(var(--handle-shade), var(--handle-shade)) 0 0 / round(var(--p, 0%), 1px) 100% no-repeat;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 0; height: 100%; }
      &::-moz-range-thumb { width: 0; height: 100%; border: none; }
      &:focus-visible { outline: 1px solid var(--accent); outline-offset: 1px; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, calc(2 * var(--length))); color: var(--quiet); white-space: nowrap; line-height: 1.25;
      /* the end labels stay inside the track's span: the first starts at 0%, the last ends at 100% */
      &.s-first { transform: translate(0, calc(2 * var(--length))); } &.s-last { transform: translate(-100%, calc(2 * var(--length))); } }
    /* the original's 25% box; a longer value ('440 Hz') widens it and the slot gives way */
    .s-readout { flex: 0 0 auto; width: 25%; min-width: 25%; @supports (field-sizing: content) { field-sizing: content; width: auto; } text-align: center; background: var(--field-bg); color: var(--ink); border: none; border-radius: calc(2 * var(--length)); height: var(--control-height); padding: 0; line-height: normal; font-variant-numeric: tabular-nums; text-shadow: 1px 1px 0 var(--text-shadow); box-shadow: inset 0 0 0 1px var(--bevel-dk); }
    /* read-only readouts are spans: center the normal line box the way an input does */
    span.s-readout { display: flex; align-items: center; justify-content: center; }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: calc(2 * var(--length)); background: var(--void); color: var(--ink); padding: calc(1 * var(--length)) calc(4 * var(--space)); white-space: nowrap; }
    /* range: four equal quarter cells, MIN · lo · MAX · hi, as native's sub-wraps */
    &.s-multiple .s-input { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
    &.s-multiple .s-interval-track { display: none; }
    &.s-multiple .s-readout { position: relative; width: auto; cursor: ew-resize; }
    &.s-multiple .s-readout-lo { grid-column: 2; }
    &.s-multiple .s-readout-hi { grid-column: 4; }
    /* the grid's own pseudo cells, so an editable readout (an input, which draws no ::before) keeps them */
    &.s-multiple .s-input::before, &.s-multiple .s-input::after { grid-row: 1; padding-top: calc(8 * var(--space)); text-align: center; line-height: normal; color: var(--minmax-label); font-weight: 700; text-shadow: 1px 1px 0 var(--bg); }
    &.s-multiple .s-input::before { content: 'MIN'; grid-column: 1; }
    &.s-multiple .s-input::after { content: 'MAX'; grid-column: 3; }
  }

  /* ── The colour's alpha: the slider's slot, the checkerboard under the colour's ramp in place of the fill;
     a ramp cannot show the value by its length, so a 2px ink handle marks it ── */
  .s-rgba .s-alpha {
    flex: 1 1 0; min-width: calc(24 * var(--length)); height: var(--control-height); padding: calc(3 * var(--space)) calc(3 * var(--space)) calc(2 * var(--space)); border-radius: calc(2 * var(--length)); box-shadow: inset 0 0 0 1px var(--bevel-dk); cursor: ew-resize;
    background: linear-gradient(to right, transparent, var(--c)) content-box, conic-gradient(#c4c4c4 90deg, #fff 0 180deg, #c4c4c4 0 270deg, #fff 0) 0 0 / calc(8 * var(--length)) calc(8 * var(--length)) content-box, var(--inset);
    &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(2 * var(--length)); height: calc(var(--control-height) - 5 * var(--space)); border: none; border-radius: 0; background: var(--ink); box-shadow: 0 0 0 1px var(--void); }
    &::-moz-range-thumb { width: calc(2 * var(--length)); height: calc(var(--control-height) - 5 * var(--space)); border: none; border-radius: 0; background: var(--ink); box-shadow: 0 0 0 1px var(--void); }
    &:focus-visible { outline: 1px solid var(--accent); outline-offset: 1px; }
  }

  /* ── Select: the same gray-gradient button as .s-button, regular weight ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer; color: var(--ink); font-weight: 400;
      height: var(--control-height); padding: 0 calc(20 * var(--space)) 0 calc(10 * var(--space)); box-shadow: var(--bevel); text-overflow: ellipsis; white-space: nowrap;
      background: ${selectArrow} right calc(8 * var(--length)) center / calc(8 * var(--length)) calc(11 * var(--length)) no-repeat, var(--chrome);
      &:hover { background-image: ${selectArrow}, var(--chrome-hover); }
      option { background: var(--field); color: var(--text); } }
    &.s-segmented { .s-input { gap: 0; } button { flex: 1; background: var(--field); border: 1px solid var(--void); color: var(--text); margin-left: calc(-1 * var(--length)); height: var(--control-height); padding: 0 calc(2 * var(--length)); font: inherit; &:first-child { margin-left: 0; } &.s-selected { background: var(--accent); color: var(--ink); } } }
    /* a list starts on the label's line: the first option's text where the label's is, 12px down */
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(2 * var(--length)); padding-top: calc(12 * var(--space)); } .s-input label { display: flex; align-items: center; gap: calc(5 * var(--space)); cursor: pointer; } }
  }

  /* ── Boolean: the OS checkbox, which native ControlKit leaves unstyled; the checkboxes list shows the same box ── */
  .s-boolean input[type="checkbox"], .s-checkboxes input[type="checkbox"] { appearance: auto; color-scheme: light; accent-color: var(--s-color, auto); position: static; opacity: 1; width: calc(13 * var(--length)); height: calc(13 * var(--length)); margin: 0; cursor: pointer; }
  :is(.s-boolean, .s-checkboxes) .s-track { display: none; }
  .s-boolean input[type="checkbox"] { margin: calc(6 * var(--space)) 0 0; }

  /* ── Color: the swatch is the field; hex centered on it. ControlKit letters it in the panel ink,
     white on #ff0000 at 4.0:1; here black or white by WCAG luminance at .179, where both reach
     the same contrast (color.js onAccent), so it reads 4.5:1 or more on any color; flat, without the
     fields' embossed shadow ── */
  .s-color {
    &.s-picker .s-color-input { gap: 0; position: relative; border-radius: calc(2 * var(--length)); overflow: hidden;
      input[type="color"] { position: absolute; inset: 0; width: 100%; height: var(--control-height); padding: 0; border: none; cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } }
      input[type="text"] { position: relative; flex: 1; background: var(--color); text-align: center; padding: 0; line-height: var(--control-height); box-shadow: inset 0 0 0 1px var(--field-line);
        --hex-ink: clamp(0, (.179 - (.2126 * pow((r / 255 + .055) / 1.055, 2.4) + .7152 * pow((g / 255 + .055) / 1.055, 2.4) + .0722 * pow((b / 255 + .055) / 1.055, 2.4))) * 1e6, 255);
        color: rgb(from var(--color) var(--hex-ink) var(--hex-ink) var(--hex-ink));
        text-shadow: none; } }   /* printed flat on the colour: the field's embossed shadow would bevel it */
    /* rgba: the swatch is a small field, then the alpha slot, then the value at its length */
    &.s-rgba .s-color-input { gap: calc(4 * var(--space));
      input[type="color"] { width: calc(28 * var(--length)); height: var(--control-height); padding: 0; border: none; border-radius: calc(2 * var(--length)); overflow: hidden; cursor: pointer; box-shadow: inset 0 0 0 1px var(--field-line); &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } &::-moz-color-swatch { border: none; } }
      input[type="text"] { flex: 0 0 auto; width: auto; field-sizing: content; } }   /* the whole code: the alpha gives way */
    &.s-swatches .s-input { flex-wrap: wrap; }
    &.s-swatches button { width: calc(16 * var(--length)); height: calc(16 * var(--length)); border: 1px solid var(--void); &.s-selected { outline: 1px solid var(--accent); } }
  }

  /* ── Button: gray gradient, uppercase ── */
  button { font: inherit; cursor: pointer; &:focus-visible { outline: 1px solid var(--accent); outline-offset: 1px; } }
  .s-button {
    /* full-width by owner's decision — native ControlKit keeps buttons at the value column */
    .s-input { flex: 1; }
    button { width: 100%; background: var(--chrome); color: var(--ink); border: none; border-radius: calc(2 * var(--length)); height: var(--control-height); font-size: calc(10 * var(--length)); line-height: normal; font-weight: 700; text-transform: uppercase; text-shadow: 0 1px 0 var(--text-shadow); box-shadow: var(--bevel); &:hover { background: var(--chrome-hover); } &:active { background: var(--chrome); } }
    &.s-secondary button, button.s-secondary { background: var(--field); }
  }

  /* ── XY pad: square face filling the value column ── */
  .s-xy .s-input { padding-block: calc(6 * var(--space)) calc(5 * var(--space)); }
  .s-pad {
    position: relative; width: 100%; height: auto; aspect-ratio: 1; border-radius: calc(2 * var(--length)); border: none;
    /* native's pad face carries a faint top-to-bottom inset gradient over the flat fill, same trick as the fields */
    background: linear-gradient(transparent, var(--overlay-4)), var(--inset);
    box-shadow: inset 0 0 0 1px var(--bevel-dk);
    /* fixed center crosshair, painted under the live axes and the dot like native's first path */
    &::before { content: ''; position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(var(--pad-cross), var(--pad-cross)) 0 calc(50% + .5px) / 100% 1px no-repeat, linear-gradient(var(--pad-cross), var(--pad-cross)) calc(50% + .5px) 0 / 1px 100% no-repeat; }
    .s-pad-x, .s-pad-y { background: var(--pad-axis); }
    .s-pad-x { top: var(--y, 50%); }
    .s-pad-y { left: var(--x, 50%); }
    /* native's dot is layered SVG circles (r11 halo, r10 base, r9 fill 0.75px low, r10 ring,
       r6 disc, r3 center) on a half-pixel grid; the same circles, same order */
    .s-pad-dot {
      width: calc(22 * var(--length)); height: calc(22 * var(--length)); border-radius: 0; box-shadow: none;
      transform: translate(calc(-50% + .5px), calc(-50% + .5px));
      background: url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='-11 -11 22 22'><circle r='11' fill='#000' fill-opacity='.05'/><circle r='10' fill='${padDotBg}'/><circle r='9' cy='.75' fill='${padDotFill}'/><circle r='10' fill='none' stroke='${fieldLine}'/><circle r='6' fill='${inset}'/><circle r='3' fill='${ink}'/></svg>`)}") center / 100% 100% no-repeat;
    }
  }

  /* ── Textarea / info: native's textarea field, text on top padding rather than centered ── */
  .s-textarea { textarea { flex: 1; resize: none; field-sizing: content; min-height: calc(40 * var(--length)); max-height: 50vh; padding: calc(5 * var(--space)) calc(8 * var(--space)) calc(2 * var(--space)); } }
  /* a long value wraps in its field, as native's string output does, rather than hiding its end */
  .s-info .s-monitor {
    flex: 1; display: block; background: var(--field-bg); color: var(--ink); border-radius: calc(2 * var(--length));
    min-height: var(--control-height); line-height: normal; padding: calc(5 * var(--space)) calc(8 * var(--space)) calc(4 * var(--space)); overflow-wrap: break-word; text-shadow: 1px 1px 0 var(--text-shadow);
    box-shadow: inset 0 0 0 1px var(--bevel-dk); font-variant-numeric: tabular-nums; opacity: 1;
  }

  /* ── Folder: gradient group bar ──
     the <details> itself carries .s-control too (folder.js), so it inherits that row's
     padding/background/border-bottom/min-height — reset them here so the folder spans the
     panel edge-to-edge like native's group headers, same as base.js resolves .s-folder's
     display over .s-control's: equal specificity, this rule sits later in the cascade. */
  .s-folder {
    padding: 0; min-height: 0; background: none; border-bottom: 0;
    /* the label's 38px line box starts under the top edge and overhangs the 36px content, as native's */
    > summary { align-items: flex-start; background: var(--chrome-hover); color: var(--ink); font-size: calc(12 * var(--length)); font-weight: 700; line-height: calc(38 * var(--length)); height: calc(38 * var(--length)); padding: 0 calc(10 * var(--space)); border-top: 1px solid var(--rim-hi); border-bottom: 1px solid var(--rim-lo); text-shadow: 0 1px 0 var(--text-shadow);
      &::after { content: ''; flex: none; width: calc(10 * var(--length)); height: calc(36 * var(--length)); margin-left: auto; background: ${barShut} center / calc(8 * var(--length)) calc(5 * var(--length)) no-repeat; }
      &:hover { border-top-color: var(--rim-hot); background: linear-gradient(var(--chrome-hot), var(--chrome-hi)); } }
    &[open] > summary::after { background-image: ${barOpen}; }
    /* nested folder: native's flat sub-group bar */
    &.s-section > summary, .s-content .s-folder > summary { background: var(--section-bg); font-size: calc(11 * var(--length)); line-height: calc(27 * var(--length)); height: calc(27 * var(--length)); border-top: 0; border-bottom-color: var(--section-rim); text-shadow: 1px 1px 0 var(--text-shadow); text-transform: capitalize;
      &::after { height: calc(26 * var(--length)); background-image: ${subShut}; background-size: calc(10 * var(--length)) calc(6 * var(--length)); } }
    &.s-section[open] > summary::after, .s-content .s-folder[open] > summary::after { background-image: ${subOpen}; }
    /* collapsed nested bar is native's head-inactive: raised gradient, top highlight line, no divider */
    &.s-section:not([open]) > summary, .s-content .s-folder:not([open]) > summary { background: linear-gradient(var(--chrome-lo), var(--section-shut-lo)); box-shadow: inset 0 1px 0 0 var(--chrome-hi); border-bottom: 0;
      &::after { height: calc(27 * var(--length)); }
      &:hover { background: linear-gradient(var(--chrome-hi), var(--chrome-lo)); box-shadow: inset 0 1px 0 0 var(--section-shut-rim); } }
    .s-content { gap: 0; }
  }

  /* separators ride .s-control: drop the row's min-height and divider, keep base's own layout */
  .s-separator { min-height: 0; border-bottom: 0; align-items: center; }
  .s-separator:not(.s-separator-labeled) { padding: 0; background: var(--void); opacity: 1; }
  .s-separator-label { color: ${sepLabel}; opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
