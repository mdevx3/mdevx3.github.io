/* =============================================
   COUNT-UP NUMBERS
   Markup:
     <div data-counter-group>          container that triggers the animation
       <div data-counter>3.87</div>    value to animate (keeps prefix/suffix:
       <div data-counter>~96%</div>    "~96%", "83K+", "9,994", "2x")
     </div>
   The final text is always restored exactly as authored.
   ============================================= */
import { animate } from '../lib/anime.js';
import { prefersReducedMotion } from '../lib/motion.js';

const DURATION = 1400;
const STEP_DELAY = 150;

/** "~96%" -> { prefix: "~", value: 96, suffix: "%", ... } or null when not numeric */
function parse(text) {
  const match = text.match(/^([^0-9]*)([0-9][0-9,.]*)([^0-9]*)$/);
  if (!match) return null;
  const raw = match[2].replace(/,/g, '');
  return {
    prefix: match[1],
    suffix: match[3],
    value: parseFloat(raw),
    hasComma: match[2].includes(','),
    isFloat: raw.includes('.'),
  };
}

const format = (n, p) => {
  if (p.isFloat) return n.toFixed(2);
  const rounded = Math.round(n);
  return p.hasComma ? rounded.toLocaleString('en-US') : String(rounded);
};

function run(group, extraDelay) {
  group.querySelectorAll('[data-counter]').forEach((el, i) => {
    const original = el.textContent.trim();
    const parsed = parse(original);
    if (!parsed) return;
    const state = { v: 0 };
    animate(state, {
      v: parsed.value,
      duration: DURATION,
      delay: extraDelay + i * STEP_DELAY,
      ease: 'outExpo',
      onUpdate: () => { el.textContent = parsed.prefix + format(state.v, parsed) + parsed.suffix; },
      onComplete: () => { el.textContent = original; },
    });
  });
}

export function initCounters() {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      run(entry.target, 300);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-counter-group]').forEach((g) => observer.observe(g));
}
