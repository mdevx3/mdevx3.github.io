/* =============================================
   COUNT-UP NUMBERS (Motion)
     <div data-counter-group>              triggers when scrolled into view
       <dd data-counter>3.87</dd>          keeps prefixes/suffixes: "~96%", "83K+", "2x"
     </div>
   Add data-counter-manual to a group to trigger it yourself with
   runCounters(group) (the hero does this when its stats chapter appears).
   The authored text is always restored exactly at the end.
   ============================================= */
import { animate, inView, prefersReducedMotion, EASE_OUT } from '../lib/motion.js';

function parse(text) {
  const match = text.match(/^([^0-9]*)([0-9][0-9,.]*)([^0-9]*)$/);
  if (!match) return null;
  const raw = match[2].replace(/,/g, '');
  return { prefix: match[1], suffix: match[3], value: parseFloat(raw), comma: match[2].includes(','), decimals: (raw.split('.')[1] || '').length };
}

const format = (n, p) => {
  if (p.decimals) return n.toFixed(p.decimals);
  const r = Math.round(n);
  return p.comma ? r.toLocaleString('en-US') : String(r);
};

/** Animate every [data-counter] inside `group` once. */
export function runCounters(group) {
  if (!group || group.dataset.counted) return;
  group.dataset.counted = 'true';
  if (prefersReducedMotion()) return;
  group.querySelectorAll('[data-counter]').forEach((el, i) => {
    const original = el.textContent.trim();
    const p = parse(original);
    if (!p) return;
    animate(0, p.value, {
      duration: 1.5,
      delay: i * 0.12,
      ease: EASE_OUT,
      onUpdate: (v) => { el.textContent = p.prefix + format(v, p) + p.suffix; },
      onComplete: () => { el.textContent = original; },
    });
  });
}

export function initCounters() {
  document.querySelectorAll('[data-counter-group]:not([data-counter-manual])').forEach((group) => {
    const stop = inView(group, () => { runCounters(group); stop(); }, { amount: 0.4 });
  });
}
