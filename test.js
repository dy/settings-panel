const createPanel = require('./')
const insertCSS = require('insert-styles');
const css = require('dom-css');
const Picker = require('simple-color-picker');
const Sortable = require('sortablejs');
const colormap = require('colormap');
const colorScales = require('colormap/colorScales');
const color = require('tinycolor2');
let palettes = require('nice-color-palettes/500');

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
	.sidebar {
		display: none;
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		font-size: 12px;
		width: 240px;
		box-shadow: -1px 0 3px rgba(0,0,0,.05);
	}
	@media (min-width: 640px) {
		.frame {
			min-height: 100vh;
			position: relative;
			width: calc(100% - 240px);
		}
		.sidebar {
			display: block;
		}
	}
`);


const themes = {
	none: require('./theme/none'),
	// lucy: require('./theme/lucy'),
	control: require('./theme/control'),
	dragon: require('./theme/dragon'),
	// merka: require('./theme/merka'),
	json: require('./theme/json'),
	flat: require('./theme/flat'),
	typer: require('./theme/typer')
};

var frame = document.createElement('div');
frame.classList.add('frame');
document.body.appendChild(frame);


var panel = createPanel([
	{type: 'switch', label: 'Switch', options: ['One', 'Two', 'Three'], value: 'One'},
	{type: 'range', label: 'Range', min: 0, max: 100, value: 80, help: 'Default slider'},
	// {type: 'range', label: 'Range stepped', min: 0, max: 1, step: 0.2, value: 0.6},
	// {type: 'range', scale: 'log', label: 'Range log', min: 0.01, max: 100, value: 1},
	// {type: 'range', scale: 'log', label: 'Stepped log', min: 0.01, max: 100, steps: 10, value: 1},
	// {type: 'range', scale: 'log', label: 'Range -log', min: -0.01, max: -100, value: -1},
	// {type: 'range', scale: 'log', label: 'Stepped -log', min: -0.01, max: -100, steps: 10, value: -1},
	// {type: 'raw', content: '<hr/>'},
	{type: 'interval', label: 'Interval', min: 0, max: 10, value: [3, 7], steps: 20},
	// {type: 'interval', label: 'Log interval', min: 0.1, max: 10, value: [0.1, 1], scale: 'log', steps: 20},
	// {type: 'interval', label: 'Neg log interval', min: -0.1, max: -10, value: [-0.3, -1], scale: 'log', steps: 20},
	{type: 'checkbox', label: 'Checkbox', value: true},
	{type: 'checkbox', label: 'Checkbox group', value: ['b', 'c'], options: {
		a: 'Option A',
		b: 'Option B',
		c: 'Option C'
	}
	},
	{type: 'text', label: 'Text', value: 'my setting'},
	{type: 'color', label: 'Color', format: 'rgb', value: 'rgb(100,200,100)'},
	// {type: 'color', label: 'Color hex', format: 'hex', value: '#30b2ba'},
	{type: 'select', label: 'Select', options: {state1: 'State One', state2: 'State Two'}, value: 'state1'},
	// {type: 'email', label: 'Email', placeholder: 'email'},
	{type: 'text', label: 'Disabled', disabled: true, value: 'disabled value'},
	{type: 'textarea', label: 'Long text', placeholder: 'long text...'},
	{type: 'raw', content: '<hr/>'},
	{type: 'button', label: 'Cancel', input: function () { window.alert('hello!') }, style: {width: '50%'}},
	{type: 'button', label: 'Ok', input: function () { window.alert('hello!') }, style: 'width: 50%'},
	// {type: 'switch', label: 'Orientation', options: 'top|left|bottom|right'.split('|'), value: 'left' }
], {
	id: 'preview',
	title: 'Preview',
	className: 'settings-panel-preview',
	container: frame,
	theme: themes.typer
});

panel.on('input', function (name, value, data) {
	console.log(name, value, data)
})



//create main form
var settings = createPanel([
	{label: 'Theme', type: 'select', options: Object.keys(themes), value: panel.theme.name, change: v => {
		if (!v) return;
		panel.update({theme: themes[v]});
		settings.set({
			'font-size': panel.fontSize,
			'font-family': panel.fontFamily,
			'label-width': panel.labelWidth,
			'input-height': panel.inputHeight,
			'padding': themes[v].padding
		});
		settings.set('palette', panel.theme.palette);
	}},

	{label: 'Palette', type: 'raw', id: 'palette', options: palettes, save: false, value: panel.theme.palette, content: function (opts) {
			let palette = opts.value || this.value;

			let list = this.field.querySelector('.palette');
			if (!list) {
				list = document.createElement('ul');
				list.className = 'palette';
				css(list, {
					listStyle: 'none',
					margin: '0 0 0',
					padding: 0,
					minHeight: '2em',
					display: 'inline-block'
				});
				setTimeout(() => {
					this.emit('init', palette);
				});
			}

			//add randomize btn
			let randomize = list.querySelector('.palette-randomize');
			if (!randomize) {
				randomize = document.createElement('li');
				randomize.className = 'palette-randomize';
				randomize.innerHTML = '<button style="margin: 0; font-size: 1.6em; width: 100%; height: 100%; padding: 0; line-height: 0; cursor: pointer">⚂</button>';
				css(randomize, {
					height: '2em',
					width: '2em',
					float: 'left',
					clear: 'left',
					position: 'relative',
					marginTop: '.5em',
					lineHeight: '2em',
					textAlign: 'center'
				});
				randomize.title = 'Randomize palette';
				randomize.onclick = () => {
					palette = palettes[Math.floor(Math.random() * palettes.length)];
					this.emit('change', palette.slice());
					settings.set('palette', palette.slice());
					colormap.firstChild.value = 'custom';
				};
				list.appendChild(randomize);
			}

			//add reverse btn
			let reverse = list.querySelector('.palette-reverse');
			if (!reverse) {
				reverse = document.createElement('li');
				reverse.className = 'palette-reverse';
				reverse.innerHTML = '<button style="margin: 0; font-size: 1.3em; width: 100%; height: 100%; padding: 0; line-height: 0; cursor: pointer">↻</button>';
				css(reverse, {
					height: '2em',
					width: '2em',
					float: 'left',
					marginTop: '.5em',
					lineHeight: '2em',
					textAlign: 'center'
				});
				reverse.title = 'Reverse palette';
				reverse.onclick = () => {
					palette = palette.reverse();
					this.emit('change', palette.slice());
					settings.set('palette', palette.slice());
					colormap.firstChild.value = 'custom';
				};
				list.appendChild(reverse);
			}

			//add colormap select
			let colormap = list.querySelector('.palette-colormap');
			if (!colormap) {
				colormap = document.createElement('li');
				colormap.className = 'palette-colormap';
				colormap.innerHTML = `<select style="margin: 0; width: 100%; height: 100%; padding: 0; line-height: 0; cursor: pointer"><option value="custom">custom</option>${Object.keys(colormaps).map(key => `<option value="${key}">${key}</option>`)}</select>`;
				css(colormap, {
					height: '2em',
					width: 'auto',
					marginLeft: '.5em',
					float: 'left',
					marginTop: '.5em',
					lineHeight: '2em',
					textAlign: 'center'
				});
				colormap.title = 'Choose colormap';
				colormap.onchange = (e) => {
					let cm = e.target.value;
					palette = colormaps[cm] || panel.theme.palette;
					this.emit('change', palette.slice());
					settings.set('palette', palette.slice());
				};
				list.appendChild(colormap);
			}

			//update palette
			let els = list.querySelectorAll('.palette-color');
			[].forEach.call(els, (el) => {
				list.removeChild(el);
			});

			if (typeof palette === 'string') {
				palette = palette.split(',');
			}
			else if (Array.isArray(palette[0])) {
				palette = palette.map((arr) => `rgb(${arr.map(v => v.toFixed(0))})`);
			}

			palette.forEach((color) => {
				let item = document.createElement('li');
				item.title = color;
				item.className = 'palette-color';
				item.setAttribute('data-id', color);
				css(item, {
					height: '2em',
					width: '2em',
					float: 'left',
					background: color,
					cursor: 'move'
				});
				list.insertBefore(item, randomize);

				//create picker for each color
				let picker = new Picker({
					el: item,
					color: color,
					height: 162
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
					opts.sortable && this.emit('change', opts.sortable.toArray());
				})
			});

			if (opts.sortable) {
				opts.sortable.destroy();
				opts.sortable = null;
			}

			opts.sortable = new Sortable(list, {
				draggable: '.palette-color',
				filter: '.Scp',
				forceFallback: true,
				onUpdate: (e) => {
					this.emit('change', opts.sortable.toArray());
					settings.set('palette', opts.sortable.toArray());
				}
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
	}},
	{type: 'raw', content: '<hr/>'},
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
	{type: 'text', label: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↔', title: 'Full panel width', id: 'width', value: '32em', input: (v) => {
		panel.update({style: `width: ${v};`})
	}, orientation: 'left', style: 'width: 50%; float: left'},
	{label: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↦', title: 'Label width', id: 'label-width', type: 'text', value: panel.theme.labelWidth, change: (v) => {
		panel.update({labelWidth: v});
	}, orientation: 'left', style: 'width: 50%'},
	{label: 'padding', id: 'padding', type: 'range', min: 0, max: 1, value: 1/5, change: v => {
		panel.update({padding: v})
	}},
	{type: 'raw', content: '<hr/>'},
	{type: 'button', label: 'Get the code!', input: () => {
		alert('code');
	}}
], {
	// theme: require('./theme/dragon'),
	id: 'settings',
	className: 'sidebar',
	orientation: 'top',
	labelWidth: '22%',
	style: 'background: rgba(253,253,253,.82);'
});
