/**
 * @module prama/theme/json
 *
 * Json representation theme
 */

const px = require('add-px-to-style');
const none = require('./none');

module.exports = json;

json.palette = ['white', 'rgb(200,0,0)', 'rgb(40,40,40)'];

json.fontSize = '12px';
json.fontFamily = 'monospace';
json.labelWidth = 'auto';
json.inputHeight = 1.5;

function json (opts) {
	opts = opts || {};

	let h = opts.inputHeight || json.inputHeight;
	let labelWidth = opts.labelWidth || json.labelWidth;
	let fontSize = opts.fontSize || json.fontSize;
	let font = opts.fontFamily || json.fontFamily;

	let palette = opts.palette || json.palette;

	let white = palette[0];
	let black = palette[palette.length - 1];
	let red = palette[palette.length - 2];

	return none({
		fontSize: fontSize,
		fontFamily: font,
		inputHeight: h,
		labelWidth: labelWidth,
		palette: [white, black]
	}) + `
	:host {
		-webkit-user-select: initial;
		-moz-user-select: initial;
		-ms-user-select: initial;
		user-select: initial;
	}

	.settings-panel-title {
		margin: 0;
		font-size: 1.4em;
	}

	.settings-panel-field {
		display: inline-block;
	}

	.settings-panel-label {
		display: inline-block;
		width: ${labelWidth};
		color: ${red};
	}
	.settings-panel-label:before {
		content: '"';
		opacity: .3;
		color: ${black};
	}
	.settings-panel-label:after {
		content: '":';
		opacity: .3;
		color: ${black};
	}
	.settings-panel-input {
		display: inline-block;
		min-height: 0;
	}
	/*
	.settings-panel-input:after {
		content: ',';
		color: ${black};
		opacity: .3;
	}
	*/

	.settings-panel-range {
		display: none;
	}
	.settings-panel-range + .settings-panel-value {
		width: auto;
	}
	.settings-panel-value {
		padding: 0;
	}


	.settings-panel-text,
	.settings-panel-color-value,
	.settings-panel-select,
	.settings-panel-textarea {
		-webkit-appearance: none;
		-moz-appearance: none;
		-o-appearance:none;
		border: none;
		background: none;
	}

	.settings-panel-text:focus,
	.settings-panel-color-value:focus,
	.settings-panel-textarea:focus {
		outline: none;
	}


	.settings-panel-interval {
		display: none;
	}
	.settings-panel-field--interval {
		white-space: nowrap;
	}
	.settings-panel-field--interval .settings-panel-input:before {
		content: '[';
		opacity: .3;
	}
	.settings-panel-field--interval .settings-panel-input:after {
		content: ']';
		opacity: .3;
	}

	/** Decorations */
	:host hr {
		margin: 0;
		border: none;
		height: 0;
	}
	.settings-panel-field--disabled {
		opacity: .333;
		pointer-events: none;
	}
	`;
};