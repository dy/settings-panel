'use strict'

const h = require('virtual-dom/h')

// field constructors
module.exports = Panel

// panel vdom component
function Panel({id, position, title}, fields) {
	return (
	<form className={`sp sp-${id} sp--${position}`} key={id}>
		{ title ? (<h2 className={`sp-title`}>{ title }</h2>) : null }
		{ fields }
	</form>
	)
}

// exports
Panel.components = {
	text: require('./text'),
	textarea: require('./textarea'),
	button: require('./button')
	// submit: require('./button'),
	// range: require('./range')
	// interval:
	// checkbox:
	// color:
	// select:
	// switch:
	// textarea:
	// text:
	// number:
	// canvas:
	// angle:
	// toggle:
	// gradient:
	// palette:
	// taglist:
	// file:
	// date:
	// time:
	// pad:
	// vec2:,
	// vec3:,
	// vec4:
	// volume:
	// log:
	// unit:
	// font:
	// ratio:
}
