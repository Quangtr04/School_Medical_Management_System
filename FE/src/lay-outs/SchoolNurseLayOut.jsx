// src/layouts/AdminLayout.jsx
import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import AdminHeader from "../Admin-component/AdminHeader";
import AdminSideBar from "../Admin-component/AdminSideBar";
import SchoolNurseHeader from "../SchoolNurse-Components/SchoolNurse-Header";
import SchoolNurseSideBar from "../SchoolNurse-Components/SchoolNurseSidebar";

const { Content } = Layout;

export default function SchoolNurseLayOut() {
  const siderWidth = 250; // Đặt biến này để dễ dàng điều chỉnh và sử dụng nhất quán

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sider (Sidebar) */}
      <SchoolNurseSideBar />{" "}
      {/* DashboardSection đã có position: fixed và width={siderWidth} */}
      {/* Phần bên phải của sidebar: Header và Content */}
      <Layout style={{ marginLeft: siderWidth }}>
        {" "}
        {/* Đặt marginLeft để bù trừ cho Sider cố định */}
        {/* Header Admin */}
        <SchoolNurseHeader /> {/* AdminHeader có height là 64px */}
        {/* Content cho các trang con */}
        <Content
          style={{
            margin: "", // Margin tổng thể từ các cạnh của Layout
            background: "linear-gradient(90deg, #e3f2fd 0%, #e0f7fa 100%)",
            boxShadow: "0 4px 24px #e0f0ff",// Đảm bảo Content có thanh cuộn riêng nếu nội dung dài
          }}
        >
          <Outlet />
        </Content>
        {/* Footer Admin (Nếu có) */}
        {/* <Footer style={{ textAlign: 'center', color: '#888' }}>Ant Design Admin ©2023</Footer> */}
      </Layout>
    </Layout>
  );
}
