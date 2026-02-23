/**
 * Control-panel theme — freeman-lab/control-panel reproduction
 *
 * Monospace, dark, flat, no radius. Compact dev-tool aesthetic.
 * controlPanel(axes?) → CSS string
 *
 * Source: https://github.com/freeman-lab/control-panel
 * Exact values from themes.js + component CSS + layout JS.
 */

import base, { parseColor, resolveAccent, clamp } from './default.js'

export default function controlPanel({
  shade = '#232323',
  accent = '#5b99f5',
  spacing = .5,
  weight = 400,
  roundness = 0
} = {}) {
  const resolved = resolveAccent(accent, shade)
  const { L } = parseColor(shade)
  const dark = L < .6

  // Exact palette from themes.js (dark)
  const bg1 = shade                         // rgba(35,35,35,.95)
  const bg2 = dark ? '#363636' : '#cccccc'  // rgba(54,54,54,.95) / rgba(204,204,204,.95)
  const bg2h = dark ? '#3a3a3a' : '#d0d0d0' // rgba(58,58,58,.95) / rgba(208,208,208,.95)
  const fg1 = dark ? '#707070' : '#696969'  // rgba(112,112,112,.95) / rgba(105,105,105,.95)
  const text1 = dark ? '#ebebeb' : '#242424' // rgba(235,235,235,.95) / rgba(36,36,36,.95)
  const text2 = dark ? '#a1a1a1' : '#575757' // rgba(161,161,161,.95) / rgba(87,87,87,.95)

  const baseCSS = base({ shade, spacing, weight, accent: resolved, roundness })

  const overrides = `.s-panel {
  --bg: ${bg1};
  --bg2: ${bg2};
  --bg2h: ${bg2h};
  --fg: ${fg1};
  --text: ${text1};
  --dim: ${text2};
  --accent: ${resolved};
  --r: 0px; --roundness: 0;
  --padding: calc(var(--u) * 1);

  font-family: 'Hack', 'Fira Code', 'Source Code Pro', ui-monospace, monospace;
  font-size: 11px; line-height: 20px; color: var(--text);
  border-radius: 0; padding: 14px; min-width: 0;

  /* ── Title ── */
  > summary, > .s-panel-title {
    font-size: 11px; font-weight: ${weight}; color: var(--dim);
    text-transform: uppercase; text-align: center; justify-content: center;
    height: 20px; line-height: 20px; padding: 0; margin-bottom: 4px; border-bottom: none;
    &::after { display: none; }
  }
  .s-panel-content { gap: 5px; padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Layout ── */
  .s-control { display: flex; align-items: baseline; gap: 5px; padding: 0; position: relative; }
  .s-label-group { min-width: 0; width: 36%; max-width: none; flex: 0 0 36%; padding: 0; line-height: 1.1; height: auto; }
  .s-label { font-size: 11px; overflow-wrap: break-word; }
  .s-input { flex: 1; min-width: 0; gap: 5px; align-items: center; }

  /* ── Interactive elements ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--bg2);
    border: none; border-radius: 0; outline: none;
    color: var(--dim); font-family: inherit; font-size: 11px;
    padding: 0 5px; height: 20px; line-height: 15px;
    &::placeholder { color: var(--fg); }
    &:hover { background-color: var(--bg2h); }
    &:focus { background-color: var(--bg2h); outline: none; }
    &:focus-visible { outline: 1px solid var(--fg); outline-offset: 0; }
  }
  .s-textarea textarea { height: auto; padding-block: 2px; &::-webkit-scrollbar-thumb { border-radius: 0; } }
  button {
    background: var(--bg2); border: none; border-radius: 0;
    color: var(--dim); font-family: inherit; font-size: 11px;
    height: 20px; cursor: pointer;
    &:hover { background: var(--bg2h); filter: none; }
    &:active { background: var(--dim); color: var(--bg2); filter: none; }
    &:focus-visible { outline: 1px solid var(--fg); outline-offset: 0; }
  }

  /* ── Slider ── */
  .s-slider {
    align-items: center;
    .s-readout {
      color: var(--dim); font-size: 11px;
      height: 20px; line-height: 20px;
      width: 35px; min-width: 35px; flex: 0 0 35px;
      text-align: left; padding: 0 4px; overflow: hidden;
    }
    &:not(.multiple) {
      .s-track { margin: 0; height: 20px; flex: 1; }
      input[type="range"] {
        -webkit-appearance: none; appearance: none;
        width: 100%; height: 20px;
        background: var(--bg2); border-radius: 0; outline: none; cursor: ew-resize;
        &:hover { background-color: var(--bg2h); }
        &:focus-visible { outline: 1px solid var(--fg); outline-offset: 0; }
        &::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 20px; background: var(--fg); border-radius: 0; cursor: ew-resize; border: none; }
        &::-moz-range-thumb { width: 10px; height: 20px; background: var(--fg); border-radius: 0; cursor: ew-resize; border: none; }
        &::-webkit-slider-runnable-track { height: 20px; border-radius: 0; }
        &::-moz-range-track { height: 20px; background: var(--bg2); border-radius: 0; border: none; }
      }
    }
    &.multiple .s-interval-track {
      flex: 1; height: 20px; margin: 0;
      background: var(--bg2);
      background-image: linear-gradient(to right,
        transparent var(--low), var(--fg) var(--low),
        var(--fg) var(--high), transparent var(--high));
      &:hover { background-color: var(--bg2h); }
      input[type="range"] {
        height: 20px;
        &:focus-visible { outline: 1px solid var(--fg); outline-offset: 0; }
        &::-webkit-slider-thumb { width: 10px; height: 20px; background: var(--fg); border-radius: 0; border: none; }
        &::-moz-range-thumb { width: 10px; height: 20px; background: var(--fg); border-radius: 0; border: none; }
      }
    }
  }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    .s-input { align-self: center; }
    .s-track { border-radius: 0; border: none; box-shadow: none; background: var(--bg2); position: relative; }
    .s-input:hover .s-track { background-color: var(--bg2h); }
    &:has(input:focus-visible) .s-track { outline: 1px solid var(--fg); outline-offset: 0; }
    &.checkbox {
      .s-track {
        width: 18px; height: 18px; margin: 1px 0;
        &::after { content: ''; position: absolute; width: 10px; height: 10px; border-radius: 0; top: 4px; left: 4px; background: transparent; box-shadow: none; transition: background 140ms; }
      }
      &:has(input:checked) .s-track::after { background: var(--s-color, var(--fg)); }
    }
    &.toggle {
      .s-track {
        width: 35px; height: 18px; margin: 1px 0;
        &::after { content: ''; position: absolute; width: 10px; height: 10px; border-radius: 0; top: 1px; left: 2px; background: var(--fg); box-shadow: none; transition: transform 140ms; }
      }
      &:has(input:checked) .s-track::after { transform: translateX(17px); background: var(--s-color, var(--fg)); }
    }
  }

  /* ── Select ── */
  .s-select {
    select {
      flex: 1; width: 100%;
      -webkit-appearance: none; appearance: none;
      background-image: url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='6' height='12' fill='${fg1}'><path d='M0 5 L3 1 L6 5Z'/><path d='M0 7 L3 11 L6 7Z'/></svg>`)}");
      background-repeat: no-repeat; background-position: right 4px center;
      padding: 0 16px 0 5px; cursor: pointer;
      option { background: var(--bg); color: var(--text); }
    }
    &.checkboxes {
      min-height: auto; padding: 0;
      .s-track {
        width: 18px; height: 18px;
        border-radius: 0; border: none; box-shadow: none;
        background: var(--bg2); position: relative;
        display: inline-block; flex-shrink: 0; margin-right: 8px; vertical-align: -4px;
        &::after {
          content: ''; position: absolute;
          width: 10px; height: 10px; border-radius: 0;
          top: 4px; left: 4px;
          background: transparent; box-shadow: none; transition: background 140ms;
        }
      }
      .s-input {
        align-self: center; gap: 0; flex-wrap: wrap;
        label {
          display: inline-flex; align-items: center;
          color: var(--dim); font-size: 11px; margin-right: 8px; cursor: pointer;
          input { position: absolute; opacity: 0; width: 0; height: 0; }
        }
      }
      label:hover .s-track { background-color: var(--bg2h); }
      label:has(input:checked) .s-track::after { background: var(--s-color, var(--fg)); }
      label:has(input:focus-visible) .s-track { outline: 1px solid var(--fg); outline-offset: 0; }
    }
    &.buttons button { padding: 0 5px; &.selected { background: var(--dim); color: var(--bg2); } }
  }

  /* ── Color ── */
  .s-color-input {
    input[type="text"] { font-family: inherit; font-size: 11px; margin-left: calc(35px + 5px); }
    input[type="color"] {
      -webkit-appearance: none; appearance: none;
      border: none; border-radius: 0; width: 35px; height: 20px; padding: 0; left: 0; cursor: pointer;
      &:focus-visible { outline: 1px solid var(--fg); outline-offset: 0; }
      &::-webkit-color-swatch-wrapper { padding: 0; }
      &::-webkit-color-swatch { border: none; border-radius: 0; }
      &::-moz-color-swatch { border: none; border-radius: 0; }
    }
  }

  /* ── Button ── */
  .s-button {
    .s-input { flex: 1; }
    button { width: 100%; padding: 0 10px; }
  }

  /* ── Number ── */
  .s-number { input[type="number"] { width: 60px; text-align: left; } .s-step { display: none; } }

  /* ── Text ── */
  .s-text input[type="text"] { flex: 1; }

  /* ── Folder ── */
  .s-folder {
    > summary {
      font-size: 11px; font-weight: ${weight}; color: var(--dim);
      padding: 4px 0; border-bottom: none; opacity: 1;
      &::after { display: none; }
    }
    .s-content { gap: 0; }
  }
}`

  return baseCSS + '\n' + overrides
}
