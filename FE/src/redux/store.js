// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice"; // Import reducer từ authSlice
import adminReducer from "./admin/adminSlice"; // Import adminSlice
import dashboardReducer from "./dashboard/dashboardSlice"; // <-- Thêm dòng này
import medicalsuppliesReducer from "./nurse/medicalSupplies/medicalSupplies";
import examinationReducer from "./nurse/heathExaminations/heathExamination";
import incidentsReducer from "./nurse/medicalIncidents/medicalIncidents";
import immunizationsReducer from "./nurse/vaccinations/vaccinationSlice";
import studentRecordReducer from "./nurse/studentRecords/studentRecord";
import managerReducer from "./manager/managerSlice";
import managerNotificationReducer from "./manager/managerNotificationSlice";
import notificationReducer from "./nurse/nurseNotificationSlice";
import medicationSubmissionReducer from "./nurse/medicalSubmission/medicalSubmisstionSlice";
import parentReducer from "./parent/parentSlice";
import logReducer from "./nurse/dailylogs/dailyLogSlice";

const store = configureStore({
  reducer: {
    auth: authReducer, // Đăng ký authReducer dưới key 'auth'
    admin: adminReducer,
    dashboard: dashboardReducer,
    medicalSupplies: medicalsuppliesReducer,
    examination: examinationReducer,
    medicalIncidents: incidentsReducer,
    vaccination: immunizationsReducer,
    studentRecord: studentRecordReducer,
    manager: managerReducer,
    notifications: notificationReducer,
    managerNotifications: managerNotificationReducer,
    medicationSubmission: medicationSubmissionReducer,
    parent: parentReducer,
    logs: logReducer,
  },
  // DevTools được bật mặc định trong môi trường phát triển
});

export default store;
