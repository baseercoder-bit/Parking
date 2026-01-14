import { io, Socket } from 'socket.io-client';
import type { Zone } from './api';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinLocation = (locationId: string) => {
  const currentSocket = socket || connectSocket();
  if (currentSocket.connected) {
    currentSocket.emit('join-location', locationId);
  } else {
    currentSocket.on('connect', () => {
      currentSocket.emit('join-location', locationId);
    });
  }
};

export const leaveLocation = (locationId: string) => {
  if (socket) {
    socket.emit('leave-location', locationId);
  }
};

export const onParkingUpdate = (callback: (data: { zone: Zone; type: string }) => void) => {
  const currentSocket = socket || connectSocket();
  currentSocket.on('parking-update', callback);
};

export const offParkingUpdate = (callback?: (data: { zone: Zone; type: string }) => void) => {
  if (socket) {
    socket.off('parking-update', callback);
  }
};

export const getSocket = (): Socket | null => socket;

