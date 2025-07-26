// src/redux/nurse/studentHealth/studentHealthSlice.js (hoặc đường dẫn phù hợp)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../configs/config-axios"; // Điều chỉnh đường dẫn đến instance axios của bạn

const initialState = {
  healthRecords: [], // Danh sách tất cả hồ sơ sức khỏe học sinh
  currentHealthRecord: null, // Chi tiết hồ sơ sức khỏe của một học sinh cụ thể
  totalStudent: 0,
  loading: true, // Trạng thái tải chung cho slice này
  error: null, // Thông báo lỗi nếu có
  success: false, // Chỉ báo thành công cho các hoạt động CUD
};

// Async Thunk để lấy tất cả hồ sơ sức khỏe học sinh
// GET /nurse/student-health-records (hoặc endpoint tương tự)
export const fetchAllStudentHealthRecords = createAsyncThunk(
  "studentHealth/fetchAllStudentHealthRecords",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/nurse/students/health-declaration"); // Thay đổi endpoint nếu cần
      // Giả sử API trả về mảng dữ liệu trực tiếp hoặc trong response.data.data
      return response.data.data; // Hoặc response.data.data tùy cấu trúc API của bạn
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tải danh sách hồ sơ sức khỏe học sinh thất bại.");
    }
  }
);

// Async Thunk để lấy chi tiết hồ sơ sức khỏe của một học sinh theo ID
// GET /nurse/student-health-records/:studentId
export const fetchStudentHealthRecordById = createAsyncThunk(
  "studentHealth/fetchStudentHealthRecordById",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/nurse/students/health-declaration/${studentId}`); // Thay đổi endpoint nếu cần
      return response.data; // Hoặc response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || `Tải chi tiết hồ sơ sức khỏe của học sinh ID ${studentId} thất bại.`
      );
    }
  }
);

// Async Thunk để cập nhật hồ sơ sức khỏe của một học sinh
// PATCH/PUT /nurse/student-health-records/:studentId
export const updateStudentHealthRecord = createAsyncThunk(
  "studentHealth/updateStudentHealthRecord",
  async ({ studentId, healthData }, { rejectWithValue }) => {
    console.log("Payload gửi đi:", healthData);

    try {
      const response = await api.patch(`/nurse/students/${studentId}/health-declaration`, healthData);
      console.log(response);

      return response.data; // Hoặc response.data.datap
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Cập nhật hồ sơ sức khỏe học sinh thất bại.");
    }
  }
);

// Async Thunk để tạo hồ sơ sức khỏe mới cho học sinh (nếu có API)
// POST /nurse/student-health-records/create
export const createStudentHealthRecord = createAsyncThunk(
  "studentHealth/createStudentHealthRecord",
  async ({ healthData, token }, { rejectWithValue }) => {
    try {
      const response = await api.post("/nurse/student-health-records/create", healthData, {
        // Thay đổi endpoint nếu cần
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Hoặc response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tạo hồ sơ sức khỏe học sinh thất bại.");
    }
  }
);

// Async Thunk để xóa hồ sơ sức khỏe (nếu có API)
// DELETE /nurse/student-health-records/:studentId
export const deleteStudentHealthRecord = createAsyncThunk(
  "studentHealth/deleteStudentHealthRecord",
  async ({ studentId, token }, { rejectWithValue }) => {
    try {
      await api.delete(`/nurse/student-health-records/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return studentId; // Trả về ID của bản ghi đã xóa để cập nhật state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xóa hồ sơ sức khỏe học sinh thất bại.");
    }
  }
);

const studentHealthSlice = createSlice({
  name: "studentHealth",
  initialState,
  reducers: {
    clearHealthRecordsError: (state) => {
      state.error = null;
    },
    clearHealthRecordsSuccess: (state) => {
      state.success = false;
    },
    clearCurrentHealthRecord: (state) => {
      state.currentHealthRecord = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllStudentHealthRecords
      .addCase(fetchAllStudentHealthRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStudentHealthRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.healthRecords = action.payload;
        state.totalStudent = action.payload.length;
      })
      .addCase(fetchAllStudentHealthRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.healthRecords = []; // Xóa dữ liệu nếu có lỗi
      })

      // fetchStudentHealthRecordById
      .addCase(fetchStudentHealthRecordById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentHealthRecord = null;
      })
      .addCase(fetchStudentHealthRecordById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentHealthRecord = action.payload;
      })
      .addCase(fetchStudentHealthRecordById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentHealthRecord = null;
      })

      // updateStudentHealthRecord
      .addCase(updateStudentHealthRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateStudentHealthRecord.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateStudentHealthRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // createStudentHealthRecord (Nếu có)
      .addCase(createStudentHealthRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createStudentHealthRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.healthRecords.push(action.payload); // Thêm bản ghi mới vào danh sách
      })
      .addCase(createStudentHealthRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // deleteStudentHealthRecord (Nếu có)
      .addCase(deleteStudentHealthRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteStudentHealthRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.healthRecords = state.healthRecords.filter(
          (record) => record.id !== action.payload // action.payload là studentId đã xóa
        );
        if (state.currentHealthRecord && state.currentHealthRecord.id === action.payload) {
          state.currentHealthRecord = null; // Xóa current record nếu nó bị xóa
        }
      })
      .addCase(deleteStudentHealthRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearHealthRecordsError, clearHealthRecordsSuccess, clearCurrentHealthRecord } =
  studentHealthSlice.actions;

export default studentHealthSlice.reducer;
