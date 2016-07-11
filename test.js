var createPanel = require('./')

// prepare mobile
var meta = document.createElement('meta')
meta.setAttribute('name', 'viewport')
meta.setAttribute('content', 'width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=0')
document.head.appendChild(meta)


var panel = createPanel([
	{type: 'title', value: 'Example panel'},
	{type: 'title', value: 'Range'},
	{type: 'range', label: 'range slider', min: 0, max: 100, value: 20, help: 'Default slider'},
	{type: 'range', label: 'range stepped', min: 0, max: 1, step: 0.2, value: 0.6},
	{type: 'range', scale: 'log', label: 'range slider (log)', min: 0.01, max: 100, value: 1},
	{type: 'range', scale: 'log', label: 'range stepped (log)', min: 0.01, max: 100, steps: 10, value: 1},
	{type: 'range', scale: 'log', label: 'range slider (-log)', min: -0.01, max: -100, value: -1},
	{type: 'range', scale: 'log', label: 'range stepped (-log)', min: -0.01, max: -100, steps: 10, value: -1},
	{type: 'title', value: 'Text'},
	{type: 'text', label: 'text', value: 'my setting'},
	// {type: 'checkbox', label: 'checkbox', value: true},
	{type: 'title', value: 'Color'},
	{type: 'color', label: 'color rgb', format: 'rgb', value: 'rgb(100,200,100)'},
	{type: 'color', label: 'color hex', format: 'hex', value: '#30b2ba'},
	// {type: 'button', label: 'gimme an alert', action: function () { window.alert('hello!') }},
	// {type: 'interval', label: 'an interval', min: 0, max: 10, value: [3, 4], steps: 20},
	// {type: 'interval', label: 'log interval', min: 0.1, max: 10, value: [0.1, 1], scale: 'log', steps: 20},
	// {type: 'interval', label: 'neg log interval', min: -0.1, max: -10, value: [-0.1, -1], scale: 'log', steps: 20},
	// {type: 'range', label: 'one more', min: 0, max: 10},
	// {type: 'select', label: 'key/value select', options: {state1: 'State One', state2: 'State Two'}, value: 'state1'},
	// {type: 'select', label: 'array select', options: ['State One', 'State Two'], value: 'State One'},
	// {type: 'email', label: 'email'}
])

panel.on('input', function (data) {
	console.log(data)
})
