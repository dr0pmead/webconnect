import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Checkbox, ButtonGroup, Tooltip, Pagination, Chip} from '@nextui-org/react';
import { toast } from 'react-toastify';
import { HighlightText } from '@/components/HighlightText';

const OnlineEquipmentTab = ({
    equipments,
    isAdmin,
    isTwofaEnabled,
    setSelectedEquipmentTab,
    fetchEquipments,
    searchTerm,
    selectedEquipments, 
    isAllChecked, 
    isIndeterminate, 
    handleSelectAll, 
    handleSelectEquipment
}) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [equipmentsPerPage, setEquipmentsPerPage] = useState(7);
  const [filteredEquipments, setFilteredEquipments] = useState(equipments);
  
  const openDeleteModal = (equipment) => {
    setEquipmentToDelete(equipment); // Сохраняем полный объект equipment
    setDeleteModalOpen(true); // Открываем модальное окно
  };

  const handleDelete = async () => {
    if (confirmText === equipmentToDelete.equipment) {
      setIsLoading(true);
      try {
        // Make the API request to delete the equipment here
        const response = await axios.delete(`http://localhost:5000/api/equipments/${equipmentToDelete._id}`);
        console.log('equipment deleted:', response.data);
        setDeleteModalOpen(false);
        setIsLoading(false);
        setConfirmText('');
        await fetchEquipments();
      } catch (error) {
        console.error('Error deleting equipment:', error.response ? error.response.data : error.message);
        setIsLoading(false);
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Пароль скопирован в буфер обмена!', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }).catch(err => {
      toast.error('Не удалось скопировать пароль.', {
            position: 'bottom-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    });
  };

    // Обновляем количество записей на странице в зависимости от разрешения экрана
    useEffect(() => {
        const handleResize = () => {
          if (window.innerHeight <= 800) {
            setEquipmentsPerPage(5); // При небольшой высоте показываем 5 записей
          } else {
            setEquipmentsPerPage(7); // При большей высоте показываем 7 записей
          }
        };
      
        window.addEventListener('resize', handleResize);
        handleResize(); // Устанавливаем изначально в зависимости от текущей высоты
      
        return () => window.removeEventListener('resize', handleResize);
      }, []);
    
      // Обрабатываем фильтрацию по поисковому запросу
      useEffect(() => {
        if (searchTerm) {
            const filtered = equipments.filter((equipment) => {
                const nameMatch = equipment.name && equipment.name.toLowerCase().includes(searchTerm.toLowerCase());
                const ownerMatch = equipment.owner && equipment.owner.toLowerCase().includes(searchTerm.toLowerCase());
                
                // Приведение anyDesk к строке
                const anyDeskMatch = equipment.anyDesk && String(equipment.anyDesk).includes(searchTerm);
                
                // Приведение teamViewer к строке
                const teamViewerMatch = equipment.teamViewer && String(equipment.teamViewer).includes(searchTerm);
                
                // Приведение ipAddress.main к строке
                const ipAddressMatch = equipment.ipAddress && equipment.ipAddress.main && String(equipment.ipAddress.main).includes(searchTerm);
    
                return nameMatch || ownerMatch || anyDeskMatch || teamViewerMatch || ipAddressMatch;
            });
            setFilteredEquipments(filtered);
        } else {
            setFilteredEquipments(equipments);
        }
    }, [equipments, searchTerm]);
    
    
    // Рассчитываем общее количество страниц
    const totalPages = Math.ceil(filteredEquipments.length / equipmentsPerPage);

    // Получаем текущие записи для отображения
    const indexOfLastEquipment = currentPage * equipmentsPerPage;
    const indexOfFirstEquipment = indexOfLastEquipment - equipmentsPerPage;
    const currentEquipments = filteredEquipments.slice(indexOfFirstEquipment, indexOfLastEquipment);

    // Меняем страницу
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };    

    

  return (
    <motion.div
      key="allMails"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <table className="table-auto w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#E9EBF3] text-sm text-[#343F52] font-medium">
            {isAdmin && (
            <th className="py-2 w-4">
              <div className="flex items-center justify-center">
                <Checkbox
                
                isSelected={isAllChecked}
                isIndeterminate={isIndeterminate}
                onChange={handleSelectAll}
                />
                </div>
            </th>
            )}
            <th className="px-6 py-1 w-1/6">Название</th>
            <th className="px-6 py-1 w-1/2">Пользователь</th>
            <th className="px-6 py-1 w-1/6">AnyDesk</th>
            <th className="px-6 py-1 w-1/6">TeamViewer</th>
            <th className="px-6 py-1 w-1/6">IP Адрес</th>
            <th className="px-6 py-1 w-1/6">Действия</th>
          </tr>
        </thead>
        <tbody>
        {currentEquipments
            .filter((equipment) => equipment.online) // Фильтруем только те, которые offline
            .map((equipment, index) => (
              <tr   
                key={equipment._id}
                className={`border-b font-medium text-[#343F52] ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50' // Чётные строки белые, нечётные - серые
                }`}
              >
                {isAdmin && (
              <td className="py-2">
                <div className="flex items-center justify-center">
                <Checkbox
                  isSelected={selectedEquipments.includes(equipment._id)}
                  onChange={() => handleSelectEquipment(equipment._id)}
                />
                </div>
              </td>
               )}
              <td className="px-6 py-1">
                
                  {equipment.online ? (
                    <div className="flex gap-4 items-center justify-start">
                        <span className="h-2 w-2 rounded-full bg-[#2B935D]"></span>
                        <HighlightText text={equipment.name} highlight={searchTerm} />
                    </div>
                  ) : (
                    <div className="flex gap-4">
                    <div className="flex gap-4 items-center justify-start">
                        <span className="h-2 w-2 rounded-full bg-[#FF5A67]"></span>
                        <HighlightText text={equipment.name} highlight={searchTerm} />
                    </div>
                    </div>
                  )}
            </td>
            <td className="px-6 py-1">
            <HighlightText text={equipment.owner} highlight={searchTerm} />
            </td>
            <Tooltip 
            content="Скопировать"
            delay={0}
            closeDelay={0}
            showArrow={true}
            motionProps={{
                variants: {
                exit: {
                    opacity: 0,
                    transition: {
                    duration: 0.1,
                    ease: "easeIn",
                    }
                },
                enter: {
                    opacity: 1,
                    transition: {
                    duration: 0.15,
                    ease: "easeOut",
                    }
                },
                },
            }}
            >
            <td className="px-6 py-1 cursor-pointer " onClick={() => handleCopyToClipboard(equipment.anyDesk)}>
             <HighlightText text={equipment.anyDesk} highlight={searchTerm} />
            </td>
            </Tooltip>
            <Tooltip 
            content="Скопировать"
            delay={0}
            closeDelay={0}
            showArrow={true}
            motionProps={{
                variants: {
                exit: {
                    opacity: 0,
                    transition: {
                    duration: 0.1,
                    ease: "easeIn",
                    }
                },
                enter: {
                    opacity: 1,
                    transition: {
                    duration: 0.15,
                    ease: "easeOut",
                    }
                },
                },
            }}
            >
            <td className="px-6 py-1 cursor-pointer"  onClick={() => handleCopyToClipboard(equipment.teamViewer)}>
            <HighlightText text={equipment.teamViewer} highlight={searchTerm}/>
            </td>
            </Tooltip>
            <Tooltip 
            content="Скопировать"
            delay={0}
            closeDelay={0}
            showArrow={true}
            motionProps={{
                variants: {
                exit: {
                    opacity: 0,
                    transition: {
                    duration: 0.1,
                    ease: "easeIn",
                    }
                },
                enter: {
                    opacity: 1,
                    transition: {
                    duration: 0.15,
                    ease: "easeOut",
                    }
                },
                },
            }}
            >
            <td className="px-6 py-1 cursor-pointer" onClick={() => handleCopyToClipboard(equipment.ipAddress.main)}>
            <HighlightText text={equipment.ipAddress.main} highlight={searchTerm} />
            </td>
            </Tooltip>
              <td className="px-6 py-1 ">
                <div className="flex justify-between items-center ">
                  <ButtonGroup size="sm" isDisabled={!isAdmin && isTwofaEnabled}>
                  <Button className="*:fill-[#343F52] hover:bg-[#e5e7eb] bg-transparent border rounded-l-md max-h-[30px] " onClick={() => setSelectedEquipmentTab(equipment)}> 
                        <svg width="18" height="20" viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg" >
                            <path d="M8.2502 20L7.8502 16.8C7.63353 16.7167 7.42953 16.6167 7.2382 16.5C7.04686 16.3833 6.8592 16.2583 6.6752 16.125L3.7002 17.375L0.950195 12.625L3.5252 10.675C3.50853 10.5583 3.5002 10.446 3.5002 10.338V9.663C3.5002 9.55433 3.50853 9.44167 3.5252 9.325L0.950195 7.375L3.7002 2.625L6.6752 3.875C6.85853 3.74167 7.0502 3.61667 7.2502 3.5C7.4502 3.38333 7.6502 3.28333 7.8502 3.2L8.2502 0H13.7502L14.1502 3.2C14.3669 3.28333 14.5712 3.38333 14.7632 3.5C14.9552 3.61667 15.1425 3.74167 15.3252 3.875L18.3002 2.625L21.0502 7.375L18.4752 9.325C18.4919 9.44167 18.5002 9.55433 18.5002 9.663V10.337C18.5002 10.4457 18.4835 10.5583 18.4502 10.675L21.0252 12.625L18.2752 17.375L15.3252 16.125C15.1419 16.2583 14.9502 16.3833 14.7502 16.5C14.5502 16.6167 14.3502 16.7167 14.1502 16.8L13.7502 20H8.2502ZM11.0502 13.5C12.0169 13.5 12.8419 13.1583 13.5252 12.475C14.2085 11.7917 14.5502 10.9667 14.5502 10C14.5502 9.03333 14.2085 8.20833 13.5252 7.525C12.8419 6.84167 12.0169 6.5 11.0502 6.5C10.0669 6.5 9.23753 6.84167 8.5622 7.525C7.88686 8.20833 7.54953 9.03333 7.5502 10C7.55086 10.9667 7.88853 11.7917 8.5632 12.475C9.23786 13.1583 10.0669 13.5 11.0502 13.5Z"/>
                        </svg>
                    </Button>

                    <Button onClick={() => openDeleteModal(equipment)} className="  max-h-[30px] border border-l-0 bg-transparent hover:bg-[#e5e7eb] *:fill-[#343F52] "> 
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.0001 6C20.255 6.00028 20.5001 6.09788 20.6855 6.27285C20.8708 6.44782 20.9823 6.68695 20.9973 6.94139C21.0122 7.19584 20.9294 7.44638 20.7658 7.64183C20.6023 7.83729 20.3702 7.9629 20.1171 7.993L20.0001 8H19.9191L19.0001 19C19.0002 19.7652 18.7078 20.5015 18.1828 21.0583C17.6579 21.615 16.94 21.9501 16.1761 21.995L16.0001 22H8.00011C6.40211 22 5.09611 20.751 5.00811 19.25L5.00311 19.083L4.08011 8H4.00011C3.74523 7.99972 3.50008 7.90212 3.31474 7.72715C3.12941 7.55218 3.01788 7.31305 3.00294 7.05861C2.988 6.80416 3.07079 6.55362 3.23438 6.35817C3.39797 6.16271 3.63002 6.0371 3.88311 6.007L4.00011 6H20.0001ZM10.5111 11.14C10.3016 11.0153 10.0537 10.9714 9.81412 11.0166C9.57452 11.0619 9.3597 11.1931 9.21006 11.3856C9.06042 11.5781 8.98628 11.8187 9.00157 12.062C9.01687 12.3054 9.12055 12.5347 9.29311 12.707L10.5851 14L9.29311 15.293L9.21011 15.387C9.0547 15.588 8.98162 15.8406 9.00571 16.0935C9.02981 16.3464 9.14927 16.5807 9.33983 16.7488C9.5304 16.9168 9.77778 17.006 10.0317 16.9982C10.2857 16.9905 10.5272 16.8863 10.7071 16.707L12.0001 15.415L13.2931 16.707L13.3871 16.79C13.5881 16.9454 13.8407 17.0185 14.0936 16.9944C14.3466 16.9703 14.5808 16.8508 14.7489 16.6603C14.9169 16.4697 15.0061 16.2223 14.9983 15.9684C14.9906 15.7144 14.8865 15.473 14.7071 15.293L13.4151 14L14.7071 12.707L14.7901 12.613C14.9455 12.412 15.0186 12.1594 14.9945 11.9065C14.9704 11.6536 14.851 11.4193 14.6604 11.2512C14.4698 11.0832 14.2224 10.994 13.9685 11.0018C13.7145 11.0095 13.4731 11.1137 13.2931 11.293L12.0001 12.585L10.7071 11.293L10.6131 11.21L10.5111 11.14ZM14.0001 2C14.5305 2 15.0393 2.21071 15.4143 2.58579C15.7894 2.96086 16.0001 3.46957 16.0001 4C15.9998 4.25488 15.9022 4.50003 15.7273 4.68537C15.5523 4.8707 15.3132 4.98223 15.0587 4.99717C14.8043 5.01211 14.5537 4.92933 14.3583 4.76574C14.1628 4.60214 14.0372 4.3701 14.0071 4.117L14.0001 4H10.0001L9.99311 4.117C9.96301 4.3701 9.8374 4.60214 9.64195 4.76574C9.44649 4.92933 9.19595 5.01211 8.94151 4.99717C8.68707 4.98223 8.44793 4.8707 8.27296 4.68537C8.09799 4.50003 8.0004 4.25488 8.00011 4C7.99995 3.49542 8.19052 3.00943 8.53361 2.63945C8.8767 2.26947 9.34696 2.04284 9.85011 2.005L10.0001 2H14.0001Z"/>
                        </svg>
                    </Button>
                  </ButtonGroup>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-center">
        {filteredEquipments.length >= equipmentsPerPage && (
            <Pagination
            isCompact
            showControls
            total={totalPages}
            initialPage={currentPage}
            onChange={(page) => handlePageChange(page)} // Используем onChange
            />
        )}
        </div>

        {/* <Modal size="lg" isOpen={deleteModalOpen} onClose={() => {
            setDeleteModalOpen(false);
            setConfirmText(''); // Сбрасываем поле
            }} closeButton backdrop="blur"
            motionProps={{
                variants: {
                enter: {
                    y: 0,
                    opacity: 1,
                    transition: {
                    duration: 0.3,
                    ease: "easeOut",
                    },
                },
                exit: {
                    y: -20,
                    opacity: 0,
                    transition: {
                    duration: 0.2,
                    ease: "easeIn",
                    },
                },
                },
            }} 
            >
            <ModalContent>
                <ModalHeader>
                <div>Удаление</div>
                </ModalHeader>
                <ModalBody>
                <div>Для удаления почты введите "<strong>{emailToDelete.email}</strong>" ниже и нажмите подтвердить.</div>
                <Input
                    clearable
                    fullWidth
                    bordered
                    size="lg"
                    placeholder={`Введите "${emailToDelete.email}" для подтверждения`}
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                />
                </ModalBody>
                <ModalFooter>
                <Button flat color="error" onClick={() => {
                    setDeleteModalOpen(false);
                    setConfirmText(''); // Сбрасываем поле
                }}>
                    Закрыть
                </Button>
                <Button 
                    auto 
                    isDisabled={confirmText !== emailToDelete.email} // Кнопка будет отключена, если текст не совпадает с email
                    className="bg-[#FF5A67] text-white"
                    onClick={handleDelete}
                    isLoading={isLoading}
                >
                    Подтвердить
                </Button>
                </ModalFooter>
            </ModalContent>
            </Modal> */}
    </motion.div>

    
  );
};

export default OnlineEquipmentTab;