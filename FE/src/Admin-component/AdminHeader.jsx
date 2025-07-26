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
} from "antd";
import { useNavigate } from "react-router-dom"; // For navigation after logout
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/auth/authSlice";
import { MdAdminPanelSettings } from "react-icons/md";
import { toast } from "react-toastify";

const { Header } = Layout;
const { Search } = Input;
const { Text } = Typography;

export default function AdminHeader() {
  const navigate = useNavigate();
  // State để lưu thông tin người dùng hiện tại

  const user = useSelector((state) => state.auth.user);

  const dispatch = useDispatch();
  // useEffect để đọc thông tin người dùng từ localStorage khi component mount
  // [] đảm bảo chỉ chạy một lần khi mount

  // const { fullname, role_id } = currentUser;
  // Function to handle logout
  const handleLogout = () => {
    // Clear localStorage and state
    dispatch(logout());
    toast.success("Đăng xuất thành công, đang chuyển hướng về trang chủ");
    navigate("/");
  };

  // Menu items for the user dropdown
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
        lineHeight: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "24px",
        paddingRight: "24px",
        border: "none",
      }}
    >
      {/* Left side: Search Bar */}
      <Col>
        {/* <Search
          placeholder="Tìm kiếm..."
          enterButton={<SearchOutlined />}
          style={{ width: 250 }}
          onSearch={(value) => console.log("Search:", value)}
        /> */}
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
          {/* Giữ nguyên size 24 hoặc điều chỉnh */}
          {/* Badge cho thông báo */}
          <Badge count={1} offset={[-1, 35]} size="medium">
            <BellOutlined
              style={{
                fontSize: "35px",
                cursor: "pointer",
                color: "#666",
                marginTop: "30px",
              }}
            />
          </Badge>{" "}
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
                  style={{ backgroundColor: "#1890ff" }}
                  icon={
                    <MdAdminPanelSettings
                      style={{ fontSize: "20px", color: "white" }}
                    />
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
                    {user.fullname || user.email || "Admin User"}
                  </Text>
                  <Text
                    type="secondary"
                    style={{ fontSize: "12px", display: "block" }}
                  >
                    {user.role_id === 3 ? "Y tá" : "Quản trị viên"}
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
