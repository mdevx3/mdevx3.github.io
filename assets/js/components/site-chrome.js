/* =============================================
   SITE CHROME: shared navigation + footer
   Rendered from one place so a link change is a one-line edit instead of
   eight. Pages only provide empty placeholders:
     <header class="nav" id="site-nav"></header>
     <footer class="footer" id="site-footer"></footer>
   and tell us where they are with <body data-page="home|projects|project">.
   ============================================= */

const SITE = {
  name: 'Darrell Lokadeva Lim',
  logo: 'Darrell',
  email: 'darrell.lokadeva.lim007@gmail.com',
  linkedin: 'https://linkedin.com/in/darrell-lokadeva-lim',
  github: 'https://github.com/mdevx3',
};

/** Primary navigation. `hash` = section on the home page, `href` = other page. */
const NAV_LINKS = [
  { label: 'About', hash: 'about' },
  { label: 'Experience', hash: 'experience' },
  { label: 'Projects', href: 'projects.html' },
  { label: 'Skills', hash: 'skills' },
  { label: 'Contact', hash: 'contact' },
];

const MOBILE_BREAKPOINT = '(max-width: 900px)';
const page = document.body.dataset.page || 'home';
const isHome = page === 'home';

const ICON_SUN = '<svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
const ICON_MOON = '<svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

/** On the home page sections are same-page anchors; elsewhere they point home. */
const linkHref = (l) => l.href ?? `${isHome ? '' : 'index.html'}#${l.hash}`;

/* ---------- Navigation ---------- */

/** @param {HTMLElement} nav the #site-nav placeholder */
export function initNav(nav) {
  nav.innerHTML = `
    <div class="nav-inner container">
      <a href="index.html" class="nav-logo gradient-text" aria-label="${SITE.name} - home">${SITE.logo}</a>
      <nav class="nav-menu" id="nav-menu" aria-label="Primary">
        <ul class="nav-links">
          ${NAV_LINKS.map((l) => `<li><a href="${linkHref(l)}"${l.href === 'projects.html' && !isHome ? ' class="active" aria-current="page"' : ''}>${l.label}</a></li>`).join('')}
        </ul>
      </nav>
      <div class="nav-actions">
        <button class="theme-toggle" type="button" aria-label="Switch theme">${ICON_SUN}${ICON_MOON}</button>
        <button class="hamburger" type="button" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <div class="nav-backdrop"></div>`;

  // Keyboard users can jump past the nav
  document.body.insertAdjacentHTML('afterbegin', '<a class="skip-link" href="#main">Skip to content</a>');

  const menu = nav.querySelector('.nav-menu');
  const burger = nav.querySelector('.hamburger');
  const backdrop = nav.querySelector('.nav-backdrop');
  const mobile = window.matchMedia(MOBILE_BREAKPOINT);

  /* --- Solid background once scrolled (always solid on inner pages) --- */
  const updateSolid = () => nav.classList.toggle('is-solid', !isHome || window.scrollY > 24);
  updateSolid();
  window.addEventListener('scroll', updateSolid, { passive: true });

  /* --- Mobile drawer --- */
  const setOpen = (open) => {
    menu.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('scroll-lock', open);
    if (open) menu.querySelector('a')?.focus();
  };
  const isOpen = () => menu.classList.contains('is-open');

  burger.addEventListener('click', () => setOpen(!isOpen()));
  backdrop.addEventListener('click', () => { setOpen(false); burger.focus(); });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  mobile.addEventListener('change', () => setOpen(false));

  nav.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') { setOpen(false); burger.focus(); return; }
    if (e.key !== 'Tab') return;
    // Keep focus inside the open drawer (+ its toggle buttons)
    const items = [...nav.querySelectorAll('.nav-links a, .theme-toggle, .hamburger')];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* --- Highlight the link of the section being read (home page only) --- */
  if (isHome) highlightActiveSection(nav);
}

function highlightActiveSection(nav) {
  const links = [...nav.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  // A section is "current" while it crosses a line ~40% down the viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-40% 0px -59% 0px' });
  sections.forEach((s) => observer.observe(s));

  // Back at the hero: clear the highlight
  const hero = document.querySelector('.hero');
  if (hero) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) links.forEach((a) => a.classList.remove('active'));
    }, { rootMargin: '-40% 0px -59% 0px' }).observe(hero);
  }
}

/* ---------- Footer ---------- */

/** @param {HTMLElement} footer the #site-footer placeholder */
export function initFooter(footer) {
  footer.innerHTML = `
    <div class="container">
      <div class="footer-inner">
        <div class="footer-copy">&copy; ${new Date().getFullYear()} <a href="index.html">${SITE.name}</a>. Built with care.</div>
        <div class="footer-links">
          <a href="${SITE.linkedin}" target="_blank" rel="noopener" class="footer-link">LinkedIn</a>
          <a href="${SITE.github}" target="_blank" rel="noopener" class="footer-link">GitHub</a>
          <a href="mailto:${SITE.email}" class="footer-link">Email</a>
        </div>
      </div>
    </div>`;
}
