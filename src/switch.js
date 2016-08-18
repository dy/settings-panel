'use strict';

const inherits = require('inherits');
const Emitter = require('events').EventEmitter;
const format = require('param-case');
const extend = require('just-extend');

module.exports = Switch;

inherits(Switch, Emitter);

function Switch (opts) {
	if (!(this instanceof Switch)) return new Switch(opts);

	this.switch = opts.container.querySelector('.settings-panel-switch');

	if (!this.switch) {
		this.switch = document.createElement('fieldset');
		this.switch.className = 'settings-panel-switch';
		opts.container.appendChild(this.switch);

		var html = '';

		if (Array.isArray(opts.options)) {
			for (let i = 0; i < opts.options.length; i++) {
				let option = opts.options[i]
				html += createOption(option, option);
			}
		} else {
			for (let key in opts.options) {
				html += createOption(opts.options[key], key);
			}
		}

		this.switch.innerHTML = html;

		this.switch.onchange = (e) => {
			this.emit('input', e.target.getAttribute('data-value'));
		}

		setTimeout(() => {
			this.emit('init', opts.value)
		})
	}

	this.switch.id = opts.id;

	this.update(opts);

	function createOption (label, value) {
		let htmlFor = `settings-panel-${format(opts.panel.id)}-${format(opts.id)}-input-${format(value)}`;

		let html = `<input type="radio" class="settings-panel-switch-input" ${value === opts.value ? 'checked' : ''} id="${htmlFor}" name="${format(opts.id)}" data-value="${value}" title="${value}"/><label for="${htmlFor}" class="settings-panel-switch-label" title="${value}">${label}</label>`;
		return html;
	}
}

Switch.prototype.update = function (opts) {
	return this;
}