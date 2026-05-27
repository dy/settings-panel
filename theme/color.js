const { min, max } = Math

export const lerp = (a, b, t) => a + (b - a) * t
export const clamp = (v, lo, hi) => min(hi, max(lo, v))

/** Expand #rgb/#rgba shorthand; prepend # when omitted. Pass-through if not complete hex. */
export function normalizeHex(color) {
  if (typeof color !== 'string') return color
  const s = color.trim()
  if (!s || /^rgba?\(/i.test(s) || /^hsla?\(/i.test(s)) return s

  let hex = s.startsWith('#') ? s.slice(1) : s
  if (!/^[0-9a-f]{3,8}$/i.test(hex)) return s

  if (hex.length === 3 || hex.length === 4) {
    hex = [...hex].map(c => c + c).join('')
  }

  return '#' + hex.toLowerCase()
}

export function parseColor(color) {
  if (!color) return { L: 0.97, C: 0.01, H: 60 }
  const oklch = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
  if (oklch) return { L: +oklch[1], C: +oklch[2], H: +oklch[3] }

  const hex = normalizeHex(color)
  if (hex.startsWith('#') && (hex.length === 7 || hex.length === 9)) {
    const h = hex.slice(1, 7)
    const r = parseInt(h.slice(0, 2), 16) / 255
    const g = parseInt(h.slice(2, 4), 16) / 255
    const b = parseInt(h.slice(4, 6), 16) / 255
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

export const resolveAccent = (accent, shade) => {
  if (typeof accent !== 'number') return accent
  const { C, H } = parseColor(shade)
  const L = clamp(accent, 0, 1)
  return `oklch(${+L.toFixed(3)} ${+max(C, 0.15).toFixed(4)} ${+H.toFixed(1)})`
}

/** Convert OKLCH {L, C, H} to #rrggbb hex string */
export function toHex({ L, C, H }) {
  const a_ = C * Math.cos(H * Math.PI / 180)
  const b_ = C * Math.sin(H * Math.PI / 180)
  // OKLab → cbrt(LMS)
  const l_ = L + 0.3963377922 * a_ + 0.2158037587 * b_
  const m_ = L - 0.1055613423 * a_ - 0.0638541758 * b_
  const s_ = L - 0.0894841821 * a_ - 1.2914855380 * b_
  // Cube to get LMS → linear sRGB
  const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_
  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  const toSrgb = v => { v = clamp(v, 0, 1); return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055 }
  const h = c => Math.round(clamp(toSrgb(c), 0, 1) * 255).toString(16).padStart(2, '0')
  return '#' + h(lr) + h(lg) + h(lb)
}
