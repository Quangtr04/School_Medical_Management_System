import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  MedicineBoxOutlined,
  WarningOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Typography } from "antd";
import { Link } from "react-router-dom";
import { PiStudent } from "react-icons/pi";
import { MdVaccines } from "react-icons/md";
import { FaSchool } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { CiPill } from "react-icons/ci";

const { Sider } = Layout;
const { Title, Text } = Typography;

export default function SchoolNurseSideBar() {
  const currentPath = location.pathname;

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
      label: <Link to="/nurse/medical-incidents">Sự cố y tế</Link>,
    },
    {
      key: "/nurse/vaccinations",
      icon: <MdVaccines />,
      label: <Link to="/nurse/vaccinations">Lịch tiêm chủng</Link>,
    },

    {
      key: "/nurse/medical-submission",
      icon: <CiPill />,
      label: <Link to="/nurse/medical-submission">Xét duyệt đơn thuốc</Link>,
    },
    {
      key: "/nurse/checkups",
      icon: <FileTextOutlined />,
      label: <Link to="/nurse/checkups">Lịch khám sức khỏe</Link>,
    },
    {
      key: "/nurse/report",
      icon: <TbReportSearch />,
      label: <Link to="/nurse/report">Thống kê</Link>,
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
        <FaSchool
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
        defaultSelectedKeys={[currentPath]} // Consider using location.pathname for dynamic selection
        style={{ height: "calc(100% - 64px)", borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
}
