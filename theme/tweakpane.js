/**
 * tweakpane — calibrated to Tweakpane's default dark theme
 *
 * Signatures: monospace throughout, a fully greyscale blue-grey palette (no hue
 * accent — states shift only lightness), a razor-thin 2px slider track with a
 * 12px square knob, light-grey buttons with dark text, and a grid-dot folder mark.
 * Ref: https://tweakpane.github.io/docs/
 *
 * tweakpane(axes?) → CSS string
 */

import baseCSS from './base.js'

export default function tweakpane({
  shade = '#28292e',     // panel bg ≈ hsl(228 8% 17%) — matches Tweakpane's rgb(40,41,46)
  fg = '#bbbcc4',        // input-fg / slider fill ≈ hsl(228 8% 75%)
  button = '#adafb8',    // button bg ≈ hsl(228 7% 70%)
} = {}) {
  const [, fr, fgg, fb] = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(fg) || [, 'bb', 'bc', 'c4']
  const fgRgb = `${parseInt(fr, 16)},${parseInt(fgg, 16)},${parseInt(fb, 16)}`
  const field = `rgba(${fgRgb},0.1)`;   // input-bg / container-bg
  const fieldH = `rgba(${fgRgb},0.16)`;
  const label = `rgba(${fgRgb},0.7)`;
  const enc = c => encodeURIComponent(c);   // any CSS color, safe inside an SVG data-URI

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${fg};
  --field: ${field};
  --fg: ${fg};
  --u: 4px;
  --spacing: 1;
  --weight: 400;
  --r: 2px;
  color-scheme: dark;

  background: var(--bg);
  color: var(--fg);
  font: 11px/1.4 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  width: 256px;
  min-width: 0;
  max-width: 256px;
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,.2);

  /* ── Title ── */
  > summary, > .s-panel-title {
    color: ${label};
    font-weight: 500;
    padding: 4px 4px 6px;
    &::after { content: ''; width: 6px; height: 6px; margin-left: auto; border: 1px solid currentColor; opacity: .5; transition: transform .15s; }
  }
  &[open] > summary::after { transform: rotate(45deg); }
  .s-panel-content { gap: 4px; padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Row ── */
  .s-control { gap: 4px; padding: 0; min-height: 20px; align-items: center; &:has(> .s-input[inert]) > .s-label-group { opacity: .5; } }
  .s-label-group { width: 34%; min-width: 0; max-width: none; padding: 0 4px; line-height: 1.3; }
  .s-label { color: ${label}; font-weight: 500; }
  .s-hint { color: ${label}; opacity: .7; font-size: 10px; }
  .s-input { gap: 4px; align-items: center; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--field); color: var(--fg); border: none; border-radius: var(--r);
    height: 20px; padding: 0 4px; font: inherit;
    &::placeholder { color: ${label}; }
    &:hover { background: ${fieldH}; }
    &:focus { background: ${fieldH}; outline: none; }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: right; cursor: ew-resize; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } &:focus { cursor: text; } } .s-step { display: none; } }

  /* ── Vector: bare per-axis number fields, native's collapsed {x,y} layout ── */
  .s-vector {
    position: relative;
    .s-input { position: relative; gap: 2px; }
    .s-vec-axis { gap: 0; }
    input[type="number"] { text-align: right; cursor: ew-resize; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } &:focus { cursor: text; }
      /* native's tp-txtv-num left guide bar — same accent glyph as the slider's .s-readout */
      background: var(--field) linear-gradient(color-mix(in srgb, ${fg} 10%, transparent), color-mix(in srgb, ${fg} 10%, transparent)) 3px center / 2px 16px no-repeat; }
    /* Expand button: native's point2d picker glyph — a plus-shaped reticle with a corner dot,
       dark-on-light like the select's arrow, filling a 20px field-height square. margin-right
       widens the button→field gap to native's measured 4px (.tp-p2dv_b margin-right: 4px) —
       the 2px flex gap plus this 2px margin. */
    .s-vec-expand { -webkit-mask: none; mask: none; opacity: 1; width: 20px; height: 20px; margin-right: 2px; border-radius: var(--r);
      background: ${button} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M8 4v8M4 8h8' stroke='${enc(shade)}' stroke-width='2' fill='none'/%3E%3Ccircle cx='12' cy='12' r='1.2' fill='${enc(shade)}'/%3E%3C/svg%3E") center / 16px 16px no-repeat;
      &:hover, &.s-open { background-color: #c2c2c8; } }
    /* Picker: native opens the pad as a floating popup (.tp-popv) anchored to the expand
       BUTTON, not the row — measured live (button.getBoundingClientRect() vs the opened
       .tp-popv): top === button bottom (zero gap) and left ≈ button left (native bleeds the
       outer card 4px further left, an artifact of its own popup padding cancelling an inner
       padding layer that our flat single-box pad has no equivalent for — flush-left is the
       faithful match here). .s-input is the button's own flex box (button is its first,
       unpadded child), so anchoring to .s-input's own left edge — rather than .s-vector's,
       which spans the label too — lands exactly at the button regardless of label width.
       Flush against it (native's measured popup top === row height, i.e. zero gap), sized to
       native's picker (128×128), with native's popup chrome (panel-bg radius 6px + its shadow).
       Absolute + z-index lifts it out of flow so opening never reflows the rows below. Native's
       popup is opaque (a solid panel-bg card under the translucent crosshair wash) — layer the
       same fg wash over an opaque ${shade} backing so rows behind it don't show through. */
    .s-pad { position: absolute; top: 100%; left: 0; z-index: 10; width: 128px; height: 128px; margin: 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,.2);
      background: linear-gradient(rgba(${fgRgb},0.2), rgba(${fgRgb},0.2)), ${shade}; }
  }

  /* ── Slider: 2px track + 2px fill + 12px square knob ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 12px; }
    .s-track { height: 20px; margin: 0; }
    input[type="range"] {
      width: 100%; height: 16px; -webkit-appearance: none; appearance: none; cursor: pointer; background: transparent;
      background-image:
        linear-gradient(to right, var(--fg) 0 var(--p, 0%), transparent var(--p, 0%)),
        linear-gradient(${field} 0 0);
      background-size: calc(100% - 12px) 2px, calc(100% - 12px) 2px; background-position: center; background-repeat: no-repeat;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 2px; background: ${button}; cursor: pointer; }
      &::-moz-range-thumb { width: 12px; height: 12px; border-radius: 2px; border: none; background: ${button}; cursor: pointer; }
      &:hover::-webkit-slider-thumb, &:focus-visible::-webkit-slider-thumb { background: #c2c2c8; }
      &:hover::-moz-range-thumb, &:focus-visible::-moz-range-thumb { background: #c2c2c8; }
      &:focus-visible { outline: none; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: ${label}; white-space: nowrap; }
    .s-readout { position: relative; flex: 0 0 auto; width: 52px; min-width: 52px; text-align: right; color: var(--fg); border: none; border-radius: var(--r); height: 20px; padding: 0 4px; font-variant-numeric: tabular-nums; cursor: ew-resize;
      background: var(--field) linear-gradient(color-mix(in srgb, ${fg} 10%, transparent), color-mix(in srgb, ${fg} 10%, transparent)) 3px center / 2px 16px no-repeat;
      &:hover, &:focus { background-color: ${fieldH}; outline: none; }
      &:focus { cursor: text; } }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: #000; color: var(--fg); padding: 1px 5px; border-radius: 2px; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: 2px; margin: 9px 0; background: var(--field); position: relative; overflow: visible;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--fg); }
      input[type="range"]::-webkit-slider-thumb { width: 12px; height: 12px; border-radius: 2px; background: ${button}; }
      input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 2px; background: ${button}; } }
  }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer; background-color: ${button}; color: ${shade}; font-weight: 700;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M5 7h6l-3 3z' fill='${enc(shade)}'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 4px center; background-size: 16px 16px; padding-right: 20px;
      &:hover, &:focus { background-color: #c2c2c8; color: ${shade}; }
      option { background: #2f2f33; color: var(--fg); } }
    &.s-segmented { .s-input { gap: 2px; } button { flex: 1; background: var(--field); border: none; color: var(--fg); border-radius: var(--r); padding: 3px; font: inherit; &:hover { background: ${fieldH}; } &.s-selected { background: ${button}; color: ${shade}; } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: 3px; } label { display: flex; align-items: center; gap: 6px; cursor: pointer; } }
  }

  /* ── XY pad (point2d) — native's floating picker: shade-bg card radius echoed via the
     spread shadow (2px surface + 4px spread ≈ native's 6px popup radius), a small precise dot
     in place of native's 4px marker. Native's own source (tweakpane's .tp-p2dpv_* rules) draws
     THREE guide lines, confirmed via its live DOM (<line class="tp-p2dpv_ax"> ×2 + one
     "tp-p2dpv_l">) and its shipped CSS (opacity .1 / .5, stroke-dasharray: 1 — a 1px dash +
     1px gap hairline): two fixed axes through the pad center, plus one line from the center to
     the current point. A literal diagonal isn't reproducible here in pure CSS — this engine's
     trig functions (atan2/hypot) refuse our percentage --x/--y custom props as arguments — so
     the center→point line is a true diagonal: the control emits the vector as
     --angle/--dist (JS-computed, since CSS trig can't consume percentage vars),
     and .s-pad-x rotates from the pad center along it. The fixed axis pair
     (native's low-opacity .1 constant crosshair) rides a single ::before with
     two layered dashed backgrounds, painting under the line and the dot. ── */
  .s-pad { background: rgba(${fgRgb},0.2); border: none; border-radius: var(--r); box-shadow: 0 2px 4px rgba(0,0,0,.2);
    &::before { content: ''; position: absolute; inset: 0; pointer-events: none;
      background-image:
        repeating-linear-gradient(to right, rgba(${fgRgb},.1) 0 1px, transparent 1px 2px),
        repeating-linear-gradient(to bottom, rgba(${fgRgb},.1) 0 1px, transparent 1px 2px);
      background-size: 100% 1px, 1px 100%; background-position: center, center; background-repeat: no-repeat, no-repeat; }
    .s-pad-x, .s-pad-y { background: none; }
    .s-pad-x { top: 50%; left: 50%; right: auto; width: var(--dist, 0%); height: 1px;
      transform-origin: left center; transform: rotate(var(--angle, 0rad));
      background-image: repeating-linear-gradient(to right, rgba(${fgRgb},.5) 0 1px, transparent 1px 2px); }
    .s-pad-y { display: none; }
    .s-pad-dot { width: 5px; height: 5px; background: var(--fg); box-shadow: none; } }

  /* ── Boolean: input-bg square with a check ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { -webkit-appearance: none; appearance: none; position: static; opacity: 1; width: 20px; height: 20px; margin: 0; border-radius: var(--r); background: var(--field); cursor: pointer;
      &:hover { background: ${fieldH}; }
      &:checked { background: var(--field) url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='${enc(fg)}' stroke-width='2'/%3E%3C/svg%3E") center / 11px no-repeat; } }
    .s-track { display: none; }
  }

  /* ── Color: full rgba swatch — native's checkerboard + color-wash technique.
     The native input[type=color] is made invisible-but-clickable (opacity 0); a ::before
     paints the checker (bottom layer) with the full --color, alpha included, washed over it
     (top layer) — so partial alpha lets the checker show through, like native's swatch. ── */
  .s-color {
    &.s-picker .s-color-input { gap: 0; position: relative;
      input[type="color"] { position: static; width: 20px; height: 20px; padding: 0; border: none; border-radius: var(--r) 0 0 var(--r); cursor: pointer; opacity: 0; }
      &::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 20px; height: 20px; pointer-events: none; border-radius: var(--r) 0 0 var(--r);
        background: linear-gradient(var(--color), var(--color)), conic-gradient(#ddd 90deg, #fff 0 180deg, #ddd 0 270deg, #fff 0) 0 0 / 8px 8px; }
      input[type="text"] { flex: 1; min-width: 0; border-radius: 0 var(--r) var(--r) 0; } }
    &.s-rgba .s-color-input { gap: 4px; position: relative;
      input[type="color"] { width: 20px; height: 20px; padding: 0; border: none; border-radius: var(--r); cursor: pointer; opacity: 0; }
      &::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 20px; height: 20px; pointer-events: none; border-radius: var(--r);
        background: linear-gradient(var(--color), var(--color)), conic-gradient(#ddd 90deg, #fff 0 180deg, #ddd 0 270deg, #fff 0) 0 0 / 8px 8px; }
      .s-alpha { display: none; } input[type="text"] { flex: 1; min-width: 0; } }
    &.s-swatches button { width: 18px; height: 18px; border-radius: var(--r); border: none; &.s-selected { outline: 1px solid var(--fg); } }
  }

  /* ── Button: light pill, dark text ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    button { width: 100%; background: ${button}; color: ${shade}; border: none; border-radius: var(--r); height: 20px; font-weight: 700; &:hover { background: #c2c2c8; } &:active { background: #d2d2d8; } }
    &.s-secondary button, button.s-secondary { background: var(--field); color: var(--fg); &:hover { background: ${fieldH}; } }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 40px; max-height: 50vh; padding: 4px 6px; } }

  /* ── Folder: full-bleed header bar breaking out of panel padding + two-bar grip marker ── */
  .s-folder {
    position: relative;
    > summary { background: var(--field); color: ${label}; font-weight: 500; height: 24px; line-height: 24px; padding: 0 6px; margin: 0 calc(var(--u) * -1); width: calc(100% + var(--u) * 2); border-radius: 0; transition: background-color .1s;
      &:hover { background: ${fieldH}; }
      &::after { content: ''; width: 6px; height: 6px; border-radius: 2px; margin-left: auto; opacity: .5; transform: rotate(90deg);
        background: linear-gradient(to left, currentColor 0px, currentColor 2px, transparent 2px, transparent 4px, currentColor 4px); transition: transform .15s; } }
    &[open] > summary::after { transform: none; }
    /* Nesting rail: header-colored 4px band along the left edge of the open content */
    &[open]::before { content: ''; position: absolute; top: 24px; bottom: 0; left: calc(var(--u) * -1); width: 4px; background: var(--field); }
    .s-content { gap: 4px; padding: 4px 0 4px 4px; }
    /* Match native's fold timing: height+padding ease-in-out, opacity fades in lockstep on close,
       only after fully expanded on open (avoids an empty box collapsing/expanding visibly) */
    &:is(details)::details-content { transition: height .2s ease-in-out, opacity .2s linear, padding .2s ease-in-out; }
    &:is(details)[open]::details-content { transition: height .2s ease-in-out, opacity .2s linear .2s, padding .2s ease-in-out; }
  }
  /* Adjacent folders: each folder already ends in 4px of bottom padding, so the panel's
     row gap would double it — native collapses the gap between two consecutive blades. */
  .s-folder + .s-folder { margin-top: -4px; }

  /* ── Info / separator ── */
  .s-info .s-monitor { background: rgba(0,0,0,.2); border-radius: var(--r); padding: 0 4px; height: 20px; line-height: 20px; color: color-mix(in srgb, ${fg} 70%, transparent); font-variant-numeric: tabular-nums; }
  .s-separator { min-height: 0; height: 2px; background: ${field}; opacity: 1; margin: 0; }
}`

  return baseCSS + '\n' + overrides
}
