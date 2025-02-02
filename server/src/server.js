import dotenv from 'dotenv';
import {dirname, join} from 'path'
import {fileURLToPath} from 'url';
import express from 'express';
import cors from 'cors';
import './init/passport.js';
import passport from 'passport';
import authRoutes from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const _dirname = dirname(__filename);
dotenv.config({path: join(_dirname, '../.env')})

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({message: 'Something broke!'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});