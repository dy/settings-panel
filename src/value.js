var css = require('dom-css')

module.exports = function (opts) {
  opts = opts || {}
  var value = document.createElement('input')
  value.setAttribute('type', opts.type || 'text')

  if (opts.type === 'number') {
    if (opts.min != null) value.min = opts.min
    if (opts.max != null) value.max = opts.max
    if (opts.step != null) value.step = opts.step
    else value.step = (opts.max - opts.min) / 100 || 1
  }

  if (opts.input) {
    value.addEventListener('input', function () {
      opts.input(value.value)
    })
  }
  if (opts.change) {
    value.addEventListener('change', function () {
      opts.change(value.value)
    })
  }

  value.value = opts.value

  value.id = opts.id;
  value.className = 'settings-panel-value';
  opts.container.appendChild(value)

  // if (!opts.left) {
  //   bgcss.right = 0
  // }

  return value
}
