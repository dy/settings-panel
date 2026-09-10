import sprae, { store, effect, untracked, batch } from 'sprae'
import settings from '../index.js'
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
  { id: 'lab01', name: 'Lab01', fn: lab01, surface: 'glass', preferred: 'night', axes: 'accent spacing roundness', description: 'Frosted surfaces, fine bevels, and a little reflection.' },
  { id: 'glass', name: 'Glass', fn: glass, surface: 'glass', preferred: 'dusk', axes: 'accent spacing roundness size', description: 'Translucent layers. Light passing through the controls.' },
  { id: 'neu', name: 'Neu', fn: neu, preferred: 'day', axes: 'accent spacing roundness size', description: 'One soft material, shaped by light and shadow.' },
  { id: 'brutal', name: 'Brutal', fn: brutal, preferred: 'day', axes: 'accent spacing size', accent: '#f35f58', description: 'Solid ink, paper plates, and a decisive press.' },
  { id: 'swiss', name: 'Swiss', fn: swiss, preferred: 'day', axes: 'accent spacing size', accent: '#ed3229', description: 'A clear grid. Typography does the work.' },
  { id: 'skeu', name: 'Skeu', fn: skeu, preferred: 'day', axes: 'accent spacing roundness', description: 'Beveled edges and controls with physical weight.' },
  { id: 'porcelain', name: 'Porcelain', fn: porcelain, surface: 'porcelain', preferred: 'day', axes: 'accent spacing roundness size', accent: '#526e73', description: 'A glazed ceramic face, set into a pale mineral frame.' },
  { id: 'soft', file: 'default', name: 'Soft', fn: soft, tone: 'light', preferred: 'day', axes: 'accent spacing roundness size', description: 'Gentle edges and familiar, understated controls.' },
  { id: 'terminal', name: 'Terminal', fn: terminal, preferred: 'night', axes: 'accent spacing size', accent: '#b1dcb8', description: 'A character grid, crisp rules, and luminous type.' },
  { id: 'dat', name: 'dat.gui', fn: dat, classic: true, tone: 'dark', axes: 'accent', accent: '#2cc9ff', description: 'The compact controller for creative coding.' },
  { id: 'tweakpane', name: 'Tweakpane', fn: tweakpane, classic: true, tone: 'dark', axes: '', description: 'Quiet grey instruments and precise, compact controls.' },
  { id: 'leva', name: 'Leva', fn: leva, classic: true, tone: 'dark', axes: 'accent', accent: '#007bff', description: 'Deep blue-grey surfaces and bright interactive details.' },
  { id: 'controlkit', name: 'ControlKit', fn: controlkit, classic: true, tone: 'dark', axes: 'accent', accent: '#e74d59', description: 'Dark fields, sharp geometry, and a red signal.' },
  { id: 'uil', name: 'UIL', fn: uil, classic: true, tone: 'dark', axes: 'accent', accent: '#308aff', description: 'Dense, direct controls with a technical character.' },
  { id: 'figma', name: 'Figma', fn: figma, classic: true, preferred: 'day', axes: 'accent size', accent: '#0d99ff', description: 'The familiar precision of a design-tool inspector.' },
  { id: 'apple', name: 'Apple', fn: apple, classic: true, preferred: 'day', axes: 'accent size', accent: '#007aff', description: 'Grouped controls and the calm rhythm of native settings.' },
  { id: 'oui', name: 'OUI', fn: oui, classic: true, preferred: 'day', axes: 'accent', accent: '#ff5252', description: 'Light, spare controls with a single bright accent.' },
  { id: 'control-panel', name: 'Control Panel', fn: controlPanel, classic: true, preferred: 'night', axes: 'accent spacing', description: 'The small, square-edged panel from the creative web.' },
]
const byId = Object.fromEntries(themes.map(t => [t.id, t]))
const phases = {
  predawn: { dark: true, sky: '#292d58', horizon: '#9291ac', glow: '#d898b7', far: '#59567d', mid: '#3e405f', near: '#262d47' },
  sunrise: { dark: false, sky: '#babed7', horizon: '#f4d8b8', glow: '#ffc998', far: '#ad96a4', mid: '#817d99', near: '#565f7c' },
  day: { dark: false, sky: '#9abbd2', horizon: '#e7eeee', glow: '#fff7d6', far: '#98b5b7', mid: '#718f99', near: '#4b6e80' },
  dusk: { dark: true, sky: '#444773', horizon: '#ae81a2', glow: '#e2a1bf', far: '#686080', mid: '#45465f', near: '#2c3048' },
  sunset: { dark: true, sky: '#776c94', horizon: '#efa887', glow: '#ffd0aa', far: '#a46b85', mid: '#744f70', near: '#433e5b' },
  night: { dark: true, sky: '#171f3d', horizon: '#455779', glow: '#6581ac', far: '#344464', mid: '#26364e', near: '#19263b' },
}
const accents = [['Violet', '#6d5ce8'], ['Rose', '#d94c91'], ['Blue', '#386ef1'], ['Teal', '#168eaa'], ['Amber', '#d97b30']]
const defaults = { name: 'Aurora', blend: 'Screen', opacity: 82, enabled: true, tint: '#8b80f9' }
const blends = ['Normal', 'Multiply', 'Screen']
const $ = id => document.getElementById(id)
const supported = (theme, axis) => theme.axes.split(' ').includes(axis)
const round = n => +n.toFixed(2)
let values = { ...defaults }, live, currentCSS, currentAxes
const state = store({
  options: readLocation(), themes, accents, query: '', filter: 'all', format: 'js',
  feedback: '', copyStatus: '', codeStatus: '', link: '', codeCSS: '', codeJS: '',
  get selected() { return byId[this.options.theme] },
  get count() { return themes.filter(matches).length },
  get code() { return this.link || (this.format === 'css' ? this.codeCSS : this.codeJS) },
  supported, matches, mountThumbnail, selectTheme, focusPreview,
  clearFilters() { state.filter = 'all'; state.query = ''; $('theme-search').focus() },
  resetPreview() { values = { ...defaults }; renderPreview(); state.feedback = 'Preview reset' },
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
    theme: Object.hasOwn(byId, params.get('theme')) ? params.get('theme') : 'glass',
    time: Object.hasOwn(phases, params.get('time')) ? params.get('time') : 'dusk',
    accent: /^#[\da-f]{6}$/i.test(params.get('accent')) ? params.get('accent').toLowerCase() : accents[0][1],
    spacing: [.65, 1, 1.5].includes(Number(params.get('density'))) ? Number(params.get('density')) : 1,
    roundness: bounded('corners', 1.4, 0, 2),
    size: bounded('scale', 1, .8, 1.2),
  }
}

function updateLocation(push = false) {
  const hash = new URLSearchParams({ theme: state.options.theme, time: state.options.time, accent: state.options.accent, density: state.options.spacing, corners: state.options.roundness, scale: state.options.size })
  history[push ? 'pushState' : 'replaceState'](null, '', `${location.pathname}${location.search}#${hash}`)
}

function axesFor(theme, options) {
  const dark = theme.tone ? theme.tone === 'dark' : phases[options.time].dark
  let shade = dark ? '#242832' : '#edf0f2'
  if (theme.surface === 'glass') shade = dark ? '#29263b' : '#edf0f5'
  if (theme.id === 'neu') shade = dark ? '#292b2e' : '#e7e8ea'
  if (theme.id === 'porcelain') shade = dark ? '#293b3d' : '#f4f6f5'
  if (theme.id === 'brutal') shade = dark ? '#252625' : '#f2eddf'
  if (theme.id === 'swiss') shade = dark ? '#303034' : '#f3f2ef'
  if (theme.id === 'skeu') shade = dark ? '#333638' : '#dedfdd'
  // The selected time is lighting, not just a light/dark label: retain each
  // material's lightness while letting the sky cast a restrained color tint.
  const material = parseColor(shade), sky = parseColor(phases[options.time].horizon)
  shade = toHex({ L: material.L, C: Math.max(material.C, sky.C * .2), H: sky.H })
  const axes = theme.tone === 'dark' ? {} : { shade }
  if (theme.id === 'neu') axes.light = { predawn: 270, sunrise: 65, day: 315, dusk: 290, sunset: 255, night: 335 }[options.time]
  for (const key of ['accent', 'spacing', 'roundness', 'size']) if (supported(theme, key)) axes[key] = options[key]
  return axes
}

function schema(mini = false) {
  const fields = {
    blend: { type: 'select', value: mini ? defaults.blend : values.blend, options: blends, label: 'Blend' },
    opacity: { type: 'slider', value: mini ? defaults.opacity : values.opacity, min: 0, max: 100, step: 1, label: 'Opacity', format: v => `${v}%` },
    enabled: { type: 'boolean', variant: 'switch', value: mini ? defaults.enabled : values.enabled, label: 'Enabled' },
  }
  return {
    ...(!mini && { name: { type: 'text', value: values.name, label: 'Name' } }),
    ...fields,
    ...(!mini && { tint: { type: 'color', value: values.tint, label: 'Tint' } }),
    apply: { type: 'button', label: false, text: 'Apply effect', onClick: () => { if (!mini) state.feedback = `Applied · ${values.blend} at ${values.opacity}%` } },
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
  const options = { ...state.options, time: theme.preferred || 'night', accent: theme.accent || accents[0][1], spacing: 1, roundness: 1.4, size: 1 }
  const axes = axesFor(theme, options)
  const panel = settings(schema(true), { container: host, title: 'Layer', collapsed: false, theme: theme.fn(axes) })
  host.style.width = theme.classic ? '250px' : '320px'
  thumb.dataset.surface = theme.surface || 'solid'
  thumb.style.setProperty('--material-bg', axes.shade || '#34363c')
  thumb.style.setProperty('--thumb-glow', '#c47ca9')
  thumb.style.setProperty('--thumb-sky', '#716da4')
  thumb.style.setProperty('--thumb-floor', '#292d4f')
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
  const theme = byId[options.theme], phase = phases[options.time]
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
  const bg = currentAxes.shade || (phase.dark ? '#272b34' : '#e9ecef')
  scene.style.setProperty('--material-bg', bg)
  scene.style.setProperty('--scene-ink', (theme.tone === 'light' || (!theme.tone && !phase.dark)) ? '#394550' : theme.tone === 'dark' && !phase.dark ? '#394550' : '#e2e5ee')
  for (const key of ['sky', 'horizon', 'glow', 'far', 'mid', 'near']) scene.style.setProperty(`--scene-${key}`, phase[key])
  if (theme.id === 'neu') scene.style.backgroundImage = getComputedStyle($('live-panel').querySelector('.s-panel')).getPropertyValue('--neu-grain')
  else scene.style.removeProperty('background-image')
  $('time-icon').innerHTML = phase.dark ? '<path d="M19 15A8 8 0 0 1 9 5a8 8 0 1 0 10 10Z"/>' : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'
  state.feedback = ''
  state.copyStatus = ''
}

window.addEventListener('popstate', () => { state.options = readLocation() })

function javascript() {
  const theme = byId[state.options.theme]
  const name = theme.id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  return `import settings from 'settings-panel'\nimport ${name} from 'settings-panel/theme/${theme.file || theme.id}.js'\n\nsettings({\n  name: { type: 'text', value: ${JSON.stringify(values.name)} },\n  blend: { options: ${JSON.stringify(blends)}, value: ${JSON.stringify(values.blend)} },\n  opacity: { type: 'slider', value: ${values.opacity}, min: 0, max: 100, step: 1, format: v => v + '%' },\n  enabled: { type: 'boolean', variant: 'switch', value: ${values.enabled} },\n  tint: { type: 'color', value: ${JSON.stringify(values.tint)} },\n  apply: { type: 'button', label: false, text: 'Apply effect' },\n}, {\n  title: 'Layer',\n  theme: ${name}(${JSON.stringify(currentAxes, null, 2).replaceAll('\n', '\n  ')})\n})`
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
