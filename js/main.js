// =========================================
// MonPortfolio - Main JavaScript
// Author: Stephane RODRIGO
// =========================================

// --- Theme toggle ---
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  themeToggle.setAttribute(
    'aria-label',
    theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'
  );
}

const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
applyTheme(savedTheme || systemTheme);

themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem('theme', next);
});

// --- Hamburger menu ---
const toggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
const navLinksPlaceholder = document.createComment('nav-links-placeholder');
const mainContent = document.querySelector('main');
const siteFooter = document.querySelector('footer');

function getFocusableNavItems() {
  return Array.from(navLinks.querySelectorAll('a'));
}

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  const focusable = getFocusableNavItems();
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

function openMenu() {
  // Move navLinks to body to escape backdrop-filter stacking context of header
  navLinks.parentNode.insertBefore(navLinksPlaceholder, navLinks);
  document.body.appendChild(navLinks);
  navLinks.classList.add('is-open');
  toggle.classList.add('is-active');
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Fermer le menu');
  // Focus trap : rendre le contenu principal inerte et confiner Tab dans le menu
  mainContent.inert = true;
  siteFooter.inert = true;
  navLinks.addEventListener('keydown', trapFocus);
  // Déplacer le focus sur le premier lien du menu
  const focusable = getFocusableNavItems();
  if (focusable.length) focusable[0].focus();
}

function closeMenu() {
  navLinks.classList.remove('is-open');
  toggle.classList.remove('is-active');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Ouvrir le menu');
  // Restituer l'interactivité du contenu principal
  mainContent.inert = false;
  siteFooter.inert = false;
  navLinks.removeEventListener('keydown', trapFocus);
  // Restore navLinks to its original position in the header
  navLinksPlaceholder.parentNode.insertBefore(navLinks, navLinksPlaceholder);
  navLinksPlaceholder.parentNode.removeChild(navLinksPlaceholder);
}

toggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.contains('is-open');
  if (isOpen) {
    closeMenu();
    toggle.focus();
  } else {
    openMenu();
  }
});

// Close menu when a nav link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close menu on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
    closeMenu();
    toggle.focus();
  }
});

// --- Projects: load from data/projects.json ---
function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function isSafeUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function createProjectCard(project) {
  const li = document.createElement('li');
  li.className = 'project-card';

  const banner = document.createElement('div');
  banner.className = 'project-card__banner';

  const body = document.createElement('div');
  body.className = 'project-card__body';

  // Validate URL once
  const safeUrl = isSafeUrl(project.url) ? project.url : null;

  // Title + link
  const h3 = document.createElement('h3');
  h3.className = 'project-card__title';
  const titleLink = safeUrl ? document.createElement('a') : document.createElement('span');
  titleLink.textContent = project.name;
  if (safeUrl) {
    titleLink.href = safeUrl;
    titleLink.target = '_blank';
    titleLink.rel = 'noopener noreferrer';
    titleLink.setAttribute('aria-label', `${project.name} (s'ouvre dans un nouvel onglet)`);
  }
  h3.appendChild(titleLink);

  // Description
  const desc = document.createElement('p');
  desc.className = 'project-card__desc';
  desc.textContent = project.description || 'Pas de description disponible.';

  // Date
  const dateEl = project.lastUpdated ? document.createElement('p') : null;
  if (dateEl) {
    dateEl.className = 'project-card__date';
    const timeEl = document.createElement('time');
    timeEl.setAttribute('datetime', project.lastUpdated);
    timeEl.textContent = `Mis à jour le ${formatDate(project.lastUpdated)}`;
    dateEl.appendChild(timeEl);
  }

  // Tags
  const ul = document.createElement('ul');
  ul.className = 'project-card__tags';
  if (project.languages.length > 0) {
    project.languages.forEach(lang => {
      const tag = document.createElement('li');
      tag.className = 'project-card__tag';
      tag.textContent = lang;
      ul.appendChild(tag);
    });
  }

  // GitHub link
  const githubLink = document.createElement('a');
  githubLink.className = 'project-card__link';
  githubLink.textContent = 'Voir sur GitHub';
  if (safeUrl) {
    githubLink.href = safeUrl;
    githubLink.target = '_blank';
    githubLink.rel = 'noopener noreferrer';
  }
  githubLink.setAttribute('aria-label', `Voir ${project.name} sur GitHub (s'ouvre dans un nouvel onglet)`);

  body.appendChild(h3);
  body.appendChild(desc);
  if (dateEl) body.appendChild(dateEl);
  body.appendChild(ul);
  body.appendChild(githubLink);
  li.appendChild(banner);
  li.appendChild(body);

  return li;
}

const projectGrid = document.getElementById('project-grid');

fetch('data/projects.json')
  .then(res => {
    if (!res.ok) throw new Error('Réponse réseau invalide');
    return res.json();
  })
  .then(projects => {
    projectGrid.replaceChildren(...projects.map(createProjectCard));
    projectGrid.setAttribute('aria-busy', 'false');
  })
  .catch(() => {
    const errorItem = document.createElement('li');
    errorItem.className = 'project-card__error';
    errorItem.setAttribute('role', 'alert');
    errorItem.textContent = 'Impossible de charger les projets.';
    projectGrid.replaceChildren(errorItem);
    projectGrid.setAttribute('aria-busy', 'false');
  });

// --- Form validation & submission ---
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xqeyvkkv';

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fieldCache = {};

function getFieldEls(fieldId) {
  if (!fieldCache[fieldId]) {
    fieldCache[fieldId] = {
      field: document.getElementById(fieldId),
      errorEl: document.getElementById(`${fieldId}-error`),
    };
  }
  return fieldCache[fieldId];
}

function setFieldError(fieldId, message) {
  const { field, errorEl } = getFieldEls(fieldId);
  field.setAttribute('aria-invalid', 'true');
  errorEl.textContent = message;
}

function clearFieldError(fieldId) {
  const { field, errorEl } = getFieldEls(fieldId);
  field.setAttribute('aria-invalid', 'false');
  errorEl.textContent = '';
}

function validateField(fieldId) {
  clearFieldError(fieldId);
  const val = getFieldEls(fieldId).field.value.trim();

  if (fieldId === 'name') {
    if (!val) { setFieldError('name', 'Le nom est obligatoire.'); return false; }
  } else if (fieldId === 'email') {
    if (!val) { setFieldError('email', "L'adresse email est obligatoire."); return false; }
    if (!emailPattern.test(val)) { setFieldError('email', 'Veuillez saisir une adresse email valide.'); return false; }
  } else if (fieldId === 'message') {
    if (!val) { setFieldError('message', 'Le message est obligatoire.'); return false; }
  }
  return true;
}

function validateForm() {
  return ['name', 'email', 'message'].map(validateField).every(Boolean);
}

if (contactForm) {
  // Blur validation: feedback immédiat quand l'utilisateur quitte un champ
  ['name', 'email', 'message'].forEach(id => {
    document.getElementById(id).addEventListener('blur', () => validateField(id));
  });

  const submitBtn = contactForm.querySelector('.contact-form__submit');

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    formStatus.textContent = '';

    if (!validateForm()) {
      // Déplacer le focus sur le premier champ invalide
      const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    try {
      const fd = new FormData(contactForm);
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: fd.get('name').trim(),
          email: fd.get('email').trim(),
          message: fd.get('message').trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        formStatus.textContent = 'Message envoyé avec succès. Merci !';
        contactForm.reset();
        ['name', 'email', 'message'].forEach(id => clearFieldError(id));
      } else {
        formStatus.textContent = data?.errors?.[0]?.message ?? 'Une erreur est survenue. Veuillez réessayer.';
      }
    } catch {
      formStatus.textContent = 'Impossible d\'envoyer le message. Vérifiez votre connexion et réessayez.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer';
    }
  });
}

// --- Fade-in on scroll (Intersection Observer) ---
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sections = document.querySelectorAll('main > section, footer');

if (!prefersReducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => {
    section.classList.add('fade-in');
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      section.classList.add('is-visible');
    } else {
      observer.observe(section);
    }
  });
}
