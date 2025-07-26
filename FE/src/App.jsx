// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";

// Role constants
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_NURSE, ROLE_PARENT } from "./data/role";

// Public Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DocumentDetail from "./pages/DocumentDetail";
import SupportPage from "./pages/SupportPage/SupportPage";
import ForgotPassword from "./pages/ForgotPaswordPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Admin
import AdminLayOut from "./lay-outs/AdminLayOut";
import AdminOverViewPage from "./pages/AdminPage/AdminOverViewPage";
import NurseManagementPage from "./pages/AdminPage/NurseManagementPage";
import ParentManagementPage from "./pages/AdminPage/ParentManagementPage";
import ManagerManagementPage from "./pages/AdminPage/ManagerManagementPage";

// Nurse
import SchoolNurseLayOut from "./lay-outs/SchoolNurseLayOut";
import SchoolNurseOverView from "./pages/SchoolNursePage/SchoolNurseOverView";
import StudentRecordPage from "./pages/SchoolNursePage/StudentRecordPage ";
import StudentRecordPageDetail from "./pages/SchoolNursePage/StudentRecordPageDetail";
import SchoolNurseMedicalSupplyPage from "./pages/SchoolNursePage/SchoolNurseMedicalSupplyPage";
import MedicalIncident from "./pages/SchoolNursePage/MedicalIncident";
import Vaccinations from "./pages/SchoolNursePage/Vaccinations";
import Examinations from "./pages/SchoolNursePage/Examinations";
import ReportsPage from "./pages/SchoolNursePage/Report";
import NurseProfile from "./pages/SchoolNursePage/NurseProfile";
import MedicalSubmission from "./pages/SchoolNursePage/MedicalSubmission";

// Manager
import ManagerLayOut from "./lay-outs/ManagerLayOut";
import ManagerOverViewPage from "./pages/ManagerPage/ManagerOverViewPage";
import ManagerApprovalRequestsPage from "./pages/ManagerPage/AppointmentApporvePage";

// Parent
import ParentLayOut from "./lay-outs/ParentLayOut";
import ParentDashboard from "./pages/ParentPage/ParentDashboard";
import ChildrenInfoPage from "./pages/ParentPage/ChildrenInfoPage";
import HealthRecordsPage from "./pages/ParentPage/HealthRecordsPage";
import VaccinationsPage from "./pages/ParentPage/VaccinationsPage";
import MedicineRequestPage from "./pages/ParentPage/MedicineRequestPage";
import AppointmentRequestPage from "./pages/ParentPage/AppointmentRequestPage";
import ParentProfilePage from "./pages/ParentPage/ParentProfilePage";
import ParentNotificationsPage from "./pages/ParentPage/ParentNotificationsPage";
import MedicalIncidentsPage from "./pages/ParentPage/MedicalIncidentsPage";
import ParentCheckUp from "./pages/ParentPage/ParentCheckUp";
import SupportRequestPage from "./pages/ParentPage/SupportRequestPage";

// Shared
import RoleProtectedRoute from "./RoleProtectedRoute";
import { initializeAuth } from "./redux/auth/authSlice";
import { fetchAllVaccineCampaigns } from "./redux/nurse/vaccinations/vaccinationSlice";
import { fetchAllStudentHealthRecords } from "./redux/nurse/studentRecords/studentRecord";
import { fetchMedicalSupplies } from "./redux/nurse/medicalSupplies/medicalSupplies";
import { fetchAllMedicalIncidents } from "./redux/nurse/medicalIncidents/medicalIncidents";
import { fetchAllHealthExaminations } from "./redux/nurse/heathExaminations/heathExamination";
import { fetchManagerNotifications } from "./redux/manager/managerNotificationSlice";
import { fetchNurseNotifications } from "./redux/nurse/nurseNotificationSlice";
import ClassMangerPage from "./pages/AdminPage/ClassMangerPage";
import ClassMangerPageDetail from "./pages/AdminPage/ClassMangerPageDetail";

function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("accessToken");

  // Gom các dispatch fetch vào một hàm riêng
  const fetchInitialData = () => {
    dispatch(fetchAllVaccineCampaigns());
    dispatch(fetchAllStudentHealthRecords());
    dispatch(fetchMedicalSupplies());
    dispatch(fetchAllMedicalIncidents({ page: 1, limit: 10 }));
    dispatch(fetchAllHealthExaminations());
    dispatch(fetchManagerNotifications({ page: 1, limit: 10 }));
    dispatch(fetchNurseNotifications());
  };

  useEffect(() => {
    dispatch(initializeAuth());
    if (token) {
      fetchInitialData();
    }
  }, [dispatch, token]);

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
        <Route path="class-manager" element={<ClassMangerPage />} />
        <Route path="class-manager/:id" element={<ClassMangerPageDetail />} />
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
          path="students-record/:id"
          element={<StudentRecordPageDetail />}
        />
        <Route
          path="medical-supplies"
          element={<SchoolNurseMedicalSupplyPage />}
        />
        <Route path="medical-incidents" element={<MedicalIncident />} />
        <Route path="vaccinations" element={<Vaccinations />} />
        <Route path="checkups" element={<Examinations />} />
        <Route path="report" element={<ReportsPage />} />
        <Route path="medical-submission" element={<MedicalSubmission />} />
        <Route path="profile" element={<NurseProfile />} />
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
        <Route
          path="appointment-request"
          element={<AppointmentRequestPage />}
        />
        <Route path="notifications" element={<ParentNotificationsPage />} />
        <Route path="medical-incidents" element={<MedicalIncidentsPage />} />
        <Route path="checkup" element={<ParentCheckUp />} />
        <Route path="support-request" element={<SupportRequestPage />} />
      </Route>

      {/* Catch-all route for unmatched paths (404) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
