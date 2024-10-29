import Cookies from 'js-cookie';
import axios from 'axios';

class UserController {
  constructor() {
    this.userData = null;
  }

  // Инициализация: Получаем user_id из куки и загружаем данные пользователя
  async loadUserData() {
    const userId = Cookies.get('user_id');
    if (userId) {
      try {
        const response = await axios.get(`http://webconnect.rubikom.kz/api/user/${userId}`);
        this.userData = response.data;
        return this.userData;  // Возвращаем данные пользователя
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
        return null;
      }
    } else {
      console.error('Нет user_id в куки');
      return null;
    }
  }

  // Метод для получения данных пользователя по полю
  async getUserData(field) {
    if (!this.userData) {
      // Загружаем данные, если они ещё не были загружены
      await this.loadUserData();
    }

    if (!this.userData) {
      console.error('Данные пользователя не загружены');
      return null;
    }

    return this.userData[field] || null;
  }
}

// Экспортируем экземпляр класса для использования в других частях приложения
const userController = new UserController();
export default userController;
