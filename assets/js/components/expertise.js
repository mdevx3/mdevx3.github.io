/* =============================================
   EXPERTISE CARDS  (index.html, section 2)
   Each card is linked to a cluster of the 3D network through
   data-scene-cluster="0|1|2": hovering/focusing a card (or, on touch
   screens, scrolling it to the middle of the screen) lights its cluster via
   a 'scene:highlight' event. Cards also tilt and carry a pointer spotlight.
   ============================================= */
import { inView, hasFinePointer } from '../lib/motion.js';
import { attachTilt } from '../lib/tilt.js';

const emit = (index) => document.dispatchEvent(new CustomEvent('scene:highlight', { detail: { index } }));

/** @param {HTMLElement} grid the [data-expertise] container */
export function initExpertise(grid) {
  const cards = [...grid.querySelectorAll('[data-scene-cluster]')];
  let active = -1;
  const activate = (i) => { active = i; emit(i); };
  const release = (i) => { if (active === i) { active = -1; emit(-1); } };

  cards.forEach((card) => {
    const i = Number(card.dataset.sceneCluster);
    attachTilt(card, { max: 5, perspective: 1200, vars: ['--mx', '--my'] });
    card.addEventListener('pointerenter', () => activate(i));
    card.addEventListener('pointerleave', () => release(i));
    card.addEventListener('focusin', () => activate(i));
    card.addEventListener('focusout', () => release(i));

    if (!hasFinePointer()) {
      inView(card, () => {
        card.classList.add('is-active');
        activate(i);
        return () => { card.classList.remove('is-active'); release(i); };
      }, { margin: '-45% 0px -45% 0px' });
    }
  });
}
