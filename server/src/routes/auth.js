import express from 'express';
import passport from 'passport';
import pool from '../init/db_conn.js';
import {comparePassword, generateToken} from '../helpers/auth.js';
import {validate} from '../middlewares/validate.js';
import {loginSchema, signupSchema} from './auth.schema.js';
import {Login, Signup} from "../controllers/auth/index.js";

const router = express.Router();

// Email signup with validation
router.post('/signup', validate(signupSchema), Signup);

// Email login with validation
router.post('/login', validate(loginSchema), Login);

// Google OAuth routes
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {session: false}),
    (req, res) => {
        const token = generateToken(req.user);
        res.redirect(
            `${process.env.FRONTEND_URL}/auth/callback?token=${token}`
        );
    }
);

export default router;