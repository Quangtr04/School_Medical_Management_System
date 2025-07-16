// src/layouts/ParentLayout.jsx
import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import ParentHeader from "../Parent-component/ParentHeader";
import ParentSideBar from "../Parent-component/ParentSideBar";

const { Content } = Layout;

export default function ParentLayOut() {
  const siderWidth = 280;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sider (Sidebar) */}
      <ParentSideBar />

      {/* Phần bên phải của sidebar: Header và Content */}
      <Layout style={{ marginLeft: siderWidth }}>
        {/* Header Parent */}
        <ParentHeader />

        {/* Content cho các trang con */}
        <Content
          style={{
            padding: 24,
            background: "#f0f2f5",
            minHeight: "calc(100vh - 64px)",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
