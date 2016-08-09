/**
 * @module prama/theme/flat
 *
 * Control-panel theme on steroids
 */
const px = require('add-px-to-style');
const fonts = require('google-fonts');
const color = require('tinycolor2');
const scopeCss = require('scope-css');
const lerp = require('interpolation-arrays');
const none = require('./none');

module.exports = flat;

//uses reflective scheme
flat.palette = ['black', '#fff'];
flat.palette = ['#f95759', '#272727', '#fff'];

flat.fontSize = '14px';
flat.fontFamily = '"Roboto", sans-serif';
flat.labelWidth = '33.3%';
flat.inputHeight = 2;
flat.padding = 1/5;

fonts.add({
	'Roboto': 500,
	'Material Icons': 400
});


function flat (opts) {
	opts = opts || {};
	let fs = opts.fontSize || flat.fontSize;
	let font = opts.fontFamily || flat.fontFamily;
	let h = opts.inputHeight || flat.inputHeight;
	let labelWidth = opts.labelWidth || flat.labelWidth;
	let padding = opts.padding || flat.padding;

	let palette = (opts.palette || flat.palette).map(v => color(v).toRgb());
	let pick = lerp(palette);

	//NOTE: this is in case of scaling palette to black/white range
	let white = tone(1);
	let black = tone(.5);
	let active = tone(0);

	function tone (amt) {
		return color(pick(amt)).toString();
	}

	//none theme defines sizes, the rest (ours) is up to style
	return none({
		fontSize: fs,
		fontFamily: font,
		inputHeight: h,
		labelWidth: labelWidth,
		padding: padding
	}) + `
	:host {
		background: ${white};
		color: ${black};
		font-family: ${font};
		font-weight: 500;
		-webkit-text-size-adjust: 100%;
		-webkit-font-smoothing: antialiased;
		box-shadow: 0 0 0 1px ${alpha(tone(.7), .25)};
	}

	.settings-panel-title {
		color: ${tone(.5)};
		font-family: ${font};
		font-weight: 500;
	}

	.settings-panel-label {
		color: ${tone(.7)};
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
		width: auto;
		border-radius: 0;
		font-weight: 500;
		background: ${white};
		color: ${active};
		box-shadow: 0 1px ${alpha(tone(.7), .25)};
	}
	.settings-panel-text:hover,
	.settings-panel-color-value:hover,
	.settings-panel-textarea:hover {
		color: ${active};
	}
	.settings-panel-text:focus,
	.settings-panel-color-value:focus,
	.settings-panel-textarea:focus {
		box-shadow: 0 1px ${active};

	}


	/** Sliders */
	.settings-panel-range {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background: none;
		color: ${tone(.5)};
		border: 0;
		width: 85%;
		margin-right: ${h/4}em;
	}
	.settings-panel-range + .settings-panel-value {
		width: calc(15% - ${h/4}em);
		padding-left: 0;
	}
	.settings-panel-field--range:hover .settings-panel-range,
	.settings-panel-range:focus {
		outline: none;
	}
	.settings-panel-range::-webkit-slider-runnable-track {
		background: none;
		height: 2px;
		background: ${active};
	}
	.settings-panel-field--range:hover .settings-panel-range::-webkit-slider-runnable-track,
	.settings-panel-range:focus::-webkit-slider-runnable-track {
		/* background: ${active}; */
	}
	.settings-panel-range::-moz-range-track {
		background: none;
		height: 2px;
		background: ${active};
	}
	.settings-panel-field--range:hover .settings-panel-range::-moz-range-track,
	.settings-panel-range:focus::-moz-range-track {
		/* background: ${active}; */
	}

	.settings-panel-range::-ms-track {
		height: 2px;
		color: transparent;
		border: none;
		outline: none;
	}
	.settings-panel-range::-ms-fill-lower {
		background: ${active};
	}
	.settings-panel-range::-ms-fill-upper {
		background: ${alpha(active, .25)};
	}

	@supports (--css: variables) {
		.settings-panel-range {
			--active: ${active};
			--bg: ${alpha(active, .25)};
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
			--bg: ${alpha(active, .25)};
			--active: ${active};
		}
	}

	.settings-panel-range::-webkit-slider-thumb {
		background: ${active};
		height: ${h/2}em;
		width: ${h/2}em;
		border-radius: ${h/2}em;
		margin-top: -${h/4}em;
		border: 0;
		position: relative;
		top: 1px;
		-webkit-appearance: none;
		appearance: none;
		transition: .05s ease-in transform;
		transform: scale(1, 1);
		transform-origin: center center;
	}
	.settings-panel-range:focus::-webkit-slider-thumb,
	.settings-panel-range::-webkit-slider-thumb:hover {
		box-shadow: 0 0 0 0;
		transform: scale(1.2, 1.2);
	}
	.settings-panel-range[value="0"]::-webkit-slider-thumb {
		background: ${white};
		box-shadow: inset 0 0 0 1.5px ${active};
	}
	.settings-panel-range::-moz-range-thumb {
		background: ${active};
		height: ${h/2}em;
		width: ${h/2}em;
		border-radius: ${h/2}em;
		margin-top: -${h/4}em;
		border: 0;
		position: relative;
		top: 1px;
		-moz-appearance: none;
		appearance: none;
		transition: .05s ease-in transform;
		transform: scale(1, 1);
		transform-origin: center center;
	}
	.settings-panel-range:focus::-moz-range-thumb,
	.settings-panel-range::-moz-range-thumb:hover {
		box-shadow: 0 0 0 0;
		transform: scale(1.2, 1.2);
	}
	.settings-panel-range[value="0"]::-moz-range-thumb {
		background: ${white};
		box-shadow: inset 0 0 0 1.5px ${active};
	}
	.settings-panel-range::-ms-thumb {
		background: ${active};
		height: ${h/2}em;
		width: ${h/2}em;
		border-radius: ${h/2}em;
		border: 0;
		position: relative;
		top: 1px;
		appearance: none;
		transition: .05s ease-in transform;
		transform: scale(1, 1);
		transform-origin: center center;
	}
	.settings-panel-range:focus::-ms-thumb,
	.settings-panel-range::-ms-thumb:hover {
		box-shadow: 0 0 0 0;
		transform: scale(1.2, 1.2);
	}
	.settings-panel-range[value="0"]::-ms-thumb {
		background: ${white};
		box-shadow: inset 0 0 0 1.5px ${active};
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
		background: ${alpha(active, .25)};
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
		background: ${active};
	}
	.settings-panel-field--interval:hover .settings-panel-interval:after {
		background: ${alpha(active, .25)};
	}
	.settings-panel-field--interval:hover .settings-panel-interval-handle {
		background: ${active};
	}
	.settings-panel-field--interval:hover .settings-panel-value {
		color: ${black};
		font-weight: 500;
	}
	.settings-panel-interval-handle:after,
	.settings-panel-interval-handle:before {
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
		transform: scale(1, 1);
		transform-origin: center center;
		transition: .05s ease-in transform;
	}
	.settings-panel-interval-handle:before {
		left: -${h/4}em;
		right: auto;
	}
	.settings-panel-interval-dragging .settings-panel-interval-handle:after,
	.settings-panel-interval-dragging .settings-panel-interval-handle:before,
	.settings-panel-interval:hover .settings-panel-interval-handle:after,
	.settings-panel-interval:hover .settings-panel-interval-handle:before {
		transform: scale(1.2, 1.2);
	}


	/** Values */
	.settings-panel-value {
		color: ${tone(.5)};
		font-weight: 500;
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
		font-weight: 500;
		padding-right: 2em;
		margin-right: -1em;
		color: ${active};
		background: ${white};
		line-height: ${h}em;
		box-shadow: 0 1px ${alpha(tone(.7), .25)};
		width: auto;
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
		border-top: .3em solid ${active};
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
		display: inline-block;
		color: ${tone(.5)};
		position: relative;
		margin-right: ${h}em;
		/* margin-bottom: ${h/2}em; */
	}
	.settings-panel-checkbox-label:before {
		/*content: '✓';*/
		font-family: "Material Icons";
		content: '';
		font-weight: bolder;
		color: ${alpha(white, 0)};
		display: block;
		float: left;
		width: ${h*.5}em;
		height: ${h*.5}em;
		border-radius: .5px;
		position: relative;
		margin-right: ${h/3}em;
		margin-left: 2px;
		box-shadow: 0 0 0 2px ${alpha(tone(.5), .9)};
		line-height: ${h/2}em;
		margin-top: 1px;
		text-align: center;
	}
	.settings-panel-checkbox-label:hover:before {
		box-shadow: 0 0 0 2px ${tone(.5)};
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label {
		color: ${active};
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label:before {
		box-shadow: 0 0 0 2px ${active};
		background: ${active};
		color: ${tone(1)};
	}
	.settings-panel-checkbox-label:after {
		content: '';
		z-index: 1;
		position: absolute;
		width: ${h*1.5}em;
		height: ${h*1.5}em;
		background: ${tone(.55)};
		border-radius: ${h}em;
		top: -${h*.45}em;
		left: -${h*.5}em;
		opacity: 0;
		margin-left: 2px;
		transform-origin: center center;
		transform: scale(.5, .5);
		transition: .1s ease-out;
	}
	.settings-panel-checkbox-label:active:after {
		transform: scale(1, 1);
		opacity: .08;
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label:after {
		background: ${active};
	}


	/** Color */
	.settings-panel-color {
		height: ${h*.5}em;
		width: ${h*.5}em;
		display: inline-block;
		vertical-align: baseline;
	}
	.settings-panel-color-value {
		border: none;
		font-family: inherit;
		border-radius: 0;
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
		text-transform: uppercase;
		color: ${tone(.5)};
		font-weight: 500;
		background: none;
		width: auto;
		padding: ${h/3}em ${h/3}em;
		min-width: ${h*3}em;
		margin-top: -${h/4}em;
		margin-bottom: -${h/4}em;
	}
	.settings-panel-button:focus {
		outline: none;
	}
	.settings-panel-button:hover {
		background: ${alpha(tone(.5), .08)};
	}
	.settings-panel-button:active {
		background: ${alpha(tone(.5), .333)};
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
		margin-right: ${h*.75}em;
		z-index: 2;
		text-align: center;
		padding: 0 0;
		color: ${tone(.5)};
	}
	.settings-panel-switch-input:checked + .settings-panel-switch-label {
		color: ${active};
	}
	.settings-panel-switch-input + .settings-panel-switch-label:hover {
	}
	.settings-panel-switch-label:hover {
		color: ${tone(.5)};
	}
	.settings-panel-switch-label:active {
		color: ${tone(.5)};
	}
	.settings-panel-switch-label:after {
		content: '';
		z-index: 1;
		position: absolute;
		width: ${h*2}em;
		height: ${h*2}em;
		min-width: 100%;
		min-height: 100%;
		background: ${tone(.55)};
		border-radius: ${h}em;
		top: 50%;
		left: 50%;
		margin-left: -${h}em;
		margin-top: -${h}em;
		opacity: 0;
		transform-origin: center center;
		transform: scale(.5, .5);
		transition: .1s ease-out;
	}
	.settings-panel-switch-label:active:after {
		transform: scale(1, 1);
		opacity: .08;
	}
	.settings-panel-checkbox:checked + .settings-panel-switch-label:after {
		background: ${active};
	}

	/** Decorations */
	::-webkit-input-placeholder {
		color: ${alpha(active, .5)};
	}
	::-moz-placeholder {
		color: ${alpha(active, .5)};
	}
	:-ms-input-placeholder {
		color: ${alpha(active, .5)};
	}
	:-moz-placeholder {
		color: ${alpha(active, .5)};
	}
	::-moz-selection {
		background: ${active};
		color: ${white};
	}
	::selection {
		background: ${active};
		color: ${white};
	}
	:host hr {
		opacity: 1;
		border-bottom: 1px solid ${alpha(tone(.7), .25)};
		margin-left: -${h*.666}em;
		margin-right: -${h*.666}em;
		margin-top: ${h*.75}em;
	}
	:host a {
	}
	:host a:hover {
	}
`};


function alpha (c, value) {
	return color(c).setAlpha(value).toString();
}
