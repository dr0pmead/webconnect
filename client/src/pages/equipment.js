import { useUser } from '@/components/UserContext';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchEquipment, useSocketEquipmentUpdates } from '@/components/pages/equipment/fetchEquipment';
import AllEquipmentTab from '@/components/pages/equipment/AllEquipmentTab';
import OnlineEquipmentTab from '@/components/pages/equipment/OnlineEquipmentTab';
import SelectedEquipmentForm from '@/components/pages/equipment/selectedEquipmentForm';
import { Spinner, Input, Button, Modal, ModalHeader, ModalFooter, ModalBody, ModalContent, select } from "@nextui-org/react";
import OfflineEquipmentTab from '@/components/pages/equipment/OfflineEquipmentTab';
import { saveAs } from 'file-saver';

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
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [object, setSelectetObject] = useState(null)
  
  if (!user) {
    return <div>Загрузка данных пользователя...</div>;
  }

  useEffect(() => {
    fetchEquipment(setEquipment, setIsLoading);
  }, []);

  const handleSaveQRCode = () => {
    const link = selectedEquipment.qrcode; // QR-код в формате data URL
    const fileName = `QRCode_${selectedEquipment.name}.png`;

    saveAs(link, fileName);
  };

  

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

  const handleOpenQrModal = (equipment) => {
    setSelectetObject(equipment);
    setQrModalOpen(true);
  }

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
                  <span className={`text-sm font-medium flex items-center gap-2 font-regular ${selectedTab === 'selectedEquipment' ? 'text-[#243F8F]' : ''}`}>
                    {selectedEquipment.type === 'Компьютер' ? ( 
                      <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3V10H2V3H12ZM2 1C0.896875 1 0 1.89688 0 3V10C0 11.1031 0.896875 12 2 12H5.66563L5.33125 13H3C2.44687 13 2 13.4469 2 14C2 14.5531 2.44687 15 3 15H11C11.5531 15 12 14.5531 12 14C12 13.4469 11.5531 13 11 13H8.66562L8.33125 12H12C13.1031 12 14 11.1031 14 10V3C14 1.89688 13.1031 1 12 1H2ZM16.5 1C15.6719 1 15 1.67188 15 2.5V13.5C15 14.3281 15.6719 15 16.5 15H18.5C19.3281 15 20 14.3281 20 13.5V2.5C20 1.67188 19.3281 1 18.5 1H16.5ZM17 3H18C18.275 3 18.5 3.225 18.5 3.5C18.5 3.775 18.275 4 18 4H17C16.725 4 16.5 3.775 16.5 3.5C16.5 3.225 16.725 3 17 3ZM16.5 5.5C16.5 5.225 16.725 5 17 5H18C18.275 5 18.5 5.225 18.5 5.5C18.5 5.775 18.275 6 18 6H17C16.725 6 16.5 5.775 16.5 5.5ZM17.5 10.5C17.7652 10.5 18.0196 10.6054 18.2071 10.7929C18.3946 10.9804 18.5 11.2348 18.5 11.5C18.5 11.7652 18.3946 12.0196 18.2071 12.2071C18.0196 12.3946 17.7652 12.5 17.5 12.5C17.2348 12.5 16.9804 12.3946 16.7929 12.2071C16.6054 12.0196 16.5 11.7652 16.5 11.5C16.5 11.2348 16.6054 10.9804 16.7929 10.7929C16.9804 10.6054 17.2348 10.5 17.5 10.5Z" fill="#243F8F"/>
                      </svg>
                    ) : ( 
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_844_31)">
                    <path d="M11.905 13C11.73 13.45 11.435 13.75 11.1 13.75H6.87C6.53 13.75 6.24 13.45 6.065 13H0.5V13.875C0.525591 14.1956 0.676273 14.4934 0.919506 14.7038C1.16274 14.9143 1.479 15.0207 1.8 15H16.2C16.521 15.0207 16.8373 14.9143 17.0805 14.7038C17.3237 14.4934 17.4744 14.1956 17.5 13.875V13H11.905Z" fill="#243F8F"/>
                    <path d="M3.50003 5H14.5V12H16V3.785C16.0041 3.58162 15.9274 3.38491 15.7869 3.23782C15.6464 3.09074 15.4534 3.00524 15.25 3H2.75003C2.54668 3.00524 2.35366 3.09074 2.21314 3.23782C2.07261 3.38491 1.996 3.58162 2.00003 3.785V12H3.50003V5Z" fill="#243F8F"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_844_31">
                    <rect width="18" height="18" fill="white"/>
                    </clipPath>
                    </defs>
                    </svg>
                    )}
                    
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
                    handleOpenQrModal={handleOpenQrModal}
                    setQrModalOpen={setQrModalOpen}
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
                    equipments={filteredEquipments} 
                    isAdmin={isAdmin}
                    isTwofaEnabled={isTwofaEnabled} 
                    searchTerm={searchTerm}
                    handleSelectEquipmentTab={handleSelectEquipmentTab}
                    setSelectedEquipmentTab={setSelectedEquipmentTab}
                    selectedEquipments={selectedEquipments}
                    handleOpenQrModal={handleOpenQrModal}
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
                ) : selectedTab === 'offlineEquipment' ? (
                  filteredEquipments.length > 0 ? (
                    <OfflineEquipmentTab
                    equipments={filteredEquipments} 
                    isAdmin={isAdmin}
                    isTwofaEnabled={isTwofaEnabled} 
                    searchTerm={searchTerm}
                    handleSelectEquipmentTab={handleSelectEquipmentTab}
                    setSelectedEquipmentTab={setSelectedEquipmentTab}
                    selectedEquipments={selectedEquipments}
                    handleOpenQrModal={handleOpenQrModal}
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
                ) : selectedTab === 'selectedEquipment' && selectedEquipment ? (
                  <SelectedEquipmentForm selectedEquipment={selectedEquipment} setSelectedEquipment={setSelectedEquipment} isAdmin={isAdmin} fetchEquipment={() => fetchEquipment(setEquipment, setIsLoading)} />
                ) : null
              )}
            </motion.div>
            </div>
        </div>
    </div>
    
    <Modal 
        size="sm" 
        isOpen={qrModalOpen} 
        onClose={() => setQrModalOpen(false)} 
        closeButton 
        backdrop="blur"
        motionProps={{
          variants: {
            enter: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
            exit: { y: -20, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
          },
        }} 
      >
        <ModalContent>
          <ModalHeader>
          {object && object.name ? (
            <div>QR-код для {object.name }</div>
          ) : (
            <span>Неизвестно</span>
          )}
          </ModalHeader>
          <ModalBody className="flex items-center justify-center">
          {object && object.qrcode ? (
            <img src={object.qrcode} alt="QR Code" className="w-80 h-80" />
          ) : ( <span>Нет значения</span> ) }
          </ModalBody>
          <ModalFooter>
            <Button flat color="primary" className="flex w-full bg-[#243F8F]" onClick={handleSaveQRCode}>
              Сохранить QR-код
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </>
  );
}
