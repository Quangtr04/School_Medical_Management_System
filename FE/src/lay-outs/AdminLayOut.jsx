// src/layouts/AdminLayout.jsx
import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import AdminHeader from "../Admin-component/AdminHeader";
import AdminSideBar from "../Admin-component/AdminSideBar";

const { Content } = Layout;

export default function AdminLayOut() {

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSideBar />{" "}
      <Layout style={{ marginLeft: 250 }}>
        <AdminHeader />
        <Content
          style={{
            margin: "",
            minHeight: "",
            overflowY: "auto",
            background: "linear-gradient(90deg, #e3f2fd 0%, #e0f7fa 100%)",
            boxShadow: "0 4px 24px #e0f0ff",// Đảm bảo Content có thanh cuộn riêng nếu nội dung dài
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
