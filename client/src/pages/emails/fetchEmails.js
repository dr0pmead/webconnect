import axios from 'axios';

export const fetchEmails = async (setEmails, setIsLoading) => {
    setIsLoading(true)
  try {
    const response = await axios.get('http://localhost:5000/api/emails');
    setEmails(response.data);
    setIsLoading(false);
  } catch (error) {
    console.error('Ошибка при загрузке почт:', error);
    setIsLoading(false);
  }
};
