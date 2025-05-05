import { logger } from '../../helpers/logger.js';
import { getCardDetails, getPlansCatalogDetails, getUserSubscriptions } from '../../init/sqaure_client.js';

export const UserSubscription = async (req, res) => {
    try {
        const { square_customer_id } = req.user;

        if (!square_customer_id) {
            return res.status(200).json({ success: true, subscriptionDetails: null, message: "No subscriptions found" });
        }

        const subscriptions = await getUserSubscriptions(square_customer_id);

        if (!subscriptions || subscriptions.length === 0) {
            return res.status(200).json({ success: true, subscriptionDetails: null, message: "No subscriptions found" });
        }

        const subscription = subscriptions[subscriptions.length - 1]

        const planDetails = await getPlansCatalogDetails(subscription.planId)

        const cardDetails = await getCardDetails(subscription.cardId)

        const subscriptionDetails = {
            id: subscription.id,
            planName: planDetails.subscriptionPlanData.name || null,
            recurring: planDetails.subscriptionPlanData?.phases[0].cadence || null,
            planId: subscription.planId,
            status: subscription.status,
            startDate: subscription.startDate,
            nextBillingDate: subscription.chargedThroughDate,
            cancelationDate: subscription.canceledDate || null,
            cardDetails: {
                id: cardDetails.id,
                last4: cardDetails.last4,
                cardBrand: cardDetails.cardBrand,
                expMonth: cardDetails.expMonth,
                expYear: cardDetails.expYear,
            }
        }

        return res.status(200).json({ success: true, subscriptionDetails });

    } catch (error) {
        logger.error('Error getting user subscriptions:', error);
        res.status(500).json({ success: false, error: error.message, message: "We're having trouble processing your request. Please try again later." });
    }
}   
