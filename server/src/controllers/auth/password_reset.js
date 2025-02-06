import pool from "../../init/db_conn.js";
import jwt from 'jsonwebtoken';
import { hashPassword } from "../../helpers/auth.js";

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if token is a password reset token
        if (decoded.type !== 'password_reset') {
            return res.status(400).json({
                message: 'Invalid reset token'
            });
        }

        // Check if user exists and is verified
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1 AND verification_status = true',
            [decoded.id]
        );

        if (!result.rows.length) {
            return res.status(400).json({
                message: 'Invalid reset token'
            });
        }

        // Hash new password
        const hashedPassword = await hashPassword(password);

        // Update password and revoke all refresh tokens for security
        await pool.query('BEGIN');
        try {
            // Update password
            await pool.query(
                `UPDATE users 
                SET password_hash = $1,
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2`,
                [hashedPassword, decoded.id]
            );

            // Revoke all refresh tokens
            await pool.query(
                `UPDATE refresh_tokens 
                SET revoked_at = NOW(),
                    revocation_reason = 'password_reset'
                WHERE user_id = $1 AND revoked_at IS NULL`,
                [decoded.id]
            );

            await pool.query('COMMIT');
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }

        res.json({
            message: 'Password has been reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Password reset error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({
                message: 'Invalid reset token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                message: 'Reset token has expired'
            });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default resetPassword