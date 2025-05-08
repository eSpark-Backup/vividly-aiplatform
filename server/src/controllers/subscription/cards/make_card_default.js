
import pool from "../../../init/db_conn.js";
import { logger } from '../../../helpers/logger.js';


export const makeCardDefault = async (req, res) => {
    const { cardId } = req.body;
    const { id: userId } = req.user;

    const client = await pool.connect();

    try {
        const result = await client.query('UPDATE users SET default_card_id = $1 WHERE id = $2 RETURNING *', [cardId, userId]);
       
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Card not updated' });
        }

        res.status(200).json({ success: true, message: 'Card updated as default' });
    } catch (error) {
        logger.error('Error updating card as default:', error);
        res.status(500).json({ success: false, message: 'Error updating card as default' });
    }

    finally {
        client.release();
    }

}

