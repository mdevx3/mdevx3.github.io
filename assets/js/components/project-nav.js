/* =============================================
   PROJECT PREV / NEXT NAVIGATION  (project-*.html)
   Builds the bottom navigation from data/projects.js so the order is defined
   once. Markup:
     <nav class="project-nav" data-project-nav data-current="hotel-booking">
       <a href="projects.html">All Projects</a>   (fallback if JS is off)
     </nav>
   ============================================= */
import { PROJECTS } from '../data/projects.js';

const ARROW_LEFT = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW_RIGHT = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** @param {HTMLElement} nav the [data-project-nav] element */
export function initProjectNav(nav) {
  const index = PROJECTS.findIndex((p) => p.id === nav.dataset.current);
  if (index === -1) return; // unknown page: keep the static fallback
  const prev = PROJECTS[index - 1];
  const next = PROJECTS[index + 1];

  nav.setAttribute('aria-label', 'More projects');
  nav.innerHTML = `
    ${prev ? `
      <a class="project-nav-link project-nav-link--prev" href="${prev.href}">
        <span class="project-nav-label">Previous</span>
        <span class="project-nav-title">${ARROW_LEFT}${prev.title}</span>
      </a>` : '<span class="project-nav-spacer"></span>'}
    <a class="project-nav-all" href="projects.html">All Projects</a>
    ${next ? `
      <a class="project-nav-link project-nav-link--next" href="${next.href}">
        <span class="project-nav-label">Next Project</span>
        <span class="project-nav-title">${next.title}${ARROW_RIGHT}</span>
      </a>` : '<span class="project-nav-spacer"></span>'}`;
}
