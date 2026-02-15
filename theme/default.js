/**
 * Default theme — browser baseline
 *
 * default(axes?) → CSS string
 */

const { round } = Math
const lerp = (a, b, t) => a + (b - a) * t

export default function base({
  shade = '#f5f4f2',
  spacing = 1,
  size = 1,
  weight = 400,
  accent = '#2563eb',
} = {}) {

  const u = 4
  const fontSize = lerp(11, 15, size)
  const lh = 4 * u

  return `.s-panel {
  --bg: ${shade};
  --accent: ${accent};
  --u: ${u}px;
  --sp: ${spacing};

  display: flex; flex-direction: column; gap: calc(var(--u) * 2 * var(--sp));
  background-color: var(--bg);
  color-scheme: light;
  accent-color: var(--accent);
  padding: calc(var(--u) * 3 * var(--sp));
  font: ${round(weight)} ${fontSize}px system-ui, -apple-system, sans-serif;
  line-height: ${lh}px;
  min-width: calc(var(--u) * 60);
  -webkit-font-smoothing: antialiased;

  &, *, *::before, *::after { box-sizing: border-box; }

  /* ── Control row ── */
  .s-control {
    display: flex; align-items: baseline;
    gap: calc(var(--u) * 2 * var(--sp));
    margin: 0; border: 0;
  }
  .s-label-group { flex: 0 0 auto; width: calc(var(--u) * 20); display: flex; flex-direction: column; gap: 2px; }
  .s-label { color: inherit; }
  .s-hint { font-size: smaller; opacity: .6; line-height: ${lh}px; }
  .s-input { flex: 1; display: flex; align-items: baseline; gap: calc(var(--u) * var(--sp)); }

  /* ── Input base ── */
  input[type="text"], input[type="number"], textarea, select {
    padding: calc(var(--u) * (0.75 + 0.75 * var(--sp))) calc(var(--u) * (1 + 1 * var(--sp)));
    font: inherit;
    &:focus-visible { outline: 2px solid var(--accent); outline-offset: -1px; }
  }
  button { font: inherit; cursor: pointer; }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: -1px; }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { width: ${lh}px; height: ${lh}px; margin: 0; cursor: pointer; }
  }

  /* ── Number ── */
  .s-number input[type="number"] { width: calc(var(--u) * 20); text-align: right; }

  /* ── Step buttons ── */
  .s-step {
    width: calc(var(--u) * 7); height: calc(var(--u) * 7);
    display: flex; align-items: center; justify-content: center;
    line-height: 1;
  }

  /* ── Slider ── */
  .s-slider {
    padding: calc(1.25*var(--u)) 0;
    .s-input { flex-direction: row; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: ${lh}px; }
    .s-track { flex: 1; position: relative; display: flex; align-items: center; }
    input[type="range"] {
      width: 100%; margin: 0;
      cursor: pointer;
    }
    .s-marks, .s-mark-labels {
      position: absolute;
      left: 0; right: 0; top: 0; bottom: 0;
      pointer-events: none;
    }
    .s-marks { display: none; }
    .s-mark-label {
      position: absolute; top: 100%;
      transform: translate(-50%, 4px);
      font-size: smaller; text-align: center; white-space: nowrap;
      opacity: .5;
      &.active { opacity: 1; color: var(--accent); }
    }
    .s-value {
      min-width: calc(var(--u) * 10);
      font-size: smaller; text-align: right;
      opacity: .6;
    }
  }

  /* ── Select ── */
  .s-select select { flex: 1; cursor: pointer; }
  .s-buttons {
    flex-wrap: wrap;
    .s-input { gap: calc(var(--u) * .5 * var(--sp)); }
    button { padding: var(--u) calc(var(--u) * 2.5); }
  }
  .s-radio {
    .s-input { flex-direction: column; align-items: flex-start; gap: calc(var(--u) * .5 * var(--sp)); }
    label { display: flex; align-items: center; gap: calc(var(--u) * 1.5); cursor: pointer; opacity: .6; &.selected { opacity: 1; } }
  }

  /* ── Color ── */
  .s-color-input {
    flex: 1; position: relative; display: flex; align-items: center;
    input[type="color"] { position: absolute; left: var(--u); width: calc(var(--u) * 5); height: calc(var(--u) * 5); padding: 0; border: none; cursor: pointer; }
    input[type="text"] { flex: 1; padding-left: calc(var(--u) * 7); }
  }
  .s-swatches {
    .s-input { flex-wrap: wrap; gap: var(--u); }
    button {
      width: calc(var(--u) * 5); height: calc(var(--u) * 5); padding: 0; border: 1px solid;
      &.selected { outline: 2px solid var(--accent); outline-offset: 1px; }
    }
  }

  /* ── Text ── */
  .s-text input[type="text"] { flex: 1; }

  /* ── Textarea ── */
  .s-textarea {
    align-items: flex-start;
    textarea { flex: 1; resize: none; overflow: hidden; }
  }

  /* ── Button (action) ── */
  .s-button button {
    padding: calc(var(--u) * 2.5) calc(var(--u) * 4);
    background: var(--accent); color: white; border: none; font-weight: bolder;
    &:hover { filter: brightness(1.1); }
    &:active { filter: brightness(.9); }
    &:disabled { opacity: .35; cursor: not-allowed; }
  }
  .s-button.secondary button {
    background: transparent; border: 1px solid; color: inherit;
    &:hover { color: var(--accent); filter: none; }
  }

  /* ── Folder ── */
  .s-folder {
    display: block; border: 0; padding: 0;
    > summary {
      cursor: pointer; padding: calc(var(--u) * 1.5) 0;
      list-style: none; display: flex; align-items: center;
      border-bottom: 1px solid; opacity: .8;
      &::-webkit-details-marker { display: none; }
      &::after {
        content: ''; width: 7px; height: 7px; margin-left: auto; flex-shrink: 0;
        border-right: 1px solid; border-bottom: 1px solid;
        transform: rotate(45deg); transition: transform 140ms;
      }
    }
    &[open] > summary { border-bottom: none; }
    &[open] > summary::after { transform: rotate(-135deg); }
  }
  .s-content {
    padding: calc(var(--u) * 2 * var(--sp)) 0;
    display: flex; flex-direction: column; gap: calc(var(--u) * 2 * var(--sp));
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition-duration: 0ms !important; }
  }
}`
}
