/**
 * Shop Bestellungen API - CRUD Operationen für Bestellungen
 * Verwaltet Kundenbestellungen in der Datenbank
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
                // Alle Bestellungen abrufen
                const { status, limit = 100 } = req.query;

                let result;
                if (status && status !== 'all') {
                    result = await sql`
                        SELECT * FROM orders
                        WHERE order_status = ${status}
                        ORDER BY created_at DESC
                        LIMIT ${parseInt(limit)}
                    `;
                } else {
                    result = await sql`
                        SELECT * FROM orders
                        ORDER BY created_at DESC
                        LIMIT ${parseInt(limit)}
                    `;
                }

                return res.status(200).json({
                    success: true,
                    orders: result.rows
                });
            }

            case 'get': {
                // Einzelne Bestellung abrufen
                const { id, order_id } = req.query;

                let result;
                if (order_id) {
                    result = await sql`
                        SELECT * FROM orders WHERE order_id = ${order_id}
                    `;
                } else if (id) {
                    result = await sql`
                        SELECT * FROM orders WHERE id = ${parseInt(id)}
                    `;
                } else {
                    return res.status(400).json({
                        success: false,
                        error: 'ID oder Order-ID erforderlich'
                    });
                }

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Bestellung nicht gefunden'
                    });
                }

                return res.status(200).json({
                    success: true,
                    order: result.rows[0]
                });
            }

            case 'create': {
                // Neue Bestellung erstellen
                const order = req.body;

                // Validierung
                if (!order.order_id || !order.customer_name || !order.customer_email || !order.items || !order.total_amount) {
                    return res.status(400).json({
                        success: false,
                        error: 'Pflichtfelder fehlen'
                    });
                }

                // Prüfen ob Order-ID bereits existiert
                const existing = await sql`
                    SELECT id FROM orders WHERE order_id = ${order.order_id}
                `;

                if (existing.rows.length > 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Bestellung mit dieser ID existiert bereits'
                    });
                }

                // Bestellung erstellen
                const result = await sql`
                    INSERT INTO orders (
                        order_id,
                        customer_name,
                        customer_email,
                        customer_phone,
                        customer_address,
                        customer_zip,
                        customer_city,
                        customer_country,
                        items,
                        total_amount,
                        payment_method,
                        payment_status,
                        order_status,
                        cj_order_number,
                        notes
                    ) VALUES (
                        ${order.order_id},
                        ${order.customer_name},
                        ${order.customer_email},
                        ${order.customer_phone || null},
                        ${order.customer_address},
                        ${order.customer_zip},
                        ${order.customer_city},
                        ${order.customer_country || 'DE'},
                        ${JSON.stringify(order.items)},
                        ${order.total_amount},
                        ${order.payment_method || 'paypal'},
                        ${order.payment_status || 'pending'},
                        ${order.order_status || 'pending'},
                        ${order.cj_order_number || null},
                        ${order.notes || null}
                    )
                    RETURNING *
                `;

                return res.status(200).json({
                    success: true,
                    order: result.rows[0]
                });
            }

            case 'update': {
                // Bestellung aktualisieren
                const { id } = req.query;
                const updates = req.body;

                if (!id) {
                    return res.status(400).json({
                        success: false,
                        error: 'ID erforderlich'
                    });
                }

                // Dynamisches Update basierend auf übergebenen Feldern
                let updateFields = [];
                let values = [];
                let paramIndex = 1;

                const allowedFields = [
                    'customer_name', 'customer_email', 'customer_phone',
                    'customer_address', 'customer_zip', 'customer_city',
                    'payment_status', 'order_status', 'cj_order_number', 'notes'
                ];

                for (const field of allowedFields) {
                    if (updates[field] !== undefined) {
                        updateFields.push(`${field} = $${paramIndex}`);
                        values.push(updates[field]);
                        paramIndex++;
                    }
                }

                if (updateFields.length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Keine Update-Felder angegeben'
                    });
                }

                updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

                const query = `
                    UPDATE orders
                    SET ${updateFields.join(', ')}
                    WHERE id = $${paramIndex}
                    RETURNING *
                `;
                values.push(parseInt(id));

                const result = await sql.query(query, values);

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Bestellung nicht gefunden'
                    });
                }

                return res.status(200).json({
                    success: true,
                    order: result.rows[0]
                });
            }

            case 'delete': {
                // Bestellung löschen
                const { id } = req.query;

                if (!id) {
                    return res.status(400).json({
                        success: false,
                        error: 'ID erforderlich'
                    });
                }

                const result = await sql`
                    DELETE FROM orders WHERE id = ${parseInt(id)}
                    RETURNING id
                `;

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Bestellung nicht gefunden'
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: 'Bestellung gelöscht'
                });
            }

            case 'stats': {
                // Statistiken abrufen
                const totalOrders = await sql`SELECT COUNT(*) as count FROM orders`;
                const pendingOrders = await sql`SELECT COUNT(*) as count FROM orders WHERE order_status = 'pending'`;
                const completedOrders = await sql`SELECT COUNT(*) as count FROM orders WHERE order_status = 'completed'`;
                const totalRevenue = await sql`SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid'`;

                return res.status(200).json({
                    success: true,
                    stats: {
                        total: parseInt(totalOrders.rows[0].count),
                        pending: parseInt(pendingOrders.rows[0].count),
                        completed: parseInt(completedOrders.rows[0].count),
                        revenue: parseFloat(totalRevenue.rows[0].total || 0)
                    }
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
