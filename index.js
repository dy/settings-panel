/** @module  settings-panel */
'use strict'

const isObj = require('is-plain-obj')
const extend = require('object-assign')
const dashcase = require('decamelize')
const capcase = require('camelcase')
const pick = require('pick-by-alias')
const isColor = require('is-color')
const uid = require('get-uid')
const defined = require('defined')

// field constructors
const types = createPanel.types = {
	text: require('./component/text'),
	textarea: require('./component/textarea'),
	button: require('./component/button')
	// submit: require('./component/button'),
	// range: require('./component/range')
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

module.exports = createPanel


function createPanel(fields, options, cb) {
	if (typeof options === 'function') {
		cb = options
		options = {}
	}

	if (!options) options = {}

	// field descriptors sorted by order
	let descriptors = {}

	// field type counters (just naming purpose)
	let counts = {}

	// init flag
	let init = false

	// main settings object with property accessors and hidden methods
	let state = Object.create(Object.defineProperties({}, {
		get: {
			value: getField,
			enumerable: false,
			writable: false
		},
		set: {
			value: setField,
			enumerable: false,
			writable: false
		},
		add: {
			value: createField,
			enumerable: false,
			writable: false
		},
		delete: {
			value: deleteField,
			enumerable: false,
			writable: false
		},
		update: {
			value: update,
			enumerable: false,
			writable: false
		}
	}))


	// handle container
	let container = defined(options.container, document.body, document.documentElement)
	container.classList.add('sp-container')

	// create element
	let id = uid()
	let element = container.appendChild(document.createElement('form'))
	element.className = `sp sp-${id}`

	let titleEl = element.appendChild(document.createElement('h2'))
	titleEl.className = 'sp-title'

	update(options)

	// convert object to array
	if (isObj(fields)) {
		let arr = []
		let max = 0

		for (let id in fields) {
			let field = fields[id]

			// convert direct value to descriptor
			if (!isObj(field)) field = {value: field}

			let order = field.order
			if (order == null) {
				order = max
				max++
			}
			else if (order > max) {
				max = order + 1
			}

			if (field.id === undefined) field.id = id

			arr[order] = field
		}

		fields = arr.filter(Boolean)
	}

	createField(fields)

	init = true

	return state

	// update panel view
	function update (diff) {
		extend(options, pick(diff, {
			title: 'title',
			change: 'change onchange'
		}))

		// set layout panel options
		titleEl.innerHTML = defined(options.title, '')

		return state
	}

	// add new control
	function createField (field) {
		if (arguments.length > 1) field = [].slice.apply(arguments)

		// handle multiple fields
		if (Array.isArray(field)) {
			fields.forEach((field, i) => {
				createField(field)
			})

			return state
		}

		if (!isObj(field)) throw Error('argument should be field descriptor')

		// normalize field properties
		field = pick(field, {
			id: 'id key',
			order: 'order position',
			value: 'value option val choice default',
			type: 'type',
			label: 'label caption',
			title: 'title tooltip tip',
			hidden: 'hidden invisible',
			disabled: 'disable disabled inactive',
			min: 'min',
			max: 'max',
			step: 'step',
			multi: 'multi multiple',
			options: 'options values choices',
			placeholder: 'placeholder',
			change: 'input change onchange onclick click interact interaction act tap'
		})

		// detect type from value or other params
		if (field.type == null) field.type = detectType(field)

		// get id from label or name based on type
		if (field.id == null) {
			if (counts[field.type] == null) counts[field.type] = 0
			field.id = defined(field.label, `${field.type}-${counts[field.type]++}`)
		}

		field.id = dashcase(field.id, '-')

		if (field.label == null) {
			field.label = defined(field.title, capcase(field.id))
		}

		if (field.title == null) {
			field.title = field.label
		}

		field.container = element

		// create control corresponding to the field
		field.create = defined(types[field.type], types.text)
		field.update = field.create(field, value => {
			if (!init) return
			if (cb) cb(field.id, value, state)
			if (options.change) options.change(field.id, value, state)
		})

		descriptors[field.order] = field

		// sort fields
		let sorted = Object.values(descriptors).sort((a, b) => a.order - b.order)
		for (let i = 0; i < sorted.length; i++) {
			let nextField = sorted[i]
			if (nextField.order > field.order) {
				field.container.insertBefore(field.element, nextField.element);
				break;
			}
		}

		// create property accessors
		Object.defineProperty(state, field.id, {
			get: () => {
				return field.update()
			},
			set: v => field.update(v)
		})

		return state
	}

	// get control descriptor
	function getField (id) {

	}

	// update control options
	function setField (id, field) {
		if (!isObj(options)) return set(options, v)

		for (let key in options) {
			set(key, options[key])
		}

		throw 'Unimplemented'

		return state
	}

	// delete control
	function deleteField (key) {
		// TODO: destruct component here

		delete state.key

		throw 'Unimplemented'

		return state
	}
}


function detectType(field) {
	// options define switch or select, based on number of choices
	if (field.options) {
		// FIXME: options may include few very lengthy elements
		if (Array.isArray(field.options)) {
			if ( field.options.length < 5 ) {
				return 'switch'
			}
			else {
				return 'select'
			}
		}
		else if (isObj(field.options)) {
			return Object.keys(field.options).length < 5 ? 'switch' : 'select'
		}
	}

	// [0, 100] is likely range
	// FIXME: that can be xy-pad
	if (Array.isArray(field.value)) {
		if (field.value.length === 2 && typeof field.value[0] === 'number') {
			return 'interval'
		}
	}

	// numeric params define range/number
	if (field.max != null || field.step || typeof field.value === 'number') {
		return 'range'
	}

	// color types
	if (field.format || isColor(field.value)) {
		return 'color'
	}

	if (typeof field.value === 'boolean') {
		return 'checkbox'
	}

	// textareas ususally contain newlines or are quite lengthy
	if (field.value && (field.value.length > 140 || /\n/.test(field.value))) {
		return 'textarea'
	}

	// TODO: detect email, address, date, buffer/imagedata, colormap, list of colors, file, taglist,

	// cast by default to text
	return 'text'
}
