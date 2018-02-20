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
const updateDiff = require('update-diff')
const parseFract = require('parse-fraction')
const h = require('virtual-dom/h')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
const create = require('virtual-dom/create-element')
const mainLoop = require('main-loop')
const css = require('dom-css')
const scopeCss = require('scope-css')
const insertCss = require('insert-styles')
const fs = require('fs')
insertCss(fs.readFileSync(__dirname + '/index.css', 'utf-8'))
const Panel = require('./component')


module.exports = createPanel
createPanel.components = Panel.components
createPanel.Panel = Panel


// main panel constructor
function createPanel(values, options) {
	if (!options) options = {}

	options = pick(options, {
		fields: 'fields field descriptors descriptor dict properties',
		title: 'title heading header',
		components: 'types components',
		position: 'position pos',
		container: 'holder container element',
		theme: 'theme style',
		background: 'bg background',
		palette: 'color colors palette',
		className: 'class classname className',
		change: 'onchange change onChange',
		id: 'id'
	})

	let types = extend({}, options.components, Panel.components)

	// list of field descriptors
	let fields = {}

	let id = defined(options.id, uid())

	// field type counters (just naming purpose)
	let counts = {}

	// init flag to avoid callbacks
	let ready = false

	// main settings object with property accessors and hidden proto methods
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
			value: addField,
			enumerable: false,
			writable: false
		},
		delete: {
			value: deleteField,
			enumerable: false,
			writable: false
		}
	}))

	if (!options.position) options.position = 'top-left'

	// create fields
	initFields(values, options)

	addField(options.fields)
	ready = true


	// handle container
	let container
	if (typeof options.container === 'string') container = document.querySelector(container)
	else container = defined(options.container, document.body, document.documentElement)
	container.classList.add('sp-container')



	// render routine
	let loop = mainLoop({options, fields}, ({options, fields}) => {
		const fieldItems = Object.keys(fields)
			.map(id => fields[id])
			.sort((a, b) => a.order - b.order)
			.map(field => {
				let {type, id, width} = field
				let Component = types[field.type] || types.text
				return <Component {...field}/>
		})

		return Panel(options, fieldItems)
	}, { create, diff, patch })

	container.appendChild(loop.target)


	// add new control
	function addField (field) {
		if (arguments.length > 1) field = [].slice.apply(arguments)

		// handle multiple fields
		if (Array.isArray(field)) {
			field.forEach((field, i) => {
				addField(field)
			})

			return state
		}

		if (!isObj(field)) throw Error('argument should be field descriptor')

		// normalize field properties
		field = pick(field, {
			id: 'id key name',
			order: 'order position',
			value: 'value option val choice default',
			type: 'type component',
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
			width: 'width',
			change: 'input change onchange onclick click interact interaction act tap'
		}, true)

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

		if (field.width != null) {
			if (typeof field.width === 'number') field.width = field.width + 'px'
			else if (typeof field.width === 'string') {
				if (field.width !== 'auto') {
					let [num, denom] = parseFract(field.width)
					field.width = num / denom * 100 + '%'
				}
			}
		}

		// bind generic change listener
		let srcChange = field.change
		field.change = function (value) {
			state[field.id] = value
			if (srcChange) srcChange(value)
			if (ready && options.change) options.change(state)
		}

		// save field
		fields[field.id] = field

		// create property accessors
		Object.defineProperty(state, field.id, {
			get: () => field.value,
			set: v => {
				field.value = v
				loop.update({ options, fields })
			}
		})

		return state
	}

	// get control descriptor
	function getField (id) {

	}

	// update control descriptor
	function setField (id, field) {
		if (!isObj(field)) return set(field, v)

		for (let key in field) {
			set(key, field[key])
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

	return state
}

// initFields fields from options
function initFields (values, options) {
	if (!options.fields) {
		options.fields = []
		for (let id in values) {
			options.fields.push(getValueField(id))
		}
	}
	else if (isObj(options.fields)) {
		let ids = Object.keys(options.fields)
		let arr = []
		let max = 0

		for (let id in values) {
			let valueField = getValueField(id)

			if (options.fields[id] != null) {
				let field = options.fields[id]
				options.fields[id] = extend(field, valueField)
			}
			else {
				options.fields[valueField.id] = valueField
			}
		}

		for (let id in options.fields) {
			let field = options.fields[id]

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

		options.fields = arr.filter(Boolean)
	}
	else if (Array.isArray(options.fields)) {
		let ids = {}
		options.fields.forEach((field, i) => ids[field.id] = i)

		for (let id in values) {
			if (ids[id] !== null) {
				let field = options.fields[ids[id]]
				options.fields[ids[id]] = extend(getValueField(id), field)
			}
			else {
				options.fields.push(getValueField(id))
			}
		}
	}
	function getValueField(id) {
		let valueField = isObj(values[id]) ? values[id] : {id: id, value: values[id]}
		if (!valueField.id) valueField.id = id
		return valueField
	}
}

// detect type of field (helper)
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
