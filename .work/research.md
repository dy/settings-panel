## Vision

* Parameter controls that are presentation-ready, not just functional.
* Each combination of any theme params should look beautiful
* Controls designed for purpose that _feel right_.
	* Log slider that *is* logarithmic
	* Palette picker that *understands* color
	* XY pad with pointerlock precision
	* Waveform display that *knows* audio
	* Font picker that *knows* font

## Principles

	* Quality > quantity
	* Each type crafted for its purpose
	* Resist feature-count pressure
	* No React lock-in, no plugin ecosystem complexity

## Technical Direction

	* Signals-based reactivity
	* 0 dependencies
	* Framework-agnostic (vanilla JS, sprae-compatible)
	* Open, minimal API

## [ ] What are good theme principles?

	* It should look good in bw and inverse bw
		→ don’t do bg gray, gray is property of palette, not the step. bg should allow for accents, but be on the edge, like .8, .9 etc.
		? how do we do lighting? b/w or edge palette colors?
	* It should be able to reach maximum contrast in bw mode
		→
	* Bg, active color should be easily changeable
		→ therefore bg and active are the opposites
	* It should respond to interactions: hover, focus, active etc., by highlighting active element.
	* It should be able to change scale gracefully, i. e. keeping select size, thumbnails, etc consistent.

## [ ] What is the minimal and easiest way to cover all the use-cases?

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

## [ ] Comprehensive Component Analysis (from alternatives)

	## Raw list (all libraries combined)

	### Core Inputs
	- **Number**: text input, spinner, stepper (lil-gui, tweakpane, leva, controlkit)
	- **Slider**: horizontal range with min/max (all)
	- **Range/Interval**: two-handle slider [min, max] (tweakpane essentials, leva)
	- **String/Text**: single-line input (all)
	- **Textarea**: multiline text (lil-gui, settings-panel)
	- **Boolean/Checkbox**: toggle (all)
	- **Select/Dropdown**: options list (all)
	- **Color**: picker with formats (hex, rgb, hsl, hsv, rgba) (all)
	- **Button**: action trigger (all)

	### Vectors/Points
	- **Point2D/Vec2**: x,y with optional pad (tweakpane, leva, controlkit)
	- **Point3D/Vec3**: x,y,z (tweakpane, leva)
	- **Point4D/Vec4**: x,y,z,w (tweakpane)

	### Specialized
	- **Image**: file upload/drop (leva)
	- **Graph/Monitor**: value over time (tweakpane, controlkit)
	- **FPS graph**: performance monitor (tweakpane essentials)
	- **Bezier/Cubic**: curve editor (tweakpane essentials, leva plugin)
	- **Button group/grid**: multiple actions (leva, tweakpane essentials)
	- **Radio grid**: option matrix (tweakpane essentials)
	- **Camera ring**: aperture/focal (tweakpane camerakit)

	### Containers
	- **Folder/Group**: collapsible (all)
	- **Tab**: tabbed sections (tweakpane)
	- **Panel**: root container (all)
	- **Separator**: visual divider (tweakpane)

	### From README wishlist
	- password, pin
	- gradient, swatches
	- font picker
	- date, time, datetime
	- joystick, knob, wheel
	- pad (xy)
	- curve, path
	- histogram, eq, spectrum, wave
	- spring physics
	- matrix
	- file, bitmap, audio, media
	- piano, playback
	- list, key-value, code/json

	## Clustering: What's fundamentally different?

	1. **Primitives** (single value)
		- number, text, boolean → 3 atomic types

	2. **Constrained number**
		- slider (range), stepper → variants of number

	3. **Choice**
		- select, radio → pick from options

	4. **Color**
		- needs picker, format handling → specialized number tuple

	5. **Vector**
		- 2d, 3d, 4d → array of numbers with optional UI (pad, joystick)

	6. **Range/Interval**
		- [min, max] pair → specialized vector

	7. **Action**
		- button, button group → triggers

	8. **Text variants**
		- textarea, password, code → specialized string

	9. **Media**
		- image, file, audio → binary/blob handling

	10. **Time-series**
			- graph, monitor, fps → read-only visualization

	11. **Curves**
			- bezier, gradient, path → complex editors

	12. **Container**
			- folder, tab → grouping

	## Final Strategy: 12 Components

	### 1. `number`
	Single numeric value input.

	| Type | Description |
	|------|-------------|
	| `input` | Text field with arrows (default) |
	| `stepper` | Increment/decrement buttons only |
	| `spinner` | Compact up/down arrows |

	**Options**: `min`, `max`, `step`, `precision`, `unit` (px, %, deg), `format` (fn)

	### 2. `slider`
	Constrained numeric with visual track.

	| Type | Description |
	|------|-------------|
	| `linear` | Standard slider (default) |
	| `log` | Logarithmic scale (audio gain, frequency) |
	| `exp` | Exponential curve |
	| `range` | Two handles [min, max] interval |
	| `steps` | Discrete stops (like piano keys) |
	| `marks` | Labeled tick marks |

	**Options**: `min`, `max`, `step`, `origin` (center point), `vertical`, `pointerLock` (infinite drag)

	**Signature feature**: Log slider that *feels* logarithmic.

	### 3. `text`
	String/text value input.

	| Type | Description |
	|------|-------------|
	| `input` | Single line (default) |
	| `textarea` | Multiline, auto-grow |
	| `password` | Masked input |
	| `pin` | Fixed-length masked (OTP style) |
	| `code` | Monospace, basic highlighting |
	| `json` | JSON with validation |

	**Options**: `placeholder`, `maxlength`, `rows`, `pattern`, `validate` (fn), `format` (language hint)

	### 4. `boolean`
	True/false toggle.

	| Type | Description |
	|------|-------------|
	| `checkbox` | Standard checkbox (default) |
	| `toggle` | iOS-style switch |
	| `switch` | Labeled on/off switch |
	| `button` | Press-to-toggle button |

	**Options**: `labels` (on/off text)

	### 5. `select`
	Choice from predefined options.

	| Type | Description |
	|------|-------------|
	| `dropdown` | Standard select (default) |
	| `radio` | Radio button group |
	| `buttons` | Button toggle group |
	| `segmented` | iOS-style segmented control |
	| `search` | Filterable dropdown |
	| `multi` | Multiple selection (tags) |
	| `checkboxes` | Checkbox group |

	**Options**: `options` (array or {label: value}), `searchable`, `creatable` (allow new values)

	### 6. `color`
	Color value in various formats.

	| Type | Description |
	|------|-------------|
	| `picker` | Full color picker (default) |
	| `swatch` | Click to open picker |
	| `swatches` | Preset palette selection |
	| `gradient` | Linear/radial gradient editor |
	| `palette` | Extract/generate palette |

	**Options**: `format` (hex, rgb, hsl, hsv), `alpha`, `presets` (array of colors)

	**Signature feature**: Palette picker that *understands* color.

	### 7. `vector`
	Multi-dimensional numeric values.

	| Type | Description |
	|------|-------------|
	| `inputs` | N number inputs in row (default) |
	| `pad` | 2D XY pad with crosshair |
	| `joystick` | Spring-return 2D controller |
	| `lock` | Linked/proportional values |

	**Options**: `dimensions` (2-4), `labels` (x,y,z,w), `min`, `max`, `step`, `pointerLock` (infinite drag)

	**Signature feature**: Pointerlock trackpad for precision.

	### 8. `button`
	Action triggers.

	| Type | Description |
	|------|-------------|
	| `button` | Single action (default) |
	| `group` | Horizontal button row |
	| `split` | Primary + dropdown menu |
	| `toggle` | Stateful press/release |

	**Options**: `label`, `icon`, `disabled`, `confirm` (require double-click)

	### 9. `file`
	File/media input.

	| Type | Description |
	|------|-------------|
	| `file` | File picker (default) |
	| `image` | Image with preview |
	| `audio` | Audio with waveform preview |
	| `drop` | Drag-drop zone |
	| `paste` | Paste from clipboard |

	**Options**: `accept` (mime types), `multiple`, `maxSize`, `preview`

	### 10. `graph`
	Read-only visualization.

	| Type | Description |
	|------|-------------|
	| `line` | Time-series line graph (default) |
	| `waveform` | Audio waveform display |
	| `spectrum` | Frequency spectrum |
	| `meter` | VU meter / level indicator |
	| `fps` | FPS counter with history |

	**Options**: `min`, `max`, `history` (buffer size), `color`, `fill`

	**Signature feature**: Waveform that *knows* audio.

	### 11. `folder`
	Grouping and organization.

	| Type | Description |
	|------|-------------|
	| `folder` | Collapsible group (default) |
	| `section` | Non-collapsible header group |
	| `tabs` | Tabbed container |
	| `row` | Inline horizontal group |

	**Options**: `collapsed`, `label`, `icon`

	### 12. `canvas`
	Custom/special rendering.

	| Type | Description |
	|------|-------------|
	| `custom` | User-provided render function |
	| `bezier` | Cubic bezier curve editor |
	| `bitmap` | Pixel editor |
	| `info` | Read-only text/HTML display |
	| `separator` | Visual divider line |

	**Options**: `render` (fn), `width`, `height`


	## Extension Mechanism

	For specialized needs beyond 12 core:

	```js
	// Register custom component
	settings.register('piano', {
		render: (value, onChange) => ...,
		parse: (input) => ...,
	})

	// Use it
	settings({ bpm: { type: 'piano', value: 120 } })
	```

	**Candidates for plugins**:
	- `date` / `time` / `datetime`
	- `piano` (musical keyboard)
	- `font` (font family picker)
	- `spring` (physics params)
	- `path` (SVG path editor)

	## Coverage Matrix

	| Use case | Component | Type |
	|----------|-----------|------|
	| Volume control | slider | log |
	| Theme colors | color | swatches |
	| BPM setting | slider | steps |
	| File upload | file | drop |
	| Position | vector | pad |
	| Rotation | slider | marks (0-360) |
	| Enable/disable | boolean | toggle |
	| Quality preset | select | segmented |
	| Gain (dB) | slider | log |
	| Frequency range | slider | range + log |
	| Code snippet | text | code |
	| Action button | button | button |
	| Settings group | folder | folder |

	### Core Philosophy
	> 12 components × N types = 99% coverage.
	> Plugin mechanism for the exotic 1%.
	> Each type crafted for its purpose.


## How to infer types from primitives?**
```js
// Should this work?
settings({
  enabled: true,              // → boolean toggle
  volume: 0.5,                // → slider (0-1 detected?)
  name: 'hello',              // → text input
  color: '#ff0000',           // → color picker
  position: [0, 0],           // → vector 2d
  mode: ['a', 'b', 'c'],      // → select (first = value, rest = options?)
})
```
