/* state.js — single source of truth for site-wide state */
(function (global) {
  'use strict';

  const DEFAULTS = { lang: 'de', mode: 'regular' };
  const PREFIX   = 'mz_';

  const SiteState = {
    get(key) {
      try { return localStorage.getItem(PREFIX + key) ?? DEFAULTS[key]; }
      catch { return DEFAULTS[key]; }
    },
    set(key, value) {
      try { localStorage.setItem(PREFIX + key, value); } catch {}
      document.dispatchEvent(new CustomEvent('sitestate', { detail: { key, value } }));
    },
    getAll() {
      return Object.fromEntries(Object.keys(DEFAULTS).map(k => [k, this.get(k)]));
    }
  };

  global.SiteState = SiteState;
})(window);
