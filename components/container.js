var css = require('dom-css')
var format = require('param-case')

module.exports = function (root, label) {
  var container = root.appendChild(document.createElement('div'))
  container.id = 'control-panel-' + format(label)
  css(container, {
    position: 'relative',
    minHeight: '2em',
    lineHeight: '1',
    marginBottom: '.5em',
  })
  return container
}
