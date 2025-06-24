import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role_id = user?.role; // Lấy role của người dùng

  // 1. Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu đã đăng nhập nhưng KHÔNG PHẢI là 'manager', chuyển hướng về dashboard hoặc trang không có quyền
  if (role_id !== 1) {
    // Có thể chuyển hướng về dashboard chung, hoặc một trang "Access Denied" cụ thể
    return <Navigate to="/" replace />;
  }

  // 3. Nếu là 'manager' và đã đăng nhập, cho phép truy cập route con
  return <Outlet />;
};

export default AdminRoute;
