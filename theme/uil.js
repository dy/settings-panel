/**
 * uil — calibrated to lo-th/uil
 *
 * Custom shades derive missing color roles; explicit role axes take precedence.
 *
 * Signatures: a tightly-framed monospace panel (#37383d) where each control can
 * carry its own accent color, pill-toggle booleans, thin recessed slider tracks
 * with a light fill, and a #308AFF blue for active/selected states.
 * Ref: https://lo-th.github.io/uil/ (uil 4.4.2; geometry read from its Proto/Slide/
 * Knob/Pad2D sources and measured off the native render at demo/_ref/uil-ref.html)
 *
 * Axes: shade (panel bg), accent (active/selected blue), fill (slider/thumb
 * tint), text (primary foreground), face (control surface grey), border
 * (hairline grey). Everything else — row darken, hover lift, tooltip/overlay
 * tones — derives from those six in the var block below.
 *
 * uil(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveAccent, resolveRoles, parseColor, toHex, ink, mix } from './color.js'

export default function uil({
  shade = '#37383d',
  accent = '#308AFF',
  fill,
  text,
  face,
  border,
  size = 1,
  spacing = 1,
  font,
} = {}) {
  const native = shade === '#37383d'
  const roles = resolveRoles(shade)
  fill ??= native ? '#dddddd' : roles.fg
  text ??= native ? '#dddddd' : roles.fg
  face ??= native ? '#3c3c3c' : roles.surface2
  border ??= native ? '#4c4c4c' : roles.border

  const acc = resolveAccent(accent, shade)
  const enc = c => encodeURIComponent(c)   // any CSS color, safe inside an SVG data-URI
  const onAccent = native ? '#fff' : resolveRoles(shade, accent).onAccent
  // Text at 4.5:1 where uil's own falls short (WCAG 1.4.3), each tone lifted only as far as it must:
  // the hint uil never drew (#999 at 60% on the row, 2.8:1) and the selected fill under its white
  // lettering (#308aff, 3.4:1)
  const ch = c => [1, 3, 5].map(i => parseInt(toHex(parseColor(c)).slice(i, i + 2), 16))
  const row = '#' + ch(shade).map(v => Math.min(255, Math.max(0, v + (roles.dark ? -15 : 15))).toString(16).padStart(2, '0')).join('')
  const hint = native ? '#999' : roles.fgMuted
  const hintInk = ink(row, 4.5, mix(row, hint, .6))
  const action = ink(onAccent, 4.5, acc)
  // and the placeholder (#888, 3.9:1 in a hovered row) on its well, 20% black over the row at rest,
  // over the lifted row (--bg) on hover, 30% when focused (an rgba() alpha composites as its 8-bit value)
  const placeholder = [[row, .2], [shade, .2], [row, .3]].reduce((t, [under, a]) => ink(mix(under, '#000', Math.round(a * 255) / 255), 4.5, t), native ? '#888' : roles.fgMuted)
  // the search field has no well: the title row itself
  const searchPlaceholder = ink(row, 4.5, placeholder)
  // uil's ColorLuma(hex, l): every channel scaled by (1 + l), clamped
  const luma = (c, l) => `rgb(from ${c} calc(r * ${1 + l}) calc(g * ${1 + l}) calc(b * ${1 + l}))`
  const svg = (box, body) => `url("data:image/svg+xml,${enc(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${box} ${box}'>${body}</svg>`)}")`
  // uil Knob.makeGrad (step <= 5): 33 ticks every 0.05π over ±0.8π, r 44 → 40 of a 128 box
  const ticks = Array.from({ length: 33 }, (_, i) => {
    const a = 1.8 * Math.PI - .05 * Math.PI * i, s = Math.sin(a), c = Math.cos(a), f = n => +n.toFixed(2)
    return `M${f(64 + s * 44)} ${f(64 + c * 44)}L${f(64 + s * 40)} ${f(64 + c * 40)}`
  }).join('')
  // uil Knob needle: 4-unit round stroke r20 → r25, pointing up in a 24px (76.8-unit) dial box
  const needle = svg(76.8, "<path d='M38.4 13.4L38.4 18.4' stroke='#000' stroke-width='4' stroke-linecap='round'/>")

  // Body 11px: uil sets its labels and values at 11px.
  const body = 11
  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body, fontSize: 11, fontFamily: "'Roboto Mono', 'Source Code Pro', Menlo, Courier, monospace", lineHeight: 15.4, controlHeight: 22, inset: 6, rowGap: 0, columnGap: 0, sectionGap: 4, panelPadding: 0})}

  --bg: ${shade};
  --accent: ${acc};
  --slide: ${fill};
  --text: ${text};
  --face: ${face};
  --border: ${border};

  --weight: 400;
  --r: calc(6 * var(--length));
  /* uil rows are h 24 around h-2 controls */
  --row-h: calc(var(--control-height) + 2 * var(--space));
  /* uil lays every row out on the full gui width w and ends its value column at
     w - 8, while the 2px frame covers the outer 2px each side: 4px of row tone
     stay visible past the value column. Held outside the row box (content padding)
     so value columns still fill their row; full-row paints extend over it with a
     shadow copy shifted by the same amount. */
  --gutter: calc(4 * var(--length));

  /* native darkens rows by a flat -15/channel step off content (#37383d → #28292e), not a
     percentage mix — percentage mixing (even in oklab) desaturates toward neutral as it
     nears black, which is the "warmer" drift; a flat channel offset keeps the same absolute
     blue bias, reading cold at any lightness. Hover lift on the face tone uses the same
     flat-channel trick (+32/channel, native overoff #5c5c5c). Light palettes reverse both offsets. */
  --row: rgb(from var(--bg) calc(r + ${roles.dark ? -15 : 15}) calc(g + ${roles.dark ? -15 : 15}) calc(b + ${roles.dark ? -15 : 15}));
  --face-hover: rgb(from var(--face) calc(r + ${roles.dark ? 32 : -32}) calc(g + ${roles.dark ? 32 : -32}) calc(b + ${roles.dark ? 32 : -32}));

  /* Native signature greys (title #ccc, titleoff #bbb, textOver #eee, textSelect #fff,
     over #024699); custom palettes derive them the way uil does from a custom text or
     select color. Tooltip and picker wells keep their own contrast. */
  --label: ${native ? '#cccccc' : text};
  --label-off: ${native ? '#bbbbbb' : roles.fgMuted};
  --text-over: ${native ? '#eeeeee' : luma(text, .25)};
  --text-select: ${native ? '#ffffff' : luma(text, .5)};
  --accent-down: ${native ? '#024699' : luma(acc, -.1)};
  --hint: ${hint};
  --placeholder: ${placeholder};
  --on-accent: ${onAccent};
  --action: ${action};
  --option-bg: ${native ? '#2c2d31' : face};
  --tooltip-bg: #000;
  --ring: rgba(0,0,0,.1);
  --well-1: rgba(0,0,0,.2);
  --well-2: rgba(0,0,0,.25);
  --well-3: rgba(0,0,0,.3);

  color-scheme: ${roles.dark ? 'dark' : 'light'};

  background: var(--row);
  color: var(--text);

  width: calc(240 * var(--length));
  min-width: 0;
  max-width: 100%;
  border: calc(2 * var(--length)) solid var(--bg);
  border-radius: 0;
  padding: var(--panel-padding);

  font-family: var(--font-family);
  font-size: var(--font-size);
  /* uil never sets a line-height on its text boxes: they are normal-height lines
     flex-centered in their boxes (Menlo 11px: 13px, text top 5.5px into a 24px row) */
  line-height: normal;

  /* ── Title (uil 'title' row: bold, left) ── */
  .s-search-input::placeholder { color: ${searchPlaceholder}; }
  > summary, > .s-panel-title {
    background: transparent;
    color: var(--text); font-weight: 700; justify-content: flex-start; height: var(--row-h); padding: 0 calc(8 * var(--space)); position: relative;
    &::after { display: none; }
  }
  .s-panel-content { gap: var(--row-gap); padding: 0 var(--gutter) 0 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Row: hover lifts the row to the content tone (uil backgroundOver is transparent
     over #37383d); groups and locked rows never highlight ── */
  .s-control { gap: var(--column-gap); padding: 0; min-height: var(--row-h); align-items: center; background: transparent;
    &:not(.s-folder, :has(> .s-input[inert])):hover:not(:has(.s-control:hover)) { background: var(--bg); box-shadow: var(--gutter) 0 var(--bg); } }
  /* uil: sa = w·0.3 + 8, with w = row + 2·2px frame + gutter */
  .s-label-group { flex: 0 0 calc((100% + 4 * var(--length) + var(--gutter)) * .3 + 8 * var(--length)); width: auto; min-width: 0; max-width: none; padding: 0 0 0 calc(8 * var(--space)); line-height: normal; }
  /* uil sets each row at a fixed 24px and clips a long name, so a name never wraps out of its row */
  .s-label { min-width: 0; color: var(--label); font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .s-control:has(> .s-input[inert]) .s-label { color: var(--label-off); }
  .s-hint { color: ${hintInk}; opacity: 1; }
  /* a hint grows the label downward; the label itself stays centred on its control's line */
  .s-control:has(> .s-label-group .s-hint) { align-items: flex-start; > .s-label-group { padding-top: calc((var(--row-h) - 1lh) / 2); } > .s-input { min-height: var(--row-h); } }
  /* secondary text, one step under the body; knob and pad values stay body-size, as uil prints them */
  :is(.s-hint, .s-mark-label, .s-separator-label, .s-tooltip, .s-title-text, .s-vec-label) { font-size: calc(10 * var(--length)); }
  .s-input { flex: 1; width: 0; min-width: 0; gap: calc(4 * var(--space)); align-items: center; &[inert] { opacity: 1; } }

  /* ── Fields: text/number are dashed wells (padding 4); editing darkens the well and
     turns the dash accent ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--well-1); color: var(--text); border: 1px dashed var(--border); border-radius: var(--r);
    height: var(--control-height); padding: 0 calc(4 * var(--space)); font: inherit;
    &::placeholder { color: var(--placeholder); }
  }
  input[type="text"], input[type="number"], textarea { &:focus { outline: none; background: var(--well-3); border-color: var(--accent); } }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: left; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Slider (uil mode 2): track = value column - 47, a 4px well with a 2px fill from a
     3px inset to the thumb center; 9px square-ish thumb. The range box overhangs the
     track by thumb/2 - inset so the thumb center travels exactly inset → track - inset.
     Hovering the track brightens fill, thumb and readout by ColorLuma(+.25). ── */
  .s-slider {
    align-items: center;
    /* labelled marks hang in a line the row reserves under its content (the gap and a 1.25 line of the label), so the label still centres on the track */
    &:has(.s-mark-labels:not(:empty)) { padding-bottom: calc(14.5 * var(--length)); }
    .s-input { gap: calc(4 * var(--space)); }
    .s-track { flex: 1; min-width: 0; height: var(--control-height); margin: 0;
      background: linear-gradient(var(--well-1), var(--well-1)) center / 100% calc(4 * var(--length)) no-repeat; }
    .s-input:has(.s-track:hover) { --slide-over: ${luma('var(--slide)', .25)}; }${native ? `
    /* uil's default text keeps its palette constant textOver #eee instead of the derived #fff */
    @container style(--slide: #dddddd) { .s-input:has(.s-track:hover) { --slide-over: #eeeeee; } }` : ''}
    .s-track input[type="range"] {
      width: calc(100% + var(--thumb) - 2 * var(--rail-inset)); margin: 0 calc(var(--rail-inset) - var(--thumb) / 2); height: var(--control-height);
      background: linear-gradient(to right, currentColor var(--p, 0%), transparent 0) calc(var(--thumb) / 2) center / calc(100% - var(--thumb)) calc(2 * var(--length)) no-repeat;
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, calc(2 * var(--length))); color: var(--hint); white-space: nowrap; line-height: 1.25;
      /* the end labels stay inside the track's span: the first starts at 0%, the last ends at 100% */
      &.s-first { transform: translate(0, calc(2 * var(--length))); } &.s-last { transform: translate(-100%, calc(2 * var(--length))); } }
    /* readout box: sc - 6 = 41 wide + 2 spare to the column end, padding 4; uil sets it
       top 2 / height h-2 around a 14px line, so its text sits .5px below the label's; a longer value widens it */
    .s-readout { flex: 0 0 auto; width: calc(43 * var(--length)); min-width: calc(43 * var(--length)); text-align: left; color: var(--slide-over, var(--slide)); background: transparent; border: 0; border-radius: 0; height: var(--control-height); padding: calc(1 * var(--length)) 0 0 calc(4 * var(--space)); font-variant-numeric: tabular-nums;
      &:focus { background: transparent; }
      @supports (field-sizing: content) { field-sizing: content; width: auto; } }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: calc(2 * var(--length)); background: var(--tooltip-bg); color: var(--text); padding: calc(1 * var(--length)) calc(5 * var(--space)); border-radius: var(--r); white-space: nowrap; }
    /* the interval is the same 4px well and 2px fill, the fill between the thumbs */
    &.s-multiple .s-interval-track { height: var(--control-height); margin: 0; position: relative;
      background: linear-gradient(var(--well-1), var(--well-1)) center / 100% calc(4 * var(--length)) no-repeat;
      /* the thumbs' centres travel half a thumb in from each end: the fill's stops are laid in that span */
      &::before { content: ''; position: absolute; inset: 0 calc(4.5 * var(--length)); margin: auto 0; height: calc(2 * var(--length)); background: linear-gradient(to right, transparent var(--low, 0%), var(--slide-over, var(--slide)) 0 var(--high, 100%), transparent 0); }
      &:hover { --slide-over: ${luma('var(--slide)', .25)}; } }
  }

  /* the thumb every range input shares; the colour's alpha is the slider's 4px well, the checkerboard
     under the colour's ramp in place of the fill */
  :is(.s-slider, .s-rgba) input[type="range"] {
    --thumb: calc(9 * var(--length)); --rail-inset: calc(3 * var(--length));
    -webkit-appearance: none; appearance: none; cursor: pointer; border-radius: 0;
    color: var(--slide-over, var(--slide));
    &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--thumb); height: var(--thumb); border: none; border-radius: calc(2 * var(--length)); background: currentColor; cursor: ew-resize; }
    &::-moz-range-thumb { width: var(--thumb); height: var(--thumb); border: none; border-radius: calc(2 * var(--length)); background: currentColor; cursor: ew-resize; }
  }
  .s-rgba .s-alpha { height: var(--control-height); min-width: calc(40 * var(--length));
    background: linear-gradient(to right, transparent, var(--c)) center / 100% calc(4 * var(--length)) no-repeat, repeating-linear-gradient(to right, #fff 0 calc(4 * var(--length)), #c4c4c4 0 calc(8 * var(--length))) center / 100% calc(4 * var(--length)) no-repeat;
    &:hover { --slide-over: ${luma('var(--slide)', .25)}; }
    &:focus-visible { outline: 1px solid var(--accent); outline-offset: 1px; } }

  /* ── Select (uil list: face button, padding m=5, two-bar icon 9px off the right edge) ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer;
      background-color: var(--face); border-style: solid;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg' fill='${enc(text)}'%3E%3Crect width='6' height='2'/%3E%3Crect y='4' width='6' height='2'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right calc(8 * var(--length)) center; background-size: calc(6 * var(--length)) calc(6 * var(--length)); padding: 0 calc(20 * var(--space)) 0 calc(5 * var(--space)); line-height: calc(var(--control-height) - 2 * var(--length));
      &:hover { background-color: var(--face-hover); color: var(--text-over); }
      &:focus-visible { outline: 1px solid var(--accent); outline-offset: -1px; }
      option { background: var(--option-bg); color: var(--text); } }
    &.s-segmented { .s-input { gap: calc(4 * var(--space)); } button { flex: 1; } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(3 * var(--space)); } .s-input label { display: flex; align-items: center; gap: calc(6 * var(--space)); cursor: pointer; } }
  }

  /* ── Boolean: pill toggle. uil flips the track tone on hover (off .3 → .2, on .2 → .3)
     and lifts the knob (off face → overoff, on textOver → textSelect); it snaps, no slide ── */
  .s-boolean {
    align-items: center;
    .s-input { justify-content: flex-end; padding-right: calc(2 * var(--length)); }
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &.s-switch, &.s-toggle {
      --track: var(--well-3); --knob: var(--face);
      &:has(input:checked) { --track: var(--well-1); --knob: var(--text-over); }
      &:hover { --track: var(--well-1); --knob: var(--face-hover); }
      &:hover:has(input:checked) { --track: var(--well-3); --knob: var(--text-select); }
      .s-track { width: calc(36 * var(--length)); height: calc(17 * var(--length)); border-radius: calc(10 * var(--length)); background: var(--track); border: calc(2 * var(--length)) solid var(--track); position: relative; cursor: pointer;
        &::after { content: ''; position: absolute; inset: 0 auto; margin: auto 0; left: 0; width: calc(16 * var(--length)); height: calc(13 * var(--length)); border-radius: calc(10 * var(--length)); background: var(--knob); } }
      &:has(input:checked) .s-track::after { left: calc(100% - calc(17 * var(--length))); }
      &:has(input:focus-visible) .s-track { outline: 1px solid var(--accent); outline-offset: 1px; }
    }
    &.s-checkbox { input[type="checkbox"] { position: static; opacity: 1; } .s-track { display: none; } }
  }
  .s-boolean.s-checkbox input[type="checkbox"], .s-checkboxes .s-track { -webkit-appearance: none; appearance: none; flex: none; width: calc(16 * var(--length)); height: calc(16 * var(--length)); margin: 0; border-radius: calc(3 * var(--length)); background: var(--well-3); border: 1px solid var(--border); cursor: pointer; }
  .s-boolean.s-checkbox input[type="checkbox"]:checked, .s-checkboxes input:checked + .s-track { background: var(--s-color, var(--accent)); }
  .s-checkboxes input:focus-visible + .s-track { outline: 1px solid var(--accent); outline-offset: 1px; }

  /* ── Color: full-width tinted field with the hex over it. uil inks it #fff when
     0.3r + 0.59g + 0.11b <= 0.6, else #000, which leaves white on mid blues (#4488cc, 3.7:1);
     here the pick is by WCAG luminance at .179, where both inks reach the same contrast
     (color.js onAccent), so the hex reads at 4.5:1 or more on any color ── */
  .s-color {
    &.s-picker .s-color-input { gap: 0; position: relative; background: var(--color); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden;
      /* the field itself is the swatch (uil has none): the native picker input stays as an
         invisible pointer target on the right */
      input[type="color"] { position: absolute; inset: 0 0 0 auto; width: calc(24 * var(--length)); height: var(--control-height); padding: 0; border: none; opacity: 0; cursor: pointer; }
      &:has(input[type="color"]:focus-visible) { outline: 1px solid var(--accent); outline-offset: -1px; }
      input[type="text"] { position: relative; flex: 1; margin-right: calc(24 * var(--space)); background: transparent; border: 0; border-radius: 0; padding: 0 0 0 calc(8 * var(--space)); height: calc(var(--control-height) - 2 * var(--length));
        --ink: clamp(0, (.179 - (.2126 * pow((r / 255 + .055) / 1.055, 2.4) + .7152 * pow((g / 255 + .055) / 1.055, 2.4) + .0722 * pow((b / 255 + .055) / 1.055, 2.4))) * 1e6, 255);
        color: rgb(from var(--color) var(--ink) var(--ink) var(--ink));
        &:focus { background: transparent; } } }
    &.s-rgba .s-color-input { gap: calc(4 * var(--space));
      input[type="color"] { flex: none; width: calc(28 * var(--length)); height: var(--control-height); padding: 0; border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; background: none; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } &::-moz-color-swatch { border: none; } }
      input[type="text"] { flex: 0 1 auto; width: auto; field-sizing: content; } }
    &.s-swatches button { width: calc(18 * var(--length)); height: calc(18 * var(--length)); border-radius: var(--r); border: 1px solid var(--border); &.s-selected { outline: 1px solid var(--accent); } }
  }

  /* ── Buttons (uil button/selector): face, hover overoff + textOver, down over #024699,
     selected select + textSelect; the border never changes ── */
  button { font: inherit; cursor: pointer; }
  .s-button, .s-select.s-segmented {
    .s-input { gap: calc(4 * var(--space)); }
    button { width: 100%; background: var(--face); color: var(--text); border: 1px solid var(--border); border-radius: var(--r); height: var(--control-height); padding: 0 calc(8 * var(--space));
      &:hover { background: var(--face-hover); color: var(--text-over); }
      &:active { background: var(--accent-down); color: var(--text-over); }
      &.s-selected { background: var(--action); color: var(--on-accent); }
      &.s-selected:hover { background: var(--accent-down); color: var(--text-over); }
      &:focus-visible { outline: 1px solid var(--accent); outline-offset: -1px; } }
  }
  .s-button { &.s-secondary button, button.s-secondary { background: var(--well-1); } }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(44 * var(--length)); max-height: 50vh; padding: calc(4 * var(--space)); } }

  /* ── Folder (uil group): content-tone header, text colored, two-bar icon ending at the
     value column (horizontal closed, vertical open, swapped not animated) ── */
  .s-folder {
    > summary { color: var(--text); font-weight: 400; min-height: var(--row-h); padding: 0 0 0 calc(8 * var(--space)); background: var(--bg); box-shadow: var(--gutter) 0 var(--bg);
      &::after { content: ''; width: calc(6 * var(--length)); height: calc(6 * var(--length)); margin-left: auto; background: repeating-linear-gradient(to bottom, var(--text) 0 calc(2 * var(--length)), transparent 0 calc(4 * var(--length))); } }
    &[open] > summary::after { transform: rotate(90deg); }
    .s-content { gap: 0; padding-left: 0; }
  }

  /* ── Knob / pad: uil titles them centered above the widget, value centered below.
     Both center on the gui width w (the row plus gutter and frame), 2·gutter right of
     the visible row's own center. ── */
  .s-knob, .s-xy {
    flex-direction: column; align-items: center;
    padding: calc(2 * var(--space)) 0 calc(4 * var(--space)) calc(2 * var(--gutter));
    .s-label-group { flex: none; width: auto; height: calc(16 * var(--length)); justify-content: center; padding: 0; }
    .s-input { flex: none; width: auto; flex-direction: column; align-items: center; gap: 0; }
  }
  /* knob: uil svg is 128 units drawn at diam 40 (0.3125px/unit): face r34 filled #3c3c3c
     under an 8-unit rgba(0,0,0,.3) stroke straddling its edge (r 9.375–11.875px), a
     7-unit rgba(0,0,0,.1) ring at r41 (11.72–13.91px), 33 ticks every 9° over ±144°
     (r 12.5–13.75px, 2 units wide, text at .5) and a 4-unit round needle r20–25.
     The wrap is the dial box (24px, centered 12px under the title box) so circular
     mode, which reads the wrap's own rect, finds the true dial center. The ring and
     ticks are uil's own svg elements on a 40px overlay that never rotates; the readout
     hangs below, out of flow. */
  .s-knob-wrap {
    position: relative; display: grid; place-items: center; width: calc(24 * var(--length)); height: calc(24 * var(--length));
    margin-bottom: calc(8 * var(--space) + 16 * var(--length));
    &::after { content: ''; position: absolute; inset: calc(-8 * var(--length)); pointer-events: none;
      background: ${svg(128, `<circle cx='64' cy='64' r='41' fill='none' stroke='rgba(0,0,0,0.1)' stroke-width='7'/><path d='${ticks}' stroke='${text}' stroke-opacity='0.5' stroke-width='2' stroke-linecap='round'/>`)} center / 100% 100% no-repeat; }
  }
  /* the rotating dial fills the wrap so its box sits on whole pixels (Chrome snaps box
     paint, not svg): the face is drawn inset on ::before, the needle is uil's own round
     stroke masked over the full box, so both turn about the exact dial center */
  .s-knob-dial {
    --dial-face: var(--face); --needle: var(--text);
    width: 100%; height: 100%; background: none; border: none;
    &::before { content: ''; position: absolute; inset: calc(1.375 * var(--length)); border-radius: 50%; background: var(--dial-face);
      box-shadow: inset 0 0 0 calc(1.25 * var(--length)) var(--well-3), 0 0 0 calc(1.25 * var(--length)) var(--well-3); }
    i { inset: 0; width: auto; height: auto; transform: none; border-radius: 0; background: var(--needle);
      -webkit-mask: ${needle} center / 100% 100%; mask: ${needle} center / 100% 100%; }
  }
  .s-knob-val, .s-pad-val { display: flex; align-items: center; height: calc(16 * var(--length)); font-size: var(--font-size); font-weight: 400; opacity: 1; color: var(--text); white-space: nowrap; }
  .s-knob-val { position: absolute; top: calc(100% + 8 * var(--space)); left: 50%; transform: translateX(-50%); }
  /* uil down state: face → select, needle and readout → textOver */
  .s-knob-wrap:active { .s-knob-dial { --dial-face: var(--accent); --needle: var(--text-over); } .s-knob-val { color: var(--text-over); } }

  /* pad: uil svg is 256 units drawn at diam 100 (0.390625px/unit), 8 units below the
     title box: a 200-unit rgba(0,0,0,.2) frame (78.125px, inset 10.9375px in the svg)
     around a 180-unit face, 2-unit center crosshair, and an r5 ring stroked 5 units for
     the handle. The box is the face itself: the handle center spans exactly the face
     (±90 units) and pointer mapping reads this rect. Chrome snaps borders and box paint
     to whole pixels, so the fractional frame is a shadow and the handle ring a radial
     gradient centered on the exact handle point (half-device-pixel edge ramp). Down:
     frame/lines .3, face overoff, handle and readout textSelect. */
  .s-pad { --frame: calc(3.90625 * var(--length)); --pad-line: var(--well-1); --handle: var(--text);
    width: calc(70.3125 * var(--length)); height: calc(70.3125 * var(--length)); margin: calc(2.9375 * var(--length) + var(--frame)) 0 calc(10.9375 * var(--length) + var(--frame));
    background: var(--face); border: 0; border-radius: 0; box-shadow: 0 0 0 var(--frame) var(--pad-line);
    .s-pad-x, .s-pad-y { background: var(--pad-line); }
    .s-pad-x { height: calc(.78125 * var(--length)); transform: translateY(-50%); }
    .s-pad-y { width: calc(.78125 * var(--length)); transform: translateX(-50%); }
    .s-pad-dot { --aa: .25px; inset: 0; width: auto; height: auto; transform: none; border: 0; border-radius: 0; box-shadow: none;
      background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), transparent calc(.9765625 * var(--length) - var(--aa)), var(--handle) calc(.9765625 * var(--length) + var(--aa)) calc(2.9296875 * var(--length) - var(--aa)), transparent calc(2.9296875 * var(--length) + var(--aa))); }
    &:active { --pad-line: var(--well-3); --handle: var(--text-select); background: var(--face-hover); }
    /* no UA focus ring while pressed; keyboard focus rings the frame */
    &:focus-visible { outline: none; }
    &:focus-visible:not(:active) { outline: 1px solid var(--accent); outline-offset: var(--frame); }
  }
  .s-pad-val { flex: none; }
  .s-xy:has(.s-pad:active) .s-pad-val { color: var(--text-select); }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: var(--text); font-variant-numeric: tabular-nums; }
  .s-separator { background: var(--well-3); opacity: 1; }

}`

  return baseCSS + '\n' + overrides
}
