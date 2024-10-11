const express = require('express');
const userController = require('../controller/userController'); // Контроллер для пользователя

const router = express.Router();

// Маршрут для получения данных пользователя по ID
router.get('/api/user/:id', userController);

module.exports = router;
