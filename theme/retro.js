/**
 * retro – Windows 98, measured from the original: the Keyboard Properties dialog (Speed tab) of
 * Windows 98 running in v86 (https://copy.sh/v86/?profile=windows98), each guest pixel doubled
 * (test/calibration/win98-*.png, by capture.mjs). Shapes of the radio and check glyphs cross-checked
 * with 98.css (Jordan Scales, MIT, https://github.com/jdan/98.css).
 *
 * Depth lives in border colour only. Every edge is two 1px rings in Win32 DrawEdge order:
 * raised = highlight and 3D light on the top-left, dark shadow and shadow on the bottom-right
 * (buttons, thumbs, the window frame); sunken = the reverse (fields, the slider channel, check
 * boxes); etched = shadow over highlight (group boxes, separators). Radius 0, no blur, no gradient.
 * The default button adds a 1px frame in the text colour; a pressed or checked toggle shows the
 * dithered face.
 *
 * Layout follows the property sheet: captions sit above their control, check boxes and radios
 * carry theirs to the right, folders are etched group boxes with the caption cut into the top
 * edge, a trackbar shows its ticks below a pointed thumb and its end captions (`marks` with text
 * on the ends only) beside the channel. Native metrics at size 11 / 13 (its 11px body), spacing 1 are the
 * dialog's own.
 *
 * Colour: `shade` is the 3D face; the bevel tones derive from it so the classic face #c0c0c0 gives
 * exactly white / #808080 / black (highlight lifts the face by the classic step in OKLab
 * lightness, the shadow keeps the classic ratio, the dark shadow is black; 3D light is the face,
 * as measured). Dark shades flip text to light, sink the fields below the face and hold the
 * highlight to 3:1 against it so edges stay visible. `accent` is the title bar and the selection
 * highlight (#000080 by default); focus is the dotted rectangle.
 *
 * Typeface: "MS Sans Serif" FontStruction by "lou" (https://fontstruct.com/fontstructions/show/1384746,
 * bold: /1384862), licensed CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/), as woff2
 * converted by 98.css. A pixel copy of the 8pt system face: glyph shapes match the reference, but its
 * glyphs start 1px further left and its space is 1px narrower; text-indent and word-spacing restore
 * both. Crisp at 11px and 22px (size 11 / 13 and 22 / 13), soft in between, so at size 1 (13px).
 *
 * retro(axes?) → CSS string
 */

import metrics, { scale } from './metrics.js'
import baseCSS from './base.js'
import { parseColor, normalizeHex, toHex, ink, resolveAccent, clamp, mix } from './color.js'

const FACE = parseColor('#c0c0c0').L, SHADOW = parseColor('#808080').L

// Pixel art → SVG data URL: one string per row, one character per pixel; unmapped characters stay clear.
const art = (rows, colors) => {
  const d = {}
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      let n = 1
      while (row[x + n] === row[x]) n++
      if (colors[row[x]]) (d[row[x]] ??= []).push(`M${x} ${y}h${n}v1h-${n}z`)
      x += n
    }
  })
  const paths = Object.entries(d).map(([c, p]) => `<path fill='${colors[c]}' d='${p.join('')}'/>`).join('')
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${rows[0].length}' height='${rows.length}' shape-rendering='crispEdges'>${paths}</svg>`)}")`
}

// The trackbar thumb as measured on the reference; the other glyphs as Win98 draws them (cross-checked with 98.css)
const THUMB = ['WWWWWWWWWWk', ...Array(15).fill('W........gk'), ' W......gk ', '  W....gk  ', '   W..gk   ', '    Wgk    ', '     k     ']
const CHECK = ['      k', '     kk', 'k   kkk', 'kk kkk ', 'kkkkk  ', ' kkk   ', '  k    ']
const RADIO = ['    gggg    ', '  ggkkkkgg  ', ' gkkwwwwkkW ', ' gkwwwwwwlW ', 'gkwwwwwwwwlW', 'gkwwwwwwwwlW', 'gkwwwwwwwwlW', 'gkwwwwwwwwlW', ' gkwwwwwwlW ', ' gllwwwwllW ', '  WWllllWW  ', '    WWWW    ']
const DOT = [...Array(4).fill(''), '     kk', '    kkkk', '    kkkk', '     kk', ...Array(4).fill('')].map(r => r.padEnd(12))
const DOWN = ['kkkkkkk', ' kkkkk ', '  kkk  ', '   k   ']
const UP = [...DOWN].reverse()
const LEFT = ['   k', '  kk', ' kkk', 'kkkk', ' kkk', '  kk', '   k']
const RIGHT = LEFT.map(r => [...r].reverse().join(''))
const SPIN_UP = ['  k  ', ' kkk ', 'kkkkk'], SPIN_DOWN = [...SPIN_UP].reverse()
const MINIMIZE = ['kkkkkk', 'kkkkkk']
const CLOSE = ['kk    kk', ' kk  kk ', '  kkkk  ', '   kk   ', '  kkkk  ', ' kk  kk ', 'kk    kk']
const MAXIMIZE = ['kkkkkkkkk', 'kkkkkkkkk', ...Array(6).fill('k       k'), 'kkkkkkkkk']
const PLUS = ['ggggggggg', 'gwwwwwwwg', 'gwwwkwwwg', 'gwwwkwwwg', 'gwkkkkkwg', 'gwwwkwwwg', 'gwwwkwwwg', 'gwwwwwwwg', 'ggggggggg']
const MINUS = PLUS.map(r => r.replace(/^(gwww)k(wwwg)$/, '$1w$2'))

const FONT = (weight, data) => `@font-face { font-family: 'Pixelated MS Sans Serif'; font-weight: ${weight}; font-style: normal; font-display: block; src: url(data:font/woff2;base64,${data}) format('woff2'); }`

export default function retro({
  shade = '#c0c0c0',
  accent = '#000080',
  size = 1,
  spacing = 1,
  font,
  weight = 400,
} = {}) {
  const tone = parseColor(shade, null) ?? parseColor('#c0c0c0')
  const { L, C, H } = tone
  const at = l => toHex({ L: clamp(l, 0, 1), C, H })
  const dark = L < .5
  const hex = normalizeHex(shade)
  const face = /^#[0-9a-f]{6}$/.test(hex) ? hex : at(L)
  // on a dark face the highlight is held to 3:1 so edges still read as control boundaries (WCAG 1.4.11)
  const hi = dark ? ink(face, 3, at(L + 1 - FACE)) : at(L + 1 - FACE), shadow = at(L * SHADOW / FACE), dk = at(0)
  const text = ink(face, 4.5, dark ? '#ffffff' : '#000000')
  const win = dark ? at(L * .7) : hi
  const winText = ink(win, 4.5, text)
  const sel = resolveAccent(accent, shade) || '#000080'
  const selText = ink(sel, 4.5, '#ffffff')
  const gray = mix(face, text, 1 / 3)
  const placeholder = ink(win, 4.5, mix(win, winText, .5))
  // Body 11px: Windows 98 sets labels and values in MS Sans Serif 8pt, 11px.
  const body = 11
  // Bevel lines stay whole pixels at any size: Win98 never scaled its edges.
  const px = Math.max(1, Math.round(scale(size, body)))

  const c = { W: hi, '.': face, l: face, g: shadow, k: dk, w: win }
  const glyph = rows => art(rows, { k: text })
  const thumb = art(THUMB, c)
  const radio = art(RADIO, c), dot = art(DOT, { k: winText }), dotOff = art(DOT, { k: gray })
  const check = art(CHECK, { k: winText }), checkOff = art(CHECK, { k: gray })
  const down = glyph(DOWN), up = glyph(UP), left = glyph(LEFT), right = glyph(RIGHT)
  const spinUp = glyph(SPIN_UP), spinDown = glyph(SPIN_DOWN)
  const minimize = glyph(MINIMIZE), maximize = glyph(MAXIMIZE), close = art(CLOSE, { k: winText })
  const tree = { g: gray, w: win, k: winText }, plus = art(PLUS, tree), minus = art(MINUS, tree)

  const ring = (...layers) => layers.map(([d, v]) => `inset calc(${d} * var(--px)) calc(${d} * var(--px)) var(--${v})`).join(', ')
  const raised = ring([-1, 'dk'], [1, 'hi'], [-2, 'shadow'], [2, 'light'])
  const sunken = ring([-1, 'hi'], [1, 'shadow'], [-2, 'light'], [2, 'dk'])
  const pressed = ring([-1, 'hi'], [1, 'dk'], [-2, 'light'], [2, 'shadow'])
  const etched = ring([-1, 'hi'], [1, 'shadow'], [-2, 'shadow'], [2, 'hi'])
  const rule = `inset 0 calc(-1 * var(--px)) var(--hi), inset 0 var(--px) var(--shadow)`
  // the default button's frame takes the text colour: black on the classic face, light on a dark one
  const frame = `inset 0 0 0 var(--px) var(--text), ${ring([-2, 'dk'], [2, 'hi'], [-3, 'shadow'], [3, 'light'])}`
  const framePressed = `inset 0 0 0 var(--px) var(--text), inset 0 0 0 calc(2 * var(--px)) var(--shadow)`
  const windowEdge = ring([-1, 'dk'], [1, 'light'], [-2, 'shadow'], [2, 'hi'])
  const dither = `repeating-conic-gradient(var(--hi) 0 25%, var(--face) 0 50%) 0 0 / calc(2 * var(--px)) calc(2 * var(--px))`
  const len = n => `calc(${n} * var(--length))`
  const sp = n => `calc(${n} * var(--space))`
  const focus = `1px dotted var(--text)`
  const pixelFont = !(typeof font === 'string' && font.trim())

  const overrides = `${FONT(400, REGULAR)}
${FONT(700, BOLD)}
.s-panel {
  ${metrics({ size, spacing, font }, { body, fontSize: 11, lineHeight: 13, controlHeight: 23, inset: 4, rowGap: 12, columnGap: 6, sectionGap: 8, panelPadding: 21, fontFamily: "'Pixelated MS Sans Serif', 'MS Sans Serif', 'Microsoft Sans Serif', Tahoma, Arial, sans-serif" })}

  --face: ${face};
  --light: ${face};
  --hi: ${hi};
  --shadow: ${shadow};
  --dk: ${dk};
  --text: ${text};
  --win: ${win};
  --win-text: ${winText};
  --gray: ${gray};
  --placeholder: ${placeholder};
  --sel: ${sel};
  --sel-text: ${selText};
  --info: #ffffe1;
  --info-text: #000000;
  --bg: var(--face);
  --accent: var(--sel);
  --px: ${px}px;
  --weight: ${weight};
  --roundness: 0;
  --r: 0;
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--face);
  color: var(--text);
  box-shadow: ${windowEdge};
  padding: calc(3 * var(--px));
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
  font-weight: var(--weight);
  ${pixelFont ? 'word-spacing: var(--length); text-indent: var(--length);' : ''}
  -webkit-font-smoothing: none;
  border-radius: 0;
  min-width: 0;
  & ::selection { background: var(--sel); color: var(--sel-text); }

  /* ── Title bar: 18px, bold caption 3px in, caption buttons 16×14 two pixels from the edge ── */
  > summary, > .s-panel-title {
    height: ${len(18)};
    padding: ${len(3)} ${len(2)} 0;
    align-items: flex-start;
    gap: ${len(2)};
    background: var(--sel);
    color: var(--sel-text);
    font-weight: 700;
    line-height: ${len(13)};
    user-select: none;
  }
  > summary:focus-visible { outline: none; .s-fold-icon i { outline: ${focus}; outline-offset: calc(-1 * var(--px)); } }
  .s-fold-icon, .s-search-btn {
    flex: none; display: block; width: ${len(16)}; height: ${len(14)}; margin: ${len(-1)} 0 0 auto; padding: 0;
    background: var(--face); color: var(--text); box-shadow: ${raised}; -webkit-mask: none; mask: none;
  }
  .s-fold-icon i { display: block; width: 100%; height: 100%; background: ${maximize} ${len(3)} ${len(2)} / ${len(9)} ${len(9)} no-repeat; }
  &[open] > summary .s-fold-icon i { background: ${minimize} ${len(4)} ${len(9)} / ${len(6)} ${len(2)} no-repeat; }
  > summary:active .s-fold-icon { box-shadow: ${pressed}; i { translate: var(--px) var(--px); } }
  .s-fold-icon { order: 2; :has(> .s-search) > & { margin-left: 0; } }
  .s-search { order: 1; margin-left: auto; gap: ${len(2)}; }
  .s-search-btn { position: relative; cursor: pointer;
    &::before { content: ''; position: absolute; inset: ${len(2)} ${len(3)}; background: var(--text); -webkit-mask: var(--s-search-icon) center / contain no-repeat; mask: var(--s-search-icon) center / contain no-repeat; }
    &:active { box-shadow: ${pressed}; }
    &:focus-visible { outline: ${focus}; outline-offset: calc(-3 * var(--px)); } }
  .s-search-input { height: ${len(14)}; width: ${len(120)}; padding: 0 ${len(3)}; background: var(--win); color: var(--win-text); box-shadow: ${ring([-1, 'hi'], [1, 'shadow'])}; font: inherit; font-weight: 400; outline: none; &::placeholder { color: var(--placeholder); opacity: 1; } }
  .s-search-input::-webkit-search-cancel-button { -webkit-appearance: none; width: ${len(8)}; height: ${len(7)}; background: ${close} center / 100% 100% no-repeat; cursor: pointer; }
  &.s-searching .s-search-btn { box-shadow: ${pressed}; &::before { translate: var(--px) var(--px); } }

  /* ── Content: the page margins of the property sheet ── */
  .s-panel-content { gap: var(--section-gap); padding: ${sp(8)} var(--panel-padding) ${sp(6)}; }
  .s-panel-content > :not(.s-folder) + :not(.s-folder) { margin-top: calc(var(--row-gap) - var(--section-gap)); }

  /* ── Rows: the caption above its control ── */
  .s-control { flex-direction: column; align-items: stretch; gap: ${sp(2)}; }
  .s-label-group { width: auto; min-width: 0; max-width: none; gap: 0; line-height: ${len(13)}; }
  .s-label { color: var(--text); }
  .s-hint { font-size: inherit; opacity: 1; color: var(--text); }
  .s-input { min-height: 0; align-items: center; &[inert] { opacity: 1; } }
  .s-control:has(> .s-input[inert]) { .s-label, .s-hint, .s-mark-label, .s-readout, .s-monitor, .s-knob-val { color: var(--gray); } }

  /* ── What's-this button and the info tip (InfoBackground #ffffe1, 1px dark frame) ── */
  .s-title { display: inline-grid; place-items: center; width: ${len(13)}; height: ${len(13)}; background: var(--face); box-shadow: ${raised}; font-weight: 700; line-height: 1; cursor: help; }
  .s-title-text, .s-tooltip {
    padding: ${len(1)} ${len(3)}; background: var(--info); color: var(--info-text); border: var(--px) solid var(--dk);
    font-weight: 400; line-height: ${len(13)}; white-space: nowrap; z-index: 10;
  }
  .s-title-text { margin-top: ${len(2)}; padding-left: ${len(4)}; white-space: normal; text-indent: 0; }

  /* ── Fields: sunken window, 23px tall, the text centred on it and 4px in (the owner's call: the Speed tab's test
     field sets it 4px down, 1px above centre, win98-typed.png) ── */
  input[type="text"], input[type="number"], textarea, select {
    height: var(--control-height); padding: calc((var(--control-height) - ${len(13)}) / 2) var(--inset); line-height: ${len(13)}; border: 0; border-radius: 0;
    background: var(--win); color: var(--win-text); box-shadow: ${sunken};
    font: inherit; word-spacing: inherit; text-indent: 0; outline: none;
    &::placeholder { color: var(--placeholder); opacity: 1; }
  }
  .s-text input, .s-textarea textarea { flex: 1; }
  .s-control:has(> .s-input[inert]) :is(input[type="text"], input[type="number"], textarea, select) { background: var(--face); color: var(--gray); }
  input[type="number"] { -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }

  /* ── Scrollbars: 16px, raised arrow buttons on a dithered track ── */
  textarea::-webkit-scrollbar { width: ${len(16)}; height: ${len(16)}; }
  textarea::-webkit-scrollbar-track { background: ${dither}; }
  textarea::-webkit-scrollbar-thumb { background: var(--face); box-shadow: ${raised}; }
  textarea::-webkit-scrollbar-button:single-button { display: block; width: ${len(16)}; height: ${len(16)}; background-color: var(--face); box-shadow: ${raised}; background-repeat: no-repeat; background-position: center; background-size: ${len(7)} ${len(4)}; }
  textarea::-webkit-scrollbar-button:single-button:vertical:decrement { background-image: ${up}; }
  textarea::-webkit-scrollbar-button:single-button:vertical:increment { background-image: ${down}; }
  textarea::-webkit-scrollbar-button:single-button:horizontal:decrement { background-image: ${left}; background-size: ${len(4)} ${len(7)}; }
  textarea::-webkit-scrollbar-button:single-button:horizontal:increment { background-image: ${right}; background-size: ${len(4)} ${len(7)}; }
  textarea::-webkit-scrollbar-button:active { box-shadow: ${ring([-1, 'shadow'], [1, 'shadow'])}; }
  textarea::-webkit-scrollbar-corner { background: var(--face); }

  /* ── Textarea ── */
  .s-textarea textarea { height: auto; min-height: calc(3 * var(--line-height) + ${len(8)}); padding: ${len(4)} var(--inset); resize: none; field-sizing: content; max-height: 50vh; }
  .s-textarea.s-code textarea { font-family: ui-monospace, 'Courier New', monospace; word-spacing: 0; }

  /* ── Buttons: 75×23; the primary is the default button (dark frame), pressed sinks and shifts the text ── */
  /* centred captions: the face's missing 1px bearing goes into the left padding (2px, half of it lands) */
  button { font: inherit; word-spacing: inherit; text-indent: 0; cursor: pointer; }
  .s-button {
    .s-input { justify-content: flex-end; gap: ${sp(6)}; flex-wrap: wrap; }
    button {
      flex: none; min-width: ${len(75)}; height: var(--control-height); padding: 0 ${len(5)} 0 ${len(7)};
      background: var(--face); color: var(--text); border: 0; border-radius: 0; box-shadow: ${frame}; outline: none;
      &:active:not(:disabled) { box-shadow: ${framePressed}; padding: var(--px) ${len(5)} 0 calc(${len(7)} + 2 * var(--px)); }
      &:focus-visible { outline: ${focus}; outline-offset: calc(-4 * var(--px)); }
      &:disabled { color: var(--gray); cursor: default; }
      &[aria-busy="true"] { cursor: progress; background: ${dither}; }
    }
    &.s-secondary button, button.s-secondary { box-shadow: ${raised};
      &:active:not(:disabled) { box-shadow: ${pressed}; } }
  }

  /* ── Check box 13×13, radio 12×12, captions 6px to the right (98.css); focus rings the caption ── */
  .s-boolean { flex-direction: row-reverse; justify-content: flex-end; align-items: center; gap: ${len(6)};
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; margin: 0; }
    .s-input { flex: none; cursor: pointer; }
    .s-label-group { flex: 1; }
    &:has(input:focus-visible) .s-label { outline: ${focus}; outline-offset: var(--px); }
  }
  .s-boolean.s-checkbox .s-track, .s-checkboxes .s-track {
    flex: none; width: ${len(13)}; height: ${len(13)}; background: var(--win) no-repeat center / ${len(7)} ${len(7)}; box-shadow: ${sunken};
  }
  .s-boolean.s-checkbox:has(input:checked) .s-track, .s-checkboxes label:has(input:checked) .s-track { background-image: ${check}; }
  .s-boolean.s-checkbox:has(.s-input[inert]) .s-track, .s-checkboxes:has(.s-input[inert]) .s-track { background-color: var(--face); }
  .s-boolean.s-checkbox:has(.s-input[inert] input:checked) .s-track { background-image: ${checkOff}; }
  .s-checkboxes label:has(input:checked) .s-track { background-color: var(--s-color, var(--win)); }

  /* Switch: a sunken slot with a raised block; on fills the slot with the selection colour */
  .s-boolean.s-switch .s-track {
    position: relative; display: block; width: ${len(28)}; height: ${len(15)}; background: var(--win); box-shadow: ${sunken};
    &::after { content: ''; position: absolute; top: calc(2 * var(--px)); left: calc(2 * var(--px)); width: ${len(12)}; height: calc(100% - 4 * var(--px)); background: var(--face); box-shadow: ${raised}; transition: translate .08s steps(2); }
  }
  .s-boolean.s-switch:has(input:checked) .s-track { background: var(--sel); &::after { translate: calc(${len(28)} - ${len(12)} - 4 * var(--px)) 0; } }
  .s-boolean.s-switch:has(.s-input[inert]) .s-track { background: var(--face); }
  .s-boolean.s-switch:has(.s-input[inert] input:checked) .s-track { background: var(--gray); }

  /* Toggle: a push-like check box; on is pressed into the dithered face */
  .s-boolean.s-toggle .s-track {
    display: grid; place-items: center; min-width: ${len(75)}; height: var(--control-height); padding: 0 ${len(5)} 0 ${len(7)}; text-indent: 0;
    background: var(--face); box-shadow: ${raised};
    &::after { content: 'Off'; }
  }
  .s-boolean.s-toggle:has(input:checked) .s-track { background: ${dither}; box-shadow: ${pressed}; padding: var(--px) ${len(5)} 0 calc(${len(7)} + 2 * var(--px)); &::after { content: 'On'; } }
  .s-boolean.s-toggle:has(input:focus-visible) { .s-label { outline: none; } .s-track { outline: ${focus}; outline-offset: calc(-4 * var(--px)); } }

  /* ── Select ── */
  .s-select {
    &.s-dropdown {
      .s-input { position: relative; }
      .s-input::after { content: ''; position: absolute; top: calc(2 * var(--px)); right: calc(2 * var(--px)); bottom: calc(2 * var(--px)); width: ${len(16)}; background: var(--face) ${down} no-repeat center / ${len(7)} ${len(4)}; box-shadow: ${raised}; pointer-events: none; }
      .s-input:active::after { box-shadow: ${ring([-1, 'shadow'], [1, 'shadow'])}; background-position: calc(50% + var(--px)) calc(50% + var(--px)); }
      select { flex: 1; appearance: none; -webkit-appearance: none; padding-right: calc(${len(16)} + var(--inset)); cursor: pointer;
        &:focus-visible { background: var(--sel); color: var(--sel-text); }
        option { background: var(--win); color: var(--win-text); } }
    }
    &.s-radio, &.s-checkboxes {
      .s-input { flex-direction: column; align-items: flex-start; gap: ${sp(3)}; }
      .s-input label { display: flex; align-items: center; gap: ${len(6)}; cursor: pointer; line-height: ${len(13)}; }
      .s-input label:has(input:focus-visible) > span:last-child { outline: ${focus}; outline-offset: var(--px); }
    }
    &.s-checkboxes input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; margin: 0; }
    &.s-radio input[type="radio"] {
      appearance: none; -webkit-appearance: none; flex: none; margin: 0; width: ${len(12)}; height: ${len(12)};
      background: ${radio} 0 0 / 100% 100% no-repeat; outline: none; cursor: pointer;
      &:checked { background: ${dot} 0 0 / 100% 100% no-repeat, ${radio} 0 0 / 100% 100% no-repeat; }
    }
    &.s-radio:has(.s-input[inert]) input:checked { background: ${dotOff} 0 0 / 100% 100% no-repeat, ${radio} 0 0 / 100% 100% no-repeat; }
    /* Segmented: toolbar check buttons, the selected one pressed into the dithered face */
    &.s-segmented {
      .s-input { gap: 0; }
      button { flex: 1; min-width: 0; height: var(--control-height); padding: 0 ${len(5)} 0 ${len(7)}; border: 0; border-radius: 0; background: var(--face); color: var(--text); box-shadow: ${raised}; outline: none;
        &.s-selected { background: ${dither}; box-shadow: ${pressed}; padding: var(--px) ${len(5)} 0 calc(${len(7)} + 2 * var(--px)); }
        &:active { box-shadow: ${pressed}; }
        &:focus-visible { outline: ${focus}; outline-offset: calc(-4 * var(--px)); } }
    }
  }

  /* ── Number: an up-down pair against the field ── */
  .s-number {
    .s-input { gap: 0; }
    input[type="number"] { flex: 1; }
    .s-step { gap: 0; width: ${len(16)}; height: var(--control-height);
      button { flex: 1; padding: 0; border: 0; border-radius: 0; background: var(--face) no-repeat center / ${len(5)} ${len(3)}; box-shadow: ${raised}; font-size: 0;
        &:active { box-shadow: ${ring([-1, 'shadow'], [1, 'shadow'])}; background-position: calc(50% + var(--px)) calc(50% + var(--px)); } }
      .s-step-up { background-image: ${spinUp}; }
      .s-step-down { background-image: ${spinDown}; } }
  }

  /* ── Trackbar: the box is the channel ±8px (thumb travel + thumb), ticks 1px under the 11×21 pointed thumb's tip ── */
  .s-slider {
    > .s-label-group:not([hidden]) + .s-input { margin-top: ${sp(7)}; }
    .s-input { align-items: flex-start; gap: ${len(6)}; }
    .s-track {
      position: relative; flex: 1; min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: start; column-gap: ${len(4)};
      &::before { content: ''; grid-area: 1 / 2; height: ${len(4)}; margin: ${len(9)} ${len(8)} 0; box-shadow: ${sunken}; pointer-events: none; }
      &::after { content: ''; grid-area: 1 / 2 / 3 / 3; align-self: stretch; visibility: hidden; outline: ${focus}; outline-offset: -1px; pointer-events: none; }
      &:has(input:focus-visible)::after { visibility: visible; }
    }
    input[type="range"] {
      grid-area: 1 / 2; min-width: 0; width: auto; height: ${len(21)}; margin: ${len(2)} ${len(8)} 0; padding: 0;
      -webkit-appearance: none; appearance: none; background: none; outline: none; cursor: default;
      &::-webkit-slider-runnable-track { height: ${len(21)}; background: none; }
      &::-webkit-slider-thumb { -webkit-appearance: none; width: ${len(11)}; height: ${len(21)}; border: 0; background: ${thumb} 0 0 / 100% 100%; }
      &::-moz-range-track { height: ${len(21)}; background: none; }
      &::-moz-range-thumb { width: ${len(11)}; height: ${len(21)}; border: 0; border-radius: 0; background: ${thumb} 0 0 / 100% 100%; }
    }
    .s-marks { grid-area: 2 / 2; position: relative; height: ${len(4)}; margin: ${len(1)} ${len(14)} ${len(1)} ${len(13)}; pointer-events: none; }
    .s-mark { position: absolute; top: 0; width: var(--px); height: ${len(3)}; background: var(--text); &:is(.s-first, .s-last) { height: ${len(4)}; } }
    /* without end captions the trackbar lines up with the fields above and below it: no inset, the ticks under the thumb's centre */
    .s-track:not(:has(.s-mark-label.s-first:not(:empty))) {
      &::before, input[type="range"] { margin-inline: 0; }
      .s-marks { margin-inline: ${len(5)} ${len(6)}; }
    }
    /* end captions beside the channel; any inner caption puts them all under their ticks */
    .s-mark-labels { display: contents; }
    .s-mark-label { display: none; grid-row: 1; margin-top: ${len(1)}; line-height: ${len(13)}; white-space: nowrap;
      &.s-first { display: block; grid-column: 1; }
      &.s-last { display: block; grid-column: 3; } }
    .s-track:has(.s-mark-label:not(:empty):not(.s-first):not(.s-last)) {
      .s-mark-labels { display: block; grid-area: 3 / 2; position: relative; height: ${len(13)}; margin: 0 ${len(14)} 0 ${len(13)}; }
      .s-mark-label { display: block; position: absolute; top: 0; margin: 0; translate: -50% 0; }
    }
    .s-readout { flex: none; width: calc(6ch + 2 * var(--inset)); text-align: left; }
    span.s-readout { width: auto; min-width: 3ch; margin-top: ${len(4)}; }
    .s-tooltip { grid-area: 1 / 2; justify-self: start; position: relative; margin-left: ${len(13)}; translate: -50% calc(-100% - ${len(2)}); pointer-events: none; }
    /* a range is the trackbar's selection channel (TBS_ENABLESELRANGE): the same thumbs, box and channel ends,
       the channel opened to 8px from the same top so the selection shows in it */
    &.s-multiple .s-interval-track {
      flex: 1; position: relative; height: ${len(23)};
      &::before { content: ''; position: absolute; left: 0; right: 0; top: ${len(9)}; height: ${len(8)}; background: var(--win); box-shadow: ${sunken}; }
      &::after { content: ''; position: absolute; left: ${len(5)}; right: ${len(6)}; top: ${len(11)}; height: ${len(4)}; background: linear-gradient(to right, transparent var(--low), var(--sel) var(--low) var(--high), transparent var(--high)); }
      input[type="range"] { grid-area: auto; top: ${len(2)}; width: 100%; height: ${len(21)}; margin: 0; }
      input[type="range"]:focus-visible { outline: ${focus}; outline-offset: ${len(2)}; }
    }
  }

  /* ── Color: a colour button (swatch framed in the dark shadow), the hex in a field ── */
  .s-color {
    .s-color-input { gap: ${sp(6)}; }
    input[type="color"] { position: static; flex: none; width: ${len(34)}; height: var(--control-height); padding: 0; border: 0; border-radius: 0; background: var(--face); box-shadow: ${raised}; cursor: pointer; outline: none;
      &::-webkit-color-swatch-wrapper { padding: ${len(5)} ${len(6)}; }
      &::-webkit-color-swatch { border: var(--px) solid var(--dk); border-radius: 0; }
      &::-moz-color-swatch { border: var(--px) solid var(--dk); border-radius: 0; }
      &:active { box-shadow: ${pressed}; }
      &:focus-visible { outline: ${focus}; outline-offset: calc(-3 * var(--px)); } }
    .s-color-input input[type="text"] { flex: 1; min-width: 0; }
    /* the alpha slider is the trackbar's selection channel too, the checkerboard and ramp in it, under the same thumb */
    &.s-rgba .s-alpha {
      height: ${len(8)}; margin: ${len(9)} 0 ${len(6)}; border-radius: 0; box-shadow: ${sunken}; outline: none;
      background: linear-gradient(to right, transparent, var(--c)), repeating-conic-gradient(var(--shadow) 0 25%, var(--hi) 0 50%) 0 0 / ${len(4)} ${len(4)};
      &::-webkit-slider-runnable-track { height: ${len(8)}; background: none; }
      &::-webkit-slider-thumb { -webkit-appearance: none; width: ${len(11)}; height: ${len(21)}; margin-top: ${len(-7)}; border: 0; border-radius: 0; background: ${thumb} 0 0 / 100% 100%; }
      &::-moz-range-thumb { width: ${len(11)}; height: ${len(21)}; border: 0; border-radius: 0; background: ${thumb} 0 0 / 100% 100%; }
      &:focus-visible { outline: ${focus}; outline-offset: ${len(2)}; }
    }
    &.s-swatches { .s-input { gap: ${len(4)}; }
      button { width: ${len(18)}; height: ${len(18)}; padding: 0; border: 0; border-radius: 0; box-shadow: ${sunken}; outline: none;
        &.s-selected { outline: var(--px) solid var(--dk); outline-offset: var(--px); }
        &:focus-visible { outline: ${focus}; outline-offset: calc(2 * var(--px)); } } }
  }

  /* ── Vector: one field per axis, the axis named before it ── */
  .s-vector {
    .s-input { gap: ${sp(6)}; }
    .s-vec-axis { gap: ${len(3)}; }
    .s-vec-label { font-size: inherit; opacity: 1; color: var(--text); }
    input[type="number"] { text-align: left; }
    .s-vec-expand { opacity: 1; background: var(--text); &:focus-visible { outline: ${focus}; outline-offset: var(--px); } }
  }

  /* ── XY pad: a sunken window, the point a raised block ── */
  .s-pad { border: 0; border-radius: 0; background: var(--win); box-shadow: ${sunken};
    &:focus-visible:not(:active) { outline: ${focus}; outline-offset: calc(2 * var(--px)); }
    .s-pad-x, .s-pad-y { background: var(--shadow); }
    .s-pad-dot { width: ${len(11)}; height: ${len(11)}; border-radius: 0; background: var(--face); box-shadow: ${raised}; } }
  .s-pad-val { font-size: inherit; opacity: 1; }

  /* ── Knob: a raised disc (its bevel does not turn), a dark index ── */
  .s-knob-wrap { position: relative; gap: ${len(6)};
    &::before { content: ''; position: absolute; left: 0; top: 50%; width: ${len(32)}; height: ${len(32)}; translate: 0 -50%; border-radius: 50%; border: calc(2 * var(--px)) solid; border-color: var(--hi) var(--dk) var(--dk) var(--hi); background: var(--face); box-sizing: border-box; }
    &:focus-visible:not(:active) .s-knob-dial { outline: none; }
    &:focus-visible:not(:active) { outline: ${focus}; outline-offset: calc(2 * var(--px)); } }
  .s-knob-dial { width: ${len(32)}; height: ${len(32)}; background: none; border: 0;
    i { top: 12%; width: calc(2 * var(--px)); height: 32%; --pivot: 118.75%; border-radius: 0; background: var(--text); } }
  .s-knob-val { font-size: inherit; opacity: 1; }

  /* ── Info: caption and value on one line ── */
  .s-info { flex-direction: row; align-items: baseline; gap: var(--column-gap);
    .s-monitor { opacity: 1; color: var(--text); } }

  /* ── Separator: an etched line; a labeled one leads with its caption ── */
  .s-separator { height: calc(2 * var(--px)); margin: 0; background: none; opacity: 1; box-shadow: ${rule}; }
  .s-separator-labeled { flex-direction: row; height: auto; box-shadow: none; gap: ${len(4)};
    &::before { display: none; }
    &::after { height: calc(2 * var(--px)); background: none; opacity: 1; box-shadow: ${rule}; } }
  .s-separator-label { font-size: inherit; opacity: 1; color: var(--text); }

  /* ── Folder: an etched group box, the caption cut into its top edge 7px in ── */
  .s-folder {
    margin-top: ${len(5)};
    box-shadow: ${etched};
    > summary { display: flex; align-items: center; gap: ${len(3)}; width: fit-content; max-width: calc(100% - ${len(14)}); margin: ${len(-5)} 0 0 ${len(7)}; padding: 0 ${len(3)} 0 ${len(2)}; background: var(--face); color: var(--text); line-height: ${len(13)}; user-select: none;
      &::before { content: ''; flex: none; width: ${len(9)}; height: ${len(9)}; background: ${minus} 0 0 / 100% 100%; }
      &:focus-visible { outline: ${focus}; outline-offset: 0; } }
    &:not([open]) { box-shadow: inset 0 var(--px) var(--shadow), inset 0 calc(2 * var(--px)) var(--hi);
      > summary::before { background-image: ${plus}; } }
    > .s-content { gap: var(--row-gap); padding: calc(${sp(23)} - ${len(8)}) var(--panel-padding) ${sp(21)}; }
    &.s-section > summary { pointer-events: none; &::before { display: none; } }
  }
}`

  return baseCSS + '\n' + overrides
}

// The pixel face (woff2 from 98.css, fonts/converted): CC BY-SA 3.0, FontStruction by "lou", see the header.
const REGULAR = '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'
const BOLD = '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'
