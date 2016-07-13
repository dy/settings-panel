var createPanel = require('./')
var insertCSS = require('insert-css');
var extend = require('xtend/mutable');
var filter = require('filter-obj');

// prepare mobile
var meta = document.createElement('meta')
meta.setAttribute('name', 'viewport')
meta.setAttribute('content', 'width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=0')
document.head.appendChild(meta)


insertCSS(`
	body {
		margin: 0;
	}
	.settings-panel {
		display: inline-block;
		vertical-align: top;
		width: 40%;
		margin-right: 10%;
	}

	.settings-panel-preview {
		margin-right: 0;
		width: 50%;
	}
`);

var panel = createPanel([
	{type: 'title', label: 'Customize panel'},
	{type: 'text', label: 'Title', value: 'Preview', input: v => ex.set('Preview', v)},
	{type: 'select', label: 'Theme', value: createPanel.prototype.theme, options: Object.keys(createPanel.prototype.themes), input: v => {
		panel.set(filter(
			panel.themes[v],
			Object.keys(panel.get())
		));
		}
	},
	{type: 'title', label: 'Theme params'},
	{type: 'color', label: 'background'},
	{type: 'color', label: 'foreground'},
	{type: 'color', label: 'primary'},
	{type: 'color', label: 'secondary'},
	{type: 'text', label: 'fontFamily'},
	{type: 'range', label: 'fontSize', min: 8, max: 20, step: .5},
	{type: 'switch', label: 'labelPosition', options: ['top', 'left', 'right', 'bottom'], value: 'left'},
	{type: 'switch', label: 'labelAlign', options: ['left', 'center', 'right'], value: 'left', input: v => console.log(v)},
	{type: 'text', label: 'labelWidth', min: 7, max: 50, step: 1},
	{type: 'range', label: 'radius', min: 0, max: 10, step: .5},
	{type: 'button', label: 'Get theme json', input: () => {
		alert('Your json, sir!')
	}}
]).on('input', (theme) => {
	ex.update(theme);
});
panel.set(filter(
	createPanel.prototype.themes[createPanel.prototype.theme],
	Object.keys(panel.get())
));


var ex = createPanel([
	{type: 'title', label: 'Preview'},
	{type: 'switch', label: 'Switch', options: ['One', 'Two'], value: 'One'},
	{type: 'range', label: 'Range slider', min: 0, max: 100, value: 20, help: 'Default slider'},
	{type: 'range', label: 'Range stepped', min: 0, max: 1, step: 0.2, value: 0.6},
	{type: 'range', scale: 'log', label: 'Range slider (log)', min: 0.01, max: 100, value: 1},
	{type: 'range', scale: 'log', label: 'Range stepped (log)', min: 0.01, max: 100, steps: 10, value: 1},
	{type: 'range', scale: 'log', label: 'Range slider (-log)', min: -0.01, max: -100, value: -1},
	{type: 'range', scale: 'log', label: 'Range stepped (-log)', min: -0.01, max: -100, steps: 10, value: -1},
	{type: 'text', label: 'Text', value: 'my setting'},
	{type: 'checkbox', label: 'Checkbox', value: true},
	{type: 'color', label: 'Color rgb', format: 'rgb', value: 'rgb(100,200,100)'},
	{type: 'color', label: 'Color hex', format: 'hex', value: '#30b2ba'},
	{type: 'button', label: 'Gimme an alert', input: function () { window.alert('hello!') }},
	{type: 'interval', label: 'An interval', min: 0, max: 10, value: [3, 4], steps: 20},
	{type: 'interval', label: 'Log interval', min: 0.1, max: 10, value: [0.1, 1], scale: 'log', steps: 20},
	{type: 'interval', label: 'Neg log interval', min: -0.1, max: -10, value: [-0.1, -1], scale: 'log', steps: 20},
	{type: 'range', label: 'One more', min: 0, max: 10},
	{type: 'select', label: 'Key/value select', options: {state1: 'State One', state2: 'State Two'}, value: 'state1'},
	{type: 'select', label: 'Array select', options: ['State One', 'State Two'], value: 'State One'},
	{type: 'email', label: 'Email', placeholder: 'email'}
], {className: 'settings-panel-preview'});

ex.on('input', function (data) {
	console.log(data)
})
