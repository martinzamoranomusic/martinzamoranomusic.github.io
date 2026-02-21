/* nav.js — shared navigation logic */
(function () {
  "use strict";

  /* ── Active nav link ─────────────────────────────────────── */
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".main-nav a").forEach(function (a) {
    const href = a.getAttribute("href").replace(/\/$/, "") || "/";
    if (href === path || (href !== "/" && path.startsWith(href))) {
      a.classList.add("active");
    }
  });

  /* ── Language switcher ───────────────────────────────────── */
  // Strip leading language prefix (/en/… or /es/…) to get the base slug
  const langMatch = path.match(/^\/(en|es)(\/.*)?$/);
  const currentLang = langMatch ? langMatch[1] : "de";
  const basePath = langMatch ? (langMatch[2] || "/") : path;

  document.querySelectorAll(".lang-switcher a").forEach(function (a) {
    const lang = a.dataset.lang;
    // Build correct href for each language
    let href;
    if (lang === "de") {
      href = basePath || "/";
    } else {
      href = "/" + lang + (basePath === "/" ? "/" : basePath);
    }
    a.setAttribute("href", href);
    if (lang === currentLang) {
      a.classList.add("active");
    }
  });
})();
