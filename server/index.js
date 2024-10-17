// Make sure we log the socket connection events and real-time updates
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const emailRoutes = require('./routes/emailRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const { checkLastUpdated, ping } = require('./controller/equipmentController');

const app = express();
const server = http.createServer(app);

app.use((req, res, next) => {
  req.app.set('socketio', io); // Attach socket.io instance to the app
  next();
});

// Create Socket.IO server and attach to HTTP server
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",  // Client origin
        methods: ["GET", "POST"]
    }
});

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add routes
app.use(authRoutes);
app.use(userRoutes);
app.use(emailRoutes);
app.use(equipmentRoutes);

// Socket.IO connection handler with logging
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
      console.log('Client disconnected');
  });
});

// Call the checkLastUpdated function every 3 seconds and log the updates
setInterval(() => checkLastUpdated(io), 1000);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
