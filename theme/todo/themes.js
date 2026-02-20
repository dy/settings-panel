/**
 * Theme catalog with metadata and tokens
 */

const textures = {
  flat: 'none',
  noise: `
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.025) 0, rgba(255, 255, 255, 0.025) 1px, transparent 1px, transparent 2px),
    repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.02) 0, rgba(0, 0, 0, 0.02) 1px, transparent 1px, transparent 2px)
  `,
  tactile: `
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(0, 0, 0, 0.12)),
    radial-gradient(circle at 20% 10%, rgba(255, 255, 255, 0.18), transparent 60%),
    radial-gradient(circle at 80% 0%, rgba(0, 0, 0, 0.12), transparent 55%)
  `,
}

const animations = {
  still: {
    speedFast: '0ms',
    speedSlow: '0ms',
    ease: 'linear',
  },
  swift: {
    speedFast: '120ms',
    speedSlow: '220ms',
    ease: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  },
  elaborate: {
    speedFast: '180ms',
    speedSlow: '360ms',
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
}

const themeList = [
  {
    id: 'default',
    label: 'Aether',
    tier: 'premium',
    mode: 'light',
    hue: 'cool',
    meta: {
      roundness: 0.7,
      density: 1.05,
      temperature: 0.4,
      depth: 0.7,
      contrast: 0.6,
      typography: 'polished grotesk',
      saturation: 0.55,
      texture: 'tactile',
      animation: 'elaborate',
    },
    tokens: {
      font: '"Sora", "IBM Plex Sans", "Segoe UI", sans-serif',
      mono: '"IBM Plex Mono", "SF Mono", ui-monospace, monospace',
      panelBg: 'linear-gradient(180deg, #f7f8fb 0%, #eef1f6 100%)',
      panelBorder: '#e2e8f0',
      panelShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
      fg: '#1b2430',
      muted: '#5b6677',
      accent: '#4f7cff',
      accent2: '#7b5dff',
      accentContrast: '#ffffff',
      inputBg: '#ffffff',
      inputBorder: '#d8e0ea',
      inputFg: '#16212f',
      inputPlaceholder: 'rgba(22, 33, 47, 0.35)',
      trackBg: '#e1e7f2',
      knobBg: '#ffffff',
      chipBg: '#eef2f8',
      chipFg: '#273041',
      divider: 'rgba(20, 30, 42, 0.08)',
      focus: 'rgba(79, 124, 255, 0.3)',
    },
  },
  {
    id: 'nocturne',
    label: 'Nocturne',
    tier: 'premium',
    mode: 'dark',
    hue: 'cool',
    meta: {
      roundness: 0.55,
      density: 0.95,
      temperature: 0.3,
      depth: 0.85,
      contrast: 0.75,
      typography: 'high-contrast neo-grotesk',
      saturation: 0.45,
      texture: 'noise',
      animation: 'swift',
    },
    tokens: {
      font: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      mono: '"IBM Plex Mono", "SF Mono", ui-monospace, monospace',
      panelBg: 'linear-gradient(180deg, #0d1117 0%, #141a22 100%)',
      panelBorder: '#1f2732',
      panelShadow: '0 20px 48px rgba(0, 0, 0, 0.45)',
      fg: '#e6eef8',
      muted: '#8a96a8',
      accent: '#6dd5ff',
      accent2: '#7aa0ff',
      accentContrast: '#0c1117',
      inputBg: '#151b24',
      inputBorder: '#232b36',
      inputFg: '#f2f6fb',
      inputPlaceholder: 'rgba(230, 238, 248, 0.4)',
      trackBg: '#1b232e',
      knobBg: '#dfe9f7',
      chipBg: '#171f29',
      chipFg: '#dce4ef',
      divider: 'rgba(255, 255, 255, 0.06)',
      focus: 'rgba(109, 213, 255, 0.35)',
    },
  },
  {
    id: 'atelier',
    label: 'Atelier',
    tier: 'premium',
    mode: 'light',
    hue: 'warm',
    meta: {
      roundness: 0.65,
      density: 1.1,
      temperature: 0.8,
      depth: 0.6,
      contrast: 0.55,
      typography: 'editorial serif',
      saturation: 0.45,
      texture: 'tactile',
      animation: 'elaborate',
    },
    tokens: {
      font: '"Fraunces", "IBM Plex Sans", serif',
      mono: '"IBM Plex Mono", "SF Mono", ui-monospace, monospace',
      panelBg: 'linear-gradient(180deg, #fff8f0 0%, #f5ecdf 100%)',
      panelBorder: '#eadfce',
      panelShadow: '0 18px 34px rgba(112, 86, 60, 0.18)',
      fg: '#3a2a1d',
      muted: '#7c6a5e',
      accent: '#d97757',
      accent2: '#b35b3c',
      accentContrast: '#fff6ef',
      inputBg: '#fffaf4',
      inputBorder: '#e8dac6',
      inputFg: '#362418',
      inputPlaceholder: 'rgba(54, 36, 24, 0.35)',
      trackBg: '#efe1d1',
      knobBg: '#fff3e6',
      chipBg: '#f4e7d7',
      chipFg: '#4a3527',
      divider: 'rgba(85, 60, 40, 0.12)',
      focus: 'rgba(217, 119, 87, 0.3)',
    },
  },
  {
    id: 'pulse',
    label: 'Pulse',
    tier: 'premium',
    mode: 'dark',
    hue: 'neon',
    meta: {
      roundness: 0.45,
      density: 0.9,
      temperature: 0.5,
      depth: 0.8,
      contrast: 0.85,
      typography: 'techno grotesk',
      saturation: 0.9,
      texture: 'noise',
      animation: 'swift',
    },
    tokens: {
      font: '"Sora", "IBM Plex Sans", sans-serif',
      mono: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
      panelBg: 'linear-gradient(180deg, #0b0e14 0%, #111623 100%)',
      panelBorder: '#1a2130',
      panelShadow: '0 20px 46px rgba(0, 0, 0, 0.55)',
      fg: '#e9f1ff',
      muted: '#7c8aa3',
      accent: '#38bdf8',
      accent2: '#f472b6',
      accentContrast: '#081018',
      inputBg: '#131a27',
      inputBorder: '#1d2535',
      inputFg: '#f2f6ff',
      inputPlaceholder: 'rgba(233, 241, 255, 0.4)',
      trackBg: '#1a2232',
      knobBg: '#f2f6ff',
      chipBg: '#141c2a',
      chipFg: '#dbe7ff',
      divider: 'rgba(255, 255, 255, 0.07)',
      focus: 'rgba(56, 189, 248, 0.35)',
    },
  },
  {
    id: 'paper',
    label: 'Paper',
    tier: 'standard',
    mode: 'light',
    hue: 'neutral',
    meta: {
      roundness: 0.35,
      density: 1.15,
      temperature: 0.6,
      depth: 0.35,
      contrast: 0.4,
      typography: 'calm serif',
      saturation: 0.25,
      texture: 'flat',
      animation: 'still',
    },
    tokens: {
      font: '"Newsreader", "IBM Plex Sans", serif',
      mono: '"IBM Plex Mono", "SF Mono", ui-monospace, monospace',
      panelBg: '#fbfaf7',
      panelBorder: '#ebe7de',
      panelShadow: '0 10px 26px rgba(49, 39, 26, 0.08)',
      fg: '#2e2a24',
      muted: '#7b7368',
      accent: '#8b7b6a',
      accent2: '#a58d75',
      accentContrast: '#ffffff',
      inputBg: '#ffffff',
      inputBorder: '#e6dfd3',
      inputFg: '#2e2a24',
      inputPlaceholder: 'rgba(46, 42, 36, 0.35)',
      trackBg: '#e9e2d7',
      knobBg: '#ffffff',
      chipBg: '#f2ede4',
      chipFg: '#3b352c',
      divider: 'rgba(46, 42, 36, 0.1)',
      focus: 'rgba(139, 123, 106, 0.25)',
    },
  },
  {
    id: 'terminal',
    label: 'Terminal',
    tier: 'standard',
    mode: 'dark',
    hue: 'mono',
    meta: {
      roundness: 0.2,
      density: 0.85,
      temperature: 0.45,
      depth: 0.3,
      contrast: 0.9,
      typography: 'mono utilitarian',
      saturation: 0.3,
      texture: 'noise',
      animation: 'still',
    },
    tokens: {
      font: '"IBM Plex Mono", "SF Mono", ui-monospace, monospace',
      mono: '"IBM Plex Mono", "SF Mono", ui-monospace, monospace',
      panelBg: '#0a0f0b',
      panelBorder: '#15331e',
      panelShadow: '0 12px 24px rgba(0, 0, 0, 0.5)',
      fg: '#a7f3d0',
      muted: '#6ee7b7',
      accent: '#34d399',
      accent2: '#10b981',
      accentContrast: '#021309',
      inputBg: '#0c1510',
      inputBorder: '#1a3a26',
      inputFg: '#d1fae5',
      inputPlaceholder: 'rgba(209, 250, 229, 0.4)',
      trackBg: '#0f1c15',
      knobBg: '#a7f3d0',
      chipBg: '#0b1611',
      chipFg: '#b7f7dd',
      divider: 'rgba(167, 243, 208, 0.12)',
      focus: 'rgba(52, 211, 153, 0.35)',
    },
  },
  {
    id: 'clay',
    label: 'Clay',
    tier: 'standard',
    mode: 'light',
    hue: 'warm',
    meta: {
      roundness: 0.85,
      density: 1,
      temperature: 0.75,
      depth: 0.7,
      contrast: 0.35,
      typography: 'soft geometric',
      saturation: 0.35,
      texture: 'tactile',
      animation: 'elaborate',
    },
    tokens: {
      font: '"Nunito", "IBM Plex Sans", sans-serif',
      mono: '"IBM Plex Mono", "SF Mono", ui-monospace, monospace',
      panelBg: 'linear-gradient(180deg, #f6f0ea 0%, #efe6dd 100%)',
      panelBorder: '#e6d9cd',
      panelShadow: '0 14px 30px rgba(120, 96, 74, 0.15)',
      fg: '#3d3026',
      muted: '#7f6d5e',
      accent: '#f08f6b',
      accent2: '#e36c54',
      accentContrast: '#ffffff',
      inputBg: '#fdf8f3',
      inputBorder: '#e6d4c6',
      inputFg: '#3d3026',
      inputPlaceholder: 'rgba(61, 48, 38, 0.35)',
      trackBg: '#ead9cc',
      knobBg: '#fff6ef',
      chipBg: '#f1e4d8',
      chipFg: '#4c3b2f',
      divider: 'rgba(61, 48, 38, 0.1)',
      focus: 'rgba(240, 143, 107, 0.3)',
    },
  },
  {
    id: 'orchard',
    label: 'Orchard',
    tier: 'standard',
    mode: 'palette',
    hue: 'green',
    meta: {
      roundness: 0.5,
      density: 1,
      temperature: 0.65,
      depth: 0.55,
      contrast: 0.55,
      typography: 'fresh humanist',
      saturation: 0.6,
      texture: 'noise',
      animation: 'swift',
    },
    tokens: {
      font: '"Work Sans", "IBM Plex Sans", sans-serif',
      mono: '"IBM Plex Mono", "SF Mono", ui-monospace, monospace',
      panelBg: 'linear-gradient(180deg, #f1f7f2 0%, #e7f1ea 100%)',
      panelBorder: '#d7e6da',
      panelShadow: '0 14px 32px rgba(40, 88, 52, 0.18)',
      fg: '#1e3a2a',
      muted: '#4e6f5c',
      accent: '#3aa45d',
      accent2: '#2f7f4a',
      accentContrast: '#f6fff9',
      inputBg: '#f7fbf7',
      inputBorder: '#d4e3d6',
      inputFg: '#1e3a2a',
      inputPlaceholder: 'rgba(30, 58, 42, 0.35)',
      trackBg: '#d8e6dc',
      knobBg: '#f6fff9',
      chipBg: '#e7f2ea',
      chipFg: '#244634',
      divider: 'rgba(30, 58, 42, 0.1)',
      focus: 'rgba(58, 164, 93, 0.3)',
    },
  },
]

function themeCss(theme) {
  const texture = textures[theme.meta.texture] ?? textures.flat
  const blend = theme.meta.texture === 'tactile'
    ? 'overlay'
    : theme.meta.texture === 'noise'
      ? 'soft-light'
      : 'normal'
  const motion = animations[theme.meta.animation] ?? animations.swift
  return `
settings-panel[theme="${theme.id}"] {
  --s-roundness: ${theme.meta.roundness};
  --s-density: ${theme.meta.density};
  --s-depth: ${theme.meta.depth};
  --s-contrast: ${theme.meta.contrast};
  --s-saturation: ${theme.meta.saturation};
  --s-temp: ${theme.meta.temperature};

  --s-font: ${theme.tokens.font};
  --s-mono: ${theme.tokens.mono};

  --s-bg: ${theme.tokens.panelBg};
  --s-panel-bg: var(--s-bg);
  --s-panel-texture: ${texture};
  --s-panel-texture-blend: ${blend};
  --s-border: ${theme.tokens.panelBorder};
  --s-panel-border-color: var(--s-border);
  --s-panel-shadow: ${theme.tokens.panelShadow};

  --s-fg: ${theme.tokens.fg};
  --s-muted: ${theme.tokens.muted};
  --s-accent: ${theme.tokens.accent};
  --s-accent-2: ${theme.tokens.accent2};
  --s-accent-contrast: ${theme.tokens.accentContrast};

  --s-input-bg: ${theme.tokens.inputBg};
  --s-input-border: ${theme.tokens.inputBorder};
  --s-input-fg: ${theme.tokens.inputFg};
  --s-input-placeholder: ${theme.tokens.inputPlaceholder};

  --s-track-bg: ${theme.tokens.trackBg};
  --s-track-fill: linear-gradient(90deg, ${theme.tokens.accent}, ${theme.tokens.accent2});
  --s-knob-bg: ${theme.tokens.knobBg};

  --s-chip-bg: ${theme.tokens.chipBg};
  --s-chip-fg: ${theme.tokens.chipFg};
  --s-divider: ${theme.tokens.divider};
  --s-focus: ${theme.tokens.focus};

  --s-ease: ${motion.ease};
  --s-speed-fast: ${motion.speedFast};
  --s-speed-slow: ${motion.speedSlow};
}
`
}

const themes = Object.fromEntries(themeList.map((theme) => [theme.id, {
  ...theme,
  css: themeCss(theme),
}]))

const themeCatalog = themeList.map(({ tokens, ...rest }) => rest)

export { themes, themeCatalog }
