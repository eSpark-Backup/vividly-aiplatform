import express from 'express';
import {authenticateJWT} from '../middlewares/auth.js';
import {validate} from '../middlewares/validate.js';
import {updateProfileSchema} from './user.schema.js';
import multer from 'multer';
import {getProfile, updateProfile} from '../controllers/user/profile.js';
import {uploadImage} from "../helpers/multer.js";
import upload_student_id from "../controllers/user/upload_student_id.js";

const router = express.Router();
const upload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

router.get('/profile',
    authenticateJWT,
    getProfile
);

//Student ID upload
router.post('/upload-student-id', authenticateJWT, uploadImage.single("student_id"), upload_student_id);

router.put('/profile',
    authenticateJWT,
    upload.single('avatar'),
    validate(updateProfileSchema),
    updateProfile
);

export default router;