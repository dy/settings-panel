var createPanel = require('./')
var insertCSS = require('insert-css');

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
		margin: 2rem auto;
	}
`);


var panel = createPanel([
	{type: 'title', value: 'Settings'},
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
	{type: 'email', label: 'Email'}
])

panel.on('input', function (data) {
	console.log(data)
})
