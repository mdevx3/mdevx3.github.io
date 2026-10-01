# Darrell Lokadeva Lim — Portfolio

Personal portfolio website for Darrell Lokadeva Lim, a Data Science practitioner based in Jakarta, Indonesia.

🌐 **Live site:** [mdevx3.github.io](https://mdevx3.github.io)

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Hero, About, Experience, Skills, Contact |
| `projects.html` | Project grid with category filter |
| `project-*.html` (6) | Case studies: social media clustering, cycle monitoring, hotel booking, Amazon SaaS, sign language, international debt |

## Stack

Plain HTML, CSS and ES-module JavaScript. No framework, no build step; GitHub Pages serves the repo as-is.

- **Font:** Inter (Google Fonts)
- **Animation:** CSS transitions and the Web Animations API for UI motion; [anime.js](https://animejs.com) v4 (vendored in `assets/vendor/`) for the hero dot grid and count-up numbers. All motion respects `prefers-reduced-motion`.
- **Theming:** dark/light via design tokens. Follows the OS setting until the visitor uses the toggle, then remembers the choice.

## Structure

```
assets/
├── css/
│   ├── main.css            only stylesheet pages link to (imports the rest)
│   ├── tokens.css          colours, type scale, spacing, motion; dark + light themes
│   ├── base.css            reset, layout primitives, reveal states, reduced motion
│   ├── components/         one file per module: nav, hero, card, filter-bar, skills,
│   │                       timeline, contact, footer, lightbox, button, section, about
│   └── pages/              page-level layout: projects, project-detail
├── js/
│   ├── main.js             entry point; mounts each component on its own root element
│   ├── components/         site-chrome (nav + footer), theme, hero, reveal, counters,
│   │                       project-filter, project-nav, contact-form, lightbox
│   ├── data/projects.js    filter categories + project order (drives prev/next links)
│   └── lib/                anime.js import point, motion helpers (reduced-motion aware)
├── vendor/                 anime.esm.min.js (copy of the npm package; `npm run vendor` refreshes it)
├── img/  docs/
```

## Common edits

- **Add a project:** copy a card in `projects.html` (set `data-categories`, e.g. `"nlp ml"`), add the page's entry to `PROJECTS` in `assets/js/data/projects.js`, and create `project-<id>.html` from an existing one.
- **Add a filter category:** add it to `CATEGORIES` in `assets/js/data/projects.js`, then use its id in cards' `data-categories`.
- **Change nav/footer links:** edit `assets/js/components/site-chrome.js` (one place for all pages).
- **Change colours or spacing:** edit `assets/css/tokens.css`. Keep the light-theme values in the `[data-theme='light']` block and the `prefers-color-scheme` block in sync.

## Local preview

```
python3 -m http.server 8000
```

(ES modules need to be served over HTTP; opening the files directly won't work.)

## Contact

- Email: darrell.lokadeva.lim007@gmail.com
- LinkedIn: [linkedin.com/in/darrell-lokadeva-lim](https://linkedin.com/in/darrell-lokadeva-lim)
- GitHub: [github.com/mdevx3](https://github.com/mdevx3)
