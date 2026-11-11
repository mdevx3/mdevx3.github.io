/* =============================================
   NETWORK MESH: "Data & Connected Intelligence"
   Nodes + links + travelling pulses + a glowing core. Every node has a fixed
   identity (u, v on a sphere), so it can be laid out in four shapes and
   morphed between them without links tangling:
     0 sphere      hero: the whole system, spinning with inertia
     1 clusters    expertise: three groups, one behind each card
     2 landscape   work: a flowing data surface under the projects
     3 ring        contact: a halo framing the headline
   ============================================= */
import {
  BufferGeometry, BufferAttribute, Points, LineSegments, Mesh, ShaderMaterial,
  LineBasicMaterial, IcosahedronGeometry, EdgesGeometry, Group, Color,
  AdditiveBlending, NormalBlending,
} from '../../vendor/three.js';
import { SCENE } from './config.js';

const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const SPHERE_TILT = 0.38; // fixed x-tilt so the sphere reads as 3D, not a disc

/* ----- Shaders ----- */
const POINT_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aGroup;
  attribute float aAlpha;
  uniform float uPixelRatio;
  uniform float uHighlight;
  uniform float uHighlightAmt;
  varying float vBoost;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float hl = step(abs(aGroup - uHighlight), 0.5) * uHighlightAmt;
    vBoost = hl;
    vAlpha = aAlpha;
    gl_PointSize = aSize * uPixelRatio * (1.0 + hl * 0.6) / -mv.z;
  }`;

const POINT_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  uniform float uOpacity;
  varying float vBoost;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float halo = pow(smoothstep(0.5, 0.0, d), 2.4);
    float core = smoothstep(0.14, 0.0, d);
    vec3 col = mix(uColor, uHot, clamp(core + vBoost * 0.6, 0.0, 1.0));
    gl_FragColor = vec4(col, (halo * 0.7 + core) * uOpacity * vAlpha);
  }`;

const CORE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;

const CORE_FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uRim;
  uniform vec3 uRimHot;
  uniform float uGlow;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fresnel = pow(1.0 - clamp(dot(vNormal, vView), 0.0, 1.0), 2.2);
    vec3 rim = mix(uRim, uRimHot, fresnel);
    gl_FragColor = vec4(mix(uBase, rim, clamp(fresnel * (1.15 + uGlow * 0.8), 0.0, 1.0)), 1.0);
  }`;

/** Hex -> Color with the components used as-is (custom shaders output raw sRGB). */
const rawColor = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return new Color().setRGB(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Deterministic PRNG so the network looks the same on every visit. */
function prng(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * @param {{count: number, pulseCount: number}} opts
 */
export function createNetwork({ count, pulseCount }) {
  const rand = prng(20261111);

  /* ----- Node identities on a Fibonacci sphere ----- */
  const unit = new Float32Array(count * 3);
  const U = new Float32Array(count);
  const V = new Float32Array(count);
  const jitter = new Float32Array(count);
  const groupOf = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count;
    const r = Math.sqrt(1 - y * y);
    const theta = i * GOLDEN_ANGLE;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    unit[i * 3] = x; unit[i * 3 + 1] = y; unit[i * 3 + 2] = z;
    U[i] = (Math.atan2(z, x) / TAU + 1) % 1;
    V[i] = (y + 1) / 2;
    jitter[i] = rand();
    groupOf[i] = Math.min(2, Math.floor(U[i] * 3)); // cluster = longitude third
  }

  /* ----- Links: k nearest neighbours on the sphere (built once) ----- */
  const k = SCENE.neighbours;
  const pairs = [];
  const seen = new Set();
  const bestD = new Float32Array(k);
  const bestJ = new Int32Array(k);
  for (let i = 0; i < count; i++) {
    bestD.fill(Infinity); bestJ.fill(-1);
    for (let j = 0; j < count; j++) {
      if (j === i) continue;
      const dx = unit[i * 3] - unit[j * 3];
      const dy = unit[i * 3 + 1] - unit[j * 3 + 1];
      const dz = unit[i * 3 + 2] - unit[j * 3 + 2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d >= bestD[k - 1]) continue;
      let slot = k - 1;
      while (slot > 0 && bestD[slot - 1] > d) { bestD[slot] = bestD[slot - 1]; bestJ[slot] = bestJ[slot - 1]; slot--; }
      bestD[slot] = d; bestJ[slot] = j;
    }
    for (let n = 0; n < k; n++) {
      const j = bestJ[n];
      const key = i < j ? i * count + j : j * count + i;
      if (j >= 0 && !seen.has(key)) { seen.add(key); pairs.push(i, j); }
    }
  }
  const edges = Uint32Array.from(pairs);
  const edgeCount = edges.length / 2;

  /* ----- Buffers ----- */
  const pos = new Float32Array(count * 3);
  const bufA = new Float32Array(count * 3);
  const bufB = new Float32Array(count * 3);

  const nodeGeo = new BufferGeometry();
  const nodePos = new BufferAttribute(pos, 3);
  const sizes = new Float32Array(count);
  const ones = new Float32Array(count).fill(1);
  for (let i = 0; i < count; i++) sizes[i] = 16 + Math.pow(jitter[i], 3) * 46;
  nodeGeo.setAttribute('position', nodePos);
  nodeGeo.setAttribute('aSize', new BufferAttribute(sizes, 1));
  nodeGeo.setAttribute('aGroup', new BufferAttribute(groupOf, 1));
  nodeGeo.setAttribute('aAlpha', new BufferAttribute(ones, 1));

  const pointUniforms = () => ({
    uColor: { value: new Color() },
    uHot: { value: new Color() },
    uOpacity: { value: 1 },
    uPixelRatio: { value: 1 },
    uHighlight: { value: -1 },
    uHighlightAmt: { value: 0 },
  });
  const nodeMat = new ShaderMaterial({
    vertexShader: POINT_VERT, fragmentShader: POINT_FRAG,
    uniforms: pointUniforms(), transparent: true, depthWrite: false,
  });
  const nodes = new Points(nodeGeo, nodeMat);
  nodes.frustumCulled = false;

  const linePos = new Float32Array(edgeCount * 6);
  const lineCol = new Float32Array(edgeCount * 8);
  const edgeAlpha = new Float32Array(edgeCount);
  const lineGeo = new BufferGeometry();
  const linePosAttr = new BufferAttribute(linePos, 3);
  const lineColAttr = new BufferAttribute(lineCol, 4);
  lineGeo.setAttribute('position', linePosAttr);
  lineGeo.setAttribute('color', lineColAttr);
  const lineMat = new LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false });
  const lines = new LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;

  /* Pulses: points that travel along visible links */
  const pulsePos = new Float32Array(pulseCount * 3);
  const pulseAlpha = new Float32Array(pulseCount);
  const pulseEdge = new Int32Array(pulseCount);
  const pulseT = new Float32Array(pulseCount);
  const pulseSpeed = new Float32Array(pulseCount);
  const pulseDir = new Int8Array(pulseCount);
  for (let p = 0; p < pulseCount; p++) {
    pulseEdge[p] = Math.floor(rand() * edgeCount);
    pulseT[p] = rand();
    pulseSpeed[p] = 0.35 + rand() * 0.55;
    pulseDir[p] = rand() > 0.5 ? 1 : -1;
  }
  const pulseGeo = new BufferGeometry();
  const pulsePosAttr = new BufferAttribute(pulsePos, 3);
  const pulseAlphaAttr = new BufferAttribute(pulseAlpha, 1);
  pulseGeo.setAttribute('position', pulsePosAttr);
  pulseGeo.setAttribute('aSize', new BufferAttribute(new Float32Array(pulseCount).fill(52), 1));
  pulseGeo.setAttribute('aGroup', new BufferAttribute(new Float32Array(pulseCount).fill(-9), 1));
  pulseGeo.setAttribute('aAlpha', pulseAlphaAttr);
  const pulseMat = new ShaderMaterial({
    vertexShader: POINT_VERT, fragmentShader: POINT_FRAG,
    uniforms: pointUniforms(), transparent: true, depthWrite: false,
  });
  const pulses = new Points(pulseGeo, pulseMat);
  pulses.frustumCulled = false;

  /* Core: fresnel-lit icosahedron + faceted wire shell */
  const coreGroup = new Group();
  const coreMat = new ShaderMaterial({
    vertexShader: CORE_VERT, fragmentShader: CORE_FRAG,
    uniforms: { uBase: { value: new Color() }, uRim: { value: new Color() }, uRimHot: { value: new Color() }, uGlow: { value: 0 } },
  });
  const core = new Mesh(new IcosahedronGeometry(0.62, 3), coreMat);
  const wireMat = new LineBasicMaterial({ transparent: true, depthWrite: false });
  const wire = new LineSegments(new EdgesGeometry(new IcosahedronGeometry(0.7, 1)), wireMat);
  coreGroup.add(core, wire);

  const group = new Group();
  group.add(lines, nodes, pulses, coreGroup);

  /* ----- Theme / materials ----- */
  const edgeRGB = new Color();
  const edgeHotRGB = new Color();
  let edgeOpacity = 0.5;

  function applyMaterials(m) {
    const blending = m.blending === 'additive' ? AdditiveBlending : NormalBlending;
    nodeMat.uniforms.uColor.value.copy(rawColor(m.node));
    nodeMat.uniforms.uHot.value.copy(rawColor(m.nodeHot));
    nodeMat.uniforms.uOpacity.value = m.nodeOpacity;
    pulseMat.uniforms.uColor.value.copy(rawColor(m.pulse));
    pulseMat.uniforms.uHot.value.copy(rawColor(m.pulse));
    pulseMat.uniforms.uOpacity.value = 1;
    coreMat.uniforms.uBase.value.copy(rawColor(m.coreBase));
    coreMat.uniforms.uRim.value.copy(rawColor(m.coreRim));
    coreMat.uniforms.uRimHot.value.copy(rawColor(m.coreRimHot));
    wireMat.color.set(m.wire);
    wireMat.opacity = m.wireOpacity;
    edgeRGB.set(m.edge);      // built-in material: stored in linear space
    edgeHotRGB.set(m.edgeHot);
    edgeOpacity = m.edgeOpacity;
    for (const mat of [nodeMat, pulseMat, lineMat, wireMat]) { mat.blending = blending; mat.needsUpdate = true; }
  }

  function setPixelRatio(r) {
    nodeMat.uniforms.uPixelRatio.value = r;
    pulseMat.uniforms.uPixelRatio.value = r;
  }

  /* ----- Layouts ----- */
  function writeState(state, out, ctx) {
    switch (state) {
      case 0: { // sphere, spun by scroll inertia
        const s = ctx.spin;
        const cs = Math.cos(s), sn = Math.sin(s);
        const ct = Math.cos(SPHERE_TILT), st = Math.sin(SPHERE_TILT);
        for (let i = 0; i < count; i++) {
          const R = ctx.sphereRadius * (0.93 + jitter[i] * 0.12) * (1 + 0.012 * Math.sin(ctx.time * 0.9 + jitter[i] * TAU));
          const x = unit[i * 3] * R, y = unit[i * 3 + 1] * R, z = unit[i * 3 + 2] * R;
          const x1 = x * cs + z * sn;
          const z1 = -x * sn + z * cs;
          out[i * 3] = x1;
          out[i * 3 + 1] = y * ct - z1 * st;
          out[i * 3 + 2] = y * st + z1 * ct;
        }
        break;
      }
      case 1: { // three clusters, each tracking its card
        for (let i = 0; i < count; i++) {
          const c = groupOf[i];
          const center = ctx.clusters[c];
          const theta = (U[i] * 3 - c) * TAU + ctx.time * (c === 1 ? -0.12 : 0.12) + ctx.spin * 0.5;
          const yy = V[i] * 2 - 1;
          const rr = Math.sqrt(Math.max(0, 1 - yy * yy));
          const scale = ctx.clusterRadius * (0.5 + 0.5 * jitter[i]);
          out[i * 3] = center[0] + Math.cos(theta) * rr * scale;
          out[i * 3 + 1] = center[1] + yy * scale;
          out[i * 3 + 2] = Math.sin(theta) * rr * scale;
        }
        break;
      }
      case 2: { // flowing landscape
        const { width, depth } = ctx.landscape;
        const ph = ctx.phase;
        for (let i = 0; i < count; i++) {
          const x = (U[i] - 0.5) * width;
          const z = (V[i] - 0.5) * depth;
          out[i * 3] = x;
          out[i * 3 + 1] = 0.26 * Math.sin(x * 1.1 + ph) + 0.2 * Math.cos(z * 1.7 + ph * 0.8) + 0.07 * Math.sin((x + z) * 2.6 + ph * 1.4);
          out[i * 3 + 2] = z;
        }
        break;
      }
      default: { // 3: elliptical ring enclosing the contact header
        const { x: cx, y: cy, rx, ry } = ctx.ring;
        for (let i = 0; i < count; i++) {
          const a = U[i] * TAU + ctx.time * 0.04 + ctx.spin * 0.3;
          const band = 1 + (V[i] - 0.5) * 0.12; // thin band, always outside the header box
          out[i * 3] = cx + Math.cos(a) * rx * band;
          out[i * 3 + 1] = cy + Math.sin(a) * ry * band;
          out[i * 3 + 2] = (jitter[i] - 0.5) * 0.35;
        }
      }
    }
  }

  /* ----- Per-frame update ----- */
  /**
   * @param {number} a  state blended from
   * @param {number} b  state blended to
   * @param {number} f  eased blend 0..1
   * @param {object} ctx layout context from the stage
   * @param {number} dt seconds since last frame (0 = static render)
   */
  function update(a, b, f, ctx, dt) {
    if (a === b || f <= 0.0001) {
      writeState(a, pos, ctx);
    } else if (f >= 0.9999) {
      writeState(b, pos, ctx);
    } else {
      writeState(a, bufA, ctx);
      writeState(b, bufB, ctx);
      for (let i = 0; i < pos.length; i++) pos[i] = bufA[i] + (bufB[i] - bufA[i]) * f;
    }
    nodePos.needsUpdate = true;

    // Highlight (expertise card hover)
    const hl = ctx.highlight;
    const hlAmt = ctx.highlightAmt;
    nodeMat.uniforms.uHighlight.value = hl;
    nodeMat.uniforms.uHighlightAmt.value = hlAmt;

    // Links: follow nodes, fade when stretched, brighten when highlighted
    const [f0, f1] = SCENE.edgeFade;
    for (let e = 0; e < edgeCount; e++) {
      const i = edges[e * 2] * 3;
      const j = edges[e * 2 + 1] * 3;
      const o = e * 6;
      linePos[o] = pos[i]; linePos[o + 1] = pos[i + 1]; linePos[o + 2] = pos[i + 2];
      linePos[o + 3] = pos[j]; linePos[o + 4] = pos[j + 1]; linePos[o + 5] = pos[j + 2];
      const dx = pos[i] - pos[j], dy = pos[i + 1] - pos[j + 1], dz = pos[i + 2] - pos[j + 2];
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      let alpha = edgeOpacity * (1 - smoothstep(f0, f1, len));
      let mix = 0;
      if (hlAmt > 0.001 && groupOf[i / 3] === hl && groupOf[j / 3] === hl) {
        mix = hlAmt;
        alpha = Math.min(1, alpha * (1 + hlAmt * 1.4));
      }
      edgeAlpha[e] = alpha;
      const r = edgeRGB.r + (edgeHotRGB.r - edgeRGB.r) * mix;
      const g = edgeRGB.g + (edgeHotRGB.g - edgeRGB.g) * mix;
      const bl = edgeRGB.b + (edgeHotRGB.b - edgeRGB.b) * mix;
      const c = e * 8;
      lineCol[c] = r; lineCol[c + 1] = g; lineCol[c + 2] = bl; lineCol[c + 3] = alpha;
      lineCol[c + 4] = r; lineCol[c + 5] = g; lineCol[c + 6] = bl; lineCol[c + 7] = alpha;
    }
    linePosAttr.needsUpdate = true;
    lineColAttr.needsUpdate = true;

    // Pulses
    pulses.visible = dt > 0;
    if (dt > 0) {
      for (let p = 0; p < pulseCount; p++) {
        pulseT[p] += pulseSpeed[p] * dt;
        if (pulseT[p] >= 1 || edgeAlpha[pulseEdge[p]] < 0.04) {
          let e = pulseEdge[p];
          for (let tries = 0; tries < 8; tries++) {
            e = Math.floor(rand() * edgeCount);
            if (edgeAlpha[e] > 0.12) break;
          }
          pulseEdge[p] = e;
          pulseT[p] = 0;
          pulseDir[p] = rand() > 0.5 ? 1 : -1;
        }
        const e = pulseEdge[p];
        const t = pulseDir[p] > 0 ? pulseT[p] : 1 - pulseT[p];
        const o = e * 6;
        pulsePos[p * 3] = linePos[o] + (linePos[o + 3] - linePos[o]) * t;
        pulsePos[p * 3 + 1] = linePos[o + 1] + (linePos[o + 4] - linePos[o + 1]) * t;
        pulsePos[p * 3 + 2] = linePos[o + 2] + (linePos[o + 5] - linePos[o + 2]) * t;
        pulseAlpha[p] = Math.min(1, (edgeAlpha[e] / Math.max(edgeOpacity, 0.01)) * Math.sin(Math.PI * pulseT[p]));
      }
      pulsePosAttr.needsUpdate = true;
      pulseAlphaAttr.needsUpdate = true;
    }

    // Core: visible only in the hero, glows brighter as the camera dollies in
    const s = ctx.coreScale;
    coreGroup.visible = s > 0.01;
    coreGroup.scale.setScalar(Math.max(0.0001, s));
    coreGroup.rotation.set(SPHERE_TILT, ctx.spin * 0.6, 0);
    coreMat.uniforms.uGlow.value = ctx.glow;
  }

  return { group, update, applyMaterials, setPixelRatio };
}
