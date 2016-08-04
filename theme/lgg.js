/**
 * @module prama/theme/lgg
 *
 * Control-panel theme on steroids
 */
const px = require('add-px-to-style');
const fonts = require('google-fonts');
const color = require('tinycolor2');
const scopeCss = require('scope-css');
const lerp = require('interpolation-arrays');
const none = require('./none');

module.exports = lgg;

//uses reflective scheme
lgg.palette = ['#272727', '#fff', '#f95759'];

lgg.fontSize = '14px';
lgg.fontFamily = '"Roboto", sans-serif';
lgg.labelWidth = '33.3%';
lgg.inputHeight = 2;

fonts.add({
	'Roboto': [400, 500]
});


function lgg (opts) {
	opts = opts || {};
	let fs = opts.fontSize || lgg.fontSize;
	let font = opts.fontFamily || lgg.fontFamily;
	let h = opts.inputHeight || lgg.inputHeight;
	let labelWidth = opts.labelWidth || none.labelWidth;

	let palette = (opts.palette || lgg.palette).map(v => color(v).toRgb());
	let pick = lerp(palette);

	//NOTE: this is in case of scaling palette to black/white range
	let white = tone(.5);
	let black = tone(0);
	let active = tone(1);

	function tone (amt) {
		return color(pick(amt)).toString();
	}

	//none theme defines sizes, the rest (ours) is up to style
	return none({
		fontSize: fs,
		fontFamily: font,
		inputHeight: h,
		labelWidth: labelWidth,
	}) + `
	:host {
		background: ${white};
		color: ${black};
		font-family: ${font};
		font-weight: 500;
	}

	.settings-panel-title {

	}

	.settings-panel-label {
		color: ${tone(.25)};
		font-weight: 500;
	}

	/** Text */
	.settings-panel-text,
	.settings-panel-textarea,
	.settings-panel-color-value {
		-webkit-appearance: none;
		-moz-appearance: none;
		-o-appearance: none;
		appearance: none;
		outline: none;
		border: 0;
		border-radius: 0;
		background: ${tone(.5)};
		color: ${tone(1)};
		box-shadow: 0 1px ${tone(.45)};
	}
	.settings-panel-text:hover,
	.settings-panel-color-value:hover,
	.settings-panel-textarea:hover {
		color: ${tone(1)};
	}
	.settings-panel-text:focus,
	.settings-panel-color-value:focus,
	.settings-panel-textarea:focus {
		box-shadow: 0 1px ${tone(1)};

	}


	/** Sliders */
	.settings-panel-range {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background: none;
		color: ${tone(.25)};
		border: 0;
	}
	.settings-panel-field--range:hover .settings-panel-range,
	.settings-panel-range:focus {
		outline: none;
	}
	.settings-panel-range::-webkit-slider-runnable-track {
		background: none;
		height: 2px;
		background: ${tone(.65)};
	}
	.settings-panel-field--range:hover .settings-panel-range::-webkit-slider-runnable-track,
	.settings-panel-range:focus::-webkit-slider-runnable-track {
		/* background: ${tone(.65)}; */
	}
	.settings-panel-range::-moz-range-track {
		background: none;
		height: 2px;
		color: transparent;
		border: none;
		outline: none;
		background: ${tone(.25)};
	}
	.settings-panel-field--range:hover .settings-panel-range::-moz-range-track,
	.settings-panel-range:focus::-moz-range-track {
		background: ${black};
	}
	.settings-panel-range::-moz-range-progress {
		background: ${tone(.35)};
	}
	.settings-panel-field--range:hover .settings-panel-range::-moz-range-progress,
	.settings-panel-range:focus::-moz-range-progress {
		background: ${tone(1)};
	}
	.settings-panel-range::-ms-track {
		height: 2px;
		color: transparent;
		border: none;
		outline: none;
	}
	.settings-panel-range::-ms-fill-lower {
		background: ${tone(.35)};
	}
	.settings-panel-range::-ms-fill-upper {
		background: ${black};
	}
	.settings-panel-field--range:hover .settings-panel-range::-ms-fill-lower,
	.settings-panel-range:focus::-ms-fill-lower {
		background: ${white};
	}

	@supports (--css: variables) {
		.settings-panel-range {
			--active: ${tone(1)};
			--bg: ${tone(.65)};
			--track-background: linear-gradient(to right, var(--active) 0, var(--active) var(--value), var(--bg) 0) no-repeat;
		}
		.settings-panel-range::-webkit-slider-runnable-track {
			background: var(--track-background);
		}
		.settings-panel-range::-moz-range-track {
			background: var(--track-background);
		}
		.settings-panel-field--range:hover .settings-panel-range,
		.settings-panel-range:focus {
			--bg: ${tone(.65)};
			--active: ${tone(1)};
		}
	}

	.settings-panel-range::-webkit-slider-thumb {
		background: ${tone(1)};
		height: ${h/2}em;
		width: ${h/2}em;
		border-radius: ${h/2}em;
		margin-top: -${h/4}em;
		border: 0;
		position: relative;
		top: 1px;
		-webkit-appearance: none;
		appearance: none;
	}
	.settings-panel-range:focus::-webkit-slider-thumb,
	.settings-panel-range:hover::-webkit-slider-thumb,
	.settings-panel-field--range:hover .settings-panel-range::-webkit-slider-thumb {
		background: ${tone(1)};
	}
	.settings-panel-range::-moz-range-thumb {
		background: ${tone(.35)};
		height: ${h/2}em;
		width: ${h/2}em;
		border-radius: ${h/2}em;
		margin-top: -${h/4}em;
		border: 0;
		position: relative;
		top: 1px;
		-webkit-appearance: none;
		-moz-appearance: none;
	}
	.settings-panel-range:focus::-moz-range-thumb,
	.settings-panel-range:hover::-moz-range-thumb,
	.settings-panel-field--range:hover .settings-panel-range::-moz-range-thumb {
		background: ${white};
	}
	.settings-panel-range::-ms-thumb {
		appearance: none;
		outline: 0;
		border: none;
		position: relative;
		top: 1px;
		background: ${tone(.35)};
		width: ${h/2}em;
		height: ${h/2}em;
		border-radius: ${h/2}em;
		cursor: pointer;
	}
	.settings-panel-range:focus::-ms-thumb,
	.settings-panel-range:hover::-ms-thumb,
	.settings-panel-field--range:hover .settings-panel-range::-ms-thumb {
		background: ${tone(1)};
	}

	:host.settings-panel-orientation-top .settings-panel-range,
	.settings-panel-orientation-top .settings-panel-range {
		width: 100%;
	}
	:host.settings-panel-orientation-top .settings-panel-range + .settings-panel-value,
	.settings-panel-orientation-top .settings-panel-range + .settings-panel-value {
		position: absolute;
		top: -${h}em;
		right: 0%;
		text-align: right;
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
		background: ${tone(.25)};
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
		background: ${tone(.15)};
	}
	.settings-panel-field--interval:hover .settings-panel-interval:after {
		background: ${black};
	}
	.settings-panel-field--interval:hover .settings-panel-interval-handle {
		background: ${white};
	}
	.settings-panel-field--interval:hover .settings-panel-value {
		color: ${white};
	}
	.settings-panel-interval-handle:after {
		content: '';
		position: absolute;
		right: -${h/4}em;
		top: 0;
		bottom: 0;
		margin: auto;
		height: ${h/2}em;
		width: ${h/2}em;
		border-radius: ${h/2}em;
		background: inherit;
	}
	.settings-panel-interval-handle:before {
		content: '';
		position: absolute;
		left: -${h/4}em;
		top: 0;
		bottom: 0;
		margin: auto;
		height: ${h/2}em;
		width: ${h/2}em;
		border-radius: ${h/2}em;
		background: inherit;
	}

	.settings-panel-interval-dragging .settings-panel-interval-handle {
		background: ${white};
	}

	/** Values */
	.settings-panel-value {
	}
	.settings-panel-value:first-child {
		margin-left: 0;
	}
	.settings-panel-value:hover,
	.settings-panel-value:focus {
	}


	/** Select */
	.settings-panel-select {
		font-family: inherit;
		color: inherit;
		border-radius: 0;
		outline: none;
		border: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		-o-appearance:none;
		appearance:none;
		padding-right: 1em;
		margin-right: -1em;
		color: ${tone(1)};
		background: ${tone(.5)};
		box-shadow: 0 1px ${tone(.45)};
	}
	.settings-panel-select:hover,
	.settings-panel-select:focus {
	}
	.settings-panel-select::-ms-expand {
		display: none;
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
		border-top: .3em solid ${tone(1)};
		border-bottom: .0 transparent;
	}
	.settings-panel-select-triangle--up {
		display: none;
	}
	.settings-panel-field--select:hover .settings-panel-select,
	.settings-panel-select:focus {
	}


	/** Checkbox */
	.settings-panel-checkbox {
		display: none;
	}
	.settings-panel-checkbox-label {
		display: block;
		width: ${h/2}em;
		height: ${h/2}em;
		border-radius: 1px;
		position: relative;
		display: block;
		color: ${tone(.25)};
		box-shadow: 0 0 0 2px;
		line-height: ${h/2}em;
	}
	.settings-panel-checkbox-label:hover {
		color: ${tone(.15)}
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label {
		box-shadow: 0 0 0 2px ${tone(1)};
		background: ${tone(1)};
		color: ${tone(.5)};
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label:before {
		content: '✔';
	}


	/** Color */
	.settings-panel-color {
		height: ${h*.5}em;
		width: ${h*.5}em;
		top: 0;
		bottom: 0;
		margin-top: auto;
		margin-bottom: auto;
		position: relative;
		display: inline-block;
		vertical-align: baseline;
	}
	.settings-panel-color-value {
		border: none;
		width: 80%;
		font-family: inherit;
		border-radius: 0;
		margin-left: ${-h/2}em;
		padding-left: ${h*.75}em;
	}
	.settings-panel-color-value:hover,
	.settings-panel-color-value:focus {
		outline: none;
	}


	/** Button */
	.settings-panel-button {
		text-align: center;
		border: none;
	}
	.settings-panel-button:focus {
		outline: none;
	}
	.settings-panel-button:hover {
	}
	.settings-panel-button:active {
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
		margin: 0;
		z-index: 2;
		text-align: center;
		text-transform: uppercase;
		padding: 0 ${h/4}em;
	}
	.settings-panel-switch-input:checked + .settings-panel-switch-label {
		color: ${tone(1)};
	}
	.settings-panel-switch-input + .settings-panel-switch-label:hover {
	}

	/** Decorations */
	::-webkit-input-placeholder {
	}
	::-moz-placeholder {
	}
	:-ms-input-placeholder {
	}
	:-moz-placeholder {
	}
	::-moz-selection {
	}
	::selection {
	}
	:host hr {
		opacity: 1;
		border-bottom: 1px solid ${tone(0)};
		margin: ${h/2}em 0;
	}
	:host a {
	}
	:host a:hover {
	}
`};


function alpha (c, value) {
	return color(c).setAlpha(value).toString();
}
