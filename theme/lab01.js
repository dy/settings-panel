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
  const field = `hsl(from black h s l / ${dark ? '.3' : '.06'})` // sunken input/checkbox fill

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
  // Shared by the switch track and the theme-card plate so both read identically.
  const sink = (a) => `oklch(from var(--bg) calc(l - 0.11) c h / ${a})`
  const trackBevel = `inset 0 1px 1px ${sink('.55')}, inset 0 1px 4px ${sink('.35')}, 0 1px 0 hsl(from white h s l / ${dark ? '.1' : '.25'})`

  // Theme-card recessed plate — a dark frame BEHIND the photo carrying that same
  // groove (leaving the image crisp, as the reference does with <img> + plate).
  const cardFrame = dark ? 'hsl(from black h s l / .9)' : 'hsl(from black h s l / .14)'
  const cardRing  = 'hsl(from white h s l / 1)' // selection ring — white on every theme

  // ── Helpers (reference tokens, not raw values) ──
  const fg = (a) => `oklch(from var(--ink) l c h / ${a})`        // primary text @ alpha
  const muteFg = (a) => `oklch(from var(--ink-mute) l c h / ${a})` // muted text @ alpha
  const textShadow = `0 ${embossOffset} 0 var(--emboss)`
  // Raised surface shorthand — primary button, collapse circle, switch thumb share it
  const surface = `background: var(--surface-bg); box-shadow: var(--surface-shadow);`
  // Gradient-border bevel mixin (background-origin/clip must be border-box)
  const bevelRing = (grad, w = '1px', blend = overlay) => `
    border: ${w} solid transparent;
    background: ${grad} border-box border-box;
    -webkit-mask: linear-gradient(black, black) padding-box, linear-gradient(black, black);
    mask: linear-gradient(black, black) padding-box, linear-gradient(black, black);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    ${blend}`
  const bevel = (grad, w = '1px', blend = overlay) => `
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    ${bevelRing(grad, w, blend)}`
  const ovl = 'mix-blend-mode: overlay;' // raised-button bevel always blends overlay

  const overrides = `.s-panel {
  /* ════════════════ Design tokens — override any to retheme ════════════════ */
  /* Palette */
  --bg: ${shade};                /* panel surface */
  --bg-light: ${bgLight};        /* raised control surface */
  --surface-2: ${surface2};      /* sunken / secondary surface (cancel button, switch track) */
  --accent: ${resolved};

  /* Text */
  --ink: ${inkBase};             /* primary text (used with alpha) */
  --ink-mute: ${inkMuteBase};    /* hints / muted text */
  --hint: ${muteFg('.64')};      /* hint text — muted ink @ .64 */
  --emboss: ${embossCol};        /* embossed text-shadow colour */

  /* Lines & fields */
  --ring: black;                 /* button outline ring (used with alpha) */
  --field: ${field};             /* sunken input / checkbox fill */
  --divider: ${divider};         /* separators */

  /* Raised glass surface (primary button, collapse circle, switch thumb) */
  --surface-bg: ${btnBg};
  --surface-bg-hover: ${btnBgHover};
  --surface-shadow: ${btnShadow};
  --surface-active: ${btnActive};
  --surface-bevel: ${btnBevel};  /* gradient for the ::after bevel */
  --panel-bevel: ${panelBevel};  /* the panel's own gradient border */
  --glare: ${glare};

  /* Geometry & type */
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: ${r};
  --r: ${radius};
  --pad: calc(var(--u) * (2 + 1 * var(--spacing)));
  --pad-i: max(var(--pad), calc(var(--r) / 2));
  --track-w: 44px;
  --track-h: 22px;
  --thumb: 16px;
  --fold: 34px;
  --font: 'Geist Mono', 'Geist', system-ui, sans-serif;
  --font-head: 'Geist', system-ui, sans-serif;
  /* ═════════════════════════════════════════════════════════════════════════ */

  color-scheme: ${dark ? 'dark' : 'light'};
  position: relative;
  background: var(--glare), ${panelGlass};
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border-radius: var(--r);
  max-width: calc(var(--u) * 111);
  font-family: var(--font);
  font-weight: 500;
  font-size: 13px;
  line-height: calc(var(--u) * 4);
  color: ${fg('.83')};
  padding: 0;
  min-width: 0;
  -webkit-font-smoothing: antialiased;
  isolation: isolate;

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
    mix-blend-mode: screen;
    opacity: ${dark ? '.1' : '.15'};
    filter: ${noiseSvg} grayscale(100%);
  }` : ''}

  *, *::before, *::after { background-origin: border-box; }

  /* ── Panel header ── */
  > summary, > .s-panel-title {
    font-family: var(--font-head);
    font-size: 20px;
    font-weight: normal;
    letter-spacing: -0.025em;
    color: ${fg('.85')};
    text-shadow: ${textShadow};
    /* Constant padding (incl. bottom) so the header height never changes on
       toggle — only the content collapses, avoiding a layout jump. */
    padding: 1.5rem;
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
    &::after { ${bevel('var(--surface-bevel)', '1.5px', ovl)} }
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
        -webkit-mask: ${chevronMask} center / 16px no-repeat;
        mask: ${chevronMask} center / 16px no-repeat;
        transition: transform .2s;
      }
      &::before { background: var(--emboss); transform: translateY(${embossOffset}); } /* bevel */
      &::after { background: ${fg('.9')}; }                                            /* chevron */
    }
  }
  /* Hover + press — identical to the action buttons */
  .s-fold-icon:hover { background: var(--surface-bg-hover); }
  .s-fold-icon:active { box-shadow: var(--surface-active); transform: translateY(1px); }
  /* On open the chevron flips — but the bevel keeps its screen direction: the
     offset is applied AFTER the rotation, so the light stays on the same side. */
  &[open] .s-fold-icon i::after { transform: rotate(180deg); }
  &[open] .s-fold-icon i::before { transform: translateY(${embossOffset}) rotate(180deg); }

  .s-panel-content {
    padding: 0 24px 24px;
    gap: calc(var(--u) * 8);
  }

  /* ── Layout ── */
  .s-control { gap: calc(var(--u) * var(--spacing)); align-items: center; }
  .s-label-group {
    min-width: 0;
    flex: 0 0 auto;
    padding: 0;
    gap: calc(var(--u) * 0.5);
    line-height: 1.3;
  }
  .s-label {
    font-size: 13px;
    color: ${fg('.9')};
    text-shadow: ${textShadow};
  }
  .s-hint {
    font-size: 13px;
    color: var(--hint);
    text-shadow: ${textShadow};
  }
  .s-input { gap: calc(var(--u) * var(--spacing)); align-items: center; }

  /* ── Interactive elements ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--field);
    border: none;
    border-radius: calc(var(--r) * 0.5);
    color: inherit;
    font-family: inherit;
    font-size: 13px;
    &::placeholder { color: hsl(from currentColor h s l / .4); }
    &:hover { background: hsl(from black h s l / ${dark ? '.4' : '.1'}); }
    &:focus { background: hsl(from black h s l / ${dark ? '.4' : '.1'}); outline: none; }
    &:focus-visible { outline: 1.5px solid ${ink}; outline-offset: 2px; }
  }
  input[type="text"], input[type="number"], select {
    padding: var(--pad-i) calc(var(--pad));
    height: auto;
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
    height: 38px;
    border-radius: calc(var(--r) * 0.5);
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    transition: translate .1s;
    border: none;
    color: ${fg('.83')};
    text-shadow: ${textShadow};

    /* kill the base theme's filter:brightness hover — lab01 uses its own bg hover */
    &:hover, &:active { filter: none; }
    &:active { translate: 0 1px; }
    &:focus-visible { outline: 1.5px solid ${ink}; outline-offset: 2px; transition: none; }
  }

  /* ── Slider ── */
  .s-slider {
    input[type="range"] {
      background: var(--field);
      border-radius: calc(var(--r) * 0.5);
      appearance: none;
      -webkit-appearance: none;
      height: 6px;
      &:focus-visible { outline: 1.5px solid ${ink}; outline-offset: 2px; }
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px; height: 18px;
        border-radius: 50%;
        ${surface}
        cursor: pointer;
        border: none;
        transition: background 120ms, box-shadow 120ms, transform 120ms;
      }
      &::-moz-range-thumb {
        width: 18px; height: 18px;
        border-radius: 50%;
        background: var(--bg-light);
        border: 1px solid hsl(from ${ink} h s l / .15);
        cursor: pointer;
        transition: background 120ms, transform 120ms;
      }
      &:hover::-webkit-slider-thumb { background: var(--surface-bg-hover); }
      &:active::-webkit-slider-thumb, &.s-scrubbing::-webkit-slider-thumb { box-shadow: var(--surface-active); transform: scale(0.96); }
      &:active::-moz-range-thumb, &.s-scrubbing::-moz-range-thumb { transform: scale(0.96); }
    }
    .s-readout { color: inherit; font-size: 12px; opacity: .7; font-variant-numeric: tabular-nums; }
    .s-track { height: auto; }
  }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    cursor: pointer;
    .s-label-group { flex: 1; width: auto; max-width: none; }
    .s-input { flex: 0 0 auto; cursor: pointer; align-self: center; }
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &:has(input:focus-visible) .s-track { outline: 1.5px solid ${ink}; outline-offset: 1.5px; transition: none; }

    &.s-switch {
      /* 44×22 recessed track, 16px glass thumb centred (3px inset) */
      .s-track {
        width: var(--track-w); height: var(--track-h);
        border: 0; /* reset base switch border so the thumb's 3px inset is from the outer edge */
        border-radius: 50em;
        position: relative;
        cursor: pointer;
        /* recess fill shares the secondary surface so track == cancel button */
        background: var(--surface-2);
        box-shadow: ${trackBevel};
        transition: background .2s, box-shadow .2s;

        /* Thumb: fill (::before) + shared gradient bevel ring (::after), concentric. */
        &::before, &::after {
          content: '';
          position: absolute;
          left: 3px; top: 3px;
          margin: 0;
          width: var(--thumb); height: var(--thumb);
          border-radius: 50%;
          transform: translateX(0);
          transition: transform .2s;
        }
        /* thumb fill = shared surface, plus (dark theme) an extra dark border so the
           dark thumb reads against the white on-state track */
        &::before { ${surface}${dark ? ' box-shadow: var(--surface-shadow), 0 0 0 1px oklch(from var(--bg) 0.04 c h);' : ''} }
        &::after { pointer-events: none; ${bevelRing('var(--surface-bevel)', '1.5px', ovl)} }
        &:hover::before { background: var(--surface-bg-hover); } /* same hover as buttons */
      }
      &:has(input:checked) .s-track {
        background: ${dark ? 'hsl(from white h s l / .83)' : 'hsl(from black h s l / .85)'};
        box-shadow: ${switchGlow};
        &::before { transform: translateX(calc(var(--track-w) - var(--thumb) - 6px)); }
        &::after { transform: translateX(calc(var(--track-w) - var(--thumb) - 6px)); }
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
        &::after { content: 'Off'; position: relative; transition: color 140ms; font-size: 13px; }
      }
      &:has(input:checked) .s-track {
        &::before { opacity: 1; }
        &::after { content: 'On'; color: white; }
      }
    }

    &.s-checkbox {
      .s-track {
        width: 18px; height: 18px;
        border-radius: calc(var(--r) * 0.3);
        background: var(--field);
        position: relative;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        &::after {
          content: '';
          width: 10px; height: 10px;
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
    }
    &.s-segmented button {
      background: transparent;
      border-radius: calc(var(--r) * 0.5);
      padding: 0 12px;
      color: inherit;
      font-size: 13px;
      height: 38px;
      &::after {
        content: '';
        position: absolute;
        z-index: -1;
        inset: 0;
        border-radius: inherit;
        background: ${dark ? 'hsl(from black h s l / .58)' : 'hsl(from black h s l / .1)'};
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
      margin-bottom: calc(var(--u) * 3);
      .s-label-group { flex: none; width: auto; max-width: none; margin-bottom: 16px; }
      .s-input { gap: 12px; }
      button {
        flex: 1;
        height: 90px;
        padding: 0;
        position: relative;
        border-radius: 12px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        box-shadow: none;
        &::after { display: none; } /* hide the segmented pill fill */
        &::before {                 /* recessed plate behind the photo */
          content: '';
          position: absolute;
          inset: -3px;
          z-index: -1;
          border-radius: 15px;
          background: ${cardFrame};
          box-shadow: ${trackBevel};
          transition: box-shadow .14s;
        }
        &:focus-visible { outline: 1.5px solid ${ink}; outline-offset: 6px; }
        &.s-selected::before { box-shadow: ${trackBevel}, 0 0 0 1.5px ${cardRing}; }
      }
    }

    &.s-checkboxes {
      label {
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
  .s-color.s-picker .s-color-input {
    gap: 8px;
    input[type="color"] { position: static; }
    input[type="text"] { flex: 1; min-width: 0; }
  }

  /* ── Button group ── */
  .s-button {
    .s-input { flex: 1; gap: 12px; }
    button {
      flex: 1;
      padding: 0 20px;
      ${surface}
      color: ${fg('.83')};
      text-shadow: ${textShadow};
      transition: background .12s, box-shadow .12s, translate .1s;
      &:hover { background: var(--surface-bg-hover); }
      &:active { box-shadow: var(--surface-active); }
      &:not(.s-secondary)::after { ${bevel('var(--surface-bevel)', '1.5px', ovl)} } /* bevel rim */
    }
    &.s-secondary button, button.s-secondary {
      /* Secondary fill = --surface-2. White font on dark/colored fills (emboss on TOP,
         engraved), dark font on a light (gray) fill. No border/shadow. */
      background: var(--surface-2);
      box-shadow: none;
      color: ${(dark || colored) ? 'hsl(from white h s l / .9)' : fg('.83')};
      text-shadow: ${(dark || colored) ? '0 -1px 0 hsl(from black h s l / .35)' : textShadow};
      &::after { display: none; }
      /* darken the surface, keep its hue & chroma (a black overlay would desaturate) */
      &:hover { background: oklch(from var(--surface-2) calc(l - 0.04) c h); }
      &:active { box-shadow: none; }
    }
  }

  /* ── Number ── */
  .s-number {
    input[type="number"] { width: 70px; }
    .s-step { display: none; }
  }

  /* ── Text ── */
  .s-text input[type="text"] { flex: 1; }

  /* ── Folder ── */
  .s-folder {
    > summary {
      font-size: 13px;
      font-weight: 500;
      color: ${fg('.83')};
      padding: calc(var(--u) * var(--spacing) * 2) 0;
      opacity: 1;
    }
    .s-content { gap: 0; }
  }

  /* ── Footer separator (trailing action row) ── */
  .s-panel-content > .s-button:last-child {
    position: relative;
    padding-top: 24px;
    &::before, &::after {
      content: '';
      position: absolute;
      left: 0; right: 0;
      height: 1px;
    }
    &::before { top: 0; background: var(--divider); }
    &::after { top: 1px; background: ${dark ? 'hsl(from white h s l / .11)' : 'hsl(from white h s l / .2)'}; mix-blend-mode: overlay; }
  }
}`

  return defaultCSS() + '\n' + overrides
}
