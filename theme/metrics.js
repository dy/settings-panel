/** Shared dimensions; each theme supplies its native baseline in pixels. */
export default function metrics({ size = 1, spacing = 1, font } = {}, {
  unit = 4, fontSize = 14, fontFamily = 'system-ui, -apple-system, sans-serif',
  lineHeight = 16, controlHeight = 28, inset = 6, rowGap = 6,
  columnGap = 8, sectionGap = 12, panelPadding = 16,
} = {}) {
  const axis = (v, fallback) => typeof v === 'number' && Number.isFinite(v) ? Math.min(2, Math.max(.5, v)) : fallback
  return `
  --size: ${axis(size, 1)};
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
