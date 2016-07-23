/**
 * @module  settings-panel/theme/none
 */

const extend = require('just-extend');
const lerp = require('interpolation-arrays');
const px = require('add-px-to-style');

module.exports = none;

none.palette = [[255, 255, 255], [0, 0, 0]];
none.fontSize = '13px';
none.fontFamily = 'sans-serif';
none.labelWidth = '9em';

function none (opts) {
	opts = opts || {};
	let fs = opts.fontSize || none.fontSize;
	let font = opts.fontFamily || none.fontFamily;
	let palette = opts.palette || none.palette;

	let pick = lerp(palette);
	let white = `rgb(${pick(0).map(v => v.toFixed(0))})`;
	let black = `rgb(${pick(1).map(v => v.toFixed(0))})`;
	let gray = `rgb(${pick(.5).map(v => v.toFixed(0))})`;
	let dark = `rgb(${pick(.75).map(v => v.toFixed(0))})`;
	let light = `rgb(${pick(.25).map(v => v.toFixed(0))})`;

	let labelWidth = opts.labelWidth || none.labelWidth;

	return `
		:host {
			background: ${white};
			color: ${black};
			font-family: ${font};
			font-size: ${px('font-size', fs)};
		}

		.settings-panel-label {
			width: ${px('width', labelWidth)};
		}

		:host hr {
			color: ${light}
		}
	`;
}