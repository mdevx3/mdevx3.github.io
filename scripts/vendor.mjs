/* Builds the two browser bundles in assets/vendor/ from node_modules.
   The site has no runtime build step: run `npm run vendor` after updating
   `motion` or `three`, then commit the regenerated files.
   Each bundle is tree-shaken to only the exports the site uses, so add a
   name to the lists below before importing something new. */
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const version = (pkg) => JSON.parse(readFileSync(resolve(root, 'node_modules', pkg, 'package.json'), 'utf8')).version;

const bundles = [
  {
    out: 'assets/vendor/motion.js',
    banner: `/*! Motion ${version('motion')} | MIT License | https://motion.dev */`,
    code: `export { animate, scroll, inView, hover, stagger } from 'motion';`,
  },
  {
    out: 'assets/vendor/three.js',
    banner: `/*! three.js r${version('three').split('.')[1]} | MIT License | https://threejs.org */`,
    code: `export {
      WebGLRenderer, Scene, PerspectiveCamera, Group, BufferGeometry, BufferAttribute,
      Points, LineSegments, Mesh, ShaderMaterial, LineBasicMaterial, IcosahedronGeometry,
      EdgesGeometry, Color, Vector3, AdditiveBlending, NormalBlending
    } from 'three';`,
  },
];

for (const b of bundles) {
  await build({
    stdin: { contents: b.code, resolveDir: root, loader: 'js' },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    legalComments: 'none',
    banner: { js: b.banner },
    define: { 'process.env.NODE_ENV': '"production"' },
    outfile: resolve(root, b.out),
    logLevel: 'warning',
  });
  console.log('built', b.out);
}
