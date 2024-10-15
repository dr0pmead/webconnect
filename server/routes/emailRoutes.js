const express = require('express');
const router = express.Router();
const { getAllEmails, createEmail, getEmailPassword, deleteEmail, checkUsername, deleteEmails} = require('../controller/emailController');

// Роут для создания email
router.post('/api/emails', createEmail);
router.get('/api/emails', getAllEmails);
router.get('/api/emails/:id/password', getEmailPassword);
router.delete('/api/emails/:id', deleteEmail);
router.post('/api/check-username', checkUsername);
router.post('/api/delete-emails', deleteEmails);
module.exports = router;
