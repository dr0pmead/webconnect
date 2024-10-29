import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { parseCookies } from 'nookies';
import { motion } from "framer-motion";
import Head from 'next/head';
const schema = yup.object().shape({
  emailOrLogin: yup
    .string()
    .required('Введите email или логин')
    .min(4, 'Минимум 4 символа')
    .matches(/^[a-zA-Z0-9.@]+$/, 'Только английские буквы, цифры и точки'),
  password: yup
    .string()
    .required('Введите пароль')
    .min(2, 'Пароль должен быть минимум 2 символа'),
});

export async function getServerSideProps(context) {
  const cookies = parseCookies(context);
  const token = cookies.token;
  const userId = cookies.user_id;

  // Если токен и user_id присутствуют, перенаправляем на главную страницу
  if (token && userId) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {}, // Данные для страницы логина
  };
}

export default function Login() {


    const {
      register,
      handleSubmit,
      formState: { errors, isValid, touchedFields },
      setValue,
      trigger,
      clearErrors,
      getValues,  // Добавляем getValues
      reset
  } = useForm({
      resolver: yupResolver(schema),
  });
    
      const [loading, setLoading] = useState(false);
      const [errorMessage, setErrorMessage] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [emailOrLogin, setEmailOrLoginValue] = useState('');
      const [passwordValue, setPasswordValue] = useState('');
      const [twofaStep, setTwofaStep] = useState(false);
      const [code, setCode] = useState(Array(6).fill(''));
      const [userId, setUserId] = useState(null);
      
      const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
      };
    
      const onSubmit = async (data) => {
        setLoading(true);
        setErrorMessage('');
        console.log('Login form submitted:', data); // Логируем данные формы
      
        try {
          const response = await axios.post('http://webconnect.rubikom.kz/api/login', data);
          const { twofaRequired, user_id } = response.data;
      
          if (twofaRequired) {
            console.log(`2FA step required for user: ${user_id}`); // Логируем, что требуется шаг 2FA
            setTwofaStep(true);
            setUserId(user_id);
          } else {
            console.log('User logged in without 2FA'); // Логируем успешный вход без 2FA
            Cookies.set('token', response.data.token);
            Cookies.set('user_id', user_id);
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Login failed:', error); // Логируем ошибку авторизации
          setErrorMessage('Ошибка авторизации');
        } finally {
          setLoading(false);
        }
      };

      const handleInputChange = (e, field) => {
        let value = e.target.value;
      
        // Удаление запрещенных символов
        if (field === 'emailOrLogin') {
          value = value.replace(/[^a-zA-Z0-9.@]/g, ''); // Только латиница, цифры и точки
          setEmailOrLoginValue(value); // Обновляем локальное состояние
        }
        if (field === 'password') {
          value = value.replace(/[^a-zA-Z0-9]/g, ''); // Только латиница и цифры
          setPasswordValue(value); // Обновляем локальное состояние
        }
      
        // Обновляем значение в useForm и сразу проверяем поле
        setValue(field, value);
        trigger(field);
      
        // Если поле пустое, сбрасываем ошибки
        if (value.trim() === '') {
          clearErrors(field);
        }
      };

      const errorVariants = {
        hidden: { opacity: 0, y: -20 }, // Начальное состояние (скрыто)
        visible: { opacity: 1, y: 0 },  // Переход к видимому состоянию
      };
      
      const handle2faSubmit = async () => {
        const verificationCode = code.join('');
        console.log(`2FA verification attempt for user: ${userId} with code: ${verificationCode}`); // Логируем код 2FA
      
        try {
          const response = await axios.post(`http://webconnect.rubikom.kz/api/users/${userId}/2fa/2faauth`, {
            token: verificationCode,
          });
          console.log('2FA successful'); // Логируем успешную проверку 2FA
          Cookies.set('token', response.data.token);
          Cookies.set('user_id', userId);
          window.location.href = '/';
        } catch (error) {
          console.error('2FA failed:', error); // Логируем ошибку при проверке 2FA
          setErrorMessage('Неверный код');
        }
      };

      const handleChange = (e, index) => {
        const value = e.target.value;
      
        if (value.match(/^[0-9]$/)) { // Проверяем, является ли введенный символ числом
          const newCode = [...code];
          newCode[index] = value;
          setCode(newCode);
      
          // Перемещаем фокус на следующий инпут, если не последний
          if (index < 5 && value) {
            document.getElementById(`code-input-${index + 1}`).focus();
          }
      
          // Если это последний инпут, добавляем небольшую задержку и затем нажимаем на кнопку
          if (index === 5 && value) {
            setTimeout(() => {
              document.getElementById('submit-button').click();
            }, 100); // Небольшая задержка, чтобы обновление состояния прошло
          }
        }
      };
      
      const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
          const newCode = [...code];
          newCode[index] = '';  // Очищаем текущее значение
          setCode(newCode);
      
          // Перемещаем фокус на предыдущий инпут, если он есть
          if (index > 0) {
            document.getElementById(`code-input-${index - 1}`).focus();
          }
        }
      };

  return (
    <>
    <Head>
      <title>Авторизация</title>
      <meta name="description" content="Авторизация WebConnect" />
    </Head>
    <div className="overflow-hidden mx-auto w-full flex items-center justify-center h-screen">
      <div className="flex items-center justify-center flex-col max-w-md w-full">

        <div className="mb-10">
          <img src="/assets/img/webconnect_logo_first.svg" alt="webconnect" />
        </div>
        
        {/* Сообщение об ошибке, если форма была отправлена и есть ошибки */}
        {errorMessage && (
          <motion.div
              className="bg-[#FFE9E9] text-[#ff5a67] p-4 mb-5 w-full rounded-md flex items-center gap-3 *:fill-[#ff5a67]"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="*:fill-[#ff5a67]">
                  <g clipPath="url(#clip0_692_29)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M1.707 0.292919C1.5184 0.110761 1.2658 0.00996641 1.0036 0.0122448C0.741407 0.0145233 0.490594 0.119692 0.305186 0.3051C0.119778 0.490508 0.0146093 0.741321 0.0123308 1.00352C0.0100524 1.26571 0.110847 1.51832 0.293005 1.70692L5.586 6.99992L0.293005 12.2929C0.197495 12.3852 0.121312 12.4955 0.0689035 12.6175C0.0164945 12.7395 -0.0110918 12.8707 -0.0122456 13.0035C-0.0133994 13.1363 0.0119023 13.268 0.0621832 13.3909C0.112464 13.5138 0.186717 13.6254 0.28061 13.7193C0.374503 13.8132 0.486155 13.8875 0.609051 13.9377C0.731947 13.988 0.863627 14.0133 0.996406 14.0122C1.12919 14.011 1.26041 13.9834 1.38241 13.931C1.50441 13.8786 1.61476 13.8024 1.707 13.7069L7 8.41392L12.293 13.7069C12.4816 13.8891 12.7342 13.9899 12.9964 13.9876C13.2586 13.9853 13.5094 13.8801 13.6948 13.6947C13.8802 13.5093 13.9854 13.2585 13.9877 12.9963C13.99 12.7341 13.8892 12.4815 13.707 12.2929L8.414 6.99992L13.707 1.70692C13.8892 1.51832 13.99 1.26571 13.9877 1.00352C13.9854 0.741321 13.8802 0.490508 13.6948 0.3051C13.5094 0.119692 13.2586 0.0145233 12.9964 0.0122448C12.7342 0.00996641 12.4816 0.110761 12.293 0.292919L7 5.58592L1.707 0.292919Z"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_692_29">
                  <rect width="14" height="14"/>
                  </clipPath>
                  </defs>
                </svg>
              <div className="error-message text-sm">{errorMessage}</div>
            </motion.div>
        )}

    {twofaStep ? (
      // Шаг для ввода 2FA
      
      <div className="flex flex-col gap-4">
        <p className="font-bold flex items-center justify-center text-center">Введите 6-ти значный код из приложения Google Authenticator:</p>
        <div className="flex justify-between">
          {code.map((value, index) => (
            <input
              key={index}
              id={`code-input-${index}`} // Добавляем id для управления фокусом
              type="text"
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(e, index)} // Обрабатываем ввод данных
              onKeyDown={(e) => handleKeyDown(e, index)} // Обрабатываем нажатие клавиш
              placeholder="0"
              className="w-14 h-12 border text-center mx-1 rounded-lg text-xl font-bold outline-[#243F8F]"
            />
          ))}
        </div>
        <button
            type="submit"
            className="hidden"
            disabled={loading}  // Кнопка блокируется, если форма невалидна или идет загрузка
            onClick={handle2faSubmit}
            id="submit-button"
          >
          </button>
      </div>
    ) : (

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full mb-3">
          {/* Email/Логин */}
        <label className="flex flex-col mb-3 relative">
        <span className={`${errors.emailOrLogin && getValues('emailOrLogin').length > 0 ? 'text-[#ff5a67]' : 'text-[#343F52]'} text-sm font-semibold mb-2`}>
            Email или логин
        </span>
        <div className="relative">
        <input
            type="text"
            placeholder="Email/Логин"
            autoComplete="off" 
            value={emailOrLogin}
            className={`text-sm border w-full ${
              errors.emailOrLogin && getValues('emailOrLogin').length > 0
                ? 'border-[#ff5a67] focus:border-[#ff5a67] pr-6'
                : touchedFields.emailOrLogin && !errors.emailOrLogin && getValues('emailOrLogin').length > 0
                ? 'border-[#2B935D] focus:border-[#2B935D] pr-6'
                : 'border-[#E9EBF3]'
            } rounded-lg px-3 py-1.5 text-[#343F52] outline-none focus:border-black duration-150`}
            {...register('emailOrLogin')}
            onChange={(e) => handleInputChange(e, 'emailOrLogin')}
          />
            {/* Галочка или крестик внутри инпута */}
            <span className="absolute right-3 top-3">
              {touchedFields.emailOrLogin && !errors.emailOrLogin && getValues('emailOrLogin').length > 0 ? (
                <svg width="15" height="12" viewBox="0 0 15 12" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M14.7253 0.305528C14.9012 0.501216 15 0.766591 15 1.04329C15 1.32 14.9012 1.58537 14.7253 1.78106L5.81208 11.6945C5.63614 11.8901 5.39754 12 5.14875 12C4.89997 12 4.66137 11.8901 4.48542 11.6945L0.263374 6.99865C0.0924668 6.80184 -0.00210222 6.53824 3.54675e-05 6.26464C0.00217316 5.99103 0.100846 5.7293 0.274802 5.53582C0.448758 5.34235 0.684079 5.2326 0.93008 5.23022C1.17608 5.22785 1.41308 5.33303 1.59003 5.52311L5.14875 9.48117L13.3986 0.305528C13.5746 0.109899 13.8132 0 14.062 0C14.3108 0 14.5494 0.109899 14.7253 0.305528Z" fill="#2B935D"/>
                </svg>
              ) : (
                touchedFields.emailOrLogin && getValues('emailOrLogin').length > 0 && (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="*:fill-[#ff5a67]">
                  <g clipPath="url(#clip0_692_29)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M1.707 0.292919C1.5184 0.110761 1.2658 0.00996641 1.0036 0.0122448C0.741407 0.0145233 0.490594 0.119692 0.305186 0.3051C0.119778 0.490508 0.0146093 0.741321 0.0123308 1.00352C0.0100524 1.26571 0.110847 1.51832 0.293005 1.70692L5.586 6.99992L0.293005 12.2929C0.197495 12.3852 0.121312 12.4955 0.0689035 12.6175C0.0164945 12.7395 -0.0110918 12.8707 -0.0122456 13.0035C-0.0133994 13.1363 0.0119023 13.268 0.0621832 13.3909C0.112464 13.5138 0.186717 13.6254 0.28061 13.7193C0.374503 13.8132 0.486155 13.8875 0.609051 13.9377C0.731947 13.988 0.863627 14.0133 0.996406 14.0122C1.12919 14.011 1.26041 13.9834 1.38241 13.931C1.50441 13.8786 1.61476 13.8024 1.707 13.7069L7 8.41392L12.293 13.7069C12.4816 13.8891 12.7342 13.9899 12.9964 13.9876C13.2586 13.9853 13.5094 13.8801 13.6948 13.6947C13.8802 13.5093 13.9854 13.2585 13.9877 12.9963C13.99 12.7341 13.8892 12.4815 13.707 12.2929L8.414 6.99992L13.707 1.70692C13.8892 1.51832 13.99 1.26571 13.9877 1.00352C13.9854 0.741321 13.8802 0.490508 13.6948 0.3051C13.5094 0.119692 13.2586 0.0145233 12.9964 0.0122448C12.7342 0.00996641 12.4816 0.110761 12.293 0.292919L7 5.58592L1.707 0.292919Z"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_692_29">
                  <rect width="14" height="14"/>
                  </clipPath>
                  </defs>
                </svg>
                )
              )}
            </span>
        </div>
        {errors.emailOrLogin && getValues('emailOrLogin').length > 0 && (
            <span id="text-error" className="text-[#ff5a67] text-xs mt-1">
            {errors.emailOrLogin.message}
            </span>
        )}
        </label>


          {/* Пароль */}
          <div className="flex flex-col mb-3 relative">
            <span className={`${errors.password && getValues('password').length > 0 ? 'text-[#ff5a67]' : 'text-[#343F52]'} text-sm font-semibold mb-2`}>
              Пароль
            </span>
            <div className="relative w-full flex">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={passwordValue}
              className={`text-sm border w-full ${
                errors.password && getValues('password').length > 0
                  ? 'border-[#ff5a67] focus:border-[#ff5a67] pr-6'
                  : touchedFields.password && !errors.password && getValues('password').length > 0
                  ? 'border-[#2B935D] focus:border-[#2B935D] pr-6'
                  : 'border-[#E9EBF3]'
              } rounded-l-lg px-3 py-1.5 text-[#343F52] outline-none focus:border-black duration-150`}
              {...register('password')}
              onChange={(e) => handleInputChange(e, 'password')}
            />
              {/* Кнопка просмотра пароля */}
              <span
                className="flex items-center justify-center px-3 py-1.5 bg-[#FAFAFC] border-l-0 border border-[#E9EBF3] cursor-pointer rounded-r-lg max-w-[40px]"
                onClick={togglePasswordVisibility}
              >
                <img src={showPassword ? '/assets/img/mdi_eye_off.svg' : '/assets/img/mdi_eye.svg'} alt="toggle-password" className="w-4 h-4"/>
              </span>
              {/* Галочка или крестик внутри инпута */}
              <span className="absolute right-12 top-3">
                {touchedFields.password && !errors.password && getValues('password').length > 0 ? (
                  <svg width="13" height="10" viewBox="0 0 15 12" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M14.7253 0.305528C14.9012 0.501216 15 0.766591 15 1.04329C15 1.32 14.9012 1.58537 14.7253 1.78106L5.81208 11.6945C5.63614 11.8901 5.39754 12 5.14875 12C4.89997 12 4.66137 11.8901 4.48542 11.6945L0.263374 6.99865C0.0924668 6.80184 -0.00210222 6.53824 3.54675e-05 6.26464C0.00217316 5.99103 0.100846 5.7293 0.274802 5.53582C0.448758 5.34235 0.684079 5.2326 0.93008 5.23022C1.17608 5.22785 1.41308 5.33303 1.59003 5.52311L5.14875 9.48117L13.3986 0.305528C13.5746 0.109899 13.8132 0 14.062 0C14.3108 0 14.5494 0.109899 14.7253 0.305528Z" fill="#2B935D"/>
                  </svg>
                ) : (
                  touchedFields.password && getValues('password').length > 0 && (
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="*:fill-[#ff5a67]">
                    <g clipPath="url(#clip0_692_29)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M1.707 0.292919C1.5184 0.110761 1.2658 0.00996641 1.0036 0.0122448C0.741407 0.0145233 0.490594 0.119692 0.305186 0.3051C0.119778 0.490508 0.0146093 0.741321 0.0123308 1.00352C0.0100524 1.26571 0.110847 1.51832 0.293005 1.70692L5.586 6.99992L0.293005 12.2929C0.197495 12.3852 0.121312 12.4955 0.0689035 12.6175C0.0164945 12.7395 -0.0110918 12.8707 -0.0122456 13.0035C-0.0133994 13.1363 0.0119023 13.268 0.0621832 13.3909C0.112464 13.5138 0.186717 13.6254 0.28061 13.7193C0.374503 13.8132 0.486155 13.8875 0.609051 13.9377C0.731947 13.988 0.863627 14.0133 0.996406 14.0122C1.12919 14.011 1.26041 13.9834 1.38241 13.931C1.50441 13.8786 1.61476 13.8024 1.707 13.7069L7 8.41392L12.293 13.7069C12.4816 13.8891 12.7342 13.9899 12.9964 13.9876C13.2586 13.9853 13.5094 13.8801 13.6948 13.6947C13.8802 13.5093 13.9854 13.2585 13.9877 12.9963C13.99 12.7341 13.8892 12.4815 13.707 12.2929L8.414 6.99992L13.707 1.70692C13.8892 1.51832 13.99 1.26571 13.9877 1.00352C13.9854 0.741321 13.8802 0.490508 13.6948 0.3051C13.5094 0.119692 13.2586 0.0145233 12.9964 0.0122448C12.7342 0.00996641 12.4816 0.110761 12.293 0.292919L7 5.58592L1.707 0.292919Z"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_692_29">
                    <rect width="14" height="14"/>
                    </clipPath>
                    </defs>
                  </svg>
                  )
                )}
              </span>
            </div>
            {errors.password && getValues('password').length > 0 && (
              <span id="text-error" className="text-[#ff5a67] text-xs mt-1">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="w-full justify-start items-center mb-5">
            <span className="text-sm text-black font-light decoration-solid cursor-pointer underline">Забыли пароль?</span>
          </div>
          <button
            type="submit"
            className="text-light text-sm text-white rounded-lg bg-[#243F8F] flex items-center justify-center py-1.5 w-full disabled:bg-[#243F8F]/65"
            disabled={!isValid || loading}  // Кнопка блокируется, если форма невалидна или идет загрузка
          >
            {!loading ? (
              <span id="submitBtn-text">Войти с паролем</span>
            ) : (
              <span id="submitBtn-loader" className="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
          </button>
        </form>
    )}
      </div>
    </div>
    </>
  );
}
