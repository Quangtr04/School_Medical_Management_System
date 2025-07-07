// src/redux/admin/adminSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

// --- Định nghĩa Async Thunks ---

// fetchUsers: Chấp nhận endpoint cụ thể và params
export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async ({ endpointPath, params = {} }, { rejectWithValue }) => {
    try {
      // endpointPath sẽ là '/admin/parents', '/admin/nurses', v.v.
      const response = await api.get(endpointPath, { params });
      const data = response.data.data;

      return data;
    } catch (error) {
      let errorMessage = `Không thể tải danh sách người dùng từ ${endpointPath}.`;
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// createUser: Chấp nhận endpoint cụ thể và userData
export const createUser = createAsyncThunk(
  "admin/createUser",
  async ({ endpointPath, userData }, { rejectWithValue }) => {
    try {
      const response = await api.post(endpointPath, userData);
      return response.data.data;
    } catch (error) {
      let errorMessage = `Không thể tạo người dùng mới tại ${endpointPath}.`;
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// updateUser: Chấp nhận endpoint cụ thể, id và userData
export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ endpointPath, id, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${endpointPath}/${id}`, userData); // Endpoint + id
      return response.data.data;
    } catch (error) {
      let errorMessage = `Cập nhập tài khoản thất bại`;
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// deleteUser: Chấp nhận endpoint cụ thể và id
export const deleteUser = createAsyncThunk("admin/deleteUser", async ({ endpointPath, id }, { rejectWithValue }) => {
  try {
    await api.delete(`${endpointPath}/${id}`); // Endpoint + id
    return id; // Trả về ID của người dùng đã xóa
  } catch (error) {
    let errorMessage = `Xóa tài khoản thất bại`;
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    return rejectWithValue(errorMessage);
  }
});

// --- Định nghĩa Admin Slice (Không thay đổi nhiều) ---
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    totalUsers: 0,
    loading: false,
    error: null,
    totalUser: 0,
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.totalUser = action.payload.length;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.users = [];
        state.totalUsers = 0;
      })

      // createUser
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        const newUser = action.payload;
        state.loading = false;
        // Có thể thêm user mới vào state.users hoặc re-fetch
        // Trong trường hợp này, các component sẽ tự gọi lại fetch sau khi thành công
        if (newUser) {
          state.users.push(newUser);
          state.totalUsers += 1;
        }
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload;
        const index = state.users.findIndex((user) => user._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteUser
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        const deletedUserId = action.payload;
        state.users = state.users.filter((user) => user._id !== deletedUserId);
        state.totalUsers -= 1;
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
