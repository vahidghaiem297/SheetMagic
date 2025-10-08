// config/api.js
// تشخیص خودکار آدرس API بر اساس محیط

const getApiBaseUrl = () => {
  // اگر در GitHub Pages هستیم
  if (window.location.hostname.includes('github.io')) {
    return "https://sheetmagic-backend-production.up.railway.app";
  }
  
  // اگر در localhost هستیم (توسعه)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "https://sheetmagic-backend-production.up.railway.app";
  }
  
  // برای سایر موارد (production)
  return "https://sheetmagic-backend-production.up.railway.app";
};

const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  // آدرس کامل endpoint ها
  MERGE_FILES: `${API_BASE_URL}/merge-files`,
  CONVERT_FORMAT: `${API_BASE_URL}/convert-format`,
  REMOVE_DUPLICATES: `${API_BASE_URL}/remove-duplicates`,
  GET_COLUMNS: `${API_BASE_URL}/get-columns`,
  COMPARE_FILES: `${API_BASE_URL}/compare-files`,
  CLEAN_DATA: `${API_BASE_URL}/clean-data`,
  CREATE_PIVOT: `${API_BASE_URL}/create-pivot`,
  JOIN_FILES: `${API_BASE_URL}/join-files`,
};

// برای دیباگ و بررسی آدرس‌ها
console.log('API Base URL:', API_BASE_URL);
console.log('API Endpoints:', API_ENDPOINTS);

export default API_BASE_URL;