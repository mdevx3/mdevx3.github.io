/* =============================================
   SCENE STAGE
   Owns the single fixed WebGL canvas: renderer, camera rig, render loop,
   resize, theme and accessibility handling. Everything visual about the
   network is in network.js; everything tunable is in config.js.

   Inputs (all decoupled from other components):
     - scroll position            -> state morph, hero dolly, spin inertia
     - pointer position           -> rig tilt (fine pointers only)
     - document 'scene:highlight' -> { detail: { index } } lights a cluster
     - document 'themechange'     -> swaps material presets
     - [data-scene-cluster="0..2"] elements: clusters track these on screen
     - [data-scene-ring] element: the contact ring frames this element

   Reduced motion: no render loop, no idle spin or pulses; the scene snaps
   to the state of the section in view and is redrawn only on scroll.
   No WebGL: <html class="no-webgl">, CSS shows a static glow instead.
   ============================================= */
import { WebGLRenderer, Scene, PerspectiveCamera, Group, Vector3 } from '../../vendor/three.js';
import { SCENE, MATERIALS, STATES } from './config.js';
import { createNetwork } from './network.js';
import { createScrollMap } from './scroll-map.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = window.matchMedia('(max-width: 900px)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

const lerp = (a, b, t) => a + (b - a) * t;
const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10);
/** Frame-rate independent easing factor for a per-60fps-frame rate. */
const ease = (rate, k60) => 1 - Math.pow(1 - rate, k60);

/** @param {HTMLCanvasElement} canvas */
export function initScene(canvas) {
  const root = document.documentElement;
  const isMobile = mobileQuery.matches;

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: !isMobile, powerPreference: 'high-performance' });
  } catch (err) {
    root.classList.add('no-webgl');
    console.warn('[scene] WebGL unavailable, using static fallback', err);
    return;
  }
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(SCENE.fov, 1, 0.1, 100);
  const rig = new Group(); // per-state offset + pointer tilt
  scene.add(rig);

  const network = createNetwork({
    count: isMobile ? SCENE.nodes.mobile : SCENE.nodes.desktop,
    pulseCount: isMobile ? SCENE.pulses.mobile : SCENE.pulses.desktop,
  });
  rig.add(network.group);

  const map = createScrollMap();
  const clusterEls = [...document.querySelectorAll('[data-scene-cluster]')]
    .sort((a, b) => a.dataset.sceneCluster - b.dataset.sceneCluster);
  const ringEl = document.querySelector('[data-scene-ring]');

  /* ----- Mutable state ----- */
  let layout = isMobile ? 'mobile' : 'desktop';
  let width = 1, height = 1;
  let clusterDoc = [];
  let ringDoc = null;
  let pCurrent = 0;
  let spin = 0, spinVelocity = 0, lastScrollY = window.scrollY;
  let time = 0, lastNow = 0, rafId = 0, running = false;
  let highlightIndex = -1, highlightShown = -1, highlightAmt = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const lookTarget = new Vector3();

  const ctx = {
    time: 0, spin: 0, phase: 0, glow: 0, coreScale: 1,
    sphereRadius: SCENE.sphereRadius,
    clusterRadius: SCENE.clusterRadius,
    clusters: [[-2, 0], [0, 0], [2, 0]],
    ring: { x: 0, y: 0, rx: 2, ry: 1 },
    landscape: { width: 8, depth: 4.5 },
    highlight: -1, highlightAmt: 0,
  };

  /* ----- Theme ----- */
  const applyTheme = () => network.applyMaterials(MATERIALS[root.dataset.theme === 'light' ? 'light' : 'dark']);
  applyTheme();
  document.addEventListener('themechange', () => { applyTheme(); if (!running) draw(0); });

  /* ----- Layout ----- */
  function measure() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    layout = mobileQuery.matches ? 'mobile' : 'desktop';
    const maxRatio = layout === 'mobile' ? SCENE.maxPixelRatio.mobile : SCENE.maxPixelRatio.desktop;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxRatio));
    renderer.setSize(width, height, false);
    network.setPixelRatio(renderer.getPixelRatio());
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    map.measure();

    const y = window.scrollY;
    clusterDoc = clusterEls.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + y + 80 }; // behind the card's clear top
    });
    if (ringEl) {
      const r = ringEl.getBoundingClientRect();
      ringDoc = { x: r.left + r.width / 2, y: r.top + y + r.height / 2, w: r.width, h: r.height };
    }
    ctx.landscape.width = layout === 'mobile' ? 5.2 : 8.4;
    ctx.landscape.depth = layout === 'mobile' ? 4 : 4.6;
  }

  /** World-space size of the view plane at z = 0 for a camera at distance d. */
  const viewSize = (d) => {
    const h = 2 * Math.tan((SCENE.fov * Math.PI) / 360) * d;
    return [h * camera.aspect, h];
  };

  /** Screen point -> world point on z = 0 for an on-axis state camera. */
  function screenToWorld(sx, sy, state) {
    const [vw, vh] = viewSize(state.cam[2]);
    return [
      (sx / width * 2 - 1) * (vw / 2) - state.offset[0],
      (1 - sy / height * 2) * (vh / 2) - state.offset[1],
    ];
  }

  function trackElements(scrollY) {
    const S = STATES[layout];
    const [, vh1] = viewSize(S[1].cam[2]);
    if (clusterDoc.length === 3) {
      for (let c = 0; c < 3; c++) {
        const [x, y] = screenToWorld(clusterDoc[c].x, clusterDoc[c].y - scrollY, S[1]);
        ctx.clusters[c][0] = x;
        ctx.clusters[c][1] = Math.max(-vh1, Math.min(vh1, y));
      }
    }
    if (ringDoc) {
      const [vw3, vh3] = viewSize(S[3].cam[2]);
      const [x, y] = screenToWorld(ringDoc.x, ringDoc.y - scrollY, S[3]);
      ctx.ring.x = x;
      ctx.ring.y = Math.max(-vh3, Math.min(vh3, y));
      // Ellipse that fully encloses the header box (sqrt2 margin + 28px), so no link crosses text
      ctx.ring.rx = Math.min(vw3 * 0.62, ((ringDoc.w / 2) * 1.45 + 28) / width * vw3);
      ctx.ring.ry = ((ringDoc.h / 2) * 1.45 + 28) / height * vh3;
    }
  }

  /** Camera framing for a state, including the hero dolly. */
  const frameA = { cam: [0, 0, 0], look: [0, 0, 0], offset: [0, 0, 0], core: 0, tilt: 0 };
  const frameB = { cam: [0, 0, 0], look: [0, 0, 0], offset: [0, 0, 0], core: 0, tilt: 0 };
  function framing(state, heroP, out) {
    const s = STATES[layout][state];
    for (let i = 0; i < 3; i++) { out.cam[i] = s.cam[i]; out.look[i] = s.look[i]; out.offset[i] = s.offset[i]; }
    out.core = s.core; out.tilt = s.tilt;
    if (state === 0) {
      const dolly = STATES.heroDolly[layout];
      out.cam[2] += dolly.z * heroP;
      out.offset[0] += dolly.x * heroP;
    }
    return out;
  }

  /* ----- Draw one frame ----- */
  function draw(dt) {
    const y = window.scrollY;
    const { a, b, f } = map.statesAt(pCurrent);
    const t = smootherstep(Math.min(1, Math.max(0, f)));
    const heroP = map.heroProgress(y);
    const A = framing(a, heroP, frameA);
    const B = framing(b, heroP, frameB);

    camera.position.set(lerp(A.cam[0], B.cam[0], t), lerp(A.cam[1], B.cam[1], t), lerp(A.cam[2], B.cam[2], t));
    lookTarget.set(lerp(A.look[0], B.look[0], t), lerp(A.look[1], B.look[1], t), lerp(A.look[2], B.look[2], t));
    camera.lookAt(lookTarget);
    rig.position.set(lerp(A.offset[0], B.offset[0], t), lerp(A.offset[1], B.offset[1], t), lerp(A.offset[2], B.offset[2], t));
    const tilt = lerp(A.tilt, B.tilt, t) * SCENE.pointer.tilt;
    rig.rotation.set(-pointer.y * tilt * 0.6, pointer.x * tilt, 0);

    trackElements(y);
    ctx.time = time;
    ctx.spin = spin;
    ctx.phase = time * 0.55 + spin * 3;
    ctx.coreScale = lerp(A.core, B.core, t);
    ctx.glow = heroP;
    ctx.highlight = highlightShown;
    ctx.highlightAmt = highlightAmt;

    network.update(a, b, t, ctx, dt);
    renderer.render(scene, camera);
  }

  /* ----- Animated loop ----- */
  function tick(now) {
    rafId = requestAnimationFrame(tick);
    const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 1 / 60;
    lastNow = now;
    const k60 = dt * 60;
    time += dt;

    const y = window.scrollY;
    pCurrent += (map.progress(y) - pCurrent) * ease(SCENE.morphEase, k60);

    const { idle, scrollImpulse, damping, maxVelocity } = SCENE.spin;
    spinVelocity = Math.max(-maxVelocity, Math.min(maxVelocity, spinVelocity + (y - lastScrollY) * scrollImpulse));
    spinVelocity *= Math.pow(damping, k60);
    lastScrollY = y;
    spin += (idle + spinVelocity) * k60;

    const pe = ease(SCENE.pointer.ease, k60);
    pointer.x += (pointer.tx - pointer.x) * pe;
    pointer.y += (pointer.ty - pointer.y) * pe;
    highlightAmt += ((highlightIndex >= 0 ? 1 : 0) - highlightAmt) * ease(0.12, k60);

    draw(dt);
  }

  function start() {
    if (running || reducedMotion.matches || document.hidden) return;
    running = true;
    lastNow = 0;
    rafId = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  /* ----- Reduced motion: static, state snaps to the section in view ----- */
  let staticQueued = false;
  function drawStatic() {
    if (staticQueued) return;
    staticQueued = true;
    requestAnimationFrame(() => {
      staticQueued = false;
      pCurrent = Math.round(map.progress(window.scrollY));
      highlightAmt = highlightIndex >= 0 ? 1 : 0;
      draw(0);
    });
  }
  window.addEventListener('scroll', () => { if (!running) drawStatic(); }, { passive: true });

  /* ----- Inputs ----- */
  window.addEventListener('pointermove', (e) => {
    if (!finePointer.matches) return;
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { pointer.tx = 0; pointer.ty = 0; });

  document.addEventListener('scene:highlight', (e) => {
    const index = e.detail && Number.isInteger(e.detail.index) ? e.detail.index : -1;
    highlightIndex = index;
    if (index >= 0) highlightShown = index;
    if (!running) drawStatic();
  });

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { stop(); drawStatic(); } else start(); });

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    root.classList.add('no-webgl');
  });

  let resizeQueued = false;
  const onResize = () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      measure();
      if (!running) drawStatic();
    });
  };
  window.addEventListener('resize', onResize);
  new ResizeObserver(onResize).observe(document.body); // content height changes move the anchors

  /* ----- Go ----- */
  measure();
  pCurrent = map.progress(window.scrollY); // no swoop when loading mid-page
  if (reducedMotion.matches) drawStatic();
  else start();
  requestAnimationFrame(() => canvas.classList.add('is-ready'));
}
