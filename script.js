document.addEventListener('DOMContentLoaded', () => {
    // Simple interactions (optional JS logic)
    console.log("Portfolio loaded.");

    // Scroll Reveal Observer (Fade/Scale)
    const observerOptions = {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before bottom
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-scroll, .snake-reveal, .scenery-anim').forEach(el => observer.observe(el));

    // Optimized Scroll Parallax
    let scrollY = 0;

    window.addEventListener('scroll', () => {
        scrollY = window.pageYOffset;
        requestAnimationFrame(updateParallax);
    });

    function updateParallax() {
        document.querySelectorAll('[data-speed]').forEach(el => {
            const speed = parseFloat(el.getAttribute('data-speed'));
            const direction = el.getAttribute('data-direction');
            const rect = el.getBoundingClientRect();

            // Optimization: Only animate if in viewport or close to it
            if (rect.bottom > -100 && rect.top < window.innerHeight + 100) {
                if (direction === 'left') {
                    // Move Left as we scroll down
                    el.style.transform = `translate3d(${scrollY * speed}px, 0, 0)`;
                    // Note: If speed is negative, it moves right? 
                    // User wants "moves left". ScrollY increases. So we need negative result.
                    // If I put speed as -0.5, it moves left.
                } else if (direction === 'horizontal') {
                    el.style.transform = `translate3d(${scrollY * speed}px, 0, 0)`;
                } else {
                    // Default Vertical
                    el.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
                }
            }
        });
    }

    // Mouse Parallax Logic
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    const ease = 0.05; // Smoothing factor (lower = smoother/slower)

    // Track mouse position normalized from center (-1 to 1)
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animateParallax() {
        // Linear Interpolation (Lerp) for smooth movement
        currentX += (mouseX - currentX) * ease;
        currentY += (mouseY - currentY) * ease;

        // Apply to Parallax Elements
        // 1. Hero Character (Moves opposite to mouse for depth)
        const character = document.querySelector('.main-character');
        if (character) {
            // Move max 30px
            character.style.transform = `translate(${currentX * -30}px, ${currentY * -30}px)`;
        }

        // 2. Floating Icons (Move faster/different directions)
        const icons = document.querySelectorAll('.floating-icon');
        icons.forEach((icon, index) => {
            const speed = (index + 1) * 20; // Varied speeds
            const direction = index % 2 === 0 ? 1 : -1;
            icon.style.transform = `translate(${currentX * speed * direction}px, ${currentY * speed * direction}px)`;
        });

        requestAnimationFrame(animateParallax);
    }

    // Start Animation Loop
    animateParallax();
    // 3D Tilt Effect for Cards
    const tiltCards = document.querySelectorAll('.skill-card, .project-card');

    if (window.matchMedia("(min-width: 768px)").matches) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Calculate center
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Get rotation values (max 15deg)
                const rotateX = ((y - centerY) / centerY) * -15;
                const rotateY = ((x - centerX) / centerX) * 15;

                // Apply transform
                card.style.transition = 'none';
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            });

            card.addEventListener('mouseleave', () => {
                // Reset with transition
                card.style.transition = 'transform 0.5s ease';
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
    }


    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Change icon if needed
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });
    }

    // Close menu when link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    });


});

// Typewriter Effect
class Typewriter {
    constructor(element, words, wait = 3000) {
        this.element = element;
        this.words = words;
        this.txt = '';
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.type();
        this.isDeleting = false;
    }

    type() {
        // Current index of word
        const current = this.wordIndex % this.words.length;
        // Get full text of current word
        const fullTxt = this.words[current];

        // Check if deleting
        if (this.isDeleting) {
            // Remove char
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            // Add char
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        // Insert txt into element
        this.element.innerHTML = `<span class="txt">${this.txt}</span>`;

        // Initial Type Speed
        let typeSpeed = 90;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        // If word is complete
        if (!this.isDeleting && this.txt === fullTxt) {
            // Make pause at end
            typeSpeed = this.wait;
            // Set delete to true
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            // Move to next word
            this.wordIndex++;
            // Pause before start typing
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Init Typewriter on DOM Load
document.addEventListener('DOMContentLoaded', init);

function init() {
    const txtElement = document.querySelector('.typing-text');
    const words = ["Web Developer", "Full Stack Developer", "Mern Stack Developer"];
    const wait = 1500;
    // Init Typewriter
    if (txtElement) {
        new Typewriter(txtElement, words, wait);
    }
}

