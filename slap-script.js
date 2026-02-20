let slapCount = 0;
const martinImg = document.getElementById('martinImg');
const slapCountDisplay = document.getElementById('slapCount');
const martinContainer = document.querySelector('.martin-container');

// Progressive damage images - Martin gets worse as he's slapped more
const martinImages = [
    'scraped/assets/3a900e2a-5b03-415d-bb2c-73904c085423.png',           // 0-9 slaps: Fresh Martin
    'scraped/assets/martin_damage_1.png',      // 10-24 slaps: Slightly damaged
    'scraped/assets/martin_damage_2.png',      // 25-49 slaps: Getting worse
    'scraped/assets/martin_damage_3.png',      // 50-74 slaps: Pretty bad
    'scraped/assets/martin_damage_4.png'       // 75+ slaps: Completely destroyed
];

// Array of slap sound effects (visual feedback text)
const slapTexts = ['SLAP!', 'POW!', 'WHACK!', 'BAM!', 'SMACK!', 'BONK!'];

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
