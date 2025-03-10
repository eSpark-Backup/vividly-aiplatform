import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import sdk from 'microsoft-cognitiveservices-speech-sdk';
import {logger} from "./logger.js";
import path from "path";


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
    const fileName = path.basename(inputFile);

    logger.info('Starting audio conversion', {
        operation: 'convert-audio',
        inputFile: fileName,
        outputFormat: '16kHz PCM WAV'
    });

    const startTime = Date.now();

    return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
            .output(outputFile)
            .audioFrequency(16000)
            .audioChannels(1)
            .audioCodec('pcm_s16le')
            .on('start', (commandLine) => {
                logger.debug('FFmpeg process started', {
                    operation: 'convert-audio',
                    commandLine
                });
            })
            .on('progress', (progress) => {
                logger.debug('FFmpeg conversion progress', {
                    operation: 'convert-audio',
                    fileName,
                    percent: progress.percent,
                    frames: progress.frames
                });
            })
            .on('end', () => {
                const duration = Date.now() - startTime;
                logger.info('Audio conversion completed', {
                    operation: 'convert-audio',
                    fileName,
                    durationMs: duration,
                    outputFile: path.basename(outputFile)
                });
                resolve(outputFile);
            })
            .on('error', (err) => {
                logger.error('Audio conversion failed', {
                    operation: 'convert-audio',
                    fileName,
                    error: err.message,
                    stack: err.stack
                });
                reject(err);
            })
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
    const fileName = path.basename(audioFilePath);

    logger.info('Starting audio transcription', {
        operation: 'transcribe-audio',
        fileName,
        language,
        provider: 'Azure Speech'
    });

    const startTime = Date.now();
    let fileSize;

    try {
        const stats = await fs.promises.stat(audioFilePath);
        fileSize = stats.size;
        logger.debug('Audio file stats', {
            operation: 'transcribe-audio',
            fileName,
            sizeBytes: fileSize,
            modifiedTime: stats.mtime
        });
    } catch (error) {
        logger.error('Failed to get audio file stats', {
            operation: 'transcribe-audio',
            fileName,
            error: error.message
        });
        // Continue with transcription despite stat error
    }

    return new Promise((resolve, reject) => {
        try {
            const pushStream = sdk.AudioInputStream.createPushStream();

            logger.debug('Created push stream for audio input', {
                operation: 'transcribe-audio',
                fileName
            });

            const readStream = fs.createReadStream(audioFilePath);
            let bytesProcessed = 0;

            readStream
                .on('data', (chunk) => {
                    bytesProcessed += chunk.length;
                    pushStream.write(chunk);

                    // Log progress periodically (every ~1MB)
                    if (bytesProcessed % (1024 * 1024) < chunk.length) {
                        logger.debug('Audio streaming progress', {
                            operation: 'transcribe-audio',
                            fileName,
                            bytesProcessed,
                            percentComplete: fileSize ? Math.round((bytesProcessed / fileSize) * 100) : 'unknown'
                        });
                    }
                })
                .on('end', () => {
                    logger.debug('Audio file reading completed', {
                        operation: 'transcribe-audio',
                        fileName,
                        totalBytesProcessed: bytesProcessed
                    });
                    pushStream.close();
                })
                .on('error', (err) => {
                    logger.error('Error reading audio file', {
                        operation: 'transcribe-audio',
                        fileName,
                        error: err.message,
                        stack: err.stack
                    });
                    pushStream.close();
                    reject(err);
                });

            const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_REGION);
            speechConfig.speechRecognitionLanguage = language;

            // Add detailed logging for better troubleshooting
            speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_LanguageIdMode, "Continuous");

            logger.debug('Speech config initialized', {
                operation: 'transcribe-audio',
                language,
                region: AZURE_REGION
            });

            const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
            const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

            // Optional: Log intermediate recognition results
            recognizer.recognizing = (s, e) => {
                logger.debug('Recognition in progress', {
                    operation: 'transcribe-audio',
                    partialText: e.result.text,
                    offset: e.result.offset,
                    duration: e.result.duration
                });
            };

            recognizer.recognizeOnceAsync(
                (result) => {
                    const duration = Date.now() - startTime;
                    const success = result.reason === sdk.ResultReason.RecognizedSpeech;

                    if (success) {
                        logger.info('Transcription completed successfully', {
                            operation: 'transcribe-audio',
                            fileName,
                            durationMs: duration,
                            resultReason: result.reason,
                            textLength: result.text.length,
                            recognitionStatus: result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_RecognitionStatus)
                        });
                    } else {
                        logger.warn('Transcription completed with no results or issues', {
                            operation: 'transcribe-audio',
                            fileName,
                            durationMs: duration,
                            resultReason: result.reason,
                            errorDetails: result.errorDetails || 'No error details provided',
                            recognitionStatus: result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_RecognitionStatus)
                        });
                    }

                    recognizer.close();
                    resolve(result.text || '');
                },
                (err) => {
                    logger.error('Transcription failed', {
                        operation: 'transcribe-audio',
                        fileName,
                        durationMs: Date.now() - startTime,
                        error: err.message,
                        stack: err.stack
                    });
                    recognizer.close();
                    reject(err);
                }
            );
        } catch (error) {
            logger.error('Unexpected error during transcription setup', {
                operation: 'transcribe-audio',
                fileName,
                error: error.message,
                stack: error.stack
            });
            reject(error);
        }
    });
};