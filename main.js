/* =============================================
   DARRELL LOKADEVA LIM — PORTFOLIO SCRIPTS
   ============================================= */

import { animate, createTimeline, stagger, utils } from 'https://esm.sh/animejs@4';

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
   ANIME.JS v4 ANIMATIONS
   ============================================= */

/* === HERO ENTRANCE (index.html) === */
const heroSection = document.querySelector('.hero');
if (heroSection) {
  utils.set('.nav-logo', { opacity: 0, translateY: -12 });
  utils.set('.nav-links li', { opacity: 0, translateY: -8 });
  utils.set('.hero-name', { opacity: 0, clipPath: 'inset(0 100% 0 0)', scale: 1.04 });

  createTimeline({ defaults: { ease: 'outExpo' } })
    .add('.nav-logo',          { opacity: [0, 1], translateY: [-12, 0], duration: 600 }, 0)
    .add('.nav-links li',      { opacity: [0, 1], translateY: [  -8, 0], duration: 500, delay: stagger(60) }, 100)
    .add('.hero-eyebrow',      { opacity: [0, 1], translateY: [  20, 0], duration: 700 }, 220)
    .add('.hero-name',         { opacity: [0, 1], clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'], scale: [1.04, 1], duration: 1100, ease: 'outQuint' }, 400)
    .add('.hero-headline',     { opacity: [0, 1], translateY: [  18, 0], duration: 700 }, 700)
    .add('.hero-intro',        { opacity: [0, 1], translateY: [  16, 0], duration: 700 }, 840)
    .add('.hero-actions .btn', { opacity: [0, 1], translateY: [  14, 0], scale: [0.9, 1], duration: 600, delay: stagger(110) }, 1020)
    .add('.hero-scroll-hint',  { opacity: [0, 1], translateY: [  10, 0], duration: 600 }, 1330);
}

/* === HERO DOT GRID RIPPLE === */
const heroDotsContainer = document.querySelector('.hero-dots');
if (heroDotsContainer && heroSection) {
  const cols = 18;
  const rows = 10;
  heroDotsContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  heroDotsContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  const frag = document.createDocumentFragment();
  for (let i = 0; i < cols * rows; i++) {
    const dot = document.createElement('div');
    dot.className = 'hero-dot';
    frag.appendChild(dot);
  }
  heroDotsContainer.appendChild(frag);

  const gridOptions = { grid: [cols, rows], from: 'center' };

  utils.set('.hero-dot', { scale: 0, opacity: 0 });

  animate('.hero-dot', {
    scale: [0, 1],
    opacity: [0, 1],
    delay: stagger(35, gridOptions),
    duration: 800,
    ease: 'outQuad',
  });

  function rippleHeroDots() {
    animate('.hero-dot', {
      scale: [1, 1.7, 1],
      delay: stagger(28, gridOptions),
      duration: 1300,
      ease: 'inOutQuad',
    });
  }
  heroSection.addEventListener('mouseenter', rippleHeroDots);
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
        animate(orb, {
          translateX: x * strength,
          translateY: y * strength,
          duration: 900,
          ease: 'outQuad',
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
    animate(card, {
      rotateY: x * 8,
      rotateX: y * -8,
      translateY: -6,
      duration: 400,
      ease: 'outQuad',
    });
  });
  card.addEventListener('mouseleave', () => {
    animate(card, {
      rotateY: 0,
      rotateX: 0,
      translateY: 0,
      duration: 500,
      ease: 'outQuad',
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
    animate(progressBar, {
      width: pct + '%',
      duration: 200,
      ease: 'outQuad',
    });
    progressQueued = false;
  });
}, { passive: true });

/* === EYEBROW DOT PULSE === */
const eyebrowDot = document.querySelector('.hero-eyebrow-dot');
if (eyebrowDot) {
  animate(eyebrowDot, {
    scale: [1, 0.6],
    opacity: [1, 0.35],
    duration: 1000,
    delay: 920,
    alternate: true,
    loop: true,
    ease: 'inOutSine',
  });
}

/* === PROJECT DETAIL HERO ENTRANCE === */
const projectDetailHero = document.querySelector('.project-detail-hero');
if (projectDetailHero) {
  utils.set('.breadcrumb, .project-detail-title, .project-detail-meta', { opacity: 0 });

  createTimeline({ defaults: { ease: 'outExpo' } })
    .add('.breadcrumb',           { opacity: [0, 1], translateY: [10, 0], duration: 500 }, 200)
    .add('.project-detail-title', { opacity: [0, 1], translateY: [24, 0], duration: 700 }, 360)
    .add('.project-detail-meta',  { opacity: [0, 1], translateY: [10, 0], duration: 550 }, 640);
}

/* === EXPERIENCE TIMELINE RAIL === */
document.querySelectorAll('.exp-card').forEach(card => {
  const rail = document.createElement('div');
  rail.className = 'exp-timeline-rail';
  card.insertBefore(rail, card.firstChild);
});

/* === SCROLL REVEAL === */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.revealDelay || '0') * 100;
      animate(entry.target, {
        opacity: [0, 1],
        translateY: [28, 0],
        scale: [0.96, 1],
        duration: 750,
        delay,
        ease: 'outExpo',
      });
      const rail = entry.target.querySelector('.exp-timeline-rail');
      if (rail) {
        animate(rail, { scaleY: [0, 1], duration: 700, delay: delay + 250, ease: 'outQuad' });
      }
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* === SECTION TITLE UNDERLINE DRAW === */
document.querySelectorAll('.section-title').forEach(title => {
  const underline = document.createElement('span');
  underline.className = 'title-underline';
  title.insertAdjacentElement('afterend', underline);
});

const underlineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animate(entry.target, {
        scaleX: [0, 1],
        duration: 700,
        delay: 250,
        ease: 'outQuad',
      });
      underlineObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.title-underline').forEach(el => underlineObserver.observe(el));

/* === STAGGERED CHILDREN REVEAL === */
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animate(entry.target.querySelectorAll('[data-stagger]'), {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 550,
        ease: 'outExpo',
        delay: stagger(65),
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
          animate(obj, {
            v: parseFloat(match[2]),
            duration: 1400,
            delay: 300 + i * 150,
            ease: 'outExpo',
            onUpdate: () => {
              el.textContent = match[1] + (isFloat ? obj.v.toFixed(2) : Math.round(obj.v)) + match[3];
            },
            onComplete: () => { el.textContent = original; },
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
    animate(obj, {
      val: parsed.value,
      duration: 1400,
      delay: i * 150,
      ease: 'outExpo',
      onUpdate: () => {
        el.textContent = parsed.prefix + formatStatNum(obj.val, parsed) + parsed.suffix;
      },
      onComplete: () => { el.textContent = original; },
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

/* === MAGNETIC BUTTONS === */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    animate(btn, {
      translateX: x * 14,
      translateY: y * 14,
      duration: 300,
      ease: 'outQuad',
    });
  });
  btn.addEventListener('mouseleave', () => {
    animate(btn, {
      translateX: 0,
      translateY: 0,
      duration: 600,
      ease: 'outElastic(1, .6)',
    });
  });
});

/* === SKILL BADGE / TAG POP === */
document.querySelectorAll('.badge, .tag').forEach(badge => {
  badge.addEventListener('mouseenter', () => {
    animate(badge, {
      scale: [1, 1.12, 1.05],
      rotate: [0, -3, 0],
      duration: 450,
      ease: 'outElastic(1, .5)',
    });
  });
  badge.addEventListener('mouseleave', () => {
    animate(badge, { scale: 1, rotate: 0, duration: 350, ease: 'outQuad' });
  });
});

/* === CONTACT CARD ICON POP === */
document.querySelectorAll('.contact-link-card').forEach(card => {
  const icon = card.querySelector('.contact-link-icon');
  if (!icon) return;
  card.addEventListener('mouseenter', () => {
    animate(icon, {
      scale: [1, 1.15, 1],
      rotate: [0, -8, 0],
      duration: 500,
      ease: 'outBack',
    });
  });
});

/* === FIGURE GALLERY IMAGE ZOOM === */
document.querySelectorAll('.figure-card').forEach(card => {
  const img = card.querySelector('img');
  if (!img) return;
  card.addEventListener('mouseenter', () => {
    animate(img, { scale: 1.06, duration: 450, ease: 'outQuad' });
  });
  card.addEventListener('mouseleave', () => {
    animate(img, { scale: 1, duration: 450, ease: 'outQuad' });
  });
});

/* === FIGURE LIGHTBOX === */
const figureCardsForLightbox = document.querySelectorAll('.figure-card');
if (figureCardsForLightbox.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-backdrop"></div>
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <figure class="lightbox-content">
      <img class="lightbox-img" src="" alt="">
      <figcaption class="lightbox-caption"></figcaption>
    </figure>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const lightboxContent = lightbox.querySelector('.lightbox-content');
  const lightboxBackdrop = lightbox.querySelector('.lightbox-backdrop');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  let lightboxOpen = false;

  function openLightbox(img, captionHTML) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.innerHTML = captionHTML || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lightboxOpen = true;

    utils.set(lightboxBackdrop, { opacity: 0 });
    utils.set(lightboxContent, { opacity: 0, scale: 0.85, translateY: 24 });

    animate(lightboxBackdrop, { opacity: 1, duration: 350, ease: 'outQuad' });
    animate(lightboxContent, {
      opacity: [0, 1],
      scale: [0.85, 1],
      translateY: [24, 0],
      duration: 450,
      ease: 'outQuint',
    });
  }

  function closeLightbox() {
    if (!lightboxOpen) return;
    lightboxOpen = false;
    animate(lightboxBackdrop, { opacity: 0, duration: 300, ease: 'inQuad' });
    animate(lightboxContent, {
      opacity: 0,
      scale: 0.9,
      translateY: 16,
      duration: 300,
      ease: 'inQuad',
      onComplete: () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      },
    });
  }

  figureCardsForLightbox.forEach(card => {
    const img = card.querySelector('img');
    const cap = card.querySelector('.figure-cap');
    if (!img) return;
    img.addEventListener('click', () => openLightbox(img, cap ? cap.innerHTML : ''));
  });

  lightboxBackdrop.addEventListener('click', closeLightbox);
  lightboxClose.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxOpen) closeLightbox();
  });
}

/* === PAGE TRANSITION OVERLAY === */
const pageOverlay = document.querySelector('.page-transition-overlay');
if (pageOverlay) {
  animate(pageOverlay, { opacity: 0, duration: 500, ease: 'outQuad' });

  document.querySelectorAll('a[href*=".html"]').forEach(link => {
    if (link.target === '_blank') return;
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http')) return;
      e.preventDefault();
      animate(pageOverlay, {
        opacity: 1,
        duration: 350,
        ease: 'inQuad',
        onComplete: () => { window.location.href = href; },
      });
    });
  });
}
