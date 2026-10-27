// Theme registry for the gallery: one entry per shipped theme (Native light shows each
// theme's own defaults; a transparent theme declares the `ground` it sits on), plus the shared
// colormap/accent/font vocabulary the Look bar offers. Adding a theme is a pure
// data addition here – no other gallery file needs to change.
import devtools from '../theme/devtools.js'
import soft from '../theme/default.js'
import glass from '../theme/glass.js'
import neu from '../theme/neu.js'
import brutal from '../theme/brutal.js'
import swiss from '../theme/swiss.js'
import skeu from '../theme/skeu.js'
import matte from '../theme/matte.js'
import lab01 from '../theme/lab01.js'
import porcelain from '../theme/porcelain.js'
import terminal from '../theme/terminal.js'
import dat from '../theme/dat.js'
import tweakpane from '../theme/tweakpane.js'
import leva from '../theme/leva.js'
import controlkit from '../theme/controlkit.js'
import uil from '../theme/uil.js'
import oui from '../theme/oui.js'
import figma from '../theme/figma.js'
import apple from '../theme/apple.js'
import controlPanel from '../theme/control-panel.js'
import studio from '../theme/studio.js'
import editorial from '../theme/editorial.js'
import synth from '../theme/synth.js'
import imgui from '../theme/imgui.js'
import retro from '../theme/retro.js'
import bitmap from '../theme/bitmap.js'
import json from '../theme/json.js'
import industrial from '../theme/industrial.js'
import dialkit from '../theme/dialkit.js'

// Every "originals" theme reads a weight axis (100–900, native varies) – declared once, spread in.
const weight = (native) => ({ key: 'weight', label: 'Weight', min: 100, max: 900, step: 100, default: native })

export const themes = [
  { id: 'lab01', name: 'Lab01', fn: lab01, surface: 'glass', axes: 'accent spacing roundness size', description: 'Frosted surfaces, fine bevels, and a little reflection.',
    extras: [weight(400), { key: 'noise', label: 'Noise', type: 'boolean', default: true }] },
  { id: 'glass', name: 'Glass', fn: glass, surface: 'glass', axes: 'accent spacing roundness size ink', description: 'Translucent layers. Light passing through the controls.',
    extras: [weight(400), { key: 'depth', label: 'Depth', min: 0, max: 2, step: .1, default: 1 }, { key: 'blur', label: 'Blur', min: 0, max: 48, step: 1, default: 24, unit: 'px' }, { key: 'tint', label: 'Tint', min: 0, max: 1, step: .05, default: 1 }] },
  { id: 'studio', name: 'Studio', fn: studio, axes: 'spacing roundness size', description: 'The row is the instrument: labels ride the fill, values edit in place.',
    extras: [weight(500)] },
  { id: 'synth', name: 'Synth', fn: synth, axes: 'accent spacing size', description: 'Each group in its own colour on quiet white cards: hairline tracks, ring thumbs.',
    extras: [weight(400)] },
  { id: 'neu', name: 'Neu', fn: neu, axes: 'accent spacing roundness size texture ink', description: 'One soft material, shaped by light and shadow.',
    extras: [weight(500), { key: 'depth', label: 'Depth', min: 0, max: 2, step: .1, default: 1 }, { key: 'softness', label: 'Softness', min: 0, max: 2, step: .1, default: 1 }, { key: 'contrast', label: 'Contrast', min: 0, max: 2, step: .1, default: 1 }, { key: 'light', label: 'Light angle', min: 0, max: 360, step: 5, default: 0, unit: '°' }, { key: 'grain', label: 'Grain', min: 0, max: 1, step: .05, default: .3 }] },
  { id: 'editorial', name: 'Editorial', fn: editorial, axes: 'accent spacing size', description: 'A reader\'s settings sheet: an ink frame, hairline rules, typographic choices.',
    extras: [weight(700), { key: 'rule', label: 'Rule weight', min: .5, max: 3, step: .5, default: 1, unit: 'px' }] },
  { id: 'brutal', name: 'Brutal', fn: brutal, axes: 'accent spacing size', description: 'Solid ink, paper plates, and a decisive press.',
    extras: [weight(500), { key: 'bevel', label: 'Border', min: 1, max: 6, step: 1, default: 2, unit: 'px' }, { key: 'offset', label: 'Shadow offset', min: 0, max: 12, step: 1, default: 4, unit: 'px' }, { key: 'grain', label: 'Halftone', min: 0, max: 1, step: .05, default: 0 }] },
  { id: 'swiss', name: 'Swiss', fn: swiss, ground: '#4a4a4a', axes: 'accent spacing size', description: 'Transparent fields, fine rules, and contrasting type.',
    extras: [weight(500), { key: 'hairline', label: 'Rule weight', min: .5, max: 3, step: .5, default: 1, unit: 'px' }, { key: 'scale', label: 'Type scale', min: .8, max: 1.4, step: .05, default: 1 }] },
  { id: 'skeu', name: 'Skeu', fn: skeu, axes: 'accent spacing roundness size texture ink', description: 'Keycaps cut from one material, engraved wells.',
    extras: [weight(400), { key: 'depth', label: 'Depth', min: 0, max: 2, step: .1, default: 1 }, { key: 'bevel', label: 'Edge crispness', min: 0, max: 2, step: .1, default: 1 }, { key: 'grid', label: 'Grid', type: 'select', options: ['none', 'dots', 'lines', 'crosses'], default: 'none' }] },
  { id: 'matte', name: 'Matte', fn: matte, axes: 'accent spacing roundness size', description: 'One matte plate: low domed keys, shallow wells.',
    extras: [weight(400), { key: 'depth', label: 'Depth', min: 0, max: 2, step: .1, default: 1 }, { key: 'bevel', label: 'Edge crispness', min: 0, max: 2, step: .1, default: 1 }, { key: 'grid', label: 'Grid', type: 'select', options: ['none', 'dots', 'lines', 'crosses'], default: 'none' }] },
  { id: 'porcelain', name: 'Porcelain', fn: porcelain, surface: 'porcelain', axes: 'accent spacing roundness size', description: 'A glazed ceramic face, set into a pale mineral frame.',
    extras: [weight(500), { key: 'bevel', label: 'Lip', min: 0, max: 2, step: .1, default: 1 }, { key: 'grain', label: 'Relief', min: 0, max: 2, step: .1, default: 1 }] },
  { id: 'soft', file: 'default', name: 'Soft', fn: soft, axes: 'accent spacing roundness size texture ink', description: 'Gentle edges and familiar, understated controls.',
    extras: [weight(400)] },
  { id: 'retro', name: 'Retro', fn: retro, axes: 'accent spacing size', description: 'Raised and sunken bevels in border colour, system grey, pixel type.',
    extras: [weight(400)] },
  { id: 'bitmap', name: 'Bitmap', fn: bitmap, axes: 'accent spacing size', description: 'Two inks, dithered greys, and the 1-bit Macintosh\'s own pixels.',
    extras: [weight(400)] },
  { id: 'industrial', name: 'Industrial', fn: industrial, axes: 'accent spacing size', description: 'A chassis of modules: printed labels, white keys, faders, encoders, LEDs and a black screen.',
    extras: [weight(400)] },
  { id: 'terminal', name: 'Terminal', fn: terminal, axes: 'accent spacing size', description: 'A character grid, crisp rules, and luminous type.',
    extras: [weight(400), { key: 'leading', label: 'Line height', min: 1.2, max: 2.4, step: .1, default: 1.6 }] },
  { id: 'json', name: 'JSON', fn: json, axes: 'accent spacing size', description: 'The state as the JSON it is: keys, literals and braces, every value editable in place.', extras: [] },
  { id: 'devtools', name: 'DevTools', fn: devtools, classic: true, axes: 'accent spacing size', description: 'Editable declarations, syntax-colored values, and a compact code rhythm.', extras: [] },
  { id: 'dat', name: 'dat.gui', fn: dat, classic: true, axes: 'accent spacing size', description: 'The compact controller for creative coding.', extras: [] },
  { id: 'imgui', name: 'Dear ImGui', fn: imgui, classic: true, axes: 'accent spacing size', description: 'The immediate-mode tool window: filled frames, a pixel font, labels on the right.', extras: [] },
  { id: 'tweakpane', name: 'Tweakpane', fn: tweakpane, classic: true, axes: 'spacing size', description: 'Quiet grey instruments and precise, compact controls.', extras: [] },
  { id: 'dialkit', name: 'DialKit', fn: dialkit, classic: true, axes: 'spacing size', description: 'Rows that are their own sliders, in one quiet ink.', extras: [] },
  { id: 'leva', name: 'Leva', fn: leva, classic: true, axes: 'accent spacing size', description: 'Deep blue-grey surfaces and bright interactive details.', extras: [] },
  { id: 'controlkit', name: 'ControlKit', fn: controlkit, classic: true, axes: 'accent spacing size', description: 'Dark fields, sharp geometry, and a red signal.', extras: [] },
  { id: 'uil', name: 'UIL', fn: uil, classic: true, axes: 'accent spacing size', description: 'Dense, direct controls with a technical character.', extras: [] },
  { id: 'figma', name: 'Figma', fn: figma, classic: true, axes: 'accent size spacing', description: 'The familiar precision of a design-tool inspector.', extras: [] },
  { id: 'apple', name: 'Apple', fn: apple, classic: true, axes: 'accent size spacing', description: 'Grouped controls and the calm rhythm of native settings.', extras: [] },
  { id: 'oui', name: 'OUI', fn: oui, classic: true, axes: 'accent spacing size', description: 'Light, spare controls with a single bright accent.', extras: [] },
  { id: 'control-panel', name: 'Control Panel', fn: controlPanel, classic: true, axes: 'accent spacing size', description: 'The small, square-edged panel from the creative web.',
    extras: [weight(400)] },
]
export const byId = Object.fromEntries(themes.map(t => [t.id, t]))

// Chalk, Bronze and Graphite are sampled from one material study (the same four controls in
// three finishes): the flat surface, the ink its lettering is printed in, and the texture of the
// material. `ink` and `texture` reach only themes that declare those axes.
export const colormaps = {
  dark: { name: 'Dark', shade: '#111111', accent: '#d5d5d5' },
  graphite: { name: 'Graphite', shade: '#1e1e1e', accent: '#f2f3f5', ink: '#f8f9fa', texture: 'grain' },
  slate: { name: 'Slate', shade: '#384957', accent: '#9cc9e5' },
  copper: { name: 'Copper', shade: '#b87959', accent: '#4e2920' },
  gold: { name: 'Gold', shade: '#ba965a', accent: '#60421f' },
  bronze: { name: 'Bronze', shade: '#ca9d63', accent: '#603415', ink: '#603415', texture: 'wood' },
  gray: { name: 'Gray', shade: '#b4b4b4', accent: '#39424c' },
  sage: { name: 'Sage', shade: '#c0cbb9', accent: '#395845' },
  silver: { name: 'Silver', shade: '#c6cac9', accent: '#40574d' },
  ivory: { name: 'Ivory', shade: '#f4ecdc', accent: '#786049' },
  chalk: { name: 'Chalk', shade: '#f1f2f4', accent: '#4a5362', ink: '#4a5362', texture: 'grain' },
  light: { name: 'Light', shade: '#ffffff', accent: '#0b57d0' },
}
// What a colormap carries to one theme: its surface, plus its ink and texture where the theme
// declares them. The accent is resolved by the caller (a chosen accent overrides the map's).
export const material = (theme, map) => {
  const axes = { shade: map.shade }
  for (const key of ['ink', 'texture']) if (map[key] && theme.axes.split(' ').includes(key)) axes[key] = map[key]
  return axes
}

// Preserve existing shared links, then write only the new colormap parameter.
export const legacyTimes = { predawn: 'slate', sunrise: 'ivory', day: 'chalk', dusk: 'slate', sunset: 'copper', night: 'graphite' }

export const accents = [['Violet', '#6d5ce8'], ['Rose', '#d94c91'], ['Blue', '#386ef1'], ['Teal', '#168eaa'], ['Amber', '#d97b30']]
export const fonts = { theme: undefined, system: 'system-ui, -apple-system, sans-serif', mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }
