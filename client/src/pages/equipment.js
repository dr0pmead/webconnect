import { useUser } from '@/components/UserContext';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchEquipment, useSocketEquipmentUpdates } from '@/components/pages/equipment/fetchEquipment';
import AllEquipmentTab from '@/components/pages/equipment/AllEquipmentTab';
import OfflineEquipmentTab from '@/components/pages/equipment/OfflineEquipmentTab';
import OnlineEquipmentTab from '@/components/pages/equipment/OnlineEquipmentTab';
import SelectedEquipmentForm from '@/components/pages/equipment/selectedEquipmentForm';
import { Spinner, Input, Button, Modal, ModalHeader, ModalFooter, ModalBody, ModalContent } from "@nextui-org/react";

export default function EquipmentPage() {
  const user = useUser();
  const isAdmin = user.admin === true;
  const isTwofaEnabled = user.twofaEnable === true;
  const [selectedTab, setSelectedTab] = useState('allEquipment');
  const [isLoading, setIsLoading] = useState(false);
  const [equipments, setEquipment] = useState([]);
  const [filteredEquipments, setFilteredEquipments] = useState([]); // Состояние для фильтрованных email
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedEquipments, setSelectedEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [isAllChecked, setIsAllChecked] = useState(false);

  if (!user) {
    return <div>Загрузка данных пользователя...</div>;
  }

  useEffect(() => {
    fetchEquipment(setEquipment, setIsLoading);
  }, []);

  // Listen for real-time updates
  useSocketEquipmentUpdates(setEquipment);

  useEffect(() => {
    if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = equipments.filter((equipment) => {
            const nameMatch = equipment.name.toLowerCase().includes(lowerCaseSearchTerm);
            const ownerMatch = equipment.owner.toLowerCase().includes(lowerCaseSearchTerm);
            
            // Приведение anyDesk к строке
            const anyDeskMatch = equipment.anyDesk && String(equipment.anyDesk).includes(searchTerm);
            
            // Приведение teamViewer к строке
            const teamViewerMatch = equipment.teamViewer && String(equipment.teamViewer).includes(searchTerm);
            
            // Приведение ipAddress.main к строке
            const ipAddressMatch = equipment.ipAddress.main && String(equipment.ipAddress.main).includes(searchTerm);

            return nameMatch || ownerMatch || anyDeskMatch || teamViewerMatch || ipAddressMatch;
        });
        setFilteredEquipments(filtered);
    } else {
        setFilteredEquipments(equipments);
    }
}, [equipments, searchTerm]);

  
  

  const handleSearch = (e) => {
    setSearchTerm(e.target.value); // Обновляем значение searchTerm
  };

  const handleSelectEquipmentTab = (equipment) => {
    setSelectedTab('selectedEquipment');
    setSelectedEquipment(equipment);
  };

  const setSelectedEquipmentTab = (equipment) => {
    setSelectedEquipment(equipment);
    setSelectedTab('selectedEquipment');
  };
  
  const handleSelectAll = () => {
    if (isAllChecked) {
      setSelectedEquipments([]);
      setIsAllChecked(false);
      setIsIndeterminate(false);
    } else {
      const allEquipmentIds = equipments.map((equipment) => equipment._id);
      setSelectedEquipments(allEquipmentIds);
      setIsAllChecked(true);
      setIsIndeterminate(false);
    }
  };

  const handleSelectEquipment = (equipmentId) => {
    const alreadySelected = selectedEquipments.includes(equipmentId);

    if (alreadySelected) {
      const newSelected = selectedEquipments.filter((id) => id !== equipmentId);
      setSelectedEquipments(newSelected);
    } else {
      setSelectedEquipments([...selectedEquipments, equipmentId]);
    }

    setIsAllChecked(equipments.length === selectedEquipments.length + 1);
    setIsIndeterminate(selectedEquipments.length > 0 && selectedEquipments.length < equipments.length);
  };

  const onlineCount = equipments.filter((equipment) => equipment.online === true).length;
  const offlineCount = equipments.filter((equipment) => equipment.online === false).length;


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
                onClick={() => (setSelectedTab('allEquipment'), setSelectedEquipment(null))}
                className={`emails-nav flex items-center justify-center px-8 py-3 ${selectedTab === 'allEquipment' ? 'active' : ''}`}
              >
                <span className={`text-sm text-light flex gap-3 relative ${selectedTab === 'allEquipment' ? 'active' : ''}`}>
                  Всё оборудование <span className="flex items-center justify-center rounded-md bg-[#243F8F] font-semibold w-5 h-5 text-white">{equipments.length}</span>
                </span>
              </button>

              <button
                onClick={() => (setSelectedTab('onlineEquipment'), setSelectedEquipment(null))}
                className={`emails-nav flex items-center justify-center px-8 py-3 ${selectedTab === 'onlineEquipment' ? 'active' : ''}`}
              >
                <span className={`text-sm text-light flex items-center gap-2 font-regular relative`}>
                <span className={`absolute h-2 w-2 rounded-full bg-[#2B935D] -left-4 ${selectedTab === 'onlineEquipment' ? 'animate-ping' : ''}`}></span>
                <span className="absolute h-2 w-2 rounded-full bg-[#2B935D] -left-4"></span>
                  В сети <span className="flex items-center justify-center rounded-md bg-[#243F8F] font-semibold w-5 h-5 text-white">{onlineCount}</span>
                </span>
              </button>
              <button
                onClick={() => (setSelectedTab('offlineEquipment'), setSelectedEquipment(null))}
                className={`emails-nav flex items-center justify-center px-8 py-3 ${selectedTab === 'offlineEquipment' ? 'active' : ''}`}
              >
                <span className={`text-sm text-light flex items-center gap-2 font-regular relative`}>
                  <span className={`absolute h-2 w-2 rounded-full bg-[#FF5A67] -left-4 ${selectedTab === 'offlineEquipment' ? 'animate-ping' : ''}`}></span>
                  <span className="absolute h-2 w-2 rounded-full bg-[#FF5A67] -left-4"></span>
                  Оффлайн <span className="flex items-center justify-center rounded-md bg-[#243F8F] font-semibold w-5 h-5 text-white">{offlineCount}</span>
                </span>
              </button>
              
              {selectedEquipment && (
                <button
                  onClick={() => (setSelectedTab('selectedEquipment'), setSelectedEquipment(null))}
                  className={`emails-nav flex items-center justify-center px-8 py-3 ${
                    selectedTab === 'selectedEquipment' ? 'active' : ''
                  }`}
                >
                  <span className={`text-sm text-light flex items-center gap-2 font-regular ${selectedTab === 'selectedEquipment' ? 'text-[#243F8F]' : ''}`}>
                    {selectedEquipment.name}
                  </span>
                </button>
              )}
              
              
            </div>
            <motion.div
              id="template-mail"
              className="p-8 border border-[#E9EBF3] border-t-0 rounded-b-lg"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              
              {(selectedTab === 'allEquipment' || selectedTab === 'onlineEquipment' || selectedTab === 'offlineEquipment') && (
                <div className="w-full flex items-center justify-start mb-4 gap-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Поиск"
                        labelPlacement="outside"
                        value={searchTerm} // Привязка к состоянию
                        onChange={handleSearch} // Обработчик изменения
                        endContent={<img src="/assets/img/octicon_search-16.svg" alt="" />}
                      />
                    </div>
                                    
                  {selectedEquipments.length > 0 && isAdmin && (
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ x: -10, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button color="default" variant="flat" onClick={() => handleOpenDeleteModal(selectedEquipments)}>
                        Удалить
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
              
              {isLoading ? (
                <div className="flex items-center justify-center p-24">
                  <Spinner size="lg" />
                </div>
              ) : (
                selectedTab === 'allEquipment' ? (
                  filteredEquipments.length > 0 ? ( // Проверяем, есть ли email'ы
                    <AllEquipmentTab 
                    equipments={filteredEquipments} 
                    isAdmin={isAdmin}
                    isTwofaEnabled={isTwofaEnabled} 
                    searchTerm={searchTerm}
                    handleSelectEquipmentTab={handleSelectEquipmentTab}
                    setSelectedEquipmentTab={setSelectedEquipmentTab}
                    selectedEquipments={selectedEquipments}
                    fetchEquipment={() => fetchEquipment(setEquipment, setIsLoading)}
                    isAllChecked={isAllChecked}
                    isIndeterminate={isIndeterminate}
                    handleSelectAll={handleSelectAll}
                    handleSelectEquipment={handleSelectEquipment}
                    />
                  ) : (
                    // Контейнер с картинкой и сообщением об отсутствии записей
                    <div className="flex flex-col items-center justify-center p-24">
                      <img src="/assets/img/no-data.svg" alt="No emails" className="w-60 h-60 pointer-events-none" />
                    </div>
                  )
                ) : selectedTab === 'onlineEquipment' ? (
                  filteredEquipments.length > 0 ? (
                  <OnlineEquipmentTab 
                  equipment={equipments} 
                  fetchEquipment={() => fetchEquipment(setEquipment, setIsLoading)} />
                ) : (
                  // Контейнер с картинкой и сообщением об отсутствии записей
                  <div className="flex flex-col items-center justify-center p-24">
                    <img src="/assets/img/no-data.svg" alt="No emails" className="w-60 h-60 pointer-events-none" />
                  </div>
                )
                ) : selectedTab === 'offlineEquipment' && selectedEquipment ? (
                  filteredEquipments.length > 0 ? (
                  <OfflineEquipmentTab 
                  equipment={equipments} 
                  fetchEquipment={() => fetchEquipment(setEquipment, setIsLoading)} />
                ) : (
                  // Контейнер с картинкой и сообщением об отсутствии записей
                  <div className="flex flex-col items-center justify-center p-24">
                    <img src="/assets/img/no-data.svg" alt="No emails" className="w-60 h-60 pointer-events-none" />
                  </div>
                )
                ) : selectedTab === 'selectEquipment' && selectedEquipment ? (
                  <SelectedEquipmentForm selectedEquipments={selectedEquipments} fetchEquipment={() => fetchEquipment(setEquipment, setIsLoading)} />
                ) : null
              )}
            </motion.div>
            </div>
        </div>
    </div>
    
    </>
  );
}
