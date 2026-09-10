/**
 * tweakpane — calibrated to Tweakpane's default dark theme
 *
 * Signatures: monospace throughout, a fully greyscale blue-grey palette (no hue
 * accent — states shift only lightness), a razor-thin 2px slider track with a
 * 12px square knob, light-grey buttons with dark text, and a two-bar grip
 * marker on folder headers.
 * Ref: https://tweakpane.github.io/docs/
 *
 * Axes: shade (panel bg), fg (input-fg / slider fill / label ink), button
 * (light control fill). Everything else — field / field-hover, label, monitor,
 * grip, the button hover/active states, the select's option background, and
 * the shared shadow/tooltip/well colors — derives from these three (parsed to
 * r,g,b and recombined as plain rgba()/rgb() strings — color-mix()/relative-
 * color rgb(from ...) were tried first but Chromium serializes their result
 * through a `color(srgb ...)` code path that composites/rounds a channel-value
 * off from legacy rgba() at anti-aliased edges, which breaks pixel identity),
 * landing as vars in the .s-panel block below. Rules reference only var()s;
 * the sole exception is inline SVG data-URI icons, which can't read CSS
 * custom properties and so take an encodeURIComponent'd literal of the same
 * token instead.
 *
 * tweakpane(axes?) → CSS string
 */

import baseCSS from './base.js'

export default function tweakpane({
  shade = '#28292e',     // panel bg ≈ hsl(228 8% 17%) — matches Tweakpane's rgb(40,41,46)
  fg = '#bbbcc4',        // input-fg / slider fill / label ink ≈ hsl(228 8% 75%)
  button = '#adafb8',    // button bg ≈ hsl(228 7% 70%)
} = {}) {
  const enc = c => encodeURIComponent(c)   // any CSS color, safe inside an SVG data-URI
  const rgbOf = (hex, fallback) => { const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(hex); return m ? [1, 2, 3].map(i => parseInt(m[i], 16)) : fallback }
  const c255 = v => Math.max(0, Math.min(255, Math.round(v)))

  const [fgR, fgG, fgB] = rgbOf(fg, [187, 188, 196])
  const [btnR, btnG, btnB] = rgbOf(button, [173, 175, 184])
  const [shR, shG, shB] = rgbOf(shade, [40, 41, 46])
  const wash = a => `rgba(${fgR},${fgG},${fgB},${a})`

  const overrides = `.s-panel {
  /* ── axes ── */
  --bg: ${shade};
  --fg: ${fg};
  --accent: ${fg};
  --button: ${button};

  /* ── derived tokens ── */
  --field: ${wash(0.1)};
  --field-hover: ${wash(0.16)};
  --label: ${wash(0.7)};
  --monitor: var(--label);
  --grip: var(--label);
  --pad-fill: ${wash(0.2)};
  --pad-axis: ${wash(0.5)};
  --hover: rgb(${c255(btnR + 21)},${c255(btnG + 19)},${c255(btnB + 16)});
  --active: rgb(${c255(btnR + 37)},${c255(btnG + 35)},${c255(btnB + 32)});
  --option-bg: rgb(${c255(shR + 7)},${c255(shG + 6)},${c255(shB + 5)});
  --well: rgba(0,0,0,.2);
  --shadow: 0 2px 4px var(--well);
  --tooltip-bg: #000;

  --u: 4px;
  --spacing: 1;
  --weight: 400;
  --r: 2px;
  --row: 20px;
  --thumb: 12px;
  --track: 2px;
  --radius-lg: 6px;
  --width: 256px;
  --vec-pad: 128px;
  color-scheme: dark;

  background: var(--bg);
  color: var(--fg);
  font: 11px/1.4 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  width: var(--width);
  min-width: 0;
  max-width: var(--width);
  border-radius: var(--radius-lg);
  padding: var(--u);
  box-shadow: var(--shadow);

  /* ── Title ── */
  > summary, > .s-panel-title {
    color: var(--label);
    font-weight: 500;
    padding: var(--u) var(--u) 6px;
    &::after { content: ''; width: 6px; height: 6px; margin-left: auto; border: 1px solid currentColor; opacity: .5; transition: transform .15s; }
  }
  &[open] > summary::after { transform: rotate(45deg); }
  .s-panel-content { gap: var(--u); padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Row ── */
  .s-control { gap: var(--u); padding: 0; min-height: var(--row); align-items: center; &:has(> .s-input[inert]) > .s-label-group { opacity: .5; } }
  .s-label-group { width: 34%; min-width: 0; max-width: none; padding: 0 var(--u); line-height: 1.3; }
  .s-label { color: var(--label); font-weight: 500; }
  .s-hint { color: var(--label); opacity: .7; font-size: 10px; }
  .s-input { gap: var(--u); align-items: center; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--field); color: var(--fg); border: none; border-radius: var(--r);
    height: var(--row); padding: 0 var(--u); font: inherit;
    &::placeholder { color: var(--label); }
    &:hover { background: var(--field-hover); }
    &:focus { background: var(--field-hover); outline: none; }
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
      background: var(--field) linear-gradient(color-mix(in srgb, var(--fg) 10%, transparent), color-mix(in srgb, var(--fg) 10%, transparent)) 3px center / 2px 16px no-repeat; }
    /* Expand button: native's point2d picker glyph — a plus-shaped reticle with a corner dot,
       dark-on-light like the select's arrow, filling a 20px field-height square. margin-right
       widens the button→field gap to native's measured 4px (.tp-p2dv_b margin-right: 4px) —
       the 2px flex gap plus this 2px margin. */
    .s-vec-expand { -webkit-mask: none; mask: none; opacity: 1; width: var(--row); height: var(--row); margin-right: 2px; border-radius: var(--r);
      background: var(--button) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M8 4v8M4 8h8' stroke='${enc(shade)}' stroke-width='2' fill='none'/%3E%3Ccircle cx='12' cy='12' r='1.2' fill='${enc(shade)}'/%3E%3C/svg%3E") center / 16px 16px no-repeat;
      &:hover, &.s-open { background-color: var(--hover); } }
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
       same fg wash over an opaque bg backing so rows behind it don't show through. */
    .s-pad { position: absolute; top: 100%; left: 0; z-index: 10; width: var(--vec-pad); height: var(--vec-pad); margin: 0; border-radius: var(--radius-lg); box-shadow: var(--shadow);
      background: linear-gradient(var(--pad-fill), var(--pad-fill)), var(--bg); }
  }

  /* ── Slider: 2px track + 2px fill + 12px square knob ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 12px; }
    .s-track { height: var(--row); margin: 0; }
    input[type="range"] {
      width: 100%; height: 16px; -webkit-appearance: none; appearance: none; cursor: pointer; background: transparent;
      background-image:
        linear-gradient(to right, var(--fg) 0 var(--p, 0%), transparent var(--p, 0%)),
        linear-gradient(var(--field) 0 0);
      background-size: calc(100% - var(--thumb)) var(--track), calc(100% - var(--thumb)) var(--track); background-position: center; background-repeat: no-repeat;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--thumb); height: var(--thumb); border-radius: var(--r); background: var(--button); cursor: pointer; }
      &::-moz-range-thumb { width: var(--thumb); height: var(--thumb); border-radius: var(--r); border: none; background: var(--button); cursor: pointer; }
      &:hover::-webkit-slider-thumb, &:focus-visible::-webkit-slider-thumb { background: var(--hover); }
      &:hover::-moz-range-thumb, &:focus-visible::-moz-range-thumb { background: var(--hover); }
      &:focus-visible { outline: none; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: var(--label); white-space: nowrap; }
    .s-readout { position: relative; flex: 0 0 auto; width: 52px; min-width: 52px; text-align: right; color: var(--fg); border: none; border-radius: var(--r); height: var(--row); padding: 0 var(--u); font-variant-numeric: tabular-nums; cursor: ew-resize;
      background: var(--field) linear-gradient(color-mix(in srgb, var(--fg) 10%, transparent), color-mix(in srgb, var(--fg) 10%, transparent)) 3px center / 2px 16px no-repeat;
      &:hover, &:focus { background-color: var(--field-hover); outline: none; }
      &:focus { cursor: text; } }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: var(--tooltip-bg); color: var(--fg); padding: 1px 5px; border-radius: var(--r); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: var(--track); margin: 9px 0; background: var(--field); position: relative; overflow: visible;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--fg); }
      input[type="range"]::-webkit-slider-thumb { width: var(--thumb); height: var(--thumb); border-radius: var(--r); background: var(--button); }
      input[type="range"]::-moz-range-thumb { width: var(--thumb); height: var(--thumb); border-radius: var(--r); background: var(--button); } }
  }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer; background-color: var(--button); color: var(--bg); font-weight: 700;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M5 7h6l-3 3z' fill='${enc(shade)}'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right var(--u) center; background-size: 16px 16px; padding-right: 20px;
      &:hover, &:focus { background-color: var(--hover); color: var(--bg); }
      option { background: var(--option-bg); color: var(--fg); } }
    &.s-segmented { .s-input { gap: 2px; } button { flex: 1; background: var(--field); border: none; color: var(--fg); border-radius: var(--r); padding: 3px; font: inherit; &:hover { background: var(--field-hover); } &.s-selected { background: var(--button); color: var(--bg); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: 3px; } .s-input label { display: flex; align-items: center; gap: 6px; cursor: pointer; } }
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
     (native's low-opacity .1 constant crosshair, i.e. var(--field) — the same fg-at-10% wash
     used throughout) rides a single ::before with two layered dashed backgrounds, painting
     under the line and the dot. ── */
  .s-pad { background: var(--pad-fill); border: none; border-radius: var(--r); box-shadow: var(--shadow);
    &::before { content: ''; position: absolute; inset: 0; pointer-events: none;
      background-image:
        repeating-linear-gradient(to right, var(--field) 0 1px, transparent 1px 2px),
        repeating-linear-gradient(to bottom, var(--field) 0 1px, transparent 1px 2px);
      background-size: 100% 1px, 1px 100%; background-position: center, center; background-repeat: no-repeat, no-repeat; }
    .s-pad-x, .s-pad-y { background: none; }
    .s-pad-x { top: 50%; left: 50%; right: auto; width: var(--dist, 0%); height: 1px;
      transform-origin: left center; transform: rotate(var(--angle, 0rad));
      background-image: repeating-linear-gradient(to right, var(--pad-axis) 0 1px, transparent 1px 2px); }
    .s-pad-y { display: none; }
    .s-pad-dot { width: 5px; height: 5px; background: var(--fg); box-shadow: none; } }

  /* ── Boolean: input-bg square with a check ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { -webkit-appearance: none; appearance: none; position: static; opacity: 1; width: var(--row); height: var(--row); margin: 0; border-radius: var(--r); background: var(--field); cursor: pointer;
      &:hover { background: var(--field-hover); }
      &:checked { background: var(--field) url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='${enc(fg)}' stroke-width='2'/%3E%3C/svg%3E") center / 11px no-repeat; } }
    .s-track { display: none; }
  }

  /* ── Color: full rgba swatch — native's checkerboard + color-wash technique.
     The native input[type=color] is made invisible-but-clickable (opacity 0); a ::before
     paints the checker (bottom layer) with the full --color, alpha included, washed over it
     (top layer) — so partial alpha lets the checker show through, like native's swatch. ── */
  .s-color {
    &.s-picker .s-color-input { gap: 0; position: relative;
      input[type="color"] { position: static; width: var(--row); height: var(--row); padding: 0; border: none; border-radius: var(--r) 0 0 var(--r); cursor: pointer; opacity: 0; }
      &::before { content: ''; position: absolute; inset: 0 auto 0 0; width: var(--row); height: var(--row); pointer-events: none; border-radius: var(--r) 0 0 var(--r);
        background: linear-gradient(var(--color), var(--color)), conic-gradient(#ddd 90deg, #fff 0 180deg, #ddd 0 270deg, #fff 0) 0 0 / 8px 8px; }
      input[type="text"] { flex: 1; min-width: 0; border-radius: 0 var(--r) var(--r) 0; } }
    &.s-rgba .s-color-input { gap: var(--u); position: relative;
      input[type="color"] { width: var(--row); height: var(--row); padding: 0; border: none; border-radius: var(--r); cursor: pointer; opacity: 0; }
      &::before { content: ''; position: absolute; inset: 0 auto 0 0; width: var(--row); height: var(--row); pointer-events: none; border-radius: var(--r);
        background: linear-gradient(var(--color), var(--color)), conic-gradient(#ddd 90deg, #fff 0 180deg, #ddd 0 270deg, #fff 0) 0 0 / 8px 8px; }
      .s-alpha { display: none; } input[type="text"] { flex: 1; min-width: 0; } }
    &.s-swatches button { width: 18px; height: 18px; border-radius: var(--r); border: none; &.s-selected { outline: 1px solid var(--fg); } }
  }

  /* ── Button: light pill, dark text ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    button { width: 100%; background: var(--button); color: var(--bg); border: none; border-radius: var(--r); height: var(--row); font-weight: 700; &:hover { background: var(--hover); } &:active { background: var(--active); } }
    &.s-secondary button, button.s-secondary { background: var(--field); color: var(--fg); &:hover { background: var(--field-hover); } }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 40px; max-height: 50vh; padding: 4px 6px; } }

  /* ── Folder: full-bleed header bar breaking out of panel padding + two-bar grip marker ── */
  .s-folder {
    position: relative;
    > summary { background: var(--field); color: var(--label); font-weight: 500; height: 24px; line-height: 24px; padding: 0 6px; margin: 0 calc(var(--u) * -1); width: calc(100% + var(--u) * 2); border-radius: 0; transition: background-color .1s;
      &:hover { background: var(--field-hover); }
      &::after { content: ''; width: 6px; height: 6px; border-radius: var(--r); margin-left: auto; opacity: .5; transform: rotate(90deg);
        background: linear-gradient(to left, var(--grip) 0px, var(--grip) 2px, transparent 2px, transparent 4px, var(--grip) 4px); transition: transform .15s; } }
    &[open] > summary::after { transform: none; }
    /* Nesting rail: header-colored 4px band along the left edge of the open content */
    &[open]::before { content: ''; position: absolute; top: 24px; bottom: 0; left: calc(var(--u) * -1); width: var(--u); background: var(--field); }
    .s-content { gap: var(--u); padding: var(--u) 0 var(--u) var(--u); }
    /* Match native's fold timing: height+padding ease-in-out, opacity fades in lockstep on close,
       only after fully expanded on open (avoids an empty box collapsing/expanding visibly) */
    &:is(details)::details-content { transition: height .2s ease-in-out, opacity .2s linear, padding .2s ease-in-out, content-visibility .2s allow-discrete; }
    &:is(details)[open]::details-content { transition: height .2s ease-in-out, opacity .2s linear .2s, padding .2s ease-in-out; }
  }
  /* Adjacent folders: each folder already ends in 4px of bottom padding, so the panel's
     row gap would double it — native collapses the gap between two consecutive blades. */
  .s-folder + .s-folder { margin-top: calc(var(--u) * -1); }

  /* ── Info / separator ── */
  .s-info .s-monitor { background: var(--well); border-radius: var(--r); padding: 0 var(--u); height: var(--row); line-height: var(--row); color: var(--monitor); font-variant-numeric: tabular-nums; }
  .s-separator { min-height: 0; height: var(--track); background: var(--field); opacity: 1; margin: 0; }
  .s-separator-labeled { height: auto; background: none; }
}`

  return baseCSS + '\n' + overrides
}
