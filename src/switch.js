const inherits = require('inherits');
const Emitter = require('events').EventEmitter;
const format = require('param-case');
const extend = require('xtend/mutable');

module.exports = Switch;

inherits(Switch, Emitter);

function Switch (opts) {
	if (!(this instanceof Switch)) return new Switch(opts);

	this.switch = document.createElement('fieldset');
	this.switch.className = 'settings-panel-switch';
	this.switch.id = opts.id;


	var html = '';

	if (Array.isArray(opts.options)) {
		for (i = 0; i < opts.options.length; i++) {
			let option = opts.options[i]
			html += createOption(option, option);
		}
	} else {
		for (let key in opts.options) {
			html += createOption(key, opts.options[key]);
		}
	}

	function createOption (label, value) {
		let html = `<label for="settings-panel-switch-input-${format(opts.label)}-${format(label)}" class="settings-panel-switch-label">
			<input type="radio" class="settings-panel-switch-input" ${value === opts.value ? 'checked' : ''} id="settings-panel-switch-input-${format(opts.label)}-${format(label)}" name="${opts.label}" data-value="${value}"/>
			${label}
		</label>`;
		return html;
	}

	this.switch.innerHTML = html;

	setTimeout(() => {
		this.emit('init', opts.value)
	})

	this.switch.onchange = (e) => {
		this.emit('input', e.target.getAttribute('data-value'));
	}

	opts.container.appendChild(this.switch);
}