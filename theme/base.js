/**
 * Base scaffold — tokens, layout, collapse. No visual theme.
 * All themes compose: baseCSS + theme overrides.
 */

export default `@layer s-base {
.s-panel {

  /* ── Tokens (override in theme) ── */
  --bg: #f5f4f2;
  --accent: #2563eb;
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
  .s-search { margin-left: auto; min-width: 0; display: inline-flex; align-items: center; gap: 4px; }
  .s-search-btn {
    flex: none; width: 16px; height: 16px; padding: 0; border: none; cursor: pointer;
    background: currentColor;
    -webkit-mask: var(--s-search-icon) center / contain no-repeat;
    mask: var(--s-search-icon) center / contain no-repeat;
  }
  --s-search-icon: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23000' stroke-width='1.5'%3E%3Ccircle cx='7' cy='7' r='4.5'/%3E%3Cpath d='M10.5 10.5 L14 14'/%3E%3C/svg%3E");
  .s-search-input { display: none; border: none; background: transparent; color: inherit; font: inherit; min-width: 0; }
  &.s-searching .s-search-input { display: inline-block; }

  /* ── Numeric drag-scrub ── */
  input.s-scrubbing { cursor: ew-resize; user-select: none; }

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
    gap: var(--pad);
  }

  /* ── Control row ── */
  .s-control {
    display: flex;
    align-items: baseline;
    gap: calc(var(--u) * (1 + var(--spacing)));
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
  input[type="text"], input[type="number"], textarea, select {
    width: 0;
    min-width: 0;
    font: inherit;
    color: inherit;
    padding: var(--pad) var(--pad-i);
  }
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
        conic-gradient(#c4c4c4 90deg, #fff 0 180deg, #c4c4c4 0 270deg, #fff 0) 0 0 / 8px 8px;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(var(--u) * 3); height: calc(var(--u) * 3); border-radius: 50%; background: #fff; border: 1px solid rgba(0,0,0,.35); cursor: pointer; }
      &::-moz-range-thumb { width: calc(var(--u) * 3); height: calc(var(--u) * 3); border-radius: 50%; background: #fff; border: 1px solid rgba(0,0,0,.35); cursor: pointer; }
    }
  }

  /* ── Slider layout ── */
  .s-slider .s-track {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }
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
      pointer-events: none;
      &::-webkit-slider-thumb { pointer-events: all; }
      &::-moz-range-thumb { pointer-events: all; }
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
    &::before, &::after { content: ''; flex: 1; height: 1px; background: currentColor; opacity: .15; }
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
    .s-vec-axis { flex: 1; min-width: 0; display: flex; align-items: center; gap: var(--u); }
    .s-vec-label { flex: none; font-size: smaller; opacity: .55; }
    input[type="number"] { flex: 1; width: 0; min-width: 0; text-align: right; }
    /* expandable 2D pad (pad option) — dot-in-corners glyph toggle, pad on its own row */
    .s-vec-expand {
      flex: none; width: 16px; height: 16px; padding: 0; border: none; cursor: pointer;
      background: currentColor; opacity: .55;
      -webkit-mask: var(--s-expand-icon) center / contain no-repeat;
      mask: var(--s-expand-icon) center / contain no-repeat;
      &:hover, &.s-open { opacity: 1; }
    }
    .s-pad { flex-basis: 100%; }
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
      box-shadow: 0 0 0 2px color-mix(in oklab, var(--bg, #000), transparent 35%);
      pointer-events: none;
    }
  }

  /* ── Knob (rotary dial) ── */
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
    i { position: absolute; left: 50%; top: 9%; width: 2px; height: 30%; border-radius: 1px; background: var(--accent); transform: translateX(-50%); }
  }
  .s-knob-val { font-size: smaller; opacity: .8; font-variant-numeric: tabular-nums; }
}
}
@media (prefers-reduced-motion: reduce) {
  .s-panel, .s-panel *, .s-panel::details-content, .s-panel *::before, .s-panel *::after, .s-panel *::details-content {
    transition: none !important;
    animation: none !important;
  }
}`
