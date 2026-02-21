// Bodyguard slap system
const hendrikImg = document.getElementById('hendrikImg');
const lucasImg = document.getElementById('lucasImg');
const hendrikSlapsDisplay = document.getElementById('hendrikSlaps');
const lucasSlapsDisplay = document.getElementById('lucasSlaps');
const hendrikBox = document.getElementById('hendrikBox');
const lucasBox = document.getElementById('lucasBox');
const overlay = document.getElementById('bodyguardOverlay');

let hendrikSlaps = 0;
let lucasSlaps = 0;
const slapsNeeded = 10;

const slapTexts = ['SLAP!', 'POW!', 'WHACK!', 'BAM!', 'SMACK!', 'BONK!'];

function createSlapEffect(e, container) {
    const slapEffect = document.createElement('div');
    slapEffect.className = 'slap-effect-bodyguard';
    slapEffect.textContent = slapTexts[Math.floor(Math.random() * slapTexts.length)];
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    slapEffect.style.left = x + 'px';
    slapEffect.style.top = y + 'px';
    
    const tx = (Math.random() - 0.5) * 200;
    const ty = -100 - Math.random() * 100;
    slapEffect.style.setProperty('--tx', tx + 'px');
    slapEffect.style.setProperty('--ty', ty + 'px');
    
    container.appendChild(slapEffect);
    
    setTimeout(() => {
        slapEffect.remove();
    }, 1000);
}

function checkIfBothDefeated() {
    if (hendrikSlaps >= slapsNeeded && lucasSlaps >= slapsNeeded) {
        setTimeout(() => {
            overlay.style.transition = 'opacity 0.5s';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.classList.add('hidden');
                showSuccessMessage();
            }, 500);
        }, 500);
    }
}

function showSuccessMessage() {
    const message = document.createElement('div');
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.background = 'rgba(193, 122, 58, 0.95)';
    message.style.color = '#1a1410';
    message.style.padding = '2rem 3rem';
    message.style.borderRadius = '8px';
    message.style.fontSize = '1.8rem';
    message.style.fontWeight = 'bold';
    message.style.zIndex = '11000';
    message.style.textAlign = 'center';
    message.style.maxWidth = '80%';
    message.textContent = 'You may now speak to Martin! 🎉';
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.transition = 'opacity 0.5s';
        message.style.opacity = '0';
        setTimeout(() => message.remove(), 500);
    }, 2500);
}

// Hendrik slap handler
hendrikImg.addEventListener('click', (e) => {
    if (hendrikSlaps >= slapsNeeded) return;
    
    hendrikSlaps++;
    hendrikSlapsDisplay.textContent = hendrikSlaps;
    
    hendrikImg.classList.add('slapped');
    setTimeout(() => {
        hendrikImg.classList.remove('slapped');
    }, 300);
    
    createSlapEffect(e, hendrikBox);
    
    if (hendrikSlaps >= slapsNeeded) {
        hendrikBox.classList.add('defeated');
        setTimeout(() => {
            const victoryText = document.createElement('div');
            victoryText.style.position = 'absolute';
            victoryText.style.top = '50%';
            victoryText.style.left = '50%';
            victoryText.style.transform = 'translate(-50%, -50%)';
            victoryText.style.fontSize = '3rem';
            victoryText.style.color = '#C17A3A';
            victoryText.style.fontWeight = 'bold';
            victoryText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            victoryText.textContent = 'DEFEATED!';
            hendrikBox.appendChild(victoryText);
        }, 300);
        checkIfBothDefeated();
    }
});

// Lucas slap handler
lucasImg.addEventListener('click', (e) => {
    if (lucasSlaps >= slapsNeeded) return;
    
    lucasSlaps++;
    lucasSlapsDisplay.textContent = lucasSlaps;
    
    lucasImg.classList.add('slapped');
    setTimeout(() => {
        lucasImg.classList.remove('slapped');
    }, 300);
    
    createSlapEffect(e, lucasBox);
    
    if (lucasSlaps >= slapsNeeded) {
        lucasBox.classList.add('defeated');
        setTimeout(() => {
            const victoryText = document.createElement('div');
            victoryText.style.position = 'absolute';
            victoryText.style.top = '50%';
            victoryText.style.left = '50%';
            victoryText.style.transform = 'translate(-50%, -50%)';
            victoryText.style.fontSize = '3rem';
            victoryText.style.color = '#C17A3A';
            victoryText.style.fontWeight = 'bold';
            victoryText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            victoryText.textContent = 'DEFEATED!';
            lucasBox.appendChild(victoryText);
        }, 300);
        checkIfBothDefeated();
    }
});

// Mobile touch support
hendrikImg.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const clickEvent = new MouseEvent('click', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        bubbles: true
    });
    hendrikImg.dispatchEvent(clickEvent);
});

lucasImg.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const clickEvent = new MouseEvent('click', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        bubbles: true
    });
    lucasImg.dispatchEvent(clickEvent);
});
