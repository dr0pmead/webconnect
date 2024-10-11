import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { parseCookies } from 'nookies';

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
        formState: { errors, isValid, touchedFields }
      } = useForm({
        resolver: yupResolver(schema),
      });
    
      const [loading, setLoading] = useState(false);
      const [errorMessage, setErrorMessage] = useState('');
      const [showPassword, setShowPassword] = useState(false);

      const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
      };
    
      const onSubmit = async (data) => {
        setLoading(true);
        setErrorMessage('');
        try {
          const response = await axios.post('http://localhost:5000/api/login', data);
          const { token, user_id } = response.data;
    
          // Устанавливаем куки на 15 дней
          Cookies.set('token', token, { expires: 15 });
          Cookies.set('user_id', user_id, { expires: 15 });
    
          // Перенаправляем пользователя на главную страницу
          window.location.href = '/';
        } catch (error) {
          setErrorMessage(error.response?.data?.message || 'Ошибка авторизации');
        } finally {
          setLoading(false);
        }
      };
    

  return (
    <div className="overflow-hidden mx-auto w-full flex items-center justify-center h-screen">
      <div className="flex items-center justify-center flex-col max-w-md w-full">

        <div className="mb-10">
          <img src="/assets/img/webconnect_logo_first.svg" alt="webconnect" />
        </div>
        
        {/* Сообщение об ошибке, если форма была отправлена и есть ошибки */}
        {errorMessage && Object.keys(errors).length > 0 && (
          <div className="bg-[#FFE9E9] text-[#ff5a67] p-4 mb-5 w-full rounded-md flex items-center gap-3">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="#ff5a67" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_692_29)">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.707 0.292919C1.5184 0.110761 1.2658 0.00996641 1.0036 0.0122448C0.741407 0.0145233 0.490594 0.119692 0.305186 0.3051C0.119778 0.490508 0.0146093 0.741321 0.0123308 1.00352C0.0100524 1.26571 0.110847 1.51832 0.293005 1.70692L5.586 6.99992L0.293005 12.2929C0.197495 12.3852 0.121312 12.4955 0.0689035 12.6175C0.0164945 12.7395 -0.0110918 12.8707 -0.0122456 13.0035C-0.0133994 13.1363 0.0119023 13.268 0.0621832 13.3909C0.112464 13.5138 0.186717 13.6254 0.28061 13.7193C0.374503 13.8132 0.486155 13.8875 0.609051 13.9377C0.731947 13.988 0.863627 14.0133 0.996406 14.0122C1.12919 14.011 1.26041 13.9834 1.38241 13.931C1.50441 13.8786 1.61476 13.8024 1.707 13.7069L7 8.41392L12.293 13.7069C12.4816 13.8891 12.7342 13.9899 12.9964 13.9876C13.2586 13.9853 13.5094 13.8801 13.6948 13.6947C13.8802 13.5093 13.9854 13.2585 13.9877 12.9963C13.99 12.7341 13.8892 12.4815 13.707 12.2929L8.414 6.99992L13.707 1.70692Z"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_692_29">
                    <rect width="14" height="14"/>
                    </clipPath>
                    </defs>
                    </svg>
            <span className="text-sm">{errors.emailOrLogin?.message || errors.password?.message}</span>
            {errorMessage && <div className="error-message text-sm">{errorMessage}</div>}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full mb-3">
          {/* Email/Логин */}
        <label className="flex flex-col mb-3 relative">
        <span className={`${errors.emailOrLogin ? 'text-[#ff5a67]' : 'text-[#343F52]'} text-sm font-semibold mb-2`}>
            Email или логин
        </span>
        <div className="relative">
            <input
            type="text"
            placeholder="Email/Логин"
            autoComplete="off"  // Отключаем автозаполнение
            className={`text-sm border w-full ${
                errors.emailOrLogin
                ? 'border-[#ff5a67] focus:border-[#ff5a67]'  // Красный цвет при ошибке
                : touchedFields.emailOrLogin && !errors.emailOrLogin
                ? 'border-[#2B935D] focus:border-[#2B935D]'  // Зелёный при успешной валидации
                : 'border-[#E9EBF3]'                         // По умолчанию
            } rounded-lg px-3 py-1.5 text-[#343F52] outline-none focus:border-black duration-150`}
            {...register('emailOrLogin')} 
            />
            {/* Галочка или крестик внутри инпута */}
            <span className="absolute right-3 top-3">
            {touchedFields.emailOrLogin && !errors.emailOrLogin ? (
                <svg width="15" height="12" viewBox="0 0 15 12" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M14.7253 0.305528C14.9012 0.501216 15 0.766591 15 1.04329C15 1.32 14.9012 1.58537 14.7253 1.78106L5.81208 11.6945C5.63614 11.8901 5.39754 12 5.14875 12C4.89997 12 4.66137 11.8901 4.48542 11.6945L0.263374 6.99865C0.0924668 6.80184 -0.00210222 6.53824 3.54675e-05 6.26464C0.00217316 5.99103 0.100846 5.7293 0.274802 5.53582C0.448758 5.34235 0.684079 5.2326 0.93008 5.23022C1.17608 5.22785 1.41308 5.33303 1.59003 5.52311L5.14875 9.48117L13.3986 0.305528C13.5746 0.109899 13.8132 0 14.062 0C14.3108 0 14.5494 0.109899 14.7253 0.305528Z" fill="#2B935D"/>
                </svg>
            ) : (
                touchedFields.emailOrLogin && (
                <svg width="12" height="12" viewBox="0 0 14 14" fill="#ff5a67" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_692_29)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M1.707 0.292919C1.5184 0.110761 1.2658 0.00996641 1.0036 0.0122448C0.741407 0.0145233 0.490594 0.119692 0.305186 0.3051C0.119778 0.490508 0.0146093 0.741321 0.0123308 1.00352C0.0100524 1.26571 0.110847 1.51832 0.293005 1.70692L5.586 6.99992L0.293005 12.2929C0.197495 12.3852 0.121312 12.4955 0.0689035 12.6175C0.0164945 12.7395 -0.0110918 12.8707 -0.0122456 13.0035C-0.0133994 13.1363 0.0119023 13.268 0.0621832 13.3909C0.112464 13.5138 0.186717 13.6254 0.28061 13.7193C0.374503 13.8132 0.486155 13.8875 0.609051 13.9377C0.731947 13.988 0.863627 14.0133 0.996406 14.0122C1.12919 14.011 1.26041 13.9834 1.38241 13.931C1.50441 13.8786 1.61476 13.8024 1.707 13.7069L7 8.41392L12.293 13.7069C12.4816 13.8891 12.7342 13.9899 12.9964 13.9876C13.2586 13.9853 13.5094 13.8801 13.6948 13.6947C13.8802 13.5093 13.9854 13.2585 13.9877 12.9963C13.99 12.7341 13.8892 12.4815 13.707 12.2929L8.414 6.99992L13.707 1.70692Z"/>
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
        {errors.emailOrLogin && (
            <span id="text-error" className="text-[#ff5a67] text-xs mt-1">
            {errors.emailOrLogin.message}
            </span>
        )}
        </label>


          {/* Пароль */}
          <div className="flex flex-col mb-3 relative">
            <span className={`${errors.password ? 'text-[#ff5a67]' : 'text-[#343F52]'} text-sm font-semibold mb-2`}>
              Пароль
            </span>
            <div className="relative w-full flex">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Пароль"
                className={`text-sm border w-full ${
                  errors.password
                    ? 'border-[#ff5a67] focus:border-[#ff5a67]'  // Красный цвет для ошибки
                    : touchedFields.password && !errors.password
                    ? 'border-[#2B935D] focus:border-[#2B935D]'  // Зелёный цвет при успешной валидации
                    : 'border-[#E9EBF3]'                        // Серый цвет по умолчанию
                } rounded-lg rounded-r-none px-3 py-1.5 text-[#343F52] outline-none focus:border-black duration-150`}
                {...register('password')}
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
                {touchedFields.password && !errors.password ? (
                <svg width="13" height="10" viewBox="0 0 15 12" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M14.7253 0.305528C14.9012 0.501216 15 0.766591 15 1.04329C15 1.32 14.9012 1.58537 14.7253 1.78106L5.81208 11.6945C5.63614 11.8901 5.39754 12 5.14875 12C4.89997 12 4.66137 11.8901 4.48542 11.6945L0.263374 6.99865C0.0924668 6.80184 -0.00210222 6.53824 3.54675e-05 6.26464C0.00217316 5.99103 0.100846 5.7293 0.274802 5.53582C0.448758 5.34235 0.684079 5.2326 0.93008 5.23022C1.17608 5.22785 1.41308 5.33303 1.59003 5.52311L5.14875 9.48117L13.3986 0.305528C13.5746 0.109899 13.8132 0 14.062 0C14.3108 0 14.5494 0.109899 14.7253 0.305528Z" fill="#2B935D"/>
                </svg>
                ) : (
                  touchedFields.password &&             
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="#ff5a67" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_692_29)">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.707 0.292919C1.5184 0.110761 1.2658 0.00996641 1.0036 0.0122448C0.741407 0.0145233 0.490594 0.119692 0.305186 0.3051C0.119778 0.490508 0.0146093 0.741321 0.0123308 1.00352C0.0100524 1.26571 0.110847 1.51832 0.293005 1.70692L5.586 6.99992L0.293005 12.2929C0.197495 12.3852 0.121312 12.4955 0.0689035 12.6175C0.0164945 12.7395 -0.0110918 12.8707 -0.0122456 13.0035C-0.0133994 13.1363 0.0119023 13.268 0.0621832 13.3909C0.112464 13.5138 0.186717 13.6254 0.28061 13.7193C0.374503 13.8132 0.486155 13.8875 0.609051 13.9377C0.731947 13.988 0.863627 14.0133 0.996406 14.0122C1.12919 14.011 1.26041 13.9834 1.38241 13.931C1.50441 13.8786 1.61476 13.8024 1.707 13.7069L7 8.41392L12.293 13.7069C12.4816 13.8891 12.7342 13.9899 12.9964 13.9876C13.2586 13.9853 13.5094 13.8801 13.6948 13.6947C13.8802 13.5093 13.9854 13.2585 13.9877 12.9963C13.99 12.7341 13.8892 12.4815 13.707 12.2929L8.414 6.99992L13.707 1.70692Z"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_692_29">
                    <rect width="14" height="14"/>
                    </clipPath>
                    </defs>
                    </svg>

                )}
              </span>
            </div>
            {errors.password && (
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
      </div>
    </div>
  );
}
