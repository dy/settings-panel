/**
 * @module  settings-panel/theme/none
 */

const px = require('add-px-to-style');

module.exports = none;

none.palette = ['white', 'black'];
none.fontSize = '13px';
none.fontFamily = 'sans-serif';
none.labelWidth = '9em';
none.inputHeight = 2;

function none (opts) {
	opts = opts || {};
	let fs = opts.fontSize || none.fontSize;
	let font = opts.fontFamily || none.fontFamily;
	let h = opts.inputHeight || none.inputHeight;
	let labelWidth = opts.labelWidth || none.labelWidth;

	let palette = opts.palette || none.palette;
	let white = palette[0];
	let black = palette[palette.length - 1];

	//just size part
	return `
		:host {
			background: ${white};
			color: ${black};
			font-family: ${font};
			font-size: ${px('font-size', fs)};
			padding: ${h*.666}em;
		}

		.settings-panel-title {
			min-height: ${h}em;
		}

		.settings-panel-field {
			padding: ${h/8}em;
		}

		:host.settings-panel-orientation-left .settings-panel-label,
		:host .settings-panel-orientation-left .settings-panel-label,
		:host.settings-panel-orientation-right .settings-panel-label,
		:host .settings-panel-orientation-right .settings-panel-label {
			width: ${px('width', labelWidth)};
		}
		:host.settings-panel-orientation-bottom .settings-panel-label {
			border-top-width: ${h}em;
		}
		:host.settings-panel-orientation-bottom .settings-panel-label + .settings-panel-input {
			top: ${h/8}em;
		}
		:host.settings-panel-orientation-left .settings-panel-label {
			padding-right: ${h/2}em;
		}
		:host.settings-panel-orientation-right .settings-panel-label {
			padding-left: ${h/2}em;
		}
		:host.settings-panel-orientation-right .settings-panel-label + .settings-panel-input {
			width: calc(100% - ${labelWidth});
		}

		.settings-panel-text,
		.settings-panel-textarea,
		.settings-panel-range,
		.settings-panel-interval,
		.settings-panel-select,
		.settings-panel-color,
		.settings-panel-color-value,
		.settings-panel-value {
			height: ${h}em;
		}

		.settings-panel-button,
		.settings-panel-input,
		.settings-panel-switch,
		.settings-panel-checkbox-group,
		.settings-panel-switch-label {
			min-height: ${h}em;
		}
		.settings-panel-input,
		.settings-panel-switch,
		.settings-panel-checkbox-group,
		.settings-panel-switch-label {
			line-height: ${h}em;
		}

		.settings-panel-switch-label,
		.settings-panel-checkbox,
		.settings-panel-checkbox-label,
		.settings-panel-button {
			cursor: pointer;
		}

		.settings-panel-range::-webkit-slider-thumb {
			cursor: ew-resize;
		}
		.settings-panel-range::-moz-range-thumb {
			cursor: ew-resize;
		}
		.settings-panel-range::-ms-track {
			cursor: ew-resize;
		}
		.settings-panel-range::-ms-thumb {
			cursor: ew-resize;
		}

		/* Default triangle styles are from control theme, just set display: block */
		.settings-panel-select-triangle {
			display: none;
			position: absolute;
			border-right: .3em solid transparent;
			border-left: .3em solid transparent;
			line-height: ${h}em;
			right: 2.5%;
			height: 0;
			z-index: 1;
			pointer-events: none;
		}
		.settings-panel-select-triangle--up {
			top: 50%;
			margin-top: -${h/4 + h/16}em;
			border-bottom: ${h/4}em solid;
			border-top: 0px transparent;
		}
		.settings-panel-select-triangle--down {
			top: 50%;
			margin-top: ${h/16}em;
			border-top: ${h/4}em solid;
			border-bottom: .0 transparent;
		}

		:host hr {
			opacity: .5;
			color: ${black}
		}
	`;
}