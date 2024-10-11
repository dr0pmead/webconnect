const express = require('express');
const loginController = require('../controller/authController');

const router = express.Router();

router.post('/api/login', loginController);

module.exports = router;
