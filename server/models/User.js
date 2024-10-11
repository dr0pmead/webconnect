const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  login: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  lastauth: { type: Date, default: Date.now },
  admin: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
