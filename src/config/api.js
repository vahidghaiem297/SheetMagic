// config/api.js
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return "http://localhost:8000";
  }
  return "https://sheetmagic-backend-production.up.railway.app";
};

const API_BASE_URL = getApiBaseUrl();

// ✅ اصلاح نام endpointها + اضافه کردن endpoint نظرسنجی
const API_ENDPOINTS = {
  MERGE_FILES: `${API_BASE_URL}/merge-files/`,
  CONVERT_FORMAT: `${API_BASE_URL}/convert-format/`,
  REMOVE_DUPLICATES: `${API_BASE_URL}/remove-duplicates/`,
  GET_COLUMNS: `${API_BASE_URL}/get-columns/`,
  COMPARE_FILES: `${API_BASE_URL}/compare-files/`,
  CLEAN_DATA: `${API_BASE_URL}/clean-data/`,
  CREATE_PIVOT: `${API_BASE_URL}/create-pivot/`,
  JOIN_FILES: `${API_BASE_URL}/join-files/`,
  SUBMIT_FEEDBACK: `${API_BASE_URL}/submit-feedback/`,
};

console.log('🚀 API Configuration Loaded');
console.log('Base URL:', API_BASE_URL);
console.log('Endpoints:', API_ENDPOINTS);

export { API_ENDPOINTS, API_BASE_URL };