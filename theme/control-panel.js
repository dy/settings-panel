/**
 * Control-panel theme — freeman-lab/control-panel reproduction
 *
 * base scaffold + control-panel visual layer.
 * controlPanel(axes?) → CSS string
 */

import baseCSS from './base.js'
import { parseColor, resolveAccent, clamp } from './color.js'

export default function controlPanel({
  shade = '#232323',
  accent = '#5b99f5',
  spacing = 1,
  weight = 400,
  roundness = 0
} = {}) {
  const resolved = resolveAccent(accent, shade)
  const { L, C, H } = parseColor(shade)
  const dark = L < .6
  const gap = `calc(var(--u) * var(--spacing))`

  const bgStep = 0.08
  const bg2L = clamp(dark ? Math.max(L + bgStep, 0.15) : L - bgStep, 0, 1)
  const bg2hL = clamp(bg2L + 0.02, 0, 1)
  const bg1 = shade
  const bg2 = `oklch(${bg2L.toFixed(3)} ${C.toFixed(4)} ${H.toFixed(1)})`
  const bg2h = `oklch(${bg2hL.toFixed(3)} ${C.toFixed(4)} ${H.toFixed(1)})`
  const fg1 = dark ? '#707070' : '#696969'
  const text1 = dark ? '#ebebeb' : '#242424'
  const text2 = dark ? '#a1a1a1' : '#575757'

  const overrides = `.s-panel {
  --u: 5px;
  --bg: ${bg1};
  --bg2: ${bg2};
  --bg2h: ${bg2h};
  --fg: ${fg1};
  --text: ${text1};
  --dim: ${text2};
  --accent: ${resolved};
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: ${roundness};
  --r: 0;
  --pad: calc(var(--u) * (2 + 1 * var(--spacing)));
  color-scheme: ${dark ? 'dark' : 'light'};

  background-color: var(--bg);
  font-family: 'Hack', monospace;
  font-size: 11px;
  line-height: 20px;
  color: var(--text);
  border-radius: 0;
  padding: var(--pad);
  min-width: 0;
  -webkit-font-smoothing: antialiased;

  /* ── Panel header ── */
  > summary, > .s-panel-title {
    display: block;
    font-size: 11px;
    font-weight: ${weight};
    color: var(--dim);
    text-transform: uppercase;
    text-align: center;
    height: 20px;
    line-height: 20px;
    padding: 0;
    &::after { display: none; }
  }

  .s-panel-content { gap: ${gap}; padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: var(--pad);
  }

  /* ── Layout ── */
  .s-control { gap: ${gap}; padding: 0; position: relative; align-items: center; }
  .s-label-group {
    min-width: 0;
    width: 36%;
    max-width: none;
    flex: 0 0 36%;
    padding: 0;
    line-height: 1.1;
    height: auto;
  }
  .s-label { font-size: 11px; overflow-wrap: break-word; }
  .s-input { gap: ${gap}; align-items: center; }

  /* ── Interactive elements ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--bg2);
    border: none;
    border-radius: 0;
    outline: none;
    color: var(--dim);
    font-family: inherit;
    font-size: 11px;
    &::placeholder { color: var(--fg); }
    &:hover { background-color: var(--bg2h); }
    &:focus { background-color: var(--bg2h); outline: none; }
    &:focus-visible { outline: 1px solid var(--fg); outline-offset: 0; }
  }
  input[type="text"], input[type="number"], select {
    padding: 0 5px;
    height: 20px;
    line-height: 15px;
  }
  input[type="color"] {
    -webkit-appearance: none;
    appearance: none;
    flex: none;
    width: 35px;
    height: 20px;
    padding: 0;
    border: none;
    cursor: pointer;
    &:focus-visible { outline: 1px solid var(--fg); outline-offset: 0; }
    &::-webkit-color-swatch-wrapper { padding: 0; }
    &::-webkit-color-swatch { border: none; border-radius: 0; }
    &::-moz-color-swatch { border: none; border-radius: 0; }
  }
  .s-textarea {
    align-items: flex-start;
    .s-input { align-items: stretch; align-self: stretch; }
    textarea {
      flex: 1;
      align-self: stretch;
      width: auto;
      min-width: 0;
      height: auto;
      min-height: calc(var(--lh) * 3);
      max-height: 50vh;
      padding: 2px 5px;
      line-height: 15px;
      field-sizing: content;
      white-space: nowrap;
      overflow: auto;
      resize: both;
      &::-webkit-scrollbar { width: 8px; height: 8px; }
      &::-webkit-scrollbar-track { background: var(--bg2); }
      &::-webkit-scrollbar-thumb {
        background: var(--fg);
        border-radius: 0;
        border: 2px solid var(--bg2);
      }
      &::-webkit-scrollbar-corner { background: var(--bg2); }
    }
  }
  button {
    background: var(--bg2);
    border: none;
    border-radius: 0;
    color: var(--dim);
    font-family: inherit;
    font-size: 11px;
    height: 20px;
    cursor: pointer;
    &:hover { background: var(--bg2h); filter: none; }
    &:active { background: var(--dim); color: var(--bg2); filter: none; }
    &:focus-visible { outline: 1px solid var(--fg); outline-offset: 0; }
  }

  /* ── Slider ── */
  .s-slider {
    align-items: center;
    .s-readout {
      color: var(--dim);
      font-size: 11px;
      height: 20px;
      line-height: 20px;
      width: 35px;
      min-width: 35px;
      flex: 0 0 35px;
      text-align: left;
      padding: 0 4px;
      overflow: hidden;
    }
    &:not(.s-multiple) .s-track {
      margin: 0;
      height: 20px;
      input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 20px;
        background: var(--bg2);
        border-radius: 0;
        outline: none;
        cursor: ew-resize;
        &:hover { background-color: var(--bg2h); }
        &:focus-visible { outline: 1px solid var(--fg); outline-offset: 0; }
        &::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 10px; height: 20px; background: var(--fg); border-radius: 0; cursor: ew-resize; border: none; box-shadow: none; }
        &::-moz-range-thumb { width: 10px; height: 20px; background: var(--fg); border-radius: 0; cursor: ew-resize; border: none; }
        &::-webkit-slider-runnable-track { -webkit-appearance: none; appearance: none; height: 20px; border-radius: 0; box-shadow: none; }
        &::-moz-range-track { height: 20px; background: var(--bg2); border-radius: 0; border: none; }
      }
    }
    &.s-multiple .s-interval-track {
      height: 20px;
      margin: 0;
      background: var(--bg2);
      cursor: ew-resize;
      &:hover { background-color: var(--bg2h); }
      &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: var(--low, 0%);
        width: calc(var(--high, 100%) - var(--low, 0%));
        background: var(--fg);
        pointer-events: none;
      }
      input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        pointer-events: none;
        cursor: ew-resize;
        &:focus-visible { outline: 1px solid var(--fg); outline-offset: 0; }
        &::-webkit-slider-thumb { pointer-events: all; cursor: ew-resize; }
        &::-moz-range-thumb { pointer-events: all; cursor: ew-resize; }
        &::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 10px; height: 20px; background: var(--fg); border-radius: 0; border: none; box-shadow: none; }
        &::-moz-range-thumb { width: 10px; height: 20px; background: var(--fg); border-radius: 0; border: none; }
        &::-webkit-slider-runnable-track { -webkit-appearance: none; appearance: none; background: transparent; box-shadow: none; }
      }
    }
  }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    .s-input { align-self: center; }
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-track { border-radius: 0; border: none; box-shadow: none; background: var(--bg2); position: relative; }
    .s-input:hover .s-track { background-color: var(--bg2h); }
    &:has(input:focus-visible) .s-track { outline: 1px solid var(--fg); outline-offset: 0; }
    &.s-checkbox {
      .s-track {
        display: block;
        width: 18px;
        height: 18px;
        margin: 1px 0;
        &::after {
          content: '';
          position: absolute;
          inset: auto;
          margin: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          transition: background 140ms;
        }
      }
      &:has(input:checked) .s-track::after { background: var(--s-color, var(--fg)); }
    }
    &.s-switch {
      .s-track {
        --thumb: 10px;
        width: 35px;
        height: 18px;
        margin: 1px 0;
        &::after {
          content: '';
          position: absolute;
          inset: auto;
          margin: 0;
          top: 50%;
          left: calc((18px - var(--thumb)) / 2);
          transform: translateY(-50%);
          width: var(--thumb);
          height: var(--thumb);
          border-radius: 0;
          background: var(--fg);
          box-shadow: none;
          transition: transform 140ms, background 140ms;
        }
      }
      &:has(input:checked) .s-track::after {
        inset: auto;
        top: 50%;
        left: calc((18px - var(--thumb)) / 2);
        right: auto;
        transform: translate(calc(35px - var(--thumb) - (18px - var(--thumb))), -50%);
        background: var(--s-color, var(--fg));
      }
    }
    &.s-toggle {
      .s-track {
        width: auto;
        height: 20px;
        margin: 0;
        padding: 0 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        &::after { font-size: 11px; background: none; box-shadow: none; position: static; width: auto; height: auto; border-radius: 0; }
      }
      &:has(input:checked) .s-track { background: var(--dim); color: var(--bg2); }
    }
  }

  /* ── Select ── */
  .s-select {
    select {
      flex: 1;
      width: 100%;
      -webkit-appearance: none;
      appearance: none;
      background-image: url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='6' height='12' fill='${fg1}'><path d='M0 5 L3 1 L6 5Z'/><path d='M0 7 L3 11 L6 7Z'/></svg>`)}");
      background-repeat: no-repeat;
      background-position: right 4px center;
      padding: 0 16px 0 5px;
      cursor: pointer;
      option { background: var(--bg); color: var(--text); }
    }
    &.s-checkboxes {
      min-height: auto;
      padding: 0;
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track {
        width: 18px;
        height: 18px;
        border-radius: 0;
        border: none;
        box-shadow: none;
        background: var(--bg2);
        position: relative;
        display: inline-block;
        flex-shrink: 0;
        &::after {
          content: '';
          position: absolute;
          inset: auto;
          margin: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          transition: background 140ms;
        }
      }
      .s-input {
        align-self: center;
        gap: 0;
        flex-direction: row;
        flex-wrap: wrap;
        label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--dim);
          font-size: 11px;
          margin-right: 8px;
          cursor: pointer;
        }
      }
      label:hover .s-track { background-color: var(--bg2h); }
      label:has(input:checked) .s-track::after { background: var(--s-color, var(--fg)); }
      label:has(input:focus-visible) .s-track { outline: 1px solid var(--fg); outline-offset: 0; }
    }
    &.s-segmented button { padding: 0 5px; &.s-selected { background: var(--dim); color: var(--bg2); } }
  }

  /* ── Color ── */
  .s-color.s-picker .s-color-input {
    gap: 5px;
    input[type="color"] { position: static; }
    input[type="text"] { flex: 1; min-width: 0; width: auto; }
  }

  /* ── Button ── */
  .s-button {
    .s-input { flex: 1; }
    button { width: 100%; padding: 0 10px; }
  }

  /* ── Number ── */
  .s-number {
    input[type="number"] { width: 60px; text-align: left; }
    .s-step { display: none; }
  }

  /* ── Text ── */
  .s-text input[type="text"] { flex: 1; }

  /* ── Folder ── */
  .s-folder {
    > summary {
      font-size: 11px;
      font-weight: ${weight};
      color: var(--dim);
      padding: calc(var(--u) * var(--spacing) * 2) 0;
      opacity: 1;
      &::after { display: none; }
    }
    .s-content { gap: 0; }
  }
}`

  return baseCSS + '\n' + overrides
}
