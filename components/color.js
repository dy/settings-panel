var EventEmitter = require('events').EventEmitter
var ColorPicker = require('simple-color-picker')
var inherits = require('inherits')
var css = require('dom-css')
var tinycolor = require('tinycolor2')

module.exports = Color
inherits(Color, EventEmitter)

function Color (root, opts, theme) {
  if (!(this instanceof Color)) return new Color(root, opts, theme)
  opts = opts || {}
  opts.format = opts.format || 'rgb'
  opts.initial = opts.initial || '#123456'
  console.log(opts)
  var self = this

  var container = require('./container')(root)
  require('./label')(container, opts.label, theme)

  var icon = container.appendChild(document.createElement('span'))
  icon.id = 'color-icon-' + opts.label

  var value = require('./value')(container, '', theme, '43%')

  icon.onmouseover = function () {
    picker.$el.style.display = ''
  }

  var initial = opts.initial
  switch (opts.format) {
    case 'rgb':
      initial = tinycolor(initial).toHexString()
      break
    case 'hex':
      initial = tinycolor(initial).toHexString()
      break
    case 'array':
      initial = tinycolor.fromRatio({r: initial[0], g: initial[1], b: initial[2]}).toHexString()
      break
    default:
      break
  }

  var picker = new ColorPicker({
    el: icon,
    color: initial,
    background: theme.background1,
    width: 125,
    height: 100
  })

  css(picker.$el, {
    marginTop: '20px',
    display: 'none',
    position: 'absolute'
  })

  css(icon, {
    position: 'relative',
    display: 'inline-block',
    width: '12%',
    height: '20px',
    backgroundColor: picker.getHexString()
  })

  icon.onmouseout = function (e) {
    console.log(e)
    picker.$el.style.display = 'none'
  }

  picker.onChange( function (hex) {
    value.innerHTML = format(hex)
    css(icon, {backgroundColor: hex})
    self.emit('input', format(hex))
  })

  function format (hex) {
    switch (opts.format) {
      case 'rgb':
        return tinycolor(hex).toRgbString()
      case 'hex':
        return tinycolor(hex).toHexString()
      case 'array':
        var rgb = tinycolor(hex).toRgb()
        return [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(function (x) {return x.toFixed(2)})
      default:
        return hex
    }
  }
}
