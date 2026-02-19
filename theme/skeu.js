/**
 * Skeu theme — monotone, diffuse, tactile
 *
 * Layers on top of base theme (CSS cascade override).
 * skeu(axes?) → CSS string
 */

import base, { parseColor, resolveAccent, lerp, clamp } from './default.js'

const { min, max, round, ceil } = Math

// Grid patterns: dots 2u (secondary), lines 4u (medium), crosses 8u (primary)
const GRID = {
  dots: (c, a, u) => { const s = 2 * u, h = s / 2; return { url: `url("data:image/svg+xml,%3Csvg width='${s}' height='${s}' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${h}' cy='${h}' r='${u * .15}' fill='rgba(${c},${a})'/%3E%3C/svg%3E")`, off: -h } },
  lines: (c, a, u) => { const s = 4 * u; return { url: `url("data:image/svg+xml,%3Csvg width='${s}' height='${s}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h${s}M0 0v${s}' stroke='rgba(${c},${a})' stroke-width='${u * .15}'/%3E%3C/svg%3E")`, off: 0 } },
  crosses: (c, a, u) => { const s = 8 * u, h = s / 2, arm = u; return { url: `url("data:image/svg+xml,%3Csvg width='${s}' height='${s}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M${h} ${h - arm}v${arm * 2}M${h - arm} ${h}h${arm * 2}' stroke='rgba(${c},${a})' stroke-width='${u * .15}'/%3E%3C/svg%3E")`, off: -h } },
}

export default function skeu({
  shade = '#f5f4f2',
  accent,
  contrast = .5,
  grid = [],
  spacing = 1,
  size = 0.5,
  weight = 400,
  depth = .4,
  roundness = 0.5,
  relief = 0,
  unit,
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
  const resolvedAccent = resolveAccent(accent, shade)
  const { L: accentL, C: accentC, H: accentH } = resolvedAccent ? parseColor(resolvedAccent) : { L: dark ? .72 : .58, C: min(surfaceC, 0.27), H: surfaceH }
  const accentDark = accentL < .6

  const u = Number.isFinite(unit) ? unit : lerp(3, 5, clamp(size, 0, 1))

  // Layered shadow — exponential y/blur, negative spread
  const sc = $(0.108, min(surfaceC + 0.1, 0.27), surfaceH, dark ? .07 : .05)
  const shadow = (d) => !d ? '' : ', ' + [1, 2, 4, 8, 16].map(s => {
    const v = +(s * d * (1 + d)).toFixed(1)
    return `0 ${v}px ${v}px ${+(-v / 3).toFixed(1)}px ${sc}`
  }).join(', ')

  // Grid layers (combinable background-image stack)
  const gridList = Array.isArray(grid) ? grid : (grid && grid !== 'none' ? [grid] : [])
  const gc = dark ? '255,255,255' : '0,0,0', ga = dark ? '.04' : '.05'
  const gridLayers = gridList.map(g => GRID[g]?.(gc, ga, u)).filter(Boolean)
  const bgImgs = [...(relief ? ['var(--convex)'] : []), ...gridLayers.map(l => l.url)]
  const bgBlends = [...(relief ? ['overlay'] : []), ...gridLayers.map(() => 'normal')]
  const bgPos = [...(relief ? ['0 0'] : []), ...gridLayers.map(l => `${l.off}px ${l.off}px`)]

  const w = clamp((weight + 100) / 400, 1, 4)

  // ── Surface mixin ──
  // raise(d, bg) — d<0 sunken, d>0 raised, 0 flat
  const raise = (d, bg = d < 0 ? 'var(--input)' : 'var(--bg)') => {
    if (!d) return `background-color: ${bg};`
    const relf = d < 0 ? 'var(--concave)' : 'var(--convex)'
    return `background-color: ${bg};
    background-image: ${relf};
    background-blend-mode: overlay, normal;
    outline: var(--w) solid ${d < 0 ? 'var(--bh)' : 'var(--bl)'};
    ${d < 0 ?
        `box-shadow: inset 0 0 0 var(--w) var(--bl), inset 0 var(--w) var(--bl), 0 var(--w) 0 0 var(--bh);`
        :
        `box-shadow: inset 0 var(--w) var(--bh), inset 0 0 0 var(--w) var(--bh), 0 var(--w) 0 0 var(--bl)${shadow(depth)};`
      }`
  }

  // Button base fragment — pass color components to derive bevel/text from any color
  const btn = (L = accentL, C = accentC, H = accentH) => {
    const isDark = L < .6
    return `
    --bh: ${$(1, min(C * 1.08, 1 - L), H, clamp(contrast * lerp(.1, .2, L), 0, 1))};
    ${raise(max(depth, .3))}
    outline: none;
    border: none;
    border-radius: var(--ri);
    color: var(${isDark ? '--text-dark' : '--text-light'});
    cursor: pointer;
    font: inherit;
    text-shadow: 0 calc(${isDark ? -1 : 1} * min(1.5px, var(--w))) 0 var(${isDark ? '--bl' : '--bh'});
    transition: background 140ms, color 140ms, box-shadow 140ms, filter 140ms;
    &:hover { filter: brightness(1.05); }
    &:active { filter: brightness(.95); }
    &:disabled { opacity: .35; cursor: not-allowed; }
    &.selected, &[aria-pressed="true"] {
      ${raise(-1, 'var(--accent)')}
      color: var(${accentDark ? '--text-dark' : '--text-light'});
      text-shadow: 0 calc(${accentDark ? -1 : 1} * min(1.5px, var(--w))) 0 var(${accentDark ? '--bl' : '--bh'});
    }`
  }

  // Thumb fragment (shared between webkit/moz)
  const thumb = `
  height: calc(var(--u) * 4);
  width: var(--thumb);
  ${raise(max(depth, .3))}
  background-color: var(--text-dark);
  border: none;
  border-radius: ${!roundness ? `0` : roundness <= .5 ? 'calc(var(--u) / 2)' : '999px'};
  cursor: grab; z-index: 1; position: relative;`

  // ── Base layer (structural + default visuals) ──
  const baseCSS = base({ shade, spacing, size, weight, accent: resolvedAccent, roundness })

  // ── Skeu visual overrides (cascade wins: same specificity, later declaration) ──
  const overrides = `.s-panel {
  --bg: ${$(surfaceL)};
  --input: ${$(surfaceL - 0.054 - lerp(.027, 0.064, contrast), surfaceC * 1.08, surfaceH, lerp(0.25, 0.15, relief))};
  --accent: color-mix(in oklab, var(--bg), ${$(accentL, accentC, accentH)} 85%);
  --focus: ${$(accentL, accentC, accentH, 0.35)};
  --bh: ${$(1, min(surfaceC * 1.08, 1 - surfaceL), surfaceH, clamp(contrast * lerp(.1, .2, surfaceL), 0, 1))};
  --bl: ${$(min(0.108, surfaceL), min(surfaceC * 4, 0.27, surfaceL / 2), surfaceH, clamp(contrast * lerp(.5, .1, surfaceL), 0, 1))};
  --convex: linear-gradient(${$(1, surfaceC, surfaceH, 0.15 * relief)}, transparent 50%, transparent 51%, ${$(0.108, surfaceC, surfaceH, 0.1 * relief)});
  --concave: linear-gradient(${$(0.108, surfaceC, surfaceH, 0.1 * relief)}, transparent 49%, transparent 50%, ${$(1, surfaceC, surfaceH, 0.15 * relief)});
  --text-light: ${$(lerp(.32, .12, contrast))};
  --text-dark: ${$(max(surfaceL, accentL, lerp(.9, .97, contrast)))};
  --text: ${dark ? 'var(--text-dark)' : 'var(--text-light)'};
  --text-dim: ${$(dark ? max(surfaceL + .25, lerp(.48, .65, contrast)) : min(surfaceL - .25, lerp(.58, .42, contrast)))};
  --text-accent: color-mix(in oklab, var(--text-dark), ${$(accentDark ? lerp(.95, 1, contrast) : lerp(.32, .12, contrast), accentC * 0.25, accentH)} 85%);
  --weight: ${weight / 1000};
  --w: ${w}px;
  --u: ${u}px;
  --spacing: ${spacing};
  --roundness: ${roundness};
  --r: calc(var(--u) * var(--roundness) * 3);
  --ri: calc(var(--r) / 1.5);
  --thumb: calc(var(--u) * ${roundness >= 1 ? 4 : 2});

  color: var(--text);
  ${raise(depth)}
  background-image: ${bgImgs.length ? bgImgs.join(', ') : 'none'};
  background-blend-mode: ${bgBlends.length ? bgBlends.join(', ') : 'normal'};
  background-position: ${bgPos.length ? bgPos.join(', ') : '0 0'};
  text-shadow: 0 calc(${dark ? -1 : 1} * min(1.5px, var(--w))) 0 var(${dark ? `--bl` : `--bh`});
  position: relative;
  isolation: isolate;

  &, *, *::before, *::after { background-origin: border-box; }

  .s-label { color: var(--text); }
  .s-hint { color: var(--text-dim); opacity: 1; }

  /* ── Input base ── */
  input[type="text"], input[type="number"], textarea, select {
    ${raise(-1)}
    border: none; border-radius: var(--ri);
    color: var(--text);
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
      ${raise(-1)}
      border: none; border-radius: 999px;
      position: relative; cursor: pointer;
      transition: background 140ms;
      &::after {
        content: ''; position: absolute;
        width: calc(var(--u) * 4); height: calc(var(--u) * 4);
        ${raise(max(depth, .3))}
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
    ${btn(surfaceL, surfaceC, surfaceH)}
    border-radius: var(--r);
  }

  /* ── Slider (custom appearance) ── */
  .s-slider {
    input[type="range"] {
      ${raise(-1)}
      --fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--p, 0) / 100);
      background-image: var(--concave), var(--track, linear-gradient(to right, var(--accent) var(--fill), var(--input) var(--fill)));
      border: none; border-radius: var(--ri);
      height: calc(var(--u) * 1.5);
      overflow: visible;
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
      position: absolute;
      width: ${ceil(w * 2) / 2}px;

      height: calc(var(--u) * 1.5); top: 50%;
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
  .s-select select { appearance: none; }
  .s-select.dropdown .s-input {
    position: relative;
    &::after {
      content: ''; position: absolute; right: calc(var(--u) * 2.5); top: 50%;
      width: calc(var(--u) * 1.5); height: calc(var(--u) * 1.5);
      border-right: var(--w) solid var(--text-dim); border-bottom: var(--w) solid var(--text-dim);
      transform: translateY(-75%) rotate(45deg); pointer-events: none;
    }
  }
  .s-select.buttons button {
    ${btn(surfaceL, surfaceC, surfaceH)}
    font-weight: inherit;
    font-size: smaller;
    margin-left: 0;
    border-radius: 0;
    &:first-child { border-top-left-radius: var(--r); border-bottom-left-radius: var(--r); }
    &:last-child { border-top-right-radius: var(--r); border-bottom-right-radius: var(--r); }
  }
  .s-select.radio {
    label { color: var(--text-dim); opacity: 1; &.selected { color: var(--text); opacity: 1; } }
  }

  /* ── Color ── */
  .s-color-input {
    input[type="color"] { background: transparent; }
    input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
    input[type="color"]::-webkit-color-swatch { border: var(--w) solid var(--bh); border-radius: var(--ri); }
  }
  .s-swatches button {
    ${btn(surfaceL, surfaceC, surfaceH)}
    box-shadow: inset 0 0 0 var(--w) var(--bl);
    border-radius: var(--ri);
    &.selected { border: 1px solid var(--text); box-shadow: 0 0 0 2px var(--bg); }
  }

  /* ── Button (action) ── */
  .s-button button {
    ${btn()}
    background-color: var(--accent);
  }
  .s-button.secondary button {
    ${btn(surfaceL, surfaceC, surfaceH)}
  }

  /* ── Panel title ── */
  > summary {
    color: var(--text);
    &::after { border-right: var(--w) solid var(--text-dim); border-bottom: var(--w) solid var(--text-dim); }
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
