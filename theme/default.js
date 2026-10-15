/**
 * Default theme — soft baseline on shared scaffold
 * default → base + soft visual layer
 */

export { lerp, clamp, parseColor, resolveAccent, normalizeHex } from './color.js'
import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveAccent, resolveRoles, parseColor, toHex, lerp, clamp, luminance, ink as legible } from './color.js'
import { surface, woodFigure, woodGrain } from './texture.js'

const chevron = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E")`

const softCSS = (t) => `@layer s-soft {
.s-panel {
  ${metrics(t, {panelPadding: 20, fontFamily: "system-ui, -apple-system, sans-serif"})}

  --bg: ${t.shade};
  --accent: ${t.accent};
  --roundness: ${t.roundness};

  --weight: ${t.weight};

  --r: calc(var(--u) * var(--roundness));

  background-color: var(--bg);
  color-scheme: ${parseColor(t.shade).L < .5 ? 'dark' : 'light'};
  color: color-mix(in oklab, var(--bg), light-dark(black, white) 85%);
  padding: var(--panel-padding);
  border-radius: var(--r);

  min-width: 27ch;
  max-width: calc(var(--u) * 108);
  -webkit-font-smoothing: antialiased;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  > summary, > .s-panel-title {
    font-weight: calc(var(--weight) + 300);
    font-size: larger;
  }
  > summary {
    &::after {
      content: '';
      width: calc(var(--u) * 4);
      height: calc(var(--u) * 4);
      margin-left: auto;
      flex-shrink: 0;
      background: currentColor;
      -webkit-mask: ${chevron} center / contain no-repeat;
      mask: ${chevron} center / contain no-repeat;
      transition: transform 140ms;
    }
  }
  &[open] > summary::after { transform: rotate(-180deg); }

  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: var(--section-gap);
  }

  .s-title {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: calc(var(--u) * 3.5);
    height: calc(var(--u) * 3.5);
    font-size: 10px;
    font-weight: 600;
    line-height: 1;
    border-radius: 50%;
    border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 30%);
    color: color-mix(in oklab, var(--bg), light-dark(black, white) 50%);
    cursor: help;
    flex-shrink: 0;
    &:is(:hover, :focus-visible) + .s-title-text { opacity: 1; visibility: visible; transform: translateY(0); }
  }
  .s-title-text {
    position: absolute;
    left: 0;
    top: 100%;
    margin-top: var(--u);
    padding: calc(var(--u) * 1.5);
    font-size: smaller;
    line-height: 1.3;
    background: color-mix(in oklab, var(--bg), light-dark(black, white) 85%);
    color: light-dark(white, black);
    border-radius: var(--r);
    white-space: normal;
    width: max-content;
    max-width: 30ch;
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-2px);
    transition: opacity 100ms, visibility 100ms, transform 100ms;
  }

  input[type="text"], input[type="number"], select {
    height: calc(1lh + var(--pad) * 2);
  }
  input[type="number"] { font-variant-numeric: tabular-nums; }
  select {
    padding-top: 0;
    padding-bottom: 0;
    cursor: pointer;
    option { font-family: system-ui, -apple-system, sans-serif; }
  }
  button {
    &:focus-visible { outline: 2px solid var(--accent); outline-offset: -1px; }
  }

  .s-boolean {
    align-items: center;
    .s-input { cursor: pointer; }
    &.s-toggle, &.s-switch {
      &:has(input:focus-visible) .s-track {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }
    }
    &.s-switch {
      .s-track {
        width: calc(var(--u) * (8 + var(--spacing) * 2));
        height: calc(var(--u) * 4 + var(--pad));
        background: color-mix(in oklab, var(--bg), light-dark(black, white) 20%);
        border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 15%);
        border-radius: 999px;
        position: relative;
        cursor: pointer;
        transition: background-color 140ms, border-color 140ms;
        margin: calc(var(--pad) / 2) 0;
        &::after {
          content: '';
          display: block;
          position: absolute;
          width: calc(var(--u) * 4);
          height: calc(var(--u) * 4);
          top: 0;
          bottom: 0;
          left: calc(var(--pad) / 2);
          margin: auto 0;
          background: #fff;
          border-radius: 50%;
          transition: transform 200ms;
          transform: translateX(0);
          box-shadow: 0 1px 2px color-mix(in oklab, light-dark(black, white), transparent 75%);
        }
      }
      &:has(input:checked) .s-track {
        background: var(--accent);
        border-color: var(--accent);
        &::after { transform: translateX(calc(var(--u) * (4 + var(--spacing) * 2) - var(--pad))); }
      }
    }
    &.s-toggle {
      .s-track {
        position: relative;
        padding: var(--pad) calc(var(--pad) * 2);
        background-color: color-mix(in oklab, var(--bg), light-dark(black, white) 5%);
        border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 20%);
        border-radius: var(--r);
        cursor: pointer;
        height: calc(1lh + var(--pad) * 2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: smaller;
        overflow: hidden;
        transition: filter 140ms, border-color 140ms;
        &::before {
          content: '';
          position: absolute;
          inset: -1px;
          background: var(--accent);
          opacity: 0;
          transition: opacity 140ms;
        }
        &::after { content: 'Off'; position: relative; transition: color 140ms; }
        &:hover { filter: brightness(1.2); }
        &:active { filter: brightness(.95); }
      }
      &:has(input:checked) .s-track {
        border-color: transparent;
        &::before { opacity: 1; }
        &::after { content: 'On'; color: white; }
      }
    }
    &.s-checkbox {
      input[type="checkbox"] {
        width: calc(var(--u) * 4);
        height: calc(var(--u) * 4);
        cursor: pointer;
      }
      .s-track { display: none; }
    }
  }

  .s-number {
    input[type="number"] {
      flex: 1;
      text-align: right;
      -moz-appearance: textfield;
      &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    }
    .s-step {
      display: flex;
      flex-direction: column;
      gap: 1px;
      button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        padding: 0 calc(var(--u) * 1);
        color: inherit;
        opacity: .5;
        cursor: pointer;
        font-size: .625em;
        line-height: 1;
        &:hover { opacity: 1; }
      }
    }
  }

  .s-slider {
    align-items: center;
    .s-input { flex-direction: row; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: var(--lh); }
    .s-track {
      height: calc(var(--u) * 4);
      margin: calc(var(--u) * (0.5 + 1 * var(--spacing))) 0;
    }
    input[type="range"] { width: 100%; cursor: pointer; }
    .s-marks, .s-mark-labels {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
    }
    .s-marks { display: none; }
    .s-mark-label {
      position: absolute;
      top: 100%;
      transform: translate(-50%, 4px);
      font-size: smaller;
      text-align: center;
      white-space: nowrap;
      opacity: .5;
      &.s-active { opacity: 1; color: var(--accent); }
    }
    .s-readout {
      align-self: center;
      min-width: calc(4ch + var(--pad));
      font-size: smaller;
      padding-left: var(--pad);
      padding-right: 0;
      font-variant-numeric: tabular-nums;
    }
    .s-tooltip {
      position: absolute;
      bottom: 100%;
      transform: translateX(-50%);
      font-size: smaller;
      white-space: nowrap;
      pointer-events: none;
      background: color-mix(in oklab, var(--bg), light-dark(black, white) 85%);
      color: light-dark(white, black);
      padding: 2px 6px;
      border-radius: var(--r);
      margin-bottom: var(--u);
    }
    &.s-multiple {
      .s-interval-track {
        height: calc(var(--u) * 4);
        margin: calc(var(--u) * (0.5 + 1 * var(--spacing))) 0;
        background: linear-gradient(to right,
          transparent var(--low, 0%), color-mix(in oklab, var(--accent), transparent 75%) var(--low, 0%),
          color-mix(in oklab, var(--accent), transparent 75%) var(--high, 100%), transparent var(--high, 100%));
        border-radius: 2px;
      }
      .s-readout {
        align-self: center;
        min-width: calc(4ch + var(--pad));
        font-size: smaller;
        padding-left: var(--pad);
        font-variant-numeric: tabular-nums;
      }
    }
  }

  .s-select {
    &.s-dropdown select { flex: 1; cursor: pointer; }
    &.s-radio {
      .s-input { flex-direction: column; align-items: flex-start; gap: calc(var(--u) * var(--spacing)); }
      .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 1.5); cursor: pointer; }
    }
    &.s-segmented {
      align-items: center;
      .s-input { gap: 0; }
      button {
        flex: 1;
        padding: var(--pad);
        background-color: color-mix(in oklab, var(--bg), light-dark(black, white) 5%);
        border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 20%);
        border-radius: 0;
        margin-left: -1px;
        color: inherit;
        font-size: smaller;
        transition: color 140ms, filter 140ms, border-color 140ms, background-color 140ms;
        &:first-child { margin-left: 0; border-top-left-radius: var(--r); border-bottom-left-radius: var(--r); }
        &:last-child { border-top-right-radius: var(--r); border-bottom-right-radius: var(--r); }
        &:hover { filter: brightness(1.2); }
        &:active { filter: brightness(.95); }
        &.s-selected { background: var(--accent); color: white; border-color: transparent; }
      }
    }
    &.s-checkboxes {
      .s-input { flex-direction: column; align-items: flex-start; gap: calc(var(--u) * var(--spacing)); }
      .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 1.5); cursor: pointer; }
      .s-track { display: none; }
    }
  }

  .s-color {
    &.s-picker .s-color-input {
      input[type="color"] {
        width: calc(var(--u) * 5);
        height: calc(var(--u) * 5);
        left: calc(var(--u) * (0.5 + 1 * var(--spacing)));
      }
      input[type="text"] {
        padding-left: calc(var(--u) * 6 + var(--u) * 2 * var(--spacing));
      }
    }
    &.s-swatches {
      .s-input { flex-wrap: wrap; gap: var(--u); }
      button {
        width: calc(var(--u) * 5);
        height: calc(var(--u) * 5);
        padding: 0;
        box-shadow: 0 0 0 1px color-mix(in oklab, var(--bg), light-dark(black, white) 15%);
        border-radius: var(--r);
        transition: box-shadow 140ms;
        &.s-selected { outline: 2px solid var(--accent); outline-offset: 1px; }
      }
    }
  }

  .s-text input[type="text"] { flex: 1; }

  .s-textarea {
    align-items: flex-start;
    textarea {
      flex: 1;
      resize: both;
      field-sizing: content;
      white-space: nowrap;
      overflow: auto;
      background-color: Canvas;
      min-height: calc(var(--lh) * 3);
      max-height: 50vh;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, currentColor 40%, transparent) transparent;
      &::-webkit-scrollbar { width: 4px; height: 4px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb { background: color-mix(in srgb, currentColor 40%, transparent); border-radius: 2px; }
      &::-webkit-scrollbar-corner { background-color: Canvas; }
    }
    &.s-code textarea { font-family: ui-monospace, monospace; font-size: smaller; }
  }

  .s-button {
    button {
      padding: calc(var(--u) * (1 + var(--spacing))) calc(var(--pad) * 2);
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--r);
      transition: filter 140ms, background-color 140ms, box-shadow 140ms;
      &:hover { filter: brightness(1.2); }
      &:active { filter: brightness(.95); }
      &:disabled { opacity: .35; cursor: not-allowed; }
    }
    &.s-secondary button, button.s-secondary {
      background-color: color-mix(in oklab, var(--bg), light-dark(black, white) 5%);
      box-shadow: 0 0 0 1px color-mix(in oklab, var(--bg), light-dark(black, white) 20%);
      color: inherit;
      &:hover { filter: brightness(1.2); }
      &:active { filter: brightness(.95); }
      &.s-selected { background: var(--accent); color: white; box-shadow: none; }
    }
  }

  .s-folder {
    > summary {
      padding: calc(var(--u) * 2) 0;
      border-bottom: 1px solid;
      opacity: .8;
      &::after {
        content: '';
        width: calc(var(--u) * 4);
        height: calc(var(--u) * 4);
        margin-left: auto;
        flex-shrink: 0;
        background: currentColor;
        -webkit-mask: ${chevron} center / contain no-repeat;
        mask: ${chevron} center / contain no-repeat;
        transition: transform 140ms;
      }
    }
    &[open] > summary { border-bottom: none; }
    &[open] > summary::after { transform: rotate(-180deg); }
    &.s-section {
      > summary { pointer-events: none; &::after { display: none; } }
      &:not([open]) > summary { border-bottom: none; }
    }
  }
  .s-content { padding: calc(var(--u) * 2 * var(--spacing)) 0; }
}
}`

// Soft's look: every control sits in a socket cut into one material. Raised pieces (buttons,
// select, the fold button, the selected segment, the switch knob, the slider thumb) are lit
// faces with a bright top rim, seated in a groove; sunken faces (fields, tracks, the slider
// groove) take the socket wall's shade on their top edge and its lip's light below. The accent
// marks on-states only. Every tone follows from the shade: a crevice shows the material after
// more bounces (its colour multiplied by itself), a lit face lifts by the headroom L(1 - L),
// which vanishes at black and white. A later layer than the form, so it restyles soft alone;
// lab01 and skeu keep the form beneath.
const lookCSS = ({ shade, accent, ink, texture, weight }) => {
  const { dark, onAccent } = resolveRoles(shade, accent)
  const { L, C, H } = parseColor(shade)
  const lit = (k, c = 1, p = 1) => toHex({ L: clamp(L + k * L ** p * (1 - L), 0, 1), C: C * c, H })
  const rgb = c => toHex(parseColor(c)).slice(1).match(/../g).map(h => parseInt(h, 16) / 255)
  const hex = a => '#' + a.map(v => Math.round(clamp(v, 0, 1) * 255).toString(16).padStart(2, '0')).join('')
  const mix = (a, b, t) => { const y = rgb(b); return hex(rgb(a).map((v, i) => lerp(v, y[i], t))) }
  const alpha = (c, a) => c + Math.round(a * 255).toString(16).padStart(2, '0')
  // Nothing reflects all light, so even white darkens in a crevice.
  const bounce = (n, keep = 0) => hex(rgb(shade).map(v => lerp(v * Math.min(v, .95) ** (n - 1), v, keep)))

  // Fitted on the study's three finishes (chalk, bronze, graphite), each within 3 ΔE.
  // Raised faces, top to bottom: the Upgrade key, and the flatter face of a secondary one.
  const face = [lit(.36, .75), lit(-.18)], plain = [lit(.16, .85), lit(-.1)]
  const rim = lit(1.15, .3, 1.5), rimLo = lit(.06, .65)
  const wall = bounce(3.25, .125), floor = bounce(2.25, .25), deep = bounce(7, .275), floorLo = bounce(4.25, .425)
  // The lip catches light; the piece's cast lies over it, as strong as the light it has to take.
  const lip = lit(.42, .5), cast = alpha(bounce(2), Math.min(.6, 1.6 * luminance(shade)))
  // Sunken faces. A field is a lighter face in light finishes, a deeper one in dark; a track (the
  // floor a piece rides in) and the slider's channel are darker. On a light finish these recesses
  // keep at least the contrast a hairline needs to be seen (1.3:1); edges of the small wells 2:1.
  const seen = (tone, ratio) => dark ? tone : legible(shade, ratio, tone)
  const well = dark ? lit(-.22) : lit(.5, .5)
  const track = seen(mix(shade, floor, .45), 1.3), channel = seen(floor, 1.3)
  // The socket's edge: the wall's shade on a light finish, the lip's light on a dark one.
  const edge = legible(shade, 1.3, dark ? lip : wall), edgeSm = legible(shade, 2, dark ? lip : wall)
  const cap = [lit(1.2, .6), lit(.15)]                                 // a small round cap catches more light
  // Lettering: the ink axis, else today's (the shade 88% of the way to black or white), kept
  // legible on every surface it is printed on.
  const base = ink ?? toHex({ L: dark ? .88 + L * .12 : L * .12, C: C * .12, H })
  // Hover lays the ink over a face (a state layer, visible at any lightness); a pressed piece
  // sinks toward the groove floor.
  const toward = (tones, to, a) => tones.map(t => mix(t, to, a))
  const hover = toward(face, base, .06), plainHover = toward(plain, base, .06)
  const press = toward(face, floor, .18), plainPress = toward(plain, floor, .18)
  const muted = toHex({ ...parseColor(base), L: lerp(parseColor(base).L, L, .4) })
  const fg = legible(shade, 4.5, base), fgMuted = legible(shade, 4.5, muted)
  // A mark label beyond the value: the form dims it to half; here that tone, kept legible.
  const markDim = legible(shade, 4.5, mix(fg, shade, .5))
  // Lettering on a raised face spans 20–80% of its gradient: legible against both ends in every
  // state the face takes (all faces sit on one side of the ink, so each step only darkens or lightens it).
  const on = (faces, tone) => faces.reduce((t, [hi, lo]) => legible(mix(hi, lo, .2), 4.5, legible(mix(hi, lo, .8), 4.5, t)), tone)
  const onFace = on([face, hover, press], base), onFaceMuted = on([face, hover], muted), onPlain = on([plain, plainHover, plainPress], muted)
  const onWell = legible(well, 4.5, base), onTrack = legible(track, 4.5, muted)
  const acc = parseColor(accent, null) ? toHex(parseColor(accent)) : accent
  const emboss = dark ? `0 var(--hair) var(--hair) ${alpha('#000000', .5)}` : `0 var(--hair) 0 ${alpha(rim, .7)}`
  const surf = surface(texture, shade)
  // Wood: a raised piece is a planed board, its pale figure over a little grain; the figure is
  // sized to the piece, a few thin lines across a key's face (its knots fall outside the band).
  const figure = texture !== 'wood' ? '' : `${woodFigure(.7)} 0 calc(-10 * var(--length)) / calc(120 * var(--length)) calc(60 * var(--length)), ` +
    `${woodGrain(.1)} 0 0 / calc(240 * var(--length)) calc(120 * var(--length)), `
  const live = ['var(--face-hi)', 'var(--face-lo)']
  // A raised face: its gradient under the wood figure, with an optional glyph layer on top.
  const faceOf = ([hi, lo] = live, over) => `background: ${over ? over + ', ' : ''}${figure}linear-gradient(${hi}, ${lo}); ` +
    `background-blend-mode: ${over ? 'normal, ' : ''}${figure ? 'soft-light, soft-light, ' : ''}normal;`
  // Native controls cannot tint a mask, so these glyphs are baked in their ink.
  const glyph = (d, stroke, w = 1.6) => `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${d}' fill='none' stroke='${encodeURIComponent(stroke)}' stroke-width='${w}' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const check = 'M2.5 6.2 L5 8.6 L9.5 3.6', chevron = 'M3 4.5 L6 7.5 L9 4.5'
  const w = n => Math.min(900, weight + n)

  // A raised piece seated in a socket g wide: the rims on the piece; outside it, the piece's
  // contact shadow, the groove floor, the socket wall darkest at its outer top edge, the lip
  // catching light below, and the piece's soft cast beyond.
  const seat = (g, rims = `inset 0 var(--hair) 0 ${rim}, inset 0 calc(-1 * var(--hair)) 0 ${rimLo}`) => `${rims},
    0 calc(${g} * .35) 0 0 ${deep}, 0 calc(${g} * .5) 0 calc(${g} * .5) ${floorLo}, 0 calc(${g} * .2) 0 calc(${g} * .8) ${floor},
    0 0 0 ${g} ${wall}, 0 calc(${g} * 1.8) calc(${g} * 3.3) calc(${g} * .85) ${cast}, 0 calc(${g} * .4) 0 ${g} ${lip}`
  const seated = seat('var(--g)'), pressed = seat('var(--g)', `inset 0 calc(var(--g) * .5) calc(var(--g) * .8) ${alpha(deep, .35)}`)
  // A raised piece riding in a track (the track is its socket): rims and a contact shadow.
  const riding = s => `inset 0 var(--hair) 0 ${rim}, inset 0 calc(-1 * var(--hair)) 0 ${rimLo}, 0 0 0 calc(var(--hair) * .5) ${alpha(dark ? '#000000' : edgeSm, dark ? .6 : .7)}, 0 calc(${s} * .5) ${s} ${alpha(deep, .45)}`
  // A sunken face: the socket wall shades its top edge; the lip catches light below it.
  const sunk = (s = 'var(--g)', line = edge) => `inset 0 calc(${s} * .45) calc(${s} * .7) ${alpha(deep, dark ? .7 : .5)}, inset 0 0 0 var(--hair) ${line},
    0 calc(-1 * var(--hair)) 0 0 ${alpha(wall, .55)}, 0 var(--hair) 0 0 ${lip}`
  const ring = 'calc(2 * var(--length)) solid color-mix(in oklab, var(--accent), transparent 40%)'
  const thumbRing = `${riding('calc(3 * var(--length))')}, 0 0 0 calc(3 * var(--length)) color-mix(in oklab, var(--accent), transparent 55%)`

  return `@layer s-soft-look {
.s-panel {
  --fg: ${fg};
  --fg-muted: ${fgMuted};
  --hair: var(--length);
  --g: calc(3 * var(--length));             /* groove: the gap between a piece and its socket */
  --face-hi: ${face[0]};
  --face-lo: ${face[1]};
  --well: ${well};
  --track: ${track};
  --channel: ${channel};
  --r-panel: calc(var(--u) * var(--roundness) * 3);
  --r-pill: calc(var(--control-height) / 2 * var(--roundness));
  --control-height: calc(var(--line-height) + 16 * var(--space));
  --row-gap: max(calc(10 * var(--space)), calc(2 * var(--g) + 3 * var(--length)));   /* sockets never touch */

  color: var(--fg);
  border-radius: var(--r-panel);
  padding-bottom: calc(var(--panel-padding) + var(--g));   /* the last row's socket reaches below its box */
  ${surf ? `background: ${surf.image}, var(--bg); background-blend-mode: ${surf.blend};` : ''}
  box-shadow: inset 0 var(--hair) 0 ${alpha(rim, .5)}, 0 0 0 1px ${alpha(wall, dark ? .9 : .35)}, 0 1px 2px ${alpha(deep, .12)}, 0 10px 28px -10px ${alpha(deep, .35)};

  > summary, > .s-panel-title { font-size: calc(15 * var(--length)); font-weight: ${w(200)}; letter-spacing: -0.01em; }
  /* Layout here keeps off margins: soft sits in cascade layers, so a page's own reset (* { margin: 0 })
     would win over them. A spring pushes the fold button right; containers pad and space the sockets. */
  > summary { padding-right: calc(2.25 * var(--length)); }
  > summary::after, > .s-panel-title::after { content: ''; order: 1; flex: 1; width: auto; height: 0; margin: 0; background: none; -webkit-mask: none; mask: none; transform: none; }
  .s-search { order: 2; }
  .s-label { font-weight: ${w(100)}; }
  .s-hint { color: var(--fg-muted); font-size: calc(12 * var(--length)); opacity: 1; }
  .s-info .s-monitor { opacity: 1; }

  /* ── The fold button: a round raised piece in its socket ── */
  .s-fold-icon {
    order: 3; flex: none; display: grid; place-items: center;
    width: calc(24 * var(--length)); height: calc(24 * var(--length)); border-radius: calc(12 * var(--length) * var(--roundness));
    ${faceOf()}
    box-shadow: ${seat('calc(2.25 * var(--length))')};
    i { width: 50%; height: 50%; background: ${onFaceMuted}; -webkit-mask: ${glyph(chevron, '#000')} center / contain no-repeat; mask: ${glyph(chevron, '#000')} center / contain no-repeat; transition: transform 140ms; }
  }
  &[open] > summary .s-fold-icon i { transform: rotate(-180deg); }
  > summary:hover .s-fold-icon { --face-hi: ${hover[0]}; --face-lo: ${hover[1]}; }
  > summary:focus-visible { outline: none; .s-fold-icon { outline: ${ring}; outline-offset: calc(2.25 * var(--length) + 2px); } }

  /* ── Sunken fields: text, number, colour hex, textarea ── */
  input[type="text"], input[type="number"], textarea {
    appearance: none; -webkit-appearance: none;
    height: var(--control-height); padding: 0 calc(12 * var(--space));
    background: var(--well); border: none; border-radius: var(--r-pill);
    box-shadow: ${sunk()};
    color: ${onWell}; font: inherit;
    &::placeholder { color: ${legible(well, 4.5, muted)}; }
    &:focus-visible { outline: ${ring}; outline-offset: calc(2 * var(--length)); }
  }
  textarea { height: auto; padding: calc(8 * var(--space)) calc(12 * var(--space)); border-radius: min(var(--r-pill), calc(12 * var(--length) * var(--roundness))); }

  /* Raised pieces keep their sockets inside the column and clear of each other. */
  :is(.s-select.s-dropdown, .s-boolean.s-toggle, .s-button) .s-input { padding: 0 var(--g); }
  .s-button .s-input { gap: calc(var(--pad) + 2 * var(--g)); }

  /* ── Select: a raised pill in its socket ── */
  select {
    appearance: none; -webkit-appearance: none;
    height: var(--control-height); padding: 0 calc(30 * var(--length)) 0 calc(12 * var(--space));
    border: none; border-radius: var(--r-pill);
    ${faceOf(live, `${glyph(chevron, onFaceMuted)} no-repeat right calc(10 * var(--length)) center / calc(12 * var(--length))`)}
    box-shadow: ${seated}; color: ${onFace}; text-shadow: ${emboss}; font: inherit;
    &:hover { --face-hi: ${hover[0]}; --face-lo: ${hover[1]}; }
    &:focus-visible { outline: ${ring}; outline-offset: calc(var(--g) + 2px); }
  }
  .s-number .s-step button { color: var(--fg-muted); opacity: 1; &:hover { color: var(--fg); } }

  /* ── Slider: a thin socket, filled with the accent, under a raised thumb ── */
  .s-slider {
    .s-track { height: var(--control-height); margin: 0; display: flex; align-items: center; }
    input[type="range"] {
      -webkit-appearance: none; appearance: none; height: calc(6 * var(--length)); border-radius: 999px;
      background: linear-gradient(to right, var(--accent) var(--p, 0%), var(--channel) var(--p, 0%));
      box-shadow: ${sunk('calc(2 * var(--length))')};
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(18 * var(--length)); height: calc(18 * var(--length)); border-radius: calc(9 * var(--length) * var(--roundness)); border: none; ${faceOf(cap)} box-shadow: ${riding('calc(3 * var(--length))')}; }
      &::-moz-range-thumb { width: calc(18 * var(--length)); height: calc(18 * var(--length)); border-radius: calc(9 * var(--length) * var(--roundness)); border: none; ${faceOf(cap)} box-shadow: ${riding('calc(3 * var(--length))')}; }
      &:focus-visible { outline: none; }
      &:focus-visible::-webkit-slider-thumb { box-shadow: ${thumbRing}; }
      &:focus-visible::-moz-range-thumb { box-shadow: ${thumbRing}; }
    }
    /* The readout fits its value and unit: at least 6ch, so the track holds still while dragging. */
    .s-readout { flex: none; min-width: calc(6ch + 12 * var(--space)); padding: 0 calc(6 * var(--space)); text-align: right; background: transparent; box-shadow: none; color: var(--fg-muted); font-size: calc(12.5 * var(--length));
      &:focus-visible { color: ${onWell}; background: var(--well); box-shadow: ${sunk()}; } }
    input.s-readout { width: calc(9ch + 12 * var(--space)); @supports (field-sizing: content) { field-sizing: content; width: auto; } }
    &.s-multiple .s-interval-track { height: calc(6 * var(--length)); border-radius: 999px; box-shadow: ${sunk('calc(2 * var(--length))')};
      background: linear-gradient(to right, var(--channel) var(--low, 0%), var(--accent) var(--low, 0%), var(--accent) var(--high, 100%), var(--channel) var(--high, 100%));
      input[type="range"] { height: 100%; background: transparent; box-shadow: none; } }
    .s-mark-label { opacity: 1; color: ${markDim}; &.s-active { color: var(--fg); } }
  }

  /* ── Switch: a sunken track, a raised knob; on, the track fills with the accent ── */
  .s-boolean {
    &.s-switch {
      .s-track { width: calc(38 * var(--length)); height: calc(22 * var(--length)); margin: 0; border: none; border-radius: calc(11 * var(--length) * var(--roundness)); background: var(--track); box-shadow: ${sunk('calc(2 * var(--length))')};
        &::after { width: calc(16 * var(--length)); height: calc(16 * var(--length)); left: calc(3 * var(--length)); border-radius: calc(8 * var(--length) * var(--roundness)); ${faceOf(cap)} box-shadow: ${riding('calc(2 * var(--length))')}; } }
      &:has(input:checked) .s-track { background: var(--accent); &::after { transform: translateX(calc(16 * var(--length))); } }
    }
    &.s-toggle .s-track {
      height: var(--control-height); padding: 0 calc(14 * var(--space)); border: none; border-radius: var(--r-pill);
      ${faceOf()} box-shadow: ${seated};
      font-size: inherit; font-weight: ${w(100)}; color: ${onFaceMuted}; text-shadow: ${emboss};
      &::before { display: none; }
      &:hover { filter: none; --face-hi: ${hover[0]}; --face-lo: ${hover[1]}; } &:active { filter: none; }
    }
    &.s-toggle:has(input:checked) .s-track { --face-hi: var(--accent); --face-lo: var(--accent); box-shadow: ${pressed}; &::after { color: ${onAccent}; text-shadow: none; } }
    &:is(.s-toggle, .s-switch):has(input:focus-visible) .s-track { outline: ${ring}; outline-offset: calc(2 * var(--length)); }
  }
  /* Checkbox and radio: small sunken wells; the accent draws the mark. A checkbox list hides
     its native inputs and draws the well on the track beside each. */
  .s-boolean.s-checkbox input[type="checkbox"], .s-select.s-radio input[type="radio"], .s-select.s-checkboxes .s-track {
    appearance: none; -webkit-appearance: none; flex: none; margin: 0; position: relative;
    width: calc(18 * var(--length)); height: calc(18 * var(--length));
    border: none; border-radius: calc(5 * var(--length) * var(--roundness)); background: var(--well) center / 80% no-repeat;
    box-shadow: ${sunk('calc(2 * var(--length))', edgeSm)};
    cursor: pointer;
    &:focus-visible { outline: ${ring}; outline-offset: calc(2 * var(--length)); }
  }
  .s-boolean.s-checkbox input[type="checkbox"]:checked { background-image: ${glyph(check, acc, 2)}; }
  .s-select.s-radio input[type="radio"] { border-radius: 50%;
    &:checked { background-image: radial-gradient(circle, var(--accent) 0 32%, transparent 36%); background-size: 100%; } }
  .s-select.s-checkboxes {
    .s-track { display: block; &::after { content: ''; position: absolute; inset: 10%; background: var(--s-color, var(--accent)); -webkit-mask: ${glyph(check, '#000', 2)} center / contain no-repeat; mask: ${glyph(check, '#000', 2)} center / contain no-repeat; opacity: 0; } }
    label:has(input:checked) .s-track::after { opacity: 1; }
    label:has(input:focus-visible) .s-track { outline: ${ring}; outline-offset: calc(2 * var(--length)); }
  }

  /* ── Segmented: one sunken track; the selected option is a raised piece inside it ── */
  .s-select.s-segmented {
    .s-input { gap: 0; padding: calc(3 * var(--length)); border-radius: var(--r-pill); background: var(--track); box-shadow: ${sunk()}; }
    button {
      height: calc(var(--control-height) - 6 * var(--length)); min-width: 0; margin: 0; padding: 0 calc(8 * var(--space));
      border: none; border-radius: calc(var(--r-pill) - 3 * var(--length)); background: transparent;
      color: ${onTrack}; font-size: inherit; font-weight: ${w(100)};
      transition: color 140ms, box-shadow 140ms;
      &:hover { filter: none; color: var(--fg); } &:active { filter: none; }
      &.s-selected { ${faceOf(face)} color: ${onFace}; text-shadow: ${emboss}; box-shadow: ${riding('calc(2 * var(--length))')}; }
      &:focus-visible { outline: ${ring}; outline-offset: calc(1 * var(--length)); }
    }
  }

  /* ── Colour: a raised chip inside the sunken hex field ── */
  .s-color.s-picker .s-color-input {
    input[type="color"] { left: calc(6 * var(--length)); width: calc(20 * var(--length)); height: calc(20 * var(--length)); }
    input[type="text"] { padding-left: calc(36 * var(--length)); }
  }
  .s-color {
    input[type="color"] { border-radius: calc(10 * var(--length) * var(--roundness)); overflow: hidden; box-shadow: ${riding('calc(2 * var(--length))')};
      &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: inherit; }
      &::-moz-color-swatch { border: none; border-radius: inherit; } }
    &.s-swatches button { border: none; border-radius: calc(5 * var(--length) * var(--roundness)); box-shadow: inset 0 0 0 1px rgb(0 0 0 / .12), 0 var(--hair) calc(2 * var(--length)) ${alpha(deep, .35)}; &.s-selected { outline: ${ring}; outline-offset: calc(2 * var(--length)); } }
  }

  /* ── Buttons: raised pills in sockets, lettered in the ink. The primary stands brighter
        and bolder; the secondary sits flatter, lettered in the muted ink. ── */
  .s-button {
    button {
      flex: 1; min-width: 0; height: var(--control-height); padding: 0 calc(16 * var(--space)); border: none; border-radius: var(--r-pill);
      ${faceOf()}
      box-shadow: ${seated}; color: ${onFace}; font-weight: ${w(100)}; text-shadow: ${emboss};
      transition: box-shadow 140ms;
      &:hover { filter: none; --face-hi: ${hover[0]}; --face-lo: ${hover[1]}; }
      &:active { filter: none; --face-hi: ${press[0]}; --face-lo: ${press[1]}; box-shadow: ${pressed}; }
      &:focus-visible { outline: ${ring}; outline-offset: calc(var(--g) + 2px); }
      &:disabled { opacity: .5; }
    }
    &.s-secondary button, button.s-secondary {
      --face-hi: ${plain[0]}; --face-lo: ${plain[1]}; color: ${onPlain}; font-weight: ${w(0)};
      &:hover { --face-hi: ${plainHover[0]}; --face-lo: ${plainHover[1]}; }
      &:active { --face-hi: ${plainPress[0]}; --face-lo: ${plainPress[1]}; }
    }
  }

  /* ── Structure: engraved rules ── */
  .s-folder > summary { opacity: 1; color: var(--fg); font-weight: ${w(200)}; border-bottom-color: ${alpha(wall, .45)};
    &::after { background: var(--fg-muted); } }
  .s-folder:not([open], .s-section) > summary { box-shadow: 0 1px 0 ${alpha(lip, .9)}; }
  .s-separator { background: ${alpha(wall, .45)}; opacity: 1; box-shadow: 0 1px 0 ${alpha(lip, .9)}; }
  .s-separator-labeled { background: none; box-shadow: none; &::before, &::after { background: ${alpha(wall, .45)}; opacity: 1; box-shadow: 0 1px 0 ${alpha(lip, .9)}; } }
  .s-knob-dial { border: none; ${faceOf(face)} box-shadow: ${seat('calc(2 * var(--length))')}; }
  .s-pad { border: none; background: var(--well); box-shadow: ${sunk()}; }
}
}`
}

/**
 * The rounded form lab01 and skeu are built on: soft's structure and its first
 * look, kept as they are so soft's own look can evolve without restyling them.
 */
export function form({
  shade = '#f5f4f2',
  accent = '#2563eb',
  spacing = 1,
  weight = 400,
  roundness = 1,
  size = 1,
  font,
} = {}) {
  return baseCSS + '\n' + softCSS({ shade, accent: resolveAccent(accent, shade), spacing, weight, roundness, size, font })
}

/**
 * Default (soft) theme — the mainstream baseline. Like every other theme, it is a
 * function of axes, so it can be tuned: soft({ shade, accent, roundness, ... }).
 * `ink` letters the controls; `texture` ('grain' | 'wood') gives the material its surface.
 */
export default function soft(axes = {}) {
  const { shade = '#f5f4f2', accent = '#2563eb', weight = 400, ink, texture } = axes
  return form(axes) + '\n' + lookCSS({ shade, accent: resolveAccent(accent, shade), ink, texture, weight })
}
