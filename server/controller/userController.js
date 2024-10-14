const User = require('../models/User');  // Модель пользователя
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

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

// Генерация 2FA секретного ключа и QR-кода
const generate2FA = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  if (user.twofaEnable) {
    return res.status(400).json({ message: '2FA уже активирована' });
  }

  // Генерация секрета с уменьшенным количеством символов
  const secret = speakeasy.generateSecret({ length: 20, name: `WebConnect` });

  user.twofaSecret = secret.base32;
  await user.save();

  // Генерация QR-кода и возвращаем сокращенный код
  qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка генерации QR-кода' });
    }

    res.json({ qrCodeUrl: data_url, manualCode: secret.base32.slice(0, 20) });  // Сокращаем длину до 10 символов
  });
};

const verify2FA = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем введенный одноразовый код
    const verified = speakeasy.totp.verify({
      secret: user.twofaSecret,
      encoding: 'base32',
      token: req.body.token,
      window: 1 // Добавляем окно времени для улучшения верификации
    });
    

    if (verified) {
      // Если 2FA еще не активирована, активируем её
      if (!user.twofaEnable) {
        user.twofaEnable = true;
        await user.save();
        return res.json({ message: '2FA успешно активирована' });
      }

      // Если 2FA уже активирована, выполняем авторизацию
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
        expiresIn: '15d',
      });

      return res.json({ message: '2FA успешно пройдена', token });
    } else {
      return res.status(400).json({ message: 'Неверный код 2FA' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

const verify2FAAuth = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Валидация токена с помощью библиотеки speakeasy
    const verified = speakeasy.totp.verify({
      secret: user.twofaSecret,
      encoding: 'base32',
      token: req.body.token,
    });

    if (verified) {
      return res.json({ message: '2FA успешно проверена', token: 'ваш-токен' });
    } else {
      return res.status(400).json({ message: 'Неверный код 2FA' });
    }
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getUserById,
  generate2FA,
  verify2FA,
  verify2FAAuth
};
