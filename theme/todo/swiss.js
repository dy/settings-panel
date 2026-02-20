/**
 * Swiss / International Typographic Style
 *
 * Philosophy: Content, not decoration. Grid as law. Typography as hierarchy.
 * References: Braun, Stripe, Linear, FabFilter, Figma
 *
 * Rules:
 * - The grid is sacred
 * - Borders are informational, not decorative
 * - Shadows are functional (focus states only)
 * - Typography carries all hierarchy
 * - Whitespace is active, not empty
 * - If it doesn't communicate, remove it
 */

export const meta = {
  id: 'swiss',
  label: 'Swiss',
  philosophy: 'Invisible design',
}

export const constraints = {
  depth: { max: 0.3 },       // minimal shadows
  roundness: { default: 0.3 },
  typography: ['geometric'], // geometric sans only
}

// Palette presets
const presets = {
  light: { bg: '#ffffff', fg: '#0a0a0a', muted: '#737373', accent: '#0066FF' },
  dark: { bg: '#0a0a0a', fg: '#fafafa', muted: '#a3a3a3', accent: '#3b82f6' },
}

// Mood (swiss ignores most — flat by philosophy)
const moods = {
  day: { warmth: 0 },
  golden: { warmth: 0.1 },
  evening: { warmth: 0 },
  midnight: { warmth: 0 },
  dawn: { warmth: 0.05 },
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
    contrast = 0.7,
    roundness = 0.3,
  } = params

  const p = typeof palette === 'string' ? presets[palette] || presets.light : { ...presets.light, ...palette }
  const light = luminance(p.bg) > 0.5

  return {
    id: 'swiss',
    palette: p,
    mood,
    css: `
settings-panel[theme="swiss"] {
  --s-roundness: ${roundness};
  --s-density: ${density};
  --s-depth: 0;

  --s-font: "Inter", "Helvetica Neue", sans-serif;
  --s-mono: "SF Mono", ui-monospace, monospace;

  --s-bg: ${p.bg};
  --s-panel-bg: var(--s-bg);
  --s-panel-border-color: ${light ? '#e5e5e5' : '#262626'};
  --s-panel-shadow: none;

  --s-fg: ${p.fg};
  --s-muted: ${p.muted};
  --s-accent: ${p.accent};
  --s-accent-contrast: ${light ? '#ffffff' : '#000000'};

  --s-input-bg: ${light ? '#fafafa' : '#141414'};
  --s-input-border: ${light ? '#e5e5e5' : '#262626'};
  --s-input-fg: var(--s-fg);

  --s-track-bg: ${light ? '#e5e5e5' : '#262626'};
  --s-track-fill: var(--s-accent);
  --s-knob-bg: ${light ? '#ffffff' : '#fafafa'};

  --s-divider: ${light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'};
  --s-focus: ${p.accent}40;
}
`,
  }
}

export default create
