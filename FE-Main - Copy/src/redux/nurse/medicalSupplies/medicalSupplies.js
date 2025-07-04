// src/redux/nurse/medicalSupplies/medicalSuppliesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../configs/config-axios"; // Điều chỉnh đường dẫn đến instance axios của bạn

const initialState = {
  supplies: [],
  selectedSupply: null, // Thêm để lưu thông tin vật tư theo ID nếu cần
  pagination: {
    current: 1,
    pageSize: 9,
    total: 0,
  },
  loading: false,
  error: null,
};

export const fetchMedicalSupplies = createAsyncThunk(
  "medicalSupplies/fetchSupplies",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/nurse/medical-supplies");

      return {
        records: response.data.data,
        total: response.data.data.length,
      };
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
      const response = await api.get(`/nurse/medical-supplies/${supplyId}`);
      return response.data.data; // Giả định API trả về chi tiết vật tư trong response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tải chi tiết vật tư thất bại.");
    }
  }
);

// Cập nhật ngày hết hạn cho vật tư y tế
export const updateExpiredDate = createAsyncThunk(
  "medicalSupplies/updateExpiredDate",
  async ({ supplyId, expired_date, quantity, is_active }, { rejectWithValue }) => {
    console.log("SuppID:", supplyId);

    try {
      const response = await api.patch(`/nurse/medical-supplies/${supplyId}/update`, {
        expired_date,
        quantity,
        is_active,
      });
      console.log(response);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Cập nhật ngày hết hạn thất bại.");
    }
  }
);

// Nhập vật tư y tế mới
export const addNewMedicalSupply = createAsyncThunk(
  "medicalSupplies/addNewMedicalSupply",
  async (newSupplyData, { rejectWithValue }) => {
    try {
      console.log("New Supply:", newSupplyData);

      const response = await api.post("/nurse/medical-supplies/create", newSupplyData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Thêm vật tư mới thất bại.");
    }
  }
);

// Thêm số lượng vào vật tư đã có
export const addQuantityToExistingSupply = createAsyncThunk(
  "medicalSupplies/addQuantityToExistingSupply",
  async ({ supplyId, addedQuantity }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/nurse/medical-supplies/${supplyId}/increase`, {
        quantity: addedQuantity,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Cập nhật số lượng thất bại.");
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
      })
      // updateExpiredDate
      .addCase(updateExpiredDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpiredDate.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSupply = action.payload; // Cập nhật lại dữ liệu chi tiết
      })
      .addCase(updateExpiredDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addNewMedicalSupply
      .addCase(addNewMedicalSupply.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewMedicalSupply.fulfilled, (state, action) => {
        state.loading = false;
        state.supplies = [action.payload, ...state.supplies]; // Thêm mới vào đầu danh sách
        state.pagination.total += 1;
      })
      .addCase(addNewMedicalSupply.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addQuantityToExistingSupply
      .addCase(addQuantityToExistingSupply.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuantityToExistingSupply.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật lại vật tư tương ứng trong danh sách
        const updatedSupply = action.payload;
        state.supplies = state.supplies.map((supply) =>
          supply.supply_id === updatedSupply.supply_id ? updatedSupply : supply
        );
      })
      .addCase(addQuantityToExistingSupply.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setMedicalSuppliesPagination, clearMedicalSuppliesError, resetMedicalSuppliesState } =
  medicalSuppliesSlice.actions;

export default medicalSuppliesSlice.reducer;
