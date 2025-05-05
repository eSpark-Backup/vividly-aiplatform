import { logger } from '../../../helpers/logger.js';
import pool from '../../../init/db_conn.js';
import { getUserCards } from '../../../init/sqaure_client.js';

export const listCards = async (req, res) => {
    try {
        const { id: userId, square_customer_id } = req.user;

        if (!square_customer_id) {
            return res.status(200).json({
                success: true,
                userCards: [],
                message: "No Subscription Found"
            });
        }

        const client = await pool.connect();

        try {
            const [userCards, userResult] = await Promise.all([
                getUserCards(square_customer_id),
                client.query('SELECT default_card_id FROM users WHERE id = $1', [userId])
            ]);

            const defaultCardId = userResult.rows[0]?.default_card_id;

            const cardsWithFlag = userCards.map(card => ({
                ...card,
                isDefault: card.id === defaultCardId 
            }));

            return res.status(200).json({ success: true, userCards: cardsWithFlag });
        } finally {
            client.release();
        }

    } catch (error) {
        logger.error('Error getting user cards:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "We're having trouble getting the card list. Please try again later."
        });
    }
};
