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

    // In madness-mode, kontakt goes through the bodyguard gate,
    // and shows goes through the labyrinth gate.
    const kontaktHref = root + (mode === 'stupid' ? 'bodyguard.html' : 'kontakt.html');
    const showsHref   = root + (mode === 'stupid' ? 'shows-gate.html' : 'shows.html');

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

      '    <li><a href="' + showsHref + '" data-i18n="nav.shows"></a></li>',
      '    <li><a href="' + kontaktHref + '" data-i18n="nav.kontakt"></a></li>',

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
    // Treat gate pages as their destination for active-link purposes
    const activeFile = filename === 'bodyguard.html'  ? 'kontakt.html'
                     : filename === 'shows-gate.html' ? 'shows.html'
                     : filename;
    document.querySelectorAll('.main-nav a').forEach(function (a) {
      const href = a.getAttribute('href') || '';
      const hfile = href.split('/').pop();
      if (hfile && hfile === activeFile) a.classList.add('active');
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
        closeAllDropdowns();
        if (!isOpen) {
          li.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Close when clicking outside — use mousedown so it doesn't race with click
    document.addEventListener('mousedown', function (e) {
      if (!e.target.closest('.has-dropdown')) {
        closeAllDropdowns();
      }
    });
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.has-dropdown.open').forEach(function (el) {
      el.classList.remove('open');
      el.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
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
    // In madness mode show the "turn off" label, otherwise the "join" label
    btn.textContent = mode === 'stupid'
      ? (dict['site.mode.toggle.off'] || 'Now seriously')
      : (dict['site.mode.toggle']     || 'Join the Madness');
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

  /* ── 14. HotFire popup (madness mode, index page only) ─────────────── */
  function showHotFirePopup() {
    const filename = path.split('/').pop() || 'index.html';
    if (mode !== 'stupid') return;
    if (filename !== 'index.html' && filename !== '') return;

    const captions = {
      de: 'Mart\u00EDn Zamorano z\u00FCndet das hei\u00DFeste Album des Jahres 1789',
      en: 'Mart\u00EDn Zamorano about to drop the hottest album of 1789',
      es: 'Mart\u00EDn Zamorano a punto de lanzar el \u00E1lbum m\u00E1s caliente del 1789',
    };
    const caption = captions[lang] || captions['en'];

    const overlay = document.createElement('div');
    overlay.id = 'hotfire-overlay';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:9999',
      'background:rgba(0,0,0,.75)',
      'display:flex', 'align-items:center', 'justify-content:center',
      'cursor:pointer',
    ].join(';');

    overlay.innerHTML = [
      '<div style="position:relative;display:inline-block;">',
      '  <img src="' + root + 'assets/images/hotFire.jpeg"',
      '       alt="Hot Fire"',
      '       style="display:block;max-width:min(88vw,480px);max-height:72vh;border-radius:4px;box-shadow:0 0 40px #ff6a00aa;" />',
      '  <p style="',
      '    position:absolute;top:0;left:0;right:0;',
      '    font-family:\'Cormorant Garamond\',serif;',
      '    font-size:clamp(.85rem,2.2vw,1.05rem);',
      '    color:#fff;',
      '    text-shadow:0 2px 8px #000,0 0 20px #ff6a00;',
      '    margin:0;padding:.5em .75em;',
      '    line-height:1.35;',
      '    text-align:center;',
      '    background:linear-gradient(to bottom,rgba(0,0,0,.6) 0%,transparent 100%);',
      '    border-radius:4px 4px 0 0;',
      '  ">' + caption + '</p>',
      '  <p style="',
      '    position:absolute;bottom:0;left:0;right:0;',
      '    color:rgba(255,255,255,.6);font-size:.75rem;',
      '    margin:0;padding:.4em;',
      '    text-align:center;',
      '    background:linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 100%);',
      '    border-radius:0 0 4px 4px;',
      '  ">click anywhere to close</p>',
      '</div>',
    ].join('');

    overlay.addEventListener('click', function () {
      document.body.removeChild(overlay);
    });

    document.body.appendChild(overlay);
  }

  /* ── 15. Fake reviews (madness mode, index page only) ───────────────── */
  function showFakeReviews() {
    const filename = path.split('/').pop() || 'index.html';
    if (mode !== 'stupid') return;
    if (filename !== 'index.html' && filename !== '') return;

    const data = {
      de: {
        title: 'Was andere sagen',
        reviews: [
          { stars: '★★★☆☆', text: 'Ich hab nur reingehört, und fand das schon ok.', author: 'Birgit — Bild-Zeitung' },
          { stars: '★★★★☆', text: 'Ich steh nicht auf Klassik, aber Zamorano kann man sich geben.', author: 'Friedrich Merz' },
          { stars: '★★★☆☆', text: 'Passt ganz gut im Hintergrund beim Wechseln der Bremsbeläge.', author: 'Rainer — Bundesagentur für Arbeit' },
          { stars: '★★☆☆☆', text: 'Hab ihn aus Versehen auf Spotify gespielt. Nicht schlecht, aber ich wollte eigentlich Rammstein.', author: 'Kevin, Bewertung auf Google Maps' },
          { stars: '★★★★★', text: 'Meine Katze hat aufgehört, die Pflanzen zu fressen. Ich weiß nicht ob das daran liegt.', author: 'Hannelore, Hamburg-Bergedorf' },
          { stars: '★★★☆☆', text: 'Klingt wie Musik. Definitiv Musik.', author: 'Hans-Dieter, ehemaliger Finanzbeamter' },
          { stars: '★★★★☆', text: 'Ich hab meiner Mutter das geschickt. Sie hat nicht geantwortet. Aber sie hat auch sonst nie geantwortet.', author: 'Torsten, WhatsApp-Gruppenleiter' },
          { stars: '★☆☆☆☆', text: 'Ich dachte, das wäre ein Podcast über Steuern. War es nicht. Trotzdem okay.', author: 'Siegfried, Steuerberater i.R.' },
          { stars: '★★★★☆', text: 'Hab beim Zuhören aus Versehen ein Gemälde gekauft. Keine Ahnung wie das passiert ist.', author: 'Gudrun, Kunstmesse Hamburg' },
          { stars: '★★★☆☆', text: 'Mein Arzt sagt, ich soll mich entspannen. Das hier zählt glaube ich nicht, aber es hat auch nicht geschadet.', author: 'Bernd, Krankenkassenmitglied' },
          { stars: '★★★★★', text: 'Ich hab den Link an meinen Ex geschickt. Er hat zurückgeschrieben. Danke, Martín.', author: 'Sabrina, wieder glücklich vergeben' },
          { stars: '★★☆☆☆', text: 'Die Musik ist gut, aber die Website hat mich verwirrt. Wo ist der Warenkorb?', author: 'Manfred, Online-Shopper' },
          { stars: '★★★☆☆', text: 'Hab ihn auf einer Hochzeit gehört. Die Ehe hat gehalten. Zufall? Vielleicht.', author: 'Elfriede, Standesamt Altona' },
          { stars: '★★★★☆', text: 'Sehr schön. Hab dabei geweint, aber ich weine auch bei IKEA-Werbung.', author: 'Jürgen, emotional offen seit 2019' },
          { stars: '★★★☆☆', text: 'Ich versteh die Noten nicht, aber die Töne klingen nett.', author: 'Waltraud, Rentnerin aus Pinneberg' },
        ],
      },
      en: {
        title: 'What people are saying',
        reviews: [
          { stars: '★★★☆☆', text: 'I only listened for a bit, and it was actually fine.', author: 'Birgit — Bild-Zeitung' },
          { stars: '★★★★☆', text: 'Not really into classical, but Zamorano is alright.', author: 'Friedrich Merz' },
          { stars: '★★★☆☆', text: 'Works quite well in the background while changing brake pads.', author: 'Rainer — Federal Employment Agency' },
          { stars: '★★☆☆☆', text: 'Accidentally played it on Spotify. Not bad, but I wanted Rammstein.', author: 'Kevin, Google Maps review' },
          { stars: '★★★★★', text: 'My cat stopped eating my plants. Not sure if that\'s related.', author: 'Hannelore, Hamburg-Bergedorf' },
          { stars: '★★★☆☆', text: 'Sounds like music. Definitely music.', author: 'Hans-Dieter, retired tax officer' },
          { stars: '★★★★☆', text: 'I sent it to my mum. She didn\'t reply. But she never replies anyway.', author: 'Torsten, WhatsApp group admin' },
          { stars: '★☆☆☆☆', text: 'I thought this was a podcast about tax returns. It wasn\'t. Still fine.', author: 'Siegfried, retired accountant' },
          { stars: '★★★★☆', text: 'I accidentally bought a painting while listening. No idea how that happened.', author: 'Gudrun, Hamburg Art Fair' },
          { stars: '★★★☆☆', text: 'My doctor says I need to relax. This probably doesn\'t count, but it didn\'t hurt either.', author: 'Bernd, health insurance member' },
          { stars: '★★★★★', text: 'I sent the link to my ex. He texted back. Thank you, Martín.', author: 'Sabrina, happily taken again' },
          { stars: '★★☆☆☆', text: 'The music is good but the website confused me. Where\'s the checkout button?', author: 'Manfred, online shopper' },
          { stars: '★★★☆☆', text: 'Heard him at a wedding. The marriage lasted. Coincidence? Maybe.', author: 'Elfriede, Registry Office Altona' },
          { stars: '★★★★☆', text: 'Very beautiful. I cried, but I also cry at IKEA commercials.', author: 'Jürgen, emotionally open since 2019' },
          { stars: '★★★☆☆', text: 'I don\'t understand the notes, but the sounds are nice.', author: 'Waltraud, retiree from Pinneberg' },
        ],
      },
      es: {
        title: 'Lo que dicen por ahí',
        reviews: [
          { stars: '★★★☆☆', text: 'Solo escuché un momento y la verdad es que no estuvo mal.', author: 'Birgit — Bild-Zeitung' },
          { stars: '★★★★☆', text: 'No soy muy de clásica, pero Zamorano se puede escuchar.', author: 'Friedrich Merz' },
          { stars: '★★★☆☆', text: 'Va muy bien de fondo mientras cambias las pastillas de freno.', author: 'Rainer — Agencia Federal de Empleo' },
          { stars: '★★☆☆☆', text: 'Lo puse sin querer en Spotify. No está mal, pero quería Rammstein.', author: 'Kevin, reseña en Google Maps' },
          { stars: '★★★★★', text: 'Mi gato dejó de comerse las plantas. No sé si tiene algo que ver.', author: 'Hannelore, Hamburgo-Bergedorf' },
          { stars: '★★★☆☆', text: 'Suena a música. Definitivamente música.', author: 'Hans-Dieter, ex funcionario de Hacienda' },
          { stars: '★★★★☆', text: 'Se lo mandé a mi madre. No contestó. Pero tampoco contesta nunca.', author: 'Torsten, administrador de grupo de WhatsApp' },
          { stars: '★☆☆☆☆', text: 'Pensé que era un podcast sobre la declaración de la renta. No lo era. Pero bueno.', author: 'Siegfried, asesor fiscal jubilado' },
          { stars: '★★★★☆', text: 'Compré un cuadro sin querer mientras escuchaba. No sé muy bien cómo pasó.', author: 'Gudrun, Feria de Arte de Hamburgo' },
          { stars: '★★★☆☆', text: 'Mi médico dice que me relaje. Esto probablemente no cuenta, pero tampoco ha hecho daño.', author: 'Bernd, asegurado sanitario' },
          { stars: '★★★★★', text: 'Le mandé el enlace a mi ex. Me escribió. Gracias, Martín.', author: 'Sabrina, felizmente comprometida de nuevo' },
          { stars: '★★☆☆☆', text: 'La música está bien, pero la web me confundió. ¿Dónde está el carrito?', author: 'Manfred, comprador online' },
          { stars: '★★★☆☆', text: 'Lo escuché en una boda. El matrimonio aguantó. ¿Casualidad? Quizás.', author: 'Elfriede, Registro Civil de Altona' },
          { stars: '★★★★☆', text: 'Muy bonito. Lloré, pero también lloro con los anuncios de IKEA.', author: 'Jürgen, emocionalmente abierto desde 2019' },
          { stars: '★★★☆☆', text: 'No entiendo las notas, pero los sonidos son agradables.', author: 'Waltraud, jubilada de Pinneberg' },
        ],
      },
    };

    const content = data[lang] || data['de'];

    // Fisher-Yates shuffle, then take first 6
    const pool = content.reviews.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    const picked = pool.slice(0, 6);

    const section = document.createElement('section');
    section.className = 'fake-reviews';

    const cards = picked.map(function (r) {
      return '<div class="fake-review-card">'
        + '<p class="fake-review-stars">' + r.stars + '</p>'
        + '<p class="fake-review-text">\u201C' + r.text + '\u201D</p>'
        + '<p class="fake-review-author">— ' + r.author + '</p>'
        + '</div>';
    }).join('');

    section.innerHTML = '<h2>' + content.title + '</h2>'
      + '<div class="fake-reviews-grid">' + cards + '</div>';

    const mainEl = document.querySelector('main.page-content');
    if (mainEl) mainEl.appendChild(section);
  }

  /* ── 16. Vita team section (madness mode, vita page only) ───────────── */
  function showVitaTeamSection() {
    const filename = path.split('/').pop() || 'index.html';
    if (mode !== 'stupid') return;
    if (filename !== 'vita.html') return;

    // Hide the regular photo gallery
    const gallery = document.getElementById('vita-gallery');
    if (gallery) gallery.style.display = 'none';

    const members = [
      { img: 'assets/images/465449436_9404329929594584_3540499126917132473_n.jpg',     role: t('vita.team.member1.role'), bio: t('vita.team.member1.bio') },
      { img: 'assets/images/Kuenstlerfoto_1_-3-.JPG',     role: t('vita.team.member2.role'), bio: t('vita.team.member2.bio') },
      { img: 'assets/images/Martin_sel_-_9_of_21.jpg',                                 role: t('vita.team.member3.role'), bio: t('vita.team.member3.bio') },
      { img: 'assets/images/IMG_3796.jpg',                               role: t('vita.team.member4.role'), bio: t('vita.team.member4.bio') },
      { img: 'assets/images/IMG_3701.jpg',                           role: t('vita.team.member5.role'), bio: t('vita.team.member5.bio') },
      { img: 'assets/images/IMG_3769.jpg',                                             role: t('vita.team.member6.role'), bio: t('vita.team.member6.bio') },
      { img: 'assets/images/IMG_4000.jpg',                                             role: t('vita.team.member7.role'), bio: t('vita.team.member7.bio') },
    ];

    const cards = members.map(function (m) {
      return '<div class="team-card">'
        + '<img src="' + root + m.img + '" alt="' + m.role + '" />'
        + '<p class="team-card-role">' + m.role + '</p>'
        + '<p class="team-card-bio">' + m.bio + '</p>'
        + '</div>';
    }).join('');

    const section = document.getElementById('vita-team-section');
    if (section) {
      section.innerHTML = '<h2>' + t('vita.team.h2') + '</h2>'
        + '<div class="team-grid">' + cards + '</div>';
    }
  }

  /* ── 17. Pigeon minigame (madness mode, kontakt page only) ──────────── */
  function initPigeonGame() {
    const filename = path.split('/').pop() || 'index.html';
    if (mode !== 'stupid') return;
    if (filename !== 'kontakt.html') return;

    const arena      = document.getElementById('pigeon-arena');
    const submitBtn  = document.getElementById('kontakt-submit');
    const instruction= document.getElementById('pigeon-instruction');
    const field      = document.getElementById('pigeon-field');
    const pigeon     = document.getElementById('pigeon');
    if (!arena || !submitBtn || !pigeon || !field) return;

    arena.style.display = 'block';
    submitBtn.disabled  = true;
    submitBtn.classList.add('pigeon-locked');

    const FLEE_RADIUS  = 220;   // px — pigeon reacts from far away
    const BASE_SPEED   = 18;    // px per frame base flee speed
    const PREDICT      = 10;    // frames ahead the pigeon predicts cursor position
    const MARGIN       = 8;
    const CATCH_RADIUS = 14;    // px — tiny hitbox, must be nearly pixel-perfect
    const IDLE_SPEED   = 0.6;   // px per frame random drift when calm

    let caught = false;
    let pigeonX = 0, pigeonY = 0;
    let velX = 0, velY = 0;           // pigeon velocity
    let idleAngle = Math.random() * Math.PI * 2;
    let animId;

    // Cursor tracking with velocity
    let mouseX = -999, mouseY = -999;
    let prevMouseX = -999, prevMouseY = -999;
    let cursorVelX = 0, cursorVelY = 0;

    function fieldRect() { return field.getBoundingClientRect(); }
    function pigeonHalf() { return { w: pigeon.offsetWidth / 2, h: pigeon.offsetHeight / 2 }; }
    function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

    function randomPos() {
      const r  = fieldRect();
      const ph = pigeonHalf();
      return {
        x: ph.w + MARGIN + Math.random() * (r.width  - ph.w * 2 - MARGIN * 2),
        y: ph.h + MARGIN + Math.random() * (r.height - ph.h * 2 - MARGIN * 2)
      };
    }

    function placePigeon(x, y) {
      pigeonX = x; pigeonY = y;
      const ph = pigeonHalf();
      pigeon.style.left = (x - ph.w) + 'px';
      pigeon.style.top  = (y - ph.h) + 'px';
    }

    const start = randomPos();
    placePigeon(start.x, start.y);

    field.addEventListener('mousemove', function(e) {
      const r = fieldRect();
      prevMouseX = mouseX; prevMouseY = mouseY;
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
      cursorVelX = mouseX - prevMouseX;
      cursorVelY = mouseY - prevMouseY;
    });
    field.addEventListener('mouseleave', function() {
      mouseX = -999; mouseY = -999;
      cursorVelX = 0; cursorVelY = 0;
    });
    field.addEventListener('touchmove', function(e) {
      e.preventDefault();
      const r   = fieldRect();
      const tch = e.touches[0];
      prevMouseX = mouseX; prevMouseY = mouseY;
      mouseX = tch.clientX - r.left;
      mouseY = tch.clientY - r.top;
      cursorVelX = mouseX - prevMouseX;
      cursorVelY = mouseY - prevMouseY;
    }, { passive: false });

    function flee() {
      if (caught) return;

      const r  = fieldRect();
      const ph = pigeonHalf();

      // Predict where the cursor will be in PREDICT frames
      const predX = mouseX + cursorVelX * PREDICT;
      const predY = mouseY + cursorVelY * PREDICT;

      const dx   = pigeonX - predX;
      const dy   = pigeonY - predY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < FLEE_RADIUS && dist > 0 && mouseX > -900) {
        // Speed scales up sharply as cursor gets closer
        const urgency = 1 + Math.pow((FLEE_RADIUS - dist) / FLEE_RADIUS, 2) * 5;
        const speed   = BASE_SPEED * urgency;

        velX = (dx / dist) * speed;
        velY = (dy / dist) * speed;

        // If pigeon is near a wall and fleeing into it, pick a perpendicular escape
        let nx = pigeonX + velX;
        let ny = pigeonY + velY;
        const hitLeft   = nx < ph.w + MARGIN;
        const hitRight  = nx > r.width  - ph.w - MARGIN;
        const hitTop    = ny < ph.h + MARGIN;
        const hitBottom = ny > r.height - ph.h - MARGIN;

        if (hitLeft || hitRight || hitTop || hitBottom) {
          // Bounce perpendicularly away from the wall
          if (hitLeft || hitRight) velX = -velX * 0.8;
          if (hitTop  || hitBottom) velY = -velY * 0.8;
          // Add a random lateral nudge so it doesn't just oscillate
          const nudge = (Math.random() - 0.5) * BASE_SPEED * 3;
          if (hitLeft || hitRight) velY += nudge;
          else velX += nudge;
        }

        idleAngle = Math.atan2(velY, velX); // keep idle direction coherent
      } else {
        // Idle: slow random drift, angle drifts gradually
        idleAngle += (Math.random() - 0.5) * 0.15;
        velX = Math.cos(idleAngle) * IDLE_SPEED;
        velY = Math.sin(idleAngle) * IDLE_SPEED;
      }

      // Apply velocity with clamping
      const newX = clamp(pigeonX + velX, ph.w + MARGIN, r.width  - ph.w - MARGIN);
      const newY = clamp(pigeonY + velY, ph.h + MARGIN, r.height - ph.h - MARGIN);
      placePigeon(newX, newY);

      // Flip sprite based on horizontal direction
      pigeon.style.transform = velX < 0 ? 'scaleX(-1)' : 'scaleX(1)';

      // Catch check — tiny hitbox, cursor must be nearly dead-on
      const catchDx = mouseX - pigeonX;
      const catchDy = mouseY - pigeonY;
      if (Math.sqrt(catchDx * catchDx + catchDy * catchDy) < CATCH_RADIUS) {
        caught = true;
        cancelAnimationFrame(animId);
        pigeon.classList.add('pigeon-caught-anim');
        if (instruction) {
          instruction.setAttribute('data-i18n', 'pigeon.caught');
          instruction.textContent = t('pigeon.caught');
          instruction.classList.add('pigeon-caught-text');
        }
        submitBtn.disabled = false;
        submitBtn.classList.remove('pigeon-locked');
        return;
      }

      animId = requestAnimationFrame(flee);
    }

    animId = requestAnimationFrame(flee);
  }

  /* ── Run ────────────────────────────────────────────────────────────── */
  buildHeader();
  applyMode();
  applyTranslations();
  buildModeToggle();
  wireLangSwitcher();
  markActiveLink();
  wireDropdowns();
  wireHamburger();
  applyFunNavVisibility();
  guardFunPage();
  showHotFirePopup();
  showFakeReviews();
  showVitaTeamSection();
  initPigeonGame();

})();
