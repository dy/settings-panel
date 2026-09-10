/**
 * Brutal theme — neobrutalism
 *
 * Cut card stock stacked on a page: every part is a flat plate with a thick
 * uniform ink border and a hard offset shadow (zero blur, zero alpha). One
 * control height for everything, zero radius, flat saturated fills. Pressing
 * a plate drops it onto the page — it translates by exactly its shadow offset
 * and the shadow collapses to nothing.
 *
 * Axes: shade/accent (paper tint + fill color via resolveRoles), spacing,
 * weight, size (unit scale), bevel (border weight in px), offset (hard-shadow
 * throw in px — plate depth and press distance), grain (halftone texture
 * intensity; 0 = clean stock, the default).
 *
 * brutal(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveRoles } from './color.js'

export default function brutal({
  shade = '#f2eddf',
  accent = '#ff5a5f',
  spacing = 1,
  weight = 500,
  bevel = 2,              // border weight in px
  offset = 4,             // hard-shadow throw in px (plate depth, press distance)
  grain = 0,              // halftone texture intensity, 0 disables
  size = 1,
} = {}) {
  const { dark, bg, accent: acc } = resolveRoles(shade, accent)
  const ink = dark ? '#ffffff' : '#000000'
  const inkRGB = dark ? '255,255,255' : '0,0,0'
  const paper = dark ? 'oklch(from var(--bg) calc(l + 0.07) c h)' : '#fffdf8'

  // Hard offset shadow — solid ink, zero blur. `d` in px.
  const plate = d => `${+d.toFixed(1)}px ${+d.toFixed(1)}px 0 var(--ink)`

  // Halftone grain — coarse monochrome dot screen. `grain` scales opacity, 0 disables.
  const halftone = a => grain <= 0 ? 'none' : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Ccircle cx='1.5' cy='1.5' r='.7' fill='rgba(${inkRGB},${+(a * grain).toFixed(3)})'/%3E%3Ccircle cx='4.5' cy='4.5' r='.7' fill='rgba(${inkRGB},${+(a * grain).toFixed(3)})'/%3E%3C/svg%3E")`

  const chevron = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 1.5 L6 6 L10.5 1.5' fill='none' stroke='%23000' stroke-width='2.5' stroke-linecap='square'/%3E%3C/svg%3E")`
  const check = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 5 L4.5 8 L10.5 1.5' fill='none' stroke='%23000' stroke-width='2.6' stroke-linecap='square'/%3E%3C/svg%3E")`

  const overrides = `.s-panel {
  /* ── Roles (shade/accent axes) ── */
  --bg: ${bg};
  --ink: ${ink};
  --ink-rgb: ${inkRGB};
  --paper: ${paper};
  --accent: ${acc};
  --accent-soft: color-mix(in oklab, var(--accent), var(--paper) 65%);
  --s-clear-icon: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' stroke='${encodeURIComponent(ink)}' stroke-width='2.5' stroke-linecap='square'%3E%3Cpath d='M3 3 L13 13 M13 3 L3 13'/%3E%3C/svg%3E");
  color-scheme: ${dark ? 'dark' : 'light'};

  /* ── Scale ── */
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: 0;
  --r: 0;
  --u: ${4 * size}px;
  --h: calc(var(--u) * 9);            /* one control height */
  --box: calc(var(--u) * 7);           /* checkbox / knob square */

  /* ── Border weight (bevel axis) ── */
  --bw: ${bevel}px;

  /* ── Hard shadow (offset axis) ── */
  --offset: ${offset}px;
  --lift: calc(var(--offset) * 2 / 3);  /* control-level plate throw */
  --press: calc(var(--offset) / 3);      /* sunken groove / thumb throw */
  --plate: ${plate(offset * 4 / 3)};
  --plate-sm: ${plate(offset * 2 / 3)};
  --plate-hover: ${plate(offset)};
  --plate-xs: ${plate(offset / 3)};
  --groove: inset var(--press) var(--press) 0 rgba(var(--ink-rgb), .14);
  --focus-gap: 3px;

  /* ── Grain (texture axis) ── */
  --grain-bg: ${halftone(.05)};
  --grain-btn: ${halftone(.08)};

  background: var(--bg);
  background-image: var(--grain-bg);
  color: var(--ink);
  --font: 'Space Grotesk', 'Archivo', ui-sans-serif, system-ui, sans-serif;
  font-family: var(--font);
  font-weight: ${weight};
  border: var(--bw) solid var(--ink);
  border-radius: 0;
  box-shadow: var(--plate);
  padding: calc(var(--u) * (3 + 2 * var(--spacing)));
  min-width: 0;
  max-width: calc(var(--u) * 110);
  position: relative;
  -webkit-font-smoothing: antialiased;

  /* ── Header ── */
  > summary, > .s-panel-title {
    font-weight: 700;
    font-size: 1.75em;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: -0.03em;
    gap: calc(var(--u) * 2.5);
    min-height: var(--h);
    padding-bottom: calc(var(--u) * 3);
    border-bottom: var(--bw) solid var(--ink);
    &::after { display: none; }
  }
  > summary { cursor: pointer; user-select: none; }
  > summary:focus-visible { outline: none; .s-fold-icon { outline: var(--bw) solid var(--accent); outline-offset: var(--focus-gap); } }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: calc(var(--u) * (2 + 2 * var(--spacing))); }
  .s-panel-content { gap: calc(var(--u) * (1.5 + 2 * var(--spacing))); }

  /* square plate buttons in the header: fold + search */
  .s-fold-icon, .s-search-btn {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: calc(var(--u) * 9); height: calc(var(--u) * 9); padding: 0;
    border: var(--bw) solid var(--ink); background: var(--paper); color: var(--ink);
    box-shadow: var(--plate-sm);
    -webkit-mask: none; mask: none;
    transition: transform .08s, box-shadow .08s, background-color .08s;
    &:hover { background: var(--accent-soft); }
    &:active { transform: translate(var(--lift), var(--lift)); box-shadow: none; }
  }
  .s-fold-icon { margin-left: auto; order: 2; cursor: pointer;
    :has(> .s-search) > & { margin-left: 0; }
    i { display: block; width: 45%; height: 45%; background: var(--ink); -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; transition: transform .12s; } }
  &[open] .s-fold-icon i { transform: rotate(180deg); }
  > summary:active .s-fold-icon { transform: translate(var(--lift), var(--lift)); box-shadow: none; }

  &.s-searching > summary, &.s-searching > .s-panel-title { flex-wrap: wrap; }

  /* ── Search ── */
  .s-search { order: 1; margin-left: auto; gap: 0; font-size: 1rem; letter-spacing: 0; text-transform: none; }
  .s-search-btn { position: relative;
    &::before { content: ''; width: 50%; height: 50%; background: var(--ink); -webkit-mask: var(--s-search-icon) center / contain no-repeat; mask: var(--s-search-icon) center / contain no-repeat; }
    &:focus-visible { outline: var(--bw) solid var(--accent); outline-offset: var(--focus-gap); } }
  &.s-searching .s-search-btn { background: var(--accent); transform: translate(var(--lift), var(--lift)); box-shadow: none; }
  .s-search-input {
    border: var(--bw) solid var(--ink); background: var(--paper); color: var(--ink);
    padding: 0 calc(var(--u) * 2); height: calc(var(--u) * 9); width: calc(var(--u) * 32); margin-left: calc(var(--u) * 2);
    font-weight: 600;
    &::placeholder { color: color-mix(in oklab, var(--ink), transparent 55%); }
    &:focus-visible { outline: none; box-shadow: var(--plate-sm); }
    &::-webkit-search-decoration, &::-webkit-search-results-button, &::-webkit-search-results-decoration { display: none; }
    &::-webkit-search-cancel-button {
      -webkit-appearance: none; appearance: none;
      width: .8em; height: .8em; margin-left: calc(var(--u) * 1.5);
      background: var(--ink);
      -webkit-mask: var(--s-clear-icon) center / contain no-repeat;
      mask: var(--s-clear-icon) center / contain no-repeat;
      cursor: pointer;
      &:hover { background: var(--accent); }
    }
  }

  /* ── Rows ── */
  .s-control { align-items: center; gap: calc(var(--u) * 4); }
  .s-label { font-weight: 700; }
  .s-label-group { min-width: 0; width: 32%; }
  .s-hint { opacity: .65; font-weight: 500; }
  .s-title {
    display: inline-flex; align-items: center; justify-content: center;
    width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5);
    border: 2px solid var(--ink); font-size: 10px; font-weight: 700; line-height: 1; cursor: help;
    &:hover + .s-title-text { opacity: 1; visibility: visible; }
  }
  .s-title-text {
    position: absolute; left: 0; top: 100%; margin-top: var(--u);
    padding: calc(var(--u) * 2); font-size: smaller; font-weight: 600;
    background: var(--ink); color: var(--paper);
    width: max-content; max-width: 30ch; z-index: 10;
    opacity: 0; visibility: hidden; pointer-events: none;
  }

  /* ── Fields ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--paper);
    color: var(--ink);
    border: var(--bw) solid var(--ink);
    border-radius: 0;
    font: inherit;
    font-weight: 600;
    transition: box-shadow .08s, background-color .08s;
    &::placeholder { color: color-mix(in oklab, var(--ink), transparent 55%); font-weight: 500; }
    &:focus-visible { outline: none; box-shadow: var(--plate-sm); }
  }
  input[type="text"], input[type="number"], select { height: var(--h); padding: 0 calc(var(--u) * 3); }
  textarea { padding: calc(var(--u) * 2) calc(var(--u) * 3); }
  input[type="number"] { font-variant-numeric: tabular-nums; }
  input.s-scrubbing { background: var(--accent-soft); box-shadow: var(--groove); }
  select { cursor: pointer; appearance: none; -webkit-appearance: none;
    background-image: ${chevron}; background-repeat: no-repeat; background-position: right calc(var(--u) * 3) center; background-size: calc(var(--u) * 3);
    padding-right: calc(var(--u) * 9);
    option { background: var(--paper); color: var(--ink); } }

  /* ── Number ── */
  .s-number {
    .s-input { gap: 0; }
    input[type="number"] { flex: 1; text-align: right; cursor: ew-resize; -moz-appearance: textfield;
      &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      &:focus { cursor: text; } }
    .s-step { flex-direction: column; gap: 0; height: var(--h); margin-left: calc(var(--bw) * -1);
      button { flex: 1; width: calc(var(--u) * 8); padding: 0; display: grid; place-items: center; background: var(--paper); border: var(--bw) solid var(--ink); color: var(--ink); font-size: .55em; line-height: 1; cursor: pointer;
        &:first-child { margin-bottom: calc(var(--bw) * -1); }
        &:hover { background: var(--accent-soft); }
        &:active { background: var(--accent); }
        &:focus-visible { outline: var(--bw) solid var(--accent); outline-offset: calc(var(--bw) * -1); z-index: 1; position: relative; } } }
  }

  /* ── Vector ── */
  .s-vector {
    .s-vec-axis { height: var(--h); gap: 0; min-width: calc(var(--u) * 16); border: var(--bw) solid var(--ink); background: var(--paper);
      &:focus-within { box-shadow: var(--plate-sm); } }
    .s-vec-label { width: calc(var(--u) * 6); height: 100%; display: grid; place-items: center; background: var(--ink); color: var(--paper); font-weight: 700; font-size: .75em; opacity: 1; }
    input[type="number"] { height: 100%; border: none; padding: 0 calc(var(--u) * 2); &:focus-visible { box-shadow: none; } }
  }

  /* ── Buttons ── */
  button { font: inherit; font-weight: 700; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(var(--u) * 3); }
    button {
      flex: 1;
      min-height: var(--h);
      background: var(--accent);
      background-image: var(--grain-btn);
      color: var(--ink);
      border: var(--bw) solid var(--ink);
      border-radius: 0;
      text-transform: uppercase;
      letter-spacing: .04em;
      padding: 0 calc(var(--u) * 3);
      min-width: 0;
      box-shadow: var(--plate-sm);
      transition: transform .08s, box-shadow .08s;
      &:hover { transform: translate(-1px, -1px); box-shadow: var(--plate-hover); }
      &:active { transform: translate(var(--lift), var(--lift)); box-shadow: none; }
      &:disabled, &[aria-busy="true"] { background: var(--paper); color: color-mix(in oklab, var(--ink), transparent 50%); box-shadow: none; transform: none; cursor: not-allowed; }
      &:focus-visible { outline: var(--bw) solid var(--accent); outline-offset: var(--focus-gap); }
    }
    &.s-secondary button, button.s-secondary { background: var(--paper); background-image: none; }
  }

  /* ── Boolean ── */
  .s-boolean {
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { cursor: pointer; }
    &.s-switch {
      .s-track {
        width: calc(var(--u) * 15); height: calc(var(--u) * 8);
        background: var(--paper); border: var(--bw) solid var(--ink); position: relative;
        box-shadow: var(--groove);
        transition: background-color .12s;
        &::after { content: ''; position: absolute; top: calc(var(--u) * 0.75); left: calc(var(--u) * 0.75); width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5); background: var(--ink); transition: transform .15s cubic-bezier(.3, 1.2, .5, 1); }
      }
      &:has(input:checked) .s-track { background: var(--accent); &::after { transform: translateX(calc(var(--u) * 7)); } }
      &:hover .s-track { background: var(--accent-soft); }
      &:hover:has(input:checked) .s-track { background: var(--accent); }
      &:has(input:focus-visible) .s-track { outline: var(--bw) solid var(--accent); outline-offset: var(--focus-gap); }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: var(--box); height: var(--box); background: var(--paper); border: var(--bw) solid var(--ink); box-shadow: var(--groove); transition: background-color .12s;
        &::after { content: ''; width: 60%; height: 55%; background: var(--ink); -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; opacity: 0; transform: scale(.6); transition: opacity .1s, transform .12s; } }
      &:hover .s-track { background: var(--accent-soft); }
      &:has(input:checked) .s-track { background: var(--accent); &::after { opacity: 1; transform: none; } }
      &:has(input:focus-visible) .s-track { outline: var(--bw) solid var(--accent); outline-offset: var(--focus-gap); }
    }
    &.s-toggle {
      .s-track { padding: 0 calc(var(--u) * 4); background: var(--paper); border: var(--bw) solid var(--ink); height: var(--h);
        display: flex; align-items: center; justify-content: center; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; cursor: pointer;
        box-shadow: var(--plate-sm); transition: transform .08s, box-shadow .08s;
        &::after { content: 'Off'; } }
      .s-input:active .s-track { transform: translate(var(--lift), var(--lift)); box-shadow: none; }
      &:has(input:checked) .s-track { background: var(--accent); &::after { content: 'On'; } }
      &:has(input:focus-visible) .s-track { outline: var(--bw) solid var(--accent); outline-offset: var(--focus-gap); }
    }
  }

  /* ── Slider — thick bordered track, accent fill, square thumb ── */
  .s-slider {
    --track-h: calc(var(--u) * 7);
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(var(--u) * 4); }
    .s-track { height: var(--h); margin: 0; }
    input[type="range"] {
      width: 100%; height: var(--track-h); -webkit-appearance: none; appearance: none;
      background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--paper) var(--p, 0%));
      border: var(--bw) solid var(--ink); cursor: ew-resize;
      box-shadow: var(--groove);
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(var(--u) * 5); height: calc(var(--track-h) - var(--bw) * 2); background: var(--paper); border: var(--bw) solid var(--ink); box-shadow: inset var(--press) var(--press) 0 rgba(var(--ink-rgb), .14); cursor: ew-resize; }
      &::-moz-range-thumb { width: calc(var(--u) * 5); height: calc(var(--track-h) - var(--bw) * 2); background: var(--paper); border: var(--bw) solid var(--ink); border-radius: 0; cursor: ew-resize; }
      &:hover::-webkit-slider-thumb { background: var(--accent-soft); }
      &:active::-webkit-slider-thumb { background: var(--ink); }
      &:active::-moz-range-thumb { background: var(--ink); }
      &:focus-visible { outline: var(--bw) solid var(--accent); outline-offset: var(--focus-gap); }
    }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-marks { display: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, -2px); font-size: .7em; font-weight: 700; white-space: nowrap; &.s-active { color: var(--accent); -webkit-text-stroke: .4px var(--ink); } }
    .s-readout { flex: 0 0 auto; min-width: 6ch; text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; height: auto; padding: 0; background: transparent; border: none; color: var(--ink); cursor: ew-resize;
      &:focus-visible { box-shadow: none; outline: var(--bw) solid var(--accent); outline-offset: 2px; }
      &.s-scrubbing { background: var(--accent-soft); box-shadow: none; } }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); margin-bottom: var(--u); background: var(--ink); color: var(--paper); padding: 2px 8px; font-weight: 700; white-space: nowrap; }
    &.s-multiple .s-interval-track {
      height: var(--track-h); margin: calc((var(--h) - var(--track-h)) / 2) 0; background: var(--paper); border: var(--bw) solid var(--ink); position: relative;
      box-shadow: var(--groove);
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); }
      input[type="range"] { border: none; background: transparent; box-shadow: none; height: 100%; }
    }
  }

  /* ── Select variants ── */
  .s-select {
    &.s-dropdown select { flex: 1; }
    &.s-segmented {
      .s-input { gap: 0; box-shadow: var(--plate-sm); }
      button { flex: 1; height: var(--h); display: flex; align-items: center; justify-content: center; background: var(--paper); border: var(--bw) solid var(--ink); margin-left: calc(-1 * var(--bw)); color: var(--ink); text-transform: uppercase; letter-spacing: .04em; padding: 0 var(--u);
        position: relative; transition: background-color .08s;
        &:first-child { margin-left: 0; }
        &:hover { background: var(--accent-soft); }
        &.s-selected { background: var(--accent); box-shadow: var(--groove); z-index: 1; }
        &:focus-visible { outline: var(--bw) solid var(--accent); outline-offset: calc(var(--bw) * -1); z-index: 2; } }
    }
    &.s-radio, &.s-checkboxes {
      align-items: flex-start;
      .s-label-group { min-height: var(--box); justify-content: center; }
      .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * 2); }
      .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 2.5); cursor: pointer; font-weight: 600; min-height: var(--box); }
    }
    &.s-radio input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; width: var(--box); height: var(--box); border-radius: 50%; background: var(--paper); border: var(--bw) solid var(--ink); box-shadow: var(--groove); display: grid; place-items: center; cursor: pointer; flex-shrink: 0;
      &::after { content: ''; width: 45%; height: 45%; border-radius: 50%; background: var(--ink); opacity: 0; transform: scale(.5); transition: opacity .1s, transform .12s; }
      &:checked { background: var(--accent); &::after { opacity: 1; transform: none; } }
      &:focus-visible { outline: var(--bw) solid var(--accent); outline-offset: var(--focus-gap); } }
    &.s-checkboxes {
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: grid; place-items: center; width: var(--box); height: var(--box); flex-shrink: 0; background: var(--paper); border: var(--bw) solid var(--ink); box-shadow: var(--groove); transition: background-color .12s;
        &::after { content: ''; width: 60%; height: 55%; background: var(--ink); -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; opacity: 0; transform: scale(.6); transition: opacity .1s, transform .12s; } }
      .s-input label:hover .s-track { background: var(--accent-soft); }
      .s-input label:has(input:checked) .s-track { background: var(--s-color, var(--accent)); &::after { opacity: 1; transform: none; } }
      .s-input label:has(input:focus-visible) .s-track { outline: var(--bw) solid var(--accent); outline-offset: var(--focus-gap); }
    }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input {
      gap: 0;
      input[type="color"] { position: static; flex: none; width: var(--h); height: var(--h); padding: 0; border: var(--bw) solid var(--ink); cursor: pointer;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; }
        &:focus-visible { outline: none; box-shadow: var(--plate-sm); z-index: 1; position: relative; } }
      input[type="text"] { flex: 1; min-width: 0; margin-left: calc(var(--bw) * -1); font-family: ui-monospace, 'SF Mono', monospace; font-size: .95em; }
    }
    &.s-rgba .s-color-input {
      gap: calc(var(--u) * 2);
      input[type="color"] { width: var(--h); height: var(--h); border: var(--bw) solid var(--ink);
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } }
      .s-alpha { height: calc(var(--u) * 4); border: var(--bw) solid var(--ink); border-radius: 0;
        &::-webkit-slider-thumb { width: calc(var(--u) * 3.5); height: calc(var(--u) * 3.5); border-radius: 0; background: var(--paper); border: 2px solid var(--ink); }
        &::-moz-range-thumb { width: calc(var(--u) * 3.5); height: calc(var(--u) * 3.5); border-radius: 0; background: var(--paper); border: 2px solid var(--ink); } }
      input[type="text"] { font-family: ui-monospace, 'SF Mono', monospace; font-size: .95em; }
    }
    &.s-swatches {
      .s-input { flex-wrap: wrap; gap: calc(var(--u) * 2.5); }
      button { width: var(--box); height: var(--box); padding: 0; border: var(--bw) solid var(--ink);
        box-shadow: var(--plate-xs); transition: transform .06s, box-shadow .06s;
        &:hover { transform: translate(-1px, -1px); box-shadow: var(--plate-sm); }
        &:active { transform: translate(var(--press), var(--press)); box-shadow: none; }
        &.s-selected { transform: translate(var(--press), var(--press)); box-shadow: none; outline: var(--bw) solid var(--ink); outline-offset: var(--focus-gap); }
        &:focus-visible { outline: var(--bw) solid var(--accent); outline-offset: var(--focus-gap); } }
    }
  }

  /* ── Text / Textarea ── */
  .s-text input[type="text"] { flex: 1; }
  .s-textarea {
    align-items: flex-start;
    .s-label-group { padding-top: calc(var(--u) * 2.5); }
    textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(var(--lh) * 3 + var(--u) * 4); max-height: 50vh; }
    &.s-code textarea { font-family: ui-monospace, 'SF Mono', monospace; font-size: .9em; }
  }

  /* ── Info / separator ── */
  .s-info .s-monitor { font-weight: 700; opacity: 1; }
  .s-separator { height: var(--bw); background: var(--ink); opacity: 1; margin: calc(var(--u) * 0.5) 0; }
  .s-separator-labeled { height: auto; background: none; &::before, &::after { height: var(--bw); background: var(--ink); opacity: 1; } }
  .s-separator-label { font-weight: 700; text-transform: uppercase; letter-spacing: .06em; opacity: 1; font-size: .75em; }

  /* ── XY pad / knob ── */
  .s-xy { align-items: flex-start; .s-label-group { padding-top: calc(var(--u) * 2); } }
  .s-pad { background: var(--paper); border: var(--bw) solid var(--ink); border-radius: 0; box-shadow: var(--groove);
    .s-pad-x, .s-pad-y { background: color-mix(in oklab, var(--ink), transparent 75%); }
    .s-pad-dot { border-radius: 0; background: var(--accent); border: 2px solid var(--ink); box-shadow: none; width: calc(var(--u) * 4); height: calc(var(--u) * 4); } }
  .s-knob-dial { width: var(--h); height: var(--h); background: var(--paper); border: var(--bw) solid var(--ink); box-shadow: var(--plate-xs);
    i { background: var(--ink); width: 3px; border-radius: 0; } }
  .s-knob-val { font-weight: 700; opacity: 1; }

  /* ── Folder ── */
  .s-folder {
    > summary { font-weight: 700; text-transform: uppercase; letter-spacing: .04em; min-height: calc(var(--u) * 9); padding: 0; border-bottom: var(--bw) solid var(--ink); gap: calc(var(--u) * 2);
      &:hover { color: color-mix(in oklab, var(--ink), var(--accent) 40%); }
      &::after { content: ''; width: calc(var(--u) * 3.5); height: calc(var(--u) * 3.5); margin-left: auto; background: currentColor; -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; transition: transform .12s; }
      &:focus-visible { outline: var(--bw) solid var(--accent); outline-offset: var(--focus-gap); } }
    &[open] > summary::after { transform: rotate(180deg); }
    .s-content { gap: calc(var(--u) * (1.5 + 2 * var(--spacing))); padding: calc(var(--u) * 4) 0 calc(var(--u) * 2); }
    &.s-section > summary { pointer-events: none; &::after { display: none; } }
  }
}`

  return baseCSS + '\n' + overrides
}
