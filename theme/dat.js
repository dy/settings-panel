/**
 * dat — calibrated to dat.gui / lil-gui
 *
 * Custom shades derive missing color roles; explicit role axes take precedence.
 *
 * The classic out-of-the-way inspector: an ultra-narrow near-black panel with a
 * darker title bar, cyan-tinted numeric widgets, and the signature thumbless
 * slider where a colored fill-bar IS the position indicator.
 * Ref: https://lil-gui.georgealways.com/
 *
 * Axes: shade (panel bg), accent (number-widget hue), title (header bar bg),
 * widget (control surface) and text (label/value color) — everything else
 * derives from them. Hover/focus tints and the darker "menu"/"secondary"
 * panel tones lighten or darken --widget (color-mix, live in CSS so they
 * track a widget override). `string` (lil-gui's fixed green for
 * string-type fields) and `ink` (the tooltip/separator/swatch-border true
 * black) are lil-gui's own hardcoded constants — not derivable from the
 * other axes, but still exposed as overridable tokens per the architecture.
 *
 * Rows are spaced by collapsing 4px margins in block flow, as in lil-gui, so a
 * collapsed folder, a row after a folder and nested folders keep its rhythm.
 * The ▾ ▸ ✓ ↕ glyphs are drawn from lil-gui's own icon font in --text.
 *
 * dat(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveAccent, resolveRoles, contrast, ink, mix } from './color.js'

// lil-gui's icon font (MIT, lil-gui 0.19): title chevrons, checkbox mark, select arrow
const glyphs = `@font-face { font-family: "lil-gui"; src: url("data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAUsAAsAAAAACJwAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAAH4AAADAImwmYE9TLzIAAAGIAAAAPwAAAGBKqH5SY21hcAAAAcgAAAD0AAACrukyyJBnbHlmAAACvAAAAF8AAACEIZpWH2hlYWQAAAMcAAAAJwAAADZfcj2zaGhlYQAAA0QAAAAYAAAAJAC5AHhobXR4AAADXAAAABAAAABMAZAAAGxvY2EAAANsAAAAFAAAACgCEgIybWF4cAAAA4AAAAAeAAAAIAEfABJuYW1lAAADoAAAASIAAAIK9SUU/XBvc3QAAATEAAAAZgAAAJCTcMc2eJxVjbEOgjAURU+hFRBK1dGRL+ALnAiToyMLEzFpnPz/eAshwSa97517c/MwwJmeB9kwPl+0cf5+uGPZXsqPu4nvZabcSZldZ6kfyWnomFY/eScKqZNWupKJO6kXN3K9uCVoL7iInPr1X5baXs3tjuMqCtzEuagm/AAlzQgPAAB4nGNgYRBlnMDAysDAYM/gBiT5oLQBAwuDJAMDEwMrMwNWEJDmmsJwgCFeXZghBcjlZMgFCzOiKOIFAB71Bb8AeJy1kjFuwkAQRZ+DwRAwBtNQRUGKQ8OdKCAWUhAgKLhIuAsVSpWz5Bbkj3dEgYiUIszqWdpZe+Z7/wB1oCYmIoboiwiLT2WjKl/jscrHfGg/pKdMkyklC5Zs2LEfHYpjcRoPzme9MWWmk3dWbK9ObkWkikOetJ554fWyoEsmdSlt+uR0pCJR34b6t/TVg1SY3sYvdf8vuiKrpyaDXDISiegp17p7579Gp3p++y7HPAiY9pmTibljrr85qSidtlg4+l25GLCaS8e6rRxNBmsnERunKbaOObRz7N72ju5vdAjYpBXHgJylOAVsMseDAPEP8LYoUHicY2BiAAEfhiAGJgZWBgZ7RnFRdnVJELCQlBSRlATJMoLV2DK4glSYs6ubq5vbKrJLSbGrgEmovDuDJVhe3VzcXFwNLCOILB/C4IuQ1xTn5FPilBTj5FPmBAB4WwoqAHicY2BkYGAA4sk1sR/j+W2+MnAzpDBgAyEMQUCSg4EJxAEAwUgFHgB4nGNgZGBgSGFggJMhDIwMqEAYAByHATJ4nGNgAIIUNEwmAABl3AGReJxjYAACIQYlBiMGJ3wQAEcQBEV4nGNgZGBgEGZgY2BiAAEQyQWEDAz/wXwGAAsPATIAAHicXdBNSsNAHAXwl35iA0UQXYnMShfS9GPZA7T7LgIu03SSpkwzYTIt1BN4Ak/gKTyAeCxfw39jZkjymzcvAwmAW/wgwHUEGDb36+jQQ3GXGot79L24jxCP4gHzF/EIr4jEIe7wxhOC3g2TMYy4Q7+Lu/SHuEd/ivt4wJd4wPxbPEKMX3GI5+DJFGaSn4qNzk8mcbKSR6xdXdhSzaOZJGtdapd4vVPbi6rP+cL7TGXOHtXKll4bY1Xl7EGnPtp7Xy2n00zyKLVHfkHBa4IcJ2oD3cgggWvt/V/FbDrUlEUJhTn/0azVWbNTNr0Ens8de1tceK9xZmfB1CPjOmPH4kitmvOubcNpmVTN3oFJyjzCvnmrwhJTzqzVj9jiSX911FjeAAB4nG3HMRKCMBBA0f0giiKi4DU8k0V2GWbIZDOh4PoWWvq6J5V8If9NVNQcaDhyouXMhY4rPTcG7jwYmXhKq8Wz+p762aNaeYXom2n3m2dLTVgsrCgFJ7OTmIkYbwIbC6vIB7WmFfAAAA==") format("woff"); }`

export default function dat({
  shade = '#1f1f1f',
  accent = '#2cc9ff',
  title,
  widget,
  text,
  size = 1,
  spacing = 1,
  font,
} = {}) {
  const native = shade === '#1f1f1f'
  const roles = resolveRoles(shade)
  title ??= native ? '#111111' : roles.surface
  widget ??= native ? '#424242' : roles.surface2
  text ??= native ? '#ebebeb' : roles.fg

  const acc = resolveAccent(accent, shade)
  // Text the original never drew, at 4.5:1 (WCAG 1.4.3): the hint (--hint at 60%, 2.5:1) and a
  // labeled separator's label (text at 24% on its 40% ink band, 2.3:1) keep their tone, lifted to pass
  const hint = ink(shade, 4.5, mix(shade, text, .308824))
  const band = mix(shade, '#000', .4)
  const sepLabel = ink(band, 4.5, mix(shade, mix('#000', text, .6), .4))
  // and a placeholder, drawn in the hint (2.8:1 on its widget), lifted the same way on each face of
  // its widget: at rest, hovered and focused (6.88% and 12.17% white, below)
  const placeholder = [0, .06878307, .12169312].reduce((t, a) => ink(mix(widget, '#fff', a), 4.5, t), mix(shade, text, .514706))
  // The search field's lies on the title bar, which a hover shows at 85% over the panel, text and all
  // (the browser's composite lands a level off the exact blend, so it is held to 4.6:1 there)
  let reach = 4.5
  const veiled = t => contrast(mix(shade, t, .85), mix(shade, title, .85))
  while (reach < 21 && veiled(ink(title, reach, mix(shade, text, .514706))) < 4.6) reach += .05
  const searchPlaceholder = ink(title, reach, mix(shade, text, .514706))

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, {fontSize: 11, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", lineHeight: 15.95, controlHeight: 20, inset: 4, rowGap: 4, columnGap: 0, sectionGap: 4, panelPadding: 0})}

  --bg: ${shade};
  --accent: ${acc};
  --title: ${title};
  --widget: ${widget};
  --text: ${text};
  --hint: color-mix(in srgb, var(--text), var(--bg) 48.529412%);
  --widget-hover: color-mix(in srgb, var(--widget), white 6.878307%);
  --widget-focus: color-mix(in srgb, var(--widget), white 12.169312%);
  --menu: color-mix(in srgb, var(--widget), black 36.363636%);
  --widget-secondary: color-mix(in srgb, var(--widget), black 22.727273%);
  --string: ${roles.dark ? '#a2db3c' : text};
  --ink: #000;
  --mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;

  --weight: 400;
  --r: calc(2 * var(--length));
  --title-height: calc(var(--control-height) + 5 * var(--space));
  color-scheme: ${roles.dark ? 'dark' : 'light'};

  background: var(--bg);
  color: var(--text);

  width: calc(245 * var(--length));
  min-width: 0;
  max-width: calc(245 * var(--length));
  border-radius: 0;
  padding: var(--panel-padding);

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Title bar and folder titles (lil-gui .title: 25px tall, text on a 21px line from the top, glyph chevron) ── */
  > summary, > .s-panel-title {
    background: var(--title);
    color: var(--text);
  }
  .s-search-input::placeholder { color: ${searchPlaceholder}; }
  > summary, > .s-panel-title, .s-folder > summary {
    font-weight: 600;
    padding: 0 calc(4 * var(--space));
    min-height: var(--title-height);
    line-height: calc(var(--title-height) - 4 * var(--length));
    align-items: baseline;
    &::before { content: '▾'; font-family: 'lil-gui'; padding-right: calc(2 * var(--length)); display: inline-block; }
  }
  &:not([open]) > summary::before, .s-folder:not([open]) > summary::before { content: '▸'; }
  > summary:active, .s-folder > summary:active { background: var(--title); opacity: .75; }
  @media (hover: hover) { > summary:hover, .s-folder > summary:hover { background: var(--title); opacity: .85; } }
  /* lil-gui underlines a focused folder title, clicked or tabbed; its root title shows nothing, here it keeps a keyboard-only underline */
  > summary:focus-visible, .s-folder > summary:focus { outline: none; text-decoration: underline var(--widget-focus); }
  /* lil-gui .root > .children: margins of the first and last row stay inside, overflowing names clip */
  .s-panel-content { display: flow-root; padding: 0; overflow-x: clip; }

  /* ── Row (lil-gui .controller: 20px tall, 4px side padding, 4px collapsing margins, 45% name) ── */
  .s-control {
    gap: var(--column-gap);
    margin: var(--row-gap) 0;
    padding: 0 calc(4 * var(--space));
    min-height: var(--control-height);
    align-items: center;
    /* Disabled: dim the whole row (lil-gui .controller.disabled), not just the widget — .s-input[inert] is the only disabled hook base.js exposes */
    &:has(> .s-input[inert]) .s-label-group { opacity: .5; }
  }
  .s-label-group { flex: 0 0 auto; width: auto; min-width: 45%; max-width: none; padding: 0 calc(4 * var(--space)) 0 0; line-height: var(--control-height); overflow: visible; }
  .s-label { color: var(--text); font-weight: 400; white-space: nowrap; overflow: visible; }
  .s-hint { color: ${hint}; opacity: 1; font-size: calc(10 * var(--length)); }
  .s-input { flex: 1 1 auto; min-width: 0; gap: calc(4 * var(--space)); align-items: center; }

  /* ── Widgets (inputs / select) ── */
  input[type="text"], input[type="number"], select {
    background: var(--widget);
    color: var(--accent);
    border: none;
    border-radius: var(--r);
    height: var(--control-height);
    padding: 0 0 0 calc(3 * var(--space));
    font: inherit;
    line-height: normal;
    &::placeholder { color: ${placeholder}; }
    &:hover { background: var(--widget-hover); }
    &:active, &:focus { background: var(--widget-focus); outline: none; }
  }
  .s-text input[type="text"] { flex: 1; }
  .s-text input[type="text"], .s-textarea textarea { color: var(--string); }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: left; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-step { display: none; }
  }

  /* ── Slider: thumbless fill-bar + cyan number ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(14 * var(--space)); }
    .s-track { height: var(--control-height); margin: 0; }
    input[type="range"] {
      width: 100%; height: var(--control-height); -webkit-appearance: none; appearance: none; cursor: ew-resize;
      border-radius: var(--r);
      background: var(--widget);
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(2 * var(--length)); height: var(--control-height); background: var(--accent); cursor: ew-resize; }
      &::-moz-range-thumb { width: calc(2 * var(--length)); height: var(--control-height); border: none; border-radius: 0; background: var(--accent); cursor: ew-resize; }
      &:hover { background: var(--widget-hover); }
      &:active, &:focus-visible { background: var(--widget-focus); outline: none; }
    }
    .s-marks { display: none; }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: calc(10 * var(--length)); color: var(--hint); white-space: nowrap; }
    .s-readout {
      flex: 0 0 auto; width: 27%; min-width: calc(45 * var(--length)); text-align: left;
      background: var(--widget); color: var(--accent); border: none; border-radius: var(--r);
      height: var(--control-height); padding: 0 0 0 calc(3 * var(--space));
      &:hover { background: var(--widget-hover); } &:active, &:focus { background: var(--widget-focus); outline: none; }
    }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: calc(2 * var(--length)); background: var(--ink); color: var(--accent); padding: calc(1 * var(--length)) calc(5 * var(--space)); border-radius: calc(2 * var(--length)); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: var(--control-height); margin: calc(3 * var(--space)) 0; border-radius: var(--r); background: var(--widget); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); }
      &:hover { background: var(--widget-hover); } &:has(:active, :focus-visible) { background: var(--widget-focus); }
      input[type="range"] { background: none; } }
  }

  /* ── Select / dropdown ── */
  .s-select {
    /* lil-gui .option .display: as wide as the current value, ↕ glyph over the right padding, hover anywhere on the widget */
    &.s-dropdown .s-input { justify-content: flex-start; gap: 0;
      &::after { content: '↕'; font-family: 'lil-gui'; flex: none; width: 1.75em; margin-left: -1.75em; padding-right: .375em; text-align: right; line-height: var(--control-height); color: var(--text); pointer-events: none; }
      &:hover select { background: var(--widget-hover); } }
    &.s-dropdown select { flex: 0 1 auto; width: auto; field-sizing: content; max-width: 100%; appearance: none; -webkit-appearance: none; cursor: pointer; color: var(--text); padding: 0 1.75em 0 0.55em; line-height: var(--control-height);
      option { background: var(--menu); color: var(--text); } }
    &.s-segmented { .s-input { gap: calc(1 * var(--length)); } button { flex: 1; background: var(--widget); border: none; color: var(--text); padding: calc(3 * var(--space)); &:hover { background: var(--widget-hover); } &.s-selected { background: var(--accent); color: var(--ink); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(3 * var(--space)); padding: calc(3 * var(--space)) 0; } .s-input label { display: flex; align-items: center; gap: calc(6 * var(--space)); cursor: pointer; } }
  }

  /* ── Checkbox: widget-colored square (0.75 × widget height) with a text-colored ✓ glyph; the checkboxes list draws it on .s-track ── */
  .s-boolean input[type="checkbox"], .s-checkboxes .s-track { -webkit-appearance: none; appearance: none; flex: none; width: calc(.75 * var(--control-height)); height: calc(.75 * var(--control-height)); margin: 0; background: var(--widget); color: var(--text); border-radius: var(--r); font: inherit; line-height: normal; text-align: center; cursor: pointer; }
  .s-boolean input[type="checkbox"]:checked::before, .s-checkboxes input:checked + .s-track::before { content: '✓'; font-family: 'lil-gui'; font-size: calc(.75 * var(--control-height)); line-height: calc(.75 * var(--control-height)); }
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { position: static; opacity: 1; outline: none;
      &:hover { background: var(--widget-hover); }
      &:active { background: var(--widget-focus); }
      &:focus { box-shadow: inset 0 0 0 1px var(--widget-focus); } }
    .s-track { display: none; }
    /* switch/toggle fall back to a checkbox-ish look via the native input above */
    &.s-switch .s-input, &.s-toggle .s-input { gap: calc(6 * var(--space)); }
  }
  .s-checkboxes { label:hover .s-track { background: var(--widget-hover); } input:focus-visible + .s-track { box-shadow: inset 0 0 0 1px var(--widget-focus); } }

  /* ── Color: full-width swatch + hex (lil-gui: 27% / 45px mono field; it grows to fit a '#rrggbb' value instead of clipping it) ── */
  .s-color {
    .s-color-input { gap: calc(4 * var(--space)); }
    /* rounded once, by the input's own clip: a second radius on the swatch would antialias the corners twice */
    input[type="color"] { position: static; height: var(--control-height); padding: 0; border: none; border-radius: var(--r); overflow: hidden; background: none; cursor: pointer;
      &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } &::-moz-color-swatch { border: none; }
      &:hover { outline: 1px solid #fff9; outline-offset: -1px; } }
    .s-color-input input[type="text"] { flex: 0 0 auto; width: max(27%, calc(7ch + 4 * var(--space))); background: var(--widget); color: var(--text); border-radius: var(--r); font-family: var(--mono); padding: 0 0 0 calc(3 * var(--space)); height: var(--control-height);
      @supports (field-sizing: content) { field-sizing: content; width: auto; min-width: max(27%, calc(45 * var(--length))); } }
    &.s-picker input[type="color"] { flex: 1; min-width: 0; }
    /* rgba: fixed swatch, the alpha slider takes what the hex field leaves */
    &.s-rgba { input[type="color"] { flex: none; width: calc(28 * var(--length)); } .s-alpha { min-width: 0; } }
    &.s-swatches { .s-input { flex-wrap: wrap; } button { width: calc(18 * var(--length)); height: calc(18 * var(--length)); border-radius: var(--r); border: 1px solid var(--ink); &.s-selected { outline: 1px solid var(--accent); } } }
  }

  /* ── Button ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    button { width: 100%; background: var(--widget); color: var(--text); border: none; border-radius: var(--r); height: var(--control-height); padding: 0; line-height: normal; outline: none;
      &:hover { background: var(--widget-hover); } &:focus { box-shadow: inset 0 0 0 1px var(--widget-focus); } &:active { background: var(--widget-focus); } }
    &.s-secondary button, button.s-secondary { background: var(--widget-secondary); }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; background: var(--widget); border: none; border-radius: var(--r); resize: vertical; field-sizing: content; min-height: calc(40 * var(--length)); max-height: 50vh; padding: calc(4 * var(--space)) calc(5 * var(--space)); &::placeholder { color: ${placeholder}; } } &.s-code textarea { font-family: var(--mono); } }

  /* ── Folder (lil-gui: 1px widget rules above and below the title, the lower one fades out when closed) ── */
  .s-folder {
    margin: 0;
    padding: 0;
    /* inline title, as in lil-gui: the focus underline skips the inline-block chevron */
    > summary { display: block; color: var(--text); border: 0 solid var(--widget); border-width: 1px 0; transition: border-color 300ms; &::after { display: none; } }
    &:not([open]) > summary { border-bottom-color: transparent; }
    > .s-content { display: block; }
  }
  /* Row after a folder: no top margin, 4px padding and, at the root, a divider (lil-gui .lil-gui + .controller) */
  .s-folder + .s-control:not(.s-folder) { margin-top: 0; padding-top: calc(4 * var(--space)); }
  .s-panel-content > .s-folder + .s-control:not(.s-folder) { border-top: 1px solid var(--widget); }
  /* Nested folder: borderless title, children indented behind a 2px widget rule */
  .s-folder .s-folder { > summary { border: none; } > .s-content { margin-left: calc(7 * var(--space)); border-left: calc(2 * var(--length)) solid var(--widget); } }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: var(--accent); font-variant-numeric: tabular-nums; }
  .s-separator { background: var(--ink); opacity: .4; }
  /* a labeled separator is a 40% ink band: painted as such, not by opacity, so its label can reach 4.5:1 */
  .s-separator-labeled { background: color-mix(in srgb, var(--ink) 40%, transparent); opacity: 1; &::before, &::after { opacity: .06; } }
  .s-separator-label { color: ${sepLabel}; opacity: 1; }
}`

  return baseCSS + '\n' + glyphs + '\n' + overrides
}
