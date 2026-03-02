# Website Plan & Open TODOs

## 1. Outlook Calendar Sync

**Goal:** Martin maintains shows in Outlook → website updates automatically, no code edits needed.

**Plan:**
1. Martin publishes his shows calendar in Outlook as a public ICS URL (one-time setup):
   - Outlook.com / Microsoft 365 → Settings → Calendar → Shared calendars → Publish a calendar → "All details" → copy ICS link
2. Store the ICS URL as a GitHub Secret (`OUTLOOK_ICS_URL`) — never committed to the repo
3. Create a GitHub Action (`.github/workflows/sync-shows.yml`) that:
   - Runs on a schedule (e.g. every night at 03:00)
   - Fetches the ICS URL from the secret
   - Parses the `.ics` file (Node.js script using `node-ical` or a small custom parser)
   - Rewrites `assets/shows-data.js` with the new data
   - Commits + pushes the updated file
4. Martin's only ongoing job: add a show to his Outlook calendar → it appears on the site next morning

**Files to create:**
- `.github/workflows/sync-shows.yml`
- `scripts/parse-ics.js`

**Notes:**
- The ICS URL itself contains a random token (Outlook's own protection) — no additional auth needed
- The secret is never written into any committed file or build log
- Falls back to the existing `shows-data.js` if the fetch fails

---

## 2. Compliance Issues

### 2a. 🔴 External Google Fonts — GDPR violation (German courts: LG München 2022)
Loading fonts from `fonts.googleapis.com` transmits the visitor's IP to Google without consent.

**Affected files:**
- `90s_overlay/index-aim.html` — `@import url('https://fonts.googleapis.com/...')` (Tahoma)
- `90s_overlay/index-dos.html` — `@import url('https://fonts.googleapis.com/...')` (Share Tech Mono)
- `90s_overlay/index-ps1.html` — `@import url('https://fonts.googleapis.com/...')` (Share Tech Mono)
- `90s_overlay/shows.html` — `@import url('https://fonts.googleapis.com/...')` (Share Tech Mono)
- `shows.html` — check

**Fix:** Download the font files and self-host them under `assets/fonts/`, just like the main site already does for DM Sans and Cormorant Garamond. Share Tech Mono is available on Google Fonts for download.

### 2b. 🟡 unpkg.com CDN (98.css) — minor GDPR risk
All 90s overlay pages load `98.css` from `https://unpkg.com/98.css`. This sends the visitor's IP to unpkg/Cloudflare.

**Affected files:** All `90s_overlay/*.html`

**Fix:** Download `98.css` once and commit it to `assets/css/98.css`, then update all `<link>` tags.

### 2c. 🟡 YouTube embeds — require consent before loading
`youtube-nocookie.com` embeds are used (good — no cookies until play), but they still make a network request on load when the iframe is inserted.

**Affected files:**
- `improvisation.html`, `musik.html`, `zamoranoandstamer.html` (main site)
- `90s_overlay/improvisation.html`, `90s_overlay/musik.html`, `90s_overlay/zamoranoandstamer.html`
- `mental-pocus-records.html`

**Current situation:** The thumbnail-click pattern is already used on most pages (iframe only loads on click) — this is actually fine and the correct approach. ✅ No change needed as long as the iframe is never inserted on page load.

**Action:** Verify no iframes are auto-inserted on page load (i.e. all use the click-to-load thumbnail pattern).

### 2d. 🟡 Bandcamp embeds — same as YouTube
Bandcamp iframes load third-party content directly on page load (no click-to-load).

**Affected files:** `mental-pocus-records.html`, `musik.html`

**Fix options:**
- Wrap in a consent click-to-load pattern (like YouTube thumbnails), or
- Note in the Datenschutz page that Bandcamp is a third-party embed

### 2e. 🟢 localStorage — likely exempt, but needs Datenschutz mention
The site uses `localStorage` for:
- Language preference (`mz_lang`)
- Mode preference (`mz_mode` — regular/stupid)
- Labyrinth win flag (`mz_labyrinth_won`)
- Visitor counters in the 90s overlay (`mz_visits98`, `mz_visits_gc`)

Under GDPR/TTDSG, localStorage used **only for functionality** (preferences, not tracking) is generally exempt from consent requirements — but it **must be mentioned** in the Datenschutz page.

**Action:** Document localStorage usage in Datenschutz. No banner needed for these.

### 2f. 🔴 Datenschutz page is a placeholder
Currently just says "Diese Datenschutzerklärung befindet sich im Aufbau." — this is not compliant.

**Fix:** Write a proper Datenschutz page covering:
- Hosting (GitHub Pages — GitHub's servers, US-based, note the data transfer)
- No analytics, no tracking
- localStorage usage (see 2e)
- Third-party embeds: YouTube (youtube-nocookie), Bandcamp
- External fonts situation (once fixed per 2a)
- Contact form (if it sends data anywhere)
- Right of access / deletion contact

### 2g. 🟢 No cookie banner needed
The site uses no cookies, no tracking pixels, no analytics, no ad networks. localStorage for pure functionality is exempt under TTDSG §25(2). **No banner required** — as long as 2a and 2b are fixed (self-host fonts/CSS).

---

## 3. Other TODOs noted along the way

- [ ] `90s_overlay/vita.html` rotating head canvas: consider making it opt-in or adding a `prefers-reduced-motion` check
- [ ] The `_site/` folder appears to be a Jekyll build artefact — confirm it's not served and can be gitignored
- [ ] `en/index.html` exists but most pages have no English equivalent under `/en/` — either build out or remove the stub
- [ ] Instagram link in `90s_overlay/index.html` still points to `heyemmet` (wrong account)
- [ ] Facebook link in `90s_overlay/index.html` points to the Wikipedia article about Facebook
- [ ] Spotify link in `90s_overlay/index.html` points to an eBay image
