/**
 * @module settings-panel
 */

const Emitter = require('events').EventEmitter;
const inherits = require('inherits');
const extend = require('xtend/mutable');
const css = require('dom-css');
const themes = require('./themes');
const uid = require('get-uid');
const fs = require('fs');
const insertCSS = require('insert-css');
const isPlainObject = require('mutype/is-object');
const format = require('param-case');
const px = require('add-px-to-style');

module.exports = Panel


insertCSS(fs.readFileSync(__dirname + '/index.css', 'utf-8'));


/**
 * @constructor
 */
function Panel (items, opts) {
	if (!(this instanceof Panel)) return new Panel(items, opts)

	extend(this, opts);

	//ensure container
	if (this.container === undefined) this.container = document.body || document.documentElement;

	this.container.classList.add('settings-panel-container');

	//create element
	this.id = uid()
	this.element = document.createElement('form')
	this.element.className = 'settings-panel';
	this.element.id = 'settings-panel-' + this.id;
	if (this.className) this.element.classList.add(this.className);

	//state is values of items
	this.state = {};

	//items is all items settings
	this.items = {};

	//create fields
	this.set(items);

	if (this.container) {
		this.container.appendChild(this.element)
	}

	//create theme style
	this.update();
}

inherits(Panel, Emitter);


/**
 * Set item value/options
 */
Panel.prototype.set = function (name, value) {
	//set multiple
	if (Array.isArray(name)) {
		let items = name;
		items.forEach((item) => {
			this.set(item.label, item);
		});

		return this;
	}

	if (name && arguments.length === 1) {
		let items = name;
		for (let key in items) {
			let item = items[key];
			this.set(key, item)
		}

		return this;
	}

	var item = this.items[name];
	if (!item) item = this.items[name] = { label: name, panel: this};

	if (isPlainObject(value)) {
		item = extend(item, value);
	}
	else {
		item.value = value;
	}

	this.state[name] = item.value;

	//detect type
	if (!item.type) {
		if (item.value && item.value.length) {
			item.type = 'interval'
		} else if (item.scale || item.max || item.steps || item.step || typeof item.value === 'number') {
			item.type = 'range'
		} else if (item.options) {
			if (Array.isArray(item.options) && item.options.join('').length < 90 ) {
				item.type = 'switch'
			}
			else {
				item.type = 'select'
			}
		} else if (item.format) {
			item.type = 'color'
		} else if (typeof item.value === 'boolean') {
			item.type = 'checkbox'
		} else {
			item.type = 'text'
		}
	}

	var fieldId;
	if (item.label) {
		let label = item.label.replace(/\-/g,'dash-');
		fieldId = 'settings-panel-field-' + format(label);
		item.id = 'settings-panel-field-input-' + format(label);
	}

	//create field container
	var field = this.element.querySelector('#' + fieldId);

	if (!field) {
		field = document.createElement('div');
		field.className = 'settings-panel-field';
		field.id = fieldId;
		this.element.appendChild(field);
		item.field = field;
	}

	field.innerHTML = '';

	//createe container for the input
	let inputContainer = document.createElement('div');
	inputContainer.className = 'settings-panel-input';
	item.container = inputContainer;

	if (item.help) field.setAttribute('data-help', item.help);

	let components = this.components;
	let component = (components[item.type] || components.text)(item)

	//create field label
	//FIXME: there should be a better way to disable label, like preset component's view
	if (component.label !== false && (item.label || item.label === '')) {
		var label = document.createElement('label')
		label.className = 'settings-panel-label';
		label.htmlFor = item.id;
		label.innerHTML = item.label;
		field.appendChild(label);
	}

	field.appendChild(inputContainer);

	if (component.on) {
		component.on('init', (data) => {
			item.value = this.state[item.label] = data
		});

		component.on('input', (data) => {
			item.value = this.state[item.label] = data
			item.input && item.input(data, this.state)
			this.emit('input', this.state)
		});
	}

	return this;
}


/**
 * Return property value or a list
 */
Panel.prototype.get = function (name) {
	if (name == null) return this.state;
	return this.state[name];
}


/**
 * Update theme
 */
Panel.prototype.update = function (theme) {
	theme = theme || this.theme;

	if (typeof theme === 'string') {
		theme = this.themes[theme];
	}

	this.theme = theme;

	//create dynamic style
	if (!this.style) {
		this.style = document.createElement('style');
		this.style.className = 'settings-panel-style';
		this.style.type = 'text/css';
		let container = document.head || this.container;
		container.appendChild(this.style);
	}

	let sel = '#settings-panel-' + this.id;
	let style = `
		${sel} {
			background: ${theme.background};
			font-size: ${px('font-size', theme.fontSize)};
			font-family: ${theme.fontFamily};
			color: ${theme.secondary};
		}
	`;

	if (theme.labelPosition === 'top') {
		style += `
			${sel} .settings-panel-label {
				display: block;
				width: auto;
				margin-right: 0;
				padding-top: 0;
			}

			${sel} .settings-panel-input {
				width: 100%;
			}
		`;
	}
	else if (theme.labelPosition === 'right') {
		style += `
			${sel} .settings-panel-label {
				display: block;
				margin-right: 0;
				float: right;
			}

			${sel} .settings-panel-input {
			}
		`;
	}
	else if (theme.labelPosition === 'bottom') {
		style += `
			${sel} .settings-panel-label {
				display: block;
				width: auto;
				margin-right: 0;
				padding-top: 0;
				border-top: 2em solid transparent;
			}

			${sel} .settings-panel-input {
				width: 100%;
				position: absolute;
				top: 0;
			}
		`;
	}
	else {

	}

	this.style.innerHTML = style;

	return this;
}


/**
 * Registered components
 */
Panel.prototype.components = {
	title: require('./src/title'),
	range: require('./src/range'),
	button: require('./src/button'),
	text: require('./src/text'),
	textarea: require('./src/textarea'),
	checkbox: require('./src/checkbox'),
	switch: require('./src/switch'),
	color: require('./src/color'),
	interval: require('./src/interval'),
	select: require('./src/select')
};


/**
 * Additional class name
 */
Panel.prototype.className;


/**
 * Registered themes
 */
Panel.prototype.theme = 'dark';
Panel.prototype.themes = require('./themes');