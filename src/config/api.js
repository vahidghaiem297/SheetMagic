// config/api.js

// تشخیص خودکار آدرس API بر اساس محیط
const getApiBaseUrl = () => {
  // همیشه از HTTPS استفاده کن
  if (window.location.hostname.includes('github.io') || 
      window.location.protocol === 'https:') {
    return "https://sheetmagic-backend-production.up.railway.app";
  }
  
  // برای localhost
  return "https://sheetmagic-backend-production.up.railway.app";
};

// تعریف متغیرها
const API_BASE_URL = getApiBaseUrl();

const API_ENDPOINTS = {
  MERGE_FILES: `${API_BASE_URL}/merge-files`,
  CONVERT_FORMAT: `${API_BASE_URL}/convert-format`,
  REMOVE_DUPLICATES: `${API_BASE_URL}/remove-duplicates`,
  GET_COLUMNS: `${API_BASE_URL}/get-columns`,
  COMPARE_FILES: `${API_BASE_URL}/compare-files`,
  CLEAN_DATA: `${API_BASE_URL}/clean-data`,
  CREATE_PIVOT: `${API_BASE_URL}/create-pivot`,
  JOIN_FILES: `${API_BASE_URL}/join-files`,
};

// برای دیباگ
console.log('🚀 API Base URL:', API_BASE_URL);
console.log('📡 API Endpoints:', API_ENDPOINTS);

// export
export { API_ENDPOINTS, API_BASE_URL };
export default API_BASE_URL;