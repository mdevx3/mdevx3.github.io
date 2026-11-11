/* =============================================
   SHOWCASE FRAMES  (project tiles: home bento + projects page)
   - Scroll entrance: each frame's stage tips up from 16deg as it enters the
     viewport, scrubbed to scroll position (Motion scroll + animate).
   - Pointer: the image tilts toward the cursor and a glare follows it.
   Markup contract: see components/frame.css.
   ============================================= */
import { animate, scroll, prefersReducedMotion } from '../lib/motion.js';
import { attachTilt } from '../lib/tilt.js';

/** @param {HTMLElement} scope any container holding .frame elements */
export function initFrames(scope) {
  scope.querySelectorAll('.frame').forEach((frame) => {
    const stage = frame.querySelector('.frame-stage');
    const media = frame.querySelector('.frame-media');

    if (stage && !prefersReducedMotion()) {
      scroll(
        animate(stage, { rotateX: [16, 0], y: [90, 0] }, { ease: 'linear' }), // no opacity: tiles stay opaque over the 3D layer
        { target: frame, offset: ['start end', 'start 0.62'] }
      );
    }
    if (media) attachTilt(frame, { target: media, max: 7, vars: ['--gx', '--gy'] });
  });
}
