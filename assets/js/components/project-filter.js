/* =============================================
   PROJECT FILTER  (projects.html)
   Progressive enhancement over a static grid:
     <div data-filter-bar></div>           buttons are generated here
     <p data-filter-status></p>            live "Showing 3 of 6" message
     <div data-project-grid>               contains .project-card[data-categories="nlp ml"]
     <p data-filter-empty hidden>
   Without JavaScript every card simply stays visible.
   The active filter is mirrored in the URL hash (projects.html#nlp) so a
   filtered view can be linked to; no history entries are added.
   ============================================= */
import { CATEGORIES } from '../data/projects.js';
import { enter, prefersReducedMotion } from '../lib/motion.js';

const EXIT_MS = 150;
const STAGGER_MS = 70;

/** @param {HTMLElement} grid the [data-project-grid] container */
export function initProjectFilter(grid) {
  const bar = document.querySelector('[data-filter-bar]');
  const status = document.querySelector('[data-filter-status]');
  const empty = document.querySelector('[data-filter-empty]');
  const cards = [...grid.querySelectorAll('.project-card')];
  if (!bar || !cards.length) return;

  const categoriesOf = (card) => (card.dataset.categories || '').split(/\s+/).filter(Boolean);

  // Count projects per category; only offer categories that have projects
  const counts = { all: cards.length };
  cards.forEach((card) => categoriesOf(card).forEach((c) => { counts[c] = (counts[c] || 0) + 1; }));
  const filters = ['all', ...Object.keys(CATEGORIES).filter((id) => counts[id])];
  const labelOf = (id) => (id === 'all' ? 'All' : CATEGORIES[id]);

  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Filter projects by category');
  bar.innerHTML = filters.map((id) => `
    <button type="button" class="filter-btn" data-filter="${id}" aria-pressed="false">
      ${labelOf(id)} <span class="filter-count">${counts[id]}</span>
    </button>`).join('');

  let current = null;
  let runId = 0; // guards against overlapping transitions from rapid clicks

  function setFilter(id, { animateCards, updateUrl }) {
    if (id === current) return;
    current = id;
    const matches = (card) => id === 'all' || categoriesOf(card).includes(id);

    bar.querySelectorAll('.filter-btn').forEach((btn) =>
      btn.setAttribute('aria-pressed', String(btn.dataset.filter === id)));

    const total = cards.filter(matches).length;
    if (status) {
      status.textContent = id === 'all'
        ? `Showing all ${total} projects`
        : `Showing ${total} of ${cards.length} projects in ${labelOf(id)}`;
    }
    if (empty) empty.hidden = total > 0;

    if (updateUrl) {
      history.replaceState(null, '', id === 'all' ? location.pathname + location.search : `#${id}`);
    }

    // Reset any in-flight transition so DOM state == `hidden` flags
    const myRun = ++runId;
    cards.forEach((card) => card.getAnimations().forEach((a) => a.cancel()));

    if (!animateCards || prefersReducedMotion()) {
      cards.forEach((card) => { card.hidden = !matches(card); });
      return;
    }

    // 1) fade out cards that no longer match, 2) reflow, 3) bring in new ones
    const leaving = cards.filter((c) => !c.hidden && !matches(c));
    const entering = cards.filter((c) => c.hidden && matches(c));
    const exits = leaving.map((c) => c.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.96)' }],
      { duration: EXIT_MS, easing: 'ease-in', fill: 'forwards' }
    ).finished.catch(() => {}));

    Promise.all(exits).then(() => {
      if (myRun !== runId) return; // a newer filter took over
      leaving.forEach((c) => { c.getAnimations().forEach((a) => a.cancel()); c.hidden = true; });
      entering.forEach((c, i) => {
        c.hidden = false;
        enter(c, { delay: i * STAGGER_MS, y: 20, duration: 500 });
      });
    });
  }

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (btn) setFilter(btn.dataset.filter, { animateCards: true, updateUrl: true });
  });

  const fromHash = () => {
    const id = location.hash.slice(1);
    return filters.includes(id) ? id : 'all';
  };
  window.addEventListener('hashchange', () => setFilter(fromHash(), { animateCards: true, updateUrl: false }));

  setFilter(fromHash(), { animateCards: false, updateUrl: false });
}
