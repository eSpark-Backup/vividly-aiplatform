// routes/speechRoutes.js
import express from 'express';
import multer from 'multer';
import { handleTranscription } from '../controllers/speech/index.js';
import { verifyUserSubscription } from '../helpers/auth.js';
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExt = file.originalname.split('.').pop() || 'audio';
        cb(null, `audio-${uniqueSuffix}.${fileExt}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const router = express.Router();

// Determine if subscription check should be bypassed
const isDevelopmentOrStaging = process.env.ENV === 'dev' || process.env.ENV === 'staging';

// Middleware array for the route
const middlewares = [
    // Only include subscription verification if not in dev/staging
    ...(isDevelopmentOrStaging ? [] : [verifyUserSubscription]),
    upload.single('audio'),
    handleTranscription
];

/**
 * @route POST /api/speech/transcribe
 * @desc Transcribe audio to text
 * @access Private (requires active subscription in production)
 */
router.post('/transcribe', ...middlewares);

export default router;