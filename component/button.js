'use strict'

const h = require('virtual-dom/h')

module.exports = ({value, label, change}) => {
	return (<button className='sp-button' onClick={fire}>{ label }</button>)

	function fire (e) {
		e.preventDefault()

		if (arguments.length) {
			if (change) change(value, field)
			if (cb) cb(value, field)
		}

		return field.value
	}
}
