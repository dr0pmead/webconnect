const express = require('express');
const router = express.Router();
const { getAllEmails, createEmail} = require('../controller/emailController');

// Роут для создания email
router.post('/api/emails', createEmail);
router.get('/api/emails', getAllEmails);

module.exports = router;
