// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice"; // Import reducer từ authSlice
import adminReducer from "./admin/adminSlice"; // Import adminSlice
import dashboardReducer from "./dashboard/dashboardSlice"; // <-- Thêm dòng này
import medicalsuppliesReducer from "./nurse/medicalSupplies/medicalSupplies";
import examinationReducer from "./nurse/heathExaminations/heathExamination";
import incidentsReducer from "./nurse/medicalIncidents/medicalIncidents";
import immunizationsReducer from "./nurse/vaccinations/vaccinationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer, // Đăng ký authReducer dưới key 'auth'
    admin: adminReducer,
    dashboard: dashboardReducer,
    medicalSupplies: medicalsuppliesReducer,
    examination: examinationReducer,
    medicalIncidents: incidentsReducer,
    vaccination: immunizationsReducer,
  },
  // DevTools được bật mặc định trong môi trường phát triển
});

export default store;
