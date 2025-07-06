import React, { useEffect, useState } from "react";
import {
  BellOutlined,
  LogoutOutlined,
  DownOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Badge,
  Avatar,
  Space,
  Dropdown,
  Typography,
  Popover,
  List,
  Button,
  Tag,
  Col,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/auth/authSlice";
import {
  fetchManagerNotifications,
  markManagerNotificationAsRead,
  markManagerAllAsRead,
} from "../redux/manager/managerNotificationSlice";

const { Header } = Layout;
const { Text } = Typography;

export default function ManagerHeader() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: notifications } = useSelector(
    (state) => state.managerNotifications
  );
  const [visibleNotifications, setVisibleNotifications] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleMarkAsRead = (id) => {
    dispatch(markManagerNotificationAsRead(id));
  };

  const unreadCount = notifications?.filter((n) => !n.read).length;

  useEffect(() => {
    if (visibleNotifications) {
      dispatch(fetchManagerNotifications());
    }
  }, [visibleNotifications]);

  const notificationContent = (
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
          onClick={() => dispatch(markManagerAllAsRead())}
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
            onClick={() => handleMarkAsRead(item.id)}
            style={{
              padding: "10px 16px",
              cursor: "pointer",
              backgroundColor: item.read ? "#f9f9f9" : "transparent",
              color: item.read ? "#bfbfbf" : "inherit",
            }}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={<BellOutlined />}
                  style={{ backgroundColor: item.read ? "#f5f5f5" : "#e6f7ff" }}
                />
              }
              title={
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Text
                    strong={!item.read}
                    style={{ color: item.read ? "#bfbfbf" : "#333" }}
                  >
                    {item.title}
                  </Text>
                  {!item.read && <Tag color="blue">Mới</Tag>}
                </div>
              }
              description={
                <div style={{ fontSize: "12px" }}>
                  <Text style={{ color: item.read ? "#bfbfbf" : "#8c8c8c" }}>
                    {item.description}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    <Text type="secondary">{item.time}</Text>
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
        <Button type="link" onClick={() => navigate("/manager/notifications")}>
          Xem tất cả thông báo
        </Button>
      </div>
    </div>
  );

  const userMenuItems = [
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
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <Col />
      <Col>
        <Space size={24}>
          <Popover
            content={notificationContent}
            trigger="click"
            placement="bottomRight"
            onOpenChange={setVisibleNotifications}
            open={visibleNotifications}
          >
            <Badge count={unreadCount} offset={[-2, 6]}>
              <BellOutlined style={{ fontSize: 22, cursor: "pointer" }} />
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
              <Avatar icon={<UserOutlined />} src={user?.avatarUrl} />
              <div style={{ marginLeft: 8, lineHeight: "1.2" }}>
                <Text style={{ fontWeight: "500", color: "#333" }}>
                  {user?.fullname || "Manager"}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  🧑‍💼 Quản lý
                </Text>
              </div>
              <DownOutlined
                style={{ fontSize: 12, color: "#888", marginLeft: 8 }}
              />
            </a>
          </Dropdown>
        </Space>
      </Col>
    </Header>
  );
}
