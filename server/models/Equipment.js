const mongoose = require('mongoose');

// Описание схемы дисков
const DiskSchema = new mongoose.Schema({
    Name: { type: String, required: true },             // Название диска (например, Samsung SSD)
    Size: { type: Number, required: true },             // Размер диска в ГБ
    FreeSpace: { type: Number, required: true }         // Свободное место на диске в ГБ
});

// Описание схемы компонентов (процессор, память и видеокарта)
const ComponentSchema = new mongoose.Schema({
    Type: { type: String },                             // Тип (процессор, память, видеокарта)
    Name: { type: String },
    Manufacturer: { type: String },                     // Производитель для памяти (если применимо)
    Quantity: { type: Number }                          // Количество памяти в ГБ
});

// Описание схемы принтера
const PrinterSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    PortName: { type: String, required: true },
    Default: { type: Boolean, default: false },
    IpAddress: { type: String }
});

// Описание основной схемы для equipment
const EquipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },              // Имя компьютера
    ipAddress: [{ type: String, required: true }],       // Список IP-адресов компьютера
    components: [ComponentSchema],                       // Список комплектующих (процессор, память, видеокарта и т.д.)
    disks: [DiskSchema],                                 // Массив с дисками
    anyDesk: { type: String },                           // ID AnyDesk
    teamViewer: { type: String },                        // ID TeamViewer
    printer: PrinterSchema,                              // Информация о принтере
    online: { type: Boolean, default: true },            // Статус онлайн
    owner: { type: String, required: true },             // Владелец компьютера
    department: { type: String, required: true },        // Отдел
    lastUpdated: { type: Date, default: Date.now }       // Дата последнего обновления
});

// Экспортируем модель
module.exports = mongoose.model('Equipment', EquipmentSchema);
