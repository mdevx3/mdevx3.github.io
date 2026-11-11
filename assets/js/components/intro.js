/* =============================================
   INTRO / GREETING SCREEN
   1. "Hello!" rises in letter by letter
   2. "and welcome to my portfolio." follows underneath
   3. A faint hint invites a tap/click; any tap, click, Enter, Space or Esc
      fades the screen away to reveal the portfolio.
   Shown once per browser-tab session (sessionStorage 'intro-seen') and never
   for #section links: that decision is made by the inline <head> script,
   which adds html.show-intro before first paint.
   ============================================= */
import { animate, stagger, prefersReducedMotion, hasFinePointer, EASE_OUT } from '../lib/motion.js';

const SEEN_KEY = 'intro-seen';

/** @param {HTMLElement} intro the .intro overlay */
export function initIntro(intro) {
  const root = document.documentElement;
  if (!root.classList.contains('show-intro')) { intro.remove(); return; }

  const reduced = prefersReducedMotion();
  const word = intro.querySelector('.intro-word');
  const sub = intro.querySelector('.intro-sub');
  const hint = intro.querySelector('.intro-hint');
  const content = intro.querySelector('.intro-content');
  const behind = [...document.querySelectorAll('body > :not(.intro):not(script)')];

  // Split "Hello!" into letters so they can rise one after another
  word.innerHTML = [...word.textContent].map((c) => `<span class="intro-char" aria-hidden="true">${c}</span>`).join('');
  hint.textContent = hasFinePointer() ? 'Click anywhere or press Enter to continue' : 'Tap anywhere to continue';

  intro.hidden = false;
  behind.forEach((el) => { el.inert = true; }); // the page behind can't be focused or clicked
  intro.focus({ preventScroll: true });

  /* ----- Entrance ----- */
  if (reduced) {
    hint.classList.add('is-shown');
  } else {
    animate(intro.querySelectorAll('.intro-char'), { y: ['115%', '0%'] }, { duration: 1, delay: stagger(0.07, { startDelay: 0.2 }), ease: EASE_OUT });
    animate(sub, { opacity: [0, 1], y: [24, 0], filter: ['blur(6px)', 'blur(0px)'] }, { duration: 1, delay: 0.85, ease: EASE_OUT });
    animate(hint, { opacity: [0, 0.5] }, { duration: 0.8, delay: 1.9 }).then(() => hint.classList.add('is-shown'));
  }

  /* ----- Exit ----- */
  let leaving = false;
  function proceed() {
    if (leaving) return;
    leaving = true;
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode: shows again next load */ }
    const finish = () => {
      root.classList.remove('show-intro');
      behind.forEach((el) => { el.inert = false; });
      intro.remove();
      document.removeEventListener('keydown', onKey);
      window.dispatchEvent(new Event('resize')); // let the 3D scene and scroll maps re-measure
    };
    if (reduced) { finish(); return; }
    // Curtain: the opaque screen lifts away upward, revealing the portfolio from
    // below (no cross-fade, so "Hello!" never ghosts over the hero text)
    hint.classList.remove('is-shown');
    animate(hint, { opacity: 0 }, { duration: 0.25 });
    animate(content, { y: [0, -60], opacity: [1, 0.4] }, { duration: 0.9, ease: [0.76, 0, 0.24, 1] });
    animate(intro, { y: ['0%', '-100%'] }, { duration: 1, ease: [0.76, 0, 0.24, 1] }).then(finish);
  }

  const onKey = (e) => {
    if (['Enter', ' ', 'Escape'].includes(e.key)) { e.preventDefault(); proceed(); }
  };
  intro.addEventListener('click', proceed);
  document.addEventListener('keydown', onKey);
}
