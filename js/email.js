/* ===================================
   PrimePet - Email Notification System
   =================================== */

// Email Configuration
const EMAIL_CONFIG = {
    shopEmail: 'info@primepet.de',
    shopName: 'PrimePet',
    shopUrl: 'https://www.primepet.de'
};

// Generate Order Confirmation Email HTML
function generateOrderConfirmationEmail(orderData) {
    const { orderId, items, total, customer, orderDate } = orderData;

    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                <strong>${item.name}</strong>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
                ${item.quantity}x
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                ${formatPrice(item.price * item.quantity)}
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bestellbestätigung - ${EMAIL_CONFIG.shopName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #6366F1, #4F46E5); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                🐾 ${EMAIL_CONFIG.shopName}
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">
                                Vielen Dank für Ihre Bestellung!
                            </p>
                        </td>
                    </tr>

                    <!-- Order Info -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                                Bestellbestätigung
                            </h2>

                            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                    <strong>Bestellnummer:</strong> #${orderId}
                                </p>
                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                    <strong>Bestelldatum:</strong> ${orderDate}
                                </p>
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                    <strong>Kunde:</strong> ${customer.name}
                                </p>
                            </div>

                            <!-- Customer Details -->
                            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                                Lieferadresse
                            </h3>
                            <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                ${customer.name}<br>
                                ${customer.address}<br>
                                ${customer.zip} ${customer.city}<br>
                                E-Mail: ${customer.email}<br>
                                Telefon: ${customer.phone || 'Nicht angegeben'}
                            </p>

                            <!-- Order Items -->
                            <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                                Bestellte Artikel
                            </h3>
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #f9fafb;">
                                        <th style="padding: 12px 10px; text-align: left; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                            Artikel
                                        </th>
                                        <th style="padding: 12px 10px; text-align: center; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                            Menge
                                        </th>
                                        <th style="padding: 12px 10px; text-align: right; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                            Preis
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>

                            <!-- Total -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                                <tr>
                                    <td style="padding: 10px 0; text-align: right; font-size: 14px; color: #6b7280;">
                                        Zwischensumme:
                                    </td>
                                    <td style="padding: 10px 0 10px 20px; text-align: right; font-size: 14px; color: #1f2937; font-weight: 500; width: 120px;">
                                        ${formatPrice(total)}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; text-align: right; font-size: 14px; color: #6b7280;">
                                        Versandkosten:
                                    </td>
                                    <td style="padding: 10px 0 10px 20px; text-align: right; font-size: 14px; color: #10b981; font-weight: 500;">
                                        Kostenlos
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0 0 0; border-top: 2px solid #e5e7eb; text-align: right; font-size: 18px; color: #1f2937; font-weight: 700;">
                                        Gesamtsumme:
                                    </td>
                                    <td style="padding: 15px 0 0 20px; border-top: 2px solid #e5e7eb; text-align: right; font-size: 18px; color: #6366f1; font-weight: 700;">
                                        ${formatPrice(total)}
                                    </td>
                                </tr>
                            </table>

                            <!-- Info Box -->
                            <div style="background-color: #eff6ff; border-left: 4px solid #6366f1; padding: 15px; margin-top: 30px; border-radius: 4px;">
                                <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6;">
                                    <strong>📦 Versandinformationen</strong><br>
                                    Ihre Bestellung wird innerhalb von 1-3 Werktagen bearbeitet und versandt.
                                    Sie erhalten eine separate E-Mail mit der Sendungsverfolgungsnummer,
                                    sobald Ihre Bestellung versandt wurde.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                Vielen Dank für Ihr Vertrauen in ${EMAIL_CONFIG.shopName}!
                            </p>
                            <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 12px;">
                                Bei Fragen erreichen Sie uns unter:
                                <a href="mailto:${EMAIL_CONFIG.shopEmail}" style="color: #6366f1; text-decoration: none;">
                                    ${EMAIL_CONFIG.shopEmail}
                                </a>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                                ${EMAIL_CONFIG.shopName} | Premium Haustierbedarf | ${EMAIL_CONFIG.shopUrl}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

// Generate Plain Text Version for Email Client
function generatePlainTextEmail(orderData) {
    const { orderId, items, total, customer, orderDate } = orderData;

    let itemsList = items.map(item =>
        `${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}`
    ).join('\n');

    return `
BESTELLBESTÄTIGUNG - ${EMAIL_CONFIG.shopName}
${'='.repeat(50)}

Vielen Dank für Ihre Bestellung!

BESTELLDETAILS
--------------
Bestellnummer: #${orderId}
Bestelldatum: ${orderDate}
Kunde: ${customer.name}

LIEFERADRESSE
-------------
${customer.name}
${customer.address}
${customer.zip} ${customer.city}
E-Mail: ${customer.email}
${customer.phone ? 'Telefon: ' + customer.phone : ''}

BESTELLTE ARTIKEL
-----------------
${itemsList}

ZUSAMMENFASSUNG
---------------
Zwischensumme: ${formatPrice(total)}
Versandkosten: Kostenlos
--------------
Gesamtsumme: ${formatPrice(total)}

VERSANDINFORMATIONEN
--------------------
Ihre Bestellung wird innerhalb von 1-3 Werktagen bearbeitet und versandt.
Sie erhalten eine separate E-Mail mit der Sendungsverfolgungsnummer.

Bei Fragen erreichen Sie uns unter: ${EMAIL_CONFIG.shopEmail}

Mit freundlichen Grüßen,
Ihr ${EMAIL_CONFIG.shopName} Team

${EMAIL_CONFIG.shopUrl}
    `.trim();
}

// Save Order to History
function saveOrderToHistory(orderData) {
    let orderHistory = JSON.parse(localStorage.getItem('primepet_order_history')) || [];
    orderHistory.unshift(orderData); // Add to beginning

    // Keep only last 50 orders
    if (orderHistory.length > 50) {
        orderHistory = orderHistory.slice(0, 50);
    }

    localStorage.setItem('primepet_order_history', JSON.stringify(orderHistory));
}

// Create Order Data from Cart
function createOrderData(customerData) {
    // Generate unique order ID
    const orderId = Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Get cart items
    const cartItems = cart.items.map(item => {
        const product = getProductById(item.productId);
        return {
            id: item.productId,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            image: product.image
        };
    });

    const orderDate = new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return {
        orderId,
        items: cartItems,
        total: cart.getTotal(),
        customer: customerData,
        orderDate,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
}

// Show Order Confirmation Modal
function showOrderConfirmationModal(orderData) {
    // Remove existing modal if any
    const existingModal = document.getElementById('orderConfirmationModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'orderConfirmationModal';
    modal.className = 'order-confirmation-modal';

    const emailHtml = generateOrderConfirmationEmail(orderData);
    const emailPlainText = generatePlainTextEmail(orderData);

    modal.innerHTML = `
        <div class="order-confirmation-overlay" onclick="closeOrderConfirmation()"></div>
        <div class="order-confirmation-content">
            <button class="order-confirmation-close" onclick="closeOrderConfirmation()">
                <i class="fas fa-times"></i>
            </button>

            <div class="order-confirmation-header">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Bestellung erfolgreich!</h2>
                <p>Vielen Dank für Ihre Bestellung #${orderData.orderId}</p>
            </div>

            <div class="order-confirmation-body">
                <div class="order-summary-card">
                    <h3><i class="fas fa-box"></i> Bestellübersicht</h3>
                    <div class="order-items-list">
                        ${orderData.items.map(item => `
                            <div class="order-item-row">
                                <span>${item.quantity}x ${item.name}</span>
                                <span>${formatPrice(item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-total-row">
                        <span>Gesamtsumme:</span>
                        <span class="order-total-price">${formatPrice(orderData.total)}</span>
                    </div>
                </div>

                <div class="order-actions">
                    <button class="btn btn-primary" onclick="sendOrderEmail('${orderData.orderId}')">
                        <i class="fas fa-envelope"></i> Per E-Mail versenden
                    </button>
                    <button class="btn btn-secondary" onclick="printOrderConfirmation('${orderData.orderId}')">
                        <i class="fas fa-print"></i> Drucken
                    </button>
                    <button class="btn btn-secondary" onclick="copyOrderToClipboard('${orderData.orderId}')">
                        <i class="fas fa-copy"></i> In Zwischenablage
                    </button>
                </div>

                <div class="order-info-box">
                    <i class="fas fa-info-circle"></i>
                    <p>Eine Bestellbestätigung wurde in Ihrem Browser gespeichert. Sie können diese jederzeit abrufen.</p>
                </div>
            </div>

            <div class="order-confirmation-footer">
                <button class="btn btn-primary btn-block" onclick="closeOrderConfirmation()">
                    Weiter einkaufen
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

// Send Order via Email (Default Email Client)
window.sendOrderEmail = function(orderId) {
    const orderHistory = JSON.parse(localStorage.getItem('primepet_order_history')) || [];
    const orderData = orderHistory.find(order => order.orderId === orderId);

    if (!orderData) {
        alert('Bestellung nicht gefunden.');
        return;
    }

    const plainText = generatePlainTextEmail(orderData);
    const subject = encodeURIComponent(`Bestellbestätigung #${orderData.orderId} - ${EMAIL_CONFIG.shopName}`);
    const body = encodeURIComponent(plainText);

    window.location.href = `mailto:${orderData.customer.email}?subject=${subject}&body=${body}`;
};

// Print Order Confirmation
window.printOrderConfirmation = function(orderId) {
    const orderHistory = JSON.parse(localStorage.getItem('primepet_order_history')) || [];
    const orderData = orderHistory.find(order => order.orderId === orderId);

    if (!orderData) {
        alert('Bestellung nicht gefunden.');
        return;
    }

    const emailHtml = generateOrderConfirmationEmail(orderData);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(emailHtml);
    printWindow.document.close();

    setTimeout(() => {
        printWindow.print();
    }, 500);
};

// Copy Order to Clipboard
window.copyOrderToClipboard = function(orderId) {
    const orderHistory = JSON.parse(localStorage.getItem('primepet_order_history')) || [];
    const orderData = orderHistory.find(order => order.orderId === orderId);

    if (!orderData) {
        alert('Bestellung nicht gefunden.');
        return;
    }

    const plainText = generatePlainTextEmail(orderData);

    navigator.clipboard.writeText(plainText).then(() => {
        showEmailNotification('Bestellbestätigung in Zwischenablage kopiert!', 'success');
    }).catch(err => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = plainText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        showEmailNotification('Bestellbestätigung in Zwischenablage kopiert!', 'success');
    });
};

// Close Order Confirmation Modal
window.closeOrderConfirmation = function() {
    const modal = document.getElementById('orderConfirmationModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
};

// Show Email Notification
function showEmailNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'email-notification';

    const bgColor = type === 'success' ? '#10B981' : '#EF4444';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: bgColor,
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: '10001',
        animation: 'slideInRight 0.3s ease-out',
        fontWeight: '500'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Helper function for price formatting (if not already available)
if (typeof formatPrice === 'undefined') {
    function formatPrice(price) {
        return price.toFixed(2).replace('.', ',') + ' €';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createOrderData,
        saveOrderToHistory,
        showOrderConfirmationModal,
        generateOrderConfirmationEmail
    };
}
