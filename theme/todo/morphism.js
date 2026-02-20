/**
 * Morphism / Neumorphism / Soft UI
 *
 * Philosophy: Elements push out of or sink into the surface. Same-material depth.
 * References: Dribbble concepts, Alexander Plyuto
 *
 * Rules:
 * - Shadows always paired (dark bottom-right, light top-left)
 * - Background and elements are same color family
 * - Roundness is very high
 * - No sharp edges anywhere
 *
 * Warning: Low contrast — may have accessibility issues
 */

export const meta = {
  id: 'morphism',
  label: 'Morphism',
  philosophy: 'Soft extrusion',
}

export const constraints = {
  roundness: { min: 0.6 },  // must be soft
  contrast: { max: 0.5 },   // inherently low contrast
  depth: { min: 0.5 },      // needs paired shadows
}

// Palette presets
const presets = {
  light: { bg: '#e0e5ec', fg: '#3d4a5c', muted: '#6b7c93', accent: '#6c63ff' },
  dark: { bg: '#2d3436', fg: '#b8c5d6', muted: '#8a9aad', accent: '#a29bfe' },
}

// Mood affects shadow softness
const moods = {
  day: { shadowMult: 1 },
  golden: { shadowMult: 0.9 },
  evening: { shadowMult: 1.2 },
  midnight: { shadowMult: 1.3 },
  dawn: { shadowMult: 1.1 },
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
    density = 0.6,
    roundness = 0.8,
    depth = 0.6,
  } = params

  const p = typeof palette === 'string' ? presets[palette] || presets.light : { ...presets.light, ...palette }
  const light = luminance(p.bg) > 0.5
  const moodConfig = moods[mood] || moods.day

  const shadowDist = Math.round(depth * 10 * moodConfig.shadowMult)
  const shadowBlur = Math.round(depth * 20 * moodConfig.shadowMult)

  return {
    id: 'morphism',
    palette: p,
    mood,
    css: `
settings-panel[theme="morphism"] {
  --s-roundness: ${roundness};
  --s-density: ${density};
  --s-depth: ${depth};

  --s-font: "SF Pro Display", "Inter", sans-serif;
  --s-mono: "SF Mono", ui-monospace, monospace;

  --s-bg: ${p.bg};
  --s-panel-bg: var(--s-bg);
  --s-panel-border-color: transparent;
  --s-panel-shadow:
    ${shadowDist}px ${shadowDist}px ${shadowBlur}px ${light ? 'rgba(163,177,198,0.6)' : 'rgba(0,0,0,0.5)'},
    -${shadowDist}px -${shadowDist}px ${shadowBlur}px ${light ? 'rgba(255,255,255,0.8)' : 'rgba(60,65,70,0.5)'};

  --s-fg: ${p.fg};
  --s-muted: ${p.muted};
  --s-accent: ${p.accent};
  --s-accent-contrast: #ffffff;

  --s-input-bg: var(--s-bg);
  --s-input-border: transparent;
  --s-input-fg: var(--s-fg);

  --s-track-bg: var(--s-bg);
  --s-track-fill: var(--s-accent);
  --s-knob-bg: var(--s-bg);

  --s-divider: transparent;
  --s-focus: ${p.accent}4d;
}

settings-panel[theme="morphism"] input,
settings-panel[theme="morphism"] select,
settings-panel[theme="morphism"] button {
  box-shadow:
    inset ${Math.round(shadowDist * 0.4)}px ${Math.round(shadowDist * 0.4)}px ${Math.round(shadowBlur * 0.5)}px ${light ? 'rgba(163,177,198,0.5)' : 'rgba(0,0,0,0.4)'},
    inset -${Math.round(shadowDist * 0.4)}px -${Math.round(shadowDist * 0.4)}px ${Math.round(shadowBlur * 0.5)}px ${light ? 'rgba(255,255,255,0.7)' : 'rgba(60,65,70,0.4)'};
}
`,
  }
}

export default create
