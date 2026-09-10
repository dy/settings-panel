/**
 * uil — calibrated to lo-th/uil
 *
 * Custom shades derive missing color roles; explicit role axes take precedence.
 *
 * Signatures: a tightly-framed monospace panel (#37383d) where each control can
 * carry its own accent color, pill-toggle booleans, thin recessed slider tracks
 * with a light fill, and a #308AFF blue for active/selected states.
 * Ref: https://lo-th.github.io/uil/
 *
 * Axes: shade (panel bg), accent (active/selected blue), fill (slider/thumb
 * tint), text (primary foreground), face (control surface grey), border
 * (hairline grey). Everything else — row darken, hover lift, tooltip/overlay
 * tones — derives from those six in the var block below.
 *
 * uil(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveAccent, resolveRoles } from './color.js'

export default function uil({
  shade = '#37383d',
  accent = '#308AFF',
  fill,
  text,
  face,
  border,
  size = 1,
  spacing = 1,
  font,
} = {}) {
  const native = shade === '#37383d'
  const roles = resolveRoles(shade)
  fill ??= native ? '#dddddd' : roles.fg
  text ??= native ? '#dddddd' : roles.fg
  face ??= native ? '#3c3c3c' : roles.surface2
  border ??= native ? '#4c4c4c' : roles.border

  const acc = resolveAccent(accent, shade)
  const enc = c => encodeURIComponent(c)   // any CSS color, safe inside an SVG data-URI

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, {fontSize: 11, fontFamily: "'Roboto Mono', ui-monospace, Menlo, Courier, monospace", lineHeight: 15.4, controlHeight: 22, inset: 6, rowGap: 0, columnGap: 0, sectionGap: 4, panelPadding: 0})}

  --bg: ${shade};
  --accent: ${acc};
  --slide: ${fill};
  --text: ${text};
  --face: ${face};
  --border: ${border};

  --weight: 400;
  --r: calc(6 * var(--length));

  /* native darkens rows by a flat -15/channel step off content (#37383d → #28292e), not a
     percentage mix — percentage mixing (even in oklab) desaturates toward neutral as it
     nears black, which is the "warmer" drift; a flat channel offset keeps the same absolute
     blue bias, reading cold at any lightness. Hover lift on the face tone uses the same
     flat-channel trick (+32/channel). Light palettes reverse both offsets. */
  --row: rgb(from var(--bg) calc(r + ${roles.dark ? -15 : 15}) calc(g + ${roles.dark ? -15 : 15}) calc(b + ${roles.dark ? -15 : 15}));
  --face-hover: rgb(from var(--face) calc(r + ${roles.dark ? 32 : -32}) calc(g + ${roles.dark ? 32 : -32}) calc(b + ${roles.dark ? 32 : -32}));

  /* Native signature greys; custom palettes derive labels and control surfaces
     from the corresponding roles. Tooltip and picker wells keep their own contrast. */
  --label: ${native ? '#cccccc' : text};
  --hint: ${native ? '#999' : roles.fgMuted};
  --placeholder: ${native ? '#888' : roles.fgMuted};
  --on-accent: ${native ? '#fff' : resolveRoles(shade, accent).onAccent};
  --option-bg: ${native ? '#2c2d31' : face};
  --toggle-on: ${native ? '#eee' : fill};
  --tooltip-bg: #000;
  --picker-fg: #111;
  --well-1: rgba(0,0,0,.2);
  --well-2: rgba(0,0,0,.25);
  --well-3: rgba(0,0,0,.3);

  color-scheme: ${roles.dark ? 'dark' : 'light'};

  background: var(--row);
  color: var(--text);

  width: calc(240 * var(--length));
  min-width: 0;
  max-width: 100%;
  border: 2px solid var(--bg);
  border-radius: 0;
  padding: var(--panel-padding);

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Title (left-aligned, dot-grid mark right) ── */
  > summary, > .s-panel-title {
    background: transparent;
    color: var(--text); font-weight: 700; justify-content: flex-start; height: calc(24 * var(--length)); padding: 0 calc(8 * var(--space)); position: relative;
    &::after { display: none; }
  }
  .s-panel-content { gap: var(--row-gap); padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Row ── */
  .s-control { gap: var(--column-gap); padding: 0; min-height: calc(24 * var(--length)); align-items: center; background: transparent; &:hover:not(:has(.s-control:hover)) { background: var(--bg); } }
  .s-label-group { flex: 0 0 34%; width: 34%; min-width: 0; max-width: none; padding: 0 0 0 calc(8 * var(--space)); }
  .s-label { color: var(--label); font-weight: 400; }
  .s-hint { color: var(--hint); font-size: calc(10 * var(--length)); }
  .s-input { flex: 1; width: 0; min-width: 0; gap: calc(4 * var(--space)); align-items: center; &[inert] { opacity: 1; } }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--well-1); color: var(--text); border: 1px dashed var(--border); border-radius: var(--r);
    height: var(--control-height); padding: 0 calc(6 * var(--space)); font: inherit;
    &::placeholder { color: var(--placeholder); }
    &:focus { outline: 1px solid var(--accent); outline-offset: -1px; }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: left; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Slider: recessed thin track, light fill, small thumb ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(12 * var(--space)); }
    .s-input { gap: calc(8 * var(--space)); }
    .s-track { flex: 1; min-width: 0; height: var(--control-height); margin: 0; }
    input[type="range"] {
      width: 100%; height: var(--control-height); -webkit-appearance: none; appearance: none; cursor: pointer; border-radius: 0;
      background:
        linear-gradient(to right, var(--slide) 0 var(--p, 0%), transparent var(--p, 0%)) center / 100% 2px no-repeat,
        linear-gradient(var(--well-1), var(--well-1)) center / 100% 4px no-repeat;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(9 * var(--length)); height: calc(9 * var(--length)); border-radius: calc(2 * var(--length)); background: var(--slide); cursor: ew-resize; }
      &::-moz-range-thumb { width: calc(9 * var(--length)); height: calc(9 * var(--length)); border: none; border-radius: calc(2 * var(--length)); background: var(--slide); cursor: ew-resize; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: calc(10 * var(--length)); color: var(--hint); white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: calc(32 * var(--length)); min-width: calc(32 * var(--length)); text-align: left; background: transparent; color: var(--slide); border: 0; border-radius: 0; height: var(--control-height); padding: 0; font-variant-numeric: tabular-nums; }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: calc(2 * var(--length)); background: var(--tooltip-bg); color: var(--text); padding: calc(1 * var(--length)) calc(5 * var(--space)); border-radius: var(--r); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: var(--control-height); margin: 0; border-radius: var(--r); background: var(--well-2); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--slide); opacity: .6; } }
  }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer;
      background-color: var(--face); border-style: solid;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg' fill='${enc(text)}'%3E%3Crect width='6' height='2'/%3E%3Crect y='4' width='6' height='2'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 9px center; background-size: calc(6 * var(--length)) calc(6 * var(--length)); padding-right: calc(20 * var(--space));
      option { background: var(--option-bg); color: var(--text); } }
    &.s-segmented { .s-input { gap: calc(3 * var(--space)); } button { flex: 1; background: var(--face); border: 1px solid var(--border); color: var(--text); border-radius: var(--r); padding: calc(3 * var(--space)); font: inherit; &:hover { background: var(--face-hover); } &.s-selected { background: var(--accent); color: var(--on-accent); border-color: var(--accent); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(3 * var(--space)); } .s-input label { display: flex; align-items: center; gap: calc(6 * var(--space)); cursor: pointer; } }
  }

  /* ── Boolean: pill toggle ── */
  .s-boolean {
    align-items: center;
    .s-input { justify-content: flex-end; padding-right: calc(2 * var(--length)); }
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &.s-switch, &.s-toggle {
      .s-track { width: calc(36 * var(--length)); height: calc(17 * var(--length)); border-radius: calc(10 * var(--length)); background: var(--well-3); border: 2px solid var(--well-3); position: relative; cursor: pointer;
        &::after { content: ''; position: absolute; top: 50%; left: 0; width: calc(16 * var(--length)); height: calc(13 * var(--length)); transform: translateY(-50%); border-radius: calc(10 * var(--length)); background: var(--face); transition: left .15s, background .15s; } }
      &:has(input:checked) .s-track { &::after { left: calc(100% - calc(17 * var(--length))); background: var(--toggle-on); } }
      &:has(input:focus-visible) .s-track { outline: 1px solid var(--accent); outline-offset: 1px; }
    }
    &.s-checkbox { input[type="checkbox"] { -webkit-appearance: none; appearance: none; position: static; opacity: 1; width: calc(16 * var(--length)); height: calc(16 * var(--length)); margin: 0; border-radius: calc(3 * var(--length)); background: var(--well-3); border: 1px solid var(--border); cursor: pointer; &:checked { background: var(--accent); } } .s-track { display: none; } }
  }

  /* ── Color: full-width tinted field with the hex over it (uil style) ── */
  .s-color {
    &.s-picker .s-color-input { gap: 0; position: relative; background: var(--color); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden;
      input[type="color"] { position: absolute; inset: 0 0 0 auto; width: calc(24 * var(--length)); height: var(--control-height); padding: 0; border: none; cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } }
      input[type="text"] { position: relative; flex: 1; margin-right: calc(24 * var(--space)); background: transparent; color: var(--picker-fg); border: 0; mix-blend-mode: normal; font-family: 'Roboto Mono', monospace; padding-left: calc(8 * var(--space)); height: var(--control-height); } }
    &.s-rgba .s-color-input { gap: calc(4 * var(--space)); input[type="color"] { flex: none; width: calc(28 * var(--length)); height: var(--control-height); border: 1px solid var(--border); border-radius: var(--r); } input[type="text"] { flex: 1; } }
    &.s-swatches button { width: calc(18 * var(--length)); height: calc(18 * var(--length)); border-radius: var(--r); border: 1px solid var(--border); &.s-selected { outline: 1px solid var(--accent); } }
  }

  /* ── Button: pill ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(4 * var(--space)); }
    button { width: 100%; background: var(--face); color: var(--text); border: 1px solid var(--border); border-radius: var(--r); height: var(--control-height); &:hover { background: var(--face-hover); } &:active, &.s-selected { background: var(--accent); color: var(--on-accent); border-color: var(--accent); } }
    &.s-secondary button, button.s-secondary { background: var(--well-1); }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(44 * var(--length)); max-height: 50vh; padding: calc(4 * var(--space)) calc(6 * var(--space)); } }

  /* ── Folder: two-bar pause/equals marker, lighter un-darkened bg so it reads as a section ── */
  .s-folder {
    > summary { color: var(--label); font-weight: 400; padding: calc(4 * var(--space)) calc(4 * var(--space)); background: var(--bg);
      &::after { content: ''; width: calc(6 * var(--length)); height: calc(6 * var(--length)); margin-left: auto; background: repeating-linear-gradient(to bottom, var(--text) 0 2px, transparent 2px 4px); transition: transform .15s; } }
    &[open] > summary::after { transform: rotate(90deg); }
    .s-content { gap: 0; padding-left: 0; }
  }

  /* ── Knob / XY pad: label-left like every other row. native stacks the label above
     the control instead — deliberate divergence here so the whole panel keeps one
     consistent label column (owner's consistency call). Control + its live readout
     stack together inside the value column, centered there the way native centers
     them under its own label. */
  .s-knob .s-input { justify-content: center; }
  .s-xy .s-input { flex-direction: column; align-items: center; gap: calc(4 * var(--space)); }
  .s-pad-val { text-align: center; font-size: calc(11 * var(--length)); line-height: 1.2; font-weight: 400; opacity: 1; color: var(--text); margin-bottom: calc(4 * var(--space)); }
  /* dial diam:40 in uil, but only the inner ~53% is the solid face — the rest is
     dead space for the tick ring; a 270° dash ring (9° step, 288° span → 9° gap
     past each end-stop) lives on the wrap — the one layer that never rotates — so
     dragging spins only the dial+needle inside it, ticks stay put. native draws the
     face as an SVG circle (r34) with a stroke (width 8, straddling the fill/transparent
     edge — half sinks into the face, half spills past it) — an inset+outset box-shadow
     pair of matching width reproduces that centered ring without eating into the
     layout box the way a border would. Ticks then start past a real gap beyond the
     ring's outer edge (never touching it): both figures scale off the face radius at
     native's own ratio (stroke half ≈ 11.8% of r, gap ≈ 5.9% of r), so a 24px dial
     gets a 1.41px ring and a ~0.7px gap before the tick band.
     circular mode reads pointerdown's own currentTarget (the wrap) to find the
     dial's center, so the readout is pulled out of flow (absolute, below) rather
     than stacked in — otherwise its height would drag the wrap's bounding-box
     center down past the dial's actual center and skew every angle. Pulling it
     out also means the wrap's box IS the dial's box, so the tick ring can inset
     off the wrap directly instead of computing an offset center by hand. */
  .s-knob-wrap {
    position: relative; margin-bottom: calc(24 * var(--space));
    &::before { content: ''; position: absolute; inset: -4.12px; border-radius: 50%; pointer-events: none;
      background: repeating-conic-gradient(from -144deg, var(--text) 0 4deg, transparent 4deg 9deg);
      -webkit-mask:
        radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px)),
        conic-gradient(from -144deg, #000 0 288deg, transparent 288deg 360deg);
      -webkit-mask-composite: source-in;
      mask:
        radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px)),
        conic-gradient(from -144deg, #000 0 288deg, transparent 288deg 360deg);
      mask-composite: intersect;
      opacity: .6; }
  }
  .s-knob-dial {
    width: calc(24 * var(--length)); height: calc(24 * var(--length)); background: var(--face); border: none; position: relative;
    box-shadow: inset 0 0 0 1.41px var(--well-3), 0 0 0 1.41px var(--well-3);
    i { background: var(--text); width: calc(2 * var(--length)); top: 12%; height: 9%; }
  }
  .s-knob-val {
    position: absolute; top: calc(100% + calc(4 * var(--length))); left: 50%; transform: translateX(-50%); white-space: nowrap;
    font-size: calc(11 * var(--length)); opacity: 1;
  }
  /* same padding-box trick as the knob: the frame reads as native's dark rgba(0,0,0,.2)
     outline against the panel backdrop, not washed out over the face. native's own SVG
     (viewBox 256, rendered 100×100 → 0.3906 scale) draws the frame+face box at 78.125px
     (200 units) with a 3.90625px (10-unit) frame around a 70.3125px (180-unit) face. */
  .s-pad { width: calc(78.125 * var(--length)); height: calc(78.125 * var(--length)); background: var(--face); background-clip: padding-box; border: 3.90625px solid var(--well-1); border-radius: 0; box-sizing: border-box;
    .s-pad-x, .s-pad-y { background: var(--well-1); }
    .s-pad-dot { width: calc(6 * var(--length)); height: calc(6 * var(--length)); background: transparent; border: 2px solid var(--text); box-shadow: none; }
  }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: var(--text); font-variant-numeric: tabular-nums; }
  .s-separator { background: var(--well-3); opacity: 1; }

}`

  return baseCSS + '\n' + overrides
}
