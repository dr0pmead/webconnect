const bcrypt = require('bcrypt'); // Оставляем только этот импорт
const Email = require('../models/Email'); // Подключаем модель

const crypto = require('crypto');

// Функция шифрования пароля
const encryptFunction = (password) => {
  const iv = crypto.randomBytes(16); // случайный IV для каждого шифрования
  const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(process.env.SECRET_KEY), iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // возвращаем IV вместе с зашифрованным текстом
};

const decryptFunction = (encryptedPassword) => {
  const [iv, encryptedText] = encryptedPassword.split(':'); // разделяем IV и зашифрованный текст
  const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(process.env.SECRET_KEY), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Создание email
const createEmail = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Проверяем, передан ли пароль
    if (!password) {
      return res.status(400).json({ message: 'Пароль обязателен' });
    }

    // Шифруем пароль перед сохранением
    const encryptedPassword = encryptFunction(password);

    // Создаем новый объект Email с зашифрованным паролем
    const newEmail = new Email({
      email,
      username,
      password: encryptedPassword,  // Сохраняем зашифрованный пароль
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

const updateEmail = async (req, res) => {
  const { _id, username, password } = req.body;

  // Проверка, что все необходимые поля переданы
  if (!_id || !username || !password) {
    return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
  }

  try {
    // Хэшируем пароль перед обновлением
    const encryptedPassword = encryptFunction(password);

    // Обновляем данные email'а в базе
    const updatedEmail = await Email.findByIdAndUpdate(
      _id,
      { username, password: encryptedPassword },
      { new: true } // Возвращаем обновленный документ
    );

    if (!updatedEmail) {
      return res.status(404).json({ message: 'Почта не найдена' });
    }

    res.status(200).json({ message: 'Почта успешно обновлена', updatedEmail });
  } catch (error) {
    console.error('Ошибка при обновлении почты:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}


const getAllEmails = async (req, res) => {
  try {
    const emails = await Email.find(); // Получаем все почты
    res.status(200).json(emails); // Возвращаем почты
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении почт' });
  }
};

const getEmailPassword = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ message: 'Email не найден' });
    }

    if (!email.password) {
      return res.status(400).json({ message: 'Пароль не найден для этого email' });
    }

    // Здесь должна выполняться расшифровка пароля
    const decryptedPassword = decryptFunction(email.password);

    res.status(200).json({ password: decryptedPassword });
  } catch (error) {
    console.error('Ошибка при получении пароля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

  const checkUsername = async (req, res) => {
    const { email } = req.body;
    const existingUser = await Email.findOne({ email });
    console.log(email)
    if (existingUser) {
      return res.json({ isUnique: false });
    }
    console.log(existingUser)
    res.json({ isUnique: true });
  }

const deleteEmails = async (req, res) => {
  const { ids } = req.body; // Получаем массив ID из тела запроса

  if (!ids || ids.length === 0) {
    return res.status(400).json({ message: 'Не выбраны почты для удаления' });
  }

  try {
    // Удаляем записи по их ID
    await Email.deleteMany({ _id: { $in: ids } });

    // Возвращаем успешный ответ
    res.status(200).json({ message: 'Почты успешно удалены' });
  } catch (error) {
    console.error('Ошибка при удалении почт:', error);
    res.status(500).json({ message: 'Произошла ошибка при удалении почт', error });
  }
}

const deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;

    // Поиск и удаление email по id
    const deletedEmail = await Email.findByIdAndDelete(id);

    if (!deletedEmail) {
      return res.status(404).json({ message: 'Email не найден' });
    }

    res.status(200).json({ message: 'Email успешно удален', deletedEmail });
  } catch (error) {
    console.error('Ошибка при удалении email:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении email' });
  }
};

module.exports = { createEmail, getAllEmails, getEmailPassword, deleteEmail, checkUsername, deleteEmails, updateEmail};