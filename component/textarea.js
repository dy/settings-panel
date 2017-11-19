'use strict';

const autosize = require('autosize');
const defined = require('defined')

module.exports = createTextarea

//<textarea rows="1" placeholder="${param.placeholder || 'value...'}" id="${param.name}" class="prama-input prama-textarea" title="${param.value}">${param.value}</textarea>
function createTextarea (field, cb) {
	let {change} = field

	let labelEl = field.labelEl = field.container.appendChild(document.createElement('label'))
	labelEl.className = `sp-field-label`
	labelEl.setAttribute('for', field.id)
	labelEl.innerHTML = field.label

	let element = field.container.appendChild(document.createElement('textarea'))

	// attributes
	element.className = 'sp-textarea'
	element.rows = defined(field.rows, 1)
	element.placeholder = defined(field.placeholder, '')
	element.id = element.name = field.id
	if (field.disabled != null) element.disabled = field.disabled

	autosize(element)

	element.oninput = (e) => {
		update(e.target.value)
	}

	update(field.value)

	return update

	function update (value) {
		if (arguments.length) {
			field.value = value
			//TODO: validate here?
			element.value = defined(value, '')
			autosize.update(element)

			if (change) change(field.value, field)
			if (cb) cb(field.value, field)
		}

		return field.value
	}
}
