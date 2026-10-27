/**
 * figma – calibrated to Figma's UI3 properties panel (2024+)
 *
 * Signatures: Inter 11/16 at weight 450 (550 for titles), the #0d99ff blue (deepened
 * where WCAG needs it: 3:1 for fills on their track, 4.5:1 under white text), filled
 * 24px fields with 5px corners that show a hairline on hover and a blue line on focus,
 * outlined dropdowns, segmented controls whose selected segment lifts to the panel
 * color, 14px color chips, 40px section headers over 1px dividers, and a
 * 16 · 88 · 8 · 120 · 8 row grid. Light by default; a dark shade flips it.
 *
 * Sources (values below cite them by letter):
 *  A. Figma plugin color tokens, developers.figma.com/docs/plugins/css-variables
 *     (mirrored in @create-figma-plugin/ui 4.0.3 lib/css/theme.css).
 *  B. figma.com production stylesheet (auth bundle): --text-body-medium 11px/16px,
 *     weight 450, letter-spacing .00344rem; --text-body-medium-strong 550;
 *     --radius-medium .3125rem; --radius-small .125rem; the Inter-first font stack.
 *  C. @create-figma-plugin/ui 4.0.3 components (UI3): textbox, dropdown, segmented
 *     control, toggle, range slider, button, textbox-color, 16px icons.
 *  D. Figma Help Center UI3 screenshots, pixel-measured: 1px divider, 40px header
 *     with the title centered, 32px rows, 12px section foot, 88px label column,
 *     8px right gutter, grey labels, 14px chip at 5px + 6px, outlined dropdown.
 *  E. Figma itself, measured at 2× for the Color Space plugin (color-space/plugins/figma/src/ui.html,
 *     2026-10): its menu (#1e1e1e, 12px corners, 8px ends, 24px rows inset 8px with 4px corners, the
 *     lit row #0d99ff, a bold check at the left), its knob (a 4px white ring, the fill's 1px 20% rim
 *     inside, a 1px 20% outline and a soft shadow outside), its checkbox (12px, 2px corners, a
 *     secondary-ink hairline; set, the brand blue with a white check), its tooltip (the menu's fill,
 *     4 × 8px padding, 6px corners).
 *
 * Axes: shade (bg, drives dark/light), accent (action blue), size, spacing, font.
 * Surfaces are Figma's own greys expressed as shade mixes (white → #f5f5f5 field,
 * #e6e6e6 line; #2c2c2c → #383838, #444444), and text is Figma's alpha ink, so a
 * tinted shade recolors every surface instead of leaving neutral grey patches.
 *
 * figma(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { parseColor, resolveAccent, luminance, contrast, mix, ink as legible } from './color.js'

export default function figma({
  shade = '#ffffff',
  accent,
  size = 1,
  spacing = 1,
  font,
} = {}) {
  const { L } = parseColor(shade)
  const dark = L < 0.5
  const enc = c => encodeURIComponent(c)   // any CSS color, safe inside an SVG data-URI

  // ── Tokens: Figma's light/dark pairs, keyed off `dark` ──
  const toward = dark ? '#fff' : '#000'
  const cssMix = p => `color-mix(in srgb, var(--bg), ${toward} ${p}%)`
  // the same sRGB mixes, resolved, to measure contrast on
  const lineHex = mix(shade, toward, dark ? .114 : .1)
  // A: bg-brand light / dark; the slider fill, switch and thumb read 3:1 on the track they sit on
  // (WCAG 1.4.11): Figma's #0d99ff gives 2.4:1 on its #e6e6e6 track, 3.0:1 on white
  const acc = legible(lineHex, 3, resolveAccent(accent, shade) || (dark ? '#0c8ce9' : '#0d99ff'))
  const ink = dark ? '#ffffff' : 'rgba(0,0,0,.9)'                 // A: text / icon
  // A: text-secondary, .7 white / .5 black; its alpha rises until it reads 4.5:1 on the field it also
  // labels (.5 black: 3.9:1 on white and on #f5f5f5), and text-tertiary's in a placeholder (.3 black: 2.1:1)
  const fieldHex = mix(shade, toward, dark ? .057 : .04)
  // (read at the alpha as written and as the 8-bit value a browser may composite with)
  const rise = k => { while (k < 1 && [k, Math.round(+k.toFixed(2) * 255) / 255].some(a => contrast(mix(fieldHex, toward, a), fieldHex) < 4.5)) k += .01; return `rgba(${dark ? '255,255,255' : '0,0,0'},${+k.toFixed(2)})` }
  const dim = rise(dark ? .7 : .5)
  const placeholder = rise(dark ? .4 : .3)
  const faint = dark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.3)'  // A: text-tertiary (disabled lettering)
  const field = cssMix(dark ? 5.7 : 4)       // A: bg-secondary #f5f5f5 / #383838 (= bg-hover)
  const line = cssMix(dark ? 11.4 : 10)      // A: border, bg-tertiary #e6e6e6 / #444444
  const disabled = cssMix(dark ? 34.6 : 15)  // A: bg-disabled #d9d9d9 / #757575
  // A: white on brand (#0d99ff, luminance .30) and success (#14ae5c, .31); rgba(0,0,0,.9) on
  // warning (#ffcd29, .65). The split between them keeps a light custom accent readable.
  const onAccent = luminance(acc) > .45 ? 'rgba(0,0,0,.9)' : '#fff'
  // Under lettering the accent darkens only as far as 4.5:1 needs (white on #0d99ff: 3.0:1), and a
  // labeled separator's label (ink at 60% on its line-colored band, 4.3:1) lifts the same way
  const action = onAccent === '#fff' ? legible('#fff', 4.5, acc) : acc
  const sepLabel = legible(lineHex, 4.5, mix(lineHex, toward, dark ? .6 : .54))
  // The selected segment is the panel color in a border-colored hairline (#fff and #e6e6e6, 1.1:1 each on
  // the #f5f5f5 track): the hairline darkens until it marks the choice at 3:1 there (WCAG 1.4.11)
  const selectedLine = legible(fieldHex, 3, lineHex)
  // Fixed regardless of shade: Figma paints these the same in either mode.
  const tooltipBg = '#1e1e1e'     // C: --color-bg-menu
  const tooltipFg = '#fff'
  // E: Figma's menu, dark in either theme: #1e1e1e, white rows, the row under the pointer on its selection blue
  const menuSel = '#0d99ff'

  // C: 16px icons (chevron-down-16, check-16), stroked on the 1px icon grid
  const chevron = c => `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.9 7.1 8 9.2l2.1-2.1' fill='none' stroke='${enc(c)}' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`

  // Body 11px: UI3 sets its labels and values at 11px.
  const body = 11
  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body, fontSize: 11, fontFamily: `"Inter", ui-sans-serif, system-ui, -apple-system, "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", sans-serif`, lineHeight: 16, controlHeight: 24, inset: 8, rowGap: 0, columnGap: 8, sectionGap: 16, panelPadding: 0})}

  --bg: ${shade};
  --accent: ${acc};
  --accent-hover: color-mix(in oklab, var(--accent), #000 ${dark ? 14 : 10}%);   /* A: bg-brand-hover, closest mix */
  --action: ${action};
  --action-hover: color-mix(in oklab, var(--action), #000 ${dark ? 14 : 10}%);
  --ink: ${ink};
  --dim: ${dim};
  --faint: ${faint};
  --placeholder: ${placeholder};
  --field: ${field};
  --line: ${line};
  --line-selected: ${selectedLine};
  --hover: var(--field);
  --disabled: ${disabled};
  --on-accent: ${onAccent};
  --knob: #fff;
  --knob-edge: inset 0 0 0 1px rgb(0 0 0 / 20%), 0 0 0 1px rgb(0 0 0 / 20%), 0 1px calc(3 * var(--length)) rgb(0 0 0 / 15%);   /* E */
  --swatch-ring: inset 0 0 0 1px ${dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'};
  --tooltip-bg: ${tooltipBg};
  --tooltip-fg: ${tooltipFg};

  --weight: 450;                           /* B: --font-weight-default */
  --strong: 550;                           /* B: --font-weight-strong */
  --r: calc(5 * var(--length));            /* B: --radius-medium */
  --r-small: calc(2 * var(--length));      /* B: --radius-small */
  --field-h: var(--control-height);
  --header-h: calc(var(--line-height) + 24 * var(--space));   /* D: 40px section header */
  --ease: cubic-bezier(.2, 0, 0, 1);
  --chev: ${chevron('#000')};
  --menu-check: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 12.5 4.5 4.5L19 7.5'/%3E%3C/svg%3E");
  --check: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11.8 4.1a.5.5 0 0 1 .1.7l-4 6a.5.5 0 0 1-.8.1l-3-3a.5.5 0 0 1 .7-.7l2.6 2.6 3.7-5.5a.5.5 0 0 1 .7-.2'/%3E%3C/svg%3E");
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--bg);
  color: var(--ink);

  width: min(100%, calc(240 * var(--length)));
  min-width: 0;
  max-width: calc(240 * var(--length));
  border-radius: 0;
  padding: var(--panel-padding);
  -webkit-font-smoothing: antialiased;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
  letter-spacing: .005em;                  /* B: .00344rem at 11px */

  /* ── Title (panel header, the selected Design tab) ── */
  > summary, > .s-panel-title {
    font-weight: var(--strong); color: var(--ink);
    box-sizing: content-box; height: var(--header-h); padding: 0 calc(16 * var(--space)); border-bottom: 1px solid var(--line);
  }
  /* Chevron only on .s-fold-icon, present solely when the title is actually foldable (a real <summary>) */
  > summary .s-fold-icon { margin-left: auto; display: flex;
    i { display: block; width: calc(16 * var(--length)); height: calc(16 * var(--length)); background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .12s var(--ease); } }
  &[open] > summary .s-fold-icon i { transform: rotate(-180deg); }
  .s-panel-content { gap: var(--row-gap); padding: calc(8 * var(--space)) 0; }

  /* ── Search (title-bar magnifier that expands into a field) ── */
  .s-search { margin-left: auto; gap: calc(6 * var(--space)); }
  .s-search-btn { width: calc(16 * var(--length)); height: calc(16 * var(--length)); color: var(--dim); border-radius: var(--r-small); transition: color .12s var(--ease); &:hover { color: var(--ink); } }
  &.s-searching .s-search-btn { color: var(--ink); }
  .s-search-input {
    width: calc(96 * var(--length)); height: var(--field-h); padding: 0 calc(7 * var(--space)); border: 1px solid transparent; border-radius: var(--r);
    background: var(--field); font: inherit; letter-spacing: inherit; color: var(--ink); outline: none;
    &:focus { border-color: var(--accent); }
    &::placeholder { color: var(--placeholder); }
    &::-webkit-search-cancel-button { -webkit-appearance: none; }
  }

  /* ── Row: 32px, 16px lead, 88px label, 8px tail (D) ── */
  /* the label centres on the control's first 24px line: a hint, a list or a wrapped control grows the row downward */
  .s-control { gap: var(--column-gap); padding: calc(4 * var(--space)) calc(8 * var(--space)) calc(4 * var(--space)) calc(16 * var(--space)); min-height: calc(32 * var(--length)); align-items: flex-start; }
  .s-label-group { width: calc(88 * var(--length)); min-width: 0; max-width: none; padding: calc((var(--field-h) - 1lh) / 2) 0 0; }
  .s-input { min-height: var(--field-h); }
  /* a list's first option and a swatch palette's first row sit on that line too; a knob's label centres on its dial */
  :is(.s-select:is(.s-radio, .s-checkboxes), .s-color.s-swatches) .s-input { padding-top: calc((var(--field-h) - var(--line-height)) / 2); }
  .s-knob { align-items: center; > .s-label-group { padding-top: 0; } }
  .s-label { color: var(--dim); font-weight: var(--weight); }
  .s-hint { opacity: 1; color: var(--dim); }
  /* UI3 sets all its text at 11px: secondary text is the body size in text-secondary, not a smaller step */
  :is(.s-hint, .s-mark-label, .s-separator-label, .s-tooltip, .s-title-text, .s-vec-label, .s-knob-val, .s-pad-val) { font-size: var(--font-size); }

  .s-input { gap: calc(8 * var(--space)); align-items: center; }

  /* ── Fields: filled, hairline on hover, blue line on focus (C textbox) ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--field); color: var(--ink);
    border: 1px solid transparent; border-radius: var(--r);
    height: var(--field-h); padding: 0 calc(7 * var(--space)); font: inherit; letter-spacing: inherit; outline: none;
    transition: border-color .12s var(--ease);
    &::placeholder { color: var(--placeholder); }
    &:hover { border-color: var(--line); }
    &:focus { border-color: var(--accent); }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: left; font-variant-numeric: tabular-nums; -moz-appearance: textfield; &.s-scrub:not(:focus) { cursor: ew-resize; } &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Vector (X/Y/W/H: grey axis letter centered in a 24px icon slot, value at 24px) ── */
  .s-vector {
    .s-vec-axis { flex: 1; min-width: 0; gap: 0; box-sizing: border-box; height: var(--field-h); background: var(--field); border: 1px solid transparent; border-radius: var(--r);
      transition: border-color .12s var(--ease);
      &:hover { border-color: var(--line); }
      &:focus-within { border-color: var(--accent); } }
    .s-vec-label { opacity: 1; flex: none; color: var(--dim); width: calc(22 * var(--length)); text-align: center; }
    /* three or more axes pair up two to a row, at the X / Y field width */
    .s-input:has(> .s-vec-axis:nth-of-type(3)) .s-vec-axis { flex: 0 0 calc(50% - 4 * var(--space)); }
    input[type="number"] { flex: 1; background: transparent; border: none; border-radius: 0; padding: 0 calc(7 * var(--space)) 0 calc(1 * var(--length)); text-align: left; font-variant-numeric: tabular-nums; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
  }

  /* ── Slider: 16px filled pill with a hairline, blue progress, ringed thumb (C range slider, D) ── */
  /* the colour's alpha is the same pill and thumb, the checkerboard under the colour's ramp in place of the progress */
  :is(.s-slider, .s-rgba) input[type="range"] {
    width: 100%; height: calc(16 * var(--length)); -webkit-appearance: none; appearance: none; border: 1px solid transparent; border-radius: calc(8 * var(--length)); cursor: pointer; outline: none;
    background:
      /* the progress ends under the thumb's centre, which travels the content box less the thumb's width */
      linear-gradient(var(--accent), var(--accent)) border-box 0 0 / calc(1px + 8 * var(--length) + (100% - 2px - 16 * var(--length)) * var(--t, 0)) 100% no-repeat,
      linear-gradient(var(--field), var(--field)) padding-box,
      linear-gradient(var(--line), var(--line)) border-box;
    &::-webkit-slider-thumb { -webkit-appearance: none; box-sizing: border-box; width: calc(16 * var(--length)); height: calc(16 * var(--length)); border-radius: 50%; background: var(--accent); border: calc(4 * var(--length)) solid var(--knob); box-shadow: var(--knob-edge); cursor: pointer; }
    &::-moz-range-thumb { box-sizing: border-box; width: calc(16 * var(--length)); height: calc(16 * var(--length)); border-radius: 50%; background: var(--accent); border: calc(4 * var(--length)) solid var(--knob); box-shadow: var(--knob-edge); cursor: pointer; }
    &:focus-visible::-webkit-slider-thumb { outline: 1px solid var(--accent); outline-offset: 1px; }
    &:focus-visible::-moz-range-thumb { outline: 1px solid var(--accent); outline-offset: 1px; }
    &.s-alpha { flex: 1 1 0; min-width: calc(32 * var(--length));
      background: linear-gradient(to right, transparent, var(--c)) border-box, conic-gradient(#e6e6e6 90deg, #fff 0 180deg, #e6e6e6 0 270deg, #fff 0) 0 0 / calc(8 * var(--length)) calc(8 * var(--length)) border-box; }
  }
  .s-slider {
    .s-track { height: var(--field-h); margin: 0; }
    /* labelled marks hang in a line the row reserves under the track (padding, so the readout still centres on the track): the gap and a 1.25 line of the label */
    &:has(.s-mark-labels:not(:empty)) .s-input { padding-bottom: calc(15.75 * var(--length)); }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, calc(2 * var(--length))); color: var(--dim); white-space: nowrap; line-height: 1.25;
      /* the end labels stay inside the track's span: the first starts at 0%, the last ends at 100% */
      &.s-first { transform: translate(0, calc(2 * var(--length))); } &.s-last { transform: translate(-100%, calc(2 * var(--length))); } }
    .s-readout { flex: 0 0 auto; width: calc(48 * var(--length)); min-width: calc(48 * var(--length)); @supports (field-sizing: content) { field-sizing: content; width: auto; } display: flex; align-items: center; text-align: left; background: var(--field); color: var(--ink); border: 1px solid transparent; border-radius: var(--r); height: var(--field-h); padding: 0 calc(7 * var(--space)); font-variant-numeric: tabular-nums; cursor: ew-resize; transition: border-color .12s var(--ease); &:hover { border-color: var(--line); } &:focus { outline: none; border-color: var(--accent); cursor: text; } }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: calc(4 * var(--space)); background: var(--tooltip-bg); color: var(--tooltip-fg); padding: calc(2 * var(--length)) calc(6 * var(--space)); border-radius: var(--r); white-space: nowrap; }
    /* Interval: two 48px readouts leave the 120px column no track, so the track takes the column and the readouts pair under it, as X / Y fields do */
    &.s-multiple .s-input { flex-wrap: wrap; }
    &.s-multiple .s-readout { flex: 1; }
    &.s-multiple .s-interval-track { order: -1; flex-basis: 100%; height: calc(16 * var(--length)); margin: calc(4 * var(--space)) 0; background: var(--field); box-shadow: inset 0 0 0 1px var(--line); border-radius: calc(8 * var(--length)); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); border-radius: inherit; }
      input[type="range"] { background: none; } }
  }

  /* ── Select ── */
  .s-select {
    /* Dropdown: outlined, no fill; 16px chevron 4px inside the right edge (C dropdown, D) */
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer;
      background: ${chevron(ink)} right calc(4 * var(--length)) center / calc(16 * var(--length)) no-repeat; border-color: var(--line); padding-right: calc(24 * var(--length));
      &:hover { border-color: var(--line); }
      &:focus { border-color: var(--line); }
      &:focus-visible { border-color: var(--accent); }
      option { background: var(--bg); color: var(--ink); } }
    /* E: where the select is customizable its list is Figma's menu */
    @supports (appearance: base-select) {
      &.s-dropdown select { appearance: base-select; display: flex; align-items: center; padding-block: 0 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        &::picker-icon { display: none; }
        &::picker(select) { appearance: base-select; position-area: bottom span-right; position-try-fallbacks: flip-block; min-width: anchor-size(width); margin: calc(4 * var(--length)) 0;
          padding: calc(8 * var(--length)) 0; border: 0; border-radius: calc(12 * var(--length)); background: var(--tooltip-bg); color: var(--tooltip-fg); box-shadow: 0 1rem 4rem rgb(0 0 0 / 28%); }
        option { display: flex; align-items: center; gap: calc(2 * var(--length)); min-height: calc(24 * var(--length)); margin: 0 calc(8 * var(--length)); padding: calc(4 * var(--length)) calc(8 * var(--length)) calc(4 * var(--length)) calc(4 * var(--length));
          border-radius: calc(4 * var(--length)); background: none; color: var(--tooltip-fg); font: inherit; letter-spacing: inherit; white-space: nowrap; cursor: pointer;
          &::checkmark { order: -1; content: ''; flex: none; width: calc(12 * var(--length)); height: calc(12 * var(--length)); margin-inline-end: calc(2 * var(--length)); background: currentColor; -webkit-mask: var(--menu-check) center / contain no-repeat; mask: var(--menu-check) center / contain no-repeat; }
          &:not(:checked)::checkmark { visibility: hidden; }
          &:is(:hover, :focus-visible) { background: ${menuSel}; color: #fff; outline: none; } } } }
    /* Segmented: filled track; the selected segment takes the panel color and a hairline (C segmented control), at 3:1 */
    &.s-segmented { .s-input { gap: 0; background: var(--field); border-radius: var(--r); }
      button { flex: 1 1 0; min-width: calc(24 * var(--length)); background: transparent; border: 1px solid transparent; color: var(--dim); border-radius: var(--r); height: var(--field-h); padding: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font: inherit; letter-spacing: inherit; outline: none;
        transition: color .12s var(--ease);
        &:hover { color: var(--ink); }
        &:focus-visible { border-color: var(--accent); color: var(--ink); }
        &.s-selected { background: var(--bg); border-color: var(--line-selected); color: var(--ink); }
        &.s-selected:focus-visible { border-color: var(--accent); } } }
    /* an option list stands a step clear of its neighbours, so two lists never read as one */
    &:is(.s-radio, .s-checkboxes) > .s-input { padding-block: calc(4 * var(--space)); }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(8 * var(--space)); } .s-input label { display: flex; align-items: center; gap: calc(8 * var(--space)); cursor: pointer; } }
  }

  /* ── Boolean ── */
  .s-boolean {
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    /* Switch: 32×16 pill, 14px knob inside a 1px rim (C toggle) */
    &.s-switch {
      .s-track { width: calc(32 * var(--length)); height: calc(16 * var(--length)); border-radius: calc(8 * var(--length)); background: var(--line); position: relative; cursor: pointer; transition: background .1s ease-out;
        &::after { content: ''; position: absolute; top: calc(1 * var(--length)); left: calc(1 * var(--length)); width: calc(14 * var(--length)); height: calc(14 * var(--length)); border-radius: 50%; background: var(--knob); transition: left .1s ease-out; } }
      &:has(input:checked) .s-track { background: var(--accent); &::after { left: calc(17 * var(--length)); background: var(--on-accent); } }
      &:has(input:focus-visible) .s-track { box-shadow: inset 0 0 0 1px var(--accent-hover); }
      &:has(input:checked:focus-visible) .s-track { box-shadow: inset 0 0 0 1px var(--accent-hover), inset 0 0 0 2px var(--bg); }
    }
    &.s-toggle .s-track { padding: 0 calc(8 * var(--space)); height: var(--field-h); border: 1px solid transparent; border-radius: var(--r); background: var(--field); color: var(--dim); display: flex; align-items: center; justify-content: center; cursor: pointer;
      transition: background .12s var(--ease), color .12s var(--ease);
      &::after { content: 'Off'; } }
    &.s-toggle:has(input:checked) .s-track { background: var(--action); color: var(--on-accent); &::after { content: 'On'; } }
    &.s-toggle:has(input:focus-visible) .s-track { border-color: var(--accent-hover); }
  }

  /* ── Checkbox: 12px, 2px corners, a secondary-ink hairline; set, the brand blue with a white check (E); the checkboxes list draws it on .s-track ── */
  .s-boolean.s-checkbox .s-track, .s-checkboxes .s-track { display: grid; place-items: center; flex: none; width: calc(12 * var(--length)); height: calc(12 * var(--length)); border-radius: var(--r-small); box-shadow: inset 0 0 0 1px var(--dim); cursor: pointer;
    &::after { content: ''; width: calc(10 * var(--length)); height: calc(10 * var(--length)); -webkit-mask: var(--menu-check) center / contain no-repeat; mask: var(--menu-check) center / contain no-repeat; background: var(--on-accent); opacity: 0; } }
  .s-boolean.s-checkbox:has(input:checked) .s-track, .s-checkboxes input:checked + .s-track { background: var(--s-color, var(--accent)); box-shadow: none; &::after { opacity: 1; } }
  .s-boolean.s-checkbox:has(input:focus-visible) .s-track, .s-checkboxes input:focus-visible + .s-track { outline: 1px solid var(--accent); outline-offset: 1px; }

  /* ── Color: filled field, 14px chip (2px corners) 5px in, hex 6px after (C textbox-color, D) ── */
  .s-color {
    .s-color-input { flex: 1; min-width: 0; display: flex; align-items: center; gap: calc(6 * var(--space)); box-sizing: border-box; height: var(--field-h); background: var(--field); border: 1px solid transparent; border-radius: var(--r); padding: 0 0 0 calc(4 * var(--space));
      transition: border-color .12s var(--ease);
      &:hover { border-color: var(--line); }
      &:focus-within { border-color: var(--accent); }
      input[type="color"] { appearance: none; -webkit-appearance: none; position: static; flex: none; width: calc(14 * var(--length)); height: calc(14 * var(--length)); padding: 0; border: none; border-radius: var(--r-small); overflow: hidden; background: none; cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: var(--r-small); } &::-moz-color-swatch { border: none; border-radius: var(--r-small); } }
      input[type="text"] { flex: 1; width: 0; min-width: 0; height: 100%; background: transparent; border: none; border-radius: 0; padding: 0 calc(7 * var(--space)) 0 0; text-transform: uppercase; }
      .s-alpha { order: 1; } }
    /* rgba: the field (chip and value) takes the column and the alpha slider the line under it, as the interval's track does */
    &.s-rgba .s-color-input { position: relative; flex-wrap: wrap; height: auto; row-gap: calc(8 * var(--space)); padding: 0; background: none; border: 0;
      input[type="color"] { position: absolute; left: calc(5 * var(--space)); top: calc((var(--field-h) - 14 * var(--length)) / 2); z-index: 1; }
      input[type="text"] { flex: 1 0 100%; height: var(--field-h); background: var(--field); border: 1px solid transparent; border-radius: var(--r); padding: 0 calc(7 * var(--space)) 0 calc(5 * var(--space) + 20 * var(--length)); transition: border-color .12s var(--ease);
        &:hover { border-color: var(--line); } &:focus { border-color: var(--accent); } }
      .s-alpha { flex: 1 0 100%; } }
    &.s-swatches button { width: calc(16 * var(--length)); height: calc(16 * var(--length)); padding: 0; border: none; border-radius: var(--r-small); box-shadow: var(--swatch-ring); outline: none; &.s-selected, &:focus-visible { outline: 1px solid var(--accent); outline-offset: 1px; } }
  }

  /* ── Button: 24px, 5px corners, weight 450 (C button) ── */
  button { font: inherit; letter-spacing: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(8 * var(--space)); }
    button { flex: 1; height: var(--field-h); background: var(--action); color: var(--on-accent); border: 1px solid transparent; border-radius: var(--r); padding: 0 calc(8 * var(--space)); outline: none;
      transition: background .12s var(--ease);
      &:hover, &:active { background: var(--action-hover); }
      &:focus-visible { border-color: var(--accent-hover); box-shadow: inset 0 0 0 1px var(--bg); }
      &:disabled { background: var(--disabled); color: var(--on-accent); cursor: not-allowed; } }
    &.s-secondary button, button.s-secondary { background: transparent; color: var(--ink); border-color: var(--line);
      &:hover, &:active { background: var(--field); }
      &:focus-visible { border-color: var(--accent); box-shadow: none; }
      &:disabled { background: transparent; color: var(--faint); } }
  }

  /* ── Textarea (C textbox-multiline) ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: none; field-sizing: content; min-height: calc(48 * var(--length)); max-height: 50vh; height: auto; padding: calc(3 * var(--space)) calc(7 * var(--space)); } }

  /* ── Folder (section): 1px divider, 40px header, 12px foot (D) ── */
  .s-folder {
    padding: 0; /* .s-folder also matches .s-control; without this it double-applies the row inset to both the header and .s-content's children */
    > summary { font-weight: var(--strong); color: var(--ink); box-sizing: content-box; height: var(--header-h); padding: 0 calc(16 * var(--space)); border-top: 1px solid var(--line);
      &::after { content: ''; width: calc(16 * var(--length)); height: calc(16 * var(--length)); margin-left: auto; background: currentColor; opacity: 0; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .12s var(--ease), opacity .12s var(--ease); }
      &:hover::after { opacity: .5; } }
    &[open] > summary::after { transform: rotate(-180deg); }
    .s-content { gap: 0; padding-bottom: calc(12 * var(--space)); }
  }
  /* Loose rows are sections too: the first one after a folder opens with a divider */
  .s-panel-content > .s-control:not(.s-folder) + .s-folder { margin-top: calc(8 * var(--space)); }
  .s-panel-content > .s-folder + .s-control:not(.s-folder) { border-top: 1px solid var(--line); padding-top: calc(12 * var(--space)); }

  /* ── XY pad / knob ── */
  .s-pad { border-radius: var(--r); background: var(--field); }
  .s-knob-dial { background: var(--field); border: 1px solid var(--line); }

  /* ── Tooltip (a label's ?): the menu's fill, 4 × 8px, 6px corners (E) ── */
  .s-title-text { padding: calc(4 * var(--length)) calc(8 * var(--length)); border-radius: calc(6 * var(--length)); background: var(--tooltip-bg); color: var(--tooltip-fg); line-height: 1.45; }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: var(--ink); font-variant-numeric: tabular-nums; }
  .s-separator { background: var(--line); opacity: 1; margin: calc(8 * var(--space)) 0; }
  .s-separator-labeled { background: none; &::before, &::after { background: var(--line); opacity: 1; } }
  .s-separator-label { color: ${sepLabel}; opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
