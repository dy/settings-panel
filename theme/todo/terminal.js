/**
 * Terminal / Utilitarian
 *
 * Philosophy: Every pixel earns its place. Decoration is waste. Speed is respect.
 * References: Bloomberg Terminal, vim, htop, Ableton, Elektron
 *
 * Rules:
 * - Monospace is the only font
 * - Animation is instant or absent
 * - Color is semantic, never decorative
 * - Density = power
 * - No rounded corners
 * - 1px borders maximum
 */

export const meta = {
  id: 'terminal',
  label: 'Terminal',
  philosophy: 'Information density',
}

export const constraints = {
  roundness: { force: 0 },    // always sharp
  depth: { max: 0 },          // no shadows
  typography: ['mono'],       // mono only
  animation: 'still',         // instant
}

// Palette presets
const presets = {
  light: { bg: '#f5f5f5', fg: '#1a1a1a', muted: '#666666', accent: '#00aa00' },
  dark: { bg: '#0c0c0c', fg: '#cccccc', muted: '#808080', accent: '#00ff00' },
}

// Mood (terminal mostly ignores)
const moods = {
  day: {},
  golden: {},
  evening: {},
  midnight: { accent: '#00ff00' },
  dawn: {},
}

// Simple luminance check
const luminance = (hex) => {
  const rgb = parseInt(hex.slice(1), 16)
  const r = (rgb >> 16) & 255, g = (rgb >> 8) & 255, b = rgb & 255
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function create(params = {}) {
  const {
    palette = {},
    mood = 'midnight',
    density = 0.25,
    contrast = 0.9,
  } = params

  const p = typeof palette === 'string' ? presets[palette] || presets.dark : { ...presets.dark, ...palette }
  const light = luminance(p.bg) > 0.5

  return {
    id: 'terminal',
    palette: p,
    mood,
    css: `
settings-panel[theme="terminal"] {
  --s-roundness: 0;
  --s-density: ${density};
  --s-depth: 0;

  --s-font: "JetBrains Mono", "SF Mono", ui-monospace, monospace;
  --s-mono: var(--s-font);
  --s-font-size: 12px;
  --s-line: 1.4;

  --s-bg: ${p.bg};
  --s-panel-bg: var(--s-bg);
  --s-panel-border-color: ${light ? '#cccccc' : '#333333'};
  --s-panel-shadow: none;

  --s-fg: ${p.fg};
  --s-muted: ${p.muted};
  --s-accent: ${p.accent};
  --s-accent-contrast: #000000;

  --s-input-bg: ${light ? '#ffffff' : '#1a1a1a'};
  --s-input-border: ${light ? '#cccccc' : '#333333'};
  --s-input-fg: var(--s-fg);

  --s-track-bg: ${light ? '#cccccc' : '#333333'};
  --s-track-fill: var(--s-accent);
  --s-knob-bg: var(--s-accent);

  --s-divider: ${light ? '#cccccc' : '#333333'};
  --s-focus: ${p.accent}40;

  --s-speed-fast: 0ms;
  --s-speed-slow: 0ms;
}
`,
  }
}

export default create
