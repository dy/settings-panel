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
  --accent: ${resolved};
  --r: 0px;
  --ri: 0px;
  --roundness: 0;
  --padding: calc(var(--u) * 1);

  font-family: 'Hack', 'Fira Code', 'Source Code Pro', ui-monospace, monospace;
  font-size: 11px;
  line-height: 20px;
  color: ${text1};
  border-radius: 0;
  padding: 14px;
  min-width: 0;

  /* ── Title: uppercase, dimmed, centered ── */
  > summary, > .s-panel-title {
    font-size: 11px;
    font-weight: normal;
    color: ${text2};
    text-transform: uppercase;
    text-align: center;
    justify-content: center;
    height: 20px;
    line-height: 20px;
    padding: 0;
    margin-bottom: 4px;
    border-bottom: none;
    &::after { display: none; }
  }

  .s-panel-content {
    gap: .333em;
    padding: 0;
  }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: 0;
  }

  /* ── Control row: 25px min-height ── */
  .s-control {
    display: flex;
    align-items: baseline;
    gap: .333em;
    padding: 0;
    position: relative;
  }

  /* ── Label: 36% width, text1 color ── */
  .s-label-group {
    min-width: 0;
    width: 36%;
    max-width: none;
    flex: 0 0 36%;
    padding: 0;
    line-height: 1.1;
    height: auto;
  }
  .s-label {
    color: ${text1};
    font-size: 11px;
    overflow-wrap: break-word;
  }

  /* ── Input ── */
  .s-input {
    flex: 1;
    min-width: 0;
    gap: 0;
    align-items: center;
  }

  /* ── Text inputs ── */
  input[type="text"], input[type="number"], textarea, select {
    background: ${bg2};
    border: none;
    border-radius: 0;
    outline: none;
    color: ${text1};
    font-family: inherit;
    font-size: 11px;
    padding: 0 5px;
    height: 20px;
    line-height: 20px;
    &::placeholder { color: ${fg1}; }
    &:hover { background: ${bg2h}; }
    &:focus { background: ${bg2h}; outline: none; }
    &:focus-visible { outline: none; }
  }

  /* ── Slider: track fills remaining, readout 30px ── */
  .s-slider {
    align-items: center;
    .s-input { gap: .25rem; }
    .s-track {
      margin: 0;
      height: 20px;
      flex: 1;
    }
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 20px;
      background: ${bg2};
      border-radius: 0;
      outline: none;
      cursor: ew-resize;
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 10px;
        height: 20px;
        background: ${fg1};
        border-radius: 0;
        cursor: ew-resize;
        border: none;
      }
      &::-moz-range-thumb {
        width: 10px;
        height: 20px;
        background: ${fg1};
        border-radius: 0;
        cursor: ew-resize;
        border: none;
      }
      &::-webkit-slider-runnable-track {
        height: 20px;
        border-radius: 0;
      }
      &::-moz-range-track {
        height: 20px;
        background: ${bg2};
        border-radius: 0;
        border: none;
      }
    }
    .s-readout {
      color: ${text2};
      font-size: 11px;
      height: 20px;
      line-height: 20px;
      width: 30px;
      min-width: 30px;
      flex: 0 0 30px;
      text-align: left;
      padding: 0 4px;
      overflow: hidden;
    }
    .s-readout:is(input) {
      border: none;
      border-radius: 0;
    }
  }

  /* ── Slider multiple: dual-thumb interval ── */
  .s-slider.multiple {
    align-items: center;
    .s-input { gap: .25rem; }
    .s-interval-track {
      flex: 1;
      height: 20px;
      margin: 0;
      background: ${bg2};
      background-image: linear-gradient(to right,
        transparent var(--low), ${fg1} var(--low),
        ${fg1} var(--high), transparent var(--high));
    }
    .s-interval-track input[type="range"] {
      height: 20px;
      &::-webkit-slider-thumb {
        width: 10px; height: 20px;
        background: ${text2};
        border-radius: 0; border: none;
      }
      &::-moz-range-thumb {
        width: 10px; height: 20px;
        background: ${text2};
        border-radius: 0; border: none;
      }
    }
    .s-readout {
      color: ${text2};
      font-size: 11px;
      height: 20px;
      line-height: 20px;
      width: 30px;
      min-width: 30px;
      flex: 0 0 30px;
      text-align: left;
      padding: 0 4px;
      overflow: hidden;
    }
  }

  /* ── Boolean: 18px square checkbox ── */
  .s-boolean {
    .s-input { align-self: center; }
    .s-track {
      width: 18px; height: 18px;
      border-radius: 0;
      background: ${bg2};
      border: none;
      position: relative;
      margin: 1px 0;
      &::after {
        content: '';
        position: absolute;
        width: 10px; height: 10px;
        border-radius: 0;
        top: 4px; left: 4px;
        background: transparent;
        box-shadow: none;
        transition: background 140ms;
      }
    }
    &:has(input:checked) .s-track {
      background: ${bg2};
      border: none;
      &::after {
        background: ${fg1};
        transform: none;
      }
    }
    &:has(input:focus-visible) .s-track {
      outline: 1px solid ${fg1};
    }
  }

  /* ── Select dropdown: full width, dual-triangle arrows ── */
  .s-select select {
    flex: 1;
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    background: ${bg2};
    background-image: url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='6' height='12' fill='${fg1}'><path d='M0 5 L3 1 L6 5Z'/><path d='M0 7 L3 11 L6 7Z'/></svg>`)}");
    background-repeat: no-repeat;
    background-position: right 4px center;
    border: none;
    border-radius: 0;
    color: ${text2};
    height: 20px;
    font-family: inherit;
    font-size: 11px;
    padding: 0 16px 0 5px;
    cursor: pointer;
    &:hover { background-color: ${bg2h}; }
    &:focus, &:active { background-color: ${bg2h}; }
    &:focus-visible { outline: none; }
    option { background: ${bg1}; color: ${text1}; }
  }

  /* ── Select checkboxes (multibox): reuse boolean .s-track pattern ── */
  .s-select.checkboxes {
    min-height: auto;
    padding: 0;
    align-items: baseline;
    .s-input {
      align-self: center;
      gap: 0;
      flex-wrap: wrap;
      label {
        display: inline-flex;
        align-items: center;
        color: ${text2};
        font-size: 11px;
        margin-right: 8px;
        cursor: pointer;
        input { position: absolute; opacity: 0; width: 0; height: 0; }
        .s-track {
          display: inline-block;
          width: 18px; height: 18px;
          border-radius: 0;
          background: ${bg2};
          border: none;
          position: relative;
          margin-right: 8px;
          flex-shrink: 0;
          vertical-align: -4px;
          &::after {
            content: '';
            position: absolute;
            width: 10px; height: 10px;
            border-radius: 0;
            top: 4px; left: 4px;
            background: transparent;
            transition: background 140ms;
          }
        }
        &:has(input:checked) .s-track::after {
          background: ${fg1};
        }
      }
    }
  }

  /* ── Color ── */
  .s-color-input {
    input[type="text"] {
      font-family: inherit;
      font-size: 11px;
      margin-left: calc(30px + 0.25rem);
    }
    input[type="color"] {
      -webkit-appearance: none;
      appearance: none;
      border: none;
      border-radius: 0;
      width: 30px;
      height: 20px;
      padding: 0;
      cursor: pointer;
      &::-webkit-color-swatch-wrapper { padding: 0; }
      &::-webkit-color-swatch { border: none; border-radius: 0; }
      &::-moz-color-swatch { border: none; border-radius: 0; }
    }
  }

  /* ── Button: flat, full-width, inverted on active ── */
  .s-button {
    .s-input { flex: 1; }
    button {
      width: 100%;
      background: ${bg2};
      border: none;
      border-radius: 0;
      color: ${text2};
      font-family: inherit;
      font-size: 11px;
      padding: 0 10px;
      height: 20px;
      cursor: pointer;
      filter: none;
      &:hover { background: ${bg2h}; color: ${text2}; filter: none; }
      &:active { background: ${text2}; color: ${bg2}; filter: none; }
    }
  }

  /* ── Number ── */
  .s-number {
    input[type="number"] {
      width: 60px;
      text-align: left;
    }
    .s-step { display: none; }
  }

  /* ── Text ── */
  .s-text input[type="text"] {
    flex: 1;
  }

  /* ── Folder ── */
  .s-folder {
    > summary {
      font-size: 11px;
      font-weight: ${weight};
      color: ${text2};
      padding: 4px 0;
      border-bottom: none;
      opacity: 1;
      &::after { display: none; }
    }
    .s-content {
      gap: 0;
    }
  }
}`

  return baseCSS + '\n' + overrides
}
