/** DevTools — Chrome Styles-pane declarations, light by default.
 * Reference: ChromeDevTools/devtools-frontend front_end/design_system_tokens.css
 * and panels/elements/stylesSidebarPane.css (baseline grayscale palette).
 */
import baseCSS from './base.js'
import metrics from './metrics.js'
import { resolveRoles } from './color.js'

export default function devtools({ shade = '#ffffff', accent = '#0b57d0', size = 1, spacing = 1, font } = {}) {
  const { dark, accent: acc, onAccent } = resolveRoles(shade, accent)
  return baseCSS + `
.s-panel {
  ${metrics({ size, spacing, font }, { fontSize: 11, lineHeight: 16, controlHeight: 18, inset: 2, rowGap: 0, columnGap: 3, sectionGap: 2, panelPadding: 4, fontFamily: 'Menlo, Consolas, monospace' })}
  --bg: ${shade}; --accent: ${acc}; --fg: ${dark ? '#e3e3e3' : '#1f1f1f'}; --rule: ${dark ? '#5e5e5e' : '#e3e3e3'};
  --property: ${dark ? '#5cd5fb' : '#dc362e'};
  --value: var(--fg);
  --muted: ${dark ? '#9aa0a6' : '#686d73'};
  --well: color-mix(in oklab, var(--fg) 4%, var(--bg));
  --r: 0px;
  background: var(--bg); color: var(--fg);
  color-scheme: ${dark ? 'dark' : 'light'};
  border: 1px solid var(--rule);
  border-radius: var(--r);
  padding: var(--panel-padding);
  min-width: 0; width: min(100%, calc(340 * var(--length)));
  font: var(--font-size)/var(--line-height) var(--font-family);
  > summary, > .s-panel-title { gap: var(--column-gap); font-weight: 400; padding-bottom: var(--section-gap); }
  > summary::after, > .s-panel-title::after { content: '{'; color: var(--muted); font-weight: 400; }
  > summary .s-fold-icon { margin-left: auto; order: 1; }
  > summary .s-fold-icon::after { content: '⌄'; }
  &:not([open]) > summary .s-fold-icon::after { content: '›'; }
  &::after { content: '}'; display: block; color: var(--muted); padding-top: var(--section-gap); }
  &:is(details):not([open])::after { display: none; }
  .s-panel-content { gap: var(--row-gap); padding-left: calc(12 * var(--space)); }
  .s-control { align-items: center; gap: var(--column-gap); min-height: var(--control-height); }
  .s-control:not(.s-button, .s-info, .s-folder)::after { content: ';'; color: var(--fg); margin-left: calc(-1 * var(--column-gap)); }
  .s-control:has(input:focus-visible, select:focus-visible, textarea:focus-visible) { background: var(--well); }
  .s-label-group { width: auto; min-width: 0; max-width: 45%; line-height: var(--line-height); }
  .s-label { color: var(--property); overflow-wrap: anywhere; }
  .s-label::after { content: ':'; color: var(--muted); }
  .s-input { flex: 0 1 auto; align-items: center; gap: var(--column-gap); max-width: 100%; }
  .s-slider .s-input, .s-button .s-input { flex: 1; }
  input, select, textarea, button { font: inherit; color: inherit; }
  input[type=text], input[type=number], select, textarea {
    field-sizing: content; min-width: 1ch; width: auto; max-width: 100%; min-height: var(--control-height);
    background: transparent; border: 1px solid transparent; border-radius: var(--r);
    padding: 0; color: var(--value);
    &:hover { text-decoration: underline; }
    &:focus-visible { outline: 1px solid var(--accent); outline-offset: 0; background: var(--well); }
  }
  input[type=number], .s-slider .s-readout { color: var(--value); }
  select { appearance: none; cursor: pointer; }
  .s-step { flex: none; width: calc(14 * var(--length)); }
  .s-step button { width: 100%; min-height: 0; height: calc(var(--control-height) / 2); padding: 0; border: 0; background: transparent; font-size: .7em; }
  .s-slider .s-track { flex: 1; min-width: 0; }
  input[type=range] { width: 100%; min-width: 0; height: var(--control-height); accent-color: var(--accent); }
  .s-slider .s-readout { width: 5ch; flex: none; text-align: right; }
  .s-boolean .s-input { justify-content: flex-start; }
  .s-boolean input { position: static; opacity: 1; width: 1em; height: 1em; accent-color: var(--accent); }
  .s-boolean .s-track { display: none; }
  .s-boolean .s-input::after { content: 'false'; color: var(--value); pointer-events: none; }
  .s-boolean:has(input:checked) .s-input::after { content: 'true'; }
  .s-color .s-color-input { flex: 0 1 auto; min-width: 0; gap: var(--inset); }
  .s-color input[type=color] { position: static; flex: none; width: 1.2em; height: 1.2em; padding: 0; border: 1px solid var(--rule);
    &::-webkit-color-swatch-wrapper { padding: 0; }
    &::-webkit-color-swatch, &::-moz-color-swatch { border: none; }
  }
  .s-color input[type=text] { flex: 0 1 auto; width: auto; }
  .s-button { margin-top: var(--section-gap); }
  button { min-height: var(--control-height); padding: var(--inset) calc(var(--inset) * 2); background: var(--well); border: 1px solid var(--rule); border-radius: var(--r); cursor: pointer;
    &:hover { border-color: var(--accent); }
    &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    &:active, &.s-selected { background: var(--accent); color: ${onAccent}; }
  }
  .s-select.s-segmented .s-input { flex-wrap: wrap; }
  .s-select.s-segmented button { flex: 1; }
  textarea { min-height: calc(var(--line-height) * 3); resize: vertical; }
  .s-folder > summary { color: var(--property); cursor: pointer; padding: var(--inset) 0; gap: var(--inset); }
  .s-folder > summary::before { content: '›'; }
  .s-folder[open] > summary::before { content: '⌄'; }
  .s-folder .s-content { padding-left: var(--section-gap); border-left: 1px solid var(--rule); gap: var(--row-gap); }
  .s-separator { background: var(--rule); }
  .s-hint { color: var(--muted); }
}`
}
