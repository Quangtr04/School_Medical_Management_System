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

    {
      path: "/admin",
      element: <AdminLayOut />,
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
        // {
        //   path: "add-document",
        //   element: <AddDocumentPage />,
        // },
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
  ]);

  return (
    <>
      <RouterProvider router={router} />,
    </>
  );
}

export default App;
