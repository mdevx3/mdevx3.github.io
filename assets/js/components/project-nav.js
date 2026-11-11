/* =============================================
   PROJECT PREV / NEXT  (project-*.html)
   Built from data/projects.js so the order is defined once.
     <nav class="project-nav" data-project-nav data-current="hotel-booking">
       <a href="projects.html">All projects</a>   (fallback if JS is off)
     </nav>
   ============================================= */
import { PROJECTS } from '../data/projects.js';

/** @param {HTMLElement} nav the [data-project-nav] element */
export function initProjectNav(nav) {
  const index = PROJECTS.findIndex((p) => p.id === nav.dataset.current);
  if (index === -1) return;
  const prev = PROJECTS[index - 1];
  const next = PROJECTS[index + 1];

  nav.setAttribute('aria-label', 'More projects');
  nav.innerHTML = `
    ${prev ? `<a class="project-nav-link" href="${prev.href}"><span class="label">&larr; Previous</span><span class="project-nav-title">${prev.title}</span></a>` : '<span class="project-nav-spacer"></span>'}
    <a class="link-arrow project-nav-all" href="projects.html">All projects</a>
    ${next ? `<a class="project-nav-link project-nav-link--next" href="${next.href}"><span class="label">Next &rarr;</span><span class="project-nav-title">${next.title}</span></a>` : '<span class="project-nav-spacer"></span>'}`;
}
