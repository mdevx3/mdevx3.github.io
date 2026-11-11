/* =============================================
   CASE-STUDY BANNER  (project-*.html)
   The cover image drifts and scales as you scroll past the banner while the
   title block lifts away, all scrubbed to scroll position. The title block
   also rises in once on load.
   ============================================= */
import { animate, scroll, stagger, prefersReducedMotion, EASE_OUT } from '../lib/motion.js';

/** @param {HTMLElement} hero the .detail-hero element */
export function initBanner(hero) {
  if (prefersReducedMotion()) return;
  const img = hero.querySelector('.detail-hero-media img');
  const content = hero.querySelector('.detail-hero-content');
  const range = { target: hero, offset: ['start start', 'end start'] };

  if (img) scroll(animate(img, { scale: [1.06, 1.16], y: ['0%', '10%'] }, { ease: 'linear' }), range);
  if (content) {
    scroll(animate(content, { opacity: [1, 0.15], y: [0, -80] }, { ease: 'linear' }), range);
    animate(content.querySelectorAll(':scope > .container > *'), { opacity: [0, 1], y: [28, 0] },
      { duration: 0.9, delay: stagger(0.08, { startDelay: 0.1 }), ease: EASE_OUT });
  }
}
