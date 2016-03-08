var EventEmitter = require('events').EventEmitter
var ColorPicker = require('simple-color-picker')
var inherits = require('inherits')

module.exports = Color
inherits(Color, EventEmitter)

function Color (root, opts) {
  if (!(this instanceof Color)) return new Color(root, opts)
  var self = this

  var container = root.appendChild(document.createElement('div'))

  var label = container.appendChild(document.createElement('span'))
  label.innerHTML = opts.label

  var icon = container.appendChild(document.createElement('span'))
  icon.id = 'color-icon-' + opts.label
  icon.style.position = 'relative'
  icon.style.display = 'inline-block'
  icon.style.width = '20px'
  icon.style.height = '20px'
  icon.style.backgroundColor = 'red'

  var value = container.appendChild(document.createElement('span'))
  value.innerHTML = ''

  icon.onmouseover = function () {
    picker.$el.style.display = ''
  }

  // window.onclick = function (e) {
  //   var isicon = e.srcElement.id === 'color-icon-' + opts.label
  //   var ispicker = e.srcElement.className.indexOf('Scp') > -1
  //   if (!(isicon || ispicker)) picker.$el.style.display = 'none'
  // }

  var picker = new ColorPicker({
    el: icon,
    color: '#123456',
    background: '#656565',
    width: 125,
    height: 100
  })
  picker.$el.style.marginTop = '20px'
  picker.$el.style.display = 'none'
  picker.$el.style.position = 'absolute'

  icon.onmouseout = function (e) {
    picker.$el.style.display = 'none'
  }

  picker.onChange(function(hexStringColor) {
    console.log(String(picker.getRGB().r))
    var rgb = picker.getRGB()
    value.innerHTML = '(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')'
  })
  picker.on('input', function (data) {
    self.emit('input', data)
  })
}
