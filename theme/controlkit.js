/**
 * controlkit — calibrated to ControlKit.js's dark panel
 *
 * Signatures: a dense, flat near-black panel with gradient group-header bars, a
 * single burgundy-red (#b32435) thumbless slider fill, a strict label/control
 * split, and Arial type — the "Photoshop-panel" inspector look.
 * Ref: https://github.com/automat/controlkit.js
 *
 * controlkit(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveAccent } from './color.js'

export default function controlkit({
  shade = '#1a1a1a',
  accent = '#b32435',
  field = '#222729',
} = {}) {
  const acc = resolveAccent(accent, shade)
  const inset = '#1e2224';
  const text = '#aeb5b8';
  const muted = '#65696b';
  // native fields carry a faint top-to-bottom inset gradient over the flat fill —
  // that's what reads as "darker" than a plain fill at a glance
  const fieldBg = `linear-gradient(rgba(0,0,0,.075), rgba(0,0,0,.125)), ${field}`;
  // ControlKit's real chrome: a flat near-black panel/title (shade) with each row
  // painted a touch lighter on top — that row tint (not a darker title) is what
  // gives the panel its depth. Derived from the shade axis so theming stays functional.
  const row = `color-mix(in srgb, ${shade}, white 8.7%)`;
  const bevel = 'inset 0 0 0 1px #1f1f1f, inset -1px 2px 0 0 #4a4a4a';
  // same bevel technique, darker-toned — native measures #131313/#212527 (vs #1f1f1f/#4a4a4a)
  // on chrome that sits on the near-black title rather than the light gray button gradient
  const bevelDark = 'inset 0 0 0 1px #131313, inset -1px 2px 0 0 #212527';

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --field: ${field};
  --u: 4px;
  --spacing: 1;
  --weight: 400;
  --r: 2px;
  color-scheme: dark;

  background: ${shade};
  color: ${text};
  font: 11px/1.4 Arial, Helvetica, sans-serif;
  width: 200px;
  min-width: 0;
  max-width: 200px;
  border-radius: 3px;
  padding: 0;
  box-shadow: rgba(0, 0, 0, .25) 0 2px 2px 0;

  /* ── Title (flat, same near-black as the panel — rows are what read lighter) ── */
  > summary, > .s-panel-title {
    background: ${shade}; color: ${muted}; font-weight: 700; height: 30px; padding: 0 10px; font-size: 11px; text-shadow: 0 1px 0 #000;
    &::after { content: ''; width: 20px; height: 20px; margin-left: auto; background: ${inset} url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 4 L5 7 L8 4Z' fill='%235f696d'/%3E%3C/svg%3E") center / 10px 10px no-repeat; border-radius: 2px; box-shadow: ${bevelDark}; -webkit-mask: none; mask: none; transition: transform .1s; }
  }
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23aaa' stroke-width='1.6'/%3E%3C/svg%3E");
  &[open] > summary::after { transform: rotate(-180deg); }
  .s-panel-content { gap: 0; padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Row (a touch lighter than the panel/title behind it) ── */
  .s-control { gap: 0; padding: 0 10px; min-height: 35px; align-items: center; background: ${row}; border-bottom: 1px solid ${field}; }
  .s-label-group { flex: 0 0 54px; width: 54px; min-width: 0; max-width: none; padding: 0; }
  .s-label { color: ${text}; font-weight: 400; text-shadow: 1px 1px 0 #000; }
  .s-hint { color: ${muted}; font-size: 10px; }
  .s-input { gap: 4px; align-items: center; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: ${fieldBg}; color: #fff; border: none; border-radius: 2px;
    height: 26px; padding: 0 8px; font: inherit; text-shadow: 1px 1px 0 #000;
    box-shadow: inset 0 0 0 1px #1f1f1f;
    &::placeholder { color: ${muted}; }
    &:focus { outline: 0; }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Slider: dark slot, red fill inset from the edges, no thumb, number right ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 12px; }
    .s-track { height: 26px; margin: 0; background: ${inset}; border-radius: 2px; padding: 3px; box-shadow: inset 0 0 0 1px #1f1f1f; cursor: ew-resize; }
    input[type="range"] {
      width: 100%; height: 100%; -webkit-appearance: none; appearance: none; cursor: ew-resize; border: none; border-radius: 1px;
      background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), transparent var(--p, 0%)), linear-gradient(to bottom, transparent, rgba(0,0,0,.15));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 0; height: 100%; }
      &::-moz-range-thumb { width: 0; height: 100%; border: none; }
      &:focus-visible { outline: 1px solid ${acc}; outline-offset: 1px; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: ${muted}; white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: 32px; min-width: 32px; text-align: center; background: ${fieldBg}; color: #fff; border: none; border-radius: 2px; height: 26px; line-height: 26px; padding: 0; font-variant-numeric: tabular-nums; text-shadow: 1px 1px 0 #000; box-shadow: inset 0 0 0 1px #1f1f1f; }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: #000; color: #fff; padding: 1px 4px; white-space: nowrap; }
    /* 1fr columns (not 4×32px) so the 4-up grid sums to exactly the value column's width —
       fixed px columns overshot it by 2px, pushing MAX's readout past the row's right edge */
    &.s-multiple .s-input { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
    &.s-multiple .s-interval-track { display: none; }
    &.s-multiple .s-readout { position: relative; width: 32px; min-width: 32px; cursor: ew-resize; }
    &.s-multiple .s-readout-lo { grid-column: 2; }
    &.s-multiple .s-readout-hi { grid-column: 4; }
    &.s-multiple .s-readout-lo::before,
    &.s-multiple .s-readout-hi::before { position: absolute; right: 100%; top: 0; width: 32px; height: 26px; display: grid; place-items: center; color: #8b8f91; font-weight: 700; }
    &.s-multiple .s-readout-lo::before { content: 'MIN'; }
    &.s-multiple .s-readout-hi::before { content: 'MAX'; }
  }

  /* ── Select: styled as the same gray-gradient button as .s-button, per ControlKit's real chrome ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer; color: #fff; font-weight: 700;
      border-radius: 2px; height: 26px; padding: 0 20px 0 10px; box-shadow: ${bevel};
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 8 12' xmlns='http://www.w3.org/2000/svg' fill='%23aaa'%3E%3Cpath d='M0 5 L4 1 L8 5Z'/%3E%3Cpath d='M0 7 L4 11 L8 7Z'/%3E%3C/svg%3E"), linear-gradient(#454545, #3b3b3b); background-repeat: no-repeat, repeat; background-position: right 8px center, 0 0; background-size: 8px 12px, auto;
      &:hover { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 8 12' xmlns='http://www.w3.org/2000/svg' fill='%23aaa'%3E%3Cpath d='M0 5 L4 1 L8 5Z'/%3E%3Cpath d='M0 7 L4 11 L8 7Z'/%3E%3C/svg%3E"), linear-gradient(#4a4a4a, #3b3b3b); }
      option { background: ${field}; color: ${text}; } }
    &.s-segmented { .s-input { gap: 0; } button { flex: 1; background: ${field}; border: 1px solid #000; color: ${text}; margin-left: -1px; padding: 2px; font: inherit; &:first-child { margin-left: 0; } &.s-selected { background: var(--accent); color: #fff; } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: 2px; } label { display: flex; align-items: center; gap: 5px; cursor: pointer; } }
  }

  /* ── Boolean: small checkbox ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { -webkit-appearance: none; appearance: none; position: static; opacity: 1; width: 13px; height: 13px; margin: 0; border-radius: 2px; background: #fff; border: 1px solid #8a8a8a; box-sizing: border-box; cursor: pointer;
      &:checked { border-color: #2f6fb3; background: #2f6fb3 url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") center / 10px no-repeat; }
      &:focus-visible { outline: 1px solid ${acc}; outline-offset: 2px; } }
    .s-track { display: none; }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input { gap: 0; position: relative; border-radius: 2px; overflow: hidden; box-shadow: inset 0 0 0 1px #111314;
      input[type="color"] { position: absolute; inset: 0; width: 100%; height: 26px; padding: 0; border: none; cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } }
      input[type="text"] { position: relative; flex: 1; background: transparent; color: #fff; mix-blend-mode: normal; font-family: Arial, sans-serif; font-weight: 700; text-align: center; padding: 0; height: 26px; text-shadow: 1px 1px 0 #000; } }
    &.s-rgba .s-color-input { gap: 4px; input[type="color"] { width: 28px; height: 19px; } input[type="text"] { flex: 1; } }
    &.s-swatches button { width: 16px; height: 16px; border: 1px solid #000; &.s-selected { outline: 1px solid var(--accent); } }
  }

  /* ── Button: gray gradient, uppercase ── */
  button { font: inherit; cursor: pointer; &:focus-visible { outline: 1px solid ${acc}; outline-offset: 1px; } }
  .s-button {
    /* full-width by owner's decision — native ControlKit keeps buttons at the value column */
    .s-input { flex: 1; }
    button { width: 100%; background: linear-gradient(#454545, #3b3b3b); color: #fff; border: none; border-radius: 2px; height: 26px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; text-shadow: 0 1px 0 #000; box-shadow: ${bevel}; &:hover { background: linear-gradient(#4a4a4a, #3b3b3b); box-shadow: inset 0 0 0 1px #1f1f1f, inset -1px 2px 0 0 #545454; } &:active { background: linear-gradient(#3b3b3b, #454545); box-shadow: inset 0 0 0 1px #1f1f1f; } }
    &.s-secondary button, button.s-secondary { background: ${field}; }
  }

  /* ── XY pad: 126px square pad row, matching ControlKit's large pad control ── */
  .s-xy { min-height: 138px; align-items: flex-start; padding-top: 5px; }
  .s-pad {
    position: relative; width: 126px; height: 126px; border-radius: 2px; border: none;
    /* native's pad face carries a faint top-to-bottom inset gradient over the flat fill, same trick as the fields */
    background: linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.05)), ${inset};
    /* fixed center crosshair (native ControlKit draws one at origin, one following the dot) */
    &::before, &::after { content: ''; position: absolute; background: #191919; pointer-events: none; }
    &::before { left: 0; right: 0; top: 50%; height: 1px; }
    &::after { top: 0; bottom: 0; left: 50%; width: 1px; }
    .s-pad-x, .s-pad-y { background: #363c40; }
    .s-pad-x { top: var(--y, 50%); }
    .s-pad-y { left: var(--x, 50%); }
    /* native draws the dot as layered flat SVG circles (r11 halo, r10 base, r9 fill offset
       0.75px down, r10 ring stroke, r6 inner disc, r3 center) — reproduced here 1:1 in px:
       a 20px (r10) disc, a darker fill circle shifted down to leave a top highlight rim,
       then the inner disc/center dot as pseudo-elements on top, same paint order. */
    .s-pad-dot {
      width: 20px; height: 20px; box-sizing: border-box; border-radius: 50%;
      background: radial-gradient(circle 9px at 50% calc(50% + 0.75px), #39454c 9px, transparent 9px), #535d62;
      /* native's ring is an SVG stroke centered on the r10 edge (9.5–10.5) — a pure outward
         spread (10–11) leaves too much of the highlight rim exposed (1.75px vs native's 1.25px,
         reading thicker); split the ring in and out by half a px so it straddles the edge too */
      box-shadow: 0 0 0 .5px #111314, inset 0 0 0 .5px #111314, 0 0 0 1px rgba(0,0,0,.05);
      &::before { content: ''; position: absolute; inset: 0; margin: auto; width: 12px; height: 12px; border-radius: 50%; background: ${inset}; }
      &::after { content: ''; position: absolute; inset: 0; margin: auto; width: 6px; height: 6px; border-radius: 50%; background: #fff; }
    }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 40px; max-height: 50vh; padding: 3px 4px; } }

  /* ── Folder: gradient group header ──
     the <details> itself carries .s-control too (folder.js), so it inherits that row's
     padding/background/border-bottom/min-height — reset them here so the folder spans the
     panel edge-to-edge like native's group headers, same as base.js resolves .s-folder's
     display over .s-control's: equal specificity, this rule sits later in the cascade. */
  .s-folder {
    padding: 0; min-height: 0; background: none; border-bottom: 0;
    > summary { background: linear-gradient(#454545, #3b3b3b); color: #fff; font-weight: 700; height: 38px; padding: 0 10px; border-bottom: 1px solid #000; text-shadow: 0 1px 0 #000;
      &::after { content: ''; width: 8px; height: 8px; margin-left: auto; background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .1s; } }
    &[open] > summary::after { transform: rotate(-180deg); }
    &.s-section > summary, .s-content .s-folder > summary { background: #272727; }
    .s-content { gap: 0; }
  }

  /* ── Info / separator: readout rendered as the same boxed field as our text inputs ── */
  .s-info .s-monitor {
    flex: 1; display: block; background: ${fieldBg}; color: #fff; border-radius: 2px;
    height: 26px; line-height: 26px; padding: 0 8px; text-shadow: 1px 1px 0 #000;
    box-shadow: inset 0 0 0 1px #1f1f1f; font-variant-numeric: tabular-nums; opacity: 1;
  }
  .s-separator { background: #000; opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
