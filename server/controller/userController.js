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

  const secret = speakeasy.generateSecret({ name: `WebConnect (${user.email})` });

  user.twofaSecret = secret.base32;
  await user.save();

  // Генерация QR-кода
  qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка генерации QR-кода' });
    }

    res.json({
      qrCodeUrl: data_url,  // URL для отображения QR-кода
      manualCode: secret.base32  // Код для ручного ввода
    });
  });
};

// Верификация 2FA
const verify2FA = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twofaSecret,
    encoding: 'base32',
    token: req.body.token,
  });

  if (verified) {
    user.twofaEnable = true;
    await user.save();
    return res.json({ message: '2FA успешно активирована' });
  }

  res.status(400).json({ message: 'Неверный код 2FA' });
};

module.exports = {
  getUserById,
  generate2FA,
  verify2FA,
};
