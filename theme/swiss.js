/**
 * Swiss theme — International Typographic Style
 *
 * Grid-based, ruled lines, bold condensed labels, no decoration.
 * swiss(axes?) → CSS string
 */

import baseCSS, { parseColor, resolveAccent, clamp } from './default.js'

const { min, max, round } = Math

export default function swiss({
  shade = '#4a4a4a',
  accent = '#ffffff',
  spacing = 1,
  weight = 500,
  roundness = 0,
  titleFont = `'Oswald', 'Arial Narrow', sans-serif`,
  labelFont = `'DM Sans', 'Helvetica', sans-serif`,
  valueFont = `'DM Serif Display', 'Georgia', serif`
} = {}) {
  const resolved = resolveAccent(accent, shade)
  const { L } = parseColor(shade)
  const dark = L < .6
  const fg = dark ? 'white' : 'black'
  const rule = dark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,.12)'
  const dim = dark ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.45)'
  const selectedBg = dark ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.15)'
  const check = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5L4.5 8.5L11 1.5' fill='none' stroke='${fg}' stroke-width='1.8' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`
  const chevUp = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 5L5 1.5L8.5 5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`
  const chevDown = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 1L5 4.5L8.5 1' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`

  const overrides = `.s-panel {
  --bg: transparent;
  --accent: ${resolved};
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: 0;
  color-scheme: ${dark ? 'dark' : 'light'};
  --rule: ${rule};
  --dim: ${dim};
  --r: 0px;
  --ri: 0px;
  --pad-x: calc(var(--u) * 2);
  --pad-y: calc(var(--u) * 1.5);
  --gap-x: calc(var(--u) * 2);
  --padding: var(--pad-y);

  font-family: system-ui, -apple-system, sans-serif;
  font-size: .75em;
  letter-spacing: .01em;
  border-radius: 0;
  padding: 0;

  /* ── Panel header ── */
  > summary, > .s-panel-title {
    font-family: ${titleFont};
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
  }

  /* ── Label: left cell with vertical rule ── */
  .s-label-group {
    min-width: 10ch; width: var(--label-w, 35%);
    max-width: none;
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
    line-height: 1.3;
  }

  /* ── Input: right cell ── */
  .s-input {
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
    font-size: 1rem;
    font-weight: ${weight};
    color: inherit;
    &::placeholder { color: var(--dim); }
    &:focus { outline: none; }
    &:focus-visible { outline: none; }
  }

  /* ═══ Number ═══ */
  .s-number {
    input[type="number"] {
      width: calc(var(--u) * 12);
      text-align: left;
      font-style: normal;
      font-weight: ${weight};
    }
    .s-step {
      button {
        padding: 0;
        font-size: 0;
        &::after {
          content: '';
          display: block;
          width: calc(var(--u) * 3);
          height: calc(var(--u) * 2);
          background: currentColor;
        }
        &.s-step-up::after {
          -webkit-mask: ${chevUp} center / contain no-repeat;
          mask: ${chevUp} center / contain no-repeat;
        }
        &.s-step-down::after {
          -webkit-mask: ${chevDown} center / contain no-repeat;
          mask: ${chevDown} center / contain no-repeat;
        }
      }
    }
  }

  /* ═══ Boolean ═══ */
  .s-boolean {
    .s-track {
      background: transparent;
      border: 1px solid var(--rule);
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

  /* ═══ Select ═══ */
  .s-select {

    /* ── dropdown ── */
    select {
      background: transparent;
      border: 1px solid var(--rule);
      border-radius: 0;
      box-shadow: none;
      outline: none;
      appearance: auto;
      cursor: pointer;
      &:focus-visible { outline: none; border-color: var(--accent); }
    }

    /* ── segmented ── */
    &.segmented {
      padding: 0;
      .s-input { gap: 0; padding: 0; }
      button {
        background: transparent;
        border: none;
        border-left: 1px solid var(--rule);
        border-radius: 0;
        box-shadow: none;
        outline: none;
        color: var(--dim);
        font-family: ${valueFont};
        font-weight: ${weight};
        text-transform: none;
        font-size: 1rem;
        letter-spacing: .02em;
        margin-left: -1px;
        padding: var(--pad-y) calc(var(--u) * 1.5);
        text-align: center;
        filter: none;
        &:first-child { margin-left: 0; border-left: none; }
        &:hover { color: inherit; border-color: var(--rule); filter: none; }
        &.selected {
          background: ${selectedBg};
          color: #fff;
          border-color: var(--rule);
        }
      }
      /* 3+ options → vertical stack */
      .s-input:has(button:nth-child(3)) {
        flex-direction: column;
        align-items: stretch;
        button {
          margin-left: 0;
          margin-top: -1px;
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

    /* ── checkboxes ── */
    &.checkboxes {
      .s-input { gap: 0; align-items: stretch; }
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: none; }
      .s-input {
        padding: 0;
        label {
          display: flex; align-items: center; gap: calc(var(--u) * 1.5);
          font-family: ${valueFont};
          font-size: 1rem;
          font-weight: ${weight};
          color: var(--dim);
          cursor: pointer;
          padding: var(--pad-y) var(--gap-x) var(--pad-y) 0;
          &:hover { border-color: var(--rule); }
          & + label { border-top: 1px solid var(--rule); }
          &::before {
            content: '';
            width: calc(var(--u) * 10);
            align-self: stretch;
            flex-shrink: 0;
            margin: calc(var(--pad-y) * -1) 0;
            padding: var(--pad-y) calc(var(--u) * 1.5);
            border-right: 1px solid var(--rule);
          }
          &:has(input:checked) {
            color: inherit;
            &::before {
              background: ${check} center / 14px no-repeat;
            }
          }
        }
      }
    }

    /* ── radio ── */
    &.radio {
      label {
        font-family: ${valueFont};
        opacity: 1;
        color: var(--dim);
        &.selected { color: inherit; }
      }
    }
  }

  /* ═══ Slider ═══ */
  .s-slider {
    input[type="range"] {
      accent-color: var(--accent);
    }
    .s-readout {
      color: var(--dim);
      font-size: smaller;
    }
  }

  /* ═══ Button ═══ */
  .s-button {
    padding: calc(var(--u) * 3) var(--pad-x) calc(var(--u) * 4);
    button {
      width: 100%;
      background: transparent;
      border: 2px solid currentColor;
      border-radius: 0;
      color: inherit;
      font-family: ${titleFont};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .06em;
      font-size: 1.25em;
      padding: calc(var(--u) * 3) calc(var(--u) * 5);
      box-shadow: none;
      filter: none;
      &:hover { background: ${selectedBg}; color: ${fg}; border-color: ${selectedBg}; filter: none; }
      &:active { filter: brightness(.9); }
    }

    /* ── secondary ── */
    &.secondary button, button.secondary {
      background: transparent;
      border: 1px solid var(--rule);
      border-radius: 0;
      box-shadow: none;
      color: var(--dim);
      &:hover { color: inherit; border-color: currentColor; background: transparent; filter: none; }
      &.selected { background: var(--accent); color: ${fg}; border-color: var(--accent); }
    }
  }

  /* ═══ Folder ═══ */
  .s-folder {
    > summary {
      font-family: ${labelFont};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .04em;
      font-size: 1em;
      border-bottom: 2px solid var(--rule);
      padding: calc(var(--u) * 2) var(--pad-x);
      opacity: 1;
      &::after { display: none; }
    }
    .s-content {
      gap: 0;
    }
  }

  /* ═══ Color ═══ */
  .s-color {
    .s-color-input {
      input[type="text"] { font-family: ui-monospace, monospace; font-size: .875em; }
      input[type="color"] { border: 1px solid var(--rule); border-radius: 0; }
    }
  }
}`

  return baseCSS + '\n' + overrides
}
