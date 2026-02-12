/**
 * Soft theme — monotone, diffuse, tactile
 *
 * soft(axes?) → CSS string
 */

const { min, max, round } = Math
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
    const l_ = Math.cbrt(0.4122214708*rl + 0.5363325363*gl + 0.0514459929*bl)
    const m_ = Math.cbrt(0.2119034982*rl + 0.6806995451*gl + 0.1073969566*bl)
    const s_ = Math.cbrt(0.0883024619*rl + 0.2817188376*gl + 0.6299787005*bl)
    const L = 0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_
    const a = 1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_
    const ob = 0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_
    const C = Math.sqrt(a*a + ob*ob)
    let H = Math.atan2(ob, a) * 180 / Math.PI
    if (H < 0) H += 360
    return { L, C, H }
  }

  return { L: 0.97, C: 0.01, H: 60 }
}

function defaultShade(L, C, H, alpha) {
  L = clamp(L, 0, 1)
  return alpha != null
    ? `oklch(${L} ${C} ${H} / ${alpha})`
    : `oklch(${L} ${C} ${H})`
}

export default function soft({
  shade = '#f5f4f2',
  accent,
  contrast = .5,
  texture = 'flat',
  spacing = 1,
  size = .5,
  weight = 400,
  depth = .4,
  roundness = 12,
  relief = 0,
} = {}) {

  const isFunc = typeof shade === 'function'
  const { L, C, H } = isFunc ? { L: 0.97, C: 0.01, H: 60 } : parseColor(shade)
  const dark = L < .5
  const $ = isFunc ? shade : ((l, c=C, h=H, a) => defaultShade(l, c, h, a))

  // ── Axes → CSS vars (minimal set, everything else derives) ──
  const Li = L - .05
  const accentC = min(C * 8, 0.25)
  const accentColor = accent || `oklch(${dark ? .72 : .58} ${accentC} ${H})`
  const u = 4  // fixed grid quantum (px)

  // Relief: delta capped so highlight ≤ surface L
  const rd = relief * (L - Li)
  const hiR = $(1, C, H, rd / (1 - Li))
  const loR = $(0, C, H, rd / Li)
  const convex  = relief ? `linear-gradient(${hiR}, ${loR})` : 'none'
  const concave = relief ? `linear-gradient(${loR}, ${hiR})` : 'none'

  // Shadow helper (depth-dependent)
  const sh = (y, bl, a) => `0 ${y}px ${bl}px ${$(0, C, H, a)}`

  // Texture (data URI, must stay JS)
  const texFn = TEX[texture]
  const tex = !texFn || texFn === 'none' ? 'none'
    : texFn(dark ? '255,255,255' : '0,0,0', dark ? '.04' : '.05')

  const mono = "ui-monospace, 'SF Mono', monospace"

  // ── CSS variable block ──
  // All CSS props derive from these. Bevel: --bh (highlight) + --bs (shadow)
  // are the shared pair — inputs use bh outside/bs inside (concave),
  // buttons swap them: bs outside/bh inside (convex).
  const vars = {
    '--bg':       $(L),
    '--text':     $(dark ? lerp(.78, .97, contrast) : lerp(.32, .12, contrast)),
    '--dim':      $(dark ? max(L + .25, lerp(.48, .65, contrast)) : min(L - .25, lerp(.58, .42, contrast))),
    '--input':    $(Li),
    '--accent':   accentColor,
    '--accent-c': $(dark ? .15 : .98),
    '--focus':    accent
      ? accent.replace(/\)$/, ' / .35)').replace('oklch(', 'oklch(')
      : `oklch(${dark ? .72 : .58} ${accentC} ${H} / .35)`,
    '--convex':   convex,
    '--concave':  concave,
    '--bh':       $(1, C, H, contrast * .2 / (1-L)),
    '--bs':       $(0, C, H, contrast * .3 / L),
    '--edge':     'color-mix(in oklch, currentColor 20%, transparent)',
    '--w':        `${weight / 400}px`,
    '--fw':       round(weight),
    '--fwB':      round(min(weight + 100, 900)),
    '--u':        `${u}px`,
    '--sp':       spacing,
    '--r':        `${roundness}px`,
    '--ri':       `${max(0, roundness - max(0, u * 1.5))}px`,
    '--thumb':    `${lerp(12, 18, size)}px`,
  }

  const varBlock = Object.entries(vars).map(([k, v]) => `${k}: ${v};`).join('\n  ')

  // Thumb fragment (shared between webkit/moz)
  const thumb = `
      width: var(--thumb); height: var(--thumb);
      background: ${$(.99)}; background-image: var(--convex);
      border: none; border-radius: 50%;
      box-shadow: inset 0 0 0 2px var(--accent), ${sh(lerp(0, 2, depth), lerp(2, 8, depth), lerp(.1, .35, depth))};
      cursor: grab; z-index: 1; position: relative;`

  return `.s-panel {
  ${varBlock}

  color: var(--text);
  background: var(--bg);
  background-image: ${tex};
  outline: var(--w) solid ${$(0, C, H, contrast*.5 / L)};
  border: var(--w) solid ${$(1, C, H, contrast*.5 / (1-L))};
  border-radius: var(--r);
  padding: calc(var(--u) * 3 * var(--sp));
  font: var(--fw) ${lerp(11, 15, size)}px/1.35 system-ui, -apple-system, sans-serif;
  min-width: calc(var(--u) * 60);
  position: relative;
  isolation: isolate;
  -webkit-font-smoothing: antialiased;

  *, *::before, *::after { box-sizing: border-box; }

  /* ── Control row ── */
  .s-control {
    display: flex; align-items: baseline;
    gap: calc(var(--u) * 2 * var(--sp));
    padding: calc(var(--u) * var(--sp)) 0;
    min-height: ${lerp(20, 42, size)}px;
    margin: 0; border: 0;
  }
  .s-label-group { flex: 0 0 auto; width: calc(var(--u) * 20); display: flex; flex-direction: column; gap: 2px; }
  .s-label { font-weight: var(--fwB); color: var(--text); }
  .s-hint { font-size: 10px; color: var(--dim); line-height: 1.3; }
  .s-input { flex: 1; display: flex; align-items: baseline; gap: calc(var(--u) * var(--sp)); }

  /* ── Input base ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--input); background-image: var(--concave);
    border: none; border-radius: var(--ri);
    outline: var(--w) solid var(--bh);
    box-shadow: inset 0 0 0 var(--w) var(--bs);
    color: var(--text);
    padding: calc(var(--u) * 1.5) calc(var(--u) * 2); font: inherit; font-size: .95em;
    transition: border-color 140ms, box-shadow 140ms;
    &::placeholder { color: var(--dim); opacity: .6; }
    &:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--focus); }
  }
  button:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--focus); }

  /* ── Boolean ── */
  .s-boolean {
    input[type="checkbox"] { position: absolute; opacity: 0; pointer-events: none; }
    .s-track {
      width: calc(var(--u) * 10); height: calc(var(--u) * 5);
      background: var(--input); background-image: var(--concave);
      border-radius: 999px;
      position: relative; cursor: pointer;
      transition: background 140ms;
      box-shadow: inset 0 0 0 var(--w) ${$(0, C, H, contrast * .2 / L)};
      &::after {
        content: ''; position: absolute;
        width: calc(var(--u) * 4); height: calc(var(--u) * 4);
        background: ${$(.99)}; background-image: var(--convex);
        border-radius: 50%;
        top: calc(var(--u) * .5); left: calc(var(--u) * .5);
        transition: transform 140ms;
        box-shadow: ${sh(lerp(0, 1, depth), lerp(1, 5, depth), lerp(.05, .25, depth))};
      }
    }
    &:has(input:checked) .s-track {
      background: var(--accent);
      &::after { transform: translateX(calc(var(--u) * 5)); box-shadow: 0 0 0 2px ${$(1, C, H, .15)}; }
    }
  }

  /* ── Number ── */
  .s-number input[type="number"] {
    width: calc(var(--u) * 20); font-family: ${mono}; text-align: right;
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
  }
  .s-step {
    width: calc(var(--u) * 7); height: calc(var(--u) * 7);
    background: var(--input); background-image: var(--convex);
    border: 1px solid var(--edge); border-radius: var(--ri);
    color: var(--text); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; line-height: 1;
    transition: background 140ms, color 140ms, border-color 140ms;
    &:hover:not(:disabled) { background: var(--accent); color: var(--accent-c); border-color: transparent; }
    &:disabled { opacity: .35; cursor: not-allowed; }
  }

  /* ── Slider ── */
  .s-slider {
    .s-input { flex-direction: row; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 16px; }
    .s-track { flex: 1; position: relative; display: flex; align-items: center; }
    input[type="range"] {
      width: 100%; height: 0.6em; margin: 0;
      background: var(--track, linear-gradient(to right, var(--accent) var(--p, 0%), var(--input) var(--p, 0%)));
      border-radius: 999px;
      -webkit-appearance: none; cursor: pointer;
      box-shadow: inset 0 var(--w) var(--w) 0 ${$(0, C, H, .05)};
      &::-webkit-slider-thumb { -webkit-appearance: none; ${thumb} }
      &::-moz-range-thumb { ${thumb} }
    }
    .s-marks, .s-mark-labels {
      position: absolute;
      left: calc(var(--thumb) / 2); right: calc(var(--thumb) / 2);
      top: 0; bottom: 0;
      pointer-events: none;
    }
    .s-mark {
      position: absolute; width: 1px; height: 10px; top: 50%;
      background: var(--bg);
      transform: translate(-50%, -50%);
      &.active { background: var(--bg); }
    }
    .s-mark-label {
      position: absolute; top: 100%;
      transform: translate(-50%, 4px);
      font-size: 9px; text-align: center; white-space: nowrap;
      color: var(--dim);
      &.active { color: var(--accent); }
    }
    .s-value {
      min-width: calc(var(--u) * 12);
      text-align: right; font-family: ${mono}; font-size: 11px;
      color: var(--dim);
    }
  }

  /* ── Select ── */
  .s-select select {
    flex: 1; cursor: pointer; appearance: none;
    background-image: var(--concave), linear-gradient(45deg, transparent 50%, var(--dim) 50%), linear-gradient(135deg, var(--dim) 50%, transparent 50%);
    background-position: 0 0, calc(100% - 14px) 50%, calc(100% - 10px) 50%;
    background-size: 100% 100%, 4px 4px, 4px 4px;
    background-repeat: no-repeat;
    padding-right: 26px;
  }
  .s-buttons {
    flex-wrap: wrap;
    .s-input { gap: calc(var(--u) * .5 * var(--sp)); }
    button {
      background: var(--input); background-image: var(--convex);
      border: 1px solid var(--edge); border-radius: 999px;
      color: var(--dim); padding: var(--u) calc(var(--u) * 2.5); cursor: pointer;
      font-size: 11px; font-weight: var(--fw);
      transition: background 140ms, color 140ms, border-color 140ms;
      &:hover { border-color: var(--accent); color: var(--text); }
      &.selected { background: var(--accent); color: var(--accent-c); border-color: transparent; }
    }
  }
  .s-radio {
    .s-input { flex-direction: column; align-items: flex-start; gap: calc(var(--u) * .5 * var(--sp)); }
    label { display: flex; align-items: center; gap: calc(var(--u) * 1.5); cursor: pointer; color: var(--dim); &.selected { color: var(--text); } }
  }

  /* ── Color ── */
  .s-color-input {
    flex: 1; position: relative; display: flex; align-items: center;
    input[type="color"] { position: absolute; left: var(--u); width: calc(var(--u) * 5); height: calc(var(--u) * 5); padding: 0; border: none; background: transparent; cursor: pointer; }
    input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
    input[type="color"]::-webkit-color-swatch { border: 1px solid var(--edge); border-radius: var(--ri); }
    input[type="text"] { flex: 1; padding-left: calc(var(--u) * 7); font-family: ${mono}; font-size: 11px; }
  }
  .s-swatches {
    .s-input { flex-wrap: wrap; gap: var(--u); }
    button {
      width: calc(var(--u) * 5); height: calc(var(--u) * 5); border: 1px solid transparent; border-radius: var(--ri);
      cursor: pointer; padding: 0; box-shadow: inset 0 0 0 1px ${$(0, C, H, .04)};
      &.selected { border-color: var(--text); box-shadow: 0 0 0 2px var(--bg); }
    }
  }

  /* ── Text ── */
  .s-text input[type="text"] { flex: 1; }

  /* ── Textarea ── */
  .s-textarea {
    align-items: flex-start;
    textarea { flex: 1; font-family: ${mono}; font-size: 11px; resize: none; overflow: hidden; }
  }

  /* ── Button ── */
  .s-button button {
    background: var(--accent); background-image: var(--convex);
    background-origin: border-box;
    outline: var(--w) solid var(--bs); border: var(--w) solid var(--bh);
    box-shadow: none;
    border-radius: var(--ri);
    color: var(--accent-c); padding: calc(var(--u) * 2) calc(var(--u) * 4); cursor: pointer;
    font-weight: var(--fwB); font-size: 11px;
    transition: filter 140ms, transform 100ms, box-shadow 140ms;
    &:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: ${sh(lerp(1, 4, depth), lerp(2, 12, depth), lerp(.05, .2, depth))}; }
    &:active { transform: translateY(0); filter: brightness(.95); box-shadow: none; }
  }
  .s-button.secondary button {
    background-color: ${$(min(L, 1))}; background-image: var(--convex);
    color: var(--text); font-weight: var(--fw);
    &:hover { color: var(--accent); }
  }

  /* ── Folder ── */
  .s-folder {
    display: block; border: 0; padding: 0; margin: var(--u) 0;
    > summary {
      cursor: pointer; padding: calc(var(--u) * 1.5) 0; font-weight: var(--fwB);
      list-style: none; display: flex; align-items: center; gap: calc(var(--u) * 2); color: var(--text);
      &::-webkit-details-marker { display: none; }
      &::before {
        content: ''; width: 7px; height: 7px;
        border-right: var(--w) solid var(--dim); border-bottom: var(--w) solid var(--dim);
        transform: rotate(-45deg); transition: transform 140ms;
      }
    }
    &[open] > summary::before { transform: rotate(45deg); }
  }
  .s-content { padding: var(--u) 0 var(--u) calc(var(--u) * 4); border-left: 1px solid color-mix(in oklch, currentColor 10%, transparent); margin: calc(var(--u) * .5) 0 calc(var(--u) * .5) var(--u); }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition-duration: 0ms !important; }
  }
}`
}
