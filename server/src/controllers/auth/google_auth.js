// controllers/auth/googleAuth.js
import pool from "../../init/db_conn.js";
import { generateTokens } from "../../helpers/auth.js";
import { logger } from "../../helpers/logger.js";
import {getSignedUrl} from "../../helpers/s3.js";

export default async function googleAuth(req, res) {
    try {
        const { email, first_name, last_name, google_id } = req.body;

        // Single query to check for existing user by either google_id or email
        const existingUserResult = await pool.query(
            'SELECT * FROM users WHERE google_id = $1 OR email = $2',
            [google_id, email]
        );

        let user = existingUserResult.rows[0];

        if (user) {
            // Case 1: Found by google_id, verify email matches
            if (user.google_id === google_id && user.email !== email) {
                logger.warn(`Google auth attempt with mismatched email for google_id: ${google_id}`);
                return res.status(400).json({
                    message: 'Authentication failed',
                    error: 'Account mismatch'
                });
            }

            // Case 2: Found by email, check google_id status
            if (user.google_id && user.google_id !== google_id) {
                logger.warn(`Attempt to link existing Google account to different google_id. Email: ${email}`);
                return res.status(400).json({
                    message: 'Authentication failed',
                    error: 'Account already linked to different Google account'
                });
            }

            // Update google_id if user was found by email and doesn't have google_id
            if (!user.google_id) {
                user = (await pool.query(
                    `UPDATE users
                     SET google_id = $1,
                         auth_type = 'google'
                     WHERE id = $2
                     RETURNING *`,
                    [google_id, user.id]
                )).rows[0];
                logger.info(`Successfully linked Google account for user ${user.id}`);
            }
        } else {
            // Case 3: New user
            user = (await pool.query(
                `INSERT INTO users (
                    first_name,
                    last_name,
                    email,
                    google_id,
                    auth_type
                ) VALUES ($1, $2, $3, $4, 'google')
                 RETURNING *`,
                [first_name, last_name, email, google_id]
            )).rows[0];
            logger.info(`Created new user via Google auth: ${user.id}`);
        }

        // Generate tokens
        const { accessToken, refreshToken, expiresAt } = await generateTokens(user);
        logger.info(`Successful Google authentication for user ${user.id}`);

        res.json({
            message: 'Google authentication successful',
            accessToken,
            refreshToken,
            expiresAt,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                is_student: user.is_student,
                student_id: user.is_student ? await getSignedUrl(user.student_id_card) : null
            }
        });
    } catch (error) {
        logger.error('Google auth error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}