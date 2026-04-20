const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const noticeRoutes = require('./routes/notices');
const departmentRoutes = require('./routes/departments');
const clubRoutes = require('./routes/clubs');
const clubApplicationRoutes = require('./routes/clubApplications');
const activityLogRoutes = require('./routes/activityLogs');
const chatRoutes = require('./routes/chat');
const rateLimitRoutes = require('./routes/rateLimit');
const chatHandler = require('./socket/chatHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/club-applications', clubApplicationRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/rate-limit', rateLimitRoutes);

// Initialize Socket.IO chat handler
chatHandler(io);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready for real-time chat`);
});
