/* =============================================
   SCROLL MAP
   Turns the page scroll position into "which scene state, and how far
   into the next one". Sections opt in with data-scene-state="0..3":
     <section data-scene-state="1">...</section>
   A state is fully formed when its section's top reaches 30% of the
   viewport. The hero (state 0) holds until its pinned stage ends.
   ============================================= */

const clamp01 = (x) => Math.min(1, Math.max(0, x));

export function createScrollMap() {
  const sections = [...document.querySelectorAll('[data-scene-state]')];
  const states = sections.map((el) => Number(el.dataset.sceneState));
  let anchors = [];
  let hero = null;

  function measure() {
    const vh = window.innerHeight;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
    hero = null;
    anchors = sections.map((el, i) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      if (states[i] === 0) {
        hero = { top, height: el.offsetHeight };
        return Math.max(0, top + el.offsetHeight - vh);
      }
      return Math.min(maxScroll, Math.max(0, top - vh * 0.3));
    });
    for (let i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
  }

  /** Float index into `states` for a scroll position (e.g. 1.4 = 40% from state[1] to state[2]). */
  function progress(y) {
    if (anchors.length < 2 || y <= anchors[0]) return 0;
    for (let i = 0; i < anchors.length - 1; i++) {
      if (y < anchors[i + 1]) return i + (y - anchors[i]) / (anchors[i + 1] - anchors[i]);
    }
    return anchors.length - 1;
  }

  /** Resolve a float index to the two states being blended. */
  function statesAt(p) {
    if (!states.length) return { a: 0, b: 0, f: 0 };
    const i = Math.min(Math.floor(p), states.length - 1);
    const j = Math.min(i + 1, states.length - 1);
    return { a: states[i], b: states[j], f: j === i ? 0 : p - i };
  }

  /** 0 -> 1 progress through the pinned hero (0 when the page has no hero). */
  function heroProgress(y) {
    if (!hero) return 0;
    const span = hero.height - window.innerHeight;
    return span > 0 ? clamp01((y - hero.top) / span) : 0;
  }

  return { measure, progress, statesAt, heroProgress };
}
