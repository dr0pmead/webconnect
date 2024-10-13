import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { motion } from 'framer-motion';

const TwoFAModal = ({ isOpen, onRequestClose, user }) => {
  const [qrCode, setQrCode] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${user._id}/2fa`);
        setQrCode(response.data.qrCodeUrl);
        setManualCode(response.data.manualCode);  // Код для ручного ввода
      } catch (error) {
        console.error('Ошибка получения QR-кода:', error);
      }
    };

    // Если пользователь еще не активировал 2FA, загружаем данные для подключения
    if (user && !user.twofaEnable) {
      fetchQRCode();
    }
  }, [user]);

  const handleVerification = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/users/${user._id}/2fa/verify`, {
        token: verificationCode,
      });
      alert('2FA успешно активирована!');
      onRequestClose();
    } catch (error) {
      alert('Неверный код 2FA, попробуйте еще раз.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="2FA Setup"
      ariaHideApp={false}
      shouldCloseOnOverlayClick={false}  // Окно нельзя закрыть кликом вне его
      style={{
        content: {
          width: '500px',
          height: '700px',
          margin: 'auto',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-between h-full"
      >
        <h2 className="text-xl font-bold text-center mb-4">Настройка двухфакторной аутентификации</h2>
        <p className="text-gray-600 mb-4">
          Для защиты вашей учетной записи, активируйте двухфакторную аутентификацию (2FA).
        </p>
        {qrCode && <img src={qrCode} alt="QR-код для подключения 2FA" className="mx-auto mb-4" />}
        <p className="text-gray-600 text-center mb-4">
          Сканируйте QR-код с помощью приложения Google Authenticator или введите код вручную.
        </p>
        {manualCode && (
          <div className="text-center mb-4">
            <p>Код для ручного ввода:</p>
            <p className="font-mono ">{manualCode}</p>  {/* Код для ручного ввода */}
          </div>
        )}
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Введите одноразовый код"
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />
        <button
          onClick={handleVerification}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Подтвердить
        </button>
      </motion.div>
    </Modal>
  );
};

export default TwoFAModal;
