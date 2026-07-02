/**
 * Control-panel theme — freeman-lab/control-panel reproduction
 *
 * Signatures: a flat monospace (Hack) panel — every corner square, every
 * control a hard-edged row, values landing at native's own numbers (a
 * 35px readout/swatch/switch strip, a 10px slider thumb, an 18px checkbox
 * box). shade sets bg + light/dark via OKLCH; accent resolves an explicit
 * color or falls back to a lightness shift off shade.
 *
 * Every size below is a multiple of --u (the 5px grid unit, already used
 * for spacing) or one of two named leftover constants (--fs the fixed
 * 11px type size, --line the 1px focus-ring/hairline weight) — so the
 * whole control layer scales together off one grid rather than scattered
 * literals. Colors were already tokenized (--bg/--bg2/--fg/--text/--dim/
 * --accent, derived via parseColor below); this pass finishes the size
 * side the same way. The inline SVG select-arrow can't read CSS custom
 * properties, so it takes dimColor's raw string via encodeURIComponent —
 * same pattern as tweakpane/uil.
 *
 * Axes: shade, accent, spacing, weight, roundness. Like swiss, this
 * replica is deliberately always square — roundness is accepted for axis-
 * signature parity but (as in the original) never drives a radius.
 *
 * base scaffold + control-panel visual layer.
 * controlPanel(axes?) → CSS string
 */

import baseCSS from './base.js'
import { parseColor, resolveAccent, clamp } from './color.js'

export default function controlPanel({
  shade = '#232323',
  accent,
  spacing = 1,
  weight = 400,
  roundness = 0
} = {}) {
  const { L, C, H } = parseColor(shade)
  const dark = L < .6
  const resolved = resolveAccent(accent, shade) || `oklch(${clamp(dark ? L + 0.22 : L - 0.22, 0, 1).toFixed(3)} ${C.toFixed(4)} ${H.toFixed(1)})`

  // ── Derived tokens (colors) ──
  const bgStep = 0.08
  const bg2L = clamp(dark ? Math.max(L + bgStep, 0.15) : L - bgStep, 0, 1)
  const bg2hL = clamp(bg2L + 0.02, 0, 1)
  const bg1 = shade
  const bg2 = `oklch(${bg2L.toFixed(3)} ${C.toFixed(4)} ${H.toFixed(1)})`
  const bg2h = `oklch(${bg2hL.toFixed(3)} ${C.toFixed(4)} ${H.toFixed(1)})`
  const fg1 = dark ? '#707070' : '#696969'
  const text1 = dark ? '#ebebeb' : '#242424'
  const dimL = parseColor(text1).L + (bg2L - parseColor(text1).L) * 0.15
  const dimColor = `oklch(${clamp(dimL, 0, 1).toFixed(3)} ${C.toFixed(4)} ${H.toFixed(1)})`

  const overrides = `.s-panel {
  --u: 5px;
  --bg: ${bg1};
  --bg2: ${bg2};
  --bg2h: ${bg2h};
  --fg: ${fg1};
  --text: ${text1};
  --dim: color-mix(in oklab, var(--text), var(--bg2) 15%);
  --accent: ${resolved};
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: ${roundness};
  --r: 0;
  --hover: brightness(1.08);

  /* ── Derived tokens (size) — every control dimension is one of these,
     itself a multiple of --u, so overriding --u rescales the whole panel.
     --fs / --line are the two fixed leftovers (native's type size and
     hairline weight) that aren't unit multiples. ── */
  --fs: 11px;
  --line: 1px;
  --gap: calc(var(--u) * var(--spacing));
  --lh-tight: calc(var(--u) * 3);   /* 15px — input/textarea line-height */
  --thumb: calc(var(--u) * 2);      /* 10px — slider thumb / checkbox+switch dot */
  --box: calc(var(--u) * 3.6);      /* 18px — checkbox square / switch track height */
  --wide: calc(var(--u) * 7);       /* 35px — readout / color-swatch / switch width */
  --pad-sm: calc(var(--u) * .8);    /* 4px  — readout pad, select-arrow offset, checkbox label gap */
  --pad-xs: calc(var(--u) * .4);    /* 2px  — textarea v-pad, scrollbar-thumb border */
  color-scheme: ${dark ? 'dark' : 'light'};

  background-color: var(--bg);
  font-family: 'Hack', monospace;
  font-size: var(--fs);
  line-height: var(--lh);
  color: var(--text);
  border-radius: 0;
  padding: calc(var(--u) * (2 + 1 * var(--spacing)));
  min-width: 0;
  -webkit-font-smoothing: antialiased;

  /* ── Panel header ── */
  > summary, > .s-panel-title {
    display: block;
    font-size: var(--fs);
    font-weight: ${weight};
    color: var(--dim);
    text-transform: uppercase;
    text-align: center;
    height: var(--lh);
    line-height: var(--lh);
    padding: 0;
    &::after { display: none; }
    cursor: pointer;
    &:focus-visible { outline: var(--line) solid var(--accent); outline-offset: 0; }
  }

  .s-panel-content { gap: var(--gap); padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: calc(var(--u) * var(--spacing));
  }

  /* ── Layout ── */
  .s-control { gap: var(--gap); padding: 0; position: relative; align-items: center; }
  .s-label-group {
    min-width: 0;
    width: 36%;
    max-width: none;
    flex: 0 0 36%;
    padding: 0;
    line-height: 1.1;
    height: auto;
  }
  .s-label { font-size: var(--fs); overflow-wrap: break-word; }
  .s-input { gap: var(--gap); align-items: center; }

  /* ── Interactive elements ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--bg2);
    border: none;
    border-radius: 0;
    outline: none;
    color: var(--dim);
    font-family: inherit;
    font-size: var(--fs);
    transition: background-color 120ms;
    &::placeholder { color: var(--fg); }
    &:hover { background-color: var(--bg2h); }
    &:focus { background-color: var(--bg2h); outline: none; }
    &:focus-visible { outline: var(--line) solid var(--accent); outline-offset: 0; }
  }
  input[type="text"], input[type="number"], select {
    padding: 0 var(--u);
    height: var(--lh);
    line-height: var(--lh-tight);
  }
  input[type="color"] {
    -webkit-appearance: none;
    appearance: none;
    flex: none;
    width: var(--wide);
    height: var(--lh);
    padding: 0;
    border: none;
    cursor: pointer;
    &:focus-visible { outline: var(--line) solid var(--accent); outline-offset: 0; }
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
      padding: var(--pad-xs) var(--u);
      line-height: var(--lh-tight);
      field-sizing: content;
      white-space: nowrap;
      overflow: auto;
      resize: both;
      &::-webkit-scrollbar { width: calc(var(--u) * 1.6); height: calc(var(--u) * 1.6); }
      &::-webkit-scrollbar-track { background: var(--bg2); }
      &::-webkit-scrollbar-thumb {
        background: var(--accent);
        border-radius: 0;
        border: var(--pad-xs) solid var(--bg2);
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
    font-size: var(--fs);
    height: var(--lh);
    cursor: pointer;
    transition: background-color 120ms, filter 120ms, transform 120ms;
    &:hover { background-color: var(--bg2h); }
    &:active { transform: scale(0.96); }
    &:focus-visible { outline: var(--line) solid var(--accent); outline-offset: 0; }
  }

  /* ── Slider ── */
  .s-slider {
    align-items: center;
    .s-readout {
      color: var(--dim);
      font-size: var(--fs);
      height: var(--lh);
      line-height: var(--lh);
      width: var(--wide);
      min-width: var(--wide);
      flex: 0 0 var(--wide);
      text-align: left;
      padding: 0 var(--pad-sm);
      overflow: hidden;
      font-variant-numeric: tabular-nums;
    }
    &:not(.s-multiple) .s-track {
      margin: 0;
      height: var(--lh);
      input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: var(--lh);
        background: var(--bg2);
        border-radius: 0;
        outline: none;
        cursor: ew-resize;
        transition: background-color 120ms;
        &:hover { background-color: var(--bg2h); }
        &:focus-visible { outline: var(--line) solid var(--accent); outline-offset: 0; }
        &::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: var(--thumb); height: var(--lh); background: var(--accent); border-radius: 0; cursor: ew-resize; border: none; box-shadow: none; transition: filter 120ms; &:hover { filter: var(--hover); } }
        &::-moz-range-thumb { width: var(--thumb); height: var(--lh); background: var(--accent); border-radius: 0; cursor: ew-resize; border: none; transition: filter 120ms; &:hover { filter: var(--hover); } }
        &::-webkit-slider-runnable-track { -webkit-appearance: none; appearance: none; height: var(--lh); border-radius: 0; box-shadow: none; }
        &::-moz-range-track { height: var(--lh); background: var(--bg2); border-radius: 0; border: none; }
      }
    }
    &.s-multiple .s-interval-track {
      height: var(--lh);
      margin: 0;
      background: var(--bg2);
      cursor: ew-resize;
      transition: background-color 120ms;
      &:hover { background-color: var(--bg2h); }
      &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: var(--low, 0%);
        width: calc(var(--high, 100%) - var(--low, 0%));
        background: var(--accent);
        pointer-events: none;
      }
      input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        pointer-events: none;
        cursor: ew-resize;
        &:focus-visible { outline: var(--line) solid var(--accent); outline-offset: 0; }
        &::-webkit-slider-thumb { pointer-events: all; cursor: ew-resize; }
        &::-moz-range-thumb { pointer-events: all; cursor: ew-resize; }
        &::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: var(--thumb); height: var(--lh); background: var(--accent); border-radius: 0; border: none; box-shadow: none; transition: filter 120ms; &:hover { filter: var(--hover); } }
        &::-moz-range-thumb { width: var(--thumb); height: var(--lh); background: var(--accent); border-radius: 0; border: none; transition: filter 120ms; &:hover { filter: var(--hover); } }
        &::-webkit-slider-runnable-track { -webkit-appearance: none; appearance: none; background: transparent; box-shadow: none; }
      }
    }
  }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    cursor: pointer;
    .s-input { align-self: center; cursor: pointer; }
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-track { border-radius: 0; border: none; box-shadow: none; background: var(--bg2); position: relative; transition: background-color 120ms; }
    .s-input:hover .s-track { background-color: var(--bg2h); }
    &:has(input:focus-visible) .s-track { outline: var(--line) solid var(--accent); outline-offset: 0; }
    &.s-checkbox {
      .s-track {
        display: block;
        width: var(--box);
        height: var(--box);
        margin: calc((var(--lh) - var(--box)) / 2) 0;
        &::after {
          content: '';
          position: absolute;
          inset: auto;
          margin: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: var(--thumb);
          height: var(--thumb);
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          transition: background 140ms;
        }
      }
      &:has(input:checked) .s-track::after { background: var(--s-color, var(--accent)); }
    }
    &.s-switch {
      .s-track {
        width: var(--wide);
        height: var(--box);
        margin: calc((var(--lh) - var(--box)) / 2) 0;
        &::after {
          content: '';
          position: absolute;
          inset: auto;
          margin: 0;
          top: 50%;
          left: calc((var(--box) - var(--thumb)) / 2);
          transform: translateY(-50%);
          width: var(--thumb);
          height: var(--thumb);
          border-radius: 0;
          background: var(--accent);
          box-shadow: none;
          transition: transform 140ms, background 140ms, filter 140ms;
        }
      }
      &:has(input:checked) .s-track::after {
        inset: auto;
        top: 50%;
        left: calc((var(--box) - var(--thumb)) / 2);
        right: auto;
        transform: translate(calc(var(--wide) - var(--thumb) - (var(--box) - var(--thumb))), -50%);
        background: var(--s-color, var(--accent));
      }
      .s-input:hover .s-track::after { filter: var(--hover); }
    }
    &.s-toggle {
      .s-track {
        cursor: pointer;
        width: auto;
        height: var(--lh);
        margin: 0;
        padding: 0 var(--u);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 120ms, color 120ms;
        &::after { font-size: var(--fs); background: none; box-shadow: none; position: static; width: auto; height: auto; border-radius: 0; }
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
      background-image: url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='6' height='12' fill='${dimColor}'><path d='M0 5 L3 1 L6 5Z'/><path d='M0 7 L3 11 L6 7Z'/></svg>`)}");
      background-repeat: no-repeat;
      background-position: right var(--pad-sm) center;
      padding: 0 calc(var(--u) * 3.2) 0 var(--u);
      cursor: pointer;
      option { background: var(--bg); color: var(--text); }
    }
    &.s-checkboxes {
      min-height: auto;
      padding: 0;
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track {
        width: var(--box);
        height: var(--box);
        border-radius: 0;
        border: none;
        box-shadow: none;
        background: var(--bg2);
        position: relative;
        display: inline-block;
        flex-shrink: 0;
        transition: background-color 120ms;
        &::after {
          content: '';
          position: absolute;
          inset: auto;
          margin: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: var(--thumb);
          height: var(--thumb);
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
          gap: var(--pad-sm);
          color: var(--dim);
          font-size: var(--fs);
          margin-right: calc(var(--u) * 1.6);
          cursor: pointer;
        }
      }
      label:hover .s-track { background-color: var(--bg2h); }
      label:has(input:checked) .s-track::after { background: var(--s-color, var(--accent)); }
      label:has(input:focus-visible) .s-track { outline: var(--line) solid var(--accent); outline-offset: 0; }
    }
    &.s-segmented button { padding: 0 var(--u); &.s-selected { background-color: var(--accent); color: var(--bg); &:hover { filter: var(--hover); } } }
  }

  /* ── Color ── */
  .s-color.s-picker .s-color-input {
    gap: var(--u);
    input[type="color"] { position: static; }
    input[type="text"] { flex: 1; min-width: 0; width: auto; }
  }

  /* ── Button ── */
  .s-button {
    .s-input { flex: 1; }
    button { background-color: var(--accent); color: var(--bg); width: 100%; padding: 0 calc(var(--u) * 2); &:hover { filter: var(--hover); } }
    &.s-secondary button, button.s-secondary { background-color: var(--bg2); color: var(--dim); &:hover { background-color: var(--bg2h); filter: none; } }
  }

  /* ── Number ── */
  .s-number {
    input[type="number"] { width: calc(var(--u) * 12); text-align: left; font-variant-numeric: tabular-nums; }
    .s-step { display: none; }
  }

  /* ── Text ── */
  .s-text input[type="text"] { flex: 1; }

  /* ── Folder ── */
  .s-folder {
    > summary {
      font-size: var(--fs);
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
