// This function handles the verification endpoint
import jwt from "jsonwebtoken";
import {pool} from "../../init/index.js";
import {hashPassword} from "../../helpers/auth.js";

const verifyAccount = async (req, res) => {
    try {
        const { token } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== 'verification') {
            return res.status(400).json({
                message: 'Invalid verification token'
            });
        }

        // 1. User exists in database
        // 2. User is not already verified (verification_status = false)
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1 AND verification_status = false',
            [decoded.id]
        );

        // If no user found or user already verified
        if (!result.rows.length) {
            return res.status(400).json({
                message: 'Invalid or already verified account'
            });
        }

        // Get password from request body and hash it
        const { password } = req.body;
        const hashedPassword = await hashPassword(password);

        await pool.query(
            `UPDATE users 
            SET verification_status = true, 
                password_hash = $1,
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2`,
            [hashedPassword, decoded.id]
        );

        res.json({
            message: 'Account verified successfully. You can now login.'
        });
    } catch (error) {
        console.error('Verification error:', error);

        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({
                message: 'Invalid verification token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                message: 'Verification token has expired'
            });
        }

        // Handle any other errors
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default verifyAccount