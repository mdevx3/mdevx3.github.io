/* =============================================
   MOTION: single import point for the Motion library (vendored ESM build,
   see scripts/vendor.mjs) plus the shared helpers every animating
   component uses, so reduced-motion handling and the house easing live in
   one place. Durations are in seconds (Motion convention).
   ============================================= */
export { animate, scroll, inView, hover, stagger } from '../../vendor/motion.js';
import { animate } from '../../vendor/motion.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

/** True when the visitor asked the OS to minimise motion. */
export const prefersReducedMotion = () => reducedMotion.matches;
/** True for mouse/trackpad users (hover effects are skipped on touch). */
export const hasFinePointer = () => finePointerQuery.matches;

/** House easing: fast start, long soft landing (matches --ease-out). */
export const EASE_OUT = [0.16, 1, 0.3, 1];
/** House spring for pointer-driven motion (no overshoot: this is a professional site). */
export const SPRING = { type: 'spring', stiffness: 240, damping: 28, mass: 0.7 };

/**
 * Reveal an element: drops the CSS hidden state (.is-visible) and plays a
 * short rise-in unless motion is reduced.
 */
export function reveal(el, { delay = 0, y = 28, duration = 0.9 } = {}) {
  el.classList.add('is-visible');
  // Skip the entrance if motion is reduced, or if the <head> failsafe already showed the content
  if (prefersReducedMotion() || !document.documentElement.classList.contains('js')) return null;
  return animate(el, { opacity: [0, 1], y: [y, 0] }, { duration, delay, ease: EASE_OUT });
}
