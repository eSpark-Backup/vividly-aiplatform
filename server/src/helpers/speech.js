import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import sdk from 'microsoft-cognitiveservices-speech-sdk';
import {logger} from "./logger.js";


// Azure credentials from `.env`
const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.AZURE_SPEECH_REGION;

if (!AZURE_SPEECH_KEY || !AZURE_REGION) {
    logger.error("Azure Speech credentials not set in .env file.");
    process.exit(1);
}

/**
 * Convert audio to 16kHz PCM WAV using FFmpeg
 * @param {string} inputFile - Path to input audio file
 * @param {string} outputFile - Path to output WAV file
 * @returns {Promise<string>} - Path to converted file
 */
export const convertTo16kHzWav = async (inputFile, outputFile) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
            .output(outputFile)
            .audioFrequency(16000)
            .audioChannels(1)
            .audioCodec('pcm_s16le')
            .on('end', () => resolve(outputFile))
            .on('error', (err) => reject(err))
            .run();
    });
};

/**
 * Send audio to Azure Speech-to-Text
 * @param {string} audioFilePath - Path to WAV audio file
 * @param {string} language - Language code (default: en-US)
 * @returns {Promise<string>} - Transcribed text
 */
export const transcribeAudio = async (audioFilePath, language = "en-US") => {
    return new Promise((resolve, reject) => {
        const pushStream = sdk.AudioInputStream.createPushStream();
        fs.createReadStream(audioFilePath)
            .on('data', (chunk) => pushStream.write(chunk))
            .on('end', () => pushStream.close());

        const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_REGION);
        speechConfig.speechRecognitionLanguage = language;

        const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizeOnceAsync(
            (result) => {
                recognizer.close();
                resolve(result.text || '');
            },
            (err) => {
                recognizer.close();
                reject(err);
            }
        );
    });
};