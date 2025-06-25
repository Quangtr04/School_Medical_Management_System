import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DocumentDetail from "./pages/DocumentDetail";
import SupportPage from "./pages/SupportPage/SupportPage";

import AdminLayOut from "./lay-outs/AdminLayOut";
import NurseManagementPage from "./pages/AdminPage/NurseManagementPage";
import ParentManagementPage from "./pages/AdminPage/ParentManagementPage";
import ManagerManagementPage from "./pages/AdminPage/ManagerManagementPage";
import AdminOverViewPage from "./pages/AdminPage/AdminOverViewPage";
import FileManagementSection from "./Admin-component/File-Management/FileManagementSection";
import ForgotPassword from "./pages/ForgotPaswordPage";
import AdminSettingPage from "./pages/AdminPage/AdminSettingPage";
import SystemActivityPage from "./Admin-component/Admin-SystemMonitor/SystemActivityPage";
import SchoolNurseLayOut from "./lay-outs/SchoolNurseLayOut";
import SchoolNurseOverView from "./pages/SchoolNursePage/SchoolNurseOverView";
import StudentRecordPage from "./pages/SchoolNursePage/StudentRecordPage ";
import SchoolNurseMedicalSupplyPage from "./pages/SchoolNursePage/SchoolNurseMedicalSupplyPage";
import MedicalIncident from "./pages/SchoolNursePage/MedicalIncident";
import Vaccinations from "./pages/SchoolNursePage/Vaccinations";
import Examinations from "./pages/SchoolNursePage/Examinations";
import Notification from "./pages/SchoolNursePage/Notification";
import ReportsPage from "./pages/SchoolNursePage/Report";

// Parent imports
import ParentLayOut from "./lay-outs/ParentLayOut";
import ParentDashboard from "./pages/ParentPage/ParentDashboard";
import ChildrenInfoPage from "./pages/ParentPage/ChildrenInfoPage";
import HealthRecordsPage from "./pages/ParentPage/HealthRecordsPage";
import VaccinationsPage from "./pages/ParentPage/VaccinationsPage";
import MedicineRequestPage from "./pages/ParentPage/MedicineRequestPage";

function App() {
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
      element: <DocumentDetail />,
    },
    {
      path: "/support",
      element: <SupportPage />,
    },

    // Route gốc của Admin được bọc bởi AdminRoute
    {
      path: "/admin",
      element: <AdminRoute />, // Dùng AdminRoute ở đây để bảo vệ
      children: [
        {
          // Khi truy cập /admin (path index), hiển thị AdminLayOut và sau đó AdminOverViewPage
          // AdminLayOut sẽ được hiển thị trong <Outlet /> của AdminRoute
          // AdminOverViewPage sẽ được hiển thị trong <Outlet /> của AdminLayOut
          element: <AdminLayOut />, // Layout cho các trang admin
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
    {
      path: "/nurse",
      element: <SchoolNurseLayOut />,
      children: [
        { index: true, element: <SchoolNurseOverView /> },
        { path: "students-record", element: <StudentRecordPage /> },
        { path: "medical-supplies", element: <SchoolNurseMedicalSupplyPage /> },
        { path: "medical-incidents", element: <MedicalIncident /> },
        { path: "vaccinations", element: <Vaccinations /> },
        { path: "examinations", element: <Examinations /> },
        { path: "notifications", element: <Notification /> },
        { path: "report", element: <ReportsPage /> },
      ],
    },

    //Parent routes
    {
      path: "/parent",
      element: <ParentLayOut />,
      children: [
        { index: true, element: <ParentDashboard /> },
        { path: "children", element: <ChildrenInfoPage /> },
        { path: "health-records", element: <HealthRecordsPage /> },
        { path: "vaccinations", element: <VaccinationsPage /> },
        { path: "medicine-request", element: <MedicineRequestPage /> },
        // Add more parent pages here as needed
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />,
    </>
  );
}

export default App;
