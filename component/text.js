'use strict';

const num = require('input-number')
const defined = require('defined')
const h = require('virtual-dom/h')

module.exports = (field, cb) => {
	let el = <Field>
}
	return

	let {change} = field

	let labelEl = field.labelEl = field.container.appendChild(document.createElement('label'))
	labelEl.className = `sp-field-label`
	labelEl.setAttribute('for', field.id)
	labelEl.innerHTML = field.label

	let element = field.element = field.container.appendChild(document.createElement('input'))
	element.className = 'sp-text'

	// enable input number control from keyboard
	num(element)

	// provide attributes
	if (field.placeholder != null) element.placeholder = field.placeholder
	element.type = defined(field.type, 'text')
	element.name = element.id = field.id
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
