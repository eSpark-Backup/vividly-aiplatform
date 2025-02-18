import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';


export function useSocketIO(url) {
    const socket = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);

    const connect = useCallback(() => {
        socket.current = io(url, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.current.on('connect', () => {
            console.log('Connected to chat server');
            setIsConnected(true);
            setError(null);
        });

        socket.current.on('disconnect', () => {
            console.log('Disconnected from chat server');
            setIsConnected(false);
        });

        socket.current.on('chat_stream', (data) => {
            setMessages(prev => [...prev, data]);
        });

        socket.current.on('history', (data) => {
            setMessages(data);
        });

        socket.current.on('error', (data) => {
            setError(data);
        });

    }, [url]);

    const sendMessage = useCallback((content) => {
        if (socket.current?.connected) {
            socket.current.emit('message', { content });
        } else {
            setError('Not connected to server');
        }
    }, []);

    useEffect(() => {
        connect();
        return () => {
            socket.current?.disconnect();
        };
    }, [connect]);

    return {
        isConnected,
        messages,
        error,
        sendMessage
    };
}
