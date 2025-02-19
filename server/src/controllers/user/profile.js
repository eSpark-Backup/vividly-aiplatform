import pool from "../../init/db_conn.js";
import sharp from 'sharp';
import { logger } from '../../helpers/logger.js';

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { phone, address, city, birthdate } = req.body;
        let avatar = null;

        if (req.file) {
            try {
                // Resize and optimize image
                const optimizedBuffer = await sharp(req.file.buffer)
                    .resize(200, 200, { 
                        fit: 'cover',
                        withoutEnlargement: true
                    })
                    .jpeg({ quality: 80 }) 
                    .toBuffer();

                // Convert to base64
                avatar = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;
            } catch (error) {
                logger.error('Image processing error:', error);
                return res.status(400).json({ message: 'Invalid image file' });
            }
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const profileExists = await client.query(
                'SELECT 1 FROM user_profiles WHERE user_id = $1',
                [userId]
            );

            if (profileExists.rows.length === 0) {
                await client.query(
                    `INSERT INTO user_profiles (user_id, phone, address, city, birthdate, avatar)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [userId, phone, address, city, birthdate, avatar]
                );
            } else {
                await client.query(
                    `UPDATE user_profiles 
                     SET phone = COALESCE($2, phone),
                         address = COALESCE($3, address),
                         city = COALESCE($4, city),
                         birthdate = COALESCE($5, birthdate),
                         avatar = COALESCE($6, avatar),
                         updated_at = CURRENT_TIMESTAMP
                     WHERE user_id = $1`,
                    [userId, phone, address, city, birthdate, avatar]
                );
            }

            await client.query('COMMIT');

            res.json({
                message: 'Profile updated successfully'
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        logger.error('Profile update error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT 
                u.email,
                u.first_name,
                u.last_name,
                up.phone,
                up.address,
                up.city,
                up.birthdate,
                up.avatar
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id = $1`,
            [userId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const profile = result.rows[0];

        res.json({
            profile: {
                email: profile.email,
                firstName: profile.first_name,
                lastName: profile.last_name,
                phone: profile.phone || null,
                address: profile.address || null,
                city: profile.city || null,
                birthdate: profile.birthdate || null,
                avatar: profile.avatar || null
            }
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};