/**
 * Leva Compatibility Theme
 *
 * Mimics Leva's visual style for drop-in replacement.
 * https://github.com/pmndrs/leva
 */

export const meta = {
  id: 'leva',
  label: 'Leva',
  philosophy: 'Leva compatibility',
}

// Palette presets (match Leva defaults)
const presets = {
  light: { bg: '#fafafa', fg: '#1f2937', muted: '#6b7280', accent: '#007bff' },
  dark: { bg: '#181c20', fg: '#f0f0f0', muted: '#8d9199', accent: '#007bff' },
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
  const accent2 = p.accent.replace(/^#([0-9a-f]{2})/, (_, r) => `#${Math.min(255, parseInt(r, 16) + 50).toString(16).padStart(2, '0')}`)

  return {
    id: 'leva',
    palette: p,
    css: `
settings-panel[theme="leva"] {
  --s-roundness: 0.5;
  --s-density: 0.9;
  --s-depth: 0.4;

  --s-font: "Inter", -apple-system, sans-serif;
  --s-mono: "JetBrains Mono", ui-monospace, monospace;
  --s-font-size: 10px;
  --s-line: 1.3;
  --s-letter: 0.01em;

  --s-bg: ${p.bg};
  --s-panel-bg: var(--s-bg);
  --s-panel-border-color: ${light ? '#e0e0e0' : '#292d36'};
  --s-panel-shadow: 0 4px 14px rgba(0, 0, 0, ${light ? 0.08 : 0.3});

  --s-fg: ${p.fg};
  --s-muted: ${p.muted};
  --s-accent: ${p.accent};
  --s-accent-2: ${accent2};
  --s-accent-contrast: #ffffff;

  --s-input-bg: ${light ? '#f0f0f0' : '#282c34'};
  --s-input-border: ${light ? '#d0d0d0' : '#383c46'};
  --s-input-fg: var(--s-fg);

  --s-track-bg: ${light ? '#e0e0e0' : '#2a2e36'};
  --s-track-fill: linear-gradient(90deg, var(--s-accent), var(--s-accent-2));
  --s-knob-bg: var(--s-fg);

  --s-divider: ${light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'};
  --s-focus: ${p.accent}59;

  min-width: 280px;
}
`,
  }
}

export default create
