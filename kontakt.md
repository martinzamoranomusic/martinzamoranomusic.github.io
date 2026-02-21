---
layout: default
title: Kontakt
lang: de
permalink: /kontakt
---

<!-- Bodyguard Overlay -->
<div id="bodyguardOverlay" class="bodyguard-overlay">
  <div class="bodyguard-container">
    <h2>Um Martin zu sprechen, müssen Sie erst an uns vorbeikommen!</h2>
    <p class="bodyguard-instructions">Slap them away to continue!</p>
    
    <div class="bodyguards">
      <div class="bodyguard-box" id="hendrikBox">
        <h3>Hendrik</h3>
        <div class="slap-counter-small">
          <span id="hendrikSlaps">0</span> / 10 slaps
        </div>
        <img id="hendrikImg" src="assets/images/HendrikBodyguard.png" alt="Hendrik the Bodyguard" class="bodyguard-image">
      </div>
      
      <div class="bodyguard-box" id="lucasBox">
        <h3>Lucas</h3>
        <div class="slap-counter-small">
          <span id="lucasSlaps">0</span> / 10 slaps
        </div>
        <img id="lucasImg" src="assets/images/LucasBodyguard.png" alt="Lucas the Bodyguard" class="bodyguard-image">
      </div>
    </div>
  </div>
</div>

<link rel="stylesheet" href="bodyguard-styles.css">
<script src="bodyguard-script.js"></script>

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
