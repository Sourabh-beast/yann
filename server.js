/**
 * YANN Custom Server with Socket.IO
 * 
 * This custom Next.js server enables real-time chat functionality
 * through Socket.IO integration.
 * 
 * To use this server:
 * 1. Install dependencies: npm install socket.io
 * 2. Update package.json scripts to use this file
 * 3. Run: npm run dev
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const socketConfig = require('./src/lib/socket-server');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('❌ Error occurred handling request:', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Initialize Socket.IO for real-time chat
  console.log('🔌 Initializing Socket.IO...');
  socketConfig.initializeSocket(server);

  // Start server
  server.listen(port, (err) => {
    if (err) {
      console.error('❌ Failed to start server:', err);
      throw err;
    }
    
    console.log('');
    console.log('✅ YANN Server Ready!');
    console.log(`📡 Server: http://${hostname}:${port}`);
    console.log(`💬 Chat: Socket.IO enabled`);
    console.log(`🌍 Environment: ${dev ? 'Development' : 'Production'}`);
    console.log('');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('⚠️  SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });
}).catch((err) => {
  console.error('❌ Failed to prepare Next.js app:', err);
  process.exit(1);
});
