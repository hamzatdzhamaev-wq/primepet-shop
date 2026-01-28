/**
 * CJDropshipping Integration Frontend
 * Verwaltung des Produktimports von CJDropshipping
 */

let currentPage = 1;
let totalPages = 1;
let allProducts = [];
let currentSearch = '';

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
async function loadProducts(page = 1, searchTerm = null) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const productGrid = document.getElementById('productGrid');

    loadingIndicator.style.display = 'block';
    productGrid.innerHTML = '';

    // Aktuellen Suchbegriff speichern
    if (searchTerm !== null) {
        currentSearch = searchTerm;
    }

    try {
        let url = `/api/products?action=list&page=${page}&pageSize=20`;
        if (currentSearch) {
            url += `&search=${encodeURIComponent(currentSearch)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            allProducts = data.data.list || [];
            // totalPages aus total und pageSize berechnen
            const totalProducts = data.data.total || 0;
            totalPages = Math.ceil(totalProducts / 20);
            currentPage = page;

            renderProducts(allProducts);
            renderPagination();

            document.getElementById('statTotalProducts').textContent = totalProducts;

            // Zeige Nachricht wenn keine Produkte gefunden
            if (allProducts.length === 0) {
                productGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                        <i class="fas fa-search" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                        <h3>Keine Produkte gefunden</h3>
                        <p style="opacity: 0.7; margin-bottom: 1rem;">
                            ${currentSearch ? `Keine Ergebnisse für "${currentSearch}"` : 'Versuche andere Suchbegriffe'}
                        </p>
                        <button class="btn-primary" onclick="document.getElementById('searchInput').value=''; currentSearch=''; loadProducts(1, '');">
                            <i class="fas fa-redo"></i> Alle Produkte anzeigen
                        </button>
                    </div>
                `;
            }
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
    const markupPercent = parseFloat(document.getElementById(`markup-${pid}`).value);
    const markup = markupPercent / 100 + 1;
    const badge = document.getElementById(`badge-${pid}`).value;

    console.log('DEBUG Import:', { pid, category, markupPercent, markup, badge });

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
        console.log('DEBUG Import response:', data);

        if (data.success) {
            console.log('DEBUG Product to save:', data.product);
            console.log('DEBUG Product price:', data.product.price);

            // Produkt in Datenbank speichern
            const saveResponse = await fetch('/api/shop-products?action=add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data.product)
            });

            const saveData = await saveResponse.json();
            console.log('DEBUG Save response:', saveData);

            if (saveData.success) {
                showAlert('success', 'Produkt erfolgreich in Shop importiert!');
                updateStats();
            } else {
                if (saveData.error === 'Produkt bereits vorhanden') {
                    showAlert('warning', 'Produkt wurde bereits importiert!');
                } else {
                    showAlert('error', 'Fehler beim Speichern: ' + saveData.error);
                }
            }
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
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Zurück';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => loadProducts(currentPage - 1);
    paginationContainer.appendChild(prevBtn);

    // Seitenanzeige
    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Seite ${currentPage} von ${totalPages.toLocaleString('de-DE')}`;
    pageInfo.style.margin = '0 15px';
    pageInfo.style.fontWeight = 'bold';
    paginationContainer.appendChild(pageInfo);

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = 'Weiter <i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => loadProducts(currentPage + 1);
    paginationContainer.appendChild(nextBtn);
}

/**
 * Produkte suchen
 */
function searchProducts() {
    const searchInput = document.getElementById('searchInput').value.trim();
    const categoryFilter = document.getElementById('categoryFilter').value;

    // Suchbegriff erstellen
    let searchTerm = searchInput;

    // Wenn Kategorie ausgewählt ist, füge relevante Keywords hinzu
    if (categoryFilter && categoryFilter !== '') {
        const categoryKeywords = {
            'hunde': 'dog pet puppy',
            'katzen': 'cat kitten',
            'vögel': 'bird parrot',
            'kleintiere': 'rabbit hamster guinea'
        };

        const keyword = categoryKeywords[categoryFilter];
        if (keyword) {
            searchTerm = searchTerm ? `${searchTerm} ${keyword}` : keyword;
        }
    }

    // Neue Suche starten (lädt Seite 1 mit Suchbegriff)
    loadProducts(1, searchTerm);
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
async function updateStats() {
    try {
        const response = await fetch('/api/shop-products?action=list');
        const data = await response.json();

        if (data.success) {
            const importedProducts = data.products.filter(p => p.cj_pid).length;
            document.getElementById('statImportedProducts').textContent = importedProducts;
        }
    } catch (error) {
        console.error('Fehler beim Laden der Statistiken:', error);
    }

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
