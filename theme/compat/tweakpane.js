/**
 * Tweakpane Compatibility Theme
 *
 * Mimics Tweakpane's visual style for drop-in replacement.
 * https://tweakpane.github.io/docs/
 */

export const meta = {
  id: 'tweakpane',
  label: 'Tweakpane',
  philosophy: 'Tweakpane compatibility',
}

// Palette presets (match Tweakpane defaults)
const presets = {
  light: { bg: '#f5f5f5', fg: '#1a1a1a', muted: '#787878', accent: '#4b90de' },
  dark: { bg: '#282828', fg: '#c8c8c8', muted: '#787878', accent: '#4b90de' },
}

// Simple luminance check
const luminance = (hex) => {
  const rgb = parseInt(hex.slice(1), 16)
  const r = (rgb >> 16) & 255, g = (rgb >> 8) & 255, b = rgb & 255
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function create(params = {}) {
  const { palette = 'dark' } = params

  const p = typeof palette === 'string' ? presets[palette] || presets.dark : { ...presets.dark, ...palette }
  const light = luminance(p.bg) > 0.5

  return {
    id: 'tweakpane',
    palette: p,
    css: `
settings-panel[theme="tweakpane"] {
  --s-roundness: 0.15;
  --s-density: 0.9;
  --s-depth: 0;

  --s-font: "Roboto Mono", ui-monospace, monospace;
  --s-mono: var(--s-font);
  --s-font-size: 11px;
  --s-line: 1.3;

  --s-bg: ${p.bg};
  --s-panel-bg: var(--s-bg);
  --s-panel-border-color: ${light ? '#c8c8c8' : '#1a1a1a'};
  --s-panel-shadow: none;

  --s-fg: ${p.fg};
  --s-muted: ${p.muted};
  --s-accent: ${p.accent};
  --s-accent-contrast: #ffffff;

  --s-input-bg: ${light ? '#e6e6e6' : '#1e1e1e'};
  --s-input-border: ${light ? '#c8c8c8' : '#0f0f0f'};
  --s-input-fg: var(--s-fg);

  --s-track-bg: ${light ? '#d0d0d0' : '#1a1a1a'};
  --s-track-fill: var(--s-accent);
  --s-knob-bg: var(--s-accent);

  --s-divider: ${light ? '#d0d0d0' : '#1a1a1a'};
  --s-focus: ${p.accent}66;
}
`,
  }
}

export default create
