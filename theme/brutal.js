/**
 * Brutal theme — skeuomorphic neobrutalism
 *
 * Material: raw print/concrete, not plastic. Stamped plates stacked on paper —
 * thick uniform ink borders, hard offset shadows layered like cut card stock,
 * halftone grain, pressed states that visibly displace (translate + shadow
 * collapse to zero, exact to the shadow offset). Zero radius, zero blur.
 *
 * Axes: shade/accent (roles), spacing, weight, bevel (border/outline weight),
 * offset (hard-shadow displacement — plate depth, press distance), grain
 * (halftone texture intensity, 0 disables), size (unit scale).
 *
 * brutal(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveRoles } from './color.js'

export default function brutal({
  shade = '#fbe8a6',
  accent = '#ff5a5f',
  spacing = 1,
  weight = 700,
  bevel = 3,             // border/outline weight in px
  offset = 6,             // hard-shadow displacement in px (plate depth, press distance)
  grain = 1,              // halftone texture intensity, 0 disables
  size = 1,
} = {}) {
  const { dark, bg, accent: acc } = resolveRoles(shade, accent)
  const ink = dark ? '#ffffff' : '#000000'
  const inkRGB = dark ? '255,255,255' : '0,0,0'
  const paper = dark ? 'oklch(from var(--bg) calc(l + 0.07) c h)' : '#fffdf8'

  // Hard offset shadow — solid ink, zero blur, zero transparency. The plate
  // sits stacked on the page like cut card stock, not floating above it, so
  // the shadow is a flat solid color, never a soft/translucent cast.
  // d = base offset in px; scales down for smaller elements via `s`.
  const plate = (d, s = 1) => `${+(d * s).toFixed(1)}px ${+(d * s).toFixed(1)}px 0 var(--ink)`

  // Halftone grain — coarse monochrome dot screen, print-registration feel.
  // Two offset dot layers at slightly different scale = subtle moiré, like
  // a stamped plate that's been inked and pressed onto stock. `grain` axis
  // scales dot opacity; 0 disables the texture entirely.
  const halftone = (a) => grain <= 0 ? 'none' : `image-set(url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Ccircle cx='1.5' cy='1.5' r='.7' fill='rgba(${inkRGB},${+(a * grain).toFixed(3)})'/%3E%3Ccircle cx='4.5' cy='4.5' r='.7' fill='rgba(${inkRGB},${+(a * grain).toFixed(3)})'/%3E%3C/svg%3E") 1x)`

  const overrides = `.s-panel {
  /* ── Roles (shade/accent axes) ── */
  --bg: ${bg};
  --ink: ${ink};
  --ink-rgb: ${inkRGB};
  --paper: ${paper};
  --accent: ${acc};
  --s-clear-icon: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' stroke='${encodeURIComponent(ink)}' stroke-width='2.5' stroke-linecap='square'%3E%3Cpath d='M3 3 L13 13 M13 3 L3 13'/%3E%3C/svg%3E");
  color-scheme: ${dark ? 'dark' : 'light'};

  /* ── Scale ── */
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: 0;
  --r: 0;
  --u: ${4 * size}px;

  /* ── Border/outline weight (bevel axis) ── */
  --bw: ${bevel}px;
  --bw-sm: calc(var(--bw) * 2 / 3);

  /* ── Hard shadow (offset axis) — plate stacked on paper, zero blur ── */
  --offset: ${offset}px;
  --plate-1: ${plate(offset)};
  --plate-hover: ${plate(offset + 1)};
  --plate-sm: ${plate(offset / 2, 0.75)};
  --press-sm: calc(var(--offset) / 3);
  --groove: inset var(--press-sm) var(--press-sm) 0 rgba(var(--ink-rgb), .12);
  --hover-lift: -1px;
  --focus-gap: 2px;
  --thumb-trim: 2px;

  /* ── Grain (texture axis) ── */
  --grain-bg: ${halftone(.05)};
  --grain-btn: ${halftone(.08)};

  background: var(--bg);
  background-image: var(--grain-bg);
  background-repeat: repeat;
  color: var(--ink);
  font-family: ui-sans-serif, system-ui, 'Helvetica Neue', sans-serif;
  font-weight: ${weight};
  border: var(--bw) solid var(--ink);
  border-radius: 0;
  box-shadow: var(--plate-1);
  padding: calc(var(--u) * (2 + 2 * var(--spacing)));
  min-width: 26ch;
  max-width: calc(var(--u) * 110);
  position: relative;
  -webkit-font-smoothing: antialiased;

  /* ── Header ── */
  > summary, > .s-panel-title {
    font-weight: 900;
    font-size: 1.5rem;
    text-transform: uppercase;
    letter-spacing: -0.03em;
    padding-bottom: calc(var(--u) * 2);
    margin-bottom: calc(var(--u) * (1 + 2 * var(--spacing)));
    border-bottom: var(--bw) solid var(--ink);
    &::after { display: none; }
  }
  > summary {
    cursor: pointer;
    user-select: none;
    &:hover { background: rgba(var(--ink-rgb),.06); }
    &::before {
      content: '▸';
      display: inline-block;
      margin-right: calc(var(--u) * 2);
      transition: transform .12s;
    }
  }
  &[open] > summary::before { transform: rotate(90deg); }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: 0;
  }
  > summary:focus-visible { outline: var(--bw) solid var(--accent); outline-offset: calc(var(--bw) * -1); }

  /* ── Fold icon / search (title-bar controls) ── */
  .s-fold-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: calc(var(--u) * 6); height: calc(var(--u) * 6);
    margin-left: auto; flex-shrink: 0;
    border: var(--bw-sm) solid var(--ink); background: var(--paper);
    box-shadow: var(--plate-sm);
    transition: transform .08s, box-shadow .08s;
    &:hover { background: color-mix(in oklab, var(--accent), var(--paper) 60%); }
    i { display: inline-block; font-style: normal; font-size: 1.1em; font-weight: 900; line-height: 1;
      &::before { content: '+'; } }
  }
  &[open] .s-fold-icon i::before { content: '–'; }
  > summary:active .s-fold-icon, .s-fold-icon:active { transform: translate(var(--press-sm), var(--press-sm)); box-shadow: none; }
  > summary:focus-visible .s-fold-icon { outline: var(--bw) solid var(--accent); outline-offset: var(--focus-gap); }

  .s-search {
    margin-left: auto;
    flex-shrink: 0;
    input, button { font-family: inherit; font-size: 1rem; font-weight: 700; }
  }
  .s-fold-icon + .s-search { margin-left: calc(var(--u) * 3); }
  .s-search-btn {
    width: calc(var(--u) * 6); height: calc(var(--u) * 6); flex-shrink: 0;
    border: var(--bw-sm) solid var(--ink); background: var(--paper);
    box-shadow: var(--plate-sm);
    transition: transform .08s, box-shadow .08s;
    -webkit-mask: none; mask: none;
    position: relative;
    &:hover { background: color-mix(in oklab, var(--accent), var(--paper) 60%); }
    &:active { transform: translate(var(--press-sm), var(--press-sm)); box-shadow: none; }
    &:focus-visible { outline: var(--bw) solid var(--ink); outline-offset: var(--focus-gap); }
    &::before {
      content: ''; position: absolute; inset: 0;
      background: var(--ink);
      -webkit-mask: var(--s-search-icon) center / 55% no-repeat;
      mask: var(--s-search-icon) center / 55% no-repeat;
    }
  }
  &.s-searching .s-search-btn { background: var(--accent); transform: translate(var(--press-sm), var(--press-sm)); box-shadow: none; }
  .s-search-input {
    border: var(--bw) solid var(--ink); background: var(--paper); color: var(--ink);
    padding: 0 calc(var(--u) * 1.5); height: calc(var(--u) * 6);
    width: calc(var(--u) * 30); margin-left: var(--u);
    &::placeholder { color: color-mix(in oklab, var(--ink), transparent 55%); font-weight: 600; }
    &:focus-visible { outline: none; box-shadow: var(--plate-sm); }
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

  /* ── Labels ── */
  .s-label { font-weight: 700; }
  .s-hint { opacity: .7; font-weight: 500; }
  .s-title {
    display: inline-flex; align-items: center; justify-content: center;
    width: calc(var(--u) * 4); height: calc(var(--u) * 4);
    border: var(--bw-sm) solid var(--ink); font-size: 10px; font-weight: 800; cursor: help;
    &:hover + .s-title-text { opacity: 1; visibility: visible; }
  }
  .s-title-text {
    position: absolute; left: 0; top: 100%; margin-top: var(--u);
    padding: calc(var(--u) * 1.5); font-size: smaller; font-weight: 600;
    background: var(--ink); color: var(--paper); border: var(--bw) solid var(--ink);
    width: max-content; max-width: 30ch; z-index: 10;
    opacity: 0; visibility: hidden; pointer-events: none;
  }

  /* ── Inputs ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--paper);
    color: var(--ink);
    border: var(--bw) solid var(--ink);
    border-radius: 0;
    font: inherit;
    font-weight: 600;
    box-shadow: inset 0 0 0 transparent;
    transition: box-shadow .08s;
    &::placeholder { color: color-mix(in oklab, var(--ink), transparent 55%); }
    &:focus-visible { outline: none; box-shadow: var(--plate-sm); }
  }
  input[type="text"], input[type="number"], select {
    height: calc(1lh + var(--pad) * 2);
  }
  input[type="number"] { font-variant-numeric: tabular-nums; }
  /* Scrub-drag: plate presses into the page, same collapse as an active button. */
  input.s-scrubbing { background: color-mix(in oklab, var(--accent), var(--paper) 60%); box-shadow: inset var(--press-sm) var(--press-sm) 0 rgba(var(--ink-rgb),.15); }
  select { cursor: pointer; option { background: var(--paper); color: var(--ink); } }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: right; cursor: ew-resize; -moz-appearance: textfield;
      &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      &:focus { cursor: text; } }
    .s-step { display: flex; flex-direction: column; border: var(--bw) solid var(--ink); margin-left: -1px;
      button { background: var(--paper); border: none; color: var(--ink); padding: 0 calc(var(--u) * 1.5); font-weight: 800; cursor: pointer; line-height: 1;
        &:first-child { border-bottom: var(--bw-sm) solid var(--ink); }
        &:hover { background: var(--accent); }
        &:active { background: color-mix(in oklab, var(--accent), black 15%); }
        &:focus-visible { outline: var(--bw) solid var(--ink); outline-offset: calc(var(--focus-gap) * -1); z-index: 1; position: relative; } } }
  }

  /* ── Buttons ── */
  button { font: inherit; font-weight: 800; cursor: pointer; }
  .s-button {
    button {
      width: 100%;
      background: var(--accent);
      background-image: var(--grain-btn);
      color: var(--ink);
      border: var(--bw) solid var(--ink);
      border-radius: 0;
      text-transform: uppercase;
      letter-spacing: .02em;
      padding: calc(var(--u) * (1 + var(--spacing))) calc(var(--pad) * 2);
      box-shadow: var(--plate-1);
      transition: transform .08s, box-shadow .08s;
      &:hover { transform: translate(var(--hover-lift), var(--hover-lift)); box-shadow: var(--plate-hover); }
      &:active { transform: translate(var(--offset), var(--offset)); box-shadow: none; }
      &:disabled { opacity: .4; box-shadow: none; cursor: not-allowed; }
      &:focus-visible { outline: var(--bw) solid var(--ink); outline-offset: var(--bw); }
    }
    &.s-secondary button, button.s-secondary { background: var(--paper); background-image: none; }
    .s-input { gap: calc(var(--u) * 2); }
  }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { cursor: pointer; }
    &.s-switch {
      .s-track {
        width: calc(var(--u) * 12); height: calc(1lh + var(--pad) * 2);
        background: var(--paper); border: var(--bw) solid var(--ink); border-radius: 0; position: relative;
        box-shadow: var(--groove);
        &::after { content: ''; position: absolute; top: var(--press-sm); left: var(--press-sm); width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5); background: var(--ink); transition: transform .12s; }
      }
      &:has(input:checked) .s-track { background: var(--accent); &::after { transform: translateX(calc(var(--u) * 5)); } }
      &:has(input:focus-visible) .s-track { outline: var(--bw) solid var(--ink); outline-offset: var(--focus-gap); }
      &:active .s-track::after { background: color-mix(in oklab, var(--ink), var(--paper) 25%); }
    }
    &.s-checkbox {
      .s-track { display: block; width: calc(var(--u) * 5); height: calc(var(--u) * 5); background: var(--paper); border: var(--bw) solid var(--ink); position: relative;
        box-shadow: var(--groove);
        &::after { content: ''; position: absolute; inset: var(--press-sm); background: transparent; } }
      &:has(input:checked) .s-track::after { background: var(--accent); }
      &:has(input:focus-visible) .s-track { outline: var(--bw) solid var(--ink); outline-offset: var(--focus-gap); }
    }
    &.s-toggle {
      .s-track { padding: var(--pad) calc(var(--pad) * 2); background: var(--paper); border: var(--bw) solid var(--ink); height: calc(1lh + var(--pad) * 2);
        display: flex; align-items: center; justify-content: center; font-weight: 800; text-transform: uppercase; cursor: pointer;
        box-shadow: var(--plate-sm); transition: transform .08s, box-shadow .08s;
        &::after { content: 'Off'; } }
      .s-input:active .s-track { transform: translate(var(--press-sm), var(--press-sm)); box-shadow: none; }
      &:has(input:checked) .s-track { background: var(--accent); &::after { content: 'On'; } }
    }
  }

  /* ── Slider ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: var(--lh); }
    .s-track { height: calc(var(--u) * 5); margin: calc(var(--u) * var(--spacing)) 0; }
    input[type="range"] {
      width: 100%; height: calc(var(--u) * 5); -webkit-appearance: none; appearance: none;
      background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--paper) var(--p, 0%));
      border: var(--bw) solid var(--ink); cursor: ew-resize;
      box-shadow: var(--groove);
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(var(--u) * 4); height: calc(var(--u) * 5 - var(--thumb-trim)); background: var(--accent); border: var(--bw) solid var(--ink); box-shadow: var(--press-sm) var(--press-sm) 0 var(--ink); margin-top: calc(var(--thumb-trim) / -2); cursor: ew-resize; }
      &::-moz-range-thumb { width: calc(var(--u) * 4); height: calc(var(--u) * 5); background: var(--accent); border: var(--bw) solid var(--ink); border-radius: 0; box-shadow: var(--press-sm) var(--press-sm) 0 var(--ink); cursor: ew-resize; }
      &:active::-webkit-slider-thumb { box-shadow: none; }
      &:active::-moz-range-thumb { box-shadow: none; }
      &:focus-visible { outline: var(--bw) solid var(--ink); outline-offset: var(--focus-gap); }
    }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-marks { display: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 4px); font-size: smaller; font-weight: 600; white-space: nowrap; }
    .s-readout { flex: 0 0 auto; min-width: 7ch; text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; padding-left: var(--pad); background: transparent; border: none; color: var(--ink); cursor: ew-resize;
      &.s-scrubbing { color: var(--ink); background: color-mix(in oklab, var(--accent), var(--paper) 82%); } }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); margin-bottom: var(--u); background: var(--ink); color: var(--paper); padding: 2px 6px; font-weight: 700; white-space: nowrap; }
    &.s-multiple .s-interval-track {
      height: calc(var(--u) * 5); margin: calc(var(--u) * var(--spacing)) 0; background: var(--paper); border: var(--bw) solid var(--ink); position: relative;
      box-shadow: var(--groove);
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); }
    }
  }

  /* ── Select variants ── */
  .s-select {
    &.s-dropdown select { flex: 1; }
    &.s-segmented {
      .s-input { gap: 0; }
      button { flex: 1; height: calc(1lh + var(--pad) * 2); display: flex; align-items: center; justify-content: center; background: var(--paper); border: var(--bw) solid var(--ink); margin-left: calc(-1 * var(--bw)); color: var(--ink); text-transform: uppercase; padding: 0 var(--pad);
        position: relative; transition: transform .06s;
        &:first-child { margin-left: 0; }
        &:hover { background: color-mix(in oklab, var(--accent), var(--paper) 60%); }
        &:active { transform: translateY(var(--press-sm)); }
        &.s-selected { background: var(--accent); box-shadow: inset 0 calc(var(--bw) * -1) 0 rgba(var(--ink-rgb),.3); z-index: 1; }
        &:focus-visible { outline: var(--bw) solid var(--ink); outline-offset: calc(var(--bw) * -2); z-index: 2; } }
    }
    &.s-radio {
      align-items: flex-start;
      .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * var(--spacing)); }
      .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 2); cursor: pointer; font-weight: 600; }
    }
    &.s-checkboxes {
      align-items: flex-start;
      .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * var(--spacing)); }
      .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 2); cursor: pointer; font-weight: 600; }
      .s-track { width: calc(var(--u) * 5); height: calc(var(--u) * 5); flex-shrink: 0; background: var(--paper); border: var(--bw) solid var(--ink); position: relative;
        box-shadow: var(--groove);
        &::after { content: ''; position: absolute; inset: var(--press-sm); background: transparent; } }
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-input label:has(input:checked) .s-track::after { background: var(--accent); }
      .s-input label:has(input:focus-visible) .s-track { outline: var(--bw) solid var(--ink); outline-offset: var(--focus-gap); }
    }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input {
      gap: var(--u);
      input[type="color"] { position: static; font: inherit; width: calc(var(--u) * 8); height: calc(1lh + var(--pad) * 2); padding: 0; border: var(--bw) solid var(--ink); cursor: pointer;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; }
        &:focus-visible { outline: none; box-shadow: var(--plate-sm); } }
      input[type="text"] { flex: 1; min-width: 0; font-family: ui-monospace, monospace; }
    }
    &.s-swatches {
      .s-input { flex-wrap: wrap; gap: var(--u); }
      button { width: calc(var(--u) * 6); height: calc(var(--u) * 6); padding: 0; border: var(--bw) solid var(--ink);
        box-shadow: var(--plate-sm); transition: transform .06s, box-shadow .06s;
        &:hover { transform: translate(var(--hover-lift), var(--hover-lift)); }
        &:active { transform: translate(var(--press-sm), var(--press-sm)); box-shadow: none; }
        &.s-selected { outline: var(--bw) solid var(--ink); outline-offset: var(--focus-gap); }
        &:focus-visible { outline: var(--bw) solid var(--accent); outline-offset: var(--focus-gap); } }
    }
  }

  /* ── Text / Textarea ── */
  .s-text input[type="text"] { flex: 1; }
  .s-textarea {
    align-items: flex-start;
    textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(var(--lh) * 3); max-height: 50vh; font-weight: 600; }
    &.s-code textarea { font-family: ui-monospace, monospace; }
  }

  /* ── Folder ── */
  .s-folder {
    > summary { font-weight: 800; text-transform: uppercase; letter-spacing: .02em; padding: calc(var(--u) * 2) 0; border-bottom: var(--bw) solid var(--ink);
      &:hover { background: rgba(var(--ink-rgb),.06); }
      &::after { content: '+'; margin-left: auto; font-size: 1.2em; }
      &:focus-visible { outline: var(--bw) solid var(--accent); outline-offset: calc(var(--bw) * -1); } }
    &[open] > summary { border-bottom: none; &::after { content: '–'; } }
    .s-content { padding: calc(var(--u) * 2 * var(--spacing)) 0; }
  }
}`

  return baseCSS + '\n' + overrides
}
