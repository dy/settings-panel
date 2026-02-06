/**
 * Analog / Skeuomorphism
 *
 * Philosophy: Digital should feel physical. Metaphors reduce cognitive load.
 * References: Universal Audio, Waves, iOS 1-6, vintage audio gear
 *
 * Rules:
 * - Light source is consistent (usually top-left)
 * - Shadows are realistic (blur, spread, direction)
 * - Textures suggest specific materials
 * - Buttons look pressable, knobs look turnable
 */

export const meta = {
  id: 'analog',
  label: 'Analog',
  philosophy: 'Physical metaphors',
}

export const constraints = {
  depth: { min: 0.4 },  // needs shadows
}

export const customParams = {
  material: ['wood', 'metal', 'leather', 'fabric'],
  lighting: { min: 0, max: 360, default: 315 },  // degrees, top-left
}

// Palette presets
const presets = {
  light: { bg: '#c8c8c8', fg: '#1a1a1a', muted: '#505050', accent: '#3366cc' },
  dark: { bg: '#2a2a2a', fg: '#e0e0e0', muted: '#909090', accent: '#6699ff' },
}

// Mood affects shadow/lighting physics
const moods = {
  day: { shadowScale: 1, shadowBlur: 1, warmth: 0, glow: 0 },
  golden: { shadowScale: 1.3, shadowBlur: 0.8, warmth: 0.3, glow: 0.1 },
  evening: { shadowScale: 0.8, shadowBlur: 1.5, warmth: 0.1, glow: 0.05 },
  midnight: { shadowScale: 0.3, shadowBlur: 2, warmth: 0, glow: 0.15 },
  dawn: { shadowScale: 0.6, shadowBlur: 1.3, warmth: 0.15, glow: 0.08 },
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
    contrast = 0.7,
    roundness = 0.5,
    depth = 0.7,
    lighting = 315,
    material = 'metal',
  } = params

  // Resolve palette (string preset or object)
  const p = typeof palette === 'string' ? presets[palette] || presets.dark : { ...presets.dark, ...palette }
  const light = luminance(p.bg) > 0.5

  // Mood affects lighting physics
  const moodConfig = moods[mood] || moods.day
  const rad = (lighting * Math.PI) / 180
  const shadowX = Math.round(Math.cos(rad) * -4 * moodConfig.shadowScale)
  const shadowY = Math.round(Math.sin(rad) * -4 * moodConfig.shadowScale)

  return {
    id: 'analog',
    palette: p,
    mood,
    css: `
settings-panel[theme="analog"] {
  --s-roundness: ${roundness};
  --s-density: ${density};
  --s-depth: ${depth};

  --s-font: "Avenir Next", "Avenir", "Segoe UI", sans-serif;
  --s-mono: "SF Mono", ui-monospace, monospace;

  --s-bg: ${p.bg};
  --s-panel-bg: ${light
    ? 'linear-gradient(180deg, #d0d0d0 0%, #b8b8b8 100%)'
    : 'linear-gradient(180deg, #3a3a3a 0%, #252525 100%)'};
  --s-panel-texture: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
  --s-panel-texture-blend: overlay;
  --s-panel-border-color: ${light ? '#909090' : '#1a1a1a'};
  --s-panel-shadow:
    ${shadowX}px ${shadowY}px ${depth * 20 * moodConfig.shadowBlur}px rgba(0,0,0,${depth * 0.4}),
    inset 0 1px 0 rgba(255,255,255,${light ? 0.3 : 0.1});

  --s-fg: ${p.fg};
  --s-muted: ${p.muted};
  --s-accent: ${p.accent};
  --s-accent-contrast: #ffffff;

  --s-input-bg: ${light
    ? 'linear-gradient(180deg, #e8e8e8 0%, #d8d8d8 100%)'
    : 'linear-gradient(180deg, #1a1a1a 0%, #252525 100%)'};
  --s-input-border: ${light ? '#808080' : '#1a1a1a'};
  --s-input-fg: var(--s-fg);

  --s-track-bg: ${light ? '#a0a0a0' : '#1a1a1a'};
  --s-track-fill: var(--s-accent);
  --s-knob-bg: ${light
    ? 'linear-gradient(180deg, #f0f0f0 0%, #c0c0c0 100%)'
    : 'linear-gradient(180deg, #505050 0%, #303030 100%)'};

  --s-divider: ${light ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.3)'};
  --s-focus: ${p.accent}66;
}
`,
  }
}

export default create
