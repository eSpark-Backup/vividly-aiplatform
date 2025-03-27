import pool from "../../init/db_conn.js";
import jwt from 'jsonwebtoken';
import EmailService from "../../helpers/email.js";
import {isImage} from "../../helpers/misc.js";
import {s3} from "../../helpers/s3.js";
import {loggers} from "winston";
import {logger} from "../../helpers/logger.js";

export default async function signup(req, res) {
    const client = await pool.connect()
    try {
        const { first_name, last_name, email, is_student = false } = req.body;
        console.log("REQ BODY", first_name, last_name, email, is_student)

        client.query('BEGIN')

        const existingUser = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length) {
            return res.status(400).json({
                errors: { email: 'Email already registered' }
            });
        }

        // Insert user with verification_status = false and no password
        const result = await client.query(
            `INSERT INTO users 
            (first_name, last_name, email, auth_type, verification_status, is_student) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
            [first_name, last_name, email, 'email', false, is_student]
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

        let options = {Key: null}

        if (is_student) {
            if (!req.file){
                return res.status(400).json({
                    message: "`is_student` is true but no file is uploaded"
                })
            }

            const fileInfo = isImage(req.file.buffer)

            if (!fileInfo) {
                return res.status(400).json({
                    message: `Uploaded file is not of an image`
                })
            }

            const fileExtension = fileInfo.ext
            const mimeType = fileInfo.mime

            const dateNow = Date.now()

            options = {
                Key: `student_ids/${user.id}_${dateNow}.${fileExtension}`,
                Body: req.file.buffer,
                ContentType: mimeType,
                Bucket: process.env.S3_BUCKET
            }

            logger.info(options.Key, options.Bucket)

            try {
                await s3.upload(options).promise()
            } catch (e) {
                logger.error(`Error uploading student id: `, e)
                return
            }
        }

        await client.query(
            `UPDATE users SET student_id_card = $1 WHERE id = $2`,
            [options.Key, user.id]
        )

        // Construct verification link
        const verificationLink = `${process.env.FRONTEND_BASEURL}/create-password/${verificationToken}`;

        const emailService = new EmailService()

        // Send verification email
        await emailService.sendVerificationEmail(
            email,
            verificationLink,
            first_name
        );

        if (is_student) {
            await emailService.sendStudentIDToVividlyOwner(
                {user_id: user.id, first_name: user.first_name, last_name: user.last_name},
                req.file
            )
        }

        client.query('COMMIT')

        res.status(201).json({
            message: 'User created successfully. Please check your email to verify your account.'
        });
    } catch (error) {
        console.error('Signup error:', error);

        client.query('ROLLBACK')

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
    } finally {
        client.release()
    }
}