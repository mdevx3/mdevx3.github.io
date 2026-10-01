/* =============================================
   MAIN ENTRY POINT
   Loaded on every page as <script type="module" src="assets/js/main.js">.
   Each component is self-contained: it receives its own root element and
   does nothing if that element isn't on the page. One failing component
   can never stop the others from starting.
   ============================================= */
import { initNav, initFooter } from './components/site-chrome.js';
import { initThemeToggle } from './components/theme.js';
import { initReveal } from './components/reveal.js';
import { initCounters } from './components/counters.js';
import { initHero } from './components/hero.js';
import { initProjectFilter } from './components/project-filter.js';
import { initProjectNav } from './components/project-nav.js';
import { initContactForm } from './components/contact-form.js';
import { initLightbox } from './components/lightbox.js';

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
mount('[data-project-grid]', initProjectFilter);
mount('[data-project-nav]', initProjectNav);
mount('.contact-form form', initContactForm);
mount('.figure-gallery', initLightbox);

// Document-wide behaviours driven by data attributes
try { initReveal(); } catch (err) { console.error('[reveal] failed', err); document.querySelectorAll('[data-reveal], [data-stagger-container]').forEach((el) => el.classList.add('is-visible')); }
try { initCounters(); } catch (err) { console.error('[counters] failed', err); }
