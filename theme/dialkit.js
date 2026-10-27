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
  // native's click spring (animateSpring: Motion's visualDuration .25s, bounce .1), sampled at 60fps as native does
  const spring = (() => {
    const w0 = 2 * Math.PI / (.25 * 1.2), zeta = .9, wd = w0 * Math.sqrt(1 - zeta * zeta)
    const d = Math.round(Math.log(200) / (zeta * w0) * 100) / 100, n = Math.ceil(d * 60)
    const at = t => 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + zeta * w0 / wd * Math.sin(wd * t))
    return `${d}s linear(${Array.from({ length: n + 1 }, (_, i) => i === n ? 1 : +at(i / n * d).toFixed(4)).join(', ')})`
  })()
  const grid = [1, 2, 3, 4, 5].map(k => `transparent 0 calc(${+(k * 100 / 6).toFixed(4)}% - .5px), ${line} 0 calc(${+(k * 100 / 6).toFixed(4)}% + .5px)`).join(', ') + ', transparent 0'

  // Body 13px: DialKit sets its labels and values at 13px.
  // the fill's end as a typed length, so a click's jump can spring there
  const overrides = `@property --p { syntax: '<percentage>'; inherits: true; initial-value: 0%; }
.s-panel {
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
    /* a click springs the fill and handle to the step under it; a drag follows the pointer. The number is part of the
       track until the pointer rests on it .8s: then it underlines, and a click edits it */
    --s-readout-dwell: .8s;
    .s-track { flex: 1; position: relative; display: flex; height: var(--h); transition: --p ${spring}; }
    input[type="range"] {
      -webkit-appearance: none; appearance: none; width: 100%; height: 100%; margin: 0; cursor: pointer; border-radius: var(--r); overflow: hidden;
      background: linear-gradient(to right, var(--fill, var(--surface-active)) 0 var(--p, 0%), transparent 0);
      &::-webkit-slider-runnable-track { height: 100%; }
      /* the thumb only takes the pointer; the handle is drawn at native's place, 9px inside the fill's end */
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(3 * var(--length)); height: var(--h); opacity: 0; }
      &::-moz-range-thumb { width: calc(3 * var(--length)); height: var(--h); border: none; opacity: 0; }
      &::-moz-range-track { background: none; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
    }
    /* under the pointer or in a drag (native's active row): the fill deepens, the value whitens, the handle grows in, the hashmarks show */
    &:is(:hover, :has(input:active, input:focus-visible)) { --fill: var(--border-hover); .s-readout { color: var(--root); } }
    .s-track::after { content: ''; position: absolute; z-index: 1; top: 50%; left: max(calc(5 * var(--length)), calc(var(--p, 0%) - 9 * var(--length))); width: calc(3 * var(--length)); height: calc(20 * var(--length));
      translate: 0 -50%; scale: .25 1; border-radius: 999px; background: var(--primary); opacity: 0; pointer-events: none; transition: opacity .15s, scale .2s; }
    &:hover .s-track::after { opacity: .5; scale: 1; }
    &:has(input:active) .s-track::after { opacity: .9; scale: 1; }
    /* hashmarks: a 1px × 8px tick at every step, or at every tenth past ten steps, none at the ends */
    .s-track::before { content: ''; position: absolute; z-index: 1; --n: min(var(--steps, 100), 10); top: 50%; left: calc(100% / var(--n)); right: 0; height: calc(8 * var(--length)); translate: -.5px -50%;
      background: repeating-linear-gradient(to right, var(--border-hover) 0 1px, transparent 0 calc(100% / (var(--n) - 1)));
      opacity: 0; pointer-events: none; transition: opacity .2s; }
    &:is(:hover, :has(input:active)) .s-track::before { opacity: 1; }
    /* marks a schema asks for stay hashmarks, shown in a drag */
    .s-marks { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-labels { display: none; }
    .s-mark { position: absolute; top: 50%; width: var(--px); height: calc(8 * var(--length)); border-radius: 999px; translate: -50% -50%; background: transparent; transition: background .2s; }
    &:has(input:active) .s-mark { background: var(--border-hover); }
    .s-readout { position: absolute; right: var(--inset); top: 50%; translate: 0 calc(-50% + var(--px)); z-index: 3; width: auto; min-width: 0; max-width: 7ch; height: auto;
      padding: 0 0 var(--px); border-bottom: var(--px) solid transparent;
      font-family: var(--mono); color: var(--label); field-sizing: content; cursor: text; transition: color .15s, border-color .15s;
      &.s-editable { border-bottom-color: var(--label); }
      &:focus { color: var(--root); border-bottom-color: transparent; }
      &:focus-visible { box-shadow: none; border-bottom-color: var(--focus); } }
    .s-tooltip { position: absolute; bottom: 100%; margin-bottom: calc(6 * var(--space)); padding: calc(2 * var(--space)) calc(6 * var(--space)); border-radius: calc(6 * var(--length)); background: var(--root); color: var(--bg); font-family: var(--mono); white-space: nowrap; z-index: 4; }
    /* an interval is the same instrument with two handles: the fill spans low to high, a handle 9px inside each end
       (shown under the pointer, as the slider's), the values at the row's end as low – high; a press anywhere on the
       row (but its values) brings the nearer handle to it */
    &.s-multiple {
      > .s-input { display: flex; justify-content: flex-end; align-items: center; gap: calc(4 * var(--space)); padding-right: var(--inset);
        &::before { content: '–'; order: 1; position: relative; z-index: 3; font-family: var(--mono); color: var(--label); pointer-events: none; } }
      .s-readout { position: relative; right: auto; top: auto; translate: none; }
      .s-readout-hi { order: 2; }
      .s-interval-track { position: absolute; inset: 0; display: block; height: auto; margin: 0; background: none;
        &::before { content: ''; position: absolute; inset: 0 auto 0 var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); border-radius: var(--r); background: var(--fill, var(--surface-active)); pointer-events: none; }
        input[type="range"] { position: absolute; inset: 0; height: 100%; background: none; overflow: visible; border-radius: 0;
          &::-webkit-slider-runnable-track { height: 100%; background: none; }
          &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(3 * var(--length)); height: calc(20 * var(--length)); margin-top: calc((var(--h) - 20 * var(--length)) / 2); border-radius: 999px; background: var(--primary); opacity: 0; transition: opacity .15s; }
          &::-moz-range-thumb { width: calc(3 * var(--length)); height: calc(20 * var(--length)); border: 0; border-radius: 999px; background: var(--primary); opacity: 0; } }
        .s-interval-lo::-webkit-slider-thumb { translate: calc(9 * var(--length)) 0; } .s-interval-hi::-webkit-slider-thumb { translate: calc(-9 * var(--length)) 0; }
        .s-interval-lo::-moz-range-thumb { translate: calc(9 * var(--length)) 0; } .s-interval-hi::-moz-range-thumb { translate: calc(-9 * var(--length)) 0; } }
      &:hover .s-interval-track input::-webkit-slider-thumb { opacity: .5; } &:has(input:active) .s-interval-track input::-webkit-slider-thumb { opacity: .9; }
      &:hover .s-interval-track input::-moz-range-thumb { opacity: .5; } &:has(input:active) .s-interval-track input::-moz-range-thumb { opacity: .9; }
    }
    /* in hand, the label steps aside while a handle passes over it */
    &.s-over-label > .s-label-group { opacity: 0; }
  }

  /* ── Boolean: Off / On, a pill sliding behind the chosen word (native's 200ms) ── */
  .s-boolean {
    padding-right: calc(10 * var(--space));
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { flex: 0 0 auto; margin-left: auto; cursor: pointer; }
    &:is(.s-switch, .s-segmented, .s-toggle) {
      /* each word's box: its advance in SF Pro 500 (Off 1.516em, On 1.363em) and native's 8px either side, so the pill can travel between them, its edges on whole pixels as native's offsets are */
      --off: calc(1.516em + 16 * var(--space)); --on: calc(1.363em + 16 * var(--space));
      .s-input { position: relative; margin-right: calc(-6 * var(--space));
        &::before { content: ''; position: absolute; top: 2px; bottom: 2px; left: 2px; width: round(var(--off), 1px); border-radius: calc(6 * var(--length)); background: var(--surface-active); transition: translate .2s ease, width .2s ease; } }
      .s-track { display: flex; padding: 2px; border-radius: var(--r);
        &::before, &::after { position: relative; padding: calc(6 * var(--space)) 0; line-height: calc(16 * var(--length)); text-align: center; color: var(--label); transition: color .15s; }
        &::before { content: 'Off'; width: var(--off); color: var(--primary); }
        &::after { content: 'On'; width: var(--on); } } }
    &:has(input:checked) { .s-input::before { translate: round(var(--off), 1px) 0; width: round(var(--on), 1px); } .s-track { &::before { color: var(--label); } &::after { color: var(--primary); } } }
    &.s-checkbox .s-track { display: grid; place-items: center; width: calc(20 * var(--length)); height: calc(20 * var(--length)); border-radius: calc(5 * var(--length)); background: var(--surface-active);
      &::after { content: ''; width: 75%; height: 75%; background: var(--primary); opacity: 0; -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; } }
    &.s-checkbox:has(input:checked) .s-track::after { opacity: 1; }
    &:is(.s-switch, .s-segmented, .s-toggle):has(input:focus-visible) .s-input::before { outline: 2px solid var(--focus); outline-offset: -2px; }
    &.s-checkbox:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 0; }
  }

  /* ── Select: the value and a chevron; the whole row opens the menu, which in a browser with
     customizable selects is native's own: a sheet of 36px options under the row ── */
  .s-select {
    &.s-dropdown { cursor: pointer; anchor-name: --s-row; anchor-scope: --s-row; }
    &.s-dropdown:has(select:open) { background: var(--surface-active); }
    &.s-dropdown select:focus-visible { outline: none; }
    &.s-dropdown:has(select:focus-visible) { outline: 2px solid var(--focus); outline-offset: -2px; }
    &.s-dropdown .s-input { position: relative; padding-right: calc(28 * var(--length));
      &::after { content: ''; position: absolute; right: calc(2 * var(--length)); top: 50%; translate: 0 -50%; width: calc(16 * var(--length)); height: calc(16 * var(--length)); background: var(--label); opacity: .6; pointer-events: none;
        -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; } }
    &.s-dropdown select { flex: 1 1 auto; width: auto; min-width: 0; text-align-last: right; appearance: none; -webkit-appearance: none; cursor: pointer; max-width: 100%; text-overflow: ellipsis; translate: 0 calc(-.5 * var(--px));
      option { background: var(--bg); color: var(--primary); } }
    &.s-dropdown:hover { background: var(--surface-hover); }
    @supports (appearance: base-select) {
      &.s-dropdown select { appearance: base-select; display: flex; align-items: center; justify-content: safe flex-end; border: none; background: none; padding: 0; height: var(--h); color: inherit; min-block-size: 0;
        &::picker-icon { display: none; }
        &::picker(select) { appearance: base-select; position-anchor: --s-row; position-area: bottom; position-try-fallbacks: flip-block; width: anchor-size(width); margin: calc(4 * var(--length)) 0;
          padding: calc(4 * var(--length)); border: var(--px) solid var(--border); border-radius: var(--r); background: var(--bg); box-shadow: ${dark ? '0 8px 24px rgba(0, 0, 0, .4)' : '0 4px 16px rgba(0, 0, 0, .08)'}; }
        option { display: flex; align-items: center; min-height: calc(36 * var(--length)); padding: calc(8 * var(--length)) calc(10 * var(--length)); border-radius: calc(6 * var(--length)); background: none; color: var(--label); font: inherit; font-weight: 500; cursor: pointer; transition: background .15s, color .15s;
          &::checkmark { display: none; }
          &:is(:hover, :focus-visible) { background: var(--surface-hover); outline: none; }
          &:checked { background: var(--surface-active); color: var(--primary); } } } }
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
      transition: scale .15s; &:hover { scale: 1.08; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; } }
    /* its focus line runs 4px under the code, at the foot of native's 4px pad, not at the row's */
    input[type="text"] { flex: 1; min-width: 0; font-family: var(--mono);
      &:focus-visible { box-shadow: none; background: linear-gradient(var(--focus), var(--focus)) 0 calc(50% + 12 * var(--length)) / 100% var(--px) no-repeat; } }
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
  /* a field is as wide as its value (its focus line under the value, not the row), from a few characters, at the row's end */
  .s-number input[type="number"] { flex: 0 1 auto; width: calc(var(--chars, 4) * 1ch); min-width: 4ch; margin-left: auto; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
  /* the steppers are the select's chevron up and down, beside the value; each half of the row's height takes a press */
  .s-number .s-step { flex: none; align-self: stretch; display: flex; flex-direction: column; gap: 0; margin-left: calc(2 * var(--space));
    button { position: relative; flex: 1; width: calc(18 * var(--length)); padding: 0; border: none; background: none; color: var(--label); font-size: 0; cursor: pointer;
      &::before { content: ''; position: absolute; left: 50%; translate: -50% 0; width: calc(14 * var(--length)); height: calc(14 * var(--length)); background: currentColor; -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; }
      &.s-step-up::before { bottom: calc(-4 * var(--length)); rotate: 180deg; }
      &.s-step-down::before { top: calc(-4 * var(--length)); }
      &:hover { color: var(--root); } } }
  /* text is a one-line textarea that wraps a long value and grows the row, five lines at most (native's autosize).
     The field is the row's height, its lines inset by the row's own padding, so its focus line, laid on its content
     box, runs under the last line from 4px in, as native's does */
  .s-text { --s-text-wrap: wrap; input[type="text"] { flex: 0 1 auto; width: auto; min-width: 6ch; margin-left: auto; field-sizing: content; } }
  :is(.s-text, .s-textarea) { --text-line: calc(18 * var(--length)); --text-pad: calc((var(--h) - var(--text-line)) / 2);
    &:has(textarea) { align-items: flex-start; > .s-label-group { padding-block: var(--text-pad); line-height: var(--text-line); } }
    textarea { flex: 1; min-width: 0; resize: none; field-sizing: content; min-height: var(--h); max-height: 40vh; padding-block: var(--text-pad); line-height: var(--text-line); overflow-wrap: anywhere; scrollbar-width: thin;
      &:focus-visible { box-shadow: none; background: linear-gradient(var(--focus), var(--focus)) calc(4 * var(--length)) 100% / calc(100% - 4 * var(--length)) var(--px) no-repeat content-box; } }
    &.s-code textarea { font-family: var(--mono); text-align: left; } }
  .s-text textarea { flex: 0 1 auto; width: auto; min-width: 6ch; margin-left: auto; max-height: calc(5 * var(--text-line) + 2 * var(--text-pad)); }   /* as wide as its value, its focus line under it */
  .s-info .s-monitor { flex: 1; text-align: right; color: var(--label); opacity: 1; }

  /* ── Pad: a caption and one field per axis in three equal cells, the square surface below ── */
  .s-vector { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--row-gap); padding: 0; background: none;
    > .s-label-group, .s-vec-axis { height: var(--h); padding: 0 var(--inset); border-radius: var(--r); background: var(--surface); display: flex; flex-direction: row; align-items: center; max-width: none; }
    > .s-input { display: contents; }
    .s-vec-axis { gap: calc(4 * var(--space)); padding-left: calc(10 * var(--space)); &:focus-within { background: var(--surface-hover); } }
    .s-vec-label { flex: none; font-size: var(--font-size); color: var(--label); opacity: 1; }
    input[type="number"] { flex: 1; width: 0; min-width: 0; height: auto; font-family: var(--mono); padding-bottom: var(--px); -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-vec-expand { display: none; }
    .s-vec-pad { grid-column: 1 / -1; }
  }
  /* an XY pad is the vector's pad: its caption in a cell, the surface the row's width below */
  .s-xy { flex-direction: column; align-items: stretch; gap: var(--row-gap); padding: 0; background: none;
    > .s-label-group { width: calc((100% - 2 * var(--row-gap)) / 3); height: var(--h); padding: 0 var(--inset); border-radius: var(--r); background: var(--surface); display: flex; align-items: center; max-width: none; } }
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
  .s-knob-val { font-family: var(--mono); color: var(--label); opacity: 1; text-align: right; }

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
