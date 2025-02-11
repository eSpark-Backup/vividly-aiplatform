import pool from "../../init/db_conn.js";
import jwt from 'jsonwebtoken';
import EmailService from '../../helpers/email.js';
import {logger} from "../../helpers/logger.js";

const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists and is verified
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND verification_status = true',
            [email]
        );

        // We don't want to reveal if the email exists or not
        if (!result.rows.length) {
            return res.json({
                message: 'If your email is registered and verified, you will receive a password reset link.'
            });
        }

        const user = result.rows[0];

        // Generate reset token
        const resetToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                type: 'password_reset'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Construct reset link
        const resetLink = `${process.env.FRONTEND_BASEURL}/reset-password/${resetToken}`;

        const emailService = new EmailService()

        // Send reset email
        await emailService.sendPasswordResetEmail(
            email,
            resetLink,
            user.first_name
        );

        res.json({
            message: 'If your email is registered and verified, you will receive a password reset link.'
        });
    } catch (error) {
        logger.error('Password reset request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default requestPasswordReset