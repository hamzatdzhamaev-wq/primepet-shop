/**
 * CJDropshipping API Client - Node.js Version
 * Für Vercel Serverless Functions
 */

const fetch = require('node-fetch');

class CJDropshippingAPI {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.CJ_API_KEY;
        this.baseUrl = 'https://developers.cjdropshipping.com/api2.0/v1';
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Logging-Funktion
     */
    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}] ${message}`);
    }

    /**
     * Access Token anfordern
     */
    async getAccessToken() {
        try {
            this.log('Fordere Access Token an...');

            const response = await fetch(`${this.baseUrl}/authentication/getAccessToken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.apiKey
                })
            });

            const data = await response.json();

            if (data.code === 200 && data.data) {
                this.accessToken = data.data.accessToken;
                this.refreshToken = data.data.refreshToken;
                this.tokenExpiry = Date.now() + (15 * 24 * 60 * 60 * 1000); // 15 Tage

                this.log('Access Token erfolgreich erhalten', 'SUCCESS');
                return true;
            }

            this.log(`Fehler beim Abrufen des Access Tokens: ${JSON.stringify(data)}`, 'ERROR');
            return false;
        } catch (error) {
            this.log(`Exception beim Abrufen des Access Tokens: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Access Token auffrischen
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            return this.getAccessToken();
        }

        try {
            this.log('Frische Access Token auf...');

            const response = await fetch(`${this.baseUrl}/authentication/refreshAccessToken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken
                })
            });

            const data = await response.json();

            if (data.code === 200 && data.data) {
                this.accessToken = data.data.accessToken;
                this.tokenExpiry = Date.now() + (15 * 24 * 60 * 60 * 1000);

                this.log('Access Token erfolgreich aufgefrischt', 'SUCCESS');
                return true;
            }

            this.log('Token-Refresh fehlgeschlagen, fordere neuen an...', 'WARNING');
            return this.getAccessToken();
        } catch (error) {
            this.log(`Exception beim Auffrischen des Tokens: ${error.message}`, 'ERROR');
            return this.getAccessToken();
        }
    }

    /**
     * Prüfen ob Token abgelaufen ist
     */
    isTokenExpired() {
        if (!this.tokenExpiry) return true;
        return Date.now() >= (this.tokenExpiry - 3600000); // 1 Stunde Puffer
    }

    /**
     * HTTP Request durchführen
     */
    async makeRequest(endpoint, method = 'GET', data = null, requireAuth = true) {
        try {
            this.log(`API Request: ${method} ${endpoint}`, 'DEBUG');

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            if (requireAuth) {
                if (this.isTokenExpired()) {
                    await this.refreshAccessToken();
                }

                if (this.accessToken) {
                    headers['CJ-Access-Token'] = this.accessToken;
                }
            }

            const options = {
                method,
                headers,
                timeout: 30000
            };

            if (method === 'POST' && data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            const result = await response.json();

            this.log(`Response Code: ${response.status}`, 'DEBUG');
            return result;
        } catch (error) {
            this.log(`Request Error: ${error.message}`, 'ERROR');
            return null;
        }
    }

    /**
     * Produktliste abrufen
     */
    async getProductList(categoryId = null, page = 1, pageSize = 20) {
        this.log(`Rufe Produktliste ab (Seite: ${page})...`);

        const data = {
            pageNum: page,
            pageSize: pageSize
        };

        if (categoryId) {
            data.categoryId = categoryId;
        }

        const response = await this.makeRequest('/product/list/query', 'POST', data);

        if (response && response.code === 200) {
            this.log(`Produktliste erfolgreich abgerufen: ${response.data?.list?.length || 0} Produkte`);
            return response.data;
        }

        this.log(`Fehler beim Abrufen der Produktliste: ${JSON.stringify(response)}`, 'ERROR');
        return null;
    }

    /**
     * Produktdetails abrufen
     */
    async getProductDetail(pid) {
        this.log(`Rufe Produktdetails ab für PID: ${pid}`);

        const response = await this.makeRequest('/product/query', 'POST', { pid });

        if (response && response.code === 200) {
            this.log('Produktdetails erfolgreich abgerufen');
            return response.data;
        }

        this.log(`Fehler beim Abrufen der Produktdetails: ${JSON.stringify(response)}`, 'ERROR');
        return null;
    }

    /**
     * Kategorien abrufen
     */
    async getCategories() {
        this.log('Rufe Kategorien ab...');

        const response = await this.makeRequest('/product/category/list', 'GET');

        if (response && response.code === 200) {
            this.log('Kategorien erfolgreich abgerufen');
            return response.data;
        }

        this.log(`Fehler beim Abrufen der Kategorien: ${JSON.stringify(response)}`, 'ERROR');
        return null;
    }

    /**
     * Bestellung erstellen
     */
    async createOrder(orderData) {
        this.log('Erstelle Bestellung bei CJDropshipping...');

        const response = await this.makeRequest('/shopping/order/createOrder', 'POST', orderData);

        if (response && response.code === 200) {
            this.log(`Bestellung erfolgreich erstellt: ${response.data?.orderNum}`, 'SUCCESS');
            return response.data;
        }

        this.log(`Fehler beim Erstellen der Bestellung: ${JSON.stringify(response)}`, 'ERROR');
        return null;
    }

    /**
     * Bestellstatus abrufen
     */
    async getOrderStatus(orderNumber) {
        this.log(`Rufe Bestellstatus ab für: ${orderNumber}`);

        const response = await this.makeRequest('/shopping/order/query', 'POST', { orderNum: orderNumber });

        if (response && response.code === 200) {
            this.log('Bestellstatus erfolgreich abgerufen');
            return response.data;
        }

        this.log(`Fehler beim Abrufen des Bestellstatus: ${JSON.stringify(response)}`, 'ERROR');
        return null;
    }

    /**
     * Tracking-Informationen abrufen
     */
    async getTrackingInfo(orderNumber) {
        this.log(`Rufe Tracking-Informationen ab für: ${orderNumber}`);

        const response = await this.makeRequest('/logistic/trackQuery', 'POST', { orderNumber });

        if (response && response.code === 200) {
            this.log('Tracking-Informationen erfolgreich abgerufen');
            return response.data;
        }

        this.log(`Fehler beim Abrufen der Tracking-Informationen: ${JSON.stringify(response)}`, 'ERROR');
        return null;
    }

    /**
     * Lagerbestand prüfen
     */
    async checkStock(vid) {
        this.log(`Prüfe Lagerbestand für VID: ${vid}`);

        const response = await this.makeRequest('/product/variant/queryByVid', 'POST', { vid });

        if (response && response.code === 200) {
            this.log('Lagerbestand erfolgreich abgerufen');
            return response.data;
        }

        this.log(`Fehler beim Abrufen des Lagerbestands: ${JSON.stringify(response)}`, 'ERROR');
        return null;
    }
}

module.exports = CJDropshippingAPI;
