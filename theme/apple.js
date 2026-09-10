/**
 * apple — calibrated to macOS System Settings (HIG)
 *
 * The panel is a settings pane: a window-toned sheet holding rounded grouped
 * boxes. Consecutive controls form one white group with hairline row
 * dividers; a folder is a section — its label sits above its own group; a
 * button row stands outside the groups as a right-aligned push button.
 * Signatures: SF Pro, the #007aff system blue, iOS-style toggles, thin sliders
 * with a 20px round knob, popup buttons with the blue chevron badge, segmented
 * pills. Light by default; a dark shade flips it.
 *
 * Axes: shade + accent decompose (via parseColor) into a `dark` flag that
 * drives every native constant below — each still a named CSS custom property
 * so it can be overridden independently even though its default is Apple's
 * own fixed value, not a formula. size scales the unit.
 *
 * apple(axes?) → CSS string
 */

import baseCSS from './base.js'
import { parseColor, resolveAccent } from './color.js'

export default function apple({
  shade = '#ffffff',
  accent = '#007aff',
  size = 1,
} = {}) {
  const { L } = parseColor(shade)
  const dark = L < 0.5
  const acc = resolveAccent(accent, shade)

  // ── Derived tokens (native's own constants, named + light/dark aware) ──
  const ink = dark ? '#ffffff' : '#1d1d1f'                                  // primary text
  const dim = dark ? '#98989d' : '#86868b'                                  // secondary text, hint, chevrons
  const line = dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'           // row hairline / group border
  const window_ = dark ? '#1e1e20' : '#f2f2f4'                              // pane (window) background
  const group = dark ? '#2a2a2c' : '#ffffff'                                // grouped box background
  const field = dark ? '#1c1c1e' : '#ffffff'                                // text field fill
  const fieldRing = dark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.14)'     // text field inset border
  const popup = dark ? '#3a3a3c' : '#ffffff'                                // popup button face
  const popupRing = dark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)'
  const track = dark ? '#48484a' : '#dcdcdf'                                // slider empty track / segmented track
  const switchOff = dark ? '#39393d' : '#d1d1d6'                            // switch off-state track
  const segmentSelected = dark ? '#636366' : '#ffffff'                      // segmented active pill
  const segmentHover = dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.04)'
  const tooltipBg = dark ? '#3a3a3c' : '#ffffff'
  const swatchBorder = dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)'
  const onAccent = '#ffffff'
  const thumbFace = '#ffffff'

  const shadowWindow = dark
    ? '0 0 0 1px rgba(255,255,255,.08), 0 20px 50px rgba(0,0,0,.6)'
    : '0 0 0 1px rgba(0,0,0,.08), 0 20px 50px rgba(0,0,0,.18)'
  const shadowThumb = '0 1px 3px rgba(0,0,0,.25), 0 0 0 .5px rgba(0,0,0,.06)'
  const shadowKnob = '0 1px 3px rgba(0,0,0,.25), 0 0 0 .5px rgba(0,0,0,.04)'
  const shadowPopup = `0 0 0 1px ${popupRing}, 0 1px 1px rgba(0,0,0,.06)`
  const shadowPill = '0 .5px 1px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.08)'
  const shadowPush = `0 0 0 .5px rgba(0,0,0,.15), 0 1px 1px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.2)`
  const shadowTooltip = '0 2px 8px rgba(0,0,0,.2)'

  // Groups are runs of consecutive rows; these break a run.
  const breaker = '.s-folder, .s-button, .s-separator'

  const overrides = `.s-panel {
  /* ── Axes → color tokens ── */
  --bg: ${window_};
  --accent: ${acc};
  --ink: ${ink};
  --dim: ${dim};
  --line: ${line};
  --group: ${group};
  --field: ${field};
  --field-ring: ${fieldRing};
  --popup: ${popup};
  --track: ${track};
  --switch-off: ${switchOff};
  --segment-selected: ${segmentSelected};
  --segment-hover: ${segmentHover};
  --tooltip-bg: ${tooltipBg};
  --swatch-border: ${swatchBorder};
  --on-accent: ${onAccent};
  --thumb-face: ${thumbFace};
  --shadow-window: ${shadowWindow};
  --shadow-thumb: ${shadowThumb};
  --shadow-knob: ${shadowKnob};
  --shadow-popup: ${shadowPopup};
  --shadow-pill: ${shadowPill};
  --shadow-push: ${shadowPush};
  --shadow-tooltip: ${shadowTooltip};

  /* ── Size tokens — native's exact constants, still overridable ── */
  --u: ${4 * size}px;
  --spacing: 1;
  --weight: 400;
  --w: 340px;
  --r-window: 12px;
  --r-group: 10px;
  --r-field: 6px;
  --r-control: 6px;
  --r-track: 2px;
  --thumb: 20px;
  --field-h: 24px;
  --row-h: 40px;
  --row-x: 12px;
  --switch-w: 38px;
  --switch-h: 22px;
  --swatch: 22px;
  --ease: cubic-bezier(.2, 0, 0, 1);
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--bg);
  color: var(--ink);
  font: 13px/1.3 -apple-system, system-ui, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  width: min(100%, var(--w));
  min-width: 0;
  max-width: var(--w);
  border-radius: var(--r-window);
  padding: 18px 20px 20px;
  box-shadow: var(--shadow-window);
  -webkit-font-smoothing: antialiased;

  /* ── Title ── */
  > summary, > .s-panel-title { font-weight: 700; font-size: 20px; letter-spacing: -0.01em; color: var(--ink); padding: 0 0 14px; gap: 10px; }
  > summary::after { display: none; }
  .s-fold-icon { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; margin-left: auto; order: 2; border-radius: 50%; background: var(--segment-hover); cursor: pointer;
    :has(> .s-search) > & { margin-left: 0; }
    i { width: 11px; height: 11px; background: var(--dim); -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .15s var(--ease); } }
  &[open] .s-fold-icon i { transform: rotate(-180deg); }
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  .s-search { order: 1; margin-left: auto; font-size: 13px; font-weight: 400; letter-spacing: 0; gap: 6px; }
  .s-search-btn { width: 14px; height: 14px; background: var(--dim); }
  .s-search-input { background: var(--field); box-shadow: inset 0 0 0 1px var(--field-ring); border-radius: var(--r-field); height: var(--field-h); padding: 0 8px; width: 14ch;
    &::placeholder { color: var(--dim); }
    &:focus { outline: none; box-shadow: inset 0 0 0 1px var(--field-ring), 0 0 0 3px color-mix(in oklab, var(--accent), transparent 65%); } }
  .s-panel-content { gap: 0; padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Grouped rows: consecutive controls share one rounded box ── */
  .s-control { gap: 12px; padding: 0 var(--row-x); min-height: var(--row-h); align-items: center; }
  .s-panel-content > .s-control:not(${breaker}), .s-content > .s-control:not(${breaker}) {
    background: var(--group);
    border: 1px solid var(--line);
    border-top-width: 0;
    /* first of a run */
    &:first-child, :is(${breaker}) + & {
      border-top-width: 1px;
      border-top-left-radius: var(--r-group); border-top-right-radius: var(--r-group);
    }
    /* last of a run */
    &:last-child, &:has(+ :is(${breaker})) {
      border-bottom-left-radius: var(--r-group); border-bottom-right-radius: var(--r-group);
    }
  }
  .s-label-group { width: 40%; min-width: 0; max-width: none; padding: 8px 0; }
  .s-label { color: var(--ink); font-weight: 400; }
  .s-hint { opacity: 1; color: var(--dim); font-size: 11px; }
  .s-input { gap: 8px; align-items: center; justify-content: flex-end; padding: 8px 0; }
  .s-title { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 50%; border: 1px solid var(--dim); color: var(--dim); font-size: 9px; font-weight: 600; line-height: 1; cursor: help;
    &:hover + .s-title-text { opacity: 1; visibility: visible; } }
  .s-title-text { position: absolute; left: 0; top: 100%; margin-top: 4px; padding: 6px 8px; font-size: 11px; background: var(--tooltip-bg); color: var(--ink); border-radius: var(--r-field); box-shadow: var(--shadow-tooltip); width: max-content; max-width: 30ch; z-index: 10; opacity: 0; visibility: hidden; pointer-events: none; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], textarea {
    background: var(--field); color: var(--ink); border: none; border-radius: var(--r-field);
    box-shadow: inset 0 0 0 1px var(--field-ring);
    height: var(--field-h); padding: 0 7px; font: inherit;
    transition: box-shadow .12s var(--ease);
    &::placeholder { color: var(--dim); }
    &:focus { outline: none; box-shadow: inset 0 0 0 1px var(--field-ring), 0 0 0 3px color-mix(in oklab, var(--accent), transparent 65%); }
  }
  .s-text input[type="text"] { flex: 1; max-width: 200px; }
  input.s-scrubbing { box-shadow: inset 0 0 0 1px var(--field-ring), 0 0 0 3px color-mix(in oklab, var(--accent), transparent 65%); }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 0 1 auto; width: 64px; text-align: right; cursor: ew-resize; font-variant-numeric: tabular-nums; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-step { flex-direction: column; gap: 0; height: var(--field-h); width: 15px; border-radius: 5px; background: var(--popup); box-shadow: var(--shadow-popup); overflow: hidden;
      button { flex: 1; padding: 0; border: none; background: transparent; color: var(--ink); font-size: 9px; line-height: 1; cursor: pointer; display: grid; place-items: center;
        &:hover { background: var(--segment-hover); } &:active { background: var(--accent); color: var(--on-accent); } } } }

  /* ── Vector ── */
  .s-vector {
    .s-input { gap: 6px; }
    .s-vec-axis { flex: 1; min-width: 64px; gap: 4px; background: var(--field); box-shadow: inset 0 0 0 1px var(--field-ring); border-radius: var(--r-field); padding: 0 7px; height: var(--field-h);
      transition: box-shadow .12s var(--ease);
      &:focus-within { box-shadow: inset 0 0 0 1px var(--field-ring), 0 0 0 3px color-mix(in oklab, var(--accent), transparent 65%); } }
    .s-vec-label { opacity: 1; color: var(--dim); font-size: 11px; opacity: 1; }
    input[type="number"] { background: transparent; box-shadow: none; text-align: right; padding: 0; height: 100%; font-variant-numeric: tabular-nums; &:focus { box-shadow: none; } }
  }

  /* ── Slider (thin track, 20px round knob) ── */
  .s-slider {
    .s-track { height: var(--field-h); margin: 0; }
    input[type="range"] {
      width: 100%; height: 4px; -webkit-appearance: none; appearance: none; border-radius: var(--r-track); cursor: pointer;
      background: linear-gradient(to right, var(--accent) var(--p, 0%), var(--track) var(--p, 0%));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--thumb); height: var(--thumb); border-radius: 50%; background: var(--thumb-face); box-shadow: var(--shadow-thumb); cursor: pointer; }
      &::-moz-range-thumb { width: var(--thumb); height: var(--thumb); border: none; border-radius: 50%; background: var(--thumb-face); box-shadow: var(--shadow-knob); cursor: pointer; }
      &:focus-visible { outline: none; }
      &:focus-visible::-webkit-slider-thumb { box-shadow: var(--shadow-thumb), 0 0 0 3px color-mix(in oklab, var(--accent), transparent 65%); }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 0); font-size: 10px; color: var(--dim); white-space: nowrap; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 12px; }
    .s-readout { flex: 0 0 auto; width: 5ch; text-align: right; background: transparent; color: var(--dim); box-shadow: none; border: none; height: auto; padding: 0; font-variant-numeric: tabular-nums; cursor: ew-resize;
      &:focus, &.s-scrubbing { box-shadow: none; color: var(--ink); } }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: var(--tooltip-bg); color: var(--ink); padding: 3px 8px; border-radius: var(--r-field); box-shadow: var(--shadow-tooltip); white-space: nowrap; font-size: 11px; }
    &.s-multiple .s-interval-track { height: 4px; margin: 10px 0; background: var(--track); border-radius: var(--r-track); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); } }
  }

  /* ── Select (macOS popup button) ── */
  .s-select {
    &.s-dropdown .s-input { position: relative; flex: 0 1 auto; min-width: auto; max-width: 100%;
      &::after { content: ''; position: absolute; top: 50%; right: 4px; width: 16px; height: 16px; transform: translateY(-50%); border-radius: 5px; background: var(--accent); box-shadow: 0 .5px 1px rgba(0,0,0,.2);
        -webkit-mask: var(--pop-chev) center / 9px 12px no-repeat, linear-gradient(#000 0 0); mask: var(--pop-chev) center / 9px 12px no-repeat, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
      &::after { -webkit-mask: none; mask: none; background: var(--accent) var(--pop-chev) center / 9px 12px no-repeat; } }
    --pop-chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 9 12' xmlns='http://www.w3.org/2000/svg' fill='%23fff'%3E%3Cpath d='M4.5 0 L8 3.6 L6.8 4.8 L4.5 2.5 L2.2 4.8 L1 3.6Z'/%3E%3Cpath d='M4.5 12 L8 8.4 L6.8 7.2 L4.5 9.5 L2.2 7.2 L1 8.4Z'/%3E%3C/svg%3E");
    &.s-dropdown select { flex: 0 1 auto; width: auto; max-width: 100%; min-width: 0; appearance: none; -webkit-appearance: none; cursor: pointer; font: inherit; color: var(--ink);
      height: var(--field-h); padding: 0 26px 0 9px; border: none; border-radius: var(--r-control); background: var(--popup); box-shadow: var(--shadow-popup);
      text-overflow: ellipsis; overflow: hidden; white-space: nowrap;
      &:focus-visible { outline: none; box-shadow: var(--shadow-popup), 0 0 0 3px color-mix(in oklab, var(--accent), transparent 65%); }
      option { background: var(--group); color: var(--ink); } }
    &.s-segmented { .s-input { gap: 0; background: var(--track); border-radius: var(--r-control); padding: 2px; flex: 0 1 auto; }
      button { flex: 1; min-width: 0; background: transparent; border: none; color: var(--ink); border-radius: 5px; height: 20px; padding: 0 10px; font: inherit;
        transition: background .12s var(--ease), box-shadow .12s var(--ease);
        &:not(.s-selected):hover { background: var(--segment-hover); }
        &.s-selected { background: var(--segment-selected); box-shadow: var(--shadow-pill); }
        &:focus-visible { outline: none; box-shadow: 0 0 0 2px color-mix(in oklab, var(--accent), transparent 50%); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: flex-end; gap: 6px; } .s-input label { display: flex; align-items: center; gap: 6px; cursor: pointer; } }
    &.s-radio input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; width: 14px; height: 14px; border-radius: 50%; background: var(--field); box-shadow: inset 0 0 0 1px var(--field-ring), 0 .5px 1px rgba(0,0,0,.08); display: grid; place-items: center; cursor: pointer;
      &::after { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--on-accent); opacity: 0; }
      &:checked { background: var(--accent); box-shadow: 0 .5px 1px rgba(0,0,0,.15); &::after { opacity: 1; } }
      &:focus-visible { outline: none; box-shadow: inset 0 0 0 1px var(--field-ring), 0 0 0 3px color-mix(in oklab, var(--accent), transparent 65%); } }
    &.s-checkboxes {
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: grid; place-items: center; width: 14px; height: 14px; flex-shrink: 0; border-radius: 3.5px; background: var(--field); box-shadow: inset 0 0 0 1px var(--field-ring), 0 .5px 1px rgba(0,0,0,.08); transition: background .12s var(--ease);
        &::after { content: ''; width: 9px; height: 7px; -webkit-mask: var(--check) center / contain no-repeat; mask: var(--check) center / contain no-repeat; background: var(--on-accent); opacity: 0; } }
      .s-input label:has(input:checked) .s-track { background: var(--s-color, var(--accent)); box-shadow: 0 .5px 1px rgba(0,0,0,.15); &::after { opacity: 1; } }
      .s-input label:has(input:focus-visible) .s-track { box-shadow: inset 0 0 0 1px var(--field-ring), 0 0 0 3px color-mix(in oklab, var(--accent), transparent 65%); }
    }
  }

  /* ── Boolean (iOS-style toggle, macOS checkbox) ── */
  .s-boolean {
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &.s-switch {
      .s-track { width: var(--switch-w); height: var(--switch-h); border-radius: 999px; background: var(--switch-off); position: relative; cursor: pointer; transition: background .2s var(--ease); box-shadow: inset 0 0 0 .5px rgba(0,0,0,.06);
        &::after { content: ''; position: absolute; top: 1px; left: 1px; width: var(--thumb); height: var(--thumb); border-radius: 50%; background: var(--thumb-face); box-shadow: var(--shadow-knob); transition: left .2s var(--ease); } }
      &:has(input:checked) .s-track { background: var(--accent); box-shadow: none; &::after { left: calc(var(--switch-w) - var(--thumb) - 1px); } }
      &:has(input:focus-visible) .s-track { outline: 3px solid color-mix(in oklab, var(--accent), transparent 60%); outline-offset: 1px; }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: 14px; height: 14px; border-radius: 3.5px; background: var(--field); box-shadow: inset 0 0 0 1px var(--field-ring), 0 .5px 1px rgba(0,0,0,.08); cursor: pointer;
        transition: background .12s var(--ease), box-shadow .12s var(--ease);
        &::after { content: ''; width: 9px; height: 7px; -webkit-mask: var(--check) center / contain no-repeat; mask: var(--check) center / contain no-repeat; background: var(--on-accent); opacity: 0; } }
      &:has(input:checked) .s-track { background: var(--accent); box-shadow: 0 .5px 1px rgba(0,0,0,.15); &::after { opacity: 1; } }
      &:has(input:focus-visible) .s-track { box-shadow: inset 0 0 0 1px var(--field-ring), 0 0 0 3px color-mix(in oklab, var(--accent), transparent 65%); }
    }
    --check: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 5 L4.5 8 L10.5 1.5' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    &.s-toggle .s-track { padding: 0 12px; height: var(--field-h); border-radius: var(--r-control); background: var(--popup); box-shadow: var(--shadow-popup); display: flex; align-items: center; justify-content: center; cursor: pointer; &::after { content: 'Off'; } }
    &.s-toggle:has(input:checked) .s-track { background: var(--accent); color: var(--on-accent); box-shadow: var(--shadow-push); &::after { content: 'On'; } }
  }

  /* ── Color (round well) ── */
  .s-color {
    &.s-picker .s-color-input { gap: 8px; justify-content: flex-end;
      input[type="color"] { position: static; flex: none; width: var(--swatch); height: var(--swatch); padding: 0; border: none; border-radius: 50%; box-shadow: inset 0 0 0 1px var(--swatch-border), 0 .5px 1px rgba(0,0,0,.1); cursor: pointer; overflow: hidden; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 50%; } }
      input[type="text"] { flex: 0 1 auto; width: auto; min-width: 9ch; max-width: 120px; text-align: right; } }
    &.s-rgba .s-color-input { gap: 8px; justify-content: flex-end; input[type="color"] { width: var(--swatch); height: var(--swatch); border-radius: 50%; overflow: hidden; box-shadow: inset 0 0 0 1px var(--swatch-border); &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 50%; } }
      .s-alpha { height: 4px; &::-webkit-slider-thumb { width: 14px; height: 14px; border: none; box-shadow: var(--shadow-knob); } &::-moz-range-thumb { width: 14px; height: 14px; border: none; box-shadow: var(--shadow-knob); } }
      input[type="text"] { flex: 1; } }
    &.s-swatches { .s-input { justify-content: flex-end; flex-wrap: wrap; gap: 6px; } button { width: var(--swatch); height: var(--swatch); padding: 0; border-radius: 50%; border: none; box-shadow: inset 0 0 0 1px var(--swatch-border), 0 .5px 1px rgba(0,0,0,.1); cursor: pointer; &.s-selected { outline: 2px solid var(--accent); outline-offset: 2px; } } }
  }

  /* ── Button — a push button outside the groups, right-aligned ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    padding: 14px 0 0; min-height: 0;
    .s-input { justify-content: flex-end; gap: 8px; padding: 0; }
    button { flex: 0 0 auto; min-width: 72px; height: 22px; padding: 0 12px; background: linear-gradient(180deg, color-mix(in oklab, var(--accent), white 8%), var(--accent)); color: var(--on-accent); border: none; border-radius: var(--r-control); font-weight: 500; box-shadow: var(--shadow-push);
      transition: filter .12s var(--ease);
      &:hover { filter: brightness(1.05); } &:active { filter: brightness(.9); }
      &:disabled, &[aria-busy="true"] { filter: none; opacity: .5; cursor: not-allowed; }
      &:focus-visible { outline: none; box-shadow: var(--shadow-push), 0 0 0 3px color-mix(in oklab, var(--accent), transparent 65%); } }
    &.s-secondary button, button.s-secondary { background: var(--popup); color: var(--ink); box-shadow: var(--shadow-popup); font-weight: 400; }
  }
  .s-content > .s-button { padding-top: 10px; }

  /* ── Textarea ── */
  .s-textarea { align-items: flex-start; .s-label-group { padding-top: 10px; } textarea { flex: 1; height: auto; resize: vertical; field-sizing: content; min-height: 52px; max-height: 50vh; padding: 5px 7px; } &.s-code textarea { font-family: ui-monospace, 'SF Mono', monospace; font-size: 12px; } }

  /* ── Folder (section: label above its own group) ── */
  .s-folder {
    padding: 0; min-height: 0; background: none; border: none;
    > summary { font-weight: 600; font-size: 13px; color: var(--ink); text-transform: none; padding: 18px 0 8px; gap: 6px;
      &::after { content: ''; width: 12px; height: 12px; margin-left: auto; background: var(--dim); -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .15s var(--ease); }
      &:focus-visible { outline: none; color: var(--accent); } }
    &[open] > summary::after { transform: rotate(-180deg); }
    .s-content { gap: 0; }
    &.s-section > summary { pointer-events: none; &::after { display: none; } }
  }

  /* ── XY pad / knob ── */
  .s-xy { align-items: flex-start; .s-label-group { padding-top: 12px; } }
  .s-pad { border-radius: var(--r-field); background: var(--field); border: none; box-shadow: inset 0 0 0 1px var(--field-ring); .s-pad-x, .s-pad-y { background: var(--line); } }
  .s-knob-dial { background: var(--popup); border: none; box-shadow: var(--shadow-popup); i { background: var(--accent); } }
  .s-knob-val { color: var(--dim); opacity: 1; }

  /* ── Info / separator ── */
  .s-info { .s-input { justify-content: flex-end; } .s-monitor { flex: 0 1 auto; color: var(--dim); font-variant-numeric: tabular-nums; opacity: 1; } }
  .s-separator { min-height: 0; height: 12px; padding: 0; background: none; opacity: 1; margin: 0; }
  .s-separator-labeled { height: auto; padding: 14px 0 6px; &::before, &::after { display: none; } }
  .s-separator-label { color: var(--dim); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
