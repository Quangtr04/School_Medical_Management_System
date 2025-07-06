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
      toast.success(`Đã ${action === "APPROVED" ? "duyệt" : "từ chối"} yêu cầu khám!`);
      dispatch(fetchPendingCheckupRequests());
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
      toast.success(`Đã ${action === "APPROVED" ? "duyệt" : "từ chối"} chiến dịch tiêm!`);
      dispatch(fetchPendingVaccineCampaigns());
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không thể xử lý yêu cầu chiến dịch tiêm.");
    }
  }
);

// ✅ Slice
const managerSlice = createSlice({
  name: "manager",
  initialState: {
    // Yêu cầu khám
    pendingCheckupRequests: [],
    loading: false,
    error: null,

    // Chiến dịch tiêm chủng
    pendingVaccineCampaigns: [],
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
      })

      // --- Respond Vaccine Campaign ---
      .addCase(respondToVaccineRequest.rejected, (state, action) => {
        toast.error(action.payload);
      });
  },
});

export default managerSlice.reducer;
