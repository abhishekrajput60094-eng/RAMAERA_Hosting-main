import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.13:7000/api/v1", // ✅ Your FastAPI base URL
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
