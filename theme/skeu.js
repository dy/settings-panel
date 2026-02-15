/**
 * Skeu theme — monotone, diffuse, tactile
 *
 * Layers on top of base theme (CSS cascade override).
 * skeu(axes?) → CSS string
 */

import base, { parseColor, lerp, clamp } from './default.js'

const { min, max, round, ceil } = Math

const TEX = {
  flat: 'none',
  dots: (c, a) => `url("data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='6' cy='6' r='.6' fill='rgba(${c},${a})'/%3E%3C/svg%3E")`,
  crosses: (c, a) => `url("data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 4v8M4 8h8' stroke='rgba(${c},${a})' stroke-width='.6'/%3E%3C/svg%3E")`,
}

export default function skeu({
  shade = '#f5f4f2',
  accent,
  contrast = .5,
  texture = 'flat',
  spacing = 1,
  size = 1,
  weight = 400,
  depth = .4,
  roundness = 0.5,
  relief = 0,
  unit = 4,
} = {}) {

  const isFunc = typeof shade === 'function'
  const { L: surfaceL, C: surfaceC, H: surfaceH } = isFunc ? { L: 0.97, C: 0.01, H: 60 } : parseColor(shade)
  const dark = surfaceL < .6
  const $ = isFunc ? shade : (L = surfaceL, C = surfaceC, H = surfaceH, alpha) => {
    L = clamp(L, 0, 1)
    const l = +L.toFixed(3), c = +C.toFixed(4), h = +H.toFixed(1)
    return alpha != null
      ? `oklch(${l} ${c} ${h} / ${+alpha.toFixed(3)})`
      : `oklch(${l} ${c} ${h})`
  }

  // ── Axes → CSS vars (minimal set, everything else derives) ──
  const { L: accentL, C: accentC, H: accentH } = accent ? parseColor(accent) : { L: dark ? .72 : .58, C: min(surfaceC, 0.27), H: surfaceH }
  const accentDark = accentL < .6

  const u = unit

  // Shadow helper (depth-dependent)
  const sh = (y, bl, a) => `0 ${y}px ${bl}px ${$(0.108, surfaceC + 0.1, surfaceH, a)}`

  // Texture (data URI, must stay JS)
  const texFn = TEX[texture]
  const tex = !texFn || texFn === 'none' ? 'none'
    : texFn(dark ? '255,255,255' : '0,0,0', dark ? '.04' : '.05')

  // Grid-aligned text metrics
  const fontSize = lerp(10, 14, size)
  const lh = 4 * u
  const inputH = lh + 2 * u * (.75 + .75 * spacing)

  // Roundness: 0–1 normalized → px, max depends on spacing
  const maxR = round(14 + 12 * spacing)
  const r = round(roundness * maxR)

  const thumbSize = r ? 4 * u : (4 / 1.128) * u
  const thumbR = r ? thumbSize / 2 : 0

  const w = clamp((weight + 100) / 400, 1, 4)

  // ── CSS variable block ──
  // Bevel: --bh (high) + --bl (low) — inputs use bh outside/bl inside (concave),
  // buttons swap them: bl outside/bh inside (convex).
  const vars = {
    '--bg': $(surfaceL),
    '--input': $(surfaceL - 0.054 - lerp(.027, 0.064, contrast), surfaceC * 1.08, surfaceH, 0.25),
    '--accent': `color-mix(in oklab, var(--bg), ${$(accentL, accentC, accentH)} 85%)`,
    '--focus': $(accentL, accentC, accentH, 0.35),
    '--bh': $(1, min(surfaceC * 1.08, 1 - surfaceL), surfaceH, clamp(contrast * lerp(.1, .2, surfaceL), 0, 1)),
    '--bl': $(min(0.108, surfaceL), min(surfaceC * 4, 0.27, surfaceL / 2), surfaceH, clamp(contrast * lerp(.5, .1, surfaceL), 0, 1)),
    '--convex': relief ? `linear-gradient(${$(1, surfaceC, surfaceH, 0.2 * relief)}, transparent 50%, transparent 51%, ${$(0.108, surfaceC, surfaceH, 0.1 * relief)})` : 'none',
    '--concave': relief ? `linear-gradient(${$(0.108, surfaceC, surfaceH, 0.1 * relief)}, transparent 50%, transparent 51%, ${$(1, surfaceC, surfaceH, 0.2 * relief)})` : 'none',
    '--text-light': $(lerp(.32, .12, contrast)),
    '--text-dark': $(max(surfaceL, accentL, lerp(.78, .97, contrast))),
    '--text': dark ? 'var(--text-dark)' : 'var(--text-light)',
    '--text-dim': $(dark ? max(surfaceL + .25, lerp(.48, .65, contrast)) : min(surfaceL - .25, lerp(.58, .42, contrast))),
    '--text-accent': `color-mix(in oklab, var(--text-dark), ${$(accentDark ? lerp(.9, 1, contrast) : lerp(.32, .12, contrast), accentC * 0.5, accentH)} 85%)`,
    '--w': `${w}px`,
    '--fw': round(weight),
    '--u': `${u}px`,
    '--sp': spacing,
    '--r': `${r}px`,
    '--ri': `${r / 2 > inputH / 4 ? inputH / 2 : r / 2}px`,
    '--rb': r / 2 > inputH / 4 ? '999px' : `var(--ri)`,
    '--thumb': `${thumbSize}px`,
  }

  const varBlock = Object.entries(vars).map(([k, v]) => `${k}: ${v};`).join('\n  ')

  // ── Surface mixin ──
  // raise(d, bg) — d<0 sunken, d>0 raised, 0 flat
  const raise = (d, bg = d < 0 ? 'var(--input)' : 'var(--bg)') => {
    const abs = Math.abs(d)
    const relf = d < 0 ? 'var(--concave)' : d > 0 ? 'var(--convex)' : 'none'
    return `background-color: ${bg};
    background-image: ${relf};
    background-blend-mode: overlay, normal;
    outline: var(--w) solid ${d < 0 ? 'var(--bh)' : 'var(--bl)'};
    ${d < 0 ?
        `box-shadow: inset 0 0 0 var(--w) var(--bl), inset 0 var(--w) var(--bl), 0 var(--w) 0 0 var(--bh);`
        :
        `box-shadow: inset 0 var(--w) var(--bh), inset 0 0 0 var(--w) var(--bh), 0 var(--w) 0 0 var(--bl), ${sh(lerp(0, 2, abs), lerp(1, 6, abs), lerp(.05, .3, abs))};`
      }`
  }

  // Button base fragment
  const btn = () => `
    --bh: ${$(1, min(accentC * 1.08, 1 - accentL), accentH, clamp(contrast * lerp(.1, .2, accentL), 0, 1))};
    ${raise(1)}
    outline: none;
    border: none;
    border-radius: var(--rb);
    color: var(--text-accent); cursor: pointer;
    font: inherit;
    font-weight: bolder;
    text-shadow: 0 calc(${accentDark ? -1 : 1} * min(1.5px, var(--w))) 0 var(${accentDark ? `--bl` : `--bh`});
    transition: background 140ms, color 140ms, box-shadow 140ms, filter 140ms;
    &:hover {  }
    &:disabled { opacity: .35; cursor: not-allowed; }
    &.selected, &[aria-pressed="true"] { background-color: var(--accent); }`

  // Thumb fragment (shared between webkit/moz)
  const thumb = `
      width: var(--thumb); height: var(--thumb);
      ${raise(1)}
      background-color: var(--text-dark);
      border: none; border-radius: ${thumbR}px;
      cursor: grab; z-index: 1; position: relative;`

  // ── Base layer (structural + default visuals) ──
  const baseCSS = base({ shade, spacing, size, weight, accent, roundness })

  // ── Skeu visual overrides (cascade wins: same specificity, later declaration) ──
  const overrides = `.s-panel {
  ${varBlock}
  color: var(--text);
  ${raise(depth)}
  background-image: ${relief ? `var(--convex), ` : ''}${tex};
  font: var(--fw) ${fontSize}px system-ui, -apple-system, sans-serif;
  line-height: ${lh}px;
  text-shadow: 0 calc(${dark ? -1 : 1} * min(1.5px, var(--w))) 0 var(${dark ? `--bl` : `--bh`});
  position: relative;
  isolation: isolate;

  &, *, *::before, *::after { background-origin: border-box; }

  .s-label { color: var(--text); }
  .s-hint { color: var(--text-dim); opacity: 1; }

  /* ── Input base ── */
  input[type="text"], input[type="number"], textarea, select {
    ${raise(-depth)}
    border: none; border-radius: var(--ri);
    color: var(--text);
    height: auto;
    padding: calc(var(--u) * (0.75 + 0.75 * var(--sp))) calc(var(--u) * (1 + 1 * var(--sp)));
    transition: border-color 140ms, box-shadow 140ms;
    &::placeholder { color: var(--text-dim); opacity: .6; }
    &:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--focus); }
  }
  button:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--focus); }

  /* ── Boolean (custom toggle) ── */
  .s-boolean {
    input[type="checkbox"] { position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0; }
    .s-track {
      width: calc(var(--u) * 10); height: calc(var(--u) * 5);
      ${raise(-depth)}
      border: none; border-radius: 999px;
      position: relative; cursor: pointer;
      transition: background 140ms;
      &::after {
        content: ''; position: absolute;
        width: calc(var(--u) * 4); height: calc(var(--u) * 4);
        ${raise(depth)}
        border: none; border-radius: 50%;
        top: calc(var(--u) * .5); left: calc(var(--u) * .5);
        transition: transform 140ms;
      }
    }
    &:has(input:checked) .s-track {
      background-color: var(--accent);
      &::after { transform: translateX(calc(var(--u) * 5)); box-shadow: 0 0 0 2px var(--bh); }
    }
  }

  /* ── Number ── */
  .s-number input[type="number"] {
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
  }

  /* ── Step buttons ── */
  .s-step {
    ${btn()}
    color: var(--text);
    border-radius: var(--rb);
    background: none; ${raise(1)}
    &:hover:not(:disabled) { background-color: var(--accent); }
  }

  /* ── Slider (custom appearance) ── */
  .s-slider {
    input[type="range"] {
      height: 0.6em;
      ${raise(-depth)}
      --fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--p, 0) / 100);
      background-image: var(--concave), var(--track, linear-gradient(to right, var(--accent) var(--fill), var(--input) var(--fill)));
      border: none; border-radius: var(--ri);
      -webkit-appearance: none;
      &::-webkit-slider-thumb { -webkit-appearance: none; ${thumb} }
      &::-moz-range-thumb { ${thumb} }
      &::-webkit-slider-container { appearance: none; }
    }
    datalist { display: none; }
    .s-marks, .s-mark-labels {
      left: calc(var(--thumb) / 2); right: calc(var(--thumb) / 2);
    }
    .s-marks { display: flex; }
    .s-mark {
      position: absolute; width: ${ceil(w * 2) / 2}px; height: 100%; top: 50%;
      background: linear-gradient(var(--bh), var(--bh)) var(--bg);
      transform: translate(-50%, -50%);
      &.active { background: linear-gradient(var(--bh), var(--bh)) var(--bg); }
    }
    .s-mark-label {
      color: var(--text-dim); opacity: 1;
      &.active { color: var(--accent); }
    }
    .s-value { color: var(--text-dim); opacity: 1; }
  }

  /* ── Select (custom arrow) ── */
  .s-select select {
    appearance: none;
    background-image: var(--concave), linear-gradient(45deg, transparent 50%, var(--text-dim) 50%), linear-gradient(135deg, var(--text-dim) 50%, transparent 50%);
    background-position: 0 0, calc(100% - 14px) 50%, calc(100% - 10px) 50%;
    background-size: 100% 100%, 4px 4px, 4px 4px;
    background-repeat: no-repeat;
    padding-right: 26px;
  }
  .s-buttons {
    button {
      ${btn()}
      padding: var(--u) calc(var(--u) * 2.5);
      border-radius: 999px;
    }
  }
  .s-radio {
    label { color: var(--text-dim); opacity: 1; &.selected { color: var(--text); opacity: 1; } }
  }

  /* ── Color ── */
  .s-color-input {
    input[type="color"] { background: transparent; }
    input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
    input[type="color"]::-webkit-color-swatch { border: var(--w) solid var(--bh); border-radius: var(--ri); }
  }
  .s-swatches button {
    ${btn()}
    box-shadow: inset 0 0 0 var(--w) var(--bl);
    border-radius: var(--r);
    &.selected { border: 1px solid var(--text); box-shadow: 0 0 0 2px var(--bg); }
  }

  /* ── Button (action) ── */
  .s-button button {
    ${btn()}
    background-color: var(--accent);
    color: var(--text-accent);
    border-radius: var(--r);
    &:hover { filter: brightness(1.1); }
    &:active { filter: brightness(.95); }
  }
  .s-button.secondary button {
    background-color: ${$(min(surfaceL, 1))};
    border: var(--w) solid var(--bh);
    color: var(--text);
    &:hover { color: var(--accent); filter: none; }
  }

  /* ── Folder ── */
  .s-folder > summary {
    color: var(--text);
    border-bottom: var(--w) solid var(--bl); box-shadow: 0 var(--w) 0 0 var(--bh);
    opacity: 1;
    &::after {
      border-right: var(--w) solid var(--text-dim); border-bottom: var(--w) solid var(--text-dim);
    }
  }
  .s-folder[open] > summary { box-shadow: none; }
}`

  return baseCSS + '\n' + overrides
}
