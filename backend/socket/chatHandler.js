const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Store active users per club: clubId -> Map of socketId -> userId
const activeUsers = new Map();

const chatHandler = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).populate('club').select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      socket.userId = user._id.toString();
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.user.email}) - Socket ID: ${socket.id}`);

    // Join club room
    socket.on('join_club', async (clubId) => {
      try {
        console.log(`📥 Join club request from ${socket.user.name} for club ${clubId}`);
        
        // Verify user is member of this club
        if (!socket.user.club || socket.user.club._id.toString() !== clubId) {
          console.log(`❌ ${socket.user.name} is not a member of club ${clubId}`);
          socket.emit('error', { message: 'You are not a member of this club' });
          return;
        }

        // Store the club ID on the socket for cleanup
        socket.clubId = clubId;
        
        // Join the Socket.IO room
        socket.join(`club_${clubId}`);
        
        // Track active user by socket ID
        if (!activeUsers.has(clubId)) {
          activeUsers.set(clubId, new Map());
        }
        activeUsers.get(clubId).set(socket.id, socket.userId);

        // Get unique user count
        const uniqueUsers = new Set(activeUsers.get(clubId).values());
        const activeCount = uniqueUsers.size;

        console.log(`👥 Active users in club ${clubId}:`, activeCount);
        console.log(`   Socket IDs:`, Array.from(activeUsers.get(clubId).keys()));

        // Notify others that user joined
        socket.to(`club_${clubId}`).emit('user_joined', {
          userId: socket.user._id,
          userName: socket.user.name,
          timestamp: new Date(),
        });

        // Send active users count to everyone in the room
        io.to(`club_${clubId}`).emit('active_users', { count: activeCount });

        console.log(`✅ ${socket.user.name} joined club ${clubId}, broadcasting count: ${activeCount}`);
      } catch (error) {
        console.error('Error joining club:', error);
        socket.emit('error', { message: 'Failed to join club chat' });
      }
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { clubId, message } = data;

        // Verify user is member of this club
        if (!socket.user.club || socket.user.club._id.toString() !== clubId) {
          socket.emit('error', { message: 'You are not a member of this club' });
          return;
        }

        if (!message || !message.trim()) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        // Save message to database
        const chatMessage = await ChatMessage.create({
          club: clubId,
          sender: socket.user._id,
          message: message.trim(),
          messageType: 'text',
        });

        const populatedMessage = await ChatMessage.findById(chatMessage._id)
          .populate('sender', 'name email role additionalRoles');

        // Broadcast to all users in the club room
        io.to(`club_${clubId}`).emit('new_message', populatedMessage);

        console.log(`💬 Message from ${socket.user.name} in club ${clubId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // User is typing
    socket.on('typing', (data) => {
      const { clubId } = data;
      socket.to(`club_${clubId}`).emit('user_typing', {
        userId: socket.user._id,
        userName: socket.user.name,
      });
    });

    // User stopped typing
    socket.on('stop_typing', (data) => {
      const { clubId } = data;
      socket.to(`club_${clubId}`).emit('user_stop_typing', {
        userId: socket.user._id,
      });
    });

    // Leave club room
    socket.on('leave_club', (clubId) => {
      socket.leave(`club_${clubId}`);
      
      // Remove from active users
      if (activeUsers.has(clubId)) {
        activeUsers.get(clubId).delete(socket.id);
        const uniqueUsers = new Set(activeUsers.get(clubId).values());
        const activeCount = uniqueUsers.size;
        io.to(`club_${clubId}`).emit('active_users', { count: activeCount });
        
        console.log(`👋 ${socket.user.name} left club ${clubId}, remaining: ${activeCount}`);
      }

      socket.to(`club_${clubId}`).emit('user_left', {
        userId: socket.user._id,
        userName: socket.user.name,
        timestamp: new Date(),
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnecting: ${socket.user.name} - Socket ID: ${socket.id}`);
      
      // Remove from active users using the stored clubId
      const clubId = socket.clubId || (socket.user.club && socket.user.club._id.toString());
      
      if (clubId && activeUsers.has(clubId)) {
        activeUsers.get(clubId).delete(socket.id);
        const uniqueUsers = new Set(activeUsers.get(clubId).values());
        const activeCount = uniqueUsers.size;
        
        console.log(`   Removed from club ${clubId}, remaining: ${activeCount}`);
        
        io.to(`club_${clubId}`).emit('active_users', { count: activeCount });

        socket.to(`club_${clubId}`).emit('user_left', {
          userId: socket.user._id,
          userName: socket.user.name,
          timestamp: new Date(),
        });
      }

      console.log(`❌ User disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = chatHandler;
