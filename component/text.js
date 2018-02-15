'use strict';

const num = require('input-number')
const defined = require('defined')
const h = require('virtual-dom/h')


module.exports = ({id, label, change, width, placeholder, type, disabled, value}) => {
	function InputNumber () {}
	InputNumber.prototype.hook = function(input, key, value) {
		num(input)
	}

	return (
		<div key={id} className={`sp-field sp-field--${type}`} id={`sp-field-${id}`} style={width ? `display: inline-block; width: ${width}` : null}>
			<label className='sp-field-label' for={ id }>{ label }</label>
			<input className='sp-text' id={id} name={ id } type={type} placeholder={placeholder} disabled={!!disabled} onInput={ update } value={value} data-input-number={ new InputNumber() } />
		</div>
	)

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
