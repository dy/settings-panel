'use strict'

const h = require('virtual-dom/h')

module.exports = ({id, type, width, value, label, change}) => {
	return (
		<div key={id} className={`sp-field sp-field--${type}`} id={`sp-field-${id}`} style={width ? `display: inline-block; width: ${width}` : null}>
			<button className='sp-button' onClick={fire}>{ label }</button>
		</div>)

	function fire (e) {
		e.preventDefault()

		if (arguments.length) {
			if (change) change(value, field)
			if (cb) cb(value, field)
		}

		return field.value
	}
}
