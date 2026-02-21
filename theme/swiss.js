/**
 * Swiss theme — International Typographic Style
 *
 * Grid-based, ruled lines, bold condensed labels, no decoration.
 * swiss(axes?) → CSS string
 */

import base, { parseColor, resolveAccent, clamp } from './default.js'

const { min, max, round } = Math

export default function swiss({
  shade = '#4a4a4a',
  accent = '#ffffff',
  spacing = 1,
  weight = 700,
  roundness = 0
} = {}) {
  const resolved = resolveAccent(accent, shade)
  const { L } = parseColor(shade)
  const dark = L < .6
  const fg = dark ? 'white' : 'black'
  const rule = dark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)'
  const ruleBold = dark ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.25)'
  const dim = dark ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.45)'
  const labelFont = `'Oswald', 'Arial Narrow', sans-serif`
  const valueFont = `'Playfair Display', 'Georgia', serif`

  const baseCSS = base({ shade, spacing, weight, accent: resolved, roundness })

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${resolved};
  --rule: ${rule};
  --rule-bold: ${ruleBold};
  --dim: ${dim};
  --r: 0px;
  --ri: 0px;
  --roundness: 0;
  --pad-x: calc(var(--u) * 3.5);
  --pad-y: calc(var(--u) * 1.75);
  --gap-x: calc(var(--u) * 2);

  font-family: system-ui, -apple-system, sans-serif;
  font-size: .75em;
  letter-spacing: .01em;
  border-radius: 0;
  padding: 0;

  /* ── Title ── */
  > summary, > .s-panel-title {
    font-family: ${labelFont};
    font-weight: 600;
    font-style: normal;
    text-transform: uppercase;
    letter-spacing: .06em;
    font-size: 2.25em;
    line-height: 1.1;
    text-align: center;
    display: block;
    padding: calc(var(--u) * 5) var(--pad-x) calc(var(--u) * 2);
    border-bottom: none;
    margin-bottom: 0;
    &::after { display: none; }
  }

  .s-panel-content {
    gap: 0;
    padding: 0;
  }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: 0;
  }

  /* ── Control row: no padding, stretch so vertical rule fills height ── */
  .s-control {
    border-top: 1px solid var(--rule);
    border-bottom: none;
    padding: 0;
    gap: 0;
    align-items: stretch;
    &:last-child { border-bottom: 1px solid var(--rule); }
  }

  /* ── Label: left cell with vertical rule ── */
  .s-label-group {
    min-width: 10ch; width: 35%; max-width: 24ch;
    padding: var(--pad-y) var(--gap-x) var(--pad-y) var(--pad-x);
    border-right: 1px solid var(--rule);
    display: flex;
    flex-direction: column;
    justify-content: center;
    line-height: var(--lh);
  }
  .s-label {
    font-family: ${labelFont};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .04em;
    font-size: .875em;
    line-height: 1.3;
  }

  /* ── Input: right cell ── */
  .s-input {
    padding: var(--pad-y) var(--pad-x) var(--pad-y) var(--gap-x);
    align-items: center;
  }

  /* ── Input elements: transparent, borderless ── */
  input[type="text"], input[type="number"], textarea, select {
    background: transparent;
    border: none;
    border-radius: 0;
    outline: none;
    box-shadow: none;
    padding: 0;
    font-family: ${valueFont};
    font-style: italic;
    font-size: 1.05em;
    color: inherit;
    &::placeholder { color: var(--dim); }
    &:focus { outline: none; }
    &:focus-visible { outline: none; }
  }

  /* ── Number: native spinner, no ± buttons ── */
  .s-number {
    input[type="number"] {
      width: calc(var(--u) * 14);
      text-align: right;
      font-style: normal;
      font-weight: ${weight};
    }
    .s-step { display: none; }
  }

  /* ── Boolean toggle: flat pill ── */
  .s-boolean {
    .s-track {
      background: transparent;
      border: 1px solid var(--rule-bold);
      border-radius: 999px;
      box-shadow: none;
      outline: none;
      &::after {
        background: var(--dim);
        box-shadow: none;
        border-radius: 50%;
      }
    }
    &:has(input:checked) .s-track {
      border-color: var(--accent);
      background: transparent;
      &::after {
        background: var(--accent);
        transform: translateX(calc(var(--u) * 5));
      }
    }
    &:has(input:focus-visible) .s-track {
      border-color: var(--accent);
      outline: none;
    }
  }

  /* ── Select ── */
  .s-select select {
    background: transparent;
    border: 1px solid var(--rule);
    border-radius: 0;
    box-shadow: none;
    outline: none;
    appearance: auto;
    cursor: pointer;
    &:focus-visible { outline: none; border-color: var(--accent); }
  }
  .s-select.buttons {
    padding: 0;
    .s-input { gap: 0; }
    button {
      background: transparent;
      border: 1px solid var(--rule);
      border-radius: 0;
      box-shadow: none;
      outline: none;
      color: var(--dim);
      font-family: ${labelFont};
      font-weight: 500;
      text-transform: none;
      font-size: .9375em;
      letter-spacing: .02em;
      margin-left: -1px;
      padding: calc(var(--u) * 1.5) calc(var(--u) * 2.5);
      text-align: left;
      filter: none;
      &:first-child { margin-left: 0; }
      &:hover { color: inherit; border-color: var(--rule-bold); filter: none; }
      &.selected {
        background: var(--accent);
        color: ${dark ? '#000' : '#fff'};
        border-color: var(--accent);
      }
    }
    /* 3+ options → vertical checkbox-like stack */
    .s-input:has(button:nth-child(3)) {
      flex-direction: column;
      button {
        margin-left: 0;
        margin-top: -1px;
        font-family: ${valueFont};
        font-style: italic;
        font-size: .875em;
        &:first-child { margin-top: 0; }
        &.selected {
          background: transparent;
          color: inherit;
          border-color: var(--rule);
          &::before { content: '\\2713\\2002'; }
        }
      }
    }
  }
  .s-select.radio {
    label {
      font-family: ${valueFont};
      opacity: 1;
      color: var(--dim);
      &.selected { color: inherit; }
    }
  }

  /* ── Slider ── */
  .s-slider {
    input[type="range"] {
      accent-color: var(--accent);
    }
    .s-readout {
      color: var(--dim);
      font-size: .8125em;
    }
  }

  /* ── Button (action): full-width outlined ── */
  .s-button {
    padding: calc(var(--u) * 3) var(--pad-x) calc(var(--u) * 4);
    border-top: none;
    button {
      width: 100%;
      background: transparent;
      border: 2px solid currentColor;
      border-radius: 0;
      color: inherit;
      font-family: ${labelFont};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .08em;
      font-size: 1.25em;
      padding: calc(var(--u) * 3) calc(var(--u) * 5);
      box-shadow: none;
      filter: none;
      &:hover { background: var(--accent); color: ${dark ? '#000' : '#fff'}; border-color: var(--accent); filter: none; }
      &:active { filter: brightness(.9); }
    }
  }
  .s-button.secondary button, .s-button button.secondary {
    background: transparent;
    border: 1px solid var(--rule);
    border-radius: 0;
    box-shadow: none;
    color: var(--dim);
    &:hover { color: inherit; border-color: currentColor; background: transparent; filter: none; }
    &.selected { background: var(--accent); color: ${dark ? '#000' : '#fff'}; border-color: var(--accent); }
  }

  /* ── Folder: ruled, no chevron ── */
  .s-folder {
    > summary {
      font-family: ${labelFont};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .04em;
      font-size: 1em;
      border-bottom: 2px solid var(--rule-bold);
      padding: calc(var(--u) * 2) var(--pad-x);
      opacity: 1;
      &::after { display: none; }
    }
    &[open] > summary {
      border-bottom: 2px solid var(--rule-bold);
    }
    .s-content {
      gap: 0;
    }
  }

  /* ── Color ── */
  .s-color-input {
    input[type="text"] { font-family: ui-monospace, monospace; font-size: .875em; }
    input[type="color"] { border: 1px solid var(--rule); border-radius: 0; }
  }
}`

  return baseCSS + '\n' + overrides
}
