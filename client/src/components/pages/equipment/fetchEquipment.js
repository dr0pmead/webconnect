import axios from 'axios';

export const fetchEquipment = async (setEquipment, setIsLoading) => {
    setIsLoading(true)
  try {
    const response = await axios.get('http://localhost:5000/api/equipments');
    setEquipment(response.data);
    setIsLoading(false);
  } catch (error) {
    console.error('Ошибка при загрузке почт:', error);
    setIsLoading(false);
  }
};
