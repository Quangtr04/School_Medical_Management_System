import {
  AppstoreOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UserOutlined,
  ContainerOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import { ArrowBigLeft } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import HomePage from "../pages/HomePage";
import { Class } from "@mui/icons-material";

const { Sider } = Layout;
const { Title, Text } = Typography;

export default function AdminSideBar() {
  const currLocation = location.pathname;
  const menuItems = [
    {
      key: "/admin",
      // Explicitly wrap icon and label text within a single span or Fragment
      // Even though icon is a prop, sometimes the label content itself needs this
      icon: <AppstoreOutlined />,
      label: (
        // Wrap the Link in a Fragment if the icon were part of the label itself,
        // but here Link is the single label element, which is usually fine.
        // The common error is when label is `<span>Icon</span> Text`
        <Link to="/admin">Tổng quan</Link>
      ),
    },
    {
      key: "sub_users",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      children: [
        {
          key: "/admin/nurses",
          label: <Link to="/admin/nurses">Y tá</Link>,
        },
        {
          key: "/admin/parents",
          label: <Link to="/admin/parents">Phụ huynh</Link>,
        },
        {
          key: "/admin/managers",
          label: <Link to="/admin/managers">Quản lý</Link>,
        },
      ],
    },

    {
      key: "/",
      icon: <ArrowLeftOutlined />,
      label: <Link to="/">Quay về trang chủ</Link>,
    },
  ];

  return (
    <Sider
      width={250}
      style={{
        background: "#fff",
        borderRight: "1px solid #f0f0f0",
        boxShadow: "1px 0 2px rgba(0,0,0,0.05)",
        position: "fixed",
        height: "100vh",
        left: 0,
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <AppstoreOutlined
          style={{ fontSize: "28px", color: "#1890ff", marginRight: "12px" }}
        />
        <div>
          <Title level={4} style={{ margin: 0, lineHeight: "1" }}>
            Admin Panel
          </Title>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Quản trị hệ thống
          </Text>
        </div>
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={[currLocation]} // Consider using location.pathname for dynamic selection
        style={{ height: "calc(100% - 64px)", borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
}
