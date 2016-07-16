const num = require('input-number');

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
  else {
    num(value, opts);
  }

  if (opts.input) {
    value.addEventListener('input', function () {
      let v = value.value;
      if (opts.type === 'number') v = parseFloat(v);
      opts.input(v)
    })
  }
  if (opts.change) {
    value.addEventListener('change', function () {
      let v = value.value;
      if (opts.type === 'number') v = parseFloat(v);
      opts.change(v)
    })
  }

  value.value = opts.value

  value.id = opts.id;
  value.className = 'settings-panel-value';
  opts.container.appendChild(value)

  return value
}
