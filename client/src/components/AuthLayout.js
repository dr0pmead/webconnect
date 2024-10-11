import { parseCookies } from 'nookies';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const AuthLayout = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    // Получаем куки
    const cookies = parseCookies();
    const token = cookies.token;
    const userId = cookies.user_id;

    // Если мы на странице логина и токен существует, перенаправляем на главную
    if (router.pathname === '/login' && token && userId) {
      router.push('/');
    } 
    
    // Если токен или userId отсутствуют на любой другой странице, перенаправляем на страницу логина
    else if (router.pathname !== '/login' && (!token || !userId)) {
      router.push('/login');
    }
  }, [router]);

  return <>{children}</>;
};

export default AuthLayout;
