/* =============================================
   SCROLL REVEAL (Motion inView)
     data-reveal               rise in once when scrolled into view
     data-reveal-delay="2"     extra delay in 100ms steps
     data-stagger-container    its [data-stagger] children rise in one by one
   The hidden starting state is CSS (base.css), gated on the `js` class.
   ============================================= */
import { inView, animate, stagger, reveal, prefersReducedMotion, EASE_OUT } from '../lib/motion.js';

export function initReveal() {
  // Reduced motion: no pop-in at all, everything is simply visible
  if (prefersReducedMotion()) {
    document.querySelectorAll('[data-reveal], [data-stagger-container]').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const stop = inView(el, () => {
      reveal(el, { delay: Number(el.dataset.revealDelay || 0) * 0.1 });
      stop();
    }, { margin: '0px 0px -8% 0px' });
  });

  document.querySelectorAll('[data-stagger-container]').forEach((container) => {
    const stop = inView(container, () => {
      container.classList.add('is-visible');
      if (!prefersReducedMotion()) {
        animate(container.querySelectorAll('[data-stagger]'), { opacity: [0, 1], y: [32, 0] },
          { duration: 0.8, delay: stagger(0.09), ease: EASE_OUT });
      }
      stop();
    }, { margin: '0px 0px -8% 0px' });
  });
}
