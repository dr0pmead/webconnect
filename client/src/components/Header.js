// components/Header.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useUser } from '@/components/UserContext';
import Image from 'next/image';

export default function Header() {
    const [userInitials, setUserInitials] = useState('');
    const user = useUser();
    const router = useRouter();
    const [activePath, setActivePath] = useState(router.pathname);
  
    useEffect(() => {
      // Обновляем активный путь после каждого изменения маршрута
      const handleRouteChange = (url) => {
        setActivePath(url);
      };
  
      // Подписываемся на событие изменения маршрута
      router.events.on('routeChangeComplete', handleRouteChange);
  
      // Отписываемся при размонтировании компонента
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    }, [router.events]);
  
    const isActive = (pathname) => activePath === pathname;

    useEffect(() => {
        async function fetchUserData() {
          if (user) {
            const name = user.name;
            const firstName = user.firstname;
      
            const nameInitial = name ? name.charAt(0).toUpperCase() : '';
            const firstNameInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
      
            setUserInitials(`${nameInitial}${firstNameInitial}`);
          }
        }
        fetchUserData();
      }, [user]);

  return (
    <header className="w-full bg-white p-8 py-3 border-b border-[#E9EBF3]">
        <div className="max-w-1320 mx-auto flex flex-col justify-between gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <Image src="/assets/img/webconnect_logo_second.svg" alt="webconnect"/>
                </div>
                <div className="w-10 h-10 rounded-md bg-[#E9EBF3] flex items-center justify-center relative">
                    <span id="user-name" className="font-semibold text-lg text-black">
                    {userInitials || 'НО'}
                    </span>
                    <span id="user-status" className="w-3 h-3 rounded-full border border-white bg-[#2B935D] -bottom-1 -right-1 absolute"></span>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <div id="navigation-link" className="flex gap-10 items-center *:text-black *:text-md *:font-regular *:duration-150 hover:*:text-[#243F8F]">
                    <Link href="/" className="navlink">
                        <span className={`cursor-pointer ${isActive('/') ? 'active' : ''}`}>Главная</span>
                    </Link>
                    <Link href="/emails" className="navlink">
                        <span className={`cursor-pointer ${isActive('/emails') ? 'active' : ''}`}>Почты</span>
                    </Link>
                    <Link href="/equipment" className="navlink">
                        <span className={`cursor-pointer ${isActive('/equipment') ? 'active' : ''}`}>Оборудование</span>
                    </Link>
                    <Link href="/lists" className="navlink">
                        <span className={`cursor-pointer ${isActive('/lists') ? 'active' : ''}`}>Списки</span>
                    </Link>
                    <Link href="/users" className="navlink">
                        <span className={`cursor-pointer ${isActive('/users') ? 'active' : ''}`}>Пользователи</span>
                    </Link>
                    <Link href="/reports" className="navlink">
                        <span className={`cursor-pointer ${isActive('/reports') ? 'active' : ''}`}>Репорты</span>
                    </Link>
                </div>
                <div id="service-status" className="flex items-center gap-3 text-black">
                    <span className="w-3 h-3 bg-[#2B935D] rounded-full flex items-center justify-center ">
                        <svg width="8" height="8" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.06416 0.418365C5.11442 0.472723 5.14265 0.546438 5.14265 0.6233C5.14265 0.700162 5.11442 0.773877 5.06416 0.828235L2.51753 3.58196C2.46726 3.6363 2.39909 3.66683 2.32801 3.66683C2.25692 3.66683 2.18875 3.6363 2.13848 3.58196L0.932183 2.27756C0.883353 2.2229 0.856333 2.14967 0.856944 2.07367C0.857554 1.99767 0.885747 1.92497 0.935449 1.87123C0.98515 1.81748 1.05238 1.787 1.12267 1.78634C1.19296 1.78568 1.26067 1.81489 1.31123 1.86769L2.32801 2.96716L4.68512 0.418365C4.73539 0.364023 4.80356 0.333496 4.87464 0.333496C4.94572 0.333496 5.01389 0.364023 5.06416 0.418365Z" className="fill-white"/>
                        </svg>
                    </span>
                    <span className="text-md">Подключение установлено</span>
                </div>
            </div>
        </div>
    </header>
  );
}
