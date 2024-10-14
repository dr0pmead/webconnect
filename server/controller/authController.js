const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Модель пользователя

// Контроллер авторизации
const loginController = async (req, res) => {
  const { emailOrLogin, password } = req.body;
  console.log(`Login attempt by: ${emailOrLogin}`); // Логируем попытку входа

  try {
    const user = await User.findOne({
      $or: [{ login: emailOrLogin }, { email: emailOrLogin }],
    });

    if (!user) {
      console.log('User not found or incorrect login'); // Логируем, если пользователь не найден
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password'); // Логируем неверный пароль
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    if (user.twofaEnable) {
      console.log(`2FA required for user: ${user._id}`); // Логируем, что требуется 2FA
      return res.json({ twofaRequired: true, user_id: user._id });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: '15d',
    });

    console.log(`Login successful for user: ${user._id}`); // Логируем успешный вход
    res.json({ token, user_id: user._id });
  } catch (error) {
    console.error('Server error during login:', error); // Логируем ошибку на сервере
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = loginController;
