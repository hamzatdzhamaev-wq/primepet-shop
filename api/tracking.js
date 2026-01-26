/**
 * Vercel Serverless Function: Tracking-Informationen von CJDropshipping
 * Endpoint: /api/tracking
 */

const CJDropshippingAPI = require('./lib/cj-api');

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Nur GET-Anfragen erlaubt'
        });
    }

    try {
        const { orderNumber } = req.query;

        if (!orderNumber) {
            return res.status(400).json({
                success: false,
                error: 'Bestellnummer fehlt'
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

        // Tracking-Informationen abrufen
        const trackingInfo = await cjApi.getTrackingInfo(orderNumber);

        if (trackingInfo) {
            return res.status(200).json({
                success: true,
                tracking: trackingInfo
            });
        } else {
            return res.status(404).json({
                success: false,
                error: 'Keine Tracking-Informationen gefunden'
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
