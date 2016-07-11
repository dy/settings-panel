var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var css = require('dom-css')

module.exports = Text
inherits(Text, EventEmitter)

function Text (opts) {
	if (!(this instanceof Text)) return new Text(opts)

	var input = opts.container.appendChild(document.createElement('input'))
	input.type = opts.type
	input.id = opts.id
	input.className = 'settings-panel-text'
	if (opts.initial) input.value = opts.initial

	setTimeout(() => {
		this.emit('initialized', input.value)
	})

	input.oninput = (data) => {
		this.emit('input', data.target.value)
	}
}
