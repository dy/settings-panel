import './register.js'
import test, { is, ok } from 'tst'
import { readdirSync } from 'node:fs'

// Every theme is a pure function: axes in, one scoped stylesheet out. A theme
// module that fails to import (a stray backtick inside its CSS template) or
// returns a sheet without the panel root only surfaces in the browser otherwise.
const names = readdirSync(new URL('../theme/', import.meta.url))
  .filter(f => f.endsWith('.js') && !['base.js', 'color.js', 'mixins.js'].includes(f))
  .map(f => f.slice(0, -3))

const themes = Object.fromEntries(await Promise.all(names.map(async n => [n, (await import(`../theme/${n}.js`)).default])))

test('theme: every module exports a function returning a .s-panel sheet', () => {
  for (const [name, theme] of Object.entries(themes)) {
    is(typeof theme, 'function', `${name} exports a function`)
    const css = theme()
    is(typeof css, 'string', `${name}() returns a string`)
    // base contributes one `.s-panel {` rule; the theme's own overrides must add at least one more
    ok(css.split('.s-panel {').length > 2, `${name}() adds its own .s-panel rule on top of base`)
    ok(css.includes('--bg:'), `${name}() sets --bg`)
    ok(!/NaN|undefined/.test(css), `${name}() emits no NaN/undefined`)
  }
})

test('theme: pure — same axes give the same sheet', () => {
  for (const [name, theme] of Object.entries(themes)) {
    is(theme({ shade: '#334455' }), theme({ shade: '#334455' }), `${name} is deterministic`)
  }
})

test('theme: a dark shade changes the sheet', () => {
  for (const [name, theme] of Object.entries(themes)) {
    ok(theme({ shade: '#f5f4f2' }) !== theme({ shade: '#1a1a1a' }), `${name} reacts to shade`)
  }
})

test('theme: numeric accent (derived from shade hue) is accepted', () => {
  for (const [name, theme] of Object.entries(themes)) {
    const css = theme({ shade: '#20304a', accent: 0.6 })
    ok(css.includes('.s-panel {'), `${name} accepts accent as a number`)
    ok(!/NaN|undefined/.test(css), `${name} emits no NaN/undefined with numeric accent`)
  }
})

test('theme: extreme axes stay finite', () => {
  const zero = { spacing: 0.5, size: 0.5, roundness: 0, weight: 100, depth: 0, bevel: 0, blur: 0, tint: 0, softness: 0, contrast: 0, light: 0, offset: 0, grain: 0, leading: 1 }
  const max = { spacing: 2, size: 2, roundness: 2, weight: 900, depth: 3, bevel: 2, blur: 60, tint: 1, softness: 2, contrast: 2, light: 360, offset: 12, grain: 1, leading: 2.5 }
  for (const [name, theme] of Object.entries(themes)) {
    for (const axes of [zero, max]) {
      const css = theme(axes)
      ok(!/NaN|undefined|Infinity/.test(css), `${name} at ${axes === zero ? 'min' : 'max'} axes emits no NaN/undefined/Infinity`)
    }
  }
})

test('theme: skeu accepts a ramp function as shade', () => {
  const ramp = (L, C, H, a) => `oklch(${L} ${C} ${H}${a != null ? ` / ${a}` : ''})`
  const css = themes.skeu({ shade: ramp, grid: ['dots', 'crosses'] })
  ok(css.includes('.s-panel {'), 'skeu builds from a ramp function')
  ok(!/NaN|undefined/.test(css), 'ramp-driven sheet emits no NaN/undefined')
})
