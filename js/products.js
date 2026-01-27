/* ===================================
   PrimePet - Products Module
   =================================== */

// SVG Image Generator (Data URI - funktioniert garantiert ohne externe Verbindung)
function generateProductImage(text, bgColor, textColor = '#ffffff') {
    const svg = `<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
        <rect width="500" height="500" fill="${bgColor}"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="${textColor}">
            ${text}
        </text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// Product Database - wird von Datenbank geladen
let products = [];

// Current filter state
let currentFilter = 'alle';

// Produkte von Datenbank laden
async function loadProductsFromDatabase() {
    try {
        const response = await fetch('/api/shop-products?action=list');
        const data = await response.json();

        if (data.success) {
            products = data.products;
            renderProducts(currentFilter);
        } else {
            console.error('Fehler beim Laden der Produkte:', data.error);
        }
    } catch (error) {
        console.error('Fehler beim Laden der Produkte:', error);
    }
}

// Produkte beim Page Load laden
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProductsFromDatabase);
} else {
    loadProductsFromDatabase();
}

// Render products
function renderProducts(filter = 'alle') {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    currentFilter = filter;

    // Filter products
    const filteredProducts = filter === 'alle'
        ? products
        : products.filter(product => product.category === filter);

    // Clear grid
    productsGrid.innerHTML = '';

    // Render filtered products
    filteredProducts.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        productsGrid.appendChild(productCard);
    });

    // Trigger animations
    setTimeout(() => {
        const cards = productsGrid.querySelectorAll('.product-card');
        cards.forEach(card => card.classList.add('visible'));
    }, 100);
}

// Create product card element
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    card.style.cursor = 'pointer';

    // Generate star rating
    const stars = generateStars(product.rating);

    // Determine media content (Video or Image)
    let mediaHtml;
    if (product.video) {
        mediaHtml = `<video src="${product.video}" poster="${product.image}" controls muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>`;
    } else {
        mediaHtml = `<img src="${product.image}" alt="${product.name}" loading="lazy">`;
    }

    card.innerHTML = `
        <div class="product-image">
            ${mediaHtml}
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            <button class="wishlist-btn product-wishlist-btn" data-product-id="${product.id}" onclick="wishlist.toggleItem(${product.id}); event.stopPropagation();" aria-label="Zur Wunschliste hinzufügen">
                <i class="far fa-heart"></i>
            </button>
        </div>
        <div class="product-content">
            <div class="product-category">${getCategoryName(product.category)}</div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-rating">
                ${stars}
            </div>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
                <span class="product-price">${formatPrice(product.price)}</span>
                <button class="add-to-cart-btn" onclick="addToCartFromButton(${product.id})">
                    <i class="fas fa-cart-plus"></i>
                    In den Warenkorb
                </button>
            </div>
        </div>
    `;

    // Add click event to open product detail modal
    card.addEventListener('click', (e) => {
        // Don't open modal if clicking on buttons
        if (e.target.closest('.add-to-cart-btn') || e.target.closest('.wishlist-btn')) {
            return;
        }
        openProductDetail(product.id);
    });

    return card;
}

// Open Product Detail Modal
function openProductDetail(productId) {
    const product = getProductById(productId);
    if (!product) return;

    const modal = document.getElementById('productDetailModal');
    if (!modal) return;

    // Extract images from description
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = product.description || '';
    const descriptionImages = Array.from(tempDiv.querySelectorAll('img')).map(img => img.src);

    // Remove images from description
    tempDiv.querySelectorAll('img').forEach(img => img.remove());
    const cleanDescription = tempDiv.innerHTML;

    // Build image gallery
    const allImages = [product.image, ...descriptionImages].filter(Boolean);

    // Populate media with image gallery
    const mediaContainer = document.getElementById('productDetailMedia');
    if (product.video) {
        mediaContainer.innerHTML = `<video src="${product.video}" poster="${product.image}" controls autoplay muted loop style="max-width: 100%; max-height: 600px; object-fit: contain; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);"></video>`;
    } else {
        mediaContainer.innerHTML = `
            <div class="product-gallery">
                <div class="gallery-main">
                    <img id="galleryMainImage" src="${allImages[0]}" alt="${product.name}" style="max-width: 100%; max-height: 500px; object-fit: contain; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);">
                </div>
                ${allImages.length > 1 ? `
                <div class="gallery-thumbnails">
                    ${allImages.map((img, idx) => `
                        <img src="${img}"
                             alt="Bild ${idx + 1}"
                             class="gallery-thumb ${idx === 0 ? 'active' : ''}"
                             onclick="switchGalleryImage('${img}', ${idx})"
                             style="cursor: pointer;">
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
    }

    // Populate info
    document.getElementById('productDetailCategory').textContent = getCategoryName(product.category);
    document.getElementById('productDetailTitle').textContent = product.name;
    document.getElementById('productDetailRating').innerHTML = generateStars(product.rating);

    // Generate random review count for demo
    const reviewCount = Math.floor(Math.random() * 200) + 50;
    document.getElementById('productDetailReviews').textContent = `(${reviewCount} Bewertungen)`;

    document.getElementById('productDetailPrice').textContent = formatPrice(product.price);

    // Badge
    const badgeContainer = document.getElementById('productDetailBadge');
    if (product.badge) {
        badgeContainer.innerHTML = `<span class="product-badge">${product.badge}</span>`;
    } else {
        badgeContainer.innerHTML = '';
    }

    document.getElementById('productDetailDescription').innerHTML = cleanDescription;

    // Setup Add to Cart button
    const addToCartBtn = document.getElementById('productDetailAddToCart');
    addToCartBtn.onclick = () => {
        if (typeof cart !== 'undefined') {
            cart.addItem(product.id);
        }
    };

    // Setup Wishlist button
    const wishlistBtn = document.getElementById('productDetailWishlist');
    const wishlistIcon = wishlistBtn.querySelector('i');

    // Update wishlist button state
    if (typeof wishlist !== 'undefined' && wishlist.isInWishlist(product.id)) {
        wishlistBtn.classList.add('active');
        wishlistIcon.classList.remove('far');
        wishlistIcon.classList.add('fas');
    } else {
        wishlistBtn.classList.remove('active');
        wishlistIcon.classList.remove('fas');
        wishlistIcon.classList.add('far');
    }

    wishlistBtn.onclick = () => {
        if (typeof wishlist !== 'undefined') {
            wishlist.toggleItem(product.id);

            // Update button state
            if (wishlist.isInWishlist(product.id)) {
                wishlistBtn.classList.add('active');
                wishlistIcon.classList.remove('far');
                wishlistIcon.classList.add('fas');
            } else {
                wishlistBtn.classList.remove('active');
                wishlistIcon.classList.remove('fas');
                wishlistIcon.classList.add('far');
            }
        }
    };

    // Open modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Product Detail Modal
window.closeProductDetail = function() {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Switch Gallery Image
window.switchGalleryImage = function(imageSrc, index) {
    const mainImage = document.getElementById('galleryMainImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }

    // Update active thumbnail
    document.querySelectorAll('.gallery-thumb').forEach((thumb, idx) => {
        if (idx === index) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
};

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('productDetailModal');
        if (modal && modal.classList.contains('active')) {
            closeProductDetail();
        }
    }
});

// Generate star rating HTML
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

// Get category display name
function getCategoryName(category) {
    const categoryNames = {
        'hunde': 'Hunde',
        'katzen': 'Katzen',
        'vögel': 'Vögel',
        'kleintiere': 'Kleintiere'
    };
    return categoryNames[category] || category;
}

// Format price
function formatPrice(price) {
    const numPrice = parseFloat(price) || 0;
    return numPrice.toFixed(2).replace('.', ',') + ' €';
}

// Get product by ID
function getProductById(id) {
    return products.find(product => product.id === parseInt(id));
}

// Add to cart from button click
function addToCartFromButton(productId) {
    const product = getProductById(productId);
    if (product) {
        // Add animation to button
        const button = event.target.closest('.add-to-cart-btn');
        if (button) {
            button.classList.add('adding');
            setTimeout(() => button.classList.remove('adding'), 500);
        }

        // Add to cart (cart.js handles this)
        if (typeof cart !== 'undefined') {
            cart.addItem(productId);
        }
    }
}

// Setup filter buttons
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn, .category-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;

            // Update active state for filter buttons
            if (button.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
            }

            // Render products with filter
            renderProducts(filter);

            // Scroll to products section
            const productsSection = document.getElementById('products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Initialize products module
function initProducts() {
    renderProducts('alle');
    setupFilterButtons();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { products, getProductById, formatPrice };
}
