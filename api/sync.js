/**
 * Vercel Serverless Function: Lagerbestand-Synchronisation
 * Endpoint: /api/sync
 */

const CJDropshippingAPI = require('./lib/cj-api');

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

        // Access Token prüfen
        const tokenSuccess = await cjApi.getAccessToken();
        if (!tokenSuccess) {
            return res.status(500).json({
                success: false,
                error: 'Fehler bei der CJ API Authentifizierung'
            });
        }

        // Produkte aus Request-Body oder aus Query-Parameter
        let productsToSync = [];

        if (req.method === 'POST' && req.body && req.body.products) {
            productsToSync = req.body.products;
        } else {
            // Falls keine Produkte mitgegeben wurden, Dummy-Response
            return res.status(200).json({
                success: true,
                updated_count: 0,
                error_count: 0,
                total_products: 0,
                updates: [],
                message: 'Keine Produkte zum Synchronisieren',
                timestamp: new Date().toISOString()
            });
        }

        let updatedCount = 0;
        let errorCount = 0;
        const updates = [];

        // Für jedes Produkt den Lagerbestand aktualisieren
        for (const product of productsToSync) {
            if (product.cj_vid) {
                try {
                    const stockInfo = await cjApi.checkStock(product.cj_vid);

                    if (stockInfo) {
                        const oldStock = product.cj_stock || 0;
                        const newStock = stockInfo.availableStock || 0;

                        if (oldStock !== newStock) {
                            updates.push({
                                product_id: product.id,
                                product_name: product.name,
                                old_stock: oldStock,
                                new_stock: newStock
                            });
                        }

                        updatedCount++;

                        // Kleine Pause um API-Limits zu vermeiden
                        await new Promise(resolve => setTimeout(resolve, 200));
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    console.error(`Error syncing product ${product.id}:`, error);
                    errorCount++;
                }
            }
        }

        return res.status(200).json({
            success: true,
            updated_count: updatedCount,
            error_count: errorCount,
            total_products: productsToSync.length,
            updates,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({
            success: false,
            error: `Server-Fehler: ${error.message}`
        });
    }
};
