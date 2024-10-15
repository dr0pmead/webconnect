import axios from 'axios';

export const handleShowPassword = async (
  emailId,
  setLoadingStates,
  showPassword,
  setShowPassword,
  setDecryptedPasswords
) => {
  setLoadingStates((prevState) => ({
    ...prevState,
    [emailId]: true,
  }));

  if (showPassword[emailId]) {
    setShowPassword((prevState) => ({
      ...prevState,
      [emailId]: false,
    }));
    setLoadingStates((prevState) => ({
      ...prevState,
      [emailId]: false,
    }));
  } else {
    try {
      const response = await axios.get(`http://localhost:5000/api/emails/${emailId}/password`);
      const decryptedPassword = response.data.password;

      setDecryptedPasswords((prevState) => ({
        ...prevState,
        [emailId]: decryptedPassword,
      }));

      setShowPassword((prevState) => ({
        ...prevState,
        [emailId]: true,
      }));
    } catch (error) {
      console.error('Ошибка при получении пароля:', error.response ? error.response.data : error.message);
    } finally {
      setLoadingStates((prevState) => ({
        ...prevState,
        [emailId]: false,
      }));
    }
  }
};