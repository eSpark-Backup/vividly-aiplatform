import { useChatStore } from "@/store/useChatStore";
import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "./use-toast";
import { set } from "react-hook-form";

export function useWebSocket(url) {
    const socket = useRef(null);
    const { setConversations } = useChatStore();
    const { toast } = useToast();
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 3;

    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [partialMessage, setPartialMessage] = useState(null); // For streaming messages
    const [error, setError] = useState(null);
    const [isConversationLoading, setIsConversationLoading] = useState(false);
    const [isPartialMessageLoading, setIsPartialMessageLoading] = useState(false);

    // Show a toast notification
    const showToast = (title, description, type) => {
        toast({ title, description, type });
    };

    // Generate unique IDs for messages
    const generateId = useCallback(() => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);

    // Handle WebSocket connection
    const connect = useCallback(() => {
        if (!url) {
            setIsConnected(false);
            setError(null);
            return;
        }

        try {
            // Validate URL format
            const wsUrl = new URL(url);
            if (!wsUrl.protocol.match(/^wss?:$/)) {
                throw new Error("Invalid WebSocket protocol. Use ws:// or wss://");
            }

            // Skip if already connected
            if (socket.current?.readyState === WebSocket.OPEN) {
                console.log("WebSocket is already connected");
                return;
            }

            // Create new WebSocket connection
            socket.current = new WebSocket(url);

            // Connection opened
            socket.current.onopen = () => {
                console.log("Connected to chat server");
                setIsConnected(true);
                setError(null);
                reconnectAttempts.current = 0;
                 
                //loading conversations
                setIsConversationLoading(true);


                // Request message history on connection
                socket.current?.send(JSON.stringify({ type: "get_history" }));
                socket.current?.send(JSON.stringify({ type: "get_conversations" }));
            };

            // Connection closed
            socket.current.onclose = (event) => {
                console.log("Disconnected from chat server", event);
                setIsConnected(false);

                // Attempt reconnection if the closure was unexpected
                if (!event.wasClean && reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current++;
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
                    console.log(`Attempting to reconnect in ${delay}ms...`);
                    setTimeout(connect, delay);
                }
            };

            // Handle incoming messages
            socket.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    switch (data.type) {
                        case 'chat_stream':
                            // Handle streaming messages
                            setPartialMessage((prev) => {
                                const newContent = (prev?.content || '') + data.chunk;

                                // If the stream is done, add the complete message to the messages array
                                if (data.done) {
                                    setMessages((prevMsgs) => [
                                        ...prevMsgs,
                                        {
                                            id: data.id || generateId(),
                                            role: "assistant",
                                            content: newContent,
                                            timestamp: new Date().toISOString(),
                                        },
                                    ]);

                                    setIsPartialMessageLoading(false);

                                    // Optionally, request conversations after sending a message
                                    sendSocketCommand(socket, { type: "get_conversations" });

                                    return null; // Reset partial message
                                }

                                // Otherwise, update the partial message
                                return {
                                    id: data.id || generateId(),
                                    role: "assistant",
                                    content: newContent,
                                    timestamp: new Date().toISOString(),
                                };
                            });
                            break;

                        case 'history':
                            // Handle server-sent message history
                            setMessages(data.messages || []);
                            break;

                        case 'conversations':
                            // Handle server-sent conversations
                            setIsConversationLoading(false);
                            setConversations(data.conversations || []);
                            break;

                        case 'conversation_deleted':
                            // Handle server-sent conversation deletion
                            if (data.success) {
                                showToast("Success", "Conversation deleted successfully", "success");
                                sendSocketCommand(socket, { type: "get_conversations" });
                            } else {
                                showToast("Error", "Failed to delete conversation", "error");
                            }

                            break;

                        case 'conversation_renamed':
                            // showToast("Success", "Conversation renamed successfully", "success");
                            sendSocketCommand(socket, { type: "get_conversations" });
                            break;


                        case 'error':
                            // Handle server-sent errors
                            setError(data.message || "An error occurred on the server");
                            break;

                        default:
                            console.warn("Unknown message type:", data.type);
                            break;
                    }
                } catch (err) {
                    console.error("Error parsing message:", err);
                    setError("Failed to parse message from server");
                }
            };

            // Handle WebSocket errors
            socket.current.onerror = (event) => {
                // console.error("WebSocket error:", event);
                // setError("Connection error. Please check your internet connection and try again.");
            };
        } catch (err) {
            console.error("Failed to establish WebSocket connection:", err);
            setError(err instanceof Error ? err.message : "Failed to connect to chat server");
        }
    }, [url, generateId, setConversations]);


    // Utility function to send messages through the WebSocket
    const sendSocketCommand = (socket, message) => {
        if (!socket.current) {
            toast({ title: "Error", description: "Not connected to server", type: "error" });
            return;
        }

        if (socket.current.readyState === WebSocket.OPEN) {
            try {
                socket.current.send(JSON.stringify(message));
            } catch (err) {
                console.error("Error sending message:", err);
                toast({ title: "Error", description: "Failed to send message", type: "error" });
            }
        } else {
            toast({ title: "Error", description: "Not connected to server", type: "error" });
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        if (url) {
            connect();
        } else if (socket.current) {
            socket.current.close();
        }

        return () => {
            if (socket.current) {
                socket.current.close();
            }
        };
    }, [connect, url]);



    // Send a message
    const sendMessage = useCallback((content) => {
        const message = {
            type: "chat",
            content,
        };

        setIsPartialMessageLoading(true);
        sendSocketCommand(socket, message);

    }, []);

    const renameConversation = useCallback((content) => {

        const { conversationId, title } = content;

        const message = {
            type: "rename_conversation",
            conversationId,
            title,
        };
        sendSocketCommand(socket, message);

    }, []);

    // Delete a conversation
    const deleteConversation = useCallback((content) => {

        const { conversationId } = content;

        const message = {
            type: "delete_conversation",
            conversationId,
        };

        sendSocketCommand(socket, message);
    }, []);


    return {
        isConnected,
        partialMessage,
        messages,
        error,
        sendMessage,
        deleteConversation,
        renameConversation,
        isConversationLoading,
        isPartialMessageLoading,
        socket,
    };
}