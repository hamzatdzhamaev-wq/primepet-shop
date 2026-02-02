/* ===================================
   PrimePet - Admin Logic
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Security check: Redirect if not logged in
    if (localStorage.getItem('primepet_isAdmin') !== 'true') {
        window.location.href = 'login.html';
        return; // Stop executing script
    }

    renderAdminList();
    updateStatistics();
    setupMediaPreviews();
    setupFormSubmit();
    setupCancelButton();
    setupLogoutButton();
    setupSearchAndFilter();
    setupImportExport();
});

// Add new product
function setupFormSubmit() {
    const form = document.getElementById('addProductForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = document.getElementById('pId').value;
        
        // Handle File Uploads
        const imageFile = document.getElementById('pImageFile').files[0];
        const videoFile = document.getElementById('pVideoFile').files[0];
        let imageUrl = document.getElementById('pImage').value;
        let videoUrl = document.getElementById('pVideo').value;

        try {
            if (imageFile) {
                imageUrl = await readFileAsBase64(imageFile);
            }
            if (videoFile) {
                videoUrl = await readFileAsBase64(videoFile);
            }
        } catch (err) {
            alert('Fehler beim Lesen der Datei: ' + err);
            return;
        }

        if (!imageUrl) {
            showNotification('Bitte ein Bild hochladen oder eine URL eingeben.', 'error');
            return;
        }

        let currentProducts = JSON.parse(localStorage.getItem('primepet_products')) || [];

        if (productId) {
            // Editing existing product
            const productIndex = currentProducts.findIndex(p => p.id == productId);
            if (productIndex > -1) {
                currentProducts[productIndex] = {
                    ...currentProducts[productIndex],
                    name: document.getElementById('pName').value,
                    category: document.getElementById('pCategory').value,
                    price: parseFloat(document.getElementById('pPrice').value),
                    rating: parseInt(document.getElementById('pRating').value),
                    image: imageUrl,
                    video: videoUrl || null,
                    description: document.getElementById('pDesc').value,
                    badge: document.getElementById('pBadge').value || null,
                };
                showNotification('Produkt erfolgreich aktualisiert!', 'success');
            }
        } else {
            // Adding new product
            const newId = currentProducts.length > 0 ? Math.max(...currentProducts.map(p => p.id)) + 1 : 1;
            const newProduct = {
                id: newId,
                name: document.getElementById('pName').value,
                category: document.getElementById('pCategory').value,
                price: parseFloat(document.getElementById('pPrice').value),
                rating: parseInt(document.getElementById('pRating').value),
                image: imageUrl,
                video: videoUrl || null,
                description: document.getElementById('pDesc').value,
                badge: document.getElementById('pBadge').value || null
            };
            currentProducts.push(newProduct);
            showNotification('Produkt erfolgreich hinzugefügt!', 'success');
        }

        try {
            localStorage.setItem('primepet_products', JSON.stringify(currentProducts));
            resetForm();
            renderAdminList();
            updateStatistics();
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                showNotification('Speicher voll! Das Bild oder Video ist zu groß. Bitte kleinere Dateien verwenden oder URLs nutzen.', 'error');
            } else {
                showNotification('Fehler beim Speichern: ' + e.message, 'error');
            }
        }
    });
}

// Delete product
window.deleteProduct = async function(id) {
    if(confirm('Möchten Sie dieses Produkt wirklich löschen?')) {
        try {
            const response = await fetch(`/api/shop-products?action=delete&id=${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                showNotification('Produkt erfolgreich gelöscht!', 'success');
                renderAdminList();
                updateStatistics();
            } else {
                showNotification('Fehler beim Löschen: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Fehler beim Löschen:', error);
            showNotification('Verbindungsfehler beim Löschen', 'error');
        }
    }
};

// Helper to read file as Base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Media Preview Helper (Image & Video)
function setupMediaPreviews() {
    const urlInput = document.getElementById('pImage');
    const fileInput = document.getElementById('pImageFile');
    const imgPreview = document.getElementById('imagePreview');

    const updatePreview = (src, element) => {
        if (src) {
            element.src = src;
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    };

    urlInput.addEventListener('input', () => updatePreview(urlInput.value, imgPreview));
    fileInput.addEventListener('change', async () => {
        if (fileInput.files[0]) {
            const base64 = await readFileAsBase64(fileInput.files[0]);
            updatePreview(base64, imgPreview);
        }
    });

    // Video Preview
    const videoUrlInput = document.getElementById('pVideo');
    const videoFileInput = document.getElementById('pVideoFile');
    const videoPreview = document.getElementById('videoPreview');

    videoUrlInput.addEventListener('input', () => updatePreview(videoUrlInput.value, videoPreview));
    videoFileInput.addEventListener('change', async () => {
        if (videoFileInput.files[0]) {
            const base64 = await readFileAsBase64(videoFileInput.files[0]);
            updatePreview(base64, videoPreview);
        }
    });
}

// Start editing a product
window.startEditProduct = function(id) {
    const currentProducts = JSON.parse(localStorage.getItem('primepet_products')) || [];
    const product = currentProducts.find(p => p.id === id);
    if (!product) return;

    // Populate form
    document.getElementById('pId').value = product.id;
    document.getElementById('pName').value = product.name;
    document.getElementById('pCategory').value = product.category;
    document.getElementById('pPrice').value = product.price;
    document.getElementById('pRating').value = product.rating || 5;
    document.getElementById('pImage').value = product.image;
    document.getElementById('pVideo').value = (product.video && !product.video.startsWith('data:')) ? product.video : '';
    document.getElementById('pDesc').value = product.description;
    document.getElementById('pBadge').value = product.badge || '';

    // Show image preview
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.src = product.image;
    imagePreview.style.display = 'block';

    // Show video preview if exists
    const videoPreview = document.getElementById('videoPreview');
    if (product.video) {
        videoPreview.src = product.video;
        videoPreview.style.display = 'block';
    } else {
        videoPreview.style.display = 'none';
    }

    // Update UI to edit mode
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-pencil-alt"></i> Produkt bearbeiten';
    document.getElementById('submitBtn').textContent = 'Änderungen speichern';
    document.getElementById('cancelBtn').style.display = 'block';

    // Scroll to form for better UX
    document.getElementById('addProductForm').scrollIntoView({ behavior: 'smooth' });
}

// Reset form to "Add" mode
function resetForm() {
    const form = document.getElementById('addProductForm');
    form.reset();

    document.getElementById('pId').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('videoPreview').style.display = 'none';
    document.getElementById('pImageFile').value = '';
    document.getElementById('pVideoFile').value = '';

    // Update UI to add mode
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Neues Produkt';
    document.getElementById('submitBtn').textContent = 'Produkt hinzufügen';
    document.getElementById('cancelBtn').style.display = 'none';
}

// Setup cancel button
function setupCancelButton() {
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', () => {
        resetForm();
    });
}

// Setup logout button
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Möchten Sie sich wirklich abmelden?')) {
                localStorage.removeItem('primepet_isAdmin');
                window.location.href = 'login.html';
            }
        });
    }
}

// Helper function from products.js to avoid 'not defined' error in admin panel
function formatPrice(price) {
    const numPrice = parseFloat(price) || 0;
    return numPrice.toFixed(2).replace('.', ',') + ' €';
}

// Update Statistics Dashboard
async function updateStatistics() {
    try {
        const response = await fetch('/api/shop-products?action=list');
        const data = await response.json();

        if (data.success) {
            const currentProducts = data.products;

            // Total Products
            document.getElementById('statTotalProducts').textContent = currentProducts.length;

            // Total Value
            const totalValue = currentProducts.reduce((sum, p) => sum + parseFloat(p.price || 0), 0);
            document.getElementById('statTotalValue').textContent = formatPrice(totalValue);

            // Categories (unique)
            const categories = new Set(currentProducts.map(p => p.category));
            document.getElementById('statCategories').textContent = categories.size;
        }
    } catch (error) {
        console.error('Fehler beim Laden der Statistiken:', error);
    }
}

// Search and Filter Products
function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchProducts');
    const filterSelect = document.getElementById('filterCategory');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderAdminList(searchInput.value, filterSelect.value);
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            renderAdminList(searchInput.value, filterSelect.value);
        });
    }
}

// Enhanced renderAdminList with search and filter
async function renderAdminList(searchTerm = '', categoryFilter = 'alle') {
    const tbody = document.getElementById('adminProductTable');
    const countSpan = document.getElementById('productCount');

    try {
        // Produkte aus Datenbank laden
        const response = await fetch('/api/shop-products?action=list');
        const data = await response.json();

        if (!data.success) {
            console.error('Fehler beim Laden der Produkte:', data.error);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;">Fehler beim Laden der Produkte</td></tr>';
            return;
        }

        let currentProducts = data.products;

        // Apply filters
        if (searchTerm) {
            currentProducts = currentProducts.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (categoryFilter && categoryFilter !== 'alle') {
            currentProducts = currentProducts.filter(p => p.category === categoryFilter);
        }

        countSpan.textContent = `${currentProducts.length} Produkte`;
        tbody.innerHTML = '';

        if (currentProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;">Keine Produkte gefunden</td></tr>';
            return;
        }

        // Sort by newest first
        const sortedProducts = [...currentProducts].sort((a, b) => b.id - a.id);

        sortedProducts.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${product.image}" class="table-img" alt="${product.name}"></td>
                <td>
                    <strong>${product.name}</strong><br>
                    <small style="color:var(--text-secondary)">${product.badge || ''}</small>
                    <div style="margin-top: 0.25rem;">${'⭐'.repeat(product.rating || 5)}</div>
                </td>
                <td><span style="text-transform:capitalize">${product.category}</span></td>
                <td>${formatPrice(product.price)}</td>
                <td class="actions">
                    <button class="action-btn btn-edit" onclick="editProduct(${product.id})" title="Bearbeiten">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="action-btn" style="background: var(--primary-color);" onclick="duplicateProduct(${product.id})" title="Duplizieren">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteProduct(${product.id})" title="Löschen">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Fehler beim Laden der Produkte:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;">Verbindungsfehler</td></tr>';
    }
}

// Duplicate Product
window.duplicateProduct = function(id) {
    const currentProducts = JSON.parse(localStorage.getItem('primepet_products')) || [];
    const product = currentProducts.find(p => p.id === id);
    if (!product) return;

    const newId = Math.max(...currentProducts.map(p => p.id)) + 1;
    const duplicatedProduct = {
        ...product,
        id: newId,
        name: product.name + ' (Kopie)',
        badge: null
    };

    currentProducts.push(duplicatedProduct);
    localStorage.setItem('primepet_products', JSON.stringify(currentProducts));

    showNotification('Produkt erfolgreich dupliziert!', 'success');
    renderAdminList();
    updateStatistics();
};

// Export Products as JSON
window.exportProducts = function() {
    const currentProducts = JSON.parse(localStorage.getItem('primepet_products')) || [];
    const dataStr = JSON.stringify(currentProducts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `primepet_products_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showNotification('Produkte erfolgreich exportiert!', 'success');
};

// Import Products from JSON
function setupImportExport() {
    const importInput = document.getElementById('importFile');
    if (importInput) {
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedProducts = JSON.parse(event.target.result);

                    // Validate that it's an array
                    if (!Array.isArray(importedProducts)) {
                        throw new Error('Ungültiges Format');
                    }

                    // Confirm before overwriting
                    if (confirm(`${importedProducts.length} Produkte gefunden. Möchten Sie die aktuellen Produkte ersetzen?`)) {
                        localStorage.setItem('primepet_products', JSON.stringify(importedProducts));
                        renderAdminList();
                        updateStatistics();
                        showNotification('Produkte erfolgreich importiert!', 'success');
                    }
                } catch (err) {
                    showNotification('Fehler beim Importieren: ' + err.message, 'error');
                }

                // Reset input
                importInput.value = '';
            };
            reader.readAsText(file);
        });
    }
}

// Edit Product
window.editProduct = async function(id) {
    try {
        const response = await fetch(`/api/shop-products?action=get&id=${id}`);
        const data = await response.json();

        if (data.success && data.product) {
            const product = data.product;

            // Fill form fields
            document.getElementById('editProductId').value = product.id;
            document.getElementById('editProductName').value = product.name;
            document.getElementById('editProductCategory').value = product.category;
            document.getElementById('editProductPrice').value = parseFloat(product.price);
            document.getElementById('editProductBadge').value = product.badge || '';
            document.getElementById('editProductImage').value = product.image || '';
            document.getElementById('editProductDescription').value = product.description || '';

            // Open modal
            const modal = document.getElementById('editProductModal');
            modal.style.display = 'flex';
        } else {
            showNotification('Produkt nicht gefunden', 'error');
        }
    } catch (error) {
        console.error('Fehler beim Laden des Produkts:', error);
        showNotification('Verbindungsfehler beim Laden', 'error');
    }
};

// Close Edit Modal
window.closeEditModal = function() {
    const modal = document.getElementById('editProductModal');
    modal.style.display = 'none';
};

// Save Product
window.saveProduct = async function(event) {
    event.preventDefault();

    const id = document.getElementById('editProductId').value;
    const product = {
        name: document.getElementById('editProductName').value,
        category: document.getElementById('editProductCategory').value,
        price: parseFloat(document.getElementById('editProductPrice').value),
        badge: document.getElementById('editProductBadge').value,
        image: document.getElementById('editProductImage').value,
        description: document.getElementById('editProductDescription').value,
        rating: 5,
        cj_stock: 0
    };

    try {
        const response = await fetch(`/api/shop-products?action=update&id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Produkt erfolgreich aktualisiert!', 'success');
            closeEditModal();
            renderAdminList();
            updateStatistics();
        } else {
            showNotification('Fehler beim Speichern: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
        showNotification('Verbindungsfehler beim Speichern', 'error');
    }
};

// Show Notification (Toast)
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'admin-notification';

    const bgColor = type === 'success' ? 'var(--success-color)' : 'var(--danger-color)';
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
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease-out',
        fontWeight: '500'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/* ===================================
   Orders Management Functions
   =================================== */

// Switch between tabs
window.switchTab = function(tab) {
    const productsTab = document.getElementById('productsTab');
    const ordersTab = document.getElementById('ordersTab');
    const tabButtons = document.querySelectorAll('.tab-btn');

    if (tab === 'products') {
        productsTab.style.display = 'grid';
        ordersTab.style.display = 'none';
    } else if (tab === 'orders') {
        productsTab.style.display = 'none';
        ordersTab.style.display = 'block';
        loadOrders(); // Load orders when tab is opened
    }

    // Update tab button styles
    tabButtons.forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.style.borderColor = 'var(--primary-color)';
            btn.style.color = 'var(--primary-color)';
            btn.classList.add('active');
        } else {
            btn.style.borderColor = 'var(--border-color)';
            btn.style.color = 'var(--text-secondary)';
            btn.classList.remove('active');
        }
    });
};

// Load orders from database
async function loadOrders(searchTerm = '', statusFilter = 'all') {
    const tbody = document.getElementById('ordersTable');
    const countSpan = document.getElementById('orderCount');

    try {
        const response = await fetch('/api/shop-orders?action=list');
        const data = await response.json();

        if (!data.success) {
            console.error('Fehler beim Laden der Bestellungen:', data.error);
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;">Fehler beim Laden der Bestellungen</td></tr>';
            return;
        }

        let orders = data.orders;

        // Apply filters
        if (searchTerm) {
            orders = orders.filter(o =>
                o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter && statusFilter !== 'all') {
            orders = orders.filter(o => o.order_status === statusFilter);
        }

        countSpan.textContent = `${orders.length} Bestellungen`;
        tbody.innerHTML = '';

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;">Keine Bestellungen gefunden</td></tr>';
            return;
        }

        orders.forEach(order => {
            const tr = document.createElement('tr');
            const orderDate = new Date(order.created_at).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const statusColors = {
                'pending': '#F59E0B',
                'processing': '#3B82F6',
                'completed': '#10B981',
                'cancelled': '#EF4444'
            };

            const statusLabels = {
                'pending': 'Ausstehend',
                'processing': 'In Bearbeitung',
                'completed': 'Abgeschlossen',
                'cancelled': 'Storniert'
            };

            tr.innerHTML = `
                <td><strong>#${order.order_id}</strong></td>
                <td>${order.customer_name}</td>
                <td>${order.customer_email}</td>
                <td>${orderDate}</td>
                <td><strong>${formatPrice(order.total_amount)}</strong></td>
                <td>
                    <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 1rem; background: ${statusColors[order.order_status] || '#6B7280'}; color: white; font-size: 0.75rem; font-weight: 600;">
                        ${statusLabels[order.order_status] || order.order_status}
                    </span>
                </td>
                <td class="actions">
                    <button class="action-btn btn-edit" onclick="viewOrderDetails(${order.id})" title="Details anzeigen">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" style="background: var(--success-color);" onclick="updateOrderStatus(${order.id}, 'completed')" title="Als abgeschlossen markieren">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteOrder(${order.id})" title="Löschen">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update statistics
        updateOrderStatistics();
    } catch (error) {
        console.error('Fehler beim Laden der Bestellungen:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;">Verbindungsfehler</td></tr>';
    }
}

// View order details
window.viewOrderDetails = async function(orderId) {
    try {
        const response = await fetch(`/api/shop-orders?action=get&id=${orderId}`);
        const data = await response.json();

        if (!data.success) {
            showNotification('Bestellung nicht gefunden', 'error');
            return;
        }

        const order = data.order;
        const orderDate = new Date(order.created_at).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Parse items (might be string or object)
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

        const itemsHtml = items.map(item => `
            <div style="display: flex; gap: 1rem; padding: 1rem; border-bottom: 1px solid #E5E7EB;">
                <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <div style="font-weight: 600;">${item.name}</div>
                    <div style="color: #6B7280; font-size: 0.875rem;">Menge: ${item.quantity}x</div>
                </div>
                <div style="font-weight: 600;">${formatPrice(item.price * item.quantity)}</div>
            </div>
        `).join('');

        const content = `
            <div style="background: #F9FAFB; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div>
                        <div style="font-size: 0.875rem; color: #6B7280;">Bestellnummer</div>
                        <div style="font-weight: 600;">#${order.order_id}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.875rem; color: #6B7280;">Bestelldatum</div>
                        <div style="font-weight: 600;">${orderDate}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.875rem; color: #6B7280;">Status</div>
                        <div style="font-weight: 600; text-transform: capitalize;">${order.order_status}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.875rem; color: #6B7280;">Zahlungsstatus</div>
                        <div style="font-weight: 600; text-transform: capitalize;">${order.payment_status}</div>
                    </div>
                </div>
            </div>

            <h3 style="margin: 1.5rem 0 1rem 0; font-size: 1.125rem;">Kundeninformationen</h3>
            <div style="background: #F9FAFB; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <p style="margin: 0 0 0.5rem 0;"><strong>Name:</strong> ${order.customer_name}</p>
                <p style="margin: 0 0 0.5rem 0;"><strong>E-Mail:</strong> ${order.customer_email}</p>
                <p style="margin: 0 0 0.5rem 0;"><strong>Telefon:</strong> ${order.customer_phone || 'Nicht angegeben'}</p>
                <p style="margin: 0 0 0.5rem 0;"><strong>Adresse:</strong><br>${order.customer_address}<br>${order.customer_zip} ${order.customer_city}, ${order.customer_country}</p>
            </div>

            <h3 style="margin: 1.5rem 0 1rem 0; font-size: 1.125rem;">Bestellte Artikel</h3>
            <div style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; margin-bottom: 1.5rem;">
                ${itemsHtml}
            </div>

            <div style="text-align: right; padding: 1rem; background: #F9FAFB; border-radius: 8px;">
                <div style="font-size: 1.25rem; font-weight: 700;">Gesamt: ${formatPrice(order.total_amount)}</div>
            </div>

            ${order.cj_order_number ? `
                <div style="margin-top: 1rem; padding: 1rem; background: #DBEAFE; border-radius: 8px; color: #1E40AF;">
                    <strong>CJ Bestellnummer:</strong> ${order.cj_order_number}
                </div>
            ` : ''}

            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                <select id="orderStatusSelect" style="flex: 1; padding: 0.75rem; border: 1px solid #E5E7EB; border-radius: 8px;">
                    <option value="pending" ${order.order_status === 'pending' ? 'selected' : ''}>Ausstehend</option>
                    <option value="processing" ${order.order_status === 'processing' ? 'selected' : ''}>In Bearbeitung</option>
                    <option value="completed" ${order.order_status === 'completed' ? 'selected' : ''}>Abgeschlossen</option>
                    <option value="cancelled" ${order.order_status === 'cancelled' ? 'selected' : ''}>Storniert</option>
                </select>
                <button onclick="updateOrderStatus(${order.id}, document.getElementById('orderStatusSelect').value)" style="padding: 0.75rem 2rem; border: none; border-radius: 8px; background: #6366F1; color: white; cursor: pointer; font-weight: 600;">
                    Status aktualisieren
                </button>
            </div>
        `;

        document.getElementById('orderDetailContent').innerHTML = content;
        document.getElementById('orderDetailModal').style.display = 'flex';
    } catch (error) {
        console.error('Fehler beim Laden der Bestelldetails:', error);
        showNotification('Fehler beim Laden der Bestelldetails', 'error');
    }
};

// Close order detail modal
window.closeOrderDetailModal = function() {
    document.getElementById('orderDetailModal').style.display = 'none';
};

// Update order status
window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        const response = await fetch(`/api/shop-orders?action=update&id=${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_status: newStatus
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Status erfolgreich aktualisiert!', 'success');
            closeOrderDetailModal();
            loadOrders();
        } else {
            showNotification('Fehler beim Aktualisieren: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Fehler beim Aktualisieren:', error);
        showNotification('Verbindungsfehler', 'error');
    }
};

// Delete order
window.deleteOrder = async function(orderId) {
    if (!confirm('Möchten Sie diese Bestellung wirklich löschen?')) {
        return;
    }

    try {
        const response = await fetch(`/api/shop-orders?action=delete&id=${orderId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Bestellung gelöscht!', 'success');
            loadOrders();
        } else {
            showNotification('Fehler beim Löschen: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Fehler beim Löschen:', error);
        showNotification('Verbindungsfehler', 'error');
    }
};

// Update order statistics
async function updateOrderStatistics() {
    try {
        const response = await fetch('/api/shop-orders?action=stats');
        const data = await response.json();

        if (data.success) {
            document.getElementById('statTotalOrders').textContent = data.stats.total;
            document.getElementById('statRevenue').textContent = formatPrice(data.stats.revenue);
        }
    } catch (error) {
        console.error('Fehler beim Laden der Statistiken:', error);
    }
}

// Setup order search and filter
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchOrders');
    const filterSelect = document.getElementById('filterOrderStatus');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            loadOrders(searchInput.value, filterSelect.value);
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            loadOrders(searchInput.value, filterSelect.value);
        });
    }

    // Load order statistics on page load
    updateOrderStatistics();
});