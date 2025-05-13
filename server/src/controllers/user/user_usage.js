import pool from "../../init/db_conn.js";
import { logger } from '../../helpers/logger.js';


export const getUserUsage = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `
            SELECT 
                COUNT(*) FILTER (WHERE type = 'image_generation') AS image_generation_count,
                COUNT(*) FILTER (WHERE type = 'image_analysis') AS image_analysis_count
            FROM user_usage_metric
            WHERE user_id = $1
              AND created_at >= NOW() - INTERVAL '1 month'
            `,
            [userId]
        );

        const { image_generation_count, image_analysis_count } = result.rows[0];

        res.json({
            imageGenerationCount: image_generation_count,
            imageAnalysisCount: image_analysis_count,
        });
    } catch (error) {
        logger.error('Get user usage error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
