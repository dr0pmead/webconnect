const express = require('express');
const {addEquipment, ping, getEquipments} = require('../controller/equipmentController');

const router = express.Router();

// Маршрут для получения данных пользователя по ID
router.post('/api/createEquipment', addEquipment);
router.post('/api/ping', ping);
router.get('/equipments', getEquipments);

module.exports = router;