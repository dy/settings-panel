import './register.js'
import test, { is, ok } from 'tst'
import { signal } from 'sprae'
import slider from '../control/slider.js'
import boolean from '../control/boolean.js'
import number from '../control/number.js'
import select from '../control/select.js'
import color from '../control/color.js'
import text from '../control/text.js'

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
  is(val.textContent, '50px')
  cleanup(ctrl, c)
})

test('slider: custom format', () => {
  const c = mount()
  const s = signal(0.5)
  const ctrl = slider(s, { min: 0, max: 1, step: 0.01, format: v => (v * 100 | 0) + '%', container: c })
  const val = ctrl.el.querySelector('.s-readout')
  is(val.textContent, '50%')
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

test('number: inc/dec buttons', () => {
  const c = mount()
  const s = signal(5)
  const ctrl = number(s, { min: 0, max: 10, step: 1, container: c })
  const btns = ctrl.el.querySelectorAll('button')
  const dec = btns[0], inc = btns[1]
  inc.dispatchEvent(new Event('click'))
  is(s.value, 6)
  dec.dispatchEvent(new Event('click'))
  is(s.value, 5)
  cleanup(ctrl, c)
})

test('number: clamps to min/max', () => {
  const c = mount()
  const s = signal(10)
  const ctrl = number(s, { min: 0, max: 10, step: 1, container: c })
  const [, inc] = ctrl.el.querySelectorAll('button')
  inc.click()
  is(s.value, 10)  // already at max
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

test('select: buttons variant', () => {
  const c = mount()
  const s = signal('x')
  const ctrl = select(s, { variant: 'buttons', options: ['x', 'y', 'z'], container: c })
  const btns = ctrl.el.querySelectorAll('button')
  is(btns.length, 3)
  btns[1].dispatchEvent(new Event('click'))
  is(s.value, 'y')
  cleanup(ctrl, c)
})

test('select: multi-select buttons toggle', async () => {
  const c = mount()
  const s = signal([])
  const ctrl = select(s, { variant: 'buttons', multiple: true, options: ['a', 'b', 'c'], container: c })
  const btns = ctrl.el.querySelectorAll('button')
  is(btns.length, 3)
  const tick = () => new Promise(r => queueMicrotask(r))

  // Click 'a' → ['a']
  await tick()
  btns[0].dispatchEvent(new Event('click'))
  await tick()
  is(JSON.stringify(s.value), '["a"]')
  ok(btns[0].classList.contains('selected'), 'a selected after click')

  // Click 'b' → ['a', 'b']
  btns[1].dispatchEvent(new Event('click'))
  await tick()
  is(JSON.stringify(s.value), '["a","b"]')
  ok(btns[0].classList.contains('selected'), 'a still selected')
  ok(btns[1].classList.contains('selected'), 'b selected after click')

  // Click 'a' again → ['b'] (deselect)
  btns[0].dispatchEvent(new Event('click'))
  await tick()
  await tick()
  await tick()
  is(JSON.stringify(s.value), '["b"]')
  ok(!btns[0].classList.contains('selected'), 'a deselected after second click')
  ok(btns[1].classList.contains('selected'), 'b still selected')

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
