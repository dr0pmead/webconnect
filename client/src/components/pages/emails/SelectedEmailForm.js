import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { handleShowPassword } from '@/utils/passwordUtils';

const SelectedEmailForm = ({ selectedEmail }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting, isValid },
    setValue,
  } = useForm({
    defaultValues: {
      username: selectedEmail.username,
      password: '',
    },
  });

  const [loadingStates, setLoadingStates] = useState({}); // Состояние для загрузки паролей
  const [decryptedPasswords, setDecryptedPasswords] = useState({}); // Расшифрованные пароли
  const [showPassword, setShowPassword] = useState({});

  useEffect(() => {
    if (selectedEmail) {
      handleShowPassword(
        selectedEmail._id,
        setLoadingStates,
        showPassword,
        setShowPassword,
        setDecryptedPasswords
      );
    }
  }, [selectedEmail]);

  const onUpdate = (data) => {
    console.log('Updated email data:', data);
    // Implement your update logic here
  };

  const handleInputChange = (e, field) => {
    setValue(field, e.target.value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <motion.div
      key="selectedEmail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg font-semibold mb-4">Редактировать почту {selectedEmail.email}</h2>
      <form onSubmit={handleSubmit(onUpdate)}>
        <div className="flex gap-4">
          {/* Поле Email (нельзя изменить) */}
          <div className="flex flex-col mb-4 w-full">
            <label className="text-sm mb-1 font-medium">Почта:</label>
            <div className="flex w-full">
              <input
                type="text"
                value={selectedEmail.email.split('@')[0]}
                className="p-2 border border-[#E9EBF3] rounded-l-md w-full outline-none"
                disabled
              />
              <span className="bg-[#E9EBF3] rounded-r-md flex items-center text-sm justify-center text-[#343F52] px-2">
                @{selectedEmail.email.split('@')[1]}
              </span>
            </div>
          </div>

          {/* Поле Имя пользователя (можно редактировать) */}
          <div className="flex flex-col mb-4 w-full">
            <label className="text-sm mb-1 font-medium">Имя пользователя:</label>
            <input
              type="text"
              className={`p-2 border ${
                touchedFields.username && errors.username
                  ? 'border-[#ff5a67] focus:border-[#ff5a67]' // Красный при ошибке
                  : touchedFields.username && !errors.username && selectedEmail.username.length > 0
                  ? 'border-[#2B935D] focus:border-[#2B935D]' // Зелёный при валидном значении
                  : 'border-[#E9EBF3]' // Серый по умолчанию
              } rounded-md w-full outline-none`}
              placeholder="Введите имя пользователя"
              {...register('username', { required: 'Имя пользователя обязательно' })}
              onChange={(e) => handleInputChange(e, 'username')}
              autoComplete="new-password"
            />
            {touchedFields.username && errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          {/* Поле Пароль (можно редактировать) */}
          <div className="flex flex-col mb-4 w-full">
            <label className="text-sm mb-1 font-medium">Пароль:</label>
            <input
                type={showPassword[selectedEmail._id] ? 'text' : 'password'} // Показать или скрыть пароль
                value={
                decryptedPasswords[selectedEmail._id] || selectedEmail.password // Показываем расшифрованный пароль, если доступен
                }
                className={`p-2 border ${
                touchedFields.password && errors.password
                    ? 'border-[#ff5a67] focus:border-[#ff5a67]' // Красный при ошибке
                    : touchedFields.password && !errors.password && selectedEmail.password.length > 0
                    ? 'border-[#2B935D] focus:border-[#2B935D]' // Зелёный при валидном значении
                    : 'border-[#E9EBF3]' // Серый по умолчанию
                } rounded-md w-full outline-none`}
                placeholder="Введите пароль"
                {...register('password', { required: 'Пароль обязателен' })}
                autoComplete="new-password"
            />
            {touchedFields.password && errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
            </div>
        </div>
        <Button
          className="bg-[#243F8F] text-white py-1.5 px-6"
          isDisabled={!isValid || isSubmitting}
          isLoading={isSubmitting}
          type="submit"
        >
          Обновить почту
        </Button>
      </form>
    </motion.div>
  );
};

export default SelectedEmailForm;