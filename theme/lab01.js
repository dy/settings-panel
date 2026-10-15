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
import { form } from './default.js'
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
  const colored = C > 0.015 // any visible hue (slate, sage, ivory, gold) tints; near-greys stay neutral
  // The source ships three palettes (lab01.dev/experiments/01, experiment-01.css):
  // dark (#111 panel, #1F1F1F controls, white ink), light (oklch 77%, black ink) and
  // gold (#BA965A, #2F2212 ink). Dark shades take the dark recipe, greys the light one
  // and light shades with a hue the gold one. Gold's colours are written relative to
  // the shade (lightness offset, chroma ratio, hue offset from #BA965A), so #BA965A
  // renders the source values exactly and every other hue keeps their relationships.
  const gold = !dark && colored
  const resolved = resolveAccent(accent, shade) || shade

  const r = clamp(roundness, 0, 2)
  const radius = `calc(var(--u) * ${r} * 4)` // 24px at default roundness 1.5
  const chevronMask = chevron('%23000') // shape only — filled via mask
  const overlay = dark ? '' : 'mix-blend-mode: overlay;' // light & gold bevels blend

  const white = a => `hsl(from white h s l / ${a})`
  const black = a => `hsl(from black h s l / ${a})`
  const signed = n => `${n < 0 ? '-' : '+'} ${Math.abs(n)}`
  // A gold-palette colour relative to the shade: tone(0, 1, 0) is the shade itself.
  const tone = (dL, kC, dH, a = 1) => `oklch(from var(--bg) calc(l ${signed(dL)}) calc(c * ${kC}) calc(h ${signed(dH)})${a < 1 ? ` / ${a}` : ''})`

  // ─────────────────────────────────────────────────────────────────────────
  //  TOKEN VALUES: each is assigned to a CSS custom property in the token
  //  block; the rest of the sheet references the vars.
  // ─────────────────────────────────────────────────────────────────────────

  // Surfaces: controls sit on --bg-light, a lighter step of a dark shade (#111 → #1F1F1F)
  // and the shade itself otherwise, under the panel's translucent glass.
  const bgLight = dark ? 'oklch(from var(--bg) calc(l + 0.0616) c h)' : 'var(--bg)'
  const panelGlass = `hsl(from var(--bg) h s l / .85)`

  // Ink: the source's contrast-higher (text) and contrast-highest (focus, switch on).
  const inkBase = dark ? 'white' : gold ? 'oklch(from var(--bg) 0.2631 calc(c * 0.375) calc(h - 8))' : 'black'
  const inkHighest = dark ? 'white' : gold ? '#101010' : 'black'
  const textShadow = dark ? 'none' : `0 1px 0 ${white(gold ? '.15' : '.2')}`
  const titleShadow = dark ? 'none' : `0 1px 0 ${white('.2')}`
  const btnTextShadow = dark ? `0 -1px 0 ${black('.5')}` : `0 1px 0 ${white(gold ? '.3' : '.2')}`
  // Fold icon: the glyph's embossed copy (the source's drop-shadow on the svg)
  const embossCol = dark ? black('.5') : white(gold ? '.5' : '.4')
  const embossOffset = dark ? '-1px' : '1px'

  // Secondary (sunken) button: a plate under the label. Gold's white label reads on
  // its mid-tone plate; a light shade with a hue gets a light plate, which takes ink.
  const secondaryBg = dark ? black('.58') : gold ? tone(-0.1134, 0.825, -4.3, .78) : black('.1')
  const plateDark = gold && L - 0.1134 < 0.66
  const secondaryFg = plateDark ? white('.8') : 'hsl(from var(--ink) h s l / .83)'
  const secondaryShadow = plateDark ? `0 -1px 0 ${black('.15')}` : dark ? 'none' : `0 1px 0 ${white('.2')}`

  // Raised glass surface (primary button, fold circle, switch and slider thumbs).
  const glow = a => `radial-gradient(ellipse at -20px top, ${white(a)}, ${white('0')})`
  const btnBg = dark ? `${glow('0.05')}, hsl(from var(--bg-light) h s l / .8)`
    : gold ? `${glow('0.25')}, var(--bg-light)` : `${glow('0.2')}, hsl(from var(--bg-light) h s l / .95)`
  const btnBgHover = `${glow(dark ? '0.1' : gold ? '0.35' : '0.3')}, var(--bg-light)`

  // Cast shadows: black, or gold's warm brown (#88612E) relative to the shade.
  const sh = a => gold ? tone(-0.1704, 0.945, -7.9, a) : `rgba(0, 0, 0, ${a})`
  const edge = ring => `inset 0 0 0 1px ${white('.04')}, 0 0 0 1px ${black(ring)}`
  const btnShadow = dark
    ? `${edge('.45')}, 0px 40px 11px ${sh(0.01)}, 0px 26px 10px ${sh(0.025)}, 0px 14px 9px ${sh(0.1)}, 0px 6px 6px ${sh(0.15)}, 0px 2px 4px ${sh(0.25)}`
    : gold
    ? `${edge('.15')}, 0px 40px 11px ${sh(0.01)}, 0px 26px 10px ${sh(0.05)}, 0px 14px 9px ${sh(0.17)}, 0px 6px 6px ${sh(0.29)}, 0px 2px 4px ${sh(0.33)}`
    : `${edge('.15')}, 0 1px 1px -.5px hsla(0 0% 0% / 0.1), 0 4.5px 4.5px -2.25px hsla(0 0% 0% / 0.15), 0 18px 18px -9px hsla(0 0% 0% / 0.25)`
  const btnActive = dark || gold
    ? `${edge('.15')}, 0px 20px 10px ${sh(0.01)}, 0px 12px 10px ${sh(0.05)}, 0px 6px 9px ${sh(0.17)}, 0px 2px 4px ${sh(0.29)}, 0px 1px 2px ${sh(0.33)}`
    : `${edge('.15')}, 0 1px 1px -.5px hsla(0 0% 0% / 0.1), 0 2.5px 4.5px -2.25px hsla(0 0% 0% / 0.15), 0 8px 18px -9px hsla(0 0% 0% / 0.25)`

  // Bevels (gradient borders)
  const btnBevel = dark
    ? `linear-gradient(180deg, ${white('.75')}, ${black('.48')} 41%, ${black('.26')} 75%, ${white('.25')})`
    : gold
    ? `linear-gradient(180deg, ${white('.65')}, ${tone(-0.2707, 0.492, -1, .68)} 41%, ${tone(-0.1622, 0.651, -1.8, .46)} 75%, ${white('.25')})`
    : `linear-gradient(180deg, ${white('.75')}, ${black('.25')} 41%, ${black('.25')} 75%, ${white('.35')})`
  const panelBevel = dark
    ? `linear-gradient(160deg, ${white('.30')}, ${white('.02')} 37%, ${white('0.05')} 70%, ${white('.1')})`
    : gold
    ? `linear-gradient(160deg, ${tone(0.2276, 1.211, 12.4, .97)}, ${tone(-0.3859, 0.272, -4.6, .46)} 19%, ${tone(-0.1429, 0.675, -7.8)} 70%, ${tone(0.2276, 1.211, 12.4, .37)})`
    : `linear-gradient(160deg, ${white('.77')}, ${white('0.2')} 19%, ${white('0.2')} 70%, ${white('.3')})`

  // Switch and slider thumbs share the source's switch marker: the raised surface,
  // its bevel baked into the border (thumbs cannot carry a pseudo-element). Dark
  // lifts the checked marker to a solid face with a deeper rim.
  const thumbFace = (a, fill, rim) => `${glow(a)} padding-box, linear-gradient(${fill}, ${fill}) padding-box, ${rim} border-box`
  const thumbBg = dark ? thumbFace('0.15', 'hsl(from var(--bg-light) h s l / .8)', btnBevel)
    : thumbFace(gold ? '0.25' : '0.2', gold ? 'var(--bg-light)' : 'hsl(from var(--bg-light) h s l / .95)', btnBevel)
  const thumbBgOn = dark ? thumbFace('0', 'var(--bg-light)', `linear-gradient(180deg, ${white('0.4')}, ${black('.88')} 41%, ${black('.46')} 75%, ${white('.25')})`) : thumbBg
  const thumbShadowOn = dark ? `0 0 0 1px ${black('0.85')}, 0px 40px 11px ${sh(0.01)}, 0px 26px 10px ${sh(0.025)}, 0px 14px 9px ${sh(0.1)}, 0px 6px 6px ${sh(0.15)}, 0px 2px 4px ${sh(0.25)}` : btnShadow

  // Recesses. The switch track is the source's; fields, slider grooves and swatches
  // share it. The image-card well (plate) has its own lighter recipe. Gold's are
  // #101010 blended by overlay in the source; here the opaque colour that blend
  // yields, since a track carries its thumb and a field its text.
  const trackBg = dark ? black('.95') : gold ? tone(-0.0686, 1.024, -7.8) : black('.1')
  const trackBevel = dark
    ? `0 1px 0 ${white('.1')}, inset 0 1px 0 ${black('.95')}, inset 0 1px 4px ${black('.4')}`
    : `0 1px 0 ${white('.2')}, inset 0 1px 0 ${black(gold ? '.07' : '.1')}, inset 0 1px 4px ${black(gold ? '.08' : '.25')}`
  const cardFrame = dark ? black('.9') : gold ? tone(-0.0515, 1.026, -5.4) : black('.1')
  const plateShadow = dark
    ? `0 1px 0 ${white('.15')}, inset 0 1px 0 ${black('1')}, inset 0 1px 4px ${black('.25')}`
    : `0 1px 0 ${white('.2')}, inset 0 1px 0 ${black(gold ? '.07' : '.15')}, inset 0 1px 4px ${black(gold ? '.08' : '.1')}`
  const cardRing = 'hsl(from white h s l / 1)' // selection ring — white on every theme

  // Switch on: the source's checked track keeps its recess's outer highlight.
  const switchOnBg = dark ? white('.83') : gold ? inkHighest : `hsl(from ${inkHighest} h s l / .85)`
  const switchOnShadow = dark
    ? `0 1px 0 ${white('.1')}, 0px 5.8px 5.5px -5px hsla(0 0% 100% / 0.0825), 0px 16px 15px -5px hsl(0 0% 100% / 0.12)`
    : `0 1px 0 ${white('.2')}`

  // Footer rule: a dark and a light hairline, both blended by overlay.
  const dividerLo = dark ? black('.75') : gold ? tone(-0.3164, 0.276, -14.8, .25) : black('.175')
  const dividerHi = white(dark ? '.15' : gold ? '.1' : '.2')

  // The source's two light orbs over the dialog's corners: a white 196px disc under
  // blur(150px), blended by overlay. A Gaussian of σ 150px over a 98px radius peaks
  // at 1 - e^(-98²/2·150²) ≈ .21 and falls off as e^(-d²/2σ²), sampled here as a ramp.
  const orb = at => `radial-gradient(circle at ${at}, ${[0, 100, 150, 200, 250, 300, 400, 460]
    .map(d => `${white(+(0.213 * Math.exp(-d * d / 45000)).toFixed(3))} calc(${d} * var(--length))`).join(', ')})`
  const lights = `${orb('calc(64 * var(--length)) calc(33 * var(--length))')}, ${orb('calc(100% - 20 * var(--length)) calc(100% + 2 * var(--length))')}`

  // ── Helpers (reference tokens, not raw values) ──
  const fg = (a) => `hsl(from var(--ink) h s l / ${a})` // ink @ alpha, as the source writes it
  // Raised surface shorthand — primary button and collapse circle share it
  const surface = `background: var(--surface-bg); background-blend-mode: var(--surface-blend); box-shadow: var(--surface-shadow);`
  // Native range thumbs cannot carry pseudo-elements, so both thumb types use
  // the same layered face and gradient border, with no extra bevel element.
  const thumbSurface = `box-sizing: border-box; background: var(--thumb-bg); background-blend-mode: var(--surface-blend); border: var(--surface-bevel-w) solid transparent; box-shadow: var(--thumb-shadow);`
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
  --accent: ${resolved};
  --panel-glass: ${panelGlass};  /* translucent panel fill */
  --lights: ${lights};          /* the source's two light orbs, blended by overlay */

  /* Text */
  --ink: ${inkBase};             /* primary text (used with alpha) */
  --ink-highest: ${inkHighest};  /* strongest ink: focus ring, gold/light switch on */
  --text: ${fg(dark || gold ? '.83' : '.85')}; /* labels */
  --hint: ${fg(dark ? '.35' : '.5')}; /* hints */
  --placeholder: ${fg(dark ? '.45' : '.6')}; /* placeholders: ink at .4 (3.9:1 dark, 2.5:1 light) moved to 4.5:1 on a field */
  --text-shadow: ${textShadow};
  --title-shadow: ${titleShadow};
  --btn-text-shadow: ${btnTextShadow};
  --emboss: ${embossCol};        /* fold-icon glyph emboss colour */
  --emboss-offset: ${embossOffset}; /* emboss direction: above (dark) or below (light) */

  /* Lines & fields */
  --ring: black;                 /* button outline ring (used with alpha) */
  --focus-ring: var(--ink-highest); /* focus-visible outline colour */
  --field: ${trackBg};           /* shared inactive track / input fill */
  --field-hover: color-mix(in srgb, var(--field), var(--bg) 12%); /* input hover fill */
  --divider-lo: ${dividerLo};    /* footer rule: dark hairline */
  --divider-hi: ${dividerHi};    /* footer rule: light hairline below it */

  /* Raised glass surface (primary button, collapse circle, switch thumb) */
  --surface-bg: ${btnBg};
  --surface-bg-hover: ${btnBgHover};
  --surface-blend: ${gold ? 'overlay, normal' : 'normal'}; /* gold lays its glow over the face by overlay */
  --surface-shadow: ${btnShadow};
  --surface-active: ${btnActive};
  --surface-bevel: ${btnBevel};  /* gradient for the ::after bevel */
  --panel-bevel: ${panelBevel};  /* the panel's own gradient border */
  --thumb-bg: ${thumbBg};        /* switch and slider thumbs */
  --thumb-shadow: ${btnShadow};
  --thumb-bg-on: ${thumbBgOn};   /* checked switch thumb */
  --thumb-shadow-on: ${thumbShadowOn};
  --switch-on-bg: ${switchOnBg};
  --switch-on-fg: ${dark ? 'black' : 'white'};  /* lettering on the on-fill (toggle On) */
  --switch-on-shadow: ${switchOnShadow};
  --secondary-bg: ${secondaryBg}; /* sunken secondary button, segmented unselected fill */
  --btn-secondary-fg: ${secondaryFg};
  --btn-secondary-shadow: ${secondaryShadow};
  --track-bevel: ${trackBevel};  /* recess: switch track, fields, grooves & swatches */
  --card-frame: ${cardFrame};    /* image-card well behind the photo */
  --plate-shadow: ${plateShadow}; /* image-card well recess */
  --field-selected: var(--plate-shadow), 0 0 0 var(--card-ring-w) var(--card-ring); /* selected card, focused field */
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
  --bevel-w: calc(1.25 * var(--length));             /* panel gradient-border width */
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
  --card-label-gap: calc(var(--u) * (3 + var(--spacing)));
  --group-gap: calc(12 * var(--space));             /* button-group / image-card option gap */
  --seg-pad: calc(var(--u) * 1.5);               /* segmented-button horizontal padding */
  --seg-inset: calc(2 * var(--length));          /* segmented track around the raised selection */
  --btn-pad: var(--inset);                         /* button-group button horizontal padding */
  --color-gap: calc(8 * var(--space));
  /* ═════════════════════════════════════════════════════════════════════════ */

  color-scheme: ${dark ? 'dark' : 'light'};
  position: relative;
  background: var(--lights), var(--panel-glass);
  background-blend-mode: overlay, overlay;
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
    text-shadow: var(--title-shadow);
    /* The source's header stretches its title to the fold circle's height with
       the text at the top of that box, not centred on the circle. */
    align-items: flex-start;
    line-height: normal;
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
      &::after { background: ${fg('.83')}; }                                           /* chevron */
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
    gap: 0;
    line-height: normal; /* the source's text lines */
  }
  .s-label {
    font-size: var(--fs);
    color: var(--text);
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
    &::placeholder { color: var(--placeholder); }
    &:hover { background-color: var(--field-hover); }
    &:focus { background-color: var(--field); box-shadow: var(--field-selected); outline: none; }
  }
  input[type="text"], input[type="number"], select {
    padding: 0 var(--pad); /* the fixed height centers the text; block padding would clip it at compact sizes */
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
    line-height: normal;
    cursor: pointer;
    transition: translate .1s;
    border: none;
    color: ${fg('.83')};
    text-shadow: var(--btn-text-shadow);

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
    /* interval: the slider's groove, the span between the thumbs filled as a switch that is on */
    &.s-multiple .s-interval-track { height: var(--slider-h); margin: 0; background: var(--field); box-shadow: var(--track-bevel); border-radius: calc(var(--r) * 0.5);
      &::before { content: ''; position: absolute; inset-block: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--switch-on-bg); box-shadow: var(--switch-on-shadow); border-radius: inherit; }
      input[type="range"] { height: 100%; background: none; box-shadow: none; } }
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
        background: var(--field);
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
        box-shadow: var(--switch-on-shadow);
        &::before { transform: translateX(calc(var(--track-w) - var(--thumb) - var(--thumb-inset) * 2)); background: var(--thumb-bg-on); box-shadow: var(--thumb-shadow-on); }
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
          background: var(--switch-on-bg);
          opacity: 0;
          transition: opacity 140ms;
        }
        &::after { content: 'Off'; position: relative; transition: color 140ms; font-size: var(--fs); }
      }
      &:has(input:checked) .s-track {
        &::before { opacity: 1; }
        &::after { content: 'On'; color: var(--switch-on-fg); }
      }
    }
  }

  /* Radio: the native dot in the on-fill, like every on-state here */
  .s-select.s-radio input[type="radio"] { accent-color: var(--switch-on-bg); }

  /* Checkbox: one box for the boolean and each option of the checkboxes list */
  .s-boolean.s-checkbox .s-track, .s-checkboxes .s-track {
    flex: none;
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
  /* checked: the core takes the switch's on fill, the source's on-state, legible on every material */
  .s-boolean.s-checkbox:has(input:checked) .s-track::after, .s-checkboxes input:checked + .s-track::after { background: var(--s-color, var(--switch-on-bg)); }
  .s-checkboxes input:focus-visible + .s-track { outline: var(--outline-w) solid var(--focus-ring); outline-offset: var(--outline-gap-track); }

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
    /* One sunken track (the secondary plate); the selection is a raised plate inside it. */
    &.s-segmented:not(:has(button[style*="background-image"])) .s-input {
      gap: 0;
      padding: var(--seg-inset);
      border-radius: calc(var(--r) * 0.5 + var(--seg-inset));
      background: var(--secondary-bg);
    }
    &.s-segmented button {
      min-width: 0;
      background: transparent;
      border-radius: calc(var(--r) * 0.5);
      padding: 0 var(--seg-pad);
      color: inherit;
      font-size: var(--fs);
      height: calc(var(--ctrl-h) - 2 * var(--seg-inset));
      &.s-selected {
        ${surface}
        color: inherit;
        &::after { ${bevel('var(--surface-bevel)', 'var(--surface-bevel-w)', ovl)} }
      }
    }

    /* Image-card picker: segmented options carrying background images.
       Frame is a plate behind the photo (::before, negative z) — recess shadows
       land in the frame, the photo stays crisp; selection adds a bright ring. */
    &.s-segmented:has(button[style*="background-image"]) {
      flex-direction: column;
      align-items: stretch;
      gap: var(--card-label-gap);
      margin-bottom: calc(44 * var(--space) - var(--row-gap)); /* a card picker closes its section, as the source's */
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
        background-blend-mode: normal; /* the photo is never blended with the raised surface */
        box-shadow: none;
        &::after { display: none; } /* no raised bevel over the photo */
        &::before {                 /* recessed plate behind the photo */
          content: '';
          position: absolute;
          inset: var(--card-inset);
          z-index: -1;
          border-radius: calc(var(--card-r) - var(--card-inset));
          background: var(--card-frame);
          box-shadow: var(--plate-shadow);
          transition: box-shadow .14s;
        }
        &:focus-visible { outline: var(--outline-w) solid var(--focus-ring); outline-offset: var(--outline-gap-card); }
        &.s-selected::before { box-shadow: var(--field-selected); }
      }
    }

    &.s-checkboxes {
      .s-input { align-items: flex-start; }
      .s-input label {
        color: inherit;
        cursor: pointer;
      }
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
      text-shadow: var(--btn-text-shadow);
      transition: background .12s, box-shadow .12s, translate .1s;
      &:hover { background: var(--surface-bg-hover); }
      &:active { box-shadow: var(--surface-active); }
      &:not(.s-secondary)::after { ${bevel('var(--surface-bevel)', 'var(--surface-bevel-w)', ovl)} } /* bevel rim */
    }
    &.s-secondary button, button.s-secondary {
      /* The source's sunken plate under the label; it has no hover state. */
      background: var(--secondary-bg);
      box-shadow: none;
      color: var(--btn-secondary-fg);
      text-shadow: var(--btn-secondary-shadow);
      &::after { display: none; }
      &:hover { background: var(--secondary-bg); }
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
      position: relative;
      font-size: var(--fs);
      font-weight: calc(var(--weight) + 100);
      color: ${fg('.83')};
      padding: calc(var(--u) * var(--spacing) * 2) 0;
      border-bottom: none;
      opacity: 1;
    }
    /* A collapsed folder closes with the footer's rule: dark and light hairlines, overlaid. */
    &:not([open], .s-section) > summary::before {
      content: '';
      position: absolute;
      left: 0; right: 0; bottom: calc(-1 * var(--length));
      height: calc(2 * var(--length));
      background: linear-gradient(var(--divider-lo) 50%, var(--divider-hi) 50%);
      mix-blend-mode: overlay;
      pointer-events: none;
    }
    .s-content { gap: var(--row-gap); padding-block: var(--row-gap); }
  }

  /* ── Footer separator (trailing action row) ── */
  .s-panel-content > .s-button:last-child {
    position: relative;
    margin-top: calc(var(--content-pad) - var(--row-gap));
    padding-top: var(--content-pad);
    &::before, &::after {
      content: '';
      position: absolute;
      left: 0; right: 0;
      height: calc(1 * var(--length));
    }
    &::before { top: calc(-1 * var(--length)); background: var(--divider-lo); mix-blend-mode: overlay; }
    &::after { top: 0; background: var(--divider-hi); mix-blend-mode: overlay; }
  }
}`

  return form({ size, spacing, font }) + '\n' + overrides
}
