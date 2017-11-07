'use strict';

const num = require('input-number');
const defined = require('defined')

module.exports = function createText (field, cb) {
	let {change} = field

	let element = field.element = field.container.appendChild(document.createElement('input'))
	element.className = 'sp-text'

	// enable input number control from keyboard
	num(element)

	// provide attributes
	element.placeholder = defined(field.placeholder, null)
	element.type = defined(field.type, 'text')
	element.id = defined(field.id, 'text-' + field.order)
	if (field.disabled != null) element.disabled = field.disabled

	element.oninput = (e) => {
		update(e.target.value)
	}

	update(field.value)

	return update

	function update (value) {
		if (arguments.length) {
			//TODO: validate here?
			field.value = value
			element.value = defined(field.value, '')
			if (change) change(field.value, field)
			if (cb) cb(field.value, field)
		}

		return field.value
	}
}
