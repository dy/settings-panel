/**
 * @module settings-panel
 */

const Emitter = require('events').EventEmitter
const inherits = require('inherits')
const extend = require('xtend')
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

	if (typeof this.theme === 'string') {
		this.theme = Panel.themes[this.theme];
	}

	//create state for values
	this.state = {};

	//create fields
	this.set(items);

	if (this.container) {
		this.container.appendChild(this.element)
	}
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

	var item;
	if (isPlainObject(value)) {
		item = value;
	}
	else {
		item = {value: value};
	}

	item.label = name;

	//create field container
	let field = document.createElement('div');
	field.className = 'settings-panel-field';
	item.container = field;

	if (item.label) {
		field.id = 'settings-panel-field-' + format(item.label);
		item.id = 'settings-panel-field-input-' + format(item.label);
	}

	if (item.help) field.setAttribute('data-help', item.help);

	//create field label
	if (item.label || item.label === '') {
		var label = field.appendChild(document.createElement('label'))
		label.className = 'settings-panel-label';
		label.htmlFor = item.id;
		label.innerHTML = item.label;
	}

	var components = Panel.components;
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

	this.element.appendChild(field);

	return this;
}

Panel.components = {
	title: require('./src/title'),
	range: require('./src/range'),
	// button: require('./src/button'),
	text: require('./src/text'),
	// checkbox: require('./src/checkbox'),
	color: require('./src/color'),
	// interval: require('./src/interval'),
	// select: require('./src/select')
};


Panel.prototype.theme = 'dark';
Panel.themes = require('./themes');