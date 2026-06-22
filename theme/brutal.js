/**
 * Brutal theme — neobrutalism
 *
 * Hard offset shadows (no blur), thick black borders, zero radius, flat saturated
 * fills. Raw, confrontational, playful. Iconic of Gumroad-era web brutalism.
 *
 * brutal(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveRoles } from './color.js'
import { hardShadow } from './mixins.js'

export default function brutal({
  shade = '#fbe8a6',
  accent = '#ff5a5f',
  spacing = 1,
  weight = 700,
  bevel = 3,            // border thickness in px (brutal-specific)
  size = 1,
} = {}) {
  const { dark, bg, fg, accent: acc } = resolveRoles(shade, accent)
  const ink = dark ? '#ffffff' : '#000000'
  const paper = dark ? 'oklch(from var(--bg) calc(l + 0.07) c h)' : '#ffffff'
  const bw = `${bevel}px`
  const sh = (x, y) => hardShadow(`${x}px`, `${y}px`, 'var(--ink)')

  const overrides = `.s-panel {
  --bg: ${bg};
  --ink: ${ink};
  --paper: ${paper};
  --accent: ${acc};
  --bw: ${bw};
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: 0;
  --r: 0;
  --u: ${4 * size}px;
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--bg);
  color: var(--ink);
  font-family: ui-sans-serif, system-ui, 'Helvetica Neue', sans-serif;
  font-weight: ${weight};
  border: var(--bw) solid var(--ink);
  border-radius: 0;
  box-shadow: ${sh(6, 6)};
  padding: calc(var(--u) * (2 + 2 * var(--spacing)));
  min-width: 26ch;
  max-width: calc(var(--u) * 110);

  /* ── Header ── */
  > summary, > .s-panel-title {
    font-weight: 800;
    font-size: 1.4rem;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    &::after { display: none; }
  }
  > summary {
    cursor: pointer;
    &::before {
      content: '▸';
      display: inline-block;
      margin-right: calc(var(--u) * 2);
      transition: transform .12s;
    }
  }
  &[open] > summary::before { transform: rotate(90deg); }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: calc(var(--u) * (1 + 2 * var(--spacing)));
  }

  /* ── Labels ── */
  .s-label { font-weight: 700; }
  .s-hint { opacity: .7; font-weight: 500; }
  .s-title {
    display: inline-flex; align-items: center; justify-content: center;
    width: calc(var(--u) * 4); height: calc(var(--u) * 4);
    border: 2px solid var(--ink); font-size: 10px; font-weight: 800; cursor: help;
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
    &::placeholder { color: color-mix(in oklab, var(--ink), transparent 55%); }
    &:focus-visible { outline: none; box-shadow: ${sh(3, 3)}; }
  }
  input[type="text"], input[type="number"], select {
    height: calc(1lh + var(--pad) * 2);
  }
  select { cursor: pointer; option { background: var(--paper); color: var(--ink); } }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield;
      &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-step { display: flex; flex-direction: column; border: var(--bw) solid var(--ink); margin-left: -1px;
      button { background: var(--paper); border: none; color: var(--ink); padding: 0 calc(var(--u) * 1.5); font-weight: 800; cursor: pointer; line-height: 1;
        &:first-child { border-bottom: 2px solid var(--ink); }
        &:hover { background: var(--accent); } } }
  }

  /* ── Buttons ── */
  button { font: inherit; font-weight: 800; cursor: pointer; }
  .s-button {
    button {
      width: 100%;
      background: var(--accent);
      color: var(--ink);
      border: var(--bw) solid var(--ink);
      border-radius: 0;
      text-transform: uppercase;
      letter-spacing: .02em;
      padding: calc(var(--u) * (1 + var(--spacing))) calc(var(--pad) * 2);
      box-shadow: ${sh(4, 4)};
      transition: transform .08s, box-shadow .08s;
      &:hover { transform: translate(-1px, -1px); box-shadow: ${sh(5, 5)}; }
      &:active { transform: translate(4px, 4px); box-shadow: ${sh(0, 0)}; }
      &:disabled { opacity: .4; box-shadow: none; cursor: not-allowed; }
      &:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }
    }
    &.s-secondary button, button.s-secondary { background: var(--paper); }
    .s-input { gap: calc(var(--u) * 2); }
  }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { cursor: pointer; }
    &.s-switch {
      .s-track {
        width: 44px; height: 24px;
        background: var(--paper); border: var(--bw) solid var(--ink); border-radius: 0; position: relative;
        &::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: var(--ink); transition: transform .12s; }
      }
      &:has(input:checked) .s-track { background: var(--accent); &::after { transform: translateX(20px); } }
      &:has(input:focus-visible) .s-track { outline: 3px solid var(--ink); outline-offset: 2px; }
    }
    &.s-checkbox {
      .s-track { display: block; width: calc(var(--u) * 5); height: calc(var(--u) * 5); background: var(--paper); border: var(--bw) solid var(--ink); position: relative;
        &::after { content: ''; position: absolute; inset: 2px; background: transparent; } }
      &:has(input:checked) .s-track::after { background: var(--accent); }
      &:has(input:focus-visible) .s-track { outline: 3px solid var(--ink); outline-offset: 2px; }
    }
    &.s-toggle {
      .s-track { padding: var(--pad) calc(var(--pad) * 2); background: var(--paper); border: var(--bw) solid var(--ink); height: calc(1lh + var(--pad) * 2);
        display: flex; align-items: center; justify-content: center; font-weight: 800; text-transform: uppercase; cursor: pointer;
        &::after { content: 'Off'; } }
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
      background: var(--paper); border: var(--bw) solid var(--ink); cursor: ew-resize;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(var(--u) * 4); height: calc(var(--u) * 5 - 2px); background: var(--accent); border: var(--bw) solid var(--ink); margin-top: -1px; cursor: ew-resize; }
      &::-moz-range-thumb { width: calc(var(--u) * 4); height: calc(var(--u) * 5); background: var(--accent); border: var(--bw) solid var(--ink); border-radius: 0; cursor: ew-resize; }
      &:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }
    }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-marks { display: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 4px); font-size: smaller; font-weight: 600; white-space: nowrap; }
    .s-readout { flex: 0 0 auto; min-width: 6ch; text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; padding-left: var(--pad); background: transparent; border: none; color: var(--ink); }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); margin-bottom: var(--u); background: var(--ink); color: var(--paper); padding: 2px 6px; font-weight: 700; white-space: nowrap; }
    &.s-multiple .s-interval-track {
      height: calc(var(--u) * 5); margin: calc(var(--u) * var(--spacing)) 0; background: var(--paper); border: var(--bw) solid var(--ink); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); }
    }
  }

  /* ── Select variants ── */
  .s-select {
    &.s-dropdown select { flex: 1; }
    &.s-segmented {
      .s-input { gap: 0; }
      button { flex: 1; background: var(--paper); border: var(--bw) solid var(--ink); margin-left: calc(-1 * var(--bw)); color: var(--ink); text-transform: uppercase; padding: var(--pad);
        &:first-child { margin-left: 0; }
        &:hover { background: color-mix(in oklab, var(--accent), var(--paper) 60%); }
        &.s-selected { background: var(--accent); } }
    }
    &.s-radio {
      .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * var(--spacing)); }
      label { display: flex; align-items: center; gap: calc(var(--u) * 2); cursor: pointer; font-weight: 600; }
    }
    &.s-checkboxes {
      .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * var(--spacing)); }
      label { display: flex; align-items: center; gap: calc(var(--u) * 2); cursor: pointer; font-weight: 600; }
      .s-track { width: calc(var(--u) * 5); height: calc(var(--u) * 5); flex-shrink: 0; background: var(--paper); border: var(--bw) solid var(--ink); position: relative;
        &::after { content: ''; position: absolute; inset: 2px; background: transparent; } }
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      label:has(input:checked) .s-track::after { background: var(--accent); }
    }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input {
      gap: var(--u);
      input[type="color"] { position: static; width: calc(var(--u) * 8); height: calc(1lh + var(--pad) * 2); padding: 0; border: var(--bw) solid var(--ink); cursor: pointer;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } }
      input[type="text"] { flex: 1; min-width: 0; font-family: ui-monospace, monospace; }
    }
    &.s-swatches {
      .s-input { flex-wrap: wrap; gap: var(--u); }
      button { width: calc(var(--u) * 6); height: calc(var(--u) * 6); padding: 0; border: var(--bw) solid var(--ink);
        &.s-selected { outline: 3px solid var(--ink); outline-offset: 2px; } }
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
      &::after { content: '+'; margin-left: auto; font-size: 1.2em; } }
    &[open] > summary { border-bottom: none; &::after { content: '–'; } }
    .s-content { padding: calc(var(--u) * 2 * var(--spacing)) 0; }
  }
}`

  return baseCSS + '\n' + overrides
}
