/* eslint-disable no-unused-vars */
// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { message } from "antd"; // Import Ant Design message for notifications

// Import actions from authSlice for notification and initial auth check

// Import Role Protected Route

// Import Role Constants (create this file if it doesn't exist)
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_NURSE, ROLE_PARENT } from "./data/role"; // Adjust path as needed

// Public Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DocumentDetail from "./pages/DocumentDetail";
import SupportPage from "./pages/SupportPage/SupportPage";
import ForgotPassword from "./pages/ForgotPaswordPage";
import UnauthorizedPage from "./pages/UnauthorizedPage"; // Create this page for unauthorized access

// Admin Pages and Layout
import AdminLayOut from "./lay-outs/AdminLayOut";
import AdminOverViewPage from "./pages/AdminPage/AdminOverViewPage";
import NurseManagementPage from "./pages/AdminPage/NurseManagementPage";
import ParentManagementPage from "./pages/AdminPage/ParentManagementPage";
import ManagerManagementPage from "./pages/AdminPage/ManagerManagementPage";
import FileManagementSection from "./Admin-component/File-Management/FileManagementSection";
import AdminSettingPage from "./pages/AdminPage/AdminSettingPage";
import SystemActivityPage from "./Admin-component/Admin-SystemMonitor/SystemActivityPage";

// Nurse Pages and Layout
import SchoolNurseLayOut from "./lay-outs/SchoolNurseLayOut";
import SchoolNurseOverView from "./pages/SchoolNursePage/SchoolNurseOverView";
import StudentRecordPage from "./pages/SchoolNursePage/StudentRecordPage ";
import SchoolNurseMedicalSupplyPage from "./pages/SchoolNursePage/SchoolNurseMedicalSupplyPage";
import MedicalIncident from "./pages/SchoolNursePage/MedicalIncident";
import Vaccinations from "./pages/SchoolNursePage/Vaccinations";
import Examinations from "./pages/SchoolNursePage/Examinations";
import Notification from "./pages/SchoolNursePage/Notification"; // This seems to be a page, not the Ant Design component
import ReportsPage from "./pages/SchoolNursePage/Report";

// Manager Pages and Layout
import ManagerLayOut from "./lay-outs/ManagerLayOut";
import ManagerOverViewPage from "./pages/ManagerPage/ManagerOverViewPage";
import ManagerApprovalRequestsPage from "./pages/ManagerPage/AppointmentApporvePage";

// Parent Pages and Layout
import ParentLayOut from "./lay-outs/ParentLayOut";
import ParentDashboard from "./pages/ParentPage/ParentDashboard";
import ChildrenInfoPage from "./pages/ParentPage/ChildrenInfoPage";
import HealthRecordsPage from "./pages/ParentPage/HealthRecordsPage";
import VaccinationsPage from "./pages/ParentPage/VaccinationsPage";
import MedicineRequestPage from "./pages/ParentPage/MedicineRequestPage";
import ParentProfilePage from "./pages/ParentPage/ParentProfilePage";
import RoleProtectedRoute from "./RoleProtectedRoute";
import {
  setNotification,
  clearNotification,
  initializeAuth,
} from "./redux/auth/authSlice";

function App() {
  const dispatch = useDispatch();
  const { notificationMessage, notificationType } = useSelector(
    (state) => state.auth
  );

  // Initialize authentication state from localStorage when the app mounts
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Effect to display notifications from Redux state using Ant Design's message
  useEffect(() => {
    if (notificationMessage) {
      switch (notificationType) {
        case "success":
          message.success(notificationMessage);
          break;
        case "error":
          message.error(notificationMessage);
          break;
        case "info":
          message.info(notificationMessage);
          break;
        case "warning":
          message.warning(notificationMessage);
          break;
        default:
          message.info(notificationMessage); // Default to info if type is not specified
      }
      // Clear the notification from Redux state after displaying
      dispatch(clearNotification());
    }
  }, [notificationMessage, notificationType, dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/documents/:id" element={<DocumentDetail />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute
            element={<AdminLayOut />}
            allowedRoles={[ROLE_ADMIN]}
          />
        }
      >
        <Route index element={<AdminOverViewPage />} />
        <Route path="nurses" element={<NurseManagementPage />} />
        <Route path="parents" element={<ParentManagementPage />} />
        <Route path="managers" element={<ManagerManagementPage />} />
        <Route path="files" element={<FileManagementSection />} />
        <Route path="settings" element={<AdminSettingPage />} />
        <Route path="monitor" element={<SystemActivityPage />} />
      </Route>

      {/* Nurse Routes */}
      <Route
        path="/nurse"
        element={
          <RoleProtectedRoute
            element={<SchoolNurseLayOut />}
            allowedRoles={[ROLE_NURSE]}
          />
        }
      >
        <Route index element={<SchoolNurseOverView />} />
        <Route path="students-record" element={<StudentRecordPage />} />
        <Route
          path="medical-supplies"
          element={<SchoolNurseMedicalSupplyPage />}
        />
        <Route path="medical-incidents" element={<MedicalIncident />} />
        <Route path="vaccinations" element={<Vaccinations />} />
        <Route path="checkups" element={<Examinations />} />
        <Route path="notifications" element={<Notification />} />
        <Route path="report" element={<ReportsPage />} />
      </Route>

      {/* Manager Routes */}
      <Route
        path="/manager"
        element={
          <RoleProtectedRoute
            element={<ManagerLayOut />}
            allowedRoles={[ROLE_MANAGER]}
          />
        }
      >
        <Route index element={<ManagerOverViewPage />} />
        <Route
          path="appoinment-apporve"
          element={<ManagerApprovalRequestsPage />}
        />
      </Route>

      {/* Parent Routes */}
      <Route
        path="/parent"
        element={
          <RoleProtectedRoute
            element={<ParentLayOut />}
            allowedRoles={[ROLE_PARENT]}
          />
        }
      >
        <Route index element={<ParentDashboard />} />
        <Route path="children" element={<ChildrenInfoPage />} />
        <Route path="profile" element={<ParentProfilePage />} />
        <Route path="health-records" element={<HealthRecordsPage />} />
        <Route path="vaccinations" element={<VaccinationsPage />} />
        <Route path="medicine-request" element={<MedicineRequestPage />} />
      </Route>

      {/* Catch-all route for unmatched paths (404) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
