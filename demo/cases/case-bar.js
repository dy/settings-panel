// A case page's bar: "ours | <original>" on the left, where the original renders, and "Light | Dark" on the
// right, where the case has both. The appearance lives in the hash (#light, #dark), so a calibration or a link
// can name it; switching it reloads the page, as every case reads it once at mount, and the original's frame
// is given the same hash.

const css = `
.case-bar {
  position: fixed;
  inset: 10px 10px auto;
  z-index: 2147483001;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}
.case-bar > div {
  pointer-events: auto;
  display: inline-flex;
  padding: 2px;
  border: 1px solid color-mix(in oklab, CanvasText 18%, transparent);
  border-radius: 6px;
  background: color-mix(in oklab, Canvas 86%, transparent);
  box-shadow: 0 2px 10px rgba(0,0,0,.18);
  color: CanvasText;
  font: 500 11px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.case-bar > .case-appearance { margin-left: auto; }
.case-bar button {
  min-width: 52px;
  height: 24px;
  padding: 0 8px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.case-bar button[aria-pressed="true"] { background: CanvasText; color: Canvas; }
.case-bar button:focus-visible { outline: 2px solid #0d99ff; outline-offset: 2px; }
.case-native-frame {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  width: 100%;
  height: 100%;
  border: 0;
  background: inherit;
}
`

/** Centres el in the viewport on an even pixel (at least `min` from the top), for pixel-exact cases: a centred
 * odd remainder would put it on a half pixel, and an odd offset out of phase with a 2px desktop pattern. */
export function centre(el, min = 16) {
  const place = () => { el.style.marginTop = Math.max(min, Math.floor((innerHeight - el.offsetHeight) / 4) * 2) + 'px' }
  new ResizeObserver(place).observe(el)
  addEventListener('resize', place)
}

const LIGHT_DARK = { light: 'Light', dark: 'Dark' }

/** The case's appearance: the hash's, where it names one of the modes, else the case's own default. */
export const appearance = (initial = 'light', modes = LIGHT_DARK) => { const h = location.hash.slice(1); return h in modes ? h : initial }

const bar = () => {
  let el = document.querySelector('.case-bar')
  if (el) return el
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
  el = document.createElement('nav')
  el.className = 'case-bar'
  document.body.append(el)
  return el
}

const group = (className, modes) => {
  const el = document.createElement('div')
  el.className = className
  for (const [mode, text] of modes) {
    const b = document.createElement('button')
    Object.assign(b, { type: 'button', textContent: text })
    b.dataset.mode = mode
    el.append(b)
  }
  return el
}

/**
 * ref: the original's page (demo/_ref, a local harness kept out of the published site: the switch appears
 * only where it loads); label: the original's name; appearance: the case's default, when it has more than one;
 * modes: its appearances (Light and Dark unless named); onAppearance: switches it live (keeping edited values),
 * where the case can, instead of reloading.
 */
export function caseBar({ ref, label = 'native', appearance: initial, modes: names = LIGHT_DARK, onAppearance } = {}) {
  if (initial) {
    let current = appearance(initial, names)
    const modes = group('case-appearance', Object.entries(names))
    const mark = () => modes.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === current)))
    mark()
    modes.addEventListener('click', e => {
      const mode = e.target.closest('button')?.dataset.mode
      if (!mode || mode === current) return
      current = mode
      history.replaceState(null, '', '#' + mode)
      if (!onAppearance) return location.reload()
      mark()
      onAppearance(mode)
    })
    bar().append(modes)
  }
  if (ref) fetch(ref, { method: 'HEAD' }).then(r => r.ok && native(ref + location.hash, label), () => {})
}

function native(ref, label) {
  let frame
  const modes = group('case-render-switch', [['settings', 'ours'], ['native', label]])
  bar().prepend(modes)

  const show = mode => {
    if (mode === 'native' && !frame) {
      frame = document.createElement('iframe')
      frame.className = 'case-native-frame'
      frame.src = ref
      frame.title = `${label} render`
      document.body.append(frame)
    }
    if (frame) frame.hidden = mode !== 'native'
    modes.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)))
    const url = new URL(location.href)
    mode === 'native' ? url.searchParams.set('render', 'native') : url.searchParams.delete('render')
    history.replaceState(null, '', url)
  }

  modes.addEventListener('click', e => { const b = e.target.closest('button[data-mode]'); if (b) show(b.dataset.mode) })
  show(new URLSearchParams(location.search).get('render') === 'native' ? 'native' : 'settings')
}
