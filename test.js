var test = require('tape')
var input = require('./index')

test('construction', function (t) {
  var panel = input([
    {type: 'range', label: 'range slider', min: 0, max: 100, initial: 20}
  ])
  t.equal(typeof document.querySelector('.input-panel'), 'object')
  t.end()
})

test('range', function (t) {
  var panel = input([
    {type: 'range', label: 'range slider', min: 0, max: 100, initial: 20}
  ])
  t.equal(typeof document.querySelector('.input-panel-range'), 'object')
  t.end()
})

test('color', function (t) {
  var panel = input([
    {type: 'color', label: 'range slider', min: 0, max: 100, initial: 20}
  ])
  t.equal(typeof document.querySelector('.input-panel-range'), 'object')
  t.end()
})