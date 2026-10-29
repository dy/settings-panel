/**
 * studio – an original theme for the row-as-instrument idiom pioneered by
 * DialKit (Josh Puckett – https://www.dialkit.dev/, https://github.com/joshpuckett/dialkit,
 * verified against commit 0301abdf0b84fc3d60a4c4fa3a99bfb2044959e3: theme.css + Slider.tsx).
 *
 * Signature: every row is a soft alpha-tinted pill, label at left / value at
 * right. A slider's fill IS its own row background – the label rides on top
 * of it, the value edits in place past its edge, a hairline handle marks the
 * fill's current position. One ink color drives every state; there is no
 * accent axis (tweakpane's precedent here – interaction reads as lightness/
 * alpha, never hue).
 *
 * Deliberate departures from the shipped DialKit source, matching the
 * reference screenshots over the current repo (per orchestrator decision):
 *   - color swatch is a circle (source draws a 5px-rounded square)
 *   - step dots are visible at rest (subtle) rather than hidden until
 *     interaction, in both shades - orchestrator decision, per the light
 *     reference's own Width row
 *   - the slider handle is visible at rest on every shade (subtle),
 *     strengthening on hover/drag, where DialKit's source hides it at rest
 *     (Slider.tsx): the owner's call, so the value's place reads without
 *     the pointer
 *   - values (text/number/select/slider) render in the UI font with tabular
 *     numerals, not a separate monospace face
 *   - `boolean:segmented` reads Off / On, the chosen word marked; a segmented
 *     select's choices and a vector's parts are words at the row's end too:
 *     nothing in a row is boxed again (the switch stays the reference's own)
 *   - a range is the slider with two handles: the fill spans low to high
 *   - two section-header conventions, one per reference: the static group
 *     title is an uppercase tracked eyebrow (`separator:labeled`, light
 *     reference's TEXT/LAYOUT/PATH); the collapsible group keeps DialKit's
 *     real sentence-case title + chevron (`folder`, dark reference's
 *     Enter/Exit/Dividers) – each screenshot's own convention, kept apart
 *     rather than merged into one
 *   - a slider's label reserves a small leading gap past the row's own
 *     inset (measured off the light reference's own Offset row: the resting
 *     handle sits at the row's normal inset, same as every other control's
 *     label, and the label text starts ~8px further in) so the handle never
 *     sits under the first glyph at low values. It is a fixed reserve, not
 *     the reference's live text-width dodge (that needs JS-measured text,
 *     out of scope for a CSS-only theme) - it clears the common low-value
 *     case, not every label length at every fill percentage
 *
 * Contrast: every text / UI-boundary tone comes from theme/color.js's
 * `ink()` against `shade`, not a hand-picked alpha. `ink(shade)` is the
 * ratio-4.5 (AA text) neutral of shade's own hue, used for every row label,
 * value and heading (including the separator eyebrow: real text, not a UI
 * boundary, so it earns the text ratio, not the 3:1 one); `ink(shade, 3)` is
 * the ratio-3 (WCAG 1.4.11) UI-boundary tone, reserved for marks and
 * chevrons; a placeholder is text, that tone lifted to 4.5:1 on its row.
 * A chromatic shade therefore still reads correctly.
 * Every alpha wash below (row fills, hairlines, the slider fill, marks) is
 * a color-mix() of that one root ink - DialKit's own verified percentages
 * (8.5:1 dark / 5.7:1 light label contrast, theme.css) reapplied as ratios
 * of whichever ink `shade` produces, so they hold for any custom shade, not
 * only DialKit's native `#212121` / `#fafafa`. Every ink shares the same
 * capped chroma (`nC`, including the focus ring) - a neutral shade's own
 * hue is numerically undefined, so nothing here may invent one just to
 * make a ring "pop"; that would break the theme's own no-accent premise.
 *
 * Axes: shade (bg; no accent), spacing, size, roundness (1 = DialKit's own
 * 8px row / 14px panel), weight, font (UI face only – values stay in it).
 *
 * studio(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveRoles, ink, contrast, mix } from './color.js'

export default function studio({
  shade = '#212121',
  spacing = 1,
  size = 1,
  roundness = 1,
  weight = 500,
  font,
} = {}) {
  const { dark, C, H } = resolveRoles(shade)
  const nC = Math.min(C, 0.025)   // a whisper of shade's own hue – stays monochrome, never saturated

  const primary  = ink(shade, 7,   { L: dark ? .97 : .09, C: nC, H }) // root ink – anchors every wash below
  const tertiary = ink(shade, 3,   { L: dark ? .64 : .56, C: nC, H }) // marks, chevrons (UI boundary)
  const focus    = ink(shade, 3,   { L: dark ? .90 : .28, C: nC, H }) // keyboard focus ring (UI boundary) – same capped chroma as every other ink; a neutral shade must not manufacture a hue it doesn't have

  const wash = a => `color-mix(in oklab, var(--ink), transparent ${100 - a}%)`
  // Lettering is measured on each ground it lies on (the eyebrow on the panel, a button's label on its
  // face), and moves only where it then reads 4.5:1: a shade too mid-grey for any ink keeps its tone. It aims
  // at 4.6, since the browser composites a wash a level off the exact blend (4.45:1 aimed at 4.5).
  const page = g => [g(shade)]
  // One polarity (`side`): on a mid shade (copper) a darker ground (a slider's fill) that dark lettering can't hold
  // at its ratio keeps the dark ink rather than flip it to white beside dark labels.
  const side = dark ? 1 : 0
  const fit = (grounds, tone) => { const t = grounds.reduce((t, g) => ink(g, 4.6, t, side), tone); return grounds.every(g => contrast(t, g) >= 4.5) ? t : tone }
  const row = g => mix(g, primary, dark ? .05 : .04), hovered = g => mix(g, primary, dark ? .1 : .08)
  const face = (g, under = row) => mix(under(g), primary, dark ? .11 : .1)
  // row labels, the separator eyebrow: the lightest tone that still reads 4.5:1 (AA text) on every ground a label
  // lies on – its row at rest and hovered, a slider's fill, a selected segment's face – so labels sit a step back
  // from the values (reference: grey labels, near-black values)
  const fillA = dark ? .15 : .105   // a slider's fill (reference: #e4 on the #f4 row)
  const fill = (g, under = row) => mix(under(g), primary, fillA)
  const label = fit([row, hovered, fill, g => fill(g, hovered), face, g => face(g, hovered)].flatMap(page), ink(shade, 4.5, { L: dark ? .66 : .5, C: nC, H }))
  const eyebrow = fit(page(g => g), mix(shade, label, .6))
  // values: a soft near-black (reference: #4c), held at 7:1 where a value lies darkest, a selected face
  const value = [row, hovered, fill, face].reduce((t, g) => ink(g(shade), 7, t, side), { L: dark ? .93 : .4, C: nC, H })
  const onButton = fit(page(g => face(g, g => g)), label)   /* a button is a face on the bare panel */
  // A placeholder, the tertiary tone (2.9:1 on its row), held the same way on the row and, in a textarea, on its face,
  // at rest and in a hovered or focused row (--row-hover)
  const placeholder = fit([...page(row), ...page(hovered)], tertiary)
  const placeholderOnFace = fit([...page(face), ...page(g => face(g, hovered))], tertiary)
  // and the search field's, which lies on the bare panel in the title
  const placeholderOnPanel = fit(page(g => g), tertiary)

  const chevDown = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 2 L6 6.5 L10.5 2' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const chevUpDown = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 14' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L5 1 L9 5' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M1 9 L5 13 L9 9' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const check = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`

  // --s-clear: how far the step dots keep clear of the label (registered, so it eases as the label fades)
  const overrides = `@property --s-clear { syntax: '<length>'; inherits: true; initial-value: 0px; }
.s-panel {
  ${metrics({ size, spacing, font }, { fontSize: 13, fontFamily: "-apple-system, system-ui, 'SF Pro Display', sans-serif", lineHeight: 18, controlHeight: 36, inset: 11, rowGap: 8.5, columnGap: 12, sectionGap: 12, panelPadding: 12 })}

  /* ── Ink (shade axis only – no accent; every state is lightness/alpha of one ink) ── */
  --bg: ${shade};
  --ink: ${primary};
  --ink-label: ${label};
  --value: ${value};
  --ink-tertiary: ${tertiary};
  --ink-placeholder: ${placeholder};
  --ink-placeholder-face: ${placeholderOnFace};
  --focus: ${focus};

  /* ── Alpha ladder off --ink (DialKit's own cited percentages, theme.css:8-27 / :1762-76) ── */
  --row: ${wash(dark ? 5 : 4)};
  --row-hover: ${wash(dark ? 10 : 8)};
  --row-active: ${wash(dark ? 11 : 10)};
  --border: ${wash(10)};
  --border-hover: ${wash(15)};
  --fill: ${wash(dark ? 15 : 10.5)};
  --edge: ${wash(dark ? 6 : 3)};
  --dot-active: ${wash(45)};
  --mark: ${wash(dark ? 12 : 9)};
  --swatch-edge: inset 0 0 0 1px ${wash(dark ? 30 : 18)};   /* the ink's own: shade on a light panel, light on a dark one */   /* the chosen word of Off / On and of a segmented choice */

  /* ── Scale ── */
  --weight: ${weight};
  --r: calc(8 * var(--length) * ${roundness});
  --r-panel: calc(14 * var(--length) * ${roundness});
  --h: var(--control-height);
  --w: calc(300 * var(--length));
  --shadow: ${dark ? '0 8px 32px rgba(0,0,0,.5)' : '0 4px 20px rgba(0,0,0,.08)'};
  color-scheme: ${dark ? 'dark' : 'light'};

  /* an opaque sheet in a rim of its own colour a step lighter, mostly transparent (reference: the page shows through
     a band round the panel), so any shade keeps its hue in it and the band shows on a ground as dark as the sheet */
  background: var(--bg);
  border-radius: var(--r-panel);
  box-shadow: 0 0 0 calc(7 * var(--length)) color-mix(in oklab, var(--bg), transparent 85%), var(--shadow);
  color: var(--ink-label);
  width: min(100%, var(--w));
  max-width: min(100%, var(--w));
  min-width: 0;
  /* the reference's measure (its light shot, 3.72× a 36px row): rows 11px from the sheet's sides and 12 from its foot,
     the first eyebrow's line 10.5 from its top */
  padding: calc(10.5 * var(--space)) calc(11 * var(--space)) var(--panel-padding);
  -webkit-font-smoothing: antialiased;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Panel title ── */
  > summary, > .s-panel-title {
    font-weight: calc(var(--weight) + 150); font-size: calc(15 * var(--length)); color: var(--value);
    padding: 0 0 calc(8 * var(--space));
    &::after { content: ''; width: calc(11 * var(--length)); height: calc(11 * var(--length)); margin-left: auto; background: var(--ink-tertiary); -webkit-mask: ${chevDown} center / contain no-repeat; mask: ${chevDown} center / contain no-repeat; opacity: .7; transition: transform .15s, opacity .15s; }
    &:hover::after { opacity: 1; }
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: calc(var(--r) / 2); }
  }
  &[open] > summary::after { transform: rotate(180deg); }
  &:is(details):not([open]) > summary { padding-bottom: 0; }   /* folded, the title sits in the middle of the sheet */
  .s-search-input::placeholder { color: ${placeholderOnPanel}; }
  .s-panel-content { gap: var(--row-gap); padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: calc(4 * var(--space)); }

  /* ── Row (the generic pill every leaf control starts from) ── */
  /* a row is a wash with a hairline of slightly more ink around it (reference: a translucent outline on every row) */
  .s-control { background: var(--row); box-shadow: inset 0 0 0 1px var(--edge); border-radius: var(--r); min-height: var(--h); padding: 0 var(--inset); align-items: center; gap: var(--inset); transition: background .15s; }
  .s-control:hover, .s-control:focus-within { background: var(--row-hover); }
  .s-control:has(> .s-input[inert]) { opacity: .5; }
  .s-label-group { width: auto; max-width: 55%; flex: 0 1 auto; min-width: 0; gap: 0; }
  /* a label wraps rather than crop; a slider's, riding on the fill, keeps one line */
  .s-label { font-weight: var(--weight); color: var(--ink-label); overflow-wrap: break-word; }
  .s-slider .s-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .s-hint { display: none; } /* DialKit rows carry no secondary hint line – title (?) still works */
  .s-input { flex: 1 1 auto; justify-content: flex-end; align-items: center; gap: var(--inset); color: var(--value); min-width: 0; }
  /* folders, separators and button rows are no rows: no wash, no hairline, under the pointer neither */
  .s-folder, .s-separator { padding: 0; min-height: 0; }
  :is(.s-folder, .s-separator, .s-button):is(*, :hover, :focus-within) { background: none; box-shadow: none; }
  input, select, textarea, button { font-family: inherit; font-size: inherit; font-variant-numeric: tabular-nums; }
  .s-text input, .s-number input, .s-select.s-dropdown select { height: var(--h); padding-block: 0; }
  button { cursor: pointer; }

  /* ── Slider – the signature: the row IS the instrument ── */
  .s-slider {
    position: relative;
    display: grid; grid-template-columns: 1fr; align-items: stretch; padding: 0; gap: 0;
    /* The fill runs to the value with the row's own rounded end (reference: Size, Width, Radius);
       the hairline handle sits one handle-inset inside it, never nearer the row's start than that. */
    --handle-x: calc(var(--inset) * .45);
    --handle: ${wash(dark ? 35 : 28)};   /* at rest too: the value's place reads without the pointer */
    > .s-label-group, > .s-input { grid-area: 1 / 1; width: 100%; }
    > .s-label-group { z-index: 2; pointer-events: none; flex-direction: row; align-items: center; padding: 0 var(--inset); max-width: 62%; }
    > .s-input { max-width: none; position: relative; padding: 0; align-items: stretch; }
    .s-track { flex: 1; position: relative; display: flex;
      &::before { content: ''; position: absolute; inset: 0 auto 0 0; width: var(--p, 0%); border-radius: var(--r); background: var(--fill); box-shadow: inset 0 0 0 1px var(--edge); pointer-events: none; }
      &::after { content: ''; position: absolute; z-index: 1; top: 50%; left: max(var(--handle-x), calc(var(--p, 0%) - var(--handle-x) - 3px)); width: 3px; height: calc(20 * var(--length)); translate: 0 -50%;
        border-radius: 999px; background: var(--handle); pointer-events: none; transition: background .15s, height .15s; } }
    &:is(:hover, :focus-within) { --handle: ${wash(65)}; }
    /* in hand, the label steps aside only while the handle passes over it */
    > .s-label-group { transition: opacity .15s; }
    &.s-over-label > .s-label-group { opacity: 0; }
    &:has(input:active) { --handle: ${wash(95)}; .s-track::after { height: calc(24 * var(--length)); } }
    /* under the pointer, the steps show as dots along the whole row, under the fill and past it (DialKit's hashmarks,
       as dots), stronger in hand: one at every step, at every tenth past ten. Each step's cell draws half a dot at
       either edge, so neighbouring cells meet in a whole dot on the step; a mask clears the ends, the label and the value,
       its edges midway between dots so no dot is cut. While the handle passes over the label the label steps aside and
       its clearance with it (--s-clear eases to 0 as the label fades, in hand only), so the dots behind it show.
       A slider with marks keeps its own dots. */
    --step-dot: ${wash(dark ? 30 : 25)};
    &:has(input:active) { --step-dot: ${wash(45)}; }
    &:not(.s-multiple, :has(.s-mark)):is(:hover, :has(input:active)) input[type="range"] { --n: min(var(--steps, 100), 10);
      --dot: var(--step-dot) calc(1.5 * var(--length)), transparent calc(1.5 * var(--length) + .5px);
      background: radial-gradient(circle at 0 50%, var(--dot)), radial-gradient(circle at 100% 50%, var(--dot));
      /* each dot stands where the handle stands at that step: the handle's inset and half its width inside the fill's end */
      background-size: calc(100% / var(--n)) 100%; background-repeat: repeat-x; background-position: calc(-1 * var(--handle-x) - 1.5px) 0;
      --cell: calc(100% / var(--n)); --at: calc(var(--handle-x) + 1.5px);   /* dot k stands at k cells less --at */
      --from: calc(round(up, var(--s-clear) + var(--at), var(--cell)) - var(--at) - var(--cell) / 2);
      --to: calc(round(down, min(100% - var(--inset) - 5 * var(--space) - 4ch, var(--s-value-start, 100%) - 4 * var(--space)) + var(--at), var(--cell)) - var(--at) + var(--cell) / 2);
      --along: linear-gradient(to right, transparent var(--from), #000 0 var(--to), transparent 0);
      -webkit-mask: var(--along); mask: var(--along); }
    input[type="range"] { --s-clear: max(2px, var(--s-label-end, 0px) + 4 * var(--space)); }
    &:has(input:active) input[type="range"] { transition: --s-clear .15s; }   /* in hand only: a hover sets it at once */
    &.s-over-label input[type="range"] { --s-clear: 0px; }
    input[type="range"] {
      position: relative;   /* its step dots lie over the fill, as the marks do: under the pointer every step reads alike */
      -webkit-appearance: none; appearance: none; width: 100%; height: 100%; margin: 0; padding: 0;
      border-radius: var(--r); background: none; cursor: pointer;
      &::-webkit-slider-runnable-track { height: 100%; }
      /* the thumb only takes the pointer: fill and handle are drawn from the value itself */
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 3px; height: var(--h); opacity: 0; }
      &::-moz-range-thumb { width: 3px; height: var(--h); border: none; opacity: 0; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
    }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-labels { display: none; } /* DialKit's hashmarks carry no text, dots only */
    /* Step dots mark the steps still ahead: those under the fill, and the end the
       value sits over, are hidden at rest (light reference, Width row); under the pointer all show, over the fill. */
    .s-mark { position: absolute; top: 50%; width: calc(3 * var(--length)); height: calc(3 * var(--length)); border-radius: 50%; transform: translate(-50%, -50%); background: var(--border-hover); transition: background .2s; }
    .s-mark:is(.s-active, .s-last) { visibility: hidden; }
    &:is(:hover, :focus-within) .s-mark.s-active { visibility: visible; }   /* under the pointer, the steps behind too */
    /* clear of the row's start, the label and the value, as the step dots are; the label's while it steps aside */
    .s-mark:is(.s-first, .s-under-value), &:not(.s-over-label) .s-mark.s-under-label { visibility: hidden !important; }
    &:hover .s-mark, &:focus-within .s-mark { background: var(--step-dot); }   /* as the step dots, stronger in hand */
    .s-readout { position: absolute; right: calc(var(--inset) + 5 * var(--space)); top: 50%; transform: translateY(-50%); z-index: 3; pointer-events: auto;
      background: transparent; border: none; padding: 0; field-sizing: content; width: auto; min-width: 1ch; max-width: 7ch; text-align: right;
      font-weight: var(--weight); color: var(--value); cursor: text;
    }
    .s-readout:focus-visible { outline: none; }   /* the caret and the row's wash mark the edit */
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: calc(6 * var(--space)); background: var(--ink); color: var(--bg); padding: calc(2 * var(--space)) calc(6 * var(--space)); border-radius: calc(var(--r) / 2); white-space: nowrap; z-index: 4; }
    /* A range is the same instrument with two handles: the fill spans low to high, a hairline handle stands at
       each end, the label rides on the row and the two values sit at its end, low – high. A press anywhere moves
       the nearer handle. */
    &.s-multiple {
      > .s-input { display: flex; justify-content: flex-end; align-items: center; gap: calc(4 * var(--space)); padding-right: calc(var(--inset) + 5 * var(--space));
        &::before { content: '–'; order: 1; position: relative; z-index: 3; color: var(--ink-label); pointer-events: none; } }
      .s-readout { position: relative; right: auto; top: auto; transform: none; field-sizing: content; min-width: 1ch; }
      .s-readout-hi { order: 2; }
    }
    &.s-multiple .s-interval-track { position: absolute; inset: 0; display: block; height: auto; margin: 0; background: none;
      &::before { content: ''; position: absolute; inset: 0 auto 0 var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); border-radius: var(--r); background: var(--fill); box-shadow: inset 0 0 0 1px var(--edge); pointer-events: none; }
      input[type="range"] { position: absolute; inset: 0; height: 100%;
        &::-webkit-slider-runnable-track { height: 100%; background: none; }
        &::-webkit-slider-thumb { -webkit-appearance: none; width: 3px; height: calc(20 * var(--length)); margin-top: calc((var(--h) - 20 * var(--length)) / 2); border-radius: 999px; background: var(--range-handle); opacity: 1; transition: background .15s, height .15s; }
        &::-moz-range-thumb { width: 3px; height: calc(20 * var(--length)); border: 0; border-radius: 999px; background: var(--range-handle); opacity: 1; }
        &:active::-webkit-slider-thumb { height: calc(24 * var(--length)); margin-top: calc((var(--h) - 24 * var(--length)) / 2); } }
      input.s-top { z-index: 1; }
      /* each handle stands just inside its end of the fill, as the slider's does */
      .s-interval-lo::-webkit-slider-thumb { translate: var(--handle-x) 0; } .s-interval-hi::-webkit-slider-thumb { translate: calc(-1 * var(--handle-x)) 0; }
      .s-interval-lo::-moz-range-thumb { translate: var(--handle-x) 0; } .s-interval-hi::-moz-range-thumb { translate: calc(-1 * var(--handle-x)) 0; }
    }
    &.s-multiple { --range-handle: ${wash(dark ? 40 : 28)}; &:is(:hover, :focus-within) { --range-handle: ${wash(65)}; } &:has(input:active) { --range-handle: ${wash(95)}; } }
  }

  /* ── Boolean: switch (image 1), segmented Off/On (image 2), plus checkbox/toggle ── */
  .s-boolean {
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &.s-checkbox .s-track { width: calc(18 * var(--length)); height: calc(18 * var(--length)); border-radius: calc(var(--r) / 2); background: var(--row-active); display: grid; place-items: center; cursor: pointer; transition: background .15s;
      &::after { content: ''; width: 62%; height: 50%; opacity: 0; background: var(--ink); -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; transition: opacity .1s; }
    }
    &.s-checkbox:has(input:checked) .s-track { background: var(--border-hover); &::after { opacity: 1; } }
    &.s-checkbox:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }

    /* toggle: a key inside the row, the chosen word's height and inset, not the row's own edge */
    &.s-toggle .s-input { margin-right: calc(-6 * var(--space)); }
    &.s-toggle .s-track { height: calc(var(--h) - 12 * var(--length)); border-radius: calc(var(--r) - 2px); cursor: pointer; padding: 0 calc(10 * var(--space)); background: var(--row-active); display: flex; align-items: center; justify-content: center; font-weight: var(--weight); color: var(--ink-label); transition: background .15s, color .15s;
      &::after { content: 'Off'; }
    }
    &.s-toggle:has(input:checked) .s-track { background: var(--border-hover); color: var(--value); &::after { content: 'On'; } }
    &.s-toggle:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }

    /* switch: the reference's own, a knob springing across its track and stretching toward its travel while pressed */
    &.s-switch .s-track {
      width: calc(36 * var(--length)); height: calc(20 * var(--length)); border-radius: 999px; background: var(--row-active); position: relative; cursor: pointer; transition: background .2s;
      --knob: calc(16 * var(--length));
      &::after { content: ''; position: absolute; top: 2px; left: 2px; width: var(--knob); height: calc(16 * var(--length)); border-radius: 999px; background: #fff; transition: left .25s cubic-bezier(.3, 1.4, .5, 1), width .2s ease; ${dark ? '' : 'box-shadow: 0 0 0 1px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.08);'} }
    }
    &.s-switch .s-input:active .s-track { --knob: calc(20 * var(--length)); }
    &.s-switch:has(input:checked) .s-track { background: var(--border-hover); &::after { left: calc(100% - 2px - var(--knob)); } }
    &.s-switch:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }

    /* segmented: the words Off / On at the row's end, the chosen one marked, as a segmented choice is */
    &.s-segmented .s-input { flex: 0 0 auto; margin-left: auto; margin-right: calc(-6 * var(--space)); cursor: pointer; }
    &.s-segmented .s-track {
      display: flex; gap: 2px; border-radius: var(--r); cursor: pointer;
      &::before, &::after { display: grid; place-items: center; height: calc(var(--h) - 12 * var(--length)); padding: 0 calc(9 * var(--space)); border-radius: calc(var(--r) - 2px); font-weight: var(--weight); transition: background .2s, color .15s; }
      &::before { content: 'Off'; color: var(--value); background: var(--mark); }
      &::after { content: 'On'; color: var(--ink-label); }
    }
    &.s-segmented:has(input:checked) .s-track { &::before { color: var(--ink-label); background: none; } &::after { color: var(--value); background: var(--mark); } }
    &.s-segmented:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }
  }

  /* ── Select: dropdown with an up/down chevron (image 1), segmented (image 3), radio/checkboxes.
     The whole row opens the menu; where selects are customizable the menu is the panel's own sheet under the row ── */
  .s-select {
    &.s-dropdown { cursor: pointer; anchor-name: --s-row; anchor-scope: --s-row; }
    &.s-dropdown:has(select:open) { background: var(--row-active); }
    &.s-dropdown select:focus-visible { outline: none; }
    &.s-dropdown:has(select:focus-visible) { outline: 2px solid var(--focus); outline-offset: -2px; }
    &.s-dropdown .s-input { position: relative; flex: 0 1 auto; min-width: 0; margin-left: auto; padding-right: calc(16 * var(--space));
      &::after { content: ''; position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: calc(9 * var(--length)); height: calc(13 * var(--length)); background: var(--ink-tertiary); -webkit-mask: ${chevUpDown} center / contain no-repeat; mask: ${chevUpDown} center / contain no-repeat; pointer-events: none; }
    }
    &.s-dropdown select { flex: 0 1 auto; width: auto; min-width: 0; max-width: 100%; appearance: none; -webkit-appearance: none; background: transparent; border: none; cursor: pointer; color: var(--value); font-weight: var(--weight); text-align: right; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;
      option { background: var(--bg); color: var(--value); }
    }
    @supports (appearance: base-select) {
      &.s-dropdown select { appearance: base-select; display: flex; align-items: center; justify-content: safe flex-end; padding: 0; min-block-size: 0;   /* a value too long for the row starts at its start, not cropped there */
        &::picker-icon { display: none; }
        &::picker(select) { appearance: base-select; position-anchor: --s-row; position-area: bottom; position-try-fallbacks: flip-block; width: anchor-size(width); margin: calc(4 * var(--length)) 0;
          padding: calc(4 * var(--length)); border: 1px solid var(--border); border-radius: var(--r); background: var(--bg); box-shadow: var(--shadow); }
        option { display: flex; align-items: center; gap: calc(8 * var(--space)); min-height: calc(var(--h) - 4 * var(--length)); padding: 0 calc(var(--inset) - 4 * var(--length)); border-radius: calc(var(--r) - 4 * var(--length)); background: none; color: var(--ink-label); font: inherit; font-weight: var(--weight); cursor: pointer; transition: background .15s, color .15s;
          &::checkmark { order: 1; margin-left: auto; content: ''; width: calc(12 * var(--length)); height: calc(10 * var(--length)); background: var(--ink); -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; }
          &:is(:hover, :focus-visible) { background: var(--row-hover); color: var(--value); outline: none; }
          &:checked { color: var(--value); } } } }
    /* segmented: the choices are words at the row's end, the chosen one marked, as the boolean's Off / On */
    /* many choices: a narrower inset each, so they keep one line beside a whole label */
    &.s-segmented .s-input:has(> :nth-child(4)) button { padding: 0 calc(6 * var(--space)); }
    &.s-segmented .s-input { flex-wrap: nowrap; justify-content: flex-end; gap: 2px; margin-right: calc(-6 * var(--space)); min-width: 0; }
    &.s-segmented button { flex: 0 1 auto; min-width: 0; height: calc(var(--h) - 12 * var(--length)); padding: 0 calc(9 * var(--space)); background: transparent; border: none; border-radius: calc(var(--r) - 2px); color: var(--ink-label); font-weight: var(--weight); transition: background .15s, color .15s;
      &:hover { color: var(--value); }
      &.s-selected { background: var(--mark); color: var(--value); }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
    }
    /* lists: the text's label column, the options a column of rows from the row's top inset, as many lines as options */
    &.s-radio, &.s-checkboxes { align-items: flex-start; padding-block: calc((var(--h) - var(--line-height)) / 2);
      > .s-label-group { flex: 0 0 calc(88 * var(--length)); line-height: var(--line-height); }
      .s-input { flex-direction: column; align-items: stretch; justify-content: flex-start; gap: calc(6 * var(--space)); }
      .s-input label { display: flex; align-items: center; gap: calc(8 * var(--space)); min-height: var(--line-height); cursor: pointer; color: var(--value); } }
    &.s-radio input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; width: calc(14 * var(--length)); height: calc(14 * var(--length)); border-radius: 50%; background: var(--row-active); flex-shrink: 0; display: grid; place-items: center; cursor: pointer;
      &::after { content: ''; width: 50%; height: 50%; border-radius: 50%; background: var(--ink); opacity: 0; }
      &:checked::after { opacity: 1; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    }
    &.s-checkboxes .s-track { width: calc(14 * var(--length)); height: calc(14 * var(--length)); border-radius: calc(var(--r) / 2); background: var(--row-active); display: grid; place-items: center; flex-shrink: 0;
      &::after { content: ''; width: 62%; height: 50%; opacity: 0; background: var(--ink); -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; }
    }
    &.s-checkboxes label:has(input:checked) .s-track { background: var(--border-hover); &::after { opacity: 1; } }
    &.s-checkboxes label:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }
  }

  /* ── Color: circular swatch (image 1/2 – DialKit's own source draws a rounded square) ── */
  .s-color {
    &.s-picker .s-color-input, &.s-rgba .s-color-input { justify-content: flex-end; gap: calc(8 * var(--space)); }
    /* a swatch's edge is the ink over its own colour, inside it: no grey ring round it */
    input[type="color"] { width: calc(22 * var(--length)); height: calc(22 * var(--length)); border-radius: 50%; border: none; padding: 0; cursor: pointer;
      &::-webkit-color-swatch-wrapper { padding: 0; border-radius: 50%; overflow: hidden; }
      &::-webkit-color-swatch { border: none; border-radius: 50%; box-shadow: var(--swatch-edge); }
      &::-moz-color-swatch { border: none; border-radius: 50%; box-shadow: var(--swatch-edge); }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    }
    /* the code reads first, then its colour: a value at the row's end, as every other row's is */
    &.s-picker .s-color-input input[type="color"] { position: static; flex: none; order: 1; }
    &.s-picker input[type="text"] { flex: 0 1 auto; width: auto; field-sizing: content; min-width: 7ch; padding: 0; border: none; background: transparent; text-align: right; color: var(--value); font-weight: var(--weight); }
    &.s-rgba .s-alpha { height: calc(6 * var(--length)); border-radius: 999px;
      &::-webkit-slider-thumb { width: calc(12 * var(--length)); height: calc(12 * var(--length)); border-radius: 50%; background: var(--ink); border: 2px solid var(--bg); }
      &::-moz-range-thumb { width: calc(12 * var(--length)); height: calc(12 * var(--length)); border-radius: 50%; background: var(--ink); border: 2px solid var(--bg); }
    }
    &.s-rgba input[type="text"] { flex: 1; min-width: 6ch; background: transparent; border: none; text-align: right; color: var(--ink-label); font-weight: var(--weight); }
    /* swatches wrap at the row's end; the label keeps its word */
    &.s-swatches > .s-label-group { flex: none; }
    &.s-swatches { padding-block: calc(8 * var(--space)); }
    &.s-swatches .s-input { flex-wrap: wrap; justify-content: flex-end; gap: calc(6 * var(--space)); }
    &.s-swatches button { width: calc(18 * var(--length)); height: calc(18 * var(--length)); padding: 0; border-radius: 50%; border: none; box-shadow: var(--swatch-edge);
      &.s-selected { outline: 2px solid var(--ink); outline-offset: 2px; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    }
  }

  /* ── Text / Number / Textarea ── */
  /* text is a field, set from a label column and read from the left (reference: Content); a long value wraps and grows the row,
     five lines at most; focused, the row's wash marks it */
  .s-text { --s-text-wrap: wrap; --text-pad: calc((var(--h) - var(--line-height)) / 2);
    > .s-label-group { flex: 0 0 calc(88 * var(--length)); line-height: var(--line-height); }
    &:has(textarea) { align-items: flex-start; > .s-label-group { padding-block: var(--text-pad); } }
    :is(input[type="text"], textarea) { flex: 1; min-width: 0; background: transparent; border: none; text-align: left; color: var(--value); font-weight: var(--weight);
      &::placeholder { color: var(--ink-placeholder); }
      &:focus-visible { outline: none; } }   /* no underline: the row's focus wash marks the field (DialKit's underline is the replica's) */
    /* the field is the row's height, its lines inset by the row's padding */
    textarea { padding: var(--text-pad) 0; resize: none; field-sizing: content; min-height: var(--h); max-height: calc(5 * var(--line-height) + 2 * var(--text-pad)); line-height: var(--line-height); overflow-wrap: anywhere; scrollbar-width: thin; }
  }
  .s-number input[type="number"] { flex: 1; min-width: 0; background: transparent; border: none; text-align: right; color: var(--value); font-weight: var(--weight); -moz-appearance: textfield;
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    &.s-scrub:not(:focus) { cursor: ew-resize; }
    &:focus-visible { outline: none; }
  }
  /* the steppers are the select's up/down chevron, always shown at its place, close to the value: its upper half steps
     up, its lower down, and each half takes a press anywhere over it, the row's full height */
  .s-number input[type="number"] { padding-right: 0; }
  .s-number .s-step { flex: none; align-self: stretch; display: flex; flex-direction: column; gap: 0; margin-left: calc(2 * var(--space)); opacity: 1;
    button { position: relative; flex: 1; width: calc(17 * var(--length)); height: auto; padding: 0; border: none; font-size: 0; background: none; cursor: pointer;
      &::before { content: ''; position: absolute; left: 50%; translate: -50% 0; width: calc(9 * var(--length)); height: calc(6.5 * var(--length)); background: var(--ink-tertiary);
        -webkit-mask: ${chevUpDown} center top / calc(9 * var(--length)) calc(13 * var(--length)) no-repeat; mask: ${chevUpDown} center top / calc(9 * var(--length)) calc(13 * var(--length)) no-repeat; }
      &.s-step-up::before { bottom: 0; }
      &.s-step-down::before { top: 0; -webkit-mask-position: center bottom; mask-position: center bottom; }
      &:hover::before { background: var(--value); } }
  }
  /* a textarea is text that starts on several lines: the same label column, its lines from the row's top inset, no
     box of its own; code sets them in monospace */
  .s-textarea { --text-pad: calc((var(--h) - var(--line-height)) / 2); align-items: flex-start;
    > .s-label-group { flex: 0 0 calc(88 * var(--length)); line-height: var(--line-height); padding-block: var(--text-pad); }
    textarea { flex: 1; min-width: 0; background: transparent; border: none; border-radius: 0; padding: var(--text-pad) 0; color: var(--value); font-weight: var(--weight); line-height: var(--line-height);
      resize: none; field-sizing: content; min-height: calc(3 * var(--line-height) + 2 * var(--text-pad)); max-height: 50vh; overflow-wrap: anywhere; scrollbar-width: thin;
      &::placeholder { color: var(--ink-placeholder); }
      &:focus-visible { outline: none; }
    }
    &.s-code textarea { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: .92em; }
  }

  /* ── Button ── a key is a row of its own: the row's height and corners, keys a row gap apart */
  .s-button { padding: 0; .s-input { gap: var(--row-gap); } }
  .s-button button { flex: 1; min-height: var(--h); border-radius: var(--r); background: var(--row-active); color: ${onButton}; border: none; font-weight: var(--weight); transition: background .15s, color .15s;
    &:hover { background: var(--border-hover); color: var(--value); }
    &:active { background: var(--border-hover); }
    &:disabled, &[aria-busy="true"] { opacity: .4; cursor: not-allowed; }
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
  }
  .s-button.s-secondary button, .s-button button.s-secondary { background: transparent; box-shadow: inset 0 0 0 1px var(--border); color: var(--ink-label);
    &:hover { background: var(--row-hover); }
  }

  /* ── Info ── read as text is: from the label column */
  .s-info > .s-label-group { flex: 0 0 calc(88 * var(--length)); }
  .s-info .s-monitor { color: var(--value); font-weight: var(--weight); opacity: 1; }

  /* ── Vector ── */
  .s-vector .s-input { flex-wrap: wrap; gap: 0 calc(14 * var(--space)); }
  .s-vector .s-vec-axis { flex: none; min-width: 0; gap: calc(6 * var(--space)); height: var(--h); background: none; padding: 0; }
  .s-vector .s-vec-label { color: var(--ink-label); font-size: inherit; opacity: 1; }
  .s-vector input[type="number"] { min-width: 3ch; padding: 0; background: transparent; border: none; text-align: right; color: var(--value); font-weight: var(--weight);
    &:focus-visible { outline: none; } }
  .s-vector .s-vec-expand { flex: none; background: var(--ink-tertiary); opacity: .7; &:hover, &.s-open { opacity: 1; } }
  /* an open pad takes the row's width under its label and values */
  .s-vector:has(.s-pad) { flex-wrap: wrap; row-gap: 0; padding-bottom: var(--inset);
    > .s-label-group { flex: 1 1 0; max-width: none; min-height: var(--h); display: flex; flex-direction: row; align-items: center; justify-content: flex-start; }
    .s-vec-expand { align-self: center; }
    > .s-input { display: contents; }
    &::after { content: ''; flex: 0 0 100%; order: 1; }   /* a line break: the pad starts its own line */
    .s-pad { flex: none; order: 2; margin-left: auto; } }   /* at the row's end, as the XY pad stands */

  /* ── XY pad / Knob ── the pad is the row's own surface, a faint grid and the dot */
  /* three rows tall, as wide as its ratio allows within the row */
  .s-pad { --grid: ${wash(dark ? 9 : 8)}; width: auto; max-width: 100%; height: calc(3 * var(--h)); aspect-ratio: var(--pad-ratio, 1.6); border: 0; border-radius: calc(var(--r) - 2px); box-shadow: inset 0 0 0 1px var(--grid);
    background: linear-gradient(90deg, var(--grid) 1px, transparent 1px) -1px 0 / calc(100% / 6) 100%, linear-gradient(var(--grid) 1px, transparent 1px) 0 -1px / 100% calc(100% / 4);
    .s-pad-x, .s-pad-y { display: none; }
    .s-pad-dot { width: calc(12 * var(--length)); height: calc(12 * var(--length)); background: var(--ink); box-shadow: 0 0 0 2px var(--bg); }
  }
  .s-pad-val { color: var(--ink-tertiary); }
  .s-knob-dial { background: var(--row-active); border: 1px solid var(--border); i { background: var(--ink); } }
  /* a knob and an XY pad stand inside their row, inset all round as its text is from the sides */
  .s-knob, .s-xy { padding-block: calc(8 * var(--space)); }
  .s-knob .s-input { justify-content: flex-end; align-items: center; gap: calc(8 * var(--space)); }
  .s-xy { align-items: flex-start; > .s-label-group { padding-top: calc((var(--h) - var(--line-height)) / 2 - 8 * var(--space)); } .s-input { justify-content: flex-end; } }
  .s-knob-val { color: var(--value); font-weight: var(--weight); opacity: 1; text-align: right; }

  /* ── Folder: DialKit's real group title – sentence case, chevron (dark reference: Enter/Exit/Dividers) ── */
  .s-folder {
    > summary { font-weight: calc(var(--weight) + 100); font-size: calc(13 * var(--length)); letter-spacing: -0.01em; color: var(--ink-label); padding: calc(8 * var(--space)) 0; cursor: pointer;
      &::after { content: ''; width: calc(10 * var(--length)); height: calc(10 * var(--length)); margin-left: auto; background: var(--ink-tertiary); opacity: .8; -webkit-mask: ${chevDown} center / contain no-repeat; mask: ${chevDown} center / contain no-repeat; transition: transform .15s, opacity .15s; }
      &:hover::after { opacity: 1; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: calc(var(--r) / 2); }
    }
    &[open] > summary::after { transform: rotate(180deg); }
    .s-content { gap: var(--row-gap); padding: 0 0 calc(2 * var(--space)); }
  }

  /* ── Separator: uppercase tracked eyebrow – non-interactive (light reference: TEXT/LAYOUT/PATH) ── */
  .s-separator { height: 1px; background: var(--border); opacity: 1; margin: calc(4 * var(--space)) 0; }
  /* an eyebrow opens its section 17px under the row before it, the row gap under it; the first sits at the top */
  .s-separator-labeled { height: auto; margin: 0; background: none; padding: calc(17 * var(--space)) 0 0; &:first-child { padding-top: 0; }
    &::before, &::after { display: none; }
  }
  .s-separator-label { font-size: calc(11 * var(--length)); font-weight: calc(var(--weight) + 100); text-transform: uppercase; letter-spacing: .06em; color: ${eyebrow}; opacity: 1; white-space: normal; }
}
@media (forced-colors: active) { .s-panel { --focus: Highlight; } }`

  return baseCSS + '\n' + overrides
}
