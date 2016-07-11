var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var css = require('dom-css')

module.exports = Button
inherits(Button, EventEmitter)

function Button (opts) {
	if (!(this instanceof Button)) return new Button(opts)

	var input = opts.container.appendChild(document.createElement('button'))
	input.className = 'settings-panel-button';

	input.innerHTML = opts.value || opts.label

	input.addEventListener('click', (e) => {
		e.preventDefault();
		this.emit('input');
	})
}
