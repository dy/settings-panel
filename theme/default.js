/**
 * Default theme - complete, self-contained
 */

export const id = 'default'
export const label = 'Default'

export const css = `
settings-panel {
  --s-roundness: 0.55;
  --s-density: 1;
  --s-depth: 0.5;
  --s-contrast: 0.7;
  --s-saturation: 0.6;
  --s-temp: 0.5;

  --s-radius: calc(2px + 10px * var(--s-roundness));
  --s-radius-sm: calc(2px + 6px * var(--s-roundness));
  --s-radius-lg: calc(4px + 12px * var(--s-roundness));

  --s-space-1: calc(6px * var(--s-density));
  --s-space-2: calc(10px * var(--s-density));
  --s-space-3: calc(14px * var(--s-density));
  --s-space-4: calc(18px * var(--s-density));
  --s-spacing: var(--s-space-3);
  --s-control-height: calc(28px * var(--s-density));

  --s-font: "Sora", "IBM Plex Sans", "Segoe UI", sans-serif;
  --s-mono: "IBM Plex Mono", "SF Mono", ui-monospace, monospace;
  --s-font-size: 12.5px;
  --s-line: 1.3;
  --s-letter: 0;

  --s-bg: #121417;
  --s-panel-bg: var(--s-bg);
  --s-panel-texture: none;
  --s-panel-texture-blend: normal;
  --s-border: #20242b;
  --s-panel-border-color: var(--s-border);
  --s-panel-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);

  --s-fg: #e8edf2;
  --s-muted: #9aa3af;
  --s-accent: #6aa9ff;
  --s-accent-2: #9b8cff;
  --s-accent-contrast: #0b0f14;

  --s-input-bg: #161b22;
  --s-input-border: #222833;
  --s-input-fg: #eef2f6;
  --s-input-placeholder: rgba(235, 240, 248, 0.45);

  --s-track-bg: #1b2028;
  --s-track-fill: linear-gradient(90deg, rgba(106,169,255,0.9), rgba(155,140,255,0.9));
  --s-knob-bg: #cfe1ff;

  --s-chip-bg: #1a2028;
  --s-chip-fg: #e2e8f0;
  --s-divider: rgba(255, 255, 255, 0.06);
  --s-focus: rgba(106, 169, 255, 0.35);

  --s-ease: cubic-bezier(0.2, 0.7, 0.2, 1);
  --s-speed-fast: 140ms;
  --s-speed-slow: 260ms;

  display: block;
  min-width: 260px;
  color: var(--s-fg);
  background: var(--s-panel-bg);
  background-image: var(--s-panel-texture);
  background-blend-mode: var(--s-panel-texture-blend);
  border: 1px solid var(--s-panel-border-color);
  border-radius: var(--s-radius);
  box-shadow: var(--s-panel-shadow);
  padding: var(--s-spacing);
  font-family: var(--s-font);
  font-size: var(--s-font-size);
  line-height: var(--s-line);
  letter-spacing: var(--s-letter);
  position: relative;
  isolation: isolate;
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;

  *, *::before, *::after {
    box-sizing: border-box;
  }

  .s-control {
    display: flex;
    align-items: center;
    gap: var(--s-space-2);
    padding: calc(var(--s-space-1) * 0.75) 0;
    min-height: var(--s-control-height);
    margin: 0;
    border: 0;

    & + .s-control {
      border-top: 1px solid var(--s-divider);
    }
  }

  .s-label {
    flex: 0 0 auto;
    min-width: 90px;
    font-weight: 600;
    color: var(--s-fg);
  }

  .s-input {
    flex: 1;
    display: flex;
    align-items: center;
    gap: calc(var(--s-space-1) * 0.6);
  }

  input[type="text"],
  input[type="number"],
  textarea,
  select {
    background: var(--s-input-bg);
    border: 1px solid var(--s-input-border);
    border-radius: var(--s-radius-sm);
    color: var(--s-input-fg);
    padding: 6px 8px;
    font-family: inherit;
    transition: border-color var(--s-speed-fast) var(--s-ease),
      box-shadow var(--s-speed-fast) var(--s-ease),
      background var(--s-speed-fast) var(--s-ease);

    &::placeholder {
      color: var(--s-input-placeholder);
    }

    &:focus-visible {
      outline: none;
      border-color: var(--s-accent);
      box-shadow: 0 0 0 2px var(--s-focus);
    }
  }

  button:focus-visible {
    outline: none;
    border-color: var(--s-accent);
    box-shadow: 0 0 0 2px var(--s-focus);
  }

  /* Boolean / Toggle */
  .s-boolean {
    input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    &.checked .s-toggle {
      background: var(--s-accent);

      &::after {
        transform: translateX(16px);
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
      }
    }
  }

  .s-toggle {
    width: 36px;
    height: 20px;
    background: var(--s-track-bg);
    border-radius: 999px;
    position: relative;
    cursor: pointer;
    transition: background var(--s-speed-fast) var(--s-ease);
    box-shadow: inset 0 0 0 1px var(--s-input-border);

    &::after {
      content: '';
      position: absolute;
      width: 14px;
      height: 14px;
      background: var(--s-knob-bg);
      border-radius: 50%;
      top: 3px;
      left: 3px;
      transition: transform var(--s-speed-fast) var(--s-ease),
        box-shadow var(--s-speed-fast) var(--s-ease);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    }
  }

  /* Number */
  .s-number {
    input[type="number"] {
      width: 76px;
      font-family: var(--s-mono);
      text-align: right;

      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
      }
    }
  }

  .s-step {
    width: 26px;
    height: 26px;
    background: var(--s-input-bg);
    border: 1px solid var(--s-input-border);
    border-radius: var(--s-radius-sm);
    color: var(--s-fg);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1;
    transition: background var(--s-speed-fast) var(--s-ease),
      color var(--s-speed-fast) var(--s-ease),
      border-color var(--s-speed-fast) var(--s-ease);

    &:hover:not(:disabled) {
      background: var(--s-accent);
      color: var(--s-accent-contrast);
      border-color: transparent;
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  /* Slider */
  .s-slider {
    .s-input {
      flex-direction: row;
    }

    input[type="range"] {
      flex: 1;
      height: 6px;
      background: var(--s-track-bg);
      border-radius: 999px;
      -webkit-appearance: none;
      cursor: pointer;
      position: relative;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        background: var(--s-knob-bg);
        border-radius: 50%;
        border: 2px solid var(--s-accent);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        cursor: grab;
      }

      &::-moz-range-thumb {
        width: 14px;
        height: 14px;
        background: var(--s-knob-bg);
        border-radius: 50%;
        border: 2px solid var(--s-accent);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        cursor: grab;
      }
    }

    .s-value {
      min-width: 52px;
      text-align: right;
      font-family: var(--s-mono);
      font-size: 11px;
      opacity: 0.75;
    }
  }

  /* Select */
  .s-select select {
    flex: 1;
    cursor: pointer;
    appearance: none;
    background-image:
      linear-gradient(45deg, transparent 50%, var(--s-muted) 50%),
      linear-gradient(135deg, var(--s-muted) 50%, transparent 50%);
    background-position: calc(100% - 16px) 50%, calc(100% - 11px) 50%;
    background-size: 5px 5px, 5px 5px;
    background-repeat: no-repeat;
    padding-right: 26px;
  }

  .s-buttons {
    flex-wrap: wrap;

    .s-input {
      gap: calc(var(--s-space-1) * 0.4);
    }

    button {
      background: var(--s-chip-bg);
      border: 1px solid var(--s-input-border);
      border-radius: 999px;
      color: var(--s-chip-fg);
      padding: 4px 10px;
      cursor: pointer;
      font-size: 11px;
      transition: background var(--s-speed-fast) var(--s-ease),
        color var(--s-speed-fast) var(--s-ease),
        border-color var(--s-speed-fast) var(--s-ease);

      &:hover {
        border-color: var(--s-accent);
      }

      &.selected {
        background: var(--s-accent);
        color: var(--s-accent-contrast);
        border-color: transparent;
      }
    }
  }

  .s-radio {
    .s-input {
      flex-direction: column;
      align-items: flex-start;
      gap: calc(var(--s-space-1) * 0.4);
    }

    label {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      color: var(--s-muted);

      &.selected {
        color: var(--s-fg);
      }
    }
  }

  /* Color */
  .s-color input[type="color"] {
    width: 0;
    height: 0;
    opacity: 0;
    position: absolute;
  }

  .s-preview {
    width: 26px;
    height: 26px;
    border-radius: var(--s-radius-sm);
    cursor: pointer;
    border: 1px solid var(--s-input-border);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  }

  .s-hex {
    font-family: var(--s-mono);
    font-size: 11px;
    opacity: 0.75;
  }

  .s-swatches {
    .s-input {
      flex-wrap: wrap;
      gap: 4px;
    }

    button {
      width: 22px;
      height: 22px;
      border: 1px solid transparent;
      border-radius: 6px;
      cursor: pointer;
      padding: 0;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);

      &.selected {
        border-color: var(--s-fg);
        box-shadow: 0 0 0 2px var(--s-panel-bg);
      }
    }
  }

  /* Text */
  .s-text input[type="text"] {
    flex: 1;
  }

  /* Textarea */
  .s-textarea {
    align-items: flex-start;

    textarea {
      flex: 1;
      font-family: var(--s-mono);
      font-size: 11px;
      resize: vertical;
      min-height: 70px;
    }
  }

  /* Button */
  .s-button button {
    background: var(--s-accent);
    border: 1px solid transparent;
    border-radius: var(--s-radius-sm);
    color: var(--s-accent-contrast);
    padding: 7px 12px;
    cursor: pointer;
    font-weight: 600;
    font-size: 11px;
    transition: transform var(--s-speed-fast) var(--s-ease),
      filter var(--s-speed-fast) var(--s-ease),
      box-shadow var(--s-speed-fast) var(--s-ease);

    &:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);
    }

    &:active {
      transform: translateY(0);
      filter: brightness(0.96);
    }
  }

  /* Folder */
  .s-folder {
    display: block;
    border: 0;
    padding: 0;
    margin: 4px 0;

    > summary {
      cursor: pointer;
      padding: 6px 0;
      font-weight: 700;
      list-style: none;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--s-fg);

      &::-webkit-details-marker {
        display: none;
      }

      &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-right: 2px solid var(--s-muted);
        border-bottom: 2px solid var(--s-muted);
        transform: rotate(-45deg);
        transition: transform var(--s-speed-fast) var(--s-ease);
      }
    }

    &[open] > summary::before {
      transform: rotate(45deg);
    }
  }

  .s-content {
    padding: 6px 0 6px 16px;
    border-left: 1px solid var(--s-divider);
    margin: 4px 0 4px 6px;
  }

  @media (prefers-reduced-motion: reduce) {
    --s-speed-fast: 0ms;
    --s-speed-slow: 0ms;
  }
}
`

export default { id, label, css }
