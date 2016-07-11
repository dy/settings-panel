var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var css = require('dom-css')

module.exports = Button
inherits(Button, EventEmitter)

function Button (container, opts, theme) {
  if (!(this instanceof Button)) return new Button(container, opts, theme)

  var container = require('./container')(container, opts.label, opts.help)
  require('./label')(container, '', theme)

  var input = container.appendChild(document.createElement('button'))
  input.className = 'control-panel-button';

  input.onfocus = function () {
    css(input, {outline: 'none'})
  }

  input.textContent = opts.label

  css(input, {
    position: 'absolute',
    textAlign: 'center',
    height: '2em',
    width: '64%',
    border: 'none',
    cursor: 'pointer',
    right: 0,
    fontFamily: 'inherit'
  })

  input.addEventListener('click', opts.action)
}
