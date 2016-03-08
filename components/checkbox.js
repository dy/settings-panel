var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

module.exports = Checkbox
inherits(Checkbox, EventEmitter)

function Checkbox (root, opts) {
  if (!(this instanceof Checkbox)) return new Checkbox(root, opts)
  var self = this

  var container = root.appendChild(document.createElement('div'))
  
  var label = container.appendChild(document.createElement('span'))
  label.innerHTML = opts.label
  
  var input = container.appendChild(document.createElement('input'))
  input.type = 'checkbox'

  input.oninput = function (data) {
    self.emit('input', data.target.value)
  }
}