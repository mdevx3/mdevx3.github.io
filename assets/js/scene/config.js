/* =============================================
   SCENE CONFIGURATION
   The one place to tune the 3D "Data & Connected Intelligence" network:
   density, inertia, colours/materials per theme, and the camera framing of
   each scroll state. See design.md, "3D scene", for what each state means.
   ============================================= */

export const SCENE = {
  /** Number of nodes. Mobile gets fewer for battery and frame rate. */
  nodes: { desktop: 560, mobile: 260 },
  /** Each node links to its k nearest neighbours (measured on the sphere). */
  neighbours: 3,
  /** Light pulses travelling along the links ("data in flight"). */
  pulses: { desktop: 46, mobile: 22 },
  maxPixelRatio: { desktop: 2, mobile: 1.5 },
  fov: 35,

  /** How quickly the network follows scroll between states (per 60fps frame). */
  morphEase: 0.06,
  /** Rotational inertia: scroll flicks the sphere, then it coasts back to idle. */
  spin: { idle: 0.0016, scrollImpulse: 0.00018, damping: 0.94, maxVelocity: 0.045 },
  /** Pointer hover tilts the whole network toward the cursor. */
  pointer: { tilt: 0.28, ease: 0.045 },
  /** Links longer than [start, end] world units fade out (keeps clusters clean). */
  edgeFade: [0.45, 1.0],
  /** Rest radius of the hero sphere and the expertise clusters. */
  sphereRadius: 1.5,
  clusterRadius: 0.6,
};

/**
 * Materials per theme. Swap colours here to re-skin the scene; the stage
 * re-applies them live when the theme switch is used.
 * blending: 'additive' glows on black, 'normal' reads on white.
 */
export const MATERIALS = {
  dark: {
    blending: 'additive',
    node: '#2b7fff', nodeHot: '#cfe8ff', nodeOpacity: 0.95,
    edge: '#1a66ff', edgeHot: '#64d2ff', edgeOpacity: 0.5,
    pulse: '#e6f3ff',
    coreBase: '#01040c', coreRim: '#2997ff', coreRimHot: '#7fdcff',
    wire: '#2997ff', wireOpacity: 0.22,
  },
  light: {
    blending: 'normal',
    node: '#0062e0', nodeHot: '#00a6ff', nodeOpacity: 0.8,
    edge: '#3b7cf5', edgeHot: '#0a9fe0', edgeOpacity: 0.3,
    pulse: '#003fb3',
    coreBase: '#ffffff', coreRim: '#0071e3', coreRimHot: '#3fb3ff',
    wire: '#0071e3', wireOpacity: 0.2,
  },
};

/**
 * Camera framing per state: 0 hero, 1 expertise, 2 work, 3 contact.
 *   cam/look  camera position and target
 *   offset    where the network sits (moves it clear of text)
 *   core      visibility of the glowing core (hero only)
 *   tilt      how much pointer tilt applies in this state
 * heroDolly: extra camera travel while the hero is pinned (0 -> 1 progress).
 */
export const STATES = {
  desktop: [
    { cam: [0, 0, 6.6], look: [0, 0, 0], offset: [1.9, 0.05, 0], core: 1, tilt: 1 },
    { cam: [0, 0, 7.6], look: [0, 0, 0], offset: [0, 0, 0], core: 0, tilt: 0.25 },
    { cam: [0, 2.6, 6.4], look: [0, -0.4, 0], offset: [0, -2.05, 0], core: 0, tilt: 0.6 },
    { cam: [0, 0, 7.4], look: [0, 0, 0], offset: [0, 0, 0], core: 0, tilt: 0.12 },
  ],
  mobile: [
    { cam: [0, 0, 11], look: [0, 0, 0], offset: [0, 1.85, 0], core: 1, tilt: 1 }, // top third, clear of text
    { cam: [0, 0, 8.4], look: [0, 0, 0], offset: [0, 0, 0], core: 0, tilt: 0.2 },
    { cam: [0, 3.2, 8.2], look: [0, -0.6, 0], offset: [0, -2.4, 0], core: 0, tilt: 0.5 },
    { cam: [0, 0, 8.6], look: [0, 0, 0], offset: [0, 0, 0], core: 0, tilt: 0.1 },
  ],
  heroDolly: { desktop: { z: -1.4, x: 0.25 }, mobile: { z: -0.8, x: 0 } },
};
