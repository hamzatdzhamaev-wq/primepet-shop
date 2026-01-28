/**
 * Database Migration Helper
 * Run migrations to update database schema
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
        console.log('Starting migration: add images field...');

        // Add images column
        await sql`
            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS images TEXT
        `;

        console.log('Images column added successfully');

        // Update existing products with their current image as array
        const updateResult = await sql`
            UPDATE products
            SET images = CASE
                WHEN image IS NOT NULL AND image != '' THEN json_build_array(image)::text
                ELSE '[]'
            END
            WHERE images IS NULL OR images = ''
        `;

        console.log('Existing products updated:', updateResult.rowCount);

        return res.status(200).json({
            success: true,
            message: 'Migration erfolgreich durchgeführt',
            updated: updateResult.rowCount
        });
    } catch (error) {
        console.error('Migration Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
