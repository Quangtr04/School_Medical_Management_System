// redux/manager/managerNotificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

export const fetchManagerNotifications = createAsyncThunk("managerNotifications/fetch", async () => {
  const res = await api.get("/manager/notifications"); // Đường dẫn tùy backend
  console.log(res.data.items);

  return res.data.items;
});

const managerNotificationSlice = createSlice({
  name: "managerNotifications",
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {
    markManagerNotificationAsRead: (state, action) => {
      const id = action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) state.items[index].read = true;
    },
    markManagerAllAsRead: (state) => {
      state.items = state.items.map((item) => ({ ...item, read: true }));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchManagerNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchManagerNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchManagerNotifications.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { markManagerNotificationAsRead, markManagerAllAsRead } = managerNotificationSlice.actions;

export default managerNotificationSlice.reducer;
