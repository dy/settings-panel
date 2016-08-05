const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const format = require('param-case')
const extend = require('just-extend');

module.exports = Checkbox
inherits(Checkbox, EventEmitter)

function Checkbox (opts) {
	if (!(this instanceof Checkbox)) return new Checkbox(opts)

	var self = this;

	if (!this.group) {
		this.group = document.createElement('fieldset');
		this.group.className = 'settings-panel-checkbox-group';
		opts.container.appendChild(this.group);
	}

	//single checkbox
	if (!opts.options) {
		let input = this.group.querySelector('.settings-panel-checkbox');
		let label = this.group.querySelector('.settings-panel-checkbox-label');
		if (!input) {
			this.element = input = this.group.appendChild(document.createElement('input'));
			input.className = 'settings-panel-checkbox';
			this.labelEl = label = this.group.appendChild(document.createElement('label'));
			this.labelEl.innerHTML = '';
			label.className = 'settings-panel-checkbox-label';
			input.onchange = function (data) {
				self.emit('input', data.target.checked)
			}
			setTimeout(function () {
				self.emit('init', input.checked)
			})
		}
	}
	//multiple checkboxes
	else {
		var html = '';

		if (Array.isArray(opts.options)) {
			for (i = 0; i < opts.options.length; i++) {
				let option = opts.options[i]
				html += createOption(option, option);
			}
		} else {
			for (let key in opts.options) {
				html += createOption(opts.options[key], key);
			}
		}

		this.group.innerHTML = html;

		this.group.addEventListener('change', () => {
			let v = [];
			[].slice.call(this.group.querySelectorAll('.settings-panel-checkbox')).forEach(el => {
				if (el.checked) v.push(el.getAttribute('data-value'));
			});

			this.emit('input', v);
		});
		setTimeout(() => {
			this.emit('init')
		});
	}

	function createOption (label, value) {
		let htmlFor = `settings-panel-${format(opts.panel.id)}-${format(opts.id)}-input-${format(value)}`;

		let html = `<input type="checkbox" class="settings-panel-checkbox" ${value === opts.value ? 'checked' : ''} id="${htmlFor}" name="${format(opts.id)}" data-value="${value}" title="${value}"/><label for="${htmlFor}" class="settings-panel-checkbox-label" title="${value}">${label}</label>`;
		return html;
	}

	this.update(opts);
}

Checkbox.prototype.update = function (opts) {
	extend(this, opts);

	if (!this.options) {
		this.labelEl.htmlFor = this.id
		this.element.id = this.id
		this.element.type = 'checkbox';
		this.element.checked = !!this.value;
	}
	else {
		if (!Array.isArray(this.value)) this.value = [this.value];
		let els = [].slice.call(this.group.querySelectorAll('.settings-panel-checkbox'));
		els.forEach(el => {
			if (this.value.indexOf(el.getAttribute('data-value')) >= 0) {
				el.checked = true;
			}
			else {
				el.checked = false;
			}
		});
	}

	this.group.disabled = !!this.disabled;

	return this;
}
