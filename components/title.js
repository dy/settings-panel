var css = require('dom-css')

module.exports = function (root, text, theme) {
  var title = root.appendChild(document.createElement('div'))
  title.innerHTML = text

  css(title, {
    width: '100%',
    textAlign: 'center',
    color: theme.text2,
    textTransform: 'uppercase',
    height: '20px',
    marginBottom: '4px'
  })

  return title
}
