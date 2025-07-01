// src/redux/auth/authSlice.js (Hoặc src/store/authSlice.js)
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

const initialState = {
  user: null,
  isAuthenticated: false,
  isAuthInitialized: false,
  loading: false,
  error: null,
  notificationMessage: null,
  notificationType: null, // 'success', 'error', 'info', 'warning'
  success: false,
};

export const loginUser = createAsyncThunk(
  "loginUser",
  async (values, { rejectWithValue }) => {
    try {
      const response = await api.post("/login", values);
      console.log("Login response data:", response.data);

      // Flexible handling for different response structures
      let token, user;

      // Try different possible response structures
      if (response.data.token && response.data.user) {
        // Standard structure: { token, user }
        token = response.data.token;
        user = response.data.user;
      } else if (response.data.accessToken && response.data.user) {
        // Alternative structure: { accessToken, user }
        token = response.data.accessToken;
        user = response.data.user;
      } else if (response.data.token && response.data.parent) {
        // Parent specific structure: { token, parent }
        token = response.data.token;
        user = response.data.parent;
      } else if (response.data.accessToken && response.data.parent) {
        // Parent specific structure: { accessToken, parent }
        token = response.data.accessToken;
        user = response.data.parent;
      } else if (response.data.token && response.data.data) {
        // Generic structure: { token, data }
        token = response.data.token;
        user = response.data.data;
      } else if (response.data.accessToken && response.data.data) {
        // Generic structure: { accessToken, data }
        token = response.data.accessToken;
        user = response.data.data;
      } else {
        // Fallback: log the actual structure for debugging
        console.error("Unexpected response structure:", response.data);
        throw new Error("Invalid response structure from server");
      }

      console.log("Extracted token:", token);
      console.log("Extracted user:", user);

      if (!token || !user) {
        throw new Error("Missing token or user data in response");
      }

      // Thêm role_id nếu chưa có
      if (!user.role_id && user.role) {
        user.role_id = typeof user.role === "object" ? user.role.id : user.role;
      }

      localStorage.setItem("accessToken", token);
      localStorage.setItem("currentUser", JSON.stringify(user));

      return { user, accessToken: token };
    } catch (error) {
      console.error("Login error:", error);
      console.log("Error status:", error.response?.status);
      console.log("Error response:", error.response?.data);

      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/forgot-password", credentials);
      return response.data;
    } catch (error) {
      let errorMessage = "Failed to send OTP. Please try again.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// initializeAuth thunk của bạn
export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { dispatch, rejectWithValue }) => {
    // Added rejectWithValue here
    try {
      const accessToken = localStorage.getItem("accessToken");
      const currentUser = localStorage.getItem("currentUser");

      console.log("Initializing auth from localStorage:", {
        hasAccessToken: !!accessToken,
        hasCurrentUser: !!currentUser,
      });

      if (accessToken && currentUser) {
        try {
          const user = JSON.parse(currentUser);
          console.log("Parsed user from localStorage:", user);
          dispatch(authSlice.actions.setAuth({ user, accessToken }));
          return { user, accessToken };
        } catch (parseError) {
          console.error("Error parsing user from localStorage:", parseError);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("currentUser");
          return rejectWithValue(
            "Lỗi khi đọc thông tin người dùng từ localStorage"
          );
        }
      }

      dispatch(authSlice.actions.finishAuthInitialization());
      return null; // No user logged in
    } catch (error) {
      console.error("Failed to initialize auth from localStorage", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      dispatch(authSlice.actions.finishAuthInitialization());
      return rejectWithValue(
        "Không thể tải thông tin đăng nhập. Vui lòng đăng nhập lại."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isAuthInitialized = true; // Set true when auth is successful
      state.error = null;
      state.loading = false;
      state.authInitializationError = null; // Clear initialization error if successful
    },
    // Reducer để đánh dấu quá trình khởi tạo đã hoàn tất (dù thành công hay thất bại)
    finishAuthInitialization: (state) => {
      state.isAuthInitialized = true;
    },
    // Reducer để đặt thông báo lỗi cụ thể cho quá trình khởi tạo xác thực
    setAuthInitializationError: (state, action) => {
      state.authInitializationError = action.payload;
      state.isAuthInitialized = true; // Also mark as initialized to prevent UI from hanging
    },
    clearNotification: (state) => {
      state.notificationMessage = null;
      state.notificationType = null;
    },
    logout: (state) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.notificationMessage = null;
      state.notificationType = null;
      state.isAuthInitialized = true; // Keep true after logout to prevent initial loading state issues
      state.authInitializationError = null; // Clear error on logout
    },
    // Keep clearAuthError (if you intend to use it specifically for auth-related errors)
    clearAuthError: (state) => {
      state.error = null;
    },
    clearAuthSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.notificationMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
        state.notificationMessage = action.payload;
        state.notificationType = "error";
      })
      // Cases for initializeAuth thunk - these are also important!
      .addCase(initializeAuth.pending, (state) => {
        state.isAuthInitialized = false; // Reset to false when re-initializing
        state.authInitializationError = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isAuthInitialized = true;
        state.authInitializationError = null;
        // If user data was returned, update the state
        if (action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isAuthInitialized = true; // Mark as initialized even on rejection to prevent hanging UI
        state.authInitializationError =
          action.payload || "Lỗi khởi tạo xác thực không xác định.";
      })

      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
        state.success = false;
      });
  },
});

// EXPORT ALL NEW ACTIONS
export const {
  setNotification,
  clearNotification,
  logout,
  clearAuthError, // This one is used by ForgotPasswordPage
  setAuth,
  clearAuthSuccess,
  finishAuthInitialization, // <-- NEWLY EXPORTED
} = authSlice.actions;

export default authSlice.reducer;
