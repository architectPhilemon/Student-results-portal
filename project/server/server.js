const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const assignmentRoutes = require('./routes/assignments');
const gradeRoutes = require('./routes/grades');
const announcementRoutes = require('./routes/announcements');
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://student-results-portal-2.onrender.com",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://student-results-portal-2.onrender.com",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    mongodb: {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/users', userRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  // Join user to their specific room (for targeted notifications)
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });
  
  // Join course room
  socket.on('join_course', (courseId) => {
    socket.join(`course_${courseId}`);
    console.log(`📚 User joined course room: ${courseId}`);
  });
  
  // Handle real-time messaging
  socket.on('send_message', (data) => {
    // Broadcast to course room
    socket.to(`course_${data.courseId}`).emit('new_message', data);
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`course_${data.courseId}`).emit('user_typing', {
      userId: data.userId,
      userName: data.userName
    });
  });
  
  socket.on('stop_typing', (data) => {
    socket.to(`course_${data.courseId}`).emit('user_stop_typing', {
      userId: data.userId
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    mongoose.connection.close();
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    mongoose.connection.close();
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
🚀 EduPortal Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Database: MongoDB Atlas
🔗 Frontend URL: ${process.env.FRONTEND_URL || 'https://student-results-portal-2.onrender.com'}
⏰ Started at: ${new Date().toISOString()}
🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Missing'}
  `);
});

module.exports = { app, server, io };
