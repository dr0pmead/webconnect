import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from '@nextui-org/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Image from 'next/image';

const TwoFAModal = ({ isOpen, onRequestClose, onOpenChange, user }) => {
  const [qrCode, setQrCode] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [code, setCode] = useState(new Array(6).fill(''));

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

  const handleCopy = () => {
    navigator.clipboard.writeText(manualCode);
    toast.success('Код скопирован в буфер обмена!', {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (value.match(/^[0-9]$/)) { // проверка на число
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Перемещаем фокус на следующий инпут
      if (index < 5 && value) {
        document.getElementById(`code-input-${index + 1}`).focus();
      }

      if (index === 5 && value) {
        setTimeout(() => {
          document.getElementById('apply-code').click();
        }, 100); // Небольшая задержка, чтобы обновление состояния прошло
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newCode = [...code];
      newCode[index] = '';  // Очищаем текущий инпут
      setCode(newCode);
  
      // Перемещаем фокус на предыдущий инпут, если есть
      if (index > 0) {
        document.getElementById(`code-input-${index - 1}`).focus();
      }
    }
  };

  // Верификация 2FA
  const handleVerification = async () => {
    const verificationCode = code.join('');
    try {
      const response = await axios.post(`http://localhost:5000/api/users/${user._id}/2fa/verify`, {
        token: verificationCode,
      });
      toast.success('Двухфакторная аутентификация активирована!', {
        position: "bottom-right",
        autoClose: 3000,
      });
  
      // Добавляем плавное закрытие окна
      setTimeout(() => {
        onRequestClose(); // Закрываем модальное окно через переданную функцию
      }, 500);
    } catch (error) {
      toast.error('Неверный код. Попробуйте еще раз.', {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <Modal size='lg' backdrop='blur' isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton={true} closeButton={false} aria-labelledby="2fa-modal">
      <ModalContent>
        <ModalHeader>
          <motion.div initial={{ opacity: 0, y: -100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -100 }} transition={{ duration: 0.4 }}>
            <h2 className="text-lg font-bold text-left">Настройка двухфакторной аутентификации</h2>
            <p className="text-gray-600 mb-4 text-sm">Для защиты вашей учетной записи, активируйте двухфакторную аутентификацию (2FA).</p>
          </motion.div>
        </ModalHeader>
        <ModalBody>
          

          {qrCode && <Image src={qrCode} alt="QR-код для подключения 2FA" className="mx-auto mb-4 h-80 w-80" />}
          {manualCode && (
            <div className="mb-4">
              <p className="text-gray-600 mb-2 text-sm">Или введите код вручную:</p>
              <motion.div className="flex items-center gap-4">
                <input className="border px-4 py-3 text-xl w-full rounded-lg font-bold" disabled value={manualCode} />
                <Button className="bg-[#243F8F] *:fill-white h-14" color="primary" onClick={handleCopy}>
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.24 2H11.346C9.582 2 8.184 2 7.091 2.148C5.965 2.3 5.054 2.62 4.336 3.341C3.617 4.062 3.298 4.977 3.147 6.107C3 7.205 3 8.608 3 10.379V16.217C3 17.725 3.92 19.017 5.227 19.559C5.16 18.649 5.16 17.374 5.16 16.312V11.302C5.16 10.021 5.16 8.916 5.278 8.032C5.405 7.084 5.691 6.176 6.425 5.439C7.159 4.702 8.064 4.415 9.008 4.287C9.888 4.169 10.988 4.169 12.265 4.169H15.335C16.611 4.169 17.709 4.169 18.59 4.287C18.3261 3.61329 17.8653 3.03474 17.2678 2.62678C16.6702 2.21883 15.9635 2.00041 15.24 2Z"/>
                  <path d="M6.60001 11.3968C6.60001 8.67077 6.60001 7.30777 7.44401 6.46077C8.28701 5.61377 9.64401 5.61377 12.36 5.61377H15.24C17.955 5.61377 19.313 5.61377 20.157 6.46077C21.001 7.30777 21 8.67077 21 11.3968V16.2168C21 18.9428 21 20.3058 20.157 21.1528C19.313 21.9998 17.955 21.9998 15.24 21.9998H12.36C9.64501 21.9998 8.28701 21.9998 7.44401 21.1528C6.60001 20.3058 6.60001 18.9428 6.60001 16.2168V11.3968Z"/>
                </svg>
                </Button>
              </motion.div>
            </div>
          )}

          <div className="mt-4">
            <p className="text-gray-600 text-left text-sm">Введите 6-значный код:</p>
          </div>

          <div className="flex justify-center mb-4">
            {code.map((value, index) => (
              <input
                key={index}
                id={`code-input-${index}`}
                type="text"
                value={value}
                maxLength={1}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="border w-16 h-16 text-center mx-2 text-4xl rounded-lg outline-[#243F8F]"
              />
              
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button id="apply-code" className="hidden bg-[#243F8F] w-full" color="primary" onPress={handleVerification} >Подтвердить</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TwoFAModal;
