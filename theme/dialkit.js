/**
 * dialkit — calibrated to DialKit 2.0.2's popover panel (Josh Puckett, https://github.com/joshpuckett/dialkit),
 * dark and light, rendered from the package's own vanilla build (demo/_ref/dialkit-ref.html).
 *
 * Signatures: every control is a 36px row of one ink at 5% on the panel, 6px apart; a slider's
 * fill is its row, the label riding on it and the value in Geist Mono at the row's end, its handle
 * shown only under the pointer; a boolean is an Off / On pair with a pill behind the chosen word;
 * groups are 13px semibold titles between hairlines, with a chevron; the panel is a 14px-rounded
 * sheet with a 15px title and a close cross.
 *
 * Every tone is native's: white (dark) or black (light) at native's alphas over the shade, so a
 * custom shade keeps the same ladder. Text native never drew (a placeholder, at its 40% tertiary)
 * is lifted to read 4.5:1 on its row.
 *
 * Axes: shade (the panel; dark or light by its lightness), spacing, size, font.
 *
 * dialkit(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveRoles, ink, mix } from './color.js'

export default function dialkit({
  shade = '#212121',
  spacing = 1,
  size = 1,
  font,
} = {}) {
  const { dark } = resolveRoles(shade)
  const tone = dark ? '255, 255, 255' : '0, 0, 0'
  const a = alpha => `rgba(${tone}, ${alpha})`
  // native's ladders (styles.css :root and [data-theme="light"])
  const [surface, hover, active, subtle] = dark ? [.05, .1, .11, .06] : [.04, .08, .1, .06]
  const [label, primary, secondary, tertiary] = dark ? [.7, .95, .6, .4] : [.6, .9, .55, .35]
  const [border, borderHover] = [.1, .15]
  const row = mix(shade, dark ? '#ffffff' : '#000000', surface)
  const placeholder = ink(row, 4.5, mix(row, dark ? '#ffffff' : '#000000', tertiary))

  const svg = path => `url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='${path}'/%3E%3C/svg%3E")`
  const chevron = svg('M6 9.5L12 15.5L18 9.5')
  const cross = svg('M6 6L18 18M18 6L6 18')
  const check = svg('M5 12.5L10 17.5L19 7.5')
  // the pad's grid: a 1px line at each sixth, native's border at 65%
  const line = `color-mix(in srgb, var(--border) 65%, transparent)`
  const grid = [1, 2, 3, 4, 5].map(k => `transparent 0 calc(${+(k * 100 / 6).toFixed(4)}% - .5px), ${line} 0 calc(${+(k * 100 / 6).toFixed(4)}% + .5px)`).join(', ') + ', transparent 0'

  // Body 13px: DialKit sets its labels and values at 13px.
  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body: 13, fontSize: 13, fontFamily: "system-ui, -apple-system, 'SF Pro Display', sans-serif", lineHeight: 16, controlHeight: 36, inset: 12, rowGap: 6, columnGap: 12, sectionGap: 12, panelPadding: 12 })}

  --bg: ${shade};
  --accent: ${a(primary)};
  --surface: ${a(surface)};
  --surface-hover: ${a(hover)};
  --surface-active: ${a(active)};
  --subtle: ${a(subtle)};
  --label: ${a(label)};
  --primary: ${a(primary)};
  --secondary: ${a(secondary)};
  --root: ${dark ? '#ffffff' : '#000000'};
  --border: ${a(border)};
  --border-hover: ${a(borderHover)};
  --focus: ${a(dark ? .6 : .55)};
  --mono: 'Geist Mono', monospace;
  --h: var(--control-height);
  --r: calc(8 * var(--length));
  --px: calc(1 * var(--length));
  color-scheme: ${dark ? 'dark' : 'light'};

  width: min(100%, calc(280 * var(--length)));
  min-width: 0;
  background: var(--bg);
  border: var(--px) solid var(--border);
  border-radius: calc(14 * var(--length));
  box-shadow: ${dark ? '0 8px 32px rgba(0, 0, 0, .5)' : '0 4px 20px rgba(0, 0, 0, .08)'};
  padding: 0 var(--panel-padding) calc(10 * var(--space));
  color: var(--label);
  font-family: var(--font-family);
  font-size: var(--font-size);
  font-weight: 500;
  line-height: var(--line-height);
  -webkit-font-smoothing: antialiased;

  /* ── Header: the title, the close cross, a hairline ── */
  > summary, > .s-panel-title {
    position: relative;
    padding: calc(10 * var(--space)) 0 calc(14 * var(--space));
    margin-bottom: calc(12 * var(--space));
    border-bottom: var(--px) solid var(--subtle);
    font-size: calc(15 * var(--length)); font-weight: 600; line-height: calc(18 * var(--length)); letter-spacing: -.01em;
    color: var(--root);
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: calc(5 * var(--length)); }
  }
  .s-fold-icon { margin-left: auto; flex: none; width: calc(16 * var(--length)); height: calc(16 * var(--length)); translate: 0 var(--px);
    background: var(--label); opacity: .6; -webkit-mask: ${cross} center / contain no-repeat; mask: ${cross} center / contain no-repeat; transition: rotate .2s; }
  &:not([open]) > summary { margin-bottom: 0; border-bottom-color: transparent; padding-bottom: calc(10 * var(--space)); }
  &:not([open]) .s-fold-icon { rotate: 45deg; }
  .s-search { margin-left: auto; }
  .s-search + .s-fold-icon { margin-left: calc(8 * var(--space)); }
  .s-search-btn { background: var(--label); opacity: .6; }
  .s-search-input { color: var(--primary); font-size: var(--font-size); &::placeholder { color: ${placeholder}; } }
  .s-panel-content { gap: var(--row-gap); }

  /* ── Rows ── */
  .s-control { align-items: center; gap: var(--column-gap); min-height: var(--h); padding: 0 var(--inset); border-radius: var(--r); background: var(--surface); }
  .s-control:has(> .s-input[inert]) { opacity: .5; }
  .s-label-group { width: auto; min-width: 0; max-width: 60%; flex: 0 1 auto; gap: 0; }
  .s-label { color: var(--label); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :is(.s-color, .s-select.s-dropdown) .s-label { display: block; translate: 0 calc(-.5 * var(--px)); } /* native lifts these labels half a pixel */
  .s-hint { display: none; } /* a DialKit row is one line: a hint reads from the label's title tooltip */
  .s-title { color: var(--label); border-color: var(--label); }
  .s-title-text { background: var(--bg); color: var(--primary); border: var(--px) solid var(--border); border-radius: calc(6 * var(--length)); }
  .s-input { justify-content: flex-end; align-items: center; gap: calc(8 * var(--space)); color: var(--label); }
  input, select, textarea, button { font: inherit; color: inherit; }
  input[type="text"], input[type="number"], select, textarea { background: transparent; border: none; padding: 0; text-align: right; outline: none; }
  input[type="text"], input[type="number"], select { height: var(--h); }
  ::placeholder { color: ${placeholder}; }
  :is(input[type="text"], input[type="number"], textarea):focus { color: var(--root); }
  :is(input[type="text"], input[type="number"], textarea):focus-visible { box-shadow: inset 0 calc(-1 * var(--px)) var(--focus); }

  /* ── Slider: the row is the slider; its fill the value, the value in mono at its end ── */
  .s-slider {
    position: relative; display: grid; padding: 0; gap: 0;
    > .s-label-group, > .s-input { grid-area: 1 / 1; }
    > .s-label-group { z-index: 2; pointer-events: none; padding-left: calc(10 * var(--space)); max-width: 62%; translate: 0 calc(-.5 * var(--px)); }
    > .s-input { position: relative; gap: 0; }
    .s-track { flex: 1; position: relative; display: flex; height: var(--h); }
    input[type="range"] {
      -webkit-appearance: none; appearance: none; width: 100%; height: 100%; margin: 0; cursor: pointer; border-radius: var(--r); overflow: hidden;
      background: linear-gradient(to right, var(--fill, var(--surface-active)) 0 var(--p, 0%), transparent 0);
      &::-webkit-slider-runnable-track { height: 100%; }
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(3 * var(--length)); height: calc(20 * var(--length)); margin-top: calc((var(--h) - 20 * var(--length)) / 2); border: none; border-radius: 999px; background: var(--primary); opacity: 0; transition: opacity .15s; }
      &::-moz-range-thumb { width: calc(3 * var(--length)); height: calc(20 * var(--length)); border: none; border-radius: 999px; background: var(--primary); opacity: 0; transition: opacity .15s; }
      &::-moz-range-track { background: none; }
      &:hover::-webkit-slider-thumb, &:focus-visible::-webkit-slider-thumb { opacity: 1; }
      &:hover::-moz-range-thumb, &:focus-visible::-moz-range-thumb { opacity: 1; }
      &:active { --fill: var(--border-hover); }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
    }
    /* hashmarks: shown while dragging, unlabelled */
    .s-marks { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-labels { display: none; }
    .s-mark { position: absolute; top: 50%; width: var(--px); height: calc(8 * var(--length)); border-radius: 999px; translate: -50% -50%; background: transparent; transition: background .2s; }
    &:has(input:active) .s-mark { background: var(--border-hover); }
    .s-readout { position: absolute; right: var(--inset); top: 50%; translate: 0 -50%; z-index: 3; width: auto; min-width: 0; max-width: 7ch; height: auto;
      font-family: var(--mono); color: var(--label); field-sizing: content; cursor: text; }
    &:has(input:active) .s-readout { color: var(--root); }
    .s-tooltip { position: absolute; bottom: 100%; margin-bottom: calc(6 * var(--space)); padding: calc(2 * var(--space)) calc(6 * var(--space)); border-radius: calc(6 * var(--length)); background: var(--root); color: var(--bg); font-family: var(--mono); white-space: nowrap; z-index: 4; }
    /* an interval keeps its label and two values in line, the span between its thumbs filled */
    &.s-multiple { display: flex; padding: 0 var(--inset); gap: var(--column-gap);
      > .s-label-group { padding: 0; translate: none; }
      > .s-input { gap: calc(8 * var(--space)); }
      .s-readout { position: static; translate: none; }
      .s-interval-track { flex: 1; align-self: stretch; position: relative; margin: 0;
        &::before { content: ''; position: absolute; top: calc(14 * var(--length)); bottom: calc(14 * var(--length)); left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); border-radius: 999px; background: var(--border-hover); }
        input[type="range"] { position: absolute; inset: 0; background: none; overflow: visible;
          &::-webkit-slider-thumb { opacity: 1; }
          &::-moz-range-thumb { opacity: 1; } } }
    }
  }

  /* ── Boolean: Off / On, a pill behind the chosen word ── */
  .s-boolean {
    padding-right: calc(10 * var(--space));
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { flex: 0 0 auto; margin-left: auto; cursor: pointer; }
    &:is(.s-switch, .s-segmented, .s-toggle) .s-track { display: flex; padding: 2px; margin-right: calc(-6 * var(--space)); border-radius: var(--r);
      &::before, &::after { padding: calc(6 * var(--space)) calc(8 * var(--space)); line-height: calc(16 * var(--length)); border-radius: calc(6 * var(--length)); color: var(--label); transition: color .15s, background .15s; }
      &::before { content: 'Off'; color: var(--primary); background: var(--surface-active); }
      &::after { content: 'On'; } }
    &:has(input:checked) .s-track { &::before { color: var(--label); background: none; } &::after { color: var(--primary); background: var(--surface-active); } }
    &.s-checkbox .s-track { display: grid; place-items: center; width: calc(20 * var(--length)); height: calc(20 * var(--length)); border-radius: calc(5 * var(--length)); background: var(--surface-active);
      &::after { content: ''; width: 75%; height: 75%; background: var(--primary); opacity: 0; -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; } }
    &.s-checkbox:has(input:checked) .s-track::after { opacity: 1; }
    &:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 0; }
  }

  /* ── Select: the value and a chevron ── */
  .s-select {
    &.s-dropdown .s-input { position: relative; padding-right: calc(28 * var(--length));
      &::after { content: ''; position: absolute; right: calc(2 * var(--length)); top: 50%; translate: 0 -50%; width: calc(16 * var(--length)); height: calc(16 * var(--length)); background: var(--label); opacity: .6; pointer-events: none;
        -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; } }
    &.s-dropdown select { flex: 1 1 auto; width: auto; min-width: 0; text-align-last: right; appearance: none; -webkit-appearance: none; cursor: pointer; max-width: 100%; text-overflow: ellipsis; translate: 0 calc(-.5 * var(--px));
      option { background: var(--bg); color: var(--primary); } }
    &.s-dropdown:hover { background: var(--surface-hover); }
    &.s-segmented { padding-right: calc(10 * var(--space)); }
    &.s-segmented .s-input { flex: 0 1 auto; gap: 0; padding: 2px; margin-right: calc(-6 * var(--space)); }
    &.s-segmented button { padding: calc(6 * var(--space)) calc(8 * var(--space)); line-height: calc(16 * var(--length)); border: none; border-radius: calc(6 * var(--length)); background: none; color: var(--label); cursor: pointer; transition: color .15s, background .15s;
      &.s-selected { color: var(--primary); background: var(--surface-active); }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; } }
    &:is(.s-radio, .s-checkboxes) { align-items: flex-start; padding-block: calc(9 * var(--space)); }
    &:is(.s-radio, .s-checkboxes) .s-input { flex-direction: column; align-items: flex-end; gap: calc(6 * var(--space)); }
    &:is(.s-radio, .s-checkboxes) .s-input label { display: flex; align-items: center; gap: calc(8 * var(--space)); cursor: pointer; color: var(--label); }
    &.s-radio input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; width: calc(14 * var(--length)); height: calc(14 * var(--length)); border-radius: 50%; background: var(--surface-active); display: grid; place-items: center; cursor: pointer;
      &::after { content: ''; width: 50%; height: 50%; border-radius: 50%; background: var(--primary); opacity: 0; }
      &:checked::after { opacity: 1; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; } }
    &.s-checkboxes .s-track { width: calc(14 * var(--length)); height: calc(14 * var(--length)); border-radius: calc(4 * var(--length)); background: var(--surface-active); display: grid; place-items: center;
      &::after { content: ''; width: 80%; height: 80%; background: var(--primary); opacity: 0; -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; } }
    &.s-checkboxes label:has(input:checked) .s-track::after { opacity: 1; }
    &.s-checkboxes label:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }
  }

  /* ── Color: the code in mono, then a 20px rounded swatch ── */
  .s-color {
    .s-color-input { flex: 1; min-width: 0; display: flex; justify-content: flex-end; align-items: center; gap: calc(8 * var(--space)); }
    input[type="color"] { order: 1; position: static; flex: none; width: calc(20 * var(--length)); height: calc(20 * var(--length)); padding: 0; border: var(--px) solid var(--border-hover); border-radius: calc(5 * var(--length)); box-shadow: inset 0 0 0 var(--px) rgb(255 255 255 / 8%); background: var(--color); cursor: pointer; overflow: hidden;
      &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 0; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; } }
    input[type="text"] { flex: 1; min-width: 0; font-family: var(--mono); }
    .s-alpha { order: 0; flex: 1; min-width: calc(40 * var(--length)); height: calc(20 * var(--length)); -webkit-appearance: none; appearance: none; border-radius: calc(5 * var(--length)); cursor: pointer;
      background: linear-gradient(to right, transparent, var(--c)), repeating-conic-gradient(#aaa 0% 25%, #eee 0% 50%) 0 0 / 8px 8px;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(3 * var(--length)); height: calc(20 * var(--length)); border: none; border-radius: 999px; background: var(--primary); box-shadow: 0 0 0 var(--px) var(--bg); }
      &::-moz-range-thumb { width: calc(3 * var(--length)); height: calc(20 * var(--length)); border: none; border-radius: 999px; background: var(--primary); }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; } }
    &.s-rgba input[type="text"] { flex: 0 1 auto; width: 9ch; }
    &.s-swatches .s-input { flex-wrap: wrap; gap: calc(6 * var(--space)); padding-block: calc(8 * var(--space)); }
    &.s-swatches button { width: calc(20 * var(--length)); height: calc(20 * var(--length)); padding: 0; border: var(--px) solid var(--border-hover); border-radius: calc(5 * var(--length)); cursor: pointer;
      &.s-selected { outline: 2px solid var(--primary); outline-offset: 2px; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; } }
  }

  /* ── Number, text, textarea, info ── */
  .s-number input[type="number"], .s-info .s-monitor { font-family: var(--mono); }
  .s-number input[type="number"] { flex: 1; min-width: 0; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
  .s-number .s-step button { width: calc(16 * var(--length)); padding: 0; border: none; background: none; color: var(--label); opacity: .6; font-size: .6em; cursor: pointer; &:hover { opacity: 1; } }
  .s-text input[type="text"] { flex: 1; min-width: 0; }
  .s-textarea { align-items: flex-start; padding-block: calc(9 * var(--space));
    textarea { flex: 1; min-width: 0; resize: none; field-sizing: content; min-height: calc(18 * var(--length)); max-height: 40vh; line-height: calc(18 * var(--length)); }
    &.s-code textarea { font-family: var(--mono); text-align: left; } }
  .s-info .s-monitor { flex: 1; text-align: right; color: var(--label); opacity: 1; }

  /* ── Pad: a caption and one field per axis in three equal cells, the square surface below ── */
  .s-vector { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--row-gap); padding: 0; background: none;
    > .s-label-group, .s-vec-axis { height: var(--h); padding: 0 var(--inset); border-radius: var(--r); background: var(--surface); display: flex; flex-direction: row; align-items: center; max-width: none; }
    > .s-input { display: contents; }
    .s-vec-axis { gap: calc(4 * var(--space)); padding-left: calc(10 * var(--space)); &:focus-within { background: var(--surface-hover); } }
    .s-vec-label { flex: none; font-size: var(--font-size); color: var(--label); opacity: 1; }
    input[type="number"] { flex: 1; width: 0; min-width: 0; height: auto; font-family: var(--mono); padding-bottom: var(--px); -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-vec-expand { display: none; }
    .s-pad { grid-column: 1 / -1; }
  }
  .s-xy { align-items: flex-start; padding-block: calc(9 * var(--space)); }
  .s-pad { width: 100%; height: auto; aspect-ratio: 1; border: none; border-radius: var(--r); background: var(--surface); cursor: crosshair;
    /* five lines a side, one every sixth of the surface */
    background-image: linear-gradient(to right, ${grid}), linear-gradient(to bottom, ${grid});
    .s-pad-x, .s-pad-y { display: none; }
    &::before { content: ''; position: absolute; left: 50%; top: 50%; width: calc(3 * var(--length)); height: calc(3 * var(--length)); border-radius: 50%; translate: -50% -50%; background: ${a(tertiary)}; }
    .s-pad-dot { width: calc(12 * var(--length)); height: calc(12 * var(--length)); background: var(--primary); box-shadow: 0 2px 4px #0003; }
    &:active .s-pad-dot { box-shadow: 0 0 0 6px var(--border-hover), 0 2px 6px #0003; }
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  }
  .s-pad-val { font-family: var(--mono); color: var(--label); opacity: 1; }
  .s-knob-dial { background: var(--surface-active); border: none; i { background: var(--primary); } }
  .s-knob-val { font-family: var(--mono); color: var(--label); opacity: 1; }

  /* ── Buttons: a row each, the label centred ── */
  .s-button { padding: 0; background: none; }
  .s-button .s-input { gap: var(--row-gap); }
  .s-button button { flex: 1; min-width: 0; height: var(--h); padding: 0 calc(16 * var(--space)); border: none; border-radius: var(--r); background: var(--surface); color: var(--secondary); cursor: pointer; transition: background .15s, color .15s;
    &:hover { background: var(--surface-hover); color: var(--primary); }
    &:active { background: var(--surface-active); }
    &:disabled, &[aria-busy="true"] { opacity: .5; cursor: not-allowed; }
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; } }

  /* ── Folder: a semibold title and chevron between hairlines ── */
  .s-folder { padding: 0; background: none; border-radius: 0; border-top: var(--px) solid var(--subtle); border-bottom: var(--px) solid var(--subtle); margin-top: calc(4 * var(--space)); min-height: 0;
    > summary { height: var(--h); font-weight: 600; letter-spacing: -.01em; color: var(--label); cursor: pointer;
      &::after { content: ''; margin-left: auto; width: calc(16 * var(--length)); height: calc(16 * var(--length)); margin-right: calc(2 * var(--length)); background: var(--label); opacity: .6; rotate: 180deg; transition: rotate .25s;
        -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; border-radius: calc(5 * var(--length)); } }
    &:not([open]) > summary::after { rotate: 0deg; }
    > .s-content { gap: var(--row-gap); padding-bottom: calc(10 * var(--space)); }
  }
  .s-folder:last-child { border-bottom: none; }
  .s-folder + .s-folder { border-top: none; margin-top: calc(-6 * var(--space)); }
  .s-folder:has(+ .s-folder) { border-bottom: var(--px) solid var(--subtle); }

  /* ── Separator: a hairline ── */
  .s-separator { height: var(--px); background: var(--subtle); opacity: 1; margin: calc(4 * var(--space)) 0; padding: 0; min-height: 0; }
  .s-separator-labeled { height: auto; min-height: 0; background: none; padding: calc(8 * var(--space)) 0 0; &::before { display: none; } &::after { background: var(--subtle); opacity: 1; } }
  .s-separator-label { font-size: var(--font-size); font-weight: 600; color: var(--label); opacity: 1; }
}
@media (forced-colors: active) { .s-panel { --focus: Highlight; } }`

  return baseCSS + '\n' + overrides
}
