import { useUser } from '@/components/UserContext';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
export default function HomePage() {
  const user = useUser();
  const router = useRouter();
  useEffect(() => {
    if (!user) {
        router.push('/login');
    }
}, [user, router]);


  // Проверяем, загружены ли данные пользователя
  if (!user) {
    return <div>Загрузка данных пользователя...</div>;
  }

  
  return (
    <>
    <Head>
      <title>Главная страница - WebConnect</title>
      <meta name="description" content="Добро пожаловать на главную страницу WebConnect" />
    </Head>
    <div className="w-full h-full">
        <div className="max-w-1320 py-8 flex flex-col  mx-auto">
            <div className="text-4xl text-[#343F52] font-semibold">
              Панель управления
            </div>  
        </div>
    </div>
    </>
  );
}
