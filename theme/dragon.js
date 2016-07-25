/**
 * @module prama/theme/dragon
 *
 * Midragonlistic theme based off https://dribbble.com/guidorosso NIMA editor settings
 */
const px = require('add-px-to-style');
const fonts = require('google-fonts');
const color = require('tinycolor2');
const scopeCss = require('scope-css');
const lerp = require('interpolation-arrays');
const none = require('./none');

module.exports = dragon;

fonts.add({
	'Roboto': 400
});

dragon.palette = [
	'#fff',
	'#999',
	'#222',
	'#131522'
];

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

	let white = color(pick(0)).toString();
	let light = color(pick(.25)).toString();
	let notSoLight = color(pick(.333)).toString();
	let gray = color(pick(.618)).toString();
	let notSoDark = color(pick(.675)).toString();
	let dark = color(pick(.75)).toString();
	let black = color(pick(1)).toString();

	return none({
		fontSize: fontSize,
		fontFamily: font,
		inputHeight: h,
		labelWidth: labelWidth,
		palette: palette
	}) + `
	:host {
		color: ${light};
		background: ${alpha(gray, .93)};
		font-size: ${px('font-size', fontSize)};
		font-family: ${font};
	}

	.settings-panel-title {
		text-transform: none;
		font-size: 1.1em;
		font-weight: bold;
		min-height: ${h}em;
		line-height: ${h}em;
		letter-spacing: .05ex;
		color: ${white};
		padding: 0 ${h/8}em 0;
	}

	/** Select style */
	.settings-panel-select {
		height: 20px;
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
		border: none;
		height: 20px;
		padding: 0;
		background: none;
		color: ${white};
		width: 100%;
		box-shadow: 0 2px ${dark};
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
		height: 14px;
		width: 14px;
		top: 0;
		bottom: 0;
		margin-top: auto;
		margin-bottom: auto;
	}
	.settings-panel-color-value {
		border: none;
		background: none;
		height: 20px;
		color: ${white};
		box-shadow: 0 2px ${dark};
		padding-left: 20px;
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
	}
	.settings-panel-switch-input {
		display: none;
	}
	.settings-panel-switch-label {
		cursor: pointer;
		min-height: ${h}em;
		padding: 0 ${h/2}em;
		margin: 0 2px 2px 0;
		line-height: ${h}em;
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
	.settings-panel-checkbox {
		display: none;
	}
	.settings-panel-checkbox-label {
		position: relative;
		display: inline-block;
		margin-left: -2px;
		margin-top: 0;
		width: 40px;
		height: 20px;
		line-height: 20px;
		border-radius: 20px;
		margin-bottom: 0;
		background: ${dark};
	}
	.settings-panel-field--checkbox:hover .settings-panel-checkbox-label {
		background: ${black};
	}
	.settings-panel-checkbox-label:after {
		content: '';
		position: absolute;
		border-radius: 20px;
		width: 16px;
		height: 16px;
		top: 2px;
		left: 2px;
		background: ${notSoLight};
		transition: .1s;
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label:after {
		left: 22px;
		background: ${white};
	}

	/** Button */
	.settings-panel-button {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		border: none;
		outline: none;
		padding: 4px;
		min-height: 20px;
		color: ${white};
		border-radius: 20px;
		background: none;
		text-transform: uppercase;
		font-size: .95em;
		letter-spacing: .1ex;
		box-shadow: 0 0 0 2px ${light};
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
	}
	.settings-panel-field--range:hover .settings-panel-range,
	.settings-panel-range:focus {
		color: ${black};
		outline: none;
	}
	.settings-panel-range::-webkit-slider-runnable-track {
		background: none;
		height: 2px;
	}
	.settings-panel-range::-moz-range-track {
		background: none;
		height: 2px;
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

	.settings-panel-range::-ms-fill-lower {
		background: ${white};
	}
	.settings-panel-range::-ms-fill-upper {
		background: ${black};
	}

	.settings-panel-range::-webkit-slider-thumb {
		background: ${notSoLight};
		height: 10px;
		width: 10px;
		border-radius: 10px;
		margin-top: -4px;
		border: 0;
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
		height: 10px;
		width: 10px;
		border-radius: 10px;
		margin-top: -4px;
		border: 0;
		-webkit-appearance: none;
		-moz-appearance: none;
	}
	.settings-panel-range:focus::-moz-range-thumb,
	.settings-panel-range:hover::-moz-range-thumb,
	.settings-panel-field--range:hover .settings-panel-range::-moz-range-thumb {
		background: ${white};
	}
	.settings-panel-range::-ms-thumb {
		background: ${gray};
		height: ${h*.75}em;
		width: ${h/3}em;
		margin-top: -${h*.375}em;
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
		background: ${light};
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
		right: -5px;
		top: 0;
		bottom: 0;
		margin: auto;
		height: 10px;
		width: 10px;
		border-radius: 10px;
		background: inherit;
	}
	.settings-panel-interval-handle:before {
		content: '';
		position: absolute;
		left: -5px;
		top: 0;
		bottom: 0;
		margin: auto;
		height: 10px;
		width: 10px;
		border-radius: 10px;
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
		opacity: .5;
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


function alpha (c, value) {
	return color(c).setAlpha(value).toString();
}

}

