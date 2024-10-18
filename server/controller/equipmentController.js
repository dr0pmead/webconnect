const Equipment = require('../models/Equipment');  // Модель пользователя

const addEquipment = async (req, res) => {
    try {
        const computerInfo = req.body;
        const disks = [];
        const components = [];

        // Проверяем, существует ли запись с таким именем в базе данных
        const existingEquipment = await Equipment.findOne({ name: computerInfo.name });

        // Если запись найдена, извлекаем существующие компоненты, диски и другие данные
        let existingDisks = existingEquipment ? existingEquipment.disks : [];
        let existingComponents = existingEquipment ? existingEquipment.components : [];

        // Обрабатываем переданные компоненты
        computerInfo.components.forEach(component => {
            if (component.Type === 'Disk') {
                // Проверяем, существует ли такой диск уже в базе
                const existingDisk = existingDisks.find(disk => disk.Name === component.Name);
                if (!existingDisk) {
                    disks.push({
                        Name: component.Name,
                        Size: component.Size,
                        FreeSpace: component.FreeSpace
                    });
                } else {
                    // Если диск уже существует, обновляем его
                    existingDisk.Size = component.Size;
                    existingDisk.FreeSpace = component.FreeSpace;
                }
            } else if (component.Type === 'Memory') {
                // Проверяем, существует ли такой компонент памяти уже в базе
                const existingMemory = existingComponents.find(mem => mem.Type === 'Memory' && mem.Manufacturer === component.Manufacturer);
                if (!existingMemory) {
                    components.push({
                        Type: 'Memory',
                        Manufacturer: component.Manufacturer,
                        Quantity: component.Quantity, // В ГБ
                        Data: component.Data  // Тип памяти (DDR4, DDR5 и т.д.)
                    });
                } else {
                    // Обновляем существующую запись памяти
                    existingMemory.Quantity = component.Quantity;
                    existingMemory.Data = component.Data;
                }
            } else {
                // Проверяем другие компоненты (процессор, видеокарта и т.д.)
                const existingComponent = existingComponents.find(comp => comp.Type === component.Type && comp.Name === component.Name);
                if (!existingComponent) {
                    components.push(component);
                } else {
                    // Можно обновить другие атрибуты компонента
                    existingComponent.Name = component.Name;
                }
            }
        });

        // Добавляем в массив только новые данные (те, которых не было в базе)
        const updatedComponents = [...existingComponents, ...components];
        const updatedDisks = [...existingDisks, ...disks];

        // Создаем данные для обновления оборудования
        const equipmentData = {
            name: computerInfo.name,
            anyDesk: computerInfo.anyDesk || existingEquipment?.anyDesk,
            teamViewer: computerInfo.teamViewer || existingEquipment?.teamViewer,
            osVersion: existingEquipment?.osVersion || computerInfo.osVersion, // Сохраняем старую версию ОС, если она есть
            owner: existingEquipment?.owner || computerInfo.owner, // Не перезаписываем владельца
            department: existingEquipment?.department || computerInfo.department, // Не перезаписываем отдел
            division: existingEquipment?.division || computerInfo.division, // Не перезаписываем подразделение
            components: updatedComponents,  // Обновленный массив компонентов
            disks: updatedDisks,            // Обновленный массив дисков
            ipAddress: {
                main: computerInfo.ipAddress.main || existingEquipment?.ipAddress?.main,
                secondary: computerInfo.ipAddress.secondary || existingEquipment?.ipAddress?.secondary
            },
            printer: existingEquipment?.printer || computerInfo.printer, // Сохраняем существующую информацию о принтере
            online: true, // Статус онлайн всегда обновляется
            lastUpdated: Date.now(), // Обновляем дату обновления
            inventoryNumber: existingEquipment?.inventoryNumber || computerInfo.inventoryNumber,
        };

        // Условия для поиска и обновления
        const filter = { name: computerInfo.name };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };

        // Обновляем или создаем запись
        const updatedEquipment = await Equipment.findOneAndUpdate(filter, equipmentData, options);

        // Оценка производительности
        const estimation = calculateEstimation(updatedEquipment);

        // Обновляем оборудование с оценкой
        await Equipment.findOneAndUpdate(filter, { estimation }, options);

        res.status(200).json({
            message: 'Data received and stored successfully',
            data: updatedEquipment
        });
    } catch (error) {
        console.error('Error handling /api/createEquipment request:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const calculateEstimation = (equipment) => {
    let totalScore = 0;
    let componentCount = 0;

    // Оценка процессора
    const cpu = equipment.components.find(comp => comp.Type === 'Processor');
    if (cpu) {
        let cpuScore = 0;
        if (cpu.Name.includes('i5') && parseInt(cpu.Name.match(/\d+/)) > 10) {
            cpuScore = 7;
        } else if (cpu.Name.includes('i7') && parseInt(cpu.Name.match(/\d+/)) > 10) {
            cpuScore = 9;
        } else if (cpu.Name.includes('Ryzen 5') && parseInt(cpu.Name.match(/\d+/)) >= 5600) {
            cpuScore = 7;
        } else if (cpu.Name.includes('Ryzen 7') && parseInt(cpu.Name.match(/\d+/)) >= 7000) {
            cpuScore = 9;
        } else {
            cpuScore = 5; // Значение по умолчанию для более старых моделей
        }
        totalScore += cpuScore;
        componentCount++;
    }

    // Оценка оперативной памяти
    const memory = equipment.components.filter(comp => comp.Type === 'Memory');
    const totalMemory = memory.reduce((acc, mem) => acc + mem.Quantity, 0);
    if (totalMemory >= 16 && memory.every(mem => mem.Data === 'DDR5')) {
        totalScore += 10; // Максимальная оценка для новой памяти
    } else if (totalMemory >= 8 && memory.every(mem => mem.Data === 'DDR4')) {
        totalScore += 7; // Средняя оценка для DDR4
    } else {
        totalScore += 5; // Для старой памяти
    }
    componentCount++;

    // Оценка накопителей
    const ssd = equipment.disks.filter(disk => disk.Name.includes('SSD'));
    const ssdCount = ssd.length;
    const sufficientSize = ssd.filter(disk => disk.Size >= 256).length;
    if (ssdCount > 0 && sufficientSize > 0) {
        totalScore += 7; // Достаточное количество и объем SSD
    } else {
        totalScore += 5; // Наличие старых или малых накопителей
    }
    componentCount++;

    // Оценка ОС
    if (equipment.osVersion.includes('Windows 10') || equipment.osVersion.includes('Windows 11')) {
        totalScore += 9; // Новые ОС
    } else {
        totalScore += 5; // Старые ОС
    }
    componentCount++;

    // Средний балл
    const averageScore = totalScore / componentCount;
    return parseFloat(averageScore.toFixed(1)); // Возвращаем с округлением до десятых
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
