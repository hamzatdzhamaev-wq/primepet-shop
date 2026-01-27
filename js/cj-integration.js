/**
 * CJDropshipping Integration Frontend
 * Verwaltung des Produktimports von CJDropshipping
 */

let currentPage = 1;
let totalPages = 1;
let allProducts = [];

// Beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadProducts();
    updateStats();
});

/**
 * Prüft ob Benutzer eingeloggt ist
 */
function checkAuthentication() {
    const isAdmin = localStorage.getItem('primepet_isAdmin');
    if (isAdmin !== 'true') {
        window.location.href = 'login.html';
    }
}

/**
 * Produkte von CJDropshipping laden
 */
async function loadProducts(page = 1) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const productGrid = document.getElementById('productGrid');

    loadingIndicator.style.display = 'block';
    productGrid.innerHTML = '';

    try {
        const response = await fetch(`/api/products?action=list&page=${page}&pageSize=20`);
        const data = await response.json();

        if (data.success) {
            allProducts = data.data.list || [];
            totalPages = data.data.totalPages || 1;
            currentPage = page;

            renderProducts(allProducts);
            renderPagination();

            document.getElementById('statTotalProducts').textContent = data.data.total || 0;
        } else {
            showAlert('error', 'Fehler beim Laden der Produkte: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('error', 'Verbindungsfehler: Stelle sicher, dass die API konfiguriert ist.');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Produkte rendern
 */
function renderProducts(products) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';

    if (products.length === 0) {
        productGrid.innerHTML = '<p style="text-align: center; padding: 2rem; grid-column: 1/-1;">Keine Produkte gefunden</p>';
        return;
    }

    products.forEach(product => {
        const card = createProductCard(product);
        productGrid.appendChild(card);
    });
}

/**
 * Produktkarte erstellen
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'cj-product-card';

    // productImage kann String oder Array sein
    let imageUrl = 'https://via.placeholder.com/300x200?text=Kein+Bild';
    if (product.productImage) {
        if (typeof product.productImage === 'string') {
            imageUrl = product.productImage;
        } else if (Array.isArray(product.productImage) && product.productImage.length > 0) {
            imageUrl = product.productImage[0];
        }
    }
    const stock = product.availableStock || 999;
    const isAvailable = product.saleStatus === 3 || product.saleStatus === '3';
    const price = parseFloat(product.sellPrice || 0);
    const sellingPrice = (price * 1.5).toFixed(2); // 50% Aufschlag

    let stockClass = 'stock-available';
    let stockText = 'Auf Lager';

    if (!isAvailable) {
        stockClass = 'stock-out';
        stockText = 'Nicht verfügbar';
    } else if (product.availableStock && product.availableStock < 10) {
        stockClass = 'stock-low';
        stockText = `Niedriger Bestand (${product.availableStock})`;
    }

    card.innerHTML = `
        <img src="${imageUrl}" alt="${product.productNameEn || 'Produkt'}" class="cj-product-image"
             onerror="this.src='https://via.placeholder.com/300x200?text=Bild+nicht+verfügbar'">
        <div class="cj-product-content">
            <h3 class="cj-product-title">${product.productNameEn || product.productName || 'Unbenanntes Produkt'}</h3>
            <div class="cj-product-price">€${sellingPrice}</div>
            <div class="cj-product-stock ${stockClass}">
                <i class="fas fa-box"></i> ${stockText}
            </div>

            <div class="import-settings">
                <div class="form-group">
                    <label class="form-label">Kategorie</label>
                    <select class="form-select" id="category-${product.pid}">
                        <option value="hunde">Hunde</option>
                        <option value="katzen">Katzen</option>
                        <option value="vögel">Vögel</option>
                        <option value="kleintiere">Kleintiere</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Gewinnaufschlag (%)</label>
                    <input type="number" class="form-input" id="markup-${product.pid}" value="50" min="0" max="200">
                </div>

                <div class="form-group">
                    <label class="form-label">Badge (optional)</label>
                    <select class="form-select" id="badge-${product.pid}">
                        <option value="">Kein Badge</option>
                        <option value="NEU">NEU</option>
                        <option value="Bestseller">Bestseller</option>
                        <option value="Sale">Sale</option>
                    </select>
                </div>

                <button class="btn-import" onclick="importProduct('${product.pid}')" ${!isAvailable ? 'disabled' : ''}>
                    <i class="fas fa-download"></i> Produkt importieren
                </button>
            </div>
        </div>
    `;

    return card;
}

/**
 * Produkt importieren
 */
async function importProduct(pid) {
    const category = document.getElementById(`category-${pid}`).value;
    const markup = parseFloat(document.getElementById(`markup-${pid}`).value) / 100 + 1;
    const badge = document.getElementById(`badge-${pid}`).value;

    try {
        const response = await fetch('/api/products?action=import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pid: pid,
                category: category,
                markup: markup,
                badge: badge
            })
        });

        const data = await response.json();

        if (data.success) {
            // Produkt in localStorage speichern
            let products = JSON.parse(localStorage.getItem('primepet_products')) || [];
            products.push(data.product);
            localStorage.setItem('primepet_products', JSON.stringify(products));

            showAlert('success', 'Produkt erfolgreich importiert!');
            updateStats();
        } else {
            showAlert('error', 'Fehler beim Importieren: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('error', 'Verbindungsfehler beim Importieren');
    }
}

/**
 * Pagination rendern
 */
function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => loadProducts(currentPage - 1);
    paginationContainer.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        pageBtn.textContent = i;
        pageBtn.onclick = () => loadProducts(i);
        paginationContainer.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => loadProducts(currentPage + 1);
    paginationContainer.appendChild(nextBtn);
}

/**
 * Produkte suchen
 */
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;

    let filtered = allProducts;

    if (searchTerm) {
        filtered = filtered.filter(p =>
            (p.productNameEn && p.productNameEn.toLowerCase().includes(searchTerm)) ||
            (p.productName && p.productName.toLowerCase().includes(searchTerm))
        );
    }

    // Note: Category filtering würde eine Mapping-Logik erfordern
    // zwischen CJ-Kategorien und PrimePet-Kategorien

    renderProducts(filtered);
}

/**
 * Lagerbestand synchronisieren
 */
async function syncStock() {
    showAlert('info', 'Synchronisiere Lagerbestände... Dies kann einige Minuten dauern.');

    try {
        // Produkte aus localStorage holen
        const products = JSON.parse(localStorage.getItem('primepet_products')) || [];
        const cjProducts = products.filter(p => p.cj_vid);

        const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ products: cjProducts })
        });
        const data = await response.json();

        if (data.success) {
            showAlert('success', `Lagerbestand erfolgreich synchronisiert! ${data.updated_count} Produkte aktualisiert.`);

            // Stats aktualisieren
            document.getElementById('statLastSync').textContent = 'Gerade eben';

            // localStorage aktualisieren falls sync-File vorhanden
            if (data.updates && data.updates.length > 0) {
                console.log('Sync-Updates:', data.updates);
            }
        } else {
            showAlert('error', 'Fehler bei der Synchronisation: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('error', 'Verbindungsfehler bei der Synchronisation');
    }
}

/**
 * Statistiken aktualisieren
 */
function updateStats() {
    const products = JSON.parse(localStorage.getItem('primepet_products')) || [];
    const importedProducts = products.filter(p => p.cj_pid).length;

    document.getElementById('statImportedProducts').textContent = importedProducts;

    // Letzte Sync-Zeit aus localStorage (falls vorhanden)
    const lastSync = localStorage.getItem('last_cj_sync');
    if (lastSync) {
        const syncDate = new Date(lastSync);
        const now = new Date();
        const diffMinutes = Math.floor((now - syncDate) / 60000);

        if (diffMinutes < 60) {
            document.getElementById('statLastSync').textContent = `vor ${diffMinutes} Min.`;
        } else if (diffMinutes < 1440) {
            document.getElementById('statLastSync').textContent = `vor ${Math.floor(diffMinutes / 60)} Std.`;
        } else {
            document.getElementById('statLastSync').textContent = syncDate.toLocaleDateString('de-DE');
        }
    }
}

/**
 * Alert anzeigen
 */
function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;

    alertContainer.appendChild(alert);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.3s';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}
