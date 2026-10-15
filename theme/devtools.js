/** DevTools — Chrome Styles-pane declarations, light by default.
 * Reference: ChromeDevTools/devtools-frontend front_end/design_system_tokens.css (baseline-grayscale),
 * panels/elements/stylesSidebarPane.css + stylePropertiesTreeOutline.css (section, rows, separator),
 * ui/legacy/inspectorCommon.css (range, checkbox), inline_editor/colorSwatch.css,
 * ui/legacy/textPrompt.css (value editing), components/buttons/button.css (outlined button).
 */
import baseCSS from './base.js'
import metrics from './metrics.js'
import { resolveRoles } from './color.js'

// front_end/Images/triangle-{down,right}.svg, painted as masks in --icon
const icon = d => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14'%3E%3Cpath d='${d}'/%3E%3C/svg%3E")`
const down = icon('m7 9.45 3.85-5.6h-7.7'), right = icon('M10.5 6.65 4.9 2.8v7.7')

// primary, primary-bright, inverse-primary, tonal-outline, on-primary, on-text-highlight
const native = { light: ['#0b57d0', '#1b6ef3', '#a8c7fa', '#a8c7fa', '#ffffff', '#ffffff'], dark: ['#a8c7fa', '#7cacf8', '#0b57d0', '#047db7', '#062e6f', '#000000'] }

export default function devtools({ shade = '#ffffff', accent, size = 1, spacing = 1, font } = {}) {
  const { dark, accent: custom, onAccent } = resolveRoles(shade, accent)
  const own = native[dark ? 'dark' : 'light'], tint = `color-mix(in srgb, ${custom} 40%, ${shade})`
  const [primary, bright, inverse, outline, onPrimary, onSelection] = accent == null || String(custom).toLowerCase() === own[0] ? own : [custom, custom, tint, tint, onAccent, onAccent]
  return baseCSS + `
.s-panel {
  ${metrics({ size, spacing, font }, { fontSize: 11, lineHeight: 13, controlHeight: 14, inset: 2, rowGap: 0, columnGap: 4, sectionGap: 3, panelPadding: 4, fontFamily: 'Menlo, Consolas, "Noto Sans Mono", "DejaVu Sans Mono", monospace' })}
  --bg: ${shade}; --accent: ${primary}; --accent-bright: ${bright}; --accent-inverse: ${inverse}; --outline: ${outline}; --on-accent: ${onPrimary}; --on-selection: ${onSelection};
  --fg: ${dark ? '#e3e3e3' : '#1f1f1f'}; --rule: ${dark ? '#5e5e5e' : '#e3e3e3'};
  --property: ${dark ? '#5cd5fb' : '#dc362e'};
  --muted: ${dark ? '#8f8f8f' : '#757575'};
  --icon: ${dark ? '#c7c7c7' : '#474747'};
  --tip-bg: ${dark ? '#e3e3e3' : '#303030'}; --tip-fg: ${dark ? '#1f1f1f' : '#f2f2f2'};
  --swatch: ${dark ? '#757575' : '#c7c7c7'}; --swatch-hover: ${dark ? '#8e918f' : '#747775'};
  --track: ${dark ? '#444746' : '#e1e3e1'};
  --hover: color-mix(in srgb, ${dark ? '#fdfcfb 10%' : '#1f1f1f 6%'}, transparent);
  --ripple: color-mix(in srgb, ${dark ? '#fdfcfb 16%' : '#1f1f1f 8%'}, transparent);
  --disabled: ${dark ? 'rgb(227 227 227 / 38%)' : 'rgb(31 31 31 / 38%)'}; --disabled-fill: ${dark ? 'rgb(227 227 227 / 12%)' : 'rgb(31 31 31 / 12%)'};
  /* --drop-shadow of the .text-prompt-editing box (text + 2px sides + 1px below), recast onto the field itself */
  --edit-shadow: ${dark ? '-1px 0 0 2px rgb(255 255 255 / 20%), 1px 0 0 2px rgb(255 255 255 / 20%), 0 1px 4px 4px rgb(0 0 0 / 20%), 0 1px 6px 4px rgb(0 0 0 / 10%)' : '-1px 0 0 2px rgb(0 0 0 / 5%), 1px 0 0 2px rgb(0 0 0 / 5%), 0 1px 4px 2px rgb(0 0 0 / 20%), 0 1px 6px 2px rgb(0 0 0 / 10%)'};
  --gutter: calc(18 * var(--space));
  --r: 0px;
  background: var(--bg); color: var(--fg);
  color-scheme: ${dark ? 'dark' : 'light'};
  accent-color: var(--accent-bright);
  border: 1px solid var(--rule);
  border-radius: var(--r);
  padding: calc(var(--panel-padding) / 2) 0 var(--panel-padding);
  min-width: 0; width: min(100%, calc(340 * var(--length)));
  font: var(--font-size)/var(--line-height) var(--font-family);
  ::selection { background: var(--accent); color: var(--on-selection); }
  > summary, > .s-panel-title { gap: 1ch; font-weight: 400; color: var(--muted); padding: 0 calc(var(--panel-padding) / 2) var(--section-gap) var(--panel-padding); }
  > summary::after, > .s-panel-title::after { content: '{'; color: var(--fg); }
  > summary .s-fold-icon { margin-left: auto; order: 1; flex: none; width: calc(14 * var(--length)); height: var(--line-height); background: var(--icon); mask: ${down} center / calc(14 * var(--length)) no-repeat; }
  &:not([open]) > summary .s-fold-icon { mask-image: ${right}; }
  &::after { content: '}'; display: block; color: var(--fg); padding-left: var(--panel-padding); }
  &:is(details):not([open])::after { display: none; }
  .s-panel-content { gap: var(--row-gap); padding: 0 calc(var(--panel-padding) * 1.5) 0 calc(var(--panel-padding) + var(--gutter)); overflow-x: clip; }
  .s-control:not(.s-folder, .s-separator) { align-items: flex-start; gap: 0; min-height: var(--line-height); padding-bottom: calc(var(--control-height) - var(--line-height)); }
  .s-control:not(.s-button, .s-info, .s-folder, .s-separator)::after { content: ';'; color: var(--fg); }
  /* row hover: the li .selection fill, reaching the pane edge over the gutter */
  .s-control, .s-folder > summary { position: relative; }
  .s-control:not(.s-button, .s-folder, .s-separator):hover::before, .s-folder > summary:hover::after { content: ''; position: absolute; inset: 0 0 0 -100vw; width: auto; background: var(--hover); pointer-events: none; }
  .s-label-group { width: auto; min-width: 0; max-width: 45%; line-height: var(--line-height); }
  .s-label { color: var(--property); overflow-wrap: anywhere; &:hover { text-decoration: underline; } }
  /* .styles-name-value-separator: ': ' in a 14px box, kept on the name's line */
  .s-label::after { content: ':'; margin-right: calc(14 * var(--length) - 1ch); color: var(--fg); }
  /* devtools-tooltip, simple variant */
  .s-title { flex: none; margin-right: 1ch; color: var(--muted); cursor: help; &:is(:hover, :focus-visible) + .s-title-text { visibility: visible; } }
  .s-title-text { position: absolute; left: 0; top: 100%; z-index: 10; width: max-content; max-width: calc(240 * var(--length)); margin: calc(2 * var(--length)); padding: calc(6 * var(--length)) calc(8 * var(--length)); font: 400 calc(12 * var(--length))/calc(16 * var(--length)) system-ui, sans-serif; color: var(--tip-fg); background: var(--tip-bg); border-radius: calc(4 * var(--length)); box-shadow: 0 1px 2px 0 rgb(0 0 0 / 30%), 0 2px 6px 2px rgb(0 0 0 / 15%); visibility: hidden; pointer-events: none; }
  .s-input { flex: 0 1 auto; align-items: center; gap: var(--column-gap); max-width: 100%; }
  input, select, textarea, button { font: inherit; color: inherit; }
  input[type=text], input[type=number], select, textarea {
    field-sizing: content; min-width: 1ch; width: auto; max-width: 100%;
    background: transparent; border: 0; border-radius: var(--r);
    padding: 0; color: var(--fg);
    &:hover { text-decoration: underline; }
  }
  input[type=text], input[type=number], textarea { &:focus { outline: 2px solid var(--accent); border-radius: 2px; box-shadow: var(--edit-shadow); text-decoration: none; } }
  select { appearance: none; cursor: pointer; &:focus-visible { outline: 2px solid var(--accent); border-radius: 2px; } }
  input[type=number] { -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
  .s-step { display: none; }
  .s-slider .s-track, .s-slider .s-interval-track { flex: none; width: calc(88 * var(--length)); height: calc(10 * var(--length)); }
  /* labeled marks need the row's width; DevTools draws no ticks */
  .s-slider:has(.s-mark-labels:not(:empty)) { .s-input, .s-track { flex: 1; } .s-input { align-items: flex-start; } .s-track { margin: calc(1.5 * var(--length)) 2ch calc(12 * var(--length)) 0; } }
  .s-marks { display: none; }
  .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
  .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: calc(9 * var(--length)); line-height: 1; color: var(--muted); white-space: nowrap; }
  input[type=range] { appearance: none; width: 100%; height: calc(10 * var(--length)); margin: 0; padding: 0; background: none; outline: none;
    &::-webkit-slider-runnable-track { height: calc(2 * var(--length)); background: var(--track); }
    &::-webkit-slider-thumb { appearance: none; width: calc(12 * var(--length)); height: calc(12 * var(--length)); margin-top: calc(-5 * var(--length)); border: 0; border-radius: 50%; background: var(--accent); }
    &:focus::-webkit-slider-thumb { box-shadow: 0 0 0 2px var(--accent-inverse); }
    &::-moz-range-track { height: calc(2 * var(--length)); background: var(--track); }
    &::-moz-range-thumb { width: calc(12 * var(--length)); height: calc(12 * var(--length)); border: 0; border-radius: 50%; background: var(--accent); }
    &:focus::-moz-range-thumb { box-shadow: 0 0 0 2px var(--accent-inverse); }
  }
  .s-slider .s-readout { flex: none; }
  .s-slider .s-tooltip { position: static; transform: none; }
  .s-boolean .s-input { justify-content: flex-start; }
  .s-boolean input { position: relative; display: flex; align-items: center; justify-content: center; opacity: 1; width: calc(13 * var(--length)); height: calc(13 * var(--length)); margin: 0; outline: none;
    &:hover::after, &:active::before { content: ''; position: absolute; width: calc(24 * var(--length)); height: calc(24 * var(--length)); border-radius: 50%; }
    &:hover::after { background: var(--hover); }
    &:active::before { background: var(--ripple); }
    &:focus-visible::before { content: ''; position: absolute; width: calc(15 * var(--length)); height: calc(15 * var(--length)); border: 2px solid var(--accent); border-radius: 5px; }
  }
  .s-boolean .s-track { display: none; }
  .s-boolean .s-input::after { content: 'false'; color: var(--fg); pointer-events: none; }
  .s-boolean:has(input:checked) .s-input::after { content: 'true'; }
  .s-color .s-color-input { flex: 0 1 auto; min-width: 0; gap: 0; }
  .s-color input[type=color] { position: static; flex: none; align-self: flex-start; width: calc(12 * var(--length)); height: calc(12 * var(--length)); margin: 0 calc(2 * var(--length)) 0 var(--length); transform: scale(.8); padding: 0; border: 0; background: none;
    &::-webkit-color-swatch-wrapper { padding: 0; }
    &::-webkit-color-swatch { border: 1px solid var(--swatch); border-radius: 0; }
    &::-moz-color-swatch { border: 1px solid var(--swatch); border-radius: 0; }
    &:hover::-webkit-color-swatch { border-color: var(--swatch-hover); }
    &:focus-visible { outline: 2px solid var(--accent); border-radius: 2px; }
  }
  .s-color input[type=text] { flex: 0 1 auto; width: auto; }
  /* spectrum.css .spectrum-palette-color */
  .s-color.s-swatches .s-input { flex-wrap: wrap; gap: calc(6 * var(--space)); padding-top: 1px; }
  .s-color.s-swatches button { flex: none; width: calc(12 * var(--length)); height: calc(12 * var(--length)); padding: 0; border: 1px solid var(--rule); border-radius: 2px; cursor: pointer; transition: transform 100ms cubic-bezier(0, 0, .2, 1);
    &:hover { transform: scale(1.15); }
    &.s-selected, &:focus-visible { border-color: var(--accent); outline: none; }
  }
  .s-select:is(.s-checkboxes, .s-radio) .s-input { align-items: flex-start; }
  .s-select.s-checkboxes { label { display: flex; align-items: center; gap: var(--column-gap); } input[type=checkbox] { position: static; opacity: 1; width: calc(13 * var(--length)); height: calc(13 * var(--length)); margin: 0; } .s-track { display: none; } }
  .s-vector input[type=number] { min-width: 4ch; text-align: left; }
  .s-control.s-button { align-items: center; padding-top: var(--u); }
  .s-button button, .s-select.s-segmented button {
    position: relative; font: 500 calc(12 * var(--length))/calc(16 * var(--length)) system-ui, sans-serif; white-space: nowrap;
    height: calc(24 * var(--length)); padding: 0 calc(12 * var(--length));
    background: transparent; color: var(--accent); border: 1px solid var(--outline); border-radius: 9999px; cursor: pointer;
    &:hover::after, &:active::before { content: ''; position: absolute; inset: 0; border-radius: inherit; }
    &:hover::after { background: var(--hover); }
    &:active::before { background: var(--ripple); }
    &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    &:disabled { color: var(--disabled); border-color: var(--disabled-fill); pointer-events: none; }
    &.s-selected { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
  }
  .s-select.s-segmented .s-input { flex-wrap: wrap; }
  .s-select.s-segmented button { flex: 1; }
  textarea { min-height: calc(var(--line-height) * 3); resize: vertical; }
  .s-folder > summary { color: var(--property); gap: calc(2 * var(--length)); min-height: var(--line-height); padding: 0 0 calc(var(--control-height) - var(--line-height)); }
  .s-folder > summary::before { content: ''; flex: none; width: calc(14 * var(--length)); height: var(--line-height); margin-left: calc(-16 * var(--length)); background: var(--icon); mask: ${right} center / calc(14 * var(--length)) no-repeat; }
  .s-folder[open] > summary::before { mask-image: ${down}; }
  .s-folder > summary::after { content: none; }
  .s-folder .s-content { padding-left: calc(14 * var(--space)); gap: var(--row-gap); }
  .s-separator:not(.s-separator-labeled), .s-separator-labeled::before, .s-separator-labeled::after { background: var(--rule); opacity: 1; }
  .s-separator-label { color: var(--muted); opacity: 1; }
  .s-hint { color: var(--muted); opacity: 1; }   /* at 60% it read 2.3:1 */
}`
}
