/**
 * Default theme — soft baseline on shared scaffold
 * default → base + soft visual layer
 */

export { lerp, clamp, parseColor, resolveAccent, normalizeHex } from './color.js'
import baseCSS from './base.js'

const chevron = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E")`

const softCSS = `@layer s-soft {
.s-panel {
  --bg: #f5f4f2;
  --accent: #2563eb;
  --roundness: 1;
  --r: calc(var(--u) * var(--roundness));

  background-color: var(--bg);
  color-scheme: light;
  color: color-mix(in oklab, var(--bg), light-dark(black, white) 85%);
  padding: calc(var(--u) * (3 + 2 * var(--spacing)));
  border-radius: var(--r);
  font-family: system-ui, -apple-system, sans-serif;
  min-width: 27ch;
  max-width: calc(var(--u) * 108);
  -webkit-font-smoothing: antialiased;

  > summary, > .s-panel-title {
    font-weight: calc(var(--weight) + 300);
    font-size: larger;
  }
  > summary {
    &::after {
      content: '';
      width: calc(var(--u) * 4);
      height: calc(var(--u) * 4);
      margin-left: auto;
      flex-shrink: 0;
      background: currentColor;
      -webkit-mask: ${chevron} center / contain no-repeat;
      mask: ${chevron} center / contain no-repeat;
      transition: transform 140ms;
    }
  }
  &[open] > summary::after { transform: rotate(-180deg); }

  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: calc(var(--u) * (1 + 2 * var(--spacing)));
  }

  .s-title {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: calc(var(--u) * 3.5);
    height: calc(var(--u) * 3.5);
    font-size: 10px;
    font-weight: 600;
    line-height: 1;
    border-radius: 50%;
    border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 30%);
    color: color-mix(in oklab, var(--bg), light-dark(black, white) 50%);
    cursor: help;
    flex-shrink: 0;
    &:hover + .s-title-text { opacity: 1; visibility: visible; transform: translateY(0); }
  }
  .s-title-text {
    position: absolute;
    left: 0;
    top: 100%;
    margin-top: var(--u);
    padding: calc(var(--u) * 1.5);
    font-size: smaller;
    line-height: 1.3;
    background: color-mix(in oklab, var(--bg), light-dark(black, white) 85%);
    color: light-dark(white, black);
    border-radius: var(--r);
    white-space: normal;
    width: max-content;
    max-width: 30ch;
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-2px);
    transition: opacity 100ms, visibility 100ms, transform 100ms;
  }

  input[type="text"], input[type="number"], select {
    height: calc(1lh + var(--pad) * 2);
  }
  select {
    padding-top: 0;
    padding-bottom: 0;
    cursor: pointer;
    option { font-family: system-ui, -apple-system, sans-serif; }
  }
  button {
    &:focus-visible { outline: 2px solid var(--accent); outline-offset: -1px; }
  }

  .s-boolean {
    align-items: center;
    .s-input { cursor: pointer; }
    &.s-toggle, &.s-switch {
      &:has(input:focus-visible) .s-track {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }
    }
    &.s-switch {
      .s-track {
        width: calc(var(--u) * (8 + var(--spacing) * 2));
        height: calc(var(--u) * 4 + var(--pad));
        background: color-mix(in oklab, var(--bg), light-dark(black, white) 20%);
        border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 15%);
        border-radius: 999px;
        position: relative;
        cursor: pointer;
        transition: background-color 200ms;
        margin: calc(var(--pad) / 2) 0;
        &::after {
          content: '';
          display: block;
          position: absolute;
          width: calc(var(--u) * 4);
          height: calc(var(--u) * 4);
          margin: auto calc(var(--pad) / 2);
          inset: 0;
          background: #fff;
          border-radius: 50%;
          transition: transform 200ms;
          box-shadow: 0 1px 2px color-mix(in oklab, light-dark(black, white), transparent 75%);
        }
      }
      &:has(input:checked) .s-track {
        background: var(--accent);
        border-color: var(--accent);
        &::after { right: 0; left: auto; }
      }
    }
    &.s-toggle {
      .s-track {
        padding: var(--pad) calc(var(--pad) * 2);
        background-color: color-mix(in oklab, var(--bg), light-dark(black, white) 5%);
        border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 20%);
        border-radius: var(--r);
        cursor: pointer;
        transition: background-color 140ms, color 140ms, border-color 140ms;
        height: calc(1lh + var(--pad) * 2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: smaller;
        &::after { content: 'Off'; }
        &:hover { filter: brightness(1.2); }
        &:active { filter: brightness(.95); }
      }
      &:has(input:checked) .s-track {
        background: var(--accent);
        color: white;
        border-color: transparent;
        &::after { content: 'On'; }
      }
    }
    &.s-checkbox {
      input[type="checkbox"] {
        width: calc(var(--u) * 4);
        height: calc(var(--u) * 4);
        cursor: pointer;
      }
      .s-track { display: none; }
    }
  }

  .s-number {
    input[type="number"] {
      flex: 1;
      text-align: right;
      -moz-appearance: textfield;
      &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    }
    .s-step {
      display: flex;
      flex-direction: column;
      gap: 1px;
      button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        padding: 0 calc(var(--u) * 1);
        color: inherit;
        opacity: .5;
        cursor: pointer;
        font-size: .625em;
        line-height: 1;
        &:hover { opacity: 1; }
      }
    }
  }

  .s-slider {
    align-items: center;
    .s-input { flex-direction: row; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: var(--lh); }
    .s-track {
      height: calc(var(--u) * 4);
      margin: calc(var(--u) * (0.5 + 1 * var(--spacing))) 0;
    }
    input[type="range"] { width: 100%; cursor: pointer; }
    .s-marks, .s-mark-labels {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
    }
    .s-marks { display: none; }
    .s-mark-label {
      position: absolute;
      top: 100%;
      transform: translate(-50%, 4px);
      font-size: smaller;
      text-align: center;
      white-space: nowrap;
      opacity: .5;
      &.s-active { opacity: 1; color: var(--accent); }
    }
    .s-readout {
      align-self: center;
      min-width: calc(4ch + var(--pad));
      font-size: smaller;
      padding-left: var(--pad);
      padding-right: 0;
    }
    .s-tooltip {
      position: absolute;
      bottom: 100%;
      transform: translateX(-50%);
      font-size: smaller;
      white-space: nowrap;
      pointer-events: none;
      background: color-mix(in oklab, var(--bg), light-dark(black, white) 85%);
      color: light-dark(white, black);
      padding: 2px 6px;
      border-radius: var(--r);
      margin-bottom: var(--u);
    }
    &.s-multiple {
      .s-interval-track {
        height: calc(var(--u) * 4);
        margin: calc(var(--u) * (0.5 + 1 * var(--spacing))) 0;
        background: linear-gradient(to right,
          transparent var(--low, 0%), color-mix(in oklab, var(--accent), transparent 75%) var(--low, 0%),
          color-mix(in oklab, var(--accent), transparent 75%) var(--high, 100%), transparent var(--high, 100%));
        border-radius: 2px;
      }
      .s-readout {
        align-self: center;
        min-width: calc(4ch + var(--pad));
        font-size: smaller;
        padding-left: var(--pad);
      }
    }
  }

  .s-select {
    &.s-dropdown select { flex: 1; cursor: pointer; }
    &.s-radio {
      .s-input { flex-direction: column; align-items: flex-start; gap: calc(var(--u) * var(--spacing)); }
      label { display: flex; align-items: center; gap: calc(var(--u) * 1.5); cursor: pointer; }
    }
    &.s-segmented {
      align-items: center;
      .s-input { gap: 0; }
      button {
        flex: 1;
        padding: var(--pad);
        background-color: color-mix(in oklab, var(--bg), light-dark(black, white) 5%);
        border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 20%);
        border-radius: 0;
        margin-left: -1px;
        color: inherit;
        font-size: smaller;
        transition: background-color 140ms, color 140ms, filter 140ms, border-color 140ms;
        &:first-child { margin-left: 0; border-top-left-radius: var(--r); border-bottom-left-radius: var(--r); }
        &:last-child { border-top-right-radius: var(--r); border-bottom-right-radius: var(--r); }
        &:hover { filter: brightness(1.2); }
        &:active { filter: brightness(.95); }
        &.s-selected { background: var(--accent); color: white; border-color: transparent; }
      }
    }
    &.s-checkboxes {
      .s-input { flex-direction: column; align-items: flex-start; gap: calc(var(--u) * var(--spacing)); }
      label { display: flex; align-items: center; gap: calc(var(--u) * 1.5); cursor: pointer; }
      .s-track { display: none; }
    }
  }

  .s-color {
    &.s-picker .s-color-input {
      input[type="color"] {
        width: calc(var(--u) * 5);
        height: calc(var(--u) * 5);
        left: calc(var(--u) * (0.5 + 1 * var(--spacing)));
      }
      input[type="text"] {
        padding-left: calc(var(--u) * 6 + var(--u) * 2 * var(--spacing));
      }
    }
    &.s-swatches {
      .s-input { flex-wrap: wrap; gap: var(--u); }
      button {
        width: calc(var(--u) * 5);
        height: calc(var(--u) * 5);
        padding: 0;
        border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 15%);
        border-radius: var(--r);
        &.s-selected { outline: 2px solid var(--accent); outline-offset: 1px; }
      }
    }
  }

  .s-text input[type="text"] { flex: 1; }

  .s-textarea {
    align-items: flex-start;
    textarea {
      flex: 1;
      resize: both;
      field-sizing: content;
      white-space: nowrap;
      overflow: auto;
      background-color: Canvas;
      min-height: calc(var(--lh) * 3);
      max-height: 50vh;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, currentColor 40%, transparent) transparent;
      &::-webkit-scrollbar { width: 4px; height: 4px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb { background: color-mix(in srgb, currentColor 40%, transparent); border-radius: 2px; }
      &::-webkit-scrollbar-corner { background-color: Canvas; }
    }
    &.s-code textarea { font-family: ui-monospace, monospace; font-size: smaller; }
  }

  .s-button {
    button {
      padding: calc(var(--u) * (1 + var(--spacing))) calc(var(--pad) * 2);
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--r);
      transition: background-color 140ms, filter 140ms;
      &:hover { filter: brightness(1.2); }
      &:active { filter: brightness(.95); }
      &:disabled { opacity: .35; cursor: not-allowed; }
    }
    &.s-secondary button, button.s-secondary {
      background-color: color-mix(in oklab, var(--bg), light-dark(black, white) 5%);
      border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 20%);
      color: inherit;
      &:hover { filter: brightness(1.2); }
      &:active { filter: brightness(.95); }
      &.s-selected { background: var(--accent); color: white; border-color: transparent; }
    }
  }

  .s-folder {
    > summary {
      padding: calc(var(--u) * 2) 0;
      border-bottom: 1px solid;
      opacity: .8;
      &::after {
        content: '';
        width: calc(var(--u) * 4);
        height: calc(var(--u) * 4);
        margin-left: auto;
        flex-shrink: 0;
        background: currentColor;
        -webkit-mask: ${chevron} center / contain no-repeat;
        mask: ${chevron} center / contain no-repeat;
        transition: transform 140ms;
      }
    }
    &[open] > summary { border-bottom: none; }
    &[open] > summary::after { transform: rotate(-180deg); }
    &.s-section {
      > summary { pointer-events: none; &::after { display: none; } }
      &:not([open]) > summary { border-bottom: none; }
    }
  }
  .s-content { padding: calc(var(--u) * 2 * var(--spacing)) 0; }
}
}`

export default baseCSS + '\n' + softCSS
