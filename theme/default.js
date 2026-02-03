/**
 * Default theme - minimal, clean
 */

const css = `
settings-panel {
  --s-bg: #1a1a1a;
  --s-fg: #e0e0e0;
  --s-accent: #4a9eff;
  --s-border: #333;
  --s-radius: 3px;
  --s-font: system-ui, -apple-system, sans-serif;
  --s-mono: ui-monospace, monospace;
  --s-spacing: 8px;

  display: block;
  background: var(--s-bg);
  color: var(--s-fg);
  font-family: var(--s-font);
  font-size: 12px;
  padding: var(--s-spacing);
  min-width: 240px;
  border-radius: var(--s-radius);
}

/* Control base */
.s-control {
  display: flex;
  align-items: center;
  gap: var(--s-spacing);
  padding: 4px 0;
  border: 0;
  margin: 0;
}

.s-label {
  flex: 0 0 auto;
  min-width: 80px;
  font-weight: 500;
  color: var(--s-fg);
}

.s-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Boolean / Toggle */
.s-boolean input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.s-toggle {
  width: 32px;
  height: 18px;
  background: var(--s-border);
  border-radius: 9px;
  position: relative;
  cursor: pointer;
  transition: background 0.15s;
}

.s-toggle::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  background: var(--s-fg);
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.15s;
}

.s-boolean.checked .s-toggle {
  background: var(--s-accent);
}

.s-boolean.checked .s-toggle::after {
  transform: translateX(14px);
}

/* Number */
.s-number input[type="number"] {
  width: 60px;
  background: var(--s-border);
  border: 0;
  border-radius: var(--s-radius);
  color: var(--s-fg);
  padding: 4px 6px;
  font-family: var(--s-mono);
  text-align: right;
}

.s-number input[type="number"]::-webkit-inner-spin-button,
.s-number input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.s-step {
  width: 22px;
  height: 22px;
  background: var(--s-border);
  border: 0;
  border-radius: var(--s-radius);
  color: var(--s-fg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
}

.s-step:hover:not(:disabled) {
  background: var(--s-accent);
}

.s-step:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Slider */
.s-slider .s-input {
  flex-direction: row;
}

.s-slider input[type="range"] {
  flex: 1;
  height: 4px;
  background: var(--s-border);
  border-radius: 2px;
  -webkit-appearance: none;
  cursor: pointer;
}

.s-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: var(--s-accent);
  border-radius: 50%;
  cursor: grab;
}

.s-slider .s-value {
  min-width: 50px;
  text-align: right;
  font-family: var(--s-mono);
  font-size: 11px;
  opacity: 0.8;
}

/* Select */
.s-select select {
  flex: 1;
  background: var(--s-border);
  border: 0;
  border-radius: var(--s-radius);
  color: var(--s-fg);
  padding: 4px 8px;
  cursor: pointer;
}

.s-buttons {
  flex-wrap: wrap;
}

.s-buttons .s-input {
  gap: 2px;
}

.s-buttons button {
  background: var(--s-border);
  border: 0;
  border-radius: var(--s-radius);
  color: var(--s-fg);
  padding: 4px 8px;
  cursor: pointer;
  font-size: 11px;
}

.s-buttons button:hover {
  background: #444;
}

.s-buttons button.selected {
  background: var(--s-accent);
  color: #fff;
}

.s-radio .s-input {
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.s-radio label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* Color */
.s-color input[type="color"] {
  width: 0;
  height: 0;
  opacity: 0;
  position: absolute;
}

.s-preview {
  width: 24px;
  height: 24px;
  border-radius: var(--s-radius);
  cursor: pointer;
  border: 1px solid var(--s-border);
}

.s-picker label {
  cursor: pointer;
}

.s-hex {
  font-family: var(--s-mono);
  font-size: 11px;
  opacity: 0.8;
}

.s-swatches .s-input {
  flex-wrap: wrap;
  gap: 2px;
}

.s-swatches button {
  width: 20px;
  height: 20px;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  padding: 0;
}

.s-swatches button.selected {
  border-color: var(--s-fg);
  box-shadow: 0 0 0 1px var(--s-bg);
}

/* Text */
.s-text input[type="text"] {
  flex: 1;
  background: var(--s-border);
  border: 0;
  border-radius: var(--s-radius);
  color: var(--s-fg);
  padding: 4px 8px;
  font-family: inherit;
}

.s-text input::placeholder {
  color: #666;
}

/* Textarea */
.s-textarea {
  align-items: flex-start;
}

.s-textarea textarea {
  flex: 1;
  background: var(--s-border);
  border: 0;
  border-radius: var(--s-radius);
  color: var(--s-fg);
  padding: 6px 8px;
  font-family: var(--s-mono);
  font-size: 11px;
  resize: vertical;
  min-height: 60px;
}

.s-textarea textarea::placeholder {
  color: #666;
}

/* Button */
.s-button button {
  background: var(--s-accent);
  border: 0;
  border-radius: var(--s-radius);
  color: #fff;
  padding: 6px 12px;
  cursor: pointer;
  font-weight: 500;
  font-size: 11px;
}

.s-button button:hover {
  filter: brightness(1.1);
}

.s-button button:active {
  filter: brightness(0.9);
}

/* Folder */
.s-folder {
  border: 0;
  padding: 0;
  margin: 4px 0;
}

.s-folder > summary {
  cursor: pointer;
  padding: 4px 0;
  font-weight: 600;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.s-folder > summary::before {
  content: '▸';
  font-size: 10px;
  transition: transform 0.15s;
}

.s-folder[open] > summary::before {
  transform: rotate(90deg);
}

.s-content {
  padding-left: 12px;
  border-left: 1px solid var(--s-border);
  margin-left: 4px;
}
`

// Inject styles once
let injected = false
export function injectStyles() {
  if (injected) return
  injected = true
  const style = document.createElement('style')
  style.id = 'settings-panel-theme'
  style.textContent = css
  document.head.appendChild(style)
}

export default css
