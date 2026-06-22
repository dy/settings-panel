/**
 * Neu theme — neumorphism / soft UI
 *
 * Elements extrude from a same-color surface via paired shadows (light top-left,
 * dark bottom-right). No borders; inputs are sunken (inset), buttons raised, and
 * pressed states invert the shadow. Soft, quiet, tactile plastic.
 *
 * neu(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveRoles } from './color.js'
import { neuShadow, neuInset } from './mixins.js'

export default function neu({
  shade = '#e6e7ee',
  accent,
  spacing = 1,
  weight = 500,
  roundness = 1.4,
  depth = 1,
  size = 1,
} = {}) {
  const { dark, fg, fgMuted, accent: acc } = resolveRoles(shade, accent)

  // Shadow tones derived from the surface so the effect holds on any shade.
  const dSh = `oklch(from var(--bg) calc(l - ${(0.11 * depth).toFixed(3)}) c h)`
  const lSh = `oklch(from var(--bg) calc(l + ${((dark ? 0.06 : 0.085) * depth).toFixed(3)}) c h)`
  const d = '5px', b = '11px'        // control distance / blur
  const di = '3px', bi = '6px'       // inset distance / blur
  const raised = neuShadow(d, b, dSh, lSh)
  const raisedSm = neuShadow('3px', '6px', dSh, lSh)
  const sunken = neuInset(di, bi, dSh, lSh)

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --fg: ${fg};
  --fg-muted: ${fgMuted};
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: ${roundness};
  --r: calc(var(--u) * var(--roundness) * 2.2);
  --u: ${4 * size}px;
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--bg);
  color: var(--fg);
  font-family: ui-rounded, 'SF Pro Rounded', system-ui, sans-serif;
  font-weight: var(--weight);
  border-radius: calc(var(--r) * 1.4);
  box-shadow: ${neuShadow('8px', '18px', dSh, lSh)};
  padding: calc(var(--u) * (3 + 2 * var(--spacing)));
  min-width: 27ch;
  max-width: calc(var(--u) * 110);
  -webkit-font-smoothing: antialiased;

  /* ── Header ── */
  > summary, > .s-panel-title { font-weight: 700; font-size: larger; color: var(--fg); }
  > summary {
    &::after {
      content: ''; width: calc(var(--u) * 7); height: calc(var(--u) * 7); margin-left: auto; flex-shrink: 0;
      border-radius: 50%; box-shadow: ${raisedSm};
      background: var(--bg) url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='3,4 5,6.5 7,4' fill='none' stroke='%23${dark ? '999' : '888'}' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / 60% no-repeat;
      transition: transform .2s;
    }
  }
  &[open] > summary::after { transform: rotate(-180deg); }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: calc(var(--u) * (1 + 2 * var(--spacing))); }
  .s-panel-content { gap: calc(var(--pad) * 1.5); }

  /* ── Labels ── */
  .s-label { font-weight: 600; }
  .s-hint { color: var(--fg-muted); font-size: smaller; }
  .s-title { display: inline-flex; align-items: center; justify-content: center; width: calc(var(--u) * 4); height: calc(var(--u) * 4); border-radius: 50%; box-shadow: ${sunken}; font-size: 10px; cursor: help;
    &:hover + .s-title-text { opacity: 1; visibility: visible; } }
  .s-title-text { position: absolute; left: 0; top: 100%; margin-top: var(--u); padding: calc(var(--u) * 1.5); font-size: smaller; background: var(--bg); border-radius: var(--r); box-shadow: ${raised}; width: max-content; max-width: 30ch; z-index: 10; opacity: 0; visibility: hidden; pointer-events: none; }

  /* ── Sunken fields ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--bg); color: var(--fg); border: none; border-radius: var(--r); box-shadow: ${sunken};
    font: inherit; font-weight: var(--weight);
    &::placeholder { color: var(--fg-muted); }
    &:focus-visible { outline: none; box-shadow: ${sunken}, 0 0 0 2px color-mix(in oklab, var(--accent), transparent 50%); }
  }
  input[type="text"], input[type="number"], select { height: calc(1lh + var(--pad) * 2); padding: var(--pad) calc(var(--pad-i) + var(--u)); }
  select { cursor: pointer; appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='3,4 5,6.5 7,4' fill='none' stroke='%23999' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right calc(var(--u) * 2) center; padding-right: calc(var(--u) * 6);
    option { background: var(--bg); color: var(--fg); } }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-step { flex-direction: column; gap: calc(var(--u) * 0.5);
      button { background: var(--bg); border: none; border-radius: calc(var(--r) * 0.5); box-shadow: ${raisedSm}; color: var(--fg-muted); padding: 0 calc(var(--u) * 1.5); font-size: .6em; line-height: 1.4; cursor: pointer;
        &:active { box-shadow: ${neuInset('2px', '3px', dSh, lSh)}; } } }
  }

  /* ── Raised buttons ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(var(--u) * 2); }
    button { width: 100%; background: var(--bg); color: var(--accent); font-weight: 700; border: none; border-radius: var(--r); box-shadow: ${raised};
      padding: calc(var(--u) * (1 + var(--spacing))) calc(var(--pad) * 2); transition: box-shadow .12s, color .12s;
      &:hover { color: color-mix(in oklab, var(--accent), var(--fg) 20%); }
      &:active { box-shadow: ${sunken}; }
      &:disabled { opacity: .5; box-shadow: ${raisedSm}; cursor: not-allowed; }
      &:focus-visible { outline: none; box-shadow: ${raised}, 0 0 0 2px color-mix(in oklab, var(--accent), transparent 50%); } }
    &.s-secondary button, button.s-secondary { color: var(--fg-muted); }
  }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { cursor: pointer; }
    &.s-switch {
      .s-track { width: calc(var(--u) * 12); height: calc(var(--u) * 6.5); border-radius: 999px; background: var(--bg); box-shadow: ${sunken}; position: relative; transition: box-shadow .2s;
        &::after { content: ''; position: absolute; top: 50%; left: calc(var(--u) * 0.75); width: calc(var(--u) * 5); height: calc(var(--u) * 5); transform: translateY(-50%); border-radius: 50%; background: var(--bg); box-shadow: ${raisedSm}; transition: left .2s, background .2s; } }
      &:has(input:checked) .s-track::after { left: calc(100% - var(--u) * 5.75); background: var(--accent); }
      &:has(input:focus-visible) .s-track { box-shadow: ${sunken}, 0 0 0 2px color-mix(in oklab, var(--accent), transparent 50%); }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); border-radius: calc(var(--r) * 0.6); background: var(--bg); box-shadow: ${sunken};
        &::after { content: ''; width: 52%; height: 52%; border-radius: calc(var(--r) * 0.3); background: transparent; transition: background .12s; } }
      &:has(input:checked) .s-track::after { background: var(--accent); }
    }
    &.s-toggle {
      .s-track { padding: var(--pad) calc(var(--pad) * 2); border-radius: var(--r); background: var(--bg); box-shadow: ${raisedSm}; height: calc(1lh + var(--pad) * 2); display: flex; align-items: center; justify-content: center; font-size: smaller; color: var(--fg-muted); cursor: pointer;
        &::after { content: 'Off'; } }
      &:has(input:checked) .s-track { box-shadow: ${sunken}; color: var(--accent); &::after { content: 'On'; } }
    }
  }

  /* ── Slider ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: var(--lh); }
    .s-track { height: calc(var(--u) * 5); margin: calc(var(--u) * var(--spacing)) 0; }
    input[type="range"] {
      width: 100%; height: calc(var(--u) * 2.5); -webkit-appearance: none; appearance: none; background: var(--bg); border-radius: 999px; box-shadow: ${neuInset('2px', '4px', dSh, lSh)}; cursor: pointer;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(var(--u) * 5); height: calc(var(--u) * 5); border-radius: 50%; background: var(--bg); box-shadow: ${raisedSm}; cursor: grab; }
      &::-moz-range-thumb { width: calc(var(--u) * 5); height: calc(var(--u) * 5); border: none; border-radius: 50%; background: var(--bg); box-shadow: ${raisedSm}; cursor: grab; }
      &:focus-visible { outline: none; }
    }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-marks { display: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 6px); font-size: smaller; color: var(--fg-muted); white-space: nowrap; }
    .s-readout { flex: 0 0 auto; min-width: 7ch; text-align: right; font-size: smaller; color: var(--fg-muted); font-variant-numeric: tabular-nums; background: transparent; border: none; box-shadow: none; padding-left: var(--pad); }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); margin-bottom: var(--u); background: var(--bg); border-radius: var(--r); box-shadow: ${raisedSm}; padding: 2px 8px; font-size: smaller; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: calc(var(--u) * 2.5); margin: calc(var(--u) * var(--spacing)) 0; border-radius: 999px; background: var(--bg); box-shadow: ${neuInset('2px', '4px', dSh, lSh)}; position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: color-mix(in oklab, var(--accent), transparent 55%); border-radius: 999px; } }
  }

  /* ── Select variants ── */
  .s-select {
    &.s-dropdown select { flex: 1; }
    &.s-segmented {
      .s-input { gap: calc(var(--u) * 1.5); }
      button { flex: 1; background: var(--bg); border: none; border-radius: calc(var(--r) * 0.7); box-shadow: ${raisedSm}; color: var(--fg-muted); padding: var(--pad); transition: box-shadow .12s, color .12s;
        &:hover { color: var(--fg); }
        &.s-selected { box-shadow: ${sunken}; color: var(--accent); } }
    }
    &.s-radio, &.s-checkboxes {
      .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * var(--spacing) * 1.5); }
      label { display: flex; align-items: center; gap: calc(var(--u) * 2.5); cursor: pointer; }
    }
    &.s-checkboxes {
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); flex-shrink: 0; border-radius: calc(var(--r) * 0.6); background: var(--bg); box-shadow: ${sunken};
        &::after { content: ''; width: 52%; height: 52%; border-radius: calc(var(--r) * 0.3); background: transparent; } }
      label:has(input:checked) .s-track::after { background: var(--accent); }
    }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(var(--u) * 2);
      input[type="color"] { position: static; width: calc(var(--u) * 8); height: calc(1lh + var(--pad) * 2); padding: 0; border: none; border-radius: var(--r); box-shadow: ${raisedSm}; cursor: pointer; overflow: hidden;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: var(--r); } }
      input[type="text"] { flex: 1; min-width: 0; font-family: ui-monospace, monospace; } }
    &.s-swatches { .s-input { flex-wrap: wrap; gap: calc(var(--u) * 1.5); }
      button { width: calc(var(--u) * 6); height: calc(var(--u) * 6); padding: 0; border: none; border-radius: calc(var(--r) * 0.7); box-shadow: ${raisedSm};
        &.s-selected { box-shadow: ${raisedSm}, 0 0 0 2px var(--accent); } } }
  }

  /* ── Text / Textarea ── */
  .s-text input[type="text"] { flex: 1; }
  .s-textarea { align-items: flex-start;
    textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(var(--lh) * 3); max-height: 50vh; padding: var(--pad) calc(var(--pad-i) + var(--u)); }
    &.s-code textarea { font-family: ui-monospace, monospace; font-size: smaller; } }

  /* ── Folder ── */
  .s-folder {
    > summary { font-weight: 600; color: var(--fg-muted); padding: calc(var(--u) * 2) 0;
      &::after { content: ''; width: calc(var(--u) * 4); height: calc(var(--u) * 4); margin-left: auto; background: currentColor; -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='3,4 5,6.5 7,4' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat; mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='3,4 5,6.5 7,4' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat; transition: transform .2s; } }
    &[open] > summary::after { transform: rotate(-180deg); }
    .s-content { padding: calc(var(--u) * 2 * var(--spacing)) 0; }
  }
}`

  return baseCSS + '\n' + overrides
}
