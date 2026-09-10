/**
 * Swiss theme — International Typographic Style
 *
 * Transparent grid rows, hairline rules, typographic hierarchy. No radius, no shadow.
 * Axes: shade/accent (ink + selection color), spacing, weight, size (grid
 * unit), hairline (rule weight), scale (type-size ramp), plus the three
 * font-role slots (title/label/value). Every rule, size, and font-size below
 * reads from the derived tokens in the var block — nothing is a bare literal.
 * swiss(axes?) → CSS string
 */

import metrics from './metrics.js'
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
  size = 1,       // grid unit (--u) multiplier
  hairline = 1,   // rule / border weight, px
  scale = 1,      // typographic scale multiplier
  titleFont = `'Oswald', 'Arial Narrow', sans-serif`,
  labelFont = `'DM Sans', 'Helvetica', sans-serif`,
  valueFont = `'DM Serif Display', 'Georgia', serif`,
  font,
} = {}) {
  const { L } = parseColor(shade)
  const dark = L < .6

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, {inset: 8, rowGap: 0, columnGap: 0, sectionGap: 56, panelPadding: 0, fontFamily: "system-ui, -apple-system, sans-serif"})}

  /* ── Tokens ── */
  --bg: transparent;
  --accent: ${resolveAccent(accent, shade)};

  --weight: ${weight};
  --roundness: 0;
  --r: 0;

  --hairline: ${hairline}px;
  --scale: ${scale};
  /* type scale — every font-size in the theme is one of these six steps */
  --size-title: calc(2.625rem * var(--scale) * var(--size));
  --size-subtitle: calc(0.9375rem * var(--scale) * var(--size));
  --size-label: calc(0.75rem * var(--scale) * var(--size));
  --size-value: calc(1rem * var(--scale) * var(--size));
  --size-readout: calc(0.875rem * var(--scale) * var(--size));
  --size-button: calc(1.2rem * var(--scale) * var(--size));
  --title-font: ${titleFont};
  --label-font: ${font || labelFont};
  --value-font: ${font || valueFont};
  color-scheme: ${dark ? 'dark' : 'light'};
  color: light-dark(black, white);

  --rule: light-dark(color-mix(in srgb, black 12%, transparent), white);
  --dim: light-dark(color-mix(in srgb, black 45%, transparent), color-mix(in srgb, white 50%, transparent));
  --fill: light-dark(color-mix(in srgb, black 7%, transparent), color-mix(in srgb, white 10%, transparent));
  --fill-hover: light-dark(color-mix(in srgb, black 11%, transparent), color-mix(in srgb, white 16%, transparent));
  --check-mark: ${checkMark};
  --chev-up: ${chevUp};
  --chev-down: ${chevDown};

  --label-w: 28%;


  border-radius: 0;
  padding: var(--panel-padding);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Panel header ── */
  > summary, > .s-panel-title {
    font-family: var(--title-font);
    font-weight: 600;
    text-transform: uppercase;
    font-size: var(--size-title);
    line-height: 1.1;
    text-align: center;
    display: block;
    padding: calc(var(--u) * 5) var(--pad) calc(var(--u) * 4);
    &::after { display: none; }

    & + .s-subtitle {
      font-family: var(--value-font);
      font-style: italic;
      font-size: var(--size-subtitle);
      text-align: center;
      color: var(--dim);
      line-height: 1.25;
      max-width: 24ch;
      margin: 0 auto;
    }
  }

  .s-panel-content {
    gap: var(--row-gap);
    padding: calc(var(--u) * 13) 0 0;
  }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: 0;
  }

  /* ── Grid row ── */
  .s-control {
    border-top: var(--hairline) solid var(--rule);
    padding: 0;
    gap: var(--column-gap);
    align-items: stretch;
  }

  .s-label-group {
    min-width: 12ch;
    width: var(--label-w);
    max-width: none;
    align-self: stretch;
    padding: var(--pad);
    border-right: var(--hairline) solid var(--rule);
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
    font-size: var(--size-label);
  }

  .s-input {
    gap: 0;
    align-items: stretch;
    align-self: stretch;
  }

  /* ── Value typography (shared) ── */
  input[type="text"], input[type="number"], textarea, select, button {
    font-family: var(--value-font);
    font-size: var(--size-value);
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
    &:focus-visible { outline: var(--hairline) solid var(--accent); outline-offset: calc(var(--hairline) * -1); }
  }

  input[type="number"] {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    background: transparent;
    border: none;
    outline: none;
    padding: var(--pad) calc(var(--u) * 4);
    font-variant-numeric: tabular-nums;
    &::placeholder { color: var(--dim); }
    &:focus-visible { outline: var(--hairline) solid var(--accent); outline-offset: calc(var(--hairline) * -1); }
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
      gap: var(--hairline);
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
    &.s-switch .s-input, &.s-toggle .s-input { align-items: center; padding: var(--pad) calc(var(--u) * 4); }
    &.s-switch .s-track { position: relative; flex: none; width: calc(var(--u) * 10); height: calc(var(--u) * 5);
      &::after { content: ''; position: absolute; top: 2px; bottom: 2px; left: 2px; width: calc(var(--u) * 4 - 2px); transition: left 120ms; }
    }
    &.s-switch:has(input:checked) .s-track::after { left: calc(var(--u) * 6 - 2px); }
    &.s-toggle .s-track { padding: 3px 12px; &::after { content: 'Off'; background: none; } }
    &.s-toggle:has(input:checked) .s-track::after { content: 'On'; background: none; }
    .s-track {
      background: transparent;
      border: var(--hairline) solid var(--rule);
      border-radius: 0;
      box-shadow: none;
      transition: background-color 120ms, transform 120ms;
      &::after {
        border-radius: 0;
        background: currentColor;
        box-shadow: none;
      }
    }
    .s-input:active .s-track { transform: scale(0.96); }
    &:has(input:checked) .s-track {
      background: var(--fill);
      border-color: var(--rule);
      &::after { background: currentColor; }
    }
    &:has(input:focus-visible) .s-track {
      outline: var(--hairline) solid var(--accent);
      outline-offset: calc(var(--hairline) * -1);
    }
  }

  /* ── Select ── */
  .s-select {

    select {
      border: var(--hairline) solid var(--rule);
      cursor: pointer;
      &:focus-visible { outline: var(--hairline) solid var(--accent); outline-offset: calc(var(--hairline) * -1); }
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
        border-left: var(--hairline) solid var(--rule);
        outline: none;
        cursor: pointer;
        letter-spacing: .02em;
        margin-left: calc(var(--hairline) * -1);
        padding: var(--pad) calc(var(--u) * 1.5);
        text-align: center;
        transition: background-color 120ms;
        &:first-child { margin-left: 0; border-left: none; }
        &:hover { background: var(--fill-hover); }
        &.s-selected {
          background: var(--fill);
          &:hover { background: var(--fill-hover); }
        }
      }
      .s-input:has(button:nth-child(3)) button {
        margin-left: 0;
        margin-top: calc(var(--hairline) * -1);
        border-left: none;
        border-top: var(--hairline) solid var(--rule);
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
        border-left: var(--hairline) solid var(--rule);
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
        font-size: var(--size-label);
        line-height: 1.57;
        text-transform: none;
        cursor: pointer;
        min-height: calc(var(--u) * 6.5);
        & + label { border-top: var(--hairline) solid var(--rule); }
        &::before {
          content: '';
          width: calc(var(--u) * 7);
          align-self: stretch;
          flex-shrink: 0;
          padding: calc(var(--u) * 1.5);
          border-right: var(--hairline) solid var(--rule);
          transition: background-color 120ms;
        }
        &:hover::before { background: var(--fill-hover); }
        &:has(input:checked)::before { background-color: var(--fill); }
        &:has(input:checked):hover::before { background-color: var(--fill-hover); }
        &::after {
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
          opacity: 0;
          transform: scale(.25);
          transition: opacity 140ms, transform 140ms;
        }
        &:has(input:checked)::after { opacity: 1; transform: scale(1); }
      }
    }

    /* radio — same fill model as segmented */
    &.s-radio {
      .s-input { flex-direction: column; gap: 0; align-items: stretch; padding: 0; }
      .s-input label {
        font-family: var(--value-font);
        padding: var(--pad) calc(var(--u) * 4);
        cursor: pointer;
        transition: background-color 120ms;
        & + label { border-top: var(--hairline) solid var(--rule); }
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
    .s-track { min-width: 0; }
    input[type="range"] { accent-color: var(--accent); width: 100%; min-width: 0; }
    .s-readout {
      flex: none; width: 6ch; padding: var(--pad) calc(var(--u) * 2); text-align: right;
      color: var(--dim);
      font-size: var(--size-readout);
      font-variant-numeric: tabular-nums;
    }
  }

  /* ── Button ── */
  .s-button {
    padding: var(--section-gap) 0 calc(var(--inset) * 2);
    button {
      width: 100%;
      background: var(--fill);
      border: var(--hairline) solid var(--rule);
      font-family: var(--title-font);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .06em;
      font-size: var(--size-button);
      /* optical lift: uppercase-only ink reads a hair low when geometrically
         centred — raise it 1px (reference buttons carry the same correction) */
      padding: calc(var(--u) * 4 - 1px) calc(var(--u) * 5) calc(var(--u) * 4 + 1px);
      cursor: pointer;
      transition: background-color 120ms, filter 120ms, transform 120ms;
      &:hover { background: var(--fill-hover); }
      &:active { filter: brightness(.9); transform: scale(0.96); }
      &:focus-visible { outline: var(--hairline) solid var(--accent); outline-offset: calc(var(--hairline) * -1); }
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
      font-size: var(--size-label);
      border-bottom: var(--hairline) solid var(--rule);
      padding: var(--pad);
      &::after { display: none; }
    }
    .s-content { gap: 0; }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input {
      input[type="color"] { position: static; flex: none; width: calc(var(--u) * 6); height: calc(var(--u) * 6); margin-left: calc(var(--u) * 4); }
      input[type="text"] { width: 0; }
    }
    .s-color-input {
      input[type="text"] { font-family: ui-monospace, monospace; }
      input[type="color"] { border: var(--hairline) solid var(--rule); padding: 0; }
    }
  }
}`

  return baseCSS + '\n' + overrides
}
