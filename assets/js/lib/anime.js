/* Single import point for anime.js so the vendored path lives in one place.
   The file is a copy of node_modules/animejs/dist/bundles/anime.esm.min.js
   (see assets/vendor). Update it with: npm update animejs && npm run vendor */
export { animate, createTimeline, stagger, utils } from '../../vendor/anime.esm.min.js';
