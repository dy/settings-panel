'use strict';


module.exports = function createButton (field, cb) {
	let {container, value, label, change} = field

	let element = field.container.appendChild(document.createElement('button'))

	element.className = 'sp-button'
	element.addEventListener('click', e => {
		e.preventDefault()

		fire(e)
	})
	element.innerHTML = field.label

	function fire (value) {
		if (arguments.length) {
			if (change) change(value, field)
			if (cb) cb(value, field)
		}

		return field.value
	}

	return fire
}
