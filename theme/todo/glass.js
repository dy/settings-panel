/**
 * Glass / Glassmorphism
 *
 * Philosophy: Depth through blur, not shadow. Surfaces are frosted glass.
 * References: macOS Big Sur, Windows 11, iOS 15+ widgets
 *
 * Rules:
 * - Blur is the primary depth cue
 * - Borders are thin, often white/light
 * - Background must be interesting (blur of nothing = nothing)
 * - Transparency varies by layer
 */

export const meta = {
  id: 'glass',
  label: 'Glass',
  philosophy: 'Layered translucency',
}

export const constraints = {
  roundness: { min: 0.4 },
}

export const customParams = {
  blur: { min: 8, max: 32, default: 16 },
  opacity: { min: 0.5, max: 0.95, default: 0.7 },
}

// Palette presets
const presets = {
  light: { bg: '#ffffff', fg: '#1a1a1a', muted: '#666666', accent: '#007aff' },
  dark: { bg: '#1e1e1e', fg: '#ffffff', muted: '#a0a0a0', accent: '#0a84ff' },
}

// Mood affects blur and tint
const moods = {
  day: { blurMult: 1, tint: 0 },
  golden: { blurMult: 0.9, tint: 0.1 },
  evening: { blurMult: 1.2, tint: 0.05 },
  midnight: { blurMult: 1.4, tint: 0 },
  dawn: { blurMult: 1.1, tint: 0.08 },
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
    roundness = 0.6,
    blur = 16,
    opacity = 0.7,
  } = params

  const p = typeof palette === 'string' ? presets[palette] || presets.dark : { ...presets.dark, ...palette }
  const light = luminance(p.bg) > 0.5
  const moodConfig = moods[mood] || moods.day
  const effectiveBlur = Math.round(blur * moodConfig.blurMult)

  return {
    id: 'glass',
    palette: p,
    mood,
    css: `
settings-panel[theme="glass"] {
  --s-roundness: ${roundness};
  --s-density: ${density};
  --s-depth: 0.3;

  --s-font: "SF Pro Display", "Inter", sans-serif;
  --s-mono: "SF Mono", ui-monospace, monospace;

  --s-bg: ${p.bg};
  --s-panel-bg: ${light
    ? `rgba(255, 255, 255, ${opacity})`
    : `rgba(30, 30, 30, ${opacity})`};
  --s-panel-border-color: ${light
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(255, 255, 255, 0.1)'};
  --s-panel-shadow: 0 8px 32px rgba(0, 0, 0, ${light ? 0.1 : 0.3});

  --s-fg: ${p.fg};
  --s-muted: ${p.muted};
  --s-accent: ${p.accent};
  --s-accent-contrast: #ffffff;

  --s-input-bg: ${light
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(255, 255, 255, 0.08)'};
  --s-input-border: ${light
    ? 'rgba(0, 0, 0, 0.1)'
    : 'rgba(255, 255, 255, 0.1)'};
  --s-input-fg: var(--s-fg);

  --s-track-bg: ${light
    ? 'rgba(0, 0, 0, 0.1)'
    : 'rgba(255, 255, 255, 0.1)'};
  --s-track-fill: var(--s-accent);
  --s-knob-bg: #ffffff;

  --s-divider: ${light
    ? 'rgba(0, 0, 0, 0.08)'
    : 'rgba(255, 255, 255, 0.08)'};
  --s-focus: ${p.accent}4d;

  backdrop-filter: blur(${effectiveBlur}px);
  -webkit-backdrop-filter: blur(${effectiveBlur}px);
}
`,
  }
}

export default create
