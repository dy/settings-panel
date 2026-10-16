/**
 * bitmap – the 1-bit Macintosh: System 6 / 7 as Susan Kare and the original Apple team drew it.
 *
 * Two inks and nothing between: paper (`shade`) and the ink derived from it (black on light
 * paper, white on dark, or `accent` given as the ink). Greys exist only as dither patterns;
 * there are no shadows but the window's 1px drop; selection and press invert. Every glyph is
 * the original's own pixels: radio buttons, check boxes, push-button corners and the default
 * ring, the close box, the pop-up arrow and the little arrows are pixel maps measured from
 * System 7.0 running in Infinite Mac (https://infinitemac.org/, Mihai Parparita), drawn as
 * crisp SVG; the title bar's six stripes and the dotted rules are 1px patterns.
 *
 * Reference: the Easy Access control panel, System 7.0 on a Mac Plus (test/calibration/macintosh-*.png).
 * The panel is a document window: a 1px frame and drop shadow, a striped title bar with the
 * close box (the fold toggle, collapsing the window to its title bar as WindowShade did).
 * Section headings and push buttons are in Chicago 12, everything else in Geneva 9, both as
 * pixel clones by Giles Booth: ChiKareGo2 and FindersKeepers (CC BY, BitFontMaker2 gallery
 * ids 3780 and 3809), embedded as WOFF2 converted from the author's TTF. A clone's word space
 * is wider than the original's (5px against Chicago's 4 and Geneva's 3); word-spacing gives it back.
 *
 * Structure from the reference: labels right-aligned in a fixed column, hanging from the row
 * top at Geneva's ascent like static text; check boxes carry their title to the right; radio
 * buttons run in a row; a section's first unlabeled control rides on the heading line
 * ("Mouse Keys:  ( ) On  (•) Off"). The slider is the Toolbox scroll bar: a 25% grey track
 * and a white scroll box. Disabled controls are greyed as QuickDraw greys them: every other
 * pixel removed.
 *
 * Axes: shade (paper; a dark shade inverts), accent (the ink), size (scales like every theme's;
 * glyphs are crisp at whole multiples of the original's pixels, size 9 / 13, 18 / 13, and at half steps on
 * 2x screens; size 1 sets Geneva 9 at 13px, between them), spacing (gaps, rounded to
 * the pixel grid), font (body face; headings stay Chicago), weight (600+ is QuickDraw bold:
 * the glyph smeared 1px right).
 *
 * bitmap(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveRoles, resolveAccent, ink as inkOn } from './color.js'

// Pixel maps, measured from the original. '#' ink, 'o' paper, '.' clear.
const RADIO = [
  '....####....',
  '..##oooo##..',
  '.#oooooooo#.',
  '.#oooooooo#.',
  '#oooooooooo#',
  '#oooooooooo#',
  '#oooooooooo#',
  '#oooooooooo#',
  '.#oooooooo#.',
  '.#oooooooo#.',
  '..##oooo##..',
  '....####....',
]
const DOT = ['', '', '', '....####', '...######', '...######', '...######', '...######', '....####']
const CHECK = ['############', ...Array(10).fill('#oooooooooo#'), '############']
const CROSS = ['', '##........##', '#.#......#.#', '#..#....#..#', '#...#..#...#', '#....##....#', '#....##....#', '#...#..#...#', '#..#....#..#', '#.#......#.#', '##........##']
// Tracking: the frame doubles while the mouse is down (System 7 CDEF 1).
const RADIO_DOWN = ['', '....####', '..##....##', '..#......#', '.#........#', '.#........#', '.#........#', '.#........#', '..#......#', '..##....##', '....####']
const CHECK_DOWN = ['', '.##########', ...Array(8).fill('.#........#'), '.##########']
// Push button: a 4px corner (Memory's "Use Defaults"); slice 4.
const BUTTON = ['...###...', '.##ooo##.', '.#ooooo#.', '#ooooooo#', '#ooooooo#', '#ooooooo#', '.#ooooo#.', '.##ooo##.', '...###...']
const BUTTON_DOWN = BUTTON.map(r => r.replaceAll('o', '#'))
// Default button ring: 3px, 4px out from the button (the alert's OK); slice 8.
const RING = (() => {
  const q = ['.....###', '...#####', '..######', '.#####..', '.###....', '####....', '###.....', '###.....']
  const row = r => r + r[7] + [...r].reverse().join('')
  const top = q.map(row), mid = row('###.....')
  return [...top, mid, ...top.slice().reverse()]
})()
// Little arrows (Memory's cache size), 15×25; the up arrow, drawn flipped for down.
const ARROWS = ['..###########..', '.#ooooooooooo#.', ...Array(21).fill('#ooooooooooooo#'), '.#ooooooooooo#.', '..###########..']
const UP = ['....#....', '...#o#...', '..#ooo#..', '.#ooooo#.', '###ooo###', '..#ooo#..', '..#ooo#..', '..#####..']
const UP_DOWN = UP.map(r => r.replaceAll('o', '#'))
const flip = m => m.slice().reverse()
const POPUP = ['###########', '.#########.', '..#######..', '...#####...', '....###....', '.....#.....']
const CLOSE = ['ooooooooooooo', 'o###########o', ...Array(9).fill('o#ooooooooo#o'), 'o###########o', 'ooooooooooooo']
const CLOSE_DOWN = CLOSE.map(r => r.replace(/#o+#/, m => '#'.repeat(m.length)))
const LOUPE = ['.###.....', '#...#....', '#...#....', '#...#....', '.###.....', '....##...', '.....##..', '......##.', '.......#.']
const CLEAR = ['#.....#', '.#...#.', '..#.#..', '...#...', '..#.#..', '.#...#.', '#.....#']
const EXPAND = ['##.....##', '##.....##', '', '', '....#', '', '', '##.....##', '##.....##']
const TRI_RIGHT = ['#...', '##..', '###.', '####', '###.', '##..', '#...']
const TRI_DOWN = ['#######', '.#####.', '..###..', '...#...']
// Patterns: the title bar's stripes, 50% and 25% grey, the dotted rule.
const STRIPES = ['#', '.']
const GRAY = ['#.', '.#']
const LTGRAY = ['#...', '..#.']
const DOTS = ['#.']

export default function bitmap({
  shade = '#ffffff',
  accent,
  size = 1,
  spacing = 1,
  font,
  weight = 400,
} = {}) {
  const { dark } = resolveRoles(shade)
  const paper = shade
  const tone = accent != null ? resolveAccent(accent, shade) : null
  const ink = tone ? inkOn(shade, 4.5, tone) : dark ? '#ffffff' : '#000000'

  // A pixel map as an SVG image: crisp at any scale, colored at theme time.
  const bits = (...maps) => {
    const w = Math.max(...maps.flat().map(r => r.length)), h = Math.max(...maps.map(m => m.length))
    const runs = (map, ch) => map.flatMap((r, y) => [...r.matchAll(new RegExp(`\\${ch}+`, 'g'))].map(m => `M${m.index} ${y}h${m[0].length}v1h-${m[0].length}z`)).join('')
    const paths = maps.map(m => `<path fill='${paper}' d='${runs(m, 'o')}'/><path fill='${ink}' d='${runs(m, '#')}'/>`).join('')
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>${paths}</svg>`)}")`
  }

  // Body: labels and field values are Geneva 9 (Chicago 12 is for headings, buttons and pop-ups); a
  // replacement font is set at 12px. Geneva's CSS size is its design size: size-adjust draws its em.
  const body = font ? 12 : 9
  const px = n => `calc(${n} * var(--length))`
  const sp = n => `round(nearest, calc(${n} * var(--space)), var(--length))`
  const geneva = font ? 'normal' : `${-2 / 9}em`
  const bold = weight >= 600 ? 'var(--length) 0 0 currentColor' : 'none'

  const overrides = `
@font-face { font-family: ChiKareGo2; src: url(data:font/woff2;base64,${CHICAGO}) format('woff2'); size-adjust: 133.3334%; ascent-override: 75%; descent-override: 25%; line-gap-override: 0%; }
@font-face { font-family: FindersKeepers; src: url(data:font/woff2;base64,${GENEVA}) format('woff2'); size-adjust: 177.7778%; ascent-override: 75%; descent-override: 25%; line-gap-override: 0%; }
.s-panel {
  ${metrics({ size, spacing, font }, { unit: 4, body, fontSize: body, fontFamily: "FindersKeepers, Geneva, 'Helvetica Neue', sans-serif", lineHeight: 12, controlHeight: 16, inset: 3, rowGap: 12, columnGap: 10, sectionGap: 12, panelPadding: 12 })}

  --paper: ${paper};
  --ink: ${ink};
  --bg: var(--paper);
  --accent: var(--ink);
  --chicago: ChiKareGo2, Chicago, Charcoal, system-ui, sans-serif;
  --chicago-ws: ${-1 / 12}em;
  --label-w: ${px(95)};
  --label-max: 42%;
  --indent: ${px(13)};
  --ring: ${px(2)} solid var(--ink);
  --stripes: ${bits(STRIPES)} 0 0 / ${px(1)} ${px(2)};
  --gray: ${bits(GRAY)} 0 0 / ${px(2)} ${px(2)};
  --ltgray: ${bits(LTGRAY)} 0 0 / ${px(4)} ${px(2)};
  --dots: ${bits(DOTS)} 0 0 / ${px(2)} ${px(1)};
  --button: ${bits(BUTTON)} 4 fill / ${px(4)} stretch;
  --button-down: ${bits(BUTTON_DOWN)} 4 fill / ${px(4)} stretch;
  color-scheme: ${dark ? 'dark' : 'light'};
  accent-color: var(--ink);
  caret-color: var(--ink);

  background: var(--paper);
  color: var(--ink);
  border: var(--length) solid var(--ink);
  box-shadow: var(--length) var(--length) 0 var(--ink);
  min-width: 0;
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
  font-weight: 400;
  font-synthesis: none;
  word-spacing: ${geneva};
  text-shadow: ${bold};
  letter-spacing: ${weight >= 600 ? 'var(--length)' : 'normal'};
  -webkit-font-smoothing: none;
  image-rendering: pixelated;

  ::selection { background: var(--ink); color: var(--paper); }

  /* ── Title bar: six stripes, the title cut into them, the close box at left ── */
  > summary, > .s-panel-title {
    position: relative;
    align-items: flex-start;
    gap: 0;
    height: ${px(18)};
    padding: ${px(3)} ${px(1)} 0;
    border-bottom: var(--length) solid var(--ink);
    font-family: var(--chicago);
    font-size: ${px(12)};
    line-height: ${px(12)};
    word-spacing: var(--chicago-ws);
    white-space: nowrap;
    &::before, &::after { content: ''; flex: 1; min-width: 0; height: ${px(11)}; background: var(--stripes); }
    /* the title's white cut: 7px before the text, 5px after it (System 7 WDEF) */
    &::before { margin-right: ${px(7)}; }
    &::after { margin-left: ${px(5)}; }
  }
  > summary { user-select: none; }
  > summary:focus-visible { outline: none; .s-fold-icon { background-image: ${bits(CLOSE_DOWN)}; } }
  &:not([open]) > summary { height: ${px(17)}; border-bottom: 0; }
  .s-fold-icon {
    position: absolute; left: ${px(7)}; top: ${px(2)};
    width: ${px(13)}; height: ${px(13)};
    background: ${bits(CLOSE)} 0 0 / 100% 100%;
  }

  .s-panel-content { gap: var(--row-gap); padding: ${sp(9)} var(--panel-padding) ${sp(8)}; }

  /* ── Rows: labels right-aligned in a fixed column, hanging from the row top ── */
  .s-control { align-items: flex-start; gap: var(--column-gap); min-height: ${px(12)}; }
  .s-label-group {
    flex: none; width: round(down, min(var(--label-w), var(--label-max)), var(--length)); min-width: 0; max-width: none;
    gap: 0; line-height: var(--line-height); text-align: right;
    margin-top: var(--label-y, ${px(-2)});
  }
  .s-label-row { justify-content: flex-end; gap: ${px(3)}; }
  .s-hint { font-size: inherit; opacity: 1; }
  .s-input { align-items: flex-start; gap: ${px(4)}; }
  .s-input[inert] { opacity: 1; }
  .s-control:has(> .s-input[inert]) { mask: var(--gray); -webkit-mask: var(--gray); }

  /* ── Balloon help (title) ── */
  .s-title {
    display: inline-grid; place-items: center; flex: none;
    width: ${px(11)}; height: ${px(11)};
    border: var(--length) solid var(--ink);
    line-height: 1;
  }
  .s-title-text {
    margin-top: ${px(2)}; padding: ${px(3)} ${px(5)};
    background: var(--paper); color: var(--ink); text-align: left;
    border: var(--length) solid var(--ink);
    box-shadow: var(--length) var(--length) 0 var(--ink);
  }

  /* ── Sections: Chicago headings, contents indented; a collapsible folder adds the triangle ── */
  .s-folder {
    > summary {
      gap: ${px(4)}; min-height: ${px(12)};
      font-family: var(--chicago); font-size: ${px(12)}; line-height: ${px(12)}; word-spacing: var(--chicago-ws);
      &::before { content: ''; flex: none; width: ${px(7)}; height: ${px(7)}; background: ${bits(TRI_RIGHT)} center / ${px(4)} ${px(7)} no-repeat; }
      &:focus-visible { outline: var(--ring); outline-offset: ${px(1)}; }
    }
    &[open] > summary::before { background: ${bits(TRI_DOWN)} center / ${px(7)} ${px(4)} no-repeat; }
    &.s-section > summary { pointer-events: none; &::before { display: none; } }
    > .s-content { gap: var(--row-gap); padding: var(--row-gap) 0 0 var(--indent); }
    .s-label-group { width: round(down, min(var(--label-w), var(--label-max)) - var(--indent), var(--length)); }
    .s-folder .s-label-group { width: round(down, min(var(--label-w), var(--label-max)) - 2 * var(--indent), var(--length)); }
    /* a section's unlabeled first control is its master switch: it rides on the heading line */
    > .s-content > .s-control:first-child:has(> .s-label-group[hidden]) {
      position: relative; z-index: 1;
      margin-top: calc(-1 * (${px(12)} + var(--row-gap)));
      margin-left: calc(round(down, min(var(--label-w), var(--label-max)) - var(--indent), var(--length)) + var(--column-gap));
    }
  }

  /* ── Separator: a dotted rule, 6px under the group it closes, 10px over the next, 5px and 7px from the frame ── */
  .s-separator {
    height: var(--length); min-height: 0; background: var(--dots); opacity: 1;
    margin: calc(${px(6)} - var(--row-gap)) calc(${px(7)} - var(--panel-padding)) calc(${px(10)} - var(--row-gap)) calc(${px(5)} - var(--panel-padding));
  }
  .s-folder .s-separator { margin-inline: 0; }
  .s-separator-labeled {
    height: auto; background: none; gap: ${px(4)};
    &::before { flex: 0 0 ${px(6)}; }
    &::before, &::after { height: var(--length); background: var(--dots); opacity: 1; }
  }
  .s-separator-label { font-size: inherit; opacity: 1; }

  /* ── Check box: the title to the right of the box ── */
  .s-boolean input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
  .s-boolean.s-checkbox {
    flex-direction: row-reverse; justify-content: flex-end; gap: ${px(4)};
    .s-label-group { width: auto; flex: 0 1 auto; text-align: left; margin-top: 0; }
    .s-label-row { justify-content: flex-start; }
    .s-input { flex: none; cursor: pointer; }
  }
  .s-boolean.s-checkbox .s-track, .s-select.s-checkboxes .s-track {
    display: block; flex: none; width: ${px(12)}; height: ${px(12)};
    background: ${bits(CHECK)} 0 0 / 100% 100%;
  }
  .s-boolean.s-checkbox:has(input:checked) .s-track,
  .s-select.s-checkboxes .s-input > label:has(input:checked) .s-track { background-image: ${bits(CHECK, CROSS)}; }
  .s-boolean.s-checkbox .s-input:active .s-track,
  .s-select.s-checkboxes .s-input > label:active .s-track { background-image: ${bits(CHECK, CHECK_DOWN)}; }
  .s-boolean.s-checkbox:has(input:checked) .s-input:active .s-track,
  .s-select.s-checkboxes .s-input > label:has(input:checked):active .s-track { background-image: ${bits(CHECK, CHECK_DOWN, CROSS)}; }
  .s-boolean.s-checkbox:has(input:focus-visible) .s-track,
  .s-select.s-checkboxes .s-input > label:has(input:focus-visible) .s-track { outline: var(--ring); outline-offset: ${px(1)}; }

  /* ── Switch: a rounded slot; on fills it with ink, the box slides right ── */
  .s-boolean.s-switch {
    .s-input { flex: none; cursor: pointer; }
    .s-track {
      position: relative; display: block; width: ${px(28)}; height: ${px(14)};
      border: ${px(4)} solid transparent; border-image: var(--button);
      &::after {
        content: ''; position: absolute; top: ${px(-2)}; left: ${px(-2)};
        width: ${px(10)}; height: ${px(10)};
        background: var(--paper); border: var(--length) solid var(--ink);
      }
    }
    &:has(input:checked) .s-track { border-image: var(--button-down); &::after { left: ${px(12)}; } }
    &:has(input:focus-visible) .s-track { outline: var(--ring); outline-offset: ${px(1)}; }
  }

  /* ── Push buttons: Chicago in a 4px-cornered frame; pressed inverts; Return's button wears the ring ── */
  .s-button, .s-boolean.s-toggle, .s-select.s-segmented { --label-y: ${px(4)}; }
  .s-button .s-input { gap: ${px(12)}; flex-wrap: wrap; }
  .s-button button, .s-boolean.s-toggle .s-track {
    position: relative; flex: 1; min-width: ${px(58)}; height: ${px(20)};
    padding: 0 ${px(6)}; margin: 0;
    border: ${px(4)} solid transparent; border-image: var(--button);
    background: none; color: var(--ink);
    font-family: var(--chicago); font-size: ${px(12)}; line-height: ${px(12)}; word-spacing: var(--chicago-ws);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    cursor: pointer;
  }
  .s-button button {
    &:active { border-image: var(--button-down); color: var(--paper); }
    &:focus-visible { outline: var(--ring); outline-offset: ${px(1)}; }
    &:disabled, &[aria-busy="true"] { cursor: default; mask: var(--gray); -webkit-mask: var(--gray); }
  }
  .s-button:has(.s-secondary) button:not(.s-secondary) {
    overflow: visible; margin: ${px(4)};
    &::before {
      content: ''; position: absolute; inset: ${px(-8)}; pointer-events: none;
      border: ${px(8)} solid transparent; border-image: ${bits(RING)} 8 / ${px(8)} stretch;
    }
  }
  .s-boolean.s-toggle {
    .s-input { flex: none; }
    .s-track { display: grid; place-items: center; flex: none; &::after { content: 'Off'; } }
    &:has(input:checked) .s-track { border-image: var(--button-down); color: var(--paper); &::after { content: 'On'; } }
    &:has(input:focus-visible) .s-track { outline: var(--ring); outline-offset: ${px(1)}; }
  }

  /* ── Radio buttons, and multi-choice check boxes: a row of titled items ── */
  .s-select.s-radio, .s-select.s-checkboxes {
    .s-input { flex-direction: row; flex-wrap: wrap; align-items: flex-start; gap: ${px(4)} ${px(3)}; }
    .s-input > label { display: inline-flex; align-items: flex-start; gap: ${px(4)}; line-height: ${px(12)}; cursor: pointer; }
    .s-input > label:has(> span:not(.s-track):not(:empty)) { margin-right: ${px(15)}; }
    .s-input > label > span:not(.s-track):empty { display: none; }
  }
  .s-select.s-radio input[type="radio"] {
    appearance: none; -webkit-appearance: none; flex: none; margin: 0;
    width: ${px(12)}; height: ${px(12)}; border: 0; border-radius: 0; cursor: pointer;
    background: ${bits(RADIO)} 0 0 / 100% 100%;
    &:checked { background-image: ${bits(RADIO, DOT)}; }
    &:active { background-image: ${bits(RADIO, RADIO_DOWN)}; }
    &:checked:active { background-image: ${bits(RADIO, RADIO_DOWN, DOT)}; }
    &:focus-visible { outline: var(--ring); outline-offset: ${px(1)}; }
  }

  /* ── Segmented: one framed strip; the chosen segment inverts ── */
  .s-select.s-segmented .s-input {
    position: relative; gap: 0; padding: var(--length); height: ${px(20)};
    &::before { content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none; border: ${px(4)} solid transparent; border-image: ${bits(BUTTON)} 4 / ${px(4)} stretch; }
    button {
      flex: 1; min-width: 0; height: 100%; padding: 0 ${px(4)}; margin: 0;
      background: none; border: 0; border-left: var(--length) solid var(--ink); border-radius: 0; color: var(--ink);
      font-family: var(--chicago); font-size: ${px(12)}; line-height: ${px(12)}; word-spacing: var(--chicago-ws);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      &:first-child { border-left: 0; }
      &.s-selected { background: var(--ink); color: var(--paper); }
      &:focus-visible { outline: var(--ring); outline-offset: ${px(-4)}; outline-color: currentColor; }
    }
  }

  /* ── Fields: a 1px box; the focused one doubles its frame, as the List Manager's did ── */
  input[type="text"], input[type="number"], input[type="search"], textarea {
    height: var(--control-height); padding: 0 ${px(3)}; margin: 0;
    background: var(--paper); color: var(--ink);
    border: var(--length) solid var(--ink); border-radius: 0;
    font: inherit; line-height: var(--line-height);
    &::placeholder { color: transparent; opacity: 1; background: var(--gray); -webkit-background-clip: text; background-clip: text; }
    &:focus { outline: none; }
    &:focus-visible { outline: var(--length) solid var(--ink); outline-offset: 0; }
  }
  .s-text, .s-color, .s-vector { --label-y: ${px(2)}; }
  .s-info { --label-y: 0px; }
  .s-text input[type="text"] { flex: 1; }
  textarea { flex: 1; height: auto; padding: ${px(2)} ${px(3)}; resize: vertical; field-sizing: content; min-height: calc(3 * var(--line-height) + ${px(6)}); max-height: 50vh; }
  .s-textarea { --label-y: ${px(3)}; }
  .s-textarea.s-code textarea { font-family: Monaco, ui-monospace, Menlo, monospace; font-size: ${px(9)}; word-spacing: normal; }

  /* ── Number: a field and the little arrows ── */
  .s-number {
    --label-y: ${px(6)};
    .s-input { gap: ${px(9)}; }
    input[type="number"] { flex: 1; margin-top: ${px(4)}; text-align: right; appearance: textfield; -moz-appearance: textfield; cursor: ew-resize;
      &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      &:focus { cursor: text; } }
    .s-step {
      flex: none; gap: 0; width: ${px(15)}; height: ${px(25)};
      background: ${bits(ARROWS)} 0 0 / 100% 100%;
      button {
        flex: none; height: ${px(12)}; padding: 0; border: 0; margin: 0; font-size: 0; cursor: pointer;
        background: ${bits(UP)} ${px(3)} ${px(3)} / ${px(9)} ${px(8)} no-repeat;
        &:active { background-image: ${bits(UP_DOWN)}; }
      }
      .s-step-down { height: ${px(13)}; background-image: ${bits(flip(UP))}; background-position: ${px(3)} ${px(2)}; &:active { background-image: ${bits(flip(UP_DOWN))}; } }
    }
  }

  /* ── Pop-up menu: Chicago in a box with the drop shadow and the down arrow ── */
  .s-select.s-dropdown {
    .s-input { position: relative; flex: 0 1 auto; margin-right: var(--length); }
    .s-input::after {
      content: ''; position: absolute; left: ${px(3)}; top: ${px(3)}; right: calc(-1 * var(--length)); bottom: calc(-1 * var(--length));
      border-right: var(--length) solid var(--ink); border-bottom: var(--length) solid var(--ink); pointer-events: none;
    }
    select {
      flex: 1; width: auto; min-width: ${px(60)}; max-width: 100%; height: ${px(18)};
      padding: 0 ${px(24)} 0 ${px(14)}; margin: 0;
      appearance: none; -webkit-appearance: none; border-radius: 0; cursor: pointer;
      border: var(--length) solid var(--ink);
      background: ${bits(POPUP)} right ${px(6)} center / ${px(11)} ${px(6)} no-repeat, var(--paper);
      color: var(--ink);
      font-family: var(--chicago); font-size: ${px(12)}; line-height: ${px(16)}; word-spacing: var(--chicago-ws);
      &:focus { outline: none; }
      &:focus-visible { outline: var(--ring); outline-offset: ${px(1)}; }
      option { background: var(--paper); color: var(--ink); }
    }
    --label-y: ${px(3)};
  }

  /* ── Slider: the scroll bar – a 25% grey track and a white scroll box ── */
  /* one scroll bar: the slider's, the interval's and the colour's alpha */
  .s-slider input[type="range"], .s-color.s-rgba .s-alpha {
    -webkit-appearance: none; appearance: none; height: ${px(12)}; margin: 0; padding: 0; border: 0; border-radius: 0;
    background: none; cursor: pointer;
    &::-webkit-slider-runnable-track { height: ${px(12)}; border: var(--length) solid var(--ink); background: var(--ltgray), var(--paper); }
    &::-webkit-slider-thumb { -webkit-appearance: none; width: ${px(12)}; height: ${px(12)}; margin-top: calc(-1 * var(--length)); background: var(--paper); border: var(--length) solid var(--ink); border-radius: 0; }
    &::-moz-range-track { height: ${px(10)}; border: var(--length) solid var(--ink); background: var(--ltgray), var(--paper); }
    &::-moz-range-thumb { width: ${px(10)}; height: ${px(10)}; background: var(--paper); border: var(--length) solid var(--ink); border-radius: 0; }
    &:active::-webkit-slider-thumb { background: var(--ink); }
    &:active::-moz-range-thumb { background: var(--ink); }
    &:focus { outline: none; }
    &:focus-visible { outline: var(--ring); outline-offset: ${px(1)}; }
  }
  .s-slider {
    --thumb: ${px(12)};
    .s-input { align-items: flex-start; gap: ${px(8)}; }
    .s-track { height: ${px(12)}; flex: 1; min-width: 0; }
    input[type="range"] { width: 100%; }
    .s-marks, .s-mark-labels { position: absolute; left: calc(var(--thumb) / 2); right: calc(var(--thumb) / 2); top: 100%; height: 0; pointer-events: none; }
    .s-mark { position: absolute; top: var(--length); width: var(--length); height: ${px(3)}; background: var(--ink); }
    .s-mark-label { position: absolute; top: ${px(4)}; transform: translateX(-50%); white-space: nowrap; line-height: var(--line-height); }
    &:has(.s-marks:not(:empty)) .s-track { margin-bottom: ${px(4)}; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: ${px(16)}; }
    &:has(.s-tooltip) { margin-top: ${px(16)}; }
    .s-readout {
      flex: none; width: auto; field-sizing: content; min-width: calc(5ch + ${px(8)}); max-width: 12ch; height: ${px(16)}; margin-top: ${px(-2)}; text-align: right; cursor: ew-resize;
      font-variant-numeric: tabular-nums;
    }
    span.s-readout { border: 0; height: auto; margin-top: 0; padding: 0 ${px(3)}; }
    /* a range's two readouts take 3 figures, so the row keeps its track in a narrow panel */
    &.s-multiple .s-readout { min-width: calc(3ch + ${px(8)}); }
    .s-tooltip {
      margin-bottom: ${px(3)}; padding: 0 ${px(3)}; z-index: 2;
      background: var(--paper); color: var(--ink);
      border: var(--length) solid var(--ink); box-shadow: var(--length) var(--length) 0 var(--ink);
    }
    &.s-multiple .s-interval-track {
      height: ${px(12)}; min-width: ${px(40)}; padding: 0 calc(var(--thumb) / 2);
      border: var(--length) solid var(--ink);
      background: linear-gradient(to right, transparent var(--low, 0%), var(--ink) var(--low, 0%) var(--high, 100%), transparent var(--high, 100%)) content-box no-repeat, var(--ltgray), var(--paper);
      input[type="range"] { left: calc(-1 * var(--length)); top: calc(-1 * var(--length)); width: calc(100% + 2 * var(--length)); height: ${px(12)}; }
      input[type="range"]::-webkit-slider-runnable-track { border-color: transparent; background: none; }
      input[type="range"]::-moz-range-track { border-color: transparent; background: none; }
    }
  }

  /* ── Color: a framed well, swatches framed, the chosen one ringed ── */
  .s-color {
    input[type="color"] {
      position: static; flex: none; width: ${px(16)}; height: ${px(16)}; padding: var(--length);
      background: var(--paper); border: var(--length) solid var(--ink); border-radius: 0; cursor: pointer;
      &::-webkit-color-swatch-wrapper { padding: 0; }
      &::-webkit-color-swatch { border: 0; border-radius: 0; }
      &::-moz-color-swatch { border: 0; border-radius: 0; }
      &:focus-visible { outline: var(--ring); outline-offset: ${px(1)}; }
    }
    &.s-picker .s-color-input, &.s-rgba .s-color-input { gap: ${px(6)}; align-items: flex-start; }
    .s-color-input input[type="text"] { flex: 1; min-width: 0; }
    /* the alpha is the scroll bar, the checkerboard and ramp in place of its 25% grey; its code keeps its nine figures */
    &.s-rgba .s-alpha { flex: 1; margin-top: ${px(2)};
      &::-webkit-slider-runnable-track { background: linear-gradient(to right, transparent, var(--c)), conic-gradient(#c4c4c4 90deg, #fff 0 180deg, #c4c4c4 0 270deg, #fff 0) 0 0 / ${px(4)} ${px(4)}; }
      &::-moz-range-track { background: linear-gradient(to right, transparent, var(--c)), conic-gradient(#c4c4c4 90deg, #fff 0 180deg, #c4c4c4 0 270deg, #fff 0) 0 0 / ${px(4)} ${px(4)}; }
    }
    &.s-rgba .s-color-input { flex-wrap: wrap; row-gap: ${px(4)}; }
    &.s-rgba input[type="text"] { flex: none; width: calc(9ch + ${px(8)}); @supports (field-sizing: content) { field-sizing: content; width: auto; } }
    &.s-swatches .s-input { gap: ${px(5)}; }
    &.s-swatches button {
      width: ${px(12)}; height: ${px(12)}; padding: 0; border: var(--length) solid var(--ink); border-radius: 0;
      &.s-selected { outline: var(--ring); outline-offset: ${px(1)}; }
      &:focus-visible { outline: var(--length) dotted var(--ink); outline-offset: ${px(3)}; }
    }
  }

  /* ── Vector, info ── */
  .s-vector {
    .s-input { gap: ${px(6)}; }
    .s-vec-axis { gap: ${px(3)}; }
    .s-vec-label { font-size: inherit; opacity: 1; }
    .s-vec-expand { --s-expand-icon: ${bits(EXPAND)}; background: var(--ink); opacity: 1; width: ${px(9)}; height: ${px(9)}; margin-top: ${px(3)}; -webkit-mask-size: 100% 100%; mask-size: 100% 100%; }
    .s-vec-expand.s-open { outline: var(--length) solid var(--ink); outline-offset: var(--length); }
    .s-vec-expand:focus-visible { outline: var(--ring); outline-offset: ${px(1)}; }
  }
  .s-info .s-monitor { opacity: 1; }

  /* ── XY pad and knob: a framed field with a dotted cross; the knob is a crisp circle ── */
  .s-xy { --label-y: 0px; }
  .s-knob { --label-y: ${px(10)}; }
  .s-pad {
    background: var(--paper); border: var(--length) solid var(--ink); border-radius: 0;
    .s-pad-x, .s-pad-y { background: var(--gray); }
    .s-pad-x { height: var(--length); }
    .s-pad-y { width: var(--length); }
    .s-pad-dot { width: ${px(7)}; height: ${px(7)}; border-radius: 0; background: var(--ink); box-shadow: 0 0 0 var(--length) var(--paper); }
    &:focus-visible:not(:active) { outline: var(--ring); outline-offset: ${px(1)}; }
  }
  .s-pad-val { opacity: 1; font-size: inherit; }
  .s-knob-wrap {
    background: url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' shape-rendering='crispEdges'><circle cx='16' cy='16' r='15.5' fill='${paper}' stroke='${ink}'/></svg>`)}") 0 50% / ${px(32)} ${px(32)} no-repeat;
    &:focus-visible:not(:active) .s-knob-dial { outline: var(--ring); outline-offset: ${px(1)}; border-radius: 50%; }
  }
  .s-knob-dial {
    width: ${px(32)}; height: ${px(32)}; background: none; border: 0;
    i { top: ${px(3)}; width: ${px(2)}; height: ${px(11)}; border-radius: 0; background: var(--ink); }
  }
  .s-knob-val { opacity: 1; font-size: inherit; }

  /* ── Filter: a box at the title bar's right end, where the zoom box sits ── */
  --s-search-icon: ${bits(LOUPE)};
  .s-search {
    position: absolute; right: ${px(7)}; top: ${px(2)}; gap: ${px(2)};
    padding: 0 var(--length); background: var(--paper);
    font-family: var(--font-family); font-size: var(--font-size); word-spacing: ${geneva};
  }
  .s-search-btn {
    width: ${px(11)}; height: ${px(13)}; background: var(--ink);
    -webkit-mask-size: ${px(9)} ${px(9)}; mask-size: ${px(9)} ${px(9)};
    &:focus-visible { outline: var(--ring); outline-offset: 0; }
  }
  .s-search-input {
    height: ${px(13)}; width: ${px(90)}; padding: 0 ${px(2)}; line-height: ${px(11)};
    &::-webkit-search-cancel-button { -webkit-appearance: none; width: ${px(7)}; height: ${px(7)}; background: ${bits(CLEAR)} 0 0 / 100% 100%; cursor: pointer; }
  }
  &.s-searching .s-search-btn { background: var(--ink); }
}`

  return baseCSS + '\n' + overrides
}

// ChiKareGo2 (Chicago 12) and FindersKeepers (Geneva 9) by Giles Booth, CC BY
// (https://www.pentacom.jp/pentacom/bitfontmaker2/gallery/?id=3780, ?id=3809), converted to WOFF2 unchanged.
const CHICAGO = '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'
const GENEVA = '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'
