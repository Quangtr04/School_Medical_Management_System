import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DocumentDetail from "./pages/DocumentDetail";
import ParentPage from "./pages/ParentPage";
import MedicationRequestPage from "./pages/MedicationRequestPage";
import ProfilePage from "./pages/ProfilePage";
import AppointmentPage from "./pages/AppointmentPage";
import SupportPage from "./pages/SupportPage/SupportPage";
import { DocumentsSection } from "./components/DocumentSection";

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
      path: "/parent",
      element: <ParentPage />,
    },
    {
      path: "/parent/medication-request",
      element: <MedicationRequestPage />,
    },
    {
      path: "/parent/profile",
      element: <ProfilePage />,
    },
    {
      path: "/parent/appointment",
      element: <AppointmentPage />,
    },
    {
      path: "/parent/appointment",
      element: <AppointmentPage />,
    },
    {
      path: "/admin/homepage",
      element: <HomePage />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />,
    </>
  );
}

export default App;
