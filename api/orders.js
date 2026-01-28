/**
 * Vercel Serverless Function: Bestellweiterleitung an CJDropshipping
 * Endpoint: /api/orders
 */

const CJDropshippingAPI = require('./lib/cj-api');

// Helper: Bestellung für CJ formatieren
function formatOrderForCJ(shopOrder) {
    console.log('Formatting order for CJ:', shopOrder);

    const products = shopOrder.items.map(item => ({
        vid: item.vid,
        quantity: item.quantity
    }));

    const customer = shopOrder.customer;
    const shippingAddress = {
        countryCode: customer?.country || 'DE',
        firstName: customer?.firstName || '',
        lastName: customer?.lastName || '',
        addressLine1: customer?.address || '',
        city: customer?.city || '',
        zip: customer?.zip || '',
        phone: customer?.phone || '',
        email: customer?.email || ''
    };

    console.log('CJ Shipping Address:', shippingAddress);
    console.log('CJ Products:', products);

    return {
        orderNumber: `PRIME-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        shippingAddress,
        products,
        logisticName: shopOrder.shipping_method || 'CJ Standard',
        remark: shopOrder.notes || ''
    };
}

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Nur POST-Anfragen erlaubt'
        });
    }

    try {
        const shopOrder = req.body;

        if (!shopOrder || !shopOrder.items) {
            return res.status(400).json({
                success: false,
                error: 'Ungültige Bestelldaten'
            });
        }

        const cjApi = new CJDropshippingAPI();

        // Access Token prüfen
        const tokenSuccess = await cjApi.getAccessToken();
        if (!tokenSuccess) {
            return res.status(500).json({
                success: false,
                error: 'Fehler bei der CJ API Authentifizierung'
            });
        }

        // Bestellung formatieren und senden
        const orderData = formatOrderForCJ(shopOrder);
        const result = await cjApi.createOrder(orderData);

        if (result) {
            return res.status(200).json({
                success: true,
                cj_order_number: result.orderNum,
                message: 'Bestellung erfolgreich an CJDropshipping weitergeleitet'
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Fehler beim Erstellen der Bestellung bei CJDropshipping'
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
