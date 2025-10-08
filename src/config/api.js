// تشخیص خودکار محیط
const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  } else {
    return 'https://your-backend-app.railway.app'; // آدرس Railway تو
  }
};

export const API_BASE_URL = getApiUrl();