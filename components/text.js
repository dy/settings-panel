var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var css = require('dom-css')
var label = require('./label')

module.exports = Text
inherits(Text, EventEmitter)

function Text (root, opts, theme) {
  if (!(this instanceof Text)) return new Text(root, opts, theme)
  var self = this

  var container = require('./container')(root)
  require('./label')(container, opts.label, theme)
  
  var input = container.appendChild(document.createElement('input'))
  input.type = 'text'
  if (opts.initial) input.value = opts.initial

  input.onfocus = function () {
    css(input, {outline: 'none'})
  }

  css(input, {
    position: 'absolute',
    paddingLeft: '6px',
    height: '20px',
    width: '55.6%',
    border: 'none',
    background: theme.background2,
    color: theme.text2
  })

  input.oninput = function (data) {
    self.emit('input', data.target.value)
  }
}