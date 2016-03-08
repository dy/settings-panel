var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var isnumeric = require('is-numeric')

module.exports = Range
inherits(Range, EventEmitter)

function Range (root, opts) {
  if (!(this instanceof Range)) return new Range(root, opts)
  var self = this

  var container = root.appendChild(document.createElement('div'))
  
  var label = container.appendChild(document.createElement('span'))
  label.innerHTML = opts.label
  
  var input = container.appendChild(document.createElement('input'))
  input.type = 'range'

  opts.max = (isnumeric(opts.max)) ? opts.max : 100
  opts.min = (isnumeric(opts.min)) ? opts.min : 100
  opts.step = (isnumeric(opts.step)) ? opts.step : (opts.max - opts.min) / 100
  input.min = opts.min
  input.max = opts.max
  input.step = opts.step

  var value = container.appendChild(document.createElement('span'))
  value.innerHTML = input.value

  input.oninput = function (data) {
    value.innerHTML = data.target.value
    self.emit('input', data.target.value)
  }
}