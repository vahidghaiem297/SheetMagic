const API_BASE_URL = import.meta.env.VITE_API_URL || "https://sheetmagic-backend-production.up.railway.app";

export const API_ENDPOINTS = {
  // endpoints مربوط به بک‌اند
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