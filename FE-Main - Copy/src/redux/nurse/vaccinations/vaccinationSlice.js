/* eslint-disable no-unused-vars */
// src/redux/nurse/immunizations/immunizationsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../configs/config-axios"; // Điều chỉnh đường dẫn đến instance axios của bạn

const initialState = {
  campaigns: [], // Danh sách tất cả các lịch tiêm chủng
  campaignDetail: null, // Chi tiết của một lịch tiêm chủng
  declinedCampaigns: [], // Danh sách lịch tiêm chủng đã bị từ chối
  approvedCampaigns: [], // Danh sách lịch tiêm chủng đã chấp thuận
  approvedStudents: [], // Danh sách học sinh đã duyệt cho chiến dịch
  approvedStudentDetail: null, // Chi tiết học sinh đã duyệt (dành cho API /:id)
  loading: false, // Trạng thái tải chung cho slice này
  error: null, // Thông báo lỗi nếu có
  success: false, // Chỉ báo thành công cho các hoạt động CUD
};

// Async Thunk để lấy danh sách lịch tiêm chủng (GET /vaccine-campaigns)
export const fetchAllVaccineCampaigns = createAsyncThunk(
  "immunizations/fetchAllCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/nurse/vaccine-campaigns");
      console.log(response.data);

      // Giả sử API trả về dữ liệu danh sách trong response.data.data
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tải danh sách lịch tiêm chủng thất bại.");
    }
  }
);

// Async Thunk để lấy chi tiết một lịch tiêm chủng theo ID (GET /vaccine-campaigns/:id)
export const fetchVaccineCampaignById = createAsyncThunk(
  "immunizations/fetchCampaignById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/nurse/vaccine-campaigns/${id}`);
      // Giả sử API trả về dữ liệu chi tiết trong response.data.data
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `Tải chi tiết lịch tiêm chủng ID ${id} thất bại.`);
    }
  }
);

// Async Thunk để lấy danh sách lịch tiêm chủng đã bị từ chối (GET /vaccine-campaigns-declined)
export const fetchDeclinedVaccineCampaigns = createAsyncThunk(
  "immunizations/fetchDeclinedCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/nurse/vaccine-campaigns-declined");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tải danh sách lịch tiêm chủng bị từ chối thất bại.");
    }
  }
);

// Async Thunk để lấy danh sách lịch tiêm chủng đã chấp thuận (GET /vaccine-campaigns-approved)
export const fetchApprovedVaccineCampaigns = createAsyncThunk(
  "immunizations/fetchApprovedCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/nurse/vaccine-campaigns-approved");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tải danh sách lịch tiêm chủng đã chấp thuận thất bại.");
    }
  }
);

// Async Thunk để tạo lịch tiêm chủng (POST /vaccine-campaigns/create)
export const createVaccinationCampaign = createAsyncThunk(
  "immunizations/createCampaign",
  async ({ token, campaignData }, { rejectWithValue }) => {
    try {
      const response = await api.post("/nurse/vaccine-campaigns/create", campaignData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tạo lịch tiêm chủng thất bại.");
    }
  }
);

// Async Thunk để lấy danh sách học sinh đã duyệt (cho tất cả chiến dịch) (GET /vaccine-campaigns-students)
export const fetchApprovedStudentsForVaccineCampaigns = createAsyncThunk(
  "immunizations/fetchApprovedStudents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/nurse/vaccine-campaigns-students");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tải danh sách học sinh đã duyệt thất bại.");
    }
  }
);

// Async Thunk để lấy học sinh đã duyệt theo ID (GET /vaccine-campaigns-students/:id)
export const fetchApprovedStudentVaccineDetailById = createAsyncThunk(
  "immunizations/fetchApprovedStudentDetail",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/nurse/vaccine-campaigns-students/${studentId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || `Tải chi tiết học sinh đã duyệt ID ${studentId} thất bại.`
      );
    }
  }
);

// Async Thunk để cập nhật note của học sinh (PATCH /vaccine-campaigns-students/:id)
export const updateStudentVaccineDetail = createAsyncThunk(
  "immunizations/updateStudentNote",
  async ({ studentId, values }, { rejectWithValue }) => {
    try {
      console.log("vaccinated_at:", values.vaccinated_at);
      console.log("Values:", values);
      console.log("ID:", studentId);
      console.log("DoseNumber:", values.dose_number);

      const response = await api.patch(`/nurse/vaccine-campaigns-students/${studentId}`, values);
      console.log(response);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Cập nhật ghi chú tiêm của học sinh thất bại.");
    }
  }
);

export const fetchApprovedStudentsByCampaignId = createAsyncThunk(
  "immunizations/fetchApprovedStudentsByCampaignId",
  async (campaignId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/nurse/vaccine-campaigns-list-student/${campaignId}`);
      return response.data.data; // Giả định API trả về mảng học sinh trong `data`
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `Tải học sinh cho chiến dịch ID ${campaignId} thất bại.`);
    }
  }
);

const immunizationsSlice = createSlice({
  name: "immunizations",
  initialState,
  reducers: {
    clearImmunizationsError: (state) => {
      state.error = null;
    },
    clearImmunizationsSuccess: (state) => {
      state.success = false;
    },
    clearCampaignDetail: (state) => {
      state.campaignDetail = null;
    },
    clearApprovedStudentDetail: (state) => {
      state.approvedStudentDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllVaccineCampaigns
      .addCase(fetchAllVaccineCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVaccineCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchAllVaccineCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.campaigns = [];
      })

      // fetchVaccineCampaignById
      .addCase(fetchVaccineCampaignById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.campaignDetail = null;
      })
      .addCase(fetchVaccineCampaignById.fulfilled, (state, action) => {
        state.loading = false;
        state.campaignDetail = action.payload;
      })
      .addCase(fetchVaccineCampaignById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.campaignDetail = null;
      })

      // fetchDeclinedVaccineCampaigns
      .addCase(fetchDeclinedVaccineCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeclinedVaccineCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.declinedCampaigns = action.payload;
      })
      .addCase(fetchDeclinedVaccineCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.declinedCampaigns = [];
      })

      // fetchApprovedVaccineCampaigns
      .addCase(fetchApprovedVaccineCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovedVaccineCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.approvedCampaigns = action.payload;
      })
      .addCase(fetchApprovedVaccineCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.approvedCampaigns = [];
      })

      // createVaccinationCampaign
      .addCase(createVaccinationCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createVaccinationCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.campaigns.push(action.payload);
      }) // Thêm vào danh sách chính
      .addCase(createVaccinationCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // fetchApprovedStudentsForVaccineCampaigns
      .addCase(fetchApprovedStudentsForVaccineCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovedStudentsForVaccineCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.approvedStudents = action.payload;
      })
      .addCase(fetchApprovedStudentsForVaccineCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.approvedStudents = [];
      })

      // fetchApprovedStudentVaccineDetailById
      .addCase(fetchApprovedStudentVaccineDetailById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.approvedStudentDetail = null;
      })
      .addCase(fetchApprovedStudentVaccineDetailById.fulfilled, (state, action) => {
        state.loading = false;
        state.approvedStudentDetail = action.payload;
      })
      .addCase(fetchApprovedStudentVaccineDetailById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.approvedStudentDetail = null;
      })

      // updateStudentVaccineNote
      .addCase(updateStudentVaccineDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateStudentVaccineDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateStudentVaccineDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(fetchApprovedStudentsByCampaignId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovedStudentsByCampaignId.fulfilled, (state, action) => {
        state.loading = false;
        state.approvedStudents = action.payload;
      })
      .addCase(fetchApprovedStudentsByCampaignId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.approvedStudents = [];
      });
  },
});

export const { clearImmunizationsError, clearImmunizationsSuccess, clearCampaignDetail, clearApprovedStudentDetail } =
  immunizationsSlice.actions;

export default immunizationsSlice.reducer;
