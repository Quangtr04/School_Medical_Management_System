import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  BellOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  DownOutlined,
  MedicineBoxOutlined,
  ScheduleOutlined,
  CommentOutlined,
  FileTextOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Col,
  Avatar,
  Badge,
  Space,
  Dropdown,
  Typography,
  Popover,
  List,
  Button,
  Tag,
} from "antd";
import { useNavigate } from "react-router-dom";
import { FaBell, FaUserNurse } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/auth/authSlice";
import {
  fetchNurseNotifications,
  markAllAsRead,
  markAsRead,
} from "../redux/nurse/nurseNotificationSlice";
import { toast } from "react-toastify";

const { Header } = Layout;
const { Text } = Typography;

// Helper: icon cho notification
const getNotificationIcon = (type) => {
  switch (type) {
    case "medical_incident":
      return <MedicineBoxOutlined style={{ color: "#ff4d4f" }} />;
    case "appointment_request":
      return <ScheduleOutlined style={{ color: "#1890ff" }} />;
    case "feedback":
      return <CommentOutlined style={{ color: "#a0d911" }} />;
    case "health_record_update":
      return <FileTextOutlined style={{ color: "#faad14" }} />;
    default:
      return <BellOutlined style={{ color: "#d9d9d9" }} />;
  }
};

export default function SchoolNurseHeader() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const notifications = useSelector((state) => state.notifications.list);
  const [visibleNotifications, setVisibleNotifications] = useState(false);

  console.log(notifications);

  useEffect(() => {
    if (visibleNotifications) {
      dispatch(fetchNurseNotifications());
    }
  }, [visibleNotifications, dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    toast.success("Đăng xuất thành công, đang chuyển hướng về trang chủ");
    navigate("/");
  }, [dispatch, navigate]);

  const handleNavigate = useCallback(() => {
    navigate("/nurse/profile");
  }, [navigate]);

  const handleMarkAllAsRead = useCallback(() => {
    dispatch(markAllAsRead());
  }, [dispatch]);

  const handleMarkAsRead = useCallback(
    (id) => {
      dispatch(markAsRead(id));
    },
    [dispatch]
  );

  const unreadCount = useMemo(
    () => notifications.filter((notif) => !notif.read).length,
    [notifications]
  );

  const userMenuItems = useMemo(
    () => [
      {
        key: "profile",
        icon: <ProfileOutlined />,
        label: "Xem hồ sơ",
        primary: true,
        onClick: handleNavigate,
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        danger: true,
        onClick: handleLogout,
      },
    ],
    [handleNavigate, handleLogout]
  );

  const notificationContent = useMemo(
    () => (
      <div style={{ width: 300 }}>
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
            onClick={handleMarkAllAsRead}
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
              onClick={() => handleMarkAsRead(item.notification_id)}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                transition: "background-color 0.3s",
                backgroundColor: item.read ? "#f9f9f9" : "transparent",
                color: item.read ? "#bfbfbf" : "inherit",
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={getNotificationIcon(item.type)}
                    style={{
                      backgroundColor: item.read ? "#f5f5f5" : "#e6f7ff",
                    }}
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
                    </Text>
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
                    <Text>{item.message}</Text>
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
                      />
                      <Text type="secondary">
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
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
        ></div>
      </div>
    ),
    [notifications, handleMarkAllAsRead, handleMarkAsRead, navigate]
  );

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
      <Col></Col>
      <Col
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Space size={10} align="center">
          <Popover
            content={notificationContent}
            trigger="click"
            placement="bottomRight"
            onOpenChange={setVisibleNotifications}
            open={visibleNotifications}
            arrow
          >
            <Badge count={unreadCount} offset={[-1, 35]} size="small">
              <FaBell
                style={{
                  fontSize: "35px",
                  cursor: "pointer",
                  color: "#666",
                  marginTop: "30px",
                }}
              />
            </Badge>
          </Popover>
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
              <Space size={8} align="center">
                <Avatar
                  size={40}
                  style={{ backgroundColor: "red" }}
                  icon={
                    <FaUserNurse style={{ fontSize: "20px", color: "white" }} />
                  }
                />
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
                    {user?.role_id === 3 ? "Y tá" : "Quản trị viên"}
                  </Text>
                </div>
                <DownOutlined style={{ fontSize: "10px", color: "#888" }} />
              </Space>
            </a>
          </Dropdown>
        </Space>
      </Col>
    </Header>
  );
}
