import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DocumentDetail from "./pages/DocumentDetail";
import SupportPage from "./pages/SupportPage/SupportPage";

import AdminDashboard from "./pages/AdminPage/AdminDashboard";
import AdminLayOut from "./lay-outs/AdminLayOut";
import NurseManagementPage from "./pages/AdminPage/NurseManagementPage";
import ParentManagementPage from "./pages/AdminPage/ParentManagementPage";
import ManagerManagementPage from "./pages/AdminPage/ManagerManagementPage";
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
          element: <AdminDashboard />,
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
        // {
        //   path: "add-document",
        //   element: <AddDocumentPage />,
        // },
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
