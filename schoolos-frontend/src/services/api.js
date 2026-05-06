import BASE_URL from '../config/api';

export const buildUrl = (path) => {
  return `${BASE_URL}${path}`;
};

export const handleApiError = async (response) => {
  try {
      const text = await response.text();
      try {
          const data = JSON.parse(text);
          return data.error || data.message || 'An error occurred';
      } catch (e) {
          console.error("Non-JSON API response:", text);
          return 'Server error: Unable to parse response.';
      }
  } catch(e) {
      return 'Network error.';
  }
};

export const getHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};
