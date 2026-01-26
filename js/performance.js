/* ===================================
   PrimePet - Performance Optimization Module
   =================================== */

// Image Lazy Loading with Intersection Observer
function setupAdvancedLazyLoading() {
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Load image
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }

                    // Load srcset if available
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }

                    // Add loaded class for fade-in animation
                    img.classList.add('loaded');

                    // Stop observing this image
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px', // Load images 50px before they enter viewport
            threshold: 0.01
        });

        // Observe all lazy images
        const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }
        });
    }
}

// WebP Support Detection and Image Optimization
function supportsWebP() {
    const elem = document.createElement('canvas');

    if (elem.getContext && elem.getContext('2d')) {
        // Check WebP support
        return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    return false;
}

// Add WebP class to HTML if supported
function setupWebPSupport() {
    if (supportsWebP()) {
        document.documentElement.classList.add('webp');
    } else {
        document.documentElement.classList.add('no-webp');
    }
}

// Preload Critical Resources
function preloadCriticalResources() {
    // Preload hero image
    const heroImage = new Image();
    heroImage.src = 'HERO.png';

    // Preload logo
    const logo = new Image();
    logo.src = 'images/logo.svg';
}

// Optimize Images by adding width and height attributes (prevent layout shift)
function optimizeImageAttributes() {
    const images = document.querySelectorAll('img:not([width]):not([height])');

    images.forEach(img => {
        // Skip if image already has dimensions
        if (img.width && img.height) return;

        // Once loaded, add dimensions to prevent layout shift
        if (img.complete && img.naturalHeight !== 0) {
            img.setAttribute('width', img.naturalWidth);
            img.setAttribute('height', img.naturalHeight);
        } else {
            img.addEventListener('load', function() {
                this.setAttribute('width', this.naturalWidth);
                this.setAttribute('height', this.naturalHeight);
            }, { once: true });
        }
    });
}

// Defer non-critical CSS
function deferNonCriticalCSS() {
    const links = document.querySelectorAll('link[rel="stylesheet"][media="print"]');
    links.forEach(link => {
        link.media = 'all';
    });
}

// Compress and optimize localStorage (clean old data)
function optimizeLocalStorage() {
    try {
        // Check localStorage size
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }

        // If localStorage is getting full (> 4MB), clean old data
        if (totalSize > 4 * 1024 * 1024) {
            console.warn('localStorage is getting full. Consider cleaning old data.');

            // Remove old abandoned carts (older than 7 days)
            const cartTimestamp = localStorage.getItem('primepet_cart_timestamp');
            if (cartTimestamp) {
                const daysSince = (Date.now() - parseInt(cartTimestamp)) / (1000 * 60 * 60 * 24);
                if (daysSince > 7) {
                    localStorage.removeItem('primepet_cart');
                    localStorage.removeItem('primepet_cart_timestamp');
                }
            }
        }
    } catch (e) {
        console.error('Error optimizing localStorage:', e);
    }
}

// Performance Monitoring
function setupPerformanceMonitoring() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const connectTime = perfData.responseEnd - perfData.requestStart;
                const renderTime = perfData.domComplete - perfData.domLoading;

                console.log('🚀 Performance Metrics:');
                console.log(`Page Load Time: ${(pageLoadTime / 1000).toFixed(2)}s`);
                console.log(`Connection Time: ${(connectTime / 1000).toFixed(2)}s`);
                console.log(`Render Time: ${(renderTime / 1000).toFixed(2)}s`);

                // Send to analytics if needed
                // analytics.send('pageLoad', pageLoadTime);
            }, 0);
        });
    }
}

// Reduce JavaScript Execution Time
function optimizeScriptExecution() {
    // Use requestIdleCallback for non-critical tasks
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            optimizeImageAttributes();
            optimizeLocalStorage();
        });
    } else {
        // Fallback to setTimeout
        setTimeout(() => {
            optimizeImageAttributes();
            optimizeLocalStorage();
        }, 1000);
    }
}

// Service Worker for Offline Support (PWA)
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Uncomment when service worker is ready
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered', reg))
        //     .catch(err => console.error('Service Worker registration failed', err));
    }
}

// Initialize Performance Optimizations
function initPerformance() {
    console.log('⚡ Initializing Performance Optimizations...');

    // Run immediately
    setupWebPSupport();
    preloadCriticalResources();
    setupAdvancedLazyLoading();

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            optimizeScriptExecution();
            setupPerformanceMonitoring();
        });
    } else {
        optimizeScriptExecution();
        setupPerformanceMonitoring();
    }

    // Register Service Worker (optional)
    // registerServiceWorker();

    console.log('✅ Performance Optimizations Active');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initPerformance };
}
