import pool from "../../init/db_conn.js";
import {comparePassword, generateToken} from "../../helpers/auth.js";

export default async function Login(req, res)  {
    try {
        const {email, password} = req.body;

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND auth_type = $2',
            [email, 'email']
        );

        if (!result.rows.length) {
            return res.status(401).json({
                errors: {credentials: 'Invalid email or password'}
            });
        }

        const user = result.rows[0];

        const isValidPassword = await comparePassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                errors: {credentials: 'Invalid email or password'}
            });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}