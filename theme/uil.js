/**
 * uil — calibrated to lo-th/uil
 *
 * Signatures: a tightly-framed monospace panel (#37383d) where each control can
 * carry its own accent color, pill-toggle booleans, thin recessed slider tracks
 * with a light fill, and a #308AFF blue for active/selected states.
 * Ref: https://lo-th.github.io/uil/
 *
 * uil(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveAccent } from './color.js'

export default function uil({
  shade = '#37383d',
  accent = '#308AFF',
  fill = '#dddddd',
} = {}) {
  const acc = resolveAccent(accent, shade)
  const text = '#dddddd';
  const label = '#cccccc';
  const face = '#3c3c3c';
  const border = '#4c4c4c';

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --slide: ${fill};
  --u: 4px;
  --spacing: 1;
  --weight: 400;
  --r: 6px;
  color-scheme: dark;

  /* native darkens rows by a flat -15/channel step off content (#37383d → #28292e), not a
     percentage mix — percentage mixing (even in oklab) desaturates toward neutral as it
     nears black, which is the "warmer" drift; a flat channel offset keeps the same absolute
     blue bias, reading cold at any lightness. */
  background: rgb(from var(--bg) calc(r - 15) calc(g - 15) calc(b - 15));
  color: ${text};
  font: 11px/1.4 'Roboto Mono', ui-monospace, Menlo, Courier, monospace;
  width: 240px;
  min-width: 0;
  max-width: 240px;
  border: 2px solid var(--bg);
  border-radius: 0;
  padding: 0;

  /* ── Title (left-aligned, dot-grid mark right) ── */
  > summary, > .s-panel-title {
    background: transparent;
    color: ${text}; font-weight: 700; justify-content: flex-start; height: 24px; padding: 0 8px; position: relative;
    &::after { display: none; }
  }
  .s-panel-content { gap: 0; padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Row ── */
  .s-control { gap: 0; padding: 0; min-height: 24px; align-items: center; background: transparent; &:hover:not(:has(.s-control:hover)) { background: var(--bg); } }
  .s-label-group { flex: 0 0 80px; width: 80px; min-width: 0; max-width: none; padding: 0 0 0 8px; }
  .s-label { color: ${label}; font-weight: 400; }
  .s-hint { color: #999; font-size: 10px; }
  .s-input { flex: 0 0 152px; width: 152px; gap: 4px; align-items: center; &[inert] { opacity: 1; } }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: rgba(0,0,0,.2); color: ${text}; border: 1px dashed ${border}; border-radius: var(--r);
    height: 22px; padding: 0 6px; font: inherit;
    &::placeholder { color: #888; }
    &:focus { outline: 1px solid ${acc}; outline-offset: -1px; }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: left; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Slider: recessed thin track, light fill, small thumb ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 12px; }
    .s-input { gap: 8px; }
    .s-track { flex: 0 0 104px; height: 22px; margin: 0; }
    input[type="range"] {
      width: 100%; height: 22px; -webkit-appearance: none; appearance: none; cursor: pointer; border-radius: 0;
      background:
        linear-gradient(to right, var(--slide) 0 var(--p, 0%), transparent var(--p, 0%)) center / 100% 2px no-repeat,
        linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2)) center / 100% 4px no-repeat;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 9px; height: 9px; border-radius: 2px; background: var(--slide); cursor: ew-resize; }
      &::-moz-range-thumb { width: 9px; height: 9px; border: none; border-radius: 2px; background: var(--slide); cursor: ew-resize; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: #999; white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: 32px; min-width: 32px; text-align: left; background: transparent; color: var(--slide); border: 0; border-radius: 0; height: 22px; padding: 0; font-variant-numeric: tabular-nums; }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: #000; color: ${text}; padding: 1px 5px; border-radius: var(--r); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: 22px; margin: 0; border-radius: var(--r); background: rgba(0,0,0,.25); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--slide); opacity: .6; } }
  }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer;
      background-color: ${face}; border-style: solid;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg' fill='%23ddd'%3E%3Crect width='6' height='2'/%3E%3Crect y='4' width='6' height='2'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 9px center; background-size: 6px 6px; padding-right: 20px;
      option { background: #2c2d31; color: ${text}; } }
    &.s-segmented { .s-input { gap: 3px; } button { flex: 1; background: ${face}; border: 1px solid ${border}; color: ${text}; border-radius: var(--r); padding: 3px; font: inherit; &:hover { background: #5c5c5c; } &.s-selected { background: ${acc}; color: #fff; border-color: ${acc}; } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: 3px; } label { display: flex; align-items: center; gap: 6px; cursor: pointer; } }
  }

  /* ── Boolean: pill toggle ── */
  .s-boolean {
    align-items: center;
    .s-input { justify-content: flex-end; padding-right: 2px; }
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &.s-switch, &.s-toggle {
      .s-track { width: 36px; height: 17px; border-radius: 10px; background: rgba(0,0,0,.3); border: 2px solid rgba(0,0,0,.3); position: relative; cursor: pointer;
        &::after { content: ''; position: absolute; top: 50%; left: 0; width: 16px; height: 13px; transform: translateY(-50%); border-radius: 10px; background: ${face}; transition: left .15s, background .15s; } }
      &:has(input:checked) .s-track { &::after { left: calc(100% - 17px); background: #eee; } }
      &:has(input:focus-visible) .s-track { outline: 1px solid ${acc}; outline-offset: 1px; }
    }
    &.s-checkbox { input[type="checkbox"] { -webkit-appearance: none; appearance: none; position: static; opacity: 1; width: 16px; height: 16px; margin: 0; border-radius: 3px; background: rgba(0,0,0,.3); border: 1px solid ${border}; cursor: pointer; &:checked { background: ${acc}; } } .s-track { display: none; } }
  }

  /* ── Color: full-width tinted field with the hex over it (uil style) ── */
  .s-color {
    &.s-picker .s-color-input { gap: 0; position: relative; border: 1px solid ${border}; border-radius: var(--r); overflow: hidden;
      input[type="color"] { position: absolute; inset: 0; width: 100%; height: 22px; padding: 0; border: none; cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } }
      input[type="text"] { position: relative; flex: 1; background: transparent; color: #111; border: 0; mix-blend-mode: normal; font-family: 'Roboto Mono', monospace; padding-left: 8px; height: 22px; } }
    &.s-rgba .s-color-input { gap: 4px; input[type="color"] { flex: none; width: 28px; height: 22px; border: 1px solid ${border}; border-radius: var(--r); } input[type="text"] { flex: 1; } }
    &.s-swatches button { width: 18px; height: 18px; border-radius: var(--r); border: 1px solid ${border}; &.s-selected { outline: 1px solid ${acc}; } }
  }

  /* ── Button: pill ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: 4px; }
    button { width: 100%; background: ${face}; color: ${text}; border: 1px solid ${border}; border-radius: var(--r); height: 22px; &:hover { background: #5c5c5c; } &:active, &.s-selected { background: ${acc}; color: #fff; border-color: ${acc}; } }
    &.s-secondary button, button.s-secondary { background: rgba(0,0,0,.2); }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 44px; max-height: 50vh; padding: 4px 6px; } }

  /* ── Folder: two-bar pause/equals marker, lighter un-darkened bg so it reads as a section ── */
  .s-folder {
    > summary { color: #ccc; font-weight: 400; padding: 4px 4px; background: ${shade};
      &::after { content: ''; width: 6px; height: 6px; margin-left: auto; background: repeating-linear-gradient(to bottom, ${text} 0 2px, transparent 2px 4px); transition: transform .15s; } }
    &[open] > summary::after { transform: rotate(90deg); }
    .s-content { gap: 0; padding-left: 0; }
  }

  /* ── Knob / XY pad: uil renders these stacked (label above, control centered, value below) ── */
  .s-knob, .s-xy {
    flex-direction: column; align-items: center; gap: 2px; padding: 4px 0;
    .s-label-group { width: auto; flex: none; padding: 0; }
    .s-input { flex: none; justify-content: center; }
  }
  /* uil prints a live "x,y" readout flush under the pad, centered, same weight as labels;
     tighten the row's slack so total height still lands on native's 130px now that the
     readout occupies the space the old placeholder padding reserved for it. */
  .s-xy { gap: 0; padding: 1px 0 0; }
  .s-xy .s-input { gap: 0; }
  .s-pad-val { flex-basis: 100%; text-align: center; font-size: 11px; line-height: 1.2; font-weight: 400; opacity: 1; color: ${text}; }
  /* dial diam:40 in uil, but only the inner ~53% is the solid face — the rest is
     dead space for the tick ring; a 270° dash ring (9° step, 288° span → 9° gap
     past each end-stop) rotates as one static-looking layer, the needle alone turns.
     native draws the face as an SVG circle (r34) with a stroke (width 8, straddling
     the fill/transparent edge — half sinks into the face, half spills past it) — an
     inset+outset box-shadow pair of matching width reproduces that centered ring
     without eating into the layout box the way a border would. Ticks then start
     past a real gap beyond the ring's outer edge (never touching it): both figures
     scale off the face radius at native's own ratio (stroke half ≈ 11.8% of r,
     gap ≈ 5.9% of r), so a 24px dial gets a 1.41px ring and a ~0.7px gap before
     the tick band (pushed out via the ::before inset, tick width unchanged). */
  .s-knob-wrap { flex-direction: column; gap: 4px; }
  .s-knob-dial {
    width: 24px; height: 24px; background: ${face}; border: none; position: relative;
    box-shadow: inset 0 0 0 1.41px rgba(0,0,0,.3), 0 0 0 1.41px rgba(0,0,0,.3);
    &::before { content: ''; position: absolute; inset: -4.12px; border-radius: 50%; pointer-events: none;
      background: repeating-conic-gradient(from -144deg, ${text} 0 4deg, transparent 4deg 9deg);
      -webkit-mask:
        radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px)),
        conic-gradient(from -144deg, #000 0 288deg, transparent 288deg 360deg);
      -webkit-mask-composite: source-in;
      mask:
        radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px)),
        conic-gradient(from -144deg, #000 0 288deg, transparent 288deg 360deg);
      mask-composite: intersect;
      opacity: .6; }
    i { background: ${text}; width: 2px; top: 12%; height: 9%; }
  }
  .s-knob-val { font-size: 11px; opacity: 1; }
  /* same padding-box trick as the knob: the frame reads as native's dark rgba(0,0,0,.2)
     outline against the panel backdrop, not washed out over the face. native's own SVG
     (viewBox 256, rendered 100×100 → 0.3906 scale) draws the frame+face box at 78.125px
     (200 units) with a 3.90625px (10-unit) frame around a 70.3125px (180-unit) face —
     smaller than the 100px slot it sits in. Margin restores that slot so the row still
     totals 130px like before. */
  .s-pad { width: 78.125px; height: 78.125px; margin: 10.9375px 0; background: ${face}; background-clip: padding-box; border: 3.90625px solid rgba(0,0,0,.2); border-radius: 0; box-sizing: border-box;
    .s-pad-x, .s-pad-y { background: rgba(0,0,0,.2); }
    .s-pad-dot { width: 6px; height: 6px; background: transparent; border: 2px solid ${text}; box-shadow: none; }
  }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: ${text}; font-variant-numeric: tabular-nums; }
  .s-separator { background: rgba(0,0,0,.3); opacity: 1; }

  /* ── Close bar: native renders this as the panel's own trailing row (same width,
     same background/border box), text swapping open/close with fold state — it's not
     page chrome. Kept visual-only: the summary already handles click-to-fold at the
     top, and a ::after can neither bind its own click handler nor track :hover scoped
     to just its own box (only the originating element's :hover reaches a pseudo, which
     would wrongly light this up while hovering any other row) — both need a real DOM
     node, out of reach from a CSS-only theme. */
  &::after {
    content: 'close'; display: flex; align-items: center; justify-content: center;
    height: 24px; background: transparent; color: ${text}; font: inherit;
  }
  &:not([open])::after { content: 'open'; }
}`

  return baseCSS + '\n' + overrides
}
