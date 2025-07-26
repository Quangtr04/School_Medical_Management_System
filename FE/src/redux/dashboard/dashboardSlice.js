// src/redux/dashboard/dashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

export const fetchUserCounts = createAsyncThunk("dashboard/fetchUserCounts", async (_, { rejectWithValue }) => {
  try {
    // lần lượt là các respone
    const [parentsRes, nursesRes, managersRes, studentRes] = await Promise.all([
      api.get("/admin/parents"),
      api.get("/admin/nurses"),
      api.get("/admin/managers"),
      api.get("/nurse/students/health-declaration"),
    ]);

    return {
      totalParents: parentsRes.data.data.length,
      totalNurses: nursesRes.data.data.length,
      totalManagers: managersRes.data.data.length,
      totalStudent: studentRes.data.data.length,
    };
  } catch (error) {
    return rejectWithValue("Lỗi khi lấy tổng số người dùng");
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    totalParents: 0,
    totalNurses: 0,
    totalManagers: 0,
    totalStudent: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.totalParents = action.payload.totalParents;
        state.totalNurses = action.payload.totalNurses;
        state.totalManagers = action.payload.totalManagers;
        (state.totalStudent = action.payload.totalStudent),
          // Xóa dòng này nếu không có admin:
          // state.totalAdmins = action.payload.totalAdmins;
          (state.error = null);
      })
      .addCase(fetchUserCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
