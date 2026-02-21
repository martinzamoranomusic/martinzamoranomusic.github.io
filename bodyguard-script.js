document.addEventListener('DOMContentLoaded', function() {
    const hendrikImg = document.getElementById('hendrikImg');
    const lucasImg = document.getElementById('lucasImg');
    const hendrikBox = document.getElementById('hendrikBox');
    const lucasBox = document.getElementById('lucasBox');
    const victoryBanner = document.getElementById('victoryBanner');

    let hendrikSlaps = 0;
    let lucasSlaps = 0;
    const SLAPS_TO_DEFEAT = 10;

    hendrikImg.addEventListener('click', function(e) {
        if (hendrikSlaps >= SLAPS_TO_DEFEAT) return;
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
