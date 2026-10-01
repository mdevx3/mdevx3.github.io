/* =============================================
   SCROLL REVEAL
   Works on plain attributes, so any element can opt in:
     data-reveal                 fade/slide in when scrolled into view
     data-reveal-delay="2"       extra delay in 100ms steps
     data-stagger-container      its [data-stagger] children animate one after another
   The hidden starting state is CSS (see base.css), gated on the `js` class.
   ============================================= */
import { enter } from '../lib/motion.js';

const STAGGER_STEP = 65; // ms between staggered children

export function initReveal() {
  const targets = [...document.querySelectorAll('[data-reveal], [data-stagger-container]')];

  // Very old browsers: just show everything.
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      observer.unobserve(el);
      if (el.classList.contains('is-visible')) return; // already revealed elsewhere

      if (el.hasAttribute('data-stagger-container')) {
        el.classList.add('is-visible');
        el.querySelectorAll('[data-stagger]').forEach((child, i) =>
          enter(child, { delay: i * STAGGER_STEP, y: 16, duration: 550 }));
      } else {
        enter(el, { delay: Number(el.dataset.revealDelay || 0) * 100 });
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el) => observer.observe(el));
}
