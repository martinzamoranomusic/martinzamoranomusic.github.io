---
layout: default
title: Kontakt
lang: de
permalink: /kontakt
---

## Kontakt

Si quieres contactarme mándame un email, rellenando el formulario de abajo.

<form class="contact-form" action="https://formspree.io/f/placeholder" method="POST">
  <label>
    Ihr Name *
    <input type="text" name="name" required />
  </label>
  <label>
    Telefon
    <input type="tel" name="telefon" />
  </label>
  <label>
    Email *
    <input type="email" name="email" required />
  </label>
  <label>
    Ihre Nachricht *
    <textarea name="message" required></textarea>
  </label>
  <label style="display:none;">
    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" />
  </label>
  <button type="submit">Absenden</button>
</form>
