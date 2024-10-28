const express = require('express');
<<<<<<< HEAD
const {addEquipment, ping, getEquipments, getInfoEquipment} = require('../controller/equipmentController');
=======
const {addEquipment, ping, getEquipments, editEquipment} = require('../controller/equipmentController');
>>>>>>> be08453fd1f45be9b94de471ac1af0d294465196

const router = express.Router();

// Маршрут для получения данных пользователя по ID
router.post('/api/createEquipment', addEquipment);
router.post('/api/ping', ping);
router.get('/api/equipments', getEquipments);
<<<<<<< HEAD
router.get('/api/equipment/:name', getInfoEquipment)
=======
router.put('/api/equipment/edit', editEquipment);

>>>>>>> be08453fd1f45be9b94de471ac1af0d294465196
module.exports = router;