var control = require('../')

document.body.style.background = 'rgb(150,150,150)'
var div1 = document.body.appendChild(document.createElement('div'))
div1.style.marginBottom = '10px'
var div2 = document.body.appendChild(document.createElement('div'))

var inputs = [
  {type: 'range', label: 'range slider', min: 0, max: 100, initial: 20},
  {type: 'range', label: 'range stepped', min: 0, max: 1, step: 0.2},
  {type: 'text', label: 'text', initial: 'my setting'},
  {type: 'checkbox', label: 'checkbox', initial: true},
  {type: 'color', label: 'color rgb', format: 'rgb', initial: 'rgb(100,200,100)'},
  {type: 'color', label: 'color hex', format: 'hex', initial: '#30b2ba'},
  {type: 'range', label: 'one more', min: 0, max: 10}
]

control(inputs,
  {theme: 'light', title: 'example panel 1', root: div1}
)

control(inputs,
  {theme: 'dark', title: 'example panel 2', root: div2}
)
