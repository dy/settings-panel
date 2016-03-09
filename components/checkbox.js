var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var css = require('dom-css')

module.exports = Checkbox
inherits(Checkbox, EventEmitter)

function Checkbox (root, opts, theme) {
  if (!(this instanceof Checkbox)) return new Checkbox(root, opts, theme)
  opts = opts || {}
  var self = this

  var container = require('./container')(root, opts.label)
  require('./label')(container, opts.label, theme)
  
  var input = container.appendChild(document.createElement('input'))
  input.id = 'checkbox-' + opts.label
  input.type = 'checkbox'
  input.checked = opts.initial
  input.className = 'control-panel-checkbox'

  var label = container.appendChild(document.createElement('label'))
  label.htmlFor = 'checkbox-' + opts.label
  label.className = 'control-panel-checkbox'

  input.oninput = function (data) {
    self.emit('input', data.target.value)
  }
}