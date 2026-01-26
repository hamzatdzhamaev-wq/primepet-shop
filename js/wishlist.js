/* ===================================
   PrimePet - Wishlist/Favorites Module
   =================================== */

// Wishlist Class
class Wishlist {
    constructor() {
        this.items = [];
        this.loadFromStorage();
    }

    // Add item to wishlist
    addItem(productId) {
        if (!this.isInWishlist(productId)) {
            this.items.push(productId);
            this.saveToStorage();
            this.updateUI();
            this.showNotification('Produkt zur Wunschliste hinzugefügt');
            return true;
        }
        return false;
    }

    // Remove item from wishlist
    removeItem(productId) {
        this.items = this.items.filter(id => id !== productId);
        this.saveToStorage();
        this.updateUI();
        this.showNotification('Produkt von Wunschliste entfernt');
    }

    // Toggle item in wishlist
    toggleItem(productId) {
        if (this.isInWishlist(productId)) {
            this.removeItem(productId);
        } else {
            this.addItem(productId);
        }
    }

    // Check if item is in wishlist
    isInWishlist(productId) {
        return this.items.includes(parseInt(productId));
    }

    // Get item count
    getItemCount() {
        return this.items.length;
    }

    // Save to localStorage
    saveToStorage() {
        localStorage.setItem('primepet_wishlist', JSON.stringify(this.items));
    }

    // Load from localStorage
    loadFromStorage() {
        const stored = localStorage.getItem('primepet_wishlist');
        if (stored) {
            try {
                this.items = JSON.parse(stored);
            } catch (e) {
                this.items = [];
            }
        }
    }

    // Update UI
    updateUI() {
        this.updateWishlistBadge();
        this.updateWishlistIcons();
    }

    // Update wishlist badge
    updateWishlistBadge() {
        const badge = document.getElementById('wishlistBadge');
        if (badge) {
            const count = this.getItemCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // Update wishlist icons on product cards
    updateWishlistIcons() {
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        wishlistButtons.forEach(btn => {
            const productId = parseInt(btn.dataset.productId);
            const icon = btn.querySelector('i');

            if (this.isInWishlist(productId)) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                btn.classList.add('active');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                btn.classList.remove('active');
            }
        });
    }

    // Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification wishlist-notification';
        notification.innerHTML = `
            <i class="fas fa-heart"></i>
            <span>${message}</span>
        `;

        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#EC4899',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            zIndex: '9999',
            animation: 'slideInRight 0.3s ease-out',
            fontWeight: '500'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Render wishlist modal content
    renderWishlistModal() {
        const wishlistItemsContainer = document.getElementById('wishlistItems');
        if (!wishlistItemsContainer) return;

        if (this.items.length === 0) {
            wishlistItemsContainer.innerHTML = `
                <div class="wishlist-empty">
                    <i class="far fa-heart"></i>
                    <p>Ihre Wunschliste ist leer</p>
                    <a href="#products" class="btn btn-primary" onclick="document.getElementById('wishlistModal').classList.remove('active');">Produkte entdecken</a>
                </div>
            `;
            return;
        }

        wishlistItemsContainer.innerHTML = this.items.map(productId => {
            const product = getProductById(productId);
            if (!product) return '';

            return `
                <div class="wishlist-item" data-product-id="${product.id}">
                    <div class="wishlist-item-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="wishlist-item-details">
                        <h4 class="wishlist-item-title">${product.name}</h4>
                        <div class="wishlist-item-rating">
                            ${generateStars(product.rating)}
                        </div>
                        <p class="wishlist-item-price">${formatPrice(product.price)}</p>
                        <div class="wishlist-item-actions">
                            <button class="btn btn-primary btn-sm" onclick="addToCartFromWishlist(${product.id})">
                                <i class="fas fa-cart-plus"></i>
                                In den Warenkorb
                            </button>
                            <button class="btn-remove" onclick="wishlist.removeItem(${product.id})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Initialize wishlist
const wishlist = new Wishlist();

// Helper function to generate stars (reuse from products.js)
function generateStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHtml += '<i class="fas fa-star"></i>';
        } else {
            starsHtml += '<i class="far fa-star"></i>';
        }
    }
    return starsHtml;
}

// Add to cart from wishlist
function addToCartFromWishlist(productId) {
    if (typeof cart !== 'undefined') {
        cart.addItem(productId);
        wishlist.removeItem(productId);
    }
}

// Setup wishlist modal
function setupWishlistModal() {
    const wishlistBtn = document.getElementById('wishlistBtn');
    const wishlistModal = document.getElementById('wishlistModal');
    const wishlistOverlay = document.getElementById('wishlistOverlay');
    const wishlistClose = document.getElementById('wishlistClose');

    if (wishlistBtn && wishlistModal) {
        // Open wishlist
        wishlistBtn.addEventListener('click', () => {
            wishlist.renderWishlistModal();
            wishlistModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close wishlist
        const closeWishlist = () => {
            wishlistModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (wishlistOverlay) wishlistOverlay.addEventListener('click', closeWishlist);
        if (wishlistClose) wishlistClose.addEventListener('click', closeWishlist);

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && wishlistModal.classList.contains('active')) {
                closeWishlist();
            }
        });
    }
}

// Initialize wishlist module
function initWishlist() {
    setupWishlistModal();
    wishlist.updateUI();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Wishlist };
}
