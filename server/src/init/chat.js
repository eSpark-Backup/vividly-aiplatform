import {WebSocketServer} from 'ws';
import OpenAI from 'openai';
import pool from './db_conn.js';
import {logger} from '../helpers/logger.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Add this configuration
const HUMANIZER_API_URL = process.env.HUMANIZER_API_URL;
const HUMANIZER_API_KEY = process.env.HUMANIZER_API_KEY;

export class ChatServer {
    constructor(server) {
        this.wss = new WebSocketServer({server});
        logger.info('ChatServer initialized');
        this.setupWebSocket();
    }

    static MAX_HUMANIZE_LENGTH = parseInt(process.env.HUMANIZER_MAX_WORDS || "2000");

    setupWebSocket() {
        this.wss.on('connection', async (ws, req) => {
            const clientIp = req.socket.remoteAddress;
            logger.debug('New connection attempt', {clientIp});

            try {
                const token = new URL(req.url, 'http://localhost').searchParams.get('token');
                const user = await this.verifyUserSubscription(token);

                if (!user) {
                    logger.warn('Unauthorized connection attempt', {clientIp, token});
                    ws.close(4001, 'Unauthorized or inactive subscription');
                    return;
                }

                ws.userId = user.id;
                logger.info('User connected', {userId: user.id, email: user.email});

                ws.on('message', async (data) => {
                    try {
                        const message = JSON.parse(data);
                        logger.debug('Received message', {
                            userId: user.id,
                            messageType: message.type,
                            conversationId: message.conversationId
                        });

                        await this.handleMessage(ws, message, user);
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

                ws.on('close', () => {
                    logger.info('User disconnected', {userId: user.id});
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

    async handleChatMessage(ws, message, user) {
        const client = await pool.connect();
        let aiResponse = '';
        let tokensUsed = 0;
        let conversationId = message.conversationId;
        let userMessageId = null; // To store the ID of the user message
        let aiMessageId = null;   // To store the ID of the assistant message
        const stream = message.stream !== false; // Default to true

        logger.startOperation('chat-message', {
            userId: user.id,
            conversationId,
            streamMode: stream
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
                'INSERT INTO messages (conversation_id, role, content, tokens_used) VALUES ($1, $2, $3, $4) RETURNING id',
                [conversationId, 'user', message.content, 0]
            );
            userMessageId = userMessageResult.rows[0].id;

            // Now save a placeholder for the assistant message and get its ID
            const aiMessageResult = await client.query(
                'INSERT INTO messages (conversation_id, role, content, tokens_used) VALUES ($1, $2, $3, $4) RETURNING id',
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
                        {role: 'user', content: message.content}
                    ],
                    temperature: parseFloat(process.env.OPENAI_MODEL_TEMPERATURE),
                    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS),
                    stream: true
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
                        {role: 'user', content: message.content}
                    ],
                    temperature: parseFloat(process.env.OPENAI_MODEL_TEMPERATURE),
                    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS),
                    stream: false
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
                message_id: userMessageId // Include message ID even in error responses
            }));
        } finally {
            client.release();
        }
    }

    async verifyUserSubscription(token) {
        logger.debug('Verifying user subscription', {token});
        try {
            const result = await pool.query(`
                SELECT u.id, u.email
                FROM users u
                         JOIN subscriptions s ON u.id = s.user_id
                WHERE s.status = 'active'
                  AND s.current_period_end > NOW()
                  AND u.id = (SELECT user_id
                              FROM refresh_tokens
                              WHERE token = $1
                                AND revoked_at IS NULL
                                AND expires_at > NOW())`, [token]);

            const user = result.rows[0];
            if (user) {
                logger.debug('Subscription verified', {userId: user.id, email: user.email});
            } else {
                logger.warn('Invalid or expired subscription', {token});
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

    // Chat history with pagination
    async getConversationHistory(userId, conversationId, limit = 20, offset = 0) {
        const result = await pool.query(`
                    SELECT m.*, c.title as conversation_title
                    FROM messages m
                             JOIN conversations c ON c.id = m.conversation_id
                    WHERE c.id = $1
                      AND c.user_id = $2
                    ORDER BY m.created_at
                    LIMIT $3 OFFSET $4`,
            [conversationId, userId, limit, offset]
        );
        return result.rows;
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
                    GROUP BY c.id
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

// Handle these methods in WebSocket messages
    async handleMessage(ws, message, user) {
        switch (message.type) {
            case 'chat':
                await this.handleChatMessage(ws, message, user);
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
                const deleted = await this.deleteConversation(
                    user.id,
                    message.conversationId
                );
                ws.send(JSON.stringify({
                    type: 'conversation_deleted',
                    conversationId: message.conversationId,
                    success: deleted
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

    async saveMessages(client, userId, conversationId, messages) {
        try {
            // Ensure conversation exists and belongs to user
            let conversation;
            if (!conversationId) {
                const result = await client.query(
                    'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING id',
                    [userId, 'New Chat']
                );
                conversation = result.rows[0];
            } else {
                const result = await client.query(
                    'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
                    [conversationId, userId]
                );
                if (!result.rows.length) {
                    throw new Error('Invalid conversation ID');
                }
                conversation = result.rows[0];
            }

            // Save messages
            for (const msg of messages) {
                await client.query(
                    'INSERT INTO messages (conversation_id, role, content, tokens_used) VALUES ($1, $2, $3, $4)',
                    [conversation.id, msg.role, msg.content, msg.tokens_used]
                );
            }

            return conversation.id;
        } catch (error) {
            logger.info('Save messages error:', error);
            throw error;
        }
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
            throw new Error(`Failed to humanize text ${HUMANIZER_API_URL} ${HUMANIZER_API_KEY}`);
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
            let reHumanizeId

            if (message.message_id) {
                hasMessageId = true
                if (reHumanize) {
                    const result = await pool.query(`
                        SELECT id, humanized_text
                        FROM humanized_messages
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
                } else {
                    // Fetch message content from database
                    const result = await pool.query(
                        `SELECT m.content, c.user_id
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
                }
            } else if (message.text) {
                textToHumanize = message.text;
            } else {
                throw new Error('Either message_id or text must be provided');
            }

            // if (textToHumanize.length > ChatServer.MAX_HUMANIZE_LENGTH) {
            //     throw new Error(`Text exceeds maximum length of ${ChatServer.MAX_HUMANIZE_LENGTH} characters`);
            // }

            // Rest of the handling remains the same...
            ws.send(JSON.stringify({
                type: 'humanize_status',
                status: 'processing',
                request_id: message.request_id
            }));

            const humanizedText = await this.humanizeText(textToHumanize);

            await pool.query(
                `INSERT INTO humanized_messages(message_id, user_id, humanized_text, re_humanized_id, original_text)
                 VALUES ($1, $2, $3, $4, $5)`,
                [hasMessageId ? message.message_id : null, user.id, humanizedText, reHumanize ? reHumanizeId : null, textToHumanize]
            )

            ws.send(JSON.stringify({
                type: 'humanize_complete',
                original_text: textToHumanize,
                humanized_text: humanizedText,
                request_id: message.request_id,
                message_id: message.message_id
            }));

        } catch (error) {
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
                SELECT id, humanized_text, created_at, case when re_humanized_id notnull then true else false end as re_humanized
                FROM humanized_messages
                WHERE user_id = $1
                ORDER BY created_at
                LIMIT $2 OFFSET $3
            `, [user.id, limit, offset])
        } else if (message_id && user.id) {
            result = await pool.query(`
                SELECT id, humanized_text, created_at, case when re_humanized_id notnull then true else false end as re_humanized
                FROM humanized_messages
                WHERE user_id = $1 AND message_id = $2
                ORDER BY created_at
                LIMIT $3 OFFSET $4
            `, [user.id,  message_id, limit, offset])
        }

        return result.rows.reverse()
    }
}