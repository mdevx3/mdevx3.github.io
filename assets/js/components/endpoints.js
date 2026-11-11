/* =============================================
   CONTACT ENDPOINTS: magnetic arrows
   The round arrow of each .endpoint row is pulled toward the pointer with a
   spring and springs back on leave. Mouse/trackpad only.
   ============================================= */
import { animate, SPRING, hasFinePointer, prefersReducedMotion } from '../lib/motion.js';

const PULL = 14; // max px of travel

/** @param {HTMLElement} list the .endpoints container */
export function initEndpoints(list) {
  if (!hasFinePointer() || prefersReducedMotion()) return;
  list.querySelectorAll('.endpoint').forEach((row) => {
    const arrow = row.querySelector('.endpoint-arrow');
    if (!arrow) return;
    row.addEventListener('pointermove', (e) => {
      const r = arrow.getBoundingClientRect();
      const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 160));
      const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 60));
      animate(arrow, { x: dx * PULL, y: dy * PULL * 0.6 }, SPRING);
    });
    row.addEventListener('pointerleave', () => animate(arrow, { x: 0, y: 0 }, SPRING));
  });
}
