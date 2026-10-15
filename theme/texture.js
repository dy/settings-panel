/**
 * Material textures as CSS images, drawn from SVG turbulence (no assets). Each is neutral grey
 * centred on 50% so it only moves lightness: lay it over a surface with
 * `background-blend-mode: soft-light` (or overlay) and one texture suits every palette.
 *
 *   grain(k)        fine matte speckle (chalk, graphite, any painted material)
 *   woodGrain(k)    a board's long fine grain: thin horizontal streaks
 *   woodFigure(k)   the pale wavy figure of a planed face (a key or plate cut from lighter wood)
 *   surface(texture, shade, amount)  the calibrated layers for a surface of that material and shade
 *
 * k is the contrast: 0 is flat grey (no effect), 1 the full texture.
 */
import { parseColor } from './color.js'

const svg = (w, h, body) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${body}</svg>`)}")`
const n = v => +v.toFixed(3)
// Grey from the red channel of the noise, contrast k around 50%.
const grey = k => `<feColorMatrix type='matrix' values='${n(k)} 0 0 0 ${n(.5 - k / 2)}  ${n(k)} 0 0 0 ${n(.5 - k / 2)}  ${n(k)} 0 0 0 ${n(.5 - k / 2)}  0 0 0 0 1'/>`

export const grain = (k = 1) => svg(160, 160,
  `<filter id='t' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/>${grey(.55 * k)}</filter><rect width='100%' height='100%' filter='url(#t)'/>`)

export const woodGrain = (k = 1) => svg(480, 240,
  `<filter id='t' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='.004 .32' numOctaves='3' seed='7' stitchTiles='stitch'/>${grey(1.1 * k)}</filter><rect width='100%' height='100%' filter='url(#t)'/>`)

// Figure lines are isolines of a slow, horizontally stretched field: a sparse table keeps
// only a few thin bands of its values, lightened over mid grey.
export const woodFigure = (k = 1) => svg(360, 180,
  `<filter id='t' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='.003 .024' numOctaves='2' seed='11' stitchTiles='stitch'/>` +
  `<feComponentTransfer><feFuncR type='table' tableValues='0 0 0 0 0 .8 0 0 0 0 0 0 1 0 0 0 0 0 0 .7 0 0 0 0 0'/></feComponentTransfer>` +
  `<feGaussianBlur stdDeviation='.35'/>` +
  `<feColorMatrix type='matrix' values='${n(.5 * k)} 0 0 0 .5  ${n(.5 * k)} 0 0 0 .5  ${n(.5 * k)} 0 0 0 .5  0 0 0 0 1'/></filter>` +
  `<rect width='100%' height='100%' filter='url(#t)'/>`)

// Soft-light shows less of a texture the lighter the surface, so the contrast follows lightness:
// calibrated on the study's backgrounds (graphite L .24, bronze .73, chalk .96: luma σ .9, 3.2, 1.4).
const STOPS = [[.24, .12], [.73, .45], [.96, 1.1]]
const strength = L => {
  const i = STOPS.findIndex(([l]) => L < l)
  if (i === 0) return STOPS[0][1]
  if (i < 0) return STOPS.at(-1)[1]
  const [[l0, k0], [l1, k1]] = [STOPS[i - 1], STOPS[i]]
  return k0 + (k1 - k0) * (L - l0) / (l1 - l0)
}

/** The texture layers of a surface: `{ image, blend }` to put over its colour, or null for none.
 *  `image` carries each layer's position and size, so it belongs in the `background` shorthand
 *  (`background: ${image}, <colour>`), with `blend` as its `background-blend-mode`. Wood carries
 *  fine speckle across its streaks, as a sawn board does. `amount` scales the calibrated contrast
 *  (1 = the study's own, 0 = none). Tiles stay in px: grain is the material's, not the layout's. */
export function surface(texture, shade, amount = 1) {
  if (texture !== 'grain' && texture !== 'wood' || !(amount > 0)) return null
  const k = strength(parseColor(shade).L) * amount
  const layers = [`${grain(k)} 0 0 / 160px`]
  if (texture === 'wood') layers.push(`${woodGrain(k / 3)} 0 0 / 240px 120px`)
  return { image: layers.join(', '), blend: layers.map(() => 'soft-light').join(', ') }
}
