/**
 * imgui — calibrated to Dear ImGui's default style (ImGui::StyleColorsDark), as in its demo window
 *
 * An immediate-mode tool window: a title bar in the active-title blue, full-width collapsing
 * headers with a triangle, framed widgets on the left taking all but a 12-character label column,
 * labels on the right. Sliders are filled frames with a rectangular grab and the value centred
 * in the frame; checkboxes are filled frames with a check mark; buttons are filled. One pixel
 * font (ProggyClean), no rounding, no borders on frames, a 1px window border.
 * Ref: https://github.com/ocornut/imgui (v1.92.9b): colours from StyleColorsDark() and
 * StyleColorsLight() in imgui_draw.cpp, metrics from ImGuiStyle::ImGuiStyle() in imgui.cpp,
 * widget geometry from imgui_widgets.cpp, the demo's label column from imgui_demo.cpp.
 *
 * ImGui stores colours as RGBA floats and converts them with (int)(f * 255 + .5); alpha colours
 * blend over what is beneath, so they stay alpha here and the browser composites them as the
 * GPU does. The native window background is translucent (WindowBg alpha .94).
 *
 * Axes: shade (window background; a light shade switches to StyleColorsLight), accent (the blue
 * role colour, #4296fa), size (font size 13px at 1), spacing (paddings and item spacing), font.
 *
 * imgui(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { parseColor, normalizeHex, resolveAccent, contrast, ink, toHex } from './color.js'

// ProggyClean.ttf, Copyright (c) 2004, 2005 Tristan Grimmer, MIT License
// (https://github.com/bluescan/proggyfonts), the font Dear ImGui embeds by default.
// Subset to Latin-1 and € as WOFF; vertical metrics set to ImGui's placement: 128 units = 1px at
// ImGui's 13px size (a 16px CSS em), baseline 11px into a 13px line (Ascent ceil(9.5) + GlyphOffset.y 1).
const proggy = `@font-face { font-family: 'ProggyClean'; src: url(data:font/woff;base64,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) format('woff'); }`

// StyleColorsDark() and StyleColorsLight(), imgui_draw.cpp v1.92.9b: the roles this theme draws, as ImGui's RGBA floats
const Dark = {
  Text: [1, 1, 1, 1], TextDisabled: [.5, .5, .5, 1], WindowBg: [.06, .06, .06, .94], PopupBg: [.08, .08, .08, .94],
  Border: [.43, .43, .50, .50], Separator: [.43, .43, .50, .50], FrameBg: [.16, .29, .48, .54],
  FrameBgHovered: [.26, .59, .98, .40], FrameBgActive: [.26, .59, .98, .67], TitleBgActive: [.16, .29, .48, 1],
  TitleBgCollapsed: [0, 0, 0, .51], CheckMark: [.26, .59, .98, 1], SliderGrab: [.24, .52, .88, 1], SliderGrabActive: [.26, .59, .98, 1],
  Button: [.26, .59, .98, .40], ButtonHovered: [.26, .59, .98, 1], ButtonActive: [.06, .53, .98, 1],
  Header: [.26, .59, .98, .31], HeaderHovered: [.26, .59, .98, .80], HeaderActive: [.26, .59, .98, 1],
  TextSelectedBg: [.26, .59, .98, .35], NavCursor: [.26, .59, .98, 1],
}
Dark.CheckboxSelectedBg = Dark.FrameBg.map((v, i) => v + (Dark.FrameBgHovered[i] - v) * .65)   // ImLerp(FrameBg, FrameBgHovered, .65)
const Light = {
  ...Dark, Text: [0, 0, 0, 1], TextDisabled: [.6, .6, .6, 1], WindowBg: [.94, .94, .94, 1], PopupBg: [1, 1, 1, .98],
  Border: [0, 0, 0, .30], Separator: [.39, .39, .39, .62], FrameBg: [1, 1, 1, 1], TitleBgActive: [.82, .82, .82, 1],
  TitleBgCollapsed: [1, 1, 1, .51], CheckboxSelectedBg: [.95, .97, 1, 1], SliderGrab: [.26, .59, .98, .78],
  SliderGrabActive: [.46, .54, .80, .60], NavCursor: [.26, .59, .98, .80],
}
// Roles tinted by the blue; a custom accent takes their place with the same OKLCH relation to it
const tinted = ['FrameBgHovered', 'FrameBgActive', 'CheckMark', 'SliderGrab', 'SliderGrabActive', 'Button', 'ButtonHovered', 'ButtonActive',
  'Header', 'HeaderHovered', 'HeaderActive', 'TextSelectedBg', 'NavCursor']
const darkTinted = [...tinted, 'FrameBg', 'TitleBgActive', 'CheckboxSelectedBg']
const BLUE = [.26, .59, .98]

// floats → 8-bit channels by (int)(f * 255 + .5), as ColorConvertFloat4ToU32 does
const u8 = f => Math.floor(Math.min(1, Math.max(0, f)) * 255 + .5)
const hex = c => '#' + c.slice(0, 3).map(v => u8(v).toString(16).padStart(2, '0')).join('')
const css = c => u8(c[3]) === 255 ? `rgb(${c.slice(0, 3).map(u8).join(' ')})` : `rgb(${c.slice(0, 3).map(u8).join(' ')} / ${+(u8(c[3]) / 255).toFixed(4)})`
const floats = color => {
  const h = /^#[0-9a-f]{6}/i.test(normalizeHex(color)) ? normalizeHex(color) : toHex(parseColor(color))
  return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
}
const over = (c, base) => [...c.slice(0, 3).map((v, i) => v * c[3] + base[i] * (1 - c[3])), 1]   // alpha blend, as the GPU does
const retone = (c, accent) => {
  const n = parseColor(hex(c)), b = parseColor(hex(BLUE)), a = parseColor(hex(accent))
  return [...floats(toHex({ L: Math.min(1, a.L * n.L / b.L), C: b.C ? a.C * n.C / b.C : 0, H: a.H + n.H - b.H })), c[3]]
}
// Move a role's lightness away from the ink until the role, blended over `base`, gives the ink `ratio`
const fit = (c, base, inkHex, ratio) => {
  const t = parseColor(hex(c)), up = parseColor(inkHex).L < .5
  for (let k = 0; k <= 20; k++) {
    const L = up ? t.L + (1 - t.L) * k / 20 : t.L * (1 - k / 20)
    const r = [...floats(toHex({ ...t, L })), c[3]]
    if (contrast(inkHex, hex(over(r, base))) >= ratio) return r
  }
  return c
}

// RenderArrow() triangles in a FontSize box (r = 0.40 × 13), and RenderCheckMark()'s polyline in a frame
const svg = body => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' ${body}</svg>`)}")`
const arrowRight = svg(`viewBox='0 0 13 13'><path d='M10.4 6.5 2.6 11 2.6 2z'/>`)
const arrowDown = svg(`viewBox='0 0 13 13'><path d='M6.5 10.4 2 2.6 11 2.6z'/>`)
const checkMark = svg(`viewBox='0 0 19 19'><path d='M3.65 9.5 7.55 13.4 15.35 5.6' fill='none' stroke='#000' stroke-width='2.6'/>`)

export default function imgui({ shade, accent, size = 1, spacing = 1, font } = {}) {
  const light = shade != null && parseColor(shade).L >= .5
  // ImGui's own palettes: Dark at the default shade, Light at its WindowBg (#f0f0f0), both with the blue
  const custom = accent != null || (shade != null && toHex(parseColor(shade)) !== '#f0f0f0')
  const P = { ...(light ? Light : Dark) }
  const acc = accent == null ? null : resolveAccent(accent, shade ?? '#0f0f0f')
  if (acc && parseColor(acc, null)) for (const k of light ? tinted : darkTinted) P[k] = retone(P[k], floats(acc))
  if (shade != null) P.WindowBg = [...floats(shade), 1]
  if (light) {
    P.TitleBgActive = [...P.WindowBg.slice(0, 3).map(v => v * .82 / .94), 1]   // .82 on .94 in StyleColorsLight
    // frames are white, a step above the .94 window; on a window already near white they step below it instead
    const w = parseColor(hex(P.WindowBg))
    if (w.L > .97) P.FrameBg = [...floats(toHex({ ...w, L: w.L - .045 })), 1]
  }
  // the dark style's window is translucent (alpha .94): contrast is measured over a white page, where it reads lightest
  const base = over(P.WindowBg, [1, 1, 1]).slice(0, 3)
  const text = custom ? ink(hex(base), 4.5, hex(P.Text)) : hex(P.Text)
  let onHover = 'var(--text)', onActive = 'var(--text)'

  // Text reads 4.5:1 on every resting fill, grabs and checks 3:1 on what they sit on (WCAG 1.4.3, 1.4.11).
  // Derived palettes are fitted whole; ImGui's own keep their look with each failing tone moved only as far
  // as it must: TextDisabled (#808080 dark, 4.3:1 over a white page; #999999 light, 2.6:1), the placeholder
  // on a frame (dark, 3.3:1), the light grab (2.6:1) and check mark (2.9:1), and the dark active button
  // under white text (#0f87fa, 3.6:1)
  if (custom) {
    for (const k of ['FrameBg', 'FrameBgHovered', 'FrameBgActive', 'Button', 'Header', 'TitleBgActive']) P[k] = fit(P[k], base, text, 4.5)
    // text on the full-accent fills: the ink, or the opposite extreme where the ink does not reach 4.5:1
    const on = fill => { const f = hex(over(fill, base)), other = parseColor(text).L < .5 ? '#ffffff' : '#000000'
      return contrast(text, f) >= 4.5 || contrast(text, f) >= contrast(other, f) ? 'var(--text)' : other }
    onHover = on(P.ButtonHovered)
    onActive = on(P.ButtonActive)
  } else P.ButtonActive = [...floats(ink(text, 4.5, hex(P.ButtonActive))), 1]
  const frame = over(P.FrameBg, base).slice(0, 3)
  P.SliderGrab = fit(P.SliderGrab, frame, hex(frame), 3)
  // the check mark sits on CheckboxSelectedBg in a box, on FrameBg as a radio dot
  for (const under of [frame, over(P.CheckboxSelectedBg, base).slice(0, 3)]) P.CheckMark = fit(P.CheckMark, under, hex(under), 3)
  const placeholder = ink(hex(frame), 4.5, hex(P.TextDisabled))
  // the search field is a frame on the title bar
  const searchPlaceholder = ink(hex(over(P.FrameBg, over(P.TitleBgActive, base).slice(0, 3))), 4.5, hex(P.TextDisabled))
  const textDim = ink(hex(base), 4.5, hex(P.TextDisabled))
  const axis = v => typeof v === 'number' && Number.isFinite(v) ? Math.min(2, Math.max(.5, v)) : 1
  const clipMargin = +(4 * axis(size) * axis(spacing)).toFixed(2)   // WindowPadding.x / 2

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, {
    fontSize: font ? 13 : 16, fontFamily: "'ProggyClean', ui-monospace, Menlo, Consolas, monospace",
    lineHeight: 13, controlHeight: 19, inset: 3, rowGap: 4, columnGap: 4, sectionGap: 4, panelPadding: 8,
  })}

  /* ── Colours: StyleColorsDark() / StyleColorsLight(), imgui_draw.cpp v1.92.9b, alpha kept ── */
  --bg: ${css(P.WindowBg)};
  --text: ${text};
  --text-dim: ${textDim};                  /* TextDisabled */
  --placeholder: ${placeholder};           /* TextDisabled on a frame */
  --border: ${css(P.Border)};
  --separator: ${css(P.Separator)};
  --frame: ${css(P.FrameBg)};
  --frame-hover: ${css(P.FrameBgHovered)};
  --frame-active: ${css(P.FrameBgActive)};
  --title: ${css(P.TitleBgActive)};
  --title-collapsed: ${css(P.TitleBgCollapsed)};
  --check: ${css(P.CheckMark)};
  --check-bg: ${css(P.CheckboxSelectedBg)};
  --grab: ${css(P.SliderGrab)};
  --grab-active: ${css(P.SliderGrabActive)};
  --button: ${css(P.Button)};
  --button-hover: ${css(P.ButtonHovered)};
  --button-active: ${css(P.ButtonActive)};
  --header: ${css(P.Header)};
  --header-hover: ${css(P.HeaderHovered)};
  --header-active: ${css(P.HeaderActive)};
  --select: ${css(P.TextSelectedBg)};
  --popup: ${css(P.PopupBg)};
  --nav: ${css(P.NavCursor)};
  --accent: var(--check);
  --on-hover: ${onHover};
  --on-active: ${onActive};
  color-scheme: ${light ? 'light' : 'dark'};

  /* ── Metrics: ImGuiStyle::ImGuiStyle(), imgui.cpp v1.92.9b ── */
  --fs: calc(13 * var(--length));                 /* FontSize */
  --fh: var(--control-height);                    /* GetFrameHeight(): FontSize + FramePadding.y × 2 */
  --fpx: calc(4 * var(--space));                  /* FramePadding.x */
  --fpy: calc(3 * var(--space));                  /* FramePadding.y */
  --isx: calc(8 * var(--space));                  /* ItemSpacing.x (ItemSpacing.y is --row-gap) */
  --iisx: calc(4 * var(--space));                 /* ItemInnerSpacing.x */
  --indent: calc(var(--fs) + 2 * var(--fpx));     /* IndentSpacing 21: FontSize + FramePadding.x × 2 */
  --grab-min: calc(12 * var(--length));           /* GrabMinSize */
  --grab-pad: calc(2 * var(--length));            /* slider grab inset (imgui_widgets.cpp) */
  --label-w: calc(12 * var(--fs));                /* demo: PushItemWidth(-min(FontSize × 12, 40%)) */
  --wb: var(--length);                            /* WindowBorderSize */
  --r: 0;                                         /* WindowRounding, FrameRounding, GrabRounding */

  width: calc(550 * var(--length));               /* the demo window: SetNextWindowSize(550, 680) */
  max-width: 100%;
  min-width: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  outline: var(--wb) solid var(--border);
  outline-offset: calc(-1 * var(--wb));
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  ::selection { background: var(--select); }

  /* ── Title bar: TitleBgActive; inside the border, the collapse triangle FramePadding.x in, the text two ItemInnerSpacing.x after it ── */
  > summary, > .s-panel-title {
    height: var(--fh);
    padding: 0 calc(var(--wb) + var(--fpx));
    gap: calc(2 * var(--iisx));
    background: var(--title);
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
  }
  .s-fold-icon { order: -1; flex: none; width: var(--fs); height: var(--fs); i { display: block; width: 100%; height: 100%; background: currentColor; -webkit-mask: ${arrowDown} 0 0 / 100% 100%; mask: ${arrowDown} 0 0 / 100% 100%; } }
  &:is(details):not([open]) { background: none; > summary { background: var(--title-collapsed); } .s-fold-icon i { -webkit-mask-image: ${arrowRight}; mask-image: ${arrowRight}; } }
  > summary:focus-visible { outline: 2px solid var(--nav); outline-offset: -2px; }
  .s-panel-content { padding: var(--panel-padding); gap: var(--row-gap); }

  /* ── Search ── */
  .s-search { gap: var(--iisx); }
  .s-search-btn { width: var(--fs); height: var(--fs); &:focus-visible { outline: 2px solid var(--nav); outline-offset: 1px; } }
  .s-search-input { height: calc(var(--fh) - 2 * var(--length)); padding: 0 var(--fpx); background: var(--frame); color: var(--text); font: inherit; line-height: var(--line-height);
    &::placeholder { color: ${searchPlaceholder}; opacity: 1; }
    &:focus { outline: none; } &:focus-visible { outline: 2px solid var(--nav); outline-offset: -2px; } }

  /* ── Rows: the framed widget left, its label right after ItemInnerSpacing.x in a FontSize × 12 column ── */
  .s-control { flex-direction: row-reverse; justify-content: flex-start; align-items: flex-start; gap: 0; min-height: var(--fh); }
  .s-label-group {
    flex: 0 0 auto; width: min(var(--label-w), 40%); min-width: 0; max-width: none;
    padding: var(--fpy) 0 0 var(--iisx); gap: 0; line-height: var(--line-height);
  }
  .s-label-row { gap: var(--isx); }
  /* labels clip half the window padding from its edge (the window's InnerClipRect); a literal length,
     Chromium drops var() in overflow-clip-margin */
  .s-label { flex: 0 1 auto; min-width: 0; white-space: nowrap; overflow: clip; overflow-clip-margin: ${clipMargin}px; }
  .s-hint { color: var(--text-dim); font-size: inherit; opacity: 1; }
  .s-input { flex: 1 1 0; min-width: 0; gap: var(--iisx); align-items: flex-start; }
  .s-input[inert] { opacity: 1; }
  .s-control:has(> .s-input[inert]) { opacity: .6; }   /* DisabledAlpha, the whole item */

  /* HelpMarker(): "(?)" in TextDisabled one ItemSpacing.x after the label; its tooltip is a popup window */
  .s-title { color: var(--text-dim); &::before { content: '('; } &::after { content: ')'; } }
  .s-title-text {
    top: calc(100% + var(--fpy)); left: auto; right: 0; padding: var(--panel-padding);
    max-width: 35ch; background: var(--popup); color: var(--text); outline: var(--wb) solid var(--border); outline-offset: calc(-1 * var(--wb));
  }

  /* ── Frames: FrameBg, no border, no rounding; text FramePadding in ── */
  input[type="text"], input[type="number"], textarea, select {
    height: var(--fh); margin: 0; padding: 0 var(--fpx); border: 0; border-radius: 0;
    background: var(--frame); color: var(--text); font: inherit; line-height: var(--line-height);
    &::placeholder { color: var(--placeholder); opacity: 1; }
    &:focus { outline: none; }
    &:focus-visible { outline: 2px solid var(--nav); outline-offset: 3px; }
  }
  input[type="number"] { -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
  .s-text input[type="text"] { flex: 1; }

  /* ── Buttons: Button / ButtonHovered / ButtonActive, sized to their text ── */
  button { font: inherit; color: inherit; }
  .s-button {
    .s-input { flex-wrap: wrap; gap: var(--row-gap) var(--isx); }
    button {
      flex: none; height: var(--fh); padding: 0 var(--fpx); border: 0; border-radius: 0; line-height: var(--line-height);
      background: var(--button); color: var(--text); white-space: nowrap;
      &:hover { background: var(--button-hover); color: var(--on-hover); }
      &:active { background: var(--button-active); color: var(--on-active); }
      &:focus { outline: none; }
      &:focus-visible { outline: 2px solid var(--nav); outline-offset: 3px; }
      &:disabled, &[aria-busy="true"] { opacity: .6; cursor: default; background: var(--button); color: var(--text); }
    }
    &.s-secondary button, button.s-secondary { background: var(--frame); &:hover { background: var(--frame-hover); color: var(--text); } &:active { background: var(--frame-active); } }
  }

  /* ── Number: InputInt(), the field then the − and + buttons, each a FrameHeight square ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: left; }
    input.s-scrubbing { background: var(--frame-active); }
    .s-step { flex: none; flex-direction: row-reverse; gap: var(--iisx); }
    /* the ▴ ▾ glyphs give way to ImGui's centred − and + labels */
    .s-step button {
      position: relative; width: var(--fh); height: var(--fh); padding: 0; border: 0; border-radius: 0; overflow: hidden;
      background: var(--button); color: transparent; --label: var(--text);
      &::before { position: absolute; inset: 0; color: var(--label); line-height: var(--fh); text-align: center; }
      &:hover { background: var(--button-hover); --label: var(--on-hover); }
      &:active { background: var(--button-active); --label: var(--on-active); }
    }
    .s-step-up::before { content: '+'; }
    .s-step-down::before { content: '-'; }
  }

  /* ── Vector: InputFloat3(), one frame per component, ItemInnerSpacing.x apart ── */
  .s-vector {
    .s-input { gap: var(--iisx); flex-wrap: wrap; }
    .s-vec-axis { flex: 1; min-width: 0; gap: 0; height: var(--fh); background: var(--frame); &:has(input:focus-visible) { outline: 2px solid var(--nav); outline-offset: 3px; } }
    .s-vec-label { padding-left: var(--fpx); color: var(--placeholder); font-size: inherit; opacity: 1; }
    input[type="number"] { flex: 1; text-align: left; background: none; &:focus-visible { outline: none; } }
    .s-vec-expand { align-self: center; width: var(--fs); height: var(--fs); background: var(--text-dim); opacity: 1; &:hover, &.s-open { background: var(--text); } }
  }

  /* ── Checkbox: a FrameHeight square, CheckboxSelectedBg when checked, RenderCheckMark() 3px in; label right after ── */
  .s-boolean { justify-content: flex-end; .s-input { flex: none; } .s-label-group { width: auto; } }
  .s-boolean.s-checkbox input[type="checkbox"], .s-checkboxes .s-track {
    -webkit-appearance: none; appearance: none; position: static; flex: none; display: block;
    width: var(--fh); height: var(--fh); margin: 0; border: 0; border-radius: 0; background: var(--frame); cursor: pointer; opacity: 1;
    &::after { content: ''; display: block; width: 100%; height: 100%; background: var(--s-color, var(--check)); -webkit-mask: ${checkMark} 0 0 / 100% 100%; mask: ${checkMark} 0 0 / 100% 100%; visibility: hidden; }
  }
  .s-boolean.s-checkbox {
    .s-track { display: none; }
    input[type="checkbox"] {
      &:checked { background: var(--check-bg); &::after { visibility: visible; } }
      &:hover { background: var(--frame-hover); }
      &:active { background: var(--frame-active); }
      &:focus-visible { outline: 2px solid var(--nav); outline-offset: 3px; }
    }
  }
  .s-checkboxes {
    .s-input { gap: var(--row-gap); }
    .s-input label { display: flex; align-items: center; gap: var(--iisx); cursor: pointer; }
    input:checked + .s-track { background: var(--check-bg); &::after { visibility: visible; } }
    label:hover .s-track { background: var(--frame-hover); }
    input:focus-visible + .s-track { outline: 2px solid var(--nav); outline-offset: 3px; }
  }

  /* Switch: a two-position slider (frame, grab); on moves the grab right on FrameBgActive */
  .s-boolean.s-switch {
    .s-input { cursor: pointer; }
    .s-track {
      position: relative; flex: none; width: calc(2 * var(--fh)); height: var(--fh); background: var(--frame);
      &::after { content: ''; position: absolute; top: var(--grab-pad); left: var(--grab-pad); width: calc(var(--fh) - 2 * var(--grab-pad)); height: calc(var(--fh) - 2 * var(--grab-pad)); background: var(--grab); }
    }
    &:hover .s-track { background: var(--frame-hover); }
    &:has(input:checked) .s-track { background: var(--frame-active); &::after { left: auto; right: var(--grab-pad); background: var(--grab-active); } }
    &:has(input:focus-visible) .s-track { outline: 2px solid var(--nav); outline-offset: 3px; }
  }
  /* Toggle: a button reading Off / On, ButtonActive while on */
  .s-boolean.s-toggle {
    .s-track { flex: none; height: var(--fh); padding: 0 var(--fpx); display: flex; align-items: center; background: var(--button); cursor: pointer; &::after { content: 'Off'; } }
    &:hover .s-track { background: var(--button-hover); color: var(--on-hover); }
    &:has(input:checked) .s-track { background: var(--button-active); color: var(--on-active); &::after { content: 'On'; } }
    &:has(input:focus-visible) .s-track { outline: 2px solid var(--nav); outline-offset: 3px; }
  }

  /* ── Slider: SliderScalar(), a frame with a grab inset 2px; the value centred over the frame ── */
  .s-slider {
    .s-input { position: relative; }
    .s-track { flex: 1; min-width: 0; height: var(--fh); margin: 0; container-type: inline-size; }
    input[type="range"] {
      -webkit-appearance: none; appearance: none; width: 100%; height: var(--fh); margin: 0; padding: 0 var(--grab-pad);
      background: var(--frame); cursor: pointer;
      /* integer sliders: grab = max(GrabMinSize, usable width / value count) */
      --steps: calc((attr(max type(<number>), 1) - attr(min type(<number>), 0)) / attr(step type(<number>), 1e-6) + 1);
      --grab-w: max(var(--grab-min), (100cqw - 2 * var(--grab-pad)) / var(--steps));
      &::-webkit-slider-runnable-track { height: var(--fh); background: none; }
      &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--grab-w); height: calc(var(--fh) - 2 * var(--grab-pad)); margin-top: var(--grab-pad); border: 0; border-radius: 0; background: var(--grab); }
      &::-moz-range-thumb { width: var(--grab-w); height: calc(var(--fh) - 2 * var(--grab-pad)); border: 0; border-radius: 0; background: var(--grab); }
      &:hover { background: var(--frame-hover); }
      &:active { background: var(--frame-active); &::-webkit-slider-thumb { background: var(--grab-active); } &::-moz-range-thumb { background: var(--grab-active); } }
      &:focus { outline: none; }
      &:focus-visible { outline: 2px solid var(--nav); outline-offset: 3px; }
    }
    .s-readout {
      position: absolute; top: 0; left: 0; width: 100%; height: var(--fh); padding: 0 var(--fpx);
      background: none; color: var(--text); text-align: center; white-space: nowrap; overflow: hidden; pointer-events: none;
      line-height: var(--fh);
      /* focused, it is the slider's InputText (Ctrl+Click in ImGui): a frame over the window colour hides the grab */
      &:focus { pointer-events: auto; text-align: left; background: linear-gradient(var(--frame), var(--frame)), var(--bg); }
    }
    .s-marks { display: none; }
    .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(var(--line-height) + var(--row-gap)); }
    .s-mark-label { position: absolute; top: calc(100% + var(--row-gap)); transform: translateX(-50%); color: var(--text-dim); white-space: nowrap; &.s-active { color: var(--text); }
      &:first-child { transform: none; } &:last-child:not(:first-child) { transform: translateX(-100%); } }
    /* a tooltip readout is a tooltip: shown while the slider is hovered, held or focused */
    .s-tooltip { position: absolute; bottom: calc(100% + var(--fpy)); transform: translateX(-50%); padding: var(--fpy) var(--fpx); background: var(--popup); outline: var(--wb) solid var(--border); outline-offset: calc(-1 * var(--wb)); white-space: nowrap; z-index: 1; visibility: hidden; }
    .s-track:is(:hover, :active, :focus-within) .s-tooltip { visibility: visible; }
    /* DragFloatRange2-like: the band between the grabs, each end readout its own frame */
    &.s-multiple {
      .s-readout { position: static; flex: 0 0 auto; width: calc(7ch + 2 * var(--fpx)); background: var(--frame); pointer-events: auto; text-align: center; }
      .s-interval-track { flex: 1; height: var(--fh); background: var(--frame); padding: 0 var(--grab-pad); position: relative;
        &::before { content: ''; position: absolute; top: var(--grab-pad); bottom: var(--grab-pad); left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--frame-active); }
        input[type="range"] { background: none; padding: 0; height: 100%; --grab-w: var(--grab-min); &:hover { background: none; } }
      }
    }
  }

  /* ── Select: Combo() frame with its arrow button, RadioButton() rows, buttons for segments ── */
  .s-select {
    &.s-dropdown select {
      flex: 1; -webkit-appearance: none; appearance: none; cursor: pointer; padding-right: calc(var(--fh) + var(--fpx));
      --combo: var(--frame); --combo-button: var(--button);
      background:
        ${svg(`viewBox='0 0 13 13' fill='${text}'><path d='M6.5 10.4 2 2.6 11 2.6z'/>`)} right var(--fpy) center / var(--fs) var(--fs) no-repeat,
        linear-gradient(var(--combo-button), var(--combo-button)) right / var(--fh) 100% no-repeat,
        linear-gradient(var(--combo), var(--combo)) left / calc(100% - var(--fh)) 100% no-repeat;
      &:hover { --combo: var(--frame-hover); --combo-button: var(--button-hover); }
      option { background: var(--popup); color: var(--text); }
    }
    &.s-radio {
      .s-input { flex-direction: row; flex-wrap: wrap; gap: var(--row-gap) var(--isx); }
      .s-input label { display: flex; align-items: flex-start; gap: var(--iisx); height: var(--fh); line-height: var(--line-height); cursor: pointer;
        span { padding-top: var(--fpy); } }
      /* the circle: radius (FrameHeight − 1) / 2 about the rounded centre; the dot 3px smaller */
      input[type="radio"] {
        -webkit-appearance: none; appearance: none; flex: none; margin: var(--wb) 0 0 var(--wb);
        width: calc(var(--fh) - var(--wb)); height: calc(var(--fh) - var(--wb)); border-radius: 50%; background: var(--frame); cursor: pointer;
        &:checked { background: radial-gradient(circle closest-side, var(--check) calc(100% - 3 * var(--length) - .5px), var(--frame) calc(100% - 3 * var(--length) + .5px)); }
        &:hover { background-color: var(--frame-hover); }
        &:focus { outline: none; }
        &:focus-visible { outline: 2px solid var(--nav); outline-offset: 3px; }
      }
      label:hover input[type="radio"]:not(:checked) { background: var(--frame-hover); }
    }
    &.s-segmented {
      .s-input { gap: var(--iisx); }
      button {
        flex: 1; min-width: 0; height: var(--fh); padding: 0 var(--fpx); border: 0; border-radius: 0; line-height: var(--line-height);
        background: var(--button); color: var(--text); white-space: nowrap; overflow: hidden;
        &:hover { background: var(--button-hover); color: var(--on-hover); }
        &.s-selected { background: var(--button-active); color: var(--on-active); }
        &:focus { outline: none; }
        &:focus-visible { outline: 2px solid var(--nav); outline-offset: 3px; }
      }
    }
  }

  /* ── Color: ColorEdit3/4(), the value then ColorButton() on the right (ColorButtonPosition): a FrameBg
       ring 1px wide round the colour, drawn over ImGui's 128/204 alpha checkerboard (cells = button size / 2.99) ── */
  .s-color {
    --cell: calc(var(--fh) / 2.99);
    --checker: conic-gradient(#ccc 90deg, #808080 0 180deg, #ccc 0 270deg, #808080 0) calc(-1 * var(--wb)) calc(-1 * var(--wb)) / calc(2 * var(--cell)) calc(2 * var(--cell));
    .s-color-input { gap: var(--iisx); }
    input[type="color"] {
      --swatch: linear-gradient(var(--color), var(--color)), var(--checker);
      position: static; order: 1; flex: none; width: var(--fh); height: var(--fh); padding: var(--wb); border: 0; border-radius: 0;
      background: var(--frame); cursor: pointer;
      &::-webkit-color-swatch-wrapper { padding: 0; }
      &::-webkit-color-swatch { border: 0; border-radius: 0; background: var(--swatch); }
      &::-moz-color-swatch { border: 0; border-radius: 0; background: var(--swatch); }
      &:focus { outline: none; }
      &:focus-visible { outline: 2px solid var(--nav); outline-offset: 3px; }
    }
    .s-color-input input[type="text"] { flex: 1; }
    &.s-rgba .s-color-input {
      .s-alpha {
        flex: 1; height: var(--fh); border-radius: 0; padding: 0 var(--grab-pad);
        background: linear-gradient(to right, transparent, var(--c)), var(--checker);
        &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--grab-min); height: calc(var(--fh) - 2 * var(--grab-pad)); border: 0; border-radius: 0; background: var(--grab); }
        &::-moz-range-thumb { width: var(--grab-min); height: calc(var(--fh) - 2 * var(--grab-pad)); border: 0; border-radius: 0; background: var(--grab); }
        &:focus { outline: none; }
        &:focus-visible { outline: 2px solid var(--nav); outline-offset: 3px; }
      }
    }
    &.s-swatches {
      .s-input { flex-wrap: wrap; gap: var(--iisx); }
      button { width: var(--fh); height: var(--fh); padding: 0; border: 0; border-radius: 0;
        &.s-selected { outline: var(--wb) solid var(--text); outline-offset: var(--wb); }
        &:focus { outline: none; }
        &:focus-visible { outline: 2px solid var(--nav); outline-offset: 3px; } }
    }
  }

  /* ── Textarea: InputTextMultiline() ── */
  .s-textarea textarea { flex: 1; height: auto; min-height: calc(4 * var(--line-height) + 2 * var(--fpy)); padding: var(--fpy) var(--fpx); resize: vertical; field-sizing: content; max-height: 50vh; }

  /* ── Info: Text() without a label, LabelText() with one (the value FramePadding in, frame height) ── */
  .s-info .s-monitor { flex: 1; min-width: 0; padding: var(--fpy) var(--fpx); opacity: 1; color: var(--text); white-space: nowrap; overflow: clip; overflow-clip-margin: ${clipMargin}px; }
  .s-info:has(> .s-label-group[hidden]) { min-height: 0; .s-monitor { padding: 0; } }

  /* ── Separators: Separator() 1px; SeparatorText() a 3px rule 20px in, ItemSpacing.x around the text ── */
  .s-separator { min-height: 0; height: var(--wb); margin: 0; background: var(--separator); opacity: 1; }
  .s-separator-labeled {
    height: var(--fh); background: none; gap: var(--isx); align-items: flex-start; flex-direction: row;
    &::before, &::after { height: calc(3 * var(--length)); margin-top: calc(var(--fpy) + var(--fs) / 2 - var(--length) / 2); background: var(--separator); opacity: 1; }
    &::before { flex: 0 0 calc(20 * var(--space) - var(--isx)); }
  }
  .s-separator-label { padding-top: var(--fpy); font-size: inherit; opacity: 1; line-height: var(--line-height); }

  /* ── Folders: CollapsingHeader(), a Header bar half the window padding out, triangle and text ── */
  .s-folder {
    > summary {
      height: var(--fh); margin: 0 calc(var(--panel-padding) / -2); padding: 0 var(--fpx) 0 calc(var(--panel-padding) / 2 + var(--fpx));
      gap: calc(2 * var(--fpx)); background: var(--header); color: var(--text); line-height: var(--line-height); white-space: nowrap;
      &::before { content: ''; flex: none; width: var(--fs); height: var(--fs); background: currentColor; -webkit-mask: ${arrowRight} 0 0 / 100% 100%; mask: ${arrowRight} 0 0 / 100% 100%; }
      &:hover { background: var(--header-hover); }
      &:active { background: var(--header-active); }
      &:focus { outline: none; }
      &:focus-visible { outline: 2px solid var(--nav); outline-offset: 1px; }
    }
    &[open] > summary::before { -webkit-mask-image: ${arrowDown}; mask-image: ${arrowDown}; }
    > .s-content { gap: var(--row-gap); &:not(:empty) { padding-top: var(--row-gap); } }
    /* a section is TreeNodeEx(Leaf | DefaultOpen): no frame, no arrow, text and children one IndentSpacing in */
    &.s-section {
      > summary { height: var(--line-height); margin: 0; padding: 0 0 0 var(--indent); background: none; pointer-events: none; &::before { display: none; } }
      > .s-content { padding-left: var(--indent); }
    }
  }

  /* ── XY pad / knob: frames with a grab ── */
  .s-xy .s-pad { background: var(--frame); border: 0; border-radius: 0;
    .s-pad-x, .s-pad-y { background: var(--separator); }
    .s-pad-dot { width: var(--grab-min); height: var(--grab-min); border-radius: 0; background: var(--grab); box-shadow: none; }
    &:focus-visible:not(:active) { outline: 2px solid var(--nav); outline-offset: 3px; } }
  .s-pad-val { color: var(--text-dim); font-size: inherit; opacity: 1; }
  .s-knob-wrap { gap: var(--iisx); &:focus-visible:not(:active) .s-knob-dial { outline: 2px solid var(--nav); outline-offset: 3px; } }
  .s-knob-dial { width: calc(2 * var(--fh)); height: calc(2 * var(--fh)); background: var(--frame); border: 0;
    i { width: calc(2 * var(--length)); background: var(--grab); border-radius: 0; } }
  .s-knob-wrap:active .s-knob-dial { background: var(--frame-active); i { background: var(--grab-active); } }
  .s-knob-val { font-size: inherit; opacity: 1; }
}`

  return baseCSS + '\n' + proggy + '\n' + overrides
}
