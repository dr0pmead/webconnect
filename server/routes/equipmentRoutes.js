const express = require('express');
const {addEquipment, ping, getEquipments, getInfoEquipment} = require('../controller/equipmentController');

const router = express.Router();

// Маршрут для получения данных пользователя по ID
router.post('/api/createEquipment', addEquipment);
router.post('/api/ping', ping);
router.get('/api/equipments', getEquipments);
router.get('/api/equipment/:name', getInfoEquipment)
module.exports = router;