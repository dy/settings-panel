var css = require('dom-css')

module.exports = function (root, text, theme) {
  var background = root.appendChild(document.createElement('div'))
  css(background, {
    left: 0,
    width: '40%',
    display: 'inline-block',
    height: '20px',
    paddingRight: '2%',
    verticalAlign: 'top'
  })

  var label = background.appendChild(document.createElement('span'))
  label.innerHTML = text
  css(label, {
    color: theme.text1,
    display: 'inline-block',
    verticalAlign: 'sub'
  })
  return label
}