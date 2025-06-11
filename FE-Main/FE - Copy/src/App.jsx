import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DocumentDetail from "./pages/DocumentDetail";
import HomePageParent from "./ParentPages/HomePage";
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
    // {
    //   path: "/parent-homepage",
    //   element: <HomePageParent />,
    // },
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
