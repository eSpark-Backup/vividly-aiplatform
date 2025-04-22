import { logger } from '../../helpers/logger.js';
import { cancelSubscription as cancelSquareSubscription } from '../../init/sqaure_client.js';

export const cancelSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.body
        const subscription = await cancelSquareSubscription(subscriptionId)
    
        return res.json({
          success: true,
          subscription,
        })
      } catch (error) {
        logger.error('Subscription cancellation error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message, message: "Internal server error" });
      }
}



