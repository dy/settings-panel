/**
 * @module  settings-panel/theme/typer
 *
 * White theme
 */


const px = require('add-px-to-style');
const fonts = require('google-fonts');
const color = require('tinycolor2');
const scopeCss = require('scope-css');
const lerp = require('interpolation-arrays');
const none = require('./none');


module.exports = typer;

typer.palette = ['#4B4E59', '#BCC1C7' ,'#F1F1F3'];

typer.fontSize = '12px';
typer.fontFamily = '"Open Sans", sans-serif';
typer.labelWidth = '9em';
typer.inputHeight = 2;

fonts.add({
	'Space Mono': true
});


function typer (opts) {
	opts = opts || {};

	let h = opts.inputHeight || typer.inputHeight;
	let labelWidth = opts.labelWidth || typer.labelWidth;
	let fontSize = opts.fontSize || typer.fontSize;
	let font = opts.fontFamily || typer.fontFamily;

	let palette = (opts.palette || typer.palette).map(v => color(v).toRgb());
	let pick = lerp(palette);

	let white = tone(1);
	let light = tone(.75);
	let gray = tone(.5);
	let dark = tone(.25);
	let black = tone(0);

	function tone (amt) {
		return color(pick(amt)).toString();
	}

	return none({
		fontSize: fontSize,
		fontFamily: font,
		inputHeight: h,
		labelWidth: labelWidth,
		palette: [light, black]
	}) + `
		:host {
			box-shadow: 0 0 0 1px ${black};
			text-shadow: 0 1px ${white};
		}

		.settings-panel-title {
			font-size: 1.25em;
			text-align: left;
			padding-bottom: ${h/2}em;
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
			background-color: ${light};
			background-image: linear-gradient(to bottom, ${tone(.75 + .15)}, ${tone(.75 - .15)});
			box-shadow: 0 1px 2px ${dark}, inset 1px 1px ${white};
		}
		.settings-panel-switch-input:checked + .settings-panel-switch-label {
			background: ${black};
			color: ${white};
			text-shadow: 0 1px 1px ${black};
			box-shadow: 0 1px 0 ${white};
		}

		.settings-panel-switch-input:first-child + .settings-panel-switch-label {
			border-top-left-radius: 3px;
			border-bottom-left-radius: 3px;
		}
		.settings-panel-switch-label:last-child {
			border-top-right-radius: 3px;
			border-bottom-right-radius: 3px;
		}

		.settings-panel-switch-input + .settings-panel-switch-label:hover {
			color: ${dark};
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
		height: .5em;
		border-radius: .5em;
		box-shadow: 0 1px ${white}, inset 0 1px 3px ${black};
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
		background: ${gray};
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
		background: ${gray};
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
			--active: ${gray};
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
		background-color: ${gray};
		background-image: linear-gradient(to bottom, ${tone(.75 - .15)}, ${tone(.75 + .15)});
		box-shadow: inset 0 1px ${white}, 0 1px 1px 1px ${dark};
		height: ${h*.8}em;
		width: ${h*.8}em;
		border-radius: ${h*.8}em;
		margin-top: -${h*.4}em;
		border: 0;
		position: relative;
		top: .25em;
		-webkit-appearance: none;
		appearance: none;
	}
	.settings-panel-range:focus::-webkit-slider-thumb,
	.settings-panel-range:hover::-webkit-slider-thumb,
	.settings-panel-field--range:hover .settings-panel-range::-webkit-slider-thumb {
		background: ${white};
	}
	.settings-panel-range::-moz-range-thumb {
		background: ${gray};
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
		background: ${gray};
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
		background: ${gray};
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
		height: ${h*.75}em;
		width: ${h*.75}em;
		border-radius: ${h}em;
		background-image: linear-gradient(to bottom, ${tone(.75 - .15)}, ${tone(.75 + .15)});
		box-shadow: inset 0 1px ${white}, 0 1px 1px 1px ${dark};
	}
	.settings-panel-interval-handle:before {
		content: '';
		position: absolute;
		left: -${h/4}em;
		top: 0;
		bottom: 0;
		margin: auto;
		height: ${h * .75}em;
		width: ${h * .75}em;
		border-radius: ${h/2}em;
		background-image: linear-gradient(to bottom, ${tone(.75 - .15)}, ${tone(.75 + .15)});
		box-shadow: inset 0 1px ${white}, 0 1px 1px 1px ${dark};
	}

	.settings-panel-interval-dragging .settings-panel-interval-handle {
		background: ${white};
	}


		/** Button */
		.settings-panel-button {
			color: ${black};
			background: ${light};
			text-align: center;
			border: none;
			border-radius: 3px;
			background-color: ${light};
			background-image: linear-gradient(to bottom, ${tone(.75 + .15)}, ${tone(.75 - .15)});
			box-shadow: 0 1px 2px ${dark}, inset 1px 1px ${white};
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
		color: ${dark};
		background: ${white};
		width: 100%;
		border-radius: 3px;
		box-shadow: inset 0 1px 3px ${dark};
		padding-left: .4em;
	}
	.settings-panel-textarea {
		padding-top: .35em;
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


	/** Select */
	.settings-panel-select {
		background-color: ${tone(.75)};
		background-image: linear-gradient(to bottom, ${tone(.85 + .15)}, ${tone(.85 - .15)});
		border-radius: 3px;
		color: inherit;
		padding-left: ${h/4}em;
		outline: none;
		border: none;
		box-shadow: 0 1px 2px ${dark}, inset 1px 1px ${white};
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


		/** Decorations */
		:host hr {
			border: none;
			height: 0;
			margin: ${h*.75}em 0;
			border-top: 2px solid ${gray};
			border-bottom: 1px solid ${white};
		}
	`;
};