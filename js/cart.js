/* ===================================
   PrimePet - Shopping Cart Module
   =================================== */

// Shopping Cart Class
class ShoppingCart {
    constructor() {
        this.items = [];
        this.loadFromStorage();
    }

    // Add item to cart
    addItem(productId, quantity = 1) {
        const product = getProductById(productId);
        if (!product) return;

        const existingItem = this.items.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                productId: productId,
                quantity: quantity
            });
        }

        this.saveToStorage();
        this.updateUI();
        this.showNotification(`${product.name} wurde zum Warenkorb hinzugefügt`);
    }

    // Remove item from cart
    removeItem(productId) {
        this.items = this.items.filter(item => item.productId !== productId);
        this.saveToStorage();
        this.updateUI();
    }

    // Update quantity
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveToStorage();
                this.updateUI();
            }
        }
    }

    // Clear cart
    clearCart() {
        if (confirm('Möchten Sie wirklich den Warenkorb leeren?')) {
            this.items = [];
            this.saveToStorage();
            this.updateUI();
            this.showNotification('Warenkorb wurde geleert');
        }
    }

    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => {
            const product = getProductById(item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    // Get item count
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    // Save to localStorage
    saveToStorage() {
        localStorage.setItem('primepet_cart', JSON.stringify(this.items));
    }

    // Load from localStorage
    loadFromStorage() {
        const stored = localStorage.getItem('primepet_cart');
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
        this.updateCartBadge();
        this.renderCartItems();
        this.updateCartTotal();
    }

    // Update cart badge
    updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        if (badge) {
            const count = this.getItemCount();
            badge.textContent = count;
            badge.classList.toggle('update', count > 0);

            // Remove update class after animation
            setTimeout(() => badge.classList.remove('update'), 300);
        }
    }

    // Render cart items
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Ihr Warenkorb ist leer</p>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = this.items.map(item => {
            const product = getProductById(item.productId);
            if (!product) return '';

            return `
                <div class="cart-item" data-product-id="${product.id}">
                    <div class="cart-item-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${product.name}</h4>
                        <p class="cart-item-price">${formatPrice(product.price)}</p>
                        <div class="cart-item-actions">
                            <div class="quantity-control">
                                <button class="quantity-btn" onclick="cart.updateQuantity(${product.id}, ${item.quantity - 1})">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity-value">${item.quantity}</span>
                                <button class="quantity-btn" onclick="cart.updateQuantity(${product.id}, ${item.quantity + 1})">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="remove-btn" onclick="cart.removeItem(${product.id})">
                                <i class="fas fa-trash"></i>
                                Entfernen
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Update cart total
    updateCartTotal() {
        const totalPriceElement = document.getElementById('totalPrice');
        if (totalPriceElement) {
            totalPriceElement.textContent = formatPrice(this.getTotal());
        }

        const summaryTotalElement = document.getElementById('summaryTotal');
        if (summaryTotalElement) {
            summaryTotalElement.textContent = formatPrice(this.getTotal());
        }
    }

    // Show notification
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#10B981',
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

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Prepare checkout summary
    prepareCheckoutSummary() {
        const summaryItemsContainer = document.getElementById('summaryItems');
        if (!summaryItemsContainer) return;

        if (this.items.length === 0) {
            summaryItemsContainer.innerHTML = '<p>Keine Artikel im Warenkorb</p>';
            return;
        }

        summaryItemsContainer.innerHTML = this.items.map(item => {
            const product = getProductById(item.productId);
            if (!product) return '';

            const itemTotal = product.price * item.quantity;

            return `
                <div class="summary-item">
                    <span>${product.name} x ${item.quantity}</span>
                    <span>${formatPrice(itemTotal)}</span>
                </div>
            `;
        }).join('');
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Cart modal controls
function setupCartModal() {
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const clearCartBtn = document.getElementById('clearCartBtn');

    if (cartBtn && cartModal) {
        // Open cart
        cartBtn.addEventListener('click', () => {
            cartModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close cart
        const closeCart = () => {
            cartModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
        if (cartClose) cartClose.addEventListener('click', closeCart);

        // Clear cart
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => cart.clearCart());
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cartModal.classList.contains('active')) {
                closeCart();
            }
        });
    }
}

// Checkout modal controls
function setupCheckoutModal() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const checkoutClose = document.getElementById('checkoutClose');
    const checkoutForm = document.getElementById('checkoutForm');
    const cartModal = document.getElementById('cartModal');

    if (checkoutBtn && checkoutModal) {
        // Open checkout
        checkoutBtn.addEventListener('click', () => {
            if (cart.getItemCount() === 0) {
                alert('Ihr Warenkorb ist leer');
                return;
            }

            cart.prepareCheckoutSummary();
            checkoutModal.classList.add('active');

            // Close cart modal
            if (cartModal) {
                cartModal.classList.remove('active');
            }
        });

        // Close checkout
        const closeCheckout = () => {
            checkoutModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (checkoutOverlay) checkoutOverlay.addEventListener('click', closeCheckout);
        if (checkoutClose) checkoutClose.addEventListener('click', closeCheckout);

        // Handle form submission (Demo checkout - no payment, no CJ order)
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                processCheckout(false); // sendToCJ = false (demo mode, no payment)
            });
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && checkoutModal.classList.contains('active')) {
                closeCheckout();
            }
        });
    }
}

// Success modal controls
function setupSuccessModal() {
    const successModal = document.getElementById('successModal');
    const successClose = document.getElementById('successClose');

    if (successClose && successModal) {
        successClose.addEventListener('click', () => {
            successModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}

// Process checkout
// Send order to CJDropshipping
async function sendOrderToCJ(orderData, customerData) {
    try {
        console.log('Sending order to CJDropshipping...', orderData);

        // Get products from database to get cj_vid
        const productIds = orderData.items.map(item => item.id);
        const productsResponse = await fetch('/api/shop-products?action=list');
        const productsData = await productsResponse.json();

        if (!productsData.success) {
            console.error('Failed to load products for CJ order');
            return;
        }

        const products = productsData.products;

        // Build CJ order items with VID
        const cjItems = orderData.items.map(item => {
            const product = products.find(p => p.id === item.id);

            if (!product || !product.cj_vid) {
                console.warn(`Product ${item.id} has no cj_vid, skipping from CJ order`);
                return null;
            }

            return {
                vid: product.cj_vid,
                quantity: item.quantity,
                cj_pid: product.cj_pid
            };
        }).filter(Boolean); // Remove null entries

        if (cjItems.length === 0) {
            console.warn('No CJ products in order, skipping CJ order creation');
            return;
        }

        // Create CJ order payload
        const cjOrderData = {
            items: cjItems,
            customer: customerData
        };

        console.log('CJ Order Data:', cjOrderData);

        // Send to API
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cjOrderData)
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ CJ Order created:', result.cj_order_number);
        } else {
            console.error('❌ Failed to create CJ order:', result.error);
        }
    } catch (error) {
        console.error('Error sending order to CJ:', error);
    }
}

async function processCheckout(sendToCJ = false) {
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutForm = document.getElementById('checkoutForm');

    // Get customer data from form
    const customerData = {
        firstName: document.getElementById('firstName')?.value || '',
        lastName: document.getElementById('lastName')?.value || '',
        name: (document.getElementById('firstName')?.value || '') + ' ' + (document.getElementById('lastName')?.value || ''),
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        address: document.getElementById('address')?.value || '',
        zip: document.getElementById('zipCode')?.value || '',
        city: document.getElementById('city')?.value || '',
        country: 'DE'
    };

    // Create order data (from email.js)
    const orderData = createOrderData(customerData);

    // Save order to history (from email.js)
    saveOrderToHistory(orderData);

    // Send order to CJDropshipping ONLY if payment was successful
    if (sendToCJ) {
        console.log('✅ Payment successful - Sending order to CJDropshipping...');
        await sendOrderToCJ(orderData, customerData);
    } else {
        console.log('ℹ️ Demo checkout - NOT sending to CJDropshipping (no payment made)');
    }

    // Close checkout modal
    if (checkoutModal) {
        checkoutModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Show order confirmation modal with email options (from email.js)
    showOrderConfirmationModal(orderData);

    // Clear cart
    cart.items = [];
    cart.saveToStorage();
    cart.updateUI();

    // Reset form
    if (checkoutForm) {
        checkoutForm.reset();
    }
}

// PayPal Integration
function setupPayPalButtons() {
    // Wait for PayPal SDK to load
    if (typeof paypal === 'undefined') {
        console.warn('PayPal SDK not loaded yet');
        return;
    }

    const paypalContainer = document.getElementById('paypal-button-container');
    const standardBtn = document.getElementById('standardCheckoutBtn');
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const noticeText = document.getElementById('noticeText');

    if (!paypalContainer) return;

    // Toggle payment methods
    function togglePaymentMethod() {
        const selectedPayment = document.querySelector('input[name="payment"]:checked')?.value;

        if (selectedPayment === 'paypal') {
            paypalContainer.style.display = 'block';
            if (standardBtn) standardBtn.style.display = 'none';
            if (noticeText) noticeText.textContent = 'Sicher bezahlen mit PayPal - Käuferschutz inklusive';
        } else {
            paypalContainer.style.display = 'none';
            if (standardBtn) standardBtn.style.display = 'block';
            if (noticeText) noticeText.textContent = 'Demo-Version: Keine echte Zahlung erforderlich';
        }
    }

    // Listen to payment method changes
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', togglePaymentMethod);
    });

    // Initialize PayPal Buttons
    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 50
        },

        // Create Order
        createOrder: function(data, actions) {
            // Get cart total
            const total = cart.getTotal().toFixed(2);

            // Get customer details from form
            const firstName = document.getElementById('firstName')?.value || '';
            const lastName = document.getElementById('lastName')?.value || '';
            const email = document.getElementById('email')?.value || '';

            // Validate required fields
            if (!firstName || !lastName || !email) {
                alert('Bitte füllen Sie alle erforderlichen Felder aus.');
                return actions.reject();
            }

            return actions.order.create({
                purchase_units: [{
                    amount: {
                        currency_code: 'EUR',
                        value: total,
                        breakdown: {
                            item_total: {
                                currency_code: 'EUR',
                                value: total
                            }
                        }
                    },
                    items: cart.items.map(item => {
                        const product = getProductById(item.productId);
                        return {
                            name: product.name,
                            unit_amount: {
                                currency_code: 'EUR',
                                value: product.price.toFixed(2)
                            },
                            quantity: item.quantity.toString()
                        };
                    }),
                    description: 'PrimePet Bestellung',
                    soft_descriptor: 'PrimePet'
                }],
                payer: {
                    name: {
                        given_name: firstName,
                        surname: lastName
                    },
                    email_address: email
                }
            });
        },

        // On Approval
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                console.log('PayPal Payment Successful:', details);

                // Show success message
                cart.showNotification('Zahlung erfolgreich! Vielen Dank für Ihre Bestellung.');

                // Process checkout with CJ order (payment was successful)
                setTimeout(() => {
                    processCheckout(true); // sendToCJ = true
                }, 1000);
            });
        },

        // On Error
        onError: function(err) {
            console.error('PayPal Error:', err);
            alert('Es ist ein Fehler bei der PayPal-Zahlung aufgetreten. Bitte versuchen Sie es erneut.');
        },

        // On Cancel
        onCancel: function(data) {
            console.log('PayPal Payment Cancelled:', data);
            cart.showNotification('PayPal-Zahlung wurde abgebrochen.');
        }
    }).render('#paypal-button-container');

    // Initial toggle
    togglePaymentMethod();
}

// Initialize cart module
function initCart() {
    setupCartModal();
    setupCheckoutModal();
    setupSuccessModal();
    cart.updateUI();

    // Initialize PayPal after a short delay to ensure DOM is ready
    setTimeout(() => {
        setupPayPalButtons();
    }, 500);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShoppingCart };
}
