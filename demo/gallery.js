import sprae, { store, effect, untracked, batch } from 'sprae'
import settings from '../index.js'
import { parseColor, toHex, ink } from '../theme/color.js'
import { themes, byId, colormaps, material, legacyTimes, accents, fonts } from './themes.js'

const $ = id => document.getElementById(id)
const supported = (theme, axis) => theme.axes.split(' ').includes(axis)
const round = n => +n.toFixed(2)

// What every renderer (live preview, thumbnails, code export) shares. `native`
// means "let the theme's own default carry the axis": the key is simply omitted
// from what reaches `theme.fn`, so Native light is exactly what `theme()` paints.
const isNative = look => look.colormap === 'native'
const resolveAccent = (theme, look) => look.accent || (isNative(look) ? undefined : colormaps[look.colormap].accent)

function axesFor(theme, look, extra = {}) {
  const axes = isNative(look) ? {} : material(theme, colormaps[look.colormap])
  const accent = supported(theme, 'accent') && resolveAccent(theme, look)
  if (accent) axes.accent = accent
  for (const key of ['spacing', 'roundness', 'size']) if (supported(theme, key) && look[key] != null) axes[key] = look[key]
  if (look.font && look.font !== 'theme') axes.font = fonts[look.font]
  for (const { key } of theme.extras || []) if (extra[key] != null) axes[key] = extra[key]
  return axes
}

// A color token as the theme paints it (the cascade's last declaration wins), as
// #rrggbb; undefined when the value is not a parseable color (e.g. transparent).
function rendered(theme, look, extra, token) {
  const value = [...theme.fn(axesFor(theme, look, extra)).matchAll(new RegExp(`--${token}:\\s*([^;]+);`, 'g'))].at(-1)?.[1].trim()
  const tone = parseColor(value, null)
  return tone ? toHex(tone) : undefined
}

// The surface behind a theme: the chosen colormap, or under Native the theme's own
// background; transparent themes declare the ground they were designed over.
const groundFor = (theme, look, extra) => isNative(look)
  ? rendered(theme, look, extra, 'bg') || theme.ground : colormaps[look.colormap].shade

// The theme's own default for a Look-bar axis, read back from its rendered CSS
// instead of one anchor shared by every theme. A slider with no override starts
// at what's already on screen (neu's roundness is 1.6, porcelain's 1, glass's 1.4),
// and the first drag moves continuously from there instead of snapping.
function nativeDefault(theme, look, extra, key) {
  const css = theme.fn(axesFor(theme, { ...look, [key]: null }, extra))
  const match = [...css.matchAll(new RegExp(`--${key}:\\s*([^;]+);`, 'g'))].at(-1)
  return match ? round(parseFloat(match[1])) : null
}

const defaults = { name: 'Aurora', blend: 'Screen', opacity: 82, enabled: true, tint: '#8b80f9' }
const blends = ['Normal', 'Multiply', 'Screen']
let values = { ...defaults }, live

const emptyExtras = () => Object.fromEntries(themes.map(t => [t.id, Object.fromEntries((t.extras || []).map(e => [e.key, null]))]))

const state = store({
  ...readLocation(), themes, accents, colormaps, query: '', filter: 'all', format: 'js',
  feedback: '', copyStatus: '', codeStatus: '', link: '', codeCSS: '', codeJS: '',
  get accent() { return this.look.accent || rendered(this.selected, this.look, this.extraValues, 'accent') || accents[0][1] },
  get selected() { return byId[this.theme] },
  get nativeRoundness() { return nativeDefault(this.selected, this.look, this.extraValues, 'roundness') ?? 1 },
  get count() { return themes.filter(matches).length },
  get code() { return this.link || (this.format === 'css' ? this.codeCSS : this.codeJS) },
  get themeExtras() { return this.selected.extras || [] },
  get extraValues() { return this.extras[this.theme] },
  get extrasChanged() { return this.themeExtras.some(ex => this.extraValues[ex.key] != null) },
  supported, matches, mountThumbnail, selectTheme, focusPreview, resetLook, resetExtras,
  clearFilters() { state.filter = 'all'; state.query = ''; $('theme-search').focus() },
  resetPreview() { batch(() => Object.assign(live, defaults)); state.feedback = 'Preview reset' },
  showCode() {
    state.link = ''; state.format = 'js'; state.codeStatus = ''
    const theme = state.selected, axes = axesFor(theme, state.look, state.extraValues)
    state.codeCSS = theme.fn(axes)
    state.codeJS = javascript(theme, axes)
    $('code-dialog').showModal()
  },
  closeCode() { $('code-dialog').close() },
  copyCode, copyLink,
})

function readLocation() {
  const params = new URLSearchParams(location.hash.slice(1))
  const bounded = (key, lo, hi) => {
    const raw = params.get(key), n = Number(raw)
    return raw?.trim() && Number.isFinite(n) ? round(Math.min(hi, Math.max(lo, n))) : null
  }
  const theme = Object.hasOwn(byId, params.get('theme')) ? params.get('theme') : 'glass'
  const rawMap = params.get('colormap')
  const colormap = rawMap === 'native' ? 'native'
    : Object.hasOwn(colormaps, rawMap) ? rawMap
      : !params.has('colormap') && Object.hasOwn(legacyTimes, params.get('time')) ? legacyTimes[params.get('time')]
        : 'native'
  const look = {
    font: Object.hasOwn(fonts, params.get('font')) ? params.get('font') : 'theme',
    colormap,
    accent: /^#[\da-f]{6}$/i.test(params.get('accent')) ? params.get('accent').toLowerCase() : null,
    spacing: [.65, 1, 1.5].includes(Number(params.get('density'))) ? Number(params.get('density')) : null,
    roundness: bounded('corners', 0, 2),
    size: bounded('scale', .8, 1.2),
  }
  // Extras round-trip for the selected theme only – a different theme's customizations
  // are session-local, never shared through the URL (see docs/themes.md gallery notes).
  const extras = emptyExtras()
  for (const ex of byId[theme].extras || []) {
    const raw = params.get(`x-${ex.key}`)
    if (raw == null) continue
    if (ex.type === 'boolean') extras[theme][ex.key] = raw === 'true' ? true : raw === 'false' ? false : null
    else if (ex.type === 'select') extras[theme][ex.key] = ex.options.includes(raw) ? raw : null
    else { const n = Number(raw); extras[theme][ex.key] = Number.isFinite(n) ? round(Math.min(ex.max, Math.max(ex.min, n))) : null }
  }
  return { theme, look, extras }
}

function updateLocation(push = false) {
  const { look } = state
  const hash = new URLSearchParams({ theme: state.theme, colormap: look.colormap, font: look.font })
  if (look.accent) hash.set('accent', look.accent)
  if (look.spacing != null) hash.set('density', look.spacing)
  if (look.roundness != null) hash.set('corners', look.roundness)
  if (look.size != null) hash.set('scale', look.size)
  for (const ex of state.themeExtras) { const v = state.extraValues[ex.key]; if (v != null) hash.set(`x-${ex.key}`, v) }
  history[push ? 'pushState' : 'replaceState'](null, '', `${location.pathname}${location.search}#${hash}`)
}

function resetLook() {
  batch(() => Object.assign(state.look, { colormap: 'native', accent: null, spacing: null, roundness: null, size: null, font: 'theme' }))
}

function resetExtras() {
  batch(() => { for (const ex of state.themeExtras) state.extraValues[ex.key] = null })
}

function surround(shade) {
  const { L, C, H } = parseColor(shade)
  return toHex({ L: L < .5 ? Math.min(.55, L + .10) : Math.max(.65, L - .10), C: C * .5, H })
}
// The surround sets a panel off the page; a transparent panel has no edge to set off and shows
// the ground it was designed over, so it sits on that ground itself.
const sceneBg = (theme, ground) => theme.ground ? ground : surround(ground)

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
// Mounted once, ever – a function-valued theme reads the store directly, so the
// Look bar and per-theme extras restyle every thumbnail with zero remount.
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
  const panel = settings(schema(true), {
    container: host, title: 'Layer', collapsed: false,
    theme: () => theme.fn(axesFor(theme, state.look, state.extras[theme.id])),
  })
  host.style.width = theme.classic ? '250px' : '320px'
  thumb.dataset.surface = theme.surface || 'solid'
  const stopScenery = effect(() => {
    const ground = groundFor(theme, state.look, state.extras[theme.id])
    untracked(() => {
      thumb.style.setProperty('--material-bg', sceneBg(theme, ground))
      const backdrop = scenery(ground)
      thumb.style.setProperty('--thumb-glow', backdrop.glow)
      thumb.style.setProperty('--thumb-sky', backdrop.sky)
      thumb.style.setProperty('--thumb-floor', backdrop.near)
    })
  })
  resize.observe(thumb)
  return () => { resize.unobserve(thumb); stopScenery(); panel[Symbol.dispose]() }
}

function selectTheme(id) {
  if (state.theme !== id) batch(() => {
    state.theme = id
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

function javascript(theme, axes) {
  const name = theme.id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  return `import settings from 'settings-panel'\nimport ${name} from 'settings-panel/theme/${theme.file || theme.id}.js'\n\nconst panel = settings({\n  name: { type: 'text', value: ${JSON.stringify(values.name)} },\n  blend: { options: ${JSON.stringify(blends)}, value: ${JSON.stringify(values.blend)} },\n  opacity: { type: 'slider', value: ${values.opacity}, min: 0, max: 100, step: 1, format: v => v + '%' },\n  enabled: { type: 'boolean', variant: 'switch', value: ${values.enabled}, hint: 'Show this layer' },\n  tint: { type: 'color', value: ${JSON.stringify(values.tint)} },\n  apply: { type: 'button', label: false, buttons: {\n    Reset: { variant: 'secondary', onClick: () => Object.assign(panel, ${JSON.stringify(defaults)}) },\n    'Apply effect': {},\n  } },\n}, {\n  title: 'Layer',\n  theme: ${name}(${JSON.stringify(axes, null, 2).replaceAll('\n', '\n  ')})\n})`
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

window.addEventListener('popstate', () => {
  const loc = readLocation()
  batch(() => { state.theme = loc.theme; Object.assign(state.look, loc.look); Object.assign(state.extras, loc.extras) })
})

sprae(document.body, state)

// Three concerns, three effects – replacing one coupled render that remounted
// the live panel (and, before this rework, silently froze every thumbnail) on
// every axis change. Reading a store property is what creates a subscription,
// so each effect only reruns for the keys its own body actually reads.

// 1. Remount only when the selected theme changes.
effect(() => {
  const id = state.theme
  untracked(() => {
    live?.[Symbol.dispose]()
    const theme = byId[id]
    live = settings(schema(), {
      container: $('live-panel'), title: 'Layer', collapsed: false,
      theme: () => theme.fn(axesFor(theme, state.look, state.extras[id])),
      onchange(s) { for (const key of Object.keys(defaults)) values[key] = s[key] },
    })
    document.title = `${theme.name} — settings-panel themes`
    state.feedback = ''
    state.copyStatus = ''
  })
})

// 2. Scene chrome (backdrop, surface, ink) – theme + colormap only, no panel
// involved, so it never remounts it. Neu alone also mirrors its surface texture
// onto the backdrop (the plate is pushed up from it), so that one theme tracks its axes.
effect(() => {
  const theme = byId[state.theme], ground = groundFor(theme, state.look, state.extras[theme.id])
  const neuCSS = theme.id === 'neu' ? theme.fn(axesFor(theme, state.look, state.extras[theme.id])) : null
  untracked(() => {
    const scene = $('preview-scene')
    scene.dataset.surface = theme.surface || 'solid'
    scene.style.setProperty('--material-bg', sceneBg(theme, ground))
    scene.style.setProperty('--scene-ink', ink(ground, 4.5))
    for (const [key, value] of Object.entries(scenery(ground))) scene.style.setProperty(`--scene-${key}`, value)
    const neu = token => neuCSS?.match(new RegExp(`--neu-${token}:\\s*([^;]+);`))?.[1]
    scene.style.setProperty('--scene-texture', neu('texture') || 'none')
    scene.style.setProperty('--scene-blend', neu('blend') || 'normal')
  })
})

// 3. URL sync – every shareable key, cheap, no DOM rebuild. Spreading
// extraValues (not just referencing it) is what subscribes to each of the
// selected theme's own extras, so a Theme-controls edit re-syncs the link too.
effect(() => {
  const snap = { theme: state.theme, ...state.look, extra: { ...state.extraValues } }
  untracked(updateLocation)
})
