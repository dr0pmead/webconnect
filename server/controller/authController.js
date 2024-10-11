const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Модель пользователя

// Контроллер авторизации
const loginController = async (req, res) => {
  const { emailOrLogin, password } = req.body;

  try {
    // Ищем пользователя по логину или email
    const user = await User.findOne({
      $or: [{ login: emailOrLogin }, { email: emailOrLogin }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    // Создаем токен
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15d',
    });

    // Отправляем токен и ID пользователя на клиент
    res.json({ token, user_id: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = loginController;
