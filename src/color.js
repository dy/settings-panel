const EventEmitter = require('events').EventEmitter
const ColorPicker = require('simple-color-picker')
const inherits = require('inherits')
const css = require('dom-css')
const tinycolor = require('tinycolor2')
const formatParam = require('param-case')
const num = require('input-number')

module.exports = Color
inherits(Color, EventEmitter)

function Color (opts) {
	if (!(this instanceof Color)) return new Color(opts)
	opts = opts || {}
	opts.format = opts.format || 'rgb'
	opts.value = opts.value || '#123456'

	var icon = opts.container.appendChild(document.createElement('span'))
	icon.className = 'settings-panel-color'

	var valueInput = opts.container.appendChild(document.createElement('input'));
	valueInput.id = opts.id;
	valueInput.className = 'settings-panel-color-value';
	num(valueInput);
	valueInput.onchange = () => {
		picker.setColor(valueInput.value);
	};
	valueInput.oninput = () => {
		picker.setColor(valueInput.value);
	};

	icon.onmouseover = function () {
		picker.$el.style.display = ''
	}

	var initial = opts.value
	switch (opts.format) {
		case 'rgb':
			initial = tinycolor(initial).toHexString()
			break
		case 'hex':
			initial = tinycolor(initial).toHexString()
			break
		case 'array':
			initial = tinycolor.fromRatio({r: initial[0], g: initial[1], b: initial[2]}).toHexString()
			break
		default:
			break
	}

	var picker = new ColorPicker({
		el: icon,
		color: initial,
		width: 160,
		height: 120
	});

	picker.$el.style.display = 'none';

	icon.onmouseout = (e) => {
		picker.$el.style.display = 'none'
	}

	setTimeout(() => {
		this.emit('init', initial)
	})

	picker.onChange((hex) => {
		let v = format(hex);
		if (v !== valueInput.value) valueInput.value = v;
		css(icon, {backgroundColor: hex})
		this.emit('input', format(hex))
	})

	function format (hex) {
		switch (opts.format) {
			case 'rgb':
				return tinycolor(hex).toRgbString()
			case 'hex':
				return tinycolor(hex).toHexString()
			case 'array':
				var rgb = tinycolor(hex).toRgb()
				return [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(function (x) {
					return x.toFixed(2)
				})
			default:
				return hex
		}
	}
}
