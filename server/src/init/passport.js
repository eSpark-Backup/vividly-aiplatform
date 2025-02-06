import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import pool from './db_conn.js';
import dotenv from 'dotenv';
import {join} from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const _dirname = dirname(__filename);
dotenv.config({ path: join(_dirname, '../../.env')})

// JWT configuration options
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
};

// Initialize JWT Strategy
passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
        try {
            const result = await pool.query('SELECT * FROM users WHERE id = $1', [payload.id]);
            if (result.rows.length) {
                return done(null, result.rows[0]);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

// Initialize Google Strategy (if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const existingUser = await pool.query(
                        'SELECT * FROM users WHERE google_id = $1',
                        [profile.id]
                    );

                    if (existingUser.rows.length) {
                        return done(null, existingUser.rows[0]);
                    }

                    const newUser = await pool.query(
                        'INSERT INTO users (first_name, last_name, email, google_id, auth_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                        [
                            profile.name.givenName,
                            profile.name.familyName,
                            profile.emails[0].value,
                            profile.id,
                            'google',
                        ]
                    );

                    return done(null, newUser.rows[0]);
                } catch (error) {
                    return done(error, false);
                }
            }
        )
    );
}

export default passport;