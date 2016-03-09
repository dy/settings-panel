var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var isnumeric = require('is-numeric')
var css = require('dom-css')

module.exports = Range
inherits(Range, EventEmitter)

function Range (root, opts, theme) {
  if (!(this instanceof Range)) return new Range(root, opts, theme)
  var self = this

  var container = require('./container')(root)
  var label = require('./label')(container, opts.label, theme)
  
  var input = container.appendChild(document.createElement('input'))
  input.type = 'range'
  input.className = 'slider-plate-range'
  opts.max = (isnumeric(opts.max)) ? opts.max : 100
  opts.min = (isnumeric(opts.min)) ? opts.min : 100
  opts.step = (isnumeric(opts.step)) ? opts.step : (opts.max - opts.min) / 100
  input.min = opts.min
  input.max = opts.max
  input.step = opts.step
  if (opts.initial) input.value = opts.initial

  css(input, {
    width: '45%'
  })

  var value = require('./value')(container, input.value, theme, '10%')

  input.oninput = function (data) {
    value.innerHTML = data.target.value
    self.emit('input', data.target.value)
  }
}