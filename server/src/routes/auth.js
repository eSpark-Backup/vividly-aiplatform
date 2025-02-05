import express from 'express';
import passport from 'passport';
import {refreshAccessToken, revokeRefreshToken} from '../helpers/auth.js';
import {validate} from '../middlewares/validate.js';
import {
    loginSchema,
    refreshTokenSchema,
    requestPasswordResetSchema,
    resendVerificationSchema,
    resetPasswordSchema,
    signupSchema,
    verifyAccountSchema
} from './auth.schema.js';
import {
    login,
    requestPasswordReset,
    resendVerification,
    resetPassword,
    signup,
    verifyAccount
} from "../controllers/auth/index.js";

const router = express.Router();

// Email signup with validation
router.post('/signup', validate(signupSchema), signup);

// Email login with validation
router.post('/login', validate(loginSchema), login);

// Reset password request
router.post('/request-password-reset', validate(requestPasswordResetSchema), requestPasswordReset);

// Reset password with token
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

router.post('/refresh-token', validate(refreshTokenSchema), async (req, res) => {
    try {
        const {refreshToken} = req.body;

        const {accessToken, refreshToken: newRefreshToken, expiresAt} =
            await refreshAccessToken(refreshToken);

        res.json({
            accessToken,
            refreshToken: newRefreshToken,
            expiresAt
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        if (error.message === 'Invalid refresh token') {
            return res.status(401).json({message: 'Invalid refresh token'});
        }
        res.status(500).json({message: 'Internal server error'});
    }
});

// Logout (revoke refresh token)
router.post('/logout', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        await revokeRefreshToken(req.user.id);
        res.json({message: 'Logged out successfully'});
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});

// Google OAuth routes
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {session: false}),
    (req, res) => {
        const token = generateToken(req.user);
        res.redirect(
            `${process.env.FRONTEND_URL}/auth/callback?token=${token}`
        );
    }
);

// Verify account and set password
router.post('/verify', validate(verifyAccountSchema), verifyAccount);

// Resend verification email
router.post('/resend-verification', validate(resendVerificationSchema), resendVerification);

export default router;