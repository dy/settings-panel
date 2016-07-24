/**
 * @module  settings-panel/src/custom
 *
 * A custom html component
 */

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
	var el;
	if (this.create instanceof Function) {
		el = this.create(this);
		if (!el) return;

		if (typeof el === 'string') {
			this.container.innerHTML = el;
		}
		else if (!this.container.contains(el)) {
			this.container.appendChild(el);
		}
	}
	else if (typeof this.create === 'string') {
		this.container.innerHTML = el;
	}
	else if (this.create instanceof Element && (!this.container.contains(el))) {
		this.container.appendChild(el);
	}
	else {
		throw Error('`create` should be a function returning html element or string');
	}
};