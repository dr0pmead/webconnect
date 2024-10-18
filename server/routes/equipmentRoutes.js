const express = require('express');
const {addEquipment, ping, getEquipments, editEquipment} = require('../controller/equipmentController');

const router = express.Router();

// Маршрут для получения данных пользователя по ID
router.post('/api/createEquipment', addEquipment);
router.post('/api/ping', ping);
router.get('/api/equipments', getEquipments);
router.put('/api/equipment/edit', editEquipment);

module.exports = router;