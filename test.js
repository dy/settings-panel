const createPanel = require('./')
const insertCSS = require('insert-styles');
const css = require('dom-css');
const Picker = require('simple-color-picker');
const Sortable = require('sortablejs');
const colormap = require('colormap');
const colorScales = require('colormap/colorScales');
const color = require('tinycolor2');
let palettes = require('nice-color-palettes/500');

var cm = (colormap({
	colormap: cm,
	nshades: 128,
	format: 'rgba',
	alpha: 1
}));

palettes = palettes
//sort by readability
// .map((palette) => {
// 	return palette.sort( (a, b) => {
// 		color.mostReadable
// 	});
// });
//filter not readable palettes
.filter((palette) => {
	return color.isReadable(palette[0], palette.slice(-1)[0], {
		level:"AA", size:"large"
	});
});

// prepare mobile
var meta = document.createElement('meta')
meta.setAttribute('name', 'viewport')
meta.setAttribute('content', 'width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=0')
document.head.appendChild(meta)


insertCSS(`
	body {
		margin: 0;
		position: relative;
		min-height: 100vh;
		background: url('./images/land.jpg');
		background-position: center top;
		background-size: cover;
		background-attachment: fixed;
	}
	.settings-panel-preview {
		margin: 2em auto;
	}
	.frame {
		min-height: 100vh;
		position: relative;
		width: calc(100% - 240px);
	}
	.sidebar {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		font-size: 12px;
		width: 240px;
		background: white;
		box-shadow: -1px 0 3px rgba(0,0,0,.05);
	}
`);


const themes = {
	none: require('./theme/none'),
	// lucy: require('./theme/lucy'),
	// typer: require('./theme/typer'),
	control: require('./theme/control'),
	// dragon: require('./theme/dragon'),
	// merka: require('./theme/merka'),
};

var frame = document.createElement('div');
frame.classList.add('frame');
document.body.appendChild(frame);


var panel = createPanel([
	{type: 'switch', label: 'Switch', options: ['One', 'Two', 'Three'], value: 'One'},
	{type: 'range', label: 'Range slider', min: 0, max: 100, value: 20, help: 'Default slider'},
	{type: 'range', label: 'Range stepped', min: 0, max: 1, step: 0.2, value: 0.6},
	{type: 'range', scale: 'log', label: 'Range log', min: 0.01, max: 100, value: 1},
	{type: 'range', scale: 'log', label: 'Stepped log', min: 0.01, max: 100, steps: 10, value: 1},
	{type: 'range', scale: 'log', label: 'Range -log', min: -0.01, max: -100, value: -1},
	{type: 'range', scale: 'log', label: 'Stepped -log', min: -0.01, max: -100, steps: 10, value: -1, after:'<hr/>'},
	{type: 'text', label: 'Text', value: 'my setting'},
	{type: 'checkbox', label: 'Checkbox', value: true},
	{type: 'color', label: 'Color rgb', format: 'rgb', value: 'rgb(100,200,100)'},
	{type: 'color', label: 'Color hex', format: 'hex', value: '#30b2ba'},
	{type: 'interval', label: 'An interval', min: 0, max: 10, value: [3, 4], steps: 20},
	{type: 'interval', label: 'Log interval', min: 0.1, max: 10, value: [0.1, 1], scale: 'log', steps: 20},
	{type: 'interval', label: 'Neg log interval', min: -0.1, max: -10, value: [-0.1, -1], scale: 'log', steps: 20},
	{type: 'select', label: 'Key/value select', options: {state1: 'State One', state2: 'State Two'}, value: 'state1'},
	{type: 'select', label: 'Array select', disabled: true, options: ['State One', 'State Two'], value: 'State One'},
	{type: 'email', label: 'Email', placeholder: 'email'},
	{type: 'textarea', label: 'Long text', placeholder: 'long text...'},
	{type: 'button', label: 'Cancel', input: function () { window.alert('hello!') }, style: {width: '50%'}, before: () => '<hr/>'},
	{type: 'button', label: 'Ok', input: function () { window.alert('hello!') }, style: 'width: 50%'},
	// {type: 'switch', label: 'Orientation', options: 'top|left|bottom|right'.split('|'), value: 'left' }
], {
	title: 'Preview',
	className: 'settings-panel-preview',
	container: frame,
	theme: themes.control
});

panel.on('input', function (name, value, data) {
	console.log(name, value, data)
})




//create main form
var settings = createPanel([
	{label: 'Theme', type: 'select', options: Object.keys(themes), value: panel.theme.name, change: v => {
		panel.update({theme: themes[v]});
		settings.set({
			'font-size': panel.fontSize,
			'font-family': panel.fontFamily,
			'label-width': panel.labelWidth,
			'input-height': panel.inputHeight,
		});
		settings.set('palette', panel.theme.palette);
	}},

	{label: 'Palette', type: 'custom', id: 'palette', options: palettes, save: false, value: panel.theme.palette, create: function (opts) {
			let list = document.createElement('ul');

			let palette = opts.value || this.value;

			if (typeof palette === 'string') {
				palette = palette.split(',');
			}
			else if (Array.isArray(palette[0])) {
				palette = palette.map((arr) => `rgb(${arr.map(v => v.toFixed(0))})`);
			}

			css(list, {
				listStyle: 'none',
				margin: '.5em 0 0',
				padding: 0,
				height: '2em',
				display: 'inline-block'
			});

			palette.forEach((color) => {
				let item = document.createElement('li');
				item.title = color;
				item.className = 'palette-color';
				item.setAttribute('data-id', color);
				css(item, {
					height: '2em',
					width: '2em',
					display: 'inline-block',
					background: color,
					cursor: 'move'
				});
				list.appendChild(item);

				//create picker for each color
				let picker = new Picker({
					el: item,
					color: color
				});
				picker.$el.style.display = 'none';
				item.onmouseout = (e) => {
					picker.$el.style.display = 'none'
				}
				item.onmouseover = function () {
					picker.$el.style.display = ''
				}
				picker.onChange((color) => {
					css(item, {background: color});
					item.setAttribute('data-id', color);
					sortman && this.emit('change', sortman.toArray());
				})
			});

			//add randomize btn
			let randomize = document.createElement('li');
			randomize.className = 'palette-randomize';
			randomize.innerHTML = '<button style="margin: 0; font-size: 1.6em; width: 100%; height: 100%; padding: 0; line-height: 0; cursor: pointer">⚂</button>';
			css(randomize, {
				height: '2em',
				width: '2em',
				display: 'inline-block',
				verticalAlign: 'top',
				lineHeight: '2em',
				textAlign: 'center',
				marginLeft: '.5em'
			});
			randomize.title = 'Randomize palette';
			randomize.onclick = () => {
				let palette = palettes[Math.floor(Math.random() * palettes.length)];
				settings.set('palette', palette);
			};
			list.appendChild(randomize);

			//add reverse btn
			let reverse = document.createElement('li');
			reverse.className = 'palette-reverse';
			reverse.innerHTML = '<button style="margin: 0; font-size: 1.3em; width: 100%; height: 100%; padding: 0; line-height: 0; cursor: pointer">↻</button>';
			css(reverse, {
				height: '2em',
				width: '2em',
				display: 'inline-block',
				verticalAlign: 'top',
				lineHeight: '2em',
				textAlign: 'center'
			});
			reverse.title = 'Reverse palette';
			reverse.onclick = () => {
				settings.set('palette', palette.slice().reverse());
			};
			list.appendChild(reverse);

			let sortman = new Sortable(list, {
				filter: '.palette-randomize',
				draggable: '.palette-color',
				forceFallback: true,
				onUpdate: (e) => {
					this.emit('change', sortman.toArray());
				}
			});

			setTimeout(() => {
				this.emit('init', palette);
			});

			return list;
		},
		change: (v) => {
			let palette = null;
			if (v) {
				if (Array.isArray(v)) palette = v;
				else palette = v.split(/\s*,\s*/);
			}
			panel.update({palette: palette});
		}
	},
	{label: 'Font family', id: 'font-family', type: 'text', value: panel.theme.fontFamily, change: v => {
		panel.update({fontFamily: v});
	}, after: '<hr/>'},
	{label: 'Label orientation', type: 'switch', options: {top: '↑', left: '←', bottom: '↓', right: '→'}, value: panel.orientation, change: (v) => {
			panel.update({orientation: v});
			if (v === 'top' || v === 'bottom') {
				settings.set('label-width', {
					disabled: true
				});
			}
			else {
				settings.set({
					'label-width': {
						disabled: false
					}
				});
			}
		}
	},
	{label: '1em&nbsp;=&nbsp;', title: 'Font size', id: 'font-size', type: 'text', value: panel.theme.fontSize, change: (v) => {
		panel.update({fontSize: v});
	}, orientation: 'left', style: 'width: 50%; float: left'},
	{type: 'text', label: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↨', title: 'Input height, em', id: 'input-height', value: panel.theme.inputHeight, input: (v) => {
		panel.update({inputHeight: v});
	}, orientation: 'left', style: 'width: 50%'},
	{type: 'text', label: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↔', title: 'Full panel width', id: 'width', value: '36em', input: (v) => {
		panel.update({style: `width: ${v};`})
	}, orientation: 'left', style: 'width: 50%; float: left'},
	{label: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↦', title: 'Label width', id: 'label-width', type: 'text', value: panel.theme.labelWidth, change: (v) => {
		panel.update({labelWidth: v});
	}, orientation: 'left', style: 'width: 50%'},
	{type: 'button', label: 'Get the code!', before: '<hr/>', input: () => {
		alert('code');
	}}
], {
	// theme: require('./theme/dragon'),
	id: 'settings',
	className: 'sidebar',
	orientation: 'top',
	labelWidth: '22%',
	style: 'background: rgba(252, 252, 252, .666)'
});
