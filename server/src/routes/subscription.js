import express from 'express';
import { authenticateJWT } from '../middlewares/auth.js';
import { createSubscription } from '../controllers/subscription/create_subscription.js';
import { cancelSubscription } from '../controllers/subscription/cancel_subscription.js';
import { validate } from '../middlewares/validate.js';
import { cancelSubscriptionSchema, createCardSchema, createSubscriptionSchema, defaultCardSchema, upgradeSubscriptionSchema } from './subscription.schema.js';
import { UserSubscription } from '../controllers/subscription/user_subscription.js';
import { upgradeSubscription } from '../controllers/subscription/upgrade_subscription.js';
import { listCards } from '../controllers/subscription/cards/list_cards.js';
import { addCard } from '../controllers/subscription/cards/add_card.js';
import { makeCardDefault } from '../controllers/subscription/cards/make_card_default.js';


const router = express.Router();

router.get('/',
    authenticateJWT,
    UserSubscription
);

router.post('/create',
    authenticateJWT,
    validate(createSubscriptionSchema),
    createSubscription
);

router.post('/cancel',
    authenticateJWT,
    validate(cancelSubscriptionSchema),
    cancelSubscription
);

router.post('/upgrade',
    authenticateJWT,
    validate(upgradeSubscriptionSchema),
    upgradeSubscription
);

router.get('/cards',
    authenticateJWT,
    listCards
);

router.post('/add-card',
    authenticateJWT,
    validate(createCardSchema),
    addCard
);

router.post('/default-card',
    authenticateJWT,
    validate(defaultCardSchema),
    makeCardDefault
);

export default router;