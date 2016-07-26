const num = require('input-number');

module.exports = function (opts) {
  opts = opts || {}
  var value = document.createElement('input')

  num(value, opts);

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

  if (opts.disabled) value.disabled = true;

  value.value = opts.value

  if (opts.id) value.id = opts.id;
  value.className = 'settings-panel-value';
  if (opts.className) value.className += ' ' + opts.className;
  opts.container.appendChild(value)

  return value
}
