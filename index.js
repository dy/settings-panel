var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var fs = require('fs')
var insertCss = require('insert-css')
var path = require('path')
console.log(path.join(__dirname, 'components', 'style.css'))
var css = fs.readFileSync(path.join(__dirname, 'components', 'style.css'))
insertCss(css)

module.exports = Plate
inherits(Plate, EventEmitter)

function Plate (items, opts) {
  if (!(this instanceof Plate)) return new Plate(items, opts)
  var self = this
  var root = document.body.appendChild(document.createElement('div'))

  var components = {
    text: require('./components/text'),
    range: require('./components/range'),
    checkbox: require('./components/checkbox'),
    color: require('./components/color')
  }

  var element

  items.forEach( function (item) {
    console.log(item.type)
    element = components[item.type](root, item)
    element.on('input', function (data) {
      self.emit('input', data)
    })
  })
}
// create a container
// create a state
// for each input, add an element
// each element should have an event listener
// for each one, set a listener to reset the state and emit the current state