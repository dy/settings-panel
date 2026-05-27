/**
 * Swiss theme — International Typographic Style
 *
 * Grid rows, 1px rules, typographic hierarchy. No radius, no shadow.
 * swiss(axes?) → CSS string
 */

import baseCSS from './base.js'
import { parseColor, resolveAccent } from './color.js'

const chevUp = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 5L5 1.5L8.5 5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`
const chevDown = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 1L5 4.5L8.5 1' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`

const checkMark = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5L4.5 8.5L11 1.5' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`

export default function swiss({
  shade = '#4a4a4a',
  accent = '#ffffff',
  spacing = 1,
  weight = 500,
  roundness = 0, // always sharp; kept for axis API
  titleFont = `'Oswald', 'Arial Narrow', sans-serif`,
  labelFont = `'DM Sans', 'Helvetica', sans-serif`,
  valueFont = `'DM Serif Display', 'Georgia', serif`
} = {}) {
  const { L } = parseColor(shade)
  const dark = L < .6

  const overrides = `.s-panel {
  /* ── Tokens ── */
  --bg: transparent;
  --accent: ${resolveAccent(accent, shade)};
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: 0;
  --r: 0;
  --title-font: ${titleFont};
  --label-font: ${labelFont};
  --value-font: ${valueFont};
  color-scheme: ${dark ? 'dark' : 'light'};
  color: light-dark(black, white);

  --rule: light-dark(color-mix(in srgb, black 12%, transparent), white);
  --dim: light-dark(color-mix(in srgb, black 45%, transparent), color-mix(in srgb, white 50%, transparent));
  --fill: light-dark(color-mix(in srgb, black 7%, transparent), color-mix(in srgb, white 10%, transparent));
  --fill-hover: light-dark(color-mix(in srgb, black 11%, transparent), color-mix(in srgb, white 16%, transparent));
  --check-mark: ${checkMark};
  --chev-up: ${chevUp};
  --chev-down: ${chevDown};
  --pad: calc(var(--u) * 2 * var(--spacing));
  --label-w: 28%;

  font-family: system-ui, -apple-system, sans-serif;
  font-size: inherit;
  border-radius: 0;
  padding: 0;

  /* ── Panel header ── */
  > summary, > .s-panel-title {
    font-family: var(--title-font);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 2.625rem;
    line-height: 1.1;
    text-align: center;
    display: block;
    padding: calc(var(--u) * 5) var(--pad) calc(var(--u) * 4);
    &::after { display: none; }

    & + .s-subtitle {
      font-family: var(--value-font);
      font-style: italic;
      font-size: 0.9375rem;
      text-align: center;
      color: var(--dim);
      line-height: 1.25;
      max-width: 24ch;
      margin: 0 auto;
    }
  }

  .s-panel-content {
    gap: 0;
    padding: calc(var(--u) * 13) 0 0;
  }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: 0;
  }

  /* ── Grid row ── */
  .s-control {
    border-top: 1px solid var(--rule);
    padding: 0;
    gap: 0;
    align-items: stretch;
  }

  .s-label-group {
    min-width: 12ch;
    width: var(--label-w);
    max-width: none;
    align-self: stretch;
    padding: var(--pad);
    border-right: 1px solid var(--rule);
    display: flex;
    flex-direction: column;
    justify-content: center;
    line-height: var(--lh);
  }

  .s-label {
    font-family: var(--label-font);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .08em;
    line-height: 1.57;
    font-size: 0.75rem;
  }

  .s-input {
    gap: 0;
    align-items: stretch;
    align-self: stretch;
  }

  /* ── Value typography (shared) ── */
  input[type="text"], input[type="number"], textarea, select, button {
    font-family: var(--value-font);
    font-size: 1rem;
    font-weight: var(--weight);
    color: inherit;
    border-radius: 0;
    box-shadow: none;
    filter: none;
  }

  input[type="text"], textarea, select {
    flex: 1;
    align-self: stretch;
    width: auto;
    min-width: 0;
    height: auto;
    min-height: 0;
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    border: none;
    outline: none;
    padding: var(--pad) calc(var(--u) * 4);
    &::placeholder { color: var(--dim); }
    &:focus-visible { outline: 1px solid var(--accent); outline-offset: -1px; }
  }

  input[type="number"] {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    background: transparent;
    border: none;
    outline: none;
    padding: var(--pad) calc(var(--u) * 4);
    &::placeholder { color: var(--dim); }
    &:focus-visible { outline: 1px solid var(--accent); outline-offset: -1px; }
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  }

  /* ── Number ── */
  .s-number {
    .s-input {
      gap: calc(var(--u) * 2);
      padding-right: calc(var(--u) * 2);
      align-items: center;
    }
    input[type="number"] {
      flex: none;
      align-self: stretch;
      width: calc(var(--u) * 12);
      min-width: calc(var(--u) * 12);
      text-align: left;
    }
    .s-step {
      display: flex;
      flex-direction: column;
      gap: 1px;
      flex: none;
      margin-left: auto;
      button {
        flex: none;
        width: calc(var(--u) * 3);
        height: calc(var(--u) * 3);
        padding: 0;
        font-size: 0;
        color: inherit;
        opacity: 1;
        background: none;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        &::after {
          content: '';
          display: block;
          width: calc(var(--u) * 3);
          height: calc(var(--u) * 3);
          background: currentColor;
        }
        &.s-step-up::after {
          -webkit-mask: var(--chev-up) center / contain no-repeat;
          mask: var(--chev-up) center / contain no-repeat;
        }
        &.s-step-down::after {
          -webkit-mask: var(--chev-down) center / contain no-repeat;
          mask: var(--chev-down) center / contain no-repeat;
        }
      }
    }
  }

  /* ── Boolean ── */
  .s-boolean {
    .s-track {
      background: transparent;
      border: 1px solid var(--rule);
      border-radius: 0;
      box-shadow: none;
      &::after {
        border-radius: 0;
        background: currentColor;
        box-shadow: none;
      }
    }
    &:has(input:checked) .s-track {
      background: var(--fill);
      border-color: var(--rule);
      &::after { background: currentColor; }
    }
    &:has(input:focus-visible) .s-track {
      outline: 1px solid var(--accent);
      outline-offset: -1px;
    }
  }

  /* ── Select ── */
  .s-select {

    select {
      border: 1px solid var(--rule);
      cursor: pointer;
      &:focus-visible { outline: 1px solid var(--accent); outline-offset: -1px; }
    }

    /* segmented — horizontal or vertical, same selection model */
    &.s-segmented {
      .s-input {
        gap: 0;
        padding: 0;
        align-items: stretch;
        &:has(button:nth-child(3)) { flex-direction: column; }
      }
      button {
        flex: 1;
        align-self: stretch;
        background: transparent;
        border: none;
        border-left: 1px solid var(--rule);
        outline: none;
        cursor: pointer;
        letter-spacing: .02em;
        margin-left: -1px;
        padding: var(--pad) calc(var(--u) * 1.5);
        text-align: center;
        &:first-child { margin-left: 0; border-left: none; }
        &:hover { background: var(--fill-hover); }
        &.s-selected {
          background: var(--fill);
          &:hover { background: var(--fill-hover); }
        }
      }
      .s-input:has(button:nth-child(3)) button {
        margin-left: 0;
        margin-top: -1px;
        border-left: none;
        border-top: 1px solid var(--rule);
        &:first-child { margin-top: 0; border-top: none; }
      }
    }

    /* checkboxes — fill in gutter column only */
    &.s-checkboxes {
      align-items: baseline;

      .s-label-group {
        align-self: auto;
        justify-content: flex-start;
        border-right: none;
      }

      .s-input {
        align-self: stretch;
        flex-direction: column;
        gap: 0;
        align-items: stretch;
        padding: 0;
        border-left: 1px solid var(--rule);
      }
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: none; }
      .s-input label {
        position: relative;
        display: flex;
        align-items: center;
        gap: calc(var(--u) * 1.5);
        font-family: var(--label-font);
        font-weight: 600;
        font-size: 0.75rem;
        line-height: 1.57;
        text-transform: none;
        cursor: pointer;
        min-height: calc(var(--u) * 6.5);
        & + label { border-top: 1px solid var(--rule); }
        &::before {
          content: '';
          width: calc(var(--u) * 7);
          align-self: stretch;
          flex-shrink: 0;
          padding: calc(var(--u) * 1.5);
          border-right: 1px solid var(--rule);
        }
        &:hover::before { background: var(--fill-hover); }
        &:has(input:checked)::before { background-color: var(--fill); }
        &:has(input:checked):hover::before { background-color: var(--fill-hover); }
        &:has(input:checked)::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: calc(var(--u) * 7);
          background: light-dark(black, white);
          -webkit-mask: var(--check-mark) center / 14px no-repeat;
          mask: var(--check-mark) center / 14px no-repeat;
          pointer-events: none;
        }
      }
    }

    /* radio — same fill model as segmented */
    &.s-radio {
      .s-input { flex-direction: column; gap: 0; align-items: stretch; padding: 0; }
      .s-input label {
        font-family: var(--value-font);
        padding: var(--pad) calc(var(--u) * 4);
        cursor: pointer;
        & + label { border-top: 1px solid var(--rule); }
        &:hover { background: var(--fill-hover); }
        &.s-selected {
          background: var(--fill);
          &:hover { background: var(--fill-hover); }
        }
      }
    }
  }

  /* ── Slider ── */
  .s-slider {
    input[type="range"] { accent-color: var(--accent); }
    .s-readout {
      color: var(--dim);
      font-size: 0.875rem;
    }
  }

  /* ── Button ── */
  .s-button {
    padding: calc(var(--u) * 14) 0 calc(var(--u) * 4);
    button {
      width: 100%;
      background: var(--fill);
      border: 1px solid var(--rule);
      font-family: var(--title-font);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .06em;
      font-size: 1.2rem;
      padding: calc(var(--u) * 4) calc(var(--u) * 5);
      cursor: pointer;
      &:hover { background: var(--fill-hover); }
      &:active { filter: brightness(.9); }
      &:focus-visible { outline: 1px solid var(--accent); outline-offset: -1px; }
    }
    &.s-secondary button, button.s-secondary {
      background: transparent;
      color: inherit;
      &:hover { background: var(--fill-hover); }
      &.s-selected { background: var(--fill); }
    }
  }

  /* ── Folder ── */
  .s-folder {
    > summary {
      font-family: var(--label-font);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .04em;
      font-size: 0.75rem;
      border-bottom: 1px solid var(--rule);
      padding: var(--pad);
      &::after { display: none; }
    }
    .s-content { gap: 0; }
  }

  /* ── Color ── */
  .s-color {
    .s-color-input {
      input[type="text"] { font-family: ui-monospace, monospace; }
      input[type="color"] { border: 1px solid var(--rule); padding: 0; }
    }
  }
}`

  return baseCSS + '\n' + overrides
}
