/**
 * @module prama/theme/dat
 *
 * dat.gui reproduction
 */

const px = require('add-px-to-style');
const fonts = require('google-fonts');
const color = require('tinycolor2');
const scopeCss = require('scope-css');
const lerp = require('interpolation-arrays');
const none = require('./none');

module.exports = dat;

fonts.add({
	'Roboto': 400
});

dat.palette = ['#1b1b1b', '#f7f7f7'];

dat.fontSize = '12px';
dat.fontFamily = '"Roboto", sans-serif';
dat.labelWidth = '33.3%';
dat.inputHeight = 2;

function dat (opts) {
	opts = opts || {};

	let h = opts.inputHeight || dat.inputHeight;
	let labelWidth = opts.labelWidth || dat.labelWidth;
	let fontSize = opts.fontSize || dat.fontSize;
	let font = opts.fontFamily || dat.fontFamily;

	let palette = (opts.palette || dat.palette).map(v => color(v).toRgb());
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
		palette: palette
	}) +