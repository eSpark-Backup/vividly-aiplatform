import { logger } from '../../helpers/logger.js';
import { upgradeSubscription as upgradeSquareSubscription } from '../../init/sqaure_client.js';

export const upgradeSubscription = async (req, res) => {
    try {
        const { square_customer_id } = req.user
        const { subscriptionId, planId } = req.body;

        if (!square_customer_id) {
            return res.status(400).json({ success: false, error: "No Subscription Found", message: "We're having trouble processing your request. Please try again later." });
        }

        const updatedSubscription = await upgradeSquareSubscription(square_customer_id, subscriptionId, planId);

        res.status(200).json({ success: true, updatedSubscription });
        
    } catch (error) {
        logger.error('Error upgrading subscription:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message, message: "We're having trouble processing your request. Please try again later." });
    }
}

