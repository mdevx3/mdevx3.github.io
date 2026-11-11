/* =============================================
   HERO CHAPTERS  (index.html, section 1)
   While the hero stage is pinned, scroll progress cross-fades two chapters:
     0.00-0.40  intro (name, tagline, actions) lifts away
     0.42-0.60  statement + stats rise in (stats count up once)
   The 3D network dollies in over the same progress (scene/stage.js reads
   the hero's scroll position itself, so the two stay in sync).
   Reduced motion / no JS: no pinning; both chapters are simply stacked.
   ============================================= */
import { scroll, prefersReducedMotion } from '../lib/motion.js';
import { runCounters } from './counters.js';

const segment = (p, start, end) => Math.min(1, Math.max(0, (p - start) / (end - start)));

function place(el, opacity, y, scale = 1) {
  el.style.opacity = opacity.toFixed(3);
  el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
  el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible'; // hidden links can't take focus
}

/** @param {HTMLElement} hero */
export function initHero(hero) {
  const intro = hero.querySelector('[data-chapter="intro"]');
  const statement = hero.querySelector('[data-chapter="statement"]');
  const cue = hero.querySelector('.hero-scroll');
  const stats = statement && statement.querySelector('[data-counter-group]');
  if (!intro || !statement) return;

  if (prefersReducedMotion()) {
    if (stats) runCounters(stats); // marks as counted; no animation under reduced motion
    return;
  }

  hero.classList.add('is-scrubbed');
  scroll((p) => {
    const out = segment(p, 0.2, 0.4);
    place(intro, 1 - out, -70 * out, 1 - 0.04 * out);
    const inn = segment(p, 0.42, 0.62);
    place(statement, inn, 70 * (1 - inn));
    if (cue) cue.style.opacity = String(1 - segment(p, 0, 0.08));
    if (inn > 0.6 && stats) runCounters(stats);
  }, { target: hero, offset: ['start start', 'end end'] });
}
