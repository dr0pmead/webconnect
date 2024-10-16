const Equipment = require('../models/Equipment');  // Модель пользователя
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const addEquipment = async (req, res) => {
    try {
        const computerInfo = req.body;

        // Выводим данные в консоль для проверки
        console.log('Received computer info:', JSON.stringify(computerInfo, null, 2));

        // Разделение компонентов на диски и остальные компоненты
        const disks = [];
        const components = [];

        computerInfo.components.forEach(component => {
            if (component.Type === 'Disk') {
                // Если это диск, добавляем его в массив дисков
                disks.push({
                    Name: component.Name,
                    Size: component.Size,
                    FreeSpace: component.FreeSpace
                });
            } else {
                // Если это не диск, добавляем его в компоненты
                components.push(component);
            }
        });

        // Создаем объект для сохранения в MongoDB
        const equipmentData = {
            ...computerInfo,  // Копируем остальные данные
            components,       // Обновленный массив компонентов без дисков
            disks             // Отдельный массив дисков
        };

        // Сохраняем или обновляем запись
        const filter = { name: computerInfo.name };  // Поиск по имени компьютера
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

const ping = async (req, res) => {
    try {
        const { name } = req.body;

        // Поиск оборудования по имени ПК
        const equipment = await Equipment.findOneAndUpdate(
            { name },  // Поиск по названию ПК
            { online: true, lastUpdated: Date.now() },  // Обновляем статус online и время последнего обновления
            { new: true }
        );

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        res.status(200).json({ message: 'Ping received and equipment updated', equipment });
    } catch (error) {
        console.error('Error handling /api/ping request:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const checkLastUpdated = async () => {
    try {
        const secondsThreshold = 3;  // Порог в секундах
        const timeLimit = new Date(Date.now() - secondsThreshold * 1000);  // 3 секунды

        // Поиск всех записей, где lastUpdated меньше порогового времени
        const result = await Equipment.updateMany(
            { lastUpdated: { $lt: timeLimit } },  // Условие для поиска старых записей
            { online: false }  // Обновляем поле online в false
        );
    } catch (error) {
        console.error('Error checking lastUpdated:', error);
    }
};

const getEquipments = async (req, res) => {
    try {
      const filter = req.query; // Получаем фильтры из query-параметров (если нужны)
  
      // Если фильтров нет, просто возвращаем все записи
      const equipments = await Equipment.find(filter);
  
      if (!equipments || equipments.length === 0) {
        return res.status(404).json({ message: 'No equipment found' });
      }
  
      res.status(200).json({ message: 'Equipments retrieved successfully', equipments });
    } catch (error) {
      console.error('Error retrieving equipment:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

// Запуск проверки через регулярные интервалы
setInterval(checkLastUpdated, 3 * 1000);  // Запуск проверки каждые 3 секунды

module.exports = {
    addEquipment,
    ping,
    getEquipments
};
  