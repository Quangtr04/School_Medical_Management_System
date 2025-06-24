// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice"; // Import reducer từ authSlice
import adminReducer from "./admin/adminSlice"; // Import adminSlice

const store = configureStore({
  reducer: {
    auth: authReducer, // Đăng ký authReducer dưới key 'auth'
    admin: adminReducer,
  },
  // DevTools được bật mặc định trong môi trường phát triển
});

export default store;
