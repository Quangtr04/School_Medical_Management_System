// src/redux/healthExaminations/healthExaminationsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios"; // Ensure this path is correct

// Async Thunks for API calls

// Fetch all health examination campaigns
export const fetchHealthExaminations = createAsyncThunk(
  "healthExaminations/fetchHealthExaminations",
  async ({ page = 1, pageSize = 10, search = "", classFilter = null }, { rejectWithValue }) => {
    try {
      const params = {
        page,
        pageSize,
        search,
        class: classFilter,
      };
      const response = await api.get("/nurse/checkups/create", { params });
      return response.data.data; // Assuming your API returns { data: { records: [], total: 0 } }
    } catch (error) {
      // Return the error message from the backend or a generic one
      return rejectWithValue(error.response?.data?.message || "Failed to fetch health examinations.");
    }
  }
);

// Create a new health examination campaign
export const createHealthExamination = createAsyncThunk(
  "healthExaminations/createHealthExamination",
  async (examinationData, { rejectWithValue }) => {
    try {
      // Ensure the endpoint is correct as per your server's expectation for creation
      const response = await api.post("/nurse/checkups/create", examinationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create health examination.");
    }
  }
);

// Update an existing health examination campaign
export const updateHealthExamination = createAsyncThunk(
  "healthExaminations/updateHealthExamination",
  async ({ id, examinationData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/nurse/health-checkup-campaigns/${id}`, examinationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update health examination.");
    }
  }
);

// Delete a health examination campaign
export const deleteHealthExamination = createAsyncThunk(
  "healthExaminations/deleteHealthExamination",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/nurse/health-checkup-campaigns/${id}`);
      return id; // Return the ID of the deleted item for reducer to remove it from state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete health examination.");
    }
  }
);

const healthExaminationsSlice = createSlice({
  name: "healthExaminations",
  initialState: {
    campaigns: [],
    totalCampaigns: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearHealthExaminationsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Examinations
      .addCase(fetchHealthExaminations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHealthExaminations.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload.records;
        state.totalCampaigns = action.payload.total;
      })
      .addCase(fetchHealthExaminations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Examination
      .addCase(createHealthExamination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHealthExamination.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally add the new campaign to the state, but usually a re-fetch is better for pagination
        // state.campaigns.push(action.payload);
        // state.totalCampaigns++;
      })
      .addCase(createHealthExamination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Examination
      .addCase(updateHealthExamination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHealthExamination.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the specific campaign in the state
        // const index = state.campaigns.findIndex(camp => camp.id === action.payload.id);
        // if (index !== -1) {
        //   state.campaigns[index] = action.payload;
        // }
      })
      .addCase(updateHealthExamination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Examination
      .addCase(deleteHealthExamination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHealthExamination.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = state.campaigns.filter((campaign) => campaign.id !== action.payload);
        state.totalCampaigns--;
      })
      .addCase(deleteHealthExamination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHealthExaminationsError } = healthExaminationsSlice.actions;
export default healthExaminationsSlice.reducer;
