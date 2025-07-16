import {
  AppstoreOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UserOutlined,
  ContainerOutlined,
  ArrowLeftOutlined,
  MedicineBoxOutlined,
  WarningOutlined,
  SolutionOutlined,
  FileTextOutlined,
  NotificationOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import { ArrowBigLeft } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import HomePage from "../pages/HomePage";
import { PiStudent } from "react-icons/pi";
import { MdVaccines } from "react-icons/md";
import { FaClipboardCheck, FaUserNurse } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";

const { Sider } = Layout;
const { Title, Text } = Typography;

export default function ManagerSidebar() {
  const menuItems = [
    {
      key: "/manger",
      // Explicitly wrap icon and label text within a single span or Fragment
      // Even though icon is a prop, sometimes the label content itself needs this
      icon: <AppstoreOutlined />,
      label: (
        // Wrap the Link in a Fragment if the icon were part of the label itself,
        // but here Link is the single label element, which is usually fine.
        // The common error is when label is `<span>Icon</span> Text`
        <Link to="/manager">Tổng quan</Link>
      ),
    },
    {
      key: "/manager/appoinment-apporve",
      icon: <FaClipboardCheck />,
      label: (
        // Wrap the Link in a Fragment if the icon were part of the label itself,
        // but here Link is the single label element, which is usually fine.
        // The common error is when label is `<span>Icon</span> Text`
        <Link to="/manager/appoinment-apporve">Duyệt đơn</Link>
      ),
    },

    {
      key: "/",
      icon: <LogoutOutlined />,
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
        <VscAccount
          style={{ fontSize: "28px", color: "#1890ff", marginRight: "12px" }}
        />
        <div>
          <Title level={4} style={{ margin: 0, lineHeight: "1" }}>
            Manager
          </Title>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Quản lý nhà trường
          </Text>
        </div>
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={["/manger"]} // Consider using location.pathname for dynamic selection
        style={{ height: "calc(100% - 64px)", borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
}
