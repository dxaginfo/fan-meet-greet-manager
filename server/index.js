require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const winston = require('winston');
const { PrismaClient } = require('@prisma/client');
const compression = require('compression');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const fanRoutes = require('./routes/fans');
const registrationRoutes = require('./routes/registrations');
const mediaRoutes = require('./routes/media');
const documentRoutes = require('./routes/documents');
const timeSlotRoutes = require('./routes/timeslots');
const settingRoutes = require('./routes/settings');
const notificationRoutes = require('./routes/notifications');

// Initialize Prisma client
const prisma = new PrismaClient();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'fan-meet-greet-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fans', fanRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/timeslots', timeSlotRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Socket.io event handlers
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  
  socket.on('join-event', (eventId) => {
    socket.join(`event-${eventId}`);
    logger.info(`Socket ${socket.id} joined event ${eventId}`);
  });
  
  socket.on('checkin-update', (data) => {
    io.to(`event-${data.eventId}`).emit('checkin-update', data);
  });
  
  socket.on('registration-update', (data) => {
    io.to(`event-${data.eventId}`).emit('registration-update', data);
  });
  
  socket.on('timeslot-update', (data) => {
    io.to(`event-${data.eventId}`).emit('timeslot-update', data);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Connect to the database
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(async () => {
    await prisma.$disconnect();
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, httpServer, io, prisma };