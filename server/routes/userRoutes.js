const express = require('express');
const {getUserById, generate2FA, verify2FA} = require('../controller/userController');

const router = express.Router();

// Маршрут для получения данных пользователя по ID
router.get('/api/user/:id', getUserById);

// Маршрут для генерации 2FA (выдача QR-кода)
router.get('/api/users/:id/2fa', generate2FA);

// Маршрут для верификации 2FA
router.post('/api/users/:id/2fa/verify', verify2FA);

module.exports = router;
