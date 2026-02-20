/**
 * Classic / Editorial
 *
 * Philosophy: Centuries of print wisdom. Hierarchy through typography.
 * References: The New Yorker, Medium, Notion, iA Writer, Substack
 *
 * Rules:
 * - Serif is default
 * - Line length is controlled (~66 characters)
 * - Whitespace is generous
 * - Color is minimal (text + one accent)
 * - Hierarchy through size and weight, not color
 */

export const meta = {
  id: 'classic',
  label: 'Classic',
  philosophy: 'Print heritage',
}

export const constraints = {
  typography: ['serif', 'humanist'],
  density: { min: 0.6 },  // generous spacing
}

// Palette presets
const presets = {
  light: { bg: '#faf8f5', fg: '#2a2520', muted: '#6a6560', accent: '#8b4513' },
  dark: { bg: '#1a1816', fg: '#e8e4df', muted: '#9a9590', accent: '#cd853f' },
}

// Mood affects warmth
const moods = {
  day: { warmth: 0, shadow: 0.06 },
  golden: { warmth: 0.2, shadow: 0.08 },
  evening: { warmth: 0.1, shadow: 0.04 },
  midnight: { warmth: 0, shadow: 0 },
  dawn: { warmth: 0.1, shadow: 0.05 },
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
    density = 0.75,
    contrast = 0.6,
    roundness = 0.2,
  } = params

  const p = typeof palette === 'string' ? presets[palette] || presets.light : { ...presets.light, ...palette }
  const light = luminance(p.bg) > 0.5
  const moodConfig = moods[mood] || moods.day

  return {
    id: 'classic',
    palette: p,
    mood,
    css: `
settings-panel[theme="classic"] {
  --s-roundness: ${roundness};
  --s-density: ${density};
  --s-depth: 0.1;

  --s-font: "Libre Baskerville", "Georgia", serif;
  --s-mono: "IBM Plex Mono", ui-monospace, monospace;
  --s-font-size: 13px;
  --s-line: 1.5;

  --s-bg: ${p.bg};
  --s-panel-bg: var(--s-bg);
  --s-panel-border-color: ${light ? '#e0dcd5' : '#2a2824'};
  --s-panel-shadow: ${light ? `0 2px 8px rgba(0,0,0,${moodConfig.shadow})` : 'none'};

  --s-fg: ${p.fg};
  --s-muted: ${p.muted};
  --s-accent: ${p.accent};
  --s-accent-contrast: #ffffff;

  --s-input-bg: ${light ? '#ffffff' : '#252220'};
  --s-input-border: ${light ? '#d0ccc5' : '#3a3530'};
  --s-input-fg: var(--s-fg);

  --s-track-bg: ${light ? '#e0dcd5' : '#3a3530'};
  --s-track-fill: var(--s-accent);
  --s-knob-bg: ${light ? '#ffffff' : '#e8e4df'};

  --s-divider: ${light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'};
  --s-focus: ${p.accent}4d;
}
`,
  }
}

export default create
