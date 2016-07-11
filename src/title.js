var css = require('dom-css')

module.exports = function Title (opts) {
	if (!(this instanceof Title)) return new Title(opts);

	this.title = opts.container.appendChild(document.createElement('h2'));
	this.title.innerHTML = opts.value;
	this.title.className = 'settings-panel-title';
}
