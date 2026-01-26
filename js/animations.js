/* ===================================
   PrimePet - Animations Module
   =================================== */

// Intersection Observer for scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll(
        '.fade-in-up, .fade-in-left, .fade-in-right, .scale-in, .product-card'
    );

    animatedElements.forEach(el => observer.observe(el));
}

// Header scroll effect
function setupHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add shadow on scroll
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// Smooth scroll for navigation links
function setupSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#') return;

            e.preventDefault();

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Close mobile menu if open
                const nav = document.getElementById('nav');
                if (nav && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                }

                // Scroll to target
                const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Testimonial carousel
function setupTestimonialCarousel() {
    const carousel = document.getElementById('testimonialsCarousel');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');

    if (!carousel || !prevBtn || !nextBtn) return;

    const cards = carousel.querySelectorAll('.testimonial-card');
    if (cards.length === 0) return;

    let currentIndex = 0;
    let autoPlayInterval;

    // Function to show testimonials
    function showTestimonials(index) {
        // For larger screens, show all testimonials
        if (window.innerWidth >= 768) {
            cards.forEach(card => {
                card.style.display = '';
                card.style.opacity = '1';
            });
            return;
        }

        // For mobile, show one at a time
        cards.forEach((card, i) => {
            if (i === index) {
                card.style.display = '';
                card.style.opacity = '1';
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
            }
        });
    }

    // Next testimonial
    function nextTestimonial() {
        currentIndex = (currentIndex + 1) % cards.length;
        showTestimonials(currentIndex);
    }

    // Previous testimonial
    function prevTestimonial() {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        showTestimonials(currentIndex);
    }

    // Setup buttons
    prevBtn.addEventListener('click', () => {
        prevTestimonial();
        stopAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
        nextTestimonial();
        stopAutoPlay();
    });

    // Auto play
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextTestimonial, 5000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // Initialize
    showTestimonials(currentIndex);
    startAutoPlay();

    // Handle resize
    window.addEventListener('resize', () => {
        showTestimonials(currentIndex);
    });
}

// Add parallax effect to hero section
function setupParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;

        if (scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
    });
}

// Animated counter for hero stats
function setupCounters() {
    const stats = document.querySelectorAll('.stat-number');
    if (stats.length === 0) return;

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                animateCounter(entry.target);
                entry.target.dataset.counted = 'true';
            }
        });
    }, observerOptions);

    stats.forEach(stat => observer.observe(stat));
}

function animateCounter(element) {
    const target = element.textContent;
    const isNumber = target.match(/\d+/);

    if (!isNumber) return;

    const number = parseInt(isNumber[0]);
    const suffix = target.replace(isNumber[0], '');
    const duration = 2000;
    const steps = 60;
    const increment = number / steps;
    const stepDuration = duration / steps;

    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
            current = number;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, stepDuration);
}

// Add loading animation
function showLoadingAnimation() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <div class="loading" style="margin: 0 auto;"></div>
            <p style="margin-top: 1rem; color: var(--text-secondary);">Produkte werden geladen...</p>
        </div>
    `;
}

// Add hover effect to cards
function setupCardHoverEffects() {
    const cards = document.querySelectorAll('.category-card, .product-card, .testimonial-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Initialize all animations
function initAnimations() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupScrollAnimations();
            setupHeaderScroll();
            setupSmoothScroll();
            setupTestimonialCarousel();
            setupParallax();
            setupCounters();
        });
    } else {
        setupScrollAnimations();
        setupHeaderScroll();
        setupSmoothScroll();
        setupTestimonialCarousel();
        setupParallax();
        setupCounters();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initAnimations };
}
