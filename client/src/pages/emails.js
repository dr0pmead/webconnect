import { useUser } from '@/components/UserContext';
import Head from 'next/head';
import { motion } from 'framer-motion';
import React, { useState, useEffect  } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';
import Cookies from 'js-cookie';
import {Checkbox} from "@nextui-org/react";

const schema = yup.object().shape({
  email: yup
    .string()
    .matches(/^[a-zA-Z0-9.]+$/, 'Некорректный email')
    .min(4, 'Минимум 4 символа')
    .required('Email обязателен'),
  username: yup
    .string()
    .matches(/^[А-Яа-яЁё0-9 ]+$/, 'Только кириллица и цифры')
    .min(4, 'Минимум 4 символа')
    .required('Имя пользователя обязательно'),
  password: yup
    .string()
    .matches(/^[^\u0400-\u04FF\s]+$/, 'Только латиница и без пробелов')
    .min(8, 'Минимум 8 символов')
    .required('Пароль обязателен'),
});

export default function EmailsPage() {
  const user = useUser();
  const [selectedTab, setSelectedTab] = useState('allMails');
  const [loading, setLoading] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [usernameValue, setUsernameValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [emails, setEmails] = useState([]);
  const [decryptedPasswords, setDecryptedPasswords] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const isAdmin = user.admin === true; // Проверяем, является ли пользователь администратором
  const isTwofaEnabled = user.twofaEnable === true; // Проверяем, включена ли двухфакторная аутентификация
  
  const { register, handleSubmit, formState: { errors, touchedFields, isValid }, setValue, trigger, clearErrors } = useForm({
      mode: 'onChange', // Валидация при изменении значений
      resolver: yupResolver(schema),
  });

  useEffect(() => {
    // Принудительное отключение автозаполнения
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input) => {
      input.setAttribute('autocomplete', 'new-password'); // Полное отключение автозаполнения
    });
    fetchEmails();
  }, []);

  // Очистка от запрещенных символов
  const handleInputChange = (e, field) => {
    let value = e.target.value;
  
    // Удаляем запрещённые символы
    if (field === 'email') {
      value = value.replace(/[^a-zA-Z0-9.]/g, ''); // Только латиница, цифры и точка
      setEmailValue(value); // Обновляем состояние для email
    }
    if (field === 'username') {
      value = value.replace(/[^А-Яа-яЁё0-9 ]/g, ''); // Только кириллица и цифры
      setUsernameValue(value); // Обновляем состояние для имени пользователя
    }
    if (field === 'password') {
      value = value.replace(/[\u0400-\u04FF\s]/g, ''); // Запрещена кириллица и пробелы
      setPasswordValue(value); // Обновляем состояние для пароля
    }
  
    setValue(field, value); // Устанавливаем отфильтрованное значение в форму
    if (value.length === 0) {
      clearErrors(field); // Сбрасываем ошибки, если поле пустое
    } else {
      trigger(field); // Проверка валидации для поля
    }
  };

  const fetchEmails = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/emails');
      setEmails(response.data); // Сохраняем почты в состояние
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке почт:', error);
      setLoading(false);
    }
  };


  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        email: `${data.email}@rubikom.kz`, // Append @rubikom.kz to email
      };
  
      console.log(payload);
      const response = await axios.post('http://localhost:5000/api/emails', payload);
  
      if (response.status === 200) {
        toast.success('Email успешно создан!', {
          position: "bottom-right",
          autoClose: 3000, // Устанавливаем время отображения 3 секунды
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        fetchEmails();
      }
    } catch (error) {
      console.error(error)
      toast.error('Ошибка при создании email', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleShowPassword = async (emailId) => {
    if (showPassword[emailId]) {
      // Если пароль уже показан, скрываем его
      setShowPassword((prevState) => ({
        ...prevState,
        [emailId]: false,
      }));
    } else {
      try {
        const response = await axios.get(`http://localhost:5000/api/emails/${emailId}/password`, {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`, // передаем токен
          },
        });
  
        const decryptedPassword = response.data.password;
  
        setDecryptedPasswords((prevState) => ({
          ...prevState,
          [emailId]: decryptedPassword,
        }));
  
        // Показываем пароль для текущего email
        setShowPassword((prevState) => ({
          ...prevState,
          [emailId]: true,
        }));
      } catch (error) {
        console.error('Ошибка при получении пароля:', error.response ? error.response.data : error.message);
      }
    }
  };
  

  // Проверяем, загружены ли данные пользователя
  if (!user) {
    return <div>Загрузка данных пользователя...</div>;
  }

  return (
    <>
  <Head>
    <title>Управления ящиками - WebConnect</title>
    <meta name="description" content="Добро пожаловать на главную страницу WebConnect" />
  </Head>
    <div className="w-full h-full">
        <div className="max-w-1320 py-8 flex flex-col  mx-auto">
            <div className="text-4xl text-[#343F52] font-semibold">
              Управления ящиками
            </div>  
            <div className="flex flex-col mt-12">
              <div id="navigation-mail" className="border border-[#E9EBF3] rounded-t-lg flex">
                <button
                  onClick={() => setSelectedTab('allMails')}
                  className={`emails-nav flex items-center justify-center px-8 py-3 ${selectedTab === 'allMails' ? 'active' : ''}`}
                >
                <span className={`text-sm text-light flex gap-3 ${selectedTab === 'allMails' ? 'text-[#243F8F]' : ''}`}>
                  Все почты <span className="flex items-center justify-center rounded-md bg-[#243F8F] font-semibold w-5 h-5 text-white">{emails.length}</span>
                </span>
                </button>
                <button
                  onClick={() => setSelectedTab('createMail')}
                  className={`emails-nav flex items-center justify-center px-8 py-3 ${selectedTab === 'createMail' ? 'active' : ''}`}
                >
                  <span className={`text-sm text-light flex items-center gap-2 font-regular ${selectedTab === 'createMail' ? 'text-[#243F8F] *:fill-[#243F8F] *:duration-150' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 15C4.14 15 1 11.86 1 8C1 4.14 4.14 1 8 1C11.86 1 15 4.14 15 8C15 11.86 11.86 15 8 15ZM8 2C4.69 2 2 4.69 2 8C2 11.31 4.69 14 8 14C11.31 14 14 11.31 14 8C14 4.69 11.31 2 8 2Z" />
                    <path d="M8 11.5C7.72 11.5 7.5 11.28 7.5 11V5C7.5 4.72 7.72 4.5 8 4.5C8.28 4.5 8.5 4.72 8.5 5V11C8.5 11.28 8.28 11.5 8 11.5Z"/>
                    <path d="M11 8.5H5C4.72 8.5 4.5 8.28 4.5 8C4.5 7.72 4.72 7.5 5 7.5H11C11.28 7.5 11.5 7.72 11.5 8C11.5 8.28 11.28 8.5 11 8.5Z"/>
                  </svg> 
                  Создать почту
                  </span>
                </button>
              </div>

              {/* Анимированное переключение контента */}
              <motion.div
                id="template-mail"
                className="p-8 border border-[#E9EBF3] border-t-0 rounded-b-lg"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {selectedTab === 'allMails' ? (
                  <motion.div
                    key="allMails"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Таблица для всех почт */}
                    <table className="table-auto w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E9EBF3] text-sm text-[#343F52] font-medium">
                          <th className="py-3 w-4"><Checkbox></Checkbox></th>
                          <th className="px-6 py-3 w-1/5">Наименование</th>
                          <th className="px-6 py-3 w-1/5">Пользователь</th>
                          <th className="px-6 py-3 w-1/3">Пароль</th>
                          <th className="px-6 py-3 w-1/2"></th>
                          <th className="px-6 py-3 w-1/6 text-center">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emails.map((email) => (
                          <tr key={email._id} className="border-b font-medium text-[#343F52]">
                            <td className="py-3"><Checkbox ></Checkbox></td>
                            <td className="px-6 py-3">{email.email}</td>
                            <td className="px-6 py-3">{email.username}</td>
                            <td className="px-6 py-3">
                              <div className="relative w-full flex gap-2">
                                <input
                                  type={showPassword[email._id] ? 'text' : 'password'}
                                  placeholder="Пароль"
                                  readOnly
                                  value={showPassword[email._id] ? decryptedPasswords[email._id] : email.password}
                                  className="text-sm border w-full rounded-lg px-3 py-1.5 text-[#343F52] outline-none focus:border-black duration-150"
                                />
                                {isAdmin && isTwofaEnabled && (
                                  <span
                                    className="flex items-center justify-center px-3 py-1.5 bg-[#FAFAFC] border border-[#E9EBF3] cursor-pointer rounded-lg max-w-[40px]"
                                    onClick={() => handleShowPassword(email._id)}
                                  >
                                    <img src={showPassword[email._id] ? '/assets/img/mdi_eye_off.svg' : '/assets/img/mdi_eye.svg'} alt="toggle-password" className="w-4 h-4"/>
                                  </span>
                                )}
                              </div>  
                              </td>
                              <td className="px-6 py-3 "></td>
                            <td className="px-6 py-3 ">
                              <div className="flex justify-between items-center ">
                            <button className=" flex items-center justify-center *:fill-[#343F52] hover:*:fill-[#243F8F] hover:*:rotate-180 *:duration-300">
                            <svg width="22" height="20" viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8.2502 20L7.8502 16.8C7.63353 16.7167 7.42953 16.6167 7.2382 16.5C7.04686 16.3833 6.8592 16.2583 6.6752 16.125L3.7002 17.375L0.950195 12.625L3.5252 10.675C3.50853 10.5583 3.5002 10.446 3.5002 10.338V9.663C3.5002 9.55433 3.50853 9.44167 3.5252 9.325L0.950195 7.375L3.7002 2.625L6.6752 3.875C6.85853 3.74167 7.0502 3.61667 7.2502 3.5C7.4502 3.38333 7.6502 3.28333 7.8502 3.2L8.2502 0H13.7502L14.1502 3.2C14.3669 3.28333 14.5712 3.38333 14.7632 3.5C14.9552 3.61667 15.1425 3.74167 15.3252 3.875L18.3002 2.625L21.0502 7.375L18.4752 9.325C18.4919 9.44167 18.5002 9.55433 18.5002 9.663V10.337C18.5002 10.4457 18.4835 10.5583 18.4502 10.675L21.0252 12.625L18.2752 17.375L15.3252 16.125C15.1419 16.2583 14.9502 16.3833 14.7502 16.5C14.5502 16.6167 14.3502 16.7167 14.1502 16.8L13.7502 20H8.2502ZM11.0502 13.5C12.0169 13.5 12.8419 13.1583 13.5252 12.475C14.2085 11.7917 14.5502 10.9667 14.5502 10C14.5502 9.03333 14.2085 8.20833 13.5252 7.525C12.8419 6.84167 12.0169 6.5 11.0502 6.5C10.0669 6.5 9.23753 6.84167 8.5622 7.525C7.88686 8.20833 7.54953 9.03333 7.5502 10C7.55086 10.9667 7.88853 11.7917 8.5632 12.475C9.23786 13.1583 10.0669 13.5 11.0502 13.5Z"/>
                            </svg>
                            </button>
                            <span className="text-[#E9EBF3]">|</span>
                            <button
                              className="flex items-center justify-center *:fill-[#343F52] hover:*:fill-[#FF5A67] *:duration-300"
                              onClick={() => setDeleteModalOpen(true)} // Opens the modal
                            >
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20.0001 6C20.255 6.00028 20.5001 6.09788 20.6855 6.27285C20.8708 6.44782 20.9823 6.68695 20.9973 6.94139C21.0122 7.19584 20.9294 7.44638 20.7658 7.64183C20.6023 7.83729 20.3702 7.9629 20.1171 7.993L20.0001 8H19.9191L19.0001 19C19.0002 19.7652 18.7078 20.5015 18.1828 21.0583C17.6579 21.615 16.94 21.9501 16.1761 21.995L16.0001 22H8.00011C6.40211 22 5.09611 20.751 5.00811 19.25L5.00311 19.083L4.08011 8H4.00011C3.74523 7.99972 3.50008 7.90212 3.31474 7.72715C3.12941 7.55218 3.01788 7.31305 3.00294 7.05861C2.988 6.80416 3.07079 6.55362 3.23438 6.35817C3.39797 6.16271 3.63002 6.0371 3.88311 6.007L4.00011 6H20.0001ZM10.5111 11.14C10.3016 11.0153 10.0537 10.9714 9.81412 11.0166C9.57452 11.0619 9.3597 11.1931 9.21006 11.3856C9.06042 11.5781 8.98628 11.8187 9.00157 12.062C9.01687 12.3054 9.12055 12.5347 9.29311 12.707L10.5851 14L9.29311 15.293L9.21011 15.387C9.0547 15.588 8.98162 15.8406 9.00571 16.0935C9.02981 16.3464 9.14927 16.5807 9.33983 16.7488C9.5304 16.9168 9.77778 17.006 10.0317 16.9982C10.2857 16.9905 10.5272 16.8863 10.7071 16.707L12.0001 15.415L13.2931 16.707L13.3871 16.79C13.5881 16.9454 13.8407 17.0185 14.0936 16.9944C14.3466 16.9703 14.5808 16.8508 14.7489 16.6603C14.9169 16.4697 15.0061 16.2223 14.9983 15.9684C14.9906 15.7144 14.8865 15.473 14.7071 15.293L13.4151 14L14.7071 12.707L14.7901 12.613C14.9455 12.412 15.0186 12.1594 14.9945 11.9065C14.9704 11.6536 14.851 11.4193 14.6604 11.2512C14.4698 11.0832 14.2224 10.994 13.9685 11.0018C13.7145 11.0095 13.4731 11.1137 13.2931 11.293L12.0001 12.585L10.7071 11.293L10.6131 11.21L10.5111 11.14ZM14.0001 2C14.5305 2 15.0393 2.21071 15.4143 2.58579C15.7894 2.96086 16.0001 3.46957 16.0001 4C15.9998 4.25488 15.9022 4.50003 15.7273 4.68537C15.5523 4.8707 15.3132 4.98223 15.0587 4.99717C14.8043 5.01211 14.5537 4.92933 14.3583 4.76574C14.1628 4.60214 14.0372 4.3701 14.0071 4.117L14.0001 4H10.0001L9.99311 4.117C9.96301 4.3701 9.8374 4.60214 9.64195 4.76574C9.44649 4.92933 9.19595 5.01211 8.94151 4.99717C8.68707 4.98223 8.44793 4.8707 8.27296 4.68537C8.09799 4.50003 8.0004 4.25488 8.00011 4C7.99995 3.49542 8.19052 3.00943 8.53361 2.63945C8.8767 2.26947 9.34696 2.04284 9.85011 2.005L10.0001 2H14.0001Z"/>
                            </svg>
                            </button>
                            </div>
                          </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                  </motion.div>
                ) : (
                  <motion.div
                    key="createMail"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Контейнер для создания новой почты */}
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Создать почту</h2>
                        <form onSubmit={handleSubmit(onSubmit)} >
                          {/* Поле Email */}
                          <div className="flex gap-4">
                          <div className="flex flex-col mb-4 w-full">
                            <label className="text-sm mb-1 font-medium">Email:</label>
                            <div className="flex w-full">
                              <input
                                type="text"
                                className={`p-2 border ${
                                  touchedFields.email && errors.email
                                    ? 'border-[#ff5a67] focus:border-[#ff5a67]' // Красный при ошибке
                                    : touchedFields.email && !errors.email && emailValue.length > 0
                                    ? 'border-[#2B935D] focus:border-[#2B935D]' // Зелёный при валидном значении
                                    : 'border-[#E9EBF3]' // Серый по умолчанию
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

                          {/* Поле Имя пользователя */}
                          <div className="flex flex-col mb-4 w-full">
                            <label className="text-sm mb-1 font-medium">Имя пользователя:</label>
                            <input
                              type="text"
                              className={`p-2 border ${
                                touchedFields.username && errors.username
                                  ? 'border-[#ff5a67] focus:border-[#ff5a67]' // Красный при ошибке
                                  : touchedFields.username && !errors.username && usernameValue.length > 0
                                  ? 'border-[#2B935D] focus:border-[#2B935D]' // Зелёный при валидном значении
                                  : 'border-[#E9EBF3]' // Серый по умолчанию
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

                          {/* Поле Пароль */}
                          <div className="flex flex-col mb-4 w-full">
                            <label className="text-sm mb-1 font-medium">Пароль:</label>
                            <input
                              type="password"
                              className={`p-2 border ${
                                touchedFields.password && errors.password
                                  ? 'border-[#ff5a67] focus:border-[#ff5a67]' // Красный при ошибке
                                  : touchedFields.password && !errors.password && passwordValue.length > 0
                                  ? 'border-[#2B935D] focus:border-[#2B935D]' // Зелёный при валидном значении
                                  : 'border-[#E9EBF3]' // Серый по умолчанию
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
                          <button
                            type="submit"
                            className="text-light text-sm text-white rounded-lg bg-[#243F8F] flex items-center justify-center py-1.5 px-6 disabled:bg-[#243F8F]/65"
                            disabled={!isValid}
                          >
                            Сохранить почту
                          </button>
                        </form>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
           
        </div>
    </div>
    </>
  );
}
