/**
 * Neu — one molded material, lit from a single direction.
 * Raised parts have a fine rim, a contact shadow, and a broad ambient shadow.
 * Fields use the same light inset. Depth controls relief, contrast controls
 * lighting strength, softness controls diffusion, light sets its angle (CSS
 * degrees, 315 = upper left), and grain adds a fine matte surface.
 */
import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveRoles } from './color.js'

export default function neu({
  shade = '#e7e8ea',
  accent,
  spacing = 1,
  weight = 500,
  roundness = 1.6,
  depth = 1,
  softness = 1,
  contrast = 1,
  light = 315,
  grain = .3,
  size = 1,
  font,
} = {}) {
  const { dark, at, fgMuted, accent: acc } = resolveRoles(shade, accent)
  const fg = at(dark ? .94 : .32)
  const enc = c => encodeURIComponent(c)

  // Distance and lighting strength are independent: a shallow edge can still
  // be crisp, and a deep cast shadow can remain diffuse.
  const angle = light * Math.PI / 180
  const x = -Math.sin(angle), y = Math.cos(angle)
  const px = n => `${+(n * Math.max(0, depth) * size).toFixed(3)}px`
  const alpha = n => Math.max(0, Math.min(1, n * contrast)).toFixed(3)
  const tone = (delta, opacity) => `oklch(from var(--bg) calc(l + ${delta}) c h / ${alpha(opacity)})`
  const shadow = tone(dark ? -.28 : -.32, dark ? .65 : .23)
  const contact = tone(dark ? -.3 : -.38, dark ? .75 : .25)
  const highlight = tone(dark ? .14 : .08, dark ? .24 : .8)
  const rim = tone(dark ? .22 : .3, dark ? .35 : .9)
  const cast = (n, blur, color, inset = false) =>
    `${inset ? 'inset ' : ''}${px(x * n)} ${px(y * n)} ${px(blur)} ${color}`
  const raise = n => [
    cast(.7, .5, rim, true),
    cast(-.6, .5, tone(-.25, .12), true),
    cast(n * .22, n * .35, contact),
    cast(n, n * (2.4 * Math.max(0, softness) + .15), shadow),
    cast(-n * .7, n * (2 * Math.max(0, softness) + .15), highlight),
  ].join(', ')
  const sink = n => [
    cast(n * .35, n * .45, contact, true),
    cast(n, n * (1.7 * Math.max(0, softness) + .15), shadow, true),
    cast(-n, n * (1.7 * Math.max(0, softness) + .15), highlight, true),
  ].join(', ')
  const raisedLg = raise(12)
  const raised = raise(6)
  const raisedSm = raise(3)
  const raisedXs = raise(1.5)
  const sunken = sink(2.5)
  const sunkenSm = sink(1.5)
  const pressed = sink(2)
  const curve = .015 * Math.max(0, Math.min(2, contrast))
  const convex = `var(--neu-grain), linear-gradient(${light}deg, oklch(from var(--bg) calc(l - ${curve}) c h), oklch(from var(--bg) calc(l + ${curve}) c h))`
  const noise = grain <= 0 ? 'none' : `url("data:image/svg+xml,${enc(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="${Math.min(1, grain) * .16}"/></feComponentTransfer></filter><path fill="none" filter="url(#n)" d="M0 0h128v128H0z"/></svg>`)}")`
  const focus = `0 0 0 3px color-mix(in oklab, var(--accent), transparent 70%)`
  const hoverRing = `0 0 0 3px color-mix(in oklab, var(--fg), transparent 93%)`
  const glossHi = `inset 0 1px 1px color-mix(in oklab, white, transparent 55%)`
  const glossLo = `inset 0 -1px 1px color-mix(in oklab, black, transparent 82%)`

  const chevron = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2.5,3.75 5,6.25 7.5,3.75' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const selectArrow = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2.5,3.75 5,6.25 7.5,3.75' fill='none' stroke='${enc(fgMuted)}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, {controlHeight: 36, rowGap: 16, sectionGap: 16, panelPadding: 24, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"})}

  --bg: ${shade};
  --neu-grain: ${noise};
  --accent: ${acc};
  --fg: ${fg};
  --fg-muted: ${fgMuted};

  --weight: ${weight};
  --roundness: ${roundness};

  --r: calc(var(--u) * var(--roundness) * 2.2);
  --r-panel: calc(var(--u) * var(--roundness) * 5);
  --h: var(--control-height);
  --knob: calc(var(--u) * 5.5);
  --s-clear-icon: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.5 2.5 L7.5 7.5 M7.5 2.5 L2.5 7.5' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E");
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--bg);
  background-image: var(--neu-grain);
  color: var(--fg);
  --font: var(--font-family);

  font-weight: var(--weight);
  border-radius: var(--r-panel);
  box-shadow: ${raisedLg};
  padding: var(--panel-padding);
  min-width: 0;
  max-width: calc(var(--u) * 110);
  -webkit-font-smoothing: antialiased;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Header ── */
  > summary, > .s-panel-title { font-weight: 650; font-size: 1.3em; letter-spacing: -0.01em; gap: calc(var(--u) * 2); min-height: var(--h); }
  > summary::after { display: none; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: var(--section-gap); }
  .s-panel-content { gap: var(--row-gap); }

  /* round raised knob shared by the fold + search buttons */
  .s-fold-icon, .s-search-btn {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: var(--h); height: var(--h); padding: 0; border: none; border-radius: 50%;
    background: ${convex}; box-shadow: ${raised};
    -webkit-mask: none; mask: none;
    transition: box-shadow .15s;
    &:hover { box-shadow: ${raised}, ${hoverRing}; }
    &:active { box-shadow: ${pressed}; }
  }
  .s-fold-icon { margin-left: auto; order: 2; cursor: pointer;
    .s-search ~ &, :has(> .s-search) > & { margin-left: 0; }
    i { width: 45%; height: 45%; background: var(--fg-muted); -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; transition: transform .2s; } }
  &[open] .s-fold-icon i { transform: rotate(-180deg); }
  > summary:focus-visible { outline: none; .s-fold-icon { box-shadow: ${raised}, ${focus}; } }

  &.s-searching > summary, &.s-searching > .s-panel-title { flex-wrap: wrap; }

  /* ── Search — raised knob that opens into a sunken pill ── */
  .s-search { order: 1; margin-left: auto; gap: 0; border-radius: 999px; transition: box-shadow .15s, padding .15s; }
  .s-search-btn::after { content: ''; width: 45%; height: 45%; background: var(--fg-muted); -webkit-mask: var(--s-search-icon) center / contain no-repeat; mask: var(--s-search-icon) center / contain no-repeat; }
  .s-search-input { appearance: none; -webkit-appearance: none; color: var(--fg); width: 14ch; height: var(--h); padding: 0 calc(var(--u) * 2) 0 var(--u); outline: none; font-weight: 600;
    &::placeholder { color: var(--fg-muted); }
    &::-webkit-search-decoration, &::-webkit-search-results-button, &::-webkit-search-results-decoration { display: none; }
    &::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; width: calc(var(--u) * 3); height: calc(var(--u) * 3); cursor: pointer; opacity: .5;
      background: currentColor; -webkit-mask: var(--s-clear-icon) center / contain no-repeat; mask: var(--s-clear-icon) center / contain no-repeat;
      &:hover { opacity: .9; } } }
  &.s-searching .s-search { box-shadow: ${sunken};
    .s-search-btn { box-shadow: none; background: transparent; &:hover { box-shadow: none; } } }
  &.s-searching .s-search:focus-within { box-shadow: ${sunken}, ${focus}; }

  /* ── Rows ── */
  .s-control { align-items: center; gap: var(--column-gap); }
  .s-input { align-items: center; }
  .s-label-group { min-width: 0; width: 30%; }
  .s-label { font-weight: 500; }
  .s-hint { color: var(--fg-muted); opacity: 1; font-size: smaller; font-weight: 600; }
  .s-title { display: inline-flex; align-items: center; justify-content: center; width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5); border-radius: 50%; box-shadow: ${sunkenSm}; color: var(--fg-muted); font-size: 10px; font-weight: 800; cursor: help;
    &:hover + .s-title-text { opacity: 1; visibility: visible; } }
  .s-title-text { position: absolute; left: 0; top: 100%; margin-top: var(--u); padding: calc(var(--u) * 2) calc(var(--u) * 3); font-size: smaller; font-weight: 600; background: var(--bg); border-radius: var(--r); box-shadow: ${raised}; width: max-content; max-width: 30ch; z-index: 10; opacity: 0; visibility: hidden; pointer-events: none; }

  /* ── Sunken fields ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--bg); color: var(--fg); border: none; border-radius: var(--r); box-shadow: ${sunken};
    font: inherit; font-weight: 600; transition: box-shadow .15s;
    &::placeholder { color: var(--fg-muted); font-weight: 500; }
    &:hover { box-shadow: ${sunken}, ${hoverRing}; }
    &:focus-visible { outline: none; box-shadow: ${sunken}, ${focus}; }
  }
  input[type="text"], input[type="number"], select { height: var(--h); padding: 0 calc(var(--u) * 3.5); }
  textarea { padding: calc(var(--u) * 2.5) calc(var(--u) * 3.5); }
  input[type="number"] { font-variant-numeric: tabular-nums; }
  input.s-scrubbing { box-shadow: ${sunken}, ${focus}; }
  select { cursor: pointer; appearance: none; -webkit-appearance: none;
    background-image: ${selectArrow}; background-repeat: no-repeat; background-position: right calc(var(--u) * 3) center; background-size: calc(var(--u) * 3.5); padding-right: calc(var(--u) * 8);
    option { background: var(--bg); color: var(--fg); } }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-step { flex-direction: column; gap: calc(var(--u) * 1);
      button { width: calc(var(--u) * 6); height: calc(var(--u) * 4); padding: 0; display: grid; place-items: center; background: ${convex}; border: none; border-radius: calc(var(--r) * 0.5); box-shadow: ${raisedXs}; color: var(--fg-muted); font-size: .55em; line-height: 1; cursor: pointer; transition: box-shadow .1s, color .1s;
        &:hover { color: var(--fg); }
        &:active { box-shadow: ${pressed}; } } }
  }

  /* ── Vector ── */
  .s-vector {
    .s-vec-axis { gap: var(--u); height: var(--h); min-width: calc(var(--u) * 16); padding: 0 calc(var(--u) * 2.5); border-radius: var(--r); box-shadow: ${sunken}; transition: box-shadow .15s;
      &:focus-within { box-shadow: ${sunken}, ${focus}; } }
    .s-vec-label { font-weight: 700; color: var(--fg-muted); opacity: 1; }
    input[type="number"] { height: auto; padding: 0; box-shadow: none; background: transparent; &:hover, &:focus-visible { box-shadow: none; } }
  }

  /* ── Raised buttons ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(var(--u) * 3); }
    button { flex: 1; min-width: 0; min-height: var(--h); background: ${convex}; color: var(--fg); font-weight: 600; border: none; border-radius: calc(var(--r) * 2); box-shadow: ${raised};
      padding: calc(var(--u) * 2) calc(var(--u) * 3); transition: box-shadow .12s, color .12s;
      &:hover { box-shadow: ${raised}, ${hoverRing}; }
      &:active { box-shadow: ${pressed}; }
      &:disabled, &[aria-busy="true"] { color: var(--fg-muted); box-shadow: ${raisedXs}; cursor: not-allowed; }
      &:focus-visible { outline: none; box-shadow: ${raised}, ${focus}; } }
    &.s-secondary button, button.s-secondary { color: var(--fg-muted); }
  }

  /* ── Boolean ── */
  .s-boolean {
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { cursor: pointer; }
    &.s-switch {
      .s-track { width: calc(var(--u) * 13); height: calc(var(--u) * 7); border-radius: 999px; background: var(--bg); box-shadow: ${sunken}; position: relative; transition: box-shadow .2s;
        &::after { content: ''; position: absolute; top: 50%; left: calc(var(--u) * 0.75); width: var(--knob); height: var(--knob); transform: translateY(-50%); border-radius: 50%; background: ${convex}; box-shadow: ${raisedSm}; transition: left .2s cubic-bezier(.3, 1.2, .5, 1), background .2s, box-shadow .2s; } }
      &:hover .s-track { box-shadow: ${sunken}, ${hoverRing}; }
      &:has(input:checked) .s-track::after { left: calc(100% - var(--knob) - var(--u) * 0.75); background: var(--accent); box-shadow: ${raisedSm}, ${glossHi}; }
      &:has(input:focus-visible) .s-track { box-shadow: ${sunken}, ${focus}; }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 6.5); height: calc(var(--u) * 6.5); border-radius: calc(var(--r) * 0.7); background: var(--bg); box-shadow: ${sunken}; transition: box-shadow .15s;
        &::after { content: ''; width: 58%; height: 58%; border-radius: calc(var(--r) * 0.35); background: transparent; -webkit-mask: none; mask: none; transition: background .12s, box-shadow .12s; } }
      &:hover .s-track { box-shadow: ${sunken}, ${hoverRing}; }
      &:has(input:checked) .s-track::after { background: var(--accent); box-shadow: ${glossHi}, ${glossLo}; }
      &:has(input:focus-visible) .s-track { box-shadow: ${sunken}, ${focus}; }
    }
    &.s-toggle {
      .s-track { padding: 0 calc(var(--u) * 4); border-radius: var(--r); background: ${convex}; box-shadow: ${raisedSm}; height: var(--h); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--fg-muted); cursor: pointer; transition: box-shadow .15s, color .15s;
        &::after { content: 'Off'; } }
      &:hover .s-track { box-shadow: ${raisedSm}, ${hoverRing}; }
      &:has(input:checked) .s-track { background: var(--bg); box-shadow: ${sunken}; color: var(--accent); &::after { content: 'On'; } }
      &:has(input:focus-visible) .s-track { box-shadow: ${sunken}, ${focus}; }
    }
  }

  /* ── Slider — sunken groove, accent fill, domed knob ── */
  .s-slider {
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(var(--u) * 4); }
    .s-track { height: var(--h); margin: 0; }
    input[type="range"] {
      width: 100%; height: calc(var(--u) * 2.5); -webkit-appearance: none; appearance: none; border-radius: 999px; cursor: pointer;
      background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--bg) var(--p, 0%));
      box-shadow: ${sunkenSm}; transition: box-shadow .15s;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--knob); height: var(--knob); border-radius: 50%; background: ${convex}; box-shadow: ${raisedSm}; cursor: grab; transition: box-shadow .12s; }
      &::-moz-range-thumb { width: var(--knob); height: var(--knob); border: none; border-radius: 50%; background: ${convex}; box-shadow: ${raisedSm}; cursor: grab; }
      &:hover::-webkit-slider-thumb { box-shadow: ${raisedSm}, ${hoverRing}; }
      &:active::-webkit-slider-thumb { cursor: grabbing; box-shadow: ${raisedXs}, ${focus}; }
      &:active::-moz-range-thumb { cursor: grabbing; box-shadow: ${raisedXs}, ${focus}; }
      &:focus-visible { outline: none; }
      &:focus-visible::-webkit-slider-thumb { box-shadow: ${raisedSm}, ${focus}; }
      &:focus-visible::-moz-range-thumb { box-shadow: ${raisedSm}, ${focus}; }
    }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-marks { display: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: smaller; font-weight: 600; color: var(--fg-muted); white-space: nowrap; &.s-active { color: var(--accent); } }
    .s-readout { flex: 0 0 auto; min-width: 6ch; text-align: right; font-size: smaller; font-weight: 700; color: var(--fg-muted); font-variant-numeric: tabular-nums; background: transparent; border: none; box-shadow: none; height: auto; padding: 0; cursor: ew-resize;
      &:hover, &.s-scrubbing { color: var(--accent); box-shadow: none; }
      &:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; box-shadow: none; } }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); margin-bottom: calc(var(--u) * -0.5); background: var(--bg); border-radius: calc(var(--r) * 0.6); box-shadow: ${raisedSm}; padding: 2px 8px; font-size: smaller; font-weight: 700; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: calc(var(--u) * 2.5); margin: calc(var(--u) * 3.25) 0; border-radius: 999px; background: var(--bg); box-shadow: ${sunkenSm}; position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); border-radius: 999px; } }
  }

  /* ── Select variants ── */
  .s-select {
    &.s-dropdown select { flex: 1; }
    &.s-segmented {
      .s-input { gap: calc(var(--u) * 2); }
      button { flex: 1; min-width: 0; height: var(--h); background: ${convex}; border: none; border-radius: var(--r); box-shadow: ${raisedSm}; color: var(--fg-muted); font-weight: 700; padding: 0 var(--u); transition: box-shadow .12s, color .12s;
        &:hover { color: var(--fg); box-shadow: ${raisedSm}, ${hoverRing}; }
        &:active { box-shadow: ${pressed}; }
        &.s-selected { background: var(--bg); box-shadow: ${sunkenSm}; color: var(--accent); }
        &:focus-visible { outline: none; box-shadow: ${raisedSm}, ${focus}; } }
    }
    &.s-radio, &.s-checkboxes { align-items: flex-start;
      .s-label-group { padding-top: calc(var(--u) * 1.25); }
      .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * 2.5); }
      .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 2.5); cursor: pointer; font-weight: 600; min-height: calc(var(--u) * 6.5); }
    }
    &.s-radio input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; width: calc(var(--u) * 6); height: calc(var(--u) * 6); border-radius: 50%; background: var(--bg); box-shadow: ${sunkenSm}; display: grid; place-items: center; cursor: pointer; transition: box-shadow .15s;
      &::after { content: ''; width: 45%; height: 45%; border-radius: 50%; background: transparent; transition: background .12s; }
      &:checked::after { background: var(--accent); box-shadow: ${glossHi}, ${glossLo}; }
      &:focus-visible { outline: none; box-shadow: ${sunkenSm}, ${focus}; } }
    &.s-checkboxes {
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 6.5); height: calc(var(--u) * 6.5); flex-shrink: 0; border-radius: calc(var(--r) * 0.7); background: var(--bg); box-shadow: ${sunken}; transition: box-shadow .15s;
        &::after { content: ''; width: 58%; height: 58%; border-radius: calc(var(--r) * 0.35); background: transparent; transition: background .12s; } }
      .s-input label:hover .s-track { box-shadow: ${sunken}, ${hoverRing}; }
      .s-input label:has(input:checked) .s-track::after { background: var(--s-color, var(--accent)); box-shadow: ${glossHi}, ${glossLo}; }
      .s-input label:has(input:focus-visible) .s-track { box-shadow: ${sunken}, ${focus}; }
    }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(var(--u) * 3);
      input[type="color"] { position: static; flex: none; width: var(--h); height: var(--h); padding: 0; border: none; border-radius: 50%; box-shadow: ${raisedSm}, ${glossHi}, ${glossLo}; cursor: pointer; overflow: hidden; transition: box-shadow .12s;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 50%; }
        &:hover { box-shadow: ${raisedSm}, ${glossHi}, ${glossLo}, ${hoverRing}; }
        &:focus-visible { outline: none; box-shadow: ${raisedSm}, ${focus}; } }
      input[type="text"] { flex: 1; min-width: 0; font-family: ui-monospace, monospace; font-size: .95em; } }
    &.s-rgba .s-color-input { gap: calc(var(--u) * 2.5);
      input[type="color"] { width: var(--h); height: var(--h); border-radius: 50%; box-shadow: ${raisedSm}, ${glossHi}, ${glossLo}; overflow: hidden;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 50%; } }
      .s-alpha { height: calc(var(--u) * 2.5); box-shadow: ${sunkenSm};
        &::-webkit-slider-thumb { width: var(--knob); height: var(--knob); border: none; background: ${convex}; box-shadow: ${raisedSm}; }
        &::-moz-range-thumb { width: var(--knob); height: var(--knob); border: none; background: ${convex}; box-shadow: ${raisedSm}; } }
      input[type="text"] { font-family: ui-monospace, monospace; font-size: .95em; } }
    &.s-swatches { .s-input { flex-wrap: wrap; gap: calc(var(--u) * 2.5); }
      button { width: calc(var(--u) * 7); height: calc(var(--u) * 7); padding: 0; border: none; border-radius: 50%; box-shadow: ${raisedXs}, ${glossHi}, ${glossLo}; transition: box-shadow .12s;
        &:hover { box-shadow: ${raisedXs}, ${hoverRing}; }
        &:active { box-shadow: ${pressed}; }
        &.s-selected { box-shadow: ${raisedXs}, 0 0 0 3px var(--bg), 0 0 0 5px var(--accent); }
        &:focus-visible { outline: none; box-shadow: ${raisedXs}, ${focus}; } } }
  }

  /* ── Text / Textarea ── */
  .s-text input[type="text"] { flex: 1; }
  .s-textarea { align-items: flex-start;
    .s-label-group { padding-top: calc(var(--u) * 2.5); }
    textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(var(--lh) * 3 + var(--u) * 5); max-height: 50vh; }
    &.s-code textarea { font-family: ui-monospace, monospace; font-size: smaller; } }

  /* ── Info / separator ── */
  .s-info .s-monitor { font-weight: 700; color: var(--fg-muted); opacity: 1; }
  .s-separator { height: calc(var(--u) * 1); border-radius: 999px; background: var(--bg); opacity: 1; box-shadow: ${sunkenSm}; margin: calc(var(--u) * 0.5) 0; }
  .s-separator-labeled { height: auto; box-shadow: none;
    &::before, &::after { height: calc(var(--u) * 1); border-radius: 999px; background: var(--bg); opacity: 1; box-shadow: ${sunkenSm}; } }
  .s-separator-label { color: var(--fg-muted); font-weight: 700; opacity: 1; }

  /* ── XY pad / knob ── */
  .s-xy { align-items: flex-start; .s-label-group { padding-top: calc(var(--u) * 1.25); } }
  .s-pad { background: var(--bg); border: none; border-radius: var(--r); box-shadow: ${sunken};
    .s-pad-x, .s-pad-y { background: color-mix(in oklab, var(--fg), transparent 88%); }
    .s-pad-dot { box-shadow: ${raisedXs}, ${glossHi}; } }
  .s-knob-dial { width: calc(var(--u) * 11); height: calc(var(--u) * 11); background: ${convex}; border: none; box-shadow: ${raised};
    i { background: var(--accent); width: 3px; border-radius: 2px; } }
  .s-knob-val { font-weight: 700; color: var(--fg-muted); opacity: 1; }

  /* ── Folder ── */
  .s-folder {
    > summary { font-weight: 800; color: var(--fg-muted); min-height: calc(var(--u) * 8); padding: 0; transition: color .12s;
      &:hover { color: var(--fg); }
      &::after { content: ''; width: calc(var(--u) * 4); height: calc(var(--u) * 4); margin-left: auto; background: currentColor; -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; transition: transform .2s; }
      &:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; color: var(--accent); } }
    &[open] > summary { color: var(--fg); &::after { transform: rotate(-180deg); } }
    .s-content { gap: calc(var(--u) * (2 + 2 * var(--spacing))); padding: calc(var(--u) * 4) calc(var(--u) * 4); border-radius: var(--r); box-shadow: ${sunkenSm}; }
    &.s-section > summary { pointer-events: none; &::after { display: none; } }
  }
}`

  return baseCSS + '\n' + overrides
}
