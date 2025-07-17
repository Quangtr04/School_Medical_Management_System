import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../../configs/config-axios";

// ✅ 1. Lấy danh sách yêu cầu khám sức khỏe chờ duyệt
export const fetchPendingCheckupRequests = createAsyncThunk(
  "manager/fetchPendingCheckupRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/manager/checkups/pending");
      console.log(response.data.data);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không thể tải danh sách yêu cầu khám.");
    }
  }
);

// ✅ 2. Duyệt / từ chối yêu cầu khám sức khỏe
export const respondToCheckupRequest = createAsyncThunk(
  "manager/respondToCheckupRequest",
  async ({ requestId, action }, { dispatch, rejectWithValue }) => {
    try {
      await api.post(`/manager/checkups/${requestId}/respond`, {
        status: action,
      });
      await new Promise(res => setTimeout(res, 800));
      await dispatch(fetchPendingCheckupRequests());
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không thể xử lý yêu cầu khám.");
    }
  }
);

// ✅ 3. Lấy danh sách chiến dịch tiêm chủng chờ duyệt
export const fetchPendingVaccineCampaigns = createAsyncThunk(
  "manager/fetchPendingVaccineCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/manager/vaccine-campaigns-pending");
      console.log(response.data);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không thể tải danh sách chiến dịch tiêm chủng.");
    }
  }
);

// ✅ 4. Duyệt / từ chối chiến dịch tiêm chủng
export const respondToVaccineRequest = createAsyncThunk(
  "manager/respondToVaccineRequest",
  async ({ campaign_id, action }, { dispatch, rejectWithValue }) => {
    try {
      await api.post(`/manager/vaccine-campaigns/${campaign_id}/respond`, {
        status: action,
      });
     await new Promise(res => setTimeout(res, 800));
      await dispatch(fetchPendingVaccineCampaigns());
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không thể xử lý yêu cầu chiến dịch tiêm.");
    }
  }
);

// ✅ 5. Lấy danh sách yêu cầu khám sức khỏe đã duyệt trong tháng
export const fetchApprovedCheckupRequests = createAsyncThunk(
  "manager/fetchApprovedCheckupRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/manager/checkups-approved");
      return response.data.checkups || response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không thể tải danh sách yêu cầu khám đã duyệt.");
    }
  }
);

// ✅ 6. Lấy danh sách yêu cầu khám sức khỏe bị từ chối trong tháng
export const fetchDeclinedCheckupRequests = createAsyncThunk(
  "manager/fetchDeclinedCheckupRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/manager/checkups-declined");
      return response.data.checkups || response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không thể tải danh sách yêu cầu khám bị từ chối.");
    }
  }
);

// ✅ 7. Lấy danh sách chiến dịch tiêm chủng đã duyệt trong tháng
export const fetchApprovedVaccineCampaigns = createAsyncThunk(
  "manager/fetchApprovedVaccineCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/manager/vaccine-campaigns-approved");
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không thể tải danh sách chiến dịch tiêm đã duyệt.");
    }
  }
);

// ✅ 8. Lấy danh sách chiến dịch tiêm chủng bị từ chối trong tháng
export const fetchDeclinedVaccineCampaigns = createAsyncThunk(
  "manager/fetchDeclinedVaccineCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/manager/vaccine-campaigns-declined");
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không thể tải danh sách chiến dịch tiêm bị từ chối.");
    }
  }
);

// ✅ Slice
const managerSlice = createSlice({
  name: "manager",
  initialState: {
    // Yêu cầu khám
    pendingCheckupRequests: [],
    approvedCheckupRequests: [],
    declinedCheckupRequests: [],
    loading: false,
    error: null,

    // Chiến dịch tiêm chủng
    pendingVaccineCampaigns: [],
    approvedVaccineCampaigns: [],
    declinedVaccineCampaigns: [],
    loadingVaccineCampaigns: false,
    vaccineCampaignError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Fetch Checkup ---
      .addCase(fetchPendingCheckupRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingCheckupRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingCheckupRequests = action.payload;
      })
      .addCase(fetchPendingCheckupRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Respond Checkup ---
      .addCase(respondToCheckupRequest.rejected, (state, action) => {
        toast.error(action.payload);
      })

      // --- Fetch Vaccine Campaign ---
      .addCase(fetchPendingVaccineCampaigns.pending, (state) => {
        state.loadingVaccineCampaigns = true;
        state.vaccineCampaignError = null;
      })
      .addCase(fetchPendingVaccineCampaigns.fulfilled, (state, action) => {
        state.loadingVaccineCampaigns = false;
        state.pendingVaccineCampaigns = action.payload;
      })
      .addCase(fetchPendingVaccineCampaigns.rejected, (state, action) => {
        state.loadingVaccineCampaigns = false;
        state.vaccineCampaignError = action.payload;
        

        // Nếu lỗi khác, giữ nguyên mảng cũ
      })

      // --- Respond Vaccine Campaign ---
      .addCase(respondToVaccineRequest.rejected, (state, action) => {        
        toast.error(action.payload);
      })

      // --- Fetch Approved Checkup ---
      .addCase(fetchApprovedCheckupRequests.fulfilled, (state, action) => {
        state.approvedCheckupRequests = action.payload;
      })
      // --- Fetch Declined Checkup ---
      .addCase(fetchDeclinedCheckupRequests.fulfilled, (state, action) => {
        state.declinedCheckupRequests = action.payload;
      })
      // --- Fetch Approved Vaccine Campaign ---
      .addCase(fetchApprovedVaccineCampaigns.fulfilled, (state, action) => {
        state.approvedVaccineCampaigns = action.payload;
      })
      // --- Fetch Declined Vaccine Campaign ---
      .addCase(fetchDeclinedVaccineCampaigns.fulfilled, (state, action) => {
        state.declinedVaccineCampaigns = action.payload;
      });
  },
});

export default managerSlice.reducer;
