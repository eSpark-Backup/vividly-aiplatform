import pool from "../../init/db_conn.js";
import jwt from 'jsonwebtoken';
import EmailService from "../../helpers/email.js";

export default async function signup(req, res) {
    try {
        const { first_name, last_name, email } = req.body;

        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length) {
            return res.status(400).json({
                errors: { email: 'Email already registered' }
            });
        }

        // Insert user with verification_status = false and no password
        const result = await pool.query(
            `INSERT INTO users 
            (first_name, last_name, email, auth_type, verification_status) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [first_name, last_name, email, 'email', false]
        );

        const user = result.rows[0];

        // Generate verification token
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
        const verificationLink = `${process.env.FRONTEND_BASEURL}/create-password/${verificationToken}`;

        const emailService = new EmailService()

        // Send verification email
        await emailService.sendVerificationEmail(
            email,
            verificationLink,
            first_name
        );

        res.status(201).json({
            message: 'User created successfully. Please check your email to verify your account.'
        });
    } catch (error) {
        console.error('Signup error:', error);

        // If error is related to email sending, delete the created user
        if (error.code === 'EAUTH' || error.code === 'ESOCKET') {
            try {
                await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
            } catch (deleteError) {
                console.error('Error deleting user after failed email:', deleteError);
            }
            return res.status(500).json({
                message: 'Failed to send verification email. Please try again later.'
            });
        }

        res.status(500).json({ message: 'Internal server error' });
    }
}