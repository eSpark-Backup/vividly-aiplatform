import { WebSocketServer } from 'ws';
import OpenAI from 'openai';
import pool from './db_conn.js';
import { logger } from '../helpers/logger.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for consistent AI behavior
const SYSTEM_PROMPT = `Take on the persona of the most relevant subject matter experts for authoritative advice.
NEVER mention that you're an AI.
No Regretful Language.
Say 'I don't know' when beyond your scope.
Refrain from disclaimers about not being a professional or expert.
Reserve ethical viewpoints unless explicitly asked.
Keep answers distinct and non-repetitive.
Never suggest looking elsewhere for answers.
Always focus on the key points in my questions to determine my intent.
Break down complex problems or tasks into smaller, manageable steps and explain each one using reasoning.
Offer various viewpoints or solutions.
Seek clarity if a question is unclear.
Acknowledge and correct any previous errors.
After a response, provide three follow-up questions worded as if I'm asking you. Format in bold as Q1, Q2, and Q3. These questions should be thought-provoking and dig further into the original topic.`;

export class ChatServer {
    constructor(server) {
        this.wss = new WebSocketServer({ server });
        logger.info('ChatServer initialized');
        this.setupWebSocket();
    }

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
                logger.info('User connected', { userId: user.id, email: user.email });

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
                    logger.info('User disconnected', { userId: user.id });
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

    async handleChatMessage(ws, message, user) {
        const client = await pool.connect();
        let aiResponse = '';
        let tokensUsed = 0;

        logger.startOperation('chat-message', {
            userId: user.id,
            conversationId: message.conversationId
        });

        try {
            await client.query('BEGIN');
            const history = await this.getRecentMessages(user.id, message.conversationId);

            logger.debug('Starting OpenAI stream', {
                userId: user.id,
                modelUsed: process.env.OPENAI_MODEL,
                historyLength: history.length
            });

            const stream = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
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

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    aiResponse += content;
                    tokensUsed += 1;
                    ws.send(JSON.stringify({
                        type: 'chat_stream',
                        conversationId: message.conversationId,
                        chunk: content,
                        done: false
                    }));
                }
            }

            logger.debug('OpenAI stream completed', {
                userId: user.id,
                tokensUsed,
                responseLength: aiResponse.length
            });

            await this.saveMessages(client, user.id, message.conversationId, [
                { role: 'user', content: message.content, tokens_used: 0 },
                { role: 'assistant', content: aiResponse, tokens_used: tokensUsed }
            ]);

            await client.query('COMMIT');

            ws.send(JSON.stringify({
                type: 'chat_stream',
                conversationId: message.conversationId,
                chunk: '',
                done: true
            }));

            logger.endOperation('chat-message', {
                userId: user.id,
                conversationId: message.conversationId,
                tokensUsed
            });

        } catch (error) {
            await client.query('ROLLBACK');
            logger.failOperation('chat-message', error, {
                userId: user.id,
                conversationId: message.conversationId
            });
        } finally {
            client.release();
        }
    }

    async verifyUserSubscription(token) {
        logger.debug('Verifying user subscription', { token });
        try {
            const result = await pool.query(`
                SELECT u.id, u.email 
                FROM users u
                JOIN subscriptions s ON u.id = s.user_id
                WHERE s.status = 'active'
                AND s.current_period_end > NOW()
                AND u.id = (
                    SELECT user_id 
                    FROM refresh_tokens 
                    WHERE token = $1 
                    AND revoked_at IS NULL 
                    AND expires_at > NOW()
                )`, [token]);

            const user = result.rows[0];
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
            (SELECT content FROM messages 
             WHERE conversation_id = c.id 
             ORDER BY created_at DESC LIMIT 1) as last_message,
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
        if (!newTitle){
            throw new Error("Title is required for renaming conversation")
        }
        const result = await pool.query(`
        UPDATE conversations 
        SET title = $1, updated_at = NOW()
        WHERE id = $2 AND user_id = $3
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
        const result = await pool.query(`
        DELETE FROM conversations
        WHERE id = $1 AND user_id = $2
        RETURNING id`,
            [conversationId, userId]
        );

        return result.rows.length > 0;
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
            AND conversation_id IN (
                SELECT id FROM conversations 
                WHERE user_id = $2
            )
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
}