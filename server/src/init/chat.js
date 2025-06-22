import { WebSocketServer } from 'ws';
import OpenAI from 'openai';
import pool from './db_conn.js';
import { logger } from '../helpers/logger.js';
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";
import dotenv from "dotenv";
import AWS from 'aws-sdk';
import crypto from 'crypto';
import sharp from 'sharp';
import fs from "fs/promises";
import { v4 as uuidv4 } from 'uuid'
import { SUBSCRIPTION_STATUS, subscriptionFeatureAccess } from '../constant/index.js';
import { getUserSubscriptions } from './sqaure_client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') })

//Subscription statuses
const { ACTIVE, FREE } = SUBSCRIPTION_STATUS;


// Setup paths
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Add this configuration
const HUMANIZER_API_URL = process.env.HUMANIZER_API_URL;
const HUMANIZER_API_KEY = process.env.HUMANIZER_API_KEY;

// Configure the S3 client using AWS SDK v2
const s3 = new AWS.S3({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    signatureVersion: "v4",
    s3ForcePathStyle: true
});

// Update your upload function to use the V2 SDK
async function uploadToS3(key, body, contentType) {
    const params = {
        Bucket: S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType
    };

    return s3.upload(params).promise();
}

// Update your get signed URL function
async function getSignedUrl(key) {
    const params = {
        Bucket: S3_BUCKET,
        Key: key,
        Expires: IMAGE_EXPIRY
    };

    return s3.getSignedUrlPromise('getObject', params);
}

// Update your delete function
async function deleteFromS3(key) {
    const params = {
        Bucket: S3_BUCKET,
        Key: key
    };
}

const tools = [
    {
        type: "function",
        function: {
            name: "web_search",
            description: "Search the web for current information on any topic",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query to look up",
                    },
                },
                required: ["query"],
            },
        },
    },
]

const S3_BUCKET = process.env.S3_BUCKET || 'user-uploads';
const IMAGE_EXPIRY = 60 * 60 * 24 * 7; // URL expiry time in seconds (7 days)

export class ChatServer {
    constructor(server) {
        this.wss = new WebSocketServer({ server });
        logger.info('ChatServer initialized');
        this.setupWebSocket();
    }

    static MAX_HUMANIZE_LENGTH = parseInt(process.env.HUMANIZER_MAX_WORDS || "2000");

    setupWebSocket() {
        this.wss.on('connection', async (ws, req) => {
            const clientIp = req.socket.remoteAddress;
            logger.debug('New connection attempt', { clientIp });

            try {
                const token = new URL(req.url, 'http://localhost').searchParams.get('token');
                const user = await this.verifyUserSubscription(token);

                if (!user) {
                    logger.warn('Unauthorized connection attempt', { clientIp, token });
                    ws.close(4001, 'Unauthorized or inactive subscription');
                    return;
                }

                ws.userId = user.id;
                logger.info('User connected', { userId: user.id, email: user.email, squareCustomerId: user?.square_customer_id });

                ws.on('message', async (data) => {
                    try {
                        let strData;
                        let jsonData;
                        let isJson = false;

                        // Check if the received data is a Buffer (binary)
                        if (Buffer.isBuffer(data)) {
                            strData = data.toString('utf8'); // Convert it to a string
                        } else if (typeof data === 'string') {
                            strData = data; // Already a string
                        } else {
                            strData = String(data); // Fallback
                        }

                        // Check if it looks like JSON
                        if (strData.trim().startsWith('{') || strData.trim().startsWith('[')) {
                            try {
                                jsonData = JSON.parse(strData);
                                isJson = true;
                            } catch (e) {
                                isJson = false;
                            }
                        }

                        if (isJson && jsonData) {
                            logger.debug('Received JSON message', {
                                userId: user.id,
                                messageType: jsonData.type
                            });

                            await this.handleMessage(ws, jsonData, user);
                        } else {
                            logger.debug('Received binary data, handling as image', {
                                userId: user.id,
                                dataSize: data.length
                            });

                            await this.handleImageUpload(ws, data, user);
                        }
                    } catch (error) {
                        logger.error('Message handling error', {
                            userId: user.id,
                            error: error.message,
                            stack: error.stack
                        });

                        ws.send(JSON.stringify({
                            type: 'error',
                            error: 'Failed to process message'
                        }));
                    }
                });

            } catch (error) {
                logger.error('WebSocket connection error', {
                    clientIp,
                    error: error.message,
                    stack: error.stack
                });
                ws.close(4000, 'Connection error');
            }
        });
    }

    // Generate thumbnail from image buffer or file path
    // Generate a thumbnail for an image
    async generateThumbnail(imageBuffer) {
        try {
            const thumbnail = await sharp(imageBuffer)
                .resize(200, 200, {fit: 'inside'})
                .toBuffer();

            return thumbnail.toString('base64');
        } catch (error) {
            logger.warn('Failed to generate thumbnail', {error: error.message});
            return null;
        }
    }

    // Record image access for bandwidth tracking
    async recordImageAccess(imageId, userId, bytesTransferred = 0) {
        try {
            await pool.query(
                'SELECT record_image_access($1, $2, $3)',
                [imageId, userId, bytesTransferred]
            );
        } catch (error) {
            logger.warn('Failed to record image access', {
                imageId,
                userId,
                error: error.message
            });
        }
    }

    // Get signed URL for an image
    async getSignedImageUrl(userId, imageId) {
        try {
            // Get the stored filename
            const result = await pool.query(
                'SELECT stored_filename FROM user_images WHERE id = $1 AND user_id = $2',
                [imageId, userId]
            );

            if (result.rows.length === 0) {
                throw new Error('Image not found or unauthorized');
            }

            const storedFilename = result.rows[0].stored_filename;

            // Use the function you defined
            const signedUrl = await getSignedUrl(storedFilename);

            // Record this access
            await this.recordImageAccess(imageId, userId, 0);

            return signedUrl;
        } catch (error) {
            logger.error('Failed to generate signed URL', {
                userId,
                imageId,
                error: error.message
            });
            throw error;
        }
    }

    // Modified handleChatMessage to handle image references
    async handleChatMessage(ws, message, user) {
        const client = await pool.connect();
        let aiResponse = '';
        let tokensUsed = 0;
        let conversationId = message.conversationId;
        let userMessageId = null;
        let aiMessageId = null;
        const stream = message.stream !== false;

        logger.startOperation('chat-message', {
            userId: user.id,
            conversationId,
            streamMode: stream,
            hasAttachments: message.image_ids && message.image_ids.length > 0
        });

        try {
            await client.query('BEGIN');

            // Verify existing conversation or create new one
            let conversation;
            if (conversationId) {
                conversation = await this.verifyConversation(user.id, conversationId);
                if (!conversation) {
                    throw new Error('Invalid conversation ID');
                }
            } else {
                conversation = await this.createNewConversation(client, user.id, message.content);
                conversationId = conversation.id;
            }

            // Save user message first and get its ID
            const userMessageResult = await client.query(
                'INSERT INTO messages (conversation_id, role, content, tokens_used, created_at, has_attachments) VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING id',
                [conversationId, 'user', message.content, 0, message.image_ids && message.image_ids.length > 0]
            );
            userMessageId = userMessageResult.rows[0].id;

            // Associate images with the message if they exist
            if (message.image_ids && message.image_ids.length > 0) {
                for (const imageId of message.image_ids) {
                    // Verify the image belongs to the user
                    const imageCheck = await client.query(
                        'SELECT id FROM user_images WHERE id = $1 AND user_id = $2',
                        [imageId, user.id]
                    );

                    if (imageCheck.rows.length > 0) {
                        // Create reference in message_references table
                        await client.query(
                            'INSERT INTO message_references (message_id, reference_type, reference_id) VALUES ($1, $2, $3)',
                            [userMessageId, 'image', imageId]
                        );

                        logger.debug('Image reference created', {
                            userId: user.id,
                            messageId: userMessageId,
                            imageId
                        });
                    } else {
                        logger.warn('Unauthorized image reference attempt', {
                            userId: user.id,
                            messageId: userMessageId,
                            imageId
                        });
                    }
                }
            }

            // Commit the user message immediately to ensure it's saved
            await client.query('COMMIT');

            // Begin a new transaction for the assistant message
            await client.query('BEGIN');

            // Now save a placeholder for the assistant message with a timestamp AFTER the user message
            const aiMessageResult = await client.query(
                'INSERT INTO messages (conversation_id, role, content, tokens_used, created_at, has_attachments) VALUES ($1, $2, $3, $4, NOW() + interval \'1 millisecond\', FALSE) RETURNING id',
                [conversationId, 'assistant', '', 0] // Empty content initially
            );
            aiMessageId = aiMessageResult.rows[0].id;

            const history = await this.getRecentMessages(user.id, conversationId);

            logger.debug('Starting OpenAI request', {
                userId: user.id,
                modelUsed: process.env.OPENAI_MODEL,
                historyLength: history.length,
                streamMode: stream,
                userMessageId,
                aiMessageId
            });

            if (stream) {
                // Send initial message to confirm conversation creation
                ws.send(JSON.stringify({
                    type: 'conversation_created',
                    conversation_id: conversationId,
                    title: conversation.title,
                    message_id: userMessageId  // Include user message ID
                }));

                const streamResponse = await openai.chat.completions.create({
                    model: process.env.OPENAI_MODEL,
                    messages: [
                        ...history.map(msg => ({
                            role: msg.role,
                            content: msg.content
                        })),
                        { role: 'user', content: message.content }
                    ],
                    temperature: parseFloat(process.env.OPENAI_MODEL_TEMPERATURE),
                    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS),
                    stream: true,
                    tools,
                    tool_choice: "auto",
                });

                for await (const chunk of streamResponse) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        aiResponse += content;
                        tokensUsed += 1;
                        ws.send(JSON.stringify({
                            type: 'chat_stream',
                            conversation_id: conversationId,
                            message_id: aiMessageId,  // Include assistant message ID in each chunk
                            chunk: content,
                            done: false
                        }));
                    }
                }
                // Send completion message for stream
                ws.send(JSON.stringify({
                    type: 'chat_stream',
                    conversation_id: conversationId,
                    message_id: aiMessageId,  // Include assistant message ID in completion
                    chunk: '',
                    done: true
                }));
            } else {
                const response = await openai.chat.completions.create({
                    model: process.env.OPENAI_MODEL,
                    messages: [
                        ...history.map(msg => ({
                            role: msg.role,
                            content: msg.content
                        })),
                        { role: 'user', content: message.content }
                    ],
                    temperature: parseFloat(process.env.OPENAI_MODEL_TEMPERATURE),
                    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS),
                    stream: false,
                    tools,
                    tool_choice: "auto",
                });

                aiResponse = response.choices[0]?.message?.content || '';
                tokensUsed = response.usage?.total_tokens || 0;

                // Send single response with both conversation creation and complete message
                ws.send(JSON.stringify({
                    type: 'chat_complete',
                    conversation_id: conversationId,
                    message_id: aiMessageId,  // Include assistant message ID
                    user_message_id: userMessageId,  // Also include user message ID for reference
                    title: conversation.title,
                    content: aiResponse,
                    done: true
                }));
            }

            logger.debug('OpenAI stream completed', {
                userId: user.id,
                tokensUsed,
                responseLength: aiResponse.length,
                userMessageId,
                aiMessageId
            });

            // Update the assistant message with the final content
            await client.query(
                'UPDATE messages SET content = $1, tokens_used = $2 WHERE id = $3',
                [aiResponse, tokensUsed, aiMessageId]
            );

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            logger.failOperation('chat-message', error, {
                userId: user.id,
                conversationId,
                userMessageId,
                aiMessageId
            });
            ws.send(JSON.stringify({
                type: 'error',
                error: error.message,
                conversationId,
                message_id: userMessageId
            }));
        } finally {
            client.release();
        }
    }

    async verifyUserSubscription(token) {
        logger.debug('Verifying user subscription', { token });
        try {
            const queryProd = `
                SELECT u.id, u.email, u.square_customer_id
                FROM users u
                WHERE u.id = (SELECT user_id
                              FROM refresh_tokens
                              WHERE token = $1
                                AND revoked_at IS NULL
                                AND expires_at > NOW())
            `
            const queryStaging = `
                SELECT u.id, u.email, u.square_customer_id
                FROM users u
                WHERE u.id = (SELECT user_id
                              FROM refresh_tokens
                              WHERE token = $1
                              LIMIT 1)
                              

            `
            const queryToRun = (process.env.ENV === 'dev' || process.env.ENV === 'staging') ? queryStaging : queryProd
            const result = await pool.query(queryToRun, [token]);

            let subscription = null;
            if (result.rows[0]?.square_customer_id !== null) {
                logger.debug('Getting user subscriptions', { userId: result.rows[0].id });
                const subscriptions = await getUserSubscriptions(result.rows[0].square_customer_id);
                subscription = subscriptions[subscriptions.length - 1] || null;
            }

            const user = {
                ...result.rows[0],
                subscription
            }

            if (user) {
                logger.debug('Subscription verified', { userId: user.id, email: user.email });
            } else {
                logger.warn('Invalid or expired subscription', { token });
            }
            return user;
        } catch (error) {
            logger.error('Subscription verification error', {
                token,
                error: error.message,
                stack: error.stack
            });
            return null;
        }
    }

    // Get image by ID (for direct serving via WebSocket)
    async getImage(ws, message, user) {
        try {
            const { image_id: imageId } = message;

            if (!imageId) {
                throw new Error('Image ID is required');
            }

            const result = await pool.query(
                `SELECT *
                 FROM user_images
                 WHERE id = $1
                   AND user_id = $2`,
                [imageId, user.id]
            );

            if (!result.rows.length) {
                throw new Error('Image not found or unauthorized');
            }

            const imageData = result.rows[0];

            // Record image access metrics
            try {
                // Check if a record already exists
                const existingRecord = await pool.query(
                    `SELECT id
                     FROM image_usage_metrics
                     WHERE image_id = $1
                       AND user_id = $2
                     LIMIT 1`,
                    [imageId, user.id]
                );

                if (existingRecord.rows.length > 0) {
                    // Update existing record
                    await pool.query(
                        `UPDATE image_usage_metrics
                         SET bytes_transferred = bytes_transferred + $3,
                             request_count     = request_count + 1,
                             last_accessed     = CURRENT_TIMESTAMP
                         WHERE image_id = $1
                           AND user_id = $2`,
                        [imageId, user.id, imageData.size]
                    );
                } else {
                    // Insert new record
                    await pool.query(
                        `INSERT INTO image_usage_metrics
                             (image_id, user_id, bytes_transferred, request_count, last_accessed)
                         VALUES ($1, $2, $3, 1, CURRENT_TIMESTAMP)`,
                        [imageId, user.id, imageData.size]
                    );
                }
            } catch (metricError) {
                // Log the error but continue with serving the image
                logger.error('Error recording image access metrics:', {
                    error: metricError.message,
                    stack: metricError.stack,
                    userId: user.id,
                    imageId
                });
                // Don't throw the error so we can still serve the image
            }

            let imageUrl;

            // Check if image is stored in S3 or local filesystem
            if (imageData.stored_filename.includes('/')) {
                // Generate pre-signed URL for S3
                try {
                    const params = {
                        Bucket: S3_BUCKET,
                        Key: imageData.stored_filename,
                        Expires: IMAGE_EXPIRY // Use the configured expiry time
                    };

                    // Use the getSignedUrl function that's already defined
                    imageUrl = await getSignedUrl(imageData.stored_filename);

                    logger.debug('Generated pre-signed URL for S3 image', {
                        userId: user.id,
                        imageId,
                        bucket: S3_BUCKET,
                        key: imageData.stored_filename
                    });
                } catch (s3Error) {
                    logger.error('Error generating pre-signed URL:', {
                        error: s3Error.message,
                        stack: s3Error.stack,
                        userId: user.id,
                        imageId,
                        bucket: S3_BUCKET,
                        key: imageData.stored_filename
                    });
                    throw new Error(`Failed to generate access URL: ${s3Error.message}`);
                }
            }

            // Send image pre-signed URL
            ws.send(JSON.stringify({
                type: 'image_data',
                id: imageId,
                url: imageUrl,
                filename: imageData.filename,
                mime_type: imageData.type
            }));
        } catch (error) {
            logger.error('Error getting image:', {
                error: error.message,
                stack: error.stack,
                userId: user.id,
                imageId: message.image_id
            });

            ws.send(JSON.stringify({
                type: 'error',
                error: `Error getting image: ${error.message}`
            }));
        }
    }

    async verifyConversation(userId, conversationId) {
        if (!conversationId) return null;

        const result = await pool.query(
            'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
            [conversationId, userId]
        );

        return result.rows[0] || null;
    }

    async createNewConversation(client, userId, initialMessage) {
        // Generate a title based on the user's first message
        const titleResponse = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "Generate a brief, contextual title (maximum 6 words) for a conversation that starts with this message. Return only the title, nothing else."
                },
                {
                    role: "user",
                    content: initialMessage
                }
            ],
            temperature: parseFloat(process.env.OPENAI_MODEL_TEMPERATURE),
            max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS),
        });

        const title = titleResponse.choices[0]?.message?.content?.trim() || "New Chat";

        const result = await client.query(
            'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *',
            [userId, title]
        );

        return result.rows[0];
    }

    // Chat history with pagination
    // Modified getConversationHistory to include humanization counts and images
    async getConversationHistory(userId, conversationId, limit = 20, offset = 0) {
        const result = await pool.query(`
                    SELECT *
                    FROM (SELECT m.*,
                                 c.title                                                           as conversation_title,
                                 (SELECT COUNT(*) FROM humanized_messages WHERE message_id = m.id) as humanized_count,
                                 (SELECT json_agg(
                                                 json_build_object(
                                                         'id', ui.id,
                                                         'filename', ui.filename,
                                                         'type', ui.type,
                                                         'size', ui.size,
                                                         'source', ui.source,
                                                         'created_at', ui.created_at,
                                                         'thumbnail', ui.thumbnail
                                                 )
                                         )
                                  FROM message_references mr
                                           JOIN user_images ui ON mr.reference_id = ui.id
                                  WHERE mr.message_id = m.id
                                    AND mr.reference_type = 'image')                               as images
                          FROM messages m
                                   JOIN conversations c ON c.id = m.conversation_id
                          WHERE c.id = $1
                            AND c.user_id = $2
                          ORDER BY m.created_at DESC
                          LIMIT $3 OFFSET $4) sub
                    ORDER BY sub.created_at ASC;
            `,
            [conversationId, userId, limit, offset]
        );

        // Generate signed URLs for all images
        const messages = result.rows;
        for (const message of messages) {
            message.offset = offset
            if (message.images && message.images.length > 0) {
                for (let i = 0; i < message.images.length; i++) {
                    // Record image access for usage tracking
                    await this.recordImageAccess(message.images[i].id, userId);

                    // Generate signed URL
                    const signedUrl = await this.getSignedImageUrl(userId, message.images[i].id);
                    message.images[i].url = signedUrl;
                }
            }
        }

        return messages;
    }

    // Get all user conversations
    async getUserConversations(userId) {
        const result = await pool.query(`
                    SELECT c.*,
                           (SELECT content
                            FROM messages
                            WHERE conversation_id = c.id
                            ORDER BY created_at DESC
                            LIMIT 1)   as last_message,
                           COUNT(m.id) as message_count
                    FROM conversations c
                             LEFT JOIN messages m ON c.id = m.conversation_id
                    WHERE c.user_id = $1
                    GROUP BY c.id, c.updated_at
                    ORDER BY c.updated_at DESC`,
            [userId]
        );
        return result.rows;
    }

    // Rename conversation
    async renameConversation(userId, conversationId, newTitle) {
        if (!newTitle) {
            throw new Error("Title is required for renaming conversation")
        }
        const result = await pool.query(`
                    UPDATE conversations
                    SET title      = $1,
                        updated_at = NOW()
                    WHERE id = $2
                      AND user_id = $3
                    RETURNING *`,
            [newTitle, conversationId, userId]
        );

        if (!result.rows.length) {
            throw new Error('Conversation not found or unauthorized');
        }
        return result.rows[0];
    }

    // Delete conversation
    async deleteConversation(userId, conversationId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verify the conversation belongs to the user
            const conversationCheck = await client.query(
                'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
                [conversationId, userId]
            );

            if (conversationCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return false;
            }

            // Delete from conversations (should cascade to messages, which should cascade to humanized_messages)
            const result = await client.query(
                'DELETE FROM conversations WHERE id = $1 RETURNING id',
                [conversationId]
            );

            await client.query('COMMIT');
            return result.rows.length > 0;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error deleting conversation:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Simple function to check if data is an image by looking at magic bytes
    isImage(buffer) {
        // Check for common image format signatures
        const signatures = {
            // JPEG
            'ffd8ff': 'image/jpeg',
            // PNG
            '89504e47': 'image/png',
            // GIF
            '47494638': 'image/gif',
            // WEBP
            '52494646': 'image/webp'
        };

        // Get first 4 bytes as hex
        const hex = buffer.slice(0, 4).toString('hex');

        // Check against signatures
        for (const [signature, mime] of Object.entries(signatures)) {
            if (hex.startsWith(signature.substring(0, hex.length))) {
                return {
                    mime,
                    ext: mime.split('/')[1]
                };
            }
        }

        return null;
    }

    // Updated handleImageUpload method with optional filename
    // New method to handle image uploads
    async handleImageUpload(ws, imageData, user) {
        logger.startOperation('image-upload', {
            userId: user.id,
            dataSize: imageData.length
        });

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Check file size
            const maxSize = parseInt(process.env.MAX_IMAGE_SIZE || "10485760");
            if (imageData.length > maxSize) {
                throw new Error(`Image exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
            }

            // Then in your upload handler:
            // Validate that it's actually an image
            const fileInfo = this.isImage(imageData);
            if (!fileInfo) {
                throw new Error('Invalid image format');
            }

            let fileExtension = fileInfo.ext;
            let mimeType = fileInfo.mime;

            // Generate thumbnail
            const thumbnail = await this.generateThumbnail(imageData);

            // Generate a unique filename
            const uniqueId = crypto.randomUUID();
            const storedFilename = `${user.id}/${uniqueId}.${fileExtension}`;
            const originalFilename = `image_${Date.now()}.${fileExtension}`;

            // Upload to S3 using the function you defined
            await uploadToS3(storedFilename, imageData, mimeType);

            // Store reference in database
            const result = await client.query(
                `INSERT INTO user_images (user_id, filename, stored_filename, type, size, source, thumbnail)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id`,
                [
                    user.id,
                    originalFilename,
                    storedFilename,
                    mimeType,
                    imageData.length,
                    'upload',
                    thumbnail
                ]
            );

            const imageId = result.rows[0].id;

            // Generate a signed URL using the function you defined
            const signedUrl = await getSignedUrl(storedFilename);

            // Initialize usage metrics
            await client.query(
                'SELECT record_image_access($1, $2, $3)',
                [imageId, user.id, 0]
            );

            await client.query('COMMIT');

            logger.debug('Image uploaded successfully', {
                userId: user.id,
                imageId,
                storedFilename,
                size: imageData.length
            });

            // Send success response
            ws.send(JSON.stringify({
                type: 'image_uploaded',
                image_id: imageId,
                url: signedUrl,
                filename: originalFilename,
                size: imageData.length,
                mime_type: mimeType,
                thumbnail
            }));

        } catch (error) {
            await client.query('ROLLBACK');

            logger.failOperation('image-upload', error, {
                userId: user.id
            });

            ws.send(JSON.stringify({
                type: 'error',
                error: `Image upload failed: ${error.message}`
            }));
        } finally {
            client.release();
        }
    }

    // Helper function to sanitize filenames
    sanitizeFilename(filename) {
        // Remove any path components (slashes, backslashes)
        let sanitized = filename.replace(/[\/\\]/g, '');

        // Remove special characters that might cause issues
        sanitized = sanitized.replace(/[^a-zA-Z0-9_\-\.]/g, '_');

        // Ensure filename doesn't start with dots (hidden files)
        sanitized = sanitized.replace(/^\.+/, '');

        // Limit length
        if (sanitized.length > 100) {
            const extension = path.extname(sanitized);
            const basename = path.basename(sanitized, extension);
            sanitized = basename.substring(0, 100 - extension.length) + extension;
        }

        // If sanitizing removed everything, provide a default
        if (!sanitized) {
            sanitized = 'unnamed_file';
        }

        return sanitized;
    }

    // Add a new handler for detailed image analysis that can work with any uploaded image
    async handleImageAnalysis(ws, message, user) {
        logger.startOperation('image-analysis', {
            userId: user.id,
            imageId: message.image_id
        });

        try {
            const {imageId, content: prompt} = message;

            if (!imageId) {
                throw new Error('Image ID is required');
            }

            if (!prompt || !prompt.trim()) {
                throw new Error('Analysis prompt is required');
            }

            // Fetch the image from database
            const result = await pool.query(
                `SELECT *
                 FROM user_images
                 WHERE id = $1
                   AND user_id = $2`,
                [imageId, user.id]
            );

            if (!result.rows.length) {
                throw new Error('Image not found or unauthorized');
            }

            const imageData = result.rows[0];

            // Check if stored in S3 or local file system
            let imageBuffer;
            let base64Image;

            if (imageData.stored_filename.includes('/')) {
                // S3 storage
                const getParams = {
                    Bucket: S3_BUCKET,
                    Key: imageData.stored_filename
                };

                try {
                    // Use the s3.getObject() method from AWS SDK v2
                    const s3Response = await s3.getObject(getParams).promise();
                    imageBuffer = s3Response.Body;
                    base64Image = imageBuffer.toString('base64');
                } catch (s3Error) {
                    logger.error('Error retrieving image from S3:', {
                        error: s3Error.message,
                        stack: s3Error.stack,
                        userId: user.id,
                        imageId,
                        key: imageData.stored_filename
                    });
                    throw new Error('Failed to retrieve image from storage');
                }
            } else {
                // Local file system
                const filePath = path.join(UPLOAD_DIR, imageData.stored_filename);
                try {
                    imageBuffer = await fs.readFile(filePath);
                    base64Image = imageBuffer.toString('base64');
                } catch (fsError) {
                    logger.error('Error reading image file:', {
                        error: fsError.message,
                        stack: fsError.stack,
                        userId: user.id,
                        imageId,
                        path: filePath
                    });
                    throw new Error('Failed to read image file');
                }
            }

            // Create a conversation context
            const client = await pool.connect();
            let conversationId = message.conversationId;
            let messageId = null;

            try {
                await client.query('BEGIN');


                // USAGE BASED ON SUBSCRIPTION: 
                // Count of image analysis for the user in the last month
                const userImageAnalysisCount = await client.query(
                    `SELECT COUNT(*) FROM user_usage_metric WHERE user_id = $1 AND type = 'image_analysis' AND created_at >= NOW() - INTERVAL '1 month'`,
                    [user.id]
                );

                const isActive = user.subscription?.status === ACTIVE;
                const planId = isActive ? user.subscription?.planId : FREE;
                const hasFeatureAccess = subscriptionFeatureAccess[planId];

                // Check if the user has reached the maximum number of image generations for the month
                if (userImageAnalysisCount.rows[0].count >= hasFeatureAccess.maxPictureAnalysis) {
                    throw new Error("You have reached the maximum number of image analysis for the month. Please upgrade to a paid plan to continue.");
                }

                let conversation;

                if (conversationId) {
                    conversation = await this.verifyConversation(user.id, conversationId);
                    if (!conversation) {
                        throw new Error('Invalid conversation ID');
                    }
                } else {
                    conversation = await this.createNewConversation(client, user.id, prompt);
                    conversationId = conversation.id;
                }

                // Save user message with prompt
                const userMessageResult = await client.query(
                    'INSERT INTO messages (conversation_id, role, content, tokens_used, created_at, has_attachments) VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING id',
                    [conversationId, 'user', prompt, 0, true]
                );
                const userMessageId = userMessageResult.rows[0].id;

                // Link image to user message using direct query instead of helper method
                await client.query(
                    'INSERT INTO message_references (message_id, reference_type, reference_id) VALUES ($1, $2, $3)',
                    [userMessageId, 'image', imageId]
                );

                // Update message to indicate it has attachments
                await client.query(
                    'UPDATE messages SET has_attachments = TRUE WHERE id = $1',
                    [userMessageId]
                );

                // Placeholder for assistant message
                const aiMessageResult = await client.query(
                    'INSERT INTO messages (conversation_id, role, content, tokens_used, created_at) VALUES ($1, $2, $3, $4, NOW() + interval \'1 millisecond\') RETURNING id',
                    [conversationId, 'assistant', '', 0]
                );
                messageId = aiMessageResult.rows[0].id;

                await client.query('COMMIT');

                // Notify client that processing has started
                ws.send(JSON.stringify({
                    type: 'image_analysis_started',
                    message_id: messageId,
                    conversation_id: conversationId
                }));

                // Use base64 encoded image for OpenAI Vision
                const base64ImageForAPI = `data:${imageData.type};base64,${base64Image}`;

                // Use OpenAI Vision to analyze the image
                const response = await openai.chat.completions.create({
                    model: process.env.OPENAI_IMAGE_ANALYSIS_MODEL, // Use the appropriate model with vision capabilities
                    messages: [
                        {
                            role: "user",
                            content: [
                                {type: "text", text: prompt},
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: base64ImageForAPI,
                                        detail: "high" // Use high detail for better analysis
                                    }
                                }
                            ],
                        },
                    ],
                    max_tokens: 800,
                });

                const aiResponse = response.choices[0]?.message?.content || '';
                const tokensUsed = response.usage?.total_tokens || 0;

                // Start a new transaction to update the AI message
                await client.query('BEGIN');

                // Update the AI message with response
                await client.query(
                    'UPDATE messages SET content = $1, tokens_used = $2 WHERE id = $3',
                    [aiResponse, tokensUsed, messageId]
                );

                // create user usage record if the user has not reached the maximum number of image analysis for the month
                if (userImageAnalysisCount.rows[0].count < hasFeatureAccess.maxPictureAnalysis) {
                    await client.query(
                        `INSERT INTO user_usage_metric (user_id, type, image_analysis_id)
                     VALUES ($1, $2, $3)`,
                        [user.id, 'image_analysis', imageId]
                    );
                }

                await client.query('COMMIT');

                logger.debug('Image analysis completed', {
                    userId: user.id,
                    imageId,
                    messageId,
                    tokensUsed
                });

                // Send response to client
                ws.send(JSON.stringify({
                    type: 'image_analysis_complete',
                    message_id: messageId,
                    conversation_id: conversationId,
                    content: aiResponse,
                    image: {
                        id: imageId,
                        thumbnail: imageData.thumbnail
                    }
                }));

                ws.send(JSON.stringify({
                    type: 'user_usage',
                    user_usage: await this.getUserUsage(user)
                }));

            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

        } catch (error) {
            logger.error('Error analyzing image:', {
                error: error.message,
                stack: error.stack,
                userId: user.id,
                imageId: message.imageId
            });

            ws.send(JSON.stringify({
                type: 'error',
                error: `Error analyzing image: ${error.message}`
            }));
        }
    }

    // Add this to your ChatServer class to handle image generation from chat


    // Handle chat with image generation
    async handleChatWithImage(ws, message, user) {
        const client = await pool.connect();
        let aiResponse = '';
        let tokensUsed = 0;
        let conversationId = message.conversationId;
        let userMessageId = null;
        let aiMessageId = null;
        let generatedImage = null;
        const stream = message.stream !== false; // Default to true

        logger.startOperation('chat-with-image', {
            userId: user.id,
            conversationId,
            streamMode: stream
        });


        try {
            await client.query('BEGIN');

            // USAGE BASED ON SUBSCRIPTION: 
            // Count of image generations for the user in the last month
            const userImageGenerationCount = await client.query(
                `SELECT COUNT(*) FROM user_usage_metric WHERE user_id = $1 AND type = 'image_generation' AND created_at >= NOW() - INTERVAL '1 month'`,
                [user.id]
            );

            const isActive = user.subscription?.status === ACTIVE;
            const planId = isActive ? user.subscription?.planId : FREE;
            const hasFeatureAccess = subscriptionFeatureAccess[planId];

            // Check if the user has reached the maximum number of image generations for the month
            if (userImageGenerationCount.rows[0].count >= hasFeatureAccess.maxPictureGeneration) {
                throw new Error("You have reached the maximum number of image generations for the month. Please upgrade to a paid plan to continue.");
            }


            const imagePrompt = message.content.trim();

            // Verify existing conversation or create new one
            let conversation;
            if (conversationId) {
                conversation = await this.verifyConversation(user.id, conversationId);
                if (!conversation) {
                    throw new Error('Invalid conversation ID');
                }
            } else {
                conversation = await this.createNewConversation(client, user.id, message.content);
                conversationId = conversation.id;
            }

            // Save user message first and get its ID
            const userMessageResult = await client.query(
                'INSERT INTO messages (conversation_id, role, content, tokens_used, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
                [conversationId, 'user', message.content, 0]
            );
            userMessageId = userMessageResult.rows[0].id;

            // Now save a placeholder for the assistant message
            const aiMessageResult = await client.query(
                'INSERT INTO messages (conversation_id, role, content, tokens_used, created_at) VALUES ($1, $2, $3, $4, NOW() + interval \'1 millisecond\') RETURNING id',
                [conversationId, 'assistant', '', 0]
            );
            aiMessageId = aiMessageResult.rows[0].id;

            // Commit both messages to ensure they exist in the database
            await client.query('COMMIT');

            // Send initial message for image generation
            if (stream) {
                ws.send(JSON.stringify({
                    type: 'conversation_created',
                    conversation_id: conversationId,
                    title: conversation.title,
                    message_id: userMessageId
                }));

                ws.send(JSON.stringify({
                    type: 'chat_stream',
                    conversation_id: conversationId,
                    message_id: aiMessageId,
                    chunk: `I'll generate an image based on your prompt: "${imagePrompt}". Please wait a moment...`,
                    done: false
                }));
            }

            // Generate the image
            try {
                // Generate image with DALL-E
                const response = await openai.images.generate({
                    // model: process.env.OPENAI_IMAGE_GEN_MODEL,
                    model: "gpt-image-1",
                    prompt: imagePrompt,
                    size: "auto",
                    quality: "auto"
                });

                const base64ImageData = response.data[0]?.b64_json;

                if (!base64ImageData) {
                    throw new Error('Failed to generate image');
                }

                const imageBuffer = Buffer.from(base64ImageData, 'base64');

                const imageId = uuidv4();
                const dateNow = Date.now();

                let originalFilename = `${imagePrompt.substring(0, 50)}${imagePrompt.length > 50 ? '...' : ''}.png`;
                originalFilename = this.sanitizeFilename(originalFilename);

                const s3Key = `${user.id}/${dateNow}_${imageId}.png`;

                const thumbnail = await this.generateThumbnail(imageBuffer);

                // Upload image to S3
                try {
                    await uploadToS3(s3Key, imageBuffer, 'image/png');

                    logger.debug('Uploaded generated image to S3', {
                        userId: user.id,
                        s3Key,
                        size: imageBuffer.length
                    });
                } catch (s3Error) {
                    logger.error('Failed to upload generated image to S3:', {
                        error: s3Error.message,
                        stack: s3Error.stack,
                        userId: user.id
                    });
                    throw new Error(`Failed to store generated image: ${s3Error.message}`);
                }

                // Save metadata to database
                const imageData = await pool.query(
                    `INSERT INTO user_images (user_id, filename, stored_filename, type, size, source, thumbnail)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING *`,
                    [
                        user.id,
                        originalFilename,
                        s3Key,
                        'image/png',
                        imageBuffer.length,
                        'generated_from_text',
                        thumbnail
                    ]
                );

                generatedImage = imageData.rows[0];

                // Start a new transaction to add the image reference
                await client.query('BEGIN');

                // Link the image to the message
                await client.query(
                    `INSERT INTO message_references (message_id, reference_type, reference_id)
                     VALUES ($1, $2, $3)`,
                    [aiMessageId, 'image', generatedImage.id]
                );

                // Update the message to indicate it has attachments
                await client.query(
                    `UPDATE messages
                     SET has_attachments = TRUE
                     WHERE id = $1`,
                    [aiMessageId]
                );

                await client.query('COMMIT');

                // Create response message with image info
                aiResponse = `Here's the image I generated based on your prompt: "${imagePrompt}"`;

                // Start another transaction to update the message content
                await client.query('BEGIN');

                // Update the assistant message with the final content
                await client.query(
                    'UPDATE messages SET content = $1, tokens_used = $2 WHERE id = $3',
                    [aiResponse, tokensUsed, aiMessageId]
                );


                if (userImageGenerationCount.rows[0].count < hasFeatureAccess.maxPictureGeneration) {
                    // create user usage record if the user has not reached the maximum number of image generations for the month
                    await client.query(
                        `INSERT INTO user_usage_metric (user_id, type, image_generation_id)
                     VALUES ($1, $2, $3)`,
                        [user.id, 'image_generation', generatedImage.id]
                    );
                }

                await client.query('COMMIT');

                // Generate a signed URL for the image
                const imageSignedUrl = await getSignedUrl(s3Key);

                if (stream) {
                    // Send completion message for stream
                    ws.send(JSON.stringify({
                        type: 'chat_stream',
                        conversation_id: conversationId,
                        message_id: aiMessageId,
                        chunk: aiResponse,
                        done: true,
                        image: {
                            id: generatedImage.id,
                            thumbnail: generatedImage.thumbnail,
                            filename: originalFilename,
                            url: imageSignedUrl
                        }
                    }));



                } else {
                    // Send single response for non-streaming mode
                    ws.send(JSON.stringify({
                        type: 'chat_complete',
                        conversation_id: conversationId,
                        message_id: aiMessageId,
                        user_message_id: userMessageId,
                        title: conversation.title,
                        content: aiResponse,
                        done: true,
                        image: {
                            id: generatedImage.id,
                            thumbnail: generatedImage.thumbnail,
                            filename: originalFilename,
                            url: imageUrl
                        }
                    }));
                }
            } catch (error) {
                logger.error('Image generation failed:', {
                    userId: user.id,
                    error: error.message,
                    stack: error.stack
                });

                // Fall back to regular text response
                aiResponse = `I'm sorry, but I couldn't generate an image based on your prompt. ${error.message}`;

                // Start another transaction to update the message content
                await client.query('BEGIN');

                // Update the assistant message with the error message
                await client.query(
                    'UPDATE messages SET content = $1, tokens_used = $2 WHERE id = $3',
                    [aiResponse, tokensUsed, aiMessageId]
                );

                await client.query('COMMIT');

                if (stream) {
                    ws.send(JSON.stringify({
                        type: 'chat_stream',
                        conversation_id: conversationId,
                        message_id: aiMessageId,
                        chunk: aiResponse,
                        done: true
                    }));
                } else {
                    ws.send(JSON.stringify({
                        type: 'chat_complete',
                        conversation_id: conversationId,
                        message_id: aiMessageId,
                        user_message_id: userMessageId,
                        title: conversation.title,
                        content: aiResponse,
                        done: true
                    }));
                }
            }
        } catch (error) {
            // Make sure to rollback any active transaction
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                logger.error('Rollback failed:', {
                    error: rollbackError.message,
                    originalError: error.message
                });
            }

            logger.failOperation('chat-with-image', error, {
                userId: user.id,
                conversationId,
                userMessageId,
                aiMessageId
            });

            ws.send(JSON.stringify({
                type: 'error',
                error: error.message,
                conversationId,
                message_id: userMessageId
            }));
        } finally {
            client.release();
        }
    }

    // Update the handleMessage method to include the new chat_with_image type
    async handleMessage(ws, message, user) {
        switch (message.type) {
            case 'chat':
                await this.handleChatMessage(ws, message, user);
                break;
            case 'chat_with_tts':
                await this.handleTextToSpeech(ws, message, user);
                break;
            case 'chat_with_image':
                await this.handleChatWithImage(ws, message, user);
                break;
            case 'get_history':
                const history = await this.getConversationHistory(
                    user.id,
                    message.conversationId,
                    message.limit,
                    message.offset
                );
                ws.send(JSON.stringify({
                    type: 'history',
                    conversationId: message.conversationId,
                    messages: history
                }));
                ws.send(JSON.stringify({
                    type: 'user_usage',
                    user_usage: await this.getUserUsage(user)
                }));
                break;
            case 'get_conversations':
                const conversations = await this.getUserConversations(user.id);
                ws.send(JSON.stringify({
                    type: 'conversations',
                    conversations
                }));
                break;
            case 'rename_conversation':
                const updated = await this.renameConversation(
                    user.id,
                    message.conversationId,
                    message.title
                );
                ws.send(JSON.stringify({
                    type: 'conversation_renamed',
                    conversation: updated
                }));
                break;
            case 'delete_conversation':
                const deletedConversation = await this.deleteConversation(
                    user.id,
                    message.conversationId
                );
                ws.send(JSON.stringify({
                    type: 'conversation_deleted',
                    conversationId: message.conversationId,
                    success: deletedConversation
                }));
                break;
            case 'humanize':
                await this.handleHumanizeMessage(ws, message, user);
                break;
            case 'get_humanized_messages':
                const messages = await this.getHumanizedMessages(user, message.limit, message.offset, message.message_id);
                ws.send(JSON.stringify({
                    type: 'get_humanized_messages',
                    messageId: message.message_id ?? null,
                    messages
                }));
                break;
            case 'image_upload':
                await this.handleImageUpload(ws, message, user);
                break;
            case 'get_image':
                await this.getImage(ws, message, user);
                break;
            case 'get_user_images':
                const images = await this.getUserImages(
                    user.id,
                    message.limit || 20,
                    message.offset || 0
                );
                ws.send(JSON.stringify({
                    type: 'user_images',
                    images
                }));
                break;
            case 'delete_image':
                const deletedImage = await this.deleteUserImage(user.id, message.image_id);
                ws.send(JSON.stringify({
                    type: 'image_deleted',
                    image_id: message.image_id,
                    success: deletedImage
                }));
                break;
            case 'image_analysis':
                await this.handleImageAnalysis(ws, message, user);
                break;
            case 'get_user_usage':
                ws.send(JSON.stringify({
                    type: 'user_usage',
                    user_usage: await this.getUserUsage(user)
                }));
                break;
            default:
                ws.send(JSON.stringify({
                    type: 'error',
                    error: 'Unknown message type'
                }));
        }
    }

    async getRecentMessages(userId, conversationId, limit = 20, offset = 0) {
        const result = await pool.query(`
                    SELECT role, content
                    FROM messages
                    WHERE conversation_id = $1
                      AND conversation_id IN (SELECT id
                                              FROM conversations
                                              WHERE user_id = $2)
                    ORDER BY created_at DESC
                    LIMIT $3 OFFSET $4`,
            [conversationId, userId, limit, offset]
        );

        return result.rows.reverse();
    }

    async humanizeText(text) {
        try {
            const response = await fetch(HUMANIZER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HUMANIZER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text,
                    model: 'undetectable',
                    words: true
                })
            });

            if (!response.ok) {
                throw new Error(`Humanization API error: ${response.status}`);
            }

            const data = await response.json();
            return data.output // Adjust based on actual API response structure
        } catch (error) {
            logger.error('Humanization API error:', {
                error: error.message,
                stack: error.stack
            });
            throw new Error(`Failed to humanize text`);
        }
    }

    async handleHumanizeMessage(ws, message, user) {
        logger.startOperation('humanize-message', {
            userId: user.id,
            messageId: message.message_id,
            hasDirectText: !!message.text
        });

        try {
            let textToHumanize;
            let hasMessageId = false
            let reHumanize = message.re_humanize ?? false
            let reHumanizeId, conversationId

            const client = await pool.connect();

            await client.query('BEGIN');

            if (message.message_id) {
                hasMessageId = true
                if (reHumanize) {
                    const result = await client.query(`
                        SELECT humanized_messages.id, humanized_text, conversation_id
                        FROM humanized_messages
                                 JOIN public.messages m on m.id = humanized_messages.message_id
                        WHERE user_id = $1
                          AND message_id = $2
                        ORDER BY created_at DESC
                        LIMIT 1
                    `, [user.id, message.message_id])

                    if (!result.rows.length) {
                        throw new Error('Message not found or unauthorized');
                    }

                    textToHumanize = result.rows[0].humanized_text
                    reHumanizeId = result.rows[0].id
                    conversationId = result.rows[0].conversation_id
                } else {
                    // Fetch message content from database
                    const result = await client.query(
                        `SELECT m.content, c.user_id, m.conversation_id
                         FROM messages m
                                  JOIN conversations c ON c.id = m.conversation_id
                         WHERE m.id = $1
                           AND c.user_id = $2`,
                        [message.message_id, user.id]
                    );

                    if (!result.rows.length) {
                        throw new Error('Message not found or unauthorized');
                    }

                    textToHumanize = result.rows[0].content;
                    conversationId = result.rows[0].conversation_id
                }
            } else if (message.text) {
                textToHumanize = message.text;
            } else {
                throw new Error('Either message_id or text must be provided');
            }

            // if (textToHumanize.length > ChatServer.MAX_HUMANIZE_LENGTH) {
            //     throw new Error(`Text exceeds maximum length of ${ChatServer.MAX_HUMANIZE_LENGTH} characters`);
            // }

            // USAGE BASED ON SUBSCRIPTION: 
            const isActive = user.subscription?.status === ACTIVE;
            const planId = isActive ? user.subscription?.planId : FREE;

            // limits.humanizeSupport && userHumanizeUsageCount < limits.maxHumanizeUsage
            const userHumanizeUsageCount = await client.query(
                `SELECT COUNT(*) FROM user_usage_metric WHERE user_id = $1 AND type = 'humanization'`,
                [user.id]
            )

            const limits = subscriptionFeatureAccess[planId];
            if (limits.humanizeSupport && userHumanizeUsageCount.rows[0].count >= limits.maxHumanizeUsage) {
                throw new Error("You don't have access to humanize feature. Please upgrade to a paid plan to continue.");
            }

            // Rest of the handling remains the same...
            ws.send(JSON.stringify({
                type: 'humanize_status',
                status: 'processing',
                request_id: message.request_id
            }));

            const humanizedText = await this.humanizeText(textToHumanize);

            // Update user usage metric
            const humanizedMessageResult = await client.query(
                `INSERT INTO humanized_messages(message_id, user_id, humanized_text, re_humanized_id, original_text)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [hasMessageId ? message.message_id : null, user.id, humanizedText, reHumanize ? reHumanizeId : null, textToHumanize]
            )

            const humanizedMessageId = humanizedMessageResult.rows[0].id

            await client.query(
                `INSERT INTO user_usage_metric(user_id, type, humanization_id)
                 VALUES ($1, 'humanization', $2)`,
                [user.id, humanizedMessageId]
            )

            await client.query('COMMIT');

            ws.send(JSON.stringify({
                type: !message.message_id ? 'text_humanize_complete' : 'humanize_complete',
                original_text: textToHumanize,
                humanized_text: humanizedText,
                request_id: message.request_id,
                message_id: message.message_id,
                conversation_id: conversationId
            }));

            ws.send(JSON.stringify({
                type: 'user_usage',
                user_usage: await this.getUserUsage(user)
            }));

        } catch (error) {

            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                logger.error('Rollback error:', {
                    error: rollbackError.message,
                    originalError: error.message
                });
            }

            logger.failOperation('humanize-message', error, {
                userId: user.id,
                messageId: message.message_id
            });

            ws.send(JSON.stringify({
                type: 'error',
                error: error.message,
                request_id: message.request_id
            }));
        }
    }

    async getHumanizedMessages(user, limit = 20, offset = 0, message_id = null) {
        logger.startOperation('get-humanized-messages', {
            userId: user.id,
            messageId: message_id,
        });
        let result
        if (!message_id) {
            result = await pool.query(`
                SELECT id,
                       humanized_text,
                       created_at,
                       case when re_humanized_id notnull then true else false end as re_humanized
                FROM humanized_messages
                WHERE user_id = $1
                ORDER BY created_at
                LIMIT $2 OFFSET $3
            `, [user.id, limit, offset])
        } else if (message_id && user.id) {
            result = await pool.query(`
                SELECT id,
                       humanized_text,
                       created_at,
                       case when re_humanized_id notnull then true else false end as re_humanized
                FROM humanized_messages
                WHERE user_id = $1
                  AND message_id = $2
                ORDER BY created_at
                LIMIT $3 OFFSET $4
            `, [user.id, message_id, limit, offset])
        }

        return result.rows.reverse()
    }

    // New method to get user's uploaded images
    async getUserImages(userId, limit = 20, offset = 0) {
        const result = await pool.query(`
            SELECT ui.id,
                   ui.filename,
                   ui.type,
                   ui.size,
                   ui.source,
                   ui.source_id,
                   ui.created_at,
                   ui.thumbnail,
                   (SELECT COUNT(*) FROM user_images WHERE source_id = ui.id) as derived_count
            FROM user_images ui
            WHERE ui.user_id = $1
            ORDER BY ui.created_at DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);

        const images = result.rows;

        // Generate signed URLs for each image
        for (let i = 0; i < images.length; i++) {
            try {
                images[i].url = await this.getSignedImageUrl(userId, images[i].id);
            } catch (error) {
                images[i].url = null;
                logger.warn('Failed to get signed URL for image', {
                    userId,
                    imageId: images[i].id,
                    error: error.message
                });
            }
        }

        return images;
    }

    // New method to delete a user image
    async deleteUserImage(userId, imageId) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Check if the image exists and belongs to the user
            const imageResult = await client.query(
                'SELECT stored_filename FROM user_images WHERE id = $1 AND user_id = $2',
                [imageId, userId]
            );

            if (imageResult.rows.length === 0) {
                return false;
            }

            const storedFilename = imageResult.rows[0].stored_filename;

            // Delete from S3
            try {
                const deleteParams = {
                    Bucket: S3_BUCKET,
                    Key: storedFilename
                };

                await s3Client.send(new DeleteObjectCommand(deleteParams));
            } catch (s3Error) {
                logger.warn('Failed to delete image from S3', {
                    userId,
                    imageId,
                    storedFilename,
                    error: s3Error.message
                });
                // Continue with DB deletion even if S3 deletion fails
            }

            // Delete image from database (cascades to message_references)
            await client.query(
                'DELETE FROM user_images WHERE id = $1 AND user_id = $2',
                [imageId, userId]
            );

            await client.query('COMMIT');

            logger.debug('Image deleted successfully', {
                userId,
                imageId,
                storedFilename
            });

            return true;
        } catch (error) {
            await client.query('ROLLBACK');

            logger.error('Failed to delete image', {
                userId,
                imageId,
                error: error.message
            });

            return false;
        } finally {
            client.release();
        }
    }

    async handleTextToSpeech(ws, message, user) {
        logger.startOperation('text-to-speech', {
            userId: user.id,
            conversationId: message.conversationId
        });

        const client = await pool.connect();
        let aiResponse = '';
        let tokensUsed = 0;
        let conversationId = message.conversationId;
        let userMessageId = null;
        let aiMessageId = null;

        try {
            await client.query('BEGIN');

            // USAGE BASED ON SUBSCRIPTION: 
            const isActive = user.subscription?.status === ACTIVE;
            const planId = isActive ? user.subscription?.planId : FREE;
            const hasFeatureAccess = subscriptionFeatureAccess[planId];

            // Check if the user has voice assistance support
            if (!hasFeatureAccess.voiceAssistanceSupport) {
                throw new Error("You don't have access to voice assistance feature. Please upgrade to a paid plan to continue.");
            }


            // Verify existing conversation or create new one
            let conversation;
            if (conversationId) {
                conversation = await this.verifyConversation(user.id, conversationId);
                if (!conversation) {
                    throw new Error('Invalid conversation ID');
                }
            } else {
                conversation = await this.createNewConversation(client, user.id, message.content);
                conversationId = conversation.id;
            }

            // Save user message first and get its ID
            const userMessageResult = await client.query(
                'INSERT INTO messages (conversation_id, role, content, tokens_used, created_at, has_attachments) VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING id',
                [conversationId, 'user', message.content, 0, false]
            );
            userMessageId = userMessageResult.rows[0].id;

            // Now save a placeholder for the assistant message
            const aiMessageResult = await client.query(
                'INSERT INTO messages (conversation_id, role, content, tokens_used, created_at, has_attachments) VALUES ($1, $2, $3, $4, NOW() + interval \'1 millisecond\', $5) RETURNING id',
                [conversationId, 'assistant', '', 0, false]
            );
            aiMessageId = aiMessageResult.rows[0].id;

            await client.query('COMMIT');

            // Send initial message to confirm conversation creation
            ws.send(JSON.stringify({
                type: 'conversation_created',
                conversation_id: conversationId,
                title: conversation.title,
                message_id: userMessageId
            }));

            // Get recent messages for context
            const history = await this.getRecentMessages(user.id, conversationId);

            // Stream response from OpenAI
            const streamResponse = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL,
                messages: [
                    ...history.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    { role: 'user', content: message.content }
                ],
                temperature: parseFloat(process.env.OPENAI_MODEL_TEMPERATURE),
                max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS),
                stream: true
            });

            // Buffer to accumulate text chunks for TTS
            let textBuffer = '';
            // Minimum number of characters before generating speech
            const MIN_CHUNK_SIZE = 50;

            // Start audio session
            ws.send(JSON.stringify({
                type: 'tts_session_started',
                conversation_id: conversationId,
                message_id: aiMessageId
            }));

            for await (const chunk of streamResponse) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    aiResponse += content;
                    tokensUsed += 1;
                    textBuffer += content;

                    // Send text chunk to client
                    ws.send(JSON.stringify({
                        type: 'chat_stream',
                        conversation_id: conversationId,
                        message_id: aiMessageId,
                        chunk: content,
                        done: false
                    }));

                    // If we've accumulated enough text, generate speech
                    if (textBuffer.length >= MIN_CHUNK_SIZE && this.isCompleteSentence(textBuffer)) {
                        await this.generateAndStreamSpeech(ws, textBuffer, aiMessageId);
                        textBuffer = '';
                    }
                }
            }

            // Generate speech for any remaining text
            if (textBuffer.length > 0) {
                await this.generateAndStreamSpeech(ws, textBuffer, aiMessageId);
            }

            // Send completion messages
            ws.send(JSON.stringify({
                type: 'chat_stream',
                conversation_id: conversationId,
                message_id: aiMessageId,
                chunk: '',
                done: true
            }));

            ws.send(JSON.stringify({
                type: 'tts_session_ended',
                conversation_id: conversationId,
                message_id: aiMessageId
            }));

            // Update the assistant message with the final content
            await client.query(
                'UPDATE messages SET content = $1, tokens_used = $2 WHERE id = $3',
                [aiResponse, tokensUsed, aiMessageId]
            );

        } catch (error) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                logger.error('Rollback error:', {
                    error: rollbackError.message,
                    originalError: error.message
                });
            }

            logger.failOperation('text-to-speech', error, {
                userId: user.id,
                conversationId,
                userMessageId,
                aiMessageId
            });

            ws.send(JSON.stringify({
                type: 'error',
                error: error.message,
                conversationId,
                message_id: userMessageId
            }));
        } finally {
            client.release();
        }
    }

    // Helper to check if text ends with a complete sentence
    isCompleteSentence(text) {
        // Simple check for sentence-ending punctuation at the end
        const trimmedText = text.trim();
        return trimmedText.length > 0 &&
            (trimmedText.endsWith('.') ||
                trimmedText.endsWith('!') ||
                trimmedText.endsWith('?') ||
                trimmedText.endsWith(';') ||
                trimmedText.endsWith(':'));
    }

    // Generate speech from text and stream audio chunks directly to the client
    // without saving to database
    async generateAndStreamSpeech(ws, text, messageId) {
        try {
            // Generate TTS audio using OpenAI
            const mp3 = await openai.audio.speech.create({
                model: process.env.OPENAI_TTS_MODEL || "tts-1",
                voice: process.env.OPENAI_TTS_VOICE || "alloy",
                input: text,
                response_format: "mp3"
            });

            // Get the audio data as a buffer
            const buffer = Buffer.from(await mp3.arrayBuffer());

            // Create a unique ID for this audio chunk
            const audioChunkId = crypto.randomUUID();

            // Send the audio buffer directly to the client
            // First, encode the buffer as base64
            const base64Audio = buffer.toString('base64');

            // Send the audio chunk to the client
            ws.send(JSON.stringify({
                type: 'tts_audio_chunk',
                message_id: messageId,
                text: text,
                audio_data: base64Audio,
                chunk_id: audioChunkId
            }));

            logger.debug('Audio chunk generated and sent', {
                messageId: messageId,
                chunkId: audioChunkId,
                textLength: text.length
            });
        } catch (error) {
            logger.error('Error generating speech', {
                error: error.message,
                stack: error.stack,
                messageId: messageId,
                textLength: text.length
            });

            // Notify client of the error but don't fail the whole process
            ws.send(JSON.stringify({
                type: 'tts_chunk_error',
                message_id: messageId,
                text: text,
                error: "Failed to generate speech for this segment"
            }));
        }
    }

    async getUserUsage(user) {
        const client = await pool.connect()

        try {
            // Determine start date (from subscription or user creation)
            let startDateStr
            if (user.subscription?.status === ACTIVE && user.subscription?.startDate) {
                startDateStr = user.subscription.startDate
            } else {
                const userResult = await client.query("SELECT created_at FROM users WHERE id = $1", [user.id])
                startDateStr = userResult.rows[0]?.created_at
            }

            // Extract the day from the start date
            const startDate = new Date(startDateStr)

            // Get current date info
            const now = new Date()

            const billingDay = startDate.getUTCDate();

            // Determine the start of the current billing cycle
            let cycleStart = new Date(now.getFullYear(), now.getMonth(), billingDay);
            if (now.getDate() < billingDay) {
                // If today is before the billing day, shift to last month
                cycleStart.setMonth(cycleStart.getMonth() - 1);
            }

            // Determine the end of this billing cycle
            const cycleEnd = new Date(cycleStart);
            cycleEnd.setMonth(cycleEnd.getMonth() + 1);

            // Format dates for SQL
            const formattedStartDate = this.formatDateToYYYYMMDD(cycleStart)
            const formattedEndDate = this.formatDateToYYYYMMDD(cycleEnd)

            // Query usage metrics using calculated date range
            const result = await client.query(
                `
            SELECT 
              COUNT(*) FILTER (WHERE type = 'image_generation') AS image_generation_count,
              COUNT(*) FILTER (WHERE type = 'image_analysis') AS image_analysis_count,
              COUNT(*) FILTER (WHERE type = 'humanization') AS humanization_count
            FROM user_usage_metric
            WHERE user_id = $1
              AND created_at >= $2
              AND created_at < $3
            `,
                [user.id, formattedStartDate, formattedEndDate],
            )

            return result.rows[0]
        } finally {
            client.release()
        }
    }

    formatDateToYYYYMMDD(date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    }
}