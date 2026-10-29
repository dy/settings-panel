/**
 * Skeu: one material, cut into keys and wells
 *
 * The panel is a plate of one material lit from above. Anything pressable is a keycap
 * cut from it: a dark silhouette edge, a lit top rim, a face lighter than the plate, the
 * key's front wall along its bottom, the dark line it stands on and a short shadow below.
 * Anything dragged (slider thumbs, the switch knob) is a cap of the same material, domed. Shadows
 * are light taken away: laid translucent, they darken whatever lies under them, an accent fill too.
 * Anything that holds a value is engraved: a well whose upper wall is in shadow and whose
 * lower lip catches the light. Lettering is printed in the ink and engraved with it (a lit
 * lower edge under dark ink, a shaded upper edge over light ink). On-states use the accent.
 *
 * Calibration: the "Customize" key of a material study, measured in its three finishes
 * (graphite, bronze, chalk). Any other surface reads between them by its lightness.
 *
 * Axes: shade (the material; a function `$(L, C, H, alpha)` may supply the whole ramp),
 * accent (on-states: switch, fill, check, focus; defaults to a deeper tone of the shade),
 * ink (lettering; derived from the shade when absent), texture ('grain' matte speckle,
 * 'wood' a board with planed key faces), depth (key height: wall, relief, shadow), bevel
 * (edge contrast, and rim width beyond 1), roundness (square → capsule for keys and wells,
 * the plate keeps rounding to 2), weight, spacing, size, grid (dots / lines / crosses).
 *
 * skeu(axes?) → CSS string
 */

import metrics from './metrics.js'
import { form } from './default.js'
import { parseColor, resolveAccent, toHex, lerp, clamp, luminance, ink as legible } from './color.js'
import { surface, woodFigure, woodGrain } from './texture.js'

const { min, max, cos, sin, atan2, hypot, PI } = Math

// Grid patterns: dots 2u (secondary), lines 4u (medium), crosses 8u (primary)
const GRID = {
  dots: (c, a, u) => { const s = 2 * u, h = s / 2; return { url: `url("data:image/svg+xml,%3Csvg width='${s}' height='${s}' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${h}' cy='${h}' r='${u * .15}' fill='rgba(${c},${a})'/%3E%3C/svg%3E")`, off: -h } },
  lines: (c, a, u) => { const s = 4 * u; return { url: `url("data:image/svg+xml,%3Csvg width='${s}' height='${s}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h${s}M0 0v${s}' stroke='rgba(${c},${a})' stroke-width='${u * .15}'/%3E%3C/svg%3E")`, off: 0 } },
  crosses: (c, a, u) => { const s = 8 * u, h = s / 2, arm = u; return { url: `url("data:image/svg+xml,%3Csvg width='${s}' height='${s}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M${h} ${h - arm}v${arm * 2}M${h - arm} ${h}h${arm * 2}' stroke='rgba(${c},${a})' stroke-width='${u * .15}'/%3E%3C/svg%3E")`, off: -h } },
}

// The study's finishes, by lightness: a tone measured in each reads between them for any
// other surface (clamped past the ends). Bronze is a saturated wood: its deep edges belong to its
// colour, so a surface takes them by its chroma, and a grey (silver, a mid grey) reads between
// graphite and chalk, the two neutral finishes.
const FINISH = ['#1e1e1e', '#ca9d63', '#f1f2f4'].map(c => parseColor(c))
const study = (L, C) => ([g, b, c]) => {
  const [lg, lb, lc] = FINISH.map(f => f.L)
  const neutral = L <= lg ? g : L >= lc ? c : lerp(g, c, (L - lg) / (lc - lg))
  const warm = L <= lg ? g : L >= lc ? c : L < lb ? lerp(g, b, (L - lg) / (lb - lg)) : lerp(b, c, (L - lb) / (lc - lb))
  return lerp(neutral, warm, clamp(C / FINISH[1].C, 0, 1))
}

// The Customize key, measured as lightness offsets from the surface in each finish
// (graphite, bronze, chalk): silhouette edge, lit top rim, the face from under the rim to its
// lower edge, the front wall, the dark line it stands on; then its shadow's two layers (tight
// contact, long falloff) fitted to the profile of the plate below it, laid as translucent shade
// (where they overlap they deepen each other, as two occlusions do).
const KEY = {
  outline: [-.048, -.13, -.05],
  rim: [.204, .168, .03],
  top: [.117, .111, .015],
  mid: [.103, .033, .02],
  low: [.09, -.02, .024],
  wall: [.067, -.088, -.011],
  base: [-.067, -.208, -.194],
  contact: [-.028, -.035, -.05],
  falloff: [-.016, -.156, -.048],
}
// Engraved wells in the same light: the floor a little below the plate, the upper wall in
// shadow, the lower lip catching the light.
const WELL = {
  floor: [-.035, -.03, -.022],
  wall: [-.1, -.17, -.12],
  shade: [-.12, -.2, -.14],
  lip: [.07, .1, .03],
}

// A colour squared in sRGB: the material multiplied into itself, the tint light takes after
// bouncing twice inside it. Its shadows borrow this hue and chroma.
const squared = tone => parseColor('#' + toHex(tone).slice(1).match(/../g)
  .map(h => Math.round(parseInt(h, 16) ** 2 / 255).toString(16).padStart(2, '0')).join(''))

export default function skeu({
  shade = '#f5f4f2',
  accent,
  ink,
  texture = 'grain',
  grid = [],
  spacing = 1,
  weight = 400,
  depth = 1,
  roundness = 1,
  bevel = 1,
  size = 1,
  font,
} = {}) {

  const isFunc = typeof shade === 'function'
  const S = isFunc ? { L: .97, C: .01, H: 60 } : parseColor(shade)
  const { L: sL, C: sC, H: sH } = S
  const dark = sL < .6
  const $ = isFunc ? (L, C, H, alpha) => shade(L, C, H, alpha) : (L, C, H, alpha) => {
    const lch = `${+clamp(L, 0, 1).toFixed(3)} ${+max(0, C).toFixed(4)} ${+H.toFixed(1)}`
    return alpha != null ? `oklch(${lch} / ${+clamp(alpha, 0, 1).toFixed(3)})` : `oklch(${lch})`
  }

  // ── One material, one light ──
  // tone(d): the material d lighter or darker. Lighter mixes toward white (chroma thins);
  // darker takes the hue and chroma of the material squared, as shadow inside it does.
  const deep = squared(S)
  const ab = ({ C, H }) => [C * cos(H * PI / 180), C * sin(H * PI / 180)]
  const [a0, b0] = ab(S), [a1, b1] = ab(deep)
  const toneOf = d => {
    const L = clamp(sL + d, 0, 1)
    if (d >= 0) return { L, C: sC * (1 - clamp(d / max(1 - sL, .001), 0, 1)), H: sH }
    const t = clamp(-d / max(sL - deep.L, .02), 0, 2), a = lerp(a0, a1, t), b = lerp(b0, b1, t)
    return { L, C: hypot(a, b), H: (atan2(b, a) * 180 / PI + 360) % 360 }
  }
  const tone = (d, alpha) => { const { L, C, H } = toneOf(d); return $(L, C, H, alpha) }
  // A shadow is light taken away: the colour and opacity that give tone(d) (at alpha) exactly over
  // the plate (or the tone `on` it lies on), and over anything darker (an accent fill, a groove) darken it
  // rather than paint a lighter tone there as a glow. The least opacity keeps the colour as dark as the hue allows.
  const srgb = c => toHex(c).slice(1).match(/../g).map(h => parseInt(h, 16) / 255)
  const P = isFunc ? null : srgb(S)
  const shadow = (d, alpha = 1, on = 0) => {
    if (!P) return tone(d, alpha)
    const G = on ? srgb(toneOf(on)) : P, T = srgb(toneOf(d)), t = G.map((p, i) => p + alpha * (T[i] - p))
    const k = min(1, max(.001, ...G.map((p, i) => p > 0 ? (p - t[i]) / p : 0)))
    return `rgb(${G.map((p, i) => Math.round(clamp(p + (t[i] - p) / k, 0, 1) * 255)).join(' ')} / ${+k.toFixed(3)})`
  }
  const at = study(sL, sC)
  const K = Object.fromEntries(Object.entries(KEY).map(([n, v]) => [n, at(v)]))
  const W = Object.fromEntries(Object.entries(WELL).map(([n, v]) => [n, at(v)]))

  // ── Axes → physics ──
  // depth: key height (front wall, face relief, shadow throw); bevel: edge contrast, then rim width
  const D = clamp(depth, 0, 3), relief = min(D, 2)
  const E = bevel <= 1 ? lerp(.3, 1, clamp(bevel, 0, 1)) : lerp(1, 1.25, clamp(bevel - 1, 0, 1))
  const rimW = +(bevel <= 1 ? 1 : lerp(1, 2, clamp(bevel - 1, 0, 1))).toFixed(2)
  // A key's box is the family's one measure: the line it stands on and its front wall above it close the face's
  // lower edge inside the box, so the silhouette wraps them round the ends as one edge (anything drawn below the
  // box drew a second crescent outside the silhouette there)
  const wallH = relief ? +(1 + 2 * relief).toFixed(2) : 0
  const travel = wallH ? .75 : 0
  const len = n => `calc(${+n.toFixed(3)} * var(--length))`

  // A key's tones: its face (lift 1 = the study's lifted face, 0 = flush with the plate),
  // edges set against the face they bound.
  const keyTones = lift => {
    const mid = K.mid * lift, top = mid + (K.top - K.mid) * relief, low = mid + (K.low - K.mid) * relief
    return {
      top, mid, low,
      rim: top + (K.rim - K.top) * E,
      wall: low + (K.wall - K.low) * E,
      outline: K.outline * E,
      base: K.base * E,
    }
  }
  const lifted = keyTones(1), flush = keyTones(0)
  // The face falls off quickly under the rim, then slowly to its lower edge
  const faceOf = t => `linear-gradient(180deg, ${tone(t.top)} 6%, 20%, ${tone(t.mid)} 50%, ${tone(t.low)} 90%)`
  // A round cap (slider thumbs, the switch knob, the pad's dot, the knob) is the key's material on a
  // dome: its crown faces the light and takes the face's top, its lower side turns away to the tone of
  // the key's front wall. It keeps the key's rim, silhouette, base line and shadow; a dome has no wall.
  const domeOf = t => `radial-gradient(circle farthest-corner at 50% 30%, ${tone(t.top)}, ${tone(t.mid)} 40%, ${tone(t.low)} 62%, ${tone(t.wall)} 88%)`
  // Its shadow at elevation e (1 at rest, higher under a hovering finger), from the key's lower edge
  const drop = (e = 1) => D ? [
    `0 ${len(.5 * D * e)} ${len(1.5 * D * e)} ${shadow(K.contact)}`,
    `0 ${len(2.5 * D * e)} ${len(6 * D * e)} ${len(-1)} ${shadow(K.falloff)}`,
  ] : []
  // In proportion at every size: the line it stands on, the silhouette edge (1 unit all round, as the study draws
  // it over the top too), the lit rim, and a key's front wall under them (a pressed key or a cap has none, and a
  // thinner line).
  const edges = (c, wall = true) => [
    `inset 0 ${len(wall && wallH ? -1 : -.75)} 0 ${c.base}`,
    `inset 0 0 0 ${len(1)} ${c.outline}`,                                      // silhouette edge
    `inset 0 ${len(1 + rimW)} 0 ${c.rim}`,                                  // lit rim
    ...(wall && wallH ? [`inset 0 ${len(-wallH)} 0 ${c.wall}`] : []),
  ]
  // the silhouette edge is shade laid over the key's lit rim (its tone exactly there): over the face it falls deeper,
  // so the rounded ends, where the face turns from the light, darken by themselves (the study's ends)
  const colors = t => ({ base: tone(t.base), wall: tone(t.wall), outline: shadow(t.outline, 1, t.rim), rim: tone(t.rim) })
  const keyShadow = (c, e, wall = true) => [...edges(c, wall), ...(wall ? drop(e) : [])].join(', ')
  const capShadow = (c, e = 1) => [...edges(c, false), ...drop(e)].join(', ')
  // The same key over a face of any colour (swatches): its edges as light and shade
  const glaze = {
    base: shadow(K.base * E, .55), outline: shadow(K.outline * E, 1, K.rim),
    rim: `oklch(1 0 0 / ${+(.45 * E).toFixed(3)})`, wall: `oklch(0 0 0 / ${+(.16 * E).toFixed(3)})`,
  }

  // ── Wells ── the inner shades are shadows too: over an accent fill they deepen it
  const floor = tone(W.floor)
  const well = [
    `inset 0 1px 0 ${shadow(W.floor + (W.wall - W.floor) * E)}`,             // upper wall, in shadow
    `inset 0 ${len(1.5)} ${len(3)} ${shadow(W.shade, .45 * E)}`,                // its shade on the floor
    `inset 0 0 0 1px ${shadow(K.outline * E, .7)}`,                           // the cut
    `0 1px 0 ${tone(W.lip * E)}`,                                             // lower lip, lit
  ].join(', ')

  // ── Textures: the plate (and keys flush with it) by the shared calibration; a lifted face is a
  // lighter planed board with its figure, or the same grain at its own lightness ──
  const plateTex = surface(texture, shade)
  const faceTex = texture === 'wood'
    ? { image: `${woodFigure(1.1)} ${len(-30)} 0 / ${len(120)} ${len(60)}, ${woodGrain(.12)} 0 0 / ${len(240)} ${len(120)}`, blend: 'soft-light, soft-light' }
    : surface(texture, tone(lifted.mid))
  // A cap is turned, not planed: it shows the material's grain at its own lightness, no figure
  const capTex = surface(texture, tone(lifted.mid))
  const layer = (tex, grad) => tex ? `${tex.image}, ${grad}` : grad
  const blend = tex => tex ? `${tex.blend}, normal` : 'normal'

  // ── Colour: accent for on-states, ink for lettering, each legible where it is printed ──
  const plate = $(sL, sC, sH)
  const resolved = resolveAccent(accent, shade)
  const A = resolved ? parseColor(resolved, null) : { L: dark ? .78 : .42, C: min(sC * 1.2, .05), H: sH }
  const accentCSS = A ? $(A.L, A.C, A.H) : resolved
  const accentDark = (luminance(accentCSS) ?? 0) <= .179
  const onAccent = legible(accentCSS, 4.5, accentDark ? tone(lifted.top) : plate)
  const inkTone = ink ?? $(dark ? .96 : .2, sC * (dark ? .3 : .5), sH)
  const I = parseColor(inkTone, null)
  const inkL = I ? I.L : dark ? 1 : 0
  // Each ink is kept legible on every surface it may land on, judged by the one nearest to it
  // in lightness; on a key, the band of its face the lettering covers.
  const legibleOn = (tint, ...ds) => legible(tone(inkL < sL ? min(...ds) : max(...ds)), 4.5, tint)
  const lettered = t => [t.mid + (t.top - t.mid) * .4, t.mid + (t.low - t.mid) * .4]
  const onPlate = legibleOn(inkTone, 0, ...lettered(flush))
  const onKey = legibleOn(inkTone, ...lettered(lifted))
  const onWell = legibleOn(inkTone, W.floor)
  const dim = I ? legibleOn({ L: lerp(I.L, sL, .4), C: I.C, H: I.H }, 0, W.floor, ...lettered(flush)) : `color-mix(in oklab, ${inkTone} 65%, ${plate})`
  // A placeholder is the dim ink at 80% on a well's floor (3.4:1), held to 4.5:1 there
  const placeholder = I ? legibleOn({ L: lerp(lerp(I.L, sL, .4), sL + W.floor, .2), C: I.C, H: I.H }, W.floor) : dim
  // Engraved lettering: under dark ink its lower edge is lit, over light ink its upper edge is shaded
  const engrave = (surfaceL, lit, shaded) => inkL < surfaceL ? { dy: 1, color: lit } : { dy: -1, color: shaded }
  const onPlateEdge = engrave(sL, tone(K.rim * .7 * E, .75), tone(K.base * E, .85))
  const onKeyEdge = engrave(sL + lifted.mid, tone(lifted.rim), tone(lifted.base))
  const shadowOf = e => `0 ${e.dy}px 0 ${e.color}`

  // Slider thumb: equal-area square (4u) → circle (4.5u across) as roundness 0 → 1
  const thumbT = clamp(roundness, 0, 1)
  const thumbU = lerp(4.5 * Math.sqrt(PI) / 2, 4.5, thumbT)
  const thumbR = `calc(var(--u) * ${+(thumbU * thumbT / 2).toFixed(4)})`

  // Grid layers over the plate's texture
  const gridList = Array.isArray(grid) ? grid : (grid && grid !== 'none' ? [grid] : [])
  const gc = dark ? '255,255,255' : '0,0,0', ga = dark ? '.05' : '.06'
  const gridLayers = gridList.map(g => GRID[g]?.(gc, ga, 4)).filter(Boolean)
  const plateLayers = [...gridLayers.map(l => `${l.url} ${l.off}px ${l.off}px`), ...(plateTex ? [plateTex.image] : [])]
  const plateBlend = [...gridLayers.map(() => 'normal'), ...(plateTex ? [plateTex.blend] : []), 'normal']

  // Glyphs: one stroke weight and one optical size (a 3.5u box) for chevrons and checks; the
  // stepper's smaller chevron keeps the same stroke in px
  const stroke = max(1.2, weight / 330) * 1.2
  const svg = body => `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg'%3E${body}%3C/svg%3E")`
  const chevronOf = w => svg(`%3Cpolyline points='3,4.5 6,7.5 9,4.5' fill='none' stroke='%23000' stroke-width='${+w.toFixed(3)}' stroke-linecap='round' stroke-linejoin='round'/%3E`)
  const chevron = chevronOf(stroke), chevronSm = chevronOf(stroke * 3.5 / 2.5)
  const check = svg(`%3Cpolyline points='2.5,6.2 5,8.6 9.5,3.6' fill='none' stroke='%23000' stroke-width='${+stroke.toFixed(3)}' stroke-linecap='round' stroke-linejoin='round'/%3E`)

  // Shared surfaces, as declaration blocks
  const key = (kind = 'key', shadow = `var(--${kind})`) => `
    border: none;
    background: var(--${kind}-image);
    background-blend-mode: var(--${kind}-blend);
    box-shadow: ${shadow};`
  const sunk = `
    border: none;
    background: var(--floor);
    box-shadow: var(--well);`
  // A key rises a little under the pointer and, pressed, travels down onto its wall
  const press = (kind = 'key') => `
    transition: transform 90ms, box-shadow 140ms, filter 140ms;
    &:not(:disabled):hover { box-shadow: var(--${kind}-up); filter: var(--hover); }
    &:not(:disabled):active { transform: translateY(var(--travel)); box-shadow: var(--${kind}-down); filter: none; }`
  const glyph = (mask, color) => `
    background: ${color};
    -webkit-mask: ${mask} center / contain no-repeat;
    mask: ${mask} center / contain no-repeat;`
  // One thumb for every range input (slider, interval, the colour's alpha): a cap, in its states
  const thumb = `
      &::-webkit-slider-thumb { -webkit-appearance: none; ${key('cap')} width: var(--thumb); height: var(--thumb); border-radius: ${thumbR}; cursor: grab; transition: filter 140ms, box-shadow 90ms; }
      &::-moz-range-thumb { ${key('cap')} width: var(--thumb); height: var(--thumb); border-radius: ${thumbR}; cursor: grab; }
      &:hover::-webkit-slider-thumb { box-shadow: var(--cap-up); filter: var(--hover); }
      &:hover::-moz-range-thumb { box-shadow: var(--cap-up); filter: var(--hover); }
      &:active::-webkit-slider-thumb { box-shadow: var(--cap-down); cursor: grabbing; }
      &:active::-moz-range-thumb { box-shadow: var(--cap-down); cursor: grabbing; }
      &:focus-visible { outline: none; }
      &:focus-visible::-webkit-slider-thumb { box-shadow: var(--cap), 0 0 0 2px var(--bg), 0 0 0 4px var(--focus); }
      &:focus-visible::-moz-range-thumb { box-shadow: var(--cap), 0 0 0 2px var(--bg), 0 0 0 4px var(--focus); }`

  // Body 14px: skeu sets its labels and values at 14px.
  const body = 14
  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body, controlHeight: 34, rowGap: 14, sectionGap: 14, panelPadding: 22, fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif" })}

  --bg: ${plate};
  --accent: ${accentCSS};
  --on-accent: ${onAccent};
  --focus: var(--accent);
  --roundness: ${roundness};
  --weight: ${weight};
  color-scheme: ${dark ? 'dark' : 'light'};

  --ink: ${onPlate};
  --ink-key: ${onKey};
  --ink-well: ${onWell};
  --ink-dim: ${dim};
  --ink-placeholder: ${placeholder};
  --engrave: ${shadowOf(onPlateEdge)};
  --engrave-key: ${shadowOf(onKeyEdge)};

  --key-image: ${layer(faceTex, faceOf(lifted))};
  --key-blend: ${blend(faceTex)};
  --flush-image: ${layer(plateTex, faceOf(flush))};
  --flush-blend: ${blend(plateTex)};
  --key: ${keyShadow(colors(lifted))};
  --key-up: ${keyShadow(colors(lifted), 1.5)};
  --key-down: ${keyShadow(colors(lifted), 0, false)};
  --cap-image: ${layer(capTex, domeOf(lifted))};
  --cap-blend: ${blend(capTex)};
  --cap: ${capShadow(colors(lifted))};
  --cap-up: ${capShadow(colors(lifted), 1.5)};
  --cap-down: ${capShadow(colors(lifted), 0)};
  --flush: ${keyShadow(colors(flush))};
  --flush-up: ${keyShadow(colors(flush), 1.5)};
  --flush-down: ${keyShadow(colors(flush), 0, false)};
  --glaze: ${keyShadow(glaze)};
  --glaze-up: ${keyShadow(glaze, 1.5)};
  --floor: ${floor};
  --well: ${well};
  --edge: ${tone(W.wall * E)};
  --catch: ${tone(W.lip * E)};
  --travel: ${len(travel)};
  --wall: ${len(wallH)};
  --hover: brightness(${+(1 + .12 * (1 - clamp(sL + lifted.mid, 0, 1))).toFixed(3)});

  /* Keys and wells are capsules at roundness 1; the plate keeps rounding past it */
  --round: min(var(--roundness), 1);
  --h: var(--control-height);
  --rk: calc(var(--h) / 2 * var(--round));
  --r: calc((var(--h) / 2 + var(--panel-padding) / 4) * var(--roundness));
  --thumb: calc(var(--u) * ${+thumbU.toFixed(4)});
  --gap: ${len(3)};
  /* Type: one body size (labels, values, keys, folder titles), one secondary step for the small print */
  --font-size-small: calc(12 * var(--length));

  color: var(--ink);
  background: ${[...plateLayers, 'var(--bg)'].join(', ')};
  background-blend-mode: ${plateBlend.join(', ')};
  border-radius: var(--r);
  box-shadow: inset 0 0 0 1px ${tone(K.outline * E * .8)}, inset 0 ${rimW}px 0 ${tone(K.rim * .6 * E)}, 0 ${len(D)} ${len(2 * D)} ${shadow(K.contact, .8)}, 0 ${len(10 * D)} ${len(28 * D)} ${len(-6)} ${shadow(K.falloff * 1.5, .6)};
  text-shadow: var(--engrave);
  isolation: isolate;
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Rows ── */
  .s-control { align-items: center; }
  /* under a hint the row aligns at the top, the label's first line level with the control's text */
  .s-control:has(> .s-label-group .s-hint) { align-items: flex-start; > .s-label-group { padding-top: calc((var(--h) - var(--line-height)) / 2); } }
  .s-input { align-items: center; }
  .s-select.s-radio, .s-select.s-checkboxes, .s-textarea, .s-xy { align-items: flex-start; .s-label-group { padding-top: calc((var(--h) - var(--line-height)) / 2); } }
  .s-select.s-radio .s-input, .s-select.s-checkboxes .s-input { align-items: stretch; }
  .s-label { color: var(--ink); font-weight: calc(var(--weight) + 100); }
  .s-hint { color: var(--ink-dim); opacity: 1; }
  :is(.s-hint, span.s-readout, .s-mark-label, .s-tooltip, .s-separator-label, .s-knob-val, .s-pad-val, .s-vec-label, .s-title-text) { font-size: var(--font-size-small); }
  .s-title { border: none; color: var(--ink-dim); box-shadow: inset 0 0 0 1px var(--edge); text-shadow: none; }
  .s-title-text { ${key('flush', 'var(--glaze)')} color: var(--ink); text-shadow: var(--engrave-key); border-radius: calc(var(--u) * 2 * var(--round)); }

  /* ── Title, with the fold key ── */
  > summary, > .s-panel-title {
    color: var(--ink);
    font-size: 1.125em;
    font-weight: calc(var(--weight) + 200);
    letter-spacing: .01em;
    min-height: var(--h);
    gap: calc(var(--u) * 2);
  }
  > summary::after { display: none; }
  > summary:focus-visible { outline: none; .s-fold-icon { outline: 2px solid var(--focus); outline-offset: 2px; } }
  .s-fold-icon, .s-search-btn {
    ${key()}
    display: inline-grid; place-items: center; flex: none;
    width: var(--h); height: var(--h); padding: 0;
    border-radius: calc(var(--h) / 2 * var(--round));
    -webkit-mask: none; mask: none;
    cursor: pointer;
    ${press()}
  }
  .s-fold-icon {
    margin-left: auto; order: 2;
    .s-search ~ &, :has(> .s-search) > & { margin-left: 0; }
    i { position: relative; width: calc(var(--u) * 3.5); height: calc(var(--u) * 3.5); translate: 0 calc(var(--wall) / -2); }  /* centred on the face, above the wall */
    i::before, i::after { content: ''; position: absolute; inset: 0; transition: transform 200ms; }
    i::before { ${glyph(chevron, onKeyEdge.color)} transform: translateY(${onKeyEdge.dy}px); }
    i::after { ${glyph(chevron, 'var(--ink-key)')} }
  }
  &[open] .s-fold-icon i::after { transform: rotate(180deg); }
  &[open] .s-fold-icon i::before { transform: translateY(${onKeyEdge.dy}px) rotate(180deg); }
  > summary:hover .s-fold-icon { box-shadow: var(--key-up); filter: var(--hover); }
  > summary:active .s-fold-icon { transform: translateY(var(--travel)); box-shadow: var(--key-down); filter: none; }

  /* ── Search: a round key that opens into a well ── */
  .s-search { order: 1; margin-left: auto; gap: var(--gap); }
  .s-search-btn::after { content: ''; width: 45%; height: 45%; ${glyph('var(--s-search-icon)', 'var(--ink-key)')} }
  .s-search-input { ${sunk} height: var(--h); border-radius: var(--rk); padding: 0 calc(var(--u) * 3); color: var(--ink-well); text-shadow: none; &::placeholder { color: var(--ink-placeholder); opacity: 1; } }

  /* ── Fields: engraved ── */
  input[type="text"], input[type="number"], textarea {
    ${sunk}
    height: var(--h);
    border-radius: var(--rk);
    padding: 0 max(var(--pad), var(--rk) * .75);
    color: var(--ink-well);
    text-shadow: none;
    &::placeholder { color: var(--ink-placeholder); opacity: 1; }
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  }
  textarea { height: auto; padding: var(--pad) max(var(--pad), var(--rk) * .75); border-radius: calc(var(--u) * 2.5 * var(--round)); background-color: var(--floor); }
  input.s-scrubbing { color: var(--ink-well); }

  /* ── Select: a flush key with an engraved chevron ── */
  .s-select select {
    ${key('flush')}
    appearance: none; -webkit-appearance: none;
    height: var(--h);
    border-radius: var(--rk);
    padding: 0 calc(var(--u) * 8) 0 max(var(--pad), var(--rk) * .75);
    color: var(--ink);
    text-shadow: var(--engrave);
    ${press('flush')}
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    option { background: var(--bg); color: var(--ink); text-shadow: none; font-weight: 400; }
  }
  .s-select.s-dropdown .s-input {
    position: relative;
    &::before, &::after {
      content: ''; position: absolute; top: 50%; right: max(var(--pad), var(--rk) * .6);
      width: calc(var(--u) * 3.5); height: calc(var(--u) * 3.5);
      margin-top: calc(var(--u) * -1.75 - var(--wall) / 2); pointer-events: none;
    }
    &::before { ${glyph(chevron, onPlateEdge.color)} transform: translateY(${onPlateEdge.dy}px); }
    &::after { ${glyph(chevron, 'var(--ink)')} }
    &:has(select:active)::before, &:has(select:active)::after { translate: 0 var(--travel); }
  }

  /* ── Boolean ── */
  .s-boolean {
    label { display: flex; cursor: pointer; }
    .s-input { min-height: var(--h); }   /* switch, checkbox and toggle rows keep the fields' pitch */
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }
    &.s-switch {
      .s-track {
        ${sunk}
        --sw: calc(var(--h) - var(--pad));
        width: calc(var(--sw) * 1.8); height: var(--sw);
        margin: 0;
        border-radius: calc(var(--sw) / 2 * var(--round));
        position: relative; cursor: pointer;
        transition: background-color 160ms;
        &::after {
          content: '';
          ${key('cap')}
          position: absolute; top: ${len(2)}; left: ${len(2)};
          width: calc(var(--sw) - ${len(4)}); height: calc(var(--sw) - ${len(4)});
          margin: 0;
          border-radius: calc((var(--sw) - ${len(4)}) / 2 * var(--round));
          transition: transform 180ms cubic-bezier(.3, .7, .4, 1), box-shadow 90ms;
        }
      }
      .s-input:hover .s-track::after { box-shadow: var(--cap-up); filter: var(--hover); }
      .s-input:active .s-track::after { box-shadow: var(--cap-down); }
      &:has(input:checked) .s-track { background-color: var(--accent);
        &::after { transform: translateX(calc(var(--sw) * .8)); } }
    }
    &.s-toggle {
      .s-track {
        ${key('flush')}
        height: var(--h); padding: 0 calc(var(--u) * 4);
        border-radius: var(--rk);
        color: var(--ink); text-shadow: var(--engrave);
        font-size: inherit; font-weight: calc(var(--weight) + 100);
        overflow: visible;
        transition: transform 90ms, box-shadow 140ms, filter 140ms;
        &::before { display: none; }
        &::after { content: 'Off'; color: inherit; }
      }
      &:not(:has(input:checked)) .s-input:hover .s-track { box-shadow: var(--flush-up); filter: var(--hover); }
      &:not(:has(input:checked)) .s-input:active .s-track { transform: translateY(var(--travel)); box-shadow: var(--flush-down); filter: none; }
      &:has(input:checked) .s-track {
        ${sunk}
        background: var(--accent);
        color: var(--on-accent); text-shadow: none;
        &::after { content: 'On'; color: inherit; }
      }
    }
    &.s-checkbox {
      .s-track {
        ${sunk}
        display: grid; place-items: center; position: relative;
        width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5);
        border-radius: calc(var(--u) * 1.25 * var(--round));
        transition: background-color 140ms;
        &::after {
          content: ''; position: absolute; inset: calc(var(--u) * .5);
          ${glyph(check, 'var(--on-accent)')}
          opacity: 0; transform: scale(.5); transition: opacity 140ms, transform 140ms;
        }
      }
      &:has(input:checked) .s-track { background-color: var(--accent); &::after { opacity: 1; transform: none; } }
    }
  }

  /* ── Number: a well, its steppers two chevrons engraved at its end, where a select's chevron stands ── */
  .s-number .s-input { position: relative; }
  .s-number input[type="number"] { padding-right: calc(var(--u) * 7.5); -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; } }
  .s-number .s-step {
    position: absolute; right: calc(var(--u) * 2.5); top: 0; bottom: 0; justify-content: center; gap: 0;
    button {
      width: calc(var(--u) * 3); height: calc(var(--u) * 2.75); padding: 0; border: none; background: none; box-shadow: none;
      font-size: 0; opacity: 1; cursor: pointer; color: var(--ink-dim); &:hover { color: var(--ink); }
      &::before { content: ''; width: calc(var(--u) * 2.5); height: calc(var(--u) * 2.5); ${glyph(chevronSm, 'currentColor')} }
    }
    .s-step-up::before { rotate: 180deg; }
  }

  /* ── Slider: an engraved groove, the accent inside it, a round key to drag ── */
  .s-slider {
    .s-track { height: var(--h); margin: 0; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: var(--lh); }
    input[type="range"] {
      ${sunk}
      --fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--t, 0));
      background-image: var(--track, linear-gradient(to right, var(--accent) var(--fill), transparent var(--fill)));
      height: calc(var(--u) * 2);
      border-radius: calc(var(--u) * var(--round));
      overflow: visible;
      appearance: none; -webkit-appearance: none;
      ${thumb}
    }
    datalist { display: none; }
    .s-marks, .s-mark-labels { left: calc(var(--thumb) / 2); right: calc(var(--thumb) / 2); }
    .s-marks { display: flex; }
    .s-mark {
      position: absolute; top: calc(50% + var(--u) * 2); width: 1px; height: calc(var(--u) * 1.25);
      background: var(--edge); box-shadow: 1px 0 0 var(--catch);
      transform: translateX(-50%);
    }
    .s-mark-label { color: var(--ink-dim); opacity: 1; &.s-active { color: var(--ink); } }
    .s-readout { color: var(--ink-dim); opacity: 1; font-variant-numeric: tabular-nums; text-shadow: none; }
    /* An editable readout is a field, in the small type and three quarters of the field's inset (beside a slider the
       number is secondary to it), as wide as its value (at least three figures, so the track holds still while a
       short value is dragged) */
    input[type="text"].s-readout { flex: none; font-size: var(--font-size-small); padding: 0 calc(var(--pad) * .75); color: var(--ink-well); text-align: center;
      width: calc(7ch + 1.5 * var(--pad)); min-width: calc(3ch + 1.5 * var(--pad));
      @supports (field-sizing: content) { field-sizing: content; width: auto; } }
    .s-tooltip { ${key('flush', 'var(--glaze)')} bottom: calc(50% + var(--thumb) / 2); border-radius: calc(var(--u) * 1.5 * var(--round)); color: var(--ink); text-shadow: var(--engrave-key); }
    &.s-multiple .s-interval-track {
      height: var(--h); margin: 0;
      background: none;
      input[type="range"] {
        --low-fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--low, 0%) / 100%);
        --high-fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--high, 100%) / 100%);
        top: 50%; height: calc(var(--u) * 2); translate: 0 -50%;
        &.s-interval-lo { ${sunk} background-image: linear-gradient(to right, transparent var(--low-fill), var(--accent) var(--low-fill), var(--accent) var(--high-fill), transparent var(--high-fill)); }
        &.s-interval-hi { background: none; box-shadow: none; }
      }
    }
  }

  /* ── Segmented: one engraved track, the chosen option a key inside it ── */
  .s-select.s-segmented {
    .s-input {
      ${sunk}
      gap: 0; padding: var(--gap);
      min-height: var(--h);
      border-radius: var(--rk);
    }
    button {
      flex: 1 1 auto; min-width: 0; margin: 0; white-space: nowrap;   /* each label its width and an equal share: one inset for all */
      height: calc(var(--h) - var(--gap) * 2); padding: 0 max(var(--pad), (var(--rk) - var(--gap)) * .75);
      border: none; border-radius: calc(var(--rk) - var(--gap) * var(--round));
      background: none; box-shadow: none;
      color: var(--ink-dim); font-size: inherit; text-shadow: none;
      transition: color 140ms, box-shadow 140ms, transform 90ms;
      &:hover { filter: none; color: var(--ink-well); }
      &:active { filter: none; }
      &.s-selected {
        ${key()}
        color: var(--ink-key); text-shadow: var(--engrave-key);
        font-weight: calc(var(--weight) + 100);
        &:hover { box-shadow: var(--key-up); filter: var(--hover); }
        &:active { transform: translateY(var(--travel)); box-shadow: var(--key-down); filter: none; }
      }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 1px; }
    }
  }

  /* ── Radio and checkbox lists: engraved, filled with the accent when on ── */
  .s-select.s-radio {
    .s-input label { color: var(--ink-dim); &.s-selected { color: var(--ink); } }
    input[type="radio"] {
      ${sunk}
      appearance: none; -webkit-appearance: none; flex: none; margin: 0;
      width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5); border-radius: 50%;
      cursor: pointer; transition: background 140ms;
      &:checked { background: radial-gradient(circle, var(--on-accent) 0 28%, var(--accent) 33%); }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    }
  }
  .s-select.s-checkboxes {
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 2); cursor: pointer; }
    .s-track {
      ${sunk}
      display: grid; place-items: center; position: relative; flex-shrink: 0;
      width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5);
      border-radius: calc(var(--u) * 1.25 * var(--round));
      transition: background-color 140ms;
      &::after {
        content: ''; position: absolute; inset: calc(var(--u) * .5);
        ${glyph(check, 'var(--on-accent)')}
        opacity: 0; transform: scale(.5); transition: opacity 140ms, transform 140ms;
      }
    }
    .s-input label:has(input:checked) .s-track { background-color: var(--s-color, var(--accent)); &::after { opacity: 1; transform: none; } }
    .s-input label:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }
  }

  /* ── Color: a swatch key set into a well ── */
  .s-color.s-picker .s-color-input {
    ${sunk}
    --chip: calc(var(--h) - var(--gap) * 2);
    min-height: var(--h);
    border-radius: var(--rk);
    &:focus-within { outline: 2px solid var(--focus); outline-offset: 2px; }
    input[type="color"] {
      left: var(--gap); top: var(--gap);
      width: calc(var(--chip) * 1.4); height: var(--chip);
      padding: 0; border: none; background: none; box-shadow: none;
      border-radius: calc(var(--chip) / 2 * var(--round));
      -webkit-appearance: none; appearance: none;
      &:focus-visible { outline: none; }
      &::-webkit-color-swatch-wrapper { padding: 0; border-radius: inherit; }   /* the swatch rounds as its input does, so its edges follow the curve */
      &::-webkit-color-swatch { border: none; border-radius: inherit; box-shadow: var(--glaze); }
      &::-moz-color-swatch { border: none; border-radius: inherit; box-shadow: var(--glaze); }
    }
    input[type="text"] {
      height: var(--h);
      padding-left: calc(var(--gap) + var(--chip) * 1.4 + var(--pad));
      background: transparent; box-shadow: none;
      &:focus-visible { outline: none; }
    }
  }
  .s-color.s-rgba .s-color-input {
    input[type="color"] {
      width: var(--h); height: var(--h); padding: 0; border: none; background: none;
      border-radius: calc(var(--h) / 2 * var(--round));
      -webkit-appearance: none; appearance: none;
      &::-webkit-color-swatch-wrapper { padding: 0; border-radius: inherit; }   /* the swatch rounds as its input does, so its edges follow the curve */
      &::-webkit-color-swatch { border: none; border-radius: inherit; box-shadow: var(--glaze); }
      &::-moz-color-swatch { border: none; border-radius: inherit; box-shadow: var(--glaze); }
    }
    .s-alpha {
      box-shadow: var(--well); height: calc(var(--u) * 2); border-radius: calc(var(--u) * var(--round));
      ${thumb}
    }
  }
  .s-color.s-swatches .s-input { gap: calc(var(--u) * 1.5); }
  .s-color.s-swatches button {
    width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5);
    border: none; box-shadow: var(--glaze);
    border-radius: calc(var(--u) * 1.5 * var(--round));
    transition: transform 90ms, box-shadow 140ms;
    &:hover { box-shadow: var(--glaze-up); }
    &:active { transform: translateY(var(--travel)); }
    &.s-selected { box-shadow: var(--glaze), 0 0 0 2px var(--bg), 0 0 0 4px var(--accent); }
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 5px; }
  }

  /* ── Buttons, keys: the primary lifted from the plate, the secondary flush with it ── */
  .s-button button {
    ${key()}
    flex: 1; min-width: 0;
    height: var(--h); padding: 0 max(var(--pad) * 2, var(--rk) * .8);
    border-radius: var(--rk);
    color: var(--ink-key); text-shadow: var(--engrave-key);
    font-weight: calc(var(--weight) + 100);
    ${press()}
    &:disabled { opacity: .45; cursor: not-allowed; filter: none; transform: none; }
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  }
  .s-button.s-secondary button, .s-button button.s-secondary {
    ${key('flush')}
    ${press('flush')}
    color: var(--ink-dim); text-shadow: var(--engrave);
    font-weight: var(--weight);
    &:hover { color: var(--ink); }
  }

  /* ── Vector ── */
  .s-vector {
    .s-vec-axis { ${sunk} border-radius: var(--rk); height: var(--h); padding: 0 max(var(--pad), var(--rk) * .5); gap: var(--u); min-width: calc(var(--u) * 16);
      &:focus-within { outline: 2px solid var(--focus); outline-offset: 2px; } }
    .s-vec-label { color: var(--ink-dim); opacity: 1; text-shadow: none; }
    input[type="number"] { background: transparent; box-shadow: none; height: auto; padding: 0; &:focus-visible { outline: none; } }
  }

  /* ── Info / separator ── */
  .s-info .s-input { min-height: var(--h); }
  .s-info .s-monitor { color: var(--ink-dim); opacity: 1; }
  .s-separator { height: 1px; background: var(--edge); opacity: 1; box-shadow: 0 1px 0 var(--catch); }
  .s-separator-labeled { height: auto; background: none; box-shadow: none;
    &::before, &::after { height: 1px; background: var(--edge); opacity: 1; box-shadow: 0 1px 0 var(--catch); } }
  .s-separator-label { color: var(--ink-dim); opacity: 1; }

  /* ── XY pad / knob ── */
  .s-pad { ${sunk} border-radius: calc(var(--u) * 2.5 * var(--round));
    .s-pad-x, .s-pad-y { background: var(--edge); }
    .s-pad-dot { ${key('cap')} width: var(--thumb); height: var(--thumb); border-radius: 50%; position: absolute; } }
  .s-knob-dial { ${key('cap')} width: calc(var(--u) * 9); height: calc(var(--u) * 9); border-radius: 50%;
    i { background: var(--accent); width: calc(2 * var(--length)); } }
  .s-knob-val { color: var(--ink-dim); opacity: 1; }

  /* ── Folder: an engraved rule ── */
  /* A folder title is a row on the rows' pitch, its rule along the row's foot; its contents keep the
     pitch, a row gap below the rule, and the next row follows one row gap after them */
  .s-folder > summary {
    min-height: var(--h); padding: 0;
    color: var(--ink);
    font-weight: calc(var(--weight) + 100);
    border: none; background: linear-gradient(to top, var(--catch) 0 1px, var(--edge) 1px 2px, transparent 2px);
    opacity: 1;
    &::after { width: calc(var(--u) * 3.5); height: calc(var(--u) * 3.5); ${glyph(chevron, 'var(--ink-dim)')} }
  }
  .s-folder > .s-content { gap: var(--row-gap); padding: var(--row-gap) 0 0; }
}`

  return form({ size, spacing, font }) + '\n' + overrides
}
