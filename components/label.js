var css = require('dom-css')

module.exports = function (root, text, theme) {
  var background = root.appendChild(document.createElement('label'))
  background.for = '';
  css(background, {
    left: 0,
    width: '36%',
    display: 'inline-block',
    paddingTop: '.2em',
    lineHeight: '1.5',
    paddingRight: '2%',
    verticalAlign: 'top'
  })

  var label = background.appendChild(document.createElement('span'))
  label.innerHTML = text
  css(label, {
    color: theme.text1,
    display: 'inline-block',
    verticalAlign: 'top'
  })
  return label
}
