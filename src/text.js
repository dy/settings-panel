'use strict';

const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const css = require('dom-css')
const num = require('input-number');
const extend = require('just-extend');

module.exports = Text
inherits(Text, EventEmitter)

function Text (opts) {
	if (!(this instanceof Text)) return new Text(opts)

	let element = opts.container.querySelector('.settings-panel-text');

	if (!element) {
		element = opts.container.appendChild(document.createElement('input'));
		element.className = 'settings-panel-text';
		num(element);

		if (opts.placeholder) element.placeholder = opts.placeholder;

		this.element = element;

		element.oninput = (data) => {
			this.emit('input', data.target.value)
		}
		setTimeout(() => {
			this.emit('init', element.value)
		});
	}

	this.update(opts);
}

Text.prototype.update = function (opts) {
	extend(this, opts);
	this.element.type = this.type
	this.element.id = this.id
	this.element.value = this.value || ''
	this.element.disabled = !!this.disabled;
	return this;
}
