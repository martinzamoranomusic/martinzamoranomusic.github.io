/* nav.js — shared navigation + i18n + mode logic */
(function () {
  'use strict';

  /* ── 1. Load i18n dictionaries (already in window via <script> tags) ── */
  const DICTS = { de: window.I18N_DE, en: window.I18N_EN, es: window.I18N_ES };

  /* ── 2. State helpers ───────────────────────────────────────────────── */
  const PREFIX = 'mz_';
  function persist(key, val) {
    try { localStorage.setItem(PREFIX + key, val); } catch {}
  }
  function recall(key, fallback) {
    try { return localStorage.getItem(PREFIX + key) ?? fallback; } catch { return fallback; }
  }

  /* ── 3. Language + mode — always from localStorage ─────────────────── */
  const lang = recall('lang', 'de');
  const mode = recall('mode', 'regular');

  /* ── 4. Translate the page ──────────────────────────────────────────── */
  const dict = DICTS[lang] || DICTS['de'];

  function t(key) {
    if (mode === 'stupid' && dict[key + '.stupid'] !== undefined) {
      return dict[key + '.stupid'];
    }
    return dict[key] ?? '';
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.dataset.i18n;
      const val = t(key);
      if (!val) return;
      el.innerHTML = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const key = el.dataset.i18nPlaceholder;
      const val = t(key);
      if (val) el.placeholder = val;
    });
  }

  /* ── 5. Stupid-mode body class ──────────────────────────────────────── */
  function applyMode() {
    document.body.classList.toggle('stupid-mode', mode === 'stupid');
  }

  /* ── 6. Wire lang switcher ──────────────────────────────────────────── */
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  document.querySelectorAll('.lang-switcher a[data-lang]').forEach(function (a) {
    const l = a.dataset.lang;
    a.classList.toggle('active', l === lang);
    a.style.cursor = 'pointer';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (l !== lang) {
        persist('lang', l);
        location.reload();
      }
    });
  });

  /* ── 7. Active nav link ─────────────────────────────────────────────── */
  document.querySelectorAll('.main-nav a').forEach(function (a) {
    const href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
    if (href === path || (href !== '/' && path.endsWith(href))) {
      a.classList.add('active');
    }
  });

  /* ── 8. Mode toggle — injected into footer ──────────────────────────── */
  function buildModeToggle() {
    const footer = document.querySelector('footer');
    if (!footer || footer.querySelector('.mode-toggle')) return;

    const btn = document.createElement('button');
    btn.className = 'mode-toggle';
    btn.setAttribute('aria-pressed', mode === 'stupid' ? 'true' : 'false');
    btn.textContent = t('site.mode.toggle') || 'Join the Madness';
    if (mode === 'stupid') btn.classList.add('active');

    btn.addEventListener('click', function () {
      const next = recall('mode', 'regular') === 'stupid' ? 'regular' : 'stupid';
      persist('mode', next);
      location.reload();
    });

    footer.appendChild(btn);
  }

  /* ── 9. Fun-mode nav visibility + guard ────────────────────────────── */
  const FUN_PAGES = ['labyrinth.html', 'slap.html', 'kontakt.html'];

  function applyFunNavVisibility() {
    document.querySelectorAll('.main-nav li[data-nav-mode="fun"]').forEach(function (li) {
      li.style.display = mode === 'stupid' ? '' : 'none';
    });
  }

  function guardFunPage() {
    if (mode === 'stupid') return;
    const filename = window.location.pathname.split('/').pop() || 'index.html';
    if (FUN_PAGES.some(function (p) { return filename === p; })) {
      window.location.replace('index.html');
    }
  }

  /* ── Run ─────────────────────────────────────────────────── */
  applyMode();
  applyTranslations();
  buildModeToggle();
  applyFunNavVisibility();
  guardFunPage();

})();
