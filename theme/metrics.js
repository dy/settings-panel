/** Shared dimensions; each theme supplies its native baseline in pixels. */

/** Body text px at size 1, in every theme. */
export const BODY = 13

const axis = (v, fallback) => typeof v === 'number' && Number.isFinite(v) ? Math.min(2, Math.max(.5, v)) : fallback

/**
 * Pixels per baseline pixel: the size axis (clamped to .5–2) times BODY over the theme's apparent body px,
 * so size 1 sets every theme's body at BODY. For themes computing lengths in JS; CSS reads it as --size.
 */
export const scale = (size, body = 14) => +(axis(size, 1) * BODY / body).toFixed(6)

export default function metrics({ size = 1, spacing = 1, font } = {}, {
  unit = 4, fontSize = 14, body = fontSize, fontFamily = 'system-ui, -apple-system, sans-serif',
  lineHeight = 16, controlHeight = 28, inset = 6, rowGap = 6,
  columnGap = 8, sectionGap = 12, panelPadding = 16,
} = {}) {
  return `
  --size: ${scale(size, body)};
  --spacing: ${axis(spacing, 1)};
  --length: calc(1px * var(--size));
  --space: calc(var(--length) * var(--spacing));
  --u: calc(${unit} * var(--length));
  --font-family: ${typeof font === 'string' && font.trim() ? font : fontFamily};
  --font-size: calc(${fontSize} * var(--length));
  --line-height: calc(${lineHeight} * var(--length));
  --control-height: calc(var(--line-height) + ${controlHeight - lineHeight} * var(--space));
  --inset: calc(${inset} * var(--space));
  --row-gap: calc(${rowGap} * var(--space));
  --column-gap: calc(${columnGap} * var(--space));
  --section-gap: calc(${sectionGap} * var(--space));
  --panel-padding: calc(${panelPadding} * var(--space));
  --lh: var(--line-height);
  --pad: var(--inset);
  `
}
