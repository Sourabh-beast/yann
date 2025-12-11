/**
 * Socket.IO Server for Real-Time Chat
 * 
 * This module provides real-time messaging capabilities for the YANN platform.
 * It handles WebSocket connections, message broadcasting, typing indicators,
 * and online status tracking.
 * 
 * INTEGRATION GUIDE FOR WEB DEVELOPERS:
 * 
 * 1. Install socket.io on your Next.js backend:
 *    npm install socket.io
 * 
 * 2. Create a custom server (server.js in project root):
 *    ```javascript
 *    const { createServer } = require('http');
 *    const { parse } = require('url');
 *    const next = require('next');
 *    const socketConfig = require('./src/lib/socket-server');
 * 
 *    const dev = process.env.NODE_ENV !== 'production';
 *    const app = next({ dev });
 *    const handle = app.getRequestHandler();
 * 
 *    app.prepare().then(() => {
 *      const server = createServer((req, res) => {
 *        const parsedUrl = parse(req.url, true);
 *        handle(req, res, parsedUrl);
 *      });
 * 
 *      // Initialize Socket.IO
 *      socketConfig.initializeSocket(server);
 * 
 *      server.listen(3000, (err) => {
 *        if (err) throw err;
 *        console.log('> Ready on http://localhost:3000');
 *        console.log('> Socket.IO initialized');
 *      });
 *    });
 *    ```
 * 
 * 3. Update package.json scripts:
 *    "scripts": {
 *      "dev": "node server.js",
 *      "build": "next build",
 *      "start": "NODE_ENV=production node server.js"
 *    }
 * 
 * 4. Frontend integration (already done in mobile app):
 *    - Socket service connects automatically on user login
 *    - Disconnects on logout
 *    - Handles reconnection automatically
 */

const { Server } = require('socket.io');

// Store active connections: userId -> socket.id
const onlineUsers = new Map();

// Store socket.id -> userId mapping
const socketUsers = new Map();

/**
 * Initialize Socket.IO server
 * @param {http.Server} server - HTTP server instance
 */
function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    /**
     * User comes online
     * Client sends: { userId: string }
     */
    socket.on('user:online', (data) => {
      const { userId } = data;
      
      if (!userId) {
        console.log('❌ User online event without userId');
        return;
      }

      // Store user connection
      onlineUsers.set(userId, socket.id);
      socketUsers.set(socket.id, userId);

      console.log(`👤 User online: ${userId}`);

      // Broadcast to all clients that this user is online
      socket.broadcast.emit('user:status', {
        userId,
        status: 'online'
      });
    });

    /**
     * Join a conversation room
     * Client sends: { conversationId: string, userId: string }
     */
    socket.on('conversation:join', (data) => {
      const { conversationId, userId } = data;
      
      if (!conversationId) {
        console.log('❌ Join conversation without conversationId');
        return;
      }

      socket.join(conversationId);
      console.log(`💬 User ${userId} joined conversation: ${conversationId}`);
    });

    /**
     * Leave a conversation room
     * Client sends: { conversationId: string }
     */
    socket.on('conversation:leave', (data) => {
      const { conversationId } = data;
      
      if (conversationId) {
        socket.leave(conversationId);
        console.log(`👋 Socket ${socket.id} left conversation: ${conversationId}`);
      }
    });

    /**
     * Send a message
     * Client sends: {
     *   conversationId: string,
     *   message: object,
     *   recipientId: string
     * }
     */
    socket.on('message:send', (data) => {
      const { conversationId, message, recipientId } = data;

      if (!conversationId || !message) {
        console.log('❌ Invalid message data');
        return;
      }

      console.log(`📨 Message sent to conversation ${conversationId}`);

      // Broadcast to all users in the conversation except sender
      socket.to(conversationId).emit('message:new', {
        conversationId,
        message
      });

      // If recipient is online, send them a direct notification
      if (recipientId && onlineUsers.has(recipientId)) {
        const recipientSocketId = onlineUsers.get(recipientId);
        io.to(recipientSocketId).emit('message:notification', {
          conversationId,
          message
        });
      }
    });

    /**
     * User is typing
     * Client sends: {
     *   conversationId: string,
     *   userId: string,
     *   userName: string,
     *   isTyping: boolean
     * }
     */
    socket.on('user:typing', (data) => {
      const { conversationId, userId, userName, isTyping } = data;

      if (!conversationId) return;

      // Broadcast to others in the conversation
      socket.to(conversationId).emit('user:typing', {
        conversationId,
        userId,
        userName,
        isTyping
      });
    });

    /**
     * Mark messages as read
     * Client sends: {
     *   conversationId: string,
     *   messageIds: string[],
     *   userId: string
     * }
     */
    socket.on('message:read', (data) => {
      const { conversationId, messageIds, userId } = data;

      if (!conversationId) return;

      // Notify others in the conversation
      socket.to(conversationId).emit('message:read', {
        conversationId,
        messageIds,
        readBy: userId
      });
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
      const userId = socketUsers.get(socket.id);
      
      if (userId) {
        onlineUsers.delete(userId);
        socketUsers.delete(socket.id);

        // Broadcast to all clients that this user is offline
        socket.broadcast.emit('user:status', {
          userId,
          status: 'offline'
        });

        console.log(`👋 User offline: ${userId}`);
      }

      console.log(`❌ Socket disconnected: ${socket.id}`);
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Store io instance for use in API routes if needed
  global.io = io;

  return io;
}

/**
 * Get Socket.IO instance
 * @returns {Server} Socket.IO server instance
 */
function getIO() {
  if (!global.io) {
    throw new Error('Socket.IO not initialized');
  }
  return global.io;
}

/**
 * Check if user is online
 * @param {string} userId
 * @returns {boolean}
 */
function isUserOnline(userId) {
  return onlineUsers.has(userId);
}

/**
 * Get all online users
 * @returns {string[]} Array of online user IDs
 */
function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}

module.exports = {
  initializeSocket,
  getIO,
  isUserOnline,
  getOnlineUsers
};
