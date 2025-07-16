import React, { useState, useEffect } from "react";
import {
  BellOutlined,
  UserOutlined,
  SyncOutlined,
  DownOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Row,
  Col,
  Avatar,
  Badge,
  Space,
  Dropdown,
  Menu,
  Typography,
  message,
  Popover,
  List,
  Button,
  Tag,
  Spin,
  Empty,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/auth/authSlice";
import {
  getParentNotifications,
  markNotificationAsRead,
} from "../redux/parent/parentSlice";

const { Header } = Layout;
const { Text } = Typography;

export default function ParentHeader() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { notifications, loading } = useSelector((state) => state.parent);
  const [visibleNotifications, setVisibleNotifications] = useState(false);

  // Function to handle logout
  const handleLogout = () => {
    try {
      // Clear localStorage and state
      dispatch(logout());
      // Redirect to login page after logout
      navigate("/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      message.error("Có lỗi xảy ra khi đăng xuất!");
    }
  };

  // Fetch notifications when popover is opened
  useEffect(() => {
    if (visibleNotifications) {
      dispatch(getParentNotifications());
    }
  }, [visibleNotifications, dispatch]);

  // Helper function to get notifications
  const getNotificationsList = () => {
    // Handle case where notifications has a structure like {items: [...]}
    if (
      notifications &&
      notifications.items &&
      Array.isArray(notifications.items)
    ) {
      return notifications.items;
    }
    return Array.isArray(notifications) ? notifications : [];
  };

  // Count unread notifications
  const unreadCount = getNotificationsList().filter(
    (n) => !n.isRead && !n.is_read
  ).length;

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Navigate to notifications page without marking as read
    navigate("/parent/notifications");
  };

  // Notification content for popover
  const notificationsContent = (
    <div style={{ width: 350, maxHeight: 400, overflow: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text strong>Thông báo</Text>
        <Button
          type="link"
          size="small"
          onClick={() => navigate("/parent/notifications")}
        >
          Xem tất cả
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="small" />
        </div>
      ) : getNotificationsList().length > 0 ? (
        <List
          dataSource={getNotificationsList().slice(0, 5)}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "8px 0",
                cursor: "pointer",
                backgroundColor:
                  !item.isRead && !item.is_read ? "#f0f7ff" : "transparent",
                borderRadius: "4px",
              }}
              onClick={() => handleNotificationClick(item)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor:
                        !item.isRead && !item.is_read ? "#1890ff" : "#d9d9d9",
                    }}
                    icon={<BellOutlined />}
                  />
                }
                title={
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text strong>{item.title || "Thông báo mới"}</Text>
                    {!item.isRead && !item.is_read && (
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        Mới
                      </Tag>
                    )}
                  </div>
                }
                description={
                  <>
                    <Text style={{ fontSize: "12px" }}>
                      {item.message || "Không có nội dung"}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : ""}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Không có thông báo" style={{ padding: "20px 0" }} />
      )}
    </div>
  );

  // Menu for user dropdown
  const userMenu = (
    <Menu
      style={{
        minWidth: 200,
        borderRadius: 8,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        border: "1px solid #f0f0f0",
      }}
      items={[
        {
          key: "header",
          label: (
            <div
              style={{
                padding: "12px 16px",
                background: "#fafafa",
                borderBottom: "1px solid #f0f0f0",
                borderRadius: "8px 8px 0 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#52c41a" }}
                />
                <div>
                  <div
                    style={{ fontWeight: 600, fontSize: 14, color: "#262626" }}
                  >
                    {user?.fullname || "Phụ huynh"}
                  </div>
                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                    Sức khỏe gia đình
                  </div>
                </div>
              </div>
            </div>
          ),
          style: {
            height: "auto",
            padding: 0,
            margin: 0,
          },
        },
        {
          key: "profile",
          icon: <UserOutlined style={{ color: "#1890ff" }} />,
          label: (
            <span style={{ color: "#262626", fontWeight: 500 }}>
              Thông tin cá nhân
            </span>
          ),
          onClick: () => navigate("/parent/profile"),
          style: {
            margin: "8px 8px 4px 8px",
            borderRadius: 6,
            transition: "all 0.2s",
          },
        },
        {
          key: "settings",
          icon: <SyncOutlined style={{ color: "#722ed1" }} />,
          label: (
            <span style={{ color: "#262626", fontWeight: 500 }}>Cài đặt</span>
          ),
          style: {
            margin: "4px 8px",
            borderRadius: 6,
            transition: "all 0.2s",
          },
        },
        {
          type: "divider",
          style: { margin: "8px 0" },
        },
        {
          key: "logout",
          icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
          label: (
            <span style={{ color: "#ff4d4f", fontWeight: 500 }}>Đăng xuất</span>
          ),
          onClick: handleLogout,
          style: {
            margin: "4px 8px 8px 8px",
            borderRadius: 6,
            transition: "all 0.2s",
          },
        },
      ]}
    />
  );
  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderBottom: "1px solid #e8e8e8",
        height: 64,
        zIndex: 1000,
      }}
    >
      <Row
        justify="space-between"
        align="middle"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Left side - Empty space or logo can go here */}
        <Col span={12} style={{ maxWidth: "400px" }}>
          {/* Search bar removed */}
        </Col>{" "}
        {/* Right side - Notifications and User */}
        <Col className="mb-10">
          <Space size="large" align="center" className="mt-1">
            {/* Notifications */}
            <Popover
              content={notificationsContent}
              title={null}
              trigger="click"
              open={visibleNotifications}
              onOpenChange={setVisibleNotifications}
              placement="bottomRight"
              overlayStyle={{ width: 350 }}
            >
              <Badge count={unreadCount} size="small">
                <BellOutlined
                  style={{
                    fontSize: "18px",
                    color: "#666",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "50%",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f0f0f0";
                    e.target.style.color = "#1890ff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#666";
                  }}
                />
              </Badge>
            </Popover>

            {/* User Info */}
            <Dropdown
              menu={{ items: userMenu.props.items }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div
                style={{
                  cursor: "pointer",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #f0f0f0",
                  transition: "all 0.3s",
                  background: "#fafafa",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f0f9ff";
                  e.target.style.borderColor = "#d6f7ff";
                  e.target.style.boxShadow =
                    "0 2px 8px rgba(24, 144, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#fafafa";
                  e.target.style.borderColor = "#f0f0f0";
                  e.target.style.boxShadow = "none";
                }}
              >
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: "#52c41a",
                  }}
                />
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#262626",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {user?.fullname || "Phụ huynh"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#8c8c8c",
                      lineHeight: 1,
                    }}
                  >
                    Sức khỏe gia đình
                  </div>
                </div>
                <DownOutlined
                  style={{
                    fontSize: "10px",
                    color: "#bfbfbf",
                    marginLeft: "4px",
                  }}
                />
              </div>
            </Dropdown>
          </Space>
        </Col>
      </Row>
    </Header>
  );
}
