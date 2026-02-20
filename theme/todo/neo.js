/**
 * Neo / Neobrutalism
 *
 * Philosophy: Raw, bold, anti-polish. Visible structure. High contrast.
 * References: Gumroad, Figma marketing, indie web
 *
 * Rules:
 * - Shadows are hard offset (e.g., 4px 4px 0 black)
 * - Borders are thick (2-4px) and always black
 * - Colors can clash — that's the point
 * - No gradients, no blur
 * - Structure is visible and celebrated
 */

export const meta = {
  id: 'neo',
  label: 'Neo',
  philosophy: 'Raw boldness',
}

export const constraints = {
  roundness: { max: 0.3 },  // keeps brutalist edge
  depth: { force: 'hard' }, // always hard offset
}

export const customParams = {
  offset: { min: 2, max: 8, default: 4 },
}

// Palette presets
const presets = {
  light: { bg: '#ffffff', fg: '#000000', muted: '#555555', accent: '#ff6b6b' },
  dark: { bg: '#1a1a1a', fg: '#ffffff', muted: '#aaaaaa', accent: '#ff6b6b' },
}

// Mood (neo mostly ignores — always bold)
const moods = {
  day: { offset: 4 },
  golden: { offset: 5 },
  evening: { offset: 3 },
  midnight: { offset: 4 },
  dawn: { offset: 3 },
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
    roundness = 0.2,
    offset,
  } = params

  const p = typeof palette === 'string' ? presets[palette] || presets.light : { ...presets.light, ...palette }
  const light = luminance(p.bg) > 0.5
  const moodConfig = moods[mood] || moods.day
  const effectiveOffset = offset ?? moodConfig.offset

  return {
    id: 'neo',
    palette: p,
    mood,
    css: `
settings-panel[theme="neo"] {
  --s-roundness: ${roundness};
  --s-density: ${density};
  --s-depth: 1;

  --s-font: "Space Grotesk", "Inter", sans-serif;
  --s-mono: "Space Mono", ui-monospace, monospace;
  --s-font-size: 13px;

  --s-bg: ${p.bg};
  --s-panel-bg: var(--s-bg);
  --s-panel-border-color: #000000;
  --s-panel-shadow: ${effectiveOffset}px ${effectiveOffset}px 0 #000000;

  --s-fg: ${p.fg};
  --s-muted: ${p.muted};
  --s-accent: ${p.accent};
  --s-accent-contrast: #000000;

  --s-input-bg: ${light ? '#ffffff' : '#2a2a2a'};
  --s-input-border: #000000;
  --s-input-fg: var(--s-fg);

  --s-track-bg: ${light ? '#e0e0e0' : '#404040'};
  --s-track-fill: var(--s-accent);
  --s-knob-bg: #ffffff;

  --s-divider: #000000;
  --s-focus: ${p.accent}60;

  border-width: 3px;
}

settings-panel[theme="neo"] input,
settings-panel[theme="neo"] select,
settings-panel[theme="neo"] button {
  border: 2px solid #000000;
  box-shadow: ${Math.round(effectiveOffset * 0.5)}px ${Math.round(effectiveOffset * 0.5)}px 0 #000000;
}

settings-panel[theme="neo"] input:focus,
settings-panel[theme="neo"] select:focus,
settings-panel[theme="neo"] button:focus {
  box-shadow: ${Math.round(effectiveOffset * 0.75)}px ${Math.round(effectiveOffset * 0.75)}px 0 #000000;
}
`,
  }
}

export default create
