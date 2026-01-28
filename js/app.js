/* ===================================
   PrimePet - Main Application
   =================================== */

// Mobile menu toggle
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('nav');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');

            // Update button icon
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (nav.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                nav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when clicking nav link
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
}

// Active navigation link based on scroll position
function setupActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length === 0 || navLinks.length === 0) return;

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const scrollPosition = window.pageYOffset + 200;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Back to top button
function setupBackToTop() {
    // Create back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.setAttribute('aria-label', 'Nach oben scrollen');

    // Add styles
    Object.assign(backToTopBtn.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        boxShadow: 'var(--shadow-lg)',
        zIndex: '999',
        transition: 'all 0.3s ease'
    });

    document.body.appendChild(backToTopBtn);

    // Show/hide based on scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Hover effect
    backToTopBtn.addEventListener('mouseenter', () => {
        backToTopBtn.style.transform = 'translateY(-5px)';
        backToTopBtn.style.background = 'var(--primary-dark)';
    });

    backToTopBtn.addEventListener('mouseleave', () => {
        backToTopBtn.style.transform = 'translateY(0)';
        backToTopBtn.style.background = 'var(--primary-color)';
    });
}

// Lazy loading images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Form validation for checkout
function setupFormValidation() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm) return;

    checkoutForm.addEventListener('submit', (e) => {
        const inputs = checkoutForm.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');

                // Remove error class on input
                input.addEventListener('input', () => {
                    input.classList.remove('error');
                }, { once: true });
            }
        });

        if (!isValid) {
            e.preventDefault();
            alert('Bitte füllen Sie alle erforderlichen Felder aus.');
        }
    });
}

// Add search functionality (future enhancement)
function setupSearch() {
    // Placeholder for future search implementation
    // Could add a search bar in the header
}

// Handle window resize events
function setupResizeHandler() {
    let resizeTimer;

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Refresh certain components on resize
            const nav = document.getElementById('nav');
            if (nav && window.innerWidth >= 1024) {
                nav.classList.remove('active');
                const mobileMenuBtn = document.getElementById('mobileMenuBtn');
                const icon = mobileMenuBtn?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }, 250);
    });
}

// Performance optimization - Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add keyboard navigation support
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Close modals with Escape key (handled in cart.js)
        // Add more keyboard shortcuts if needed
    });
}

// Cookie Banner Logic
function setupCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookieAccept');
    const declineBtn = document.getElementById('cookieDecline');

    // Check if already accepted/declined
    if (!banner || localStorage.getItem('primepet_cookies')) return;

    // Show banner after delay with animation
    setTimeout(() => {
        banner.classList.add('active');
    }, 1500);

    const closeBanner = (status) => {
        localStorage.setItem('primepet_cookies', status);
        banner.classList.remove('active');
    };

    if (acceptBtn) acceptBtn.addEventListener('click', () => closeBanner('accepted'));
    if (declineBtn) declineBtn.addEventListener('click', () => closeBanner('declined'));
}

// Scroll-triggered animations with Intersection Observer
function setupScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optionally unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in, .animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // Product cards get visible class for stagger animation
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => observer.observe(card));
}

// Animated number counters for stats
function setupNumberCounters() {
    const stats = document.querySelectorAll('.stat-number');

    const animateNumber = (element, target) => {
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateNumber = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString('de-DE');
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = target.toLocaleString('de-DE');
            }
        };

        updateNumber();
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                const text = entry.target.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                const suffix = text.replace(/[\d,.\s]/g, '');

                if (!isNaN(number)) {
                    animateNumber(entry.target, number);
                    entry.target.dataset.animated = 'true';
                }
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

// Smooth scroll for navigation links
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize application
function initApp() {
    console.log('🐾 PrimePet Shop wird initialisiert...');

    // Setup core functionality
    setupMobileMenu();
    setupActiveNavigation();
    setupBackToTop();
    setupLazyLoading();
    setupFormValidation();
    setupResizeHandler();
    setupKeyboardNavigation();
    setupCookieBanner();
    setupScrollAnimations();
    setupNumberCounters();
    setupSmoothScroll();

    // Initialize performance optimizations
    if (typeof initPerformance === 'function') {
        initPerformance();
    }

    // Initialize modules
    if (typeof initProducts === 'function') {
        initProducts();
        console.log('✅ Produkte geladen');
    }

    if (typeof initCart === 'function') {
        initCart();
        console.log('✅ Warenkorb initialisiert');
    }

    if (typeof initWishlist === 'function') {
        initWishlist();
        console.log('✅ Wunschliste initialisiert');
    }

    if (typeof initAnimations === 'function') {
        initAnimations();
        console.log('✅ Animationen aktiviert');
    }

    console.log('🎉 PrimePet Shop bereit!');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - pause animations if needed
    } else {
        // Page is visible - resume animations
    }
});

// Service Worker registration (for future PWA support)
if ('serviceWorker' in navigator) {
    // Uncomment when service worker is ready
    // navigator.serviceWorker.register('/sw.js');
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initApp };
}
