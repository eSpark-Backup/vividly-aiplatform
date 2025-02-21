import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useWebSocket } from '@/hooks/useWebSocket';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { refreshToken, accessToken } = useAuthStore()
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (accessToken) {
      setUrl(`wss://vividly-stg-api.esparkconsultants.com/chat?token=${encodeURIComponent(refreshToken)}`)
    } else {
      setUrl(null);
    }
  }, [accessToken]);

  const websocket = useWebSocket(url);

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