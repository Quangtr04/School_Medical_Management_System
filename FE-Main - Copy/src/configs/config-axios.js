import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// Create API instance
const api = axios.create({
  baseURL: "http://172.20.10.4:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Interceptor để thêm Authorization token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi response (ví dụ: logout nếu token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ, chuyển hướng về trang đăng nhập
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser"); // Hoặc 'user'
      // window.location.href = '/login'; // Có thể dùng navigate nếu trong component React
      console.error("Unauthorized, logging out...");
    }
    return Promise.reject(error);
  }
);

export default api;
