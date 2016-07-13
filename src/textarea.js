var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var css = require('dom-css')
var autosize = require('autosize')

module.exports = Textarea
inherits(Textarea, EventEmitter)

function Textarea (opts) {
	if (!(this instanceof Textarea)) return new Textarea(opts)

	//<textarea rows="1" placeholder="${param.placeholder || 'value...'}" id="${param.name}" class="prama-input prama-textarea" title="${param.value}">${param.value}</textarea>
	var input = opts.container.appendChild(document.createElement('textarea'))
	input.rows = opts.rows || 1;
	input.placeholder = opts.placeholder || '';
	input.id = opts.id
	input.className = 'settings-panel-textarea'
	if (opts.value) input.value = opts.value;

	autosize(input);
	setTimeout(() => {
		autosize.update(input);
		this.emit('init', input.value)
	})

	input.oninput = (data) => {
		this.emit('input', data.target.value)
	}
}
