/**
 * Skeu theme — monotone, diffuse, tactile
 *
 * Layers on top of base theme (CSS cascade override).
 * skeu(axes?) → CSS string
 */

import base, { parseColor, resolveAccent, lerp, clamp } from './default.js'

const { min, max, round } = Math

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
  size = 1,
  weight = 400,
  depth = .4,
  roundness = 0.5,
  relief = 0,
  bevel: bevelOpt = 2,
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

  const u = Number.isFinite(unit) ? unit : lerp(3, 5, clamp(size / 2, 0, 1))

  // Layered shadow — exponential y/blur, negative spread
  const sc = $(0.108, min(surfaceC + 0.1, 0.27), surfaceH, dark ? .15 : .12)
  const shadow = (d) => !d ? '' : ', ' + [1, 2, 4, 8, 16].map(s => {
    const v = +(s * d * (.3 + d * .05)).toFixed(1)
    return `0 ${v}px ${v}px ${+(-v / 3).toFixed(1)}px ${sc}`
  }).join(', ')

  // Grid layers (combinable background-image stack)
  const gridList = Array.isArray(grid) ? grid : (grid && grid !== 'none' ? [grid] : [])
  const gc = dark ? '255,255,255' : '0,0,0', ga = dark ? '.04' : '.05'
  const gridLayers = gridList.map(g => GRID[g]?.(gc, ga, u)).filter(Boolean)
  const bgImgs = [...(relief ? ['var(--convex)'] : []), ...gridLayers.map(l => l.url)]
  const bgBlends = [...(relief ? ['overlay'] : []), ...gridLayers.map(() => 'normal')]
  const bgPos = [...(relief ? ['0 0'] : []), ...gridLayers.map(l => `${l.off}px ${l.off}px`)]

  const bevel = bevelOpt
  const stroke = max(1, weight / 400)
  const chevron = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='${stroke}' stroke-linejoin='round'/%3E%3C/svg%3E")`

  // ── Surface mixin ──
  // raise(d, bg) — d<0 sunken, d>0 raised, 0 flat
  const raise = (d, bg = d < 0 ? 'var(--sunken)' : 'var(--bg)') => {
    const relf = d < 0 ? 'var(--concave)' : 'var(--convex)'
    return `background-color: ${bg};
    ${d ? `background-image: ${relf};` : ''}
    outline: var(--bevel) solid ${d < 0 ? 'var(--bh)' : 'var(--bl)'};
    ${d < 0 ?
        `box-shadow: inset 0 0 0 var(--bevel) var(--bl), inset 0 var(--bevel) var(--bl), 0 var(--bevel) 0 0 var(--bh);`
        :
        `box-shadow: inset 0 var(--bevel) var(--bh), inset 0 0 0 var(--bevel) var(--bh), 0 var(--bevel) 0 0 var(--bl)${shadow(depth)};`
      }`
  }

  // Button base fragment — pass color components to derive bevel/text from any color
  const btn = (L = accentL, C = accentC, H = accentH, bg) => {
    const isDark = L < .6
    return `
    --bh: ${$(1, min(C * 1.08, 1 - L), H, clamp(contrast * lerp(.1, .2, L), 0, 1))};
    ${raise(max(depth, .3), bg)}
    outline: none;
    border: none;
    border-radius: var(--ri);
    color: var(${isDark ? '--text-dark' : '--text-light'});
    cursor: pointer;
    font: inherit;
    text-shadow: 0 calc(${isDark ? -1 : 1} * min(1.5px, var(--bevel))) 0 var(${isDark ? '--bl' : '--bh'});
    filter: brightness(1);
    transition: background-color 140ms, color 140ms, box-shadow 140ms, filter 140ms;
    &:hover { filter: brightness(1.1); color: var(${isDark ? '--text-dark' : '--text-light'}); }
    &:active { filter: brightness(.95); box-shadow: inset 0 var(--bevel) var(--bh), inset 0 0 0 var(--bevel) var(--bh), 0 var(--bevel) 0 0 var(--bl); }
    &:disabled { opacity: .35; cursor: not-allowed; }
    &.selected, &[aria-pressed="true"] {
      --bh: ${$(1, min(accentC * 1.08, 1 - accentL), accentH, clamp(contrast * lerp(.1, .2, accentL), 0, 1))};
      ${raise(-1, 'var(--accent)')}
      color: var(${accentDark ? '--text-dark' : '--text-light'});
      text-shadow: 0 calc(${accentDark ? -1 : 1} * min(1.5px, var(--bevel))) 0 var(${accentDark ? '--bl' : '--bh'});
    }
    &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; z-index: 1; }`
  }

  // Thumb fragment (shared between webkit/moz)
  const thumbBg = dark ? 'var(--text-dark)' : 'var(--raised)'
  const thumb = `
  height: calc(var(--u) * 4);
  width: var(--thumb);
  ${raise(max(depth, .3), thumbBg)}
  border: none;
  border-radius: ${!roundness ? `0` : roundness <= .5 ? 'calc(var(--u) / 2)' : '999px'};
  cursor: grab; z-index: 1; position: relative;`

  // ── Base layer (structural + default visuals) ──
  const baseCSS = base({ shade, spacing, size, weight, accent: resolvedAccent, roundness })

  // ── Skeu visual overrides (cascade wins: same specificity, later declaration) ──
  const overrides = `.s-panel {
  --bg: ${$(surfaceL)};
  --sunken: ${$(max(0.16, surfaceL - lerp(.027, 0.04, contrast)), surfaceC * 1.08, surfaceH)};
  --raised: ${$(min(1, surfaceL + lerp(0.054, 0.108, contrast)), surfaceC, surfaceH)};
  --accent: color-mix(in oklab, var(--bg), ${$(accentL, accentC, accentH)} 85%);
  --focus: ${$(accentL, accentC, accentH, 0.35)};
  --bh: ${$(1, min(surfaceC * 1.08, 1 - surfaceL), surfaceH, clamp(contrast * lerp(.1, .2, surfaceL), 0, 1))};
  --bl: ${$(min(0.108, surfaceL), min(surfaceC * 4, 0.27, surfaceL / 2), surfaceH, clamp(contrast * lerp(.5, .1, surfaceL), 0, 1))};
  --convex: linear-gradient(${$(1, surfaceC, surfaceH, 0.15 * relief)}, transparent 50%, transparent 51%, ${$(0.108, surfaceC, surfaceH, 0.1 * relief)});
  --concave: linear-gradient(${$(0.108, surfaceC, surfaceH, 0.1 * relief)}, transparent 49%, transparent 50%, ${$(1, surfaceC, surfaceH, 0.15 * relief)});
  --text-light: ${$(lerp(.32, .12, contrast))};
  --text-dark: ${$(max(surfaceL, accentL, lerp(.9, 1, contrast)))};
  --text: ${dark ? 'var(--text-dark)' : 'var(--text-light)'};
  --text-dim: ${$(dark ? max(surfaceL + .25, lerp(.48, .65, contrast)) : min(surfaceL - .25, lerp(.58, .42, contrast)))};
  --text-accent: color-mix(in oklab, var(--text-dark), ${$(accentDark ? lerp(.9, 1, contrast) : lerp(.32, .12, contrast), accentC * 0.25, accentH)} 85%);
  --weight: ${weight / 1000};
  --bevel: ${bevel}px;
  --u: ${u}px;
  --spacing: ${spacing};
  --roundness: ${roundness};
  --r: calc(var(--u) * var(--roundness) * 3);
  --ri: calc(var(--u) * max(var(--roundness), -1.5 + var(--roundness) * 3));
  --thumb: calc(var(--u) * ${roundness >= 1 ? 4 : 2});

  color: var(--text);
  ${raise(depth)}
  background-image: ${bgImgs.length ? bgImgs.join(', ') : 'none'};
  background-blend-mode: ${bgBlends.length ? bgBlends.join(', ') : 'normal'};
  background-position: ${bgPos.length ? bgPos.join(', ') : '0 0'};
  text-shadow: 0 calc(${dark ? -1 : 1} * min(1.5px, var(--bevel))) 0 var(${dark ? `--bl` : `--bh`});
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
    transition: outline-color 140ms;
    &::placeholder { color: var(--text-dim); opacity: .6; }
    &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  }

  /* ── Boolean (custom toggle) ── */
  .s-boolean {
    label { display: flex; cursor: pointer; }
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-track {
      width: calc(var(--u) * 10); height: calc(var(--u) * 5);
      margin: calc(var(--u) * var(--spacing)) 0;
      ${raise(-1)}
      border: none; border-radius: 999px;
      position: relative; cursor: pointer;
      transition: background-color 140ms, box-shadow 140ms, outline-color 140ms;
      &::after {
        content: ''; position: absolute;
        width: calc(var(--u) * 4); height: calc(var(--u) * 4);
        ${raise(max(depth, .3), thumbBg)}
        border: none; border-radius: 50%;
        top: calc(var(--u) * .5); left: calc(var(--u) * .5);
        transition: transform 140ms, box-shadow 140ms;
      }
    }
    &:has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 2px; }
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
    ${btn(surfaceL, surfaceC, surfaceH, 'var(--raised)')}
    border-radius: var(--ri);
  }

  /* ── Slider (custom appearance) ── */
  .s-slider {
    input[type="range"] {
      ${raise(-1)}
      --fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--p, 0) / 100);
      background-image: var(--concave), var(--track, linear-gradient(to right, var(--accent) var(--fill), var(--sunken) var(--fill)));
      border: none; border-radius: var(--ri);
      height: calc(var(--u) * 1.5);
      overflow: visible;
      appearance: none;
      -webkit-appearance: none;
      &::-webkit-slider-thumb { -webkit-appearance: none; ${thumb} }
      &::-moz-range-thumb { ${thumb} }
      &:hover::-webkit-slider-thumb { filter: brightness(1.2); }
      &:hover::-moz-range-thumb { filter: brightness(1.2); }
      &:active::-webkit-slider-thumb { filter: brightness(.95); cursor: grabbing; }
      &:active::-moz-range-thumb { filter: brightness(.95); cursor: grabbing; }
      &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
      &::-webkit-slider-container { appearance: none; }
    }
    datalist { display: none; }
    .s-marks, .s-mark-labels {
      left: calc(var(--thumb) / 2); right: calc(var(--thumb) / 2);
    }
    .s-marks { display: flex; }
    .s-mark {
      position: absolute;
      width: calc(0.33 * var(--u));

      height: calc(var(--u) * 1.5); top: 50%;
      background: linear-gradient(var(--bh), var(--bh)) var(--bg);
      transform: translate(-50%, -50%);
      &.active { background: linear-gradient(var(--bh), var(--bh)) var(--bg); }
    }
    .s-mark-label {
      color: var(--text-dim); opacity: 1;
      &.active { color: var(--accent); }
    }
    .s-readout {
      color: var(--text-dim); opacity: 1;
    }
    .s-tooltip {
      color: var(--text-dim); opacity: 1;
    }
  }

  /* ── Select (custom arrow) ── */
  .s-select select { appearance: none; }
  .s-select.dropdown .s-input {
    position: relative;
    &::after {
      content: ''; position: absolute; right: var(--padding); top: 50%;
      width: calc(var(--u) * 4); height: calc(var(--u) * 4);
      background: var(--text-dim);
      -webkit-mask: ${chevron} center / contain no-repeat;
      mask: ${chevron} center / contain no-repeat;
      transform: translateY(-50%); pointer-events: none;
    }
  }

  .s-select.buttons {
    .s-input { gap: var(--bevel); }
    button {
      ${btn(surfaceL, surfaceC, surfaceH, 'var(--raised)')}
      font-weight: inherit;
      font-size: smaller;
      margin-left: 0;
      border-radius: 0;
      &:first-child { border-top-left-radius: var(--ri); border-bottom-left-radius: var(--ri); }
      &:last-child { border-top-right-radius: var(--ri); border-bottom-right-radius: var(--ri); }
    }
  }
  .s-select.radio {
    label { color: var(--text-dim); opacity: 1; &.selected { color: var(--text); opacity: 1; } }
  }

  /* ── Color ── */
  .s-color-input {
    input[type="color"] { background: transparent; &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; } }
    input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
    input[type="color"]::-webkit-color-swatch { border: var(--bevel) solid var(--bh); border-radius: var(--ri); }
  }
  .s-swatches button {
    ${btn(surfaceL, surfaceC, surfaceH)}
    box-shadow: inset 0 0 0 var(--bevel) var(--bl);
    border-radius: var(--ri);
    &.selected { border: 1px solid var(--text); box-shadow: 0 0 0 2px var(--bg); }
  }

  /* ── Button (action) ── */
  .s-button button {
    ${btn(accentL, accentC, accentH, 'var(--accent)')}
  }
  .s-button.secondary button, .s-button button.secondary {
    ${btn(surfaceL, surfaceC, surfaceH, 'var(--raised)')}
  }

  /* ── Panel title ── */
  > summary, > .s-panel-title { color: var(--text); }
  > summary::after { background: var(--text-dim); }

  /* ── Folder ── */
  .s-folder > summary {
    color: var(--text);
    border-bottom: var(--bevel) solid var(--bl); box-shadow: 0 var(--bevel) 0 0 var(--bh);
    opacity: 1;
    &::after { background: var(--text-dim); }
  }
  .s-folder[open] > summary { box-shadow: none; }
}`

  return baseCSS + '\n' + overrides
}
