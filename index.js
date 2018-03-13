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
const components = require('./component')
const Emitter = require('nanobus')
const inherits = require('inherits')


module.exports = Panel


// main panel constructor
function Panel(values, options) {
	if (!(this instanceof Panel)) return new Panel(values, options)

	if (!options) options = {}

	Emitter.apply(this)

	extend(this, pick(options, {
		fields: 'fields field descriptors descriptor dict properties',
		title: 'title heading header',
		components: 'types components',
		position: 'position pos',
		container: 'holder container element',
		background: 'bg background',
		palette: 'color colors palette',
		className: 'class classname className',
		change: 'onchange change onChange',
		id: 'id'
	}))

	// list of field descriptors
	let fields = this.fields = {}

	// state with actual field values only
	this.values = {}

	// current instance id
	if (!defined(this.id)) this.id = uid()

	// field type counters (just naming purpose)
	this.counts = {}

	// init flag to avoid callbacks
	this.ready = false

	if (!defined(this.position)) this.position = 'top-left'

	// align options.fields with values
	this.resolveFields(values)


	// handle container
	if (typeof this.container === 'string') this.container = document.querySelector(this.container)
	else this.container = defined(this.container, document.body, document.documentElement)
	this.container.classList.add('sp-container')


	// render routine
	this.loop = mainLoop(this, ({ fields, id, position, title }) => {
		const fieldItems = Object.keys(fields)
			.map(id => fields[id])
			.sort((a, b) => a.order - b.order)
			.map(field => {
				let {type, id, width} = field
				let Component = components[field.type] || components.text
				return <Component {...field}/>
		})

		return (
			<form className={`sp sp-${id} sp--${position}`} key={id}>
				{ title ? (<h2 className={`sp-title`}>{ title }</h2>) : null }
				{ fieldItems }
			</form>
		)
	}, { create, diff, patch })


	this.container.appendChild(this.loop.target)

	// attach update on change
	this.on('change', () => {
		this.loop.update(this)
	})

	// add fields to panel
	this.update(this.fields)

	this.ready = true
}


inherits(Panel, Emitter)


// update controls
Panel.prototype.update = function (field) {
	let {fields, loop} = this

	if (arguments.length > 1) field = [].slice.apply(arguments)

	// handle multiple fields
	if (Array.isArray(field)) {
		field.forEach((field, i) => {
			this.update(field)
		})

		return this
	}

	if (!isObj(field)) throw Error('argument should be field descriptor')

	// normalize field properties
	field = pick(field, {
		id: 'id key name index',
		order: 'order weight',
		value: 'value option val choice default',
		type: 'type component kind',
		label: 'label caption',
		title: 'title tooltip tip',
		hidden: 'hidden invisible mute',
		disabled: 'disable disabled inactive',
		min: 'min minValue',
		max: 'max maxValue',
		step: 'step',
		multi: 'multi multiple multivalue',
		options: 'options values choices',
		placeholder: 'placeholder',
		width: 'width size',
		change: 'input change onchange onChange onclick onClick click interact interaction act tap'
	}, true)

	// detect type from value or other params
	if (field.type == null) field.type = Panel.detectType(field)

	// get id from label or name based on type
	if (field.id == null) {
		if (this.counts[field.type] == null) this.counts[field.type] = 0
		field.id = defined(field.label, `${field.type}-${this.counts[field.type]++}`)
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

	// create property accessors
	if (!(field.id in fields)) {
		fields[field.id] = field

		Object.defineProperty(this.values, field.id, {
			enumerable: true,
			get: () => field.value,
			set: v => {
				let old = field.value
				field.value = v

				if (this.ready) {
					if (field.change) field.change(value)
					this.emit('change', field.key, v, old)
				}
			}
		})
	}

	if ('value' in field) {
		this.values[field.id] = field.value
	}

	return this
}


// make sure options include fields from values
Panel.prototype.resolveFields = function (values) {
	// create fields from values, if undefined
	if (!this.fields) {
		this.fields = []
		for (let id in values) {
			this.fields.push(getValueField(id, values))
		}
	}
	// convert dict of fields to array with ordered fields
	else if (isObj(this.fields)) {
		let ids = Object.keys(this.fields)
		let arr = []
		let max = 0

		// make sure this.fields includes all values
		for (let id in values) {
			this.fields[id] = extend({}, this.fields[id], getValueField(id, values))
		}

		// form an array of fields
		for (let id in this.fields) {
			let field = this.fields[id]

			let order = field.order
			if (order == null) {
				order = max
				max++
			}
			else if (order > max) {
				max = order + 1
			}

			if (!defined(field.id)) field.id = id

			arr[order] = field
		}

		this.fields = arr.filter(Boolean)
	}

	// make sure fields in array contain all ids and cover values
	else if (Array.isArray(this.fields)) {
		let ids = {}
		this.fields.forEach((field, i) => ids[field.id] = i)

		for (let id in values) {
			let valueField = getValueField(id, values)

			// extend defined field with value
			if (defined(ids[id])) {
				extend(this.fields[ids[id]], valueField)
			}

			// put absent fields to the end of array
			else {
				this.fields.push(valueField)
			}
		}
	}

	// return field with {id, value}
	function getValueField(id, values) {
		let valueField = isObj(values[id]) ? values[id] : {id: id, value: values[id]}
		if (!valueField.id) valueField.id = id
		return valueField
	}
}


// detect type of field (helper)
Panel.detectType = function (field) {
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
