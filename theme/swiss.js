/**
 * Swiss theme — International Typographic Style
 *
 * Grid rows, 1px rules, typographic hierarchy. No radius, no shadow.
 * swiss(axes?) → CSS string
 */

import baseCSS, { parseColor, resolveAccent } from './default.js'

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
  const resolved = resolveAccent(accent, shade)
  const { L } = parseColor(shade)
  const dark = L < .6

  const rule = dark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,.12)'
  const dim = dark ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.45)'
  const fill = dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.07)'
  const fillHover = dark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.11)'
  const checkStroke = dark ? 'white' : 'black'

  const check = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5L4.5 8.5L11 1.5' fill='none' stroke='${checkStroke}' stroke-width='1.8' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`
  const chevUp = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 5L5 1.5L8.5 5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`
  const chevDown = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 1L5 4.5L8.5 1' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`

  const overrides = `.s-panel {
  /* ── Tokens ── */
  --bg: transparent;
  --accent: ${resolved};
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: 0;
  --r: 0;
  color-scheme: ${dark ? 'dark' : 'light'};

  --rule: ${rule};
  --dim: ${dim};
  --fill: ${fill};
  --fill-hover: ${fillHover};

  --pad: calc(var(--u) * 2 * ${spacing});
  --padding: var(--pad);
  --label-w: 28%;
  --check-w: calc(var(--u) * 7);

  --fs-title: 2.625rem;
  --fs-subtitle: 0.9375rem;
  --fs-label: 0.825rem;
  --fs: 1rem;
  --fs-sm: 0.875rem;
  --fs-action: 1.2rem;

  --title-pad: calc(var(--u) * 5);
  --form-gap: calc(var(--u) * 13);
  --cta-gap: calc(var(--u) * 14);

  font-family: system-ui, -apple-system, sans-serif;
  font-size: inherit;
  border-radius: 0;
  padding: 0;

  /* ── Panel header ── */
  > summary, > .s-panel-title {
    font-family: ${titleFont};
    font-weight: 600;
    text-transform: uppercase;
    font-size: var(--fs-title);
    line-height: 1.1;
    text-align: center;
    display: block;
    padding: var(--title-pad) var(--pad) calc(var(--u) * 4);
    &::after { display: none; }

    & + .s-subtitle {
      font-family: ${valueFont};
      font-style: italic;
      font-size: var(--fs-subtitle);
      text-align: center;
      color: var(--dim);
      line-height: 1.25;
      max-width: 24ch;
      margin: 0 auto;
    }
  }

  .s-panel-content {
    gap: 0;
    padding: var(--form-gap) 0 0;
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
    font-family: ${labelFont};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .08em;
    line-height: 1.57;
    font-size: var(--fs-label);
  }

  .s-input {
    align-items: center;
  }

  /* ── Value typography (shared) ── */
  input[type="text"], input[type="number"], textarea, select, button {
    font-family: ${valueFont};
    font-size: var(--fs);
    font-weight: ${weight};
    color: inherit;
    border-radius: 0;
    box-shadow: none;
    filter: none;
  }

  input[type="text"], input[type="number"], textarea, select {
    background: transparent;
    border: none;
    outline: none;
    padding: var(--pad) calc(var(--u) * 4);
    &::placeholder { color: var(--dim); }
    &:focus-visible { outline: 1px solid var(--accent); outline-offset: -1px; }
  }

  /* ── Number ── */
  .s-number {
    input[type="number"] {
      width: calc(var(--u) * 12);
      text-align: left;
    }
    .s-step {
      margin-right: calc(var(--u) * 3);
      button {
        padding: 0;
        font-size: 0;
        color: inherit;
        opacity: 1;
        background: none;
        border: none;
        &::after {
          content: '';
          display: block;
          width: calc(var(--u) * 3);
          height: calc(var(--u) * 3);
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
      appearance: auto;
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
        gap: 0;
        align-items: stretch;
        padding: 0;
        border-left: 1px solid var(--rule);
      }
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: none; }
      .s-input label {
        display: flex;
        align-items: center;
        gap: calc(var(--u) * 1.5);
        font-family: ${valueFont};
        font-size: var(--fs-sm);
        cursor: pointer;
        min-height: calc(var(--u) * 6.5);
        & + label { border-top: 1px solid var(--rule); }
        &::before {
          content: '';
          width: var(--check-w);
          align-self: stretch;
          flex-shrink: 0;
          padding: calc(var(--u) * 1.5);
          border-right: 1px solid var(--rule);
        }
        &:hover::before { background: var(--fill-hover); }
        &:has(input:checked)::before {
          background-color: var(--fill);
          background-image: ${check};
          background-position: center;
          background-size: 14px;
          background-repeat: no-repeat;
        }
        &:has(input:checked):hover::before { background-color: var(--fill-hover); }
      }
    }

    /* radio — same fill model as segmented */
    &.s-radio {
      .s-input { flex-direction: column; gap: 0; align-items: stretch; padding: 0; }
      .s-input label {
        font-family: ${valueFont};
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
      font-size: var(--fs-sm);
    }
  }

  /* ── Button ── */
  .s-button {
    padding: var(--cta-gap) 0 calc(var(--u) * 4);
    button {
      width: 100%;
      background: var(--fill);
      border: 1px solid var(--rule);
      font-family: ${titleFont};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .06em;
      font-size: var(--fs-action);
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
      font-family: ${labelFont};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .04em;
      font-size: var(--fs-label);
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
