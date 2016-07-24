const createPanel = require('./')
const insertCSS = require('insert-styles');
const palettes = require('nice-color-palettes');


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
		box-shadow: -2px 0 rgba(0,0,0,.02);
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
	{type: 'range', scale: 'log', label: 'Range slider (log)', min: 0.01, max: 100, value: 1},
	{type: 'range', scale: 'log', label: 'Range stepped (log)', min: 0.01, max: 100, steps: 10, value: 1},
	{type: 'range', scale: 'log', label: 'Range slider (-log)', min: -0.01, max: -100, value: -1},
	{type: 'range', scale: 'log', label: 'Range stepped (-log)', min: -0.01, max: -100, steps: 10, value: -1, after:'<hr/>'},
	{type: 'text', label: 'Text', value: 'my setting'},
	{type: 'checkbox', label: 'Checkbox', value: true},
	{type: 'color', label: 'Color rgb', format: 'rgb', value: 'rgb(100,200,100)'},
	{type: 'color', label: 'Color hex', format: 'hex', value: '#30b2ba'},
	{type: 'button', label: 'Cancel', input: function () { window.alert('hello!') }, style: {width: '50%'}},
	{type: 'button', label: 'Ok', input: function () { window.alert('hello!') }, style: 'width: 50%', after: () => '<hr/>'},
	{type: 'interval', label: 'An interval', min: 0, max: 10, value: [3, 4], steps: 20},
	{type: 'interval', label: 'Log interval', min: 0.1, max: 10, value: [0.1, 1], scale: 'log', steps: 20},
	{type: 'interval', label: 'Neg log interval', min: -0.1, max: -10, value: [-0.1, -1], scale: 'log', steps: 20},
	{type: 'range', label: 'One more', min: 0, max: 10},
	{type: 'select', label: 'Key/value select', options: {state1: 'State One', state2: 'State Two'}, value: 'state1'},
	{type: 'select', label: 'Array select', options: ['State One', 'State Two'], value: 'State One'},
	{type: 'email', label: 'Email', placeholder: 'email'},
	{type: 'textarea', label: 'Long text', placeholder: 'long text...'},
	// {type: 'switch', label: 'Orientation', options: 'top|left|bottom|right'.split('|'), value: 'left' }
], {title: 'Preview', className: 'settings-panel-preview', container: frame});

panel.on('input', function (name, value, data) {
	console.log(name, value, data)
})




//create main form
var settings = createPanel([
	{label: 'Theme', type: 'select', options: Object.keys(themes), value: 'none', change: v => {
		panel.update({theme: themes[v]});
		// settings.set('Palette', panel.theme.palette);
	}},
	{label: 'Label orientation', type: 'switch', options: {top: '↑', left: '←', bottom: '↓', right: '→'}, value: panel.orientation, change: (v) => {
			panel.update({orientation: v});
			if (v === 'top' || v === 'bottom') {
				settings.set('label-width', {
					hidden: true
				});
				settings.set('font-size', {
					style: null
				});
			}
			else {
				settings.set({
					'label-width': {
						hidden: false,
						style: 'width: 50%; float: left;'
					},
					'font-size': {
						style: 'width: 50%; float: left'
					}
				});
			}
		}
	},
	{label: 'Font size', id: 'font-size', type: 'text', value: panel.theme.fontSize, change: (v) => {
		panel.update({fontSize: v});
	}},
	{label: 'Label width', id: 'label-width', type: 'text', value: panel.theme.labelWidth, change: (v) => {
		panel.update({labelWidth: v});
	}},
	// {label: 'Palette', type: 'custom', options: palettes, save: false, create: function (opts) {
	// 		return;

	// 		let list = document.createElement('ul');

	// 		let palette = opts.value || themes[this.panel.get('Theme')].palette || [];

	// 		if (typeof palette === 'string') {
	// 			palette = palette.split(',');
	// 		}

	// 		css(list, {
	// 			listStyle: 'none',
	// 			margin: '.5em 0 0',
	// 			padding: 0,
	// 			height: '2em',
	// 			display: 'inline-block',
	// 			boxShadow: `0 0 .666em ` + palette[3]
	// 		});

	// 		palette.forEach((color) => {
	// 			let item = document.createElement('li');
	// 			item.title = color;
	// 			item.setAttribute('data-id', color);
	// 			css(item, {
	// 				height: '2em',
	// 				width: '2em',
	// 				display: 'inline-block',
	// 				background: color
	// 			});
	// 			list.appendChild(item);

	// 			//create picker for each color
	// 			let picker = new Picker({
	// 				el: item,
	// 				color: color
	// 			});
	// 			picker.$el.style.display = 'none';
	// 			item.onmouseout = (e) => {
	// 				picker.$el.style.display = 'none'
	// 			}
	// 			item.onmouseover = function () {
	// 				picker.$el.style.display = ''
	// 			}
	// 			picker.onChange((color) => {
	// 				css(item, {background: color});
	// 				item.setAttribute('data-id', color);
	// 				sortman && this.emit('change', sortman.toArray());
	// 			})
	// 		});

	// 		let sortman = new sortable(list, {
	// 			onUpdate: (e) => {
	// 				this.emit('change', sortman.toArray());
	// 			}
	// 		});

	// 		setTimeout(() => {
	// 			this.emit('init', palette);
	// 		});

	// 		return list;
	// 	},
	// 	change: (v) => {
	// 		if (!v) panel.palette = null;
	// 		else if (Array.isArray(v)) panel.palette = v;
	// 		else panel.palette = v.split(/\s*,\s*/);
	// 	}
	// }
], {
	// theme: require('./theme/dragon'),
	className: 'sidebar',
	orientation: 'top',
	labelWidth: '100%'
});
