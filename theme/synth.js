/**
 * synth – colour as function: every group wears its own hue on quiet white cards.
 *
 * Reference: Ableton Learning Synths, the Playground (https://learningsynths.ableton.com/en/playground).
 * Values cite the page's own stylesheet (styles/styles.min.css): white cards (--color-background)
 * on a #f3f3f6 tray (--color-gray-1), indigo ink #00004c (--color-indigo), 2px #e2e2e9 tracks
 * (--color-shade) and one hue per function (--color-oscillator #23b2fe, --color-amplitude #00d692,
 * --color-filter #febc2d, --color-modulation #e4525a). Dark tokens are the page's own
 * prefers-color-scheme: dark set (#1b1b1d cards, #b3b3b3 ink, #39393c tracks).
 *
 * Structure: the panel is a card; each folder is the next card, cut off by a band of tray.
 * A group's hue (`accent` for the panel, `hues` cycled over its folders, or a row's own
 * `style: '--accent: …'`) colours its title, slider fill, ring thumb, selection and pad;
 * a row that carries its own hue shows its readout in it, like the original's modulation rows.
 * Labels sit on a line above their control, the value right-aligned on the same line;
 * a slider fills from zero, so a range that crosses zero fills both ways.
 *
 * Legibility: text never wears the raw hue. Titles and readouts take the hue moved just far
 * enough from the card to reach 4.5:1 (WCAG 2.x luminance, computed in CSS from whatever
 * --accent is in force); lettering on a hue fill is the card colour where that reads, else the
 * ink, else white or black.
 * Marks that show state (slider fill and thumb, switch, checks, radios, the selected chip, pad,
 * knob pointer) take the hue moved to 3:1 the same way (WCAG 1.4.11); the original's raw hues
 * fall below it on the white card. A segmented row measures both against its wash. The toggle
 * and a pressed button, which say their state in lettering, keep the raw hue.
 *
 * Axes: shade (the card; tray, track and field derive from it), accent, hues (folder cycle;
 * [] gives every folder the accent), size, spacing, font, weight.
 *
 * synth(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { parseColor, toHex, ink, luminance, clamp, resolveAccent, mix } from './color.js'

// The original's function colours in signal order: oscillator, amplitude, filter, modulation.
export const functions = ['#23b2fe', '#00d692', '#febc2d', '#e4525a']

export default function synth({
  shade = '#ffffff',
  accent = functions[0],
  hues = functions,
  size = 1,
  spacing = 1,
  font,
  weight = 400,
} = {}) {
  const { L, C, H } = parseColor(shade)
  const dark = L < .5
  // The original's greys are a cool tint (hue 286) whose chroma grows with the step from the card
  // (#f3f3f6 .004, #e2e2e9 .009; the dark set about a third of that); a coloured card keeps its own.
  const at = dl => toHex({ L: clamp(L + dl, 0, 1), ...(C < .01 ? { C: (dark ? .04 : .11) * Math.abs(dl), H: 286 } : { C: Math.min(C, .03), H }) })
  // ΔL from card to tray / track, measured on the original's light (#fff → #f3f3f6, #e2e2e9)
  // and dark (#1b1b1d → #0c0c0d, #39393c) sets.
  const tray = at(dark ? -.068 : -.035)
  const track = at(dark ? .123 : -.085)
  const field = dark ? track : tray     // --control-background-default: gray-1 light, gray-2 dark
  // Lettering is set against the field, the surface nearer to it in lightness, so it reads on both.
  const text = ink(field, 4.5, dark ? '#b3b3b3' : '#00004c')
  const quiet = ink(field, 4.5, dark ? '#7c7c83' : '#797986')

  // Accent derivatives, computed in CSS from the --accent in force on each element (so a
  // row's own --accent is covered too). Y is the WCAG relative luminance of the origin colour.
  const Y = '(0.2126 * r + 0.7152 * g + 0.0722 * b)'
  const card = toHex(parseColor(shade)), Yc = luminance(card)
  // A segmented row lies on a 5% wash of its hue (srgb), at its farthest from the lettering 5%
  // black over a light card, 5% white over a dark one.
  const Yw = luminance(mix(card, dark ? '#fff' : '#000', .05))
  const bound = (ratio, Yb) => dark ? ratio * (Yb + .05) - .05 : (Yb + .05) / ratio - .05
  // The hue legible on a ground of luminance Yb (the card unless given): on a light card its linear
  // light is scaled down to the bound, on a dark one it is mixed with white up to it; .1 of margin
  // covers 8-bit rounding.
  const legible = (ratio, Yb = Yc) => {
    const b = +bound(ratio + .1, Yb).toFixed(4)
    const ch = c => dark ? `calc(${c} + max(0, (${b} - ${Y}) / (1 - ${Y})) * (1 - ${c}))` : `calc(${c} * min(1, ${b} / ${Y}))`
    return `color(from var(--accent) srgb-linear ${ch('r')} ${ch('g')} ${ch('b')})`
  }
  // Lettering on a hue fill: the card colour where it reaches `ratio` (the original letters its
  // selected chips in it), else the ink where that does, else white or black, whichever reads
  // (one of them always reaches 4.58:1).
  const lin = hex => hex.slice(1).match(/../g).map(h => { const c = parseInt(h, 16) / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4 })
  const passes = (tone, ratio) => {
    const Yt = luminance(tone), b = +(Yt > .179 ? (Yt + .05) / ratio - .05 : ratio * (Yt + .05) - .05).toFixed(4)
    return `clamp(0, ${Yt > .179 ? `(${b} - ${Y})` : `(${Y} - ${b})`} * 100000, 1)`
  }
  const on = (ratio, fill = 'var(--accent)') => {
    const [C0, I0] = [lin(card), lin(text)]
    const white = `clamp(0, (0.179 - ${Y}) * 100000, 1)`, kc = passes(card, ratio), ki = passes(text, ratio)
    const ch = i => { const ink = `(${white} + ${ki} * (${+I0[i].toFixed(5)} - ${white}))`; return `calc(${ink} + ${kc} * (${+C0[i].toFixed(5)} - ${ink}))` }
    return `color(from ${fill} srgb-linear ${ch(0)} ${ch(1)} ${ch(2)})`
  }

  const svg = (vb, body) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='${vb}'>${body}</svg>`)}")`
  const caret = svg('0 0 12 8', `<path d='M1.5 1.75 6 6.25 10.5 1.75' fill='none' stroke='black' stroke-width='1.5'/>`)
  const check = svg('0 0 12 10', `<path d='M1.5 5 4.5 8 10.5 1.5' fill='none' stroke='black' stroke-width='2' stroke-linecap='square'/>`)
  const mask = img => `-webkit-mask: ${img} center / contain no-repeat; mask: ${img} center / contain no-repeat`

  const cycle = Array.isArray(hues) ? hues.filter(h => h != null && h !== '').map(h => resolveAccent(h, shade)) : []

  // Body 12px: Learning Synths sets its labels and values in Outfit at 12px.
  const body = 12
  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body, fontSize: 12, lineHeight: 18, controlHeight: 28, inset: 7.5, rowGap: 9, columnGap: 8, panelPadding: 21, fontFamily: "'Outfit', system-ui, sans-serif" })}

  /* ── Tones (shade axis) ── */
  --bg: ${shade};
  --tray: ${tray};
  --track: ${track};
  --field: ${field};
  --ink: ${text};
  --quiet: ${quiet};
  --accent: ${resolveAccent(accent, shade)};
  color-scheme: ${dark ? 'dark' : 'light'};

  /* ── Geometry, in the original's em of its 12px panel type ── */
  --pt: calc(9.75 * var(--space));                         /* card top inset, .8125em */
  --band: calc(8 * var(--space));                          /* tray between cards */
  --thumb: calc(15.75 * var(--length));                    /* ring thumb, 1.3125em */
  --ring: calc(2 * var(--length));
  --hair: calc(2 * var(--length));                         /* track, --slider-track-height-px */
  --slide: calc(15.75 * var(--length) + 17.25 * var(--space)); /* slider body, 2.75em */
  --chip: calc(25.5 * var(--length));                      /* segmented choice, 2.125em */
  --h: var(--control-height);                              /* fields and buttons, 2.3334em */
  --r: calc(4 * var(--length));                            /* --control-border-radius */
  --weight: ${weight};

  background: var(--bg);
  color: var(--ink);
  padding: 0 var(--panel-padding) var(--panel-padding);
  min-width: 0;
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
  font-weight: var(--weight);
  -webkit-font-smoothing: antialiased;

  &, .s-folder, .s-control {
    --accent-text: ${legible(4.5)};          /* hue text on the card */
    --accent-mark: ${legible(3)};            /* hue marks on the card: fills, rings, thumbs, pad, knob */
    --chip-text: ${legible(4.5, Yw)};        /* the same on a segmented row's wash */
    --chip-mark: ${legible(3, Yw)};
    --on-accent: ${on(4.5)};
    --on-chip: ${on(4.5, 'var(--chip-mark)')};
  }
${cycle.map((hue, i) => `  .s-panel-content > .s-folder:nth-of-type(${cycle.length}n + ${i + 1}) { --accent: ${hue}; }`).join('\n')}

  /* ── Card titles: the panel's and each folder's ── */
  > summary, > .s-panel-title, .s-folder > summary {
    font-size: calc(var(--font-size) * 1.4); line-height: 1; font-weight: var(--weight);
    color: var(--accent-text);
    padding: calc(var(--pt) + .625em) 0 .75em;
    gap: var(--column-gap);
    &:focus-visible { outline: 2px solid var(--accent-text); outline-offset: -2px; }
  }
  > summary::after, .s-folder:not(.s-section) > summary::after {
    content: ''; flex: none; margin-left: auto; width: .6em; height: .6em; background: currentColor; ${mask(caret)};
    transform: rotate(-90deg); transition: transform .15s;
  }
  &[open] > summary::after, .s-folder[open] > summary::after { transform: none; }
  .s-fold-icon { display: none; }
  .s-folder.s-section > summary { pointer-events: none; }

  /* ── Cards: rows carry their own top space; a folder starts the next card ── */
  .s-panel-content, .s-content { gap: 0; }
  .s-panel-content:first-child { padding-top: var(--pt); }
  .s-panel-content:has(> .s-folder:first-child) { padding-top: 0; }
  &:has(> .s-panel-content > .s-folder:last-child) { padding-bottom: 0; }
  .s-folder {
    margin-inline: calc(-1 * var(--panel-padding));
    padding: 0 var(--panel-padding) var(--panel-padding);
    border-top: var(--band) solid var(--tray);
  }
  .s-panel-content:first-child > .s-folder:first-child { border-top: 0; }
  /* a card with only its title centres it, like the original's header-only cards (Record, Export: 50.6px) */
  .s-folder:not([open]), .s-folder:has(> .s-content:empty) { padding-bottom: 0; > summary { padding-block: calc(var(--pt) + .425em); } }
  &:is(details):not([open]) { padding-bottom: 0; > summary { padding-block: calc(var(--pt) + .425em); } }

  /* ── Rows, the original's two kinds: a parameter group (a 1.5 label line, the control under it,
     .625em after) and a slider (.75em above a 1.0 label line, the value at its end, a 2.75em body) ── */
  .s-control:not(.s-folder) { flex-direction: column; align-items: stretch; gap: 0; }
  .s-control:not(.s-folder, .s-slider):not(:last-child) { padding-bottom: calc(7.5 * var(--space)); }
  .s-control:has(> .s-input[inert]) { opacity: .45; }
  .s-label-group { width: auto; min-width: 0; max-width: none; line-height: var(--line-height); gap: 0; }
  .s-label { font-weight: var(--weight); }
  .s-hint { color: var(--quiet); opacity: 1; font-size: 1em; line-height: var(--line-height); }
  .s-input { gap: calc(4 * var(--space)); align-items: center; }
  .s-title {
    display: inline-grid; place-items: center; flex: none;
    width: calc(14 * var(--length)); height: calc(14 * var(--length)); border-radius: 50%;
    border: calc(1.5 * var(--length)) solid currentColor; font-size: calc(9 * var(--length)); line-height: 1;
  }
  .s-title-text { top: calc(100% + 4 * var(--length)); padding: calc(4 * var(--space)) calc(8 * var(--space)); background: var(--ink); color: var(--bg); border-radius: var(--r); line-height: var(--line-height); }

  /* ── Fields: grey wells on the card ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--field); color: var(--ink); border: 0; border-radius: var(--r);
    font: inherit; padding: 0 var(--inset); min-height: var(--h);
    &::placeholder { color: var(--quiet); }
    &:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 0; }
  }
  .s-text input, .s-number input, .s-color input[type="text"], textarea { flex: 1; }
  textarea { padding: calc(5 * var(--space)) var(--inset); resize: vertical; field-sizing: content; min-height: calc(3 * var(--line-height) + 10 * var(--space)); max-height: 50vh; }
  .s-textarea.s-code textarea { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: .92em; }
  select { appearance: none; -webkit-appearance: none; flex: 1; cursor: pointer; height: var(--h); padding-right: calc(24 * var(--length));
    option { background: var(--bg); color: var(--ink); }
  }
  .s-dropdown .s-input { position: relative; }
  .s-dropdown .s-input::after { content: ''; position: absolute; right: calc(11 * var(--length)); top: 50%; width: calc(7 * var(--length)); height: calc(5 * var(--length)); transform: translateY(-50%); background: var(--ink); ${mask(caret)}; pointer-events: none; }
  select:hover, .s-button button:not(:disabled):hover { background-color: color-mix(in srgb, var(--accent) 10%, var(--bg)); }

  /* ── Number ── */
  .s-number {
    .s-input { gap: 0; background: var(--field); border-radius: var(--r); &:focus-within { outline: 2px solid var(--accent-text); } }
    input[type="number"] { background: none; text-align: right; cursor: ew-resize; -moz-appearance: textfield; font-variant-numeric: tabular-nums;
      &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      &:focus { cursor: text; } &:focus-visible { outline: none; } }
    /* the arrows lie on the field, not the card: the hue mark held to 3:1 there (the card's mark reads 2.8:1 on a light field) */
    .s-step { gap: 0; padding-right: calc(4 * var(--space));
      /* the dropdown's caret, pointing up and down */
      button { width: calc(16 * var(--length)); height: calc(var(--h) / 2 - 2 * var(--length)); padding: 0; border: 0; font-size: 0; background: ${legible(3, luminance(field))}; ${mask(caret)}; -webkit-mask-size: calc(7 * var(--length)) calc(5 * var(--length)); mask-size: calc(7 * var(--length)) calc(5 * var(--length)); &:hover { background: var(--accent-text); } }
      .s-step-up { transform: rotate(180deg); } }
  }

  /* ── Slider: a label line with the value at its end; a hairline that fills from zero ── */
  .s-control.s-slider {
    display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 0 calc(6 * var(--space));
    padding: var(--row-gap) 0 0;
    > .s-label-group { grid-area: 1 / 1; line-height: 1; }
    > .s-input { display: contents; }
    .s-track, .s-interval-track { grid-area: 2 / 1 / 3 / -1; position: relative; display: block; height: var(--slide); }
    .s-readout { grid-area: 1 / 3; }
    .s-readout-lo { grid-area: 1 / 2; }
    input[type="range"] {
      -webkit-appearance: none; appearance: none; display: block; cursor: grab;
      width: calc(100% + var(--thumb)); height: var(--slide); margin: 0 calc(var(--thumb) / -2);
      --z: 0%;
      @supports (width: attr(x type(<length>))) {
        --z: clamp(0%, calc(attr(min type(<number>), 0) / (attr(min type(<number>), 0) - attr(max type(<number>), 1)) * 100%), 100%);
      }
      --a: min(var(--z), var(--p, 0%));
      --b: max(var(--z), var(--p, 0%));
      background: linear-gradient(to right, var(--track) var(--a), var(--accent-mark) var(--a) var(--b), var(--track) var(--b))
        center calc(var(--slide) / 2) / calc(100% - var(--thumb)) var(--hair) no-repeat;
    }
    .s-readout { background: none; border: 0; border-radius: 0; padding: 0; min-height: 0; height: 1lh; line-height: 1; width: auto; min-width: 1ch; field-sizing: content;
      text-align: right; color: var(--ink); font-variant-numeric: tabular-nums; cursor: ew-resize;
      &:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 2px; } }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark { position: absolute; top: calc(var(--slide) / 2 + var(--hair) / 2); width: calc(4 * var(--length)); height: calc(4 * var(--length)); border-radius: 50%; background: var(--track); transform: translate(-50%, -50%); &.s-active { background: var(--accent-mark); } }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 1em; }
    .s-mark-label { position: absolute; top: calc(var(--slide) / 2 + var(--thumb) / 2 + 2 * var(--length)); transform: translateX(-50%); line-height: 1; white-space: nowrap; color: var(--quiet); &.s-active { color: var(--accent-text); } }
    :not(.s-mark-labels) + .s-mark-labels .s-mark-label { transform: none; }
    .s-mark-labels:not(:has(+ .s-mark-labels)) .s-mark-label { transform: translateX(-100%); }
    /* a tooltip readout keeps the theme's one place for a value: the end of the label line */
    .s-tooltip { left: auto !important; right: 0; bottom: 100%; transform: none; line-height: 1; color: var(--ink); font-variant-numeric: tabular-nums; }
  }
  .s-control.s-slider input[type="range"], .s-color .s-alpha {
    --body: var(--slide);
    &::-webkit-slider-runnable-track { height: var(--body); background: none; }
    &::-moz-range-track { height: var(--hair); background: none; }
    &::-webkit-slider-thumb { -webkit-appearance: none; box-sizing: border-box; width: var(--thumb); height: var(--thumb); margin-top: calc(var(--body) / 2 - var(--thumb) / 2); border-radius: 50%; border: var(--ring) solid var(--accent-mark); background: var(--bg); }
    &::-moz-range-thumb { box-sizing: border-box; width: var(--thumb); height: var(--thumb); border-radius: 50%; border: var(--ring) solid var(--accent-mark); background: var(--bg); }
    &:active { cursor: grabbing; &::-webkit-slider-thumb { background: var(--accent-mark); } &::-moz-range-thumb { background: var(--accent-mark); } }
    &:focus-visible { outline: none;
      &::-webkit-slider-thumb { box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent-text); }
      &::-moz-range-thumb { box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent-text); } }
  }
  .s-control[style*="--accent"] .s-readout { color: var(--accent-text); }
  .s-slider.s-multiple {
    .s-readout-hi { grid-area: 1 / 3; }
    .s-interval-track {
      background: linear-gradient(var(--track), var(--track)) 0 calc(var(--slide) / 2) / 100% var(--hair) no-repeat;
      &::before { content: ''; position: absolute; top: calc(var(--slide) / 2); height: var(--hair); left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent-mark); }
      input[type="range"] { left: calc(var(--thumb) / -2); width: calc(100% + var(--thumb)); margin: 0; background: none; }
    }
  }

  /* ── Select: segmented chips on a 5% wash of the hue; per-option --icon draws a glyph ── */
  .s-select {
    &.s-segmented .s-input { gap: 0; background: color-mix(in srgb, var(--accent) 5%, var(--bg)); }
    &.s-segmented button {
      flex: 1; min-width: 0; height: var(--chip); padding: 0 calc(4 * var(--space)); border: 0; border-radius: 0; background: none;
      color: var(--chip-text); font: inherit; line-height: 1; display: grid; place-items: center;
      &:hover { background: color-mix(in srgb, var(--accent) 10%, var(--bg)); }
      &.s-selected { background: var(--chip-mark); color: var(--on-chip); }
      &:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 1px; position: relative; z-index: 1; }
      &[style*="--icon"] { color: var(--chip-mark); &.s-selected { color: var(--bg); }
        &::before { content: ''; width: calc(19.5 * var(--length)); height: calc(15.75 * var(--length)); background: currentColor; -webkit-mask: var(--icon) center / contain no-repeat; mask: var(--icon) center / contain no-repeat; } }
    }
    &.s-radio .s-input, &.s-checkboxes .s-input { gap: calc(8 * var(--space)); align-items: flex-start; }
    &.s-radio .s-input label, &.s-checkboxes .s-input label { display: flex; align-items: center; gap: calc(8 * var(--space)); cursor: pointer; line-height: 1; }
    &.s-radio input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; flex: none; display: grid; place-items: center; cursor: pointer;
      width: var(--thumb); height: var(--thumb); border-radius: 50%; border: var(--ring) solid var(--accent-mark); background: var(--bg);
      &::after { content: ''; width: 50%; height: 50%; border-radius: 50%; background: var(--accent-mark); transform: scale(0); transition: transform .12s; }
      &:checked::after { transform: none; }
      &:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 2px; } }
    &.s-checkboxes .s-track { flex: none; display: grid; place-items: center; width: var(--thumb); height: var(--thumb); border-radius: calc(2 * var(--length)); border: var(--ring) solid var(--s-color, var(--accent-mark)); background: var(--bg);
      &::after { content: ''; width: 70%; height: 60%; background: var(--bg); ${mask(check)}; opacity: 0; } }
    &.s-checkboxes label:has(input:checked) .s-track { background: var(--s-color, var(--accent-mark)); &::after { opacity: 1; } }
    &.s-checkboxes label:has(input:focus-visible) .s-track { outline: 2px solid var(--accent-text); outline-offset: 2px; }
  }

  /* ── Boolean: the slider's vocabulary – a hairline and a ring that fills when on ── */
  .s-control.s-boolean {
    flex-direction: row; align-items: center; justify-content: space-between;
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-label-group { flex: 1; justify-content: center; }
    .s-input { flex: none; cursor: pointer; }
    > .s-label-group, > .s-input { min-height: var(--h); }
    &.s-switch .s-track { position: relative; width: calc(var(--thumb) * 2.25); height: var(--thumb);
      background: linear-gradient(var(--track), var(--track)) center / 100% var(--hair) no-repeat;
      &::after { content: ''; position: absolute; left: 0; top: 0; box-sizing: border-box; width: var(--thumb); height: var(--thumb); border-radius: 50%; border: var(--ring) solid var(--accent-mark); background: var(--bg); transition: left .15s, background-color .15s; } }
    &.s-switch:has(input:checked) .s-track { background-image: linear-gradient(var(--accent-mark), var(--accent-mark)); &::after { left: calc(100% - var(--thumb)); background: var(--accent-mark); } }
    &.s-checkbox .s-track { display: grid; place-items: center; width: var(--thumb); height: var(--thumb); border-radius: calc(2 * var(--length)); border: var(--ring) solid var(--accent-mark); background: var(--bg);
      &::after { content: ''; width: 70%; height: 60%; background: var(--bg); ${mask(check)}; opacity: 0; } }
    &.s-checkbox:has(input:checked) .s-track { background: var(--accent-mark); &::after { opacity: 1; } }
    &.s-toggle .s-track { display: grid; place-items: center; min-width: calc(48 * var(--length)); height: var(--h); padding: 0 var(--inset); border-radius: var(--r); background: var(--field); color: var(--ink);
      &::after { content: 'Off'; } }
    &.s-toggle:has(input:checked) .s-track { background: var(--accent); color: var(--on-accent); &::after { content: 'On'; } }
    &:has(input:focus-visible) .s-track { outline: 2px solid var(--accent-text); outline-offset: 2px; }
  }

  /* ── Buttons: grey label buttons; pressed takes the hue ── */
  .s-button {
    .s-input { gap: calc(4 * var(--space)); }
    button { flex: 1; min-height: var(--h); padding: 0 var(--inset); border: 0; border-radius: var(--r); background: var(--field); color: var(--ink); font: inherit; line-height: 1;
      &:not(:disabled):active { background: var(--accent); color: var(--on-accent); }
      &:disabled, &[aria-busy="true"] { color: var(--quiet); cursor: default; }
      &:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 2px; } }
    &.s-secondary button, button.s-secondary { background: none; box-shadow: inset 0 0 0 calc(1.5 * var(--length)) var(--field); }
  }

  /* ── Color ── */
  .s-color {
    input[type="color"] { flex: none; width: var(--h); height: var(--h); padding: 0; border: 0; border-radius: var(--r); background: none; cursor: pointer;
      &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: 0; border-radius: var(--r); } &::-moz-color-swatch { border: 0; border-radius: var(--r); }
      &:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 2px; } }
    &.s-picker .s-color-input { gap: calc(6 * var(--space)); input[type="color"] { position: static; } }
    .s-color-input input[type="text"] { font-variant-numeric: tabular-nums; }
    .s-color-input.s-rgba, &.s-rgba .s-color-input { gap: calc(6 * var(--space)); }
    /* the alpha slider is the slider: its hairline, here the colour's ramp over a one-row checkerboard, under the ring thumb */
    .s-alpha { --body: var(--thumb); height: var(--body); border-radius: 0;
      background: linear-gradient(to right, transparent, var(--c)), repeating-linear-gradient(to right, #c4c4c4 0 var(--hair), #fff 0 calc(2 * var(--hair)));
      background-position: center; background-size: calc(100% - var(--thumb)) var(--hair); background-repeat: no-repeat; }
    &.s-swatches .s-input { gap: calc(8 * var(--space)); flex-wrap: wrap; }
    &.s-swatches button { width: calc(21 * var(--length)); height: calc(21 * var(--length)); padding: 0; border: 0; border-radius: 50%; box-shadow: inset 0 0 0 1px var(--track);
      &.s-selected { outline: var(--ring) solid var(--ink); outline-offset: 2px; }
      &:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 2px; } }
  }

  /* ── Vector ── */
  .s-vector {
    .s-vec-axis { background: var(--field); border-radius: var(--r); padding-left: var(--inset); height: var(--h); &:focus-within { outline: 2px solid var(--accent-text); } }
    .s-vec-label { color: var(--quiet); opacity: 1; font-size: 1em; }
    input[type="number"] { background: none; padding-left: 0; -moz-appearance: textfield; &::-webkit-inner-spin-button { -webkit-appearance: none; } &:focus-visible { outline: none; } }
    .s-vec-expand { background: var(--accent-mark); opacity: 1; }
  }

  /* ── XY pad: the Perform square, a heavy frame and a ring ── */
  .s-pad { width: min(100%, calc(240 * var(--length))); height: auto; aspect-ratio: 1; background: var(--bg); border: calc(4 * var(--length)) solid var(--accent-mark); border-radius: 0;
    .s-pad-x, .s-pad-y { display: none; }
    .s-pad-dot { width: calc(22 * var(--length)); height: calc(22 * var(--length)); background: var(--bg); border: calc(3 * var(--length)) solid var(--accent-mark); box-shadow: none; }
    &:active .s-pad-dot { background: var(--accent-mark); }
    &:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 2px; } }
  .s-pad-val { color: var(--quiet); opacity: 1; font-size: 1em; }

  /* ── Knob: a ring dial with a hue pointer ── */
  .s-control.s-knob { flex-direction: row; align-items: center; .s-label-group { flex: 1; } .s-input { flex: none; } }
  .s-knob-dial { width: var(--h); height: var(--h); background: var(--bg); border: var(--ring) solid var(--track);
    i { top: 6%; width: var(--ring); height: 38%; background: var(--accent-mark); border-radius: 0; } }
  .s-knob-wrap:focus-visible:not(:active) .s-knob-dial { outline: 2px solid var(--accent-text); outline-offset: 2px; }
  .s-knob-val { color: var(--ink); opacity: 1; font-size: 1em; }

  /* ── Info, separator ── */
  .s-info .s-monitor { opacity: 1; color: var(--ink); line-height: var(--line-height); }
  .s-separator { height: auto; background: none; opacity: 1; margin: 0;
    &::after { content: ''; display: block; height: 1px; background: var(--track); } }
  .s-control.s-separator-labeled { flex-direction: row; align-items: center; &::before { display: none; } &::after { flex: 1; opacity: 1; height: 1px; background: var(--track); } }
  .s-separator-label { color: var(--quiet); opacity: 1; font-size: 1em; }

  /* ── Search ── */
  .s-search-input { background: var(--field); border-radius: var(--r); padding: 0 var(--inset); height: calc(var(--h) * .8); font-size: var(--font-size); &::placeholder { color: var(--quiet); } }
}`

  return baseCSS + '\n' + overrides
}
