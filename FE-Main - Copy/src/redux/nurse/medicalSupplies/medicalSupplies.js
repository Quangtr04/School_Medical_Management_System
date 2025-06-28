// src/redux/nurse/medicalSupplies/medicalSuppliesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../configs/config-axios"; // Điều chỉnh đường dẫn đến instance axios của bạn

const initialState = {
  supplies: [],
  selectedSupply: null, // Thêm để lưu thông tin vật tư theo ID nếu cần
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  loading: false,
  error: null,
};

// Async Thunk để lấy danh sách vật tư y tế
export const fetchMedicalSupplies = createAsyncThunk(
  "medicalSupplies/fetchSupplies",
  async (params, { rejectWithValue }) => {
    try {
      // Chỉ truyền page, pageSize, search nếu API hỗ trợ.
      // Nếu API chỉ trả về toàn bộ danh sách, thì bỏ params.
      const response = await api.get("/nurse/medical-supplies", { params });
      console.log(response.data.data);

      // Giả định API trả về records và total trong response.data.data
      // Nếu API chỉ trả về mảng vật tư, bạn cần điều chỉnh.
      // Ví dụ: return { records: response.data.data, total: response.data.data.length };
      return response.data.data; // { records: [], total: 0 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tải vật tư y tế thất bại.");
    }
  }
);

// Async Thunk để lấy danh sách vật tư y tế theo ID
export const getMedicalSupplyByID = createAsyncThunk(
  "medicalSupplies/getMedicalSupplyByID",
  async (supplyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/nurse/medical-supplies/${supplyId}`);
      return response.data.data; // Giả định API trả về chi tiết vật tư trong response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tải chi tiết vật tư thất bại.");
    }
  }
);

const medicalSuppliesSlice = createSlice({
  name: "medicalSupplies",
  initialState,
  reducers: {
    setMedicalSuppliesPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearMedicalSuppliesError: (state) => {
      state.error = null;
    },
    resetMedicalSuppliesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchMedicalSupplies
      .addCase(fetchMedicalSupplies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalSupplies.fulfilled, (state, action) => {
        state.loading = false;
        // Kiểm tra cấu trúc dữ liệu trả về từ API
        // Nếu API trả về { records: [...], total: N }
        if (action.payload && action.payload.records && typeof action.payload.total === "number") {
          state.supplies = action.payload.records;
          state.pagination.total = action.payload.total;
        } else {
          // Nếu API chỉ trả về một mảng (giả định total là length của mảng)
          state.supplies = action.payload || [];
          state.pagination.total = (action.payload && action.payload.length) || 0;
        }
      })
      .addCase(fetchMedicalSupplies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.supplies = []; // Clear supplies on error
      })

      // getMedicalSupplyByID
      .addCase(getMedicalSupplyByID.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedSupply = null;
      })
      .addCase(getMedicalSupplyByID.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSupply = action.payload;
      })
      .addCase(getMedicalSupplyByID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedSupply = null;
      });
  },
});

export const { setMedicalSuppliesPagination, clearMedicalSuppliesError, resetMedicalSuppliesState } =
  medicalSuppliesSlice.actions;

export default medicalSuppliesSlice.reducer;
