document.addEventListener('DOMContentLoaded', function() {
    const hendrikImg = document.getElementById('hendrikImg');
    const lucasImg = document.getElementById('lucasImg');
    const hendrikBox = document.getElementById('hendrikBox');
    const lucasBox = document.getElementById('lucasBox');
    const victoryBanner = document.getElementById('victoryBanner');

    let hendrikSlaps = 0;
    let lucasSlaps = 0;
    const SLAPS_TO_DEFEAT = 10;

    // ── Synthetic slap sound (same as slap-o-mat) ──
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

        // 1. Main slap body
        const bodyDur  = 0.15;
        const bodySize = Math.floor(audioCtx.sampleRate * bodyDur);
        const bodyBuf  = audioCtx.createBuffer(1, bodySize, audioCtx.sampleRate);
        const bodyData = bodyBuf.getChannelData(0);
        for (let i = 0; i < bodySize; i++) bodyData[i] = Math.random() * 2 - 1;

        const bodySrc = audioCtx.createBufferSource();
        bodySrc.buffer = bodyBuf;

        const lowpass = audioCtx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 8000;
        lowpass.Q.value = 0.5;

        const presence = audioCtx.createBiquadFilter();
        presence.type = 'peaking';
        presence.frequency.value = 1500;
        presence.gain.value = 9;
        presence.Q.value = 1.0;

        const bodyGain = audioCtx.createGain();
        bodyGain.gain.setValueAtTime(0, now);
        bodyGain.gain.linearRampToValueAtTime(1.8, now + 0.002);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + bodyDur);

        bodySrc.connect(lowpass);
        lowpass.connect(presence);
        presence.connect(bodyGain);
        bodyGain.connect(compressor);
        bodySrc.start(now);
        bodySrc.stop(now + bodyDur);

        // 2. Flesh thump
        const thumpDur  = 0.04;
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

    hendrikImg.addEventListener('click', function(e) {
        if (hendrikSlaps >= SLAPS_TO_DEFEAT) return;
        playSlap();
        hendrikSlaps++;
        hendrikImg.classList.add('slapped');
        setTimeout(() => hendrikImg.classList.remove('slapped'), 300);
        showSlapEffect(e, hendrikBox, hendrikSlaps === SLAPS_TO_DEFEAT);
        if (hendrikSlaps >= SLAPS_TO_DEFEAT) {
            defeatBodyguard(hendrikBox, 'right');
            checkAllDefeated();
        }
    });

    lucasImg.addEventListener('click', function(e) {
        if (lucasSlaps >= SLAPS_TO_DEFEAT) return;
        playSlap();
        lucasSlaps++;
        lucasImg.classList.add('slapped');
        setTimeout(() => lucasImg.classList.remove('slapped'), 300);
        showSlapEffect(e, lucasBox, lucasSlaps === SLAPS_TO_DEFEAT);
        if (lucasSlaps >= SLAPS_TO_DEFEAT) {
            defeatBodyguard(lucasBox, 'left');
            checkAllDefeated();
        }
    });

    function showSlapEffect(e, container, isFinalSlap = false) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const effect = document.createElement('div');
        effect.className = 'slap-effect-bodyguard';
        if (isFinalSlap) effect.classList.add('final-slap');
        effect.textContent = '👋';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';

        if (!isFinalSlap) {
            const tx = (Math.random() - 0.5) * 200;
            const ty = (Math.random() - 0.5) * 200 - 100;
            effect.style.setProperty('--tx', tx + 'px');
            effect.style.setProperty('--ty', ty + 'px');
        }

        container.appendChild(effect);
        setTimeout(() => effect.remove(), isFinalSlap ? 500 : 1000);
    }

    function defeatBodyguard(boxElement, direction) {
        // First: tip over (rotate like knocked out)
        const rotation = direction === 'left' ? '-90deg' : '90deg';
        boxElement.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        boxElement.style.transformOrigin = direction === 'left' ? 'bottom right' : 'bottom left';
        boxElement.style.transform = `rotate(${rotation})`;

        // Then: slide out of frame
        setTimeout(() => {
            const slide = direction === 'left' ? 'translateX(-160%)' : 'translateX(160%)';
            boxElement.style.transition = 'transform 0.6s ease-in, opacity 0.5s ease-in';
            boxElement.style.transform = `rotate(${rotation}) ${slide}`;
            boxElement.style.opacity = '0';
        }, 550);
    }

    function checkAllDefeated() {
        if (hendrikSlaps >= SLAPS_TO_DEFEAT && lucasSlaps >= SLAPS_TO_DEFEAT) {
            setTimeout(() => {
                // Swap title banner for victory banner
                const bodyguardBanner = document.getElementById('bodyguardBanner');
                bodyguardBanner.style.transition = 'opacity 0.4s';
                bodyguardBanner.style.opacity = '0';

                setTimeout(() => {
                    bodyguardBanner.style.display = 'none';
                    const victoryBanner = document.getElementById('victoryBanner');
                    victoryBanner.classList.remove('hidden');
                    victoryBanner.classList.add('visible');

                    // After showing victory message, fade out entire overlay
                    setTimeout(() => {
                        const overlay = document.getElementById('bodyguardOverlay');
                        overlay.style.transition = 'opacity 0.8s ease-out';
                        overlay.style.opacity = '0';
                        setTimeout(() => {
                            overlay.style.display = 'none';
                        }, 800);
                    }, 2000);
                }, 400);
            }, 1300);
        }
    }
});
