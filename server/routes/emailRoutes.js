const express = require('express');
const router = express.Router();
const { getAllEmails, createEmail, getEmailPassword} = require('../controller/emailController');

// Роут для создания email
router.post('/api/emails', createEmail);
router.get('/api/emails', getAllEmails);
router.get('/api/emails/:id/password', getEmailPassword);

module.exports = router;
