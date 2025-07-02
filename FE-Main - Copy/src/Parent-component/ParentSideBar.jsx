import {
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  HeartOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  ArrowLeftOutlined,
  MedicineBoxOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import React from "react";
import { Link } from "react-router-dom";

const { Sider } = Layout;
const { Title, Text } = Typography;

export default function ParentSideBar() {
  const menuItems = [
    {
      key: "/parent",
      icon: <HomeOutlined />,
      label: <Link to="/parent">Trang chủ</Link>,
    },
    {
      key: "/parent/profile",
      icon: <IdcardOutlined />,
      label: <Link to="/parent/profile">Hồ sơ</Link>,
    },

    {
      key: "sub_health",
      icon: <HeartOutlined />,
      label: "Sức khỏe",
      children: [
        {
          key: "/parent/health-records",
          label: <Link to="/parent/health-records">Hồ sơ sức khỏe</Link>,
        },
        {
          key: "/parent/vaccinations",
          label: <Link to="/parent/vaccinations">Lịch tiêm chủng</Link>,
        },
        {
          key: "/parent/medical-incidents",
          label: <Link to="/parent/medical-incidents">Sự cố y tế</Link>,
        },
      ],
    },
    {
      key: "sub_appointments",
      icon: <CalendarOutlined />,
      label: "Lịch hẹn",
      children: [
        {
          key: "/parent/appointments",
          label: <Link to="/parent/appointments">Đặt lịch khám</Link>,
        },
        {
          key: "/parent/appointment-history",
          label: <Link to="/parent/appointment-history">Lịch sử khám</Link>,
        },
      ],
    },
    {
      key: "/parent/notifications",
      icon: <BellOutlined />,
      label: <Link to="/parent/notifications">Thông báo</Link>,
    },
    {
      key: "/parent/medicine-request",
      icon: <MedicineBoxOutlined />,
      label: <Link to="/parent/medicine-request">Gửi thuốc</Link>,
    },
    {
      key: "/parent/documents",
      icon: <FileTextOutlined />,
      label: <Link to="/parent/documents">Tài liệu</Link>,
    },
    {
      key: "/parent/support",
      icon: <QuestionCircleOutlined />,
      label: <Link to="/parent/support">Hỗ trợ</Link>,
    },
  ];
  return (
    <Sider
      width={280}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1001,
        minHeight: "100vh",
        background: "#fff",
        borderRight: "1px solid #e8e8e8",
        boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
      }}
    >
      {/* Logo/Brand Section */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #e8e8e8",
          background: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "#666",
            }}
          >
            <ArrowLeftOutlined style={{ fontSize: "16px" }} />
            <span style={{ fontSize: "14px" }}>Quay lại trang chủ</span>
          </Link>
        </div>
        <div style={{ marginTop: "12px" }}>
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            Phụ huynh
          </Title>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Quản lý sức khỏe con em
          </Text>
        </div>
      </div>

      {/* Navigation Menu */}
      <Menu
        mode="inline"
        defaultSelectedKeys={["/parent"]}
        items={menuItems}
        style={{
          borderRight: "none",
          background: "transparent",
          fontSize: "14px",
        }}
        className="custom-menu"
      />

      <style>{`
        .custom-menu .ant-menu-item,
        .custom-menu .ant-menu-submenu-title {
          height: 44px;
          line-height: 44px;
          margin: 4px 8px;
          border-radius: 6px;
          transition: all 0.3s;
        }

        .custom-menu .ant-menu-item:hover,
        .custom-menu .ant-menu-submenu-title:hover {
          background-color: #e6f7ff;
          color: #1890ff;
        }

        .custom-menu .ant-menu-item-selected {
          background-color: #1890ff;
          color: white;
        }

        .custom-menu .ant-menu-item-selected:hover {
          background-color: #1890ff;
          color: white;
        }

        .custom-menu .ant-menu-submenu-selected > .ant-menu-submenu-title {
          color: #1890ff;
        }
      `}</style>
    </Sider>
  );
}
