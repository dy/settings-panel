/**
 * Swiss theme — International Typographic Style
 *
 * Baseline grid: one atomic unit (--u, from the `size` axis) drives a single
 * shared leading (--leading, 6u) used as the line-height of every text line —
 * label or value, whatever the point size — so baselines lock across columns
 * regardless of the font-size tier. Every row is pad + leading + pad (--row,
 * 10u); every padding, gap, and hairline position is a calc() of --u.
 * Nothing vertical is a bare literal.
 *
 * Modular type scale: three tiers off one ratio (--ratio) and the `scale`
 * axis — label (÷ratio), value (the 1rem base), title (×ratio⁴). Hierarchy
 * comes from size + one bold weight (`weight` axis; reading text stays a
 * fixed book weight), never decoration — no italics, no serif-for-emphasis.
 *
 * Grotesque throughout: one workhorse sans for labels and values, a condensed
 * display cut for the title — the Univers/Akzidenz-Grotesk family-of-weights
 * idea, not a mix of unrelated typefaces. Tabular numerals on every value.
 * One signal red accent. Sharp corners, no shadow — `roundness` stays 0.
 *
 * Axes: shade/accent (ink + selection color), spacing, weight (bold tier),
 * size (grid unit), hairline (rule weight), scale (type ramp), plus the
 * three font-role slots (title/label/value). swiss(axes?) → CSS string
 */

import baseCSS from './base.js'
import { parseColor, resolveAccent } from './color.js'

const chevUp = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 5L5 1.5L8.5 5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`
const chevDown = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 1L5 4.5L8.5 1' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`

const checkMark = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5L4.5 8.5L11 1.5' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`

export default function swiss({
  shade = '#4a4a4a',
  accent = '#e30613', // Swiss signal red
  spacing = 1,
  weight = 700,       // bold tier; reading text stays a fixed book weight
  roundness = 0, // always sharp; kept for axis API
  size = 1,       // grid unit (--u) multiplier
  hairline = 1,   // rule / border weight, px
  scale = 1,      // typographic scale multiplier
  titleFont = `'Oswald', 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif`,
  labelFont = `'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif`,
  valueFont = `'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif`
} = {}) {
  const { L } = parseColor(shade)
  const dark = L < .6

  const overrides = `.s-panel {
  /* ── Tokens ── */
  --bg: transparent;
  --shade: ${shade};
  --accent: ${resolveAccent(accent, shade)};
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: 0;
  --r: 0;
  --u: calc(4px * ${size});
  --hairline: ${hairline}px;
  --scale: ${scale};

  /* baseline grid — every vertical value in this theme is a calc() of --u */
  --leading: calc(var(--u) * 6);                /* 24px @1 — the one line-height, label or value */
  --pad: calc(var(--u) * 2 * var(--spacing));   /* 8px @1 — vertical rhythm padding */
  --row: calc(var(--pad) * 2 + var(--leading)); /* 40px @1 — one grid row: pad + leading + pad */

  /* modular type scale — one ratio, three tiers, off --scale */
  --ratio: 1.25;
  --size-value: calc(1rem * var(--scale));                                                            /* 16px @1 — data / body tier */
  --size-label: calc(var(--size-value) / var(--ratio));                                                /* 12.8px @1 — caption tier */
  --size-title: calc(var(--size-value) * var(--ratio) * var(--ratio) * var(--ratio) * var(--ratio));   /* 39px @1 — display tier */
  /* Baseline lock: label and value share one line box (--leading) but each size
     centres its own half-leading, drifting their baselines apart by
     (size-value − size-label) · k, k = (ascent − descent)/2 of the value font
     (0.3125 measured for DM Sans). Value ink lifts by that difference so both
     tiers sit on ONE baseline per row — the grid's actual promise. */
  --baseline-comp: calc((var(--size-value) - var(--size-label)) * 0.3125);
  --size-subtitle: var(--size-label);
  --size-readout: var(--size-label);
  --size-button: var(--size-value);
  --title-font: ${titleFont};
  --label-font: ${labelFont};
  --value-font: ${valueFont};

  /* two weights only: fixed book for reading, axis-driven bold for chrome */
  --weight-book: 400;
  --weight-bold: var(--weight);
  --tracking: 0.06em;

  color-scheme: ${dark ? 'dark' : 'light'};
  color: light-dark(black, white);

  --rule: light-dark(color-mix(in srgb, black 12%, transparent), color-mix(in srgb, white 12%, transparent));
  --dim: light-dark(color-mix(in srgb, black 58%, transparent), color-mix(in srgb, white 66%, transparent)); /* ≥4.5:1 AA vs panel ground, both modes */
  --fill: light-dark(color-mix(in srgb, black 7%, transparent), color-mix(in srgb, white 10%, transparent));
  --fill-hover: light-dark(color-mix(in srgb, black 11%, transparent), color-mix(in srgb, white 16%, transparent));
  --check-mark: ${checkMark};
  --chev-up: ${chevUp};
  --chev-down: ${chevDown};
  --label-w: 47.5%; /* wide enough that multi-word labels (e.g. "Number of Desks Needed") stay one line */

  font-family: system-ui, -apple-system, sans-serif;
  font-size: inherit;
  border-radius: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;

  /* ── Panel header — flush-left, asymmetric composition (International
     Typographic Style rejects centered classical titling) ── */
  > summary, > .s-panel-title {
    font-family: var(--title-font);
    font-weight: var(--weight-bold);
    text-transform: uppercase;
    font-size: var(--size-title);
    line-height: calc(var(--u) * 10);
    text-align: left;
    display: block;
    padding: calc(var(--u) * 5) var(--pad) calc(var(--u) * 4);
    &::after { display: none; }

    & + .s-subtitle {
      font-family: var(--value-font);
      font-weight: var(--weight-book);
      font-size: var(--size-subtitle);
      text-align: left;
      color: var(--dim);
      line-height: var(--leading);
      max-width: 24ch;
      margin: 0;
      padding: 0 var(--pad);
    }
  }

  .s-panel-content {
    gap: 0;
    padding: calc(var(--leading) * 2) 0 0; /* 48px @1 — two leadings, the gap before the grid begins */
  }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: 0;
  }

  /* ── Grid row ──
     The hairline is painted as a box-shadow, not a border: a border-top
     would add var(--hairline) on top of the content box (border-box
     includes it in principle, but min-height is only a floor — content
     already fills the full --row, so the border pushes the rendered
     height to --row + hairline). A 0-blur/0-spread shadow draws the same
     crisp line bleeding into the row above without consuming any of
     this row's own box, so every row renders at exactly --row (the 4px
     module), never --row + 1. */
  .s-control {
    min-height: var(--row);
    box-shadow: 0 calc(var(--hairline) * -1) 0 0 var(--rule);
    padding: 0;
    gap: 0;
    align-items: stretch;
  }
  /* First row inside a folder: the summary's own bottom hairline already
     divides it from its content, so this row's top hairline would double it. */
  .s-folder > .s-content > .s-control:first-child { box-shadow: none; }

  .s-label-group {
    /* min-width floor measured in the label's OWN font (not the inherited
       system-ui/14px/700 the panel starts from) — otherwise 12ch resolves
       against the wrong glyph metrics and silently overrides --label-w. */
    font-family: var(--label-font);
    font-weight: var(--weight-bold);
    font-size: var(--size-label);
    min-width: 23ch;
    width: var(--label-w);
    max-width: none;
    align-self: stretch;
    padding: var(--pad);
    border-right: var(--hairline) solid var(--rule);
    display: flex;
    flex-direction: column;
    justify-content: center;
    line-height: var(--leading);
  }

  .s-label {
    font-family: var(--label-font);
    font-weight: var(--weight-bold);
    text-transform: uppercase;
    letter-spacing: var(--tracking);
    line-height: var(--leading);
    font-size: var(--size-label);
  }

  .s-input {
    gap: 0;
    align-items: stretch;
    align-self: stretch;
  }

  /* value ink sits on the label's baseline (--baseline-comp): ink-only shift,
     no reflow. Buttons pair with no label in-row, so they stay box-centred. */
  .s-text input[type="text"], .s-number input[type="number"], .s-textarea textarea,
  .s-select select, .s-slider .s-readout, .s-info .s-monitor,
  .s-select.s-radio .s-input label span,
  .s-select.s-checkboxes .s-input label span:not(.s-track) {
    transform: translateY(calc(-1 * var(--baseline-comp)));
  }

  /* ── Value typography (shared) ── */
  input[type="text"], input[type="number"], textarea, select, button {
    font-family: var(--value-font);
    font-size: var(--size-value);
    font-weight: var(--weight-book);
    line-height: var(--leading);
    font-variant-numeric: tabular-nums;
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
        border-left: none;
        box-shadow: 0 calc(var(--hairline) * -1) 0 0 var(--rule);
        &:first-child { box-shadow: none; }
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
        font-family: var(--value-font);
        font-weight: var(--weight-book);
        font-size: var(--size-value);
        line-height: var(--leading);
        cursor: pointer;
        /* text takes the standard value lead (flush with every other row's
           value column); the check glyph sits flush right instead — a second
           gutter rule here would duplicate the column divider a few u away. */
        padding: var(--pad) calc(var(--u) * 8) var(--pad) calc(var(--u) * 4);
        transition: background-color 120ms;
        /* box-shadow, not border-top: an added border would push this row's
           own rendered height past --row, same fix as .s-control above. */
        & + label { box-shadow: 0 calc(var(--hairline) * -1) 0 0 var(--rule); }
        &:hover { background: var(--fill-hover); }
        &:has(input:checked) { background: var(--fill);
          &:hover { background: var(--fill-hover); } }
        /* Checkbox glyph: an always-visible bordered square (the box itself
           is the affordance) that fills solid + reveals the checkmark cut-out
           only once checked — unchecked state must never read as a bare rule. */
        &::after {
          content: '';
          position: absolute;
          right: calc(var(--u) * 4);
          top: 50%;
          width: calc(var(--u) * 4);
          height: calc(var(--u) * 4);
          transform: translateY(-50%);
          background: transparent;
          border: var(--hairline) solid var(--rule);
          pointer-events: none;
          transition: background-color 140ms, border-color 140ms;
        }
        &:hover::after { border-color: var(--dim); }
        &:has(input:checked)::after {
          background: light-dark(black, white);
          border-color: light-dark(black, white);
          -webkit-mask: var(--check-mark) center / calc(var(--u) * 2.75) no-repeat;
          mask: var(--check-mark) center / calc(var(--u) * 2.75) no-repeat;
        }
      }
    }

    /* radio — same fill model as segmented */
    &.s-radio {
      .s-input { flex-direction: column; gap: 0; align-items: stretch; padding: 0; }
      .s-input label {
        font-family: var(--value-font);
        font-weight: var(--weight-book);
        font-size: var(--size-value);
        line-height: var(--leading);
        padding: var(--pad) calc(var(--u) * 4);
        cursor: pointer;
        transition: background-color 120ms;
        & + label { box-shadow: 0 calc(var(--hairline) * -1) 0 0 var(--rule); }
        &:hover { background: var(--fill-hover); }
        &.s-selected {
          background: var(--fill);
          &:hover { background: var(--fill-hover); }
        }
      }
    }
  }

  /* ── Slider — sharp rectilinear track + tick-mark thumb, no OS chrome.
     A ruler-caliper reading: a thin filled rule for the track (the same
     --rule hairline used for every row divider, just thicker) crossed by
     a solid rectangular tick for the thumb. Zero radius, zero shadow,
     one restrained red accent — same invariants as the rest of the grid. ── */
  .s-slider {
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: calc(var(--u) * 2);
      margin: 0;
      background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--rule) var(--p, 0%));
      border-radius: 0;
      cursor: pointer;
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: calc(var(--u) * 2);
        height: calc(var(--u) * 5);
        margin-top: calc((var(--u) * 2 - var(--u) * 5) / 2);
        background: var(--accent);
        border-radius: 0;
        cursor: pointer;
      }
      &::-moz-range-thumb {
        width: calc(var(--u) * 2);
        height: calc(var(--u) * 5);
        background: var(--accent);
        border: none;
        border-radius: 0;
        cursor: pointer;
      }
      /* outset, not inset like every other control: the track is only 2u
         tall, so an inward ring (the usual calc(--hairline) * -1) would sit
         entirely inside the fill and vanish. Outward keeps it legible while
         still tracking the hairline axis. */
      &:focus-visible { outline: var(--hairline) solid var(--accent); outline-offset: calc(var(--hairline) * 2); }
    }
    .s-readout {
      font-family: var(--value-font);
      color: var(--dim);
      font-size: var(--size-readout);
      font-variant-numeric: tabular-nums;
    }
  }

  /* ── Button ── */
  .s-button {
    padding: calc(var(--u) * 14) 0 calc(var(--u) * 4);
    button {
      width: 100%;
      background: var(--fill);
      appearance: none;
      -webkit-appearance: none;
      border: none;
      /* outline, not border: a real border adds var(--hairline) on every
         edge on top of the module-locked padding+leading box below. outline
         never participates in layout, so the rendered height stays exact. */
      outline: var(--hairline) solid var(--rule);
      outline-offset: calc(var(--hairline) * -1);
      font-family: var(--title-font);
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      letter-spacing: var(--tracking);
      font-size: var(--size-button);
      line-height: var(--leading);
      padding: calc(var(--u) * 4) calc(var(--u) * 5);
      cursor: pointer;
      transition: background-color 120ms, filter 120ms, transform 120ms;
      &:hover { background: var(--fill-hover); }
      &:active { filter: brightness(.9); transform: scale(0.96); }
      &:focus-visible { outline-color: var(--accent); }
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
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      letter-spacing: var(--tracking);
      font-size: var(--size-label);
      line-height: var(--leading);
      /* box-shadow, not border-bottom — keeps summary itself at exactly
         --row, and its first child row already suppresses its own top
         hairline above (.s-folder > .s-content > .s-control:first-child),
         so the seam gets this one line, never two stacked. */
      box-shadow: 0 var(--hairline) 0 0 var(--rule);
      padding: var(--pad);
      &::after { display: none; }
    }
    .s-content { gap: 0; }
  }

  /* ── Color ── */
  .s-color {
    .s-color-input {
      input[type="text"] { font-family: ui-monospace, monospace; }
      input[type="color"] { border: var(--hairline) solid var(--rule); padding: 0; }
    }
  }
}`

  return baseCSS + '\n' + overrides
}
