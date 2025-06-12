export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const API_ENDPOINTS = {
    UPLOAD: `${API_BASE_URL}/api/resume/upload`,
    ANALYZE: `${API_BASE_URL}/api/resume/analyze`,
}; 