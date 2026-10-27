/**
 * industrial – the machine is the interface: Teenage Engineering, Braun, Nothing.
 *
 * Reference: "DMX-FIELD", a lighting-desk mockup in the OP-1 field idiom (an image supplied by the owner,
 * test/calibration/industrial-*.png; no live original), read with the OP-1 field itself and Braun's radios.
 * Tones, sizes and type are measured on that image at 2x.
 *
 * Structure exposed: the panel is the chassis (a matte body in a hairline edge, lit from above, standing
 * on a soft shadow); folders are its modules, cut apart by etched seams, side by side on a wide panel of
 * modules; a separator is a seam. Labels are printed on the body as small upper-case words (Courier New
 * here), over their control; nothing sits in a label column.
 *
 * Hardware vocabulary: a slider is a fader (a groove and a white cap with an engraved line); a knob is an
 * encoder, a cap in its own colour (`--accent` on the control) seated in a pale well; a boolean is a black
 * key with an LED; buttons and choices are white keys, a group of buttons round keys (a capsule when the
 * word is long); values sit on the black screen in mono type (text, number, textarea and the dropdown's
 * choice, its step keys beside it), and consecutive info rows are lines on one screen. A group (folder or panel) holding only encoders, faders, keys and seams, with at
 * least two encoders or faders, becomes a bank: a row of encoders at their own pitch with the label under
 * each, then the faders standing upright in equal columns with their keys beneath; values show while a
 * control is touched, in place of its label. In a panel taller than its content, the keys settle at the
 * bottom.
 *
 * Accent = interaction: focus, the primary key, the chosen key, a fader's line in hand, the LED of a key
 * that is on (unless the key brings its own colour). Lettering holds 4.5:1 on what it is printed on.
 *
 * Axes: shade (the body: a light one is anodised silver-white, a dark one black), accent, size, spacing,
 * font (the printed labels), weight.
 *
 * industrial(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { parseColor, toHex, ink, clamp, resolveAccent } from './color.js'

const svg = body => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'>${body}</svg>`)}")`
const mask = img => `-webkit-mask: ${img} center / contain no-repeat; mask: ${img} center / contain no-repeat`
const caret = svg(`<path d='M2.5 4.5 6 8l3.5-3.5' fill='none' stroke='black' stroke-width='1.5'/>`)
const plus = svg(`<path d='M6 2.5v7M2.5 6h7' stroke='black' stroke-width='1.5'/>`)
const minus = svg(`<path d='M2.5 6h7' stroke='black' stroke-width='1.5'/>`)

export default function industrial({
  shade = '#e5e5e7',
  accent = '#e8562e',
  size = 1,
  spacing = 1,
  font,
  weight = 400,
} = {}) {
  const { L, C, H } = parseColor(shade)
  const dark = L < .5
  // Tones are the body's lightness moved by the steps measured on the reference (OKLab L, light body
  // #e5e5e7); a dark body takes larger steps up so its keys and lips still read.
  const at = (light, darkStep = light) => toHex({ L: clamp(L + (dark ? darkStep : light), 0, 1), C: Math.min(C, .02), H })
  const top = at(.009, .02), bottom = at(-.009, -.02)
  const key = at(.033, .09), dish = at(.025, .08), pressed = at(.012, .05)
  const t = {
    edge: at(-.115, -.12), edgeTop: at(-.056, .06), edgeBottom: at(-.13, -.14), lip: at(-.108, -.16), rim: at(.024, .06),
    well: at(-.024, -.05), groove: at(-.055, -.07), grooveEdge: at(-.08, -.1), line: at(-.114, -.14), capEdge: at(-.174, -.17),
    seam: at(-.024, -.06), seamLight: at(.036, .03), engrave: at(-.06, -.08), glint: at(.075, .05),
  }
  const acc = resolveAccent(accent, shade)
  const label = ink(bottom, 4.5, dark ? '#a2a2a4' : '#777777')
  const text = ink(key, 4.5, dark ? '#e0e0e0' : '#404040')
  const accentText = ink(dish, 4.5, ink(key, 4.5, acc))   // a key's face runs from its dish to its rim: on a light body the dish is the darker (4.4:1 at the rim's ink)
  const accentPressed = ink(pressed, 4.5, accentText)   // a pressed key is darker than a raised one on a light body
  const focus = ink(bottom, 3, acc)

  // A bank: a group of encoders, faders, keys and seams, at least two encoders or faders; no slider in it
  // carries labelled marks, ticks, a tooltip or a second thumb (those keep their row).
  const bank = `:is(.s-panel-content, .s-content):has(> :is(.s-knob, .s-slider) ~ :is(.s-knob, .s-slider)):not(:has(> :not(.s-knob, .s-slider, .s-boolean, .s-separator), > .s-multiple, > .s-slider .s-mark, > .s-slider .s-mark-label, > .s-slider .s-tooltip))`

  // Body 10px: the printed labels and the screen's values are Courier New at 10px; 12.5px is the keys' lettering.
  const body = 10
  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body, fontSize: 10, lineHeight: 12, controlHeight: 44, inset: 12, rowGap: 16, columnGap: 14, sectionGap: 23, panelPadding: 23, fontFamily: "'Courier New', Courier, monospace" })}

  /* ── Tones ── */
  --bg: ${shade};
  --top: ${top};
  --bottom: ${bottom};
  --key: ${key};
  --dish: ${dish};
  --pressed: ${pressed};
  --edge: ${t.edge};
  --edge-top: ${t.edgeTop};
  --edge-bottom: ${t.edgeBottom};
  --lip: ${t.lip};
  --rim: ${t.rim};
  --well: ${t.well};
  --groove: ${t.groove};
  --groove-edge: ${t.grooveEdge};
  --line: ${t.line};
  --cap-edge: ${t.capEdge};
  --seam: ${t.seam};
  --seam-light: ${t.seamLight};
  --engrave: ${t.engrave};
  --glint: ${t.glint};
  --label: ${label};
  --text: ${text};
  --accent: ${acc};
  --accent-text: ${accentText};
  --accent-text-pressed: ${accentPressed};
  --focus: ${focus};
  --screen: #0c0c0c;
  --screen-edge: #000;
  --screen-text: #c1c1c1;
  --screen-dim: #8a8a8a;
  --black-key: #1a1a1a;
  --led-off: #333;
  --black-rim: ${dark ? ink(bottom, 3, '#1a1a1a') : 'transparent'};   /* a black key on a black body keeps a 3:1 edge */
  color-scheme: ${dark ? 'dark' : 'light'};

  /* ── Geometry (reference px at size 10 / 13, the 10px body) ── */
  --key-font: system-ui, -apple-system, 'Helvetica Neue', sans-serif;
  --screen-font: 'Courier New', Courier, monospace;
  --key-size: calc(12.5 * var(--length));
  --tracking: ${typeof font === 'string' && font.trim() ? '.08em' : '0'};
  --h: var(--control-height);                    /* keys: 44 */
  --r: calc(5 * var(--length));                  /* key and fader-cap corners */
  --round: var(--h);                             /* a round key */
  --field-h: calc(30 * var(--length));           /* screens and the dropdown: a line of print, lower than a key */
  --key-gap: calc(13.5 * var(--space));
  --tile: max(calc(218 * var(--length)), 4 * var(--round) + 3 * var(--key-gap)); /* a module of rows: the reference's 218, four round keys at least */
  --frame: calc(3.5 * var(--length));            /* the screen's black bezel */
  --led: calc(8 * var(--length));
  --black: calc(33 * var(--length));             /* black key */
  --cap: calc(39 * var(--length));               /* encoder cap */
  --well-size: calc(59 * var(--length));         /* its well */
  --fader-w: calc(33 * var(--length));           /* fader cap, across the travel */
  --fader-l: calc(49 * var(--length));           /* along it */
  --groove-w: calc(15 * var(--length));
  --travel: calc(167 * var(--length));           /* the cap's centre travels this far */
  --bank-gap: calc(11 * var(--space));          /* between a bank's channels */
  --hair: max(1px, var(--length));
  --face: radial-gradient(60% 60% at 42% 45%, var(--dish), var(--key));
  /* a key stands on a 2px lip over a soft contact shadow */
  --raised: 0 calc(2 * var(--length)) 0 var(--lip), 0 calc(2 * var(--length)) calc(6 * var(--length)) rgb(0 0 0 / ${dark ? .35 : .14});
  --weight: ${weight};

  background: linear-gradient(var(--top), var(--bottom));
  color: var(--text);
  border: var(--hair) solid var(--edge);
  border-color: var(--edge-top) var(--edge) var(--edge-bottom);
  border-radius: calc(10.5 * var(--length));
  box-shadow: inset 0 var(--hair) 0 ${dark ? 'rgb(255 255 255 / .08)' : 'rgb(255 255 255 / .6)'}, inset 0 calc(-1 * var(--hair)) 0 rgb(0 0 0 / .09), 0 calc(30 * var(--length)) calc(80 * var(--length)) calc(-12 * var(--length)) rgb(0 0 0 / ${dark ? .5 : .2});
  padding: var(--panel-padding);
  min-width: 0;
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
  font-weight: var(--weight);

  /* ── Printed type: labels, titles ── */
  > summary, > .s-panel-title, .s-folder > summary, .s-label, .s-separator-label {
    font-family: var(--font-family); font-size: var(--font-size); line-height: var(--line-height);
    text-transform: uppercase; letter-spacing: var(--tracking); font-weight: var(--weight);
  }
  .s-label { color: var(--label); }
  .s-hint { color: var(--label); opacity: 1; font-size: var(--font-size); line-height: var(--line-height); }

  /* ── Panel title and module titles: printed darker, the fold a small key ── */
  > summary, > .s-panel-title {
    color: var(--text); gap: var(--column-gap); padding-bottom: calc(12 * var(--space)); margin-bottom: var(--row-gap);
    border-bottom: var(--hair) solid var(--seam); box-shadow: 0 var(--hair) 0 var(--seam-light);
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  }
  .s-fold-icon {
    margin-left: auto; flex: none; display: grid; place-items: center;
    width: calc(22 * var(--length)); height: calc(22 * var(--length)); border-radius: 50%;
    background: var(--key); box-shadow: var(--raised);
    i { width: calc(12 * var(--length)); height: calc(12 * var(--length)); background: var(--text); ${mask(minus)}; }
  }
  &:is(details):not([open]) {
    > summary { padding-bottom: 0; margin-bottom: 0; border-bottom: 0; box-shadow: none; }
    .s-fold-icon i { ${mask(plus)}; }
  }
  .s-folder > summary {
    color: var(--text); gap: var(--column-gap); margin-bottom: calc(12 * var(--space));
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  }
  .s-folder:not(.s-section) > summary::after {
    content: ''; margin-left: auto; flex: none; width: calc(12 * var(--length)); height: calc(12 * var(--length));
    background: var(--label); ${mask(minus)};
  }
  .s-folder:not(.s-section, [open]) > summary { margin-bottom: 0; &::after { ${mask(plus)}; } }
  .s-folder.s-section > summary { pointer-events: none; }

  /* ── Panel content: rows over each other; keys settle at the bottom of a tall panel ── */
  .s-panel-content { flex: 1; gap: var(--row-gap); }
  .s-content { gap: var(--row-gap); }
  :is(.s-panel-content, .s-content) > :not(.s-button, .s-segmented) + :is(.s-button, .s-segmented) { margin-top: auto; }

  /* ── Modules: a folder is a module of the chassis, an etched seam above it ── */
  .s-folder { border-top: var(--hair) solid var(--seam); box-shadow: inset 0 var(--hair) 0 var(--seam-light); padding-top: var(--row-gap); }
  :is(.s-panel-content, .s-content) > .s-folder:first-child { border-top: 0; box-shadow: none; padding-top: 0; }
  /* a panel of modules only sets them side by side where they fit: a module is four round keys wide and a
     bank takes the room the others leave; seams fall in the gutter, those at the edge are clipped away */
  .s-panel-content:not(:has(> :not(.s-folder))) {
    flex-flow: row wrap; align-content: stretch; gap: calc(2 * var(--panel-padding)) calc(2 * var(--panel-padding));
    clip-path: inset(calc(-6 * var(--length)) -100vw -100vw calc(-6 * var(--length)));
    /* a module fills its line's height, so its keys can settle at the bottom */
    > .s-folder[open] { display: flex; flex-direction: column; > summary { width: 100%; } &::details-content { flex: 1; width: 100%; display: flex; flex-direction: column; } > .s-content { flex: 1; } }
    > .s-folder { flex: 1 1 var(--tile); min-width: 0; position: relative; border: 0; box-shadow: none; padding: 0;
      &::before, &::after { content: ''; position: absolute; pointer-events: none; }
      &::before { top: 0; bottom: 0; left: calc(-1 * var(--panel-padding) - var(--hair)); width: var(--hair); background: var(--seam); box-shadow: var(--hair) 0 0 var(--seam-light); }
      &::after { left: 0; right: 0; top: calc(-1 * var(--panel-padding) - var(--hair)); height: var(--hair); background: var(--seam); box-shadow: 0 var(--hair) 0 var(--seam-light); }
    }
    > .s-folder:has(> .s-content > :is(.s-knob, .s-slider) ~ :is(.s-knob, .s-slider)) { flex-grow: 1000; }
  }

  /* ── Rows: the label printed over its control ── */
  .s-control:not(.s-folder) { flex-direction: column; align-items: stretch; gap: calc(6 * var(--space)); position: relative; }
  .s-control:has(> .s-input[inert]) { opacity: .45; }
  .s-label-group { width: auto; min-width: 0; max-width: none; gap: calc(2 * var(--space)); line-height: var(--line-height); }
  .s-label-row { gap: calc(6 * var(--length)); }
  .s-input { gap: var(--key-gap); align-items: center; }
  .s-title {
    display: inline-grid; place-items: center; flex: none;
    width: calc(12 * var(--length)); height: calc(12 * var(--length)); border-radius: 50%;
    border: var(--hair) solid var(--label); color: var(--label); font-size: calc(8 * var(--length)); line-height: 1;
    &:focus-visible { outline: 2px solid var(--focus); }
  }
  .s-title-text {
    top: calc(100% + 4 * var(--length)); padding: calc(6 * var(--length) + var(--frame)) calc(8 * var(--length) + var(--frame));
    background: var(--screen); color: var(--screen-text); box-shadow: inset 0 0 0 var(--frame) var(--screen-edge); border-radius: calc(2 * var(--length));
    font-family: var(--screen-font); text-transform: none; letter-spacing: -.05em; line-height: var(--line-height);
  }

  /* ── Keys: a white cap over a dark lip ── */
  button, .s-boolean.s-toggle .s-track {
    font-family: var(--key-font); font-size: var(--key-size); font-weight: var(--weight); line-height: normal;
    color: var(--text); border: 0; border-radius: var(--r);
    background: var(--face);
    box-shadow: var(--raised);
    transition: transform .06s, box-shadow .06s;
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  }
  button:not(:disabled):active, .s-boolean.s-toggle:active .s-track { transform: translateY(var(--hair)); box-shadow: 0 0 0 var(--lip); }
  button:disabled, button[aria-busy="true"] { color: var(--label); cursor: default; }
  button[aria-busy="true"] { background: repeating-linear-gradient(-45deg, var(--key) 0 calc(6 * var(--length)), var(--pressed) calc(6 * var(--length)) calc(12 * var(--length))); }

  /* single action: a wide key */
  .s-button .s-input { flex-wrap: wrap; gap: calc(12 * var(--space)) var(--key-gap); }
  .s-button button { flex: 1; height: var(--h); padding: 0 var(--inset); }
  /* a group: round keys, a capsule when the word is long */
  .s-button button:not(:only-child) { flex: none; min-width: var(--round); border-radius: calc(var(--round) / 2); padding: 0 calc(8 * var(--length)); }
  .s-button button.s-primary, .s-button:has(.s-secondary) button:not(.s-secondary) { color: var(--accent-text); }

  /* segmented: key tiles sharing the row, the chosen one pressed in */
  .s-segmented .s-input { gap: calc(8.5 * var(--space)); }
  .s-segmented button {
    flex: 1; min-width: 0; height: var(--h); padding: 0 calc(6 * var(--length));
    &.s-selected { background: var(--pressed); color: var(--accent-text-pressed); transform: translateY(var(--hair)); box-shadow: inset 0 var(--hair) calc(2 * var(--length)) rgb(0 0 0 / .12), 0 0 0 var(--lip); }
  }

  /* ── The screen: black glass in a black bezel (drawn inset: border widths would round), mono type ── */
  input[type="text"], input[type="number"], textarea, select, .s-info, .s-pad, .s-vector .s-vec-axis {
    --bezel: inset 0 var(--frame) var(--screen-edge), inset 0 calc(-1 * var(--frame)) var(--screen-edge);
    background: var(--screen); color: var(--screen-text); border: 0; border-radius: calc(2 * var(--length));
    box-shadow: inset var(--frame) 0 var(--screen-edge), inset calc(-1 * var(--frame)) 0 var(--screen-edge), var(--bezel);
    font-family: var(--screen-font); font-size: var(--font-size); letter-spacing: -.05em; line-height: var(--line-height);
  }
  input[type="text"], input[type="number"], textarea {
    padding: 0 calc(var(--inset) + var(--frame)); min-height: var(--field-h); caret-color: var(--accent);
    &::placeholder { color: var(--screen-dim); }
    &::selection { background: var(--accent); color: #000; }
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  }
  .s-text input, .s-number input, .s-color input[type="text"], textarea { flex: 1; }

  /* dropdown: the choice on the screen, a caret lit beside it */
  select {
    appearance: none; -webkit-appearance: none; flex: 1; height: var(--field-h); cursor: pointer; padding: 0 calc(30 * var(--length)) 0 calc(var(--inset) + var(--frame));
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    option { background: var(--screen); color: var(--screen-text); }
  }
  .s-dropdown .s-input { position: relative; }
  .s-dropdown .s-input::after { content: ''; position: absolute; right: calc(12 * var(--length)); top: 50%; width: calc(12 * var(--length)); height: calc(12 * var(--length)); translate: 0 -50%; background: var(--screen-text); ${mask(caret)}; pointer-events: none; }
  textarea { padding: calc(8 * var(--space) + var(--frame)) calc(var(--inset) + var(--frame)); resize: none; field-sizing: content; min-height: calc(3 * var(--line-height) + 22 * var(--space)); max-height: 50vh; }

  /* info: a line on the screen, its label and value both lit; screens in a row merge into one */
  .s-control.s-info {
    flex-direction: row; align-items: baseline; justify-content: space-between; gap: var(--column-gap);
    padding: calc(8 * var(--space) + var(--frame)) calc(11.5 * var(--space) + var(--frame));
    .s-label-group { flex: none; max-width: 60%; }
    .s-label { color: var(--screen-text); font-family: var(--screen-font); letter-spacing: -.05em; }
    .s-hint { color: var(--screen-dim); }
    .s-input { flex: 1; justify-content: flex-end; }
    .s-monitor { flex: 0 1 auto; min-width: 0; opacity: 1; color: var(--screen-text); text-align: right; white-space: pre-wrap; overflow-wrap: anywhere; }   /* a long value wraps on the screen */
    .s-label-group[hidden] + .s-input { justify-content: flex-start; .s-monitor { text-align: left; } }
  }
  .s-info:has(+ .s-info) { --bezel: inset 0 var(--frame) var(--screen-edge); border-bottom-left-radius: 0; border-bottom-right-radius: 0; padding-bottom: calc(4 * var(--space)); }
  .s-info + .s-info { --bezel: inset 0 calc(-1 * var(--frame)) var(--screen-edge); border-top-left-radius: 0; border-top-right-radius: 0; margin-top: calc(-1 * var(--row-gap)); padding-top: calc(4 * var(--space)); }
  .s-info:has(+ .s-info) + .s-info:has(+ .s-info) { --bezel: 0 0 transparent; }

  /* ── Number: the screen and two step keys ── */
  .s-number {
    .s-input { gap: calc(6 * var(--space)); }
    input[type="number"] { text-align: right; font-variant-numeric: tabular-nums; -moz-appearance: textfield;
      &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    /* the step keys: two square keys beside the screen, down then up */
    .s-step { flex-direction: row-reverse; gap: calc(6 * var(--space)); }
    .s-step button { display: flex; align-items: center; justify-content: center; width: var(--field-h); height: var(--field-h); padding: 0; font-size: 0; border-radius: var(--r);
      &::before { content: ''; width: calc(12 * var(--length)); height: calc(12 * var(--length)); background: var(--text); ${mask(caret)}; } }
    .s-step-up::before { rotate: 180deg; }
  }

  /* ── Fader: a groove, a cap with an engraved line; the value is where the cap is ── */
  .s-control.s-slider {
    display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; column-gap: calc(8 * var(--space)); row-gap: calc(6 * var(--space));
    > .s-label-group { grid-area: 1 / 1; }
    > .s-input { display: contents; }
    .s-readout, .s-readout-hi { grid-area: 1 / 3; }
    .s-readout-lo { grid-area: 1 / 2; }
    .s-track, .s-interval-track { grid-area: 2 / 1 / 3 / -1; position: relative; display: block; height: var(--fader-w); }
    .s-track input[type="range"] { position: relative; }
    .s-readout {
      background: none; border: 0; border-radius: 0; box-shadow: none; padding: 0; min-height: 0; height: var(--line-height); width: auto; min-width: 1ch; field-sizing: content;
      font-family: var(--font-family); font-size: var(--font-size); letter-spacing: var(--tracking); color: var(--text); text-align: right; font-variant-numeric: tabular-nums; cursor: ew-resize;
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    }
    .s-track::before, .s-interval-track::before {
      content: ''; position: absolute; top: 50%; left: calc(var(--fader-l) / 2); right: calc(var(--fader-l) / 2);
      height: var(--groove-w); translate: 0 -50%; border-radius: var(--groove-w);
      background: linear-gradient(var(--line), var(--line)) center / calc(100% - var(--groove-w)) var(--hair) no-repeat, var(--groove);
      box-shadow: inset 0 0 calc(3 * var(--length)) var(--groove-edge);
    }
    input[type="range"] {
      -webkit-appearance: none; appearance: none; display: block; width: 100%; height: var(--fader-w); margin: 0; background: none;
      &::-webkit-slider-runnable-track { height: var(--fader-w); background: none; }
      &::-moz-range-track { height: var(--fader-w); background: none; }
    }
    .s-marks, .s-mark-labels { position: absolute; inset: 0 calc(var(--fader-l) / 2); pointer-events: none; }
    .s-mark { position: absolute; top: calc(50% + var(--groove-w) / 2 + 3 * var(--length)); width: var(--hair); height: calc(5 * var(--length)); background: var(--label); translate: -50% 0; &.s-active { background: var(--text); } }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(var(--line-height) + 4 * var(--length)); }
    .s-mark-label { position: absolute; top: calc(100% + 4 * var(--length)); translate: -50% 0; white-space: nowrap; color: var(--label); text-transform: uppercase; letter-spacing: var(--tracking); line-height: 1; &.s-active { color: var(--text); } }
    .s-tooltip {
      bottom: calc(100% + 4 * var(--length)); padding: calc(3 * var(--length)) calc(6 * var(--length)); line-height: 1;
      background: var(--screen); color: var(--screen-text); border: calc(2 * var(--length)) solid var(--screen-edge); border-radius: calc(2 * var(--length));
      font-family: var(--screen-font); letter-spacing: -.05em; font-variant-numeric: tabular-nums;
    }
  }
  /* one fader cap: the slider's, the interval's and the alpha's */
  .s-control.s-slider input[type="range"], .s-color .s-alpha {
    cursor: grab;
    &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--fader-l); height: var(--fader-w); border: 0; border-radius: var(--r); background: var(--fader-cap); box-shadow: var(--fader-shadow); }
    &::-moz-range-thumb { box-sizing: border-box; border: 0; width: var(--fader-l); height: var(--fader-w); border-radius: var(--r); background: var(--fader-cap); box-shadow: var(--fader-shadow); }
    --fader-line: var(--engrave);
    --fader-cap: linear-gradient(90deg, var(--fader-line), var(--fader-line)) calc(50% - var(--hair) / 2) 50% / var(--hair) calc(18 * var(--length)) no-repeat,
      linear-gradient(90deg, var(--glint), var(--glint)) calc(50% + var(--hair) / 2) 50% / var(--hair) calc(18 * var(--length)) no-repeat, var(--key);
    --fader-shadow: 0 calc(1.5 * var(--length)) 0 var(--cap-edge), 0 calc(3 * var(--length)) calc(5 * var(--length)) rgb(0 0 0 / .22);
    &:active { cursor: grabbing; --fader-line: var(--accent); }
    &:focus-visible { outline: none; --fader-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--focus); }
  }
  .s-slider.s-multiple .s-interval-track {
    height: var(--fader-w);
    &::after { content: ''; position: absolute; z-index: 0; top: 50%; height: calc(3 * var(--length)); translate: 0 -50%; border-radius: calc(9 * var(--length)); background: var(--accent);
      left: calc(var(--fader-l) / 2 + (100% - var(--fader-l)) * var(--low, 0%) / 100%); width: calc((100% - var(--fader-l)) * (var(--high, 100%) - var(--low, 0%)) / 100%); }
    input[type="range"] { width: 100%; z-index: 1; &.s-top { z-index: 2; } &:focus-visible { z-index: 3; } }
  }

  /* ── Boolean: a black key with an LED; the label printed beside it ── */
  .s-control.s-boolean {
    flex-direction: row-reverse; justify-content: flex-end; align-items: center; gap: calc(10 * var(--space));
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { flex: none; cursor: pointer; }
    .s-track {
      position: relative; display: grid; place-items: center; flex: none; width: var(--black); height: var(--black); border-radius: 50%;
      background: var(--black-key); box-shadow: 0 0 0 var(--hair) var(--black-rim), 0 var(--hair) 0 #000, 0 calc(2 * var(--length)) calc(3 * var(--length)) rgb(0 0 0 / .25);
      /* the LED: a soft dot, lit with a halo */
      &::after { content: ''; width: var(--led); height: var(--led); border-radius: 50%; background: radial-gradient(circle closest-side, var(--led-off) 55%, transparent); transition: box-shadow .1s; }
    }
    &:has(input:checked) .s-track::after { background: radial-gradient(circle closest-side, var(--accent) 75%, transparent); box-shadow: 0 0 calc(5 * var(--length)) calc(1 * var(--length)) color-mix(in srgb, var(--accent) 30%, transparent); }
    &:active .s-track { transform: translateY(var(--hair)); box-shadow: 0 0 0 #000; }
    &.s-toggle:has(input:checked) .s-track, &.s-toggle:active .s-track { background: var(--pressed); transform: translateY(var(--hair)); box-shadow: inset 0 var(--hair) calc(2 * var(--length)) rgb(0 0 0 / .12); }
    &:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }
    /* checkbox: a small square key; toggle: a key that reads OFF / ON */
    &.s-checkbox .s-track { width: calc(22 * var(--length)); height: calc(22 * var(--length)); border-radius: calc(4 * var(--length)); background: var(--face); box-shadow: var(--raised);
      &::after { width: calc(6 * var(--length)); height: calc(6 * var(--length)); background: var(--groove); } }
    &.s-toggle .s-track { width: auto; min-width: calc(64 * var(--length)); height: var(--h); border-radius: var(--r); padding: 0 var(--inset) 0 calc(var(--inset) + 12 * var(--length)); background: var(--face); box-shadow: var(--raised);
      &::before { content: 'OFF'; } &::after { position: absolute; left: var(--inset); top: 50%; translate: 0 -50%; width: calc(6 * var(--length)); height: calc(6 * var(--length)); background: var(--groove); } }
    &.s-toggle:has(input:checked) .s-track::before { content: 'ON'; }
  }

  /* ── Radio and checkbox lists: small keys with an LED, their words beside ── */
  .s-select:is(.s-radio, .s-checkboxes) {
    .s-input { gap: calc(10 * var(--space)); align-items: flex-start; }
    .s-input label { display: flex; align-items: center; gap: calc(10 * var(--space)); cursor: pointer; font-family: var(--key-font); font-size: var(--key-size); color: var(--text); line-height: 1; }
    input[type="radio"], .s-track {
      appearance: none; -webkit-appearance: none; margin: 0; flex: none; display: grid; place-items: center; cursor: pointer;
      width: calc(22 * var(--length)); height: calc(22 * var(--length)); border-radius: 50%;
      background: var(--face); box-shadow: var(--raised);
      &::after { content: ''; width: calc(6 * var(--length)); height: calc(6 * var(--length)); border-radius: 50%; background: var(--groove); }
    }
    .s-track { border-radius: calc(4 * var(--length)); }
    input[type="radio"]:checked::after, label:has(input:checked) .s-track::after { background: var(--s-color, var(--accent)); box-shadow: 0 0 calc(3 * var(--length)) color-mix(in srgb, var(--s-color, var(--accent)) 60%, transparent); }
    input[type="radio"]:focus-visible, label:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }
  }

  /* ── Encoder: a coloured cap in a pale well; the cap turns, its light and shadow do not ── */
  .s-control.s-knob { .s-input { gap: calc(10 * var(--space)); } }
  .s-knob-wrap { position: relative; display: grid; place-items: center; width: var(--well-size); height: var(--well-size); border-radius: 50%; gap: 0;
    &::before { content: ''; position: absolute; inset: 0; border-radius: 50%;
      background: radial-gradient(circle calc(var(--cap) / 2 + 5 * var(--length)) at 50% calc(50% + 6 * var(--length)), rgb(0 0 0 / ${dark ? .5 : .32}) calc(var(--cap) / 2 - 4 * var(--length)), transparent), var(--well);
      box-shadow: inset 0 calc(2 * var(--length)) calc(3 * var(--length)) rgb(0 0 0 / ${dark ? .3 : .07}), 0 var(--hair) 0 var(--rim); }
    /* the cap's dished top, lit from above */
    &::after { content: ''; position: absolute; width: var(--cap); height: var(--cap); border-radius: 50%; pointer-events: none; z-index: 2;
      background: linear-gradient(rgb(255 255 255 / .1), transparent 40%, rgb(0 0 0 / .14));
      -webkit-mask: radial-gradient(circle closest-side, #000 68%, transparent 70%); mask: radial-gradient(circle closest-side, #000 68%, transparent 70%); }
    &:focus-visible:not(:active)::before { outline: 2px solid var(--focus); outline-offset: 2px; }
    &:focus-visible:not(:active) .s-knob-dial { outline: none; }
  }
  /* the cap itself turns (its lighting lies on the well and the dish over it, which stay) */
  .s-knob-dial {
    z-index: 1; width: var(--cap); height: var(--cap); border: 0; rotate: var(--turn, 0deg);
    background: radial-gradient(circle closest-side, transparent 68%, rgb(0 0 0 / .12) 72% 94%, rgb(0 0 0 / .06)), var(--accent);
    i { top: 9%; width: calc(2 * var(--length)); height: 20%; rotate: none; border-radius: var(--hair); background: rgb(0 0 0 / .3); box-shadow: var(--hair) 0 0 rgb(255 255 255 / .18); }
  }
  .s-knob-val { position: absolute; left: calc(100% + 10 * var(--space)); top: 50%; translate: 0 -50%; z-index: 3; white-space: nowrap;
    font-size: var(--font-size); letter-spacing: var(--tracking); color: var(--text); opacity: 1; font-variant-numeric: tabular-nums; pointer-events: none; }

  /* ── Bank: a row of encoders at their own pitch, a seam, then faders and their keys sharing the width
     in equal columns; ::before and ::after break the lines between the kinds ── */
  ${bank} {
    display: flex; flex-flow: row wrap; align-content: flex-start; gap: 0 var(--bank-gap);
    &::before, &::after { content: ''; flex: 0 0 100%; height: 0; }
    &::before { order: 2; } &::after { order: 5; }
    > .s-control { flex-direction: column; align-items: center; min-width: 0; }
    > .s-knob { order: 1; flex: none; width: var(--well-size); margin-right: var(--bank-gap); flex-direction: column-reverse; gap: calc(12 * var(--space));
      .s-label-group { align-items: center; text-align: center; }
      .s-knob-val { left: 0; right: 0; top: auto; bottom: calc(-1 * var(--line-height) - 12 * var(--space)); translate: none; text-align: center; opacity: 0; }
      &:has(.s-knob-wrap:is(:hover, :focus-visible, :active)) { .s-label { opacity: 0; } .s-knob-val { opacity: 1; } }
    }
    > .s-separator { order: 3; flex: 0 0 100%; align-items: stretch; margin: var(--panel-padding) 0; }
    > .s-slider { order: 4; flex: 1 1 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: calc(4 * var(--space));
      .s-label-group { align-items: center; text-align: center; }
      .s-track { flex: none; height: calc(var(--travel) + var(--fader-l)); width: var(--fader-w); }
      .s-track::before { top: calc(var(--fader-l) / 2 - var(--groove-w) / 2); bottom: calc(var(--fader-l) / 2 - var(--groove-w) / 2); left: 50%; right: auto; width: var(--groove-w); height: auto; translate: -50% 0;
        background: linear-gradient(var(--line), var(--line)) center / var(--hair) calc(100% - var(--groove-w)) no-repeat, var(--groove); }
      input[type="range"] { writing-mode: vertical-lr; direction: rtl; width: var(--fader-w); height: 100%;
        &::-webkit-slider-runnable-track { width: var(--fader-w); height: 100%; }
        &::-webkit-slider-thumb { width: var(--fader-w); height: var(--fader-l); }
        &::-moz-range-thumb { width: var(--fader-w); height: var(--fader-l); }
        --fader-cap: linear-gradient(var(--fader-line), var(--fader-line)) 50% calc(50% - var(--hair) / 2) / calc(18 * var(--length)) var(--hair) no-repeat,
          linear-gradient(var(--glint), var(--glint)) 50% calc(50% + var(--hair) / 2) / calc(18 * var(--length)) var(--hair) no-repeat, var(--key);
        --fader-shadow: 0 calc(1.5 * var(--length)) 0 var(--cap-edge), 0 calc(3 * var(--length)) calc(5 * var(--length)) rgb(0 0 0 / .22);
        &:focus-visible { --fader-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--focus); }
      }
      .s-readout { position: absolute; top: 0; left: 0; right: 0; width: auto; text-align: center; opacity: 0; }
      &:is(:hover, :focus-within) { .s-label { opacity: 0; } .s-readout { opacity: 1; } }
    }
    > .s-boolean { order: 6; flex: 1 1 0; flex-direction: column-reverse; justify-content: flex-start; }
  }

  /* ── Color: a cap in the colour and its code on the screen ── */
  .s-color {
    input[type="color"] { flex: none; width: var(--field-h); height: var(--field-h); padding: 0; border: 0; border-radius: 50%; background: none; cursor: pointer;
      box-shadow: var(--raised);
      &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: 0; border-radius: 50%; } &::-moz-color-swatch { border: 0; border-radius: 50%; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; } }
    &.s-picker .s-color-input { gap: var(--key-gap); input[type="color"] { position: static; } }
    .s-color-input input[type="text"] { font-variant-numeric: tabular-nums; }
    .s-color-input.s-rgba, &.s-rgba .s-color-input { gap: calc(10 * var(--space)); }
    /* the alpha slider is a fader on its own line under the cap and its code: its groove, here the checkerboard and the
       colour's ramp, the cap travelling its length */
    &.s-rgba .s-color-input { flex-wrap: wrap; }
    .s-alpha { order: 1; flex: 0 0 calc(100% - var(--fader-l)); height: var(--groove-w); border-radius: var(--groove-w); margin: calc((var(--fader-w) - var(--groove-w)) / 2) calc(var(--fader-l) / 2); box-shadow: inset 0 0 calc(3 * var(--length)) var(--groove-edge);
      &::-webkit-slider-runnable-track { height: var(--groove-w); margin-inline: calc(var(--fader-l) / -2); background: none; }
      &::-webkit-slider-thumb { margin-top: calc((var(--groove-w) - var(--fader-w)) / 2); } }
    &.s-swatches .s-input { gap: calc(10 * var(--space)); }
    &.s-swatches button { width: calc(24 * var(--length)); height: calc(24 * var(--length)); padding: 0; border-radius: 50%; min-width: 0; flex: none;
      box-shadow: var(--raised);
      &.s-selected { outline: 2px solid var(--text); outline-offset: 2px; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; } }
  }

  /* ── Vector: one screen per axis; XY pad: a square screen with a lit dot ── */
  .s-vector {
    .s-vec-axis { padding-left: calc(8 * var(--length) + var(--frame)); height: var(--field-h); &:focus-within { outline: 2px solid var(--focus); outline-offset: 2px; } }
    .s-vec-label { color: var(--screen-dim); opacity: 1; font-size: var(--font-size); }
    input[type="number"] { background: none; border: 0; box-shadow: none; min-height: 0; padding: 0 calc(8 * var(--length) + var(--frame)) 0 0; -moz-appearance: textfield;
      &::-webkit-inner-spin-button { -webkit-appearance: none; } &:focus-visible { outline: none; } }
    .s-vec-expand { background: var(--label); opacity: 1; }
  }
  /* a small square screen, the size of a well cluster: a vector's open pad no wider than a row's pad */
  .s-pad { width: min(100%, calc(120 * var(--length))); max-width: calc(120 * var(--length)); height: auto; aspect-ratio: 1;
    background: linear-gradient(rgb(255 255 255 / .06) 1px, transparent 1px) 0 0 / 12.5% 12.5%, linear-gradient(90deg, rgb(255 255 255 / .06) 1px, transparent 1px) 0 0 / 12.5% 12.5%, var(--screen);
    .s-pad-x, .s-pad-y { background: rgb(255 255 255 / .18); }
    .s-pad-x { left: var(--frame); right: var(--frame); } .s-pad-y { top: var(--frame); bottom: var(--frame); }
    .s-pad-dot { width: calc(10 * var(--length)); height: calc(10 * var(--length)); background: var(--accent); box-shadow: 0 0 calc(6 * var(--length)) var(--accent); }
    &:focus-visible:not(:active) { outline: 2px solid var(--focus); outline-offset: 2px; }
  }
  .s-pad-val { color: var(--label); opacity: 1; font-size: var(--font-size); }

  /* ── Separator: an etched seam ── */
  .s-separator { height: auto; background: none; opacity: 1; margin: 0;
    &::after { content: ''; display: block; height: var(--hair); background: var(--seam); box-shadow: 0 var(--hair) 0 var(--seam-light); } }
  .s-control.s-separator-labeled { flex-direction: row; align-items: center; gap: var(--column-gap);
    &::before { display: none; } &::after { flex: 1; opacity: 1; } }
  .s-separator-label { color: var(--label); opacity: 1; }

  /* ── Search ── */
  .s-search-input { background: var(--screen); color: var(--screen-text); border-radius: calc(2 * var(--length)); padding: 0 var(--inset); height: calc(24 * var(--length)); font-family: var(--screen-font); &::placeholder { color: var(--screen-dim); } }
}`

  return baseCSS + '\n' + overrides
}
