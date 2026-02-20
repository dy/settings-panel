## [ ] MVP

* [x] Theme: default (size calibrator)
  * [x] width bug
  * [x] inverse color logic
  * [x] disable inactive axes
  * [x] centralize
  * [x] size/spacing: should be well-done, not hardcoded
  * [x] log ticks: should match datalist properly
  * [ ] on par with skeu: swap is flawless
* [ ] Theme: Skeu
  * [x] tweets best practices
  * [x] depth
  * [x] buttons
  * [x] grid
  * [x] font
  * [ ] grain: texture that can be animated
  * [ ] calibrate & test: jhey, examples from screenshots
  * [ ] sound?: gentle ticks on slider ticks - can be customized (clock ticks, macos ticks etc)

* [ ] showcase page

* [ ] pasting code must update axis values in JSON
* [ ] make slider native option sync (defines form of slider) - need to load properly
* [x] close / fold button
* [x] title
* [ ] animations
* [ ] better weight control (slider weight)
* [ ] Theme: Figma
* [ ] Theme: Neu
* [ ] Theme: Studio (figma, control-panel, mo)
* [ ] Theme: Aurora: Mesh gradients, flowing soft color blobs
* [ ] Theme: Flat/Material: no depth, solid colors, geometry + material: elevations
* [ ] Theme: Brutal: Raw, harsh, exposed structure, anti-polish
* [ ] ~12 core high-quality controls
  * [ ] make sure they properly update state
* [ ] demo with showcase and self-customization
* [ ] research opening strategies
* [ ] `help` property for tooltip
* [x] `disabled` param

## Docs (README/docs out of sync with code)

* [ ] README: "10 themes" → only default + skeu exist
* [ ] README: "11 axes" → actual params are shade/accent/spacing/size/weight/roundness + skeu adds contrast/depth/relief/grid
* [ ] README: theme table lists 8 nonexistent themes (soft, swiss, classic, terminal, industrial, brutal, glass, retro)
* [x] README: `import soft from 'settings-panel/theme/soft'` → soft doesn't exist
* [x] README: `lightness: 0.13` → param is `shade` (hex color), not `lightness` (0-1)
* [ ] README: `key: 'h'` option → not implemented
* [ ] README: `color format: 'hsl'` → not implemented
* [ ] README: `0.5` listed under number inference → actually infers as slider
* [ ] README: `textarea` missing from controls table (hidden under text)
* [ ] docs/options.md: title default listed as 'Settings' → actually undefined
* [ ] docs/options.md: theme default listed as 'soft' → actually base/default
* [ ] docs/options.md: `key` option documented but doesn't exist
* [ ] docs/options.md: `import { soft } from 'settings-panel/theme'` → no such export
* [ ] docs/axes.md: lists 12 axes, README says 11, neither matches implementation
* [ ] docs/controls.md: research doc with aspirational controls (knob, vector, font, file, graph, curve, etc) — move to .work/ or .planning/

## Cases

* [ ] Figma
* [ ] dat.gui+
* [ ] Apples
* [ ] refactoring.ui
* [ ]

## Ideas

* [ ] contrast = roundness contrast as well? (rounded button, square shape)
* [ ] breath: pulse on focused controls, shadow oscillation on hover
* [ ] spring?: sliders overshoot
* [ ] reflected light?
* [ ] canonical internal structure (form)
  * [ ] produced HTML/theme can be used for generic forms design
  * [ ] minimal base.css generator for websites
