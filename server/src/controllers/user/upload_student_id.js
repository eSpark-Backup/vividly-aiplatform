import pool from "../../init/db_conn.js";
import EmailService from "../../helpers/email.js";
import {isImage} from "../../helpers/misc.js";
import {s3} from "../../helpers/s3.js";
import {logger} from "../../helpers/logger.js";

export default async function upload_student_id(req, res) {
    const client = await pool.connect()
    try {

        const userId = req.user.id

        client.query('BEGIN')

        let user = await client.query(
            'SELECT * FROM users WHERE id = $1 AND is_student = false',
            [userId]
        );

        if (user.rows.length == 0) {
            return res.status(400).json({
                errors: {email: 'User not found or already a student'}
            });
        }

        user = user.rows[0]


        let options = {Key: null}

        if (!req.file) {
            return res.status(400).json({
                message: "No file found to be uploaded"
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

        await client.query(
            `UPDATE users
             SET student_id_card = $1,
                 is_student = true
             WHERE id = $2`,
            [options.Key, user.id]
        )

        const emailService = new EmailService()

        await emailService.sendStudentIDToVividlyOwner(
            {user_id: user.id, first_name: user.first_name, last_name: user.last_name},
            req.file
        )

        client.query('COMMIT')

        res.status(201).json({
            message: 'Student ID uploaded successfully'
        });
    } catch (error) {
        console.error('Image upload error:', error);

        client.query('ROLLBACK')

        res.status(500).json({message: 'Internal server error'});
    } finally {
        client.release()
    }
}