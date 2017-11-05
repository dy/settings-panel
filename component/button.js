'use strict';


module.exports = function button (opts) {
	var input = opts.container.querySelector('.settings-panel-button');
	if (!input) {
		this.element = input = opts.container.appendChild(document.createElement('button'))
		input.className = 'settings-panel-button';
		input.addEventListener('click', (e) => {
			e.preventDefault();
			this.emit('input');
			this.emit('action');
		})
	}

	this.update(opts);
}

Button.prototype.update = function (opts) {
	this.element.innerHTML = opts.value || opts.label;
	return this;
};

Button.prototype.label = false;
