import { logger } from '../../../helpers/logger.js';
import { getUserCards } from '../../../init/sqaure_client.js';

export const listCards = async (req, res) => {
    try {
        const { square_customer_id } = req.user;

        if (!square_customer_id) {
            return res.status(200).json({ success: true, subscriptionDetails: null, message: "No subscriptions found" });
        }

        const userCards = await getUserCards(square_customer_id);

       
        return res.status(200).json({ success: true, userCards });

    } catch (error) {
        logger.error('Error getting user subscriptions:', error);
        res.status(500).json({ success: false, error: error.message, message: "We're having trouble getting Cards list. Please try again later." });
    }
}   
