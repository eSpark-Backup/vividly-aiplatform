import express from 'express';
import { authenticateJWT } from '../middlewares/auth.js';
import { createSubscription } from '../controllers/subscription/create_subscription.js';
import { cancelSubscription } from '../controllers/subscription/cancel_subscription.js';
import { validate } from '../middlewares/validate.js';
import { cancelSubscriptionSchema, createSubscriptionSchema, upgradeSubscriptionSchema } from './subscription.schema.js';
import { UserSubscription } from '../controllers/subscription/user_subscription.js';
import { upgradeSubscription } from '../controllers/subscription/upgrade_subscription.js';


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

export default router;