/**
 * Neu theme — neumorphism / soft UI
 *
 * Elements extrude from a same-color surface via paired shadows (light top-left,
 * dark bottom-right) plus a matching directional sheen on the surface itself, so
 * controls read as molded plastic rather than a flat sticker. No borders; inputs
 * are sunken (inset) wells, buttons/thumbs/toggles rise proud of the surface,
 * pressed states invert. Soft, quiet, tactile — low contrast, same-hue throughout.
 *
 * Axes: shade/accent set the hue (resolveRoles derives fg/fg-muted/accent from
 * them); depth scales both the shadow tone's contrast and its physical
 * distance/blur throw; softness re-ratios blur against distance independent of
 * depth (higher = hazier edge, lower = crisper); spacing/weight/roundness/size
 * are the shared structural axes every theme exposes.
 *
 * neu(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveRoles } from './color.js'
import { neuShadow, neuInset } from './mixins.js'

export default function neu({
  shade = '#e6e7ee',
  accent,
  spacing = 1,
  weight = 500,
  roundness = 1.4,
  depth = 1,
  softness = 1,
  size = 1,
} = {}) {
  const { dark, fg, fgMuted, accent: acc } = resolveRoles(shade, accent)
  const enc = c => encodeURIComponent(c)   // any CSS color, safe inside an SVG data-URI

  // Shadow tones derived from the surface so the effect holds on any shade.
  // Two-layer shadows (tight contact + wide ambient) read as soft-molded plastic
  // instead of a single flat blur; the light layer runs brighter than the dark
  // layer is dark, matching how a lit convex surface actually falls off.
  // On a dark shade the surface L is already near the floor, so a fixed subtractive
  // delta clips into a flat near-black instead of a graduated falloff — dampen the
  // dark leg (and let the light leg run fuller) in dark mode, mirroring how
  // resolveRoles flips its own light/dark falloff `sign` for surface/border roles.
  const dk = (n) => `oklch(from var(--bg) calc(l - ${(n * depth).toFixed(3)}) c h)`
  const lt = (n) => `oklch(from var(--bg) calc(l + ${(n * depth).toFixed(3)}) c h)`
  const dSh = dk(dark ? 0.07 : 0.16), dShWide = dk(dark ? 0.045 : 0.09)
  const lSh = lt(dark ? 0.16 : 0.11), lShWide = lt(dark ? 0.09 : 0.07)
  const sheenHi = lt(dark ? 0.035 : 0.05), sheenLo = dk(0.035)

  // distance/blur pairs — near contact shadow + wide soft falloff, ~1:2 ratio each.
  // depth scales the throw (both legs move together, like the relief growing
  // deeper); softness re-ratios blur against distance on top of that (higher =
  // hazier edge, lower = crisper) — the two axes compose, not replace each other.
  const D = (n) => `${+(n * depth).toFixed(3)}px`
  const B = (n) => `${+(n * depth * softness).toFixed(3)}px`
  const layer2 = (d1, b1, d2, b2) => `${neuShadow(D(d1), B(b1), dSh, lSh)}, ${neuShadow(D(d2), B(b2), dShWide, lShWide)}`
  const inset2 = (d1, b1, d2, b2) => `${neuInset(D(d1), B(b1), dSh, lSh)}, ${neuInset(D(d2), B(b2), dShWide, lShWide)}`

  const raisedLg = layer2(7, 14, 16, 34)   // panel drop shadow
  const raised = layer2(4, 8, 9, 20)
  const raisedSm = layer2(2, 4, 4, 10)
  const raisedXs = layer2(1, 2, 2, 5)
  const sunken = inset2(2, 4, 5, 11)
  const sunkenSm = inset2(1, 2, 3, 7)
  const sunkenTrack = inset2(1, 3, 3, 7)    // slider groove — tighter falloff for a thin channel
  const pressXs = inset2(1, 2, 2, 4)        // active-press micro inset (step buttons, swatches)
  const focusRing = (c = 'var(--accent)') => `0 0 0 4px color-mix(in oklab, ${c}, transparent 72%)`
  // Directional sheen: a whisper of the same light/dark tilt baked into the fill
  // itself (not just the shadow), so the plastic looks lit, not just outlined.
  const sheen = `linear-gradient(135deg, ${sheenHi}, var(--bg) 35%, var(--bg) 65%, ${sheenLo})`

  // Glossy highlight duo — a whisper of specular white/black baked into pressed or
  // checked fills so plastic reads as lit, not flat; the color swatch runs a touch
  // stronger than toggles/checkboxes, both fixed ratios independent of shade/depth.
  const glossHi = (a = 60) => `inset 0 1px 1px color-mix(in oklab, white, transparent ${a}%)`
  const glossLo = (a = 80) => `inset 0 -1px 1px color-mix(in oklab, black, transparent ${a}%)`
  const gloss = (hi = 60, lo = 80) => `${glossHi(hi)}, ${glossLo(lo)}`

  // Fixed neutral icon tones — deliberately hue-independent (a quiet grey mark
  // reads as inert chrome regardless of the surface's tint); the header disclosure
  // dot nudges brighter in dark mode to hold contrast, matching how the rest of
  // the surface's own tone shifts between modes.
  const iconArrow = '#999'
  const iconChevron = dark ? '#999' : '#888'

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --fg: ${fg};
  --fg-muted: ${fgMuted};
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: ${roundness};
  --r: calc(var(--u) * var(--roundness) * 2.2);
  --u: ${4 * size}px;
  --s-clear-icon: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.5 2.5 L7.5 7.5 M7.5 2.5 L2.5 7.5' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E");
  color-scheme: ${dark ? 'dark' : 'light'};

  background: ${sheen};
  color: var(--fg);
  font-family: ui-rounded, 'SF Pro Rounded', system-ui, sans-serif;
  font-weight: var(--weight);
  border-radius: calc(var(--r) * 1.4);
  box-shadow: ${raisedLg};
  padding: calc(var(--u) * (3 + 2 * var(--spacing)));
  min-width: 27ch;
  max-width: calc(var(--u) * 110);
  -webkit-font-smoothing: antialiased;

  /* ── Header ── */
  > summary, > .s-panel-title { font-weight: 700; font-size: larger; color: var(--fg); }
  > summary {
    border-radius: var(--r);
    transition: box-shadow .15s;
    &:hover { box-shadow: ${raisedXs}; }
    &::after {
      content: ''; width: calc(var(--u) * 7); height: calc(var(--u) * 7); margin-left: auto; flex-shrink: 0;
      border-radius: 50%; background: ${sheen}; box-shadow: ${raisedSm};
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='3,4 5,6.5 7,4' fill='none' stroke='${enc(iconChevron)}' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"), ${sheen};
      background-repeat: no-repeat, no-repeat; background-position: center, 0 0; background-size: 60%, 100%;
      transition: transform .2s, box-shadow .15s;
    }
    &:hover::after { box-shadow: ${raisedSm}, 0 0 0 3px color-mix(in oklab, var(--accent), transparent 85%); }
  }
  &[open] > summary::after { transform: rotate(-180deg); }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: calc(var(--u) * (1 + 2 * var(--spacing))); }
  .s-panel-content { gap: calc(var(--pad) * 1.5); }

  /* ── Fold icon — core always injects this into the panel summary; the theme
     paints the disclosure control via summary::after above, so keep it inert. ── */
  .s-fold-icon { display: none; }

  /* ── Search ── */
  .s-search { background: var(--bg); box-shadow: ${sunkenSm}; border-radius: 999px; padding: calc(var(--u) * 0.75) calc(var(--u) * 1.5); gap: calc(var(--u) * 1.5); margin-left: auto; transition: box-shadow .15s; }
  .s-search-btn { width: calc(var(--u) * 3.5); height: calc(var(--u) * 3.5); opacity: .6; transition: opacity .12s; &:hover { opacity: 1; } }
  .s-search-input { appearance: none; -webkit-appearance: none; color: var(--fg); font-size: smaller; width: 12ch; outline: none;
    &::placeholder { color: var(--fg-muted); }
    &::-webkit-search-decoration, &::-webkit-search-results-button, &::-webkit-search-results-decoration { display: none; }
    &::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; width: calc(var(--u) * 3); height: calc(var(--u) * 3); margin-left: calc(var(--u) * 0.5); cursor: pointer; opacity: .5; transition: opacity .12s;
      background: currentColor; -webkit-mask: var(--s-clear-icon) center / contain no-repeat; mask: var(--s-clear-icon) center / contain no-repeat;
      &:hover { opacity: .9; } } }
  &.s-searching .s-search { box-shadow: ${sunkenSm}, ${focusRing()}; }
  > summary:has(.s-search) { &::after { margin-left: calc(var(--u) * 2); } }
  &.s-searching > summary:has(.s-search) { &::after { margin-left: calc(var(--u) * 4); } }

  /* ── Labels ── */
  .s-label { font-weight: 600; }
  .s-hint { color: var(--fg-muted); font-size: smaller; }
  .s-title { display: inline-flex; align-items: center; justify-content: center; width: calc(var(--u) * 4); height: calc(var(--u) * 4); border-radius: 50%; box-shadow: ${sunkenSm}; font-size: 10px; cursor: help;
    &:hover + .s-title-text { opacity: 1; visibility: visible; } }
  .s-title-text { position: absolute; left: 0; top: 100%; margin-top: var(--u); padding: calc(var(--u) * 1.5); font-size: smaller; background: ${sheen}; border-radius: var(--r); box-shadow: ${raised}; width: max-content; max-width: 30ch; z-index: 10; opacity: 0; visibility: hidden; pointer-events: none; }

  /* ── Sunken fields ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--bg); color: var(--fg); border: none; border-radius: var(--r); box-shadow: ${sunken};
    font: inherit; font-weight: var(--weight); transition: box-shadow .15s;
    &::placeholder { color: var(--fg-muted); }
    &:hover { box-shadow: ${sunken}, 0 0 0 1px color-mix(in oklab, var(--fg), transparent 92%); }
    &:focus-visible { outline: none; box-shadow: ${sunken}, ${focusRing()}; }
  }
  input[type="text"], input[type="number"], select { height: calc(1lh + var(--pad) * 2); padding: var(--pad) calc(var(--pad-i) + var(--u)); }
  input[type="number"] { font-variant-numeric: tabular-nums; }
  input.s-scrubbing { box-shadow: ${sunken}, ${focusRing()}; }
  select { cursor: pointer; appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='3,4 5,6.5 7,4' fill='none' stroke='${enc(iconArrow)}' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right calc(var(--u) * 2) center; padding-right: calc(var(--u) * 6);
    option { background: var(--bg); color: var(--fg); } }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-step { flex-direction: column; gap: calc(var(--u) * 0.5);
      button { background: ${sheen}; border: none; border-radius: calc(var(--r) * 0.5); box-shadow: ${raisedXs}; color: var(--fg-muted); padding: 0 calc(var(--u) * 1.5); font-size: .6em; line-height: 1.4; cursor: pointer; transition: box-shadow .1s, color .1s;
        &:hover { color: var(--fg); }
        &:active { box-shadow: ${pressXs}; } } }
  }

  /* ── Raised buttons ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(var(--u) * 2); }
    button { width: 100%; background: ${sheen}; color: var(--accent); font-weight: 700; border: none; border-radius: var(--r); box-shadow: ${raised};
      padding: calc(var(--u) * (1 + var(--spacing))) calc(var(--pad) * 2); transition: box-shadow .12s, color .12s, transform .12s;
      &:hover { color: color-mix(in oklab, var(--accent), var(--fg) 20%); box-shadow: ${raised}, 0 0 0 3px color-mix(in oklab, var(--accent), transparent 85%); }
      &:active { box-shadow: ${sunken}; transform: translateY(1px); }
      &:disabled { opacity: .5; box-shadow: ${raisedSm}; cursor: not-allowed; transform: none; }
      &:focus-visible { outline: none; box-shadow: ${raised}, ${focusRing()}; } }
    &.s-secondary button, button.s-secondary { color: var(--fg-muted); }
  }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { cursor: pointer; }
    &.s-switch {
      .s-track { width: calc(var(--u) * 12); height: calc(var(--u) * 6.5); border-radius: 999px; background: var(--bg); box-shadow: ${sunkenSm}; position: relative; transition: box-shadow .2s;
        &::after { content: ''; position: absolute; top: 50%; left: calc(var(--u) * 0.75); width: calc(var(--u) * 5); height: calc(var(--u) * 5); transform: translateY(-50%); border-radius: 50%; background: ${sheen}; box-shadow: ${raisedSm}; transition: left .2s, background .2s, box-shadow .2s; } }
      &:hover .s-track { box-shadow: ${sunkenSm}, 0 0 0 3px color-mix(in oklab, var(--fg), transparent 92%); }
      &:has(input:checked) .s-track::after { left: calc(100% - var(--u) * 5.75); background: var(--accent); box-shadow: ${raisedSm}, ${glossHi()}; }
      &:has(input:focus-visible) .s-track { box-shadow: ${sunkenSm}, ${focusRing()}; }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); border-radius: calc(var(--r) * 0.6); background: var(--bg); box-shadow: ${sunkenSm}; transition: box-shadow .15s;
        &::after { content: ''; width: 100%; height: 100%; border-radius: inherit; background: transparent; transition: background .12s, box-shadow .12s; } }
      &:hover .s-track { box-shadow: ${sunkenSm}, 0 0 0 3px color-mix(in oklab, var(--fg), transparent 92%); }
      &:has(input:checked) .s-track::after { background: var(--accent); box-shadow: ${gloss()}; }
      &:has(input:focus-visible) .s-track { box-shadow: ${sunkenSm}, ${focusRing()}; }
    }
    &.s-toggle {
      .s-track { padding: var(--pad) calc(var(--pad) * 2); border-radius: var(--r); background: ${sheen}; box-shadow: ${raisedSm}; height: calc(1lh + var(--pad) * 2); display: flex; align-items: center; justify-content: center; font-size: smaller; color: var(--fg-muted); cursor: pointer; transition: box-shadow .15s, color .15s;
        &::after { content: 'Off'; } }
      &:hover .s-track { box-shadow: ${raisedSm}, 0 0 0 3px color-mix(in oklab, var(--fg), transparent 92%); }
      &:has(input:checked) .s-track { box-shadow: ${sunken}; color: var(--accent); &::after { content: 'On'; } }
      &:has(input:focus-visible) .s-track { box-shadow: ${sunken}, ${focusRing()}; }
    }
  }

  /* ── Slider ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: var(--lh); }
    .s-track { height: calc(var(--u) * 5); margin: calc(var(--u) * var(--spacing)) 0; }
    input[type="range"] {
      width: 100%; height: calc(var(--u) * 2.5); -webkit-appearance: none; appearance: none; background: var(--bg); border-radius: 999px; box-shadow: ${sunkenTrack}; cursor: pointer; transition: box-shadow .15s;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(var(--u) * 5); height: calc(var(--u) * 5); border-radius: 50%; background: ${sheen}; box-shadow: ${raisedSm}; cursor: grab; transition: box-shadow .12s; }
      &::-moz-range-thumb { width: calc(var(--u) * 5); height: calc(var(--u) * 5); border: none; border-radius: 50%; background: ${sheen}; box-shadow: ${raisedSm}; cursor: grab; transition: box-shadow .12s; }
      &:hover::-webkit-slider-thumb { box-shadow: ${raisedSm}, 0 0 0 5px color-mix(in oklab, var(--accent), transparent 85%); }
      &:hover::-moz-range-thumb { box-shadow: ${raisedSm}, 0 0 0 5px color-mix(in oklab, var(--accent), transparent 85%); }
      &:active::-webkit-slider-thumb { cursor: grabbing; box-shadow: ${raisedXs}, 0 0 0 5px color-mix(in oklab, var(--accent), transparent 80%); }
      &:active::-moz-range-thumb { cursor: grabbing; box-shadow: ${raisedXs}, 0 0 0 5px color-mix(in oklab, var(--accent), transparent 80%); }
      &:focus-visible { outline: none; }
      &:focus-visible::-webkit-slider-thumb { box-shadow: ${raisedSm}, ${focusRing()}; }
      &:focus-visible::-moz-range-thumb { box-shadow: ${raisedSm}, ${focusRing()}; }
    }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-marks { display: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 6px); font-size: smaller; color: var(--fg-muted); white-space: nowrap; }
    .s-readout { flex: 0 0 auto; min-width: 7ch; text-align: right; font-size: smaller; color: var(--fg-muted); font-variant-numeric: tabular-nums; background: transparent; border: none; box-shadow: none; padding-left: var(--pad); cursor: ew-resize;
      &:hover, &.s-scrubbing { color: var(--accent); } }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); margin-bottom: var(--u); background: ${sheen}; border-radius: var(--r); box-shadow: ${raisedSm}; padding: 2px 8px; font-size: smaller; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: calc(var(--u) * 2.5); margin: calc(var(--u) * var(--spacing)) 0; border-radius: 999px; background: var(--bg); box-shadow: ${sunkenTrack}; position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: color-mix(in oklab, var(--accent), transparent 55%); border-radius: 999px; } }
  }

  /* ── Select variants ── */
  .s-select {
    &.s-dropdown select { flex: 1; }
    &.s-segmented {
      .s-input { gap: calc(var(--u) * 1.5); }
      button { flex: 1; background: ${sheen}; border: none; border-radius: calc(var(--r) * 0.7); box-shadow: ${raisedXs}; color: var(--fg-muted); padding: var(--pad); transition: box-shadow .12s, color .12s;
        &:hover { color: var(--fg); box-shadow: ${raisedXs}, 0 0 0 3px color-mix(in oklab, var(--fg), transparent 92%); }
        &:active { box-shadow: ${sunkenSm}; }
        &.s-selected { background: var(--bg); box-shadow: ${sunkenSm}; color: var(--accent); } }
    }
    &.s-radio, &.s-checkboxes {
      .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * var(--spacing) * 1.5); }
      label { display: flex; align-items: center; gap: calc(var(--u) * 2.5); cursor: pointer; }
    }
    &.s-checkboxes {
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); flex-shrink: 0; border-radius: calc(var(--r) * 0.6); background: var(--bg); box-shadow: ${sunkenSm};
        &::after { content: ''; width: 100%; height: 100%; border-radius: inherit; background: transparent; transition: background .12s, box-shadow .12s; } }
      label:has(input:checked) .s-track::after { background: var(--accent); box-shadow: ${gloss()}; }
    }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(var(--u) * 2);
      input[type="color"] { position: static; width: calc(var(--u) * 8); height: calc(1lh + var(--pad) * 2); padding: 0; border: none; border-radius: var(--r); box-shadow: ${raisedXs}, ${gloss(55, 78)}; cursor: pointer; overflow: hidden;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: var(--r); }
        &:focus-visible { outline: none; box-shadow: ${raisedXs}, ${focusRing()}; } }
      input[type="text"] { flex: 1; min-width: 0; font-family: ui-monospace, monospace; } }
    &.s-swatches { .s-input { flex-wrap: wrap; gap: calc(var(--u) * 1.5); }
      button { width: calc(var(--u) * 6); height: calc(var(--u) * 6); padding: 0; border: none; border-radius: calc(var(--r) * 0.7); box-shadow: ${raisedXs}; transition: box-shadow .12s;
        &:hover { box-shadow: ${raisedXs}, 0 0 0 3px color-mix(in oklab, var(--fg), transparent 85%); }
        &:active { box-shadow: ${pressXs}; }
        &.s-selected { box-shadow: ${raisedXs}, 0 0 0 2px var(--accent); } } }
  }

  /* ── Text / Textarea ── */
  .s-text input[type="text"] { flex: 1; }
  .s-textarea { align-items: flex-start;
    textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(var(--lh) * 3); max-height: 50vh; padding: var(--pad) calc(var(--pad-i) + var(--u)); }
    &.s-code textarea { font-family: ui-monospace, monospace; font-size: smaller; } }

  /* ── Folder ── */
  .s-folder {
    > summary { font-weight: 600; color: var(--fg-muted); padding: calc(var(--u) * 2) 0; border-radius: calc(var(--r) * 0.7); transition: color .12s;
      &:hover { color: var(--fg); }
      &::after { content: ''; width: calc(var(--u) * 4); height: calc(var(--u) * 4); margin-left: auto; background: currentColor; -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='3,4 5,6.5 7,4' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat; mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='3,4 5,6.5 7,4' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat; transition: transform .2s; } }
    &[open] > summary::after { transform: rotate(-180deg); }
    .s-content { padding: calc(var(--u) * 2 * var(--spacing)) calc(var(--u) * 2); border-radius: var(--r); box-shadow: ${sunkenSm}; margin-top: calc(var(--u) * 0.5); }
  }
}`

  return baseCSS + '\n' + overrides
}
