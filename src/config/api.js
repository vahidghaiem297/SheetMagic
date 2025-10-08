// تشخیص خودکار آدرس API بر اساس محیط
const getApiBaseUrl = () => {
  if (window.location.hostname.includes('github.io')) {
    return "sheetmagic-backend-production.up.railway.app";
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "http://localhost:8000";
  }
  return "sheetmagic-backend-production.up.railway.app";
};

const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  MERGE_FILES: `${API_BASE_URL}/merge-files/`,
  CONVERT_FORMAT: `${API_BASE_URL}/convert-format/`,
  REMOVE_DUPLICATES: `${API_BASE_URL}/remove-duplicates/`,
  GET_COLUMNS: `${API_BASE_URL}/get-columns/`,
  COMPARE_FILES: `${API_BASE_URL}/compare-files/`,
  CLEAN_DATA: `${API_BASE_URL}/clean-data/`,
  CREATE_PIVOT: `${API_BASE_URL}/create-pivot/`,
  JOIN_FILES: `${API_BASE_URL}/join-files/`,
};

export default API_BASE_URL;