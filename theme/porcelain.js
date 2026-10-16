/**
 * Porcelain — a glazed ceramic face seated in a pale mineral frame.
 * The rim is structural; the flowing relief is baked into the face, not glass.
 * bevel scales the lip, grain the relief, and shade tints the ceramic body.
 */
import metrics, { scale } from './metrics.js'
import baseCSS from './base.js'
import { resolveRoles, ink, mix } from './color.js'

export default function porcelain({
  shade = '#f4f6f5', accent = '#526e73', spacing = 1.2,
  weight = 500, roundness = 1, size = 1, bevel = 1, grain = 1,
  font,
} = {}) {
  const { dark, fg, fgMuted, accent: acc, onAccent } = resolveRoles(shade, accent)
  const svg = (body, width = 240) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}">${body}</svg>`)}")`
  const waves = Array.from({ length: 39 }, (_, i) => {
    const y = i * 8 - 32
    return `M-40 ${y} Q20 ${y - 35} 80 ${y} T200 ${y} T320 ${y}`
  }).join(' ')
  const relief = grain <= 0 ? 'none' : svg(`<filter id="r" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence baseFrequency=".015 .012" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="42"/></filter><g filter="url(#r)" fill="none" stroke-width="1" opacity="${Math.min(grain, 2) * (dark ? .02 : .055)}"><path stroke="#91a7aa" d="${waves}"/><path stroke="white" transform="translate(0 1.4)" d="${waves}"/></g>`)
  const mineral = svg('<filter id="m"><feTurbulence type="fractalNoise" baseFrequency=".025 .012" numOctaves="4" seed="12"/><feColorMatrix values="0 0 0 0 .52 0 0 0 0 .65 0 0 0 0 .64 1 0 0 0 0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .05 .3 .12 .03 .18 .5 .1 .4 0"/></feComponentTransfer></filter><path filter="url(#m)" d="M0 0h240v240H0z"/>')
  // Type: one body size (14px native) for labels, values, buttons and folder titles; labels, buttons,
  // folders and the title are set in Georgia, values in the system sans. One secondary step (12px
  // native) for hints, readouts, mark labels, tooltips and separator labels; the title one larger (1.4em).
  const body = 14
  const lip = `${Math.max(0, bevel) * 5 * scale(size, body)}px`
  const well = 'inset 0 1px calc(2 * var(--length)) color-mix(in oklab, var(--fg), transparent 77%), 0 1px 0 var(--glaze)'
  const raised = 'inset 0 1px 0 var(--glaze), inset 0 -1px 0 color-mix(in oklab, var(--fg), transparent 90%), 0 1px calc(2 * var(--length)) color-mix(in oklab, var(--fg), transparent 85%)'
  // One slider: every range input (slider, interval, the colour's alpha) has this groove and glazed thumb
  const thumb = 'width: calc(14 * var(--length)); height: calc(22 * var(--length)); border: 1px solid #8ca0a355; border-radius: calc(3 * var(--length)); background: linear-gradient(90deg, var(--glaze), var(--bg)); box-shadow: ' + raised + ';'
  const range = `appearance: none; height: calc(6 * var(--length)); border-radius: calc(2 * var(--length)); box-shadow: ${well}; cursor: ew-resize;
      &::-webkit-slider-thumb { appearance: none; ${thumb} }
      &::-moz-range-thumb { ${thumb} }`
  const arrow = svg(`<path d="m3 4 3 3 3-3" fill="none" stroke="${fgMuted}" stroke-width="1.3"/>`, 12)
  // Placeholders: the browser's grey (#757575, 3.9:1 on the field) held to 4.5:1 on the field's well,
  // the shade with 4% of the ink (itself 45% accent), mixed in OKLab as color-mix() does
  const lettering = mix(fg, acc, .45, 'oklab')
  const placeholder = ink(mix(shade, lettering, .04, 'oklab'), 4.5, '#757575')
  // A labelled separator wears the rule's 10% of the ink as a band (painted up to a level nearer the ink
  // than the exact blend, its alpha being 8-bit); its label, the base's .6 of the ink (3.3:1 there), moves
  // away from the band, lightness only, until it reads 4.5:1
  const band = mix(shade, lettering, .1)
  const painted = '#' + [1, 3, 5].map(i => { const v = parseInt(band.slice(i, i + 2), 16); return (v + Math.sign(parseInt(lettering.slice(i, i + 2), 16) - v)).toString(16).padStart(2, '0') }).join('')
  const ruleLabel = ink(painted, 4.5, mix(band, lettering, .6))

  return baseCSS + `
.s-panel {
  ${metrics({ size, spacing, font }, { body, controlHeight: 34, rowGap: 20, sectionGap: 20, panelPadding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"})}

  --bg: ${shade}; --accent: ${acc}; --fg: color-mix(in oklab, ${fg}, ${acc} 45%); --fg-muted: ${fgMuted};
  --label-ink: ${dark ? `color-mix(in oklab, ${acc}, white 50%)` : acc};
 --spacing: ${spacing}; --weight: ${weight}; --roundness: ${roundness};
  --r: calc(var(--u) * var(--roundness) * 1.5);
  --r-panel: calc(var(--u) * var(--roundness) * 5);
  --h: var(--control-height);
  --glaze: ${dark ? 'oklch(from var(--bg) calc(l + .09) c h)' : '#fff'};
  --well: color-mix(in oklab, var(--bg), var(--fg) 4%);
  --placeholder: ${placeholder};
  --font: var(--font-family);
  --font-size-small: calc(12 * var(--length));
   font-weight: var(--weight); color: var(--fg);
  color-scheme: ${dark ? 'dark' : 'light'};
  position: relative; isolation: isolate; min-width: 0;
  padding: var(--panel-padding);
  border: calc(var(--u) * 2.25) solid transparent;
  border-radius: var(--r-panel);
  background: ${relief} padding-box, linear-gradient(var(--bg), var(--bg)) padding-box,
    ${mineral} border-box, linear-gradient(135deg, #cbd8d3, #eef2e6 38%, #b7cac8 70%, #d5ddd0) border-box;
  box-shadow: inset 0 0 0 1px var(--glaze), 0 1px 1px #fff, 0 -1px calc(2 * var(--length)) #6f888a66, 0 calc(4 * var(--length)) calc(10 * var(--length)) #617f8314;
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  &::before { content: ''; position: absolute; inset: 0; pointer-events: none;
    border: ${lip} solid var(--glaze); border-right-color: var(--well); border-bottom-color: var(--well);
    border-radius: max(0px, calc(var(--r-panel) - var(--u) * 2.25));
    box-shadow: 0 0 0 1px #ffffff90;
  }
  > summary, > .s-panel-title { min-height: var(--h); gap: calc(var(--u) * 2); font: 600 1.4em/1.2 Georgia, serif; letter-spacing: -.025em; color: var(--label-ink); text-shadow: 0 1px var(--glaze); }
  > summary { flex-wrap: wrap; }
  .s-panel-content { gap: var(--row-gap); }
  > .s-panel-content { padding-top: calc(var(--u) * 5); }
  .s-control { align-items: center; gap: var(--column-gap); }
  .s-label-group { min-width: 0; width: 29%; }
  .s-label { font-family: Georgia, serif; color: var(--label-ink); text-shadow: 0 1px var(--glaze); }
  .s-hint { color: var(--fg-muted); opacity: 1; }
  :is(.s-hint, .s-readout, .s-mark-label, .s-tooltip, .s-separator-label, .s-knob-val, .s-pad-val, .s-vec-label, .s-title-text) { font-size: var(--font-size-small); }
  .s-input { align-items: center; }
  .s-fold-icon { margin-left: auto; width: calc(12 * var(--length)); height: calc(12 * var(--length)); background: currentColor; mask: ${arrow} center / contain no-repeat; }
  &[open] .s-fold-icon { transform: rotate(180deg); }
  .s-search { font: 500 var(--font-size)/1.3 var(--font); }
  .s-search-input { width: 12ch; padding: var(--u); }
  :is(input, select, textarea, button):focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  input[type=text], input[type=number], textarea, select { flex: 1; background: var(--well); border: 1px solid color-mix(in oklab, var(--fg), transparent 89%); border-radius: var(--r); box-shadow: ${well}; }
  input[type=text], input[type=number], select { height: var(--h); padding: 0 calc(var(--u) * 2.5); }
  :is(input, textarea)::placeholder { color: var(--placeholder); }
  :is(.s-number, .s-vector) input[type=number] { appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { appearance: none; margin: 0; } }
  textarea { resize: vertical; min-height: calc(var(--h) * 2); padding: calc(var(--u) * 2); }
  select { appearance: none; background-image: ${arrow}; background-position: right calc(8 * var(--length)) center; background-size: calc(12 * var(--length)); background-repeat: no-repeat; padding-right: calc(26 * var(--length)); }
  select option { background: var(--bg); }
  button { color: var(--fg); background: linear-gradient(var(--glaze), var(--bg)); border: 1px solid color-mix(in oklab, var(--fg), transparent 83%); border-radius: var(--r); box-shadow: ${raised}; }
  button:hover { filter: brightness(${dark ? 1.1 : .98}); }
  button:active { box-shadow: ${well}; }
  button:disabled, button[aria-busy=true] { opacity: .5; cursor: not-allowed; }
  .s-search-btn { box-shadow: none; border: 0; border-radius: 0; background: currentColor; }
  .s-button {
    .s-input { gap: calc(var(--u) * 3); }
    button { flex: 1; min-width: 0; min-height: var(--h); padding: calc(var(--u) * 2); font-family: Georgia, serif;
      background: linear-gradient(color-mix(in oklab, var(--accent), #000 12%), var(--accent)); color: ${onAccent};
      text-shadow: 0 1px 1px #0004; box-shadow: inset 0 1px calc(2 * var(--length)) #0005, 0 1px 0 var(--glaze);
      &:active { background: var(--accent); box-shadow: inset 0 calc(2 * var(--length)) calc(4 * var(--length)) #0006; }
    }
    &.s-secondary button, button.s-secondary { background: linear-gradient(var(--glaze), var(--bg)); color: var(--label-ink); text-shadow: 0 1px var(--glaze); box-shadow: ${raised}; &:active { background: var(--well); box-shadow: ${well}; } }
  }
  .s-select.s-segmented {
    .s-input { gap: calc(4 * var(--length)); }
    button { min-width: 0; flex: 1 1 auto; height: var(--h); padding: 0 calc(var(--u) * 2.5); white-space: nowrap; }   /* each label its width and an equal share; the fields' inset */
    button.s-selected { color: var(--label-ink); background: var(--well); box-shadow: ${well}; }
  }
  .s-select:is(.s-radio, .s-checkboxes) .s-input { align-items: flex-start; }   /* options line up under each other */
  .s-select:is(.s-radio, .s-checkboxes) .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 2); min-height: calc(24 * var(--length)); }
  input[type=checkbox], input[type=radio] { accent-color: var(--label-ink); }
  :is(.s-boolean, .s-info) .s-input { min-height: var(--h); }   /* every row on the fields' pitch */
  .s-boolean.s-switch .s-track { width: calc(44 * var(--length)); height: calc(24 * var(--length)); border-radius: calc(6 * var(--length));   /* the thumb's 3 plus its inset */ background: var(--well); box-shadow: ${well}; position: relative;
    &::after { content: ''; position: absolute; top: calc(3 * var(--length)); left: calc(3 * var(--length)); width: calc(18 * var(--length)); height: calc(18 * var(--length)); border-radius: calc(3 * var(--length)); background: linear-gradient(var(--glaze), var(--bg)); box-shadow: ${raised}; transition: left .15s; }
  }
  .s-boolean.s-switch:has(input:checked) .s-track { background: var(--accent); &::after { left: calc(23 * var(--length)); } }
  .s-boolean.s-toggle .s-track { display: inline-flex; align-items: center; height: var(--h); padding: 0 calc(14 * var(--length)); background: var(--well); border-radius: var(--r); box-shadow: ${well}; &::after { content: 'Off'; } }
  .s-boolean.s-toggle:has(input:checked) .s-track { color: var(--label-ink); &::after { content: 'On'; } }
  .s-boolean.s-checkbox input { position: absolute; opacity: 0; width: 0; height: 0; }
  .s-select.s-checkboxes .s-track, .s-boolean.s-checkbox .s-track { width: calc(16 * var(--length)); height: calc(16 * var(--length)); border-radius: calc(3 * var(--length)); box-shadow: ${well}; background: var(--well); }
  .s-select.s-checkboxes label:has(input:checked) .s-track, .s-boolean.s-checkbox:has(input:checked) .s-track { background: var(--s-color, var(--accent)); box-shadow: inset 0 0 0 calc(3 * var(--length)) var(--glaze); }
  :is(.s-boolean, .s-select label):has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 3px; }
  .s-slider {
    .s-track { min-height: var(--h); }
    input[type=range] { width: 100%; background: linear-gradient(to right, var(--accent) var(--p, 0%), var(--well) var(--p, 0%)); ${range} }
    .s-readout { flex: 0 0 7ch; min-width: 0; width: 7ch; height: auto; padding: 0; background: transparent; border: none; box-shadow: none; text-align: right; font-variant-numeric: tabular-nums; }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark { position: absolute; top: calc(50% + 8 * var(--length)); width: 1px; height: calc(3 * var(--length)); background: var(--fg-muted); opacity: .6; }
    .s-mark-label { position: absolute; top: 100%; transform: translateX(-50%); white-space: nowrap; }
    &:has(.s-mark-labels:not(:empty)) { flex-wrap: wrap; margin-bottom: calc(14 * var(--length));
      .s-label-group { width: 100%; max-width: none; }
      .s-input { flex-basis: 100%; }
    }
    &.s-multiple .s-readout { flex-basis: 5ch; width: 5ch; }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); padding: calc(4 * var(--length)); background: var(--glaze); border: 1px solid var(--well); border-radius: var(--r); white-space: nowrap; z-index: 2; }
    &.s-multiple .s-input { min-height: var(--h); }
    &.s-multiple .s-interval-track { height: calc(6 * var(--length)); margin: 0; background: var(--well); box-shadow: ${well};
      &::before { content: ''; position: absolute; inset: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); }
      input[type=range] { background: transparent; box-shadow: none; }
    }
  }
  .s-number .s-step button { width: calc(22 * var(--length)); min-height: calc(16 * var(--length)); padding: 0; font-size: calc(8 * var(--length)); }
  .s-color.s-picker .s-color-input { gap: calc(8 * var(--length));
    input[type=color] { position: static; width: var(--h); height: var(--h); flex: none; padding: calc(3 * var(--length)); background: var(--glaze); border: 1px solid #8ca0a355; border-radius: var(--r); box-shadow: ${well}; }
  }
  .s-color input[type=color] { &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: calc(2 * var(--length)); } }
  .s-color .s-alpha { ${range} }
  .s-color.s-swatches .s-input { flex-wrap: wrap; }
  .s-color.s-swatches button { width: calc(26 * var(--length)); height: calc(26 * var(--length)); padding: 0; &.s-selected { outline: 2px solid var(--accent); outline-offset: 2px; } }
  .s-pad { background: var(--well); box-shadow: ${well}; }
  .s-knob-dial { background: linear-gradient(var(--glaze), var(--bg)); box-shadow: ${raised}; }
  .s-info .s-monitor { color: var(--fg-muted); opacity: 1; }
  .s-separator { opacity: 1; &:not(.s-separator-labeled) { background: color-mix(in oklab, var(--fg), transparent 90%); box-shadow: 0 1px var(--glaze); } }
  .s-separator-label { opacity: 1; color: ${ruleLabel}; }
  .s-folder {
    > summary { min-height: var(--h); color: var(--label-ink); font-family: Georgia, serif;
      &::after { content: '+'; margin-left: auto; font-family: var(--font); }
    }
    &[open] > summary::after { content: '−'; }
    .s-content { padding: var(--row-gap) 0 0; gap: var(--row-gap); }   /* contents keep the rows' pitch */
    &.s-section > summary::after { display: none; }
  }
  .s-title { cursor: help; font-size: calc(11 * var(--length)); }
  .s-title-text { position: absolute; top: 100%; left: 0; z-index: 10; padding: calc(8 * var(--length)); width: max-content; max-width: 25ch; background: var(--glaze); border: 1px solid var(--well); box-shadow: ${raised}; opacity: 0; visibility: hidden; pointer-events: none; }
  .s-title:is(:hover, :focus-visible) + .s-title-text { opacity: 1; visibility: visible; }
}`
}
