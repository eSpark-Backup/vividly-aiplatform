import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {pool} from "../init/index.js";
import * as crypto from "node:crypto";
// middlewares/authMiddleware.js
import { logger } from './logger.js';

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1d';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '72h';

export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

export const generateTokens = async (user, initialRefreshExpiry = REFRESH_TOKEN_EXPIRY) => {
    // Generate access token
    const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // Generate refresh token
    const refreshToken = crypto.randomBytes(40).toString('hex');

    // Calculate expiry based on provided duration
    const expiresAt = new Date();
    // Parse the duration string (e.g., '24h' to milliseconds)
    const durationMatch = initialRefreshExpiry.match(/^(\d+)([hd])$/);
    if (durationMatch) {
        const [, amount, unit] = durationMatch;
        const hours = unit === 'h' ? Number(amount) : Number(amount) * 24;
        expiresAt.setHours(expiresAt.getHours() + hours);
    }

    // Store refresh token in database with initial expiry
    await pool.query(
        `INSERT INTO refresh_tokens 
     (user_id, token, expires_at, initial_expires_at) 
     VALUES ($1, $2, $3, $3)`,
        [user.id, refreshToken, expiresAt]
    );

    return {
        accessToken,
        refreshToken,
        expiresAt
    };
};

export const refreshAccessToken = async (refreshToken) => {
    // Get the refresh token with its initial expiry time
    const result = await pool.query(
        `SELECT rt.*, u.*,
                rt.initial_expires_at as original_expiry,
                rt.expires_at as current_expiry
         FROM refresh_tokens rt
                  JOIN users u ON u.id = rt.user_id
         WHERE rt.token = $1
           AND rt.revoked_at IS NULL
           AND rt.expires_at > NOW()`,
        [refreshToken]
    );

    if (!result.rows.length) {
        throw new Error('Invalid refresh token');
    }

    const tokenData = result.rows[0];

    // Check if we've passed the initial expiry time
    if (new Date(tokenData.original_expiry) < new Date()) {
        await revokeRefreshToken(tokenData.user_id);
        throw new Error('Refresh token has expired');
    }

    const user = {
        id: tokenData.user_id,
        email: tokenData.email
    };

    // Calculate remaining time from initial expiry
    const remainingTime = new Date(tokenData.original_expiry) - new Date();
    const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));

    // Generate new tokens with remaining time as expiry
    const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt
    } = await generateTokens(user, `${remainingHours}h`);

    // Revoke old refresh token and create chain
    await pool.query(
        `UPDATE refresh_tokens
         SET revoked_at = NOW(),
             replaced_by_token = $1,
             revocation_reason = 'rotated'
         WHERE token = $2`,
        [newRefreshToken, refreshToken]
    );

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt
    };
};

export const revokeRefreshToken = async (userId, reason = 'user_logout') => {
    await pool.query(
        `UPDATE refresh_tokens 
     SET revoked_at = NOW(),
         revocation_reason = $2
     WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId, reason]
    );
};

export const revokeAllRefreshTokens = async (userId, reason = 'admin_action') => {
    await pool.query(
        `UPDATE refresh_tokens 
     SET revoked_at = NOW(),
         revocation_reason = $2
     WHERE user_id = $1`,
        [userId, reason]
    );
};


export const verifyUserSubscription = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.query.token;

        if (!token) {
            logger.warn('Authentication attempt without token');
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        logger.debug('Verifying user subscription', { token: token.substring(0, 8) + '...' });

        const result = await pool.query(`
            SELECT u.id, u.email
            FROM users u
                     JOIN subscriptions s ON u.id = s.user_id
            WHERE s.status = 'active'
              AND s.current_period_end > NOW()
              AND u.id = (SELECT user_id
                          FROM refresh_tokens
                          WHERE token = $1
                            AND revoked_at IS NULL
                            AND expires_at > NOW())`, [token]);

        const user = result.rows[0];
        if (!user) {
            logger.warn('Invalid or expired subscription', { token: token.substring(0, 8) + '...' });
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired subscription'
            });
        }

        logger.debug('Authentication successful', { userId: user.id });
        req.user = user;
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

/**
 * Optional authentication middleware that doesn't require a subscription
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.query.token;

        if (!token) {
            logger.debug('Proceeding without authentication');
            return next();
        }

        const result = await pool.query(`
            SELECT u.id, u.email
            FROM users u
            WHERE u.id = (
                SELECT user_id
                FROM refresh_tokens
                WHERE token = $1
                AND revoked_at IS NULL
                AND expires_at > NOW()
            )`, [token]);

        const user = result.rows[0];
        if (user) {
            req.user = user;
            logger.debug('Optional auth successful', { userId: user.id });
        }

        next();
    } catch (error) {
        logger.error('Optional auth error:', error);
        // Continue even if auth fails
        next();
    }
};