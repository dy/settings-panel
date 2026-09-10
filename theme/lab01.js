/**
 * Lab01 theme — frosted glass with gradient borders
 *
 * Inspired by lab01.dev/experiments/01.
 * Frosted translucent panel, gradient border, noise texture, glass controls.
 *
 * The visual language is expressed as DESIGN TOKENS — CSS custom properties on
 * `.s-panel` (see the token block below). Everything downstream references them
 * via var(), so the theme is fully retheme-able: override any token to customise.
 * Token VALUES are derived from the `shade` (its lightness & hue) so a chromatic
 * shade (e.g. gold) yields a coherent warm theme.
 *
 * lab01(axes?) → CSS string
 */

import metrics from './metrics.js'
import defaultCSS from './default.js'
import { parseColor, resolveAccent, clamp } from './color.js'

// Chevron collapse icon — color is url-encoded (%23fff / %23000)
const chevron = (c) => `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='${c}' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E")`

// Noise SVG filter (static)
const noiseSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8'/%3E%3C/filter%3E%3C/svg%3E#n")`

export default function lab01({
  shade = '#111111',
  accent,
  spacing = 1,
  weight = 400,
  roundness = 1.5,
  noise = true,
  size = 1,
  font,
} = {}) {

  const { L, C } = parseColor(shade)
  const dark = L < 0.6
  const colored = C > 0.03 // chromatic shade → tint bevels & shadows with its hue
  const resolved = resolveAccent(accent, shade) || shade
  const ink = dark ? 'white' : 'black' // focus-ring colour

  const r = clamp(roundness, 0, 2)
  const radius = `calc(var(--u) * ${r} * 4)` // 24px at default roundness 1.5
  const chevronMask = chevron('%23000') // shape only — filled via mask
  const overlay = dark ? '' : 'mix-blend-mode: overlay;' // light & colored bevels blend

  // ─────────────────────────────────────────────────────────────────────────
  //  TOKEN VALUES — derived from the shade. Each is assigned to a CSS custom
  //  property in the token block; the rest of the sheet references the vars.
  // ─────────────────────────────────────────────────────────────────────────

  // Surfaces
  const bgLight = colored ? shade : (dark ? '#1F1F1F' : 'oklch(77% 0 0)')
  // sunken / secondary surface — a saturated, slightly-lighter tone of the background
  const surface2 = dark ? 'oklch(from var(--bg) 0.14 c h)' : 'oklch(from var(--bg) calc(l - 0.06) c h)'
  const panelGlass = `hsl(from var(--bg) h s l / .85)`

  // Text (a light/dark TONE of the bg, applied later with alpha)
  const inkBase = `oklch(from var(--bg) ${dark ? '0.95' : '0.23'} ${colored ? 'calc(c * 0.55)' : 'c'} h)`
  const inkMuteBase = `oklch(from var(--bg) ${dark ? '0.88' : '0.18'} ${colored ? 'calc(c * 0.95)' : 'c'} h)`
  const embossCol = dark ? `oklch(from var(--bg) calc(l - 0.1) c h)` : `hsl(from white h s l / ${colored ? '.3' : '.2'})`
  const embossOffset = dark ? '-1px' : '1px'

  // Lines
  const divider = `oklch(from var(--bg) calc(l - 0.04) c h)`

  // Raised glass surface (button / collapse circle / switch thumb)
  const btnBg = colored
    ? `radial-gradient(ellipse at -20px top, hsl(from white h s l / 0.25), hsl(from white h s l / 0)), oklch(from var(--bg-light) calc(l + 0.04) calc(c + 0.008) calc(h + 5))`
    : dark
    ? `radial-gradient(ellipse at -20px top, hsl(from white h s l / 0.05), hsl(from white h s l / 0)), hsl(from var(--bg-light) h s l / .8)`
    : `radial-gradient(ellipse at -20px top, hsl(from white h s l / 0.2), hsl(from white h s l / 0)), hsl(from var(--bg-light) h s l / .95)`
  const btnBgHover = colored
    ? `radial-gradient(ellipse at -20px top, hsl(from white h s l / 0.3), hsl(from white h s l / 0)), oklch(from var(--bg-light) calc(l + 0.08) calc(c + 0.008) calc(h + 5))`
    : dark
    ? `radial-gradient(ellipse at -20px top, hsl(from white h s l / 0.08), hsl(from white h s l / 0)), hsl(from var(--bg-light) h s l / .95)`
    : `radial-gradient(ellipse at -20px top, hsl(from white h s l / 0.28), hsl(from white h s l / 0)), hsl(from var(--bg-light) h s l / 1)`

  // Cast shadows — a warm brown tint for chromatic shades (like the source #88612E),
  // plain black otherwise. The ring is plain low-opacity black (as in the source).
  const sh = (a) => colored ? `oklch(from var(--bg) calc(l - 0.18) c calc(h - 7) / ${a})` : `hsla(0 0% 0% / ${a})`
  const ring = (a) => `hsl(from var(--ring) h s l / ${a})`
  const btnShadow = colored
    ? `inset 0 0 0 1px hsl(from white h s l / .04), 0 0 0 1px ${ring('.15')}, 0px 40px 11px ${sh('.01')}, 0px 26px 10px ${sh('.05')}, 0px 14px 9px ${sh('.17')}, 0px 6px 6px ${sh('.29')}, 0px 2px 4px ${sh('.33')}`
    : dark
    ? `inset 0 0 0 1px hsl(from white h s l / .04), 0 0 0 1px ${ring('.45')}, 0px 40px 11px rgba(0,0,0,0.01), 0px 26px 10px rgba(0,0,0,0.025), 0px 14px 9px rgba(0,0,0,0.1), 0px 6px 6px rgba(0,0,0,0.15), 0px 2px 4px rgba(0,0,0,0.25)`
    : `inset 0 0 0 1px hsl(from white h s l / .04), 0 0 0 1px ${ring('.15')}, 0 1px 1px -.5px hsla(0 0% 0% / 0.1), 0 4.5px 4.5px -2.25px hsla(0 0% 0% / 0.15), 0 18px 18px -9px hsla(0 0% 0% / 0.25)`
  const btnActive = colored
    ? `inset 0 0 0 1px hsl(from white h s l / .04), 0 0 0 1px hsla(0 0% 0% / .15), 0px 8px 10px ${sh('.1')}, 0px 4px 6px ${sh('.2')}, 0px 1px 2px ${sh('.33')}`
    : dark
    ? `inset 0 0 0 1px hsl(from white h s l / .04), 0 0 0 1px hsl(from black h s l / .15), 0px 20px 10px rgba(0,0,0,0.01), 0px 12px 10px rgba(0,0,0,0.05), 0px 6px 9px rgba(0,0,0,0.17), 0px 2px 4px rgba(0,0,0,0.29), 0px 1px 2px rgba(0,0,0,0.33)`
    : `inset 0 0 0 1px hsl(from white h s l / .04), 0 0 0 1px hsl(from black h s l / .15), 0 1px 1px -.5px hsla(0 0% 0% / 0.1), 0 2.5px 4.5px -2.25px hsla(0 0% 0% / 0.15), 0 8px 18px -9px hsla(0 0% 0% / 0.25)`

  // Bevels (gradient borders) — highlights/shadows toned toward the background.
  const beHi = (a) => `oklch(from var(--bg) 0.96 c h / ${a})`
  const beLo = (a) => `oklch(from var(--bg) ${dark ? '0.12' : '0.3'} c h / ${a})`
  const brown = (l) => `oklch(from var(--bg) ${l} c h`
  const btnBevel = colored
    ? `linear-gradient(180deg, ${beHi('.65')}, ${brown(0.38)} / .68) 41%, ${brown(0.5)} / .46) 75%, ${beHi('.25')})`
    : `linear-gradient(180deg, ${beHi('.75')}, ${beLo(dark ? '.48' : '.25')} 41%, ${beLo(dark ? '.26' : '.25')} 75%, ${beHi(dark ? '.25' : '.35')})`
  const panelBevel = colored
    ? `linear-gradient(160deg, oklch(from var(--bg) 0.92 c h / .97), oklch(from var(--bg) 0.28 c h / .46) 19%, oklch(from var(--bg) 0.5 c h) 70%, oklch(from var(--bg) 0.92 c h / .37))`
    : dark
    ? `linear-gradient(160deg, hsl(from white h s l / .30), hsl(from white h s l / .02) 37%, hsl(from white h s l / 0.05) 70%, hsl(from white h s l / .1))`
    : `linear-gradient(160deg, hsl(from white h s l / .77), hsl(from white h s l / 0.2) 19%, hsl(from white h s l / 0.2) 70%, hsl(from white h s l / .3))`

  // Switch glow when checked
  const switchGlow = dark
    ? `rgba(255,255,255,0.082) 0px 5.8px 5.5px -5px, rgba(255,255,255,0.12) 0px 16px 15px -5px`
    : `none`

  // Light orbs (glare) — fixed-size, hue-shifted toward the sky; lighter top-left.
  const glareCol = (a) => `oklch(from var(--bg) 0.92 calc(c * 1.18) calc(h + 28) / ${a})`
  const glareTL = (a) => `oklch(from var(--bg) 0.95 calc(c * 0.85) calc(h + 28) / ${a})`
  const glare = dark
    ? `radial-gradient(300px 280px at 58px 20px, ${glareTL('.16')}, transparent 72%), radial-gradient(420px 330px at 102% 102%, ${glareCol('.1')}, transparent 72%)`
    : `radial-gradient(300px 280px at 58px 20px, ${glareTL('.5')}, transparent 72%), radial-gradient(420px 330px at 102% 102%, ${glareCol('.36')}, transparent 72%)`

  // Sunken recess bevel (groove) — a dark bg-derived inset + a faint top lip.
  // Shared by image-card plates, fields, slider grooves, and switch tracks.
  const sink = (a) => `oklch(from var(--bg) calc(l - 0.11) c h / ${a})`
  const trackBevel = `inset 0 1px 1px ${sink('.55')}, inset 0 1px 4px ${sink('.35')}, 0 1px 0 hsl(from white h s l / ${dark ? '.1' : '.25'})`

  // Theme-card recessed plate — a dark frame BEHIND the photo carrying that same
  // groove (leaving the image crisp, as the reference does with <img> + plate).
  const cardFrame = dark ? 'hsl(from black h s l / .9)' : 'hsl(from black h s l / .14)'
  const cardRing  = 'hsl(from white h s l / 1)' // selection ring — white on every theme

  // ── Helpers (reference tokens, not raw values) ──
  const fg = (a) => `oklch(from var(--ink) l c h / ${a})`        // primary text @ alpha
  const muteFg = (a) => `oklch(from var(--ink-mute) l c h / ${a})` // muted text @ alpha
  // Raised surface shorthand — primary button and collapse circle share it
  const surface = `background: var(--surface-bg); box-shadow: var(--surface-shadow);`
  // Native range thumbs cannot carry pseudo-elements, so both thumb types use
  // the same layered face and gradient border, with no extra bevel element.
  const thumbSurface = `box-sizing: border-box; background: var(--thumb-bg); border: var(--surface-bevel-w) solid transparent; box-shadow: var(--thumb-shadow);`
  // Gradient-border bevel mixin (background-origin/clip must be border-box)
  const bevelRing = (grad, w = 'var(--bevel-w)', blend = overlay) => `
    border: ${w} solid transparent;
    background: ${grad} border-box border-box;
    -webkit-mask: linear-gradient(black, black) padding-box, linear-gradient(black, black);
    mask: linear-gradient(black, black) padding-box, linear-gradient(black, black);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    ${blend}`
  const bevel = (grad, w = 'var(--bevel-w)', blend = overlay) => `
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    ${bevelRing(grad, w, blend)}`
  const ovl = 'mix-blend-mode: overlay;' // raised-button bevel always blends overlay

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, {fontSize: 13, controlHeight: 38, inset: 12, rowGap: 16, sectionGap: 24, panelPadding: 24, fontFamily: "'Geist Mono', 'Geist', system-ui, sans-serif"})}

  /* ════════════════ Design tokens — override any to retheme ════════════════ */
  /* Palette */
  --bg: ${shade};                /* panel surface */
  --bg-light: ${bgLight};        /* raised control surface */
  --surface-2: ${surface2};      /* sunken / secondary surface (cancel button, switch track) */
  --accent: ${resolved};
  --accent-fg: white;            /* text on a solid-accent fill (toggle On) */
  --panel-glass: ${panelGlass};  /* translucent panel fill, under the glare */

  /* Text */
  --ink: ${inkBase};             /* primary text (used with alpha) */
  --ink-mute: ${inkMuteBase};    /* hints / muted text */
  --hint: ${muteFg('.64')};      /* hint text — muted ink @ .64 */
  --emboss: ${embossCol};        /* embossed text-shadow colour */
  --emboss-offset: ${embossOffset}; /* emboss direction — sunken (dark) vs raised (light) */
  --text-shadow: 0 var(--emboss-offset) 0 var(--emboss);
  --text-shadow-secondary: ${(dark || colored) ? '0 -1px 0 hsl(from black h s l / .35)' : 'var(--text-shadow)'};

  /* Lines & fields */
  --ring: black;                 /* button outline ring (used with alpha) */
  --focus-ring: ${ink};          /* focus-visible outline colour */
  --field: var(--surface-2);              /* shared inactive track / input fill */
  --field-hover: color-mix(in srgb, var(--field), var(--bg) 12%); /* input hover/focus fill */
  --divider: ${divider};         /* separators */
  --footer-hi: ${dark ? 'hsl(from white h s l / .11)' : 'hsl(from white h s l / .2)'}; /* footer-divider top highlight */

  /* Raised glass surface (primary button, collapse circle, switch thumb) */
  --surface-bg: ${btnBg};
  --surface-bg-hover: ${btnBgHover};
  --surface-shadow: ${btnShadow};
  --surface-active: ${btnActive};
  --surface-bevel: ${btnBevel};  /* gradient for the ::after bevel */
  --panel-bevel: ${panelBevel};  /* the panel's own gradient border */
  --glare: ${glare};
  --thumb-bg: radial-gradient(ellipse at 20% 0, hsl(from white h s l / ${dark ? '.08' : '.25'}), transparent) padding-box, linear-gradient(var(--bg-light), var(--bg-light)) padding-box, var(--surface-bevel) border-box;
  --thumb-shadow: ${dark ? 'var(--surface-shadow), 0 0 0 1px oklch(from var(--bg) 0.04 c h)' : 'var(--surface-shadow)'}; /* slider and switch thumbs — dark gets an extra contrast ring */
  --switch-glow: ${switchGlow};  /* checked-switch ambient glow (dark theme only) */
  --switch-on-bg: ${dark ? 'hsl(from white h s l / .83)' : 'hsl(from black h s l / .85)'};
  --seg-bg: ${dark ? 'hsl(from black h s l / .58)' : 'hsl(from black h s l / .1)'}; /* segmented unselected fill */
  --btn-secondary-fg: ${(dark || colored) ? 'hsl(from white h s l / .9)' : fg('.83')};
  --track-bevel: ${trackBevel};  /* recessed groove — fields, tracks, swatches & card plates */
  --card-frame: ${cardFrame};    /* recessed plate behind image-card photos */
  --field-selected: var(--track-bevel), 0 0 0 var(--card-ring-w) var(--card-ring);
  --card-ring: ${cardRing};      /* image-card selection ring */

  /* Geometry & type */

  --weight: ${weight};
  --roundness: ${r};
  --r: ${radius};

  --pad-i: max(var(--pad), calc(var(--r) / 2));
  --track-w: calc(44 * var(--length));
  --track-h: calc(22 * var(--length));
  --thumb: calc(16 * var(--length));
  --thumb-inset: calc(3 * var(--length));
  --fold: calc(34 * var(--length));
  --font: var(--font-family);
  --font-head: 'Geist', system-ui, sans-serif;
  --blur: calc(20 * var(--length));                  /* backdrop-filter glass blur */
  --noise-opacity: ${dark ? '.1' : '.15'};
  --fs: var(--font-size);                    /* base type size */
  --fs-sm: calc(12 * var(--length));                 /* slider readout */
  --fs-head: calc(20 * var(--length));               /* panel title */
  --tracking-head: -0.025em;
  --icon-size: calc(16 * var(--length));             /* chevron glyph */
  --pad-head: calc(var(--u) * (4 + 2 * var(--spacing)));            /* header padding — stable through collapse */
  --content-pad: var(--pad-head);
 /* space between controls */
  --bevel-w: calc(1 * var(--length));                /* panel gradient-border width */
  --surface-bevel-w: calc(1.5 * var(--length));      /* raised-surface rim width (buttons, thumb, fold icon) */
  --outline-w: calc(1.5 * var(--length));            /* focus-ring width */
  --outline-gap: calc(2 * var(--length));            /* focus-ring offset — default */
  --outline-gap-track: calc(1.5 * var(--length));    /* focus-ring offset — boolean track */
  --outline-gap-card: calc(6 * var(--space));       /* focus-ring offset — image-card button */
  --ctrl-h: var(--control-height);                /* button / segmented-button height */
  --slider-h: calc(6 * var(--length));
  --slider-thumb: var(--thumb);
  --checkbox: calc(18 * var(--length));
  --checkbox-fill: calc(10 * var(--length));
  --number-w: calc(70 * var(--length));
  --card-h: calc(90 * var(--length));
  --card-r: calc(12 * var(--length));
  --card-inset: calc(-3 * var(--length));            /* image-card plate outset */
  --card-ring-w: calc(1.5 * var(--length));
  --card-label-gap: calc(var(--u) * (2 + var(--spacing)));
  --group-gap: calc(12 * var(--space));             /* button-group / image-card option gap */
  --seg-pad: calc(var(--u) * 1.5);               /* segmented-button horizontal padding */
  --btn-pad: var(--inset);                         /* button-group button horizontal padding */
  --color-gap: calc(8 * var(--space));
  /* ═════════════════════════════════════════════════════════════════════════ */

  color-scheme: ${dark ? 'dark' : 'light'};
  position: relative;
  background: var(--glare), var(--panel-glass);
  -webkit-backdrop-filter: blur(var(--blur));
  backdrop-filter: blur(var(--blur));
  border-radius: var(--r);
  max-width: calc(var(--u) * 111);

  font-weight: calc(var(--weight) + 100);

  line-height: calc(var(--u) * 4);
  color: ${fg('.83')};
  padding: 0;
  min-width: 0;
  -webkit-font-smoothing: antialiased;
  isolation: isolate;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Gradient border (bevel) ── */
  &::after { ${bevel('var(--panel-bevel)')} }

  /* ── Noise texture ── */
  ${noise ? `&::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: 10;
    clip-path: inset(0 round var(--r));
    mix-blend-mode: screen;
    opacity: var(--noise-opacity);
    filter: ${noiseSvg} grayscale(100%);
  }` : ''}

  *, *::before, *::after { background-origin: border-box; }

  /* ── Panel header ── */
  > summary, > .s-panel-title {
    font-family: var(--font-head);
    font-size: var(--fs-head);
    font-weight: var(--weight);
    letter-spacing: var(--tracking-head);
    color: ${fg('.85')};
    text-shadow: var(--text-shadow);
    /* Constant padding (incl. bottom) so the header height never changes on
       toggle — only the content collapses, avoiding a layout jump. */
    padding: var(--pad-head);
  }
  > summary::after { display: none; } /* suppress default chevron */

  /* Circular glass collapse button — shares the raised surface with the buttons.
     The circle stays put; only the icon flips. */
  .s-fold-icon {
    position: relative;
    margin-left: auto;
    flex-shrink: 0;
    width: var(--fold); height: var(--fold);
    border-radius: 50%;
    ${surface}
    transition: box-shadow .12s, background .12s, transform .12s;
    &::after { ${bevel('var(--surface-bevel)', 'var(--surface-bevel-w)', ovl)} }
    /* Chevron glyph: ink shape (::after) over a 1px-offset emboss copy (::before).
       Two masked layers — NOT mask+drop-shadow, which Chromium clips the shadow off. */
    i {
      position: absolute;
      inset: 0;
      z-index: 1;
      &::before, &::after {
        content: '';
        position: absolute;
        inset: 0;
        -webkit-mask: ${chevronMask} center / var(--icon-size) no-repeat;
        mask: ${chevronMask} center / var(--icon-size) no-repeat;
        transition: transform .2s;
      }
      &::before { background: var(--emboss); transform: translateY(var(--emboss-offset)); } /* bevel */
      &::after { background: ${fg('.9')}; }                                            /* chevron */
    }
  }
  /* Hover + press — identical to the action buttons */
  .s-fold-icon:hover { background: var(--surface-bg-hover); }
  .s-fold-icon:active { box-shadow: var(--surface-active); transform: translateY(1px); }
  /* On open the chevron flips — but the bevel keeps its screen direction: the
     offset is applied AFTER the rotation, so the light stays on the same side. */
  &[open] .s-fold-icon i::after { transform: rotate(180deg); }
  &[open] .s-fold-icon i::before { transform: translateY(var(--emboss-offset)) rotate(180deg); }

  .s-panel-content {
    padding: 0 var(--content-pad) var(--content-pad);
    gap: var(--row-gap);
  }

  /* ── Layout ── */
  .s-control { gap: var(--column-gap); align-items: center; }
  .s-label-group {
    min-width: 0;
    flex: 0 0 auto;
    padding: 0;
    gap: calc(var(--u) * 0.5);
    line-height: 1.3;
  }
  .s-label {
    font-size: var(--fs);
    color: ${fg('.9')};
    text-shadow: var(--text-shadow);
  }
  .s-hint {
    font-size: var(--fs);
    color: var(--hint);
    opacity: 1;
    text-shadow: var(--text-shadow);
  }
  .s-input { gap: calc(var(--u) * var(--spacing)); align-items: center; }

  /* ── Interactive elements ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--field);
    box-shadow: var(--track-bevel);
    border: none;
    border-radius: calc(var(--r) * 0.5);
    color: inherit;
    font-family: inherit;
    font-size: var(--fs);
    &::placeholder { color: hsl(from currentColor h s l / .4); }
    &:hover { background-color: var(--field-hover); }
    &:focus { background-color: var(--field); box-shadow: var(--field-selected); outline: none; }
  }
  input[type="text"], input[type="number"], select {
    padding: var(--pad-i) calc(var(--pad));
    height: var(--ctrl-h);
  }
  input[type="number"] { font-variant-numeric: tabular-nums; }

  /* ── Buttons ── */
  button {
    position: relative;
    -webkit-appearance: none;
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--ctrl-h);
    border-radius: calc(var(--r) * 0.5);
    font-family: inherit;
    font-size: var(--fs);
    cursor: pointer;
    transition: translate .1s;
    border: none;
    color: ${fg('.83')};
    text-shadow: var(--text-shadow);

    /* kill the base theme's filter:brightness hover — lab01 uses its own bg hover */
    &:hover, &:active { filter: none; }
    &:active { translate: 0 1px; }
    &:focus-visible { outline: var(--outline-w) solid var(--focus-ring); outline-offset: var(--outline-gap); transition: none; }
  }

  /* Opacity and color-alpha sliders share the switch's raised thumb. */
  .s-slider input[type="range"], .s-color .s-alpha {
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: var(--slider-thumb); height: var(--slider-thumb);
      border-radius: 50%;
      ${thumbSurface}
      cursor: pointer;
      transition: filter 120ms, box-shadow 120ms;
    }
    &::-moz-range-thumb {
      width: var(--slider-thumb); height: var(--slider-thumb);
      border-radius: 50%;
      ${thumbSurface}
      cursor: pointer;
      transition: filter 120ms, box-shadow 120ms;
    }
    &:hover::-webkit-slider-thumb { filter: brightness(1.08); }
    &:hover::-moz-range-thumb { filter: brightness(1.08); }
    &:active::-webkit-slider-thumb, &.s-scrubbing::-webkit-slider-thumb { box-shadow: var(--surface-active); }
    &:active::-moz-range-thumb, &.s-scrubbing::-moz-range-thumb { box-shadow: var(--surface-active); }
  }

  /* ── Slider ── */
  .s-slider {
    input[type="range"] {
      background: var(--field);
      box-shadow: var(--track-bevel);
      border-radius: calc(var(--r) * 0.5);
      appearance: none;
      -webkit-appearance: none;
      height: var(--slider-h);
      &:focus-visible { outline: var(--outline-w) solid var(--focus-ring); outline-offset: var(--outline-gap); }

    }
    .s-readout {
      flex: 0 0 7ch; width: 7ch; min-width: 7ch; height: auto; padding: 0;
      background: transparent; box-shadow: none; border: none; border-radius: 0;
      color: inherit; font-size: var(--fs-sm); opacity: .85; font-variant-numeric: tabular-nums; text-align: right;
      &:hover, &:focus { background: transparent; }
      &:focus { box-shadow: var(--field-selected); outline: none; }
    }
    .s-track { height: var(--ctrl-h); }
  }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    cursor: pointer;
    .s-label-group { flex: 1; width: auto; max-width: none; }
    .s-input { flex: 0 0 auto; cursor: pointer; align-self: center; }
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &:has(input:focus-visible) .s-track { outline: var(--outline-w) solid var(--focus-ring); outline-offset: var(--outline-gap-track); transition: none; }

    &.s-switch {
      /* 44×22 recessed track, 16px glass thumb centred (3px inset) */
      .s-track {
        width: var(--track-w); height: var(--track-h);
        border: 0; /* reset base switch border so the thumb's inset is from the outer edge */
        border-radius: 50em;
        position: relative;
        cursor: pointer;
        /* recess fill shares the secondary surface so track == cancel button */
        background: var(--surface-2);
        box-shadow: var(--track-bevel);
        transition: background .2s, box-shadow .2s;

        /* One raised face, shared with both native slider thumbs. */
        &::before {
          content: '';
          position: absolute;
          left: var(--thumb-inset); top: var(--thumb-inset);
          margin: 0;
          width: var(--thumb); height: var(--thumb);
          border-radius: 50%;
          transform: translateX(0);
          transition: transform .2s;
          ${thumbSurface}
        }
        &::after { content: none; }
        &:hover::before { filter: brightness(1.08); }
        &:active::before { box-shadow: var(--surface-active); }
      }
      &:has(input:checked) .s-track {
        background: var(--switch-on-bg);
        box-shadow: var(--switch-glow);
        &::before { transform: translateX(calc(var(--track-w) - var(--thumb) - var(--thumb-inset) * 2)); }
      }
    }

    &.s-toggle {
      .s-track {
        width: auto; height: auto;
        padding: var(--pad-i) calc(var(--pad));
        border-radius: calc(var(--r) * 0.5);
        background: var(--field);
        cursor: pointer;
        position: relative;
        overflow: hidden;
        &::before {
          content: '';
          position: absolute;
          inset: -1px;
          background: var(--accent);
          opacity: 0;
          transition: opacity 140ms;
        }
        &::after { content: 'Off'; position: relative; transition: color 140ms; font-size: var(--fs); }
      }
      &:has(input:checked) .s-track {
        &::before { opacity: 1; }
        &::after { content: 'On'; color: var(--accent-fg); }
      }
    }

    &.s-checkbox {
      .s-track {
        width: var(--checkbox); height: var(--checkbox);
        border-radius: calc(var(--r) * 0.3);
        background: var(--field);
        position: relative;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        &::after {
          content: '';
          width: var(--checkbox-fill); height: var(--checkbox-fill);
          border-radius: calc(var(--r) * 0.2);
          background: transparent;
          transition: background 140ms;
        }
      }
      &:has(input:checked) .s-track::after { background: var(--accent); }
    }
  }

  /* ── Select ── */
  .s-select {
    select {
      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
      flex: 1;
      padding-right: calc(var(--u) * 8);
      background-image: ${chevron(dark ? '%23ddd' : '%23333')};
      background-position: right calc(var(--u) * 3) center;
      background-size: calc(var(--u) * 3);
      background-repeat: no-repeat;
    }
    &.s-segmented button {
      min-width: 0;
      background: transparent;
      border-radius: calc(var(--r) * 0.5);
      padding: 0 var(--seg-pad);
      color: inherit;
      font-size: var(--fs);
      height: var(--ctrl-h);
      &::after {
        content: '';
        position: absolute;
        z-index: -1;
        inset: 0;
        border-radius: inherit;
        background: var(--seg-bg);
      }
      &.s-selected {
        ${surface}
        color: inherit;
      }
    }

    /* Image-card picker: segmented options carrying background images.
       Frame is a plate behind the photo (::before, negative z) — recess shadows
       land in the frame, the photo stays crisp; selection adds a bright ring. */
    &.s-segmented:has(button[style*="background-image"]) {
      flex-direction: column;
      align-items: stretch;
      gap: var(--card-label-gap);
      .s-label-group { flex: none; width: auto; max-width: none; }
      .s-input { gap: var(--group-gap); }
      button {
        flex: 1;
        height: var(--card-h);
        padding: 0;
        position: relative;
        border-radius: var(--card-r);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        box-shadow: none;
        &::after { display: none; } /* hide the segmented pill fill */
        &::before {                 /* recessed plate behind the photo */
          content: '';
          position: absolute;
          inset: var(--card-inset);
          z-index: -1;
          border-radius: calc(var(--card-r) - var(--card-inset));
          background: var(--card-frame);
          box-shadow: var(--track-bevel);
          transition: box-shadow .14s;
        }
        &:focus-visible { outline: var(--outline-w) solid var(--focus-ring); outline-offset: var(--outline-gap-card); }
        &.s-selected::before { box-shadow: var(--field-selected); }
      }
    }

    &.s-checkboxes {
      .s-input label {
        color: inherit;
        cursor: pointer;
      }
      .s-track {
        background: var(--field);
        border-radius: calc(var(--r) * 0.3);
      }
      label:has(input:checked) .s-track::after { background: var(--accent); }
    }
  }

  /* ── Color ── */
  .s-color:is(.s-picker, .s-rgba) .s-color-input {
    gap: var(--color-gap);
    input[type="color"] {
      position: static; flex: none;
      width: var(--ctrl-h); height: var(--ctrl-h);
      padding: calc(var(--u));
      appearance: none; -webkit-appearance: none;
      background: var(--field); box-shadow: var(--track-bevel);
      border: none; border-radius: calc(var(--r) * 0.5);
      cursor: pointer;
      &::-webkit-color-swatch-wrapper { padding: 0; }
      &::-webkit-color-swatch { border: none; border-radius: calc(var(--r) * 0.3); }
      &::-moz-color-swatch { border: none; border-radius: calc(var(--r) * 0.3); }
      &:focus { box-shadow: var(--field-selected); outline: none; }
    }
    input[type="text"] { flex: 1; min-width: 0; width: 0; padding: 0 var(--pad); }
  }

  .s-color.s-rgba .s-color-input {
    flex-wrap: wrap;
    input[type="text"] { min-width: 10ch; }
  }

  /* ── Button group ── */
  .s-button {
    .s-input { flex: 1; gap: var(--group-gap); flex-wrap: wrap; }
    button {
      flex: 1;
      min-width: min-content;
      white-space: nowrap;
      padding: 0 var(--btn-pad);
      ${surface}
      color: ${fg('.83')};
      text-shadow: var(--text-shadow);
      transition: background .12s, box-shadow .12s, translate .1s;
      &:hover { background: var(--surface-bg-hover); }
      &:active { box-shadow: var(--surface-active); }
      &:not(.s-secondary)::after { ${bevel('var(--surface-bevel)', 'var(--surface-bevel-w)', ovl)} } /* bevel rim */
    }
    &.s-secondary button, button.s-secondary {
      /* Secondary fill = --surface-2. White font on dark/colored fills (emboss on TOP,
         engraved), dark font on a light (gray) fill. No border/shadow. */
      background: var(--surface-2);
      box-shadow: none;
      color: var(--btn-secondary-fg);
      text-shadow: var(--text-shadow-secondary);
      &::after { display: none; }
      /* darken the surface, keep its hue & chroma (a black overlay would desaturate) */
      &:hover { background: oklch(from var(--surface-2) calc(l - 0.04) c h); }
      &:active { box-shadow: none; }
    }
  }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; width: var(--number-w); }
    .s-step { display: none; }
  }

  /* ── Text ── */
  .s-text input[type="text"] { flex: 1; }

  /* ── Folder ── */
  .s-folder {
    > summary {
      font-size: var(--fs);
      font-weight: calc(var(--weight) + 100);
      color: ${fg('.83')};
      padding: calc(var(--u) * var(--spacing) * 2) 0;
      opacity: 1;
    }
    .s-content { gap: var(--row-gap); padding-block: var(--row-gap); }
  }

  /* ── Footer separator (trailing action row) ── */
  .s-panel-content > .s-button:last-child {
    position: relative;
    padding-top: var(--content-pad);
    &::before, &::after {
      content: '';
      position: absolute;
      left: 0; right: 0;
      height: calc(1 * var(--length));
    }
    &::before { top: 0; background: var(--divider); }
    &::after { top: calc(1 * var(--length)); background: var(--footer-hi); mix-blend-mode: overlay; }
  }
}`

  return defaultCSS({ size, spacing, font }) + '\n' + overrides
}
