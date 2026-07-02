/**
 * Glass theme — skeuomorphic glassmorphism
 *
 * Believable physical glass, not a flat translucent card: layered backdrop blur,
 * a refractive edge (bright top-light hairline, dark bottom hairline — light
 * bending through a real bevel), a specular sheen across the upper surface,
 * an inner rim shadow that reads as thickness, and soft ambient contact shadow
 * below. Fields are etched *into* the glass (inset groove); controls that move
 * (thumbs, switches, buttons) float *above* it with their own small cast shadow
 * and top-lit sheen. Airy, cool, premium — distinct from skeu's warm foam
 * relief and neu's paired soft-blob shadows.
 *
 * Axes: shade/accent (hue + light/dark via resolveRoles), spacing/weight/
 * roundness/size (shared scale axes), blur (backdrop frost radius), depth
 * (specular sheen + chromatic dispersion intensity — the glass's optical
 * "thickness"), tint (backdrop tint density — 0 clear, 1 milky frost).
 *
 * glass(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveRoles, clamp } from './color.js'
import { bevel } from './mixins.js'

export default function glass({
  shade = '#1c2030',
  accent = '#6ea8ff',
  spacing = 1,
  weight = 400,
  roundness = 1.4,
  blur = 18,
  size = 1,
  depth = 1,
  tint = 1,
} = {}) {
  const { dark, fg, fgMuted, accent: acc, onAccent } = resolveRoles(shade, accent)

  // Translucent surface + light-stroke helpers, all derived from the shade.
  const sheet = (a) => `hsl(from var(--bg) h s l / ${a})`
  const lite = (a) => `hsl(from white h s l / ${a})`
  const ink = (a) => `hsl(from black h s l / ${a})`
  const op = (a) => clamp(a, 0, 1)   // guard depth/tint multipliers from blowing past a valid alpha

  const fieldFill = dark ? lite(0.05) : lite(0.3)
  const fieldHover = dark ? lite(0.09) : lite(0.45)
  const stroke = dark ? lite(0.14) : lite(0.6)
  const ctrlBevel = `linear-gradient(160deg, ${lite(dark ? 0.4 : 0.75)}, ${lite(0.03)} 45%, ${ink(dark ? 0.28 : 0.08)})`
  // Dot the switch thumb / slider selects fall back to when not the lensed thumb.
  const thumbBg = dark ? lite(0.85) : '#fff'
  // The select arrow is a raw (non-mask) SVG stroke, so its color is a real,
  // overridable token — encoded into the data-URI like tweakpane's icons.
  const chevronFg = dark ? '#ccc' : '#555'

  // Backdrop tint: the milky density of the glass itself, scaled by `tint`
  // (0 clear → 1 current frost). Saturate is the fixed optical constant that
  // keeps whatever shows through the blur vivid rather than washed out.
  const tintAlpha = op((dark ? 0.45 : 0.4) * tint)
  const saturate = 1.7

  // Dispersion: real glass edges split light into a faint red/blue fringe
  // (chromatic aberration) — a hairline colour offset on opposing sides of the
  // rim, at very low alpha so it reads on close inspection, never as a tint.
  // Scales with `depth` — the thicker the glass reads, the more it disperses.
  const dispersionWarm = '255,90,90', dispersionCool = '90,150,255'
  const dispersionHard = op(0.12 * depth), dispersionSoft = op(0.08 * depth)
  const dispersion = `inset 1px 0 0 rgba(${dispersionWarm},${dispersionHard}), inset -1px 0 0 rgba(${dispersionCool},${dispersionHard}), inset 0 1px 0 rgba(${dispersionWarm},${dispersionSoft}), inset 0 -1px 0 rgba(${dispersionCool},${dispersionSoft})`
  // Specular highlight: a soft diagonal sheen sweeping the upper glass plus a
  // tighter hot-spot near the top-left corner — like a curved pane catching a
  // single overhead light. Scales with `depth` alongside the dispersion fringe
  // — both are the same physical property (how strongly the glass bends and
  // catches light), just expressed as rim-color vs. surface-sheen.
  const specular = `radial-gradient(60% 40% at 22% 0%, ${lite(op((dark ? 0.22 : 0.65) * depth))} 0%, transparent 70%), linear-gradient(120deg, ${lite(op((dark ? 0.12 : 0.55) * depth))} 0%, ${lite(op(0.03 * depth))} 22%, transparent 46%, transparent 100%)`
  // Etched groove for fields — carved *into* the glass: dark top inner edge,
  // light bottom inner edge (inverse of a raised bevel).
  const etchShadow = `inset 0 1px 1px ${ink(dark ? 0.35 : 0.14)}, inset 0 -1px 0 ${lite(dark ? 0.1 : 0.7)}`
  const etchShadowHover = `inset 0 1px 2px ${ink(dark ? 0.4 : 0.18)}, inset 0 -1px 0 ${lite(dark ? 0.14 : 0.8)}`
  // Floating-control shadow: contact shadow below + rim light above, for parts
  // that sit proud of the glass (thumbs, switch knob, buttons).
  const floatShadow = `0 1px 1px ${ink(dark ? 0.5 : 0.2)}, 0 3px 8px -2px ${ink(dark ? 0.55 : 0.28)}, inset 0 1px 0 ${lite(0.8)}`
  // Ambient contact shadow — the pane floating over the scene.
  const contactShadow = `0 24px 60px -16px ${ink(dark ? 0.55 : 0.35)}, 0 6px 16px -8px ${ink(dark ? 0.4 : 0.22)}`

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --on-accent: ${onAccent};
  --fg: ${fg};
  --fg-muted: ${fgMuted};
  --field: ${fieldFill};
  --field-hover: ${fieldHover};
  --stroke: ${stroke};
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: ${roundness};
  --r: calc(var(--u) * var(--roundness) * 3);
  --u: ${4 * size}px;
  --blur: ${blur}px;
  --saturate: ${saturate};
  --depth: ${depth};
  --tint: ${tintAlpha};
  --ctrl-bevel: ${ctrlBevel};
  --etch: ${etchShadow};
  --etch-hover: ${etchShadowHover};
  --float: ${floatShadow};
  --thumb-bg: ${thumbBg};
  --dispersion: ${dispersion};
  --specular: ${specular};
  color-scheme: ${dark ? 'dark' : 'light'};

  position: relative;
  isolation: isolate;
  color: var(--fg);
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-weight: var(--weight);
  border-radius: var(--r);
  /* Ambient contact shadow only — the pane floating over the scene. The glass
     material itself (tint, blur, refraction, rim) lives on ::after so the
     lens filter can bend *it* without ever warping the real content on top. */
  box-shadow: ${contactShadow};
  padding: calc(var(--u) * (3 + 2 * var(--spacing)));
  min-width: 28ch;
  max-width: calc(var(--u) * 112);
  -webkit-font-smoothing: antialiased;

  /* ── The glass itself: a dedicated layer behind all content ── */
  &::after {
    content: ''; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
    /* SVG filter regions paint past the border box (border-radius doesn't clip
       filter output) — clip-path pins the displaced backdrop inside the glass */
    clip-path: inset(0 round var(--r));
    background: hsl(from var(--bg) h s l / var(--tint));
    /* Fallback for browsers without SVG reference-filter support in
       backdrop-filter: plain frosted glass (blur + saturate). */
    -webkit-backdrop-filter: blur(var(--blur)) saturate(var(--saturate));
    backdrop-filter: blur(var(--blur)) saturate(var(--saturate));
    /* Spec-correct override: an SVG filter (feDisplacementMap over a radial/
       edge gradient map — flat at the centre, lensing at the rim) referenced
       directly by backdrop-filter, bundling its own blur+saturate so nothing
       above is lost if/when a browser executes feDisplacementMap here too.
       Invalid/unsupported → the fallback above stands. */
    -webkit-backdrop-filter: url(#lg-refraction);
    backdrop-filter: url(#lg-refraction);
    /* The actual bend, verified in Chromium: feDisplacementMap reliably
       samples pixels through the plain filter property but not yet through
       backdrop-filter (the blur/saturate portions of the same SVG filter DO
       apply either way — only the displacement silently no-ops inside
       backdrop-filter here). Applied to this backdrop-only layer instead of
       the panel itself, so text and controls stay crisp while the glass —
       tint, blur, rim, dispersion — reads as a lens: flat in the middle,
       bending only at the rim. */
    filter: url(#lg-refraction);
    /* edge reflection (crisp top-bright/bottom-dim ring) + dispersion
       (chromatic fringe) — both optical properties of the glass edge, so
       they live here and bend together with the backdrop */
    box-shadow:
      inset 0 1px 1px ${lite(dark ? 0.12 : 0.5)},
      inset 0 -1px 1px ${ink(dark ? 0.25 : 0.05)},
      var(--dispersion);
  }
  /* specular highlight: a surface reflection, not a backdrop refraction, so it
     stays put (unwarped) above content while the glass bends beneath. */
  &::before {
    content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 1;
    background: var(--specular);
  }

  /* ── Header ── */
  > summary, > .s-panel-title { font-weight: 600; font-size: larger; letter-spacing: -0.01em; text-shadow: 0 1px 2px ${sheet(0.4)}; }
  .s-fold-icon { width: calc(var(--u) * 4); height: calc(var(--u) * 4); margin-left: auto; flex-shrink: 0; display: inline-flex;
    i { width: 100%; height: 100%; background: currentColor; opacity: .7;
      -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
      mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
      transition: transform .2s; } }
  &[open] .s-fold-icon i { transform: rotate(-180deg); }
  /* search: pill etched into the header, matching field groove language */
  .s-search { background: var(--field); box-shadow: var(--etch); border: 1px solid var(--stroke); border-radius: calc(var(--r) * 0.6); padding: calc(var(--u) * 0.75) calc(var(--u) * 1.5); transition: background .14s, box-shadow .14s; }
  &.s-searching .s-search { background: var(--field-hover); }
  .s-search-btn { width: calc(var(--u) * 3); height: calc(var(--u) * 3); opacity: .7; transition: opacity .14s; &:hover { opacity: 1; } }
  .s-search-input { font-size: smaller; font-weight: var(--weight); color: var(--fg); width: 12ch;
    &::placeholder { color: var(--fg-muted); } &:focus-visible { outline: none; } }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: calc(var(--u) * (1 + 2 * var(--spacing))); }
  .s-panel-content { gap: calc(var(--pad) * 1.4); }

  /* ── Labels ── */
  .s-label { font-weight: 500; }
  .s-hint { color: var(--fg-muted); font-size: smaller; }
  .s-title { display: inline-flex; align-items: center; justify-content: center; width: calc(var(--u) * 4); height: calc(var(--u) * 4); border-radius: 50%; background: var(--field); border: 1px solid var(--stroke); font-size: 10px; cursor: help;
    &:hover + .s-title-text { opacity: 1; visibility: visible; } }
  .s-title-text { position: absolute; left: 0; top: 100%; margin-top: var(--u); padding: calc(var(--u) * 1.5); font-size: smaller; background: ${sheet(0.85)}; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); border: 1px solid var(--stroke); border-radius: calc(var(--r) * 0.5); width: max-content; max-width: 30ch; z-index: 10; opacity: 0; visibility: hidden; pointer-events: none; }

  /* ── Fields — etched into the glass: a shallow groove, dark on top, ── */
  /* ── a sliver of light catching the lower inner edge.               ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--field); color: var(--fg); border: 1px solid var(--stroke); border-radius: calc(var(--r) * 0.55);
    font: inherit; font-weight: var(--weight);
    box-shadow: var(--etch);
    transition: background .14s, box-shadow .14s;
    &::placeholder { color: var(--fg-muted); }
    &:hover { background: var(--field-hover); box-shadow: var(--etch-hover); }
    &:focus-visible { outline: none; border-color: var(--accent); box-shadow: var(--etch), 0 0 0 2px color-mix(in oklab, var(--accent), transparent 65%); }
  }
  input[type="text"], input[type="number"], select { height: calc(1lh + var(--pad) * 2); }
  select { cursor: pointer; appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='3,4 5,6.5 7,4' fill='none' stroke='${encodeURIComponent(chevronFg)}' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right calc(var(--u) * 2) center; padding-right: calc(var(--u) * 6);
    option { background: var(--bg); color: var(--fg); } }
  .s-select.s-dropdown select { flex: 1; }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-step { flex-direction: column; button { background: none; border: none; color: var(--fg-muted); padding: 0 calc(var(--u) * 1.5); font-size: .6em; line-height: 1.4; cursor: pointer; &:hover { color: var(--fg); } } }
  }
  input[type="number"] { font-variant-numeric: tabular-nums; }

  /* ── Buttons — float above the glass: contact shadow below, sheen on top ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(var(--u) * 2); }
    button { position: relative; width: 100%; background: color-mix(in oklab, var(--accent), transparent 12%); color: var(--on-accent); font-weight: 600; border: none; border-radius: calc(var(--r) * 0.55);
      padding: calc(var(--u) * (1 + var(--spacing))) calc(var(--pad) * 2);
      box-shadow: 0 1px 1px ${lite(0.5)} inset, 0 3px 10px -3px color-mix(in oklab, var(--accent), transparent 25%), 0 8px 20px -8px ${ink(dark ? 0.6 : 0.35)};
      transition: background .14s, transform .08s, box-shadow .14s;
      overflow: hidden;
      &::after { ${bevel('var(--ctrl-bevel)', '1px')} }
      &::before { content: ''; position: absolute; inset: 0 0 55%; border-radius: inherit; background: linear-gradient(${lite(0.35)}, transparent); pointer-events: none; opacity: .8; }
      &:hover { background: var(--accent); }
      &:active { transform: scale(0.96); box-shadow: 0 1px 1px ${ink(0.15)} inset, 0 2px 6px -3px color-mix(in oklab, var(--accent), transparent 30%); }
      &:disabled { opacity: .5; box-shadow: none; cursor: not-allowed; &::before { display: none; } }
      &:focus-visible { outline: 2px solid var(--on-accent); outline-offset: 2px; } }
    &.s-secondary button, button.s-secondary { background: var(--field); color: var(--fg); border: 1px solid var(--stroke); box-shadow: var(--etch);
      &::after { display: none; } &::before { background: linear-gradient(${lite(0.18)}, transparent); }
      &:hover { background: var(--field-hover); }
      &:active { box-shadow: var(--etch-hover); } }
  }

  /* ── Boolean — track etched into glass, thumb floats above it ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { cursor: pointer; }
    &.s-switch {
      .s-track { width: calc(var(--u) * 12); height: calc(var(--u) * 6.5); border-radius: 999px; background: var(--field); border: 1px solid var(--stroke); box-shadow: var(--etch); position: relative; transition: background .2s, box-shadow .2s;
        &::after { content: ''; position: absolute; top: 50%; left: 2px; width: calc(var(--u) * 5); height: calc(var(--u) * 5); transform: translateY(-50%); border-radius: 50%; background: var(--thumb-bg); box-shadow: var(--float); transition: left .2s cubic-bezier(.34,1.4,.64,1); } }
      &:has(input:checked) .s-track { background: var(--accent); border-color: transparent; box-shadow: inset 0 1px 2px ${ink(0.3)}; &::after { left: calc(100% - var(--u) * 5 - 2px); } }
      &:has(input:hover) .s-track { background: var(--field-hover); }
      &:has(input:checked:hover) .s-track { background: var(--accent); }
      &:has(input:focus-visible) .s-track { box-shadow: var(--etch), 0 0 0 2px color-mix(in oklab, var(--accent), transparent 50%); }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); border-radius: calc(var(--r) * 0.35); background: var(--field); border: 1px solid var(--stroke); box-shadow: var(--etch); transition: background .14s, box-shadow .14s;
        &::after { content: ''; width: 55%; height: 55%; border-radius: calc(var(--r) * 0.2); background: transparent; transition: background .12s; } }
      &:has(input:hover) .s-track { background: var(--field-hover); }
      &:has(input:checked) .s-track { background: var(--accent); border-color: transparent; box-shadow: inset 0 1px 2px ${ink(0.3)}; &::after { background: var(--on-accent); } }
      &:has(input:focus-visible) .s-track { box-shadow: var(--etch), 0 0 0 2px color-mix(in oklab, var(--accent), transparent 50%); }
    }
    &.s-toggle {
      .s-track { padding: var(--pad) calc(var(--pad) * 2); border-radius: calc(var(--r) * 0.55); background: var(--field); border: 1px solid var(--stroke); box-shadow: var(--etch); height: calc(1lh + var(--pad) * 2); display: flex; align-items: center; justify-content: center; font-size: smaller; color: var(--fg-muted); cursor: pointer; transition: background .14s, box-shadow .14s, color .14s;
        &::after { content: 'Off'; } }
      &:has(input:hover) .s-track { background: var(--field-hover); }
      &:has(input:checked) .s-track { background: color-mix(in oklab, var(--accent), transparent 15%); border-color: transparent; color: var(--on-accent); box-shadow: inset 0 1px 2px ${ink(0.25)}; &::after { content: 'On'; } }
      &:has(input:focus-visible) .s-track { box-shadow: var(--etch), 0 0 0 2px color-mix(in oklab, var(--accent), transparent 50%); }
    }
  }

  /* ── Slider — etched track, thumb is a small glass lens (radial sheen + rim) ── */
  .s-slider {
    align-items: center;
    --thumb-lens: radial-gradient(circle at 34% 28%, ${lite(0.95)} 0%, ${lite(0.5)} 22%, #fff 46%, ${dark ? lite(0.75) : '#f3f5fa'} 100%);
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: var(--lh); }
    .s-track { height: calc(var(--u) * 5); margin: calc(var(--u) * var(--spacing)) 0; }
    input[type="range"] {
      width: 100%; height: calc(var(--u) * 1.5); -webkit-appearance: none; appearance: none; border-radius: 999px; cursor: pointer;
      background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--field) var(--p, 0%));
      border: 1px solid var(--stroke);
      box-shadow: var(--etch);
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5); border-radius: 50%; background: var(--thumb-lens); border: 1px solid ${ink(dark ? 0.2 : 0.1)}; box-shadow: var(--float); cursor: grab; margin-top: calc(var(--u) * -1.5); transition: box-shadow .12s, transform .12s; }
      &::-moz-range-thumb { width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5); border-radius: 50%; background: var(--thumb-lens); border: 1px solid ${ink(dark ? 0.2 : 0.1)}; box-shadow: var(--float); cursor: grab; }
      &:hover::-webkit-slider-thumb { transform: scale(1.06); }
      &:hover::-moz-range-thumb { transform: scale(1.06); }
      &:active::-webkit-slider-thumb, &.s-scrubbing::-webkit-slider-thumb { cursor: grabbing; transform: scale(0.96); box-shadow: 0 1px 2px ${ink(0.35)}, 0 0 0 4px color-mix(in oklab, var(--accent), transparent 70%); }
      &:active::-moz-range-thumb, &.s-scrubbing::-moz-range-thumb { cursor: grabbing; transform: scale(0.96); }
      &:focus-visible { outline: none; box-shadow: var(--etch), 0 0 0 2px color-mix(in oklab, var(--accent), transparent 60%); }
    }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-marks { display: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 6px); font-size: smaller; color: var(--fg-muted); white-space: nowrap; }
    .s-readout { flex: 0 0 auto; min-width: 7ch; text-align: right; font-size: smaller; color: var(--fg-muted); font-variant-numeric: tabular-nums; background: transparent; border: none; padding-left: var(--pad); cursor: ew-resize; border-radius: calc(var(--r) * 0.3);
      &:hover { color: var(--fg); }
      &.s-scrubbing { color: var(--accent); } }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); margin-bottom: var(--u); background: ${sheet(0.85)}; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); border: 1px solid var(--stroke); border-radius: calc(var(--r) * 0.4); padding: 2px 8px; font-size: smaller; white-space: nowrap; box-shadow: 0 4px 12px -4px ${ink(0.3)}; }
    &.s-multiple .s-interval-track { height: calc(var(--u) * 1.5); margin: calc(var(--u) * var(--spacing)) 0; border-radius: 999px; background: var(--field); border: 1px solid var(--stroke); box-shadow: var(--etch); position: relative;
      &::before { content: ''; position: absolute; top: -1px; bottom: -1px; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); border-radius: 999px; } }
  }

  /* ── Select variants — segmented track etched, active pill floats ── */
  .s-select {
    &.s-segmented {
      .s-input { gap: 0; background: var(--field); border: 1px solid var(--stroke); box-shadow: var(--etch); border-radius: calc(var(--r) * 0.55); padding: 2px; }
      button { flex: 1; position: relative; background: transparent; border: none; border-radius: calc(var(--r) * 0.45); color: var(--fg-muted); padding: calc(var(--pad) - 2px); transition: background .14s, color .14s, box-shadow .14s, transform .1s;
        &:hover { color: var(--fg); }
        &:active { transform: scale(0.96); }
        &.s-selected { background: var(--accent); color: var(--on-accent); box-shadow: 0 1px 1px ${lite(0.45)} inset, 0 2px 6px -2px ${ink(dark ? 0.5 : 0.3)}; } }
    }
    &.s-radio, &.s-checkboxes {
      .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * var(--spacing) * 1.5); }
      label { display: flex; align-items: center; gap: calc(var(--u) * 2.5); cursor: pointer; }
    }
    &.s-checkboxes {
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); flex-shrink: 0; border-radius: calc(var(--r) * 0.35); background: var(--field); border: 1px solid var(--stroke); box-shadow: var(--etch); transition: background .14s;
        &::after { content: ''; width: 55%; height: 55%; border-radius: calc(var(--r) * 0.2); background: transparent; } }
      label:has(input:hover) .s-track { background: var(--field-hover); }
      label:has(input:checked) .s-track { background: var(--accent); border-color: transparent; box-shadow: inset 0 1px 2px ${ink(0.3)}; &::after { background: var(--on-accent); } }
    }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(var(--u) * 2);
      input[type="color"] { position: static; width: calc(var(--u) * 8); height: calc(1lh + var(--pad) * 2); padding: 0; border: 1px solid var(--stroke); box-shadow: var(--etch); border-radius: calc(var(--r) * 0.55); cursor: pointer; overflow: hidden;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } }
      input[type="text"] { flex: 1; min-width: 0; font-family: ui-monospace, monospace; } }
    &.s-swatches { .s-input { flex-wrap: wrap; gap: calc(var(--u) * 1.5); }
      button { width: calc(var(--u) * 6); height: calc(var(--u) * 6); padding: 0; border: 1px solid var(--stroke); box-shadow: 0 1px 1px ${lite(0.4)} inset, 0 2px 4px -2px ${ink(dark ? 0.45 : 0.25)}; border-radius: calc(var(--r) * 0.45); transition: transform .1s;
        &:hover { transform: translateY(-1px); }
        &:active { transform: scale(0.96); }
        &.s-selected { outline: 2px solid var(--on-accent); outline-offset: 2px; } } }
  }

  /* ── Text / Textarea ── */
  .s-text input[type="text"] { flex: 1; }
  .s-textarea { align-items: flex-start;
    textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(var(--lh) * 3); max-height: 50vh; }
    &.s-code textarea { font-family: ui-monospace, monospace; font-size: smaller; } }

  /* ── Folder ── */
  .s-folder {
    > summary { font-weight: 500; color: var(--fg-muted); padding: calc(var(--u) * 2) 0; border-bottom: 1px solid var(--stroke);
      &::after { content: ''; width: calc(var(--u) * 4); height: calc(var(--u) * 4); margin-left: auto; background: currentColor; -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat; mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat; transition: transform .2s; } }
    &[open] > summary { border-bottom: none; &::after { transform: rotate(-180deg); } }
    .s-content { padding: calc(var(--u) * 2 * var(--spacing)) 0; }
  }
}`

  return baseCSS + '\n' + overrides
}
