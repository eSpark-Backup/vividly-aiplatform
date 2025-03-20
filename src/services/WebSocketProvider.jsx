import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useChatStore } from '@/store/useChatStore';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { refreshToken, accessToken } = useAuthStore()
  const { socketURL, setSocketURL } = useChatStore()

  useEffect(() => {
    if (accessToken) {
      setSocketURL(`wss://vividly-stg-api.esparkconsultants.com/chat?token=${encodeURIComponent(refreshToken)}`)
    } else {
      setSocketURL(null);
    }
  }, [accessToken]);

  const websocket = useWebSocket(socketURL);

  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (context === null) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};