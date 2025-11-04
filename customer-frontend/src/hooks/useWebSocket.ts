import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

// Auto-detect WebSocket URL based on current hostname
const getWsUrl = () => {
  // If VITE_WS_URL is explicitly set and not localhost, use it
  if (import.meta.env.VITE_WS_URL && !import.meta.env.VITE_WS_URL.includes('localhost')) {
    return import.meta.env.VITE_WS_URL;
  }

  // Otherwise, use the current hostname with backend port
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}:8888`;
};

const WS_URL = getWsUrl();

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;

    // Connect to WebSocket
    const socket = io(WS_URL, {
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const on = (event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string, callback: (data: any) => void) => {
    socketRef.current?.off(event, callback);
  };

  return {
    socket: socketRef.current,
    isConnected,
    on,
    off,
  };
}
