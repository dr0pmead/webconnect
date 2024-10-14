require('dotenv').config();
const express = require('express');
const axios = require('axios');
const https = require('https');  // Импортируем https для создания агента
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');  
const userRoutes = require('./routes/userRoutes');
const emailRoutes = require('./routes/emailRoutes');

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Подключаем маршруты
app.use(authRoutes);
app.use(userRoutes);
app.use(emailRoutes);

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB подключен'))
  .catch(err => console.log(err));

  app.get('/', (req, res) => {
  res.send('Express Server is running');
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
