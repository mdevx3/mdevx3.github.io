/* =============================================
   DARRELL LOKADEVA LIM — PORTFOLIO SCRIPTS
   ============================================= */

/* === NAV SCROLL BEHAVIOR === */
const nav = document.querySelector('.nav');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinkItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  highlightActiveSection();
}, { passive: true });

/* === HAMBURGER MENU === */
if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });
}

/* Close nav when a link is clicked */
navLinkItems.forEach(link => {
  link.addEventListener('click', () => {
    hamburger && hamburger.classList.remove('active');
    navLinks && navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* Close nav when clicking outside */
document.addEventListener('click', (e) => {
  if (navLinks && navLinks.classList.contains('open')) {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
});

/* === ACTIVE SECTION HIGHLIGHT === */
function highlightActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navLinkItems.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href') || '';
    if (href.includes('#' + current)) {
      link.classList.add('active');
    }
  });
}

/* === SCROLL REVEAL === */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('[data-reveal]').forEach(el => {
  revealObserver.observe(el);
});

/* === STAGGERED CHILDREN REVEAL === */
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const children = entry.target.querySelectorAll('[data-stagger]');
      children.forEach((child, i) => {
        setTimeout(() => {
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        }, i * 80);
      });
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-stagger-container]').forEach(el => {
  const children = el.querySelectorAll('[data-stagger]');
  children.forEach(child => {
    child.style.opacity = '0';
    child.style.transform = 'translateY(20px)';
    child.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  staggerObserver.observe(el);
});

/* === CONTACT FORM === */
const form = document.querySelector('.contact-form form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const original = btn.innerHTML;
    btn.innerHTML = 'Message sent ✓';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
      btn.style.opacity = '';
      form.reset();
    }, 3000);
  });
}

/* === SMOOTH SCROLL FOR SAME-PAGE ANCHORS === */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offsetTop = target.offsetTop - 70;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  });
});

/* === MARK NAV ACTIVE ON PROJECTS PAGE === */
if (window.location.pathname.includes('projects')) {
  navLinkItems.forEach(link => {
    if (link.getAttribute('href') === 'projects.html') {
      link.classList.add('active');
    }
  });
}

/* === MARK NAV ACTIVE ON PROJECT DETAIL PAGES === */
if (window.location.pathname.includes('project-')) {
  navLinkItems.forEach(link => {
    if (link.getAttribute('href') === 'projects.html') {
      link.classList.add('active');
    }
  });
}
