// src/redux/nurse/medicalIncidents/medicalIncidentsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../configs/config-axios"; // Điều chỉnh đường dẫn đến instance axios của bạn

const initialState = {
  records: [], // Danh sách tất cả sự cố y tế
  recordDetail: null, // Chi tiết của một sự cố y tế (theo ID/event_id)
  incidentsByUser: [], // Danh sách sự cố theo user
  incidentsByStudent: [], // Danh sách sự cố theo học sinh
  loading: false, // Trạng thái tải chung cho slice này
  error: null, // Thông báo lỗi nếu có
  success: false, // Chỉ báo thành công cho các hoạt động CUD
  pagination: {
    // Thêm pagination để quản lý phân trang
    current: 1,
    pageSize: 10,
    total: 0,
  },
};

// 1. Async Thunk để lấy tất cả sự cố y tế (GET /incidents)
export const fetchAllMedicalIncidents = createAsyncThunk(
  "medicalIncidents/fetchAll",
  async ({ page, pageSize, search, status }, { rejectWithValue }) => {
    try {
      const params = { page, pageSize, search, status };
      const response = await api.get("/nurse/incidents", { params }); // Dựa vào image_fbd647.png
      console.log(response.data.data);

      return response.data.data; // Giả sử trả về { records: [], total: N }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tải danh sách sự cố y tế thất bại.");
    }
  }
);

// 2. Async Thunk để lấy chi tiết sự cố y tế theo event_id (GET /incidents/:event_id)
export const fetchMedicalIncidentById = createAsyncThunk(
  "medicalIncidents/fetchById",
  async (event_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/nurse/incidents/${event_id}`); // Dựa vào image_fbd647.png
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `Tải chi tiết sự cố ID ${event_id} thất bại.`);
    }
  }
);

// 3. Async Thunk để lấy tất cả sự cố y tế liên quan đến một user (GET /incidents/user)
export const fetchMedicalIncidentsByUser = createAsyncThunk(
  "medicalIncidents/fetchByUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/nurse/incidents/user"); // Dựa vào image_fbd647.png
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tải sự cố y tế theo người dùng thất bại.");
    }
  }
);

// 4. Async Thunk để lấy tất cả sự cố y tế liên quan đến một học sinh (GET /incidents/student/:student_id)
export const fetchMedicalIncidentsByStudent = createAsyncThunk(
  "medicalIncidents/fetchByStudent",
  async (student_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/nurse/incidents/student/${student_id}`); // Dựa vào image_fbd647.png
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `Tải sự cố y tế của học sinh ID ${student_id} thất bại.`);
    }
  }
);

// 5. Async Thunk để tạo sự cố y tế mới (POST /incidents) - Giả định API
export const createMedicalIncident = createAsyncThunk(
  "medicalIncidents/create",
  async (incidentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/nurse/create-incident", incidentData); // Giả định
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tạo sự cố y tế thất bại.");
    }
  }
);

// 6. Async Thunk để cập nhật sự cố y tế (PUT /incidents/:id) - Giả định API
export const updateMedicalIncident = createAsyncThunk(
  "medicalIncidents/update",
  async ({ id, incidentData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/nurse/incidents/${id}`, incidentData); // Giả định
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Cập nhật sự cố y tế thất bại.");
    }
  }
);

// 7. Async Thunk để xóa sự cố y tế (DELETE /incidents/:id) - Giả định API
export const deleteMedicalIncident = createAsyncThunk("medicalIncidents/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/nurse/incidents/${id}`); // Giả định
    return id; // Trả về ID của sự cố đã xóa
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Xóa sự cố y tế thất bại.");
  }
});

const medicalIncidentsSlice = createSlice({
  name: "medicalIncidents",
  initialState,
  reducers: {
    clearMedicalIncidentsError: (state) => {
      state.error = null;
    },
    clearMedicalIncidentsSuccess: (state) => {
      state.success = false;
    },
    clearMedicalIncidentDetail: (state) => {
      state.recordDetail = null;
    },
    setMedicalIncidentPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Medical Incidents
      .addCase(fetchAllMedicalIncidents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMedicalIncidents.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchAllMedicalIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.records = [];
        state.pagination.total = 0;
      })

      // Fetch Medical Incident By Id
      .addCase(fetchMedicalIncidentById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.recordDetail = null;
      })
      .addCase(fetchMedicalIncidentById.fulfilled, (state, action) => {
        state.loading = false;
        state.recordDetail = action.payload;
      })
      .addCase(fetchMedicalIncidentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.recordDetail = null;
      })

      // Fetch Medical Incidents By User
      .addCase(fetchMedicalIncidentsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalIncidentsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.incidentsByUser = action.payload;
      })
      .addCase(fetchMedicalIncidentsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.incidentsByUser = [];
      })

      // Fetch Medical Incidents By Student
      .addCase(fetchMedicalIncidentsByStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalIncidentsByStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.incidentsByStudent = action.payload;
      })
      .addCase(fetchMedicalIncidentsByStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.incidentsByStudent = [];
      })

      // Create Medical Incident
      .addCase(createMedicalIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createMedicalIncident.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Có thể thêm action.payload vào records nếu muốn cập nhật ngay UI
      })
      .addCase(createMedicalIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update Medical Incident
      .addCase(updateMedicalIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateMedicalIncident.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Cập nhật bản ghi trong danh sách
        state.records = state.records.map((incident) =>
          incident.id === action.payload.id ? action.payload : incident
        );
        // Cập nhật recordDetail nếu đang xem chi tiết bản ghi này
        if (state.recordDetail && state.recordDetail.id === action.payload.id) {
          state.recordDetail = action.payload;
        }
      })
      .addCase(updateMedicalIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete Medical Incident
      .addCase(deleteMedicalIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteMedicalIncident.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Loại bỏ bản ghi khỏi danh sách
        state.records = state.records.filter((incident) => incident.id !== action.payload);
        state.pagination.total -= 1; // Giảm tổng số lượng
      })
      .addCase(deleteMedicalIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearMedicalIncidentsError,
  clearMedicalIncidentsSuccess,
  clearMedicalIncidentDetail,
  setMedicalIncidentPagination,
} = medicalIncidentsSlice.actions;

export default medicalIncidentsSlice.reducer;
