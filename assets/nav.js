/* nav.js — injects shared header + footer toggle, i18n, dropdowns, hamburger */
(function () {
  'use strict';

  /* ── 1. i18n dictionaries ───────────────────────────────────────────── */
  const DICTS = { de: window.I18N_DE, en: window.I18N_EN, es: window.I18N_ES };

  /* ── 2. State helpers ───────────────────────────────────────────────── */
  const PREFIX = 'mz_';
  function persist(key, val) { try { localStorage.setItem(PREFIX + key, val); } catch {} }
  function recall(key, fallback) { try { return localStorage.getItem(PREFIX + key) ?? fallback; } catch { return fallback; } }

  /* ── 3. Language + mode ─────────────────────────────────────────────── */
  const lang = recall('lang', 'de');
  const mode = recall('mode', 'regular');

  /* ── 4. Translation helpers ─────────────────────────────────────────── */
  const dict = DICTS[lang] || DICTS['de'];

  function t(key) {
    if (mode === 'stupid' && dict[key + '.stupid'] !== undefined) return dict[key + '.stupid'];
    return dict[key] ?? key;
  }

  function applyTranslations(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(function (el) {
      const val = t(el.dataset.i18n);
      if (val) el.innerHTML = val;
    });
    (root || document).querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const val = t(el.dataset.i18nPlaceholder);
      if (val) el.placeholder = val;
    });
  }

  /* ── 5. Determine asset root (pages in /en/ or /es/ need '../') ──────── */
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const isSubdir = /\/(en|es)\//.test(path) || /\/(en|es)$/.test(path);
  const root = isSubdir ? '../' : '';

  /* ── 6. Build & inject header HTML ─────────────────────────────────── */
  function buildHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    header.innerHTML = [
      '<div class="site-title">',
      '  <a href="' + root + 'index.html">Mart\u00EDn Zamorano</a>',
      '  <span class="subtitle" data-i18n="site.subtitle"></span>',
      '</div>',

      '<button class="nav-hamburger" aria-label="Menu" aria-expanded="false">',
      '  <span></span><span></span><span></span>',
      '</button>',

      '<nav class="main-nav">',
      '  <ul>',
      '    <li><a href="' + root + 'vita.html" data-i18n="nav.vita"></a></li>',

      '    <li class="has-dropdown">',
      '      <button class="nav-dropdown-toggle" aria-expanded="false" data-i18n="nav.music"></button>',
      '      <ul class="nav-dropdown">',
      '        <li><a href="' + root + 'musik.html" data-i18n="nav.piano"></a></li>',
      '        <li><a href="' + root + 'improvisation.html" data-i18n="nav.improvisation"></a></li>',
      '        <li><a href="' + root + 'zamoranoandstamer.html" data-i18n="nav.zamorano"></a></li>',
      '      </ul>',
      '    </li>',

      '    <li class="has-dropdown">',
      '      <button class="nav-dropdown-toggle" aria-expanded="false" data-i18n="nav.projects"></button>',
      '      <ul class="nav-dropdown">',
      '        <li><a href="' + root + 'healing.html" data-i18n="nav.healing"></a></li>',
      '        <li><a href="' + root + 'musiktheorie.html" data-i18n="nav.musiktheorie"></a></li>',
      '        <li><a href="' + root + 'transcriptions.html" data-i18n="nav.transcriptions"></a></li>',
      '        <li><a href="' + root + 'mental-pocus-records.html" data-i18n="nav.mpr"></a></li>',
      '      </ul>',
      '    </li>',

      '    <li><a href="' + root + 'shows.html" data-i18n="nav.shows"></a></li>',
      '    <li><a href="' + root + 'kontakt.html" data-i18n="nav.kontakt"></a></li>',

      '    <li data-nav-mode="fun"><a href="' + root + 'labyrinth.html" data-i18n="nav.labyrinth"></a></li>',
      '    <li data-nav-mode="fun"><a href="' + root + 'slap.html" data-i18n="nav.slap"></a></li>',
      '  </ul>',
      '</nav>',

      '<div class="lang-switcher">',
      '  <a data-lang="de">DE</a>',
      '  <a data-lang="en">EN</a>',
      '  <a data-lang="es">ES</a>',
      '</div>',
    ].join('\n');

    applyTranslations(header);
  }

  /* ── 7. Stupid-mode body class ──────────────────────────────────────── */
  function applyMode() {
    document.body.classList.toggle('stupid-mode', mode === 'stupid');
  }

  /* ── 8. Lang switcher ───────────────────────────────────────────────── */
  function wireLangSwitcher() {
    document.querySelectorAll('.lang-switcher a[data-lang]').forEach(function (a) {
      const l = a.dataset.lang;
      a.classList.toggle('active', l === lang);
      a.style.cursor = 'pointer';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (l !== lang) { persist('lang', l); location.reload(); }
      });
    });
  }

  /* ── 9. Active nav link ─────────────────────────────────────────────── */
  function markActiveLink() {
    const filename = path.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(function (a) {
      const href = a.getAttribute('href') || '';
      const hfile = href.split('/').pop();
      if (hfile && hfile === filename) a.classList.add('active');
    });
    // Mark parent dropdown button active if a child is active
    document.querySelectorAll('.has-dropdown').forEach(function (li) {
      if (li.querySelector('a.active')) {
        li.querySelector('.nav-dropdown-toggle').classList.add('active');
      }
    });
  }

  /* ── 10. Dropdown toggles (click to open/close) ─────────────────────── */
  function wireDropdowns() {
    document.querySelectorAll('.nav-dropdown-toggle').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const li = btn.closest('.has-dropdown');
        const isOpen = li.classList.contains('open');
        // Close all others first
        document.querySelectorAll('.has-dropdown.open').forEach(function (el) {
          el.classList.remove('open');
          el.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          li.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
    // Click outside closes all dropdowns
    document.addEventListener('click', function () {
      document.querySelectorAll('.has-dropdown.open').forEach(function (el) {
        el.classList.remove('open');
        el.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── 11. Hamburger (mobile) ─────────────────────────────────────────── */
  function wireHamburger() {
    const btn = document.querySelector('.nav-hamburger');
    const nav = document.querySelector('.main-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = nav.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      btn.classList.toggle('is-open', isOpen);
    });
    // Clicking outside closes the mobile menu
    document.addEventListener('click', function () {
      nav.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('is-open');
    });
    nav.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  /* ── 12. Mode toggle in footer ──────────────────────────────────────── */
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

  /* ── 13. Fun-mode nav visibility + page guard ───────────────────────── */
  // kontakt.html is NOT a fun-only page — it's always accessible
  const FUN_PAGES = ['labyrinth.html', 'slap.html'];

  function applyFunNavVisibility() {
    document.querySelectorAll('.main-nav li[data-nav-mode="fun"]').forEach(function (li) {
      li.style.display = mode === 'stupid' ? '' : 'none';
    });
  }

  function guardFunPage() {
    if (mode === 'stupid') return;
    const filename = path.split('/').pop() || 'index.html';
    if (FUN_PAGES.some(function (p) { return filename === p; })) {
      window.location.replace(root + 'index.html');
    }
  }

  /* ── Run ────────────────────────────────────────────────────────────── */
  buildHeader();
  applyMode();
  applyTranslations();   // page body translations
  buildModeToggle();
  wireLangSwitcher();
  markActiveLink();
  wireDropdowns();
  wireHamburger();
  applyFunNavVisibility();
  guardFunPage();

})();
