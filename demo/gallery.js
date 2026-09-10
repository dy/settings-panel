import sprae, { store, effect, untracked, batch } from 'sprae'
import settings from '../index.js'
import devtools from '../theme/devtools.js'
import { parseColor, toHex } from '../theme/color.js'
import soft from '../theme/default.js'
import glass from '../theme/glass.js'
import neu from '../theme/neu.js'
import brutal from '../theme/brutal.js'
import swiss from '../theme/swiss.js'
import skeu from '../theme/skeu.js'
import lab01 from '../theme/lab01.js'
import porcelain from '../theme/porcelain.js'
import terminal from '../theme/terminal.js'
import dat from '../theme/dat.js'
import tweakpane from '../theme/tweakpane.js'
import leva from '../theme/leva.js'
import controlkit from '../theme/controlkit.js'
import uil from '../theme/uil.js'
import oui from '../theme/oui.js'
import figma from '../theme/figma.js'
import apple from '../theme/apple.js'
import controlPanel from '../theme/control-panel.js'

const themes = [
  { id: 'lab01', name: 'Lab01', fn: lab01, surface: 'glass', preferred: 'dark', axes: 'accent spacing roundness size', description: 'Frosted surfaces, fine bevels, and a little reflection.' },
  { id: 'glass', name: 'Glass', fn: glass, surface: 'glass', preferred: 'slate', axes: 'accent spacing roundness size', description: 'Translucent layers. Light passing through the controls.' },
  { id: 'neu', name: 'Neu', fn: neu, preferred: 'chalk', axes: 'accent spacing roundness size', description: 'One soft material, shaped by light and shadow.' },
  { id: 'brutal', name: 'Brutal', fn: brutal, preferred: 'chalk', axes: 'accent spacing size', accent: '#f35f58', description: 'Solid ink, paper plates, and a decisive press.' },
  { id: 'swiss', name: 'Swiss', fn: swiss, preferred: 'graphite', axes: 'accent spacing size', accent: '#ffffff', description: 'Transparent fields, fine rules, and contrasting type.' },
  { id: 'skeu', name: 'Skeu', fn: skeu, preferred: 'chalk', axes: 'accent spacing roundness size', description: 'Beveled edges and controls with physical weight.' },
  { id: 'porcelain', name: 'Porcelain', fn: porcelain, surface: 'porcelain', preferred: 'chalk', axes: 'accent spacing roundness size', accent: '#526e73', description: 'A glazed ceramic face, set into a pale mineral frame.' },
  { id: 'soft', file: 'default', name: 'Soft', fn: soft, preferred: 'chalk', axes: 'accent spacing roundness size', description: 'Gentle edges and familiar, understated controls.' },
  { id: 'terminal', name: 'Terminal', fn: terminal, preferred: 'graphite', axes: 'accent spacing size', accent: '#b1dcb8', description: 'A character grid, crisp rules, and luminous type.' },
  { id: 'devtools', name: 'DevTools', fn: devtools, classic: true, preferred: 'light', accent: '#0b57d0', axes: 'accent spacing size', description: 'Editable declarations, syntax-colored values, and a compact code rhythm.' },
  { id: 'dat', name: 'dat.gui', fn: dat, classic: true, preferred: 'graphite', axes: 'accent spacing size', accent: '#2cc9ff', description: 'The compact controller for creative coding.' },
  { id: 'tweakpane', name: 'Tweakpane', fn: tweakpane, classic: true, preferred: 'graphite', axes: 'spacing size', description: 'Quiet grey instruments and precise, compact controls.' },
  { id: 'leva', name: 'Leva', fn: leva, classic: true, preferred: 'graphite', axes: 'accent spacing size', accent: '#007bff', description: 'Deep blue-grey surfaces and bright interactive details.' },
  { id: 'controlkit', name: 'ControlKit', fn: controlkit, classic: true, preferred: 'graphite', axes: 'accent spacing size', accent: '#e74d59', description: 'Dark fields, sharp geometry, and a red signal.' },
  { id: 'uil', name: 'UIL', fn: uil, classic: true, preferred: 'graphite', axes: 'accent spacing size', accent: '#308aff', description: 'Dense, direct controls with a technical character.' },
  { id: 'figma', name: 'Figma', fn: figma, classic: true, preferred: 'chalk', axes: 'accent size spacing', accent: '#0d99ff', description: 'The familiar precision of a design-tool inspector.' },
  { id: 'apple', name: 'Apple', fn: apple, classic: true, preferred: 'chalk', axes: 'accent size spacing', accent: '#007aff', description: 'Grouped controls and the calm rhythm of native settings.' },
  { id: 'oui', name: 'OUI', fn: oui, classic: true, preferred: 'chalk', axes: 'accent spacing size', accent: '#ff5252', description: 'Light, spare controls with a single bright accent.' },
  { id: 'control-panel', name: 'Control Panel', fn: controlPanel, classic: true, preferred: 'graphite', axes: 'accent spacing size', description: 'The small, square-edged panel from the creative web.' },
]
const byId = Object.fromEntries(themes.map(t => [t.id, t]))
const colormaps = {
  dark: { name: 'Dark', shade: '#111111', accent: '#d5d5d5' },
  graphite: { name: 'Graphite', shade: '#292b2e', accent: '#cbd4e1' },
  slate: { name: 'Slate', shade: '#384957', accent: '#9cc9e5' },
  copper: { name: 'Copper', shade: '#b87959', accent: '#4e2920' },
  gold: { name: 'Gold', shade: '#ba965a', accent: '#60421f' },
  gray: { name: 'Gray', shade: '#b4b4b4', accent: '#39424c' },
  sage: { name: 'Sage', shade: '#c0cbb9', accent: '#395845' },
  silver: { name: 'Silver', shade: '#c6cac9', accent: '#40574d' },
  ivory: { name: 'Ivory', shade: '#f4ecdc', accent: '#786049' },
  chalk: { name: 'Chalk', shade: '#f1f2f4', accent: '#485565' },
  light: { name: 'Light', shade: '#ffffff', accent: '#0b57d0' },
}
// Preserve existing shared links, then write only the new colormap parameter.
const legacyTimes = { predawn: 'slate', sunrise: 'ivory', day: 'chalk', dusk: 'slate', sunset: 'copper', night: 'graphite' }

const accents = [['Violet', '#6d5ce8'], ['Rose', '#d94c91'], ['Blue', '#386ef1'], ['Teal', '#168eaa'], ['Amber', '#d97b30']]
const fonts = { theme: undefined, system: 'system-ui, -apple-system, sans-serif', mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }
const defaults = { name: 'Aurora', blend: 'Screen', opacity: 82, enabled: true, tint: '#8b80f9' }
const blends = ['Normal', 'Multiply', 'Screen']
const $ = id => document.getElementById(id)
const supported = (theme, axis) => theme.axes.split(' ').includes(axis)
const round = n => +n.toFixed(2)
let values = { ...defaults }, live, currentCSS, currentAxes
const state = store({
  options: readLocation(), themes, accents, colormaps, query: '', filter: 'all', format: 'js',
  feedback: '', copyStatus: '', codeStatus: '', link: '', codeCSS: '', codeJS: '',
  get accent() { return this.options.accent || colormaps[this.options.colormap].accent },
  get selected() { return byId[this.options.theme] },
  get count() { return themes.filter(matches).length },
  get code() { return this.link || (this.format === 'css' ? this.codeCSS : this.codeJS) },
  supported, matches, mountThumbnail, selectTheme, focusPreview,
  clearFilters() { state.filter = 'all'; state.query = ''; $('theme-search').focus() },
  resetPreview() { batch(() => Object.assign(live, defaults)); state.feedback = 'Preview reset' },
  showCode() {
    state.link = ''; state.format = 'js'; state.codeStatus = ''
    state.codeCSS = currentCSS; state.codeJS = javascript()
    $('code-dialog').showModal()
  },
  closeCode() { $('code-dialog').close() },
  copyCode, copyLink,
})

function readLocation() {
  const params = new URLSearchParams(location.hash.slice(1))
  const bounded = (key, fallback, lo, hi) => {
    const raw = params.get(key), n = Number(raw)
    return raw?.trim() && Number.isFinite(n) ? round(Math.min(hi, Math.max(lo, n))) : fallback
  }
  return {
    font: Object.hasOwn(fonts, params.get('font')) ? params.get('font') : 'theme',
    theme: Object.hasOwn(byId, params.get('theme')) ? params.get('theme') : 'glass',
    colormap: Object.hasOwn(colormaps, params.get('colormap')) ? params.get('colormap')
      : !params.has('colormap') && Object.hasOwn(legacyTimes, params.get('time')) ? legacyTimes[params.get('time')] : 'graphite',
    accent: /^#[\da-f]{6}$/i.test(params.get('accent')) ? params.get('accent').toLowerCase() : null,
    spacing: [.65, 1, 1.5].includes(Number(params.get('density'))) ? Number(params.get('density')) : 1,
    roundness: bounded('corners', 1.4, 0, 2),
    size: bounded('scale', 1, .8, 1.2),
  }
}

function updateLocation(push = false) {
  const hash = new URLSearchParams({ theme: state.options.theme, colormap: state.options.colormap, density: state.options.spacing, corners: state.options.roundness, scale: state.options.size, font: state.options.font })
  if (state.options.accent) hash.set('accent', state.options.accent)
  history[push ? 'pushState' : 'replaceState'](null, '', `${location.pathname}${location.search}#${hash}`)
}

function axesFor(theme, options) {
  const map = colormaps[options.colormap]
  const axes = { shade: map.shade }
  for (const key of ['accent', 'spacing', 'roundness', 'size']) if (supported(theme, key)) axes[key] = key === 'accent' ? options.accent || map.accent : options[key]
  if (options.font && options.font !== 'theme') axes.font = fonts[options.font]
  return axes
}

function surround(shade) {
  const { L, C, H } = parseColor(shade)
  return toHex({ L: L < .5 ? Math.min(.55, L + .10) : Math.max(.65, L - .10), C: C * .5, H })
}

// A palette-colored backdrop gives translucent themes something to refract.
function scenery(shade) {
  const { L, C, H } = parseColor(shade)
  const at = delta => toHex({ L: Math.max(.08, Math.min(.98, L + delta)), C, H })
  return { sky: at(.08), horizon: at(.2), glow: at(.35), far: at(.04), mid: at(-.06), near: at(-.16) }
}

function schema(mini = false) {
  const fields = {
    blend: { type: 'select', value: mini ? defaults.blend : values.blend, options: blends, label: 'Blend' },
    opacity: { type: 'slider', value: mini ? defaults.opacity : values.opacity, min: 0, max: 100, step: 1, label: 'Opacity', format: v => `${v}%` },
    enabled: { type: 'boolean', variant: 'switch', value: mini ? defaults.enabled : values.enabled, label: 'Enabled', ...(!mini && { hint: 'Show this layer' }) },
  }
  return {
    ...(!mini && { name: { type: 'text', value: values.name, label: 'Name' } }),
    ...fields,
    ...(!mini && { tint: { type: 'color', value: values.tint, label: 'Tint' } }),
    apply: mini ? { type: 'button', label: false, text: 'Apply effect' } : { type: 'button', label: false, buttons: {
      Reset: { variant: 'secondary', onClick: () => state.resetPreview() },
      'Apply effect': { onClick: () => { state.feedback = `Applied · ${values.blend} at ${values.opacity}%` } },
    } },
  }
}

// Thumbnails are real panels with a shared schema. Their native controls are
// inert; one separate button owns selection and keyboard focus for each card.
const resize = new ResizeObserver(entries => {
  for (const { target } of entries) {
    const stage = target.querySelector('.mini-stage'), panel = stage?.querySelector('.s-panel')
    if (!panel || !target.clientWidth) continue
    const scale = Math.min((target.clientWidth - 18) / panel.offsetWidth, (target.clientHeight - 20) / panel.offsetHeight)
    stage.style.setProperty('--mini-scale', scale)
  }
})
function mountThumbnail(thumb, theme) {
  const host = thumb.querySelector('.mini-stage')
  const options = { ...state.options, font: 'theme', colormap: theme.preferred, accent: theme.accent || accents[0][1], spacing: 1, roundness: 1.4, size: 1 }
  const axes = axesFor(theme, options)
  const panel = settings(schema(true), { container: host, title: 'Layer', collapsed: false, theme: theme.fn(axes) })
  host.style.width = theme.classic ? '250px' : '320px'
  thumb.dataset.surface = theme.surface || 'solid'
  thumb.style.setProperty('--material-bg', surround(axes.shade || '#34363c'))
  const backdrop = scenery(axes.shade)
  thumb.style.setProperty('--thumb-glow', backdrop.glow)
  thumb.style.setProperty('--thumb-sky', backdrop.sky)
  thumb.style.setProperty('--thumb-floor', backdrop.near)
  resize.observe(thumb)
  return () => { resize.unobserve(thumb); panel[Symbol.dispose]() }
}

function selectTheme(id) {
  if (state.options.theme !== id) batch(() => {
    state.options.theme = id
    updateLocation(true)
  })
  if (matchMedia('(max-width: 820px)').matches) focusPreview()
}

function focusPreview() {
  $('preview').focus({ preventScroll: true })
  $('preview').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

function matches(theme) {
  const category = theme.classic ? 'classic' : 'original'
  return (state.filter === 'all' || category === state.filter) &&
    `${theme.name} ${category} ${theme.description}`.toLowerCase().includes(state.query.trim().toLowerCase())
}

function renderPreview(options = state.options) {
  const theme = byId[options.theme], map = colormaps[options.colormap]
  currentAxes = axesFor(theme, options)
  currentCSS = theme.fn(currentAxes)
  live?.[Symbol.dispose]()
  live = settings(schema(), {
    container: $('live-panel'), title: 'Layer', collapsed: false, theme: currentCSS,
    onchange(s) { for (const key of Object.keys(defaults)) values[key] = s[key] },
  })
  document.title = `${theme.name} — settings-panel themes`
  const scene = $('preview-scene')
  scene.dataset.surface = theme.surface || 'solid'
  scene.style.setProperty('--material-bg', surround(map.shade))
  scene.style.setProperty('--scene-ink', parseColor(map.shade).L < .5 ? '#f1f2f4' : '#252b30')
  for (const [key, value] of Object.entries(scenery(map.shade))) scene.style.setProperty(`--scene-${key}`, value)
  scene.style.setProperty('--scheme-swatch', map.shade)
  if (theme.id === 'neu') scene.style.backgroundImage = getComputedStyle($('live-panel').querySelector('.s-panel')).getPropertyValue('--neu-grain')
  else scene.style.removeProperty('background-image')
  state.feedback = ''
  state.copyStatus = ''
}

window.addEventListener('popstate', () => { state.options = readLocation() })

function javascript() {
  const theme = byId[state.options.theme]
  const name = theme.id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  return `import settings from 'settings-panel'\nimport ${name} from 'settings-panel/theme/${theme.file || theme.id}.js'\n\nconst panel = settings({\n  name: { type: 'text', value: ${JSON.stringify(values.name)} },\n  blend: { options: ${JSON.stringify(blends)}, value: ${JSON.stringify(values.blend)} },\n  opacity: { type: 'slider', value: ${values.opacity}, min: 0, max: 100, step: 1, format: v => v + '%' },\n  enabled: { type: 'boolean', variant: 'switch', value: ${values.enabled}, hint: 'Show this layer' },\n  tint: { type: 'color', value: ${JSON.stringify(values.tint)} },\n  apply: { type: 'button', label: false, buttons: {\n    Reset: { variant: 'secondary', onClick: () => Object.assign(panel, ${JSON.stringify(defaults)}) },\n    'Apply effect': {},\n  } },\n}, {\n  title: 'Layer',\n  theme: ${name}(${JSON.stringify(currentAxes, null, 2).replaceAll('\n', '\n  ')})\n})`
}
async function copyCode() {
  try { await navigator.clipboard.writeText(state.code); state.codeStatus = 'Copied' }
  catch { state.codeStatus = 'Copy unavailable. Select the code above to copy it.' }
}
async function copyLink() {
  updateLocation()
  try { await navigator.clipboard.writeText(location.href); state.copyStatus = 'Preview link copied' }
  catch {
    state.link = location.href
    state.codeStatus = 'Copy unavailable. Select the link above to copy it.'
    $('code-dialog').showModal()
  }
}

sprae(document.body, state)
effect(() => {
  // Track axes only; panel edits and its own internal signals must not remount it.
  const options = { ...state.options }
  untracked(() => { renderPreview(options); updateLocation() })
})
