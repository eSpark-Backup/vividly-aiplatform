import { logger } from '../../../helpers/logger.js';
import { disableCard as disableSquareCard } from '../../../init/sqaure_client.js';

export const disableCard = async (req, res) => {
  const { cardId } = req.body;

  try {
    await disableSquareCard(cardId);

    res.status(200).json({ success: true, message: 'Card removed successfully' });
  } catch (error) {
    logger.error('Error removing card:', error);
    res.status(500).json({ success: false, message: 'Error removing card' });
  }
}


