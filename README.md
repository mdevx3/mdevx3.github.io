# Darrell Lokadeva Lim — Portfolio

Personal portfolio website for Darrell Lokadeva Lim, a Data Science practitioner based in Jakarta, Indonesia.

🌐 **Live site:** [mdevx3.github.io](https://mdevx3.github.io)

## Pages

| Page | Description |
|------|-------------|
| `index.html` | 3D hero, Expertise (+ experience), Selected work, Contact |
| `projects.html` | Archive of all projects with category filter |
| `project-*.html` (6) | Case studies: social media clustering, cycle monitoring, hotel booking, Amazon SaaS, sign language, international debt |

## Stack

Plain HTML, CSS and ES modules, with no framework and no runtime build. GitHub Pages serves the repo as-is.

- **3D:** [three.js](https://threejs.org): one fixed WebGL canvas with a "connected intelligence" network that morphs as you scroll (`assets/js/scene/`)
- **Motion:** [Motion](https://motion.dev) (formerly Framer Motion, vanilla API) for scroll-linked, in-view and spring interactions
- **Type:** Geist and Geist Mono (Google Fonts)
- **Themes:** deep-black default and a light theme, switchable from the nav

Layout rules, tokens, scene states and animation timings are documented in **[design.md](design.md)**.

## Structure

```
assets/
├── css/        tokens.css, base.css, components/*.css, pages/*.css (main.css imports them all)
├── js/
│   ├── main.js          entry point: mounts each component on its own root element
│   ├── components/      site chrome, theme, hero, expertise, frames, filter, contact form, lightbox, ...
│   ├── scene/           WebGL network: config (tune here), network, stage, scroll map
│   ├── data/projects.js filter categories + project order
│   └── lib/             Motion import point + helpers, spring tilt
├── vendor/     three.js and motion.js bundles (generated, see below)
├── img/  docs/
```

## Common edits

- **Add a project:** add a `.frame` tile to `projects.html` (copy one and set `data-categories`, e.g. `"nlp ml"`). Optionally add it to the home bento in `index.html`. Add an entry to `PROJECTS` in `assets/js/data/projects.js`, and create `project-<id>.html` from an existing case study.
- **Change colours, type or spacing:** `assets/css/tokens.css`.
- **Change the 3D look:** `assets/js/scene/config.js` (materials per theme, density, inertia, camera framing).
- **Change nav/footer links:** `assets/js/components/site-chrome.js`.

## Updating the libraries

`assets/vendor/three.js` and `assets/vendor/motion.js` are small tree-shaken builds of the npm packages. After updating `three` or `motion`:

```
npm install
npm run vendor
```

If you import a new name from either library, add it to the export list in `scripts/vendor.mjs` first.

## Local preview

```
python3 -m http.server 8000
```

ES modules must be served over HTTP; opening the files directly won't work.

## Contact

- Email: darrell.lokadeva.lim007@gmail.com
- LinkedIn: [linkedin.com/in/darrell-lokadeva-lim](https://linkedin.com/in/darrell-lokadeva-lim)
- GitHub: [github.com/mdevx3](https://github.com/mdevx3)
