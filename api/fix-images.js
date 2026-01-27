/**
 * Migration Script: Repariert Bild-URLs in der Datenbank
 * Konvertiert JSON-stringified Arrays zu einfachen URLs
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
        // Alle Produkte abrufen
        const result = await sql`
            SELECT id, image FROM products
        `;

        let fixedCount = 0;
        let skippedCount = 0;
        const errors = [];

        for (const product of result.rows) {
            const { id, image } = product;

            // Prüfen ob das Bild ein JSON Array ist
            if (image && image.startsWith('[')) {
                try {
                    // JSON parsen
                    const imageArray = JSON.parse(image);

                    if (Array.isArray(imageArray) && imageArray.length > 0) {
                        // Erste URL extrahieren
                        const firstImageUrl = imageArray[0];

                        // In Datenbank aktualisieren
                        await sql`
                            UPDATE products
                            SET image = ${firstImageUrl}
                            WHERE id = ${id}
                        `;

                        fixedCount++;
                        console.log(`Fixed product ${id}: ${firstImageUrl}`);
                    } else {
                        skippedCount++;
                        console.log(`Skipped product ${id}: Empty array`);
                    }
                } catch (error) {
                    errors.push({
                        id,
                        error: error.message
                    });
                    console.error(`Error fixing product ${id}:`, error);
                }
            } else {
                skippedCount++;
                console.log(`Skipped product ${id}: Already correct format`);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Bild-Migration abgeschlossen',
            statistics: {
                total: result.rows.length,
                fixed: fixedCount,
                skipped: skippedCount,
                errors: errors.length
            },
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Migration Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
