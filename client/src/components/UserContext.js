import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router'; 
import Cookies from 'js-cookie';
import axios from 'axios';
import TwoFAModal from '@/components/TwoFAModal'; // Импортируем компонент модального окна

// Создаем контекст для данных пользователя
const UserContext = createContext(null);

// Хук для получения данных пользователя
export const useUser = () => useContext(UserContext);

// Провайдер контекста
export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTwoFAModalOpen, setIsTwoFAModalOpen] = useState(false); // Управление состоянием модального окна
    const router = useRouter(); 

    useEffect(() => {
        const userId = Cookies.get('user_id');
        if (userId) {
            axios.get(`http://webconnect.rubikom.kz/api/user/${userId}`)
                .then(response => {
                    const user = response.data;
                    setUserData(user);
                    setLoading(false);
                    // Если двухфакторная аутентификация не включена, показываем модальное окно
                    if (!user.twofaEnable) {
                        setIsTwoFAModalOpen(true);
                    }
                })
                .catch(error => {
                    console.error('Ошибка при загрузке данных пользователя:', error);
                    setLoading(false); 
                });
        } else {
            setLoading(false); 
        }
    }, []);

    useEffect(() => {
        // Если данных пользователя нет и загрузка завершена, перенаправляем на /login
        if (!loading && !userData && router.pathname !== '/login') {
            router.push('/login');
        }
    }, [loading, userData, router]);

    // Если идет загрузка данных, рендерим индикатор загрузки
    if (loading) {
        return <div>Загрузка...</div>;  // Можно рендерить индикатор загрузки
    }

    return (
        <UserContext.Provider value={userData}>
            {children}
            {/* Модальное окно для настройки 2FA */}
            <TwoFAModal
                isOpen={isTwoFAModalOpen}
                onRequestClose={() => setIsTwoFAModalOpen(false)} // Добавляем возможность закрытия окна после настройки
                user={userData}
            />
        </UserContext.Provider>
    );
};
