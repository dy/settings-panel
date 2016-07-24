/**
 * @module prama/theme/dragon
 *
 * Minimalistic theme
 */
const px = require('add-px-to-style');
const fonts = require('google-fonts');
const color = require('tinycolor2');
const scopeCss = require('scope-css');
const lerp = require('interpolation-arrays');

module.exports = dragon;

fonts.add({
	'Roboto': 400
});

dragon.palette = [
	'#fff',
	'#999',
	'#131522',
	'#373737',
	'#222',
];

dragon.fontSize = '12px';
dragon.fontFamily = '"Roboto", sans-serif';
dragon.labelWidth = '33.3%';
dragon.inputHeight = 1.66666;

function dragon (opts) {
	opts = opts || {};

	let h = opts.inputHeight || dragon.inputHeight;
	let labelWidth = opts.labelWidth || dragon.labelWidth;
	let fontSize = opts.fontSize || dragon.fontSize;
	let font = opts.fontFamily || dragon.fontFamily;
	let palette = (opts.palette || dragon.palette).map(v => color(v).toRgb());
	let pick = lerp(palette);

	let white = color(pick(0)).toString();
	let light = color(pick(.25)).toString();
	let gray = color(pick(.5)).toString();
	let dark = color(pick(.75)).toString();
	let black = color(pick(1)).toString();

	return `
	:host {
		color: ${light};
		background: ${alpha(dark, .91)};
		font-size: ${px('font-size', fontSize)};
		font-family: ${font};
	}

	.settings-panel-title {
		text-transform: uppercase;
		font-size: 1.25em;
		min-height: ${h}em;
		letter-spacing: .15ex;
		padding: ${h/8}em 0 ${h/2}em;
	}

	/** Select style */
	.settings-panel-select {
		background: none;
		outline: none;
		border: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		-o-appearance:none;
		appearance:none;
		width: 100%;
		padding-right: 1em;
		margin-right: -1em;
		color: ${white};
		box-shadow: 0 2px ${black};
	}
	.settings-panel-select::-ms-expand {
		display:none;
	}
	.settings-panel-select-triangle {
		content: '';
		border-right: .3em solid transparent;
		border-left: .3em solid transparent;
		line-height: 2em;
		position: relative;
		z-index: 1;
		vertical-align: middle;
		display: inline-block;
		width: 0;
		text-align: center;
		pointer-events: none;
	}
	.settings-panel-select-triangle--down {
		top: 0em;
		left: .5em;
		border-top: .3em solid ${white};
		border-bottom: .0 transparent;
	}
	.settings-panel-select-triangle--up {
		display: none;
	}
	.settings-panel-select:focus {
		box-shadow: 0 2px ${gray};
	}

	/** Values */
	.settings-panel-value {
		height: ${h}em;
	}
	.settings-panel-value:focus {
		color: ${white};
	}

	/** Text */
	.settings-panel-text,
	.settings-panel-textarea {
		border: none;
		background: none;
		color: ${white};
		width: 100%;
		box-shadow: 0 2px ${black};
	}

	.settings-panel-text:focus,
	.settings-panel-textarea:focus {
		outline: none;
		color: ${white};
		box-shadow: 0 2px ${gray};
	}

	/** Color */
	.settings-panel-color {
		height: 1em;
		width: 1em;
		top: 0;
		bottom: 0;
		margin-top: auto;
		margin-bottom: auto;
	}
	.settings-panel-color-value {
		border: none;
		background: none;
		color: ${white};
		box-shadow: 0 2px ${black};
		padding-left: 1.5em;
		width: 100%;
	}
	.settings-panel-color-value:focus {
		outline: none;
		color: ${white};
		box-shadow: 0 2px ${gray};
	}

	/** Switch style */
	.settings-panel-switch {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
	}
	.settings-panel-switch-input {
		display: none;
	}
	.settings-panel-switch-label {
		cursor: pointer;
		min-height: 2em;
		padding: 0 .75em;
		margin: 0 2px 2px 0;
		line-height: 2em;
		color: ${light};
	}
	.settings-panel-switch-label:hover {
		color: ${white};
	}
	.settings-panel-switch-label:last-child {
		margin-right: 0;
	}
	.settings-panel-switch-input:checked + .settings-panel-switch-label {
		color: ${white};
		background: ${black};
	}

	/** Checkbox */
	.settings-panel-field--checkbox .settings-panel-label {
		margin-bottom: .5em;
	}
	.settings-panel-checkbox {
		display: none;
	}
	.settings-panel-checkbox-label {
		position: relative;
		display: inline-block;
		width: 1.5em;
		height: 1.5em;
		cursor: pointer;
		border-radius: 2px;
		background: ${black};
	}
	.settings-panel-checkbox-label:before {
		position: absolute;
		content: "";
		height: .666em;
		width: .666em;
		left: .4333em;
		bottom: .4333em;
		background: ${white};
		opacity: .02;
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label:before {
		opacity: 1;
		background: ${gray};
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label {
		background: ${black};
	}
	.settings-panel-checkbox:focus + .settings-panel-checkbox-label,
	.settings-panel-checkbox + .settings-panel-checkbox-label:hover {
		background: ${gray};
	}
	.settings-panel-checkbox:focus + .settings-panel-checkbox-label:before,
	.settings-panel-checkbox + .settings-panel-checkbox-label:hover:before {
		background: ${white};
	}


	/** Button */
	.settings-panel-button {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		border: none;
		outline: none;
		cursor: pointer;
		min-height: 2.5em;
		padding: .75em 1.5em;
		color: ${color(pick(.8)).toString()};
		background: ${color(pick(.2)).toString()};
	}
	.settings-panel-button:hover {
		color: ${white};
		background: ${light};
	}
	.settings-panel-button:gray {
		color: ${white};
		background: ${black};
	}

	/** Sliders */
	.settings-panel-range {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background: none;
		color: ${black};
	}
	.settings-panel-range:focus {
		color: ${gray};
		outline: none;
	}
	.settings-panel-range::-webkit-slider-runnable-track {
		background: none;
		height: 0px;
		border: 1px solid;
	}
	.settings-panel-range::-moz-range-track {
		background: none;
		height: 0px;
		border: 1px solid;
	}
	.settings-panel-range::-ms-fill-lower {
		background: ${black};
	}
	.settings-panel-range::-ms-fill-upper {
		background: ${black};
	}

	.settings-panel-range::-webkit-slider-thumb {
		background: ${light};
		height: 1.5em;
		width: .5em;
		border: 0;
		cursor: ew-resize;
		-webkit-appearance: none;
		appearance: none;
		margin-top: -.75em;
	}
	.settings-panel-range:focus::-webkit-slider-thumb {
		background: ${white};
	}
	.settings-panel-range::-moz-range-thumb {
		background: ${light};
		height: 1em;
		width: 1em;
		border: 0;
		cursor: ew-resize;
		-webkit-appearance: none;
		-moz-appearance: none;
		margin-top: -.75em;
	}
	.settings-panel-range:focus::-moz-range-thumb {
		background: ${white};
	}
	.settings-panel-range::-ms-thumb {
		background: ${light};
	}


	/** Interval */
	.settings-panel-interval {
		background: none;
	}
	.settings-panel-interval:after {
		content: '';
		position: absolute;
		width: 100%;
		left: 0;
		bottom: 0;
		top: 0;
		background: ${black};
		height: 2px;
		margin-top: auto;
		margin-bottom: auto;
	}
	.settings-panel-interval-handle {
		position: absolute;
		z-index: 1;
		height: 2px;
		top: 0;
		bottom: 0;
		margin-top: auto;
		margin-bottom: auto;
		background: ${light};
	}
	.settings-panel-interval-handle:after {
		content: '';
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		margin: auto;
		width: .5em;
		height: 1.5em;
		background: inherit;
	}
	.settings-panel-interval-handle:before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		margin: auto;
		width: .5em;
		height: 1.5em;
		background: inherit;
	}

	.settings-panel-interval-dragging .settings-panel-interval-handle {
		background: ${white};
	}


	/** Decorations */
	:host hr {
		border: none;
		height: 0;
		margin: 1.25em 0;
		border-bottom: 1px dotted ${pick(.6).toString()};
	}
	::-webkit-input-placeholder {
		color: ${light};
	}
	::-moz-placeholder {
		color: ${light};
	}
	:-ms-input-placeholder {
		color: ${light};
	}
	:-moz-placeholder {
		color: ${light};
	}

	::-moz-selection {
		color: ${white};
		background: ${gray};
	}
	::selection {
		color: ${white};
		background: ${gray};
	}
`;


function alpha (c, value) {
	return color(c).setAlpha(value).toString();
}

}

