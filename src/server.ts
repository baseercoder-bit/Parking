import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { setupSocket } from './socket/parkingSocket';
import authRoutes from './routes/auth';
import locationsRoutes from './routes/locations';
import zonesRoutes from './routes/zones';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Setup Socket.io
const io = setupSocket(httpServer);
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/zones', zonesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

