/* =============================================
   SHOWCASE FRAMES  (project tiles: home bento + projects page)
   - Scroll entrance: each tile tips up from 16deg as it enters the
     viewport, scrubbed to scroll position (Motion scroll + animate).
   - Hover: the whole tile tilts toward the pointer and rises slightly. Depth
     comes from the tile staying one flat piece (so the picture never clips)
     plus three cues driven by the pointer: a shadow that slides away from the
     light, the picture drifting a few px inside its frame, and a glare.
   Markup contract: see components/frame.css.
   ============================================= */
import { animate, scroll, prefersReducedMotion, hasFinePointer, SPRING } from '../lib/motion.js';
import { attachTilt } from '../lib/tilt.js';

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

    // Tilt follows the cursor; publishes glare position (--gx/--gy, %) and signed
    // pointer offsets (--sx/--sy, -1..1) used by the shadow and parallax in frame.css
    attachTilt(frame, { max: 9, perspective: 1000, vars: ['--gx', '--gy'], signed: ['--sx', '--sy'] });

    frame.addEventListener('pointerenter', () => animate(frame, { y: -8, scale: 1.015 }, SPRING));
    frame.addEventListener('pointerleave', () => animate(frame, { y: 0, scale: 1 }, SPRING));
  });
}
