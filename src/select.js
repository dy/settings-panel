var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var format = require('param-case')

module.exports = Select
inherits(Select, EventEmitter)

function Select (opts) {
	if (!(this instanceof Select)) return new Select(opts)
	var i, container, input, downTriangle, upTriangle, key, option, el, keys

	input = document.createElement('select')
	input.id = opts.id
	input.className = 'settings-panel-select'

	downTriangle = document.createElement('span')
	downTriangle.className = 'settings-panel-select-triangle settings-panel-select-triangle--down'

	upTriangle = document.createElement('span')
	upTriangle.className = 'settings-panel-select-triangle settings-panel-select-triangle--up'

	if (Array.isArray(opts.options)) {
		for (i = 0; i < opts.options.length; i++) {
			option = opts.options[i]
			el = document.createElement('option')
			el.value = el.textContent = option
			if (opts.value === option) {
				el.selected = 'selected'
			}
			input.appendChild(el)
		}
	} else {
		keys = Object.keys(opts.options)
		for (i = 0; i < keys.length; i++) {
			key = keys[i]
			el = document.createElement('option')
			el.value = key
			if (opts.value === key) {
				el.selected = 'selected'
			}
			el.textContent = opts.options[key]
			input.appendChild(el)
		}
	}

	opts.container.appendChild(input)
	opts.container.appendChild(downTriangle)
	opts.container.appendChild(upTriangle)

	setTimeout(() => {
		this.emit('init', opts.value)
	})

	input.onchange = (data) => {
		this.emit('input', data.target.value)
	}
}
