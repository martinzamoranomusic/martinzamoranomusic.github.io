let slapCount = 0;
const martinImg = document.getElementById('martinImg');
const slapCountDisplay = document.getElementById('slapCount');
const martinContainer = document.querySelector('.martin-container');

// Progressive damage images - Martin gets worse as he's slapped more
const martinImages = [
    'assets/images/3a900e2a-5b03-415d-bb2c-73904c085423.png',           // 0-9 slaps: Fresh Martin
    'assets/images/martin_damage_1.png',      // 10-24 slaps: Slightly damaged
    'assets/images/martin_damage_2.png',      // 25-49 slaps: Getting worse
    'assets/images/martin_damage_3.png',      // 50-74 slaps: Pretty bad
    'assets/images/martin_damage_4.png'       // 75+ slaps: Completely destroyed
];

// Array of slap sound effects (visual feedback text)
const slapTexts = ['SLAP!', 'POW!', 'WHACK!', 'BAM!', 'SMACK!', 'BONK!'];

// ── Synthetic slap sound (Web Audio API — no external file needed) ──
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playSlap() {
    if (!AudioCtx) return;
    if (!audioCtx) audioCtx = new AudioCtx();

    const now = audioCtx.currentTime;

    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -4;
    compressor.ratio.value = 8;
    compressor.connect(audioCtx.destination);

    // 1. Main slap body — full-band noise, low-passed at 8 kHz, natural decay
    const bodyDur  = 0.15; // 150 ms
    const bodySize = Math.floor(audioCtx.sampleRate * bodyDur);
    const bodyBuf  = audioCtx.createBuffer(1, bodySize, audioCtx.sampleRate);
    const bodyData = bodyBuf.getChannelData(0);
    for (let i = 0; i < bodySize; i++) bodyData[i] = Math.random() * 2 - 1;

    const bodySrc = audioCtx.createBufferSource();
    bodySrc.buffer = bodyBuf;

    // Low-pass keeps warmth, removes harsh hiss above 8 kHz
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 8000;
    lowpass.Q.value = 0.5;

    // Mid presence boost around 1.5 kHz — the "smack" frequency
    const presence = audioCtx.createBiquadFilter();
    presence.type = 'peaking';
    presence.frequency.value = 1500;
    presence.gain.value = 9;
    presence.Q.value = 1.0;

    const bodyGain = audioCtx.createGain();
    bodyGain.gain.setValueAtTime(0, now);
    bodyGain.gain.linearRampToValueAtTime(1.8, now + 0.002); // fast attack
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + bodyDur); // natural tail

    bodySrc.connect(lowpass);
    lowpass.connect(presence);
    presence.connect(bodyGain);
    bodyGain.connect(compressor);
    bodySrc.start(now);
    bodySrc.stop(now + bodyDur);

    // 2. Flesh thump — short bandpass burst around 700 Hz for the "weight" of skin
    const thumpDur  = 0.04; // 40 ms, subtle
    const thumpSize = Math.floor(audioCtx.sampleRate * thumpDur);
    const thumpBuf  = audioCtx.createBuffer(1, thumpSize, audioCtx.sampleRate);
    const thumpData = thumpBuf.getChannelData(0);
    for (let i = 0; i < thumpSize; i++) thumpData[i] = Math.random() * 2 - 1;

    const thumpSrc = audioCtx.createBufferSource();
    thumpSrc.buffer = thumpBuf;

    const thumpBp = audioCtx.createBiquadFilter();
    thumpBp.type = 'bandpass';
    thumpBp.frequency.value = 700;
    thumpBp.Q.value = 2.0;

    const thumpGain = audioCtx.createGain();
    thumpGain.gain.setValueAtTime(1.2, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + thumpDur);

    thumpSrc.connect(thumpBp);
    thumpBp.connect(thumpGain);
    thumpGain.connect(compressor);
    thumpSrc.start(now);
    thumpSrc.stop(now + thumpDur);
}

function updateMartinImage() {
    let imageIndex;
    if (slapCount < 10) {
        imageIndex = 0;
    } else if (slapCount < 25) {
        imageIndex = 1;
    } else if (slapCount < 50) {
        imageIndex = 2;
    } else if (slapCount < 75) {
        imageIndex = 3;
    } else {
        imageIndex = 4;
    }
    
    martinImg.src = martinImages[imageIndex];
}

martinImg.addEventListener('click', (e) => {
    playSlap();

    // Increment counter
    slapCount++;
    slapCountDisplay.textContent = slapCount;
    
    // Update image based on damage level
    updateMartinImage();
    
    // Add slap animation to image
    martinImg.classList.add('slapped');
    setTimeout(() => {
        martinImg.classList.remove('slapped');
    }, 300);
    
    // Create flying slap effect
    const slapEffect = document.createElement('div');
    slapEffect.className = 'slap-effect';
    slapEffect.textContent = slapTexts[Math.floor(Math.random() * slapTexts.length)];
    
    // Position at click location
    const rect = martinImg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    slapEffect.style.left = x + 'px';
    slapEffect.style.top = y + 'px';
    
    // Random fly direction
    const tx = (Math.random() - 0.5) * 200;
    const ty = -100 - Math.random() * 100;
    slapEffect.style.setProperty('--tx', tx + 'px');
    slapEffect.style.setProperty('--ty', ty + 'px');
    
    martinContainer.appendChild(slapEffect);
    
    // Remove effect after animation
    setTimeout(() => {
        slapEffect.remove();
    }, 1000);
    
    // Add some fun messages at milestones
    if (slapCount === 10) {
        showMessage("Martin is starting to regret his life choices...");
    } else if(slapCount === 75) {
        showMessage("Martin grew a thick skin...");
    } 
});

function showMessage(text) {
    const message = document.createElement('div');
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.background = 'rgba(193, 122, 58, 0.95)';
    message.style.color = '#1a1410';
    message.style.padding = '2rem 3rem';
    message.style.borderRadius = '8px';
    message.style.fontSize = '1.5rem';
    message.style.fontWeight = 'bold';
    message.style.zIndex = '1000';
    message.style.textAlign = 'center';
    message.style.maxWidth = '80%';
    message.textContent = text;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.transition = 'opacity 0.5s';
        message.style.opacity = '0';
        setTimeout(() => message.remove(), 500);
    }, 2500);
}

// Add mobile touch support
martinImg.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const clickEvent = new MouseEvent('click', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        bubbles: true
    });
    martinImg.dispatchEvent(clickEvent);
});

// Initialize with first image
updateMartinImage();
