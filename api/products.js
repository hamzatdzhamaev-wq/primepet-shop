/**
 * Vercel Serverless Function: Produktimport von CJDropshipping
 * Endpoint: /api/products
 */

const CJDropshippingAPI = require('./lib/cj-api');

// Helper: Produkt für Shop formatieren
function formatProductForShop(cjProduct, customData = {}) {
    const categoryMap = {
        'Dog Supplies': 'hunde',
        'Cat Supplies': 'katzen',
        'Bird Supplies': 'vögel',
        'Small Animal Supplies': 'kleintiere',
        'Pet Toys': 'hunde'
    };

    const cjCategory = cjProduct.categoryName || 'Pet Toys';
    const category = categoryMap[cjCategory] || 'hunde';

    // Extract cost price - handle price ranges like "5.37 -- 9.64"
    let costPrice = 0;
    const sellPriceStr = String(cjProduct.sellPrice || 0);

    if (sellPriceStr.includes('--')) {
        // Price range - use the highest value
        const prices = sellPriceStr.split('--').map(p => parseFloat(p.trim()));
        costPrice = Math.max(...prices);
        console.log('DEBUG: Price range detected:', sellPriceStr, '-> Using max:', costPrice);
    } else {
        costPrice = parseFloat(sellPriceStr);
    }

    const markup = customData.markup || 1.5;
    const sellingPrice = Math.round(costPrice * markup * 100) / 100;

    console.log('DEBUG formatProductForShop:');
    console.log('- Raw sellPrice:', cjProduct.sellPrice);
    console.log('- Cost Price:', costPrice);
    console.log('- Markup from customData:', customData.markup);
    console.log('- Markup used:', markup);
    console.log('- Selling Price:', sellingPrice);

    // productImage kann String oder Array sein
    let productImage = '';
    if (cjProduct.productImage) {
        console.log('DEBUG productImage type:', typeof cjProduct.productImage);
        console.log('DEBUG productImage value:', cjProduct.productImage);
        console.log('DEBUG productImage isArray:', Array.isArray(cjProduct.productImage));

        if (typeof cjProduct.productImage === 'string') {
            // Wenn es ein JSON String ist, parsen
            try {
                const parsed = JSON.parse(cjProduct.productImage);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    productImage = parsed[0];
                    console.log('DEBUG: Parsed JSON array, using first element:', productImage);
                } else {
                    productImage = cjProduct.productImage;
                }
            } catch (e) {
                // Kein JSON, verwende als normalen String
                productImage = cjProduct.productImage;
            }
        } else if (Array.isArray(cjProduct.productImage) && cjProduct.productImage.length > 0) {
            productImage = cjProduct.productImage[0];
            console.log('DEBUG: Array detected, using first element:', productImage);
        }
    }

    console.log('DEBUG final productImage:', productImage);

    return {
        name: cjProduct.productNameEn || cjProduct.productName || 'Unbenanntes Produkt',
        price: sellingPrice,
        category: customData.category || category,
        description: cjProduct.description || cjProduct.productNameEn || '',
        image: productImage,
        rating: 5,
        badge: customData.badge || 'NEU',
        cj_pid: cjProduct.pid,
        cj_vid: cjProduct.vid || null,
        cj_cost_price: costPrice,
        cj_stock: cjProduct.availableStock || 0
    };
}

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const cjApi = new CJDropshippingAPI();

        // Access Token prüfen/anfordern
        const tokenSuccess = await cjApi.getAccessToken();
        if (!tokenSuccess) {
            return res.status(500).json({
                success: false,
                error: 'Fehler bei der CJ API Authentifizierung'
            });
        }

        const { action, page, pageSize, categoryId, pid, search } = req.query;

        switch (action) {
            case 'list': {
                // Produktliste abrufen
                const products = await cjApi.getProductList(
                    categoryId || null,
                    parseInt(page) || 1,
                    parseInt(pageSize) || 20,
                    search || null
                );

                if (products) {
                    return res.status(200).json({
                        success: true,
                        data: products
                    });
                } else {
                    return res.status(500).json({
                        success: false,
                        error: 'Fehler beim Abrufen der Produktliste'
                    });
                }
            }

            case 'detail': {
                // Produktdetails abrufen
                if (!pid) {
                    return res.status(400).json({
                        success: false,
                        error: 'Produkt-ID fehlt'
                    });
                }

                const productDetail = await cjApi.getProductDetail(pid);

                if (productDetail) {
                    return res.status(200).json({
                        success: true,
                        data: productDetail
                    });
                } else {
                    return res.status(500).json({
                        success: false,
                        error: 'Fehler beim Abrufen der Produktdetails'
                    });
                }
            }

            case 'import': {
                // Produkt importieren
                const body = req.body;

                if (!body || !body.pid) {
                    return res.status(400).json({
                        success: false,
                        error: 'Ungültige Daten'
                    });
                }

                const productDetail = await cjApi.getProductDetail(body.pid);

                if (!productDetail) {
                    return res.status(404).json({
                        success: false,
                        error: 'Produkt nicht gefunden'
                    });
                }

                const formattedProduct = formatProductForShop(productDetail, body);

                return res.status(200).json({
                    success: true,
                    product: formattedProduct,
                    message: 'Produkt erfolgreich importiert'
                });
            }

            case 'categories': {
                // Kategorien abrufen
                const categories = await cjApi.getCategories();

                if (categories) {
                    return res.status(200).json({
                        success: true,
                        data: categories
                    });
                } else {
                    return res.status(500).json({
                        success: false,
                        error: 'Fehler beim Abrufen der Kategorien'
                    });
                }
            }

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Ungültige Aktion'
                });
        }
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({
            success: false,
            error: `Server-Fehler: ${error.message}`
        });
    }
};
