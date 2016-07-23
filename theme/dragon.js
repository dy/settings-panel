/**
 * @module prama/theme/dragon
 *
 * Minimalistic theme
 */

const px = require('add-px-to-style');
const fonts = require('google-fonts');
const color = require('tinycolor2');
const scopeCss = require('scope-css');

module.exports = dragon;

fonts.add({
	'Roboto': 400
});

dragon.palette = [
	'#fff',
	'#999',
	'#131522',
	'#333',
	'#222'
];

dragon.fontSize = 12;

function dragon () {
let defaultPalette = dragon.palette;

let palette = this.palette || defaultPalette;

let primary = palette[0] || defaultPalette[4];
let secondary = palette[1] || defaultPalette[4];
let active = palette[2] || defaultPalette[4];
let bg = palette[3] || defaultPalette[4];
let fg = palette[4] || defaultPalette[4];

let font = '"Roboto", sans-serif';
let fontSize = this.fontSize || 12;

let css = `
	:host > .prama {
		background: none;
		overflow: visible;
		padding: 0;
	}
	.popoff-popup {
		min-width: 0;
	}
	.prama.popoff-sidebar .settings-panel {
		border-radius: 0;
		height: 100%;
	}

	.prama-button {
		color: ${bg};
		fill: ${bg};
	}
	.prama-button:hover {
		color: ${active};
		fill: ${active};
	}

	.popoff-close {
		color: ${secondary};
	}
	.popoff-close:hover {
		color: ${active};
	}
`;

css = scopeCss(css, '.prama-container-' + this.id).trim();

//set panel css
this.panel.css = `
	:host {
		color: ${secondary};
		background: ${alpha(bg, .91)};
		font-size: ${px('font-size', fontSize)};
		font-family: ${font};
		padding: 1.5em 1.5em;
	}

	.settings-panel-title {
		text-transform: uppercase;
		font-size: 1.2em;
		line-height: 2em;
		height: 2em;
		margin-top: 0em;
		margin-bottom: .75em;
		letter-spacing: .15ex;
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
		color: ${primary};
		box-shadow: 0 2px ${fg};
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
		border-top: .3em solid ${primary};
		border-bottom: .0 transparent;
	}
	.settings-panel-select-triangle--up {
		display: none;
	}
	.settings-panel-select:focus {
		box-shadow: 0 2px ${active};
	}

	/** Text */
	.settings-panel-text,
	.settings-panel-textarea {
		border: none;
		background: none;
		color: ${primary};
		width: 100%;
		box-shadow: 0 2px ${fg};
	}

	.settings-panel-text:focus,
	.settings-panel-textarea:focus {
		outline: none;
		color: ${primary};
		box-shadow: 0 2px ${active};
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
		color: ${primary};
		box-shadow: 0 2px ${fg};
		padding-left: 1.5em;
		width: 100%;
	}
	.settings-panel-color-value:focus {
		outline: none;
		color: ${primary};
		box-shadow: 0 2px ${active};
	}

	/** Switch style */
	.settings-panel-switch {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		color: ${secondary};
		display: inline-block;
	}
	.settings-panel-switch-input {
		display: none;
	}
	.settings-panel-switch-label {
		cursor: pointer;
		vertical-align: top;
		min-height: 2em;
		padding: 0 .75em;
		margin: 0 2px 2px 0;
		line-height: 2em;
		color: ${darken(primary, .2)};
		background: ${darken(secondary, .2)};
	}
	.settings-panel-switch-label:hover {
		color: ${primary};
		background: ${secondary};
	}
	.settings-panel-switch-label:last-child {
		margin-right: 0;
	}
	.settings-panel-switch-input:checked + .settings-panel-switch-label {
		color: ${primary};
		background: ${fg};
		box-shadow: 2px 0 ${fg}, -2px 0 ${fg};
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
		vertical-align: middle;
		width: 1.5em;
		height: 1.5em;
		cursor: pointer;
		border-radius: 2px;
		background: ${fg};
	}
	.settings-panel-checkbox-label:before {
		position: absolute;
		content: "";
		height: .666em;
		width: .666em;
		left: .4333em;
		bottom: .4333em;
		background: ${darken(primary, .2)};
		opacity: .02;
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label:before {
		opacity: 1;
		background: ${darken(primary, .2)};
	}
	.settings-panel-checkbox:checked + .settings-panel-checkbox-label {
		background: ${fg};
	}
	.settings-panel-checkbox:focus + .settings-panel-checkbox-label,
	.settings-panel-checkbox + .settings-panel-checkbox-label:hover {
		background: ${active};
	}
	.settings-panel-checkbox:focus + .settings-panel-checkbox-label:before,
	.settings-panel-checkbox + .settings-panel-checkbox-label:hover:before {
		background: ${primary};
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
		color: ${darken(primary, .2)};
		background: ${darken(secondary, .2)};
	}
	.settings-panel-button:hover {
		color: ${primary};
		background: ${secondary};
	}
	.settings-panel-button:active {
		color: ${primary};
		background: ${fg};
	}

	/** Sliders */
	.settings-panel-range {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background: none;
		color: ${fg};
	}
	.settings-panel-range:focus {
		color: ${active};
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
		background: ${fg};
	}
	.settings-panel-range::-ms-fill-upper {
		background: ${fg};
	}

	.settings-panel-range::-webkit-slider-thumb {
		background: ${secondary};
		height: 1.5em;
		width: .5em;
		border: 0;
		cursor: ew-resize;
		-webkit-appearance: none;
		appearance: none;
		margin-top: -.75em;
	}
	.settings-panel-range:focus::-webkit-slider-thumb {
		background: ${primary};
	}
	.settings-panel-range::-moz-range-thumb {
		background: ${secondary};
		height: 1em;
		width: 1em;
		border: 0;
		cursor: ew-resize;
		-webkit-appearance: none;
		-moz-appearance: none;
		margin-top: -.75em;
	}
	.settings-panel-range:focus::-moz-range-thumb {
		background: ${primary};
	}
	.settings-panel-range::-ms-thumb {
		background: ${secondary};
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
		background: ${fg};
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
		background: ${secondary};
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
		background: ${primary};
	}


	/** Decorations */
	:host hr {
		border: none;
		height: 0;
		margin: 1.25em 0;
		border-bottom: 1px dotted ${lighten(bg, .15)};
	}
	::-webkit-input-placeholder {
		color: ${secondary};
	}
	::-moz-placeholder {
		color: ${secondary};
	}
	:-ms-input-placeholder {
		color: ${secondary};
	}
	:-moz-placeholder {
		color: ${secondary};
	}

	::-moz-selection {
		color: ${primary};
		background: ${active};
	}
	::selection {
		color: ${primary};
		background: ${active};
	}
`;

return css;
}



function alpha (c, value) {
	return color(c).setAlpha(value).toString();
}

function darken (c, value) {
	return color(c).darken(value*100).toString();
}

function lighten (c, value) {
	return color(c).lighten(value*100).toString();
}