const Equipment = require('../models/Equipment');  // Модель пользователя

const addEquipment = async (req, res) => {
    try {
        const computerInfo = req.body;
        const disks = [];
        const components = [];

        computerInfo.components.forEach(component => {
            if (component.Type === 'Disk') {
                disks.push({
                    Name: component.Name,
                    Size: component.Size,
                    FreeSpace: component.FreeSpace
                });
            } else {
                components.push(component);
            }
        });

        const equipmentData = {
            ...computerInfo,
            components,
            disks,
            ipAddress: {
                main: computerInfo.ipAddress.main,
                secondary: computerInfo.ipAddress.secondary
            }
        };

        const filter = { name: computerInfo.name };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const updatedEquipment = await Equipment.findOneAndUpdate(filter, equipmentData, options);

        res.status(200).json({
            message: 'Data received and stored successfully',
            data: updatedEquipment
        });
    } catch (error) {
        console.error('Error handling /api/createEquipment request:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

async function ping(req, res) {
    try {
        const { name } = req.body;

        // Find and update the equipment
        const equipment = await Equipment.findOneAndUpdate(
            { name },
            { online: true, lastUpdated: Date.now() },
            { new: true }
        );

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        // Emit the updated equipment to all clients
        const io = req.app.get('socketio');
        io.emit('equipmentUpdated', equipment);

        res.status(200).json({ message: 'Ping received and equipment updated', equipment });
    } catch (error) {
        console.error('Error handling /api/ping request:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// Function to check and update offline status of equipment based on lastUpdated
async function checkLastUpdated(io) {
    try {
        const secondsThreshold = 3;  // Порог в секундах для проверки статуса
        const timeLimit = new Date(Date.now() - secondsThreshold * 1000);  // Время до которого записи считаются устаревшими

        // Обновляем статус всех записей, которые устарели
        const result = await Equipment.updateMany(
            { lastUpdated: { $lt: timeLimit }, online: true },  // Ищем только активные устройства, которые устарели
            { online: false }  // Устанавливаем статус как offline
        );

        // Найти все записи, которые сейчас offline
        const updatedEquipment = await Equipment.find({ online: false });
        
        if (updatedEquipment.length > 0) {
            io.emit('equipmentUpdated', updatedEquipment);  // Отправляем изменения через сокет
        }

    } catch (error) {
        console.error('Error checking lastUpdated:', error);
    }
}

const getEquipments = async (req, res) => {
    try {
        const equipments = await Equipment.find();
        res.status(200).json(equipments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipments' });
    }
};

module.exports = {
    addEquipment,
    ping,
    checkLastUpdated,
    getEquipments
};
