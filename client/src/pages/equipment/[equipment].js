// pages/equipment/[equipment].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Progress, Chip, Tooltip, Checkbox } from '@nextui-org/react';

const EquipmentDetailPage = () => {
  const router = useRouter();
  const { equipment } = router.query;
  const [equipmentData, setEquipmentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Проверяем, что equipment доступен, чтобы избежать выполнения запроса до его инициализации
    if (equipment) {
      const fetchEquipmentData = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/equipment/${equipment}`);
          if (!response.ok) {
            throw new Error("Данные о компьютере не найдены");
          }
          const data = await response.json();
          setEquipmentData(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchEquipmentData();
    }
  }, [equipment]);

  if (isLoading) {
    return <p>Загрузка данных...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!equipmentData) {
    return <p>Данные о компьютере не найдены.</p>;
  }

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">Информация о компьютере: {equipment}</h1>

      <div className="mb-6">
        <p className="text-gray-700"><strong>Владелец:</strong> {equipmentData.owner}</p>
        <p className="text-gray-700"><strong>Отдел:</strong> {equipmentData.department}</p>
        <p className="text-gray-700"><strong>Подразделение:</strong> {equipmentData.division}</p>
        <p className="text-gray-700"><strong>ОС:</strong> {equipmentData.osVersion}</p>
        <p className="text-gray-700"><strong>Инвентарный номер:</strong> {equipmentData.inventoryNumber || 'Не указан'}</p>
      </div>
      
      <div className="flex w-full flex-col gap-4 mt-4">
          <a className="border p-4 rounded-lg bg-[#FC4136] w-full flex items-center gap-4 duration-150 text-white">
              <img src="/assets/img/simple-icons_anydesk.svg" alt="anydesk" className="w-14 h-14"/>
              <div className="flex flex-col justify-start">
                  <span className="text-sm">AnyDesk</span>
                  <span className="font-bold text-lg">{equipmentData.anyDesk}</span>
              </div>
          </a>
          <div className="border p-4 rounded-lg bg-[#0669CC] w-full flex items-center gap-4 text-white cursor-pointer duration-150">
              <img src="/assets/img/mdi_teamviewer.svg" alt="teamviewer" className="w-14 h-14"/>
              <div className="flex flex-col justify-start">
                  <span className="text-sm">TeamViewer</span>
                  <span className="font-bold text-lg">{equipmentData.teamViewer}</span>
              </div>
          </div>
          <a className="border p-4 rounded-lg bg-[#25C03D] w-full flex items-center gap-4 duration-150 text-white">
              <img src="/assets/img/mdi_ip.svg" alt="anydesk" className="w-14 h-14"/>
              <div className="flex flex-col justify-start">
                  <span className="text-sm">IP Адрес</span>
                  <span className="font-bold text-lg">{equipmentData.ipAddress.main}</span>
              </div>
          </a>
      </div>


      <div className="mb-6 flex flex-col gap-3 mt-6">

        {equipmentData.disks && equipmentData.disks.length > 0 ? (
            equipmentData.disks.map((disk, index) => {
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
      
      
<div className="flex justify-between w-full pt-4">
  <div className="flex flex-col gap-2">
    <div className="flex flex-col gap-2">
      <span className="text-black/50">Процессор: </span>
      {equipmentData.components && equipmentData.components.length > 0 ? (
          equipmentData.components
              .filter(component => component.Type === 'Processor') // Фильтруем компоненты по типу 'Processor'
              .map((processor, index) => (
              <span key={processor._id || index} className="w-full">
                  {processor.Name}
              </span>
              ))
          ) : (
          <p>Нет данных о процессоре</p>
          )}
    </div>

    <div className="flex flex-col gap-2">
      <span className="w-full text-black/50">Оперативная память (ОЗУ): </span>
      {equipmentData.components && equipmentData.components.length > 0 ? (
          equipmentData.components
          .filter(component => component.Type === 'Memory') // Фильтрация компонентов по типу 'Memory'
          .map((memory, index) => (
              <span key={memory._id || index} className="w-full text-nowrap">
                {memory.Manufacturer} {memory.Data} {memory.Quantity} ГБ
              </span>
          ))
      ) : (
          <p>Нет данных о памяти</p>
      )}
    </div>

    <div className="flex flex-col gap-2">
    <span className="text-black/50">Материнская плата:</span>
      <span>
        {equipmentData.components && equipmentData.components.length > 0 ? (
          equipmentData.components
            .filter(component => component.Type === 'Motherboard')
            .map((motherboard, index) => {
              const manufacturerMatch = /(ASUS|ASRock|Gigabyte)/i.exec(motherboard.Manufacturer);
              const manufacturerPrefix = manufacturerMatch ? manufacturerMatch[0] : "";

              return (
                <span key={motherboard._id || index} className="text-gray-800">
                  {manufacturerPrefix && `${manufacturerPrefix} `}{motherboard.Name}
                </span>
              );
            })
        ) : (
          <span className="text-gray-500">Нет данных о материнской плате</span>
        )}
      </span>
    </div>

    <div className="flex flex-col gap-2">
      <span className="text-nowrap text-black/50">Видеоадаптер: </span>
      {equipmentData.components && equipmentData.components.length > 0 ? (
        equipmentData.components
            .filter(component => component.Type === 'Video') // Фильтруем компоненты по типу 'Processor'
            .map((video, index) => (                        
            <span key={video._id || index} className="w-full text-nowrap">
              {video.Name}
            </span>
            ))
        ) : (
        <p>Нет данных о видеоядре</p>
        )}
    </div>

  </div>
</div>
    </div>
  );
};

export default EquipmentDetailPage;
