/**
 * @module  settings-panel/theme/none
 */

const extend = require('just-extend');
const px = require('add-px-to-style');

module.exports = none;

none.palette = [[255, 255, 255], [0, 0, 0]];
none.fontSize = '13px';
none.fontFamily = 'sans-serif';
none.labelWidth = '9em';
none.inputHeight = 2;

function none (opts) {
	opts = opts || {};
	let fs = opts.fontSize || none.fontSize;
	let font = opts.fontFamily || none.fontFamily;
	let palette = none.palette;

	let white = `rgb(${palette[0].map(v => parseInt(v))})`;
	let black = `rgb(${palette.slice(-1)[0].map(v => parseInt(v))})`;

	let labelWidth = opts.labelWidth || none.labelWidth;

	return `
		:host {
			background: ${white};
			color: ${black};
			font-family: ${font};
			font-size: ${px('font-size', fs)};
		}

		:host.settings-panel-orientation-left .settings-panel-label,
		:host .settings-panel-orientation-left .settings-panel-label,
		:host.settings-panel-orientation-right .settings-panel-label,
		:host .settings-panel-orientation-right .settings-panel-label {
			width: ${px('width', labelWidth)};
		}

		:host hr {
			opacity: .5;
			color: ${black}
		}
	`;
}