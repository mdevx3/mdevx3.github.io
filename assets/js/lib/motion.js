/* =============================================
   MOTION HELPERS
   Shared by every component that animates, so reduced-motion handling
   and the easing curve live in exactly one place.
   Uses the Web Animations API: it leaves no inline styles behind,
   so it never fights CSS :hover transforms.
   ============================================= */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** True when the visitor asked the OS to minimise motion. */
export const prefersReducedMotion = () => reducedMotion.matches;

export const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Reveal an element: marks it `.is-visible` (removing the CSS "hidden" state)
 * and plays a short fade/slide-in unless motion is reduced.
 * @param {HTMLElement} el
 * @param {{delay?: number, y?: number, duration?: number}} [opts] ms / px
 */
export function enter(el, { delay = 0, y = 24, duration = 700 } = {}) {
  el.classList.add('is-visible');
  if (prefersReducedMotion() || !el.animate) return null;
  return el.animate(
    [
      { opacity: 0, transform: `translateY(${y}px)` },
      { opacity: 1, transform: 'none' },
    ],
    { duration, delay, easing: EASE_OUT, fill: 'backwards' }
  );
}
