import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@nextui-org/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
    email: yup
      .string()
      .required('Email обязателен')
      .matches(/^[a-zA-Z0-9.]+$/, 'Допустимы только латиница, цифры и точки')
      .min(4, 'Минимум 3 символа'),
    username: yup
      .string()
      .required('Имя пользователя обязательно')
      .matches(/^[А-Яа-яЁё0-9 ]+$/, 'Допустима только кириллица и цифры')
      .min(4, 'Минимум 3 символа'),
    password: yup
      .string()
      .required('Пароль обязателен')
      .min(8, 'Минимум 3 символа')
      .matches(/^[^\u0400-\u04FF\s]+$/, 'Кириллица и пробелы запрещены'),
  });

const CreateMailTab = ({ fetchEmails }) => {
  const [emailValue, setEmailValue] = useState('');
  const [usernameValue, setUsernameValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameUnique, setIsUsernameUnique] = useState(true);

  const checkUsernameUniqueness = async (email) => {
    try {
      // Передаём объект с email вместо строки
      const response = await axios.post('http://localhost:5000/api/check-username', { email });
      return response.data.isUnique;
    } catch (error) {
      console.error('Ошибка при проверке уникальности почты:', error);
      return false;
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid, isSubmitting },
    setValue,
    trigger,
    clearErrors,
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const handleInputChange = (e, field) => {
    let value = e.target.value;

    if (field === 'email') {
      value = value.replace(/[^a-zA-Z0-9.]/g, '');
      setEmailValue(value);
    }
    if (field === 'username') {
      value = value.replace(/[^А-Яа-яЁё0-9 ]/g, '');
      setUsernameValue(value);
    }
    if (field === 'password') {
      value = value.replace(/[\u0400-\u04FF\s]/g, '');
      setPasswordValue(value);
    }

    setValue(field, value);
    if (value.length === 0) {
      clearErrors(field);
    } else {
      trigger(field);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Проверка уникальности email перед отправкой
      const emailWithDomain = `${data.email}@rubikom.kz`;
      // Проверка уникальности email
      const isUnique = await checkUsernameUniqueness(emailWithDomain);
  
      // Если почта не уникальна
      if (!isUnique) {
        toast.error('Почта с таким названием уже существует', {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setIsLoading(false);
        setEmailValue('');
        return; // Прерываем дальнейшую отправку
      }

      const payload = {
        ...data,
        email: emailWithDomain,
      };

      // Отправка запроса на сервер для создания email
      const response = await axios.post('http://localhost:5000/api/emails', payload);
  
      if (response.status === 200) {
        toast.success('Email успешно создан!', {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
  
        // Обновляем список email-ов
        await fetchEmails();
  
        // Очищаем поля формы
        setUsernameValue('');
        setPasswordValue('');
        setEmailValue('');
      }
    } catch (error) {
      toast.error('Ошибка при создании email', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="createMail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h2 className="text-lg font-semibold mb-4">Создать почту</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-4">
            <div className="flex flex-col mb-4 w-full">
              <label className="text-sm mb-1 font-medium">Email:</label>
              <div className="flex w-full">
                <input
                  type="text"
                  value={emailValue}
                  className={`p-2 border ${
                    touchedFields.email && errors.email
                      ? 'border-[#ff5a67] focus:border-[#ff5a67]'
                      : touchedFields.email && !errors.email && emailValue.length > 0
                      ? 'border-[#2B935D] focus:border-[#2B935D]'
                      : 'border-[#E9EBF3]'
                  } rounded-l-md w-full outline-none focus:border-[#243F8F] duration-150`}
                  placeholder="Введите email"
                  {...register('email')}
                  onChange={(e) => handleInputChange(e, 'email')}
                  autoComplete="new-password"
                />
                <span className="bg-[#E9EBF3] rounded-r-md flex items-center text-sm justify-center text-[#343F52] px-2">
                  @rubikom.kz
                </span>
              </div>
              {touchedFields.email && errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col mb-4 w-full">
              <label className="text-sm mb-1 font-medium">Имя пользователя:</label>
              <input
                type="text"
                value={usernameValue}
                className={`p-2 border ${
                  touchedFields.username && errors.username
                    ? 'border-[#ff5a67] focus:border-[#ff5a67]'
                    : touchedFields.username && !errors.username && usernameValue.length > 0
                    ? 'border-[#2B935D] focus:border-[#2B935D]'
                    : 'border-[#E9EBF3]'
                } rounded-md w-full outline-none focus:border-[#243F8F] duration-150`}
                placeholder="Введите имя пользователя"
                {...register('username')}
                onChange={(e) => handleInputChange(e, 'username')}
                autoComplete="new-password"
              />
              {touchedFields.username && errors.username && (
                <p className="text-red-500 text-sm">{errors.username.message}</p>
              )}
            </div>

            <div className="flex flex-col mb-4 w-full">
              <label className="text-sm mb-1 font-medium">Пароль:</label>
              <input
                type="password"
                value={passwordValue}
                className={`p-2 border ${
                  touchedFields.password && errors.password
                    ? 'border-[#ff5a67] focus:border-[#ff5a67]'
                    : touchedFields.password && !errors.password && passwordValue.length > 0
                    ? 'border-[#2B935D] focus:border-[#2B935D]'
                    : 'border-[#E9EBF3]'
                } rounded-md w-full outline-none focus:border-[#243F8F] duration-150`}
                placeholder="Введите пароль"
                {...register('password')}
                onChange={(e) => handleInputChange(e, 'password')}
                autoComplete="new-password"
              />
              {touchedFields.password && errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
          </div>
          <Button
            className="text-light text-sm text-white rounded-lg bg-[#243F8F] flex items-center justify-center py-1.5 px-6 disabled:bg-[#243F8F]/65"
            isDisabled={!isValid || isSubmitting}
            isLoading={isLoading}
            type="submit"
          >
            Сохранить почту
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateMailTab;