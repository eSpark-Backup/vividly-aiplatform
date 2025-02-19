import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket(url) {
    const socket = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [partialMessage, setPartialMessage] = useState(null); // For streaming messages
    const [error, setError] = useState(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 3;

    // Generate unique IDs for messages
    const generateId = useCallback(() => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);

    // Handle WebSocket connection
    const connect = useCallback(() => {
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

                // Request message history on connection
                socket.current.send(JSON.stringify({ type: "get_history" }));
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
                            // Set message history from the server
                            setMessages(data.messages || []);
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
    }, [url, generateId]);

    // Send a message through the WebSocket
    const sendMessage = useCallback((content) => {
        if (!socket.current) {
            setError("No connection established");
            return;
        }

        if (socket.current.readyState === WebSocket.OPEN) {
            try {
                const message = {
                    type: "chat",
                    content,
                    id: generateId(),
                    timestamp: new Date().toISOString(),
                };
                socket.current.send(JSON.stringify(message));
            } catch (err) {
                console.error("Error sending message:", err);
                setError("Failed to send message");
            }
        } else {
            setError("Not connected to server");
        }
    }, [generateId]);

    // Cleanup on unmount
    useEffect(() => {
        connect();

        return () => {
            if (socket.current) {
                socket.current.close();
            }
        };
    }, [connect]);

    return {
        isConnected,
        partialMessage,
        messages,
        partialMessage, 
        error,
        sendMessage,
    };
}