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
	if (!(this instanceof Custom)) return new Custom(opts)

	extend(this, opts);

	var el;
	if (this.create instanceof Function) {
		el = this.create(this);
		if (typeof el === 'string') {
			this.container.innerHTML = el;
		}
		else {
			this.container.appendChild(el);
		}
	}
	else if (typeof this.create === 'string') {
		this.container.innerHTML = el;
	}
	else if (this.create instanceof Element) {
		this.container.appendChild(el);
	}
	else {
		throw Error('`create` should be a function returning html element or string');
	}

	opts.container.addEventListener('input', (data) => {
		this.emit('input', data.target.value)
	});
	opts.container.addEventListener('change', (data) => {
		this.emit('change', data.target.value)
	});
}
