/**
 * Theme mixins — reusable CSS-fragment builders shared across themes.
 *
 * Each returns a CSS string. Themes compose them so a new production-quality
 * theme is ~150 lines instead of re-deriving these tricks by hand.
 */

/**
 * Gradient-border ring: paints `grad` in the border box only, via mask-composite.
 * Use `bevel()` for an absolutely-positioned ::after layer, or `bevelRing()` inline.
 */
export const bevelRing = (grad, w = '1px', blend = '') => `
  border: ${w} solid transparent;
  background: ${grad} border-box border-box;
  -webkit-mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
  mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  ${blend}`

export const bevel = (grad, w = '1px', blend = '') => `
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  ${bevelRing(grad, w, blend)}`

/** Hard offset shadow (brutalism) — no blur. */
export const hardShadow = (x = '4px', y = '4px', color = '#000') => `${x} ${y} 0 ${color}`

/** Paired neumorphic shadow — dark bottom-right + light top-left. */
export const neuShadow = (dist, blur, darkC, lightC) =>
  `${dist} ${dist} ${blur} ${darkC}, calc(-1 * ${dist}) calc(-1 * ${dist}) ${blur} ${lightC}`

/** Inset (pressed/sunken) neumorphic shadow. */
export const neuInset = (dist, blur, darkC, lightC) =>
  `inset ${dist} ${dist} ${blur} ${darkC}, inset calc(-1 * ${dist}) calc(-1 * ${dist}) ${blur} ${lightC}`
