import React, { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Progress, Chip, Tooltip } from '@nextui-org/react';
import { toast } from 'react-toastify';
import axios from 'axios';

const SelectedEquipmentForm = ({ selectedEquipment, isAdmin, setSelectedEquipment }) => {

    const [inventoryNumber, setInventoryNumber] = useState(selectedEquipment.inventoryNumber || '');
    const [isChanged, setIsChanged] = useState(false); // Состояние для отслеживания изменений

      // Отслеживаем изменения в поле инвентарного номера
    const handleInventoryChange = (e) => {
        setInventoryNumber(e.target.value);
        setIsChanged(true); // Устанавливаем, что поле изменено
    };

    // Обработчик нажатия на кнопку "Сохранить"
    const handleSaveClick = async () => {
   
      try {
        const response = await axios.put('http://localhost:5000/api/equipment/edit', {
          _id: selectedEquipment._id,
          inventoryNumber: inventoryNumber
        });
    
        if (response.status === 200) {
          // Успешное обновление на сервере
          toast.success('Инвентарный номер успешно добавлен!', {
            position: 'bottom-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          setIsChanged(false);
        } else {
          // Обработка ошибок
          toast.error('Ошибка сервера. Не удалось сохранить запись.', {
            position: 'bottom-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          console.error(response.error)
        }
      } catch (error) {
        toast.error('Ошибка при обращении к серверу.', {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.error(error)
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

    

  return (
    <motion.div
      key="selectedEquipment"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className=" mb-4 flex items-start w-full justify-between">
        <div className="flex flex-col gap-1">
        <span className="flex items-center text-lg font-semibold  gap-4">Информация о компьютере: {selectedEquipment.name}
        {selectedEquipment.online ? (
          <Chip color="success" variant="dot">
            В сети
          </Chip>
        ) : (
          <Chip color="danger" variant="dot">
            Не в сети
          </Chip>
        )}
        </span>
        <span>
            {selectedEquipment.owner} | {selectedEquipment.division} : {selectedEquipment.department}
        </span>
        </div>
        {selectedEquipment.inventoryNumber === 'Неизвестно' ? (
         <div className="flex items-center gap-2">
         {isChanged && (
           <motion.div
           initial={{ x: 10, opacity: 0 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ x: 10, opacity: 1 }}
           transition={{ duration: 0.3 }}
           onClick={handleSaveClick}
           className="bg-[#243F8F] text-white px-3 py-1 rounded-md hover:bg-[#243F8F]/85 duration-150 text-sm cursor-pointer"
           >
             Сохранить
           </motion.div>
         )}
         <input
             type="text"
             placeholder="Инвентарный номер"
             value={inventoryNumber}
             onChange={handleInventoryChange} // Обработчик изменения значения
             disabled={!isAdmin}
             className="text-sm border w-full rounded-lg px-3 max-h-[30px] py-2 text-[#343F52] outline-none duration-150"
         />
         {/* Кнопка "Сохранить" появляется, только если есть изменения */}
         </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">#{inventoryNumber}</span>
          </div>
        )}
       

      </div>

      <div className="grid grid-cols-3 gap-4">
        {selectedEquipment.disks && selectedEquipment.disks.length > 0 ? (
            selectedEquipment.disks.map((disk, index) => {
            const usedSpace = Math.round(disk.Size) - Math.round(disk.FreeSpace);

            // Определяем цвет индикатора в зависимости от свободного места
            const isLowSpace = Math.round(disk.FreeSpace) < 20;
            return (
                <div
                key={disk._id || index} // Используем _id, если он есть, иначе индекс
                className="border p-4 rounded-lg bg-[#E9EBF3] w-full flex items-center gap-2 relative"
                >
                <img src="/assets/img/proicons_hard-drive.svg" alt="hard-drive" className="w-16 h-16 opacity-75"/>

                <span className={`absolute -right-2 -top-2 w-4 h-4 bg-[#FFDE5A] rounded-full ${!isLowSpace ? 'hidden' : ''}`}></span>
                <span className={`absolute -right-2 -top-2 w-4 h-4 bg-[#FFDE5A] rounded-full animate-ping ${!isLowSpace ? 'hidden' : ''}`}></span>

                <div className="w-full">
                    <h3 className="text-sm font-semibold">{disk.Name}</h3>

                    <div className="flex justify-between mb-1 text-sm text-gray-600">
                    <span>
                        {Math.round(disk.FreeSpace)} GB свободно из {Math.round(disk.Size)} GB
                    </span>
                    </div>

                    <Progress
                    size="sm"
                    aria-label="Прогресс"
                    value={usedSpace}
                    maxValue={Math.round(disk.Size)}
                    classNames={{
                        track: 'drop-shadow-md border border-default h-[8px]',
                        indicator: isLowSpace ? "bg-[#FF5A67]" : "bg-[#243F8F]",
                        label: 'tracking-wider font-medium text-default-600',
                        value: 'text-foreground/60',
                    }}
                    />
                </div>
                </div>
            );
            })
        ) : (
            <p>Нет информации о дисках</p>
        )}
        </div>

      <div className="flex w-full gap-4 mt-4">
      <Tooltip 
      content="Подключиться"
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
        <a href={`anydesk://${selectedEquipment.anyDesk}`} className="border p-4 rounded-lg bg-[#FC4136] w-full flex items-center gap-4 duration-150 text-white hover:opacity-hover">
            <img src="/assets/img/simple-icons_anydesk.svg" alt="anydesk" className="w-14 h-14"/>
            <div className="flex flex-col justify-start">
                <span className="text-sm">AnyDesk</span>
                <span className="font-bold text-lg">{selectedEquipment.anyDesk}</span>
            </div>
        </a>
        </Tooltip>
        <Tooltip 
      content="Скопировать адрес"
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
        <div onClick={() => handleCopyToClipboard(selectedEquipment.teamViewer)} className="border p-4 rounded-lg bg-[#0669CC] w-full flex items-center gap-4 text-white cursor-pointer duration-150 hover:opacity-hover">
            <img src="/assets/img/mdi_teamviewer.svg" alt="teamviewer" className="w-14 h-14"/>
            <div className="flex flex-col justify-start">
                <span className="text-sm">TeamViewer</span>
                <span className="font-bold text-lg">{selectedEquipment.teamViewer}</span>
            </div>
        </div>
        </Tooltip>
        <Tooltip 
      content="Скопировать адрес"
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
        <a href={`rms://${selectedEquipment.ipAddress.main}`} onClick={() => handleCopyToClipboard(selectedEquipment.ipAddress.main)} className="border p-4 rounded-lg bg-[#25C03D] w-full flex items-center gap-4 duration-150 text-white hover:opacity-hover">
            <img src="/assets/img/mdi_ip.svg" alt="anydesk" className="w-14 h-14"/>
            <div className="flex flex-col justify-start">
                <span className="text-sm">IP Адрес</span>
                <span className="font-bold text-lg">{selectedEquipment.ipAddress.main}</span>
            </div>
        </a>
        </Tooltip>
      </div>
      <div className="flex w-full mt-4 flex-col gap-4">
        <div className="flex w-full items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-4">
                Техническая информация
            </h2>
            <div className="flex items-center gap-2">
            <span className="font-semibold ">Оценка производительности:</span>
            <div 
            className="w-10 h-10 bg-no-repeat bg-cover flex items-center justify-center font-bold text-2xl text-white" 
            style={{ backgroundImage: 'url(/assets/img/estimation.png)' }}
            >
            <span>{selectedEquipment.estimation}</span>
            </div>
            </div>
        </div>
            <div className="w-full flex items-center gap-4">
            <div className="border p-4 rounded-lg bg-[#E9EBF3] w-full flex gap-4">
                <div className="flex flex-col gap-1">
                {selectedEquipment.components && selectedEquipment.components.length > 0 ? (
                    selectedEquipment.components
                    .filter(component => component.Type === 'Memory') // Фильтрация компонентов по типу 'Memory'
                    .map((memory, index) => (
                        <div key={memory._id || index} className="w-full">
                        <h3 className="text-sm font-semibold text-nowrap">{memory.Manufacturer} {memory.Data} {memory.Quantity} ГБ</h3>
                        </div>
                    ))
                ) : (
                    <p>Нет данных о памяти</p>
                )}
                </div>
            </div>

            <div className="border p-4 rounded-lg bg-[#E9EBF3] w-full flex gap-4">
                <div className="flex flex-col gap-1">
                    {selectedEquipment.components && selectedEquipment.components.length > 0 ? (
                    selectedEquipment.components
                        .filter(component => component.Type === 'Processor') // Фильтруем компоненты по типу 'Processor'
                        .map((processor, index) => (
                        <div key={processor._id || index} className=" w-full">
                            <h3 className="text-sm font-semibold text-nowrap">{processor.Name}</h3> {/* Поле Name для вывода имени процессора */}
                        </div>
                        ))
                    ) : (
                    <p>Нет данных о процессоре</p>
                    )}
                </div>
            </div>

            <div className="border p-4 rounded-lg bg-[#E9EBF3] w-full flex gap-4">
                <div className="flex flex-col gap-1">
                    {selectedEquipment.components && selectedEquipment.components.length > 0 ? (
                    selectedEquipment.components
                        .filter(component => component.Type === 'Motherboard') // Фильтруем компоненты по типу 'Processor'
                        .map((motherboard, index) => (
                        <div key={motherboard._id || index} className="w-full">
                            <h3 className="text-sm font-semibold">{motherboard.Name}</h3> {/* Поле Name для вывода имени процессора */}
                        </div>
                        ))
                    ) : (
                    <p>Нет данных о материнской плате</p>
                    )}
                </div>
            </div>

            <div className="border p-4 rounded-lg bg-[#E9EBF3] w-full flex gap-4">
                <div className="flex flex-col gap-1">
                    {selectedEquipment.components && selectedEquipment.components.length > 0 ? (
                    selectedEquipment.components
                        .filter(component => component.Type === 'Video') // Фильтруем компоненты по типу 'Processor'
                        .map((video, index) => (
                        <div key={video._id || index} className="w-full">
                            <h3 className="text-sm font-semibold">{video.Name}</h3> {/* Поле Name для вывода имени процессора */}
                        </div>
                        ))
                    ) : (
                    <p>Нет данных о видеоядре</p>
                    )}
                </div>
            </div>

            </div>
      </div>
    </motion.div>
  );
};

export default SelectedEquipmentForm;
