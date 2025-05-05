import { logger } from '../../helpers/logger.js';
import { pool } from '../../init/index.js';
import { createCustomer, createCard, createSubscription as createSquareSubscription } from '../../init/sqaure_client.js';


export const createSubscription = async (req, res) => {
    try {
        const userId = req.user.id
        const { square_customer_id } = req.user
        const { sourceId, planId, customer } = req.body

        //create customer if not exist
        let customerId = square_customer_id;

        if (!customerId) {
            customerId = await createCustomer(customer);
        }

        // Create card
        let cardId;
        try {
            const createdCardId = await createCard(sourceId, customerId, customer, userId)
            cardId = createdCardId
        } catch (error) {
            logger.error('Subscription creation error:', error);
            return res.status(error.statusCode || 500).json({ success: false, error: error.message, message: error.message || "Internal server error" });
        }

        // Create subscription
        const subscription = await createSquareSubscription(customerId, cardId, planId)

        if (!subscription || !customerId || !cardId) {
            return res.status(400).json({
                success: false,
                error: "Subscription creation failed",
                message: "We're having trouble processing your request. Please try again later.",
            })
        }

        // Adding customerId into user table 
        const result = await pool.query('UPDATE users SET square_customer_id = $1 WHERE id = $2 RETURNING *', [customerId, userId])


        if (!result.rows.length) {
            return res.status(400).json({
                success: false,
                error: 'Customer ID update failed',
                message: "We're having trouble processing your request. Please try again later."
            })
        }

        return res.status(201).json({
            success: true,
            subscription,
            customerId,
        })

    } catch (error) {
        logger.error('Subscription creation error:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message, message: "We're having trouble processing your request. Please try again later." });
    }
};

