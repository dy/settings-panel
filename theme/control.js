/**
 * @module prama/theme/control
 *
 * Control-panel theme on steroids
 */
const px = require('add-px-to-style');
const fonts = require('google-fonts');
const color = require('tinycolor2');
const scopeCss = require('scope-css');
const lerp = require('interpolation-arrays');
const none = require('./none');

module.exports = control;

control.palette = ['#292929', '#e7e7e7'];

control.fontSize = '12px';
control.fontFamily = '"Space Mono", monospace';
control.labelWidth = '33.3%';
control.inputHeight = 1.66666;

fonts.add({
	'Space Mono': true
});


function control (opts) {
	opts = opts || {};
	let fs = opts.fontSize || control.fontSize;
	let font = opts.fontFamily || control.fontFamily;
	let h = opts.inputHeight || control.inputHeight;
	let labelWidth = opts.labelWidth || none.labelWidth;

	let palette = (opts.palette || control.palette).map(v => color(v).toRgb());
	let pick = lerp(palette);

	let white = color(pick(.0)).toString();
	let light = color(pick(.1)).toString();
	let gray = color(pick(.75)).toString();
	let dark = color(pick(.95)).toString();
	let black = color(pick(1)).toString();

	//NOTE: this is in case of scaling palette to black/white range
	// let white = color(pick(0.1607843137254902)).toString();
	// let light = color(pick(0.23529411764705882)).toString();
	// let gray = color(pick(0.5705882352941177)).toString();
	// let dark = color(pick(0.7196078431372549)).toString();
	// let black = color(pick(0.9058823529411765)).toString();

	//none theme defines sizes, the rest (ours) is up to style
	return none({
		fontSize: fs,
		fontFamily: font,
		inputHeight: h,
		labelWidth: labelWidth,
	}) + `
	:host {
		background: ${white};
		font-family: ${font};
		font-size: ${px('font-size',fs)};
		color: ${gray};
		padding: ${h/2}em;
	}

	.settings-panel-title {
		font-size: 1.25em;
		letter-spacing: .15ex;
		padding-bottom: ${h/2}em;
	}

	/** Text */
	.settings-panel-text,
	.settings-panel-textarea {
		padding-left: ${h/4}em;
		border: none;
		font-family: inherit;
		background: ${light};
		color: inherit;
		border-radius: 0;
	}
	.settings-panel-text:hover,
	.settings-panel-textarea:hover,
	.settings-panel-text:focus,
	.settings-panel-textarea:focus {
		outline: none;
		color: ${dark};
	}


	/** Range */
	.settings-panel-range {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background: ${light};
		width: 80%;
		border-radius: 0;
	}
	.settings-panel-range:focus {
		outline: none;
	}
	.settings-panel-range::-webkit-slider-thumb {
		-webkit-appearance: none;
		height: ${h}em;
		width: ${h/2}em;
		background: ${gray};
		border: 0;
		margin-top: 0px;
	}
	.settings-panel-range:hover::-webkit-slider-thumb {
		background: ${dark};
	}
	.settings-panel-range::-moz-range-track {
		-moz-appearance: none;
		background: none;
	}
	.settings-panel-range::-moz-range-thumb {
		-moz-appearance: none;
		background: ${gray};
		border: none;
		border-radius: 0px;
		height: ${h}em;
		width: ${h/2}em;
	}
	.settings-panel-range:hover::-moz-range-thumb {
		background: ${dark};
	}
	.settings-panel-range::-ms-track {
		background: none;
		border: none;
		outline: none;
		color: transparent;
	}
	.settings-panel-range::-ms-fill-lower {
		background: none;
	}
	.settings-panel-range::-ms-fill-upper {
		background: none;
	}
	.settings-panel-range::-ms-thumb {
		border-radius: 0px;
		border: 0;
		background: ${gray};
		width: ${h/2}em;
		height: ${h}em;
	}
	.settings-panel-range:hover::-ms-thumb {
		background: ${dark};
	}
	.settings-panel-range:focus::-ms-fill-lower {
		background: none;
		outline: none;
	}
	.settings-panel-range:focus::-ms-fill-upper {
		background: none;
		outline: none;
	}


	/** Interval */
	.settings-panel-interval-handle {
		background: ${gray};
	}
	.settings-panel-interval {
		background: ${light};
		position: relative;
		width: 60%;
	}
	.settings-panel-interval:hover .settings-panel-interval-handle {
		background: ${dark};
	}

	/** Values */
	.settings-panel-value {
		background: ${light};
		margin-left: ${h/4}em;
		width: calc(20% - ${h/4}em);
		padding-left: ${h/4}em;
	}
	.settings-panel-value:first-child {
		margin-left: 0;
		margin-right: ${h/4}em;
	}
	.settings-panel-value:hover,
	.settings-panel-value:focus {
		color: ${dark};
	}


	/** Select */
	.settings-panel-select {
		font-family: inherit;
		background: ${light};
		color: inherit;
		padding-left: ${h/4}em;
		border-radius: 0;
		outline: none;
		border: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		-o-appearance:none;
		appearance:none;
	}
	.settings-panel-select:hover,
	.settings-panel-select:focus {
		color: ${dark};
	}
	.settings-panel-select::-ms-expand {
		display: none;
	}
	.settings-panel-select-triangle {
		display: block;
	}


	/** Checkbox */
	.settings-panel-checkbox {
		display: none;
	}
	.settings-panel-checkbox-label {
		position: relative;
		display: block;
		margin: ${h*.075}em 0;
		width: ${h*.85}em;
		height: ${h*.85}em;
		line-height: ${h*.85}em;
		background: ${light};
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label {
		background: ${gray};
		box-shadow: inset 0 0 0 ${h*.2}em ${light};
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label:hover {
		background: ${dark};
	}


	/** Color */
	.settings-panel-color {
		position: relative;
		width: calc(20% - ${h/4}em);
		margin-right: ${h/4}em;
		display: inline-block;
		vertical-align: baseline;
	}
	.settings-panel-color-value {
		border: none;
		padding-left: ${h/4}em;
		width: 80%;
		font-family: inherit;
		background: ${light};
		color: inherit;
		border-radius: 0;
	}
	.settings-panel-color-value:hover,
	.settings-panel-color-value:focus {
		outline: none;
		color: ${dark};
	}


	/** Button */
	.settings-panel-button {
		color: ${black};
		background: ${light};
		text-align: center;
		border: none;
	}
	.settings-panel-button:focus {
		outline: none;
	}
	.settings-panel-button:hover {
		background: ${gray};
	}
	.settings-panel-button:active {
		background: ${dark};
	}


	/** Switch style */
	.settings-panel-switch {
	}
	.settings-panel-switch-input {
		display: none;
	}
	.settings-panel-switch-label {
		position: relative;
		display: inline-block;
		padding: 0 ${h/2}em;
		margin: 0;
		z-index: 2;
		text-align: center;
	}
	.settings-panel-switch-input:checked + .settings-panel-switch-label {
		background: ${light};
		color: ${gray};
	}
	.settings-panel-switch-input + .settings-panel-switch-label:hover {
		color: ${dark};
	}

	/** Decorations */
	::-webkit-input-placeholder {
		color: ${gray};
	}
	::-moz-placeholder {
		color: ${gray};
	}
	:-ms-input-placeholder {
		color: ${gray};
	}
	:-moz-placeholder {
		color: ${gray};
	}
	::-moz-selection {
		color: ${white};
		background: ${dark};
	}
	::selection {
		color: ${white};
		background: ${black};
	}
	:host hr {
		margin: ${h/4}em ${h/8}em;
		color: ${light};
		opacity: 1;
	}
	:host a {
		border-bottom: 1px solid ${alpha(gray, .15)};
	}
	:host a:hover {
		color: ${dark};
		border-bottom: 1px solid ${gray};
	}
`};


function alpha (c, value) {
	return color(c).setAlpha(value).toString();
}
