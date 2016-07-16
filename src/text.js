const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const css = require('dom-css')
const num = require('input-number');

module.exports = Text
inherits(Text, EventEmitter)

function Text (opts) {
	if (!(this instanceof Text)) return new Text(opts)

	var input = opts.container.appendChild(document.createElement('input'))
	input.type = opts.type
	input.id = opts.id
	input.className = 'settings-panel-text'
	if (opts.placeholder) input.placeholder = opts.placeholder;
	if (opts.value) input.value = opts.value

	num(input);

	setTimeout(() => {
		this.emit('init', input.value)
	})

	input.oninput = (data) => {
		this.emit('input', data.target.value)
	}
}
