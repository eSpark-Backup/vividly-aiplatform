import { logger } from '../../../helpers/logger.js';
import { createCustomer, createCard as createSquareCard } from '../../../init/sqaure_client.js';

export const createCard = async (req, res) => {
    try {
        const userId = req.user.id
        const { square_customer_id } = req.user
        const { sourceId, customer } = req.body

        //create customer if not exist
        let customerId = square_customer_id;

        if (!customerId) {
            customerId = await createCustomer(customer);
        }

        // Create card
        try {
            const createdCardId = await createSquareCard(sourceId, customerId, customer, userId)
           
            return res.status(200).json({
                success: true,
                cardId: createdCardId,
                message: "Card created successfully"
            })
            
        } catch (error) {
            logger.error('Error creating card:', error);
            return res.status(error.statusCode || 500).json({ success: false, error: error.message, message: error.message || "We're having trouble processing your request. Please try again later." });
        }

    } catch (error) {
        logger.error('Error creating card:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message, message: "We're having trouble processing your request. Please try again later." });
    }
};

