/**
 * Base scaffold — tokens, layout, collapse. No visual theme.
 * All themes compose: baseCSS + theme overrides.
 */

export default `@layer s-base {
.s-panel {

  /* ── Tokens (override in theme) ── */
  --bg: #f5f4f2;
  --accent: #2563eb;
  --length: 1px;
  --u: 4px;
  --lh: calc(var(--u) * 4);
  --spacing: 1;
  --roundness: 0;
  --weight: 400;
  --r: calc(var(--u) * var(--roundness));
  --pad: calc(var(--u) * (0.5 + var(--spacing)));
  --pad-i: max(var(--pad), calc(var(--r) / 2));

  /* ── Shell ── */
  display: flex;
  flex-direction: column;
  accent-color: var(--accent);
  font-weight: var(--weight);
  font-size: inherit;
  line-height: var(--lh);
  -webkit-text-size-adjust: none;

  &, *, *::before, *::after { box-sizing: border-box; margin: 0; }
  *[hidden] { display: none!important; }

  /* ── Panel header ── */
  > summary, > .s-panel-title {
    list-style: none;
    display: flex;
    align-items: center;
    &::-webkit-details-marker { display: none; }
  }
  > summary { cursor: pointer; }
  > summary:focus-visible, .s-folder > summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  /* ── Search (opt-in via search option; themes refine) ── */
  .s-search { margin-left: auto; min-width: 0; display: inline-flex; align-items: center; gap: calc(4 * var(--length)); }
  .s-search-btn {
    flex: none; width: calc(16 * var(--length)); height: calc(16 * var(--length)); padding: 0; border: none; cursor: pointer;
    background: currentColor;
    -webkit-mask: var(--s-search-icon) center / contain no-repeat;
    mask: var(--s-search-icon) center / contain no-repeat;
  }
  --s-search-icon: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23000' stroke-width='1.5'%3E%3Ccircle cx='7' cy='7' r='4.5'/%3E%3Cpath d='M10.5 10.5 L14 14'/%3E%3C/svg%3E");
  .s-search-input { display: none; border: none; background: transparent; color: inherit; font: inherit; min-width: 0; }
  &.s-searching .s-search-input { display: inline-block; }

  /* ── Numeric drag-scrub: a number's label and a vector's axis letters drag their value ── */
  .s-number > .s-label-group, .s-vec-label { cursor: ew-resize; touch-action: none; }
  .s-scrubbing { cursor: ew-resize; user-select: none; }

  /* ── Scrollbars (a scrolling panel, a long textarea): thin, in the ink, over a clear track ── */
  &, * { scrollbar-width: thin; scrollbar-color: color-mix(in oklab, currentColor 28%, transparent) transparent; }

  /* ── Collapse (panel and folders alike) ── */
  &:is(details), .s-folder:is(details) {
    display: block;
    interpolate-size: allow-keywords;
    &::details-content {
      content-visibility: hidden;
      height: 0;
      opacity: 0;
      overflow: clip;
      transition: height 200ms, opacity 80ms, content-visibility 200ms allow-discrete;
    }
    &[open]::details-content {
      content-visibility: visible;
      height: auto;
      opacity: 1;
      overflow: visible;
      transition: height 200ms, opacity 150ms 150ms;
    }
  }

  /* ── Panel content ── */
  .s-panel-content {
    display: flex;
    flex-direction: column;
    gap: var(--row-gap, var(--pad));
  }

  /* ── Control row ── */
  .s-control {
    display: flex;
    align-items: baseline;
    gap: var(--column-gap, calc(var(--u) * (1 + var(--spacing))));
    margin: 0;
    padding: 0;
    border: 0;
  }
  .s-label-group {
    flex: 0 0 auto;
    min-width: 11ch;
    width: 28%;
    max-width: 20ch;
    display: flex;
    flex-direction: column;
    gap: var(--u);
    line-height: calc(var(--u) * 4);
  }
  .s-label-row { display: flex; align-items: center; gap: calc(var(--u) * 1.5); position: relative; }
  .s-hint { font-size: smaller; opacity: .6; }

  /* ── Label tooltip (title option): structure only, so a theme that paints it keeps its look;
     the text stays out of the flow and hidden until the ? is hovered or focused ── */
  .s-title { cursor: help; }
  .s-title-text {
    position: absolute;
    left: 0;
    top: 100%;
    z-index: 10;
    width: max-content;
    max-width: 30ch;
    padding: var(--u) calc(var(--u) * 2);
    white-space: normal;
    background: var(--bg);
    pointer-events: none;
    visibility: hidden;
  }
  .s-title:is(:hover, :focus-visible) + .s-title-text { visibility: visible; }
  .s-title:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  .s-input {
    flex: 1;
    min-width: 0;
    display: flex;
    gap: var(--pad);
    margin: 0;
    padding: 0;
    border: 0;
    min-inline-size: 0;
    &[inert] { opacity: .5; }
  }

  /* ── Input flex safety ── */
  /* themes fit placeholder ink to contrast at full strength; Firefox would otherwise dim it to .54 */
  ::placeholder { opacity: 1; }
  input[type="text"], input[type="number"], textarea, select {
    width: 0;
    min-width: 0;
    font: inherit;
    color: inherit;
    padding: var(--pad) var(--pad-i);
  }
  select { text-overflow: ellipsis; }   /* a value longer than its field ends in an ellipsis, not mid-letter */
  textarea { resize: none; field-sizing: content; }   /* a text area grows with its text: there is nothing to drag */
  button { font: inherit; cursor: pointer; }

  /* ── Number stepper layout ── */
  .s-number .s-step {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  /* ── Select variants — layout ── */
  .s-select.s-checkboxes .s-input {
    flex-direction: column;
    align-items: stretch;
  }
  .s-select.s-radio .s-input {
    flex-direction: column;
    align-items: stretch;
  }

  /* ── Color picker layout ── */
  .s-color.s-picker .s-input { min-width: 0; }
  .s-color.s-picker .s-color-input {
    flex: 1;
    min-width: 0;
    position: relative;
    display: flex;
    align-items: center;
    input[type="color"] { position: absolute; padding: 0; border: none; cursor: pointer; }
    input[type="text"] { flex: 1; min-width: 0; }
  }

  /* ── Swatches: each keeps its own size; a long palette wraps rather than shrinks ── */
  .s-color.s-swatches {
    .s-input { flex-wrap: wrap; }
    button { flex: none; }
  }

  /* ── rgba color layout (swatch + alpha + text) ── */
  .s-color.s-rgba .s-input { min-width: 0; }
  .s-color.s-rgba .s-color-input {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: var(--pad);
    input[type="color"] { flex: none; width: calc(var(--u) * 6); height: calc(var(--u) * 6); padding: 0; border: none; cursor: pointer; }
    input[type="text"] { flex: 1; min-width: calc(var(--u) * 12); width: 0; }
    .s-alpha {
      flex: 1;
      min-width: calc(var(--u) * 8);
      width: 0;
      --c: #000;
      -webkit-appearance: none;
      appearance: none;
      height: calc(var(--u) * 2);
      border-radius: calc(var(--u));
      cursor: pointer;
      background:
        linear-gradient(to right, transparent, var(--c)),
        conic-gradient(#c4c4c4 90deg, #fff 0 180deg, #c4c4c4 0 270deg, #fff 0) 0 0 / calc(8 * var(--length)) calc(8 * var(--length));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(var(--u) * 3); height: calc(var(--u) * 3); border-radius: 50%; background: #fff; border: 1px solid rgba(0,0,0,.35); cursor: pointer; }
      &::-moz-range-thumb { width: calc(var(--u) * 3); height: calc(var(--u) * 3); border-radius: 50%; background: #fff; border: 1px solid rgba(0,0,0,.35); cursor: pointer; }
    }
  }

  /* ── Slider layout ── */
  .s-slider input[type="range"] { cursor: pointer; }
  .s-slider .s-track {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }
  /* a mark label with no room beside its neighbours (the slider marks it) */
  .s-slider .s-mark-label.s-crowded { visibility: hidden; }

  /* a tooltip readout floats over the thumb while the slider is in use (hovered, focused, held): at rest it would
     lie over the row above */
  .s-slider .s-tooltip {
    position: absolute;
    bottom: 100%;
    transform: translateX(-50%);
    white-space: nowrap;
    pointer-events: none;
    visibility: hidden;
  }
  .s-slider:is(:hover, :focus-within, :has(input:active)) .s-tooltip { visibility: visible; }
  .s-slider.s-multiple .s-interval-track {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    input[type="range"] {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      /* the whole track takes a press: the input on top is the nearer thumb's (the slider keeps it there under the
         pointer), so a press anywhere brings that thumb to it */
      &.s-top { z-index: 1; }
      &:focus-visible { z-index: 2; }
    }
  }

  /* ── Boolean / select — hide native checkbox where custom track used ── */
  .s-boolean.s-toggle input[type="checkbox"],
  .s-boolean.s-switch input[type="checkbox"],
  .s-select.s-checkboxes input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* ── Folder ── */
  .s-folder {
    display: block;
    border: 0;
    padding: 0;
    > summary {
      cursor: pointer;
      list-style: none;
      display: flex;
      align-items: center;
      &::-webkit-details-marker { display: none; }
    }
  }
  .s-content {
    display: flex;
    flex-direction: column;
    gap: calc(var(--u) * 2 * var(--spacing));
  }

  /* ── Separator (structural divider) ── */
  .s-separator {
    height: 1px;
    background: currentColor;
    opacity: .15;
    margin: calc(var(--u) * var(--spacing)) 0;
  }
  .s-separator-labeled {
    height: auto;
    background: none;
    opacity: 1;
    display: flex;
    align-items: center;
    gap: calc(var(--u) * 2);
    /* the rules and the label centre on each other whatever a theme's rows align to */
    &::before, &::after { content: ''; flex: 1; height: 1px; background: currentColor; opacity: .15; align-self: center; }
    > .s-separator-label { align-self: center; }
  }
  .s-separator-label { font-size: smaller; opacity: .6; white-space: nowrap; }

  /* ── Info / monitor (read-only readout) ── */
  .s-info {
    align-items: center;
    .s-monitor { flex: 1; min-width: 0; font-variant-numeric: tabular-nums; opacity: .85; }
  }

  /* ── Vector (multiple axis inputs) ── */
  .s-vector {
    .s-input { gap: calc(var(--u) * 1.5); flex-wrap: wrap; }
    /* an axis keeps room for its value; when the axes no longer fit, the row wraps */
    .s-vec-axis { flex: 1; display: flex; align-items: center; gap: var(--u); }
    .s-vec-label { flex: none; font-size: smaller; opacity: .55; }
    input[type="number"] {
      flex: 1; width: 0; min-width: 0; text-align: right; appearance: textfield;
      &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      @supports (field-sizing: content) { field-sizing: content; width: auto; min-width: auto; }
    }
    /* expandable 2D pad (pad option) — dot-in-corners glyph toggle, pad on its own row */
    .s-vec-expand {
      flex: none; width: calc(16 * var(--length)); height: calc(16 * var(--length)); padding: 0; border: none; cursor: pointer;
      background: currentColor; opacity: .55;
      -webkit-mask: var(--s-expand-icon) center / contain no-repeat;
      mask: var(--s-expand-icon) center / contain no-repeat;
      &:hover, &.s-open { opacity: 1; }
    }
    /* the pad keeps the XY pad's size and place, on a line of its own */
    .s-vec-pad { flex-basis: 100%; display: flex; justify-content: inherit; }
  }
  --s-expand-icon: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='%23000'%3E%3Ccircle cx='4' cy='4' r='1.6'/%3E%3Ccircle cx='12' cy='4' r='1.6'/%3E%3Ccircle cx='4' cy='12' r='1.6'/%3E%3Ccircle cx='12' cy='12' r='1.6'/%3E%3Ccircle cx='8' cy='8' r='1.6'/%3E%3C/svg%3E");

  /* ── XY pad ── */
  .s-xy { align-items: flex-start; }
  .s-xy .s-input { flex-wrap: wrap; }
  .s-pad-val { flex-basis: 100%; font-size: smaller; opacity: .7; font-variant-numeric: tabular-nums; }
  .s-pad {
    position: relative;
    width: calc(var(--u) * 24);
    height: calc(var(--u) * 24);
    max-width: 100%;
    aspect-ratio: 1;
    background: color-mix(in oklab, currentColor 6%, transparent);
    border: 1px solid color-mix(in oklab, currentColor 18%, transparent);
    border-radius: var(--r);
    cursor: crosshair;
    touch-action: none;
    &:focus-visible:not(:active) { outline: 2px solid var(--accent); outline-offset: 1px; }
    .s-pad-x, .s-pad-y { position: absolute; background: color-mix(in oklab, currentColor 12%, transparent); pointer-events: none; }
    .s-pad-x { left: 0; right: 0; top: 50%; height: 1px; }
    .s-pad-y { top: 0; bottom: 0; left: 50%; width: 1px; }
    .s-pad-dot {
      position: absolute;
      left: var(--x, 50%);
      top: var(--y, 50%);
      width: calc(var(--u) * 3);
      height: calc(var(--u) * 3);
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 0 calc(2 * var(--length)) color-mix(in oklab, var(--bg, #000), transparent 35%);
      pointer-events: none;
    }
  }

  /* ── Knob (rotary dial) ── */
  /* a knob row centres its label on the dial: the value beside it would otherwise set the baseline */
  .s-knob { align-items: center; }
  .s-knob-wrap {
    display: inline-flex; align-items: center; gap: calc(var(--u) * 2);
    cursor: ns-resize; touch-action: none;
    &:focus-visible { outline: none; }
    /* ring only for keyboard focus — grab()'s programmatic focus() matches
       :focus-visible during pointer drags; :active gates the flash out */
    &:focus-visible:not(:active) .s-knob-dial { outline: 2px solid var(--accent); outline-offset: 2px; }
  }
  .s-knob-dial {
    position: relative; flex: none;
    width: calc(var(--u) * 8); height: calc(var(--u) * 8);
    border-radius: 50%;
    background: color-mix(in oklab, currentColor 10%, transparent);
    border: 1px solid color-mix(in oklab, currentColor 22%, transparent);
    /* the needle turns about the dial's centre (--turn, from the control); the dial itself stays still, so its light
       and shadow never turn with it. A theme that moves the needle sets --pivot: the centre's height in its box */
    i { position: absolute; left: 50%; top: 9%; width: calc(2 * var(--length)); height: 30%; border-radius: 1px; background: var(--accent);
      translate: -50% 0; rotate: var(--turn, 0deg); transform-origin: 50% var(--pivot, 136.667%); }
  }
  /* the value keeps the room of its longest reading, eight characters at least (the control sets it), so dials stand
     in one column down the panel and never move as they turn */
  .s-knob-val { font-size: smaller; opacity: .8; font-variant-numeric: tabular-nums; }

  /* ── Forced colours (Windows contrast themes): backgrounds, shadows and masks are replaced by system
     colours, so state drawn with them vanishes. The native inputs carry state instead, selection takes
     Highlight, and colour content keeps its colours. Important in this first layer outranks every theme. ── */
  @media (forced-colors: active) {
    input:is([type="checkbox"], [type="radio"]) {
      appearance: auto !important; display: inline-block !important; position: static !important; opacity: 1 !important;
      width: auto !important; height: auto !important; margin: 0 !important; flex: none !important;
    }
    input[type="range"] { appearance: auto !important; opacity: 1 !important; }
    :is(.s-boolean, .s-checkboxes) .s-track, :is(.s-radio, .s-checkboxes) .s-input label::before { display: none !important; }
    :is(.s-segmented button, .s-swatches button).s-selected, button[aria-pressed="true"] {
      forced-color-adjust: none; background: Highlight !important; color: HighlightText !important;
    }
    .s-swatches button:not(.s-selected), input[type="color"], .s-pad-dot, .s-knob-dial i { forced-color-adjust: none; }
  }
}
}
/* A button's icon: inked with its lettering, a gap before its text; an icon alone makes the button a square
   (unlayered, so it outranks a theme's stretched or padded buttons) */
/* a text area grows with its text (field-sizing) from its theme's minimum: the one-line field height a theme gives every
   input would hold it at that minimum and hide the lines under it */
.s-panel .s-textarea textarea { height: auto; }
.s-panel .s-icon { display: inline-block; flex: none; width: 1.25em; height: 1.25em; vertical-align: -.27em; > svg { display: block; width: 100%; height: 100%; } }
.s-panel .s-icon + .s-button-text { margin-left: .45em; }
.s-panel button:has(> .s-icon) { white-space: nowrap; }   /* an icon and its word never part */
.s-panel .s-button button.s-icon-only { flex: none !important; width: auto !important; min-width: 0 !important; aspect-ratio: 1; padding: 0 !important; }   /* a theme's full-width keys would stretch the square */
/* A scrub's trail, as Tweakpane draws its drag: from where the press began toward the pointer, a light dashed line
   in the ink with a dot at its start and an arrowhead at its end, drawn in the row while the value is dragged */
.s-panel .s-control:has(> .s-scrub-trail) { position: relative; }
.s-panel .s-scrub-trail { position: absolute; z-index: 5; height: 2px; translate: 0 -50%; pointer-events: none;
  color: color-mix(in oklab, currentColor 45%, transparent);
  background: radial-gradient(circle closest-side, currentColor 75%, transparent) 0 0 / 4px 2px repeat-x;
  &::before, &::after { content: ''; position: absolute; top: 50%; background: currentColor; }
  &::before { left: 0; width: 4px; height: 4px; border-radius: 50%; translate: -50% -50%; }
  &::after { left: 100%; width: 6px; height: 7px; translate: -100% -50%; clip-path: polygon(0 0, 100% 50%, 0 100%); }
  &[data-dir="left"] { background-position: right; }
  &[data-dir="left"]::before { left: 100%; }
  &[data-dir="left"]::after { left: 0; translate: 0 -50%; clip-path: polygon(100% 0, 0 50%, 100% 100%); } }
/* A drag under way (control/util.js drag): the dragged control follows the pointer at once, and a scrub, pad or
   knob hides the pointer, its value not being under it */
.s-panel .s-dragging, .s-panel .s-dragging :is(*, ::before, ::after), .s-panel .s-dragging::before, .s-panel .s-dragging::after { transition: none !important; }
:root.s-cursorless, :root.s-cursorless * { cursor: none !important; }
@media (prefers-reduced-motion: reduce) {
  .s-panel, .s-panel *, .s-panel::details-content, .s-panel *::before, .s-panel *::after, .s-panel *::details-content {
    transition: none !important;
    animation: none !important;
  }
}`
