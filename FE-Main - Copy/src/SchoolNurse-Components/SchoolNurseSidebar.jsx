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
import { icon } from "@fortawesome/fontawesome-svg-core";
import { PiStudent } from "react-icons/pi";
import { MdVaccines } from "react-icons/md";
import { FaUserNurse } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";

const { Sider } = Layout;
const { Title, Text } = Typography;

export default function SchoolNurseSideBar() {
  const menuItems = [
    {
      key: "/nurse",
      // Explicitly wrap icon and label text within a single span or Fragment
      // Even though icon is a prop, sometimes the label content itself needs this
      icon: <AppstoreOutlined />,
      label: (
        // Wrap the Link in a Fragment if the icon were part of the label itself,
        // but here Link is the single label element, which is usually fine.
        // The common error is when label is `<span>Icon</span> Text`
        <Link to="/nurse">Tổng quan</Link>
      ),
    },
    {
      key: "/nurse/students-record",
      icon: <PiStudent />,
      label: (
        // Wrap the Link in a Fragment if the icon were part of the label itself,
        // but here Link is the single label element, which is usually fine.
        // The common error is when label is `<span>Icon</span> Text`
        <Link to="/nurse/students-record">Hồ sơ học sinh</Link>
      ),
    },
    {
      key: "/nurse/medical-supplies",
      icon: <MedicineBoxOutlined />,
      label: <Link to="/nurse/medical-supplies">Vật tư y tế</Link>,
    },
    {
      key: "/nurse/medical-incidents",
      icon: <WarningOutlined />,
      label: <Link to="/nurse/medical-incidents">Sự kiện y tế</Link>,
    },
    {
      key: "/nurse/vaccinations",
      icon: <MdVaccines />,
      label: <Link to="/nurse/vaccinations">Lịch tiêm chủng</Link>,
    },
    {
      key: "/nurse/examinations",
      icon: <FileTextOutlined />,
      label: <Link to="/nurse/examinations">Lịch khám sức khỏe</Link>,
    },
    {
      key: "/nurse/report",
      icon: <TbReportSearch />,
      label: <Link to="/nurse/report">Report</Link>,
    },
    {
      key: "/logout",
      icon: <LogoutOutlined />,
      label: <Link to="/logout">Logout</Link>,
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
        <FaUserNurse
          style={{ fontSize: "28px", color: "#1890ff", marginRight: "12px" }}
        />
        <div>
          <Title level={4} style={{ margin: 0, lineHeight: "1" }}>
            School Nurse
          </Title>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Y tá nhà trường
          </Text>
        </div>
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={["/admin"]} // Consider using location.pathname for dynamic selection
        style={{ height: "calc(100% - 64px)", borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
}
