import express from 'express';
import { authenticateJWT } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema } from './user.schema.js';
import multer from 'multer';
import { updateProfile, getProfile } from '../controllers/user/profile.js';

const router = express.Router();
const upload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

router.get('/profile',
    authenticateJWT,
    getProfile
);

router.put('/profile', 
    authenticateJWT,
    upload.single('avatar'),
    validate(updateProfileSchema),
    updateProfile
);

export default router;