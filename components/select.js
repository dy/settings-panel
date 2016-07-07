var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

module.exports = Select
inherits(Select, EventEmitter)

function Select (root, opts, theme, uuid) {
  if (!(this instanceof Select)) return new Select(root, opts, theme, uuid)
  var self = this
  var i, container, input, downTriangle, upTriangle, key, option, el, keys

  container = require('./container')(root, opts.label)
  require('./label')(container, opts.label, theme)

  input = document.createElement('select')
  input.className = 'control-panel-select-' + uuid + '-dropdown'

  downTriangle = document.createElement('span')
  downTriangle.className = 'control-panel-select-' + uuid + '-triangle control-panel-select-' + uuid + '-triangle--down'

  upTriangle = document.createElement('span')
  upTriangle.className = 'control-panel-select-' + uuid + '-triangle control-panel-select-' + uuid + '-triangle--up'

  container.appendChild(downTriangle)
  container.appendChild(upTriangle)

  if (Array.isArray(opts.options)) {
    for (i = 0; i < opts.options.length; i++) {
      option = opts.options[i]
      el = document.createElement('option')
      el.value = el.textContent = option
      if (opts.initial === option) {
        el.selected = 'selected'
      }
      input.appendChild(el)
    }
  } else {
    keys = Object.keys(opts.options)
    for (i = 0; i < keys.length; i++) {
      key = keys[i]
      el = document.createElement('option')
      el.value = key
      if (opts.initial === key) {
        el.selected = 'selected'
      }
      el.textContent = opts.options[key]
      input.appendChild(el)
    }
  }

  container.appendChild(input)

  input.onchange = function (data) {
    opts.input && opts.input(data.target.value)
    self.emit('input', data.target.value)
  }
}
