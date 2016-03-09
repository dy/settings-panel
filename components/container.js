var css = require('dom-css')

module.exports = function (root) {
  var container = root.appendChild(document.createElement('div'))
  css(container, {
    position: 'relative',
    height: '25px'
  })
  return container
}