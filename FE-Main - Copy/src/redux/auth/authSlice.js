// src/store/authSlice.js (Ví dụ)
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../configs/config-axios"; // Đảm bảo đường dẫn đúng

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  // Thêm trạng thái cho thông báo
  notificationMessage: null,
  notificationType: null, // 'success', 'error', 'info', 'warning'
};

export const loginUser = createAsyncThunk("loginUser", async (values, { rejectWithValue }) => {
  try {
    const response = await api.post("/login", values);
    const { token, user } = response.data.data;

    localStorage.setItem("accessToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));

    return { user, accessToken: token };
  } catch (error) {
    let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    return rejectWithValue(errorMessage);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action để thiết lập thông báo
    setNotification: (state, action) => {
      state.notificationMessage = action.payload.message;
      state.notificationType = action.payload.type;
    },
    // Action để xóa thông báo
    clearNotification: (state) => {
      state.notificationMessage = null;
      state.notificationType = null;
    },
    // ... các reducers khác (ví dụ: để khởi tạo user/isAuthenticated từ localStorage khi app load)
    initializeAuth: (state) => {
      const accessToken = localStorage.getItem("accessToken");
      const currentUser = localStorage.getItem("currentUser");
      if (accessToken && currentUser) {
        state.isAuthenticated = true;
        state.user = JSON.parse(currentUser);
      }
    },
    logout: (state) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.notificationMessage = null; // Xóa thông báo cũ
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.notificationMessage = "Đăng nhập thành công!";
        state.notificationType = "success";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
        state.notificationMessage = action.payload; // Lỗi từ API
        state.notificationType = "error";
      });
  },
});

export const { setNotification, clearNotification, initializeAuth, logout } = authSlice.actions;

export default authSlice.reducer;
