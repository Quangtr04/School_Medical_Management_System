/* eslint-disable no-unused-vars */
// src/redux/nurse/healthExaminations/healthExaminationsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../configs/config-axios"; // Điều chỉnh đường dẫn đến instance axios của bạn

const initialState = {
  records: [], // Danh sách tất cả các lịch khám
  recordDetail: null, // Chi tiết của một lịch khám theo ID (có thể là Approved/Declined)
  approvedStudents: [], // Danh sách học sinh đã được duyệt để khám (từ API /checkups-approved của phần trước)
  approvedCheckups: [], // Danh sách lịch khám đã được duyệt
  approvedCheckupDetail: null, // Chi tiết lịch khám đã được duyệt
  declinedCheckups: [], // Danh sách lịch khám bị từ chối
  declinedCheckupDetail: null, // Chi tiết lịch khám bị từ chối
  loading: false, // Trạng thái tải chung cho slice này
  error: null, // Thông báo lỗi nếu có
  success: false, // Chỉ báo thành công cho các hoạt động CUD
};

// 1. Async Thunk để tạo lịch khám sức khỏe (POST /checkups/create)
export const createHealthExaminationSchedule = createAsyncThunk(
  "healthExaminations/createSchedule",
  async (scheduleData, { rejectWithValue }) => {
    try {
      // Đảm bảo endpoint này khớp với backend của bạn
      const response = await api.post("/nurse/checkups/create", scheduleData); // Bỏ /api/ nếu config-axios đã có base URL
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tạo lịch khám sức khỏe thất bại.");
    }
  }
);

// 2. Async Thunk để xem danh sách tất cả lịch khám (GET /checkups)
export const fetchAllHealthExaminations = createAsyncThunk(
  "healthExaminations/fetchAll",
  async (params, { rejectWithValue }) => {
    // Thêm params để truyền page, pageSize, search, class
    try {
      // Đảm bảo endpoint này khớp với backend của bạn
      const response = await api.get("/nurse/checkups", { params }); // Bỏ /api/ nếu config-axios đã có base URL
      // API của bạn cần trả về tổng số lượng và data trong 1 object để pagination hoạt động đúng
      return response.data; // Giả định response.data có { checkups: [], total: N }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tải danh sách lịch khám thất bại.");
    }
  }
);

// 3. Async Thunk để xem chi tiết một lịch khám theo ID (GET /checkups/:id)
export const fetchHealthExaminationById = createAsyncThunk(
  "healthExaminations/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/nurse/checkups/${id}`); // Bỏ /api/ nếu config-axios đã có base URL
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `Tải chi tiết lịch khám ID ${id} thất bại.`);
    }
  }
);

// 4. Async Thunk để lưu kết quả khám sức khỏe cho học sinh (POST /checkups/:check_id/students/:student_id/result)
export const saveHealthCheckupResult = createAsyncThunk(
  "healthExaminations/saveResult",
  async ({ check_id, student_id, resultData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/nurse/checkups/${check_id}/students/${student_id}/result`, resultData); // Bỏ /api/ nếu config-axios đã có base URL
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lưu kết quả khám sức khỏe thất bại.");
    }
  }
);

// 5. Async Thunk để cập nhật ghi chú (note) cho học sinh trong lịch khám (PATCH /checkups/:checkup_id/students/:student_id/note)
export const updateCheckupNote = createAsyncThunk(
  "healthExaminations/updateNote",
  async ({ checkup_id, student_id, note }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/nurse/checkups/${checkup_id}/students/${student_id}/note`, // Bỏ /api/ nếu config-axios đã có base URL
        { note } // Body gửi đi là đối tượng chứa ghi chú
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Cập nhật ghi chú thất bại.");
    }
  }
);

// --- THÊM THUNKS CHO UPDATE VÀ DELETE LỊCH KHÁM ---
// 6. Async Thunk để cập nhật lịch khám (PUT /nurse/checkups/:id)
export const updateHealthExaminationSchedule = createAsyncThunk(
  "healthExaminations/updateSchedule",
  async ({ id, scheduleData }, { rejectWithValue }) => {
    try {
      // Đảm bảo endpoint này khớp với backend của bạn
      const response = await api.put(`/nurse/checkups/${id}`, scheduleData); // Bỏ /api/ nếu config-axios đã có base URL
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `Cập nhật lịch khám ID ${id} thất bại.`);
    }
  }
);

// 7. Async Thunk để xóa lịch khám (DELETE /nurse/checkups/:id)
export const deleteHealthExaminationSchedule = createAsyncThunk(
  "healthExaminations/deleteSchedule",
  async (id, { rejectWithValue }) => {
    try {
      // Đảm bảo endpoint này khớp với backend của bạn
      const response = await api.delete(`/nurse/checkups/${id}`); // Bỏ /api/ nếu config-axios đã có base URL
      return response.data.data; // Hoặc một thông báo thành công
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `Xóa lịch khám ID ${id} thất bại.`);
    }
  }
);

// Các thunks này có thể không cần thiết nếu bạn chỉ quản lý "lịch khám" chung
// và không phân biệt Approved/Declined ở cấp độ Redux slice này,
// mà chỉ dùng cho các trang/component cụ thể khác.
// Nếu bạn không dùng chúng trong ExaminationPage, bạn có thể bỏ qua việc fetchApprovedStudentsForCheckup.
// export const fetchApprovedStudentsForCheckup = createAsyncThunk(...);
// export const fetchApprovedCheckups = createAsyncThunk(...);
// export const fetchApprovedCheckupById = createAsyncThunk(...);
// export const fetchDeclinedCheckups = createAsyncThunk(...);
// export const fetchDeclinedCheckupById = createAsyncThunk(...);

const healthExaminationsSlice = createSlice({
  name: "healthExaminations",
  initialState,
  reducers: {
    clearHealthExaminationsError: (state) => {
      state.error = null;
    },
    clearHealthExaminationsSuccess: (state) => {
      state.success = false;
    },
    clearHealthExaminationDetail: (state) => {
      state.recordDetail = null;
    },
    // Bạn có thể giữ hoặc bỏ các clear chi tiết cho Approved/Declined tùy thuộc vào việc bạn dùng chúng ở đâu
    clearApprovedCheckupDetail: (state) => {
      state.approvedCheckupDetail = null;
    },
    clearDeclinedCheckupDetail: (state) => {
      state.declinedCheckupDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createHealthExaminationSchedule
      .addCase(createHealthExaminationSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createHealthExaminationSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.records.push(action.payload); // Thêm lịch khám mới vào danh sách
      })
      .addCase(createHealthExaminationSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // fetchAllHealthExaminations
      .addCase(fetchAllHealthExaminations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllHealthExaminations.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.checkups; // Giả định API trả về { checkups: [...], total: N }
        // Cần cập nhật pagination total ở component, không phải ở slice
      })
      .addCase(fetchAllHealthExaminations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.records = [];
      })

      // updateHealthExaminationSchedule
      .addCase(updateHealthExaminationSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateHealthExaminationSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Cập nhật lịch khám trong danh sách records
        const index = state.records.findIndex((record) => record.id === action.payload.id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
      })
      .addCase(updateHealthExaminationSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // deleteHealthExaminationSchedule
      .addCase(deleteHealthExaminationSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteHealthExaminationSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Xóa lịch khám khỏi danh sách records
        state.records = state.records.filter(
          (record) => record.id !== action.meta.arg // action.meta.arg là ID được truyền vào thunk
        );
      })
      .addCase(deleteHealthExaminationSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Các reducers khác cho fetchHealthExaminationById, saveHealthCheckupResult, updateCheckupNote,
      // fetchApprovedCheckups, fetchApprovedCheckupById, fetchDeclinedCheckups, fetchDeclinedCheckupById
      // (giữ nguyên hoặc điều chỉnh tùy theo nhu cầu sử dụng)
      // ... (Phần này bạn có thể giữ nguyên từ code cũ của bạn)
      .addCase(fetchHealthExaminationById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.recordDetail = null;
      })
      .addCase(fetchHealthExaminationById.fulfilled, (state, action) => {
        state.loading = false;
        state.recordDetail = action.payload;
      })
      .addCase(fetchHealthExaminationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.recordDetail = null;
      })

      // You might not need fetchApprovedStudentsForCheckup here if it's not used directly
      // .addCase(fetchApprovedStudentsForCheckup.pending, (state) => { /* ... */ })
      // .addCase(fetchApprovedStudentsForCheckup.fulfilled, (state, action) => { /* ... */ })
      // .addCase(fetchApprovedStudentsForCheckup.rejected, (state, action) => { /* ... */ })

      .addCase(saveHealthCheckupResult.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(saveHealthCheckupResult.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(saveHealthCheckupResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      .addCase(updateCheckupNote.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCheckupNote.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        // Cập nhật ghi chú trong recordDetail nếu đang xem
        // Logic này phức tạp hơn, cần tìm đúng student trong recordDetail.students
        // if (state.recordDetail && state.recordDetail.id === action.payload.checkup_id) {
        //   state.recordDetail.students = state.recordDetail.students.map(student =>
        //     student.student_id === action.payload.student_id ? { ...student, note: action.payload.note } : student
        //   );
        // }
      });
    // .addCase(updateCheckupNote.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    //   state.success = false;
    // })

    // // Keep others if needed elsewhere
    // .addCase(fetchApprovedCheckups.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    // })
    // .addCase(fetchApprovedCheckups.fulfilled, (state, action) => {
    //   state.loading = false;
    //   state.approvedCheckups = action.payload;
    // })
    // .addCase(fetchApprovedCheckups.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    //   state.approvedCheckups = [];
    // })

    // .addCase(fetchApprovedCheckupById.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    //   state.approvedCheckupDetail = null;
    // })
    // .addCase(fetchApprovedCheckupById.fulfilled, (state, action) => {
    //   state.loading = false;
    //   state.approvedCheckupDetail = action.payload;
    // })
    // .addCase(fetchApprovedCheckupById.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    //   state.approvedCheckupDetail = null;
    // })

    // .addCase(fetchDeclinedCheckups.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    // })
    // .addCase(fetchDeclinedCheckups.fulfilled, (state, action) => {
    //   state.loading = false;
    //   state.declinedCheckups = action.payload;
    // })
    // .addCase(fetchDeclinedCheckups.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    //   state.declinedCheckups = [];
    // })

    // .addCase(fetchDeclinedCheckupById.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    //   state.declinedCheckupDetail = null;
    // })
    // .addCase(fetchDeclinedCheckupById.fulfilled, (state, action) => {
    //   state.loading = false;
    //   state.declinedCheckupDetail = action.payload;
    // })
    // .addCase(fetchDeclinedCheckupById.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    //   state.declinedCheckupDetail = null;
    // });
  },
});

export const {
  clearHealthExaminationsError,
  clearHealthExaminationsSuccess,
  clearHealthExaminationDetail,
  clearApprovedCheckupDetail,
  clearDeclinedCheckupDetail,
} = healthExaminationsSlice.actions;

export default healthExaminationsSlice.reducer;
