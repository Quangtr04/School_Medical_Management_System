import React, { useState, useEffect } from "react"; // Import useState và useEffect
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
import { useNavigate } from "react-router-dom"; // For navigation after logout

const { Header } = Layout;
const { Search } = Input;
const { Text } = Typography;

export default function SchoolNurseHeader() {
  const navigate = useNavigate();
  // State để lưu thông tin người dùng hiện tại
  const [currentUser, setCurrentUser] = useState(null);

  // useEffect để đọc thông tin người dùng từ localStorage khi component mount
  useEffect(() => {
    try {
      const userString = localStorage.getItem("currentUser");
      if (userString) {
        setCurrentUser(JSON.parse(userString));
      }
    } catch (error) {
      console.error("Lỗi khi đọc thông tin người dùng từ localStorage:", error);
      // Xóa dữ liệu không hợp lệ nếu có lỗi
      localStorage.removeItem("currentUser");
      localStorage.removeItem("authToken"); // Cũng xóa token nếu có lỗi user
    }
  }, []); // [] đảm bảo chỉ chạy một lần khi mount
  // const { fullname, role_id } = currentUser;
  // Function to handle logout
  const handleLogout = () => {
    // Xóa thông tin người dùng và token khỏi localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    setCurrentUser(null); // Cập nhật state để UI reflect

    navigate("/login"); // Redirect to login page
    message.info("Bạn đã đăng xuất thành công!");
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
      <Col>
        <Space size={24}>
          <Badge count={1} offset={[-4, 4]}>
            <BellOutlined style={{ fontSize: "22px", cursor: "pointer" }} />
          </Badge>

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
              <>
                <Avatar
                  icon={<UserOutlined />}
                  // Sử dụng Avatar từ currentUser nếu có, hoặc avatar mặc định
                  src={currentUser?.avatarUrl} // Giả sử user object có avatarUrl
                />
                <div style={{ marginLeft: 8, lineHeight: "1.2" }}>
                  <Text
                    style={{
                      fontWeight: "500",
                      color: "#333",
                      display: "block",
                    }}
                  >
                    {/* Hiển thị tên đầy đủ, nếu không có thì username, nếu không có thì "Admin User" */}
                    {/* {fullname ? fullname : "Admin User"} */}
                    School Nurse Name
                  </Text>
                  <Text
                    type="secondary"
                    style={{ fontSize: "12px", display: "block" }}
                  >
                    {/* Hiển thị vai trò, nếu không có thì "Quản trị viên" */}
                    {/* {role_id === 1 ? "Admin" : ""} */}
                    User Roles
                  </Text>
                </div>
                <DownOutlined
                  style={{ fontSize: "12px", color: "#888", marginLeft: 8 }}
                />
              </>
            </a>
          </Dropdown>
        </Space>
      </Col>
    </Header>
  );
}
