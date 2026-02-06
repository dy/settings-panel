/**
 * Default theme — returns nested style object
 *
 * defaultTheme(params?) → { '.s-panel': { ... } }
 *
 * Composable: merge(defaultTheme(), { '.s-panel': { background: 'red' } })
 * Serializable: css(defaultTheme()) → CSS string
 */

const moods = {
  day:      { bgL: .97,  surL: .995, txtL: .18, dimL: .52, dark: false, hShift: 0   },
  midnight: { bgL: .13,  surL: .18,  txtL: .93, dimL: .58, dark: true,  hShift: 0   },
  evening:  { bgL: .17,  surL: .22,  txtL: .88, dimL: .55, dark: true,  hShift: 30  },
  golden:   { bgL: .955, surL: .98,  txtL: .22, dimL: .50, dark: false, hShift: -15 },
  dawn:     { bgL: .94,  surL: .97,  txtL: .25, dimL: .50, dark: false, hShift: 10  },
}

const mkTexture = (isDark) => {
  const c = isDark ? '255,255,255' : '0,0,0'
  const a = isDark ? '.04' : '.05'
  return {
    flat: 'none',
    dots: `url("data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='6' cy='6' r='.6' fill='rgba(${c},${a})'/%3E%3C/svg%3E")`,
    crosses: `url("data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 4v8M4 8h8' stroke='rgba(${c},${a})' stroke-width='.6'/%3E%3C/svg%3E")`,
  }
}

const lerp = (a, b, t) => a + (b - a) * t
const px = v => v + 'px'

export default function defaultTheme({
  mood = 'day',
  accent = 220,
  texture = 'flat',
  density = .5,
  weight = .5,
  depth = .4,
  roundness = .5,
} = {}) {
  const m = moods[mood] || moods.day
  const h = accent + m.hShift
  const dk = m.dark

  // Color palette (OKLCH)
  const bg      = `oklch(${m.bgL} .005 ${h})`
  const surface = `oklch(${m.surL} .003 ${h})`
  const text    = `oklch(${m.txtL} .015 ${h})`
  const dim     = `oklch(${m.dimL} .015 ${h})`
  const border  = `oklch(${dk ? m.surL + .06 : m.bgL - .08} .01 ${h})`
  const accentC = `oklch(${dk ? .72 : .58} .18 ${h})`
  const accentK = dk ? `oklch(.15 .03 ${h})` : `oklch(.98 .01 ${h})`
  const inputBg = `oklch(${dk ? m.surL - .03 : m.surL - .025} .005 ${h})`
  const inputBd = `oklch(${dk ? m.surL + .07 : m.bgL - .1} .01 ${h})`
  const trackBg = `oklch(${dk ? m.surL - .04 : m.bgL - .06} .008 ${h})`
  const knob    = dk ? `oklch(.9 .015 ${h})` : `oklch(.99 .005 ${h})`
  const focus   = `oklch(${dk ? .72 : .58} .12 ${h} / .35)`
  const divider = dk ? 'oklch(1 0 0 / .06)' : 'oklch(0 0 0 / .06)'
  const inlay   = dk ? 'oklch(1 0 0 / .04)' : 'oklch(0 0 0 / .04)'

  // Layout tokens
  const sp1   = px(lerp(4, 8, density))
  const sp2   = px(lerp(6, 12, density))
  const sp3   = px(lerp(10, 18, density))
  const ctrlH = px(lerp(24, 34, density))
  const bw    = px(lerp(1, 2.5, weight))
  const fw    = Math.round(lerp(400, 600, weight))
  const fwB   = Math.round(lerp(500, 800, weight))
  const shY   = px(lerp(0, 10, depth))
  const shBl  = px(lerp(0, 24, depth))
  const shA   = lerp(0, dk ? .35 : .15, depth)
  const rad   = px(lerp(2, 14, roundness))
  const radSm = px(lerp(2, 8, roundness))
  const tex   = mkTexture(dk)[texture] || 'none'

  const trans = 'border-color 140ms, box-shadow 140ms'
  const mono  = "ui-monospace, 'SF Mono', monospace"

  // Shared input base
  const inputBase = {
    background: inputBg,
    border: `1px solid ${inputBd}`,
    'border-radius': radSm,
    color: text,
    padding: '6px 8px',
    font: 'inherit',
    'font-size': '12.5px',
    transition: trans,
    '&::placeholder': { color: dim, opacity: '.6' },
    '&:focus-visible': {
      outline: 'none',
      'border-color': 'var(--accent)',
      'box-shadow': '0 0 0 2px var(--focus)',
    },
  }

  // Thumb base (shared between -webkit and -moz)
  const thumb = {
    width: '14px', height: '14px',
    background: knob,
    'border-radius': '50%',
    border: '2px solid var(--accent)',
    'box-shadow': '0 1px 6px oklch(0 0 0 / .2)',
    cursor: 'grab',
  }

  return { '.s-panel': {
    '--accent': accentC,
    '--accent-c': accentK,
    '--focus': focus,

    color: text,
    background: surface,
    'background-image': tex,
    border: `${bw} solid ${border}`,
    'border-radius': rad,
    'box-shadow': `0 ${shY} ${shBl} oklch(0 0 0 / ${shA})`,
    padding: sp3,
    font: `${fw} 13px/1.35 system-ui, -apple-system, sans-serif`,
    'min-width': '260px',
    position: 'relative',
    isolation: 'isolate',
    '-webkit-font-smoothing': 'antialiased',

    '*, *::before, *::after': { 'box-sizing': 'border-box' },

    // ── Control row ──
    '.s-control': {
      display: 'flex',
      'align-items': 'center',
      gap: sp2,
      padding: `calc(${sp1} * .75) 0`,
      'min-height': ctrlH,
      margin: '0',
      border: '0',
      '& + .s-control': { 'border-top': `1px solid ${divider}` },
    },
    '.s-label': {
      flex: '0 0 auto',
      'min-width': '80px',
      'font-weight': '' + fwB,
      color: text,
    },
    '.s-hint': { 'font-size': '11px', color: dim },
    '.s-input': {
      flex: '1',
      display: 'flex',
      'align-items': 'center',
      gap: `calc(${sp1} * .6)`,
    },

    // ── Inputs ──
    'input[type="text"]': inputBase,
    'input[type="number"]': inputBase,
    textarea: inputBase,
    select: inputBase,
    'button:focus-visible': {
      outline: 'none',
      'box-shadow': '0 0 0 2px var(--focus)',
    },

    // ── Boolean ──
    '.s-boolean': {
      'input[type="checkbox"]': { position: 'absolute', opacity: '0', 'pointer-events': 'none' },
      '.s-track': {
        width: '36px', height: '20px',
        background: trackBg,
        'border-radius': '999px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 140ms',
        'box-shadow': `inset 0 0 0 1px ${inputBd}`,
        '&::after': {
          content: "''",
          position: 'absolute',
          width: '14px', height: '14px',
          background: knob,
          'border-radius': '50%',
          top: '3px', left: '3px',
          transition: 'transform 140ms',
          'box-shadow': '0 1px 4px oklch(0 0 0 / .2)',
        },
      },
      '&:has(input:checked) .s-track': {
        background: 'var(--accent)',
        '&::after': {
          transform: 'translateX(16px)',
          'box-shadow': '0 0 0 2px oklch(1 0 0 / .15)',
        },
      },
    },

    // ── Number ──
    '.s-number input[type="number"]': {
      width: '76px',
      'font-family': mono,
      'text-align': 'right',
      '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
        '-webkit-appearance': 'none',
      },
    },
    '.s-step': {
      width: '26px', height: '26px',
      background: inputBg,
      border: `1px solid ${inputBd}`,
      'border-radius': radSm,
      color: text,
      cursor: 'pointer',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'font-size': '14px', 'line-height': '1',
      transition: 'background 140ms, color 140ms, border-color 140ms',
      '&:hover:not(:disabled)': {
        background: 'var(--accent)',
        color: 'var(--accent-c)',
        'border-color': 'transparent',
      },
      '&:disabled': { opacity: '.35', cursor: 'not-allowed' },
    },

    // ── Slider ──
    '.s-slider': {
      '.s-input': { 'flex-direction': 'row' },
      'input[type="range"]': {
        flex: '1', height: '5px',
        background: trackBg,
        'border-radius': '999px',
        '-webkit-appearance': 'none',
        cursor: 'pointer',
        '&::-webkit-slider-thumb': { '-webkit-appearance': 'none', ...thumb },
        '&::-moz-range-thumb': thumb,
      },
      '.s-value': {
        'min-width': '48px',
        'text-align': 'right',
        'font-family': mono,
        'font-size': '11px',
        color: dim,
      },
    },

    // ── Select ──
    '.s-select select': {
      flex: '1',
      cursor: 'pointer',
      appearance: 'none',
      'background-image': `linear-gradient(45deg, transparent 50%, ${dim} 50%), linear-gradient(135deg, ${dim} 50%, transparent 50%)`,
      'background-position': 'calc(100% - 14px) 50%, calc(100% - 10px) 50%',
      'background-size': '4px 4px, 4px 4px',
      'background-repeat': 'no-repeat',
      'padding-right': '26px',
    },
    '.s-buttons': {
      'flex-wrap': 'wrap',
      '.s-input': { gap: `calc(${sp1} * .4)` },
      button: {
        background: inputBg,
        border: `1px solid ${inputBd}`,
        'border-radius': '999px',
        color: dim,
        padding: '4px 10px',
        cursor: 'pointer',
        'font-size': '11px', 'font-weight': '' + fw,
        transition: 'background 140ms, color 140ms, border-color 140ms',
        '&:hover': { 'border-color': 'var(--accent)', color: text },
        '&.selected': {
          background: 'var(--accent)',
          color: 'var(--accent-c)',
          'border-color': 'transparent',
        },
      },
    },
    '.s-radio': {
      '.s-input': { 'flex-direction': 'column', 'align-items': 'flex-start', gap: `calc(${sp1} * .4)` },
      label: {
        display: 'flex', 'align-items': 'center', gap: '6px',
        cursor: 'pointer', color: dim,
        '&.selected': { color: text },
      },
    },

    // ── Color ──
    '.s-color input[type="color"]': { width: '0', height: '0', opacity: '0', position: 'absolute' },
    '.s-preview': {
      width: '26px', height: '26px',
      'border-radius': radSm,
      cursor: 'pointer',
      border: `1px solid ${inputBd}`,
      'box-shadow': `inset 0 0 0 1px ${inlay}`,
    },
    '.s-hex': {
      'font-family': mono,
      'font-size': '11px',
      color: dim,
    },
    '.s-swatches': {
      '.s-input': { 'flex-wrap': 'wrap', gap: '4px' },
      button: {
        width: '22px', height: '22px',
        border: '1px solid transparent',
        'border-radius': radSm,
        cursor: 'pointer', padding: '0',
        'box-shadow': `inset 0 0 0 1px ${inlay}`,
        '&.selected': {
          'border-color': text,
          'box-shadow': `0 0 0 2px ${surface}`,
        },
      },
    },

    // ── Text ──
    '.s-text input[type="text"]': { flex: '1' },

    // ── Textarea ──
    '.s-textarea': {
      'align-items': 'flex-start',
      textarea: {
        flex: '1',
        'font-family': mono,
        'font-size': '11px',
        resize: 'vertical',
        'min-height': '64px',
      },
    },

    // ── Button ──
    '.s-button button': {
      background: 'var(--accent)',
      border: '1px solid transparent',
      'border-radius': radSm,
      color: 'var(--accent-c)',
      padding: '7px 14px',
      cursor: 'pointer',
      'font-weight': '' + fwB,
      'font-size': '11px',
      transition: 'filter 140ms, transform 100ms',
      '&:hover': { filter: 'brightness(1.1)', transform: 'translateY(-1px)' },
      '&:active': { transform: 'translateY(0)', filter: 'brightness(.95)' },
    },

    // ── Folder ──
    '.s-folder': {
      display: 'block', border: '0', padding: '0', margin: '4px 0',
      '> summary': {
        cursor: 'pointer',
        padding: '6px 0',
        'font-weight': '' + fwB,
        'list-style': 'none',
        display: 'flex', 'align-items': 'center', gap: '8px',
        color: text,
        '&::-webkit-details-marker': { display: 'none' },
        '&::before': {
          content: "''",
          width: '7px', height: '7px',
          'border-right': `${bw} solid ${dim}`,
          'border-bottom': `${bw} solid ${dim}`,
          transform: 'rotate(-45deg)',
          transition: 'transform 140ms',
        },
      },
      '&[open] > summary::before': { transform: 'rotate(45deg)' },
    },
    '.s-content': {
      padding: '4px 0 4px 14px',
      'border-left': `1px solid ${divider}`,
      margin: '2px 0 2px 5px',
    },

    '@media (prefers-reduced-motion: reduce)': {
      '*, *::before, *::after': { 'transition-duration': '0ms !important' },
    },
  }}
}
