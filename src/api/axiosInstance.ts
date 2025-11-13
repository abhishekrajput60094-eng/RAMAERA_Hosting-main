import axios from "axios";

const api = axios.create({
  baseURL: "https://api.ramaerahosting.com/api/v1", // ✅ Your FastAPI base URL
});

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
