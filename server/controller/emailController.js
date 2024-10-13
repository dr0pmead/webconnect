const bcrypt = require('bcryptjs');
const Email = require('../models/Email'); // Подключаем модель

// Контроллер для создания нового email
const createEmail = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем новый объект Email
    const newEmail = new Email({
      email,
      username,
      password: hashedPassword
    });

    // Сохраняем в базе данных
    await newEmail.save();

    // Возвращаем успешный ответ
    res.status(200).json({ message: 'Email создан успешно' });
  } catch (error) {
    console.error('Ошибка при создании email:', error);
    res.status(500).json({ message: 'Ошибка при создании email' });
  }
};

const getAllEmails = async (req, res) => {
  try {
    const emails = await Email.find(); // Получаем все почты
    res.status(200).json(emails); // Возвращаем почты
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении почт' });
  }
};

module.exports = { createEmail, getAllEmails};