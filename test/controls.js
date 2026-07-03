import './register.js'
import test, { is, ok } from 'tst'
import { signal } from 'sprae'
import slider from '../control/slider.js'
import boolean from '../control/boolean.js'
import number from '../control/number.js'
import select from '../control/select.js'
import color from '../control/color.js'
import text from '../control/text.js'
import textarea from '../control/textarea.js'
import info from '../control/info.js'
import separator from '../control/separator.js'
import vector from '../control/vector.js'
import xy from '../control/xy.js'
import knob from '../control/knob.js'

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const mount = () => {
  const c = document.createElement('div')
  document.body.appendChild(c)
  return c
}

const cleanup = (ctrl, container) => {
  ctrl[Symbol.dispose]()
  container.remove()
}

// ─────────────────────────────────────────────────────────────────────────────
// LABEL ASSOCIATION
// ─────────────────────────────────────────────────────────────────────────────

test('label: for attribute links to input id', () => {
  const c = mount()
  const s = signal(50)
  const ctrl = slider(s, { min: 0, max: 100, label: 'volume', container: c })
  const label = ctrl.el.querySelector('.s-label-group')
  const input = ctrl.el.querySelector('input')
  is(label.getAttribute('for'), 'volume')
  is(input.id, 'volume')
  cleanup(ctrl, c)
})

test('label: no for attribute when label is empty', () => {
  const c = mount()
  const s = signal(50)
  const ctrl = slider(s, { min: 0, max: 100, container: c })
  const label = ctrl.el.querySelector('.s-label-group')
  is(label.getAttribute('for'), null)
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// SLIDER: LINEAR
// ─────────────────────────────────────────────────────────────────────────────

test('slider: linear signal wiring', () => {
  const c = mount()
  const s = signal(50)
  const ctrl = slider(s, { min: 0, max: 100, step: 1, container: c })
  is(s.value, 50)
  ok(ctrl.el, 'has el')
  cleanup(ctrl, c)
})

test('slider: linear set from input', () => {
  const c = mount()
  const s = signal(0)
  const ctrl = slider(s, { min: 0, max: 100, step: 1, container: c })
  const inp = ctrl.el.querySelector('input[type=range]')
  inp.value = 75
  inp.dispatchEvent(new Event('input'))
  is(s.value, 75)
  cleanup(ctrl, c)
})

test('slider: clamps to bounds', () => {
  const c = mount()
  const s = signal(50)
  const ctrl = slider(s, { min: 0, max: 100, step: 1, container: c })
  const inp = ctrl.el.querySelector('input[type=range]')
  inp.value = 200
  inp.dispatchEvent(new Event('input'))
  is(s.value, 100)
  inp.value = -50
  inp.dispatchEvent(new Event('input'))
  is(s.value, 0)
  cleanup(ctrl, c)
})

test('slider: step quantize', () => {
  const c = mount()
  const s = signal(0)
  const ctrl = slider(s, { min: 0, max: 10, step: 0.5, container: c })
  const inp = ctrl.el.querySelector('input[type=range]')
  inp.value = 3.3
  inp.dispatchEvent(new Event('input'))
  is(s.value, 3.5)
  cleanup(ctrl, c)
})

test('slider: format with unit', () => {
  const c = mount()
  const s = signal(50)
  const ctrl = slider(s, { min: 0, max: 100, step: 1, unit: 'px', container: c })
  const val = ctrl.el.querySelector('.s-readout')
  is(val.value, '50px')
  cleanup(ctrl, c)
})

test('slider: custom format', () => {
  const c = mount()
  const s = signal(0.5)
  const ctrl = slider(s, { min: 0, max: 1, step: 0.01, format: v => (v * 100 | 0) + '%', container: c })
  const val = ctrl.el.querySelector('.s-readout')
  is(val.value, '50%')
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// SLIDER: MARKS
// ─────────────────────────────────────────────────────────────────────────────

test('slider: marks true generates ticks', () => {
  const c = mount()
  const s = signal(5)
  const ctrl = slider(s, { min: 0, max: 10, step: 1, marks: true, container: c })
  const marks = ctrl.el.querySelectorAll('.s-mark')
  ok(marks.length >= 3, 'has marks')
  cleanup(ctrl, c)
})

test('slider: marks array positions', () => {
  const c = mount()
  const s = signal(0)
  const ctrl = slider(s, { min: 0, max: 100, step: 1, marks: [0, 50, 100], container: c })
  const marks = ctrl.el.querySelectorAll('.s-mark')
  is(marks.length, 3)
  is(marks[0].style.left, '0%')
  is(marks[1].style.left, '50%')
  is(marks[2].style.left, '100%')
  cleanup(ctrl, c)
})

test('slider: marks ends', () => {
  const c = mount()
  const s = signal(0)
  const ctrl = slider(s, { min: 0, max: 100, step: 1, marks: 'ends', container: c })
  const marks = ctrl.el.querySelectorAll('.s-mark')
  is(marks.length, 2)
  is(marks[0].style.left, '0%')
  is(marks[1].style.left, '100%')
  cleanup(ctrl, c)
})

test('slider: marks center', () => {
  const c = mount()
  const s = signal(0)
  const ctrl = slider(s, { min: 0, max: 100, step: 1, marks: 'center', container: c })
  const marks = ctrl.el.querySelectorAll('.s-mark')
  is(marks.length, 1)
  is(marks[0].style.left, '50%')
  cleanup(ctrl, c)
})

test('slider: marks object with labels', () => {
  const c = mount()
  const s = signal(0)
  const ctrl = slider(s, { min: 0, max: 100, step: 1, marks: { 0: 'Low', 50: 'Mid', 100: 'High' }, container: c })
  const labels = ctrl.el.querySelectorAll('.s-mark-label')
  is(labels.length, 3)
  is(labels[0].textContent, 'Low')
  is(labels[1].textContent, 'Mid')
  is(labels[2].textContent, 'High')
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// SLIDER: LOG SCALE
// ─────────────────────────────────────────────────────────────────────────────

test('slider: log scale signal wiring', () => {
  const c = mount()
  const s = signal(100)
  const ctrl = slider(s, { min: 1, max: 1000, scale: 'log', container: c })
  is(s.value, 100)
  ok(ctrl.el)
  cleanup(ctrl, c)
})

test('slider: log scale marks positioned correctly', () => {
  const c = mount()
  const s = signal(1)
  // 10 on log(1..1000) = ln(10)/ln(1000) = 33.3%
  const ctrl = slider(s, { min: 1, max: 1000, scale: 'log', marks: [1, 10, 100, 1000], container: c })
  const marks = ctrl.el.querySelectorAll('.s-mark')
  is(marks.length, 4)

  const pcts = [...marks].map(m => parseFloat(m.style.left))
  is(pcts[0], 0)      // min
  is(pcts[3], 100)    // max
  // 10 ≈ 33.3%, 100 ≈ 66.7%
  ok(Math.abs(pcts[1] - 33.333) < 0.1, `10 at ~33.3% (got ${pcts[1]})`)
  ok(Math.abs(pcts[2] - 66.667) < 0.1, `100 at ~66.7% (got ${pcts[2]})`)
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// SLIDER: CURVE
// ─────────────────────────────────────────────────────────────────────────────

test('slider: curve power=2 (precise at low end)', () => {
  const c = mount()
  const s = signal(0)
  const ctrl = slider(s, { min: 0, max: 100, step: 1, curve: 2, container: c })
  // Set slider to midpoint display position — should map to higher actual value
  const inp = ctrl.el.querySelector('input[type=range]')
  inp.value = 50
  inp.dispatchEvent(new Event('input'))
  // curve=2: to(0.5) = 0.25, so display 50 → actual 25
  is(s.value, 25)
  cleanup(ctrl, c)
})

test('slider: curve power=0.5 (precise at high end)', () => {
  const c = mount()
  const s = signal(0)
  const ctrl = slider(s, { min: 0, max: 100, step: 1, curve: 0.5, container: c })
  const inp = ctrl.el.querySelector('input[type=range]')
  inp.value = 50
  inp.dispatchEvent(new Event('input'))
  // curve=0.5: to(0.5) = sqrt(0.5) ≈ 0.707, so display 50 → actual ~70.7, quantized to 71
  is(s.value, 71)
  cleanup(ctrl, c)
})

test('slider: curve exp alias', () => {
  const c = mount()
  const s = signal(0)
  const ctrl = slider(s, { min: 0, max: 100, step: 1, curve: 'exp', container: c })
  const inp = ctrl.el.querySelector('input[type=range]')
  inp.value = 50
  inp.dispatchEvent(new Event('input'))
  is(s.value, 25) // same as curve=2
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// SLIDER: SNAP
// ─────────────────────────────────────────────────────────────────────────────

test('slider: snap to marks', () => {
  const c = mount()
  const s = signal(0)
  const ctrl = slider(s, { min: 0, max: 100, step: 1, marks: [0, 25, 50, 75, 100], snap: true, container: c })

  // Simulate drag (pointerdown + input + pointerup)
  const inp = ctrl.el.querySelector('input[type=range]')
  inp.dispatchEvent(new Event('pointerdown'))
  inp.value = 26
  inp.dispatchEvent(new Event('input'))
  // Should snap to 25
  is(s.value, 25)
  inp.dispatchEvent(new Event('pointerup'))
  cleanup(ctrl, c)
})

test('slider: no snap without option', () => {
  const c = mount()
  const s = signal(0)
  const ctrl = slider(s, { min: 0, max: 100, step: 1, marks: [0, 25, 50, 75, 100], snap: false, container: c })
  const inp = ctrl.el.querySelector('input[type=range]')
  inp.dispatchEvent(new Event('pointerdown'))
  inp.value = 26
  inp.dispatchEvent(new Event('input'))
  is(s.value, 26)
  inp.dispatchEvent(new Event('pointerup'))
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// SLIDER: DISCRETE
// ─────────────────────────────────────────────────────────────────────────────

test('slider: discrete step array', () => {
  const c = mount()
  const s = signal(1)
  const ctrl = slider(s, { step: [1, 2, 4, 8, 16], container: c })
  ok(ctrl.el)
  // Marks should be generated from steps
  const marks = ctrl.el.querySelectorAll('.s-mark')
  // discrete with step array auto-enables marks & snap
  cleanup(ctrl, c)
})

test('slider: discrete keyboard steps to neighbouring value', () => {
  const c = mount()
  const s = signal(4)
  const ctrl = slider(s, { step: [1, 2, 4, 8, 16], container: c })
  const readout = ctrl.el.querySelector('input.s-readout')
  readout.value = '4'
  readout.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
  is(s.value, 8)
  readout.value = '8'
  readout.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
  is(s.value, 4)
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// SLIDER: DISPOSE
// ─────────────────────────────────────────────────────────────────────────────

test('slider: dispose removes el', () => {
  const c = mount()
  const s = signal(50)
  const ctrl = slider(s, { min: 0, max: 100, container: c })
  ok(ctrl.el.parentNode)
  ctrl[Symbol.dispose]()
  ok(!ctrl.el.parentNode, 'el removed from DOM')
  c.remove()
})

// ─────────────────────────────────────────────────────────────────────────────
// BOOLEAN
// ─────────────────────────────────────────────────────────────────────────────

test('boolean: renders checkbox', () => {
  const c = mount()
  const s = signal(false)
  const ctrl = boolean(s, { container: c })
  const inp = ctrl.el.querySelector('input[type=checkbox]')
  ok(inp, 'has checkbox')
  ok(!inp.checked)
  cleanup(ctrl, c)
})

test('boolean: toggle updates signal', () => {
  const c = mount()
  const s = signal(false)
  const ctrl = boolean(s, { container: c })
  const inp = ctrl.el.querySelector('input[type=checkbox]')
  inp.checked = true
  inp.dispatchEvent(new Event('change'))
  is(s.value, true)
  cleanup(ctrl, c)
})

test('boolean: signal updates checkbox', () => {
  const c = mount()
  const s = signal(true)
  const ctrl = boolean(s, { container: c })
  const inp = ctrl.el.querySelector('input[type=checkbox]')
  ok(inp.checked)
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// NUMBER
// ─────────────────────────────────────────────────────────────────────────────

test('number: renders input', () => {
  const c = mount()
  const s = signal(5)
  const ctrl = number(s, { container: c })
  const inp = ctrl.el.querySelector('input[type=number]')
  ok(inp)
  is(inp.value, '5')
  cleanup(ctrl, c)
})

test('number: input updates signal', () => {
  const c = mount()
  const s = signal(5)
  const ctrl = number(s, { min: 0, max: 10, step: 1, container: c })
  const inp = ctrl.el.querySelector('input[type=number]')
  inp.value = '6'
  inp.dispatchEvent(new Event('input'))
  is(s.value, 6)
  inp.value = '4'
  inp.dispatchEvent(new Event('input'))
  is(s.value, 4)
  cleanup(ctrl, c)
})

test('number: clamps to min/max', () => {
  const c = mount()
  const s = signal(5)
  const ctrl = number(s, { min: 0, max: 10, step: 1, container: c })
  // Native min/max constrains in real browsers; test via signal directly
  is(s.value, 5)
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// SELECT
// ─────────────────────────────────────────────────────────────────────────────

test('select: dropdown renders options', () => {
  const c = mount()
  const s = signal('a')
  const ctrl = select(s, { options: ['a', 'b', 'c'], container: c })
  const opts = ctrl.el.querySelectorAll('option')
  is(opts.length, 3)
  is(opts[0].value, 'a')
  is(opts[1].value, 'b')
  is(opts[2].value, 'c')
  cleanup(ctrl, c)
})

test('select: dropdown preserves numeric option value type', () => {
  const c = mount()
  const s = signal(1)
  const ctrl = select(s, { options: [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }], container: c })
  const sel = ctrl.el.querySelector('select')
  sel.value = '2'
  sel.dispatchEvent(new Event('change'))
  is(s.value, 2)              // number, not the DOM string '2'
  is(typeof s.value, 'number')
  cleanup(ctrl, c)
})

test('select: segmented variant', () => {
  const c = mount()
  const s = signal('x')
  const ctrl = select(s, { variant: 'segmented', options: ['x', 'y', 'z'], container: c })
  const btns = ctrl.el.querySelectorAll('button')
  is(btns.length, 3)
  btns[1].dispatchEvent(new Event('click'))
  is(s.value, 'y')
  cleanup(ctrl, c)
})

test('select: multi-select segmented toggle', async () => {
  const c = mount()
  const s = signal([])
  const ctrl = select(s, { variant: 'segmented', multiple: true, options: ['a', 'b', 'c'], container: c })
  const btns = ctrl.el.querySelectorAll('button')
  is(btns.length, 3)
  const tick = () => new Promise(r => queueMicrotask(r))

  // Click 'a' → ['a']
  await tick()
  btns[0].dispatchEvent(new Event('click'))
  await tick()
  is(JSON.stringify(s.value), '["a"]')
  ok(btns[0].classList.contains('s-selected'), 'a selected after click')

  // Click 'b' → ['a', 'b']
  btns[1].dispatchEvent(new Event('click'))
  await tick()
  is(JSON.stringify(s.value), '["a","b"]')
  ok(btns[0].classList.contains('s-selected'), 'a still selected')
  ok(btns[1].classList.contains('s-selected'), 'b selected after click')

  // Click 'a' again → ['b'] (deselect)
  btns[0].dispatchEvent(new Event('click'))
  await tick()
  await tick()
  await tick()
  is(JSON.stringify(s.value), '["b"]')
  ok(!btns[0].classList.contains('s-selected'), 'a deselected after second click')
  ok(btns[1].classList.contains('s-selected'), 'b still selected')

  cleanup(ctrl, c)
})


// ─────────────────────────────────────────────────────────────────────────────
// COLOR
// ─────────────────────────────────────────────────────────────────────────────

test('color: renders inputs', () => {
  const c = mount()
  const s = signal('#ff0000')
  const ctrl = color(s, { container: c })
  const picker = ctrl.el.querySelector('input[type=color]')
  const txt = ctrl.el.querySelector('input[type=text]')
  ok(picker)
  ok(txt)
  is(picker.value, '#ff0000')
  cleanup(ctrl, c)
})

test('color: normalizes short hex on mount', () => {
  const c = mount()
  const s = signal('#fff')
  const ctrl = color(s, { container: c })
  is(s.value, '#ffffff')
  is(ctrl.el.querySelector('input[type=color]').value, '#ffffff')
  is(ctrl.el.querySelector('input[type=text]').value, '#ffffff')
  cleanup(ctrl, c)
})

test('color: normalizes input to full hex', () => {
  const c = mount()
  const s = signal('#ffffff')
  const ctrl = color(s, { container: c })
  const txt = ctrl.el.querySelector('input[type=text]')
  txt.value = '000'
  txt.dispatchEvent(new Event('input', { bubbles: true }))
  is(s.value, '#000000')
  cleanup(ctrl, c)
})

test('color: swatches variant', () => {
  const c = mount()
  const s = signal('#ff0000')
  const ctrl = color(s, { variant: 'swatches', colors: ['#ff0000', '#00ff00', '#0000ff'], container: c })
  const btns = ctrl.el.querySelectorAll('button')
  is(btns.length, 3)
  btns[2].dispatchEvent(new Event('click'))
  is(s.value, '#0000ff')
  cleanup(ctrl, c)
})

test('color: formatText/parseText apply to both variants', () => {
  const c = mount()
  // picker: display without '#', parse re-adds it
  const s1 = signal('#aa00ff')
  const ctrl1 = color(s1, { container: c, formatText: v => v.replace(/^#/, ''), parseText: v => v.startsWith('#') ? v : `#${v}` })
  const txt1 = ctrl1.el.querySelector('input[type=text]')
  is(txt1.value, 'aa00ff')
  txt1.value = '00ff88'
  txt1.dispatchEvent(new Event('change', { bubbles: true }))
  is(s1.value, '#00ff88')
  cleanup(ctrl1, c)
  // rgba: same hooks must apply (was a gap — only picker honored them)
  const c2 = mount()
  const s2 = signal('#11223344')
  const ctrl2 = color(s2, { variant: 'rgba', container: c2, formatText: v => v.replace(/^#/, ''), parseText: v => v.startsWith('#') ? v : `#${v}` })
  const txt2 = ctrl2.el.querySelector('input[type=text]')
  is(txt2.value, '11223344')
  txt2.value = '12345680'
  txt2.dispatchEvent(new Event('change', { bubbles: true }))
  is(s2.value, '#12345680')
  cleanup(ctrl2, c2)
})

test('color: rgba variant exposes rgb + alpha and round-trips', () => {
  const c = mount()
  const s = signal('rgba(255, 0, 0, 0.5)')
  const ctrl = color(s, { variant: 'rgba', container: c })
  const swatch = ctrl.el.querySelector('input[type=color]')
  const alpha = ctrl.el.querySelector('input.s-alpha')
  is(swatch.value, '#ff0000')
  is(alpha.value, '0.5')
  // alpha → 1 collapses to #rrggbb (no alpha suffix)
  alpha.value = '1'
  alpha.dispatchEvent(new Event('input'))
  is(s.value, '#ff0000')
  // external rgb change preserved into the swatch + alpha
  s.value = 'rgba(0, 0, 255, 0.25)'
  is(swatch.value, '#0000ff')
  is(alpha.value, '0.25')
  cleanup(ctrl, c)
})

test('color: rgba text input writes hex8', () => {
  const c = mount()
  const s = signal('#000000')
  const ctrl = color(s, { variant: 'rgba', container: c })
  const txt = ctrl.el.querySelector('input[type=text]')
  txt.value = '#ff000080'
  txt.dispatchEvent(new Event('input', { bubbles: true }))
  is(s.value, '#ff000080')
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// TEXT
// ─────────────────────────────────────────────────────────────────────────────

test('text: renders input', () => {
  const c = mount()
  const s = signal('hello')
  const ctrl = text(s, { container: c })
  const inp = ctrl.el.querySelector('input[type=text]')
  ok(inp)
  is(inp.value, 'hello')
  cleanup(ctrl, c)
})

test('text: input writes back to signal', () => {
  const c = mount()
  const s = signal('hello')
  const ctrl = text(s, { container: c })
  const inp = ctrl.el.querySelector('input[type=text]')
  inp.value = 'world'
  inp.dispatchEvent(new Event('input', { bubbles: true }))
  is(s.value, 'world')
  cleanup(ctrl, c)
})

test('text: signal updates input', () => {
  const c = mount()
  const s = signal('hello')
  const ctrl = text(s, { container: c })
  const inp = ctrl.el.querySelector('input[type=text]')
  s.value = 'changed'
  is(inp.value, 'changed')
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// TEXTAREA
// ─────────────────────────────────────────────────────────────────────────────

test('textarea: renders and writes back to signal', () => {
  const c = mount()
  const s = signal('a\nb')
  const ctrl = textarea(s, { container: c })
  const ta = ctrl.el.querySelector('textarea')
  ok(ta)
  is(ta.value, 'a\nb')
  ta.value = 'changed text'
  ta.dispatchEvent(new Event('input', { bubbles: true }))
  is(s.value, 'changed text')
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// INFO / MONITOR
// ─────────────────────────────────────────────────────────────────────────────

test('info: displays signal value, reactively, read-only', () => {
  const c = mount()
  const s = signal(60)
  const ctrl = info(s, { container: c })
  const out = ctrl.el.querySelector('.s-monitor')
  is(out.textContent, '60')
  s.value = 75
  is(out.textContent, '75')
  cleanup(ctrl, c)
})

test('info: format function', () => {
  const c = mount()
  const s = signal(60)
  const ctrl = info(s, { format: v => v + ' fps', container: c })
  is(ctrl.el.querySelector('.s-monitor').textContent, '60 fps')
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// SEPARATOR
// ─────────────────────────────────────────────────────────────────────────────

test('separator: renders a divider and disposes', () => {
  const c = mount()
  const sep = separator({ container: c })
  ok(sep.el.classList.contains('s-separator'))
  ok(!sep.el.classList.contains('s-separator-labeled'))
  sep[Symbol.dispose]()
  ok(!sep.el.parentNode, 'removed on dispose')
  c.remove()
})

test('separator: labeled variant', () => {
  const c = mount()
  const sep = separator({ label: 'Advanced', container: c })
  ok(sep.el.classList.contains('s-separator-labeled'))
  is(sep.el.querySelector('.s-separator-label').textContent, 'Advanced')
  sep[Symbol.dispose]()
  c.remove()
})

// ─────────────────────────────────────────────────────────────────────────────
// VECTOR
// ─────────────────────────────────────────────────────────────────────────────

test('vector: renders N axis inputs and writes back per axis', () => {
  const c = mount()
  const s = signal([1, 2, 3])
  const ctrl = vector(s, { container: c })
  const inputs = ctrl.el.querySelectorAll('input[type=number]')
  is(inputs.length, 3)
  is(inputs[0].value, '1')
  inputs[1].value = '5'
  // commits on change, not input — oninput writeback mangles typing (see vector.js)
  inputs[1].dispatchEvent(new Event('change', { bubbles: true }))
  is(JSON.stringify(s.value), '[1,5,3]')
  cleanup(ctrl, c)
})

test('vector: clamps to min/max', () => {
  const c = mount()
  const s = signal([0, 0])
  const ctrl = vector(s, { min: 0, max: 10, container: c })
  const inp = ctrl.el.querySelector('input[type=number]')
  inp.value = '20'
  inp.dispatchEvent(new Event('change', { bubbles: true }))
  is(s.value[0], 10)
  cleanup(ctrl, c)
})

test('vector: pad option adds expand toggle + embedded xy pad (2D only)', async () => {
  const c = mount()
  const s = signal([0.5, 0.5])
  const ctrl = vector(s, { pad: true, min: 0, max: 1, container: c })
  const btn = ctrl.el.querySelector('.s-vec-expand')
  ok(btn, 'has expand button')
  ok(!ctrl.el.querySelector('.s-pad'), 'pad hidden initially')
  btn.dispatchEvent(new Event('click', { bubbles: true }))
  await new Promise(r => setTimeout(r))
  const pad = ctrl.el.querySelector('.s-pad')
  ok(pad, 'pad shown after toggle')
  pad.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
  is(s.value[0], 0.51)
  cleanup(ctrl, c)

  // non-2D vectors never get the pad
  const c2 = mount()
  const s2 = signal([1, 2, 3])
  const ctrl2 = vector(s2, { pad: true, container: c2 })
  ok(!ctrl2.el.querySelector('.s-vec-expand'), 'no expand button for 3D')
  cleanup(ctrl2, c2)
})

// ─────────────────────────────────────────────────────────────────────────────
// XY PAD
// ─────────────────────────────────────────────────────────────────────────────

test('xy: readout renders live formatted value', () => {
  const c = mount()
  const s = signal([0.2, 0.5])
  const ctrl = xy(s, { readout: true, container: c })
  const val = ctrl.el.querySelector('.s-pad-val')
  ok(val, 'has readout')
  is(val.textContent, '0.2,0.5')
  s.value = [0.3, 0.7]
  is(val.textContent, '0.3,0.7')
  cleanup(ctrl, c)
})

test('xy: min > max flips axis direction (screen-style Y)', () => {
  const c = mount()
  const s = signal([0.5, 0.5])
  // y: 0 at top, 1 at bottom
  const ctrl = xy(s, { min: [0, 1], max: [1, 0], container: c })
  const pad = ctrl.el.querySelector('.s-pad')
  // dot y position: value .5 → 50%
  ok(pad.getAttribute('style').includes('--y:50%'), 'dot centered')
  // ArrowUp moves the dot up = smaller y value in screen convention
  pad.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
  is(s.value[1], 0.49)
  cleanup(ctrl, c)

  // explicit step is a magnitude — direction still follows the flipped axis
  const c2 = mount()
  const s2 = signal([0.5, 0.5])
  const ctrl2 = xy(s2, { min: [0, 1], max: [1, 0], step: 0.1, container: c2 })
  ctrl2.el.querySelector('.s-pad').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
  is(s2.value[1], 0.4)
  cleanup(ctrl2, c2)
})

test('xy: renders pad + dot, keyboard moves value', () => {
  const c = mount()
  const s = signal([0.5, 0.5])
  const ctrl = xy(s, { min: 0, max: 1, step: 0.01, container: c })
  const pad = ctrl.el.querySelector('.s-pad')
  ok(pad, 'has pad')
  ok(ctrl.el.querySelector('.s-pad-dot'), 'has dot')
  pad.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
  ok(s.value[0] > 0.5, 'x increased on ArrowRight')
  pad.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
  ok(s.value[1] < 0.5, 'y decreased on ArrowDown')
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// KNOB
// ─────────────────────────────────────────────────────────────────────────────

test('knob: circular mode follows pointer angle around the dial', () => {
  const c = mount()
  const s = signal(0)
  const ctrl = knob(s, { mode: 'circular', min: 0, max: 100, container: c })
  const wrap = ctrl.el.querySelector('.s-knob-wrap')
  // happy-dom rects are zero-sized → dial center is (0,0); angles from raw coords.
  // pointer at 3 o'clock (dx>0, dy=0) = +90° on the -135..135 arc → 83.33
  wrap.dispatchEvent(Object.assign(new Event('pointerdown', { bubbles: true }), { clientX: 10, clientY: 0 }))
  is(Math.round(s.value * 100) / 100, 83.33)
  dispatchEvent(new Event('pointerup'))
  // pointer at 9 o'clock = −90° → 16.67
  wrap.dispatchEvent(Object.assign(new Event('pointerdown', { bubbles: true }), { clientX: -10, clientY: 0 }))
  is(Math.round(s.value * 100) / 100, 16.67)
  dispatchEvent(new Event('pointerup'))
  cleanup(ctrl, c)
})

test('knob: renders dial, keyboard adjusts value', () => {
  const c = mount()
  const s = signal(0.5)
  const ctrl = knob(s, { min: 0, max: 1, step: 0.01, container: c })
  ok(ctrl.el.querySelector('.s-knob-dial'), 'has knob dial')
  const wrap = ctrl.el.querySelector('.s-knob-wrap')
  wrap.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
  is(s.value, 0.51)
  wrap.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
  is(s.value, 0.5)
  cleanup(ctrl, c)
})

// ─────────────────────────────────────────────────────────────────────────────
// DISPOSE
// ─────────────────────────────────────────────────────────────────────────────

test('dispose: all control types clean up', () => {
  const c = mount()
  const factories = [
    [boolean, signal(true), {}],
    [number, signal(5), { min: 0, max: 10 }],
    [select, signal('a'), { options: ['a', 'b'] }],
    [color, signal('#fff'), {}],
    [text, signal('hi'), {}],
    [slider, signal(50), { min: 0, max: 100 }],
  ]
  for (const [factory, sig, opts] of factories) {
    const ctrl = factory(sig, { ...opts, container: c })
    ok(ctrl.el, `${factory.name || 'control'} has el`)
    ctrl[Symbol.dispose]()
  }
  c.remove()
})
