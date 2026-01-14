import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export const setupSocket = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Join location room for filtered updates
    socket.on('join-location', (locationId: string) => {
      socket.join(`location:${locationId}`);
      console.log(`Client ${socket.id} joined location: ${locationId}`);
    });

    // Leave location room
    socket.on('leave-location', (locationId: string) => {
      socket.leave(`location:${locationId}`);
      console.log(`Client ${socket.id} left location: ${locationId}`);
    });
  });

  return io;
};

// Helper function to broadcast to location room
export const broadcastToLocation = (
  io: SocketIOServer,
  locationId: string,
  data: any
) => {
  io.to(`location:${locationId}`).emit('parking-update', data);
};

