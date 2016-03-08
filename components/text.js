var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

module.exports = Text
inherits(Text, EventEmitter)

function Text (root, opts) {
  if (!(this instanceof Text)) return new Text(root, opts)
  var self = this

  var container = root.appendChild(document.createElement('div'))
  
  var label = container.appendChild(document.createElement('span'))
  label.innerHTML = opts.label
  
  var input = container.appendChild(document.createElement('input'))
  input.type = 'text'

  input.oninput = function (data) {
    self.emit('input', data.target.value)
  }
}