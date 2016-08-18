/**
 * @module  settings-panel/src/custom
 *
 * A custom html component
 */

'use strict';

const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const extend = require('just-extend')

module.exports = Custom
inherits(Custom, EventEmitter)

function Custom (opts) {
	if (!(this instanceof Custom)) return new Custom(opts);

	//FIXME: these guys force unnecessary events, esp if element returns wrong value
	// opts.container.addEventListener('input', (e) => {
	// 	this.emit('input', e.target.value);
	// });
	// opts.container.addEventListener('change', (e) => {
	// 	this.emit('change', e.target.value);
	// });

	this.update(opts);
}

Custom.prototype.update = function (opts) {
	extend(this, opts);
	var el = this.content;
	if (this.content instanceof Function) {
		el = this.content(this);
		if (!el) return;

		if (typeof el === 'string') {
			this.container.innerHTML = el;
		}
		else if (!this.container.contains(el)) {
			this.container.appendChild(el);
		}
	}
	else if (typeof this.content === 'string') {
		this.container.innerHTML = el;
	}
	else if (this.content instanceof Element && (!this.container.contains(el))) {
		this.container.appendChild(el);
	}
	else {
		//empty content is allowable, in case if user wants to show only label for example
		// throw Error('`content` should be a function returning html element or string');
	}
};