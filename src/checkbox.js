const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const format = require('param-case')
const extend = require('just-extend');

module.exports = Checkbox
inherits(Checkbox, EventEmitter)

function Checkbox (opts) {
	if (!(this instanceof Checkbox)) return new Checkbox(opts)
	opts = opts || {}
	var self = this

	let input = opts.container.querySelector('.settings-panel-checkbox');
	let label = opts.container.querySelector('.settings-panel-checkbox-label');
	if (!input) {
		this.element = input = opts.container.appendChild(document.createElement('input'));
		input.className = 'settings-panel-checkbox';
		this.labelEl = label = opts.container.appendChild(document.createElement('label'))
		label.className = 'settings-panel-checkbox-label';
		input.onchange = function (data) {
			self.emit('input', data.target.checked)
		}
		setTimeout(function () {
			self.emit('init', input.checked)
		})
	}

	this.update(opts);
}

Checkbox.prototype.update = function (opts) {
	extend(this, opts);

	this.labelEl.htmlFor = this.id
	this.element.id = this.id
	this.element.type = 'checkbox';
	this.element.checked = !!this.value;
	this.element.disabled = !!this.disabled;

	return this;
}
