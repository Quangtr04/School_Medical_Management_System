import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

export const fetchNurseNotifications = createAsyncThunk("notifications/fetch", async (_, thunkAPI) => {
  try {
    const res = await api.get("/nurse/notifications");
    console.log(res.data.items);

    return res.data.items;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Lỗi tải thông báo");
  }
});

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    markAsRead(state, action) {
      const id = action.payload;
      const notif = state.list.find((item) => item.notification_id === id);
      if (notif) notif.read = true;
    },
    markAllAsRead(state) {
      state.list = state.list.map((n) => ({ ...n, read: true }));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNurseNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNurseNotifications.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchNurseNotifications.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
