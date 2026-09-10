/**
 * Glass theme — liquid glass
 *
 * A pane of glass over the scene, not a translucent card: the backdrop is
 * blurred, lifted and refracted through a dedicated layer behind the content,
 * so the scene's colour lives inside the panel. The edge is a bright rim
 * (light catching a bevel — strongest top-left, fading bottom-right), the
 * surface carries one soft specular near the top, and the pane casts a wide
 * ambient shadow. Fields are shallower panes cut into the glass (a lighter
 * fill with its own hairline rim); parts that move — thumbs, knobs, the
 * selected segment — are small solid pieces floating above it.
 *
 * Axes: shade/accent (hue + light/dark via resolveRoles), spacing/weight/
 * roundness/size (shared scale axes), blur (backdrop frost radius), depth
 * (rim + specular intensity — the glass's optical thickness), tint (backdrop
 * tint density — 0 clear, 1 milky).
 *
 * glass(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveRoles, clamp } from './color.js'
import { bevel } from './mixins.js'

export default function glass({
  shade = '#1c2030',
  accent = '#6ea8ff',
  spacing = 1,
  weight = 400,
  roundness = 1.4,
  blur = 24,
  size = 1,
  depth = 1,
  tint = 1,
  font,
} = {}) {
  const { dark, fg, accent: acc, onAccent } = resolveRoles(shade, accent)
  const fgMuted = `color-mix(in oklab, ${fg}, transparent ${dark ? 32 : 40}%)`
  const op = a => clamp(a, 0, 1)

  // Light and ink at an alpha — every surface, rim and shadow derives from these.
  const lite = a => `rgba(255,255,255,${+op(a).toFixed(3)})`
  const ink = a => `rgba(0,0,0,${+op(a).toFixed(3)})`

  // Optical tint follows the chosen material in both modes. A dark pane needs
  // a dark backing to keep its text readable over bright parts of the scene.
  const body = `color-mix(in oklab, ${shade}, transparent ${100 - op((dark ? 0.68 : 0.76) * tint) * 100}%)`
  const saturate = dark ? 1.6 : 1.3

  // Panes cut into the glass: fields, tracks, wells.
  const pane = dark ? lite(0.07) : lite(0.42)
  const paneHover = dark ? lite(0.11) : lite(0.55)
  const paneRim = dark ? lite(0.14) : lite(0.7)
  const paneShadow = `inset 0 1px 0 ${lite(dark ? 0.08 : 0.6)}, inset 0 0 0 1px ${paneRim}`
  const paneShadowHover = `inset 0 1px 0 ${lite(dark ? 0.12 : 0.75)}, inset 0 0 0 1px ${dark ? lite(0.2) : lite(0.85)}`

  // Edge rim of the pane: bright where the light hits (top-left), dim opposite.
  const rim = `linear-gradient(135deg, ${lite(op((dark ? 0.55 : 0.95) * depth))} 0%, ${lite(op((dark ? 0.12 : 0.5) * depth))} 40%, ${lite(op((dark ? 0.05 : 0.35) * depth))} 60%, ${lite(op((dark ? 0.3 : 0.8) * depth))} 100%)`
  // One specular: a wide soft light hugging the top edge.
  const specular = `radial-gradient(90% 40% at 50% -8%, ${lite(op((dark ? 0.16 : 0.5) * depth))} 0%, transparent 70%)`
  // Floating pieces (thumbs, knobs, selected segment).
  const piece = '#ffffff'
  const pieceShadow = `0 1px 2px ${ink(dark ? 0.45 : 0.22)}, 0 4px 10px -2px ${ink(dark ? 0.5 : 0.25)}, inset 0 -1px 0 ${ink(0.06)}`
  const accentFill = `linear-gradient(180deg, color-mix(in oklab, var(--accent), white 14%), var(--accent))`
  const accentShadow = `0 1px 2px ${ink(0.3)}, 0 6px 16px -6px color-mix(in oklab, var(--accent), transparent 20%), inset 0 1px 0 ${lite(0.4)}, inset 0 0 0 1px ${lite(0.12)}`
  const contactShadow = `0 30px 70px -20px ${ink(dark ? 0.6 : 0.35)}, 0 8px 20px -10px ${ink(dark ? 0.5 : 0.25)}`
  const halo = dark ? `0 1px 2px ${ink(0.4)}` : 'none'
  const focus = `0 0 0 3px color-mix(in oklab, var(--accent), transparent 60%)`

  const chevron = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2.5,3.75 5,6.25 7.5,3.75' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const selectArrow = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2.5,3.75 5,6.25 7.5,3.75' fill='none' stroke='${dark ? '%23fff' : '%23000'}' stroke-opacity='.7' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const check = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 5.5 L4.5 8.5 L10.5 1.5' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, {controlHeight: 34, rowGap: 14, sectionGap: 14, panelPadding: 22, fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"})}

  --bg: ${shade};
  --accent: ${acc};
  --on-accent: ${onAccent};
  --fg: ${fg};
  --fg-muted: ${fgMuted};
  --pane: ${pane};
  --pane-hover: ${paneHover};
  --pane-shadow: ${paneShadow};
  --pane-shadow-hover: ${paneShadowHover};
  --piece: ${piece};
  --piece-shadow: ${pieceShadow};

  --weight: ${weight};
  --roundness: ${roundness};

  --r: calc(var(--u) * var(--roundness) * 4.5);
  --r-pane: calc(var(--u) * var(--roundness) * 1.8);
  --h: var(--control-height);
  --blur: ${blur}px;
  --saturate: ${saturate};
  --body: ${body};
  --rim: ${rim};
  --specular: ${specular};
  --halo: ${halo};
  --s-clear-icon: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.5 2.5 L7.5 7.5 M7.5 2.5 L2.5 7.5' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E");
  color-scheme: ${dark ? 'dark' : 'light'};

  position: relative;
  isolation: isolate;
  color: var(--fg);
  --font: var(--font-family);

  font-weight: var(--weight);
  border-radius: var(--r);
  /* the surface reflection sits on the panel itself, unwarped, above the bent backdrop */
  background: var(--specular);
  box-shadow: ${contactShadow};
  padding: var(--panel-padding);
  min-width: 0;
  max-width: calc(var(--u) * 112);
  -webkit-font-smoothing: antialiased;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── The glass itself: a dedicated layer behind all content ── */
  &::after {
    content: ''; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
    /* SVG filter regions paint past the border box — clip-path pins the bent backdrop inside the pane */
    clip-path: inset(0 round var(--r));
    background: var(--body);
    -webkit-backdrop-filter: blur(var(--blur)) saturate(var(--saturate));
    backdrop-filter: blur(var(--blur)) saturate(var(--saturate));
    /* Hosts may opt into a lens; the standalone theme always supplies frost. */
    -webkit-backdrop-filter: var(--glass-backdrop, blur(var(--blur)) saturate(var(--saturate)));
    backdrop-filter: var(--glass-backdrop, blur(var(--blur)) saturate(var(--saturate)));
    /* Chromium executes the displacement through the filter property but not (yet) through
       backdrop-filter; applied to this backdrop-only layer so content stays crisp. */
    filter: var(--glass-refraction, none);
  }
  /* ── Edge rim: light on a bevel, brightest top-left ── */
  &::before { ${bevel('var(--rim)', '1px')} z-index: 1; }

  /* ── Header ── */
  > summary, > .s-panel-title { font-weight: 600; font-size: 1.2em; letter-spacing: -0.01em; text-shadow: var(--halo); gap: calc(var(--u) * 2); min-height: var(--h); }
  > summary::after { display: none; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: var(--section-gap); }
  .s-panel-content { gap: var(--row-gap); }

  /* round pane buttons: fold + search */
  .s-fold-icon, .s-search-btn {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: calc(var(--u) * 7); height: calc(var(--u) * 7); padding: 0; border: none; border-radius: 50%;
    background: var(--pane); box-shadow: var(--pane-shadow); color: var(--fg);
    -webkit-mask: none; mask: none;
    transition: background .14s, box-shadow .14s;
    &:hover { background: var(--pane-hover); box-shadow: var(--pane-shadow-hover); }
  }
  .s-fold-icon { margin-left: auto; order: 2; cursor: pointer;
    :has(> .s-search) > & { margin-left: 0; }
    i { width: 50%; height: 50%; background: currentColor; opacity: .8; -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; transition: transform .2s; } }
  &[open] .s-fold-icon i { transform: rotate(-180deg); }
  > summary:focus-visible { outline: none; .s-fold-icon { box-shadow: var(--pane-shadow), ${focus}; } }

  &.s-searching > summary, &.s-searching > .s-panel-title { flex-wrap: wrap; }

  /* ── Search — pane button that opens into a pill ── */
  .s-search { order: 1; margin-left: auto; gap: 0; border-radius: 999px; transition: background .14s, box-shadow .14s; }
  .s-search-btn::after { content: ''; width: 50%; height: 50%; background: currentColor; opacity: .8; -webkit-mask: var(--s-search-icon) center / contain no-repeat; mask: var(--s-search-icon) center / contain no-repeat; }
  .s-search-input { appearance: none; -webkit-appearance: none; color: var(--fg); width: 14ch; height: calc(var(--u) * 7); padding: 0 calc(var(--u) * 3) 0 var(--u); outline: none; font-size: .95em;
    &::placeholder { color: var(--fg-muted); }
    &::-webkit-search-decoration, &::-webkit-search-results-button, &::-webkit-search-results-decoration { display: none; }
    &::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; width: calc(var(--u) * 3); height: calc(var(--u) * 3); cursor: pointer; opacity: .6;
      background: currentColor; -webkit-mask: var(--s-clear-icon) center / contain no-repeat; mask: var(--s-clear-icon) center / contain no-repeat;
      &:hover { opacity: 1; } } }
  &.s-searching .s-search { background: var(--pane); box-shadow: var(--pane-shadow);
    .s-search-btn { background: transparent; box-shadow: none; } }
  &.s-searching .s-search:focus-within { box-shadow: var(--pane-shadow), ${focus}; }

  /* ── Rows ── */
  .s-control { align-items: center; gap: var(--column-gap); }
  .s-input { align-items: center; }
  .s-label-group { min-width: 0; width: 30%; }
  .s-label { font-weight: 500; text-shadow: var(--halo); }
  .s-hint { color: var(--fg-muted); opacity: 1; font-size: smaller; text-shadow: var(--halo); }
  .s-title { display: inline-flex; align-items: center; justify-content: center; width: calc(var(--u) * 4); height: calc(var(--u) * 4); border-radius: 50%; background: var(--pane); box-shadow: var(--pane-shadow); font-size: 10px; cursor: help;
    &:hover + .s-title-text { opacity: 1; visibility: visible; } }
  .s-title-text { position: absolute; left: 0; top: 100%; margin-top: var(--u); padding: calc(var(--u) * 2) calc(var(--u) * 2.5); font-size: smaller; background: color-mix(in oklab, var(--bg), transparent 15%); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); box-shadow: var(--pane-shadow), 0 8px 24px -8px ${ink(0.4)}; border-radius: var(--r-pane); width: max-content; max-width: 30ch; z-index: 10; opacity: 0; visibility: hidden; pointer-events: none; }
  .s-info .s-monitor { text-shadow: var(--halo); color: var(--fg); opacity: .9; }

  /* ── Fields — shallower panes cut into the glass ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--pane); color: var(--fg); border: none; border-radius: var(--r-pane);
    font: inherit; font-weight: var(--weight);
    box-shadow: var(--pane-shadow);
    transition: background .14s, box-shadow .14s;
    &::placeholder { color: var(--fg-muted); }
    &:hover { background: var(--pane-hover); box-shadow: var(--pane-shadow-hover); }
    &:focus-visible { outline: none; box-shadow: var(--pane-shadow), ${focus}; }
  }
  input[type="text"], input[type="number"], select { height: var(--h); padding: 0 calc(var(--u) * 3); }
  textarea { padding: calc(var(--u) * 2) calc(var(--u) * 3); }
  input[type="number"] { font-variant-numeric: tabular-nums; }
  input.s-scrubbing { box-shadow: var(--pane-shadow), ${focus}; }
  select { cursor: pointer; appearance: none; -webkit-appearance: none;
    background-image: ${selectArrow}; background-repeat: no-repeat; background-position: right calc(var(--u) * 2.5) center; background-size: calc(var(--u) * 3.5); padding-right: calc(var(--u) * 8);
    option { background: var(--bg); color: var(--fg); } }
  .s-select.s-dropdown select { flex: 1; }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-step { flex-direction: column; gap: 2px;
      button { width: calc(var(--u) * 6); height: calc(var(--u) * 4); padding: 0; display: grid; place-items: center; background: var(--pane); box-shadow: var(--pane-shadow); border: none; border-radius: calc(var(--r-pane) * 0.5); color: var(--fg-muted); font-size: .55em; line-height: 1; cursor: pointer; transition: background .12s, color .12s;
        &:hover { background: var(--pane-hover); color: var(--fg); }
        &:active { background: var(--pane); } } }
  }

  /* ── Vector ── */
  .s-vector {
    .s-vec-axis { gap: var(--u); height: var(--h); min-width: calc(var(--u) * 16); padding: 0 calc(var(--u) * 2.5); border-radius: var(--r-pane); background: var(--pane); box-shadow: var(--pane-shadow); transition: box-shadow .14s;
      &:focus-within { box-shadow: var(--pane-shadow), ${focus}; } }
    .s-vec-label { color: var(--fg-muted); opacity: 1; }
    input[type="number"] { height: auto; padding: 0; box-shadow: none; background: transparent; border-radius: 0; &:hover, &:focus-visible { box-shadow: none; background: transparent; } }
  }

  /* ── Buttons — solid glass piece, accent lit from within ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(var(--u) * 2.5); }
    button { flex: 1; min-width: 0; min-height: var(--h); background: ${accentFill}; color: var(--on-accent); font-weight: 600; border: none; border-radius: var(--r-pane);
      padding: 0 calc(var(--u) * 4); box-shadow: ${accentShadow};
      transition: filter .14s, transform .08s, box-shadow .14s;
      &:hover { filter: brightness(1.08); }
      &:active { transform: scale(.98); filter: brightness(.95); }
      &:disabled, &[aria-busy="true"] { filter: saturate(.3) brightness(.85); opacity: .7; box-shadow: none; cursor: not-allowed; transform: none; }
      &:focus-visible { outline: none; box-shadow: ${accentShadow}, ${focus}; } }
    &.s-secondary button, button.s-secondary { background: var(--pane); color: var(--fg); box-shadow: var(--pane-shadow);
      &:hover { background: var(--pane-hover); box-shadow: var(--pane-shadow-hover); filter: none; }
      &:active { background: var(--pane); } }
  }

  /* ── Boolean ── */
  .s-boolean {
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { cursor: pointer; }
    &.s-switch {
      .s-track { width: calc(var(--u) * 12.5); height: calc(var(--u) * 7); border-radius: 999px; background: var(--pane); box-shadow: var(--pane-shadow); position: relative; transition: background .2s, box-shadow .2s;
        &::after { content: ''; position: absolute; top: 50%; left: calc(var(--u) * 0.75); width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); transform: translateY(-50%); border-radius: 50%; background: var(--piece); box-shadow: var(--piece-shadow); transition: left .2s cubic-bezier(.3, 1.2, .5, 1); } }
      &:hover .s-track { background: var(--pane-hover); }
      &:has(input:checked) .s-track { background: ${accentFill}; box-shadow: inset 0 1px 0 ${lite(0.35)}, inset 0 0 0 1px ${lite(0.1)}; &::after { left: calc(100% - var(--u) * 6.25); } }
      &:has(input:focus-visible) .s-track { box-shadow: var(--pane-shadow), ${focus}; }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); border-radius: calc(var(--r-pane) * 0.6); background: var(--pane); box-shadow: var(--pane-shadow); transition: background .14s, box-shadow .14s;
        &::after { content: ''; width: 60%; height: 55%; background: var(--on-accent); -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; opacity: 0; transform: scale(.6); transition: opacity .1s, transform .14s; } }
      &:hover .s-track { background: var(--pane-hover); }
      &:has(input:checked) .s-track { background: ${accentFill}; box-shadow: inset 0 1px 0 ${lite(0.35)}, inset 0 0 0 1px ${lite(0.1)}; &::after { opacity: 1; transform: none; } }
      &:has(input:focus-visible) .s-track { box-shadow: var(--pane-shadow), ${focus}; }
    }
    &.s-toggle {
      .s-track { padding: 0 calc(var(--u) * 4); border-radius: var(--r-pane); background: var(--pane); box-shadow: var(--pane-shadow); height: var(--h); display: flex; align-items: center; justify-content: center; color: var(--fg-muted); cursor: pointer; transition: background .14s, box-shadow .14s, color .14s;
        &::after { content: 'Off'; } }
      &:hover .s-track { background: var(--pane-hover); }
      &:has(input:checked) .s-track { background: ${accentFill}; color: var(--on-accent); box-shadow: ${accentShadow}; &::after { content: 'On'; } }
      &:has(input:focus-visible) .s-track { box-shadow: var(--pane-shadow), ${focus}; }
    }
  }

  /* ── Slider — pane groove, accent fill, white piece ── */
  .s-slider {
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(var(--u) * 4); }
    .s-track { height: var(--h); margin: 0; }
    input[type="range"] {
      width: 100%; height: calc(var(--u) * 1.75); -webkit-appearance: none; appearance: none; border-radius: 999px; cursor: pointer;
      background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--pane) var(--p, 0%));
      box-shadow: var(--pane-shadow);
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(var(--u) * 5); height: calc(var(--u) * 5); border-radius: 50%; background: var(--piece); box-shadow: var(--piece-shadow); cursor: grab; transition: transform .12s, box-shadow .12s; }
      &::-moz-range-thumb { width: calc(var(--u) * 5); height: calc(var(--u) * 5); border: none; border-radius: 50%; background: var(--piece); box-shadow: var(--piece-shadow); cursor: grab; }
      &:hover::-webkit-slider-thumb { transform: scale(1.08); }
      &:active::-webkit-slider-thumb { cursor: grabbing; transform: scale(1.12); box-shadow: var(--piece-shadow), ${focus}; }
      &:active::-moz-range-thumb { cursor: grabbing; }
      &:focus-visible { outline: none; }
      &:focus-visible::-webkit-slider-thumb { box-shadow: var(--piece-shadow), ${focus}; }
      &:focus-visible::-moz-range-thumb { box-shadow: var(--piece-shadow), ${focus}; }
    }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-marks { display: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 0); font-size: smaller; color: var(--fg-muted); white-space: nowrap; &.s-active { color: var(--fg); } }
    .s-readout { flex: 0 0 auto; min-width: 6ch; text-align: right; font-size: smaller; color: var(--fg); opacity: .85; font-variant-numeric: tabular-nums; background: transparent; border: none; box-shadow: none; height: auto; padding: 0; cursor: ew-resize; text-shadow: var(--halo);
      &:hover, &:focus-visible, &.s-scrubbing { color: var(--fg); box-shadow: none; background: transparent; } }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); margin-bottom: calc(var(--u) * -1); background: color-mix(in oklab, var(--bg), transparent 15%); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); box-shadow: var(--pane-shadow); border-radius: calc(var(--r-pane) * 0.6); padding: 2px 8px; font-size: smaller; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: calc(var(--u) * 1.75); margin: calc((var(--h) - var(--u) * 1.75) / 2) 0; border-radius: 999px; background: var(--pane); box-shadow: var(--pane-shadow); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); border-radius: 999px; } }
  }

  /* ── Select variants ── */
  .s-select {
    &.s-segmented {
      .s-input { gap: 2px; background: var(--pane); box-shadow: var(--pane-shadow); border-radius: var(--r-pane); padding: 3px; height: var(--h); }
      button { flex: 1; min-width: 0; height: 100%; background: transparent; border: none; border-radius: calc(var(--r-pane) - 3px); color: var(--fg-muted); padding: 0 var(--u); transition: background .14s, color .14s, box-shadow .14s;
        &:hover { color: var(--fg); background: ${lite(dark ? 0.05 : 0.25)}; }
        &.s-selected { background: ${dark ? lite(0.2) : '#fff'}; color: var(--fg); box-shadow: 0 1px 2px ${ink(dark ? 0.3 : 0.12)}, 0 3px 8px -2px ${ink(dark ? 0.4 : 0.15)}, inset 0 1px 0 ${lite(dark ? 0.25 : 1)}; }
        &:focus-visible { outline: none; box-shadow: ${focus}; } }
    }
    &.s-radio, &.s-checkboxes { align-items: flex-start;
      .s-label-group { padding-top: calc(var(--u) * 1); }
      .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * 2); }
      .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 2.5); cursor: pointer; min-height: calc(var(--u) * 5.5); }
    }
    &.s-radio input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; width: calc(var(--u) * 5); height: calc(var(--u) * 5); border-radius: 50%; background: var(--pane); box-shadow: var(--pane-shadow); display: grid; place-items: center; cursor: pointer; transition: background .14s;
      &::after { content: ''; width: 40%; height: 40%; border-radius: 50%; background: var(--on-accent); opacity: 0; transform: scale(.5); transition: opacity .1s, transform .14s; }
      &:hover { background: var(--pane-hover); }
      &:checked { background: ${accentFill}; box-shadow: inset 0 1px 0 ${lite(0.35)}; &::after { opacity: 1; transform: none; } }
      &:focus-visible { outline: none; box-shadow: var(--pane-shadow), ${focus}; } }
    &.s-checkboxes {
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); flex-shrink: 0; border-radius: calc(var(--r-pane) * 0.6); background: var(--pane); box-shadow: var(--pane-shadow); transition: background .14s;
        &::after { content: ''; width: 60%; height: 55%; background: var(--on-accent); -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; opacity: 0; transform: scale(.6); transition: opacity .1s, transform .14s; } }
      .s-input label:hover .s-track { background: var(--pane-hover); }
      .s-input label:has(input:checked) .s-track { background: var(--s-color, var(--accent)); box-shadow: inset 0 1px 0 ${lite(0.35)}, inset 0 0 0 1px ${lite(0.1)}; &::after { opacity: 1; transform: none; } }
      .s-input label:has(input:focus-visible) .s-track { box-shadow: var(--pane-shadow), ${focus}; }
    }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(var(--u) * 2.5);
      input[type="color"] { position: static; flex: none; width: var(--h); height: var(--h); padding: 0; border: none; border-radius: 50%; box-shadow: var(--piece-shadow), inset 0 0 0 1px ${lite(0.25)}; cursor: pointer; overflow: hidden;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 50%; }
        &:focus-visible { outline: none; box-shadow: var(--piece-shadow), ${focus}; } }
      input[type="text"] { flex: 1; min-width: 0; font-family: ui-monospace, monospace; font-size: .95em; } }
    &.s-rgba .s-color-input { gap: calc(var(--u) * 2.5);
      input[type="color"] { width: var(--h); height: var(--h); border-radius: 50%; box-shadow: var(--piece-shadow), inset 0 0 0 1px ${lite(0.25)}; overflow: hidden;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 50%; } }
      .s-alpha { height: calc(var(--u) * 1.75); box-shadow: var(--pane-shadow);
        &::-webkit-slider-thumb { width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5); border: none; background: var(--piece); box-shadow: var(--piece-shadow); }
        &::-moz-range-thumb { width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5); border: none; background: var(--piece); box-shadow: var(--piece-shadow); } }
      input[type="text"] { font-family: ui-monospace, monospace; font-size: .95em; } }
    &.s-swatches { .s-input { flex-wrap: wrap; gap: calc(var(--u) * 2); }
      button { width: calc(var(--u) * 6); height: calc(var(--u) * 6); padding: 0; border: none; border-radius: 50%; box-shadow: var(--piece-shadow), inset 0 0 0 1px ${lite(0.25)}; transition: transform .1s;
        &:hover { transform: scale(1.1); }
        &:active { transform: scale(.95); }
        &.s-selected { box-shadow: var(--piece-shadow), 0 0 0 2px var(--bg), 0 0 0 4px var(--fg); }
        &:focus-visible { outline: none; box-shadow: var(--piece-shadow), ${focus}; } } }
  }

  /* ── Text / Textarea ── */
  .s-text input[type="text"] { flex: 1; }
  .s-textarea { align-items: flex-start;
    .s-label-group { padding-top: calc(var(--u) * 2); }
    textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(var(--lh) * 3 + var(--u) * 4); max-height: 50vh; }
    &.s-code textarea { font-family: ui-monospace, monospace; font-size: smaller; } }

  /* ── Separator ── */
  .s-separator { background: ${lite(dark ? 0.12 : 0.6)}; opacity: 1; }
  .s-separator-labeled { background: none; &::before, &::after { background: ${lite(dark ? 0.12 : 0.6)}; opacity: 1; } }
  .s-separator-label { color: var(--fg-muted); opacity: 1; }

  /* ── XY pad / knob ── */
  .s-xy { align-items: flex-start; .s-label-group { padding-top: calc(var(--u) * 1); } }
  .s-pad { background: var(--pane); border: none; border-radius: var(--r-pane); box-shadow: var(--pane-shadow);
    .s-pad-x, .s-pad-y { background: ${lite(dark ? 0.12 : 0.5)}; }
    .s-pad-dot { background: var(--piece); box-shadow: var(--piece-shadow), 0 0 0 2px var(--accent); } }
  .s-knob-dial { width: calc(var(--u) * 10); height: calc(var(--u) * 10); background: var(--pane); border: none; box-shadow: var(--pane-shadow), var(--piece-shadow);
    i { background: var(--accent); width: 3px; border-radius: 2px; } }
  .s-knob-val { color: var(--fg-muted); opacity: 1; }

  /* ── Folder ── */
  .s-folder {
    > summary { font-weight: 500; color: var(--fg-muted); min-height: calc(var(--u) * 7); padding: 0; text-shadow: var(--halo); transition: color .12s; gap: calc(var(--u) * 2);
      &:hover { color: var(--fg); }
      &::after { content: ''; width: calc(var(--u) * 4); height: calc(var(--u) * 4); margin-left: auto; background: currentColor; -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; transition: transform .2s; }
      &:focus-visible { outline: none; color: var(--fg); } }
    &[open] > summary { color: var(--fg); &::after { transform: rotate(-180deg); } }
    .s-content { gap: calc(var(--u) * (1.5 + 2 * var(--spacing))); padding: calc(var(--u) * 3) calc(var(--u) * 3); border-radius: var(--r-pane); background: ${lite(dark ? 0.035 : 0.25)}; box-shadow: inset 0 0 0 1px ${lite(dark ? 0.08 : 0.45)}; }
    &.s-section > summary { pointer-events: none; &::after { display: none; } }
  }
}`

  return baseCSS + '\n' + overrides
}
