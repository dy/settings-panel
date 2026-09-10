/**
 * figma — calibrated to Figma's properties panel
 *
 * Signatures: Inter, the #0d99ff blue, compact 24px "ghost" inputs (no border
 * until hover/focus), small rounded color swatches, dense icon-prefixed number
 * fields, and segmented icon buttons. Light by default; dark shade flips it.
 *
 * Axes: shade (bg, drives dark/light), accent (action blue), size (grid unit).
 * Everything else — ink/dim text, hairline dividers, hover/selected fills,
 * ghost-input borders, switch/checkbox parts, swatch rings, tooltip, thumb/knob
 * whites — is one of Figma's exact brand constants rather than something derived
 * from shade's hue, but each still lands as its own overridable --token in the
 * var block below (keyed off `dark`, itself derived from shade) instead of a
 * literal scattered through the rules.
 *
 * figma(axes?) → CSS string
 */

import baseCSS from './base.js'
import { parseColor, resolveAccent } from './color.js'

export default function figma({
  shade = '#ffffff',
  accent = '#0d99ff',
  size = 1,
} = {}) {
  const { L } = parseColor(shade)
  const dark = L < 0.5
  const acc = resolveAccent(accent, shade)
  const enc = c => encodeURIComponent(c)   // any CSS color, safe inside an SVG data-URI

  // ── Derived tokens — Figma's exact light/dark greyscale pairs, keyed off `dark` ──
  const ink = dark ? '#ffffff' : '#1e1e1e'
  const dim = dark ? '#9a9a9a' : '#8c8c8c'
  const line = dark ? '#444444' : '#e6e6e6'
  const hover = dark ? '#383838' : '#f5f5f5'
  const sel = dark ? '#2c2c2c' : '#fff'           // elevated/selected chip (option, segmented)
  const selShadow = 'rgba(0,0,0,.12)'
  const arrow = dark ? '#ccc' : '#555'            // select dropdown arrow stroke
  const switchOff = dark ? '#555' : '#d9d9d9'     // switch track, unchecked
  const checkboxBorder = dark ? '#666' : '#ccc'
  // Two rings (outer + inset) so the swatch edge stays legible even when its own
  // value happens to equal the panel background — one ring alone can vanish in that case.
  const swatchBorder = dark ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.1)'
  const swatchRing = dark ? 'inset 0 0 0 1px rgba(0,0,0,.4)' : 'inset 0 0 0 1px rgba(255,255,255,.5)'
  // Fixed regardless of shade — Figma paints these the same in either mode.
  const onAccent = '#fff'         // text/icon over an accent fill (button, "On", checkmark)
  const thumbBg = '#fff'          // slider thumb + switch knob fill
  const thumbRing = 'rgba(0,0,0,.2)'
  const knobShadow = 'rgba(0,0,0,.3)'
  const tooltipBg = '#1e1e1e'
  const tooltipFg = '#fff'

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --ink: ${ink};
  --dim: ${dim};
  --line: ${line};
  --hover: ${hover};
  --sel: ${sel};
  --sel-shadow: ${selShadow};
  --switch-off: ${switchOff};
  --checkbox-border: ${checkboxBorder};
  --swatch-border: ${swatchBorder};
  --swatch-ring: ${swatchRing};
  --on-accent: ${onAccent};
  --thumb-bg: ${thumbBg};
  --thumb-ring: ${thumbRing};
  --knob-shadow: ${knobShadow};
  --tooltip-bg: ${tooltipBg};
  --tooltip-fg: ${tooltipFg};
  --u: ${4 * size}px;
  --spacing: 1;
  --weight: 400;
  --r: 5px;
  --ease: cubic-bezier(.2, 0, 0, 1);
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--bg);
  color: var(--ink);
  font: 11px/16px 'Inter', system-ui, -apple-system, sans-serif;
  font-feature-settings: 'liga' 1, 'calt' 1;
  width: min(100%, 240px);
  min-width: 0;
  max-width: 240px;
  border-radius: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;

  /* ── Title (panel header) ── */
  > summary, > .s-panel-title {
    font-weight: 600; font-size: 11px; color: var(--ink);
    height: 40px; padding: 0 16px; border-bottom: 1px solid var(--line);
  }
  /* Chevron only on .s-fold-icon — present solely when the title is actually foldable (a real <summary>) */
  > summary .s-fold-icon { margin-left: auto; display: flex;
    i { display: block; width: 8px; height: 8px; background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .12s var(--ease); } }
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.4'/%3E%3C/svg%3E");
  &[open] > summary .s-fold-icon i { transform: rotate(-180deg); }
  .s-panel-content { gap: 0; padding: 8px 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 8px; }

  /* ── Search (title-bar magnifier that expands into a ghost input) ── */
  .s-search { margin-left: auto; gap: 6px; }
  .s-search-btn { width: 16px; height: 16px; opacity: .55; border-radius: 2px; transition: opacity .12s var(--ease); &:hover { opacity: .9; } }
  &.s-searching .s-search-btn { opacity: .9; }
  .s-search-input {
    width: 96px; height: 24px; padding: 0 6px; border-radius: 2px;
    background: var(--hover); font: inherit; color: var(--ink);
    &::placeholder { color: var(--dim); }
    &::-webkit-search-cancel-button { -webkit-appearance: none; }
  }

  /* ── Row (32px, 16px gutters) ── */
  .s-control { gap: calc(var(--u) * 2); padding: 4px 16px; min-height: 32px; align-items: center; }
  .s-label-group { width: 64px; min-width: 0; max-width: none; padding: 0; }
  .s-label { color: var(--ink); font-weight: 400; }
  .s-hint { opacity: 1; color: var(--dim); font-size: 11px; }
  .s-input { gap: calc(var(--u) * 1.5); align-items: center; }

  /* ── Ghost inputs (border only on hover/focus) ── */
  input[type="text"], input[type="number"], select, textarea {
    background: transparent; color: var(--ink);
    border: 1px solid transparent; border-radius: 2px;
    height: 24px; padding: 0 7px; font: inherit;
    transition: border-color .12s var(--ease), box-shadow .12s var(--ease);
    &::placeholder { color: var(--dim); }
    &:hover { border-color: var(--line); }
    &:focus { outline: none; border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: left; cursor: ew-resize; font-variant-numeric: tabular-nums; -moz-appearance: textfield; &:focus { cursor: text; } &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Vector (Figma X/Y/W/H) ── */
  .s-vector {
    .s-input { gap: calc(var(--u) * 1.5); }
    .s-vec-axis { flex: 1; min-width: 0; gap: 0; box-sizing: border-box; height: 24px; border: 1px solid transparent; border-radius: 2px; padding-left: 7px;
      transition: border-color .12s var(--ease), box-shadow .12s var(--ease);
      &:hover { border-color: var(--line); }
      &:focus-within { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); } }
    .s-vec-label { opacity: 1; color: var(--dim); font-size: 11px; width: 12px; }
    input[type="number"] { border: none; box-shadow: none; padding: 0 4px; cursor: ew-resize; font-variant-numeric: tabular-nums; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } &:hover, &:focus { border: none; box-shadow: none; } &:focus { cursor: text; } }
  }

  /* ── Slider ── */
  .s-slider {
    align-items: center;
    .s-track { height: 24px; margin: 0; }
    input[type="range"] {
      width: 100%; height: 4px; -webkit-appearance: none; appearance: none; border-radius: 2px; cursor: pointer; outline: none;
      background: linear-gradient(to right, var(--accent) var(--p, 0%), var(--line) var(--p, 0%));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: var(--thumb-bg); border: 1px solid var(--thumb-ring); box-shadow: 0 1px 2px var(--thumb-ring); cursor: pointer; transition: box-shadow .12s var(--ease); }
      &::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: var(--thumb-bg); border: 1px solid var(--thumb-ring); cursor: pointer; transition: box-shadow .12s var(--ease); }
      &:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 2px var(--accent), 0 1px 2px var(--thumb-ring); }
      &:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 2px var(--accent); }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: var(--dim); white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: 48px; text-align: left; background: transparent; color: var(--ink); border: 1px solid transparent; border-radius: 2px; height: 24px; padding: 0 6px; font-variant-numeric: tabular-nums; cursor: ew-resize; transition: border-color .12s var(--ease); &:hover { border-color: var(--line); } &:focus { outline: none; border-color: var(--accent); cursor: text; } }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 4px; background: var(--tooltip-bg); color: var(--tooltip-fg); padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: 4px; margin: 10px 0; background: var(--line); border-radius: 2px; position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); } }
  }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='1,1 5,5 9,1' fill='none' stroke='${enc(arrow)}' stroke-width='1.2'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 7px center; background-size: 9px 6px; padding-right: 20px;
      option { background: var(--sel); color: var(--ink); } }
    &.s-segmented { .s-input { gap: 0; background: var(--hover); border-radius: var(--r); padding: 2px; }
      button { flex: 1; background: transparent; border: none; color: var(--dim); border-radius: 3px; height: 20px; font: inherit; outline: none;
        transition: color .12s var(--ease), background .12s var(--ease), box-shadow .12s var(--ease);
        &:hover { color: var(--ink); }
        &:focus-visible { box-shadow: inset 0 0 0 1px var(--accent); }
        &.s-selected { background: var(--sel); box-shadow: 0 1px 2px var(--sel-shadow); color: var(--ink); }
        &.s-selected:focus-visible { box-shadow: 0 1px 2px var(--sel-shadow), inset 0 0 0 1px var(--accent); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * 1.5); } .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 2); cursor: pointer; } }
  }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &.s-switch {
      .s-track { width: 24px; height: 14px; border-radius: 999px; background: var(--switch-off); position: relative; cursor: pointer; transition: background .15s var(--ease);
        &::after { content: ''; position: absolute; top: 2px; left: 2px; width: 10px; height: 10px; border-radius: 50%; background: var(--thumb-bg); box-shadow: 0 1px 2px var(--knob-shadow); transition: left .15s var(--ease); } }
      &:has(input:checked) .s-track { background: var(--accent); &::after { left: 12px; } }
      &:has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 2px; }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: 16px; height: 16px; border-radius: 3px; background: transparent; border: 1.5px solid var(--checkbox-border);
        transition: background .12s var(--ease), border-color .12s var(--ease);
        &::after { content: ''; width: 9px; height: 7px; -webkit-mask: var(--check) center / contain no-repeat; mask: var(--check) center / contain no-repeat; background: var(--on-accent); opacity: 0; } }
      &:has(input:checked) .s-track { background: var(--accent); border-color: var(--accent); &::after { opacity: 1; } }
      &:has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 2px; }
    }
    --check: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E");
    &.s-toggle .s-track { padding: 0 10px; height: 24px; border-radius: var(--r); background: var(--hover); display: flex; align-items: center; justify-content: center; cursor: pointer;
      transition: background .12s var(--ease), color .12s var(--ease);
      &::after { content: 'Off'; } }
    &.s-toggle:has(input:checked) .s-track { background: var(--accent); color: var(--on-accent); &::after { content: 'On'; } }
  }

  /* ── Color (swatch + hex + opacity) ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(var(--u) * 1.5); box-sizing: border-box; height: 24px; border: 1px solid transparent; border-radius: 2px; padding: 0 2px 0 5px;
      transition: border-color .12s var(--ease), box-shadow .12s var(--ease);
      &:hover { border-color: var(--line); }
      &:focus-within { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
      input[type="color"] { appearance: none; -webkit-appearance: none; position: static; flex: none; width: 16px; height: 16px; padding: 0; border: 1px solid var(--swatch-border); border-radius: 3px; box-shadow: var(--swatch-ring); cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 3px; } }
      input[type="text"] { flex: 1; min-width: 0; border: none; padding: 0; height: 24px; text-transform: uppercase; &:hover, &:focus { border: none; box-shadow: none; } } }
    &.s-rgba .s-color-input {
      width: 100%;
      display: grid;
      grid-template-columns: 16px minmax(54px, 1fr);
      gap: calc(var(--u) * 1.5);
      align-items: center;
      input[type="color"] { appearance: none; -webkit-appearance: none; width: 16px; height: 16px; border: 1px solid var(--swatch-border); border-radius: 3px; box-shadow: var(--swatch-ring); &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 3px; } }
      .s-alpha { display: none; }
      input[type="text"] { width: 100%; min-width: 0; padding: 0 2px; text-transform: uppercase; }
    }
    &.s-swatches button { width: 18px; height: 18px; border-radius: 3px; border: 1px solid var(--swatch-border); box-shadow: var(--swatch-ring); outline: none; &.s-selected { outline: 2px solid var(--accent); outline-offset: 1px; } &:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; } }
  }

  /* ── Button ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(var(--u) * 2); }
    button { flex: 1; height: 32px; background: var(--accent); color: var(--on-accent); border: none; border-radius: var(--r); font-weight: 500; padding: 0 12px; outline: none;
      transition: filter .12s var(--ease), box-shadow .12s var(--ease);
      &:hover { filter: brightness(1.05); } &:active { filter: brightness(.95); } &:disabled { opacity: .4; cursor: not-allowed; }
      &:focus-visible { box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent); } }
    &.s-secondary button, button.s-secondary { background: transparent; color: var(--ink); box-shadow: inset 0 0 0 1px var(--line); transition: background .12s var(--ease), box-shadow .12s var(--ease);
      &:hover { background: var(--hover); filter: none; }
      &:focus-visible { box-shadow: inset 0 0 0 1px var(--line), 0 0 0 2px var(--bg), 0 0 0 4px var(--accent); } }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 48px; max-height: 50vh; padding: 6px 7px; border-color: var(--line); &:hover { border-color: var(--line); } } }

  /* ── Folder (section) ── */
  .s-folder {
    padding: 0; /* .s-folder also matches .s-control — without this it double-applies the row inset to both the header and .s-content's children */
    > summary { font-weight: 600; color: var(--ink); height: 32px; padding: 0 16px; border-top: 1px solid var(--line);
      &::after { content: ''; width: 8px; height: 8px; margin-left: auto; background: currentColor; opacity: 0; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .12s var(--ease), opacity .12s var(--ease); }
      &:hover::after { opacity: .45; } }
    &[open] > summary::after { transform: rotate(-180deg); }
    .s-content { gap: 0; padding-bottom: 8px; }
  }

  /* ── XY pad / knob ── */
  .s-pad { border-radius: 2px; }
  .s-knob-dial { background: var(--hover); border: 1px solid var(--line); }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: var(--ink); font-variant-numeric: tabular-nums; }
  .s-separator { background: var(--line); opacity: 1; margin: 8px 0; }
}`

  return baseCSS + '\n' + overrides
}
