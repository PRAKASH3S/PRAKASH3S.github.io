/* ═══════════════════════════════════════════
   PRAKASH TEKI PORTFOLIO — script.js
═══════════════════════════════════════════ */

/* ─── NAVBAR, PROGRESS BAR, BACK-TO-TOP (one rAF-throttled scroll handler) ─── */
const navbar = document.getElementById('navbar');
const progressBar = document.getElementById('scrollProgress');
const backToTop = document.getElementById('backToTop');
let scrollTicking = false;

function onScroll() {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 40);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  if (backToTop) backToTop.classList.toggle('show', y > 600);
  highlightNavLink();
  animateStats();
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(onScroll);
  }
}, { passive: true });

if (backToTop) {
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ─── THEME TOGGLE (dark default, remembers choice) ─── */
const themeToggle = document.getElementById('themeToggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f7f8fc' : '#09090f');
  if (themeToggle) themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
}
applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
}

/* ─── MOBILE MENU ─── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
function setMenu(open) {
  hamburger.classList.toggle('open', open);
  mobileMenu.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
}
hamburger.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => setMenu(false));
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
    setMenu(false);
    hamburger.focus();
  }
});

/* ─── ACTIVE NAV LINK ON SCROLL ─── */
function highlightNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}

/* ─── TYPED TEXT ANIMATION ─── */
const roles = ['Data Engineer', 'Analytics Engineer', 'Data Modeler', 'BI Engineer'];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let roleIndex = 0, charIndex = 0, isDeleting = false;
const typedEl = document.getElementById('typedText');

function typeText() {
  const current = roles[roleIndex];
  if (isDeleting) {
    typedEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typedEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
  }
  let speed = isDeleting ? 60 : 100;
  if (!isDeleting && charIndex === current.length) {
    speed = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    speed = 400;
  }
  setTimeout(typeText, speed);
}
if (reduceMotion) {
  typedEl.textContent = roles[0];
} else {
  setTimeout(typeText, 800);
}

/* ─── SCROLL REVEAL (IntersectionObserver) ─── */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

/* ─── STATS COUNTER ANIMATION ─── */
const statNums = document.querySelectorAll('.stat-num');
let statsAnimated = false;

function animateStats() {
  if (statsAnimated) return;
  const statsBar = document.querySelector('.stats-bar');
  if (!statsBar) return;
  const rect = statsBar.getBoundingClientRect();
  if (rect.top < window.innerHeight - 50) {
    statsAnimated = true;
    statNums.forEach(el => {
      const target = +el.getAttribute('data-target');
      if (reduceMotion) { el.textContent = target; return; }
      const duration = 1200;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current);
      }, 16);
    });
  }
}
animateStats();

/* ─── PROJECT FILTER ─── */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    const filter = btn.getAttribute('data-filter');
    projectCards.forEach(card => {
      const cats = card.getAttribute('data-category') || '';
      if (filter === 'all' || cats.includes(filter)) {
        card.classList.remove('hidden');
        card.style.animation = 'fadeInUp 0.4s ease forwards';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ─── CONTACT FORM ───
   GitHub Pages is static, so the form composes an email in the visitor's
   mail app (mailto:) with the fields pre-filled. */
const form = document.getElementById('contactForm');
const successMsg = document.getElementById('formSuccess');
const CONTACT_EMAIL = 'tekiprakash1@gmail.com';

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const subject = data.get('subject') || 'Hello from your portfolio';
    const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    successMsg.classList.add('show');
    setTimeout(() => successMsg.classList.remove('show'), 8000);
  });
}

/* ─── SMOOTH SCROLL for anchor links ─── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─── PROFILE IMAGE FALLBACK (only if the photo fails to load) ─── */
const profileImg = document.querySelector('.profile-img');
const profileFallback = document.querySelector('.profile-fallback');
if (profileImg && profileFallback) {
  const showFallback = () => {
    profileImg.style.display = 'none';
    profileFallback.style.display = 'flex';
  };
  profileImg.addEventListener('error', showFallback);
  if (profileImg.complete && profileImg.naturalWidth === 0) showFallback();
}

/* ─── FOOTER YEAR ─── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─── FADE-IN ANIMATION CSS KEYFRAME (injected) ─── */
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleSheet);
