/**
 * @module settings-panel
 */

const Emitter = require('events').EventEmitter
const inherits = require('inherits')
const extend = require('xtend/mutable')
const css = require('dom-css')
const themes = require('./themes')
const uid = require('get-uid')
const fs = require('fs')
const insertCSS = require('insert-css')
const isPlainObject = require('mutype/is-object');
const format = require('param-case')

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

	var item = this.items[name];
	if (!item) item = this.items[name] = {};

	if (isPlainObject(value)) {
		item = extend(item, value);
	}
	else {
		item.value = value;
	}

	item.panel = this;
	item.label = name;

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
		item.container = field;
		this.element.appendChild(field);
	}

	field.innerHTML = '';

	if (item.help) field.setAttribute('data-help', item.help);

	//create field label
	//FIXME: there should be a better way to disable label, like preset component's view
	if (item.type !== 'button' && item.type !== 'title' && (item.label || item.label === '')) {
		var label = field.appendChild(document.createElement('label'))
		label.className = 'settings-panel-label';
		label.htmlFor = item.id;
		label.innerHTML = item.label;
	}

	let components = this.components;
	let component = (components[item.type] || components.text)(item)

	if (component.on) {
		component.on('init', (data) => {
			this.state[item.label] = data
		});

		component.on('input', (data) => {
			this.state[item.label] = data
			item.input && item.input(data, this.state)
			this.emit('input', this.state)
		});
	}

	return this;
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

	let className = 'settings-panel';
	this.style.innerHTML = `
		.${className} {
			background: ${theme.background};
			font-size: ${theme.fontSize};
			font-family: ${theme.fontFamily};
			color: ${theme.color};
		}
	`;

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