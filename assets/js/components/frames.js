/* =============================================
   SHOWCASE FRAMES  (project tiles: home bento + projects page)
   - Scroll entrance: each tile tips up from 16deg as it enters the
     viewport, scrubbed to scroll position (Motion scroll + animate).
   - Hover: the whole tile nudges up and tilts gently toward the pointer,
     a soft ripple spreads from where the pointer entered, and a glare
     follows the pointer across the image.
   Markup contract: see components/frame.css.
   ============================================= */
import { animate, scroll, prefersReducedMotion, hasFinePointer, SPRING, EASE_OUT } from '../lib/motion.js';
import { attachTilt } from '../lib/tilt.js';

const RIPPLE_SIZE = 320; // px diameter: a small, local ripple around the pointer

/** Spread a small ring from the point (x, y) inside `stage`. */
function ripple(stage, x, y) {
  const size = RIPPLE_SIZE;
  const ring = document.createElement('span');
  ring.className = 'frame-ripple';
  ring.setAttribute('aria-hidden', 'true');
  Object.assign(ring.style, { width: `${size}px`, height: `${size}px`, left: `${x - size / 2}px`, top: `${y - size / 2}px` });
  stage.prepend(ring);
  // Spread fast then settle (EASE_OUT); fade slowly so the ring is seen while it grows
  animate(ring, { scale: [0.08, 1], opacity: [1, 0] }, { duration: 1.1, ease: EASE_OUT, opacity: { duration: 1.1, ease: 'easeIn' } })
    .then(() => ring.remove());
}

/** @param {HTMLElement} scope any container holding .frame elements */
export function initFrames(scope) {
  const reduced = prefersReducedMotion();

  scope.querySelectorAll('.frame').forEach((frame) => {
    const stage = frame.querySelector('.frame-stage');
    if (!stage) return;

    if (!reduced) {
      scroll(
        animate(stage, { rotateX: [16, 0], y: [90, 0] }, { ease: 'linear' }), // no opacity: tiles stay opaque over the 3D layer
        { target: frame, offset: ['start end', 'start 0.62'] }
      );
    }

    if (reduced || !hasFinePointer()) return;

    // Gentle tilt of the whole tile + glare position (--gx/--gy)
    attachTilt(frame, { max: 4, perspective: 1100, vars: ['--gx', '--gy'] });

    frame.addEventListener('pointerenter', (e) => {
      const r = stage.getBoundingClientRect();
      ripple(stage, e.clientX - r.left, e.clientY - r.top);
      animate(frame, { y: -6 }, SPRING);
    });
    frame.addEventListener('pointerleave', () => animate(frame, { y: 0 }, SPRING));
  });
}
