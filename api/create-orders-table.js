/**
 * Datenbank-Migration: Orders Tabelle erstellen
 * Speichert Kundenbestellungen mit allen Details
 */

const { sql } = require('@vercel/postgres');

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
        console.log('Creating orders table...');

        // Bestellungen-Tabelle erstellen
        await sql`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                order_id VARCHAR(50) UNIQUE NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(50),
                customer_address TEXT NOT NULL,
                customer_zip VARCHAR(20) NOT NULL,
                customer_city VARCHAR(100) NOT NULL,
                customer_country VARCHAR(10) DEFAULT 'DE',
                items JSONB NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                payment_method VARCHAR(50),
                payment_status VARCHAR(50) DEFAULT 'pending',
                order_status VARCHAR(50) DEFAULT 'pending',
                cj_order_number VARCHAR(255),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        console.log('Orders table created successfully');

        // Indizes für schnellere Suche
        await sql`
            CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
        `;

        console.log('Indexes created successfully');

        return res.status(200).json({
            success: true,
            message: 'Orders-Tabelle erfolgreich erstellt'
        });
    } catch (error) {
        console.error('Migration Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
