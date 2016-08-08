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

// typer.palette = ['#4B4E59', '#BCC1C7' ,'#F1F1F3'];
// typer.palette = ['#32393F', '#3F4851', '#49565F', '#ADB7C0', '#F4FBFF'];
typer.palette = ['#111', '#eee'];
// typer.palette = ['black', 'white'];

typer.fontSize = '12px';
typer.fontFamily = '"Montserrat", sans-serif';
typer.labelWidth = '9em';
typer.inputHeight = 2;

//color balance
typer.bg = .95;
typer.active = .05;

fonts.add({
	'Montserrat': [400, 600]
});


function typer (opts) {
	opts = opts || {};

	let h = opts.inputHeight || typer.inputHeight;
	let labelWidth = opts.labelWidth || typer.labelWidth;
	let fontSize = opts.fontSize || typer.fontSize;
	let font = opts.fontFamily || typer.fontFamily;

	let palette = (opts.palette || typer.palette).map(v => color(v).toRgb());
	let pick = lerp(palette);

	//obtain palette sorted by brightnes
	let nPalette = palette.slice().sort((a, b) => color(a).getLuminance() - color(b).getLuminance());
	let npick = lerp(nPalette);

	//the color of light/shadow to mix
	let light = color.mix('white', nPalette[nPalette.length - 1], 25).toString();
	let shadow = color.mix('black', nPalette[0], 25).toString();

	//background/active tones
	let bg = typer.bg;
	let active = typer.active;

	//helpers
	function tone (amt) {
		if (typeof amt === 'number') {
			amt = Math.max(Math.min(amt, 1), 0);
			return color(pick(amt)).toString();
		}
		return amt;
	}
	function ntone (amt) {
		if (typeof amt === 'number') {
			amt = Math.max(Math.min(amt, 1), 0);
			return color(npick(amt)).toString();
		}
		return amt;
	}
	function lighten (v, amt, t = tone) {
		return color(t(v)).lighten(amt*100);
	}
	function darken (v, amt, t = tone) {
		return color(t(v)).darken(amt*100);
	}
	function alpha (c, value) {
		return color(c).setAlpha(value).toString();
	}

	let inversed = color(palette[0]).getLuminance() > color(palette[palette.length - 1]).getLuminance();


	let pop = (v = .9, d = .05, t = tone) => `
		${text(active, v)}
		background-color: ${t(v)};
		background-image: linear-gradient(to bottom, ${lighten(v, d, t)}, ${darken(v, d, t)});
		box-shadow: inset 1px 0px ${alpha(light, .04)}, inset 0px 1px ${alpha(light, .15)}, inset 0px -1px 1px ${alpha(light, .07)}, 0 1px 1px ${alpha(shadow, .35)};
	`;
	let push = (v = .1, d = .05, t = tone) => `
		background: ${t(v)};
		/*background-image: linear-gradient(to bottom, ${darken(v, d, t)}, ${lighten(v, d, t)});*/
		box-shadow: inset 0 1px 2px ${alpha(shadow, .15)}, 0 1px ${alpha(light, .17)};
		color: ${t(1 - active)};
		text-shadow: none;
	`;
	let text = (v, bg) => color(tone(v)).getLuminance() > color(tone(bg)).getLuminance() ? `
		color: ${tone(v)};
		background: ${tone(bg)};
		text-shadow: 0 -1px ${color.mix(tone(bg), shadow, 50)};
	` : `
		color: ${tone(v)};
		background: ${tone(bg)};
		text-shadow: 0 1px ${color.mix(tone(bg), light, 50)};
	`;

	return none({
		fontSize: fontSize,
		fontFamily: font,
		inputHeight: h,
		labelWidth: labelWidth,
		palette: [tone(active), tone(bg)]
	}) + `
		:host {
			${text(.25, bg)};
			box-shadow: inset 0 1px ${alpha(light, .15)}, 0 4px 14px -3px ${shadow};
			border-radius: 5px;
			padding: ${h/2}em;
		}

		.settings-panel-title {
			font-size: 1.5em;
			margin: ${h*1/8}em ${h/12}em ${h*3/8}em;
			min-height: ${h/1.5}em;
			text-align: left;
			font-weight: 400;
			padding: 0;
		}

		.settings-panel-field:hover .settings-panel-label {
			color: ${tone(active)};
		}



	/** Values */
	.settings-panel-value {
	}
	.settings-panel-value:first-child {
	}
	.settings-panel-value:hover,
	.settings-panel-value:focus {
	}



	/** Sliders */
	.settings-panel-range {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background: none;
		border: 0;
	}
	.settings-panel-field--range:hover .settings-panel-range,
	.settings-panel-range:focus {
		outline: none;
	}
	.settings-panel-range::-webkit-slider-runnable-track {
		height: .5em;
		border-radius: .5em;
		${push(active, .05)}
	}
	.settings-panel-range::-moz-range-track {
		height: .5em;
		border-radius: .5em;
		${push(active, .05)}
	}
	.settings-panel-range::-ms-track {
		${push(active, .05)}
		outline: none;
		color: transparent;
		border: none;
		height: .5em;
		border-radius: .5em;
	}
	.settings-panel-range::-ms-fill-lower {
		border-radius: .5em;
		${push(active, .05)}
	}
	.settings-panel-range::-ms-fill-upper {
		border-radius: .5em;
		${push(bg*.9, .05)}
	}

	@supports (--css: variables) {
		.settings-panel-range {
			width: 100%;
			--active: ${tone(active)};
			--bg: ${tone(bg*.9)};
			--track-background: linear-gradient(to right, var(--active) 0, var(--active) var(--value), var(--bg) 0) no-repeat;
		}
		.settings-panel-range::-webkit-slider-runnable-track {
			background: var(--track-background);
		}
		.settings-panel-range::-moz-range-track {
			background: var(--track-background);
		}
		.settings-panel-field--range .settings-panel-input {
			margin-right: ${h}em;
		}
		.settings-panel-field--range:hover .settings-panel-range,
		.settings-panel-range:focus {
			--bg: ${tone(bg*.9 -.07)};
		}
		.settings-panel-range-value {
			display: none;
			position: absolute;
			top: -${h*1.25}em;
			text-align: center;
			padding: 0;
			color: ${tone(bg)};
			background: ${tone(active)};
			box-shadow: 0 1px 5px -1px ${alpha(shadow, .5)};
			border-radius: 3px;
			z-index: 3;
			margin-left: ${-h*.65}em;
			width: ${h*2}em;
			text-shadow: none;
			left: calc(var(--value) - var(--coef) * ${h*.8}em);
		}
		.settings-panel-field--range .settings-panel-value-tip {
			position: absolute;
			height: 0;
			top: -${h*.25}em;
			left: calc(var(--value) - var(--coef) * ${h*.8}em);
			margin-left: ${h*.1}em;
			display: none;
			z-index: 3;
			border-top: ${h*.3}em solid ${tone(active)};
			border-left: ${h*.3}em solid transparent;
			border-right: ${h*.3}em solid transparent;
			border-bottom: none;
		}
		.settings-panel-input:before {
			border-top: ${h*.3}em solid ${alpha(shadow, .25)};
		}
		.settings-panel-field--range:hover .settings-panel-value-tip,
		.settings-panel-range:focus ~ .settings-panel-value-tip {
			display: block;
		}
		.settings-panel-field--range:hover .settings-panel-value,
		.settings-panel-range:focus ~ .settings-panel-value {
			display: block;
		}
	}

	.settings-panel-range::-webkit-slider-thumb {
		${pop(active, -.05)};
		height: ${h*.8}em;
		width: ${h*.8}em;
		border-radius: ${h*.8}em;
		margin-top: -${h*.4}em;
		border: 0;
		position: relative;
		top: .25em;
		-webkit-appearance: none;
		appearance: none;
		z-index: 3;
	}
	.settings-panel-range:focus::-webkit-slider-thumb,
	.settings-panel-range:hover::-webkit-slider-thumb,
	.settings-panel-field--range:hover .settings-panel-range::-webkit-slider-thumb {
	}
	.settings-panel-range::-webkit-slider-thumb:active {
	}

	.settings-panel-range::-moz-range-thumb {
		${pop(active, -.05)};
		height: ${h*.8}em;
		width: ${h*.8}em;
		border-radius: ${h*.8}em;
		margin-top: -${h*.4}em;
		border: 0;
		position: relative;
		top: .25em;
		-moz-appearance: none;
		appearance: none;
		z-index: 3;
	}
	.settings-panel-range:focus::-moz-range-thumb,
	.settings-panel-range::-moz-range-thumb:hover,
	.settings-panel-field--range:hover .settings-panel-range::-moz-range-thumb {
	}
	.settings-panel-range::-moz-range-thumb:active {
	}

	.settings-panel-range::-ms-thumb {
		${pop(active, -.05)};
		height: ${h*.8}em;
		width: ${h*.8}em;
		border-radius: ${h*.8}em;
		border: 0;
		position: relative;
		top: .25em;
		-ms-appearance: none;
		appearance: none;
		z-index: 3;
	}
	.settings-panel-range:focus::-ms-thumb,
	.settings-panel-range:hover::-ms-thumb,
	.settings-panel-field--range:hover .settings-panel-range::-ms-thumb {
	}
	.settings-panel-range::-ms-thumb:active {
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
		height: .5em;
		border-radius: .5em;
		margin-top: auto;
		margin-bottom: auto;
		${push(bg*.9, .05)}
		background: ${tone(bg*.9)};
	}
	.settings-panel-field--interval:hover .settings-panel-interval:after,
	.settings-panel-interval-dragging .settings-panel-interval:after {
		background: ${tone(bg*.9 -.07)};
	}
	.settings-panel-interval-handle {
		position: absolute;
		z-index: 1;
		top: 0;
		height: .5em;
		bottom: 0;
		margin-top: auto;
		margin-bottom: auto;
		background: ${tone(active)};
	}
	.settings-panel-interval-handle:after,
	.settings-panel-interval-handle:before {
		content: '';
		position: absolute;
		right: -${h*.4}em;
		top: 0;
		bottom: 0;
		margin: auto;
		height: ${h*.8}em;
		width: ${h*.8}em;
		border-radius: ${h*.8}em;
		${pop(active, -.05)};
	}
	.settings-panel-interval-handle:before {
		left: -${h*.4}em;
		right: auto;
	}

	.settings-panel-field--interval:hover .settings-panel-interval-handle:after,
	.settings-panel-field--interval:hover .settings-panel-interval-handle:before,
	.settings-panel-interval-dragging .settings-panel-interval-handle:after,
	.settings-panel-interval-dragging .settings-panel-interval-handle:before {
		${pop(active, -.05)};
	}

	@supports (--css: variables) {
		.settings-panel-interval {
			width: 100%;
		}

		.settings-panel-interval-value {
			position: absolute;
			top: -${h*1.25}em;
			text-align: center;
			padding: 0;
			display: none;
			color: ${tone(bg)};
			background: ${tone(active)};
			box-shadow: 0 1px 5px -1px ${alpha(shadow, .5)};
			border-radius: 3px;
			z-index: 3;
			margin-left: ${-h}em;
			width: ${h*2}em;
			text-shadow: none;
			left: var(--value);
		}

		.settings-panel-field--interval .settings-panel-value-tip {
			position: absolute;
			height: 0;
			display: none;
			top: -${h*.25}em;
			left: var(--low);
			margin-left: ${-h*.3}em;
			z-index: 3;
			border-top: ${h*.3}em solid ${tone(active)};
			border-left: ${h*.3}em solid transparent;
			border-right: ${h*.3}em solid transparent;
			border-bottom: none;
		}
		.settings-panel-interval-value--right + .settings-panel-value-tip {
			left: var(--high);
		}

		.settings-panel-input:before {
			border-top: ${h*.3}em solid ${alpha(shadow, .25)};
		}
		.settings-panel-field--interval:hover .settings-panel-interval-value,
		.settings-panel-interval-dragging .settings-panel-interval-value {
			display: block;
		}
		@media (min-width: 640px) {
			.settings-panel-field--interval:hover .settings-panel-value-tip,
			.settings-panel-interval-dragging .settings-panel-value-tip {
				display: block;
			}
		}
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
			${pop(bg * .9, .07)};
			color: ${tone(.25)};
		}
		.settings-panel-switch-input:checked + .settings-panel-switch-label {
			${push(active, .05)};
		}

		.settings-panel-switch-input:first-child + .settings-panel-switch-label {
			border-top-left-radius: 3px;
			border-bottom-left-radius: 3px;
		}
		.settings-panel-switch-label:last-child {
			border-top-right-radius: 3px;
			border-bottom-right-radius: 3px;
		}

		.settings-panel-switch-label:hover {
			${pop(bg * .9 + (inversed ? -.07 : .07), .07)};
		}
		.settings-panel-switch-label:active {
			${pop(bg * .9 + (inversed ? .07 : -.07), .07)};
		}


	/** Select */
	.settings-panel-select {
		border-radius: 3px;
		padding-left: ${h/4}em;
		outline: none;
		border: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		-o-appearance:none;
		appearance:none;
		${pop(bg * .9, .07)};
		color: ${tone(.25)};
	}
	.settings-panel-select:active,
	.settings-panel-select:focus,
	.settings-panel-select:hover {
		${pop(bg * .9 + (inversed ? -.07 : .07), .07)};
	}
	.settings-panel-select::-ms-expand {
		display: none;
	}
	.settings-panel-select-triangle {
		color: inherit;
		display: block;
		transform: scale(.8);
	}


	/** Button */
	.settings-panel-button {
		text-align: center;
		border: none;
		border-radius: 3px;
		${pop(bg * .9, .07)};
		color: ${tone(.25)};
	}
	.settings-panel-button:focus {
		outline: none;
	}
	.settings-panel-button:hover {
		${pop(bg * .9 + (inversed ? -.07 : .07), .07)};
		color: ${tone(active)};
	}
	.settings-panel-button:active {
		${push(active, .05)};
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
		width: 100%;
		border-radius: 3px;
		padding-left: .4em;
		${push(bg * .9)};
		color: ${tone(.25)};
		text-shadow: none;
	}
	.settings-panel-textarea {
		padding-top: .35em;
	}

	.settings-panel-text:hover,
	.settings-panel-textarea:hover,
	.settings-panel-text:focus,
	.settings-panel-textarea:focus {
		background: ${tone(bg*.95 + ( inversed ? -.07 : .07 ))};
		color: ${tone(active)};
		outline: none;
	}

	/** Color */
	.settings-panel-color {
		position: relative;
		width: ${h}em;
		border-top-left-radius: 3px;
		border-bottom-left-radius: 3px;
		display: inline-block;
		vertical-align: baseline;
	}
	.settings-panel-color-value {
		border: none;
		padding-left: ${h/4}em;
		width: calc(100% - ${h}em);
		font-family: inherit;
		border-top-right-radius: 3px;
		border-bottom-right-radius: 3px;
		${push(bg * .9)};
		color: ${tone(.25)};
		text-shadow: none;
	}
	.settings-panel-color-value:hover,
	.settings-panel-color-value:focus {
		outline: none;
		background: ${tone(bg*.95 + ( inversed ? -.07 : .07 ))};
		color: ${tone(active)};
	}


	/** Checkbox */
	.settings-panel-checkbox {
		display: none;
	}
	.settings-panel-checkbox-label {
		display: inline-block;
		${text(.25, bg)};
		position: relative;
		margin-right: ${h}em;
	}
	.settings-panel-checkbox-label:before {
		font-family: "Material Icons";
		content: '';
		font-weight: bolder;
		font-size: 1.5em;
		display: block;
		float: left;
		width: 2em;
		margin-right: -2em;
		margin-top: -.15em;
		opacity: 0;
		z-index: 1;
		position: relative;
		color: ${tone(1)};
		text-shadow: 0 1px 2px ${alpha(shadow, .5)};
	}
	.settings-panel-checkbox-label:after {
		content: '';
		display: block;
		float: left;
		margin-top: 0;
		width: ${h*.666}em;
		height: ${h*.666}em;
		border-radius: 3px;
		position: relative;
		margin-right: ${h/3}em;
		line-height: ${h/2}em;
		text-align: center;
		z-index: 0;
		${push(bg * .9)};
	}
	.settings-panel-checkbox-label:hover {
		color: ${tone(active)};
	}
	.settings-panel-checkbox-label:hover:after {
		${push(bg * .9 -.07, .07)};
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label {
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label:before {
		opacity: 1;
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label:after {
		${push(active, .1)};
	}


	/** Decorations */
	::-webkit-input-placeholder {
		color: ${alpha(tone(.25), .5)};
	}
	::-moz-placeholder {
		color: ${alpha(tone(.25), .5)};
	}
	:-ms-input-placeholder {
		color: ${alpha(tone(.25), .5)};
	}
	:-moz-placeholder {
		color: ${alpha(tone(.25), .5)};
	}
	::-moz-selection {
		background: ${tone(active)};
		color: ${tone(bg)};
	}
	::selection {
		background: ${tone(active)};
		color: ${tone(bg)};
	}
	:host hr {
		border: none;
		height: 3px;
		border-radius: 3px;
		margin: ${h*.333}em 0;
		${push(bg, .05)};
	}
	`;
};
