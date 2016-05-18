var control = require('./')

var panel = control([
  {type: 'range', label: 'range slider', min: 0, max: 100, initial: 20},
  {type: 'range', label: 'range stepped', min: 0, max: 1, step: 0.2, initial: 0.6},
  {type: 'range', scale: 'log', label: 'range slider (log)', min: 0.01, max: 100, initial: 1},
  {type: 'range', scale: 'log', label: 'range stepped (log)', min: 0.01, max: 100, steps: 10, initial: 1},
  {type: 'range', scale: 'log', label: 'range slider (-log)', min: -0.01, max: -100, initial: -1},
  {type: 'range', scale: 'log', label: 'range stepped (-log)', min: -0.01, max: -100, steps: 10, initial: -1},
  {type: 'text', label: 'text', initial: 'my setting'},
  {type: 'checkbox', label: 'checkbox', initial: true},
  {type: 'color', label: 'color rgb', format: 'rgb', initial: 'rgb(100,200,100)'},
  {type: 'color', label: 'color hex', format: 'hex', initial: '#30b2ba'},
  {type: 'button', label: 'gimme an alert', action: function () { alert('hello!'); }},
  {type: 'interval', label: 'an interval', min: 0, max: 10, initial: [3, 4], steps: 20},
  {type: 'interval', label: 'log interval', min: 0.1, max: 10, initial: [0.1, 1], scale: 'log', steps: 20},
  {type: 'interval', label: 'neg log interval', min: -0.1, max: -10, initial: [-0.1, -1], scale: 'log', steps: 20},
  {type: 'range', label: 'one more', min: 0, max: 10}
],
  {theme: 'light', title: 'example panel', position: 'top-left', width: 400}
)

panel.on('input', function (data) {
  console.log(data)
})
