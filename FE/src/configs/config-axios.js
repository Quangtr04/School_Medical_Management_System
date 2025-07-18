import axios from "axios";

// Create API instance
const api = axios.create({
<<<<<<< HEAD
  baseURL: "http://10.87.43.96:3000/api",
    headers: {
=======
  baseURL: "http://192.168.101.8:3000/api",
  headers: {
>>>>>>> 7b309330f48ed872f6ef57404ab260e3af385d56
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Interceptor để thêm Authorization token vào mỗi request
api.interceptors.request.use(
  (config) => {
    console.log("🚀 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers,
    });

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log("🔐 Token added:", accessToken.substring(0, 50) + "...");
    } else {
      console.log("⚠️ No token found in localStorage");
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi response (ví dụ: logout nếu token hết hạn)
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });

    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ, chuyển hướng về trang đăng nhập
      console.log("🔓 Unauthorized - clearing auth data");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser"); // Hoặc 'user'
      // window.location.href = '/login'; // Có thể dùng navigate nếu trong component React
      console.error("Unauthorized, logging out...");
    }
    return Promise.reject(error);
  }
);

export default api;
