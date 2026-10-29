/**
 * Glass theme — liquid glass
 *
 * A pane of glass over the scene, not a translucent card: the backdrop is blurred, lifted and
 * refracted through a dedicated layer behind the content, so the scene's colour lives inside the
 * panel. The pane's edge is a bright rim (light catching a bevel), one soft specular sits near its
 * top, and it casts a wide ambient shadow.
 *
 * Every control is a lens lying on that pane, measured on a studio lens (u = fraction of its
 * height): a hairline edge darker than the surface straddles the silhouette, a bright rim sits just
 * inside the top edge, the face is lit at the top and deepens toward the bottom, light gathers into
 * a caustic just above the bottom edge, and a short shadow falls beneath. On a dark surface the face
 * reads lighter than the surface (it reflects the room); on a pale one little but the edge shows.
 * Raised lenses (buttons, knobs, thumbs, the selected segment) cast the shadow; flush lenses
 * (fields, tracks, wells) sit in the pane without it; on-states fill a lens with the accent.
 * Lettering is cut into the glass: dark ink catches light on its lower edge, light ink a shadow on
 * its upper edge.
 *
 * Axes: shade/accent (hue + light/dark via resolveRoles), ink (lettering colour, held to 4.5:1 on
 * the pane), spacing/weight/roundness/size (shared scale axes), blur (backdrop frost radius), depth
 * (optical thickness: rim, caustic, shading and shadow), tint (backdrop tint density: 0 clear,
 * 1 milky).
 *
 * glass(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveRoles, parseColor, luminance, contrast, clamp, lerp, mix, toHex, ink as legible } from './color.js'
import { bevel } from './mixins.js'

export default function glass({
  shade = '#f1f2f4',
  accent = '#2563eb',
  ink,
  spacing = 1,
  weight = 400,
  roundness = 1,
  blur = 24,
  size = 1,
  depth = 1,
  tint = 1,
  font,
} = {}) {
  const { dark, L, C, H, fg: roleFg, accent: acc, onAccent } = resolveRoles(shade, accent)
  const op = a => clamp(a, 0, 1)
  const d = clamp(depth, 0, 2)
  const len = n => `calc(var(--length) * ${n})`

  // Light and shade at an alpha: white is the room reflected in the glass; `deep` is the surface's
  // own colour seen through thick glass, darker and richer. Warm hues turn toward red on the way
  // down (as amber does) instead of going olive.
  const hue = H - 12 * clamp(1 - Math.abs(H - 80) / 40, 0, 1)
  const ok = (l, c, a = 1) => `oklch(${clamp(l, 0, 1).toFixed(3)} ${c.toFixed(4)} ${hue.toFixed(1)}${a < 1 ? ` / ${+op(a).toFixed(3)}` : ''})`
  const lite = a => `rgba(255,255,255,${+op(a).toFixed(3)})`
  const deepL = L * .5
  const deep = a => ok(deepL, C * 1.3, a)

  // Lettering: the palette's ink when given, else the role foreground, held to 4.5:1 on the pane.
  const fg = legible(shade, 4.5, ink ?? roleFg)
  const tone = parseColor(fg)
  const saturate = dark ? 1.6 : 1.3

  // ── Lens ──
  // Each part is set by how much lighter or darker it reads than what lies under it (OKLab L), then
  // turned into the alpha that lands there: mixTo(from, to, top) is the alpha of `top` painted over
  // lightness `from` that reaches `to`, in the gamma-encoded space browsers blend in (neutral tones).
  const enc = l => { const y = clamp(l, 0, 1) ** 3; return y <= .0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - .055 }
  const mixTo = (from, to, top) => clamp((enc(to) - enc(from)) / (enc(top) - enc(from) || 1), 0, 1)
  // The glass passes the surface and reflects a little of the room: a dark pane's lens reads lighter
  // than the pane, a pale one's hardly at all (face lightness in linear light: .96 · surface + room).
  const faceL = room => Math.cbrt(.96 * L ** 3 + room * d)
  const top = faceL(.034), low = faceL(.027)

  // The scene shows through the tint, so lettering reads on the pane over a scene, not on the shade
  // alone: a scene up to .35 lighter or .16 darker in OKLab L, the range of the gallery's scenery in
  // the shade's own colours. Optical tint follows the chosen material in both modes, and thickens only
  // where the ink would not read 4.5:1 on a flush lens, hovered too, over that scene. Muted lettering
  // and the placeholder hold 4.5:1 over the shade and over the scene. A dark glass over a much lighter
  // page (a white one) is outside that: it needs its scene.
  // (a lens's face is lit most at its top; the text sits on its mid-line, halfway to its lower light)
  const light = tone.L > L, lit = (mixTo(L, top, 1) + mixTo(L, low, 1)) / 2, sheen = .07
  const scene = toHex({ L: clamp(L + (light ? .35 : -.16), 0, 1), C, H })
  const over = a => { const pane = mix(scene, shade, a), lens = mix(pane, '#ffffff', lit); return [pane, lens, mix(lens, '#ffffff', sheen)] }
  const frost = op((dark ? 0.68 : 0.76) * tint)
  let alpha = frost
  while (alpha < 1 && over(alpha).some(g => contrast(fg, g) < 4.5)) alpha = +Math.min(1, alpha + .01).toFixed(2)
  const body = `color-mix(in oklab, ${shade}, transparent ${alpha === frost ? 100 - frost * 100 : Math.round(100 - alpha * 100)}%)`
  const [pane, ...lens] = over(alpha)
  // each ground moves the ink away from it, never across to the other side: there the ink itself reads
  const fit = (grounds, t) => grounds.reduce((t, g) => { const r = legible(g, 4.5, t); return (luminance(r) > luminance(g)) === light ? r : fg }, t)
  // muted lettering lies on the pane (hints) and on flush lenses (a segment, a toggle's off label)
  const fgMuted = fit([shade, ok(top, C), pane, lens[0]], { ...tone, L: lerp(tone.L, L, .4) })
  // A placeholder lies on a flush lens, which reads lighter than the pane: the muted ink, held to 4.5:1
  // on the lens's lit top (3.6:1 there at the default shade), at rest and hovered, over the shade and the scene
  const placeholder = fit([ok(top, C), mix(ok(top, C), '#ffffff', sheen), ...lens], fgMuted)
  // A brighter lens (knob, thumb, selected segment) still keeps light ink at 4.5:1 on it.
  const bright = tone.L > L ? Math.min(faceL(.2), Math.cbrt((luminance(fg) + .05) / 4.5 - .05)) : faceL(.2)
  // What the lens takes from the surface (its body and caustic) fades on the palest panes.
  const seen = clamp((1 - L) / .17, 0, 1)
  const rimC = lite(mixTo(top, Math.min(top + .11 * d, 1), 1))
  const caustic = lite(mixTo(low, Math.min(low + .07 * seen * d, 1), 1))
  // The edge is the pane's own colour a step darker, opaque: a hairline shows nothing through it.
  const edgeL = L - .073 * (.74 + .26 * seen)
  const edgeC = ok(edgeL, C * 1.15)
  // Where the glass turns away (the rounded ends) its edge reflects less: a darker crescent on each side.
  const flankC = ok(edgeL - .075 * L, C * 1.15)
  // A shadow takes a share of the light, so it barely shows on a dark pane.
  const shadow = k => deep(mixTo(L, L * (1 - k * d), deepL))
  // Bands sit at fractions of the control height from their edge: a taller lens (textarea, well, pad)
  // keeps the same lit top and deep lower edge, and a smaller one scales them down with itself.
  const fromTop = k => `min(${+(k * 100).toFixed(1)}%, ${k === 1 ? "var(--h)" : `var(--h) * ${k}`})`
  const fromBottom = k => `calc(100% - ${fromTop(k)})`
  const lensFace = (from, to) => `linear-gradient(180deg, ${lite(mixTo(L, from, 1))}, ${lite(mixTo(L, to, 1))} ${fromTop(1)}), linear-gradient(180deg, transparent ${fromBottom(.44)}, ${deep(mixTo(to, to - .08 * seen * d, deepL))} ${fromBottom(.16)}, transparent ${fromBottom(.07)})`
  const face = lensFace(top, low)
  // Knobs, thumbs and the selected segment: the same lens with more light in it.
  const faceBright = lensFace(bright, Math.cbrt(bright ** 3 - .007))
  // Secondary buttons and wells: clear glass, the edge without the body.
  const faceClear = `linear-gradient(180deg, ${lite(mixTo(L, top, 1) / 2)}, transparent ${fromTop(1)})`
  // Inset: the hairline edge (on top), the rim under the top edge, the caustic above the bottom one.
  // the lower edge is darker where the glass thickens toward the pane (the study's Think key, a dark rim along its bottom)
  const edgeIn = `inset 0 ${len(-1)} 0 ${deep(.15)}, inset ${len(.75)} 0 0 ${flankC}, inset ${len(-.75)} 0 0 ${flankC}, inset 0 0 0 ${len(1)} ${edgeC}, inset 0 0 0 ${len(2)} ${lite(mixTo(L, Math.min(L + .02 * d, 1), 1))}, inset 0 ${len(2.3)} ${len(.5)} ${rimC}, inset 0 ${len(-2)} ${len(.5)} ${caustic}`
  // An on-state (a switch, a checkbox) is the accent flat, as the system's own controls draw it: only a soft shade under
  // its top edge, where it sinks into the pane; a lit rim or a lens over it glared on the colour
  const edgeOn = `inset 0 ${len(1)} ${len(2)} rgb(0 0 0 / .1)`
  // A knob (the switch's, a slider's thumb) is white, lifted by a soft shadow and a hairline of shade, no edge of its own
  const knobShadow = `0 ${len(2)} ${len(6)} ${deep(.16)}, 0 ${len(1)} ${len(2)} ${deep(.1)}, 0 0 0 ${len(.5)} ${deep(.05)}`
  const knobLift = `0 ${len(3)} ${len(9)} ${deep(.2)}, 0 ${len(1)} ${len(3)} ${deep(.12)}, 0 0 0 ${len(.5)} ${deep(.05)}`
  const drop = `0 ${len(1)} ${len(2.5)} ${shadow(.03)}, 0 ${len(4)} ${len(9)} ${shadow(.055)}`
  const lift = `0 ${len(1.5)} ${len(3)} ${shadow(.08)}, 0 ${len(5)} ${len(11)} ${shadow(.07)}`
  const sheenFace = `linear-gradient(${lite(sheen)}, ${lite(sheen)})`
  const press = `linear-gradient(${deep(.08)}, ${deep(.08)})`
  // Lettering cut into the glass: the rim's light on the lower edge of dark ink, the edge's shade on
  // the upper edge of light ink.
  const emboss = tone.L < L ? `0 ${len(1)} 0 ${rimC}` : `0 ${len(-1)} 0 ${deep(.6)}`

  // The light the pane's rim catches is the glass's own colour lifted, in OKLCH: white on a clear pane, a saturated
  // pale gold on a yellow one, never a white stroke laid over colour. (A control's lens keeps white light on its
  // edges: the material study holds them to it.)
  const glint = a => ok(Math.min(1, L + .14), C * 1.15, op(a))
  // Pane rim: light from above catches the top edge; the sides all but vanish and the bottom keeps a
  // faint reflection, so the edge reads as glass, not a stroke.
  const rim = `linear-gradient(180deg, ${glint((dark ? 0.32 : 0.9) * d)} 0%, ${glint((dark ? 0.05 : 0.3) * d)} 22%, ${glint((dark ? 0.03 : 0.2) * d)} 70%, ${glint((dark ? 0.1 : 0.45) * d)} 100%)`
  // One specular: a wide soft light hugging the top edge, in the same light.
  const specular = `radial-gradient(90% 40% at 50% -8%, ${glint((dark ? 0.16 : 0.5) * d)} 0%, transparent 70%)`
  const contactShadow = `0 calc(30 * var(--length)) calc(70 * var(--length)) calc(-20 * var(--length)) ${deep(dark ? 0.6 : 0.35)}, 0 calc(8 * var(--length)) calc(20 * var(--length)) calc(-10 * var(--length)) ${deep(dark ? 0.5 : 0.25)}`
  const focus = `0 0 0 ${len(3)} color-mix(in oklab, var(--accent), transparent 55%)`

  const chevron = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2.5,3.75 5,6.25 7.5,3.75' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  // Native selects cannot tint a mask: the arrow is drawn in the muted ink.
  const arrow = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2.5,3.75 5,6.25 7.5,3.75' fill='none' stroke='${fgMuted.replace('#', '%23')}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const check = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 5.5 L4.5 8.5 L10.5 1.5' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`

  // Body 14px: Glass sets its labels and values at 14px.
  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body: 14, controlHeight: 34, rowGap: 14, sectionGap: 14, panelPadding: 22, fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"})}

  --bg: ${shade};
  --accent: ${acc};
  --rail: color-mix(in oklab, var(--fg), transparent 80%);   /* a slider's rail: the ink at a fifth, as the system's grey track */
  --on-accent: ${onAccent};
  --fg: ${fg};
  --fg-muted: ${fgMuted};
  --placeholder: ${placeholder};
  --lens: ${face};
  --lens-bright: ${faceBright};
  --lens-clear: ${faceClear};
  --lens-edge: ${edgeIn};
  --lens-edge-on: ${edgeOn};
  --knob-shadow: ${knobShadow};
  --knob-lift: ${knobLift};
  --lens-drop: ${drop};
  --lens-lift: ${lift};
  --lens-sheen: ${sheenFace};
  --lens-press: ${press};
  --emboss: ${emboss};
  --focus: ${focus};

  --weight: ${weight};
  --roundness: ${roundness};
  /* the family's roundness: controls are capsules at 1, squarer below; the pane rounds by a capsule's radius and a quarter of its padding */
  --round: min(1, var(--roundness));
  --h: var(--control-height);
  --r: calc((var(--h) / 2 + var(--panel-padding) / 4) * var(--roundness));
  --r-lens: calc(var(--h) / 2 * var(--round));
  --well-pad: calc(12 * var(--space));
  --glyph: calc(var(--u) * 3.5);       /* chevrons and steppers */
  --font-size-small: calc(12 * var(--length)); /* secondary text: hints, readouts, marks, tooltips (11px at size 1) */
  --blur: ${blur}px;
  --saturate: ${saturate};
  --body: ${body};
  --rim: ${rim};
  --specular: ${specular};
  --s-clear-icon: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.5 2.5 L7.5 7.5 M7.5 2.5 L2.5 7.5' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E");
  color-scheme: ${dark ? 'dark' : 'light'};

  position: relative;
  isolation: isolate;
  color: var(--fg);
  --font: var(--font-family);

  font-weight: var(--weight);
  border-radius: var(--r);
  /* the surface reflection sits on the panel itself, unwarped, above the bent backdrop */
  background: var(--specular);
  box-shadow: ${contactShadow};
  padding: var(--panel-padding);
  min-width: 0;
  max-width: calc(var(--u) * 112);
  -webkit-font-smoothing: antialiased;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── The glass itself: a dedicated layer behind all content ── */
  &::after {
    content: ''; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
    /* SVG filter regions paint past the border box — clip-path pins the bent backdrop inside the pane */
    clip-path: inset(0 round var(--r));
    background: var(--body);
    -webkit-backdrop-filter: blur(var(--blur)) saturate(var(--saturate));
    backdrop-filter: blur(var(--blur)) saturate(var(--saturate));
    /* Hosts may opt into a lens; the standalone theme always supplies frost. */
    -webkit-backdrop-filter: var(--glass-backdrop, blur(var(--blur)) saturate(var(--saturate)));
    backdrop-filter: var(--glass-backdrop, blur(var(--blur)) saturate(var(--saturate)));
    /* Chromium executes the displacement through the filter property but not (yet) through
       backdrop-filter; applied to this backdrop-only layer so content stays crisp. */
    filter: var(--glass-refraction, none);
  }
  /* ── Edge rim: light on a bevel, brightest at the top ── */
  &::before { ${bevel('var(--rim)', '1px')} z-index: 1; }

  /* ── Header ── */
  > summary, > .s-panel-title { font-weight: 600; font-size: 1.2em; letter-spacing: -0.01em; text-shadow: var(--emboss); gap: calc(var(--u) * 2); min-height: var(--h); }
  > summary::after { display: none; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: var(--section-gap); }
  .s-panel-content { gap: var(--row-gap); }

  /* ── Lenses ── */
  /* raised: lies on the pane and casts its shadow */
  .s-fold-icon, .s-search-btn, .s-button button, .s-select.s-segmented button.s-selected {
    background: var(--lens); box-shadow: var(--lens-edge), var(--lens-drop);
  }
  /* flush: set into the pane */
  input[type="text"], input[type="number"], textarea, select, .s-vec-axis, .s-number .s-step button,
  .s-select.s-segmented .s-input,
  .s-boolean .s-track, .s-select.s-checkboxes .s-track, .s-select.s-radio input[type="radio"],
  .s-slider input[type="range"], .s-slider.s-multiple .s-interval-track, .s-color .s-alpha, .s-pad, .s-title {
    background: var(--lens); box-shadow: var(--lens-edge);
  }

  /* round lens buttons: fold + search, the title row's height (the family's round key) */
  .s-fold-icon, .s-search-btn {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: var(--h); height: var(--h); padding: 0; border: none; border-radius: calc(var(--h) / 2 * var(--round));
    color: var(--fg); -webkit-mask: none; mask: none;
    transition: box-shadow .14s, transform .08s;
    &:hover { background: var(--lens-sheen), var(--lens); box-shadow: var(--lens-edge), var(--lens-lift); }
  }
  .s-fold-icon { margin-left: auto; order: 2; cursor: pointer;
    :has(> .s-search) > & { margin-left: 0; }
    i { width: var(--glyph); height: var(--glyph); background: currentColor; -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; filter: drop-shadow(var(--emboss)); transition: transform .2s; } }
  &[open] .s-fold-icon i { transform: rotate(-180deg); }
  > summary:focus-visible { outline: none; .s-fold-icon { box-shadow: var(--lens-edge), var(--lens-drop), var(--focus); } }

  &.s-searching > summary, &.s-searching > .s-panel-title { flex-wrap: wrap; }

  /* ── Search: round lens that opens into a flush pill ── */
  .s-search { order: 1; margin-left: auto; gap: 0; border-radius: 999px; transition: box-shadow .14s; }
  .s-search-btn::after { content: ''; width: 50%; height: 50%; background: currentColor; -webkit-mask: var(--s-search-icon) center / contain no-repeat; mask: var(--s-search-icon) center / contain no-repeat; filter: drop-shadow(var(--emboss)); }
  .s-search-input { appearance: none; -webkit-appearance: none; color: var(--fg); width: 14ch; height: calc(var(--u) * 7); padding: 0 calc(var(--u) * 3) 0 var(--u); outline: none; font-size: .95em;
    &::placeholder { color: var(--placeholder); }
    &::-webkit-search-decoration, &::-webkit-search-results-button, &::-webkit-search-results-decoration { display: none; }
    &::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; width: calc(var(--u) * 3); height: calc(var(--u) * 3); cursor: pointer; opacity: .6;
      background: currentColor; -webkit-mask: var(--s-clear-icon) center / contain no-repeat; mask: var(--s-clear-icon) center / contain no-repeat;
      &:hover { opacity: 1; } } }
  &.s-searching .s-search { background: var(--lens); box-shadow: var(--lens-edge);
    .s-search-btn { background: transparent; box-shadow: none; } }
  &.s-searching .s-search:focus-within { box-shadow: var(--lens-edge), var(--focus); }

  /* ── Rows ── */
  .s-control { align-items: center; gap: var(--column-gap); min-height: var(--h); }
  /* under a hint the row aligns at the top, the label's first line level with the control's text */
  .s-control:has(> .s-label-group .s-hint) { align-items: flex-start; > .s-label-group { padding-top: calc((var(--h) - var(--line-height)) / 2); } }
  .s-input { align-items: center; }
  /* switch, checkbox and read-only rows keep the fields' height, so a row's parts centre on one line */
  :is(.s-boolean, .s-info) .s-input { min-height: var(--h); }
  .s-label { font-weight: 500; text-shadow: var(--emboss); }
  .s-hint { color: var(--fg-muted); opacity: 1; font-size: var(--font-size-small); }
  .s-title { display: inline-flex; align-items: center; justify-content: center; width: calc(var(--u) * 4); height: calc(var(--u) * 4); border-radius: 50%; font-size: calc(10 * var(--length)); cursor: help;
    &:is(:hover, :focus-visible) + .s-title-text { opacity: 1; visibility: visible; } }
  .s-title-text { position: absolute; left: 0; top: 100%; margin-top: var(--u); padding: calc(var(--u) * 2) calc(var(--u) * 2.5); font-size: var(--font-size-small); background: color-mix(in oklab, var(--bg), transparent 12%); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); box-shadow: var(--lens-edge), var(--lens-lift); border-radius: calc(var(--u) * 2.5 * var(--round)); width: max-content; max-width: 30ch; z-index: 10; opacity: 0; visibility: hidden; pointer-events: none; }
  .s-info .s-monitor { color: var(--fg); opacity: 1; }

  /* ── Fields: flush lenses ── */
  input[type="text"], input[type="number"], textarea, select {
    color: var(--fg); border: none; border-radius: var(--r-lens);
    font: inherit; font-weight: var(--weight);
    transition: box-shadow .14s;
    &::placeholder { color: var(--placeholder); }
    &:hover { background: var(--lens-sheen), var(--lens); }
    &:focus-visible { outline: none; box-shadow: var(--lens-edge), var(--focus); }
  }
  input[type="text"], input[type="number"], select { height: var(--h); padding: 0 calc(var(--u) * 3.5); }
  textarea { padding: calc(var(--u) * 2) calc(var(--u) * 3.5); border-radius: calc(var(--r-lens) * .6); }
  input[type="number"] { font-variant-numeric: tabular-nums; }
  input.s-scrubbing { box-shadow: var(--lens-edge), var(--focus); }
  select { cursor: pointer; appearance: none; -webkit-appearance: none; padding-right: calc(var(--u) * 8);
    background: ${arrow} right calc(var(--u) * 3) center / var(--glyph) no-repeat, var(--lens);
    &:hover { background: ${arrow} right calc(var(--u) * 3) center / var(--glyph) no-repeat, var(--lens-sheen), var(--lens); }
    option { background: var(--bg); color: var(--fg); } }
  .s-select.s-dropdown select { flex: 1; }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-step { flex-direction: column; gap: calc(var(--u) * .5);
      button { width: calc(var(--u) * 6); height: calc(var(--h) / 2 - var(--u) * .25); padding: 0; display: grid; place-items: center; border: none; border-radius: calc(var(--u) * 2 * var(--round)); color: var(--fg-muted); font-size: 0; line-height: 0; cursor: pointer; transition: color .12s;
        &::before { content: ''; width: var(--glyph); height: var(--glyph); background: currentColor; -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; filter: drop-shadow(var(--emboss)); }
        &.s-step-up::before { transform: rotate(180deg); }
        &:hover { background: var(--lens-sheen), var(--lens); color: var(--fg); }
        &:active { background: var(--lens-press), var(--lens); } } }
  }

  /* ── Vector ── */
  .s-vector {
    .s-vec-axis { gap: var(--u); height: var(--h); min-width: calc(var(--u) * 16); padding: 0 calc(var(--u) * 3); border-radius: var(--r-lens); transition: box-shadow .14s;
      &:focus-within { box-shadow: var(--lens-edge), var(--focus); } }
    .s-vec-label { color: var(--fg-muted); opacity: 1; font-size: var(--font-size-small); }
    input[type="number"] { height: auto; padding: 0; box-shadow: none; background: transparent; border-radius: 0; &:hover, &:focus-visible { box-shadow: none; background: transparent; } }
  }

  /* ── Buttons: lenses with the lettering cut in; primary lies on the pane, secondary is flush ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(var(--u) * 2.5); }
    button { flex: 1; min-width: 0; min-height: var(--h); color: var(--fg); font-weight: 500; text-shadow: var(--emboss); border: none; border-radius: var(--r-lens);
      padding: calc((var(--h) - var(--line-height)) / 2) calc(var(--u) * 4);
      transition: box-shadow .14s, transform .08s;
      &:hover { background: var(--lens-sheen), var(--lens); box-shadow: var(--lens-edge), var(--lens-lift); }
      &:active { background: var(--lens-press), var(--lens); box-shadow: var(--lens-edge); transform: translateY(${len(.5)}); }
      &:disabled, &[aria-busy="true"] { background: var(--lens); box-shadow: var(--lens-edge); opacity: .5; cursor: not-allowed; transform: none; }
      &:focus-visible { outline: none; box-shadow: var(--lens-edge), var(--lens-drop), var(--focus); } }
    &.s-secondary button, button.s-secondary { font-weight: 500; background: var(--lens-clear); box-shadow: var(--lens-edge);
      &:hover { background: var(--lens-sheen), var(--lens-clear); box-shadow: var(--lens-edge); }
      &:active { background: var(--lens-press), var(--lens-clear); }
      &:focus-visible { box-shadow: var(--lens-edge), var(--focus); } }
  }

  /* ── Boolean ── */
  .s-boolean {
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { cursor: pointer; }
    .s-track { position: relative; transition: background .2s, box-shadow .2s; }
    &:hover .s-track { background: var(--lens-sheen), var(--lens); }
    &:has(input:checked) .s-track { background: var(--accent); box-shadow: var(--lens-edge-on); }
    &:has(input:focus-visible) .s-track { box-shadow: var(--lens-edge), var(--focus); }
    &:has(input:checked:focus-visible) .s-track { box-shadow: var(--lens-edge-on), var(--focus); }
    &.s-switch .s-track { width: calc(var(--u) * 12.5); height: calc(var(--u) * 7); border-radius: calc(var(--u) * 3.5 * var(--round));
      /* the knob: white, lifted */
      &::after { content: ''; position: absolute; top: 50%; left: calc(var(--u) * 0.75); width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); transform: translateY(-50%); border-radius: calc(var(--u) * 2.75 * var(--round)); background: #fff; box-shadow: var(--knob-shadow); transition: left .2s cubic-bezier(.3, 1.2, .5, 1); } }
    &.s-switch:has(input:checked) .s-track::after { left: calc(100% - var(--u) * 6.25); }
    &.s-checkbox .s-track { display: grid; place-items: center; width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); border-radius: calc(var(--u) * 1.6 * var(--round));
      &::after { content: ''; width: 60%; height: 55%; background: var(--on-accent); -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; opacity: 0; transform: scale(.6); transition: opacity .1s, transform .14s; } }
    &.s-checkbox:has(input:checked) .s-track::after { opacity: 1; transform: none; }
    &.s-toggle .s-track { padding: 0 calc(var(--u) * 4); border-radius: var(--r-lens); height: var(--h); display: flex; align-items: center; justify-content: center; color: var(--fg-muted); cursor: pointer;
      &::after { content: 'Off'; } }
    &.s-toggle:has(input:checked) .s-track { color: var(--on-accent); &::after { content: 'On'; } }
  }

  /* ── Slider: the system's own (glassyui's, after iOS): a thin rail of the ink at a fifth, the accent flat to the value,
     a white knob lifted by a soft shadow; no rim or ring on the rail or the fill. The colour's alpha slider is the same slider ── */
  .s-slider input[type="range"], .s-color .s-alpha {
    width: 100%; height: calc(var(--u) * 1.5); -webkit-appearance: none; appearance: none; border-radius: calc(var(--u) * var(--round)); cursor: pointer;
    background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--rail) var(--p, 0%)); box-shadow: none;
    &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(var(--u) * 5); height: calc(var(--u) * 5); border: none; border-radius: calc(var(--u) * 2.5 * var(--round)); background: #fff; box-shadow: var(--knob-shadow); cursor: grab; transition: transform .12s, box-shadow .12s; }
    &::-moz-range-thumb { width: calc(var(--u) * 5); height: calc(var(--u) * 5); border: none; border-radius: calc(var(--u) * 2.5 * var(--round)); background: #fff; box-shadow: var(--knob-shadow); cursor: grab; }
    &:hover::-webkit-slider-thumb { transform: scale(1.08); box-shadow: var(--knob-lift); }
    &:active::-webkit-slider-thumb { cursor: grabbing; transform: scale(1.12); box-shadow: var(--knob-lift), var(--focus); }
    &:active::-moz-range-thumb { cursor: grabbing; }
    &:focus-visible { outline: none; }
    &:focus-visible::-webkit-slider-thumb { box-shadow: var(--knob-shadow), var(--focus); }
    &:focus-visible::-moz-range-thumb { box-shadow: var(--knob-shadow), var(--focus); }
  }
  .s-slider {
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(var(--u) * 4); }
    .s-track { height: var(--h); margin: 0; }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-marks { display: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 0); font-size: var(--font-size-small); color: var(--fg-muted); white-space: nowrap; &.s-active { color: var(--fg); } }
    .s-readout { flex: 0 0 auto; min-width: 6ch; text-align: right; font-size: var(--font-size-small); color: var(--fg); font-variant-numeric: tabular-nums; background: transparent; border: none; box-shadow: none; height: auto; padding: 0; cursor: ew-resize; text-shadow: var(--emboss);
      &:hover, &:focus-visible, &.s-scrubbing { color: var(--fg); box-shadow: none; background: transparent; } }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); margin-bottom: calc(var(--u) * -1); background: color-mix(in oklab, var(--bg), transparent 12%); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); box-shadow: var(--lens-edge); border-radius: calc(var(--u) * 2 * var(--round)); padding: calc(2 * var(--length)) calc(8 * var(--length)); font-size: var(--font-size-small); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: calc(var(--u) * 1.5); margin: calc((var(--h) - var(--u) * 1.5) / 2) 0; border-radius: calc(var(--u) * var(--round)); position: relative; background: var(--rail); box-shadow: none;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); border-radius: inherit; }
      input[type="range"] { background: transparent; box-shadow: none; } }
  }

  /* ── Select variants ── */
  .s-select {
    /* one joined flush lens; the selected option is a brighter raised lens inside it */
    &.s-segmented {
      .s-input { gap: 0; border-radius: var(--r-lens); padding: calc(var(--u) * .75); height: var(--h); }
      button { flex: 1; min-width: 0; height: 100%; background: transparent; border: none; border-radius: calc(var(--r-lens) - var(--u) * .75 * var(--round)); color: var(--fg-muted); padding: 0 var(--u); transition: color .14s, box-shadow .14s;
        &:hover { color: var(--fg); }
        &.s-selected { background: var(--lens-bright), var(--bg); color: var(--fg); font-weight: 500; text-shadow: var(--emboss); }
        &:focus-visible { outline: none; box-shadow: var(--focus); }
        &.s-selected:focus-visible { box-shadow: var(--lens-edge), var(--lens-drop), var(--focus); } }
    }
    &.s-radio, &.s-checkboxes { align-items: flex-start;
      .s-label-group { padding-top: calc(var(--u) * 1); }
      .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * 2); }
      .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 2.5); cursor: pointer; min-height: calc(var(--u) * 5.5); }
    }
    &.s-radio input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); border-radius: 50%; display: grid; place-items: center; cursor: pointer; transition: background .14s;
      &::after { content: ''; width: 40%; height: 40%; border-radius: 50%; background: var(--on-accent); opacity: 0; transform: scale(.5); transition: opacity .1s, transform .14s; }
      &:hover { background: var(--lens-sheen), var(--lens); }
      &:checked { background: var(--lens), var(--accent); &::after { opacity: 1; transform: none; } }
      &:focus-visible { outline: none; box-shadow: var(--lens-edge), var(--focus); } }
    &.s-checkboxes {
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); flex-shrink: 0; border-radius: calc(var(--u) * 1.6 * var(--round)); transition: background .14s;
        &::after { content: ''; width: 60%; height: 55%; background: var(--on-accent); -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; opacity: 0; transform: scale(.6); transition: opacity .1s, transform .14s; } }
      .s-input label:hover .s-track { background: var(--lens-sheen), var(--lens); }
      .s-input label:has(input:checked) .s-track { background: var(--lens), var(--s-color, var(--accent)); &::after { opacity: 1; transform: none; } }
      .s-input label:has(input:focus-visible) .s-track { box-shadow: var(--lens-edge), var(--focus); }
    }
  }

  /* ── Color ── */
  .s-color {
    input[type="color"] { flex: none; width: var(--h); height: var(--h); padding: 0; border: none; border-radius: 50%; box-shadow: var(--lens-edge), var(--lens-drop); cursor: pointer; overflow: hidden;
      &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 50%; }
      &:focus-visible { outline: none; box-shadow: var(--lens-edge), var(--lens-drop), var(--focus); } }
    &.s-picker .s-color-input { gap: calc(var(--u) * 2.5);
      input[type="color"] { position: static; }
      input[type="text"] { flex: 1; min-width: 0; font-variant-numeric: tabular-nums; } }
    &.s-rgba .s-color-input { gap: calc(var(--u) * 2.5);
      /* the slider's groove, showing the colour's ramp over a checkerboard instead of the fill */
      .s-alpha { width: 0; background: var(--lens-clear), linear-gradient(to right, transparent, var(--c)), conic-gradient(#c4c4c4 90deg, #fff 0 180deg, #c4c4c4 0 270deg, #fff 0) 0 0 / calc(8 * var(--length)) calc(8 * var(--length)); }
      /* the code is as wide as its nine characters (narrower only in a narrow host); the alpha slider takes what is left */
      input[type="text"] { flex: 0 1 auto; width: calc(10ch + var(--u) * 7); font-variant-numeric: tabular-nums; } }
    &.s-swatches { .s-input { flex-wrap: wrap; gap: calc(var(--u) * 2); }
      button { width: calc(var(--u) * 6); height: calc(var(--u) * 6); padding: 0; border: none; border-radius: 50%; box-shadow: var(--lens-edge), var(--lens-drop); transition: transform .1s;
        &:hover { transform: scale(1.1); }
        &:active { transform: scale(.95); }
        &.s-selected { box-shadow: var(--lens-edge), 0 0 0 ${len(2.5)} var(--bg), 0 0 0 ${len(4)} var(--fg); }
        &:focus-visible { outline: none; box-shadow: var(--lens-edge), var(--focus); } } }
  }

  /* ── Text / Textarea ── */
  .s-text input[type="text"] { flex: 1; }
  .s-textarea { align-items: flex-start;
    .s-label-group { padding-top: calc(var(--u) * 2); }
    textarea { flex: 1; resize: none; field-sizing: content; min-height: calc(var(--lh) * 3 + var(--u) * 4); max-height: 50vh; }
    &.s-code textarea { font-family: ui-monospace, monospace; } }

  /* ── Separator: a line cut into the glass ── */
  .s-separator { height: 1px; background: ${edgeC}; box-shadow: 0 1px 0 ${rimC}; opacity: 1; }
  .s-separator-labeled { height: auto; background: none; box-shadow: none; &::before, &::after { height: 1px; background: ${edgeC}; box-shadow: 0 1px 0 ${rimC}; opacity: 1; } }
  .s-separator-label { color: var(--fg-muted); opacity: 1; font-size: var(--font-size-small); }

  /* ── XY pad / knob ── */
  .s-xy { align-items: flex-start; .s-label-group { padding-top: calc(var(--u) * 1); } }
  .s-pad { border: none; border-radius: calc(var(--u) * 3 * var(--round));
    .s-pad-x, .s-pad-y { background: ${edgeC}; }
    .s-pad-dot { background: #fff; box-shadow: var(--knob-shadow), 0 0 0 ${len(2)} var(--accent); } }   /* a knob, as the slider's and the switch's */
  .s-knob-dial { width: calc(var(--u) * 10); height: calc(var(--u) * 10); background: var(--lens-bright), var(--bg); border: none; box-shadow: var(--lens-edge), var(--lens-drop);
    i { background: var(--accent); width: calc(3 * var(--length)); border-radius: calc(2 * var(--length)); } }
  .s-knob-val, .s-pad-val { color: var(--fg-muted); opacity: 1; font-size: var(--font-size-small); }

  /* ── Folder ── */
  .s-folder {
    > summary { font-weight: 500; color: var(--fg-muted); min-height: var(--h); padding: 0; transition: color .12s; gap: calc(var(--u) * 2);
      &:hover { color: var(--fg); }
      &::after { content: ''; width: var(--glyph); height: var(--glyph); margin-left: auto; background: currentColor; -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; transition: transform .2s; }
      &:focus-visible { outline: none; color: var(--fg); } }
    &[open] > summary { color: var(--fg); text-shadow: var(--emboss); &::after { transform: rotate(-180deg); } }
    /* a folded folder ends in the separator's cut line, so a stack of them reads as rows, not loose words; the last
       has nothing below to part it from */
    &:not([open], .s-section, :last-child) > summary { box-shadow: inset 0 -1px 0 ${edgeC}, 0 1px 0 ${rimC}; }
    /* a shallow flush well: the lens edge without its body, concentric with the lenses it holds */
    .s-content { gap: var(--row-gap); padding: var(--well-pad); border-radius: calc(var(--r-lens) + var(--well-pad) * var(--round)); background: ${faceClear}; box-shadow: var(--lens-edge); }
    &.s-section > summary { pointer-events: none; &::after { display: none; } }
  }
}`

  return baseCSS + '\n' + overrides
}
