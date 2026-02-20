/**
 * Industrial / Teenage Engineering
 *
 * Philosophy: Exposed honesty. The machine is beautiful because it's a machine.
 * References: Teenage Engineering, Nothing Phone, Analogue, field recorders
 *
 * Rules:
 * - Structure is visible
 * - Accent color is functional (danger, interaction)
 * - Labels are literal ("POWER", "SYNC")
 * - Modularity over integration
 * - Tactile feedback matters
 */

export const meta = {
  id: 'industrial',
  label: 'Industrial',
  philosophy: 'Exposed honesty',
}

export const constraints = {
  roundness: { max: 0.2 },
  typography: ['geometric', 'mono'],
}

// Palette presets
const presets = {
  light: { bg: '#e8e8e8', fg: '#000000', muted: '#555555', accent: '#FF6600' },
  dark: { bg: '#1a1a1a', fg: '#e0e0e0', muted: '#909090', accent: '#FF6600' },
}

// Mood
const moods = {
  day: { shadowOffset: 2 },
  golden: { shadowOffset: 3 },
  evening: { shadowOffset: 1 },
  midnight: { shadowOffset: 1 },
  dawn: { shadowOffset: 2 },
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
    mood = 'day',
    density = 0.5,
    contrast = 0.8,
    roundness = 0.1,
  } = params

  const p = typeof palette === 'string' ? presets[palette] || presets.light : { ...presets.light, ...palette }
  const light = luminance(p.bg) > 0.5
  const moodConfig = moods[mood] || moods.day

  return {
    id: 'industrial',
    palette: p,
    mood,
    css: `
settings-panel[theme="industrial"] {
  --s-roundness: ${roundness};
  --s-density: ${density};
  --s-depth: 0.2;

  --s-font: "DIN", "Eurostile", "Inter", sans-serif;
  --s-mono: "JetBrains Mono", ui-monospace, monospace;
  --s-font-size: 11px;
  --s-letter: 0.03em;

  --s-bg: ${p.bg};
  --s-panel-bg: var(--s-bg);
  --s-panel-border-color: ${light ? '#000000' : '#404040'};
  --s-panel-shadow: ${moodConfig.shadowOffset}px ${moodConfig.shadowOffset}px 0 ${light ? '#00000020' : '#00000040'};

  --s-fg: ${p.fg};
  --s-muted: ${p.muted};
  --s-accent: ${p.accent};
  --s-accent-contrast: #000000;

  --s-input-bg: ${light ? '#ffffff' : '#2a2a2a'};
  --s-input-border: ${light ? '#000000' : '#505050'};
  --s-input-fg: var(--s-fg);

  --s-track-bg: ${light ? '#cccccc' : '#404040'};
  --s-track-fill: var(--s-accent);
  --s-knob-bg: ${light ? '#ffffff' : '#e0e0e0'};

  --s-divider: ${light ? '#000000' : '#404040'};
  --s-focus: ${p.accent}50;
}

settings-panel[theme="industrial"] .s-label {
  text-transform: uppercase;
  font-weight: 600;
}
`,
  }
}

export default create
