/* =============================================
   HERO ENTRANCE  (index.html)
   - [data-hero] elements slide in one after another (Web Animations API)
   - the dot grid fades in as a ripple from the centre (anime.js stagger grid)
   Everything is skipped under prefers-reduced-motion, and the CSS never hides
   hero content without JavaScript.
   ============================================= */
import { animate, stagger, utils } from '../lib/anime.js';
import { enter, prefersReducedMotion, EASE_OUT } from '../lib/motion.js';

const DOT_COLS = 18;
const DOT_ROWS = 10;

/** Timeline: [selector, start delay (ms), enter options] */
const SEQUENCE = [
  ['.hero-eyebrow', 150, { y: 20, duration: 700 }],
  ['.hero-headline', 650, { y: 18, duration: 700 }],
  ['.hero-intro', 790, { y: 16, duration: 700 }],
  ['.hero-actions', 950, { y: 14, duration: 600 }],
  ['.hero-scroll-hint', 1250, { y: 10, duration: 600 }],
];

function buildDotGrid(container) {
  container.style.gridTemplateColumns = `repeat(${DOT_COLS}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${DOT_ROWS}, 1fr)`;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < DOT_COLS * DOT_ROWS; i++) {
    const dot = document.createElement('div');
    dot.className = 'hero-dot';
    frag.appendChild(dot);
  }
  container.appendChild(frag);
}

/** @param {HTMLElement} hero the .hero section */
export function initHero(hero) {
  const dots = hero.querySelector('.hero-dots');
  if (dots) buildDotGrid(dots);

  // Reduced motion: reveal everything at once, no animation.
  if (prefersReducedMotion()) {
    hero.querySelectorAll('[data-hero]').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  SEQUENCE.forEach(([selector, delay, opts]) => {
    const el = hero.querySelector(selector);
    if (el) enter(el, { delay, ...opts });
  });

  // Name: left-to-right wipe
  const name = hero.querySelector('.hero-name');
  if (name) {
    name.classList.add('is-visible');
    name.animate(
      [
        { opacity: 0, clipPath: 'inset(-10% 100% -10% -2%)', transform: 'scale(1.04)' },
        { opacity: 1, clipPath: 'inset(-10% -4% -10% -2%)', transform: 'none' },
      ],
      { duration: 1100, delay: 350, easing: EASE_OUT, fill: 'backwards' }
    );
  }

  if (dots) {
    utils.set('.hero-dot', { scale: 0, opacity: 0 });
    animate('.hero-dot', {
      scale: [0, 1],
      opacity: [0, 1],
      delay: stagger(35, { grid: [DOT_COLS, DOT_ROWS], from: 'center' }),
      duration: 800,
      ease: 'outQuad',
    });
  }
}
