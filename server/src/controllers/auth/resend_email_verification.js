import pool from "../../init/db_conn.js";
import jwt from 'jsonwebtoken';
import EmailService from '../../helpers/email.js';

const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists and isn't verified
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND verification_status = false',
            [email]
        );

        if (!result.rows.length) {
            return res.status(400).json({
                message: 'Invalid email or account already verified'
            });
        }

        const user = result.rows[0];

        // Generate new verification token
        const verificationToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                type: 'verification'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Construct verification link
        const verificationLink = `${process.env.FRONTEND_BASEURL}/verify-email/${verificationToken}`;

        const emailService = new EmailService()

        // Send verification email
        await emailService.sendVerificationEmail(
            email,
            verificationLink,
            user.first_name
        );

        res.json({
            message: 'Verification email resent successfully'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default resendVerification