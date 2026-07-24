/* =============================================
   DARRELL LOKADEVA LIM — PORTFOLIO SCRIPTS
   ============================================= */

/* === NAV SCROLL BEHAVIOR === */
const nav = document.querySelector('.nav');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinkItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
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

navLinkItems.forEach(link => {
  link.addEventListener('click', () => {
    hamburger && hamburger.classList.remove('active');
    navLinks && navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

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
    if (window.scrollY >= section.offsetTop - 120) current = section.getAttribute('id');
  });
  navLinkItems.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href') || '';
    if (href.includes('#' + current)) link.classList.add('active');
  });
}

/* === MARK NAV ACTIVE ON OTHER PAGES === */
if (window.location.pathname.includes('projects')) {
  navLinkItems.forEach(link => {
    if (link.getAttribute('href') === 'projects.html') link.classList.add('active');
  });
}

/* === SMOOTH SCROLL FOR SAME-PAGE ANCHORS === */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
    }
  });
});

/* === CONTACT FORM === */
const form = document.querySelector('.contact-form form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.innerHTML = 'Sending…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        btn.innerHTML = 'Message sent ✓';
        form.reset();
      } else {
        console.error('Web3Forms error:', data);
        btn.innerHTML = 'Something went wrong — email me directly';
      }
    } catch (err) {
      console.error('Contact form network error:', err);
      btn.innerHTML = 'Network error — email me directly';
    }
    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
      btn.style.opacity = '';
    }, 4000);
  });
}

/* =============================================
   ANIME.JS ANIMATIONS
   ============================================= */

/* === HERO ENTRANCE (index.html) === */
const heroSection = document.querySelector('.hero');
if (heroSection) {
  anime.set('.nav-logo', { opacity: 0, translateY: -12 });
  anime.set('.nav-links li', { opacity: 0, translateY: -8 });
  anime.set('.hero-name', { opacity: 0, clipPath: 'inset(0 100% 0 0)', scale: 1.04 });

  anime.timeline({ easing: 'easeOutExpo' })
    .add({ targets: '.nav-logo',          opacity: [0, 1], translateY: [-12, 0], duration: 600 }, 0)
    .add({ targets: '.nav-links li',      opacity: [0, 1], translateY: [  -8, 0], duration: 500, delay: anime.stagger(60) }, 100)
    .add({ targets: '.hero-eyebrow',      opacity: [0, 1], translateY: [  20, 0], duration: 700 }, 220)
    .add({ targets: '.hero-name',         opacity: [0, 1], clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'], scale: [1.04, 1], duration: 1100, easing: 'easeOutQuint' }, 400)
    .add({ targets: '.hero-headline',     opacity: [0, 1], translateY: [  18, 0], duration: 700 }, 700)
    .add({ targets: '.hero-intro',        opacity: [0, 1], translateY: [  16, 0], duration: 700 }, 840)
    .add({ targets: '.hero-actions .btn', opacity: [0, 1], translateY: [  14, 0], scale: [0.9, 1], duration: 600, delay: anime.stagger(110) }, 1020)
    .add({ targets: '.hero-scroll-hint',  opacity: [0, 1], translateY: [  10, 0], duration: 600 }, 1330);
}

/* === MOUSE PARALLAX HERO ORBS === */
const heroOrbs = document.querySelectorAll('.hero-orb');
if (heroOrbs.length && heroSection) {
  let parallaxQueued = false;
  heroSection.addEventListener('mousemove', (e) => {
    if (parallaxQueued) return;
    parallaxQueued = true;
    requestAnimationFrame(() => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroOrbs.forEach((orb, i) => {
        const strength = (i + 1) * 18;
        anime({
          targets: orb,
          translateX: x * strength,
          translateY: y * strength,
          duration: 900,
          easing: 'easeOutQuad',
        });
      });
      parallaxQueued = false;
    });
  });
}

/* === PROJECT CARD 3D TILT === */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    anime({
      targets: card,
      rotateY: x * 8,
      rotateX: y * -8,
      translateY: -6,
      duration: 400,
      easing: 'easeOutQuad',
    });
  });
  card.addEventListener('mouseleave', () => {
    anime({
      targets: card,
      rotateY: 0,
      rotateX: 0,
      translateY: 0,
      duration: 500,
      easing: 'easeOutQuad',
    });
  });
});

/* === SCROLL PROGRESS BAR === */
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);
let progressQueued = false;
window.addEventListener('scroll', () => {
  if (progressQueued) return;
  progressQueued = true;
  requestAnimationFrame(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    anime({
      targets: progressBar,
      width: pct + '%',
      duration: 200,
      easing: 'easeOutQuad',
    });
    progressQueued = false;
  });
}, { passive: true });

/* === EYEBROW DOT PULSE === */
const eyebrowDot = document.querySelector('.hero-eyebrow-dot');
if (eyebrowDot) {
  anime({
    targets: eyebrowDot,
    scale: [1, 0.6],
    opacity: [1, 0.35],
    duration: 1000,
    delay: 920,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine',
  });
}

/* === PROJECT DETAIL HERO ENTRANCE === */
const projectDetailHero = document.querySelector('.project-detail-hero');
if (projectDetailHero) {
  anime.set('.breadcrumb, .project-detail-title, .project-detail-meta', { opacity: 0 });

  anime.timeline({ easing: 'easeOutExpo' })
    .add({ targets: '.breadcrumb',           opacity: [0, 1], translateY: [10, 0], duration: 500 }, 200)
    .add({ targets: '.project-detail-title', opacity: [0, 1], translateY: [24, 0], duration: 700 }, 360)
    .add({ targets: '.project-detail-meta',  opacity: [0, 1], translateY: [10, 0], duration: 550 }, 640);
}

/* === SCROLL REVEAL === */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.revealDelay || '0') * 100;
      anime({
        targets: entry.target,
        opacity: [0, 1],
        translateY: [28, 0],
        scale: [0.96, 1],
        duration: 750,
        delay,
        easing: 'easeOutExpo',
      });
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* === STAGGERED CHILDREN REVEAL === */
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      anime({
        targets: entry.target.querySelectorAll('[data-stagger]'),
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 550,
        easing: 'easeOutExpo',
        delay: anime.stagger(65),
      });
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-stagger-container]').forEach(el => staggerObserver.observe(el));

/* === ABOUT STATS COUNTER (index.html) === */
const aboutStats = document.querySelector('.about-stats');
if (aboutStats) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-value').forEach((el, i) => {
          const original = el.textContent.trim();
          const match = original.match(/^([^0-9]*)([0-9.]+)([^0-9]*)$/);
          if (!match) return;
          const isFloat = match[2].includes('.');
          const obj = { v: 0 };
          anime({
            targets: obj,
            v: parseFloat(match[2]),
            duration: 1400,
            delay: 300 + i * 150,
            easing: 'easeOutExpo',
            update: () => {
              el.textContent = match[1] + (isFloat ? obj.v.toFixed(2) : Math.round(obj.v)) + match[3];
            },
            complete: () => { el.textContent = original; },
          });
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  statsObserver.observe(aboutStats);
}

/* === RESULT STAT COUNTER (project pages) === */
function parseStatVal(text) {
  const match = text.match(/^([^0-9]*)([0-9,\.]+)([^0-9]*)$/);
  if (!match) return null;
  const raw = match[2].replace(/,/g, '');
  return {
    prefix: match[1],
    value: parseFloat(raw),
    suffix: match[3],
    hasComma: match[2].includes(','),
    isFloat: raw.includes('.'),
  };
}

function formatStatNum(val, p) {
  if (p.isFloat) return val.toFixed(2);
  const n = Math.round(val);
  return p.hasComma ? n.toLocaleString() : String(n);
}

function animateCounters(container) {
  container.querySelectorAll('.result-stat-val').forEach((el, i) => {
    const original = el.textContent.trim();
    const parsed = parseStatVal(original);
    if (!parsed) return;
    const obj = { val: 0 };
    anime({
      targets: obj,
      val: parsed.value,
      duration: 1400,
      delay: i * 150,
      easing: 'easeOutExpo',
      update: () => {
        el.textContent = parsed.prefix + formatStatNum(obj.val, parsed) + parsed.suffix;
      },
      complete: () => { el.textContent = original; },
    });
  });
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => animateCounters(entry.target), 700);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.result-highlight').forEach(el => counterObserver.observe(el));
