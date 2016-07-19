/**
 * @module settings-panel
 */

const Emitter = require('events').EventEmitter;
const inherits = require('inherits');
const extend = require('just-extend');
const css = require('dom-css');
const uid = require('get-uid');
const fs = require('fs');
const insertCSS = require('insert-css');
const isPlainObject = require('is-plain-obj');
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
	if (this.className) this.element.className += ' ' + this.className;

	//create title
	if (this.title) {
		this.titleEl = this.element.appendChild(document.createElement('h2'));
		this.titleEl.className = 'settings-panel-title';
	}

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
	if (!item) item = this.items[name] = { label: name };

	var initialValue = item.value;

	if (isPlainObject(value)) {
		item = extend(item, value);
	}
	else {
		//ignore nothing-changed set
		if (value === item.value && value !== undefined) return this;
		item.value = value;
	}

	this.state[name] = item.value;

	//detect type
	if (!item.type) {
		if (item.value && Array.isArray(item.value)) {
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
			if (item.value && (item.value.length > 140 || /\n/.test(item.value))) {
				item.type = 'textarea'
			}
			else {
				item.type = 'text'
			}
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
		field.className = 'settings-panel-field settings-panel-field--' + item.type;
		field.id = fieldId;
		this.element.appendChild(field);
		item.field = field;
	}

	if (item.orientation) field.className += ' settings-panel-orientation-' + item.orientation;

	if (item.style) {
		if (isPlainObject(item.style)) {
			css(field, item.style);
		}
		else if (typeof item.style === 'string') {
			field.style = item.style;
		}
	}

	if (item.hidden) {
		field.setAttribute('hidden', true);
	}
	else {
		field.removeAttribute('hidden');
	}

	field.innerHTML = '';

	//createe container for the input
	let inputContainer = document.createElement('div');
	inputContainer.className = 'settings-panel-input';
	item.container = inputContainer;

	if (item.help) field.setAttribute('data-help', item.help);

	field.appendChild(inputContainer);

	let components = this.components;
	let component = (components[item.type] || components.text)(item)

	//create field label
	if (component.label !== false && (item.label || item.label === '')) {
		var label = document.createElement('label')
		label.className = 'settings-panel-label';
		label.htmlFor = item.id;
		label.innerHTML = item.label;

		field.insertBefore(label, inputContainer);
	}


	if (component.on) {
		component.on('init', (data) => {
			item.value = this.state[item.label] = data
			item.init && item.init(data, this.state)
			this.emit('init', item.label, data, this.state)
			item.change && item.change(data, this.state)
			this.emit('change', item.label, data, this.state)
		});

		component.on('input', (data) => {
			item.value = this.state[item.label] = data
			item.input && item.input(data, this.state)
			this.emit('input', item.label, data, this.state)
			item.change && item.change(data, this.state)
			this.emit('change', item.label, data, this.state)
		});

		component.on('change', (data) => {
			item.value = this.state[item.label] = data
			item.change && item.change(data, this.state)
			this.emit('change', item.label, data, this.state)
		});
	}

	//emit change
	if (initialValue !== item.value) {
		this.emit('change', item.label, item.value, this.state)
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
Panel.prototype.update = function (opts) {
	extend(this, opts);

	//update title, if any
	this.titleEl.innerHTML = this.title;

	//update orientation
	this.element.classList.remove('settings-panel-orientation-top');
	this.element.classList.remove('settings-panel-orientation-bottom');
	this.element.classList.remove('settings-panel-orientation-left');
	this.element.classList.remove('settings-panel-orientation-right');
	this.element.classList.add('settings-panel-orientation-' + this.orientation);

	//create dynamic style
	if (!this.style) {
		this.style = document.createElement('style');
		this.style.className = 'settings-panel-style';
		this.style.type = 'text/css';
		this.style.id = 'settings-panel-' + this.id + '-style';
		let container = document.head || this.container;
		container.appendChild(this.style);
	}

	//apply style
	if (this.css) {
		if (this.css instanceof Function) {
			this.style.innerHTML = this.css().trim();
		}
		else if (typeof this.css === 'string') {
			this.style.innerHTML = this.css.trim();
		}
	}

	return this;
}

//instance css
Panel.prototype.css = ``;

/**
 * Registered components
 */
Panel.prototype.components = {
	range: require('./src/range'),
	button: require('./src/button'),
	text: require('./src/text'),
	textarea: require('./src/textarea'),
	checkbox: require('./src/checkbox'),
	toggle: require('./src/checkbox'),
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
 * Additional visual setup
 */
Panel.prototype.orientation = 'left';