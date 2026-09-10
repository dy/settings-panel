/**
 * Porcelain — a glazed ceramic face seated in a pale mineral frame.
 * The rim is structural; the flowing relief is baked into the face, not glass.
 * bevel scales the lip, grain the relief, and shade tints the ceramic body.
 */
import baseCSS from './base.js'
import { resolveRoles } from './color.js'

export default function porcelain({
  shade = '#f4f6f5', accent = '#526e73', spacing = 1.2,
  weight = 500, roundness = 1, size = 1, bevel = 1, grain = 1,
} = {}) {
  const { dark, fg, fgMuted, accent: acc, onAccent } = resolveRoles(shade, accent)
  const svg = (body, width = 240) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}">${body}</svg>`)}")`
  const waves = Array.from({ length: 39 }, (_, i) => {
    const y = i * 8 - 32
    return `M-40 ${y} Q20 ${y - 35} 80 ${y} T200 ${y} T320 ${y}`
  }).join(' ')
  const relief = grain <= 0 ? 'none' : svg(`<filter id="r" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence baseFrequency=".015 .012" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="42"/></filter><g filter="url(#r)" fill="none" stroke-width="1" opacity="${Math.min(grain, 2) * (dark ? .02 : .055)}"><path stroke="#91a7aa" d="${waves}"/><path stroke="white" transform="translate(0 1.4)" d="${waves}"/></g>`)
  const mineral = svg('<filter id="m"><feTurbulence type="fractalNoise" baseFrequency=".025 .012" numOctaves="4" seed="12"/><feColorMatrix values="0 0 0 0 .52 0 0 0 0 .65 0 0 0 0 .64 1 0 0 0 0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .05 .3 .12 .03 .18 .5 .1 .4 0"/></feComponentTransfer></filter><path filter="url(#m)" d="M0 0h240v240H0z"/>')
  const lip = `${Math.max(0, bevel) * 5 * size}px`
  const well = 'inset 0 1px 2px color-mix(in oklab, var(--fg), transparent 77%), 0 1px 0 var(--glaze)'
  const raised = 'inset 0 1px 0 var(--glaze), inset 0 -1px 0 color-mix(in oklab, var(--fg), transparent 90%), 0 1px 2px color-mix(in oklab, var(--fg), transparent 85%)'
  const arrow = svg(`<path d="m3 4 3 3 3-3" fill="none" stroke="${fgMuted}" stroke-width="1.3"/>`, 12)

  return baseCSS + `
.s-panel {
  --bg: ${shade}; --accent: ${acc}; --fg: color-mix(in oklab, ${fg}, ${acc} 45%); --fg-muted: ${fgMuted};
  --label-ink: ${dark ? `color-mix(in oklab, ${acc}, white 50%)` : acc};
  --u: ${4 * size}px; --spacing: ${spacing}; --weight: ${weight}; --roundness: ${roundness};
  --r: calc(var(--u) * var(--roundness) * 1.5);
  --r-panel: calc(var(--u) * var(--roundness) * 5);
  --h: calc(var(--u) * 8.5);
  --glaze: ${dark ? 'oklch(from var(--bg) calc(l + .09) c h)' : '#fff'};
  --well: color-mix(in oklab, var(--bg), var(--fg) 4%);
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-family: var(--font); font-weight: var(--weight); color: var(--fg);
  color-scheme: ${dark ? 'dark' : 'light'};
  position: relative; isolation: isolate; min-width: 0;
  padding: calc(var(--u) * (4 + var(--spacing) * 2));
  border: calc(var(--u) * 2.25) solid transparent;
  border-radius: var(--r-panel);
  background: ${relief} padding-box, linear-gradient(var(--bg), var(--bg)) padding-box,
    ${mineral} border-box, linear-gradient(135deg, #cbd8d3, #eef2e6 38%, #b7cac8 70%, #d5ddd0) border-box;
  box-shadow: inset 0 0 0 1px var(--glaze), 0 1px 1px #fff, 0 -1px 2px #6f888a66, 0 4px 10px #617f8314;
  &::before { content: ''; position: absolute; inset: 0; pointer-events: none;
    border: ${lip} solid var(--glaze); border-right-color: var(--well); border-bottom-color: var(--well);
    border-radius: max(0px, calc(var(--r-panel) - var(--u) * 2.25));
    box-shadow: 0 0 0 1px #ffffff90;
  }
  > summary, > .s-panel-title { min-height: var(--h); gap: calc(var(--u) * 2); font: 600 1.4em/1.2 Georgia, serif; letter-spacing: -.025em; color: var(--label-ink); text-shadow: 0 1px var(--glaze); }
  > summary { flex-wrap: wrap; }
  .s-panel-content { gap: calc(var(--u) * (3 + var(--spacing) * 2)); }
  > .s-panel-content { padding-top: calc(var(--u) * 5); }
  .s-control { align-items: center; gap: calc(var(--u) * 3); }
  .s-label-group { min-width: 0; width: 29%; }
  .s-label { font-family: Georgia, serif; color: var(--label-ink); font-size: 1.1em; text-shadow: 0 1px var(--glaze); }
  .s-hint { color: var(--fg-muted); opacity: 1; }
  .s-input { align-items: center; }
  .s-fold-icon { margin-left: auto; width: 12px; height: 12px; background: currentColor; mask: ${arrow} center / contain no-repeat; }
  &[open] .s-fold-icon { transform: rotate(180deg); }
  .s-search { font: 500 13px/1.3 var(--font); }
  .s-search-input { width: 12ch; padding: var(--u); }
  :is(input, select, textarea, button):focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  input[type=text], input[type=number], textarea, select { flex: 1; background: var(--well); border: 1px solid color-mix(in oklab, var(--fg), transparent 89%); border-radius: var(--r); box-shadow: ${well}; }
  input[type=text], input[type=number], select { height: var(--h); padding: 0 calc(var(--u) * 2.5); }
  .s-number input[type=number] { appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { appearance: none; margin: 0; } }
  textarea { resize: vertical; min-height: calc(var(--h) * 2); padding: calc(var(--u) * 2); }
  select { appearance: none; background-image: ${arrow}; background-position: right 8px center; background-size: 12px; background-repeat: no-repeat; padding-right: 26px; }
  select option { background: var(--bg); }
  button { color: var(--fg); background: linear-gradient(var(--glaze), var(--bg)); border: 1px solid color-mix(in oklab, var(--fg), transparent 83%); border-radius: var(--r); box-shadow: ${raised}; }
  button:hover { filter: brightness(${dark ? 1.1 : .98}); }
  button:active { box-shadow: ${well}; }
  button:disabled, button[aria-busy=true] { opacity: .5; cursor: not-allowed; }
  .s-search-btn { box-shadow: none; border: 0; border-radius: 0; background: currentColor; }
  .s-button {
    .s-input { gap: calc(var(--u) * 3); }
    button { flex: 1; min-width: 0; min-height: var(--h); padding: calc(var(--u) * 2); font-family: Georgia, serif; font-size: 1.15em;
      background: linear-gradient(color-mix(in oklab, var(--accent), #000 12%), var(--accent)); color: ${onAccent};
      text-shadow: 0 1px 1px #0004; box-shadow: inset 0 1px 2px #0005, 0 1px 0 var(--glaze);
      &:active { background: var(--accent); box-shadow: inset 0 2px 4px #0006; }
    }
    &.s-secondary button, button.s-secondary { background: linear-gradient(var(--glaze), var(--bg)); color: var(--label-ink); text-shadow: 0 1px var(--glaze); box-shadow: ${raised}; &:active { background: var(--well); box-shadow: ${well}; } }
  }
  .s-select.s-segmented {
    .s-input { gap: 4px; }
    button { min-width: 0; flex: 1; height: var(--h); padding: 0 var(--u); }
    button.s-selected { color: var(--label-ink); background: var(--well); box-shadow: ${well}; }
  }
  .s-select:is(.s-radio, .s-checkboxes) .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 2); min-height: 24px; }
  input[type=checkbox], input[type=radio] { accent-color: var(--label-ink); }
  .s-boolean .s-input { min-height: var(--h); }
  .s-boolean.s-switch .s-track { width: 44px; height: 24px; border-radius: 5px; background: var(--well); box-shadow: ${well}; position: relative;
    &::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 3px; background: linear-gradient(var(--glaze), var(--bg)); box-shadow: ${raised}; transition: left .15s; }
  }
  .s-boolean.s-switch:has(input:checked) .s-track { background: var(--accent); &::after { left: 23px; } }
  .s-boolean.s-toggle .s-track { padding: 8px 14px; background: var(--well); border-radius: var(--r); box-shadow: ${well}; &::after { content: 'Off'; } }
  .s-boolean.s-toggle:has(input:checked) .s-track { color: var(--label-ink); &::after { content: 'On'; } }
  .s-boolean.s-checkbox input { position: absolute; opacity: 0; width: 0; height: 0; }
  .s-select.s-checkboxes .s-track, .s-boolean.s-checkbox .s-track { width: 16px; height: 16px; border-radius: 3px; box-shadow: ${well}; background: var(--well); }
  .s-select.s-checkboxes label:has(input:checked) .s-track, .s-boolean.s-checkbox:has(input:checked) .s-track { background: var(--s-color, var(--accent)); box-shadow: inset 0 0 0 3px var(--glaze); }
  :is(.s-boolean, .s-select label):has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 3px; }
  .s-slider {
    .s-track { min-height: var(--h); }
    input[type=range] { appearance: none; width: 100%; height: 6px; border-radius: 2px; background: linear-gradient(to right, var(--accent) var(--p, 0%), var(--well) var(--p, 0%)); box-shadow: ${well}; cursor: ew-resize;
      &::-webkit-slider-thumb { appearance: none; width: 14px; height: 22px; border: 1px solid #8ca0a355; border-radius: 3px; background: linear-gradient(90deg, var(--glaze), var(--bg)); box-shadow: ${raised}; }
      &::-moz-range-thumb { width: 14px; height: 22px; border: 1px solid #8ca0a355; border-radius: 3px; background: linear-gradient(90deg, var(--glaze), var(--bg)); box-shadow: ${raised}; }
    }
    .s-readout { flex: 0 0 7ch; min-width: 0; width: 7ch; height: auto; padding: 0; background: transparent; border: none; box-shadow: none; text-align: right; font-size: .9em; font-variant-numeric: tabular-nums; }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark { position: absolute; top: calc(50% + 8px); width: 1px; height: 3px; background: var(--fg-muted); opacity: .6; }
    .s-mark-label { position: absolute; top: 100%; transform: translateX(-50%); font-size: .75em; white-space: nowrap; }
    &:has(.s-mark-labels:not(:empty)) { flex-wrap: wrap; margin-bottom: 14px;
      .s-label-group { width: 100%; max-width: none; }
      .s-input { flex-basis: 100%; }
    }
    &.s-multiple .s-readout { flex-basis: 5ch; width: 5ch; }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); padding: 4px; background: var(--glaze); border: 1px solid var(--well); border-radius: var(--r); white-space: nowrap; z-index: 2; }
    &.s-multiple .s-interval-track { height: 6px; margin: 14px 0; background: var(--well); box-shadow: ${well};
      &::before { content: ''; position: absolute; inset: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); }
      input[type=range] { background: transparent; box-shadow: none; }
    }
  }
  .s-number .s-step button { width: 22px; min-height: 16px; padding: 0; font-size: 8px; }
  .s-color.s-picker .s-color-input { gap: 8px;
    input[type=color] { position: static; width: var(--h); height: var(--h); flex: none; padding: 3px; background: var(--glaze); border: 1px solid #8ca0a355; border-radius: var(--r); box-shadow: ${well}; }
  }
  .s-color input[type=color] { &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 2px; } }
  .s-color.s-swatches .s-input { flex-wrap: wrap; }
  .s-color.s-swatches button { width: 26px; height: 26px; padding: 0; &.s-selected { outline: 2px solid var(--accent); outline-offset: 2px; } }
  .s-pad { background: var(--well); box-shadow: ${well}; }
  .s-knob-dial { background: linear-gradient(var(--glaze), var(--bg)); box-shadow: ${raised}; }
  .s-info .s-monitor { color: var(--fg-muted); opacity: 1; }
  .s-separator { opacity: 1; background: color-mix(in oklab, var(--fg), transparent 90%); box-shadow: 0 1px var(--glaze); }
  .s-folder {
    > summary { min-height: var(--h); color: var(--label-ink); font-family: Georgia, serif; font-size: 1.1em;
      &::after { content: '+'; margin-left: auto; font-family: var(--font); }
    }
    &[open] > summary::after { content: '−'; }
    .s-content { padding: 12px 0; gap: calc(var(--u) * (3 + var(--spacing) * 2)); }
    &.s-section > summary::after { display: none; }
  }
  .s-title { cursor: help; font-size: 11px; }
  .s-title-text { position: absolute; top: 100%; left: 0; z-index: 10; padding: 8px; width: max-content; max-width: 25ch; background: var(--glaze); border: 1px solid var(--well); box-shadow: ${raised}; opacity: 0; visibility: hidden; pointer-events: none; }
  .s-title:hover + .s-title-text { opacity: 1; visibility: visible; }
}`
}
