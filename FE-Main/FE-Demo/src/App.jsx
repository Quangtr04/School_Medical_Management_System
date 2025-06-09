import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DocumentDetail from "./components/DocumentDetail";
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
  ]);

  return (
    <>
      <RouterProvider router={router} />,
    </>
  );
}

export default App;
