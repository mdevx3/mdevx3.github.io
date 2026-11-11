/* =============================================
   MAIN ENTRY POINT
   Loaded on every page as <script type="module" src="assets/js/main.js">.
   Each component is self-contained: it receives its own root element and
   does nothing if that element isn't on the page. One failing component
   can never stop the others from starting.
   The WebGL scene is imported lazily so text and interactions never wait
   for three.js to download.
   ============================================= */
import { initNav, initFooter } from './components/site-chrome.js';
import { initThemeToggle } from './components/theme.js';
import { initReveal } from './components/reveal.js';
import { initCounters } from './components/counters.js';
import { initHero } from './components/hero.js';
import { initExpertise } from './components/expertise.js';
import { initFrames } from './components/frames.js';
import { initProjectFilter } from './components/project-filter.js';
import { initProjectNav } from './components/project-nav.js';
import { initContactForm } from './components/contact-form.js';
import { initEndpoints } from './components/endpoints.js';
import { initLightbox } from './components/lightbox.js';
import { initBanner } from './components/banner.js';

// Tell the <head> failsafe that scripts are running (see the inline script in each page)
document.documentElement.classList.add('js-ready');

/** Run `init(el)` for every element matching `selector`, isolating errors. */
function mount(selector, init) {
  document.querySelectorAll(selector).forEach((el) => {
    try {
      init(el);
    } catch (err) {
      console.error(`[${selector}] failed to initialise`, err);
    }
  });
}

// Shared chrome first: the theme toggle lives inside the rendered nav.
mount('#site-nav', initNav);
mount('#site-footer', initFooter);
mount('.theme-toggle', initThemeToggle);

// Page sections
mount('.hero', initHero);
mount('[data-expertise]', initExpertise);
mount('[data-frames]', initFrames);
mount('[data-project-grid]', initProjectFilter);
mount('[data-project-nav]', initProjectNav);
mount('form.contact-form', initContactForm);
mount('.endpoints', initEndpoints);
mount('.figure-gallery', initLightbox);
mount('.detail-hero', initBanner);

// Document-wide behaviours driven by data attributes
try {
  initReveal();
} catch (err) {
  console.error('[reveal] failed', err);
  document.querySelectorAll('[data-reveal], [data-stagger-container]').forEach((el) => el.classList.add('is-visible'));
}
try { initCounters(); } catch (err) { console.error('[counters] failed', err); }

// 3D scene (lazy)
const canvas = document.querySelector('[data-scene]');
if (canvas) {
  import('./scene/stage.js')
    .then(({ initScene }) => initScene(canvas))
    .catch((err) => {
      console.error('[scene] failed to load', err);
      document.documentElement.classList.add('no-webgl');
    });
}
