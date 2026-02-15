/**
 * Skeu theme — monotone, diffuse, tactile
 *
 * skeu(axes?) → CSS string
 */

const { min, max, round, ceil } = Math
const clamp = (v, lo, hi) => min(hi, max(lo, v))
const lerp = (a, b, t) => a + (b - a) * t

const TEX = {
  flat: 'none',
  dots: (c, a) => `url("data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='6' cy='6' r='.6' fill='rgba(${c},${a})'/%3E%3C/svg%3E")`,
  crosses: (c, a) => `url("data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 4v8M4 8h8' stroke='rgba(${c},${a})' stroke-width='.6'/%3E%3C/svg%3E")`,
}

/**
 * Parse CSS color to OKLCH components
 * Supports: #hex, oklch()
 */
function parseColor(color) {
  if (!color) return { L: 0.97, C: 0.01, H: 60 }

  const oklch = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
  if (oklch) return { L: +oklch[1], C: +oklch[2], H: +oklch[3] }

  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16) / 255
    const g = parseInt(hex.slice(2, 4), 16) / 255
    const b = parseInt(hex.slice(4, 6), 16) / 255
    const rl = r <= 0.04045 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4
    const gl = g <= 0.04045 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4
    const bl = b <= 0.04045 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4
    const l_ = Math.cbrt(0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl)
    const m_ = Math.cbrt(0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl)
    const s_ = Math.cbrt(0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl)
    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    const ob = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    const C = Math.sqrt(a * a + ob * ob)
    let H = Math.atan2(ob, a) * 180 / Math.PI
    if (H < 0) H += 360
    return { L, C, H }
  }

  return { L: 0.97, C: 0.01, H: 60 }
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
  roundness = .5,
  relief = 0,
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
  // Shadow/highlight: accept optional chroma/hue overrides

  // ── Axes → CSS vars (minimal set, everything else derives) ──
  const { L: accentL, C: accentC, H: accentH } = accent ? parseColor(accent) : { L: dark ? .72 : .58, C: min(surfaceC, 0.27), H: surfaceH }
  const accentDark = accentL < .6

  const u = 4  // fixed grid quantum (px)

  // Shadow helper (depth-dependent)
  const sh = (y, bl, a) => `0 ${y}px ${bl}px ${$(0.108, surfaceC + 0.1, surfaceH, a)}`

  // Texture (data URI, must stay JS)
  const texFn = TEX[texture]
  const tex = !texFn || texFn === 'none' ? 'none'
    : texFn(dark ? '255,255,255' : '0,0,0', dark ? '.04' : '.05')

  const mono = "ui-monospace, 'SF Mono', monospace"

  // Grid-aligned text metrics
  const fontSize = lerp(10, 14, size)
  const lh = 4 * u  // 16, 20, 24px — always on grid
  const inputH = lh + 2 * u * (.75 + .75 * spacing)  // matches input padding


  // Roundness: 0–1 normalized → px, max depends on spacing
  const maxR = round(14 + 12 * spacing)
  const r = round(roundness * maxR)

  const thumbSize = r ? 4 * u : (4 / 1.128) * u  // 12, 16, 20px — on grid
  const thumbR = r ? thumbSize / 2 : 0

  const w = clamp((weight + 100) / 400, 1, 4)

  // ── CSS variable block ──
  // All CSS props derive from these. Bevel: --bh (high) + --bl (low)
  // are the shared pair — inputs use bh outside/bl inside (concave),
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
    const relief = d < 0 ? 'var(--concave)' : d > 0 ? 'var(--convex)' : 'none'
    return `background-color: ${bg};
    background-image: ${relief};
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

  return `.s-panel {
  ${varBlock}
  display: flex; flex-direction: column; gap: calc(var(--u) * 2 * var(--sp));
  color: var(--text);
  ${raise(depth)}
  background-image: ${relief ? `var(--convex), ` : ''}${tex};
  border-radius: var(--r);
  padding: calc(var(--u) * 3 * var(--sp));
  font: var(--fw) ${fontSize}px system-ui, -apple-system, sans-serif;
  line-height: ${lh}px;
  text-shadow: 0 calc(${dark ? -1 : 1} * min(1.5px, var(--w))) 0 var(${dark ? `--bl` : `--bh`});
  min-width: calc(var(--u) * 60);
  position: relative;
  isolation: isolate;
  -webkit-font-smoothing: antialiased;

  &, *, *::before, *::after { box-sizing: border-box; background-origin: border-box; }

  /* ── Control row ── */
  .s-control {
    display: flex; align-items: baseline;
    gap: calc(var(--u) * 2 * var(--sp));
    margin: 0; border: 0;
  }
  .s-label-group { flex: 0 0 auto; width: calc(var(--u) * 20); display: flex; flex-direction: column; gap: 2px; }
  .s-label { color: var(--text); }
  .s-hint { font-size: smaller; color: var(--text-dim); line-height: ${lh}px; }
  .s-input { flex: 1; display: flex; align-items: baseline; gap: calc(var(--u) * var(--sp)); }

  /* ── Input base ── */
  input[type="text"], input[type="number"], textarea, select {
    ${raise(-depth)}
    border: none; border-radius: var(--ri);
    color: var(--text);
    padding: calc(var(--u) * (0.75 + 0.75 * var(--sp))) calc(var(--u) * (1 + 1 * var(--sp)));
    font: inherit;
    transition: border-color 140ms, box-shadow 140ms;
    &::placeholder { color: var(--text-dim); opacity: .6; }
    &:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--focus); }
  }
  button:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--focus); }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { position: absolute; opacity: 0; pointer-events: none; }
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
    width: calc(var(--u) * 20); text-align: right;
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
  }

  /* ── Step buttons ── */
  .s-step {
    ${btn()}
    width: calc(var(--u) * 7); height: calc(var(--u) * 7);
    display: flex; align-items: center; justify-content: center;
    line-height: 1; color: var(--text);
    &:hover:not(:disabled) { background-color: var(--accent); }
  }

  /* ── Slider ── */
  .s-slider {
    padding: calc(1.25*var(--u)) 0;
    .s-input { flex-direction: row; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 16px; }
    .s-track { flex: 1; position: relative; display: flex; align-items: center; }
    input[type="range"] {
      width: 100%; height: 0.6em; margin: 0;
      ${raise(-depth)}
      --fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--p, 0) / 100);
      background-image: var(--concave), var(--track, linear-gradient(to right, var(--accent) var(--fill), var(--input) var(--fill)));
      border: none; border-radius: var(--ri);
      -webkit-appearance: none; cursor: pointer;
      &::-webkit-slider-thumb { -webkit-appearance: none; ${thumb} }
      &::-moz-range-thumb { ${thumb} }
      &::-webkit-slider-container { appearance: none; }
    }
    datalist { display: none; }
    .s-marks, .s-mark-labels {
      position: absolute;
      left: calc(var(--thumb) / 2); right: calc(var(--thumb) / 2);
      top: 0; bottom: 0;
      pointer-events: none;
    }
    .s-mark {
      position: absolute; width: ${ceil(w * 2) / 2}px; height: 100%; top: 50%;
      background: linear-gradient(var(--bh), var(--bh)) var(--bg);
      transform: translate(-50%, -50%);
      &.active { background: linear-gradient(var(--bh), var(--bh)) var(--bg); }
    }
    .s-mark-label {
      position: absolute; top: 100%;
      transform: translate(-50%, 4px);
      font-size: smaller; text-align: center; white-space: nowrap;
      color: var(--text-dim);
      &.active { color: var(--accent); }
    }
    .s-value {
      min-width: calc(var(--u) * 10);
      font-size: smaller; text-align: right;
      color: var(--text-dim);
    }
  }

  /* ── Select ── */
  .s-select select {
    flex: 1; cursor: pointer; appearance: none;
    background-image: var(--concave), linear-gradient(45deg, transparent 50%, var(--text-dim) 50%), linear-gradient(135deg, var(--text-dim) 50%, transparent 50%);
    background-position: 0 0, calc(100% - 14px) 50%, calc(100% - 10px) 50%;
    background-size: 100% 100%, 4px 4px, 4px 4px;
    background-repeat: no-repeat;
    padding-right: 26px;
  }
  .s-buttons {
    flex-wrap: wrap;
    .s-input { gap: calc(var(--u) * .5 * var(--sp)); }
    button {
      ${btn()}
      padding: var(--u) calc(var(--u) * 2.5);
      border-radius: 999px;
    }
  }
  .s-radio {
    .s-input { flex-direction: column; align-items: flex-start; gap: calc(var(--u) * .5 * var(--sp)); }
    label { display: flex; align-items: center; gap: calc(var(--u) * 1.5); cursor: pointer; color: var(--text-dim); &.selected { color: var(--text); } }
  }

  /* ── Color ── */
  .s-color-input {
    flex: 1; position: relative; display: flex; align-items: center;
    input[type="color"] { position: absolute; left: var(--u); width: calc(var(--u) * 5); height: calc(var(--u) * 5); padding: 0; border: none; background: transparent; cursor: pointer; }
    input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
    input[type="color"]::-webkit-color-swatch { border: var(--w) solid var(--bh); border-radius: var(--ri); }
    input[type="text"] { flex: 1; padding-left: calc(var(--u) * 7); }
  }
  .s-swatches {
    .s-input { flex-wrap: wrap; gap: var(--u); }
    button {
      ${btn()}
      width: calc(var(--u) * 5); height: calc(var(--u) * 5); padding: 0;
      box-shadow: inset 0 0 0 var(--w) var(--bl);
      &.selected { border: 1px solid var(--text); box-shadow: 0 0 0 2px var(--bg); }
    }
  }

  /* ── Text ── */
  .s-text input[type="text"] { flex: 1; }

  /* ── Textarea ── */
  .s-textarea {
    align-items: flex-start;
    textarea { flex: 1; resize: none; overflow: hidden; }
  }

  /* ── Button (action) ── */
  .s-button button {
    ${btn()}
    background-color: var(--accent);
    padding: calc(var(--u) * 2.5) calc(var(--u) * 4);
    color: var(--text-accent);
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
  .s-folder {
    display: block; border: 0; padding: 0;
    > summary {
      cursor: pointer; padding: calc(var(--u) * 1.5) 0;
      list-style: none; display: flex; align-items: center; color: var(--text);
      border-bottom: var(--w) solid var(--bl); box-shadow: 0 var(--w) 0 0 var(--bh);
      &::-webkit-details-marker { display: none; }
      &::after {
        content: ''; width: 7px; height: 7px; margin-left: auto; flex-shrink: 0;
        border-right: var(--w) solid var(--text-dim); border-bottom: var(--w) solid var(--text-dim);
        transform: rotate(45deg); transition: transform 140ms;
      }
    }
    &[open] > summary { border-bottom: none; box-shadow: none; }
    &[open] > summary::after { transform: rotate(-135deg); }
  }
  .s-content {
    padding: calc(var(--u) * 2 * var(--sp)) 0;
    display: flex; flex-direction: column; gap: calc(var(--u) * 2 * var(--sp));
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition-duration: 0ms !important; }
  }
}`
}
