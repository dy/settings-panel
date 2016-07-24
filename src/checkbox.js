var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var format = require('param-case')

module.exports = Checkbox
inherits(Checkbox, EventEmitter)

function Checkbox (opts) {
	if (!(this instanceof Checkbox)) return new Checkbox(opts)
	opts = opts || {}
	var self = this

	var input = opts.container.appendChild(document.createElement('input'))
	input.id = opts.id
	input.type = 'checkbox'
	input.checked = opts.value
	input.className = opts.className || 'settings-panel-checkbox'
	if (opts.disabled) input.disabled = true;

	var label = opts.container.appendChild(document.createElement('label'))
	label.htmlFor = opts.id
	label.className = (opts.className || 'settings-panel-checkbox') + '-label'

	setTimeout(function () {
		self.emit('init', input.checked)
	})

	input.onchange = function (data) {
		self.emit('input', data.target.checked)
	}
}
