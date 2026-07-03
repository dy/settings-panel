/**
 * controlkit — calibrated to ControlKit.js's dark panel
 *
 * Signatures: a dense, flat near-black panel with gradient group-header bars, a
 * single burgundy-red (#b32435) thumbless slider fill, a strict label/control
 * split, and Arial type — the "Photoshop-panel" inspector look.
 * Ref: https://github.com/automat/controlkit.js
 *
 * Axes: shade (panel/chrome near-black), accent (slider/focus red), field (input fill).
 * Every other color in the file is one of two derived families, each an OKLCH
 * lightness/chroma/hue offset off an axis's own parsed color (skeu's `$` model):
 *   - shade-family: neutral panel chrome — bevels, buttons, folder bars, borders.
 *     A hued `shade` tints the whole chrome ramp, since C/H ride the live axis.
 *   - field-family: the cool content tint — labels, inset/sunken tone, pad detail.
 *     A retinted `field` retints labels/inset/pad together the same way.
 * A few native constants (the OS-blue checkbox tint, pure ink/void) aren't a
 * function of any axis in the real ControlKit skin — they're still named tokens
 * below, just with fixed defaults.
 *
 * controlkit(axes?) → CSS string
 */

import baseCSS from './base.js'
import { parseColor, resolveAccent, toHex, clamp } from './color.js'

const { max } = Math

export default function controlkit({
  shade = '#1a1a1a',
  accent = '#b32435',
  field = '#222729',
} = {}) {
  const acc = resolveAccent(accent, shade)
  const ink = '#fff'
  const enc = c => encodeURIComponent(c)

  // ── Derived tokens ──
  // Serialized as hex (not oklch()) so these can double as gradient/radial-gradient
  // stops: Chromium's default gradient interpolation space differs subtly enough
  // between oklch() and hex stops to dither a handful of in-between pixels off by
  // one — hex keeps every consumer (solid fill, gradient stop, box-shadow) on the
  // exact same rendering path the reference screenshots were measured against.
  const { C: surfaceC, H: surfaceH, L: surfaceL } = parseColor(shade)
  const { C: fieldC, H: fieldH, L: fieldL } = parseColor(field)
  const $ = (L, C, H) => toHex({ L: clamp(L, 0, 1), C: max(C, 0), H })
  // shade-family: lightness offset off shade's own OKLCH, chroma/hue carried live
  const s = (dL) => $(surfaceL + dL, surfaceC, surfaceH)
  // field-family: L/C/H offsets off field's own OKLCH, carried live
  const f = (dL, dC, dH) => $(fieldL + dL, fieldC + dC, fieldH + dH)

  // native fields carry a faint top-to-bottom inset gradient over the flat fill —
  // that's what reads as "darker" than a plain fill at a glance
  const text = f(0.499901, 0.000862, 1.3708)
  const muted = f(0.249410, -0.002218, 5.1557)
  // ControlKit's real chrome: a flat near-black panel/title (shade) with each row
  // painted a touch lighter on top — that row tint (not a darker title) is what
  // gives the panel its depth.
  const inset = f(-0.019865, -0.001096, 5.4017)
  const bevelDk = s(0.021506)      // was #1f1f1f
  const bevelLt = s(0.191334)      // was #4a4a4a
  const bevelDarkDk = s(-0.031045) // was #131313
  const bevelDarkLt = f(-0.007324, -0.001175, 5.3760) // was #212527
  const chromeHi = s(0.172634)     // was #454545
  const chromeLo = s(0.134538)     // was #3b3b3b
  const chromeGlow = s(0.228111)   // was #545454, button hover highlight
  const sectionBg = s(0.054954)    // was #272727
  const padCross = s(-0.004364)    // was #191919
  const selectArrow = s(0.520232)  // was #aaaaaa
  const checkboxBorder = s(0.415642) // was #8a8a8a
  const padAxis = f(0.083505, 0.002582, 13.1425)      // was #363c40
  const padDotFill = f(0.113919, 0.011537, 9.8598)    // was #39454c
  const padDotBg = f(0.202892, 0.006795, 5.4561)      // was #535d62
  const fieldLine = f(-0.083613, -0.004313, 5.2852)   // was #111314 (pad ring + color-picker hairline)
  const minmaxLabel = f(0.378781, -0.002529, 5.1183)  // was #8b8f91
  const chevFillTitle = f(0.245079, 0.005709, -0.0443) // was #5f696d, title's own collapse chevron

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --field: ${field};
  --u: 4px;
  --spacing: 1;
  --weight: 400;
  --r: 2px;
  color-scheme: dark;

  --text: ${text};
  --muted: ${muted};
  --inset: ${inset};
  --row: color-mix(in srgb, var(--bg), white 8.7%);
  --field-bg: linear-gradient(var(--overlay-1), var(--overlay-2)), var(--field);
  --bevel-dk: ${bevelDk};
  --bevel-lt: ${bevelLt};
  --bevel: inset 0 0 0 1px var(--bevel-dk), inset -1px 2px 0 0 var(--bevel-lt);
  /* same bevel technique, darker-toned — for chrome that sits on the near-black
     title rather than the light gray button gradient */
  --bevel-dark-dk: ${bevelDarkDk};
  --bevel-dark-lt: ${bevelDarkLt};
  --bevel-dark: inset 0 0 0 1px var(--bevel-dark-dk), inset -1px 2px 0 0 var(--bevel-dark-lt);
  --chrome-hi: ${chromeHi};
  --chrome-lo: ${chromeLo};
  --chrome-glow: ${chromeGlow};
  --chrome: linear-gradient(var(--chrome-hi), var(--chrome-lo));
  --chrome-hover: linear-gradient(var(--bevel-lt), var(--chrome-lo));
  --chrome-active: linear-gradient(var(--chrome-lo), var(--chrome-hi));
  --section-bg: ${sectionBg};
  --pad-cross: ${padCross};
  --pad-axis: ${padAxis};
  --pad-dot-fill: ${padDotFill};
  --pad-dot-bg: ${padDotBg};
  --field-line: ${fieldLine};
  --minmax-label: ${minmaxLabel};
  --select-arrow: ${selectArrow};
  --checkbox-border: ${checkboxBorder};
  --checkbox-tint: #2f6fb3;
  --ink: ${ink};
  --void: #000;
  --shadow: rgba(0, 0, 0, .25);
  --overlay-1: rgba(0,0,0,.075);
  --overlay-2: rgba(0,0,0,.125);
  --overlay-3: rgba(0,0,0,.15);
  --overlay-4: rgba(0,0,0,.05);
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='${enc(selectArrow)}' stroke-width='1.6'/%3E%3C/svg%3E");

  background: var(--bg);
  color: var(--text);
  font: 11px/1.4 Arial, Helvetica, sans-serif;
  width: 200px;
  min-width: 0;
  max-width: 200px;
  border-radius: 3px;
  padding: 0;
  box-shadow: var(--shadow) 0 2px 2px 0;

  /* ── Title (flat, same near-black as the panel — rows are what read lighter) ── */
  > summary, > .s-panel-title {
    background: var(--bg); color: var(--muted); font-weight: 700; height: 30px; padding: 0 10px; font-size: 11px; text-shadow: 0 1px 0 var(--void);
    &::after { content: ''; width: 20px; height: 20px; margin-left: auto; background: var(--inset) url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 4 L5 7 L8 4Z' fill='${enc(chevFillTitle)}'/%3E%3C/svg%3E") center / 10px 10px no-repeat; border-radius: 2px; box-shadow: var(--bevel-dark); -webkit-mask: none; mask: none; transition: transform .1s; }
  }
  &[open] > summary::after { transform: rotate(-180deg); }
  .s-panel-content { gap: 0; padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Row (a touch lighter than the panel/title behind it) ── */
  .s-control { gap: 0; padding: 0 10px; min-height: 35px; align-items: center; background: var(--row); border-bottom: 1px solid var(--field); }
  .s-label-group { flex: 0 0 54px; width: 54px; min-width: 0; max-width: none; padding: 0; }
  .s-label { color: var(--text); font-weight: 400; text-shadow: 1px 1px 0 var(--void); }
  .s-hint { color: var(--muted); font-size: 10px; }
  .s-input { gap: 4px; align-items: center; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--field-bg); color: var(--ink); border: none; border-radius: 2px;
    height: 26px; padding: 0 8px; font: inherit; text-shadow: 1px 1px 0 var(--void);
    box-shadow: inset 0 0 0 1px var(--bevel-dk);
    &::placeholder { color: var(--muted); }
    &:focus { outline: 0; }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Slider: dark slot, red fill inset from the edges, no thumb, number right ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 12px; }
    .s-track { height: 26px; margin: 0; background: var(--inset); border-radius: 2px; padding: 3px; box-shadow: inset 0 0 0 1px var(--bevel-dk); cursor: ew-resize; }
    input[type="range"] {
      width: 100%; height: 100%; -webkit-appearance: none; appearance: none; cursor: ew-resize; border: none; border-radius: 1px;
      background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), transparent var(--p, 0%)), linear-gradient(to bottom, transparent, var(--overlay-3));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 0; height: 100%; }
      &::-moz-range-thumb { width: 0; height: 100%; border: none; }
      &:focus-visible { outline: 1px solid var(--accent); outline-offset: 1px; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: var(--muted); white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: 32px; min-width: 32px; text-align: center; background: var(--field-bg); color: var(--ink); border: none; border-radius: 2px; height: 26px; line-height: 26px; padding: 0; font-variant-numeric: tabular-nums; text-shadow: 1px 1px 0 var(--void); box-shadow: inset 0 0 0 1px var(--bevel-dk); }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: var(--void); color: var(--ink); padding: 1px 4px; white-space: nowrap; }
    /* 1fr columns (not 4×32px) so the 4-up grid sums to exactly the value column's width —
       fixed px columns overshot it by 2px, pushing MAX's readout past the row's right edge */
    &.s-multiple .s-input { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
    &.s-multiple .s-interval-track { display: none; }
    &.s-multiple .s-readout { position: relative; width: 32px; min-width: 32px; cursor: ew-resize; }
    &.s-multiple .s-readout-lo { grid-column: 2; }
    &.s-multiple .s-readout-hi { grid-column: 4; }
    &.s-multiple .s-readout-lo::before,
    &.s-multiple .s-readout-hi::before { position: absolute; right: 100%; top: 0; width: 32px; height: 26px; display: grid; place-items: center; color: var(--minmax-label); font-weight: 700; }
    &.s-multiple .s-readout-lo::before { content: 'MIN'; }
    &.s-multiple .s-readout-hi::before { content: 'MAX'; }
  }

  /* ── Select: styled as the same gray-gradient button as .s-button, per ControlKit's real chrome ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer; color: var(--ink); font-weight: 700;
      border-radius: 2px; height: 26px; padding: 0 20px 0 10px; box-shadow: var(--bevel);
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 8 12' xmlns='http://www.w3.org/2000/svg' fill='${enc(selectArrow)}'%3E%3Cpath d='M0 5 L4 1 L8 5Z'/%3E%3Cpath d='M0 7 L4 11 L8 7Z'/%3E%3C/svg%3E"), var(--chrome); background-repeat: no-repeat, repeat; background-position: right 8px center, 0 0; background-size: 8px 12px, auto;
      &:hover { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 8 12' xmlns='http://www.w3.org/2000/svg' fill='${enc(selectArrow)}'%3E%3Cpath d='M0 5 L4 1 L8 5Z'/%3E%3Cpath d='M0 7 L4 11 L8 7Z'/%3E%3C/svg%3E"), var(--chrome-hover); }
      option { background: var(--field); color: var(--text); } }
    &.s-segmented { .s-input { gap: 0; } button { flex: 1; background: var(--field); border: 1px solid var(--void); color: var(--text); margin-left: -1px; padding: 2px; font: inherit; &:first-child { margin-left: 0; } &.s-selected { background: var(--accent); color: var(--ink); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: 2px; } .s-input label { display: flex; align-items: center; gap: 5px; cursor: pointer; } }
  }

  /* ── Boolean: small checkbox ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { -webkit-appearance: none; appearance: none; position: static; opacity: 1; width: 13px; height: 13px; margin: 0; border-radius: 2px; background: var(--ink); border: 1px solid var(--checkbox-border); box-sizing: border-box; cursor: pointer;
      &:checked { border-color: var(--checkbox-tint); background: var(--checkbox-tint) url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='${enc(ink)}' stroke-width='2'/%3E%3C/svg%3E") center / 10px no-repeat; }
      &:focus-visible { outline: 1px solid var(--accent); outline-offset: 2px; } }
    .s-track { display: none; }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input { gap: 0; position: relative; border-radius: 2px; overflow: hidden; box-shadow: inset 0 0 0 1px var(--field-line);
      input[type="color"] { position: absolute; inset: 0; width: 100%; height: 26px; padding: 0; border: none; cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } }
      input[type="text"] { position: relative; flex: 1; background: transparent; color: var(--ink); mix-blend-mode: normal; font-family: Arial, sans-serif; font-weight: 700; text-align: center; padding: 0; height: 26px; text-shadow: 1px 1px 0 var(--void); } }
    &.s-rgba .s-color-input { gap: 4px; input[type="color"] { width: 28px; height: 19px; } input[type="text"] { flex: 1; } }
    &.s-swatches button { width: 16px; height: 16px; border: 1px solid var(--void); &.s-selected { outline: 1px solid var(--accent); } }
  }

  /* ── Button: gray gradient, uppercase ── */
  button { font: inherit; cursor: pointer; &:focus-visible { outline: 1px solid var(--accent); outline-offset: 1px; } }
  .s-button {
    /* full-width by owner's decision — native ControlKit keeps buttons at the value column */
    .s-input { flex: 1; }
    button { width: 100%; background: var(--chrome); color: var(--ink); border: none; border-radius: 2px; height: 26px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; text-shadow: 0 1px 0 var(--void); box-shadow: var(--bevel); &:hover { background: var(--chrome-hover); box-shadow: inset 0 0 0 1px var(--bevel-dk), inset -1px 2px 0 0 var(--chrome-glow); } &:active { background: var(--chrome-active); box-shadow: inset 0 0 0 1px var(--bevel-dk); } }
    &.s-secondary button, button.s-secondary { background: var(--field); }
  }

  /* ── XY pad: 126px square pad row, matching ControlKit's large pad control ── */
  .s-xy { min-height: 138px; align-items: flex-start; padding-top: 5px; }
  .s-pad {
    position: relative; width: 126px; height: 126px; border-radius: 2px; border: none;
    /* native's pad face carries a faint top-to-bottom inset gradient over the flat fill, same trick as the fields */
    background: linear-gradient(transparent, var(--overlay-4)), var(--inset);
    /* fixed center crosshair (native ControlKit draws one at origin, one following the dot) */
    &::before, &::after { content: ''; position: absolute; background: var(--pad-cross); pointer-events: none; }
    &::before { left: 0; right: 0; top: 50%; height: 1px; }
    &::after { top: 0; bottom: 0; left: 50%; width: 1px; }
    .s-pad-x, .s-pad-y { background: var(--pad-axis); }
    .s-pad-x { top: var(--y, 50%); }
    .s-pad-y { left: var(--x, 50%); }
    /* native draws the dot as layered flat SVG circles (r11 halo, r10 base, r9 fill offset
       0.75px down, r10 ring stroke, r6 inner disc, r3 center) — reproduced here 1:1 in px:
       a 20px (r10) disc, a darker fill circle shifted down to leave a top highlight rim,
       then the inner disc/center dot as pseudo-elements on top, same paint order. */
    .s-pad-dot {
      width: 20px; height: 20px; box-sizing: border-box; border-radius: 50%;
      background: radial-gradient(circle 9px at 50% calc(50% + 0.75px), var(--pad-dot-fill) 9px, transparent 9px), var(--pad-dot-bg);
      /* native's ring is an SVG stroke centered on the r10 edge (9.5–10.5) — a pure outward
         spread (10–11) leaves too much of the highlight rim exposed (1.75px vs native's 1.25px,
         reading thicker); split the ring in and out by half a px so it straddles the edge too */
      box-shadow: 0 0 0 .5px var(--field-line), inset 0 0 0 .5px var(--field-line), 0 0 0 1px var(--overlay-4);
      &::before { content: ''; position: absolute; inset: 0; margin: auto; width: 12px; height: 12px; border-radius: 50%; background: var(--inset); }
      &::after { content: ''; position: absolute; inset: 0; margin: auto; width: 6px; height: 6px; border-radius: 50%; background: var(--ink); }
    }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 40px; max-height: 50vh; padding: 3px 4px; } }

  /* ── Folder: gradient group header ──
     the <details> itself carries .s-control too (folder.js), so it inherits that row's
     padding/background/border-bottom/min-height — reset them here so the folder spans the
     panel edge-to-edge like native's group headers, same as base.js resolves .s-folder's
     display over .s-control's: equal specificity, this rule sits later in the cascade. */
  .s-folder {
    padding: 0; min-height: 0; background: none; border-bottom: 0;
    > summary { background: var(--chrome); color: var(--ink); font-weight: 700; height: 38px; padding: 0 10px; border-bottom: 1px solid var(--void); text-shadow: 0 1px 0 var(--void);
      &::after { content: ''; width: 8px; height: 8px; margin-left: auto; background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .1s; } }
    &[open] > summary::after { transform: rotate(-180deg); }
    &.s-section > summary, .s-content .s-folder > summary { background: var(--section-bg); }
    .s-content { gap: 0; }
  }

  /* ── Info / separator: readout rendered as the same boxed field as our text inputs ── */
  .s-info .s-monitor {
    flex: 1; display: block; background: var(--field-bg); color: var(--ink); border-radius: 2px;
    height: 26px; line-height: 26px; padding: 0 8px; text-shadow: 1px 1px 0 var(--void);
    box-shadow: inset 0 0 0 1px var(--bevel-dk); font-variant-numeric: tabular-nums; opacity: 1;
  }
  .s-separator { background: var(--void); opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
