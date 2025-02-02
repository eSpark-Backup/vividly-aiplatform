import pool from "../../init/db_conn.js";
import {generateToken, hashPassword} from "../../helpers/auth.js";

export default async function Signup(req, res) {
    try {
        const { first_name, last_name, email, password } = req.body;

        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length) {
            return res.status(400).json({
                errors: { email: 'Email already registered' }
            });
        }

        const hashedPassword = await hashPassword(password);

        const result = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, auth_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [first_name, last_name, email, hashedPassword, 'email']
        );

        const user = result.rows[0];
        const token = generateToken(user);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}