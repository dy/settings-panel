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

  /* ── Collapse ── */
  &:is(details) {
    display: block;
    interpolate-size: allow-keywords;
    &::details-content {
      content-visibility: visible;
      height: 0;
      opacity: 0;
      transition: height 200ms 80ms, opacity 80ms;
    }
    &[open]::details-content {
      height: auto;
      opacity: 1;
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
}
}`
