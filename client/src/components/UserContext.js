import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

// Создаем контекст для данных пользователя
const UserContext = createContext(null);

// Хук для получения данных пользователя
export const useUser = () => useContext(UserContext);

// Провайдер контекста
export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
      const userId = Cookies.get('user_id');
      if (userId) {
        axios.get(`http://localhost:5000/api/user/${userId}`)
          .then(response => {
            setUserData(response.data);
          })
          .catch(error => {
            console.error('Ошибка при загрузке данных пользователя:', error);
          });
      }
    }, []);
  
    // Если нет данных пользователя, возвращаем null
    if (!userData) {
      return null;  // Можно вернуть спиннер или другой индикатор загрузки
    }

  return (
    <UserContext.Provider value={userData}>
      {children}
    </UserContext.Provider>
  );
};
