// Your RoleProtectedRoute.jsx
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { initializeAuth } from "./redux/auth/authSlice";
import { CircularProgress, Box, Typography, Paper } from "@mui/material";

const RoleProtectedRoute = ({ element, allowedRoles }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isAuthenticated, isAuthInitialized, authInitializationError } =
    useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthInitialized) {
      console.log("Auth not initialized, dispatching initializeAuth");
      dispatch(initializeAuth());
    }
  }, [dispatch, isAuthInitialized]);

  console.log("RoleProtectedRoute:", {
    isAuthInitialized,
    isAuthenticated,
    user,
    allowedRoles,
    authInitializationError,
  });

<<<<<<< HEAD
  // Nếu đang khởi tạo auth, hiển thị loading
=======
  console.log("isAuthenticated:", isAuthenticated);
  console.log("user:", user);
  console.log("role_id:", user?.role_id);
  console.log("allowedRoles:", allowedRoles);
  // Render logic
>>>>>>> 57eef22 (ud)
  if (!isAuthInitialized) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" mt={2}>
          Đang tải thông tin người dùng...
        </Typography>
      </Box>
    );
  }

  // Nếu có lỗi khởi tạo auth
  if (authInitializationError) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={3}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            Lỗi xác thực
          </Typography>
          <Typography variant="body1" mb={2}>
            {authInitializationError}
          </Typography>
          <Typography variant="body2">
            Vui lòng thử{" "}
            <a href="/login" style={{ textDecoration: "underline" }}>
              đăng nhập lại
            </a>
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated || !user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role_id
  const userRoleId = user.role_id;
  console.log("User role_id:", userRoleId, "Allowed roles:", allowedRoles);

  // Nếu không có role_id hoặc role_id không nằm trong danh sách cho phép
  if (!userRoleId || !allowedRoles.includes(userRoleId)) {
    console.log("User role not allowed, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu đã đăng nhập và có quyền truy cập, hiển thị component
  return element;
};

export default RoleProtectedRoute;
