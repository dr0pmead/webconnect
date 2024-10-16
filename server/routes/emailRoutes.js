const express = require('express');
const router = express.Router();
const { getAllEmails, createEmail, getEmailPassword, deleteEmail, checkUsername, deleteEmails, updateEmail} = require('../controller/emailController');

// Роут для создания email
router.post('/api/emails', createEmail);
router.get('/api/emails', getAllEmails);
router.get('/api/emails/:id/password', getEmailPassword);
router.delete('/api/emails/:id', deleteEmail);
router.post('/api/check-username', checkUsername);
router.post('/api/delete-emails', deleteEmails);
router.put('/api/update-email', updateEmail);
module.exports = router;
