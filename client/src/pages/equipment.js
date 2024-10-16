import { useUser } from '@/components/UserContext';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';

export default function EquipmentPage() {
  const user = useUser();
  const [selectedTab, setSelectedTab] = useState('allEquipment');


  // Проверяем, загружены ли данные пользователя
  if (!user) {
    return <div>Загрузка данных пользователя...</div>;
  }

  return (
    <>
      <Head>
        <title>Управление оборудованием - WebConnect</title>
        <meta name="description" content="Добро пожаловать на главную страницу WebConnect" />
      </Head>
    <div className="w-full h-full">
        <div className="max-w-1320 py-8 flex flex-col  mx-auto">
            <div className="text-4xl text-[#343F52] font-semibold">
              Управление оборудованием
            </div>  
            <div className="flex flex-col mt-6">
            <div id="navigation-mail" className="border border-[#E9EBF3] rounded-t-lg flex">
              <button
                onClick={() => setSelectedTab('allEquipment')}
                className={`emails-nav flex items-center justify-center px-8 py-3 ${selectedTab === 'allEquipment' ? 'active' : ''}`}
              >
                <span className={`text-sm text-light flex gap-3 relative ${selectedTab === 'allEquipment' ? 'active' : ''}`}>
                  Всё оборудование <span className="flex items-center justify-center rounded-md bg-[#243F8F] font-semibold w-5 h-5 text-white">0</span>
                </span>
              </button>

              <button
                onClick={() => setSelectedTab('onlineEquipment')}
                className={`emails-nav flex items-center justify-center px-8 py-3 ${selectedTab === 'onlineEquipment' ? 'active' : ''}`}
              >
                <span className={`text-sm text-light flex items-center gap-2 font-regular relative`}>
                <span className={`absolute h-2 w-2 rounded-full bg-[#2B935D] -left-4 ${selectedTab === 'onlineEquipment' ? 'animate-ping' : ''}`}></span>
                <span className="absolute h-2 w-2 rounded-full bg-[#2B935D] -left-4"></span>
                  В сети <span className="flex items-center justify-center rounded-md bg-[#243F8F] font-semibold w-5 h-5 text-white">0</span>
                </span>
              </button>
              <button
                onClick={() => setSelectedTab('offlineEquipment')}
                className={`emails-nav flex items-center justify-center px-8 py-3 ${selectedTab === 'offlineEquipment' ? 'active' : ''}`}
              >
                <span className={`text-sm text-light flex items-center gap-2 font-regular relative`}>
                  <span className={`absolute h-2 w-2 rounded-full bg-[#FF5A67] -left-4 ${selectedTab === 'offlineEquipment' ? 'animate-ping' : ''}`}></span>
                  <span className="absolute h-2 w-2 rounded-full bg-[#FF5A67] -left-4"></span>
                  Оффлайн <span className="flex items-center justify-center rounded-md bg-[#243F8F] font-semibold w-5 h-5 text-white">0</span>
                </span>
              </button>
            </div>
            </div>
        </div>
    </div>
    
    </>
  );
}
