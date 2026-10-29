// Captures the calibration references: each original library (or page) rendered at DPR 2, never our
// panel. Our render is measured once against it with the spec's own comparison, and that count
// becomes the case's budget in manifest.json: a later change may lower it, never exceed it.
//
//   npx serve . -p 3456 &  node test/calibration/capture.mjs [name… | materials]
//
// The originals load from CDNs through demo/_ref (a local, unversioned harness) and lab01.dev, so
// capture needs both; the spec needs neither. `materials` measures the material rows against the
// study's profiles in materials.json (written from the owner's images) and records each row's
// zone budgets: its current ΔE per zone plus .3, rounded up to .1.
import { chromium } from '@playwright/test'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { differing } from './compare.js'
import { materials, profile, zones } from './profile.js'

const HOST = 'http://localhost:3456/'
const DIR = new URL('./', import.meta.url)

// switch: the case page's native switch renders the original in place; both are cropped to our
//   panels' bounds, padded 32px. element: the original's own page, cropped at its root, against our
//   .s-panel from its top-left corner (for originals whose extra chrome would offset a shared crop).
// image: a fixed picture of an original that cannot be rendered (a product photo, a designer's render),
//   stored as <name>.png at DPR 2 with its `source`; capture only measures ours (our panels' union, offset
//   by `at`, at the picture's size) and records the budget.
// page: a live original reached by `steps` (data: click, drag, move, key, type, wait, waitFor, eval),
//   cropped at `rect` (CSS px) or the union of `region`'s elements, against our panels' union from its
//   top-left corner, offset by `at` (for originals with a gap our panel has no element for).
const CASES = {
  dat: { mode: 'switch', page: 'demo/cases/dat.html', source: 'lil-gui 0.19 (the drop-in successor to dat.gui), demo/_ref/lil.html' },
  leva: { mode: 'switch', page: 'demo/cases/leva.html', source: 'leva 0.9.35, demo/_ref/leva-ref.html' },
  'control-panel': { mode: 'switch', page: 'demo/cases/control-panel.html', source: 'control-panel 1.3.4, demo/_ref/cp-ref.html' },
  'control-panel-light': { mode: 'switch', page: 'demo/cases/control-panel.html#shade=ebebeb', source: 'control-panel 1.3.4, light shade' },
  oui: { mode: 'switch', page: 'demo/cases/oui.html', source: 'ouioui 0.0.23, demo/_ref/oui-ref.html' },
  tweakpane: { mode: 'switch', page: 'demo/cases/tweakpane.html', source: 'tweakpane 4 at its 256px default width, demo/_ref/tp.html' },
  // ControlKit scrolls a panel taller than its viewport; a tall one shows it whole.
  controlkit: { mode: 'switch', page: 'demo/cases/controlkit.html', viewport: [1100, 1600], source: 'ControlKit, demo/_ref/ck-ref.html' },
  // UIL draws a 20px close bar under its panel that ours has no element for.
  uil: { mode: 'element', page: 'demo/cases/uil.html', original: 'demo/_ref/uil-ref.html', root: '#wrap > div', source: 'uil 4.4.2, demo/_ref/uil-ref.html' },
  'lab01-dark': { mode: 'element', page: 'demo/cases/lab01.html', viewport: [1440, 900], original: 'https://lab01.dev/experiments/01/', root: '.container', theme: 'dark', source: 'lab01.dev experiment 01, dark' },
  'lab01-light': { mode: 'element', page: 'demo/cases/lab01.html', viewport: [1440, 900], original: 'https://lab01.dev/experiments/01/', root: '.container', theme: 'light', click: '.s-segmented button[aria-label=Light]', source: 'lab01.dev experiment 01, light' },
  'lab01-gold': { mode: 'element', page: 'demo/cases/lab01.html', viewport: [1440, 900], original: 'https://lab01.dev/experiments/01/', root: '.container', theme: 'gold', click: '.s-segmented button[aria-label=Gold]', source: 'lab01.dev experiment 01, gold' },
  // Dear ImGui is one WebGL canvas, its demo window set up by clicks. The demo's Spacing() under the
  // hello line has no panel element, so the title bar and the body below it are measured apart.
  'imgui-title': { ...imgui(), rect: [650, 20, 550, 44] },
  imgui: { ...imgui(), rect: [650, 68, 550, 868], at: [0, 44] },
  'imgui-light-title': { ...imgui('light'), rect: [650, 20, 550, 44] },
  'imgui-light': { ...imgui('light'), rect: [650, 68, 550, 868], at: [0, 44] },
  // DialKit's popover over a toolbar (its version menu and copy key) our panel has no element for: the
  // title, then everything from the header's hairline down, each part against ours where it sits.
  'dialkit-title': dialkit('', [410, 16, 280, 37], [0, 0], 'title and close cross'),
  dialkit: dialkit('', [410, 101, 280, 744], [0, 43], 'from the header hairline to the panel\'s foot'),
  'dialkit-light-title': dialkit('#light', [410, 16, 280, 37], [0, 0], 'title and close cross, light'),
  'dialkit-light': dialkit('#light', [410, 101, 280, 744], [0, 43], 'from the header hairline to the panel\'s foot, light'),
  // one of each control DialKit has, from the first row to the pad's foot (its easing editor has rows ours has not)
  'dialkit-controls': dialkit('', [410, 106, 280, 646], [0, 48], 'every control, from the first row to the pad\'s foot', 'all'),
  'dialkit-controls-light': dialkit('#light', [410, 106, 280, 646], [0, 48], 'every control, from the first row to the pad\'s foot, light', 'all'),
  // Learning Synths without its graphs and modulation dots (the panel has no graph), restacked by the
  // page's own rule; the six columns against our six panels.
  ableton: synth('light'),
  'ableton-dark': synth('dark'),
  // Windows 98 Keyboard Properties: its tab strip, row icons and ? button have no panel element and
  // shift the trackbar rows, so it is measured in parts that compare like with like, each `rect` in
  // dialog coordinates and `at` where that part sits in our panel.
  'win98-title': win98([0, 0, 362, 21], [0, 0], 'title bar without the ? and × buttons'),
  'win98-group': win98([22, 62, 360, 15], [22, 28], 'Character repeat group caption and top edge'),
  'win98-trackbar-start': win98([96, 112, 50, 30], [44, 78], 'Repeat delay: Long caption, channel start, first tick'),
  'win98-trackbar-end': win98([296, 112, 24, 30], [299, 78], 'Repeat delay: thumb at Short, channel end, last tick'),
  'win98-field': win98([45, 239, 314, 38], [45, 205], 'test field and its caption'),
  'win98-buttons': win98([158, 415, 237, 23], [143, 358], 'OK, Cancel, Apply'),
  'win98-typed': win98([45, 254, 314, 23], [45, 220], 'test field after typing "hello world"', 'hello world'),
  // System 7.0's Easy Access control panel on a 1-bit Mac Plus. Its captions under the radio rows
  // (long … short, slow medium fast) have no panel element and shift the rows below, so it is
  // measured in parts, each `rect` in window coordinates and `at` where that part sits in our panel.
  'macintosh-title': macintosh([0, 0, 277, 19], [0, 0], 'title bar with the close box'),
  'macintosh-feedback': macintosh([0, 19, 277, 32], [0, 19], 'first check box and dotted rule'),
  'macintosh-mouse': macintosh([0, 51, 277, 28], [0, 51], 'Mouse Keys heading with its On/Off radios'),
  'macintosh-delay': macintosh([0, 79, 277, 16], [0, 79], 'Initial Delay radio row'),
  'macintosh-speed': macintosh([0, 116, 148, 16], [0, 103], 'Maximum Speed label and first two radios (the rest are grouped 2-4-2)'),
  'macintosh-slow': macintosh([0, 148, 277, 51], [0, 120], 'dotted rule, Slow Keys heading, Acceptance Delay row'),
  'macintosh-click': macintosh([0, 219, 277, 16], [0, 180], 'Use key click sound check box'),
  'macintosh-sticky': macintosh([0, 238, 277, 33], [0, 197], 'dotted rule, Sticky Keys heading'),
  'macintosh-beep': macintosh([0, 271, 277, 26], [0, 231], 'last check box, bottom frame and shadow'),
  // "DMX-FIELD", an OP-1-field-style lighting desk: a picture, not a page. Its speaker grille and the waveform
  // on its screen have no panel element, and our module titles push the rest down, so it is measured in parts.
  'industrial-top': industrial([1, 1, 1939, 85], [-17, -20], 'chassis top edge and corners, the ground above'),
  'industrial-screen-top': industrial([80, 256, 520, 306], [23, 127], 'screen bezel and first line, DMX-FIELD / UNI:1 ACTIVE'),
  'industrial-screen-bottom': industrial([80, 462, 520, 520], [23, 155], 'screen\'s last line, WAVE: SINE / SYNC: INT, and bezel'),
  'industrial-keys': industrial([40, 601, 540, 1001], [3, 277], 'PAGE keys and keypad'),
  'industrial-encoders': industrial([601, 80, 1241, 262], [282, 58], 'PAN, TILT, DIMMER, FX RATE encoders'),
  'industrial-master': industrial([1741, 70, 1861, 230], [613, 60], 'MASTER encoder'),
  'industrial-faders': industrial([601, 470, 1939, 1000], [283, 211], 'faders 01-07 and master with their keys, the chassis\' right edge'),
  'industrial-bottom': industrial([1, 1000, 1939, 1060], [-17, 477], 'chassis bottom edge and shadow'),
  // The material study's four rows of keys (Search neu, Think glass, Upgrade soft, Customize skeu) in each finish:
  // the owner's pictures, each scaled and cropped to fit our rows by least squares (scale and the crop's origin, in
  // the picture's own pixels, recorded).
  'study-graphite': study('graphite', .519, [155, 92]),
  'study-bronze': study('bronze', .59, [157, 95]),
  'study-chalk': study('chalk', .51, [20, 29]),
  // Studio is an original, held to the owner's shot of the reference it was drawn from (rows, gaps, insets)
  studio: { mode: 'image', page: 'demo/cases/studio.html', viewport: [900, 1000], at: [0, 0], source: "the owner's shot of the light reference (Text / Layout / Path), its sheet cropped at 66, 114 and scaled ×0.5372: the sheet down to its last row" },
  // Pictures of designs the owner supplied, each drawn by the closest theme; scaled and cropped to our render
  dashboard: { mode: 'image', page: 'test/cases/dashboard.html', viewport: [1000, 800], at: [0, -30], source: "Demo Dashboard (owner's image ×1.008, cropped at 4, 2): the window, its title bar and tiles" },
  send: { mode: 'image', page: 'test/cases/send.html', viewport: [900, 900], at: [-12, -12], source: "Send Money dialog (owner's image ×0.998, cropped at 2, 71): the dialog" },
  push: { mode: 'image', page: 'test/cases/push.html', viewport: [800, 800], at: [-15, -40], source: "push the button in figma, yodiz × zaykina (owner's image ×0.955, cropped at 355, 341): the round key" },
  workflow: { mode: 'image', page: 'test/cases/workflow.html', viewport: [900, 1100], at: [0, 0], source: "automation builder's Actions palette (owner's image, cropped at 240, 378): the palette" },
  inspector: { mode: 'image', page: 'test/cases/inspector.html', viewport: [900, 1000], at: [0, 0], source: "visual CSS editor's Edit element panel (owner's image cropped at 2493, 1136, ×0.523): the panel's top, as far as the picture shows it" },
}

function imgui(scheme) {
  const style = [[795, 48], [818, 158], [550, 79], [490, 120], [801, 29]].map(p => ['click', ...p])
  return {
    mode: 'page', page: 'demo/cases/imgui.html' + (scheme ? '#' + scheme : ''), viewport: [1100, 1000],
    original: 'https://floooh.github.io/sokol-html5/imgui-sapp.html', originalViewport: [1280, 1100],
    steps: [['wait', 2500], ...(scheme ? style : []), ...[[700, 142], [1028, 167], [847, 148], [700, 123], [700, 146], [695, 166]].map(p => ['click', ...p]),
      ['drag', 1195, 695, 1195, 1085], ['move', 100, 1050], ['wait', 1000]],
    source: `Dear ImGui 1.92.9b demo, Widgets > Basic, StyleColors${scheme ? 'Light' : 'Dark'} (sokol-samples imgui-sapp)`,
  }
}
function dialkit(hash, rect, at, part, all) {
  const [page, ref] = all ? ['dialkit-all', 'dialkit-all-ref'] : ['dialkit', 'dialkit-ref']
  return { mode: 'page', page: `${all ? 'test' : 'demo'}/cases/${page}.html` + hash, viewport: [1100, 1000], original: `demo/_ref/${ref}.html` + hash, steps: [['wait', 800]], rect, at,
    source: `DialKit 2.0.2 vanilla build, ${all ? 'one of each control' : 'its README example'}, popover${hash ? ', light' : ''}, demo/_ref/${ref}.html: ${part}` }
}
function synth(scheme) {
  const panel = '.components_embeds_subtractive-synth__panel'
  return {
    mode: 'page', page: 'test/cases/ableton.html' + (scheme === 'dark' ? '#dark' : ''), viewport: [1440, 900], scheme, until: 'load',
    original: 'https://learningsynths.ableton.com/en/playground', region: panel,
    steps: [['waitFor', '#lfo-panel .components_control__slider'], ['wait', 5000], ['click', 'Close'], ['wait', 1500],
      ['eval', `window.requestAnimationFrame = () => 0
        document.head.insertAdjacentHTML('beforeend', '<style>.components_embeds_subtractive-synth__visualization_panel, .components_control__modulation_dot { display: none !important }</style>')
        for (const p of document.querySelectorAll('${panel}[id]')) document.body.style.setProperty('--' + p.id + '-height', p.getBoundingClientRect().height + 'px')`],
      ['wait', 800]],
    source: `Ableton Learning Synths playground, ${scheme}, graphs hidden`,
  }
}
// Windows 98 booted from v86's saved state (640×480, 16 colours) and driven by keys: Start › Settings ›
// Control Panel › Keyboard; the pointer swept off the dialog, focus moved to the Speed tab so no focus
// rectangle sits on a control. The guest canvas, which v86 scales by the device pixel ratio, is pinned to
// 640×480 CSS px and pixelated, so DPR 2 doubles guest pixels; the dialog opens at guest (66, 0), page (84, 90).
function win98([x, y, width, height], at, part, typed) {
  const keys = [...(typed || '')].flatMap(k => [['type', k], ['wait', 150]])
  return {
    mode: 'page', page: 'demo/cases/win98.html' + (typed ? '#typed' : ''), until: 'load',
    original: 'https://copy.sh/v86/?profile=windows98', originalViewport: [1280, 900],
    steps: [['waitFor', 'canvas#vga'],
      ['eval', `new Promise(r => { const t = setInterval(() => { if (document.querySelector('#vga').width === 640 && /Running: \\d+s/.test(document.body.innerText)) clearInterval(t) || r() }, 250) })`],
      ['wait', 5000], ['eval', 'document.activeElement.blur()'],
      ['key', 'Control+Escape'], ['wait', 2500], ['key', 's'], ['wait', 2500], ['key', 'c'], ['wait', 15000],
      ['key', 'k'], ['wait', 2500], ['key', 'Enter'], ['wait', 15000],
      ...Array.from({ length: 20 }, (_, i) => ['move', 220 + i * 20, 330 + i * 10]), ['wait', 1500],
      ['key', 'Shift+Tab'], ['wait', 2500],
      ...(typed ? [['key', 'Tab'], ['wait', 700], ['key', 'Tab'], ['wait', 700], ['key', 'Tab'], ['wait', 700], ...keys, ['wait', 1500], ['key', 'Tab'], ['wait', 1500]] : []),
      ['eval', `Object.assign(document.querySelector('#vga').style, { width: '640px', height: '480px', imageRendering: 'pixelated' })`], ['wait', 500]],
    rect: [84 + x, 90 + y, width, height], at,
    source: `Windows 98 in v86 (copy.sh/v86, build 1e4f43c95), Control Panel › Keyboard Properties › Speed: ${part}`,
  }
}

// System 7.0 in Infinite Mac on an emulated 1-bit Mac Plus (Mini vMac, 512×342), driven by keys only: dismiss
// the boot alert, close Infinite HD, then type-select and ⌘O down Macintosh HD › System Folder › Control Panels
// › Easy Access, the pointer swept off the window. The canvas is 512×342 CSS px and pixelated by the site, so
// DPR 2 doubles guest pixels; the window opens at guest (100, 42), page (444, 321), and its rects include the
// 1px drop shadow.
function macintosh([x, y, width, height], at, part) {
  const keys = text => [...text].flatMap(k => [['type', k], ['wait', 150]])
  const open = name => [...keys(name), ['wait', 800], ['key', 'Meta+o'], ['wait', 4000]]
  return {
    mode: 'page', page: 'demo/cases/macintosh.html', until: 'load',
    original: 'https://infinitemac.org/1991/System%207.0?machine=Mac%20Plus', originalViewport: [1200, 900],
    steps: [['waitFor', 'canvas'], ['wait', 75000], ['key', 'Enter'], ['wait', 3000], ['key', 'Meta+w'], ['wait', 1500],
      ...open('macintosh'), ...open('system folder'), ...open('control panels'),
      ['move', 348, 609], ['wait', 1500], ['move', 345, 619], ['wait', 1500], ...open('easy')],
    rect: [444 + x, 321 + y, width, height], at,
    source: `System 7.0 Easy Access control panel, Mac Plus 1-bit, Infinite Mac (infinitemac.org): ${part}`,
  }
}

// The owner's DMX-FIELD image (1939×1061, a 2x render; author unknown, no live original found), cropped at
// `rect` (image px; even sizes, origins chosen so each part lands on whole CSS px of ours) into
// industrial-<part>.png; the chassis' top-left corner is image (35, 41).
function industrial(rect, at, part) {
  return { mode: 'image', page: 'test/cases/industrial.html', at, source: `DMX-FIELD mockup (owner's image, 2x) cropped at ${rect.join(', ')}: ${part}` }
}

// the picture's crop sits 39.4px left of and 40px above the study's rows (their panels' union)
function study(finish, scale, [x, y]) {
  return { mode: 'image', page: 'demo/cases/materials.html#' + finish, viewport: [1100, 1000], at: [-39.4375, -40], source: `material study, ${finish} (owner's image ×${scale}, cropped at ${x}, ${y}): the four rows of keys` }
}

const manifestUrl = new URL('manifest.json', DIR)
const manifest = existsSync(manifestUrl) ? JSON.parse(readFileSync(manifestUrl, 'utf8')) : { cases: {} }
const args = process.argv.slice(2)
const names = args.length ? args.filter(n => n !== 'materials') : Object.keys(CASES)

const browser = await chromium.launch({ args: ['--disable-quic'] })  // infinitemac.org fails to load over QUIC
if (args.includes('materials')) {
  const page = await browser.newPage({ baseURL: HOST, viewport: { width: 760, height: 700 }, deviceScaleFactor: 2 })
  for (const [key, row] of Object.entries(materials.rows)) {
    const [theme, palette] = key.split('/')
    const got = zones(row.profile, await profile(page, theme, palette, row.word))
    row.budget = Object.fromEntries(Object.entries(got).map(([zone, dE]) => [zone, Math.ceil((dE + .3) * 10) / 10]))
    console.log(key, JSON.stringify(got))
  }
  writeFileSync(new URL('materials.json', DIR), JSON.stringify(materials))
  await page.close()
}
const open = async (url, [width, height], { scheme = 'light', until = 'networkidle' } = {}) => {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, colorScheme: scheme })
  await page.goto(/^https?:/.test(url) ? url : HOST + url, { waitUntil: until, timeout: 90000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(700)
  return page
}
const hideSwitch = page => page.evaluate(() => { const s = document.querySelector('.case-bar'); if (s) s.style.visibility = 'hidden' })
const union = (page, selector) => page.evaluate(selector => {
  const r = [...document.querySelectorAll(selector)].map(e => e.getBoundingClientRect()), x = Math.min(...r.map(q => q.left)), y = Math.min(...r.map(q => q.top))
  return [x, y, Math.max(...r.map(q => q.right)) - x, Math.max(...r.map(q => q.bottom)) - y]
}, selector)
const act = {
  click: async (page, x, y) => { await (typeof x === 'number' ? page.mouse.click(x, y) : page.getByRole('button', { name: x, exact: true }).first().click()); await page.waitForTimeout(300) },
  drag: async (page, x0, y0, x1, y1) => { await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x1, y1, { steps: 10 }); await page.mouse.up(); await page.waitForTimeout(300) },
  move: (page, x, y) => page.mouse.move(x, y),
  key: (page, key) => page.keyboard.press(key),
  type: (page, text) => page.keyboard.type(text),
  wait: (page, ms) => page.waitForTimeout(ms),
  waitFor: (page, selector) => page.waitForSelector(selector, { timeout: 90000 }),
  eval: (page, js) => page.evaluate(js),
}

for (const name of names) {
  const c = CASES[name], viewport = c.viewport || [1100, 800]
  const ours = await open(c.page, viewport)
  if (c.click) { await ours.click(c.click); await ours.waitForTimeout(800) }
  await hideSwitch(ours)
  let reference, clip
  if (c.mode === 'switch') {
    clip = await ours.evaluate(([vw, vh]) => {
      const r = [...document.querySelectorAll('.s-panel')].map(e => e.getBoundingClientRect()), pad = 32
      const x = Math.max(0, Math.floor(Math.min(...r.map(q => q.left)) - pad)), y = Math.max(0, Math.floor(Math.min(...r.map(q => q.top)) - pad))
      return { x, y, width: Math.min(vw, Math.ceil(Math.max(...r.map(q => q.right)) + pad)) - x, height: Math.min(vh, Math.ceil(Math.max(...r.map(q => q.bottom)) + pad)) - y }
    }, viewport)
    const native = await open(c.page, viewport)
    await native.click('.case-render-switch button[data-mode=native]')
    await native.waitForLoadState('networkidle')
    await native.waitForTimeout(3500)
    await hideSwitch(native)
    reference = await native.screenshot({ clip })
    await native.close()
  } else if (c.mode === 'image') {
    const { width, height } = await ours.evaluate(async url => { const b = await createImageBitmap(await (await fetch(url)).blob()); return { width: b.width, height: b.height } }, `${HOST}test/calibration/${name}.png`)
    const [u, v] = await union(ours, '.s-panel'), [dx, dy] = c.at || [0, 0]
    clip = { x: u + dx, y: v + dy, width: width / 2, height: height / 2 }
  } else if (c.mode === 'page') {
    const original = await open(c.original, c.originalViewport || viewport, c)
    for (const [op, ...args] of c.steps) await act[op](original, ...args)
    const [x, y, width, height] = c.rect || await union(original, c.region), [u, v] = await union(ours, '.s-panel'), [dx, dy] = c.at || [0, 0]
    reference = await original.screenshot({ clip: { x, y, width, height } })
    clip = { x: u + dx, y: v + dy, width, height }
    await original.close()
  } else {
    const original = await open(c.original, viewport)
    if (c.theme) {
      await original.evaluate(t => { const i = document.querySelector(`input#theme-picker-${t}`); i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })) }, c.theme)
      await original.waitForTimeout(1200)
    }
    // The original cropped to our panel's size: chrome it draws beyond ours (UIL's close bar)
    // stays out of the reference instead of inflating the budget.
    const size = await ours.locator('.s-panel').first().boundingBox()
    const root = await original.locator(c.root).boundingBox()
    reference = await original.screenshot({ clip: { x: root.x, y: root.y, width: Math.min(root.width, size.width), height: Math.min(root.height, size.height) } })
    await original.close()
  }
  if (reference) writeFileSync(new URL(`${name}.png`, DIR), reference)
  const shot = clip ? await ours.screenshot({ clip }) : await ours.locator('.s-panel').first().screenshot()
  const budget = await differing(ours, shot, `${HOST}test/calibration/${name}.png`)
  const { mode, source, click } = c
  manifest.cases[name] = { page: c.page, viewport, ...(clip && { clip }), ...(click && { click }), budget, source, mode }
  console.log(name, budget)
  await ours.close()
}
await browser.close()
writeFileSync(manifestUrl, JSON.stringify(manifest, null, 2) + '\n')
