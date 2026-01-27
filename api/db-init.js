/**
 * Datenbank-Initialisierung
 * Erstellt die Produkttabelle falls nicht vorhanden
 */

const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Produkttabelle erstellen
        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(500) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                category VARCHAR(100) NOT NULL,
                description TEXT,
                image TEXT,
                rating INTEGER DEFAULT 5,
                badge VARCHAR(50),
                cj_pid VARCHAR(255) UNIQUE,
                cj_vid VARCHAR(255),
                cj_cost_price DECIMAL(10, 2),
                cj_stock INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Index auf cj_pid für schnellere Suche
        await sql`
            CREATE INDEX IF NOT EXISTS idx_products_cj_pid ON products(cj_pid);
        `;

        // Index auf category
        await sql`
            CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        `;

        return res.status(200).json({
            success: true,
            message: 'Datenbank erfolgreich initialisiert'
        });
    } catch (error) {
        console.error('Datenbank-Initialisierung fehlgeschlagen:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
