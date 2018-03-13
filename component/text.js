'use strict';

const num = require('input-number')
const defined = require('defined')
const h = require('virtual-dom/h')

module.exports = (field) => {
	let {id, label, change, width, placeholder, type, disabled, value} = field
	return (
		<div key={id} className={`sp-field sp-field--${type}`} id={`sp-field-${id}`} style={width ? `display: inline-block; width: ${width}` : null}>
			<label className='sp-field-label' for={ id }>{ label }</label>
			<input className='sp-text'
				id={id}
				name={id}
				type={type}
				placeholder={placeholder}
				disabled={!!disabled}
				oninput={update}
				value={value}
				min={field.min}
				max={field.max}
				inputNum={ Object.create({ hook: el => num(el)}) } />
		</div>
	)

	function update (e) {
		field.update(e.target.value)
	}
}
