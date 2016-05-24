var test = require('tape')
var control = require('./index')

function assertSelector (t, selector) {
  var el = document.querySelector(selector)
  t.notEqual(el, null, 'element ' + selector + ' is present')
}
function assertId (t, id) {
  var el = document.getElementById(id)
  t.notEqual(el, null, 'element #' + id + ' is present')
}

test('construction', function (t) {
  control([{type: 'range', label: 'range label', min: 0, max: 100, initial: 20}])
  assertId(t, 'control-panel-range-label')
  assertSelector(t, '[class^=control-panel-range-]')
  t.end()
})

test('range', function (t) {
  control([{type: 'range', label: 'range label', min: 0, max: 100, initial: 20}])
  assertId(t, 'control-panel-range-label')
  assertSelector(t, '[class^=control-panel-range-]')
  t.end()
})

test('color', function (t) {
  control([{type: 'color', label: 'color label', min: 0, max: 100, initial: 20}])
  assertId(t, 'control-panel-color-label')
  assertSelector(t, '.control-panel-color')
  t.end()
})

test('text', function (t) {
  control([{type: 'text', label: 'text label', min: 0, max: 100, initial: 20}])
  assertId(t, 'control-panel-text-label')
  assertSelector(t, '.control-panel-text')
  t.end()
})

test('checkbox', function (t) {
  control([{type: 'checkbox', label: 'checkbox label', initial: false}])
  assertId(t, 'control-panel-checkbox-label')
  assertSelector(t, '[class^=control-panel-checkbox-]')
  t.end()
  window.close()
})

test('interval', function (t) {
  control([{type: 'interval', label: 'interval label', min: 0, max: 100, initial: [20, 40]}])
  assertId(t, 'control-panel-interval-label')
  assertSelector(t, '[class^=control-panel-interval-]')
  t.end()
  window.close()
})

test('button', function (t) {
  control([{type: 'button', label: 'button label', action: function () { }}])
  assertId(t, 'control-panel-button-label')
  assertSelector(t, '.control-panel-button')
  t.end()
  window.close()
})
