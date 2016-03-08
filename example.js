var plate = require('./')

var el = plate([
  {type: 'range', label: 'option 1', min: 0, max: 100, step: 20},
  {type: 'range', label: 'option 1', min: 0, max: 1},
  {type: 'text', label: 'option 3'},
  {type: 'checkbox', label: 'option 4'},
  {type: 'color', label: 'option 5'},
  {type: 'range', label: 'option 2', min: 0, max: 10}
])

el.on('input', function (data) {

})

// el.on('change', function (data) {
//   console.log(data)
// })