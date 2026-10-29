/**
 * Neu: one material, lit from above. Every control is the surface itself, pushed up or pressed in.
 * A raised part (the plate, buttons, knobs, the selected segment) catches a rim of light on its lit
 * edge, spills light onto the ground on that side, and sits in a crease and a soft cast shadow on
 * the other; its face shades from the lit edge to the far one. A sunken part (fields, grooves,
 * tracks, wells) is the inverse: shade under the lit lip, a catch-light on the far wall and lip.
 * Light is the material screened with itself, shadow the material multiplied by itself, so shadows
 * on bronze run redder and light on chalk stays white. Measured on the chalk, bronze and graphite
 * study: one geometry, tones by lightness. Axes: depth = relief, softness = diffusion,
 * contrast = strength of the light, light = its angle (CSS degrees, 0 = from above),
 * texture = 'grain' | 'wood', grain = its strength (.3 = as measured).
 */
import metrics, { scale } from './metrics.js'
import baseCSS from './base.js'
import { resolveRoles, parseColor, toHex, clamp, lerp, mix, ink as readable } from './color.js'
import { surface } from './texture.js'

// Tones by the shade's OKLab lightness (graphite .235, bronze .73, chalk .96): strength of the
// light spilled beside a raised part and of the rim on its lit edge (none on chalk, whose face is
// already as light), strength of the shadow (a white material fills its own shadows), and the
// lightness of a raised face at its lit and far edge over the ground.
const STOPS = [
  [.235, [.19, .19, .98, .042, .066]],
  [.73, [.57, .57, .79, -.023, .039]],
  [.96, [1, 0, .26, 0, .006]],
]
const tones = L => {
  const i = STOPS.findIndex(([l]) => L < l)
  if (i <= 0) return STOPS.at(i)[1]
  const [[l0, a], [l1, b]] = [STOPS[i - 1], STOPS[i]]
  return a.map((v, j) => lerp(v, b[j], (L - l0) / (l1 - l0)))
}

// Layers of a control-height part, in px: offset along the light (+ toward it), blur, spread,
// strength. Relief n scales a part's layers; depth, softness and size scale every part.
const RIM = 1
const HALO = [10.5, 13.5, -5, 1]   // a raised part's spill at the measured light: the chalk study's lit top edge
const GLINT = [1.5, 1.5, 0, 1]   // the lit edge's own thin bright line, hugging it (the chalk study's Search key)
const CREASE = [-1.25, .5, 0, .12]   // a hairline crease, a little over a pixel under the part (the chalk study's)
const CONTACT = [-11.5, 5, -5.5, .38]
const CAST = [-23.5, 24, -10.5, .9]

const channels = tone => toHex(tone).slice(1).match(/../g).map(h => parseInt(h, 16) / 255)
const fromChannels = c => parseColor('#' + c.map(v => Math.round(clamp(v, 0, 1) * 255).toString(16).padStart(2, '0')).join(''))
const oklch = ({ L, C, H }, a = 1) => `oklch(${+clamp(L, 0, 1).toFixed(3)} ${+C.toFixed(4)} ${+H.toFixed(1)}${a < 1 ? ` / ${+a.toFixed(3)}` : ''})`

export default function neu({
  shade = '#e7e8ea',
  accent,
  ink,
  texture = 'grain',
  spacing = 1,
  weight = 500,
  roundness = 1,
  depth = 1,
  softness = 1,
  contrast = 1,
  light = 0,
  grain = .3,
  size = 1,
  font,
} = {}) {
  const { dark, at, accent: acc } = resolveRoles(shade, accent)
  const base = parseColor(shade)
  const [lightK, rimK, shadeK, lit, far] = tones(base.L)
  const gain = Math.max(0, contrast)
  const alpha = a => clamp(a * gain, 0, 1)

  // Light is the material screened with itself, shadow the material multiplied by itself.
  const rgb = channels(base)
  const screened = fromChannels(rgb.map(v => 1 - (1 - v) ** 2)), multiplied = fromChannels(rgb.map(v => v * v))
  const glow = { L: base.L + (1 - base.L) * .75, C: screened.C * .63, H: screened.H }
  const umbra = { L: base.L * .63, C: multiplied.C * 1.5, H: multiplied.H }
  const penumbra = { ...umbra, C: multiplied.C }
  const bright = a => oklch(glow, alpha(a))
  const shadow = (a, tone = umbra) => oklch(tone, alpha(a))

  // the glint shows on a pale material only: on a darker one the halo's light is all there is (the study's bronze and graphite)
  const glint = clamp((base.L - .6) / .35, 0, 1)
  const rad = light * Math.PI / 180, lx = Math.sin(rad), ly = -Math.cos(rad)
  // Body 14px: Neu sets its labels and values at 14px.
  const body = 14
  const unit = scale(size, body), k = unit * Math.max(0, depth)
  const soft = Math.max(0, softness)
  const len = v => `${+(v * k).toFixed(2)}px`
  // An outer layer stays on its part: its near edge, pushed off by the offset and the shrink, may pass the part's far edge
  // (34 units on, a control's height at relief 1) by no more than its blur feathers back, so hard light (softness 0) or a
  // deep relief draws a shorter shadow, never a copy of the part standing apart from it
  const layer = (n, [d, blur, spread = 0], color, inset = '') => {
    const off = Math.abs(d) - Math.min(0, spread), hold = inset || !off ? 1 : Math.min(1, (34 + depth * blur * soft / 2) / (Math.max(0, depth) * off) || 1)
    return `${inset}${len(lx * d * n * hold)} ${len(ly * d * n * hold)} ${len(blur * soft * n)} ${len(spread * n * hold)} ${color}`
  }
  // A knob riding in a groove spills no light: the spill would land on the ink beside it, and light
  // composited over ink fogs it (spill light on paint brightens it by a share, no more than it does the ground).
  const raise = (n, spill = true) => [
    layer(n, [-RIM, 0], bright(rimK), 'inset '),
    ...spill ? [layer(n, GLINT, bright(lightK * GLINT[3] * glint)), layer(n, HALO, bright(lightK * HALO[3]))] : [],
    layer(n, CREASE, shadow(CREASE[3])),
    layer(n, CONTACT, shadow(CONTACT[3] * shadeK)),
    layer(n, CAST, shadow(CAST[3] * shadeK, penumbra)),
  ].join(', ')
  // A sunken part is the lit lip's shade over its floor, the catch-light on the far wall, and the rim
  // on the lip. Ink laid on the floor (a fill, an on switch) covers the catch-light and lies in the shade.
  const lipShade = n => [
    layer(n, CREASE, shadow(CREASE[3]), 'inset '),
    layer(n, CONTACT, shadow(CONTACT[3] * shadeK), 'inset '),
    layer(n, CAST, shadow(CAST[3] * shadeK, penumbra), 'inset '),
  ].join(', ')
  const lip = n => layer(n, [-RIM, 0], bright(rimK))
  const floorLight = n => `${layer(n, HALO, bright(lightK), 'inset ')}, ${lip(n)}`
  const sink = n => `${lipShade(n)}, ${floorLight(n)}`
  // An engraved hairline: shade on the lit side, catch-light on the far side.
  const groove = `${layer(1, [-1, 0], shadow(.5), 'inset ')}, ${layer(1, [-1, 0], bright(rimK))}`

  const faceAt = d => oklch({ ...base, L: base.L + d * gain })
  const tex = surface(texture, shade, grain / .3)
  const face = `${tex ? tex.image + ', ' : ''}linear-gradient(${light + 180}deg, ${faceAt(lit)}, ${faceAt(far)})`
  const faceBlend = `${tex ? tex.blend + ', ' : ''}normal`

  // Lettering is ink pressed into the material, marked by the tone that parts from the ink:
  // light ink keeps the shade on the lit side of each stroke, dark ink the catch-light on the far side.
  // Ink reads on every surface it is printed on: the ground and both ends of a raised face.
  const grounds = [shade, faceAt(lit), faceAt(far)]
  const legible = tone => grounds.reduce((t, g) => readable(g, 4.5, t), tone)
  const fg = legible(ink ?? at(dark ? .94 : .32))
  const fgTone = parseColor(fg)
  const fgMuted = legible({ L: lerp(fgTone.L, base.L, .35), C: fgTone.C * .8, H: fgTone.H })
  // A field's floor under the top of its lettering, 13px down the 36px control (its mid-line less half
  // the 14px type's capitals), the darkest ground the text sits on. The cast shadow inset in the well
  // leaves its floor clear from (spread - offset)·n past the lit wall; across that edge it falls off as
  // a Gaussian of σ = blur / 2 (Φ(x) ≈ 1 / (1 + e^(-1.702x))), and reaches further in the deeper hover
  // sink (n .7 against .55). The placeholder reads 4.5:1 there, at rest and hovered (light from above or below).
  const [castD, castBlur, castSpread, castA] = CAST
  const floor = n => {
    const x = ((castSpread - castD) * n * k - 13 * unit) / (castBlur / 2 * soft * n * k)
    return mix(shade, toHex(penumbra), alpha(castA * shadeK) / (1 + Math.exp(-1.702 * x)))
  }
  const placeholder = [floor(.55), floor(.7)].reduce((t, g) => readable(g, 4.5, t), fgMuted)
  const emboss = fgTone.L > base.L
    ? `${len(lx)} ${len(ly)} ${len(.75)} ${shadow(.9)}`
    : `${len(-lx)} ${len(-ly)} 0 ${bright(lightK * 1.2)}`

  const chevron = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2.5,3.75 5,6.25 7.5,3.75' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  // One stroke for every glyph: the chevron draws at 1.4× its viewBox (3.5u), the check at 1.56× its own
  const check = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2.75,6.25 5,8.5 9.25,3.75' fill='none' stroke='%23000' stroke-width='1.35' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const selectArrow = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2.5,3.75 5,6.25 7.5,3.75' fill='none' stroke='${encodeURIComponent(fgMuted)}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body, controlHeight: 34, rowGap: 14, sectionGap: 14, panelPadding: 22, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"})}

  --bg: ${shade};
  --accent: ${acc};
  --fg: ${fg};
  --fg-muted: ${fgMuted};

  --weight: ${weight};
  --roundness: ${roundness};
  --r: calc(var(--u) * var(--roundness) * 3.52);
  --h: var(--control-height);
  /* keys and one-line wells are capsules (the family's form), a text area keeps the wells' radius; trays are concentric
     with the parts at their edge, and the plate rounds by a capsule's radius and a quarter of its padding */
  --r-key: calc(var(--h) / 2 * min(1, var(--roundness)));
  --tray-pad: calc(16 * var(--space));
  --r-panel: calc((var(--h) / 2 + var(--panel-padding) / 4) * var(--roundness));
  --r-tray: calc(var(--r-key) + var(--tray-pad) * min(1, var(--roundness)));
  --knob: calc(var(--u) * 5.5);
  --glyph: calc(var(--u) * 3.5);       /* chevrons and steppers */
  --font-size-small: calc(12 * var(--length)); /* secondary text: hints, readouts, marks, tooltips (11px at size 1) */
  --s-clear-icon: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.5 2.5 L7.5 7.5 M7.5 2.5 L2.5 7.5' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E");

  /* The material: its texture, a raised face, and the relief of each kind of part. */
  --neu-texture: ${tex ? tex.image : 'none'};
  --neu-blend: ${tex ? tex.blend : 'normal'};
  --neu-floor: ${tex ? tex.image + ', ' : ''}var(--bg);
  --neu-face: ${face};
  --neu-face-blend: ${faceBlend};
  --neu-plate: ${raise(1.5)};
  --neu-raise: ${raise(1)};
  --neu-lift: ${raise(1.2)};
  --neu-raise-sm: ${raise(.55)};
  --neu-raise-xs: ${raise(.35)};
  --neu-knob: ${raise(.55, false)};
  --neu-knob-lift: ${raise(1, false)};
  --neu-knob-press: ${raise(.35, false)};
  --neu-sink: ${sink(.55)};
  --neu-sink-deep: ${sink(.7)};
  --neu-sink-sm: ${sink(.4)};
  --neu-sink-sm-shade: ${lipShade(.4)};
  --neu-sink-sm-light: ${floorLight(.4)};
  --neu-sink-sm-ink: ${lipShade(.4)}, ${lip(.4)};
  --neu-press: ${sink(.3)};
  --neu-groove: ${groove};
  --neu-emboss: ${emboss};
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--neu-floor);
  background-blend-mode: var(--neu-blend);
  color: var(--fg);
  text-shadow: var(--neu-emboss);
  --font: var(--font-family);
  font-weight: var(--weight);
  border-radius: var(--r-panel);
  box-shadow: var(--neu-plate);
  padding: var(--panel-padding);
  min-width: 0;
  max-width: calc(var(--u) * 110);
  -webkit-font-smoothing: antialiased;
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
  button, input, select, textarea { text-shadow: inherit; }

  /* Parts cut from the material */
  input[type="text"], input[type="number"], textarea,
  .s-vector .s-vec-axis, .s-boolean .s-track, .s-select.s-checkboxes .s-track, .s-select.s-radio input[type="radio"],
  .s-select.s-segmented .s-input, .s-slider input[type="range"], .s-slider .s-interval-track, .s-color .s-alpha, .s-pad, .s-title {
    background: var(--neu-floor); background-blend-mode: var(--neu-blend);
  }
  .s-fold-icon, .s-search-btn, .s-button button, select, .s-number .s-step button, .s-boolean.s-toggle .s-track,
  .s-select.s-segmented button.s-selected, .s-knob-dial, .s-title-text, .s-tooltip {
    background: var(--neu-face); background-blend-mode: var(--neu-face-blend);
  }

  /* ── Header ── */
  > summary, > .s-panel-title { font-weight: 650; font-size: 1.3em; letter-spacing: -0.01em; gap: calc(var(--u) * 2); min-height: var(--h); }
  > summary::after { display: none; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: var(--section-gap); }
  .s-panel-content { gap: var(--row-gap); }

  /* the fold and search buttons: round, raised */
  .s-fold-icon, .s-search-btn {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: var(--h); height: var(--h); padding: 0; border: none; border-radius: var(--r-key);
    box-shadow: var(--neu-raise); -webkit-mask: none; mask: none;
    transition: box-shadow .15s;
    &:hover { box-shadow: var(--neu-lift); }
    &:active { box-shadow: var(--neu-press); }
  }
  .s-fold-icon { margin-left: auto; order: 2; cursor: pointer;
    .s-search ~ &, :has(> .s-search) > & { margin-left: 0; }
    i { width: var(--glyph); height: var(--glyph); background: var(--fg); -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; transition: transform .2s; } }
  &[open] .s-fold-icon i { transform: rotate(-180deg); }
  > summary:focus-visible { outline: none; .s-fold-icon { outline: 2px solid var(--accent); outline-offset: 3px; } }

  &.s-searching > summary, &.s-searching > .s-panel-title { flex-wrap: wrap; }

  /* ── Search: a raised button that opens into a sunken pill ── */
  .s-search { order: 1; margin-left: auto; gap: 0; border-radius: 999px; transition: box-shadow .15s; }
  .s-search-btn::after { content: ''; width: 45%; height: 45%; background: var(--fg); -webkit-mask: var(--s-search-icon) center / contain no-repeat; mask: var(--s-search-icon) center / contain no-repeat; }
  .s-search-input { appearance: none; -webkit-appearance: none; color: var(--fg); width: 14ch; height: var(--h); padding: 0 calc(var(--u) * 2) 0 var(--u); outline: none; font-weight: 600;
    &::placeholder { color: ${placeholder}; }
    &::-webkit-search-decoration, &::-webkit-search-results-button, &::-webkit-search-results-decoration { display: none; }
    &::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; width: calc(var(--u) * 3); height: calc(var(--u) * 3); cursor: pointer; opacity: .6;
      background: currentColor; -webkit-mask: var(--s-clear-icon) center / contain no-repeat; mask: var(--s-clear-icon) center / contain no-repeat;
      &:hover { opacity: 1; } } }
  &.s-searching .s-search { background: var(--neu-floor); background-blend-mode: var(--neu-blend); box-shadow: var(--neu-sink);
    .s-search-btn { box-shadow: none; background: transparent; &:hover { box-shadow: none; } } }
  &.s-searching .s-search:focus-within { outline: 2px solid var(--accent); outline-offset: 2px; }

  /* ── Rows ── */
  .s-control { align-items: center; gap: var(--column-gap); min-height: var(--h); }
  /* under a hint the row aligns at the top, the label's first line level with the control's text */
  .s-control:has(> .s-label-group .s-hint) { align-items: flex-start; > .s-label-group { padding-top: calc((var(--h) - var(--line-height)) / 2); } }
  .s-input { align-items: center; }
  /* switch, checkbox and read-only rows keep the fields' height, so a row's parts centre on one line */
  :is(.s-boolean, .s-info) .s-input { min-height: var(--h); }
  .s-label { font-weight: 500; }
  .s-hint { color: var(--fg-muted); opacity: 1; font-size: var(--font-size-small); font-weight: 500; }
  .s-title { display: inline-flex; align-items: center; justify-content: center; width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5); border-radius: 50%; box-shadow: var(--neu-sink-sm); color: var(--fg-muted); font-size: calc(10 * var(--length)); font-weight: 800; cursor: help;
    &:is(:hover, :focus-visible) + .s-title-text { opacity: 1; visibility: visible; } }
  .s-title-text { position: absolute; left: 0; top: 100%; margin-top: var(--u); padding: calc(var(--u) * 2) calc(var(--u) * 3); font-size: var(--font-size-small); font-weight: 600; border-radius: var(--r); box-shadow: var(--neu-raise-sm); width: max-content; max-width: 30ch; z-index: 10; opacity: 0; visibility: hidden; pointer-events: none; }

  /* ── Fields: wells in the material ── */
  input[type="text"], input[type="number"], textarea {
    color: var(--fg); border: none; border-radius: var(--r-key); box-shadow: var(--neu-sink);
    font: inherit; font-weight: 600; transition: box-shadow .15s;
    &::placeholder { color: ${placeholder}; font-weight: 500; }
    &:hover { box-shadow: var(--neu-sink-deep); }
    &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  }
  input[type="text"], input[type="number"], select { height: var(--h); padding: 0 calc(var(--u) * 3.5); }
  textarea { padding: calc(var(--u) * 2.5) calc(var(--u) * 3.5); border-radius: var(--r); }
  input[type="number"] { font-variant-numeric: tabular-nums; }
  input.s-scrubbing { outline: 2px solid var(--accent); outline-offset: 2px; }

  /* ── Select: pressed to open, so raised like a button ── */
  select { color: var(--fg); border: none; border-radius: var(--r-key); box-shadow: var(--neu-raise);
    font: inherit; font-weight: 600; cursor: pointer; appearance: none; -webkit-appearance: none; transition: box-shadow .15s;
    background: ${selectArrow} right calc(var(--u) * 3.5) center / var(--glyph) no-repeat, var(--neu-face);
    background-blend-mode: normal, var(--neu-face-blend); padding-right: calc(var(--u) * 9);
    &:hover { box-shadow: var(--neu-lift); }
    &:active { box-shadow: var(--neu-press); }
    &:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
    option { background: var(--bg); color: var(--fg); } }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-step { flex-direction: column; gap: calc(var(--u) * 1);
      button { width: calc(var(--u) * 6); height: calc(var(--u) * 4); padding: 0; display: grid; place-items: center; border: none; border-radius: calc(var(--u) * 2); box-shadow: var(--neu-raise-xs); color: var(--fg-muted); font-size: 0; line-height: 0; cursor: pointer; transition: box-shadow .1s, color .1s;
        &::before { content: ''; width: var(--glyph); height: var(--glyph); background: currentColor; -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; }
        &.s-step-up::before { transform: rotate(180deg); }
        &:hover { color: var(--fg); }
        &:active { box-shadow: var(--neu-press); } } }
  }

  /* ── Vector ── */
  .s-vector {
    .s-vec-axis { gap: var(--u); height: var(--h); min-width: calc(var(--u) * 16); padding: 0 calc(var(--u) * 2.5); border-radius: var(--r-key); box-shadow: var(--neu-sink);
      &:focus-within { outline: 2px solid var(--accent); outline-offset: 2px; } }
    .s-vec-label { font-size: var(--font-size-small); font-weight: 700; color: var(--fg-muted); opacity: 1; }
    input[type="number"] { height: auto; padding: 0; box-shadow: none; background: transparent; &:hover { box-shadow: none; } &:focus-visible { outline: none; } }
  }

  /* ── Buttons: the material raised, lettered in the ink ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(var(--u) * 3); }
    button { flex: 1; min-width: 0; min-height: var(--h); color: var(--fg); font-weight: var(--weight); border: none; border-radius: var(--r-key); box-shadow: var(--neu-raise);
      padding: calc((var(--h) - var(--line-height)) / 2) calc(var(--u) * 3); transition: box-shadow .15s, color .15s;
      &:hover:enabled { box-shadow: var(--neu-lift); }
      &:active:enabled { box-shadow: var(--neu-press); }
      &:disabled, &[aria-busy="true"] { color: var(--fg-muted); box-shadow: var(--neu-raise-xs); cursor: not-allowed; }
      &:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; } }
    /* secondary: a lower relief, quieter lettering */
    &.s-secondary button, button.s-secondary { color: var(--fg-muted); box-shadow: var(--neu-raise-sm);
      &:hover:enabled { box-shadow: var(--neu-raise); }
      &:active:enabled { box-shadow: var(--neu-press); } }
  }

  /* ── Boolean ── */
  .s-boolean {
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { cursor: pointer; }
    &.s-switch {
      .s-track { width: calc(var(--u) * 13); height: calc(var(--u) * 7); border-radius: 999px; box-shadow: var(--neu-sink-sm); position: relative; transition: background-color .2s;
        &::after { content: ''; position: absolute; top: 50%; left: calc(var(--u) * .75); width: var(--knob); height: var(--knob); transform: translateY(-50%); border-radius: 50%;
          background: var(--neu-face); background-blend-mode: var(--neu-face-blend); box-shadow: var(--neu-knob); transition: left .2s cubic-bezier(.3, 1.2, .5, 1); } }
      &:has(input:checked) .s-track { background: var(--accent); box-shadow: var(--neu-sink-sm-ink); &::after { left: calc(100% - var(--knob) - var(--u) * .75); } }
      &:has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 3px; }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 6.5); height: calc(var(--u) * 6.5); border-radius: calc(var(--r) * .6); box-shadow: var(--neu-sink-sm); }
      .s-track::after { content: ''; width: 72%; height: 72%; background: var(--accent); -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; opacity: 0; transition: opacity .12s; }
      &:has(input:checked) .s-track::after { opacity: 1; }
      &:has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 3px; }
    }
    /* a latching push button: raised off, pressed in on */
    &.s-toggle {
      .s-track { padding: 0 calc(var(--u) * 4); border-radius: var(--r-key); box-shadow: var(--neu-raise-sm); height: var(--h); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--fg-muted); cursor: pointer; transition: box-shadow .15s, color .15s;
        &::after { content: 'Off'; } }
      &:hover .s-track { box-shadow: var(--neu-raise); }
      &:has(input:checked) .s-track { background: var(--neu-floor); background-blend-mode: var(--neu-blend); box-shadow: var(--neu-sink-sm); color: var(--accent); &::after { content: 'On'; } }
      &:has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 3px; }
    }
  }

  /* ── Slider: a groove filled with ink, a raised knob; the colour's alpha slider is the same slider ──
     the groove's floor and its light are the input; the ink and the lip's shade over it are the track */
  .s-slider input[type="range"], .s-color .s-alpha {
    width: 100%; height: calc(var(--u) * 2.5); -webkit-appearance: none; appearance: none; border-radius: 999px; cursor: pointer;
    box-shadow: var(--neu-sink-sm-light);
    --neu-ink: linear-gradient(to right, var(--accent) 0 var(--p, 0%), transparent 0);
    --neu-ink-shade: var(--neu-sink-sm-shade);
    &::-webkit-slider-runnable-track { height: 100%; border-radius: 999px; background: var(--neu-ink); box-shadow: var(--neu-ink-shade); }
    &::-moz-range-track { height: 100%; border-radius: 999px; background: var(--neu-ink); box-shadow: var(--neu-ink-shade); }
    &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--knob); height: var(--knob); margin-top: calc((var(--u) * 2.5 - var(--knob)) / 2); border: none; border-radius: 50%; background: var(--neu-face); background-blend-mode: var(--neu-face-blend); box-shadow: var(--neu-knob); cursor: grab; transition: box-shadow .12s; }
    &::-moz-range-thumb { width: var(--knob); height: var(--knob); border: none; border-radius: 50%; background: var(--neu-face); background-blend-mode: var(--neu-face-blend); box-shadow: var(--neu-knob); cursor: grab; }
    &:hover::-webkit-slider-thumb { box-shadow: var(--neu-knob-lift); }
    &:active::-webkit-slider-thumb { cursor: grabbing; box-shadow: var(--neu-knob-press); }
    &:active::-moz-range-thumb { cursor: grabbing; box-shadow: var(--neu-knob-press); }
    &:focus-visible { outline: none; }
    &:focus-visible::-webkit-slider-thumb { outline: 2px solid var(--accent); outline-offset: 3px; }
    &:focus-visible::-moz-range-thumb { outline: 2px solid var(--accent); outline-offset: 3px; }
  }
  .s-slider {
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(var(--u) * 4); }
    .s-track { height: var(--h); margin: 0; }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-marks { display: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, calc(2 * var(--length))); font-size: var(--font-size-small); font-weight: 600; color: var(--fg-muted); white-space: nowrap; &.s-active { color: var(--accent); } }
    .s-readout { flex: 0 0 auto; min-width: 6ch; text-align: right; font-size: var(--font-size-small); font-weight: 700; color: var(--fg-muted); font-variant-numeric: tabular-nums; background: transparent; border: none; box-shadow: none; height: auto; padding: 0; cursor: ew-resize;
      &:hover, &.s-scrubbing { color: var(--fg); box-shadow: none; }
      &:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; box-shadow: none; } }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); margin-bottom: calc(var(--u) * -.5); border-radius: calc(var(--r) * .6); box-shadow: var(--neu-raise-xs); padding: calc(2 * var(--length)) calc(8 * var(--length)); font-size: var(--font-size-small); font-weight: 700; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: calc(var(--u) * 2.5); margin: calc(var(--u) * 3.25) 0; border-radius: 999px; position: relative;
      box-shadow: var(--neu-sink-sm-light);
      &::before { content: ''; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(to right, transparent var(--low, 0%), var(--accent) 0 var(--high, 100%), transparent 0); box-shadow: var(--neu-sink-sm-shade); }
      input[type="range"] { box-shadow: none; background: transparent; --neu-ink: none; --neu-ink-shade: none; } }
  }

  /* ── Select variants ── */
  .s-select {
    &.s-dropdown select { flex: 1; }
    /* one sunken track; the chosen option is the piece raised inside it */
    &.s-segmented {
      .s-input { gap: 0; height: var(--h); padding: calc(var(--u) * .75); border-radius: var(--r-key); box-shadow: var(--neu-sink); }
      button { flex: 1; min-width: 0; height: 100%; background: transparent; border: none; border-radius: calc(var(--r-key) - var(--u) * .75 * min(1, var(--roundness))); color: var(--fg-muted); font-weight: 600; padding: 0 var(--u); transition: box-shadow .15s, color .15s;
        &:hover { color: var(--fg); }
        &.s-selected { color: var(--fg); box-shadow: var(--neu-raise-sm); }
        &:active { box-shadow: var(--neu-press); }
        &:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; } }
    }
    &.s-radio, &.s-checkboxes { align-items: flex-start;
      .s-label-group { padding-top: calc(var(--u) * 1.25); }
      .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * 2.5); }
      .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 2.5); cursor: pointer; font-weight: 600; min-height: calc(var(--u) * 6.5); }
    }
    &.s-radio input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; width: calc(var(--u) * 6.5); height: calc(var(--u) * 6.5); border-radius: 50%; box-shadow: var(--neu-sink-sm); display: grid; place-items: center; cursor: pointer;
      &::after { content: ''; width: 40%; height: 40%; border-radius: 50%; background: var(--accent); opacity: 0; transition: opacity .12s; }
      &:checked::after { opacity: 1; }
      &:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; } }
    &.s-checkboxes {
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 6.5); height: calc(var(--u) * 6.5); flex-shrink: 0; border-radius: calc(var(--r) * .6); box-shadow: var(--neu-sink-sm);
        &::after { content: ''; width: 72%; height: 72%; background: var(--s-color, var(--accent)); -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; opacity: 0; transition: opacity .12s; } }
      .s-input label:has(input:checked) .s-track::after { opacity: 1; }
      .s-input label:has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 3px; }
    }
  }

  /* ── Color: the swatch is a raised disc of its own colour ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(var(--u) * 3);
      input[type="color"] { position: static; flex: none; width: var(--h); height: var(--h); padding: 0; border: none; border-radius: 50%; box-shadow: var(--neu-raise-sm); cursor: pointer; overflow: hidden; transition: box-shadow .15s;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 50%; }
        &:hover { box-shadow: var(--neu-raise); }
        &:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; } }
      input[type="text"] { flex: 1; min-width: 0; font-variant-numeric: tabular-nums; } }
    &.s-rgba .s-color-input { gap: calc(var(--u) * 2.5);
      input[type="color"] { width: var(--h); height: var(--h); border-radius: 50%; box-shadow: var(--neu-raise-sm); overflow: hidden;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 50%; } }
      /* the slider's groove, showing the colour's ramp over a checkerboard instead of the fill */
      .s-alpha { width: 0; --neu-ink: linear-gradient(to right, transparent, var(--c)), conic-gradient(#c4c4c4 90deg, #fff 0 180deg, #c4c4c4 0 270deg, #fff 0) 0 0 / calc(8 * var(--length)) calc(8 * var(--length)); }
      /* the code is as wide as its nine characters (narrower only in a narrow host); the alpha slider takes what is left */
      input[type="text"] { flex: 0 1 auto; width: calc(10ch + var(--u) * 7); font-variant-numeric: tabular-nums; } }
    &.s-swatches { .s-input { flex-wrap: wrap; gap: calc(var(--u) * 2.5); }
      button { width: calc(var(--u) * 7); height: calc(var(--u) * 7); padding: 0; border: none; border-radius: 50%; box-shadow: var(--neu-raise-xs); transition: box-shadow .15s;
        &:hover { box-shadow: var(--neu-raise-sm); }
        &:active, &.s-selected { box-shadow: var(--neu-press); }
        &.s-selected { outline: 2px solid var(--accent); outline-offset: 3px; }
        &:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; } } }
  }

  /* ── Text / Textarea ── */
  .s-text input[type="text"] { flex: 1; }
  .s-textarea { align-items: flex-start;
    .s-label-group { padding-top: calc(var(--u) * 2.5); }
    textarea { flex: 1; resize: none; field-sizing: content; min-height: calc(var(--lh) * 3 + var(--u) * 5); max-height: 50vh; }
    &.s-code textarea { font-family: ui-monospace, monospace; } }

  /* ── Info / separator: an engraved line ── */
  .s-info .s-monitor { font-weight: 600; color: var(--fg-muted); opacity: 1; }
  .s-separator { height: 1px; background: none; opacity: 1; box-shadow: var(--neu-groove); margin: calc(var(--u) * 1) 0; }
  .s-separator-labeled { height: auto; box-shadow: none;
    &::before, &::after { height: 1px; background: none; opacity: 1; box-shadow: var(--neu-groove); } }
  .s-separator-label { color: var(--fg-muted); font-weight: 600; opacity: 1; font-size: var(--font-size-small); }

  /* ── XY pad / knob ── */
  .s-xy { align-items: flex-start; .s-label-group { padding-top: calc(var(--u) * 1.25); } }
  .s-pad { border: none; border-radius: var(--r); box-shadow: var(--neu-sink);
    .s-pad-x, .s-pad-y { background: color-mix(in oklab, var(--fg), transparent 85%); }
    .s-pad-dot { box-shadow: var(--neu-raise-xs); } }
  .s-knob-dial { width: calc(var(--u) * 11); height: calc(var(--u) * 11); border: none; box-shadow: var(--neu-raise);
    i { background: var(--accent); width: calc(3 * var(--length)); border-radius: calc(2 * var(--length)); } }
  .s-knob-val, .s-pad-val { font-size: var(--font-size-small); font-weight: 700; color: var(--fg-muted); opacity: 1; }

  /* ── Folder: a shallow tray ── */
  .s-folder {
    > summary { font-weight: 700; color: var(--fg-muted); min-height: var(--h); padding: 0; transition: color .12s;
      &:hover { color: var(--fg); }
      &::after { content: ''; width: var(--glyph); height: var(--glyph); margin-left: auto; background: currentColor; -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; transition: transform .2s; }
      &:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; } }
    &[open] > summary { color: var(--fg); &::after { transform: rotate(-180deg); } }
    .s-content { gap: var(--row-gap); padding: var(--tray-pad); border-radius: var(--r-tray); box-shadow: var(--neu-press); }
    &.s-section > summary { pointer-events: none; &::after { display: none; } }
  }
}`

  return baseCSS + '\n' + overrides
}
