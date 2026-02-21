## Cases

* https://neumorphism.io/
* https://smoothshadows.com/
* https://www.joshwcomeau.com/shadow-palette/
* https://www.joshwcomeau.com/gradient-generator/
* https://tweakcn.com/editor/theme
* https://variant.com/

## Color axes

1. **Lightness + Temperature + Vibrance** — Three sliders: L (0-100), Kelvin (1500K-15000K), chroma (0-100). Mapped Kelvin to OKLCH hue via CIE Planckian locus physics. Problem: steep hue transition 5K→7K felt unnatural for UI; physics-correct ≠ UX-correct.

2. **Tailwind gray ramps** — Analyzed slate/gray/zinc/neutral/stone. Discovered they're typographic tradition (cool→warm reading preference), not physics. Each ramp is single hue + chroma, varying only lightness.

3. **Surface + Accent** — Final. One color defines entire palette (extract L, C, H → build ramp). Second color for interactive states. Accent derived from surface if omitted (8× chroma, capped 0.25).

### Conclusion

Two colors suffice:
- **`surface`** — Base color. Lightness sets theme brightness, hue/chroma tint the ramp.
- **`accent`** — Interactive color. Optional; auto-derived if omitted.

Ramp generation via replaceable `shade(L, alpha?) → CSS color` function. Default uses OKLCH. Can swap for rampensau/poline/farbvelo.

## Gallery specimen ideas

Goal: canonical "quick brown fox" for settings panels. Every control appears for a natural reason.

### Creatures / things
- **Cloud** — name, type (select), description (textarea), color, size (segmented), opacity, fluffiness (slider), altitude, speed, rain chance, temp range (range slider), drifting (toggle), ominous (toggle), shapes (multi-select), wind (button group), randomize/rain (buttons). "Cumulus Steve". Opacity pun. "Looks like a dog if you squint."
- **Creature** — name, species, age, bio, color, size, opacity, roundness, speed/strength/charm (sliders), temp range, friendly/nocturnal (toggles), abilities (multi), align (icon group), save. "Bloop."
- **Planet** — name, class, description, color, size, rings (toggle), opacity, gravity, temp range, atmosphere (multi), habitable, moons (number), orbit speed, axial tilt. "Zephyria."
- **Ghost** — name, type, last words (textarea), ectoplasm color, form (segmented), opacity (pun!), spookiness, chain rattle volume, active hours (range), visible to mortals (toggle), abilities (multi). Opacity is literal.
- **Potion** — name, type, recipe (textarea), color, clarity (segmented), viscosity, glow (toggle), potency, duration, serving temp (range), doses, pleasant/bitter (toggles), side effects (multi).

### Practical / real-world
- **Lamp** — color, brightness, warmth, mode (select), schedule (range), on (toggle). Narrow — forced text/textarea.
- **Alarm clock** — time, days (multi), sound (select), volume, snooze (toggle), label (text), vibrate (toggle). Needs time control.
- **Room** — name, wall color, temp range, brightness, music (select), mood (segmented), furniture (multi).
- **Poster / flyer** — title, subtitle, font (select), color, size, alignment (segmented/buttons), layout. Design-meta.
- **Spaceship** — name, class (select), hull color, speed, shields, weapons (multi), crew (number), systems (toggles).
- **Pet robot** — name, model (select), body color, voice pitch, speed, personality (multi), greeting (text), abilities.
- **Cocktail** — name, base spirit (select), color, strength, ingredients (multi), garnish, instructions (textarea). Alcohol not universal.
- **Pizza** — name, size (segmented), crust (select), toppings (multi), spice, bake temp (slider), notes (textarea).
- **Firework** — name, color, pattern (select), size, burst count (number), trail (toggle), fuse time, launch (button). Visual, compact.
- **Music player** — title, artist (text), genre (select), volume, eq sliders, repeat/shuffle (toggles), progress (range).
- **Weather station** — location, temp, humidity, wind speed, cloud type (select), precipitation (toggle). Read-only feel.
- **Plant / garden** — name, species (select), color, water range, light, soil (select), notes (textarea). Gentle but weak on actions.
- **Signal / broadcast** — name, frequency, amplitude, waveform (select), color, modulation, message (text). Technical.

### Absurd precision
- **Awkward silence** — location (select), participants (number), cause (text), tension (slider), duration (range), eye contact (toggle), someone coughs (toggle), flavor (segmented), color, volume (slider near-zero), broken by (multi), graceful (toggle), endure/flee/worsen (buttons).
- **Sigh** — reason (select), setting (text), backstory (textarea), depth (slider), duration (range), volume, color, tone (segmented), existential/audible/eyes closed (toggles), contagious (slider), nearby sighs (number), triggers (multi).
- **Yawn** — contagiousness, duration, jaw angle, sound, tears (toggle), chain reaction count.
- **Nap** — depth, drool (toggle), duration range, position (segmented), dream vividness, snore volume.
- **Sneeze** — force, multiplicity (number), polite (toggle), aftermath (segmented), contagious, bless count.
- **Dad joke** — setup (text), punchline (textarea), groan level, pun density, audience (select), eye roll (toggle), delivery (segmented).
- **Sandwich** — name, bread (select), spread, fillings (multi), toasted (toggle), spice level (slider), structural integrity, temp range, lettuce layers (number).
- **Fortune cookie** — message (textarea), vagueness (slider), lucky numbers, font (select), wisdom level, accuracy (toggle).
- **Excuse** — text, believability (slider), eye contact (toggle), confidence, target audience (select), backup excuse (textarea).

### Cultural / social
- **Haiku** — syllable sliders [5,7,5], topic (select), season (segmented), mood, wabi-sabi (toggle). Engineering poetry.
- **Lullaby** — drowsiness (slider), sheep count (number), tempo, key (select), volume, repeat (toggle).
- **Compliment** — text, sincerity (slider), awkwardness, target (select), eye contact (toggle), delivery (segmented).
- **Rumor** — text, spread rate, plausibility (slider), source (select), anonymous (toggle), exaggeration.
- **Déjà vu** — intensity, previous occurrences (number), certainty (slider), location (text), recursive (toggle).
- **Toast (speech)** — text (textarea), sentimentality (slider), glass raised (toggle), audience (select), duration, tears.
- **Elevator ride** — awkwardness (slider), floor staring (toggle), floors (number), music (select), duration (range).
- **Horoscope** — sign (select), vagueness (slider), applicability, lucky color, message (textarea), accuracy (toggle).
- **Voicemail** — message (textarea), rambling (slider), uhms (number), hung up accidentally (toggle), urgency (segmented).
- **Wi-Fi name** — name (text), passive aggression (slider), neighborly (toggle), visibility, encryption (select).

### AI generation tasks
- **Email** — tone (segmented: formal/casual/passive-aggressive), urgency, length (slider), emoji density, sign-off (select), subject (text), body (textarea), send (toggle: default false).
- **Commit message** — type (segmented: feat/fix/chore/yolo), scope (text), breaking (toggle), emoji (toggle), desperation (slider), blame (select).
- **Social post** — platform (segmented), content (textarea), hashtags (slider), engagement bait (toggle), emoji density, filter (select), vibes (multi).
- **Presentation** — title (text), theme color, layout (segmented), bullets (number), animation (select), jargon (slider), synergy (toggle).
- **Recipe** — name (text), cuisine (select), servings (number), spice (slider), difficulty (segmented), ingredients (multi), dietary (multi), time range, notes (textarea).
- **Password** — length (slider), upper/lower/numbers/symbols (toggles), memorable (toggle), strength color, copy (button).
- **Playlist** — name (text), mood (segmented), genre (multi), tempo range (range), duration (slider), explicit (toggle), color (synesthesia).
- **Avatar** — name (text), style (select), bg color, expression (segmented), accessories (multi), border (toggle), size (slider), randomize (button).
- **Meeting** — title (text), duration (slider), participants (number), room (select), agenda (textarea), could-be-email (toggle), snacks (toggle).
- **Notification** — title (text), body (textarea), urgency (segmented), sound (select), color, vibrate (toggle), dismiss after (slider).
- **Meme** — template (select), top/bottom text, font size (slider), impact font (toggle), quality (segmented: deep-fried/normal/hd), watermark (toggle).

### Generative / visual
Future: settings panel per-graphic-logic — adjusting static canonical posters.

- **Blob** — complexity, smoothness, size, color, seed, animate (toggle). Minimal, every slider morphs shape.
- **Confetti** — count, size range (range), colors (multi), spread, shapes (segmented: circle/square/star), gravity, wind.
- **Wave** — layers (number), amplitude, frequency, color, speed, fill (toggle). Layered sliders, hypnotic.
- **Pattern** — type (select: dots/lines/waves/cross/chevron), scale, rotation, gap, stroke weight, color, fill color. Tiling.
- **Star** — points (number), inner/outer radius (range slider), color, rotation, glow (toggle), animate. Old poster style.
- **Spirograph** — loops, radius ratio, pen offset, color, stroke width, speed, fill (toggle). Line width across image.
- **Noise field** — type (select: perlin/simplex/worley/fbm), octaves, scale, seed, palette (select), animate, particles (toggle).
- **Fractal** — formula (select: mandelbrot/julia/sierpinski/koch), iterations (number), zoom, center xy (pad), color map (select), animate (toggle).
- **Particle system** — count, speed, size range (range), color, gravity, fade (toggle), shape (segmented), emit rate.
- **Barcode/QR** — data (text), type (segmented: barcode/qr), size, color, bg color, error correction (select), quiet zone (toggle).
- **Shadow** — layers (number), distance, blur, spread, color, angle (slider), elevation (segmented). Ref: smoothshadows, Josh Comeau.
- **Gradient** — type (segmented: linear/radial/conic), angle, stops (number), colors, easing (select). Ref: gradient-generator.
- **Neumorphism** — light angle, intensity, shape (segmented: flat/concave/convex/pressed), color, size, radius. Ref: neumorphism.io.
- **Glass** — blur, opacity, tint color, border (toggle), noise (toggle), shadow (toggle). Glassmorphism.
- **Button** — text, bg color, text color, padding, radius, shadow depth, font weight, hover effect (select).
- **Card** — padding, radius, shadow, bg, border (toggle), elevation (segmented), width.
- **Text effect** — text (text), font (select), size, color, shadow, spacing, weight, transform (segmented: none/upper/lower).
- **Mesh gradient** — complexity (number), colors (multi-color), softness, seed, resolution.
- **Loader** — type (segmented: spin/pulse/dots/bar), size, color, speed, stroke width.
