// features/medicationSubmissions/medicationSubmissionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../configs/config-axios"; // Đảm bảo đây là instance axios đã cấu hình

// Hàm thunk để lấy tất cả các bản gửi thuốc
export const fetchAllMedicationSubmissions = createAsyncThunk(
  "medicationSubmissions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/nurse/medication-submissions");

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Hàm thunk mới: Lấy đơn thuốc theo ID
export const fetchMedicationSubmissionById = createAsyncThunk(
  "medicationSubmissions/fetchById",
  async (reqId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/medication-submissions/${reqId}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Hàm thunk mới: Cập nhật trạng thái đơn thuốc
export const updateMedicationSubmissionReq = createAsyncThunk(
  "medicationSubmissions/updateStatus",
  async ({ reqId, status, token }, { rejectWithValue }) => {
    try {
      // Sử dụng `api.patch` trực tiếp và truyền token vào headers
      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {}; // Nếu không có token, gửi rỗng hoặc không truyền config

      const response = await api.patch(`/nurse/medication-submissions/${reqId}/update`, { status }, config);
      console.log(response);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const giveMedicine = createAsyncThunk(
  "medicationSubmission/giveMedicine",
  async (record, { rejectWithValue }) => {
    console.log("dispatch nhận record", record.record);

    try {
      const idReq = record.record.id_req;
      const status = record.record.status;
      await api.patch(`/nurse/medication-daily-logs-submission/${idReq}/update`, { status });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const medicationSubmissionSlice = createSlice({
  name: "medicationSubmission",
  initialState: {
    data: [], // Danh sách tất cả các đơn thuốc
    selectedSubmission: null, // Đơn thuốc được chọn theo ID
    loading: false,
    error: null,
    updateLoading: false, // Trạng thái tải cho việc cập nhật
    updateError: null, // Lỗi cho việc cập nhật
  },
  reducers: {
    // Các reducer đồng bộ khác nếu có
    clearSelectedSubmission: (state) => {
      state.selectedSubmission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchAllMedicationSubmissions
      .addCase(fetchAllMedicationSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMedicationSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllMedicationSubmissions.rejected, (state) => {
        state.loading = false;
        state.error = "Chưa có đơn thuốc";
      })
      // Xử lý fetchMedicationSubmissionById
      .addCase(fetchMedicationSubmissionById.pending, (state) => {
        state.loading = true; // Có thể dùng loading riêng cho chi tiết
        state.error = null;
        state.selectedSubmission = null; // Xóa dữ liệu cũ khi bắt đầu tải mới
      })
      .addCase(fetchMedicationSubmissionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSubmission = action.payload; // Lưu đơn thuốc được chọn
      })
      .addCase(fetchMedicationSubmissionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý updateMedicationSubmissionReq
      .addCase(updateMedicationSubmissionReq.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateMedicationSubmissionReq.fulfilled, (state, action) => {
        state.updateLoading = false;
        // Cập nhật đơn thuốc trong danh sách data
        // API thường trả về _id, nhưng cũng có thể là id tùy thuộc vào backend
        const index = state.data.findIndex((sub) => sub._id === action.payload._id || sub.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload; // Cập nhật đơn thuốc đã thay đổi trạng thái
        }
      })
      .addCase(updateMedicationSubmissionReq.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { clearSelectedSubmission } = medicationSubmissionSlice.actions;
export default medicationSubmissionSlice.reducer;
