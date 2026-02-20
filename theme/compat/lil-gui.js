/**
 * lil-gui Compatibility Theme
 *
 * Mimics lil-gui's visual style for drop-in replacement.
 * https://lil-gui.georgealways.com/
 */

export const meta = {
  id: 'lil-gui',
  label: 'lil-gui',
  philosophy: 'lil-gui compatibility',
}

// Palette presets (match lil-gui defaults)
const presets = {
  light: { bg: '#f0f0f0', fg: '#1f1f1f', muted: '#666666', accent: '#2fa1d6' },
  dark: { bg: '#1f1f1f', fg: '#ebebeb', muted: '#8c8c8c', accent: '#2fa1d6' },
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
    id: 'lil-gui',
    palette: p,
    css: `
settings-panel[theme="lil-gui"] {
  --s-roundness: 0;
  --s-density: 0.85;
  --s-depth: 0;

  --s-font: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --s-mono: ui-monospace, monospace;
  --s-font-size: 11px;
  --s-line: 1.2;

  --s-bg: ${p.bg};
  --s-panel-bg: var(--s-bg);
  --s-panel-border-color: transparent;
  --s-panel-shadow: none;

  --s-fg: ${p.fg};
  --s-muted: ${p.muted};
  --s-accent: ${p.accent};
  --s-accent-contrast: #ffffff;

  --s-input-bg: ${light ? '#d5d5d5' : '#2f2f2f'};
  --s-input-border: transparent;
  --s-input-fg: var(--s-fg);

  --s-track-bg: ${light ? '#c5c5c5' : '#3f3f3f'};
  --s-track-fill: var(--s-accent);
  --s-knob-bg: var(--s-fg);

  --s-divider: ${light ? '#c0c0c0' : '#2f2f2f'};
  --s-focus: ${p.accent}66;

  min-width: 245px;
}
`,
  }
}

export default create
