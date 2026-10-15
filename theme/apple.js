/**
 * apple: macOS 26 System Settings, i.e. SwiftUI Form(.grouped) as
 * AppKit renders it (measured at 2x from the OS itself, not from mockups).
 *
 * The panel is one grouped sheet: 12px corners, rows inset 10px with 1px
 * half-strength separators, 13px SF labels at 45% of the row, borderless
 * trailing text fields, 24px push buttons and segments (6px corners), the
 * Tahoe 36x16 mini switch with a 21x13 capsule knob, 6px slider track with a
 * 20x16 capsule thumb, popup value + 20px chevron disc, and a 48x24 color well.
 *
 * Axes: shade is the window background; every role is a macOS semantic color
 * (label .847, secondary .498/.549, fills .098/.078, separator), i.e. black ink
 * over light shades and white over dark, so colormaps tint the sheet the way
 * vibrancy-free AppKit does. Accent is controlAccentColor; its text stays white
 * unless white would fall under WCAG's 3:1 minimum on it, and a fill under white
 * text darkens only as far as 4.5:1 needs (macOS's #007aff gives 4.0:1).
 *
 * Sources: NSColor semantic colors (sRGB) and SwiftUI/AppKit control frames
 * dumped on macOS 26.5; pixel values sampled from the offscreen render.
 *
 * apple(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { parseColor, resolveAccent, contrast, toHex, ink as legible } from './color.js'

export default function apple({
  shade = '#ffffff',
  accent = '#007aff',
  size = 1,
  spacing = 1,
  font,
} = {}) {
  const { L } = parseColor(shade)
  const dark = L < 0.5
  const acc = resolveAccent(accent, shade)
  const ink = dark ? '255 255 255' : '0 0 0'
  const a = alpha => `rgb(${ink} / ${alpha})`
  // sRGB mixes, resolved to measure contrast on
  const inkHex = dark ? '#ffffff' : '#000000'
  const ch = c => [1, 3, 5].map(i => parseInt(toHex(parseColor(c)).slice(i, i + 2), 16))
  const blend = (x, y, t) => '#' + ch(x).map((v, i) => Math.round(v * t + ch(y)[i] * (1 - t)).toString(16).padStart(2, '0')).join('')
  const sheetHex = blend(inkHex, shade, .031)
  // secondaryLabelColor reads 3.9:1 on the light sheet; its alpha rises until it reads 4.5:1
  let k = dark ? .549 : .498
  while (k < 1 && contrast(blend(inkHex, sheetHex, k), sheetHex) < 4.5) k += .01

  // ── macOS semantic colors, as alpha over the window (NSColor, sRGB) ──
  const label = a(.847)                              // labelColor
  const text = dark ? '#fff' : '#000'                // textColor: field values
  const dim = a(+k.toFixed(3))                       // secondaryLabelColor: readouts, hints, info
  const disabled = a(.247)                           // disabledControlTextColor
  const rule = a(.098)                               // separatorColor: segment dividers
  const line = a(.049)                               // row separator, drawn at half strength
  const track = a(.098)                              // systemFill: slider / switch off / checkbox / well ring
  const control = a(.078)                            // secondarySystemFill: push button, segmented, popup disc
  const controlOff = a(.04)                          // disabled push button
  const sheet = `color-mix(in srgb, var(--bg), rgb(${ink}) 3.1%)`   // grouped box: #f7f7f7 on white, #252525 on #1e1e1e
  // Switch, segment, slider and checkbox fills tint the accent 2.4% toward ink (#0077f9 / #067dff for #007aff)
  const accentFill = `color-mix(in srgb, var(--accent), rgb(${ink}) 2.4%)`
  const onAccent = (contrast('#ffffff', acc) ?? 21) >= 3 ? '#fff' : '#000'
  const lift = c => onAccent === '#fff' ? legible('#fff', 4.5, c) : c
  const action = lift(acc)                                                                    // push button
  const actionFill = parseColor(acc, null) ? lift(blend(inkHex, acc, .024)) : accentFill     // selected segment
  const knob = dark ? '#e2e2e2' : '#fff'              // switch knob, off
  const knobOn = dark ? 'color-mix(in srgb, #fff, var(--accent) 14.5%)' : '#fff'
  const thumb = dark ? '#dfdfdf' : '#fff'             // slider thumb
  const chevron = dark ? '#fff' : a(.259)             // disclosure chevron (tertiaryLabel in Aqua)

  const shadowThumb = '0 1px 4px rgb(0 0 0 / .08)'
  const shadowKnob = '0 -1px 4px rgb(0 0 0 / .1)'

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { fontSize: 13, fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif", lineHeight: 16, controlHeight: 24, inset: 10, rowGap: 0, columnGap: 8, sectionGap: 20, panelPadding: 0 })}

  /* ── Axes → color tokens ── */
  --bg: ${shade};
  --accent: ${acc};
  --accent-fill: ${accentFill};
  --on-accent: ${onAccent};
  --action: ${action};
  --action-fill: ${actionFill};
  --fill: ${sheet};
  --ink: ${label};
  --text: ${text};
  --dim: ${dim};
  --disabled: ${disabled};
  --rule: ${rule};
  --line: ${line};
  --track: ${track};
  --control: ${control};
  --control-off: ${controlOff};
  --knob: ${knob};
  --knob-on: ${knobOn};
  --thumb-face: ${thumb};
  --chevron: ${chevron};
  --focus: color-mix(in srgb, var(--accent) 50%, transparent);
  --shadow-thumb: ${shadowThumb};
  --shadow-knob: ${shadowKnob};

  /* ── Size tokens: native frames in points ── */
  --weight: 400;
  --w: calc(320 * var(--length));
  --r: calc(6 * var(--length));                 /* push button, segmented, popup focus ring */
  --r-panel: calc(12 * var(--length));          /* grouped box */
  --r-check: calc(5.5 * var(--length));         /* checkbox */
  --field-h: var(--control-height);
  --switch-w: calc(36 * var(--length));
  --switch-h: calc(16 * var(--length));
  --knob-w: calc(21 * var(--length));
  --knob-h: calc(13 * var(--length));
  --thumb-w: calc(20 * var(--length));
  --thumb-h: calc(16 * var(--length));
  --track-h: calc(6 * var(--length));
  --check: calc(16 * var(--length));
  --disc: calc(20 * var(--length));             /* popup chevron disc */
  --well-w: calc(48 * var(--length));
  --ease: cubic-bezier(.2, 0, 0, 1);
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--fill);
  color: var(--ink);
  width: min(100%, var(--w));
  min-width: 0;
  max-width: min(100%, var(--w));
  border-radius: var(--r-panel);
  padding: 0;
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
  -webkit-font-smoothing: auto;               /* system text smoothing, as AppKit draws labels */

  /* ── Section headers (13pt semibold, as Form renders them) with a trailing disclosure chevron ── */
  > summary, > .s-panel-title, .s-folder > summary { font-weight: 600; color: var(--ink); padding: var(--inset); }
  > summary::after, .s-folder > summary::after { content: ''; flex: none; width: calc(10 * var(--length)); height: calc(10 * var(--length)); margin-left: auto; background: var(--chevron); -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transform: rotate(-90deg); transition: transform .15s var(--ease); }
  &[open] > summary::after, .s-folder[open] > summary::after { transform: none; }
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='1.5,3.5 5,7 8.5,3.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  .s-panel-content { gap: var(--row-gap); padding: 0; }

  /* ── Row: label at the leading 45%, controls trailing, separator inset like the content ── */
  .s-control { gap: var(--column-gap); padding: var(--inset); align-items: flex-start;
    border-top: 1px solid transparent; background: linear-gradient(var(--line), var(--line)) var(--inset) 0 / calc(100% - 2 * var(--inset)) 1px no-repeat border-box;
    &:first-child { border-top: 0; background: none; } }
  .s-label-group { width: calc(45% - var(--column-gap)); min-width: 0; max-width: none; padding: 0; gap: calc(2 * var(--length)); line-height: var(--line-height); }
  .s-label { color: var(--ink); font-weight: 400; }
  .s-hint { color: var(--dim); opacity: 1; font-size: calc(11 * var(--length)); line-height: calc(14 * var(--length)); }
  .s-input { gap: var(--column-gap); align-items: center; justify-content: flex-end; margin-left: auto; }

  /* ── Fields: borderless, trailing, textColor (grouped-form text fields have no bezel) ── */
  input[type="text"], input[type="number"], textarea {
    background: transparent; color: var(--text); border: none; border-radius: 0;
    height: var(--line-height); padding: 0 calc(1 * var(--length)); font: inherit; text-align: right; outline: none;
    &::placeholder { color: var(--dim); }
  }
  input[type="number"] { -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; cursor: ew-resize; } .s-step { display: none; } }

  /* ── Vector: "x  0  y  0", label-colored axis names ── */
  .s-vector {
    .s-input { gap: var(--column-gap); flex-wrap: wrap; }
    .s-vec-axis { flex: 1; min-width: 6ch; gap: var(--column-gap); }
    .s-vec-label { color: var(--ink); opacity: 1; font-size: inherit; }
  }

  /* ── Slider: 6px capsule track, 20x16 capsule thumb, secondary readout ── */
  .s-slider {
    .s-track { height: var(--thumb-h); margin: 0; }
    input[type="range"] {
      width: 100%; height: var(--track-h); -webkit-appearance: none; appearance: none; border-radius: calc(var(--track-h) / 2); cursor: pointer;
      background: linear-gradient(to right, var(--accent-fill) var(--p, 0%), var(--track) var(--p, 0%));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--thumb-w); height: var(--thumb-h); border-radius: calc(var(--thumb-h) / 2); background: var(--thumb-face); box-shadow: var(--shadow-thumb); cursor: pointer; }
      &::-moz-range-thumb { width: var(--thumb-w); height: var(--thumb-h); border: none; border-radius: calc(var(--thumb-h) / 2); background: var(--thumb-face); box-shadow: var(--shadow-thumb); cursor: pointer; }
      &:focus-visible { outline: none; &::-webkit-slider-thumb { box-shadow: var(--shadow-thumb), 0 0 0 3px var(--focus); } &::-moz-range-thumb { box-shadow: var(--shadow-thumb), 0 0 0 3px var(--focus); } }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 4px); font-size: calc(11 * var(--length)); color: var(--dim); white-space: nowrap; }
    .s-readout { flex: none; field-sizing: content; width: auto; min-width: 1ch; background: none; color: var(--dim); border: none; height: var(--line-height); padding: 0; font: inherit; font-variant-numeric: tabular-nums; text-align: right; cursor: ew-resize; }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: calc(6 * var(--space)); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: var(--track-h); margin: calc(5 * var(--length)) 0; background: var(--track); border-radius: calc(var(--track-h) / 2); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent-fill); }
      input[type="range"] { background: none; } }
  }

  /* ── Select: popup = value + chevron disc; segmented; radio / checkboxes ── */
  .s-select {
    &.s-dropdown .s-input { position: relative; flex: 0 1 auto; min-width: 0; max-width: 100%; margin-block: calc(-3.75 * var(--length)) calc(-3 * var(--length));
      &::before, &::after { content: ''; position: absolute; top: 50%; right: 0; width: var(--disc); height: var(--disc); transform: translate(calc(-3.5 * var(--length)), -50%); pointer-events: none; }
      &::before { border-radius: 50%; background: var(--control); }
      /* chevron.up.chevron.down: 7x10.5, sits .5 left of the disc center */
      &::after { background: var(--ink); -webkit-mask: var(--pop-chev) calc(50% - .5 * var(--length)) 50% / calc(7 * var(--length)) calc(10.5 * var(--length)) no-repeat; mask: var(--pop-chev) calc(50% - .5 * var(--length)) 50% / calc(7 * var(--length)) calc(10.5 * var(--length)) no-repeat; } }
    --pop-chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 7 10.5' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='.75,3.25 3.5,.75 6.25,3.25'/%3E%3Cpolyline points='.75,7.25 3.5,9.75 6.25,7.25'/%3E%3C/svg%3E");
    &.s-dropdown select { field-sizing: content; width: auto; max-width: 100%; min-width: 0; height: var(--field-h); appearance: none; -webkit-appearance: none; cursor: pointer;
      background: none; border: none; border-radius: var(--r); color: var(--ink); font: inherit; text-align: right;
      text-overflow: ellipsis; overflow: hidden; white-space: nowrap;
      padding: 0 calc(35.5 * var(--length)) 0 calc(12 * var(--length));
      &:focus-visible { outline: 3px solid var(--focus); outline-offset: 0; }
      option { background: var(--fill); color: var(--ink); } }
    &.s-segmented { .s-input { flex: none; display: inline-grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 0; margin-top: calc(-4 * var(--length)); background: var(--control); border-radius: var(--r); }
      button { position: relative; height: var(--field-h); padding: 0 calc(10.25 * var(--length)); background: transparent; border: none; border-radius: var(--r); color: var(--ink); font: inherit; white-space: nowrap;
        &:not(.s-selected) + button:not(.s-selected)::before { content: ''; position: absolute; left: 0; top: calc(5 * var(--length)); bottom: calc(5 * var(--length)); width: .5px; transform: translateX(-.25px); background: var(--rule); }
        /* the selected pill stops 1pt short of neighbouring segments, flush with the control's own ends */
        &.s-selected { background: var(--action-fill) padding-box; color: var(--on-accent); &:not(:first-child) { border-left: 1px solid transparent; } &:not(:last-child) { border-right: 1px solid transparent; } }
        &:focus-visible { outline: 3px solid var(--focus); outline-offset: 0; } } }
    &.s-radio, &.s-checkboxes { .s-input label { display: flex; align-items: center; gap: calc(5 * var(--length)); cursor: pointer; } }
    &.s-radio .s-input { flex-direction: row; align-items: center; flex-wrap: wrap; column-gap: calc(16 * var(--length)); row-gap: calc(var(--u) * 2); }   /* radio group: options in a trailing row */
    &.s-checkboxes .s-input { flex-direction: column; align-items: flex-end; gap: calc(var(--u) * 2); }
    &.s-radio input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; width: var(--check); height: var(--check); border-radius: 50%; background: var(--track); display: grid; place-items: center;
      &::after { content: ''; width: calc(5 * var(--length)); height: calc(5 * var(--length)); border-radius: 50%; background: var(--on-accent); opacity: 0; }
      &:checked { background: var(--accent-fill); &::after { opacity: 1; } }
      &:focus-visible { outline: 3px solid var(--focus); outline-offset: 0; } }
    &.s-checkboxes .s-track { flex: none; display: grid; place-items: center; width: var(--check); height: var(--check); border-radius: var(--r-check); background: var(--track);
      &::after { content: ''; width: calc(10 * var(--length)); height: calc(9.5 * var(--length)); -webkit-mask: var(--check-glyph) center / contain no-repeat; mask: var(--check-glyph) center / contain no-repeat; background: var(--on-accent); opacity: 0; } }
    &.s-checkboxes label:has(input:checked) .s-track { background: var(--accent-fill); &::after { opacity: 1; } }
  }
  --check-glyph: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 9.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.1 5 L3.8 8.3 L8.9 1.1' fill='none' stroke='%23000' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");

  /* ── Boolean: Tahoe mini switch (36x16, 21x13 knob inset 1.5), checkbox, toggle ── */
  .s-boolean {
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &.s-switch {
      /* first-baseline alignment puts the switch .5pt below the label box */
      .s-track { flex: none; margin-top: calc(.5 * var(--length)); width: var(--switch-w); height: var(--switch-h); border-radius: calc(var(--switch-h) / 2); background: var(--track); position: relative; cursor: pointer; transition: background .2s var(--ease);
        /* offsets as transforms: Chromium snaps positioned boxes to whole CSS px, the 1.5px inset would land on 2 */
        &::after { content: ''; position: absolute; top: 0; left: 0; width: var(--knob-w); height: var(--knob-h); border-radius: calc(var(--knob-h) / 2); background: var(--knob); box-shadow: var(--shadow-knob); --inset-knob: calc((var(--switch-h) - var(--knob-h)) / 2); transform: translate(var(--inset-knob), var(--inset-knob)); transition: transform .2s var(--ease), background .2s var(--ease); } }
      &:has(input:checked) .s-track { background: var(--accent-fill); &::after { transform: translate(calc(var(--switch-w) - var(--knob-w) - var(--inset-knob)), var(--inset-knob)); background: var(--knob-on); } }
      &:has(input:focus-visible) .s-track { outline: 3px solid var(--focus); outline-offset: 0; }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: var(--check); height: var(--check); border-radius: var(--r-check); background: var(--track);
        &::after { content: ''; width: calc(10 * var(--length)); height: calc(9.5 * var(--length)); -webkit-mask: var(--check-glyph) center / contain no-repeat; mask: var(--check-glyph) center / contain no-repeat; background: var(--on-accent); opacity: 0; } }
      &:has(input:checked) .s-track { background: var(--accent-fill); &::after { opacity: 1; } }
      &:has(input:focus-visible) .s-track { outline: 3px solid var(--focus); outline-offset: 0; }
    }
    &.s-toggle .s-track { padding: 0 calc(12 * var(--length)); height: var(--field-h); border-radius: var(--r); background: var(--control); color: var(--ink); display: flex; align-items: center; justify-content: center; cursor: pointer; &::after { content: 'Off'; } }
    &.s-toggle:has(input:checked) .s-track { background: var(--action); color: var(--on-accent); &::after { content: 'On'; } }
  }

  /* ── Color: 48x24 well, 3px systemFill ring around the color capsule ── */
  .s-color {
    input[type="color"] { flex: none; width: var(--well-w); height: var(--field-h); padding: calc(3 * var(--length)); border: none; border-radius: calc(var(--field-h) / 2); background: var(--track); cursor: pointer;
      &::-webkit-color-swatch-wrapper { padding: 0; }
      &::-webkit-color-swatch { border: none; border-radius: calc(var(--field-h) / 2); box-shadow: inset 0 0 0 .5px rgb(0 0 0 / .1); }
      &::-moz-color-swatch { border: none; border-radius: calc(var(--field-h) / 2); box-shadow: inset 0 0 0 .5px rgb(0 0 0 / .1); }
      &:focus-visible { outline: 3px solid var(--focus); outline-offset: 0; } }
    &.s-picker .s-color-input { gap: var(--column-gap); justify-content: flex-end;
      input[type="color"] { position: static; }
      input[type="text"] { flex: 1; min-width: 7ch; order: -1; } }
    &.s-rgba .s-color-input { gap: var(--column-gap); justify-content: flex-end; input[type="text"] { flex: 1; } }
    &.s-swatches { .s-input { flex-wrap: wrap; justify-content: flex-end; } button { width: var(--check); height: var(--check); border-radius: 50%; border: none; box-shadow: inset 0 0 0 .5px rgb(0 0 0 / .1); &.s-selected { outline: 2px solid var(--accent); outline-offset: 2px; } } }
  }

  /* ── Button: 24pt push buttons, trailing; default action = accent ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: var(--column-gap); }
    button { flex: none; height: var(--field-h); padding: 0 calc(12 * var(--length)); background: var(--action); color: var(--on-accent); border: none; border-radius: var(--r); font-weight: 400; white-space: nowrap;
      &:active { filter: brightness(.92); }
      &:focus-visible { outline: 3px solid var(--focus); outline-offset: 0; }
      &:disabled { background: var(--control-off); color: var(--disabled); filter: none; cursor: default; } }
    &.s-secondary button, button.s-secondary { background: var(--control); color: var(--ink); &:active { background: color-mix(in srgb, var(--control), rgb(${ink}) 8%); filter: none; } }
  }

  /* ── Textarea: borderless like the fields, leading-aligned prose ── */
  .s-textarea { textarea { flex: 1; height: auto; resize: vertical; field-sizing: content; min-height: calc(3 * var(--line-height)); max-height: 50vh; text-align: left; } }

  /* ── Folder: section header inside the sheet ── */
  .s-folder {
    padding: 0; /* .s-folder also matches .s-control: its header and rows carry their own insets */
    > summary { padding-top: var(--section-gap); }
    .s-content { gap: 0; }
  }

  /* ── XY pad / knob ── */
  .s-pad { border-radius: var(--r); background: var(--control); border-color: var(--line); }
  .s-knob-dial { background: var(--control); border: none; }

  /* ── Help tag (circled "?", hover shows an NSToolTip-style 11pt tag); slider tooltip shares the tag ── */
  .s-title { display: inline-grid; place-items: center; flex: none; width: var(--check); height: var(--check); border-radius: 50%; background: var(--control); color: var(--ink); font-size: calc(11 * var(--length)); font-weight: 600; line-height: 1; cursor: help;
    &:is(:hover, :focus-visible) + .s-title-text { opacity: 1; visibility: visible; } }
  .s-title-text { position: absolute; left: 0; top: 100%; z-index: 10; margin-top: calc(4 * var(--length)); width: max-content; max-width: 30ch; pointer-events: none; opacity: 0; visibility: hidden; transition: opacity .12s var(--ease); }
  .s-title-text, .s-tooltip { padding: calc(3 * var(--length)) calc(7 * var(--length)); font-size: calc(11 * var(--length)); line-height: calc(14 * var(--length)); color: var(--ink); background: var(--fill); border-radius: var(--r); box-shadow: 0 2px 8px rgb(0 0 0 / .2), 0 0 0 .5px rgb(0 0 0 / .12); }

  /* ── Info / separator ── */
  .s-info { .s-input { justify-content: flex-end; } .s-monitor { flex: 0 1 auto; color: var(--dim); opacity: 1; text-align: right; } }
  .s-separator { margin: 0 var(--inset); &:not(.s-separator-labeled) { background: var(--line); opacity: 1; } }
}`

  return baseCSS + '\n' + overrides
}
