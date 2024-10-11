const User = require('../models/User');  // Модель пользователя

// Контроллер для получения данных пользователя по ID
const getUserById = async (req, res) => {
  const { id } = req.params;  // Получаем id из параметров запроса

  try {
    const user = await User.findById(id).select('-password');  // Не отправляем пароль
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = getUserById;
