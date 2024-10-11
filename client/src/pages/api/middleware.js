// pages/api/middleware.js
import { parseCookies } from 'nookies';

export function checkAuth(req, res, next) {
  const cookies = parseCookies({ req });
  const token = cookies.token;
  const userId = cookies.user_id;

  if (!token || !userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}