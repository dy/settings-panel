var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var isNumeric = require('is-numeric')
var css = require('dom-css')
var format = require('param-case')

module.exports = Range
inherits(Range, EventEmitter)

function Range (opts) {
	if (!(this instanceof Range)) return new Range(opts)
	var scaleValue, scaleValueInverse, logmin, logmax, logsign

	if (!!opts.step && !!opts.steps) {
		throw new Error('Cannot specify both step and steps. Got step = ' + opts.step + ', steps = ', opts.steps)
	}

	if (!opts.container) opts.container = document.body;

	var input = opts.container.querySelector('.settings-panel-range');

	if (!input) {
		input = opts.container.appendChild(document.createElement('input'))
		input.type = 'range'
		input.className = 'settings-panel-range'
	}


	// Create scale functions for converting to/from the desired scale:
	if (opts.scale === 'log') {
		scaleValue = function (x) {
			return logsign * Math.exp(Math.log(logmin) + (Math.log(logmax) - Math.log(logmin)) * x / 100)
		}
		scaleValueInverse = function (y) {
			return (Math.log(y * logsign) - Math.log(logmin)) * 100 / (Math.log(logmax) - Math.log(logmin))
		}
	} else {
		scaleValue = scaleValueInverse = function (x) { return x }
	}

	// Get initial value:
	if (opts.scale === 'log') {
		// Get options or set defaults:
		opts.max = (isNumeric(opts.max)) ? opts.max : 100
		opts.min = (isNumeric(opts.min)) ? opts.min : 0.1

		// Check if all signs are valid:
		if (opts.min * opts.max <= 0) {
			throw new Error('Log range min/max must have the same sign and not equal zero. Got min = ' + opts.min + ', max = ' + opts.max)
		} else {
			// Pull these into separate variables so that opts can define the *slider* mapping
			logmin = opts.min
			logmax = opts.max
			logsign = opts.min > 0 ? 1 : -1

			// Got the sign so force these positive:
			logmin = Math.abs(logmin)
			logmax = Math.abs(logmax)

			// These are now simply 0-100 to which we map the log range:
			opts.min = 0
			opts.max = 100

			// Step is invalid for a log range:
			if (isNumeric(opts.step)) {
				throw new Error('Log may only use steps (integer number of steps), not a step value. Got step =' + opts.step)
			}
			// Default step is simply 1 in linear slider space:
			opts.step = 1
		}

		opts.initial = scaleValueInverse(isNumeric(opts.initial) ? opts.initial : scaleValue((opts.min + opts.max) * 0.5))

		if (opts.initial * scaleValueInverse(opts.max) <= 0) {
			throw new Error('Log range initial value must have the same sign as min/max and must not equal zero. Got initial value = ' + opts.initial)
		}
	} else {
		// If linear, this is much simpler:
		opts.max = (isNumeric(opts.max)) ? opts.max : 100
		opts.min = (isNumeric(opts.min)) ? opts.min : 0
		opts.step = (isNumeric(opts.step)) ? opts.step : (opts.max - opts.min) / 100

		opts.initial = isNumeric(opts.initial) ? opts.initial : (opts.min + opts.max) * 0.5
	}

	// If we got a number of steps, use that instead:
	if (isNumeric(opts.steps)) {
		opts.step = isNumeric(opts.steps) ? (opts.max - opts.min) / opts.steps : opts.step
	}

	// Quantize the initial value to the requested step:
	var initialStep = Math.round((opts.initial - opts.min) / opts.step)
	opts.initial = opts.min + opts.step * initialStep

	// Set value on the input itself:
	input.min = opts.min
	input.max = opts.max
	input.step = opts.step
	input.value = opts.initial

	css(input, {
		width: '50%'
	})

	var value = require('./value')(opts.container, {
		id: opts.id,
		initial: scaleValue(opts.initial),
		type: opts.scale === 'log' ? 'text' : 'number',
		min: scaleValue(opts.min),
		max: scaleValue(opts.max),
		step: opts.step,
		input: function (v) {
			input.value = v
			value.value = scaleValue(v)
		}
	})

	setTimeout(() => {
		this.emit('init', parseFloat(input.value))
	})

	input.oninput = (data) => {
		var scaledValue = scaleValue(parseFloat(data.target.value))
		value.value = scaledValue
		this.emit('input', scaledValue)
	}
}
