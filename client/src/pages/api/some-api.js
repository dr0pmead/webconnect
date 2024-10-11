// pages/api/some-api.js
import { checkAuth } from './middleware';

export default function handler(req, res) {
  checkAuth(req, res, () => {
    // Логика обработки запроса, если пользователь авторизован
    res.status(200).json({ data: 'Protected data' });
  });
}
