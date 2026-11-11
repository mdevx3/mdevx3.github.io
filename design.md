# Design system: Darrell Lokadeva Lim portfolio

This file sets out the rules the site is built on: tokens, layout, the 3D scene and motion. Code is the source of truth for exact values (`assets/css/tokens.css`, `assets/js/scene/config.js`). This file explains what those values are for, so changes stay consistent.

---

## 1. Principles

1. **Depth without noise.** A single 3D network runs through the whole home page and changes shape for each section. Everything else stays flat and quiet: black, white and one electric-blue gradient.
2. **The 3D layer never covers text.** Text sits either in empty space the scene is framed to avoid, or on an opaque or frosted surface. Section 3 explains how each section enforces this.
3. **Every motion explains something.** Scroll drives the story (the network morphs as the sections change). Pointer input gives feedback (tilt, glare, magnetic arrows). Nothing loops for decoration, apart from the gentle idle spin of the network.
4. **Readable without effects.** With no JavaScript, no WebGL or reduced motion turned on, every page is complete and readable.

---

## 2. Design tokens (`assets/css/tokens.css`)

### Colour

Dark is the default theme. The nav switch flips to light and remembers the choice in `localStorage`.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#000000` | `#ffffff` | Page background (deep black / clean white) |
| `--bg-raised` | `#0b0b0e` | `#f5f5f7` | Opaque project tiles |
| `--glass` / `--glass-strong` | 66% / 86% near-black | 70% / 90% white | Frosted panels over the 3D layer |
| `--text` | `#f5f5f7` | `#1d1d1f` | Primary text |
| `--text-2` | `#a1a1a6` | `#424245` | Body copy, leads |
| `--text-3` | `#86868b` | `#6e6e73` | Labels, metadata (≥ 4.5:1 on `--bg`) |
| `--blue` | `#0071e3` | `#0071e3` | Solid CTA fill (white text 4.7:1) |
| `--blue-text` | `#2997ff` | `#0066cc` | Accent text and links |
| `--gradient` | `#0066ff → #2997ff → #64d2ff` | `#0040dd → #0071e3 → #0a9fe0` | Display words, hairlines, glows. **Never for small text.** |
| `--spot-color` / `--spot-edge` | blue 16% / black 82% | blue 10% / white 70% | Spotlight shading over the canvas |

### Typography

**Geist** for headlines and body. **Geist Mono** for labels, metadata and data. Both load from Google Fonts.

| Token | Range (min → max) | Use |
|---|---|---|
| `--fs-display` | 48 → 120px | Hero tagline |
| `--fs-h1` | 42 → 88px | Page titles, hero statement, contact headline |
| `--fs-h2` | 35 → 68px | Section titles, featured tile title |
| `--fs-h3` | 21 → 26px | Card and tile titles |
| `--fs-lead` | 18 → 24px | Intro paragraphs |
| `--fs-body` | 17px | Body copy |
| `--fs-micro` | 12px, mono, uppercase, +0.14em | `.label` eyebrows and metadata |

Display sizes use tight negative tracking (−0.045em). Body copy is capped at `--measure` (62ch).

### Space, shape and motion

- **Space:** 8px rhythm (`--space-1` … `--space-9`). Section padding is `--section-py` (96 → 176px), deliberately generous.
- **Radii:** 10 / 18 / 28px plus pill.
- **Easing:** `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` in CSS and `EASE_OUT` in JS.
- **Durations:** `--dur-fast` 160ms, `--dur` 280ms, `--dur-slow` 600ms.

---

## 3. Layout rules

### Grid

- `.container`: max 1240px of content plus a fluid gutter (`--gutter`, 20 → 48px).
- `.grid-12`: 12 columns with `--grid-gap`. Children place themselves with `.span-*` and collapse to full width at ≤ 900px.
- Column usage is deliberate and asymmetric, never a centred stack of equal boxes:
  - Section heads put the title in 7 columns and the lead in columns 9–12, bottom-aligned.
  - Contact puts the endpoints in columns 1–6 and the form in 8–12, leaving column 7 empty.
  - The work bento is 7 + 5 over two rows, then 4 + 4 + 4.

### Breakpoints

| Width | Change |
|---|---|
| ≤ 1100px | Bento: the featured tile spans full width, the others go to 6 + 6. Expertise: cards go 6 + 6, then 12. |
| ≤ 900px | `.grid-12` collapses. The scene switches to its mobile framing (`STATES.mobile`). The hero puts the 3D in the top third and the text below. |
| ≤ 820px | The nav links become a full-screen sheet. |
| ≤ 700px | Bento and the archive grid go to a single column. The filter bar scrolls horizontally. |
| ≤ 600px | Endpoint rows and form fields stack. Case-study stats go to a single column. |

The pages were tested at 390, 768, 1024 and 1440px wide, with no horizontal scroll at any of them.

### Layers

| z | Layer |
|---|---|
| 0 | `.scene-canvas`: the fixed WebGL canvas (`pointer-events: none`) |
| 1 | `.spotlight`: radial light plus edge vignette that shades the canvas |
| 2 | `main`: all content |
| 100 | Nav |
| 200 | Overlays (lightbox) |
| 210 | Greeting screen (`.intro`, home only) |

### How each section keeps the 3D layer off text

| Section | How |
|---|---|
| Hero | The sphere is framed into the right-hand columns on desktop and the top third on mobile (`offset` in `STATES`). Text sits in columns 1–7, or at the bottom on mobile. |
| Expertise | The clusters sit behind the cards' clear top strip (icon row). The rest of each card is frosted glass. |
| Work | Project tiles are opaque (`--bg-raised`), so the landscape only shows in the gutters. The scroll entrance never fades opacity. |
| Contact | The ring is an ellipse fitted to the header box with a √2 margin, so it encloses the headline rather than crossing it. Links and form sit on a frosted panel. |
| Projects page | The landscape is framed low, below the filter bar. |
| Case studies | No canvas. The cover image sits under a dark ramp with white text. |

**Images and text are never layered.** Every project picture sits in its own media box with the text below it (`.frame-media` above `.frame-body`). Tiles carry no index numbers.

---

## 4. 3D scene (`assets/js/scene/`)

One fixed WebGL canvas (three.js) holds the **"Data & Connected Intelligence" network**. It has four parts:

- nodes on a Fibonacci sphere
- links to each node's 3 nearest neighbours
- light pulses that travel along the links
- a fresnel-lit core with a faceted wire shell

Every node keeps its identity in all four shapes, so the network morphs between them without links tangling.

| State | Section (`data-scene-state`) | Shape | What it shows |
|---|---|---|---|
| 0 | Hero | Sphere plus glowing core | The whole system. The camera dollies in while the hero is pinned. |
| 1 | Expertise | Three clusters | One per discipline. Each cluster tracks its card on screen (`data-scene-cluster`) and lights up when the card is hovered or centred. |
| 2 | Work | Flowing landscape | Data in motion under the projects |
| 3 | Contact | Elliptical ring | A halo around the closing statement (`data-scene-ring`) |

**Scroll mapping** (`scroll-map.js`):

- A state is fully formed when its section's top reaches 30% of the viewport. The hero holds state 0 until its pinned stage ends.
- Between anchors the network blends with a smootherstep curve.
- The blend follows scroll with frame-rate-independent easing (`morphEase`), which gives the transitions inertia.

**Inputs:**

- **Scroll velocity** flicks the sphere's spin, then it decays back to the idle spin (`SCENE.spin`).
- **Pointer position** tilts the rig (fine pointers only, weighted per state).
- `document` events: `scene:highlight` `{ index }` and `themechange`.

**Customising materials:** edit `MATERIALS` in `config.js`. Each theme has its own colours, opacities and blending (`additive` for black, `normal` for white). The theme switch re-applies them live. Density, inertia, radii and per-state camera framing are also in `config.js`.

**Performance budget:**

- **Desktop:** 560 nodes and about 1,100 links, pixel ratio ≤ 2.
- **Mobile:** 260 nodes, pixel ratio ≤ 1.5, no antialias.
- three.js (135 KB gzipped) is loaded with a dynamic `import()` after the page is interactive.
- The render loop pauses when the tab is hidden.

**Fallbacks:**

- **Reduced motion:** no render loop, no idle spin or pulses. The scene snaps to the section in view and redraws only on scroll.
- **No WebGL or a lost context:** `html.no-webgl` swaps in a static CSS glow.

---

## 5. Animation behaviour

All JavaScript motion uses **Motion** (the vanilla build of the library formerly called Framer Motion), imported through `assets/js/lib/motion.js`. Pointer springs are `{ stiffness: 240, damping: 28, mass: 0.7 }`, with no overshoot.

| Element | Trigger | Animation | Timing | Reduced motion |
|---|---|---|---|---|
| Greeting screen (home) | First home visit per tab session; skipped for `#section` links | "Hello!" letters rise from a mask (0.07s stagger), then "and welcome to my portfolio." unblurs and rises; a faint hint breathes. Any tap/click/Enter/Space/Esc lifts the screen away like a curtain | 1s letters, sub at 0.85s, hint at 1.9s; exit 1s `[0.76, 0, 0.24, 1]` | Shown without animation; exits instantly |
| Hero chapters | Scroll through the pinned hero | Intro lifts 70px and fades out (progress 0.20–0.40); statement rises in (0.42–0.62) | Scrubbed | Not pinned; chapters stack |
| Hero stats | Statement chapter > 60% in | Count up | 1.5s, `EASE_OUT`, 0.12s stagger | Final values shown |
| 3D network | Scroll / pointer / card hover | Morph, dolly, spin inertia, tilt, cluster glow | Per-frame easing (section 4) | Static per section |
| `[data-reveal]` | Enters viewport (−8% bottom margin) | Opacity 0→1, y 28→0 | 0.9s, `EASE_OUT` | Visible immediately |
| `[data-stagger]` children | Container enters viewport | Opacity 0→1, y 32→0 | 0.8s, 0.09s stagger | Visible immediately |
| Project tiles | Scroll into view | rotateX 16°→0, y 90→0 (no opacity) | Scrubbed from `start end` to `start 0.62` | None |
| Project tile | Pointer over tile | Whole tile tilts ≤ 9° toward the pointer (perspective 1000px), rises 8px and scales to 1.015. It stays one flat piece, so the picture never clips. Depth cues: shadow slides away from the pointer, picture drifts ≤ 9px the other way and zooms to 1.06, glare follows the pointer | Spring (`SPRING`); image 700ms / 220ms CSS | None |
| Expertise card | Pointer over card | Spring tilt ≤ 5°, spotlight, gradient border | Spring / 600ms | Border and spotlight only |
| Contact endpoint | Pointer over row | Arrow pulled ≤ 14px, underline sweeps in, arrow fills blue | Spring / 600ms | Colour change only |
| Nav | Page scroll | Frosted after 16px; gradient progress line scaled to page progress | Scrubbed | Progress line hidden |
| Project filter | Filter button | Leavers fade/scale to 0.96, then entrants rise in | 0.16s out; 0.55s in, 0.07s stagger | Instant swap |
| Case-study banner | Load / scroll | Title block rises in; cover scales 1.06→1.16 and drifts 10%; title fades as you leave | 0.9s / scrubbed | Static |
| Page change | Navigation | Cross-fade (`@view-transition`) | Browser default | Off |

**Rule:** never put `[data-reveal]` on an element that also has a CSS `:hover` transform. Motion leaves an inline `transform` behind that would override the CSS. Reveal the wrapper instead, or drive the hover through Motion as the tilt helper does.

---

## 6. Accessibility checklist

This follows the UI UX Pro Max pre-delivery list.

- [x] **Icons:** SVG only, no emoji (Lucide-style inline SVG, `aria-hidden`).
- [x] **Contrast:** text meets 4.5:1 in both themes. Gradient text appears only at display sizes.
- [x] **Focus:** visible focus on every control. There's a skip link, and the mobile menu traps focus and closes with Escape.
- [x] **Hidden chapters:** a hero chapter that has faded out is set to `visibility: hidden`, so its links can't receive focus.
- [x] **Touch targets:** ≥ 44px (buttons, nav, endpoints, links).
- [x] **Reduced motion:** honoured everywhere (CSS, Motion and the WebGL loop).
- [x] **Without JavaScript:** content is visible. A `<head>` failsafe removes the hidden state if the scripts haven't started within 4s.
- [x] **Lightbox:** a native `<dialog>` (focus trap, Escape). Figures open with Enter or Space.
- [x] **Canvas:** `aria-hidden`. The 3D carries no information that isn't also in the text.

---

## 7. File map

```
assets/css/tokens.css              all design tokens (dark + light)
assets/css/base.css                reset, grid, type utilities, reveal + reduced-motion rules
assets/css/components/*.css        one file per component (nav, hero, expertise, frame, contact, ...)
assets/css/pages/*.css             projects archive, case-study pages
assets/js/main.js                  entry: mounts components, lazy-loads the scene
assets/js/lib/motion.js            Motion import point + reveal helper, easing, spring
assets/js/lib/tilt.js              spring tilt + pointer CSS variables
assets/js/components/*.js          one module per component
assets/js/scene/config.js          ← tune the 3D here (density, inertia, materials, framing)
assets/js/scene/network.js         geometry, shaders, the four layouts
assets/js/scene/stage.js           renderer, camera, loop, inputs, fallbacks
assets/js/scene/scroll-map.js      scroll position → scene state
assets/js/data/projects.js         filter categories + project order (prev/next links)
assets/vendor/{three,motion}.js    tree-shaken bundles built by `npm run vendor`
```
