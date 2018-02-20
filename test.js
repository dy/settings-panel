const createPanel = require('./')
const palettes = require('nice-color-palettes');
// const insertCSS = require('insert-styles');
// const css = require('dom-css');
// const Picker = require('simple-color-picker');
// const Sortable = require('sortablejs');
// const color = require('tinycolor2');
// const colormap = require('colormap');
// const colorScales = require('colormap/colorScales');

// const icon = {
// 	nw: 'nw',
// 	ne: 'ne',
// 	left: 'left',
// 	center: 'center',
// 	right: 'right',
// 	sw: 'sw',
// 	se: 'se'
// }

/*
let colormaps = {};

for (var name in colorScales) {
	if (name === 'alpha') continue;
	if (name === 'hsv') continue;
	if (name === 'rainbow') continue;
	if (name === 'rainbow-soft') continue;
	if (name === 'phase') continue;

	colormaps[name] = colormap({
		colormap: colorScales[name],
		nshades: 16,
		format: 'rgbaString'
	});
}

palettes = palettes
//filter not readable palettes
.filter((palette) => {
	return color.isReadable(palette[0], palette.slice(-1)[0], {
		level:"AA", size:"large"
	});
});
*/


// let settings = createPanel({
// 	title: {value: 'Demo panel'},
// 	position: {value: 'center', options: {
// 		[icon.nw]: 'nw',
// 		[icon.ne]: 'ne',
// 		[icon.left]: 'left',
// 		[icon.center]: 'center',
// 		[icon.right]: 'right',
// 		[icon.sw]: 'sw',
// 		[icon.se]: 'se'
// 	}}
// }, {
// 	position: 'right'
// }, (k, v) => {
// 	demoPanel.title = v
// })


let demoPanel = createPanel({
	text: 123
}, {
	fields: {
		text: {order: 0, placeholder: 'Text...'},
		textarea: {order: 1, type: 'textarea', placeholder: 'Long text...'},
		ok: {order: 3, type: 'button', width: 'half', label: 'Ok'},
		cancel: {order: 2, type: 'button', width: 'half', label: 'Cancel'},
	},
	title: 'Demo Panel'
})


demoPanel.text = 1235

// jsx style
// + easy layout/nested settings
// - difficult state mapping ?, obj updaing
// <Settings>
// 	<Title>Demo Panel</Title>
// 	<Text placeholder='Text...'></Text>
// 	<Textarea placeholder='Long text...'></Text>
// </Settings>

