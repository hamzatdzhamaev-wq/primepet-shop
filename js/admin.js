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
    return price.toFixed(2).replace('.', ',') + ' €';
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
                    <button class="action-btn btn-edit" onclick="startEditProduct(${product.id})" title="Bearbeiten">
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