import React from "react";
import {
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  SyncOutlined,
  DownOutlined,
  LogoutOutlined,
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
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/auth/authSlice";

const { Header } = Layout;
const { Search } = Input;
const { Text } = Typography;

export default function ParentHeader() {
  const navigate = useNavigate();
  // State để lấy thông tin người dùng từ Redux
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  // useEffect để đọc thông tin người dùng từ localStorage khi component mount

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
  // Menu for user dropdown
  const userMenu = (
    <Menu
      style={{
        minWidth: 200,
        borderRadius: 8,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        border: "1px solid #f0f0f0",
      }}
    >
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
            <div style={{ fontWeight: 600, fontSize: 14, color: "#262626" }}>
              {user?.fullname || "Phụ huynh"}
            </div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              Sức khỏe gia đình
            </div>
          </div>
        </div>
      </div>

      <Menu.Item
        key="profile"
        icon={<UserOutlined style={{ color: "#1890ff" }} />}
        style={{
          margin: "8px 8px 4px 8px",
          borderRadius: 6,
          transition: "all 0.2s",
        }}
      >
        <span style={{ color: "#262626", fontWeight: 500 }}>
          Thông tin cá nhân
        </span>
      </Menu.Item>

      <Menu.Item
        key="settings"
        icon={<SyncOutlined style={{ color: "#722ed1" }} />}
        style={{
          margin: "4px 8px",
          borderRadius: 6,
          transition: "all 0.2s",
        }}
      >
        <span style={{ color: "#262626", fontWeight: 500 }}>Cài đặt</span>
      </Menu.Item>

      <Menu.Divider style={{ margin: "8px 0" }} />

      <Menu.Item
        key="logout"
        icon={<LogoutOutlined style={{ color: "#ff4d4f" }} />}
        onClick={handleLogout}
        style={{
          margin: "4px 8px 8px 8px",
          borderRadius: 6,
          transition: "all 0.2s",
        }}
      >
        <span style={{ color: "#ff4d4f", fontWeight: 500 }}>Đăng xuất</span>
      </Menu.Item>
    </Menu>
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
        {/* Left side - Search */}
        <Col span={12} style={{ maxWidth: "400px" }}>
          <Search
            placeholder="Tìm kiếm thông tin sức khỏe con..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ width: "100%" }}
          />
        </Col>{" "}
        {/* Right side - Notifications and User */}
        <Col className="mb-10">
          <Space size="large" align="center" className="mt-1">
            {/* Notifications */}
            <Badge count={5} size="small">
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

            {/* User Info */}
            <Dropdown
              overlay={userMenu}
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
