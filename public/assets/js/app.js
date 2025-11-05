const supportedLanguages = ['pt', 'en', 'es'];
const languageStorageKey = 'evorise-language';
const themeStorageKey = 'evorise-theme';
const translationCache = new Map();

const htmlEl = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const languageButtons = Array.from(document.querySelectorAll('.lang-btn'));

const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

function setTheme(theme) {
  const normalized = theme === 'light' ? 'light' : 'dark';
  htmlEl.setAttribute('data-theme', normalized);
  htmlEl.setAttribute('data-mode', normalized);
  localStorage.setItem(themeStorageKey, normalized);
  updateThemeToggle(normalized);
}

function updateThemeToggle(theme) {
  if (!themeToggle) return;
  const icon = theme === 'light' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  themeToggle.querySelector('.icon').textContent = icon;
}

function applyStoredTheme() {
  const stored = localStorage.getItem(themeStorageKey);
  setTheme(stored || (prefersDark() ? 'dark' : 'light'));
}

async function loadTranslations(lang) {
  if (!supportedLanguages.includes(lang)) {
    lang = 'pt';
  }
  if (translationCache.has(lang)) {
    return translationCache.get(lang);
  }
  const response = await fetch(`/locales/${lang}.json`);
  if (!response.ok) {
    throw new Error(`Unable to load locale ${lang}`);
  }
  const data = await response.json();
  translationCache.set(lang, data);
  return data;
}

function setActiveLanguageButton(lang) {
  languageButtons.forEach((btn) => {
    const pressed = btn.dataset.lang === lang;
    btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  });
}

function applyText(node, value) {
  if (typeof value === 'string') {
    node.textContent = value;
  }
}

function renderCardGrid(element, items) {
  element.innerHTML = '';
  if (!Array.isArray(items)) return;

  if (element.classList.contains('grid--benefits')) {
    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'card';
      const title = document.createElement('h3');
      title.className = 'card__title';
      title.textContent = item.title;
      const body = document.createElement('p');
      body.className = 'card__body';
      body.textContent = item.description;
      card.append(title, body);
      element.append(card);
    });
    return;
  }

  if (element.classList.contains('carousel__track')) {
    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'carousel-card';
      const title = document.createElement('strong');
      title.textContent = item.title;
      const body = document.createElement('p');
      body.textContent = item.description;
      card.append(title, body);
      element.append(card);
    });
    return;
  }
}

function renderList(element, items) {
  element.innerHTML = '';
  if (!Array.isArray(items)) return;

  if (element.classList.contains('metric__list')) {
    items.forEach((value) => {
      const li = document.createElement('li');
      li.textContent = value;
      element.append(li);
    });
    return;
  }

  if (element.classList.contains('grid--highlights')) {
    items.forEach((value) => {
      const div = document.createElement('div');
      div.className = 'highlight-item';
      div.textContent = value;
      element.append(div);
    });
    return;
  }

  if (element.classList.contains('blueprint__body')) {
    items.forEach((value) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = value;
      element.append(paragraph);
    });
    return;
  }

  items.forEach((value) => {
    const span = document.createElement('span');
    span.textContent = value;
    element.append(span);
  });
}

function applyTranslations(dictionary) {
  const { meta = {} } = dictionary;
  if (meta.title) {
    document.title = meta.title;
  }
  if (meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', meta.description);
    }
  }

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    const value = key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), dictionary);
    if (typeof value === 'string') {
      applyText(node, value);
    }
  });

  document.querySelectorAll('[data-i18n-list]').forEach((node) => {
    const key = node.dataset.i18nList;
    const value = key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), dictionary);
    if (Array.isArray(value)) {
      renderList(node, value);
    }
  });

  document.querySelectorAll('[data-i18n-cards]').forEach((node) => {
    const key = node.dataset.i18nCards;
    const value = key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), dictionary);
    if (Array.isArray(value)) {
      renderCardGrid(node, value);
    }
  });

  initialiseCarousel();
}

function smoothScrollTo(targetId) {
  const target = document.querySelector(targetId);
  if (!target) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
}

function initialiseNavLinks() {
  document.querySelectorAll('[data-scroll]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      event.preventDefault();
      smoothScrollTo(href);
    });
  });
}

let carouselState = { index: 0, resizeHandler: null };

function initialiseCarousel() {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;
  const track = carousel.querySelector('.carousel__track');
  const prevOriginal = carousel.querySelector('[data-carousel-prev]');
  const nextOriginal = carousel.querySelector('[data-carousel-next]');
  const prev = prevOriginal.cloneNode(true);
  const next = nextOriginal.cloneNode(true);
  prevOriginal.replaceWith(prev);
  nextOriginal.replaceWith(next);
  const cards = Array.from(track.children);
  if (!cards.length) {
    track.style.transform = 'translateX(0)';
    return;
  }

  carouselState = { index: Math.min(carouselState.index, Math.max(cards.length - 1, 0)) };

  function update() {
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '0');
    const cardWidth = cards[0].offsetWidth;
    const offset = (cardWidth + gap) * carouselState.index;
    track.style.transform = `translateX(${-offset}px)`;
    prev.disabled = carouselState.index === 0;
    next.disabled = carouselState.index === cards.length - 1;
  }

  prev.addEventListener('click', () => {
    carouselState.index = Math.max(0, carouselState.index - 1);
    update();
  });

  next.addEventListener('click', () => {
    carouselState.index = Math.min(cards.length - 1, carouselState.index + 1);
    update();
  });

  if (carouselState.resizeHandler) {
    window.removeEventListener('resize', carouselState.resizeHandler);
  }
  carouselState.resizeHandler = () => requestAnimationFrame(update);
  window.addEventListener('resize', carouselState.resizeHandler);

  update();
}

function observeSections() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('[data-observe]').forEach((node) => observer.observe(node));
}

function applyLanguage(lang) {
  localStorage.setItem(languageStorageKey, lang);
  htmlEl.setAttribute('lang', lang);
  htmlEl.dataset.lang = lang;
  setActiveLanguageButton(lang);
  loadTranslations(lang)
    .then((dict) => applyTranslations(dict))
    .catch((error) => console.error(error));
}

function initialiseLanguage() {
  let lang = localStorage.getItem(languageStorageKey);
  if (!lang || !supportedLanguages.includes(lang)) {
    lang = 'pt';
  }
  applyLanguage(lang);
}

function bindLanguageButtons() {
  languageButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang) {
        applyLanguage(lang);
      }
    });
  });
}

function initialiseTheme() {
  applyStoredTheme();
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
}

function initialisePage() {
  observeSections();
  initialiseNavLinks();
  bindLanguageButtons();
  initialiseTheme();
  initialiseLanguage();
}

window.addEventListener('DOMContentLoaded', initialisePage);
