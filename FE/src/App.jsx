// src/App.jsx
import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
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

  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/documents/:id",
      element: <DocumentDetail />, // Consider wrapping with a general PrivateRoute if only logged-in users can view docs
    },
    {
      path: "/support",
      element: <SupportPage />, // Consider wrapping with a general PrivateRoute
    },
    {
      path: "/unauthorized", // Route for access denied messages
      element: <UnauthorizedPage />,
    },

    // Admin Routes - Protected by Admin Role
    {
      path: "/admin",
      element: <RoleProtectedRoute allowedRoles={[ROLE_ADMIN]} />, // Protects /admin and its children
      children: [
        {
          element: <AdminLayOut />, // This layout will be rendered within RoleProtectedRoute's Outlet
          children: [
            {
              index: true,
              element: <AdminOverViewPage />,
            },
            {
              path: "nurses",
              element: <NurseManagementPage />,
            },
            {
              path: "parents",
              element: <ParentManagementPage />,
            },
            {
              path: "managers",
              element: <ManagerManagementPage />,
            },
            {
              path: "files",
              element: <FileManagementSection />,
            },
            {
              path: "settings",
              element: <AdminSettingPage />,
            },
            {
              path: "monitor",
              element: <SystemActivityPage />,
            },
          ],
        },
      ],
    },

    // Nurse Routes - Protected by Nurse Role
    {
      path: "/nurse",
      element: <RoleProtectedRoute allowedRoles={[ROLE_NURSE]} />, // Protects /nurse and its children
      children: [
        {
          element: <SchoolNurseLayOut />, // This layout will be rendered within RoleProtectedRoute's Outlet
          children: [
            { index: true, element: <SchoolNurseOverView /> },
            { path: "students-record", element: <StudentRecordPage /> },
            {
              path: "medical-supplies",
              element: <SchoolNurseMedicalSupplyPage />,
            },
            { path: "medical-incidents", element: <MedicalIncident /> },
            { path: "vaccinations", element: <Vaccinations /> },
            { path: "examinations", element: <Examinations /> },
            { path: "notifications", element: <Notification /> },
            { path: "report", element: <ReportsPage /> },
          ],
        },
      ],
    },

    // Manager Routes - Protected by Manager Role
    {
      path: "/manager",
      element: <RoleProtectedRoute allowedRoles={[ROLE_MANAGER]} />, // Protects /manager and its children
      children: [
        {
          element: <ManagerLayOut />, // This layout will be rendered within RoleProtectedRoute's Outlet
          children: [
            { index: true, element: <ManagerOverViewPage /> },
            {
              path: "appoinment-apporve",
              element: <ManagerApprovalRequestsPage />,
            },
          ],
        },
      ],
    },

    // Parent Routes - Protected by Parent Role
    {
      path: "/parent",
      element: <RoleProtectedRoute allowedRoles={[ROLE_PARENT]} />, // Protects /parent and its children
      children: [
        {
          element: <ParentLayOut />, // This layout will be rendered within RoleProtectedRoute's Outlet
          children: [
            { index: true, element: <ParentDashboard /> },
            { path: "children", element: <ChildrenInfoPage /> },
            { path: "health-records", element: <HealthRecordsPage /> },
            { path: "vaccinations", element: <VaccinationsPage /> },
            { path: "medicine-request", element: <MedicineRequestPage /> },
            // Add more parent pages here as needed
          ],
        },
      ],
    },

    // Catch-all route for unmatched paths (404)
    {
      path: "*",
      element: <Navigate to="/" replace />, // Redirect to home or a 404 page
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
