import React, { useState } from "react";
import {
  BellOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReadOutlined,
  MailOutlined,
  ClockCircleOutlined,
  LogoutOutlined, // Import LogoutOutlined
  DownOutlined, // Import DownOutlined
  MedicineBoxOutlined, // Icon cho sự cố y tế
  ScheduleOutlined, // Icon cho lịch khám
  CommentOutlined, // Icon cho phản hồi
  FileTextOutlined,
  ProfileOutlined, // Icon cho hồ sơ
} from "@ant-design/icons";
import {
  Layout,
  Input,
  Row,
  Col,
  Avatar,
  Badge,
  Space,
  Dropdown,
  Menu,
  Typography,
  Popover, // Import Popover
  List, // Import List
  Button, // Import Button
  Tag, // Import Tag
} from "antd";
import { Navigate, useNavigate } from "react-router-dom"; // For navigation after logout
import { FaBell } from "react-icons/fa";

const { Header } = Layout;
const { Search } = Input;
const { Text } = Typography;

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/auth/authSlice";
import { FaUserNurse } from "react-icons/fa";
import { IoStorefront } from "react-icons/io5"; // Import nếu bạn đang sử dụng

export default function SchoolNurseHeader() {
  const navigate = useNavigate();
  // State để lưu thông tin người dùng hiện tại
  const user = useSelector((state) => state.auth.user);
  console.log(user);

  const dispatch = useDispatch();

  // Function to handle logout
  const handleLogout = () => {
    // Clear localStorage and state
    dispatch(logout());
    // Redirect to login page after logout
    navigate("/login");
  };

  // State để quản lý Popover thông báo
  const [visibleNotifications, setVisibleNotifications] = useState(false);

  // Mock Data cho thông báo - Giữ nguyên 'type'
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Sự cố y tế mới",
      description: "Học sinh Nguyễn Văn A bị ngã ở sân trường.",
      time: "2 phút trước",
      read: false,
      type: "medical_incident", // Dùng để chọn icon
    },
    {
      id: 2,
      title: "Yêu cầu lịch khám",
      description: "Phụ huynh Trần Thị B gửi yêu cầu đặt lịch khám.",
      time: "1 giờ trước",
      read: false,
      type: "appointment_request",
    },
    {
      id: 3,
      title: "Phản hồi",
      description: "Phụ huynh Lê Văn C gửi phản hồi về dịch vụ.",
      time: "Hôm qua",
      read: true,
      type: "feedback",
    },
    {
      id: 4,
      title: "Hồ sơ sức khỏe cập nhật",
      description: "Hồ sơ của học sinh Phạm Thị D vừa được cập nhật.",
      time: "2 ngày trước",
      read: true,
      type: "health_record_update",
    },
    {
      id: 5,
      title: "Sự cố y tế mới - Học sinh F",
      description: "Học sinh F bị đau bụng cấp.",
      time: "10 phút trước",
      read: false,
      type: "medical_incident",
    },
    // Thêm các thông báo khác...
  ]);

  // Hàm để đánh dấu thông báo đã đọc
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  // Hàm để lấy icon dựa trên loại thông báo
  const getNotificationIcon = (type) => {
    switch (type) {
      case "medical_incident":
        return <MedicineBoxOutlined style={{ color: "#ff4d4f" }} />; // Đỏ
      case "appointment_request":
        return <ScheduleOutlined style={{ color: "#1890ff" }} />; // Xanh dương
      case "feedback":
        return <CommentOutlined style={{ color: "#a0d911" }} />; // Xanh lá mạ
      case "health_record_update":
        return <FileTextOutlined style={{ color: "#faad14" }} />; // Vàng cam
      default:
        return <BellOutlined style={{ color: "#d9d9d9" }} />; // Xám nhạt
    }
  };

  // Nội dung Popover cho thông báo
  const notificationContent = (
    <div style={{ width: 300 }}>
      {" "}
      {/* Kích thước cố định cho Popover */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Text strong>Thông báo</Text>
        <Button
          type="link"
          onClick={() =>
            setNotifications((prev) =>
              prev.map((notif) => ({ ...notif, read: true }))
            )
          }
          style={{ fontSize: "12px" }}
        >
          Đánh dấu đã đọc tất cả
        </Button>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        locale={{ emptyText: "Không có thông báo mới" }}
        renderItem={(item) => (
          <List.Item
            onClick={() => markAsRead(item.id)}
            // Inline styles cho trạng thái đọc/chưa đọc (giống với yêu cầu trước đó, không dùng external CSS class)
            style={{
              padding: "10px 16px",
              cursor: "pointer",
              transition: "background-color 0.3s",
              backgroundColor: item.read ? "#f9f9f9" : "transparent", // Nền nhạt cho đã đọc, trong suốt cho chưa đọc
              color: item.read ? "#bfbfbf" : "inherit", // Chữ xám cho đã đọc, kế thừa cho chưa đọc
            }}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={getNotificationIcon(item.type)}
                  style={{ backgroundColor: item.read ? "#f5f5f5" : "#e6f7ff" }}
                />
              }
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    strong={!item.read}
                    style={{ color: item.read ? "#bfbfbf" : "#333" }}
                  >
                    {item.title}
                  </Text>{" "}
                  {/* Áp dụng màu cho tiêu đề */}
                  {!item.read && (
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      Mới
                    </Tag>
                  )}
                </div>
              }
              description={
                <div
                  style={{
                    fontSize: "12px",
                    color: item.read ? "#bfbfbf" : "#8c8c8c",
                  }}
                >
                  <Text style={{ color: item.read ? "#bfbfbf" : "#8c8c8c" }}>
                    {item.description}
                  </Text>{" "}
                  {/* Áp dụng màu cho mô tả */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    <ClockCircleOutlined
                      style={{
                        marginRight: 4,
                        color: item.read ? "#bfbfbf" : "#8c8c8c",
                      }}
                    />{" "}
                    {/* Áp dụng màu cho icon */}
                    <Text
                      type="secondary"
                      style={{ color: item.read ? "#bfbfbf" : "#8c8c8c" }}
                    >
                      {item.time}
                    </Text>{" "}
                    {/* Áp dụng màu cho thời gian */}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      <div
        style={{
          padding: "8px",
          textAlign: "center",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <Button
          type="link"
          onClick={() => {
            navigate("/nurse/notifications");
            setVisibleNotifications(false);
          }}
        >
          Xem tất cả thông báo
        </Button>
      </div>
    </div>
  );

  // Tính số thông báo chưa đọc
  const unreadCount = notifications.filter((notif) => !notif.read).length;

  // Menu items for the user dropdown
  const userMenuItems = [
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: "Xem hồ sơ",
      primary: true,
      onClick: <Navigate to={"/nurse/profile"} />,
    },

    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        padding: 0,
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        height: "64px",
        lineHeight: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "24px",
        paddingRight: "24px",
        border: "none",
      }}
    >
      {/* Left side: Logo or Search Bar */}
      <Col>
        {/* <Search
            placeholder="Tìm kiếm..."
            enterButton={<SearchOutlined />}
            style={{ width: 250 }}
            onSearch={(value) => console.log("Search:", value)}
        /> */}
        {/* Placeholder cho logo, nếu có */}
      </Col>

      {/* Right side: Notifications, User Info, Sync Icon */}
      <Col
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {/* Space bao ngoài để căn chỉnh các item chính (Chuông và Dropdown User) */}
        <Space size={10} align="center">
          {" "}
          {/* Giữ nguyên size 10 như code bạn cung cấp */}
          {/* Badge cho thông báo, bây giờ được bọc trong Popover */}
          <Popover
            content={notificationContent}
            trigger="click"
            placement="bottomRight"
            onOpenChange={setVisibleNotifications}
            open={visibleNotifications}
            arrow
          >
            <Badge count={unreadCount} offset={[-1, 35]} size="small">
              {" "}
              {/* Giữ nguyên offset và size như code bạn cung cấp */}
              <FaBell
                style={{
                  fontSize: "35px", // Giữ nguyên kích thước icon chuông
                  cursor: "pointer",
                  color: "#666",
                  marginTop: "30px", // Giữ nguyên margin top như code bạn cung cấp
                  // Bỏ margin top/left ở đây, để Space xử lý khoảng cách
                }}
              />
            </Badge>{" "}
          </Popover>
          {/* User Info and Avatar with Dropdown */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
            trigger={["click"]}
          >
            <a
              onClick={(e) => e.preventDefault()}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {/* Space riêng cho Avatar, text và DownOutlined */}
              <Space size={8} align="center">
                {/* Avatar */}
                <Avatar
                  size={40}
                  style={{ backgroundColor: "red" }} // Giữ nguyên màu đỏ
                  icon={
                    <FaUserNurse style={{ fontSize: "20px", color: "white" }} />
                  }
                />

                {/* Container cho tên và vai trò */}
                <div style={{ lineHeight: "1.2" }}>
                  <Text
                    style={{
                      fontWeight: "500",
                      color: "#333",
                      display: "block",
                      fontSize: "14px",
                    }}
                  >
                    {user?.fullname || user?.email || "Admin User"}
                  </Text>
                  <Text
                    type="secondary"
                    style={{ fontSize: "12px", display: "block" }}
                  >
                    {user?.role_id === 3 ? "🧑‍⚕️Y tá" : "Quản trị viên"}
                  </Text>
                </div>

                {/* Icon mũi tên xuống */}
                <DownOutlined style={{ fontSize: "10px", color: "#888" }} />
              </Space>
            </a>
          </Dropdown>
        </Space>
      </Col>
    </Header>
  );
}
