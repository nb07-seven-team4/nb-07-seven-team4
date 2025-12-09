require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const groupRoutes = require('./routes/groupRoutes');
const participantRoutes = require('./routes/participantRoutes');
const recordRoutes = require('./routes/recordRoutes');
const rankRoutes = require('./routes/rankRoutes');
const imageRoutes = require('./routes/imageRoutes');

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

module.exports = app;
