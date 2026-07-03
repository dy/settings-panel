/**
 * Skeu theme — machined instrument panel
 *
 * One material story, one light source. The chassis is warm ivory plastic
 * (shade); its hardware is machined from two metals — brushed aluminum for
 * neutral controls, anodized aluminum (tinted by accent) for anything "on,"
 * selected, or actionable. Sliders ride in cut grooves with a domed fader-cap
 * thumb; the action button is a proud two-stage cap with real press travel;
 * switches are rockers with physical throw; segmented buttons are a bank of
 * keys sunk into a recessed bay. Every surface answers to a single light
 * directly overhead: convex caps run bright-top/dark-bottom edges over a
 * gradient dome and cast a soft shadow onto whatever is beneath them; concave
 * wells run the inverse (dark lip where the rim blocks the light, a faint
 * catch-light at the floor) and cast no shadow — a cut has no underside.
 * States move IN the material, not through color: a pressed button sinks and
 * its shadow collapses, a checked switch's channel lights up and the thumb
 * slides to the lit end, a selected segment latches down instead of just
 * tinting.
 *
 * Axes: shade sets the chassis plastic (hue/lightness/chroma), accent sets
 * the anodizing tint used for lit channels, checked switches, selected
 * segments/swatches, and the primary button. depth scales cast-shadow throw
 * and the gradient span of every cap/well (0 ≈ near-flush placard, 2+ ≈ deep
 * relief); bevel scales the crispness/contrast of the machined edge
 * independent of elevation (0 = worn/soft edge, 2 = knife-cut edge);
 * roundness blends every corner and the thumb shape from square to circular;
 * weight drives font-weight and icon stroke width; spacing is the shared
 * structural padding axis; grid overlays a dot/line/cross texture.
 *
 * skeu(axes?) → CSS string
 */

import defaultCSS from './default.js'
import { parseColor, resolveAccent, lerp, clamp } from './color.js'

const { min, max } = Math

// Grid patterns: dots 2u (secondary), lines 4u (medium), crosses 8u (primary)
const GRID = {
  dots: (c, a, u) => { const s = 2 * u, h = s / 2; return { url: `url("data:image/svg+xml,%3Csvg width='${s}' height='${s}' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${h}' cy='${h}' r='${u * .15}' fill='rgba(${c},${a})'/%3E%3C/svg%3E")`, off: -h } },
  lines: (c, a, u) => { const s = 4 * u; return { url: `url("data:image/svg+xml,%3Csvg width='${s}' height='${s}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h${s}M0 0v${s}' stroke='rgba(${c},${a})' stroke-width='${u * .15}'/%3E%3C/svg%3E")`, off: 0 } },
  crosses: (c, a, u) => { const s = 8 * u, h = s / 2, arm = u; return { url: `url("data:image/svg+xml,%3Csvg width='${s}' height='${s}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M${h} ${h - arm}v${arm * 2}M${h - arm} ${h}h${arm * 2}' stroke='rgba(${c},${a})' stroke-width='${u * .15}'/%3E%3C/svg%3E")`, off: -h } },
}

export default function skeu({
  shade = '#f5f4f2',
  accent,
  grid = [],
  spacing = 1,
  weight = 400,
  depth = 1,
  roundness = 1,
  bevel: bevelOpt = 1
} = {}) {

  const isFunc = typeof shade === 'function'
  const { L: surfaceL, C: surfaceC, H: surfaceH } = isFunc ? { L: 0.97, C: 0.01, H: 60 } : parseColor(shade)
  const dark = surfaceL < .6
  const $ = isFunc ? shade : (L = surfaceL, C = surfaceC, H = surfaceH, alpha) => {
    L = clamp(L, 0, 1)
    const l = +L.toFixed(3), c = +C.toFixed(4), h = +H.toFixed(1)
    return alpha != null
      ? `oklch(${l} ${c} ${h} / ${+clamp(alpha, 0, 1).toFixed(3)})`
      : `oklch(${l} ${c} ${h})`
  }

  // ── Axes → CSS vars (minimal set, everything else derives) ──
  const resolvedAccent = resolveAccent(accent, shade)
  const { L: accentL, C: accentC, H: accentH } = resolvedAccent ? parseColor(resolvedAccent) : { L: dark ? .72 : .58, C: clamp(surfaceC, 0.14, 0.27), H: surfaceH }
  const accentDark = accentL < .6

  // depth → elevation (cast-shadow throw + cap/well gradient span)
  // bevel → edge (rim contrast + width), independent of elevation
  const D = clamp(depth, 0, 3)
  const edge = bevelOpt <= 1 ? lerp(.35, 1, clamp(bevelOpt, 0, 1)) : lerp(1, 1.3, clamp(bevelOpt - 1, 0, 1))
  const bevelPx = +(bevelOpt <= 1 ? lerp(1, 1.5, clamp(bevelOpt, 0, 1)) : lerp(1.5, 2.5, clamp(bevelOpt - 1, 0, 1))).toFixed(2)
  const relief = .4 + D * .6

  // ── One light, from above — every rim color derives from it ──
  const hi = a => $(1, surfaceC * .2, surfaceH, clamp(a * edge, 0, 1))                                   // specular rim — near-white, neutral (reflections don't take the substrate's tint)
  const lo = a => $(.05, min(surfaceC * 1.8, .05), surfaceH, clamp(a * edge, 0, 1))                       // shadow rim — near-black, faint warm tint
  const loA = a => $(max(.04, accentL * .12), min(accentC * 1.3, .14), accentH, clamp(a * edge, 0, 1))    // shadow rim tinted for anodized (accent) hardware
  const shC = a => $(.08, min(surfaceC * 1.4, .045), surfaceH, clamp(a * (.7 + D * .3), 0, 1))            // cast-shadow color (elevation-driven, not edge-driven)

  // Two-layer cast shadow (tight contact + wide ambient) scaled by depth; base = relative elevation
  const cast = (base) => {
    if (!base) return ''
    const e = base * (.4 + D * .8)
    return `0 ${(e * .5).toFixed(2)}px ${(e * 1.1).toFixed(2)}px ${shC(.3)}, 0 ${(e * 1.6).toFixed(2)}px ${(e * 4.2).toFixed(2)}px ${shC(.16)}`
  }
  const panelShadow = `${cast(4.5)}, 0 ${(20 * (.5 + D * .5)).toFixed(0)}px ${(48 * (.5 + D * .5)).toFixed(0)}px ${shC(.14)}`

  // ── Gradients — the "form" shading of every dome/well, always top-lit ──
  const chassisGrad = `linear-gradient(180deg, ${$(min(1, surfaceL + relief * .09), surfaceC, surfaceH)} 0%, ${$(surfaceL, surfaceC, surfaceH)} 42%, ${$(max(0, surfaceL - relief * .07), surfaceC, surfaceH)} 100%)`

  const wellGrad = `linear-gradient(180deg, ${$(max(.03, surfaceL - relief * .22), min(surfaceC * 1.5, .06), surfaceH)} 0%, ${$(max(.05, surfaceL - relief * .14), min(surfaceC * 1.3, .05), surfaceH)} 20%, ${$(max(.07, surfaceL - relief * .06), surfaceC, surfaceH)} 100%)`

  const metalLo = dark ? .34 : .74, metalHi = dark ? .62 : .96
  const metalGrad = `linear-gradient(180deg, ${$(clamp(metalHi + .05, 0, 1), .006, surfaceH)} 0%, ${$(metalHi, .006, surfaceH)} 16%, ${$(lerp(metalHi, metalLo, .5), .006, surfaceH)} 55%, ${$(metalLo, .008, surfaceH)} 90%, ${$(max(0, metalLo - .05), .01, surfaceH)} 100%)`

  const accHi = accentDark ? min(1, accentL + .3) : min(1, accentL + .22)
  const accLo = accentDark ? max(0, accentL - .16) : max(0, accentL - .18)
  const accentGrad = `linear-gradient(180deg, ${$(clamp(accHi + .04, 0, 1), accentC * .85, accentH)} 0%, ${$(accHi, accentC, accentH)} 16%, ${$(lerp(accHi, accLo, .5), min(accentC * 1.08, .3), accentH)} 55%, ${$(accLo, min(accentC * 1.15, .32), accentH)} 90%, ${$(max(0, accLo - .05), accentC, accentH)} 100%)`

  const wellGradAccent = `linear-gradient(180deg, ${$(max(.06, accentL - relief * .14), min(accentC * 1.2, .14), accentH)} 0%, ${$(max(.1, accentL - relief * .06), min(accentC * 1.1, .13), accentH)} 30%, ${$(min(1, accentL + relief * .1), accentC, accentH)} 100%)`

  // Fine plastic grain — chassis only (controls stay smooth-metal by contrast).
  // Alpha is derived from the turbulence's own RGB (not its own noisy alpha channel,
  // which would average out to a near-flat tint instead of visible grain).
  const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch' result='t'/%3E%3CfeColorMatrix in='t' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.035 0.035 0.035 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

  // Grid layers (combinable background-image stack, unchanged mechanism)
  const gridList = Array.isArray(grid) ? grid : (grid && grid !== 'none' ? [grid] : [])
  const gc = dark ? '255,255,255' : '0,0,0', ga = dark ? '.05' : '.06'
  const gridLayers = gridList.map(g => GRID[g]?.(gc, ga, 4)).filter(Boolean)
  const bgImgs = [grain, ...gridLayers.map(l => l.url), chassisGrad]
  const bgBlends = ['multiply', ...gridLayers.map(() => 'normal'), 'normal']
  const bgPos = ['0 0', ...gridLayers.map(l => `${l.off}px ${l.off}px`), '0 0']

  const stroke = max(1, weight / 400)
  const chevron = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='${stroke}' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const check = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2.5,6 5,9 9.5,3' fill='none' stroke='%23000' stroke-width='${max(1.5, stroke * 1.5)}' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  // Chevron pre-baked as a contrasting stroke (for compositing directly over a metal dome, where
  // mask+background would clip away the dome instead of drawing a mark on top of it)
  const chevronOnMetal = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='${dark ? 'white' : 'black'}' stroke-opacity='.55' stroke-width='${stroke}' stroke-linejoin='round'/%3E%3C/svg%3E")`

  // ── Surface mixins ──────────────────────────────────────────────────────
  // cap(grad, elevBase) — convex hardware: gradient dome + directional bevel ring + cast shadow
  const cap = (grad, elevBase = 0) => `
    border: none;
    background-color: var(--bg);
    background-image: ${grad};
    outline: ${bevelPx}px solid ${lo(.3)};
    outline-offset: -${bevelPx}px;
    box-shadow: inset 0 ${bevelPx}px 0 0 ${hi(.85)}, inset 0 -${bevelPx}px 0 0 ${lo(.5)}${elevBase ? ', ' + cast(elevBase) : ''};`

  // well(grad) — concave cut: inverse gradient + inverse bevel, no cast (a hole has no underside)
  const well = (grad = wellGrad, ringA = .38) => `
    border: none;
    background-color: var(--bg);
    background-image: ${grad};
    outline: ${bevelPx}px solid ${lo(ringA)};
    outline-offset: -${bevelPx}px;
    box-shadow: inset 0 ${(bevelPx * 2.2).toFixed(2)}px ${(bevelPx * 3).toFixed(2)}px -${(bevelPx * .35).toFixed(2)}px ${lo(.68)}, inset 0 -${bevelPx}px 0 0 ${hi(.32)};`

  const textFor = L => L < .6 ? 'var(--text-dark)' : 'var(--text-light)'

  // btn(grad, L, elevBase) — pressable hardware: cap() + real press travel + latch (selected) state
  const btn = (grad, L, elevBase = 1.6) => `
    ${cap(grad, elevBase)}
    border-radius: var(--ri);
    color: ${textFor(L)};
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: 1;
    text-shadow: none;
    padding-block: calc(var(--pad) - ${(bevelPx * .4).toFixed(2)}px) calc(var(--pad) + ${(bevelPx * .6).toFixed(2)}px);
    padding-inline: calc(var(--pad) * 2);
    transform: translateY(0);
    filter: brightness(1);
    transition: transform 110ms ease-out, box-shadow 110ms ease-out, filter 140ms, color 140ms, outline-color 140ms;
    &:hover { filter: brightness(1.07); }
    &:active {
      transform: translateY(${(bevelPx * 1.15).toFixed(2)}px);
      filter: brightness(.96);
      outline-color: ${lo(.42)};
      box-shadow: inset 0 ${(bevelPx * 1.7).toFixed(2)}px ${(bevelPx * 2.3).toFixed(2)}px -${(bevelPx * .6).toFixed(2)}px ${lo(.5)}, inset 0 -${bevelPx}px 0 0 ${hi(.28)};
    }
    &:disabled { opacity: .4; cursor: not-allowed; transform: none; filter: none; }
    &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: var(--ri); z-index: 1; }
    &.s-selected, &[aria-pressed="true"] {
      background-image: ${accentGrad};
      background-color: var(--accent);
      outline-color: ${loA(.4)};
      box-shadow: inset 0 ${(bevelPx * 1.7).toFixed(2)}px ${(bevelPx * 2.3).toFixed(2)}px -${(bevelPx * .6).toFixed(2)}px ${loA(.5)}, inset 0 -${bevelPx}px 0 0 ${hi(.32)};
      color: ${textFor(accentL)};
      transform: translateY(${(bevelPx * .6).toFixed(2)}px);
      text-shadow: none;
    }`

  // Thumb: equal-area square (→ same area as the circle) ↔ circle (THUMB_CIRCLE dia) as roundness 0→1
  const THUMB_CIRCLE = 5
  const THUMB_SQUARE = (THUMB_CIRCLE / 2) * Math.sqrt(Math.PI)
  const thumbT = clamp(roundness, 0, 1)
  const thumbU = roundness >= 1 ? THUMB_CIRCLE : lerp(THUMB_SQUARE, THUMB_CIRCLE, thumbT)
  const thumbR = roundness <= 0 ? '0'
    : roundness >= 1 ? '999px'
    : `calc(var(--u) * ${+(thumbU * thumbT / 2).toFixed(4)})`

  // Dimensional fader cap: metal dome + a single machined grip-slot across the middle
  const thumbFace = (elevBase = 1) => `
    width: var(--thumb); height: var(--thumb);
    border: none;
    border-radius: ${thumbR};
    background-color: var(--bg);
    background-image:
      linear-gradient(to bottom, transparent calc(50% - ${bevelPx}px), ${lo(.32)} calc(50% - ${bevelPx}px), ${lo(.32)} calc(50% + ${(bevelPx * .4).toFixed(2)}px), transparent calc(50% + ${(bevelPx * .4).toFixed(2)}px)),
      ${metalGrad};
    outline: ${bevelPx}px solid ${lo(.32)};
    outline-offset: -${bevelPx}px;
    box-shadow: inset 0 ${bevelPx}px 0 0 ${hi(.85)}, inset 0 -${bevelPx}px 0 0 ${lo(.5)}, ${cast(elevBase)};
    cursor: grab; z-index: 1; position: relative;
    transition: filter 120ms, transform 80ms;
    &:hover { filter: brightness(1.08); }
    &:active { filter: brightness(.95); cursor: grabbing; transform: scale(.97); }`

  // ── Base layer (structural + default visuals) ──
  // ── Skeu visual overrides (cascade wins: same specificity, later declaration; unlayered beats @layer) ──
  const overrides = `.s-panel {
  --bg: ${$(surfaceL)};
  --accent: color-mix(in oklab, var(--bg), ${$(accentL, accentC, accentH)} 88%);
  --spacing: ${spacing};
  --roundness: ${roundness};
  --weight: ${weight};
  color-scheme: ${dark ? 'dark' : 'light'};
  --sunken: ${$(max(0.16, surfaceL - lerp(.027, 0.04, edge)), surfaceC * 1.08, surfaceH)};
  --raised: ${$(min(1, surfaceL + lerp(0.054, 0.108, edge)), surfaceC, surfaceH)};
  --focus: ${$(accentL, accentC, accentH, 0.35)};
  --bevel: ${bevelPx}px;
  --r: calc(var(--u) * var(--roundness) * 3);
  --ri: calc(var(--u) * max(var(--roundness), -1.5 + var(--roundness) * 3));
  --thumb: calc(var(--u) * ${thumbU});
  --text-light: ${$(lerp(.3, .1, edge))};
  --text-dark: ${$(max(surfaceL, accentL, lerp(.9, 1, edge)))};
  --text: ${dark ? 'var(--text-dark)' : 'var(--text-light)'};
  --text-dim: ${$(dark ? max(surfaceL + .25, lerp(.5, .66, edge)) : min(surfaceL - .25, lerp(.56, .4, edge)))};
  --text-accent: color-mix(in oklab, var(--text-dark), ${$(accentDark ? lerp(.9, 1, edge) : lerp(.3, .1, edge), accentC * 0.25, accentH)} 85%);

  color: var(--text);
  border: none;
  background-color: var(--bg);
  background-image: ${bgImgs.join(', ')};
  background-blend-mode: ${bgBlends.join(', ')};
  background-position: ${bgPos.join(', ')};
  outline: ${bevelPx}px solid ${lo(.32)};
  outline-offset: -${bevelPx}px;
  box-shadow: inset 0 ${bevelPx}px 0 0 ${hi(.7)}, inset 0 -${bevelPx}px 0 0 ${lo(.35)}, ${panelShadow};
  text-shadow: 0 ${dark ? '-1px' : '1px'} 0 var(${dark ? '--sunken' : '--raised'});
  position: relative;
  isolation: isolate;

  &, *, *::before, *::after { background-origin: border-box; }

  .s-label { color: var(--text); font-weight: calc(var(--weight) + 100); }
  .s-hint { color: var(--text-dim); opacity: 1; }

  /* ── Input base (sunken well) ── */
  input[type="text"], input[type="number"], textarea, select {
    ${well()}
    border-radius: var(--ri);
    color: var(--text);
    transition: outline-color 140ms;
    &::placeholder { color: var(--text-dim); opacity: .6; }
    &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: var(--ri); }
  }
  select {
    padding-top: 0;
    padding-bottom: 0;
  }

  /* ── Boolean (custom toggle) ── */
  .s-boolean {
    label { display: flex; cursor: pointer; }
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-track {
      ${well()}
      border-radius: 999px;
      position: relative; cursor: pointer;
      transition: background-image 180ms, outline-color 180ms, box-shadow 180ms;
      &::after {
        content: '';
        ${thumbFace(.75)}
        transition: transform 180ms cubic-bezier(.2, .7, .3, 1.05), filter 120ms;
        transform: translateX(0);
      }
    }
    &:has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: var(--ri); }
    &:has(input:checked) .s-track {
      background-image: ${wellGradAccent};
      outline-color: ${loA(.4)};
      box-shadow: inset 0 ${(bevelPx * 1.8).toFixed(2)}px ${(bevelPx * 2.6).toFixed(2)}px -${(bevelPx * .5).toFixed(2)}px ${loA(.5)}, inset 0 -${bevelPx}px 0 0 ${hi(.3)}, 0 0 ${(6 * relief).toFixed(1)}px ${$(accentL, accentC, accentH, .3)};
    }
    &.s-switch {
      .s-track {
        width: calc(var(--u) * (9 + var(--spacing) * 2));
        height: calc(var(--u) * 5);
        &::after {
          position: absolute;
          inset: 0;
          margin: auto calc(var(--bevel) * 2 + 1px);
          transform: translateX(0);
        }
      }
    }
    &.s-switch:has(input:checked) .s-track::after {
      transform: translateX(calc(var(--u) * (9 + var(--spacing) * 2) - var(--thumb) - var(--bevel) * 4 - 2px));
    }
    &.s-toggle {
      .s-track {
        border-radius: var(--ri);
        width: auto; height: auto;
        margin: 0;
        &::after {
          content: 'Off';
          position: static; display: flex; align-items: center; justify-content: center;
          width: auto; height: auto;
          background: none; background-image: none;
          border-radius: 0; outline: none; box-shadow: none;
          font-size: smaller;
          color: var(--text-dim);
        }
      }
      &:has(input:checked) .s-track {
        ${cap(accentGrad, 1)}
        border-radius: var(--ri);
        color: ${textFor(accentL)};
        &::after { content: 'On'; color: inherit; }
      }
    }
    &.s-checkbox {
      .s-track {
        display: grid; place-items: center;
        border-radius: calc(var(--ri) * .7);
        width: calc(var(--u) * 5); height: calc(var(--u) * 5);
        margin: calc(var(--pad) / 2) 0;
        &::after {
          content: ''; position: absolute; inset: 15%;
          background: ${textFor(accentL)};
          background-image: none;
          -webkit-mask: ${check} center / contain no-repeat;
          mask: ${check} center / contain no-repeat;
          border-radius: 0; outline: none; box-shadow: none;
          opacity: 0; transform: scale(.4); transition: opacity 140ms, transform 140ms;
        }
      }
      &:has(input:checked) .s-track::after { opacity: 1; transform: scale(1); }
    }
  }

  /* ── Number ── */
  input[type="number"] { font-variant-numeric: tabular-nums; }
  .s-number input[type="number"] {
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
  }

  /* ── Step buttons ── */
  .s-step {
    ${btn(metalGrad, surfaceL, .5)}
    border-radius: calc(var(--ri) * .6);
  }

  /* ── Slider (custom appearance — a machined groove with a dimensional cap) ── */
  .s-slider {
    input[type="range"] {
      ${well()}
      --fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--p, 0%) / 100%);
      background-image:
        linear-gradient(to right, ${$(accentL, accentC, accentH)} var(--fill), transparent var(--fill)),
        ${wellGrad};
      background-blend-mode: normal, soft-light;
      border: none; border-radius: var(--ri);
      height: calc(var(--u) * 2.5);
      overflow: visible;
      appearance: none;
      -webkit-appearance: none;
      &::-webkit-slider-thumb { -webkit-appearance: none; ${thumbFace(1)} }
      &::-moz-range-thumb { ${thumbFace(1)} }
      &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: var(--ri); }
      &::-webkit-slider-container { appearance: none; }
    }
    datalist { display: none; }
    .s-marks, .s-mark-labels {
      left: calc(var(--thumb) / 2); right: calc(var(--thumb) / 2);
    }
    .s-marks { display: flex; }
    .s-mark {
      position: absolute;
      width: 2px;
      height: 40%; top: 50%;
      background: ${lo(.45)};
      box-shadow: 1px 0 0 ${hi(.35)};
      transform: translate(-50%, -50%);
      &.s-active { background: ${$(accentL, accentC, accentH)}; box-shadow: none; }
    }
    .s-mark-label {
      color: var(--text-dim); opacity: 1;
      &.s-active { color: var(--text-accent); }
    }
    .s-readout { color: var(--text-dim); opacity: 1; font-size: smaller; font-variant-numeric: tabular-nums; }
    input[type="text"].s-readout { padding: var(--pad); }
    .s-tooltip {
      color: ${$(dark ? .12 : .95)};
      background-color: ${$(dark ? .32 : .2, min(surfaceC * 1.6, .05), surfaceH)};
      padding: 3px 7px;
      border-radius: calc(var(--ri) * .6);
      box-shadow: ${cast(.7)}, inset 0 1px 0 ${hi(.15)};
    }
    &.s-multiple .s-interval-track {
      height: calc(var(--u) * 5);
      background: none;
      input[type="range"] {
        --low-fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--low, 0%) / 100%);
        --high-fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--high, 100%) / 100%);
        background-image:
          linear-gradient(to right, transparent var(--low-fill), ${$(accentL, accentC, accentH)} var(--low-fill), ${$(accentL, accentC, accentH)} var(--high-fill), transparent var(--high-fill)),
          ${wellGrad};
        background-blend-mode: normal, soft-light;
        background-color: transparent;
        height: calc(var(--u) * 2.5);
        &::-webkit-slider-thumb { -webkit-appearance: none; ${thumbFace(1)} }
        &::-moz-range-thumb { ${thumbFace(1)} }
      }
    }
  }

  /* ── Select (custom arrow) ── */
  .s-select select { appearance: none; }
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

  .s-select.s-segmented {
    .s-input {
      ${well(wellGrad, .35)}
      gap: ${bevelPx}px;
      padding: ${bevelPx}px;
      border-radius: var(--ri);
    }
    button {
      ${btn(metalGrad, surfaceL, .55)}
      flex: 1;
      font-weight: inherit;
      font-size: smaller;
      margin-left: 0;
      border-radius: calc(var(--ri) * .6);
      padding: calc(var(--pad) * .7 - var(--bevel) * .4) var(--pad) calc(var(--pad) * .7 + var(--bevel) * .6);
    }
  }
  .s-select.s-radio {
    label { color: var(--text-dim); opacity: 1; &.s-selected { color: var(--text); opacity: 1; } }
  }

  /* ── Color ── */
  .s-color.s-picker .s-color-input {
    --color-strip: calc(var(--u) * 4 + var(--pad) * 2);
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: calc(1lh + var(--pad) * 2);
    border-radius: var(--ri);
    overflow: hidden;
    background-color: var(--sunken);
    &:focus-within { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: var(--ri); }
    input[type="color"] {
      position: absolute;
      inset: 0 auto 0 0;
      z-index: 0;
      width: var(--color-strip);
      height: 100%;
      min-height: 100%;
      padding: 0;
      margin: 0;
      border: none;
      border-radius: 0;
      background: none;
      box-shadow: none;
      outline: none;
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
      &:focus-visible { outline: none; }
      &::-webkit-color-swatch-wrapper { padding: 0; height: 100%; }
      &::-webkit-color-swatch { border: none; border-radius: 0; height: 100%; }
      &::-moz-color-swatch { border: none; border-radius: 0; height: 100%; }
    }
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      border-radius: inherit;
      outline: ${bevelPx}px solid ${lo(.35)};
      outline-offset: -${bevelPx}px;
      box-shadow: inset 0 ${(bevelPx * 1.8).toFixed(2)}px ${(bevelPx * 2.4).toFixed(2)}px -${(bevelPx * .5).toFixed(2)}px ${lo(.5)}, inset 0 -${bevelPx}px 0 0 ${hi(.3)};
    }
    input[type="text"] {
      position: relative;
      z-index: 2;
      display: block;
      width: calc(100% - var(--color-strip));
      margin-left: var(--color-strip);
      min-height: calc(1lh + var(--pad) * 2);
      padding: var(--pad) var(--pad-i);
      border: none;
      border-radius: 0;
      background: transparent;
      background-image: none;
      box-shadow: none;
      outline: none;
      &:focus-visible { outline: none; }
    }
  }
  .s-swatches button {
    ${btn(metalGrad, surfaceL, .5)}
    padding: 0;
    border-radius: calc(var(--ri) * .7);
    &.s-selected { box-shadow: inset 0 0 0 2px ${$(1)}, 0 0 0 1px ${lo(.4)}, ${cast(.35)}; transform: translateY(${(bevelPx * .5).toFixed(2)}px); }
  }

  /* ── Button (action) ── */
  .s-button button {
    ${btn(accentGrad, accentL, 1.9)}
    width: 100%;
    padding: calc(var(--u) * (1 + var(--spacing)) - var(--bevel) * .4) calc(var(--pad) * 2) calc(var(--u) * (1 + var(--spacing)) + var(--bevel) * .6);
  }
  .s-button.s-secondary button, .s-button button.s-secondary {
    ${btn(metalGrad, surfaceL, 1.4)}
  }

  /* ── Panel title ── */
  > summary, > .s-panel-title {
    color: var(--text);
    font-size: 1.125em;
    font-weight: calc(var(--weight) + 200);
  }
  > summary::after {
    content: '';
    width: calc(var(--u) * 6); height: calc(var(--u) * 6);
    margin-left: auto; flex-shrink: 0;
    border-radius: 50%;
    background-color: ${$(lerp(metalLo, metalHi, .45), .006, surfaceH)};
    background-image: ${chevronOnMetal}, ${metalGrad};
    background-repeat: no-repeat, no-repeat;
    background-position: center, center;
    background-size: 42%, cover;
    outline: ${bevelPx}px solid ${lo(.3)};
    outline-offset: -${bevelPx}px;
    box-shadow: inset 0 ${bevelPx}px 0 0 ${hi(.8)}, inset 0 -${bevelPx}px 0 0 ${lo(.45)}, ${cast(.6)};
    transition: transform 160ms, filter 120ms;
  }
  > summary:hover::after { filter: brightness(1.08); }
  &[open] > summary::after { transform: rotate(-180deg); }

  /* ── Folder ── */
  .s-folder > summary {
    color: var(--text);
    font-weight: calc(var(--weight) + 100);
    border-bottom: var(--bevel) solid ${lo(.32)}; box-shadow: 0 var(--bevel) 0 0 ${hi(.55)};
    opacity: 1;
    &::after {
      content: '';
      width: calc(var(--u) * 4); height: calc(var(--u) * 4);
      margin-left: auto; flex-shrink: 0;
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

  return defaultCSS() + '\n' + overrides
}
