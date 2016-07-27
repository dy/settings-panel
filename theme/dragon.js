/**
 * @module prama/theme/dragon
 *
 * Midragonlistic theme based off https://dribbble.com/guidorosso NIMA editor settings
 */
const px = require('add-px-to-style');
const fonts = require('google-fonts');
const color = require('tinycolor2');
const lerp = require('interpolation-arrays');
const none = require('./none');

module.exports = dragon;

fonts.add({
	'Roboto': 400
});

dragon.palette = ['#1b1b1b', '#f7f7f7'];

dragon.fontSize = '12px';
dragon.fontFamily = '"Roboto", sans-serif';
dragon.labelWidth = '33.3%';
dragon.inputHeight = 2;

function dragon (opts) {
	opts = opts || {};

	let h = opts.inputHeight || dragon.inputHeight;
	let labelWidth = opts.labelWidth || dragon.labelWidth;
	let fontSize = opts.fontSize || dragon.fontSize;
	let font = opts.fontFamily || dragon.fontFamily;

	let palette = (opts.palette || dragon.palette).map(v => color(v).toRgb());
	let pick = lerp(palette);

	let white = color(pick(1)).toString();
	let light = color(pick(.6)).toString();
	let notSoLight = color(pick(.5)).toString();
	let gray = color(pick(.13)).toString();
	let dark = color(pick(.07)).toString();
	let black = color(pick(0)).toString();

	return none({
		fontSize: fontSize,
		fontFamily: font,
		inputHeight: h,
		labelWidth: labelWidth,
		palette: [white, black]
	}) + `
	:host {
		color: ${light};
		background: ${alpha(gray, .93)};
		font-size: ${px('font-size', fontSize)};
		font-family: ${font};
		padding: ${h*.75}em;
	}

	.settings-panel-title {
		text-transform: none;
		font-size: 1.333em;
		font-weight: bold;
		letter-spacing: .05ex;
		min-height: ${h}em;
		color: ${white};
		padding: ${h/3}em ${h/8}em ${h/2}em;
	}

	/** Select style */
	.settings-panel-select {
		height: ${h}em;
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
		border-radius: 0;
		box-shadow: 0 2px ${dark};
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
	.settings-panel-field--select:hover .settings-panel-select,
	.settings-panel-select:focus {
		box-shadow: 0 2px ${black};
	}

	/** Values */
	.settings-panel-value {
		color: ${white};
	}
	.settings-panel-value:hover,
	.settings-panel-value:focus {
		color: ${white};
	}

	/** Text */
	.settings-panel-text,
	.settings-panel-textarea {
		-webkit-appearance: none;
		-moz-appearance: none;
		-o-appearance:none;
		border: none;
		height: ${h}em;
		padding: 0;
		background: none;
		color: ${white};
		width: 100%;
		border-radius: 0;
		box-shadow: 0 2px ${dark};
	}
	.settings-panel-textarea {
		padding-top: .35em;
		padding-left: 0;
	}

	.settings-panel-text:focus,
	.settings-panel-textarea:focus,
	.settings-panel-text:hover,
	.settings-panel-textarea:hover {
		outline: none;
		color: ${white};
		box-shadow: 0 2px ${black};
	}

	/** Color */
	.settings-panel-color {
		height: ${h*.7}em;
		width: ${h*.7}em;
		top: 0;
		bottom: 0;
		margin-top: auto;
		margin-bottom: auto;
	}
	.settings-panel-color-value {
		-webkit-appearance: none;
		-moz-appearance: none;
		-o-appearance:none;
		border: none;
		background: none;
		height: ${h}em;
		color: ${white};
		box-shadow: 0 2px ${dark};
		padding-left: ${h}em;
		width: 100%;
	}
	.settings-panel-color-value:hover,
	.settings-panel-color-value:focus {
		outline: none;
		color: ${white};
		box-shadow: 0 2px ${black};
	}


	/** Switch style */
	.settings-panel-switch {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		margin-left: -2px;
	}
	.settings-panel-switch-input {
		display: none;
	}
	.settings-panel-switch-label {
		cursor: pointer;
		min-height: ${h}em;
		padding: 0 ${h/2}em;
		margin: 0 2px 2px 0;
		line-height: ${h*.999}em;
		color: ${light};
		border-radius: ${h}em;
	}
	.settings-panel-switch-label:hover {
		color: ${white};
	}
	.settings-panel-switch-label:last-child {
		margin-right: 0;
	}
	.settings-panel-switch-input:checked + .settings-panel-switch-label {
		color: ${white};
		box-shadow: 0 0 0 2px ${notSoLight};
	}
	.settings-panel-switch-input:checked + .settings-panel-switch-label:hover {
		box-shadow: 0 0 0 2px ${white};
	}


	/** Checkbox */
	.settings-panel-checkbox {
		display: none;
	}
	.settings-panel-checkbox-label {
		position: relative;
		display: inline-block;
		margin-left: -2px;
		margin-top: 0;
		width: ${h*1.8}em;
		height: ${h*.9}em;
		line-height: ${h*.9}em;
		border-radius: ${h}em;
		margin-bottom: 0;
		background: ${dark};
	}
	.settings-panel-field--checkbox:hover .settings-panel-checkbox-label {
		background: ${black};
	}
	.settings-panel-checkbox-label:after {
		content: '';
		position: absolute;
		border-radius: ${h}em;
		width: ${h*.65}em;
		height: ${h*.65}em;
		top: ${h*.125}em;
		left: ${h*.125}em;
		background: ${notSoLight};
		transition: .1s ease-in;
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label:after {
		left: ${h*1.025}em;
		background: ${white};
	}


	/** Button */
	.settings-panel-button {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		border: none;
		outline: none;
		padding: ${h*.25}em;
		min-height: ${h}em;
		line-height: ${h}em;
		color: ${white};
		border-radius: ${h}em;
		background: none;
		text-transform: uppercase;
		font-size: .95em;
		letter-spacing: .1ex;
		box-shadow: inset 0 0 0 2px ${notSoLight};
	}
	.settings-panel-button:hover {
		color: ${white};
		box-shadow: 0 0 0 2px ${white};
	}
	.settings-panel-button:active {
		color: ${white};
	}


	/** Sliders */
	.settings-panel-range {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background: none;
		color: ${dark};
		border: 0;
	}
	.settings-panel-field--range:hover .settings-panel-range,
	.settings-panel-range:focus {
		color: ${black};
		outline: none;
	}
	.settings-panel-range::-webkit-slider-runnable-track {
		background: none;
		height: 2px;
		background: ${dark};
	}
	.settings-panel-field--range:hover .settings-panel-range::-webkit-slider-runnable-track,
	.settings-panel-range:focus::-webkit-slider-runnable-track {
		/**background: ${black};*/
	}
	.settings-panel-range::-moz-range-track {
		background: none;
		height: 2px;
		color: transparent;
		border: none;
		outline: none;
		background: ${dark};
	}
	.settings-panel-field--range:hover .settings-panel-range::-moz-range-track,
	.settings-panel-range:focus::-moz-range-track {
		background: ${black};
	}
	.settings-panel-range::-moz-range-progress {
		background: ${notSoLight};
	}
	.settings-panel-field--range:hover .settings-panel-range::-moz-range-progress,
	.settings-panel-range:focus::-moz-range-progress {
		background: ${white};
	}
	.settings-panel-range::-ms-track {
		height: 2px;
		color: transparent;
		border: none;
		outline: none;
	}
	.settings-panel-range::-ms-fill-lower {
		background: ${notSoLight};
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
			--active: ${notSoLight};
			--bg: ${dark};
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
			--bg: ${black};
			--active: ${white};
		}
	}

	.settings-panel-range::-webkit-slider-thumb {
		background: ${notSoLight};
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
		background: ${white};
	}
	.settings-panel-range::-moz-range-thumb {
		background: ${notSoLight};
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
		background: ${notSoLight};
		width: ${h/2}em;
		height: ${h/2}em;
		border-radius: ${h/2}em;
		cursor: pointer;
	}
	.settings-panel-range:focus::-ms-thumb,
	.settings-panel-range:hover::-ms-thumb,
	.settings-panel-field--range:hover .settings-panel-range::-ms-thumb {
		background: ${white};
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

	.settings-panel-field--color + .settings-panel-field--range,
	.settings-panel-field--color + .settings-panel-field--interval,
	.settings-panel-field--textarea + .settings-panel-field--range,
	.settings-panel-field--textarea + .settings-panel-field--interval,
	.settings-panel-field--text + .settings-panel-field--interval,
	.settings-panel-field--text + .settings-panel-field--range {
		margin-top: ${h/2.5}em;
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
		background: ${dark};
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
		background: ${notSoLight};
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


	/** Decorations */
	:host hr {
		border: none;
		height: 0;
		margin: ${h*.75}em 0;
		opacity: .333;
		border-bottom: 1px dotted ${notSoLight};
	}
	::-webkit-input-placeholder {
		color: ${notSoLight};
	}
	::-moz-placeholder {
		color: ${notSoLight};
	}
	:-ms-input-placeholder {
		color: ${notSoLight};
	}
	:-moz-placeholder {
		color: ${notSoLight};
	}

	::-moz-selection {
		color: ${white};
		background: ${gray};
	}
	::selection {
		color: ${white};
		background: ${gray};
	}
	.settings-panel-field--disabled {
		opacity: .333;
		pointer-events: none;
	}
`;


}


function alpha (c, value) {
	return color(c).setAlpha(value).toString();
}
