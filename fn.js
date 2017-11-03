/** @module  settings-panel */
'use strict'

const isObj = require('is-plain-obj')
const extend = require('object-assign')
const dashcase = require('decamelize')
const pick = require('pick-by-alias')

module.exports = function createPanel(fields, options) {
	// full properties object
	let props = {}

	// main settings object with property accessors
	let state = Object.create({
		set,
		get,
		update,
		delete,
		create,
	}, createProps(fields))

	return state

	// write property value
	function set (key, value) {
		if (isObj(key)) return update(key)

		state[key] = value

		return value
	}

	// read property value
	function get (key) {
		return state[key]
	}

	// update component options
	function update (options, v) {
		if (!isObj(options)) return set(options, v)

		for (let key in options) {
			set(key, options[key])
		}

		return state
	}

	// add new component
	function create (options) {

	}

	// delete component
	function delete (key) {
		// TODO: destruct component here

		delete state.key
	}

	// create properties descriptor
	function createProps(fields) {
		// convert object to array
		if (isObj(fields)) {
			let arr = []
			let max = 0

			for (let id in fields) {
				let field = fields[id]

				let order = field.order
				if (order == null) {
					order = max
					max++
				}
				else if (order > max) {
					max = order + 1
				}

				arr[order] = field
			}

			fields = arr.filter(Boolean)
		}

		fields = fields.map((field, i) => {
			field = pick(field, {
				id: 'id key',
				order: 'order position',
				type: ''
			})

			// ensure descriptor
			if (!isObj(field)) field = {value: field}

			// ensure order
			if (field.order == null) field.order = i

			// ensure type
			if (field.type == null) field.type = detect(field)

			// ensure id
			if (field.id == null) {
				field.id = defined(field.label, detect(field))
			}

			field.id = dashcase(field.id, '-')
		})

		fields = arr.sort((a, b) => a.order - b.order)

	}

	function detect(field) {
		if (item.value && Array.isArray(item.value)) {
			if (typeof item.value[0] === 'string') {
				item.type = 'checkbox';
			}
			else {
				item.type = 'interval'
			}
		} else if (item.scale || item.max || item.steps || item.step || typeof item.value === 'number') {
			item.type = 'range'
		} else if (item.options) {
			if (Array.isArray(item.options) && item.options.join('').length < 90 ) {
				item.type = 'switch'
			}
			else {
				item.type = 'select'
			}
		} else if (item.format) {
			item.type = 'color'
		} else if (typeof item.value === 'boolean') {
			item.type = 'checkbox'
		} else if (item.content != null) {
			item.type = 'raw'
		} else {
			if (item.value && (item.value.length > 140 || /\n/.test(item.value))) {
				item.type = 'textarea'
			}
			else {
				item.type = 'text'
			}
		}
	}
}
