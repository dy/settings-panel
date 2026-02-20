## Cases

* https://neumorphism.io/
* https://smoothshadows.com/
* https://www.joshwcomeau.com/shadow-palette/
* https://www.joshwcomeau.com/gradient-generator/
* https://tweakcn.com/editor/theme
* https://variant.com/

## Color axes

### Explored approaches

1. **Lightness + Temperature + Vibrance** — Three sliders: L (0-100), Kelvin (1500K-15000K), chroma (0-100). Mapped Kelvin to OKLCH hue via CIE Planckian locus physics. Problem: steep hue transition 5K→7K felt unnatural for UI; physics-correct ≠ UX-correct.

2. **Tailwind gray ramps** — Analyzed slate/gray/zinc/neutral/stone. Discovered they're typographic tradition (cool→warm reading preference), not physics. Each ramp is single hue + chroma, varying only lightness.

3. **Surface + Accent** — Final. One color defines entire palette (extract L, C, H → build ramp). Second color for interactive states. Accent derived from surface if omitted (8× chroma, capped 0.25).

### Conclusion

Two colors suffice:
- **`surface`** — Base color. Lightness sets theme brightness, hue/chroma tint the ramp.
- **`accent`** — Interactive color. Optional; auto-derived if omitted.

Ramp generation via replaceable `shade(L, alpha?) → CSS color` function. Default uses OKLCH. Can swap for rampensau/poline/farbvelo.
