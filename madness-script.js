// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.background = 'rgba(15, 23, 42, 0.98)';
        navMenu.style.flexDirection = 'column';
        navMenu.style.padding = '1rem';
        navMenu.style.borderTop = '1px solid rgba(99, 102, 241, 0.2)';
    });
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Subtle madness effects - barely noticeable
let glitchCount = 0;

// Very occasional subtle page tilt
setInterval(() => {
    if (Math.random() > 0.98) {
        document.body.style.transform = 'rotate(0.1deg)';
        setTimeout(() => {
            document.body.style.transform = 'rotate(0deg)';
        }, 50);
    }
}, 5000);

// Slightly off letter spacing that increases over time
let spacingDrift = 0;
setInterval(() => {
    spacingDrift += 0.001;
    const title = document.querySelector('.hero-title');
    if (title) {
        title.style.letterSpacing = `${3.2 + spacingDrift}px`;
    }
}, 10000);

// Random subtle emoji shift
setInterval(() => {
    const icons = document.querySelectorAll('.card-icon');
    if (Math.random() > 0.95 && icons.length > 0) {
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        randomIcon.style.transform = `translateX(${Math.random() * 2 - 1}px)`;
    }
}, 3000);

// Cursor occasionally feels slightly sluggish
document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.999) {
        document.body.style.cursor = 'wait';
        setTimeout(() => {
            document.body.style.cursor = 'default';
        }, 100);
    }
});

// Links underline on hover (slightly trashy)
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('mouseenter', () => {
        if (Math.random() > 0.9) {
            link.style.textDecoration = 'underline';
        }
    });
});
