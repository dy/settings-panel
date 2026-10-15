/**
 * tweakpane — calibrated to Tweakpane's default dark theme
 *
 * Custom shades derive missing color roles; explicit role axes take precedence.
 *
 * Signatures: monospace throughout, a fully greyscale blue-grey palette (no hue
 * accent — states shift only lightness), a razor-thin 2px slider track with a
 * 12px square knob, light-grey buttons with dark text, and a two-bar grip
 * marker on folder headers.
 * Ref: https://tweakpane.github.io/docs/
 *
 * Axes: shade (panel bg), fg (input-fg / slider fill / label ink), button
 * (light control fill). Everything else (the field wash and its hover/focus/
 * active steps, label, monitor, the button hover/focus/active states (native's
 * own derivation: button lightness +5/+10/+15%), the select's option background, and
 * the shared shadow/tooltip/well colors) derives from these three (parsed to
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

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveRoles, toHex, parseColor, ink } from './color.js'

export default function tweakpane({
  shade = '#28292e',     // panel bg ≈ hsl(228 8% 17%) — matches Tweakpane's rgb(40,41,46)
  fg,        // input-fg / slider fill / label ink ≈ hsl(228 8% 75%)
  button,    // button bg ≈ hsl(228 7% 70%),
  size = 1,
  spacing = 1,
  font,
} = {}) {
  const native = shade === '#28292e'
  const roles = resolveRoles(shade)
  fg ??= native ? '#bbbcc4' : toHex(parseColor(roles.fg))
  button ??= native ? '#adafb8' : toHex(parseColor(roles.fg))

  const enc = c => encodeURIComponent(c)   // any CSS color, safe inside an SVG data-URI
  const check = c => `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 8l4 4l8 -8' fill='none' stroke='${enc(c)}' stroke-width='2'/%3E%3C/svg%3E")`
  const rgbOf = (hex, fallback) => { const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(hex); return m ? [1, 2, 3].map(i => parseInt(m[i], 16)) : fallback }
  const c255 = v => Math.max(0, Math.min(255, Math.round(v)))

  const [fgR, fgG, fgB] = rgbOf(fg, [187, 188, 196])
  const [shR, shG, shB] = rgbOf(shade, [40, 41, 46])
  const wash = a => `rgba(${fgR},${fgG},${fgB},${a})`
  // Text Tweakpane never drew, at 4.5:1 (WCAG 1.4.3): the hint (the label wash at 70%, 3.0:1) and a
  // separator's label (fg at 60%, 3.7:1) keep their tone, lifted to pass
  const washed = a => '#' + [[fgR, shR], [fgG, shG], [fgB, shB]].map(([f, s]) => c255(s + (f - s) * a).toString(16).padStart(2, '0')).join('')
  const hint = ink(shade, 4.5, washed((native ? .7 : .9) * .7))
  const sepLabel = ink(shade, 4.5, washed(.6))
  // and a placeholder, the label's wash laid over the field's (3.9:1), lifted to pass on the field
  const placeholder = ink(washed(.1), 4.5, washed(.1 + .9 * (native ? .7 : .9)))
  // Native's button states are its button fill lightened 5/10/15% in HSL (#bbbcc4/#c8cad0/#d6d7db
  // from hsl(230 7% 70%)); the defaults take native's exact literals, which rounding the 8-bit
  // fill back through HSL misses by one blue step on the active state.
  const lighten = (hex, dl) => {
    const [r, g, b] = rgbOf(hex, [173, 175, 184]).map(v => v / 255), M = Math.max(r, g, b), m = Math.min(r, g, b), d = M - m
    const l = Math.min(1, (M + m) / 2 + dl), s = d && d / (1 - Math.abs(M + m - 1))
    const h = !d ? 0 : M === r ? ((g - b) / d + 6) % 6 : M === g ? (b - r) / d + 2 : (r - g) / d + 4
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(h % 2 - 1)), o = l - c / 2
    const [R, G, B] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h) % 6]
    return `rgb(${[R, G, B].map(v => c255((v + o) * 255)).join(',')})`
  }
  const [hover, focus, active] = native ? ['#bbbcc4', '#c8cad0', '#d6d7db'] : [.05, .1, .15].map(d => lighten(button, d))

  const overrides = `.s-panel {
  /* native --bs-ff verbatim: where Roboto Mono isn't installed or loaded (native's page loads no
     webfont) both fall through to Menlo on macOS; weight 500 like native's root (Menlo Regular) */
  ${metrics({ size, spacing, font }, {fontSize: 11, fontFamily: "'Roboto Mono', 'Source Code Pro', Menlo, Courier, monospace", lineHeight: 15.4, controlHeight: 20, inset: 4, rowGap: 4, columnGap: 0, sectionGap: 4, panelPadding: 4})}

  /* ── axes ── */
  --bg: ${shade};
  --fg: ${fg};
  --accent: ${fg};
  --button: ${button};

  /* ── derived tokens ── */
  --field: ${wash(0.1)};
  --field-hover: ${wash(0.15)};
  --field-focus: ${wash(0.2)};
  --field-active: ${wash(0.25)};
  --label: ${wash(native ? .7 : .9)};
  --monitor: var(--label);
  --pad-fill: ${wash(0.2)};
  --pad-axis: ${wash(0.5)};
  --hover: ${hover};
  --focus: ${focus};
  --active: ${active};
  --option-bg: rgb(${c255(shR + 7)},${c255(shG + 6)},${c255(shB + 5)});
  --well: rgba(0,0,0,.2);
  --shadow: 0 2px 4px var(--well);
  --tooltip-bg: ${roles.dark ? '#000' : '#fff'};
  --on-button: ${native ? shade : resolveRoles(shade, button).onAccent};

  --weight: 500;
  --r: calc(2 * var(--length));
  --row: var(--control-height);
  --thumb: calc(12 * var(--length));
  --track: calc(2 * var(--length));
  --radius-lg: calc(6 * var(--length));
  --width: calc(256 * var(--length));
  --vec-pad: calc(128 * var(--space));
  --value: calc(160 * var(--length));   /* native --bld-vw: fixed value column, label takes the rest */
  --header: calc(24 * var(--length));   /* native cnt-usz + 4px: panel title and folder header */
  /* native .tp-txtv_k drag bar: 2px, row − 4px tall, 1px-rounded, fg at .1 (the field wash) */
  --guide: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' rx='1' fill='${enc(wash(0.1))}'/%3E%3C/svg%3E") var(--u) center / var(--track) calc(var(--row) - 4 * var(--length)) no-repeat;
  /* native .tp-fldv_m / .tp-rotv_m: two 2px bars of fg at half opacity, 11px in from the header's right edge */
  --grip: linear-gradient(to left, var(--fg), var(--fg) 2px, transparent 2px, transparent 4px, var(--fg) 4px);
  color-scheme: ${roles.dark ? 'dark' : 'light'};

  background: var(--bg);
  color: var(--fg);

  width: var(--width);
  min-width: 0;
  max-width: var(--width);
  border-radius: var(--radius-lg);
  padding: var(--panel-padding);
  box-shadow: var(--shadow);

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Title: native .tp-rotv_b, a full-bleed 24px bar with centered text, square-bottomed while open ── */
  > summary, > .s-panel-title {
    position: relative; justify-content: center;
    height: var(--header); line-height: var(--header); padding: 0 calc(var(--panel-padding) + var(--row) + var(--u));
    margin: calc(var(--panel-padding) * -1) calc(var(--panel-padding) * -1) var(--panel-padding);
    background: var(--field); color: var(--fg); border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  > summary {
    border-radius: var(--radius-lg); transition: border-radius .2s ease-in-out .2s;
    &:hover { background: var(--field-hover); } &:focus { background: var(--field-focus); outline: none; } &:active { background: var(--field-active); }
    &::after { content: ''; position: absolute; top: 0; bottom: 0; right: calc(var(--panel-padding) + 7 * var(--length)); margin: auto; width: calc(6 * var(--length)); height: calc(6 * var(--length)); border-radius: var(--r); background: var(--grip); opacity: .5; transform: rotate(90deg); transition: transform .2s ease-in-out; }
  }
  /* collapsed: the bar is the whole panel, so it takes the panel's full radius and swallows its bottom padding */
  &:not([open]) > summary { margin-bottom: calc(var(--panel-padding) * -1); }
  &[open] > summary { border-radius: var(--radius-lg) var(--radius-lg) 0 0; transition-duration: 0s; transition-delay: 0s; &::after { transform: none; } }
  .s-panel-content { gap: var(--row-gap); padding: 0; }

  /* ── Row: native .tp-lblv, label flexes, value column fixed at 160px ── */
  .s-control { gap: var(--column-gap); padding: 0; min-height: var(--row); align-items: center; &:has(> .s-input[inert]) > .s-label-group { opacity: .5; } }
  .s-label-group { flex: 1 1 0; width: auto; min-width: 0; max-width: none; padding: 0 calc(16 * var(--length)) 0 var(--u); line-height: 1.3; overflow: hidden; hyphens: auto; }
  .s-label { color: var(--label); }
  .s-hint { color: ${hint}; opacity: 1; font-size: calc(10 * var(--length)); }
  .s-input { flex: 0 0 var(--value); gap: var(--u); align-items: center; }
  .s-label-group[hidden] + .s-input { flex: 1; }

  /* ── Fields: native .tp-txtv_i, input-bg wash stepping .1 / .15 hover / .2 focus / .25 active ── */
  input[type="text"], input[type="number"], select, textarea {
    -webkit-appearance: none; appearance: none; background-color: var(--field); color: var(--fg); border: none; border-radius: var(--r);
    height: var(--row); padding: 0 var(--u); font: inherit; line-height: var(--row);
    &::placeholder { color: ${placeholder}; }
    &:hover { background-color: var(--field-hover); }
    &:focus { background-color: var(--field-focus); outline: none; }
    &:active { background-color: var(--field-active); }
  }
  .s-text input[type="text"] { flex: 1; }
  /* numeric fields (native .tp-txtv-num): right-aligned, drag-scrubbed, with the drag bar at the left */
  .s-number input[type="number"], .s-vector input[type="number"], .s-slider .s-readout {
    text-align: right; cursor: ew-resize; background: var(--guide); background-color: var(--field);
    -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    &:hover { background-color: var(--field-hover); } &:focus { background-color: var(--field-focus); cursor: text; } &:active { background-color: var(--field-active); }
  }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; } .s-step { display: none; } }

  /* ── Vector: native point2d's collapsed row, joined per-axis fields (inner corners square) ── */
  .s-vector {
    position: relative;
    .s-input { position: relative; gap: calc(2 * var(--length)); }
    .s-vec-axis { gap: 0; }
    .s-vec-axis:has(+ .s-vec-axis) input { border-top-right-radius: 0; border-bottom-right-radius: 0; }
    .s-vec-axis + .s-vec-axis input { border-top-left-radius: 0; border-bottom-left-radius: 0; }
    /* Expand button: native's point2d picker glyph — a plus-shaped reticle with a corner dot,
       dark-on-light like the select's arrow, filling a 20px field-height square. margin-right
       widens the button→field gap to native's measured 4px (.tp-p2dv_b margin-right: calc(4 * var(--space))) —
       the 2px flex gap plus this 2px margin. */
    .s-vec-expand { -webkit-mask: none; mask: none; opacity: 1; width: var(--row); height: var(--row); margin-right: calc(2 * var(--length)); border-radius: var(--r);
      background: var(--button) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M8 4v8M4 8h8' stroke='${enc(shade)}' stroke-width='2' fill='none'/%3E%3Ccircle cx='12' cy='12' r='1.2' fill='${enc(shade)}'/%3E%3C/svg%3E") center / calc(16 * var(--length)) no-repeat;
      &:hover { background-color: var(--hover); } &:focus, &.s-open { background-color: var(--focus); outline: none; } &:active { background-color: var(--active); } }
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
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(12 * var(--space)); }
    .s-track { height: var(--row); margin: 0; }
    input[type="range"] {
      width: 100%; height: calc(16 * var(--length)); -webkit-appearance: none; appearance: none; cursor: pointer; background: transparent;
      background-image:
        linear-gradient(to right, var(--fg) 0 var(--p, 0%), transparent var(--p, 0%)),
        linear-gradient(var(--field) 0 0);
      background-size: calc(100% - var(--thumb)) var(--track), calc(100% - var(--thumb)) var(--track); background-position: center; background-repeat: no-repeat;
      /* native's groove and fill are 1px-rounded bars; gradients can't round, so a mask keeps the
         groove's rounded shape plus the knob's strip (a --thumb-wide layer at --p lands exactly
         where the knob travels: p × (width − thumb)) */
      -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' rx='1'/%3E%3C/svg%3E") center / calc(100% - var(--thumb)) var(--track) no-repeat, linear-gradient(#000 0 0) var(--p, 0%) 0 / var(--thumb) 100% no-repeat;
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' rx='1'/%3E%3C/svg%3E") center / calc(100% - var(--thumb)) var(--track) no-repeat, linear-gradient(#000 0 0) var(--p, 0%) 0 / var(--thumb) 100% no-repeat;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--thumb); height: var(--thumb); border-radius: var(--r); background: var(--button); cursor: pointer; }
      &::-moz-range-thumb { width: var(--thumb); height: var(--thumb); border-radius: var(--r); border: none; background: var(--button); cursor: pointer; }
      /* native .tp-sldv_t knob states: hover / focus (any focus, as native's tabindex div takes it on click) / active */
      &:hover::-webkit-slider-thumb { background: var(--hover); } &:focus::-webkit-slider-thumb { background: var(--focus); } &:active::-webkit-slider-thumb { background: var(--active); }
      &:hover::-moz-range-thumb { background: var(--hover); } &:focus::-moz-range-thumb { background: var(--focus); } &:active::-moz-range-thumb { background: var(--active); }
      &:focus { outline: none; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: calc(10 * var(--length)); color: var(--label); white-space: nowrap; }
    /* native .tp-sldtxtv: slider flex 2 : text flex 1 with a 4px gap → 104 + 4 + 52 in the 160px column */
    .s-readout { position: relative; flex: 0 0 auto; width: calc(52 * var(--length)); min-width: calc(52 * var(--length)); color: var(--fg); border: none; border-radius: var(--r); height: var(--row); padding: 0 var(--u); font-variant-numeric: tabular-nums; }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: calc(2 * var(--length)); background: var(--tooltip-bg); color: var(--fg); padding: calc(1 * var(--length)) calc(5 * var(--space)); border-radius: var(--r); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: var(--track); margin: calc(9 * var(--space)) 0; background: var(--field); position: relative; overflow: visible;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--fg); }
      input[type="range"] { top: 50%; translate: 0 -50%; background: none; -webkit-mask: none; mask: none; }
      input[type="range"]::-webkit-slider-thumb { width: var(--thumb); height: var(--thumb); border-radius: var(--r); background: var(--button); }
      input[type="range"]::-moz-range-thumb { width: var(--thumb); height: var(--thumb); border-radius: var(--r); background: var(--button); } }
  }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer; background-color: var(--button); color: var(--on-button); font-weight: 700;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M5 7h6l-3 3z' fill='${enc(shade)}'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right calc(2 * var(--length)) center; background-size: calc(16 * var(--length)) calc(16 * var(--length)); padding-right: calc(20 * var(--length));
      &:hover { background-color: var(--hover); } &:focus { background-color: var(--focus); } &:active { background-color: var(--active); }
      option { background: var(--option-bg); color: var(--fg); } }
    &.s-segmented { .s-input { gap: calc(2 * var(--length)); } button { flex: 1; background: var(--field); border: none; color: var(--fg); border-radius: var(--r); padding: calc(3 * var(--space)); font: inherit; &:hover { background: var(--field-hover); } &.s-selected { background: var(--button); color: var(--on-button); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(3 * var(--space)); } .s-input label { display: flex; align-items: center; gap: calc(6 * var(--space)); cursor: pointer; } }
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
      background-size: 100% calc(1 * var(--length)), calc(1 * var(--length)) 100%; background-position: center, center; background-repeat: no-repeat, no-repeat; }
    .s-pad-x, .s-pad-y { background: none; }
    .s-pad-x { top: 50%; left: 50%; right: auto; width: var(--dist, 0%); height: calc(1 * var(--length));
      transform-origin: left center; transform: rotate(var(--angle, 0rad));
      background-image: repeating-linear-gradient(to right, var(--pad-axis) 0 1px, transparent 1px 2px); }
    .s-pad-y { display: none; }
    .s-pad-dot { width: calc(5 * var(--length)); height: calc(5 * var(--length)); background: var(--fg); box-shadow: none; } }

  /* ── Boolean: input-bg square with a check ── */
  .s-boolean input[type="checkbox"], .s-checkboxes .s-track { -webkit-appearance: none; appearance: none; flex: none; width: var(--row); height: var(--row); margin: 0; border-radius: var(--r); background: var(--field) none center / calc(16 * var(--length)) no-repeat; cursor: pointer; }
  .s-boolean {
    align-items: center;
    /* native .tp-ckbv_w: its 16px 'M2 8l4 4l8 -8' check stroked 2px in input-fg, centered */
    input[type="checkbox"] { position: static; opacity: 1;
      &:checked { background-image: ${check(fg)}; }
      &:hover { background-color: var(--field-hover); } &:focus { background-color: var(--field-focus); outline: none; } &:active { background-color: var(--field-active); } }
    .s-track { display: none; }
  }
  /* the checkboxes list draws the same box on .s-track; its check is a mask, so --s-color can ink it */
  .s-checkboxes {
    label:hover .s-track { background-color: var(--field-hover); } input:focus + .s-track { background-color: var(--field-focus); } label:active .s-track { background-color: var(--field-active); }
    input:checked + .s-track::before { content: ''; display: block; height: 100%; background: var(--s-color, var(--fg)); -webkit-mask: ${check('#000')} center / calc(16 * var(--length)) no-repeat; mask: ${check('#000')} center / calc(16 * var(--length)) no-repeat; } }

  /* ── Color: native .tp-colv_h, a 20px swatch + 4px gap + text field, alpha or not.
     The native input[type=color] is made invisible-but-clickable (opacity 0); ::before paints
     native's .tp-colswv checker (#fff under two offset #ddd diagonal-quarter layers, 10px tile
     → 5px squares), ::after the full --color, alpha included, over it. ── */
  .s-color {
    &.s-picker .s-color-input, &.s-rgba .s-color-input { gap: var(--u); position: relative;
      input[type="color"] { position: static; flex: none; width: var(--row); height: var(--row); padding: 0; border: none; border-radius: var(--r); cursor: pointer; opacity: 0; }
      /* checker and color wash on separate rounded boxes, like native's .tp-colswv + clipped .tp-colswv_sw */
      &::before, &::after { content: ''; position: absolute; inset: 0 auto 0 0; width: var(--row); height: var(--row); pointer-events: none; border-radius: var(--r); }
      &::before { background:
          linear-gradient(to top right, #ddd 25%, transparent 25% 75%, #ddd 75%) 0 0 / calc(10 * var(--length)) calc(10 * var(--length)),
          linear-gradient(to top right, #ddd 25%, transparent 25% 75%, #ddd 75%) calc(5 * var(--length)) calc(5 * var(--length)) / calc(10 * var(--length)) calc(10 * var(--length)),
          #fff; }
      &::after { background: var(--color); }
      .s-alpha { display: none; } input[type="text"] { flex: 1; min-width: 0; } }
    &.s-swatches button { width: calc(18 * var(--length)); height: calc(18 * var(--length)); border-radius: var(--r); border: none; &.s-selected { outline: 1px solid var(--fg); } }
  }

  /* ── Button: light pill, dark text ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    button { width: 100%; background: var(--button); color: var(--on-button); border: none; border-radius: var(--r); height: var(--row); padding: 0; font-weight: 700; &:hover { background: var(--hover); } &:focus { background: var(--focus); outline: none; } &:active { background: var(--active); } }
    &.s-secondary button, button.s-secondary { background: var(--field); color: var(--fg); &:hover { background: var(--field-hover); } &:focus { background: var(--field-focus); } &:active { background: var(--field-active); } }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(40 * var(--length)); max-height: 50vh; line-height: var(--line-height); padding: calc(4 * var(--space)) calc(6 * var(--space)); } }

  /* ── Folder: native .tp-fldv, a full-bleed header (breaks out of the row inset on both sides)
     in container fg, title aligned with the row labels, the two-bar grip 11px from its right edge ── */
  .s-folder {
    position: relative;
    > summary { background: var(--field); color: var(--fg); height: var(--header); line-height: var(--header); padding: 0 calc(var(--panel-padding) + 7 * var(--length)) 0 calc(var(--panel-padding) + var(--u)); margin: 0 calc(var(--panel-padding) * -1); width: calc(100% + var(--panel-padding) * 2); border-radius: 0; transition: border-radius .2s ease-in-out .2s;
      &:hover { background: var(--field-hover); } &:focus { background: var(--field-focus); outline: none; } &:active { background: var(--field-active); }
      &::after { content: ''; flex: none; width: calc(6 * var(--length)); height: calc(6 * var(--length)); border-radius: var(--r); margin-left: auto; opacity: .5; transform: rotate(90deg); background: var(--grip); transition: transform .2s ease-in-out; } }
    &[open] > summary::after { transform: none; }
    /* Nesting rail (native .tp-fldv_i): 4px band of the header's own wash, following its states */
    &[open]::before { content: ''; position: absolute; top: var(--header); bottom: 0; left: calc(var(--panel-padding) * -1); width: var(--u); background: var(--field); }
    &:has(> summary:hover)::before { background: var(--field-hover); }
    &:has(> summary:focus)::before { background: var(--field-focus); }
    &:has(> summary:active)::before { background: var(--field-active); }
    .s-content { gap: var(--row-gap); padding: var(--panel-padding) 0 var(--panel-padding) var(--u); }
    /* Match native's fold timing: height+padding ease-in-out, opacity fades in lockstep on close,
       only after fully expanded on open (avoids an empty box collapsing/expanding visibly) */
    &:is(details)::details-content { transition: height .2s ease-in-out, opacity .2s linear, padding .2s ease-in-out, content-visibility .2s allow-discrete; }
    &:is(details)[open]::details-content { transition: height .2s ease-in-out, opacity .2s linear .2s, padding .2s ease-in-out; }
  }
  /* Adjacent folders: each folder already ends in 4px of bottom padding, so the panel's
     row gap would double it — native collapses the gap between two consecutive blades. */
  .s-folder + .s-folder { margin-top: calc(var(--row-gap) * -1); }
  /* Edge folders meet the panel's rounded edge (native .tp-v-fst without a title / .tp-v-lst):
     they swallow the panel padding and take its radius on the outer corners */
  &:not(:has(> summary, > .s-panel-title)) > .s-panel-content > .s-folder:first-child { margin-top: calc(var(--panel-padding) * -1); > summary { border-radius: var(--radius-lg) var(--radius-lg) 0 0; } }
  > .s-panel-content > .s-folder:last-child { margin-bottom: calc(var(--panel-padding) * -1); &::before { border-bottom-left-radius: var(--radius-lg); }
    &:not([open]) > summary { border-bottom-left-radius: var(--radius-lg); border-bottom-right-radius: var(--radius-lg); } }

  /* ── Info / separator ── */
  /* native .tp-sglv_i is a readonly input at line-height normal: its text box centers in the 20px well */
  .s-info .s-monitor { display: flex; align-items: center; opacity: 1; background: var(--well); border-radius: var(--r); padding: 0 var(--u); height: var(--row); line-height: normal; color: var(--monitor); font-variant-numeric: tabular-nums; }
  /* native .tp-sprv_r: a 2px groove across the full panel width */
  .s-separator { min-height: 0; height: var(--track); background: var(--field); opacity: 1; margin: 0 calc(var(--panel-padding) * -1); }
  .s-separator-labeled { height: auto; background: none; margin: 0; }
  .s-separator-label { color: ${sepLabel}; opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
