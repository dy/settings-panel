/**
 * Skeu theme — monotone, diffuse, tactile
 *
 * Quiet skeuomorphism: one matte material lit softly from above. Nothing
 * shouts — relief does the talking. The panel is a molded plate with a faint
 * top-to-bottom light falloff and a fine matte grain; fields are cut into it
 * (a shallow well: shaded lip on top, a catch-light on the lower edge);
 * anything pressable is a low dome (lighter top, darker bottom, crisp 1px
 * rim, a soft contact shadow); the slider knob is a proper domed cap. States
 * move in the material: a pressed key sinks, a checked switch fills its
 * channel, a selected segment latches down. Labels are engraved.
 *
 * Axes: shade (material color; a function `$(L, C, H, alpha)` may be passed to
 * supply the whole ramp), accent (fill for on/selected/primary; defaults to a
 * deeper tone of the shade so the theme stays monotone), depth (elevation:
 * shadow throw + dome relief), bevel (edge crispness: rim/lip contrast, and
 * width beyond 1), roundness (corner + knob shape, square → circle), weight,
 * spacing, grid (dots / lines / crosses texture overlay).
 *
 * skeu(axes?) → CSS string
 */

import metrics from './metrics.js'
import defaultCSS from './default.js'
import { parseColor, resolveAccent, lerp, clamp } from './color.js'

const { min, max } = Math

// Grid patterns: dots 2u (secondary), lines 4u (medium), crosses 8u (primary)
const GRID = {
  dots: (c, a, u) => { const s = 2 * u, h = s / 2; return { url: `url("data:image/svg+xml,%3Csvg width='${s}' height='${s}' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${h}' cy='${h}' r='${u * .15}' fill='rgba(${c},${a})'/%3E%3C/svg%3E")`, off: -h } },
  lines: (c, a, u) => { const s = 4 * u; return { url: `url("data:image/svg+xml,%3Csvg width='${s}' height='${s}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h${s}M0 0v${s}' stroke='rgba(${c},${a})' stroke-width='${u * .15}'/%3E%3C/svg%3E")`, off: 0 } },
  crosses: (c, a, u) => { const s = 8 * u, h = s / 2, arm = u; return { url: `url("data:image/svg+xml,%3Csvg width='${s}' height='${s}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M${h} ${h - arm}v${arm * 2}M${h - arm} ${h}h${arm * 2}' stroke='rgba(${c},${a})' stroke-width='${u * .15}'/%3E%3C/svg%3E")`, off: -h } },
}

// Fine matte grain — alpha derived from the turbulence luminance so it reads as
// texture, not as a flat tint. Multiplied over the surface at very low strength.
const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0.04 0.04 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export default function skeu({
  shade = '#f5f4f2',
  accent,
  grid = [],
  spacing = 1,
  weight = 400,
  depth = 1,
  roundness = 1,
  bevel: bevelOpt = 1,
  size = 1,
  font,
} = {}) {

  const isFunc = typeof shade === 'function'
  const { L: sL, C: sC, H: sH } = isFunc ? { L: 0.97, C: 0.01, H: 60 } : parseColor(shade)
  const dark = sL < .6
  const $ = isFunc ? (L = sL, C = sC, H = sH, alpha) => shade(L, C, H, alpha) : (L = sL, C = sC, H = sH, alpha) => {
    L = clamp(L, 0, 1)
    const l = +L.toFixed(3), c = +C.toFixed(4), h = +H.toFixed(1)
    return alpha != null
      ? `oklch(${l} ${c} ${h} / ${+clamp(alpha, 0, 1).toFixed(3)})`
      : `oklch(${l} ${c} ${h})`
  }

  // ── Accent: explicit, or a deeper tone of the shade (monotone by default) ──
  const resolvedAccent = resolveAccent(accent, shade)
  const { L: aL, C: aC, H: aH } = resolvedAccent ? parseColor(resolvedAccent) : { L: dark ? .78 : .42, C: min(sC * 1.2, 0.05), H: sH }
  const accentDark = aL < .6

  // ── Axes → physics ──
  // bevel: 0..1 fades edge contrast (rim stays 1px); 1..2 widens the rim to 2px.
  const edge = bevelOpt <= 1 ? lerp(.3, 1, clamp(bevelOpt, 0, 1)) : lerp(1, 1.25, clamp(bevelOpt - 1, 0, 1))
  const bevelPx = +(bevelOpt <= 1 ? 1 : lerp(1, 2, clamp(bevelOpt - 1, 0, 1))).toFixed(2)
  // depth: elevation (cast-shadow throw) + relief (dome/well gradient span)
  const D = clamp(depth, 0, 3)
  const relief = .5 + D * .5

  // ── One overhead light: every rim, lip and shadow derives from these ──
  const hi = a => $(1, sC * .3, sH, a * edge)                          // catch-light (near-white)
  const lo = a => $(.12, min(sC * 1.5, .04), sH, a * edge)              // shade (near-black, faint tint)
  const sh = a => $(.1, min(sC * 1.2, .04), sH, a * (.6 + D * .4))      // cast shadow (elevation-driven)

  // Two-layer cast shadow (contact + ambient), scaled by depth. `e` = relative elevation.
  const cast = e => !e ? '' : `, 0 ${(e * .6 * D).toFixed(2)}px ${(e * 1.2 * D).toFixed(2)}px ${sh(.14)}, 0 ${(e * 2 * D).toFixed(2)}px ${(e * 5 * D).toFixed(2)}px ${sh(.1)}`

  // ── Form shading (always top-lit) ──
  const dome = (L, C, H, span = .05) => `linear-gradient(180deg, ${$(min(1, L + span * relief), C, H)} 0%, ${$(L, C, H)} 55%, ${$(max(0, L - span * .8 * relief), C, H)} 100%)`
  const wellL = max(.08, sL - (dark ? .035 : .045))
  const well = `linear-gradient(180deg, ${$(max(0, wellL - .025 * relief), sC, sH)} 0%, ${$(wellL, sC, sH)} 35%, ${$(min(1, wellL + .012 * relief), sC, sH)} 100%)`
  const knob = `radial-gradient(circle at 50% 30%, ${$(min(1, sL + .05), sC * .5, sH)} 0%, ${$(min(1, sL + .02), sC, sH)} 45%, ${$(max(0, sL - .05), sC, sH)} 100%)`

  // ── Surface mixins ──
  // Rim of a dome (light top edge, dark bottom edge, thin dark ring) and the
  // lip of a well (shaded top, catch-light below) — tokens, so every raised or
  // sunken part shares one definition and either can be overridden.
  const rimShadow = `inset 0 ${bevelPx}px 0 ${hi(.7)}, inset 0 -${bevelPx}px 0 ${lo(.12)}, 0 0 0 ${bevelPx}px ${lo(.16)}`
  const lipShadow = `inset 0 ${bevelPx}px ${(bevelPx * 2.5).toFixed(2)}px ${lo(.22)}, inset 0 0 0 ${bevelPx}px ${lo(.1)}, 0 ${bevelPx}px 0 ${hi(.55)}`
  // raised(e): dome + rim + cast shadow
  const raised = (grad, e = 1) => `
    border: none;
    background-color: var(--bg);
    background-image: ${grad};
    box-shadow: var(--rim)${cast(e)};`
  // sunken(): well cut into the plate
  const sunken = (grad = 'var(--well)') => `
    border: none;
    background-color: var(--sunken);
    background-image: ${grad};
    box-shadow: var(--lip);`

  // key(): pressable raised surface with real press travel + latched (selected) state
  const key = (L = aL, C = aC, H = aH, bg) => {
    const isDark = L < .6
    const grad = dome(L, C, H)
    return `
    ${raised(bg ? `linear-gradient(180deg, ${$(min(1, L + .06 * relief), C, H)} 0%, ${bg} 50%, ${$(max(0, L - .04 * relief), C, H)} 100%)` : grad, 1.2)}
    border-radius: var(--ri);
    color: var(${isDark ? '--text-dark' : '--text-light'});
    text-shadow: 0 ${isDark ? -1 : 1}px 0 ${isDark ? lo(.35) : hi(.7)};
    cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    font: inherit; line-height: 1;
    padding: var(--pad) calc(var(--pad) * 2);
    transition: filter 120ms, box-shadow 120ms, transform 120ms;
    &:hover { filter: brightness(${isDark ? 1.12 : 1.03}); }
    &:active { transform: translateY(${bevelPx}px); filter: brightness(${isDark ? .95 : .98}); box-shadow: var(--rim); }
    &:disabled { opacity: .45; cursor: not-allowed; filter: none; transform: none; }
    &.s-selected, &[aria-pressed="true"] {
      ${sunken(`linear-gradient(180deg, ${$(max(0, aL - .05 * relief), aC, aH)} 0%, ${$(aL, aC, aH)} 40%, ${$(min(1, aL + .04 * relief), aC, aH)} 100%)`)}
      background-color: var(--accent);
      color: var(${accentDark ? '--text-dark' : '--text-light'});
      text-shadow: 0 ${accentDark ? -1 : 1}px 0 ${accentDark ? lo(.35) : hi(.7)};
      transform: none; filter: none;
    }
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; z-index: 1; }`
  }

  // Thumb: equal-area square (2√π u) → circle (4u dia) as roundness 0→1
  const THUMB_CIRCLE = 4
  const THUMB_SQUARE = 2 * Math.sqrt(Math.PI)
  const thumbT = clamp(roundness, 0, 1)
  const thumbU = roundness >= 1 ? THUMB_CIRCLE : lerp(THUMB_SQUARE, THUMB_CIRCLE, thumbT)
  const thumbR = roundness <= 0 ? '0'
    : roundness >= 1 ? '999px'
    : `calc(var(--u) * ${+(thumbU * thumbT / 2).toFixed(4)})`
  const thumb = `
  width: var(--thumb); height: var(--thumb);
  border: none; border-radius: ${thumbR};
  background-color: var(--bg);
  background-image: ${knob};
  box-shadow: inset 0 ${bevelPx}px 0 ${hi(.85)}, inset 0 -${bevelPx}px 0 ${lo(.1)}, 0 0 0 ${bevelPx}px ${lo(.2)}${cast(1.4)};
  cursor: grab; z-index: 1; position: relative;
  transition: filter 120ms;`

  // Grid layers (combinable background-image stack) over the plate's own light + grain
  const gridList = Array.isArray(grid) ? grid : (grid && grid !== 'none' ? [grid] : [])
  const gc = dark ? '255,255,255' : '0,0,0', ga = dark ? '.05' : '.06'
  const gridLayers = gridList.map(g => GRID[g]?.(gc, ga, 4)).filter(Boolean)
  const plate = `linear-gradient(180deg, ${$(min(1, sL + .025 * relief), sC, sH)} 0%, ${$(sL, sC, sH)} 30%, ${$(max(0, sL - .02 * relief), sC, sH)} 100%)`
  const bgImgs = [grain, ...gridLayers.map(l => l.url), plate]
  const bgBlends = ['multiply', ...gridLayers.map(() => 'normal'), 'normal']
  const bgPos = ['0 0', ...gridLayers.map(l => `${l.off}px ${l.off}px`), '0 0']

  const stroke = max(1, weight / 400)
  const chevron = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='${stroke}' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const check = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2.5,6 5,9 9.5,3' fill='none' stroke='%23000' stroke-width='${max(1.6, stroke * 1.6)}' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const engrave = dark ? `0 -1px 0 ${lo(.5)}` : `0 1px 0 ${hi(.8)}`

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, {panelPadding: 20, fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif"})}

  --bg: ${$(sL)};
  --accent: ${$(aL, aC, aH)};

  --roundness: ${roundness};
  --weight: ${weight};
  color-scheme: ${dark ? 'dark' : 'light'};
  --sunken: ${$(wellL, sC, sH)};
  --raised: ${$(min(1, sL + .04), sC, sH)};
  --focus: ${$(aL, max(aC, .1), aH, .55)};
  --hi: ${hi(.8)};
  --lo: ${lo(.14)};
  --rim: ${rimShadow};
  --lip: ${lipShadow};
  --well: ${well};
  --text-light: ${$(.2, sC * .5, sH)};
  --text-dark: ${$(.96, sC * .3, sH)};
  --text: ${dark ? 'var(--text-dark)' : 'var(--text-light)'};
  --text-dim: ${$(dark ? .7 : .46, sC * .6, sH)};
  --bevel: ${bevelPx}px;
  --r: calc(var(--u) * var(--roundness) * 3);
  --ri: calc(var(--u) * max(var(--roundness), -1.5 + var(--roundness) * 3));
  --thumb: calc(var(--u) * ${thumbU});
  --h: calc(1lh + var(--pad) * 2);

  color: var(--text);
  ${raised(plate, 3)}
  background-image: ${bgImgs.join(', ')};
  background-blend-mode: ${bgBlends.join(', ')};
  background-position: ${bgPos.join(', ')};
  text-shadow: ${engrave};
  position: relative;
  isolation: isolate;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  &, *, *::before, *::after { background-origin: border-box; }

  /* ── Rows ── */
  .s-control { align-items: center; }
  .s-input { align-items: center; }
  .s-select.s-radio, .s-select.s-checkboxes, .s-textarea, .s-xy { align-items: flex-start; .s-label-group { padding-top: calc(var(--u) * 1); } }
  .s-select.s-radio .s-input, .s-select.s-checkboxes .s-input { align-items: stretch; }
  .s-label { color: var(--text); font-weight: calc(var(--weight) + 100); }
  .s-hint { color: var(--text-dim); opacity: 1; }
  .s-title { border-color: var(--text-dim); color: var(--text-dim); text-shadow: none; }

  /* ── Panel title — engraved ── */
  > summary, > .s-panel-title {
    color: var(--text);
    font-size: 1.125em;
    font-weight: calc(var(--weight) + 200);
    letter-spacing: .01em;
  }
  > summary::after {
    background: var(--text-dim);
    -webkit-mask: ${chevron} center / contain no-repeat;
    mask: ${chevron} center / contain no-repeat;
    transition: transform 140ms;
  }
  &[open] > summary::after { transform: rotate(-180deg); }

  /* ── Fields — cut into the plate ── */
  input[type="text"], input[type="number"], textarea {
    ${sunken()}
    border-radius: var(--ri);
    color: var(--text);
    text-shadow: none;
    transition: box-shadow 140ms;
    &::placeholder { color: var(--text-dim); opacity: .7; }
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: var(--ri); }
  }
  input.s-scrubbing { color: var(--text); }

  /* ── Select — a raised key with an engraved chevron ── */
  .s-select select {
    ${key(sL, sC, sH, 'var(--raised)')}
    appearance: none; -webkit-appearance: none;
    justify-content: flex-start;
    padding: 0 calc(var(--u) * 7) 0 var(--pad-i);
    height: var(--h);
    color: var(--text);
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    option { background: var(--bg); color: var(--text); font-weight: 400; }
  }
  .s-select.s-dropdown .s-input {
    position: relative;
    &::after {
      content: ''; position: absolute; right: var(--pad); top: 50%;
      width: calc(var(--u) * 4); height: calc(var(--u) * 4);
      background: var(--text-dim);
      -webkit-mask: ${chevron} center / contain no-repeat;
      mask: ${chevron} center / contain no-repeat;
      transform: translateY(-50%); pointer-events: none;
    }
  }

  /* ── Boolean ── */
  .s-boolean {
    label { display: flex; cursor: pointer; }
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }
    &.s-switch {
      .s-track {
        ${sunken()}
        width: calc(var(--u) * (8 + var(--spacing) * 2)); height: calc(var(--u) * 4 + var(--pad));
        border-radius: 999px; position: relative; cursor: pointer;
        transition: background-color 140ms, box-shadow 140ms;
        &::after {
          content: '';
          ${thumb}
          position: absolute; inset: 0; margin: auto calc(var(--pad) / 2);
          width: calc(var(--u) * 4); height: calc(var(--u) * 4); border-radius: 50%; cursor: pointer;
          transition: transform 140ms, box-shadow 140ms;
          transform: translateX(0);
        }
      }
      &:has(input:checked) .s-track { background-color: var(--accent); background-image: linear-gradient(180deg, ${lo(.2)}, transparent 60%);
        &::after { transform: translateX(calc(var(--u) * (4 + var(--spacing) * 2) - var(--pad))); } }
    }
    &.s-toggle {
      .s-track {
        ${key(sL, sC, sH, 'var(--raised)')}
        height: var(--h); font-size: smaller;
        &::after { content: 'Off'; }
      }
      .s-input:active .s-track { transform: translateY(var(--bevel)); }
      &:has(input:checked) .s-track {
        ${sunken(`linear-gradient(180deg, ${$(max(0, aL - .05 * relief), aC, aH)} 0%, ${$(aL, aC, aH)} 40%, ${$(min(1, aL + .04 * relief), aC, aH)} 100%)`)}
        background-color: var(--accent);
        color: var(${accentDark ? '--text-dark' : '--text-light'});
        text-shadow: 0 ${accentDark ? -1 : 1}px 0 ${accentDark ? lo(.35) : hi(.7)};
        &::after { content: 'On'; }
      }
    }
    &.s-checkbox {
      .s-track {
        ${sunken()}
        display: grid; place-items: center; position: relative;
        border-radius: var(--ri);
        width: calc(var(--u) * 4 + var(--pad)); height: calc(var(--u) * 4 + var(--pad));
        transition: background-color 140ms, box-shadow 140ms;
        &::after {
          content: ''; position: absolute; inset: 18%;
          background: var(${accentDark ? '--text-dark' : '--text-light'});
          -webkit-mask: ${check} center / contain no-repeat;
          mask: ${check} center / contain no-repeat;
          opacity: 0; transform: scale(.4); transition: opacity 140ms, transform 140ms;
        }
      }
      &:has(input:checked) .s-track { background-color: var(--accent); background-image: linear-gradient(180deg, ${lo(.18)}, transparent 60%);
        &::after { opacity: 1; transform: scale(1); } }
    }
  }

  /* ── Number ── */
  input[type="number"] { font-variant-numeric: tabular-nums; }
  .s-number input[type="number"] {
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
  }
  .s-step {
    button { ${key(sL, sC, sH, 'var(--raised)')} padding: 0 calc(var(--u) * 1.5); font-size: .6em; line-height: 1.6; color: var(--text-dim); opacity: 1;
      &:hover { color: var(--text); opacity: 1; } }
  }

  /* ── Slider — groove + domed knob ── */
  .s-slider {
    input[type="range"] {
      ${sunken()}
      --fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--p, 0%) / 100%);
      background-image: linear-gradient(180deg, ${lo(.16)}, transparent 70%), var(--track, linear-gradient(to right, var(--accent) var(--fill), transparent var(--fill)));
      border-radius: 999px;
      height: calc(var(--u) * 2);
      overflow: visible;
      appearance: none; -webkit-appearance: none;
      &::-webkit-slider-thumb { -webkit-appearance: none; ${thumb} }
      &::-moz-range-thumb { ${thumb} }
      &:hover::-webkit-slider-thumb { filter: brightness(1.04); }
      &:hover::-moz-range-thumb { filter: brightness(1.04); }
      &:active::-webkit-slider-thumb { filter: brightness(.97); cursor: grabbing; }
      &:active::-moz-range-thumb { filter: brightness(.97); cursor: grabbing; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }
      &::-webkit-slider-container { appearance: none; }
    }
    datalist { display: none; }
    .s-marks, .s-mark-labels { left: calc(var(--thumb) / 2); right: calc(var(--thumb) / 2); }
    .s-marks { display: flex; }
    .s-mark {
      position: absolute; width: 2px; height: calc(var(--u) * 1.5); top: 50%;
      background: var(--lo); box-shadow: 1px 0 0 var(--hi);
      transform: translate(-50%, -50%);
    }
    .s-mark-label { color: var(--text-dim); opacity: 1; &.s-active { color: var(--text); } }
    .s-readout { color: var(--text-dim); opacity: 1; font-size: smaller; font-variant-numeric: tabular-nums; text-shadow: none; }
    input[type="text"].s-readout { padding: var(--pad); color: var(--text); min-width: calc(6ch + var(--pad) * 2); }
    .s-tooltip { ${raised(dome(sL, sC, sH, .03), 1)} border-radius: var(--ri); color: var(--text); text-shadow: ${engrave}; }
    &.s-multiple .s-interval-track {
      height: calc(var(--u) * 4);
      background: none;
      input[type="range"] {
        --low-fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--low, 0%) / 100%);
        --high-fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--high, 100%) / 100%);
        background-image: linear-gradient(180deg, ${lo(.16)}, transparent 70%), linear-gradient(to right,
          transparent var(--low-fill), var(--accent) var(--low-fill),
          var(--accent) var(--high-fill), transparent var(--high-fill));
        height: calc(var(--u) * 2);
        &::-webkit-slider-thumb { -webkit-appearance: none; ${thumb} }
        &::-moz-range-thumb { ${thumb} }
        &:hover::-webkit-slider-thumb { filter: brightness(1.04); }
        &:hover::-moz-range-thumb { filter: brightness(1.04); }
      }
    }
  }

  /* ── Segmented — a bank of keys ── */
  .s-select.s-segmented {
    .s-input { gap: var(--bevel); }
    button {
      ${key(sL, sC, sH, 'var(--raised)')}
      flex: 1; min-width: 0;
      font-size: smaller;
      margin-left: 0;
      border-radius: 0;
      padding: var(--pad);
      &:first-child { border-top-left-radius: var(--ri); border-bottom-left-radius: var(--ri); }
      &:last-child { border-top-right-radius: var(--ri); border-bottom-right-radius: var(--ri); }
    }
  }
  .s-select.s-radio {
    .s-input label { color: var(--text-dim); opacity: 1; &.s-selected { color: var(--text); opacity: 1; } }
  }
  .s-select.s-checkboxes {
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 2); cursor: pointer; }
    .s-track {
      ${sunken()}
      display: grid; place-items: center; position: relative; flex-shrink: 0;
      border-radius: var(--ri);
      width: calc(var(--u) * 4 + var(--pad)); height: calc(var(--u) * 4 + var(--pad));
      transition: background-color 140ms, box-shadow 140ms;
      &::after {
        content: ''; position: absolute; inset: 18%;
        background: var(${accentDark ? '--text-dark' : '--text-light'});
        -webkit-mask: ${check} center / contain no-repeat;
        mask: ${check} center / contain no-repeat;
        opacity: 0; transform: scale(.4); transition: opacity 140ms, transform 140ms;
      }
    }
    .s-input label:has(input:checked) .s-track { background-color: var(--s-color, var(--accent)); background-image: linear-gradient(180deg, ${lo(.18)}, transparent 60%);
      &::after { opacity: 1; transform: scale(1); } }
    .s-input label:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }
  }

  /* ── Color — swatch strip set into a well ── */
  .s-color.s-picker .s-color-input {
    --color-strip: calc(var(--u) * 4 + var(--pad) * 2);
    position: relative; flex: 1; min-width: 0;
    min-height: var(--h);
    border-radius: var(--ri);
    overflow: hidden;
    ${sunken()}
    &:focus-within { outline: 2px solid var(--focus); outline-offset: 2px; }
    input[type="color"] {
      position: absolute; inset: 0 auto 0 0; z-index: 0;
      width: var(--color-strip); height: 100%; min-height: 100%;
      padding: 0; margin: 0; border: none; border-radius: 0;
      background: none; box-shadow: none; outline: none; cursor: pointer;
      -webkit-appearance: none; appearance: none;
      &:focus-visible { outline: none; }
      &::-webkit-color-swatch-wrapper { padding: 0; height: 100%; }
      &::-webkit-color-swatch { border: none; border-radius: 0; height: 100%; }
      &::-moz-color-swatch { border: none; border-radius: 0; height: 100%; }
    }
    &::after {
      content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none;
      border-radius: inherit;
      box-shadow: var(--lip);
    }
    input[type="text"] {
      position: relative; z-index: 2; display: block;
      width: calc(100% - var(--color-strip)); margin-left: var(--color-strip);
      min-height: var(--h); padding: var(--pad) var(--pad-i);
      border: none; border-radius: 0; background: transparent; background-image: none; box-shadow: none; outline: none;
      &:focus-visible { outline: none; }
    }
  }
  .s-color.s-rgba .s-color-input {
    input[type="color"] { ${raised(knob, 1)} border-radius: var(--ri); overflow: hidden; width: var(--h); height: var(--h);
      &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: var(--ri); box-shadow: inset 0 var(--bevel) 0 ${hi(.4)}, inset 0 calc(var(--bevel) * -1) 0 ${lo(.15)}; } }
    .s-alpha { ${sunken()} height: calc(var(--u) * 2); border-radius: 999px;
      &::-webkit-slider-thumb { ${thumb} width: calc(var(--u) * 3.5); height: calc(var(--u) * 3.5); border-radius: 50%; }
      &::-moz-range-thumb { ${thumb} width: calc(var(--u) * 3.5); height: calc(var(--u) * 3.5); border-radius: 50%; } }
  }
  .s-swatches button {
    ${raised('none', 1)}
    border-radius: var(--ri);
    background-image: linear-gradient(180deg, ${hi(.25)}, transparent 50%, ${lo(.12)});
    transition: filter 120ms;
    &:hover { filter: brightness(1.06); }
    &.s-selected { box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--text); }
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  }

  /* ── Buttons — domed keys ── */
  .s-button button {
    ${key(aL, aC, aH, 'var(--accent)')}
    flex: 1; min-width: 0;
    font-weight: calc(var(--weight) + 100);
    padding: calc(var(--u) * (1 + var(--spacing)) - var(--bevel)) calc(var(--pad) * 2) calc(var(--u) * (1 + var(--spacing)) + var(--bevel));
  }
  .s-button.s-secondary button, .s-button button.s-secondary {
    ${key(sL, sC, sH, 'var(--raised)')}
    flex: 1; min-width: 0;
    padding: calc(var(--u) * (1 + var(--spacing)) - var(--bevel)) calc(var(--pad) * 2) calc(var(--u) * (1 + var(--spacing)) + var(--bevel));
  }

  /* ── Vector ── */
  .s-vector {
    .s-vec-axis { ${sunken()} border-radius: var(--ri); height: var(--h); padding: 0 var(--pad-i); gap: var(--u); min-width: calc(var(--u) * 16);
      &:focus-within { outline: 2px solid var(--focus); outline-offset: 2px; } }
    .s-vec-label { color: var(--text-dim); opacity: 1; text-shadow: none; }
    input[type="number"] { background: transparent; background-image: none; box-shadow: none; height: auto; padding: 0; &:focus-visible { outline: none; } }
  }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: var(--text-dim); opacity: 1; }
  .s-separator { height: var(--bevel); background: var(--lo); opacity: 1; box-shadow: 0 var(--bevel) 0 var(--hi); }
  .s-separator-labeled { height: auto; background: none; box-shadow: none;
    &::before, &::after { height: var(--bevel); background: var(--lo); opacity: 1; box-shadow: 0 var(--bevel) 0 var(--hi); } }
  .s-separator-label { color: var(--text-dim); opacity: 1; }

  /* ── XY pad / knob ── */
  .s-pad { ${sunken()} border-radius: var(--ri);
    .s-pad-x, .s-pad-y { background: var(--lo); }
    .s-pad-dot { ${thumb} width: calc(var(--u) * 3.5); height: calc(var(--u) * 3.5); border-radius: 50%; position: absolute; cursor: inherit; } }
  .s-knob-dial { ${thumb} width: calc(var(--u) * 9); height: calc(var(--u) * 9); border-radius: 50%; cursor: inherit;
    i { background: var(--accent); width: 2px; box-shadow: 0 0 0 1px ${hi(.4)}; } }
  .s-knob-val { color: var(--text-dim); opacity: 1; }

  /* ── Folder — engraved rule ── */
  .s-folder > summary {
    color: var(--text);
    font-weight: calc(var(--weight) + 100);
    border-bottom: var(--bevel) solid var(--lo); box-shadow: 0 var(--bevel) 0 var(--hi);
    opacity: 1;
    &::after {
      background: var(--text-dim);
      -webkit-mask: ${chevron} center / contain no-repeat;
      mask: ${chevron} center / contain no-repeat;
      transition: transform 140ms;
    }
  }
  .s-folder[open] > summary {
    box-shadow: none;
    &::after { transform: rotate(-180deg); }
  }
}`

  return defaultCSS({ size, spacing, font }) + '\n' + overrides
}
