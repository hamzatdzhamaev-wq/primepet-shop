/**
 * Shop Produkte API - CRUD Operationen für Datenbank
 * Verwaltet Produkte die im Shop angezeigt werden
 */

const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { action } = req.query;

        switch (action) {
            case 'list': {
                // Alle Produkte abrufen
                const { category } = req.query;

                let result;
                if (category && category !== 'alle') {
                    result = await sql`
                        SELECT * FROM products
                        WHERE category = ${category}
                        ORDER BY created_at DESC
                    `;
                } else {
                    result = await sql`
                        SELECT * FROM products
                        ORDER BY created_at DESC
                    `;
                }

                return res.status(200).json({
                    success: true,
                    products: result.rows
                });
            }

            case 'add': {
                // Produkt hinzufügen
                const product = req.body;

                // Prüfen ob Produkt bereits existiert (via cj_pid)
                if (product.cj_pid) {
                    const existing = await sql`
                        SELECT id FROM products WHERE cj_pid = ${product.cj_pid}
                    `;

                    if (existing.rows.length > 0) {
                        return res.status(400).json({
                            success: false,
                            error: 'Produkt bereits vorhanden'
                        });
                    }
                }

                const result = await sql`
                    INSERT INTO products (
                        name, price, category, description, image,
                        rating, badge, cj_pid, cj_vid, cj_cost_price, cj_stock
                    ) VALUES (
                        ${product.name},
                        ${product.price},
                        ${product.category},
                        ${product.description || ''},
                        ${product.image || ''},
                        ${product.rating || 5},
                        ${product.badge || ''},
                        ${product.cj_pid || null},
                        ${product.cj_vid || null},
                        ${product.cj_cost_price || null},
                        ${product.cj_stock || 0}
                    )
                    RETURNING *
                `;

                return res.status(200).json({
                    success: true,
                    product: result.rows[0]
                });
            }

            case 'update': {
                // Produkt aktualisieren
                const { id } = req.query;
                const product = req.body;

                const result = await sql`
                    UPDATE products SET
                        name = ${product.name},
                        price = ${product.price},
                        category = ${product.category},
                        description = ${product.description || ''},
                        image = ${product.image || ''},
                        rating = ${product.rating || 5},
                        badge = ${product.badge || ''},
                        cj_stock = ${product.cj_stock || 0},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${id}
                    RETURNING *
                `;

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Produkt nicht gefunden'
                    });
                }

                return res.status(200).json({
                    success: true,
                    product: result.rows[0]
                });
            }

            case 'delete': {
                // Produkt löschen
                const { id } = req.query;

                const result = await sql`
                    DELETE FROM products WHERE id = ${id}
                    RETURNING id
                `;

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Produkt nicht gefunden'
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: 'Produkt gelöscht'
                });
            }

            case 'get': {
                // Einzelnes Produkt abrufen
                const { id } = req.query;

                const result = await sql`
                    SELECT * FROM products WHERE id = ${id}
                `;

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Produkt nicht gefunden'
                    });
                }

                return res.status(200).json({
                    success: true,
                    product: result.rows[0]
                });
            }

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Ungültige Aktion'
                });
        }
    } catch (error) {
        console.error('Datenbank-Fehler:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
