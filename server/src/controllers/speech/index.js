// controllers/speechController.js
import fs from 'fs';
import util from 'util';
import { logger } from '../../helpers/logger.js';
import { convertTo16kHzWav, transcribeAudio } from '../../helpers/speech.js';

const unlinkFile = util.promisify(fs.unlink);

export const handleTranscription = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
    }

    const inputFile = req.file.path;
    const outputFile = `${req.file.path}_converted.wav`;

    logger.info(`Processing transcription request: ${inputFile}`);

    try {
        // Convert audio to 16kHz PCM WAV
        await convertTo16kHzWav(inputFile, outputFile);
        logger.debug(`Audio converted successfully: ${outputFile}`);

        // Transcribe the audio
        const language = req.body.language || "en-US";
        const transcript = await transcribeAudio(outputFile, language);

        logger.info(`Transcription complete: ${transcript.substring(0, 50)}${transcript.length > 50 ? '...' : ''}`);

        // Cleanup files
        await unlinkFile(inputFile);
        await unlinkFile(outputFile);

        res.json({
            success: true,
            transcript,
            language
        });
    } catch (error) {
        logger.error('Transcription error:', error);

        // Cleanup files on error
        try {
            if (fs.existsSync(inputFile)) await unlinkFile(inputFile);
            if (fs.existsSync(outputFile)) await unlinkFile(outputFile);
        } catch (cleanupError) {
            logger.error('Error cleaning up files:', cleanupError);
        }

        res.status(500).json({
            success: false,
            error: 'Speech processing failed',
            details: error.message
        });
    }
};