// src/redux/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios"; // Đảm bảo đường dẫn này đúng

// Define an async thunk for user login
// `createAsyncThunk` sẽ tạo ra 3 action types: pending, fulfilled, rejected
export const loginUser = createAsyncThunk(
  "loginUser", // Tên type cho action(action.type)
  async (values, { rejectWithValue }) => {
    try {
      // Giả lập cuộc gọi API đăng nhập
      console.log("Value:", values);

      const response = await api.post("/login", values);
      console.log("Response", response);
      console.log(response.data);

      // Giả sử API trả về user info và token
      const { token, user } = response.data;
      console.log(user);

      // Lưu token vào localStorage (hoặc sessionStorage) để duy trì trạng thái đăng nhập
      localStorage.setItem("accessToken", token);
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Trả về dữ liệu cần thiết để cập nhật state
      return { user, token };
    } catch (error) {
      // Xử lý lỗi từ API
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      // `rejectWithValue` sẽ gửi lỗi này vào action.payload khi trạng thái là `rejected`
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth", // Tên của slice, dùng làm prefix cho action types
  initialState: {
    user: JSON.parse(localStorage.getItem("currentUser")) || null, // Lấy user từ localStorage nếu có
    accessToken: localStorage.getItem("accessToken") || null, // Lấy token từ localStorage nếu có
    isAuthenticated: !!localStorage.getItem("accessToken"), // Kiểm tra xem có token không để xác định trạng thái đăng nhập
    loading: false,
    error: null,
  },
  reducers: {
    // Reducer cho logout
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null; // Clear any previous errors
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
    },
    // Có thể thêm các reducer khác nếu cần (ví dụ: clearError)
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Xử lý các action types được tạo bởi `createAsyncThunk`
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đăng nhập thất bại."; // action.payload chứa lỗi từ rejectWithValue
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions; // Export các action sync
export default authSlice.reducer; // Export reducer mặc định
