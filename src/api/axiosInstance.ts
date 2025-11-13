import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.13:7000", // ✅ Your FastAPI base URL
});

export default api;
