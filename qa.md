# Q: should we separate active color?
+ Makes sense for flat
+ Makes sense for typer
+ Unseful for control
* Bearable for dragon
* Possible to autodetect active color from palette, if undefined.
+ Expands palette to full range
+ Enables need in component enabler
* funny thing is that many schemes have active color in between edges, it is contrast to all of edge values.
	* Also edge values seem good working for labels/title as it increase readability due to contrast, but active color highlights, it does not make things contrast.
	* Also too often we don’t need brightness relationship between label/title/bg, because as far bg can be transparent, we can manage to do bw scale via opacity.
	✔~ Therefore initial idea of picking active color from the middle may be good. As far as we avoid `active` option and put things back to single palette.

# Q: what are good theme principles?
* It should look good in bw and inverse bw
	→ don’t do bg gray, gray is property of palette, not the step. bg should allow for accents, but be on the edge, like .8, .9 etc.
	? how do we do lighting? b/w or edge palette colors?
* It should be able to reach maximum contrast in bw mode
	→
* Bg, active color should be easily changeable
	→ therefore bg and active are the opposites
* It should respond to interactions: hover, focus, active etc., by highlighting active element.
* It should be able to change scale gracefully, i. e. keeping select size, thumbnails, etc consistent.

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