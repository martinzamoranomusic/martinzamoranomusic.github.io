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

  /* ── 3. Get current language from localStorage (for local testing) or URL path (for production) ───── */
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const langMatch = path.match(/^\/(en|es)(\/.*)?$/);
  const urlLang = langMatch ? langMatch[1] : 'de';
  
  // For local file:// testing, use localStorage; for production, use URL
  const isFileProtocol = window.location.protocol === 'file:';
  const lang = isFileProtocol ? recall('lang', 'de') : urlLang;
  
  // Keep in sync with storage
  persist('lang', lang);

  const mode = recall('mode', 'regular');

  /* ── 4. Translate the page ──────────────────────────────────────────── */
  const dict = DICTS[lang] || DICTS['de'];

  function t(key) {
    // Stupid-mode variant first, then normal key
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
      // Use innerHTML for keys that contain markup (strong, em, a, kbd…)
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
  document.querySelectorAll('.lang-switcher a[data-lang]').forEach(function (a) {
    const l = a.dataset.lang;
    
    a.classList.toggle('active', l === lang);
    
    // Make all language links work via localStorage + reload (like stupid mode toggle)
    a.style.cursor = 'pointer';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (l !== lang) {  // Only reload if actually changing language
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

  /* ── 8. Mode toggle button ──────────────────────────────────────────── */
  function buildModeToggle() {
    const header = document.querySelector('header');
    if (!header || header.querySelector('.mode-toggle')) return;

    const btn = document.createElement('button');
    btn.className = 'mode-toggle';
    btn.setAttribute('aria-pressed', mode === 'stupid' ? 'true' : 'false');
    btn.innerHTML = t('site.mode.toggle') || '🎭 Stupid Mode';
    if (mode === 'stupid') btn.classList.add('active');

    btn.addEventListener('click', function () {
      const next = recall('mode', 'regular') === 'stupid' ? 'regular' : 'stupid';
      persist('mode', next);
      // Reload so every data-i18n element re-renders cleanly
      location.reload();
    });

    header.appendChild(btn);
  }

  /* ── 9. Inject nav translation keys (nav text from dict) ────────────── */
  // The nav links already have data-i18n attributes in the HTML,
  // so applyTranslations() handles them automatically.

  /* ── Run ─────────────────────────────────────────────────── */
  applyMode();
  applyTranslations();
  buildModeToggle();

})();
