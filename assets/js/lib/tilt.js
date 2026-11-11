/* =============================================
   SPRING TILT
   Rotates an element toward the pointer with Motion springs (interruptible,
   keeps velocity), optionally publishing the pointer position as CSS custom
   properties for spotlight/glare effects. Mouse/trackpad only; skipped
   under reduced motion.
   ============================================= */
import { animate, SPRING, hasFinePointer, prefersReducedMotion } from './motion.js';

/**
 * @param {HTMLElement} surface      element that receives pointer events
 * @param {object}      [opts]
 * @param {HTMLElement} [opts.target=surface]  element that rotates
 * @param {number}      [opts.max=6]           max tilt in degrees
 * @param {number}      [opts.perspective]     px; omit when a parent sets CSS perspective
 * @param {[string, string]} [opts.vars]       custom properties for pointer x/y (in %)
 */
export function attachTilt(surface, { target = surface, max = 6, perspective, vars } = {}) {
  if (!hasFinePointer() || prefersReducedMotion()) return;
  const base = perspective ? { transformPerspective: perspective } : {};

  surface.addEventListener('pointermove', (e) => {
    const r = surface.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    animate(target, { ...base, rotateX: (0.5 - py) * max, rotateY: (px - 0.5) * max }, SPRING);
    if (vars) {
      surface.style.setProperty(vars[0], `${(px * 100).toFixed(1)}%`);
      surface.style.setProperty(vars[1], `${(py * 100).toFixed(1)}%`);
    }
  });
  surface.addEventListener('pointerleave', () => {
    animate(target, { ...base, rotateX: 0, rotateY: 0 }, SPRING);
  });
}
