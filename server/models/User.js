const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  login: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  firstname: { type: String, required: true },
  lastauth: { type: Date, default: Date.now },
  admin: { type: Boolean, default: false },
  twofaEnable: { type: Boolean, default: false }, // Поле для 2FA
  twofaSecret: { type: String }, // Хранит секрет для 2FA, если она активирована
});

module.exports = mongoose.model('User', userSchema);
