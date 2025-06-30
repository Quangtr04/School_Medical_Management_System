// Your RoleProtectedRoute.jsx
import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const INITIALIZATION_TIMEOUT = 5000; // 5 giây timeout

const RoleProtectedRoute = ({ allowedRoles }) => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  //isAuthenticated cho biết người dùng đã đăng nhập hay chưa
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); //

  const isAuthInitialized = useSelector(
    //isAuthInitialized cho biết ứng dụng đã kiểm tra xong việc xác thực chưa.
    (state) => state.auth.isAuthInitialized
  );

  const userRoleId = user?.role_id;

  const initializationTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isAuthInitialized) {
      initializationTimeoutRef.current = setTimeout(() => {
        <Navigate to="/unauthorized" />;
      }, INITIALIZATION_TIMEOUT);
    } else {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
        initializationTimeoutRef.current = null;
      }
    }

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, [isAuthInitialized, dispatch]);

  // Render logic
  if (!isAuthInitialized) {
    return <div>Đang kiểm tra xác thực...</div>;
  }

  if (
    !isAuthenticated ||
    (allowedRoles && !allowedRoles.includes(userRoleId))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
