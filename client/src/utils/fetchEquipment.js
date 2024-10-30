import { useEffect } from 'react';
import io from 'socket.io-client';

export const fetchEquipmentData = async (setEquipment, setIsLoading) => {
  setIsLoading(true);
  try {
      const response = await fetch('http://webconnect.rubikom.kz/api/equipments');
      const data = await response.json();
      setEquipment(data);
      setIsLoading(false);
  } catch (error) {
      console.error('Error fetching equipment:', error);
      setIsLoading(false);
  }
};

export const useSocketEquipmentUpdates = (setEquipment) => {
  useEffect(() => {
      const socket = io('http://webconnect.rubikom.kz');

      socket.on('equipmentUpdated', (updatedEquipments) => {
                   // Преобразуем в массив, если это не массив
          const updatedList = Array.isArray(updatedEquipments) ? updatedEquipments : [updatedEquipments];

          setEquipment((prevEquipments) => {
              const newEquipmentList = prevEquipments.map((equipment) => {
                  // Ищем соответствующее оборудование в списке обновленных данных
                  const updatedEquipment = updatedList.find((updated) => updated._id === equipment._id);
                  return updatedEquipment ? updatedEquipment : equipment;
              });
              return newEquipmentList;
          });
      });

      return () => {
          socket.disconnect();
      };
  }, [setEquipment]);
};