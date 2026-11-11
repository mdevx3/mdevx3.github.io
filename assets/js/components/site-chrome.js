/* =============================================
   SITE CHROME: shared navigation + footer
   Rendered from one place so a link change is a one-line edit. Pages only
   provide placeholders and say where they are:
     <body data-page="home|projects|project">
     <header class="nav" id="site-nav"></header>
     <footer class="footer" id="site-footer"></footer>
   ============================================= */
import { animate, scroll, prefersReducedMotion } from '../lib/motion.js';

const SITE = {
  name: 'Darrell Lokadeva Lim',
  short: 'Darrell Lim',
  email: 'darrell.lokadeva.lim007@gmail.com',
  linkedin: 'https://linkedin.com/in/darrell-lokadeva-lim',
  github: 'https://github.com/mdevx3',
};

/** `hash` = section on the home page, `href` = another page. */
const NAV_LINKS = [
  { label: 'Expertise', hash: 'expertise' },
  { label: 'Work', hash: 'work' },
  { label: 'All Projects', href: 'projects.html' },
  { label: 'Contact', hash: 'contact' },
];

const page = document.body.dataset.page || 'home';
const isHome = page === 'home';
const mobileQuery = window.matchMedia('(max-width: 820px)');

const ICON_SUN = '<svg class="icon-sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
const ICON_MOON = '<svg class="icon-moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

const linkHref = (l) => l.href ?? `${isHome ? '' : 'index.html'}#${l.hash}`;
const isCurrent = (l) => l.href === 'projects.html' && page !== 'home';

/** @param {HTMLElement} nav the #site-nav placeholder */
export function initNav(nav) {
  nav.innerHTML = `
    <div class="nav-inner container">
      <a href="index.html" class="nav-logo" aria-label="${SITE.name}, home"><span class="nav-logo-mark" aria-hidden="true"></span>${SITE.short}</a>
      <nav class="nav-menu" id="nav-menu" aria-label="Primary">
        <ul class="nav-links">
          ${NAV_LINKS.map((l) => `<li><a href="${linkHref(l)}"${isCurrent(l) ? ' class="active" aria-current="page"' : ''}>${l.label}</a></li>`).join('')}
        </ul>
      </nav>
      <div class="nav-actions">
        <button class="theme-toggle" type="button" aria-label="Switch theme">${ICON_SUN}${ICON_MOON}</button>
        <button class="hamburger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav-menu"><span class="hamburger-lines"></span></button>
      </div>
    </div>
    ${isHome ? '<div class="nav-progress" aria-hidden="true"></div>' : ''}`;

  document.body.insertAdjacentHTML('afterbegin', '<a class="skip-link" href="#main">Skip to content</a>');

  const menu = nav.querySelector('.nav-menu');
  const burger = nav.querySelector('.hamburger');

  /* Frosted once scrolled (always on inner pages) */
  const updateSolid = () => nav.classList.toggle('is-solid', !isHome || window.scrollY > 16);
  updateSolid();
  window.addEventListener('scroll', updateSolid, { passive: true });

  /* Reading progress (home): scrubbed to page scroll */
  const progress = nav.querySelector('.nav-progress');
  if (progress && !prefersReducedMotion()) scroll(animate(progress, { scaleX: [0, 1] }, { ease: 'linear' }));

  /* Mobile sheet */
  const setOpen = (open) => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('scroll-lock', open);
    nav.classList.toggle('is-solid', open || !isHome || window.scrollY > 16);
    if (open) menu.querySelector('a')?.focus();
  };
  const isOpen = () => menu.classList.contains('is-open');
  burger.addEventListener('click', () => setOpen(!isOpen()));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  mobileQuery.addEventListener('change', () => setOpen(false));
  nav.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') { setOpen(false); burger.focus(); return; }
    if (e.key !== 'Tab') return;
    const items = [...nav.querySelectorAll('.nav-links a, .theme-toggle, .hamburger')];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  if (isHome) highlightActiveSection(nav);
}

/** Underline the nav link of the section being read (home only). */
function highlightActiveSection(nav) {
  const links = [...nav.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const hero = document.querySelector('.hero');
  if (hero) sections.push(hero);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -54% 0px' });
  sections.forEach((s) => observer.observe(s));
}

/** @param {HTMLElement} footer the #site-footer placeholder */
export function initFooter(footer) {
  footer.innerHTML = `
    <div class="container footer-inner">
      <p>&copy; ${new Date().getFullYear()} ${SITE.name}. Designed and built in Jakarta.</p>
      <nav class="footer-links" aria-label="Footer">
        <a class="footer-link" href="${SITE.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
        <a class="footer-link" href="${SITE.github}" target="_blank" rel="noopener">GitHub</a>
        <a class="footer-link" href="mailto:${SITE.email}">Email</a>
        <a class="footer-link" href="#main">Back to top &uarr;</a>
      </nav>
    </div>`;
}
