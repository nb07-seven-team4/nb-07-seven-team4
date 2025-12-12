import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import groupRoutes from './src/routes/groupRoutes.js';
import participantRoutes from './src/routes/participantRoutes.js';
import recordRoutes from './src/routes/recordRoutes.js';
import rankRoutes from './src/routes/rankRoutes.js';
import imageRoutes from './src/routes/imageRoutes.js';

// API Routes
app.use('/groups', groupRoutes);
app.use('/groups/:groupId/participants', participantRoutes);
app.use('/groups/:groupId/records', recordRoutes);
app.use('/groups/:groupId/rank', rankRoutes);
app.use('/images', imageRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    message: 'SEVEN API Server is running! 🏃',
    version: '1.0.0',
    status: 'healthy'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server Start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🏃 SEVEN API Server is running!     ║
  ║                                        ║
  ║   PORT: ${PORT}                        ║
  ║   ENV:  ${process.env.NODE_ENV || 'development'}              ║
  ║                                        ║
  ║   http://localhost:${PORT}             ║
  ╚════════════════════════════════════════╝
  `);
});

export default app;

