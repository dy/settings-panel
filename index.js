/**
 * @module settings-panel
 */

const Emitter = require('events').EventEmitter;
const inherits = require('inherits');
const extend = require('just-extend');
const css = require('dom-css');
const uid = require('get-uid');
const fs = require('fs');
const insertCss = require('insert-styles');
const isPlainObject = require('is-plain-obj');
const format = require('param-case');
const px = require('add-px-to-style');
const scopeCss = require('scope-css');

module.exports = Panel


insertCss(fs.readFileSync(__dirname + '/index.css', 'utf-8'));


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
	this.element.className = 'settings-panel settings-panel-' + this.id;
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
			this.set(item.id || item.label, item);
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

	//format name
	name = name.replace(/\-/g,'dash-');
	name = format(name);

	var item = this.items[name];
	if (!item) item = this.items[name] = { id: name, panel: this };
	if (!item.id) item.id = name;

	var initialValue = item.default == null ? item.value : item.default;

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

	var fieldId = 'settings-panel-field-' + item.id;

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
	else if (item.style !== undefined) {
		field.style = null;
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

	//handle after and before
	if (item.before) {
		let before = item.before;
		if (before instanceof Function) {
			before = item.before.call(item, component);
		}
		if (before instanceof HTMLElement) {
			this.element.insertBefore(before, field);
		}
		else {
			field.insertAdjacentHTML('beforebegin', before);
		}
	}
	if (item.after) {
		let after = item.after;
		if (after instanceof Function) {
			after = item.after.call(item, component);
		}
		if (after instanceof HTMLElement) {
			this.element.insertBefore(after, field.nextSibling);
		}
		else {
			field.insertAdjacentHTML('afterend', after);
		}
	}

	if (component.on) {
		component.on('init', (data) => {
			item.value = this.state[item.id] = data
			let state = extend({}, this.state);

			item.init && item.init(data, state)
			this.emit('init', item.id, data, state)
			item.change && item.change(data, state)
			this.emit('change', item.id, data, state)
		});

		component.on('input', (data) => {
			item.value = this.state[item.id] = data
			let state = extend({}, this.state);

			item.input && item.input(data, state)
			this.emit('input', item.id, data, state)
			item.change && item.change(data, state)
			this.emit('change', item.id, data, state)
		});

		component.on('change', (data) => {
			item.value = this.state[item.id] = data
			let state = extend({}, this.state);

			item.change && item.change(data, state)
			this.emit('change', item.id, data, state)
		});
	}

	//emit change
	if (initialValue !== item.value) {
		this.emit('change', item.id, item.value, this.state)
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
	if (this.titleEl) this.titleEl.innerHTML = this.title;

	//update orientation
	this.element.classList.remove('settings-panel-orientation-top');
	this.element.classList.remove('settings-panel-orientation-bottom');
	this.element.classList.remove('settings-panel-orientation-left');
	this.element.classList.remove('settings-panel-orientation-right');
	this.element.classList.add('settings-panel-orientation-' + this.orientation);

	//apply style
	let cssStr = '';
	if (this.theme instanceof Function) {
		cssStr = this.theme.call(this, this);
	}
	else if (typeof this.theme === 'string') {
		cssStr = this.theme;
	}

	//scope each rule
	cssStr = scopeCss(cssStr || '', '.settings-panel-' + this.id) || '';

	insertCss(cssStr.trim(), {
		id: this.id
	});

	return this;
}

//instance theme
Panel.prototype.theme = require('./theme/none');

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
	custom: require('./src/custom'),
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