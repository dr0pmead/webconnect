const mongoose = require('mongoose');

// Определяем схему для Email
const emailSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('Email', emailSchema);