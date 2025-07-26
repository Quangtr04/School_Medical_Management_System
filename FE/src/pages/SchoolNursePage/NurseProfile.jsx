import React from "react";
import { Card, Avatar, Tag, Divider, Row, Col, Typography } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../configs/config-axios";
const { Title, Text } = Typography;

export default function NurseProfileCard() {
  const user = useSelector((state) => state.auth.user);
  console.log(user);
  const token = localStorage.getItem("accessToken");
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState(user.address || "");

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const handleSave = async (values) => {
    try {
      await api.patch("/nurse/profile",
        { address: values },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
    } catch (err) {
      toast.error(err.message);
    }
  }


  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: 24,
      }}
    >
      {/* Header */}
      <Card bordered style={{ borderLeft: "4px solid #10b981" }}>
        <Row gutter={16} align="middle">
          <Col>
            <Avatar
              size={80}
              style={{
                backgroundColor: "#d1fae5",
                color: "#065f46",
                fontWeight: "bold",
              }}
            >
              {getInitials(user.fullname)}
            </Avatar>
          </Col>
          <Col flex="auto">
            <Row align="middle" justify="space-between">
              <Col>
                <Title level={3} style={{ marginBottom: 8 }}>
                  {user.fullname}
                </Title>
                <Tag color="green">Y tá đã đăng ký</Tag>
              </Col>
              <Col>
                <Text type="secondary">
                  <SafetyCertificateOutlined /> Mã nhân viên: {user.user_id}
                </Text>{" "}
                <Divider type="vertical" />
                <Text type={user.is_active ? "success" : "danger"}>
                  <CheckCircleOutlined />{" "}
                  {user.is_active ? "Đang hoạt động" : "Ngưng hoạt động"}
                </Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      <Row gutter={16} style={{ marginTop: 24 }}>
        {/* Thông tin cá nhân */}
        <Col xs={24} md={12}>
          <Card
            title={
              <span>
                <UserOutlined /> Thông tin cá nhân
              </span>
            }
          >
            <div className="info-grid">
              <Row className="info-row" justify="space-between">
                <Col>
                  <Text type="secondary">Họ và tên</Text>
                </Col>
                <Col>
                  <Text strong>{user.fullname}</Text>
                </Col>
              </Row>
              <Divider />
              <Row className="info-row" justify="space-between">
                <Col>
                  <Text type="secondary">Giới tính</Text>
                </Col>
                <Col>
                  <Text>{user.gender === "Male" ? "Nam" : "Nữ"}</Text>
                </Col>
              </Row>
              <Divider />
              <Row className="info-row" justify="space-between">
                <Col>
                  <Text type="secondary">Ngày sinh</Text>
                </Col>
                <Col>
                  <Text>{formatDate(user.dayOfBirth)}</Text>
                </Col>
              </Row>
              <Divider />
              <Row className="info-row" justify="space-between">
                <Col>
                  <Text type="secondary">Tuổi</Text>
                </Col>
                <Col>
                  <Text strong>{calculateAge(user.dayOfBirth)} tuổi</Text>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* Thông tin liên hệ */}
        <Col xs={24} md={12}>
          <Card
            title={
              <span>
                <PhoneOutlined /> Thông tin liên hệ
              </span>
            }
          >
            <div>
              <Text type="secondary">
                <MailOutlined /> Email
              </Text>
              <div style={{ color: "#1677ff" }}>{user.email}</div>
              <Divider />
              <Text type="secondary">
                <PhoneOutlined /> Số điện thoại
              </Text>
              <div>{user.phone}</div>
              <Divider />
              <Text type="secondary">
                <HomeOutlined /> Địa chỉ
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type={'text'}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  style={{ width: 150, marginRight: 8, border: '1px solid #d9d9d9', borderRadius: 4, padding: '4px 8px', background: '#f5f5f5' }}
                />
                <button
                  style={{
                    marginLeft: 30,
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#059669')}
                  onMouseOut={e => (e.currentTarget.style.background = '#10b981')}
                  onClick={() => handleSave(user.address)}
                >
                  Lưu địa chỉ
                </button>
              </div>
              <Divider />

              <Text type="secondary">
                Mật khẩu
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={user.password ? user.password : '********'}
                  readOnly
                  style={{ width: 150, marginRight: 8, border: '1px solid #d9d9d9', borderRadius: 4, padding: '4px 8px', background: '#f5f5f5' }}
                  disabled
                />
                <span
                  style={{ cursor: 'pointer', marginRight: 8 }}
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </span>
                <button
                  style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#059669')}
                  onMouseOut={e => (e.currentTarget.style.background = '#10b981')}
                  onClick={() => {
                    // Placeholder: send request to admin
                    toast.success('Yêu cầu thay đổi mật khẩu đã được gửi đến quản trị viên!');
                  }}
                >
                  Gửi yêu cầu đổi mật khẩu
                </button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
{
  /* Thông tin chuyên môn */
}
{
  /* <Card
        title={
          <span>
            <TeamOutlined style={{ color: "#10b981" }} /> Thông tin chuyên môn
          </span>
        }
        style={{ marginTop: 24 }}
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Card
              bordered
              style={{ textAlign: "center", background: "#ecfdf5" }}
            >
              <SafetyCertificateOutlined
                style={{ fontSize: 28, color: "#10b981" }}
              />
              <div>Vai trò</div>
              <div style={{ fontWeight: "bold", fontSize: 18 }}>
                {user.role_id}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              bordered
              style={{ textAlign: "center", background: "#eff6ff" }}
            >
              <CheckCircleOutlined style={{ fontSize: 28, color: "#3b82f6" }} />
              <div>Trạng thái</div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                  color: user.is_active ? "green" : "red",
                }}
              >
                {user.is_active ? "Đang hoạt động" : "Ngưng hoạt động"}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              bordered
              style={{ textAlign: "center", background: "#f5f3ff" }}
            >
              <ClockCircleOutlined style={{ fontSize: 28, color: "#8b5cf6" }} />
              <div>Thành viên từ</div>
              <div style={{ fontWeight: "bold", fontSize: 18 }}>
                {formatDate(user.created_at)}
              </div>
            </Card>
          </Col>
        </Row>
      </Card> */
}
