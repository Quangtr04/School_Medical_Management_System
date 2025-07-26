/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../configs/config-axios"; // Điều chỉnh đường dẫn đến instance axios của bạn

const initialState = {
  loading: false,
  logs: [],
  logNote: null,
  logsByDate: [],
  error: null,
};

export const getDailyLogByReqId = createAsyncThunk("logs/getDailyLogByReqId", async (id_req, { rejectWithValue }) => {
  try {
    const response = await api.get(`nurse/logs/by-request/${id_req}`);
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Tạo lịch khám sức khỏe thất bại.");
  }
});

export const getLogNoteByNurseStuAndRegId = createAsyncThunk(
  "logs/getLogNoteByNurseStuAndRegId",
  async ({ stuId, reqId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`nurse/logs/by-request/${reqId}/student/${stuId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getLogDetailByLogId = createAsyncThunk("logs/getLogDetailByLogId", async (logId, { rejectWithValue }) => {
  try {
    const respone = await api.get(`nurse/logs/${logId}`);
    return respone.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const getLogByDate = createAsyncThunk("logs/getLogByDate", async ({ _ }, { rejectWithValue }) => {
  try {
    const response = await api.get(`nurse/logs/by-date`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateLogByLogId = createAsyncThunk(
  "logs/updateLogByLogId",
  async ({ logId, status }, { rejectWithValue }) => {
    try {
      const respone = await api.patch(`/nurse/medication-daily-logs-submissions/${logId}/update`, { status });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const logSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    resetLogs: (state) => {
      state.logs = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDailyLogByReqId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDailyLogByReqId.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(getDailyLogByReqId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Đã xảy ra lỗi";
      })

      //getLogNoteByNurseStuAndRegId
      .addCase(getLogNoteByNurseStuAndRegId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLogNoteByNurseStuAndRegId.fulfilled, (state, action) => {
        state.loading = false;
        state.logNote = action.payload;
      })
      .addCase(getLogNoteByNurseStuAndRegId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi khi lấy ghi chú log.";
      })

      //getLogDetailByLogId
      .addCase(getLogDetailByLogId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLogDetailByLogId.fulfilled, (state, action) => {
        state.loading = false;
        state.logDetail = action.payload;
      })
      .addCase(getLogDetailByLogId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể tải chi tiết log";
      })

      //getLogByDate
      .addCase(getLogByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLogByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.logsByDate = action.payload; // tuỳ vào mục tiêu của bạn
      })
      .addCase(getLogByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi khi tải logs theo ngày";
      });
  },
});

export default logSlice.reducer;
