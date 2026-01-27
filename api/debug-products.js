/**
 * Debug Endpoint: Zeigt Produktdaten aus Datenbank
 */

const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const result = await sql`
            SELECT id, name, image, cj_pid
            FROM products
            ORDER BY created_at DESC
            LIMIT 10
        `;

        return res.status(200).json({
            success: true,
            products: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
