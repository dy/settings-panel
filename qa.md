# Q: what is the minimal and easiest way to cover all the use-cases?
* 1. Redefine properties on per-component basis, like label-position, field-style, item-style etc.
* 2. type=group or type=row
	+ grouping fields into a row
	+ customizing background
* 3. type=custom
	+ cover titles h1..h6
	+ cover br's
* 4. type=panel, for nested panels
	- possible to fold into type=custom
		+ type=custom does not make a big sense, it is rather rare exception, like canvas etc
	+ grouping tasks
	+ theme recustomization
	+ label-position, field-style is solved on per-theme basis
	+ allows for enabling inner panel
* 5. per-component theme update - let components decide their look based on theme
	- firbids user component customization

# Q: should title be a separate element, or not?
* + it allows for inserting multiple titles
	- multiple titles wants be styles in custom way, ideally h2/h3
* - is is discrepancy with control-panel
* + it makes title in code visually easier to find
* - title is not really a field
* - subgroups are better done in subpanels

# Q: what is the optimal way to organize themes?
* use themes/*.js with functions, returning dynamic css based off variables
* use palette instead of picked colors to allow for dynamic switching without theme change.