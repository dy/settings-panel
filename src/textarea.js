const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const css = require('dom-css')
const autosize = require('autosize');
const extend = require('just-extend');

module.exports = Textarea
inherits(Textarea, EventEmitter)

function Textarea (opts) {
	if (!(this instanceof Textarea)) return new Textarea(opts)

	//<textarea rows="1" placeholder="${param.placeholder || 'value...'}" id="${param.name}" class="prama-input prama-textarea" title="${param.value}">${param.value}</textarea>
	let input = opts.container.querySelector('.settings-panel-textarea');
	if (!input) {
		input = opts.container.appendChild(document.createElement('textarea'));
		input.className = 'settings-panel-textarea';

		this.element = input;

		setTimeout(() => {
			this.emit('init', input.value)
			autosize.update(input);
		})

		input.oninput = (data) => {
			this.emit('input', data.target.value)
		}

		autosize(input);
	}

	this.update(opts);
}

Textarea.prototype.update = function (opts) {
	extend(this, opts);

	this.element.rows = this.rows || 1;
	this.element.placeholder = this.placeholder || '';
	this.element.id = this.id

	this.element.value = this.value || '';

	this.element.disabled = !!this.disabled;

	autosize.update(this.element);

	return this;
}