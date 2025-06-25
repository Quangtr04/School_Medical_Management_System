import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Badge,
  Button,
  Tag,
  Space,
  Divider,
  Timeline,
  Progress,
  Alert,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  CalendarOutlined,
  BellOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  parentData,
  healthRecords,
  vaccinations,
  appointments,
  notifications,
} from "../../data/parentData";

const { Title, Text, Paragraph } = Typography;

export default function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState(parentData.children[0]);

  // Get recent data for selected child
  const recentHealthRecords = healthRecords
    .filter((record) => record.childId === selectedChild.id)
    .slice(0, 3);

  const upcomingVaccinations = vaccinations.filter(
    (vac) => vac.childId === selectedChild.id && vac.status === "upcoming"
  );

  const upcomingAppointments = appointments
    .filter((apt) => apt.childId === selectedChild.id)
    .slice(0, 2);

  const unreadNotifications = notifications
    .filter((notif) => !notif.isRead)
    .slice(0, 4);

  return (
    <div style={{ padding: "0", background: "#f0f2f5" }}>
      {/* Welcome Section */}
      <Card
        style={{
          marginBottom: 24,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
        }}
      >
        <div style={{ color: "white" }}>
          <Title level={2} style={{ color: "white", margin: 0 }}>
            Xin chào, {parentData.user.name}!
          </Title>
          <Paragraph
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "16px",
              margin: "8px 0 0 0",
            }}
          >
            Chào mừng bạn đến với trang quản lý sức khỏe con em
          </Paragraph>
        </div>
      </Card>

      {/* Child Selection */}
      <Card title="Chọn con của bạn" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          {parentData.children.map((child) => (
            <Col key={child.id} span={12}>
              <Card
                hoverable
                onClick={() => setSelectedChild(child)}
                style={{
                  border:
                    selectedChild.id === child.id
                      ? "2px solid #1890ff"
                      : "1px solid #d9d9d9",
                  borderRadius: "8px",
                }}
              >
                <Space>
                  <Avatar size={48} icon={<UserOutlined />} />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      {child.name}
                    </Title>
                    <Text type="secondary">
                      {child.age} tuổi • {child.class}
                    </Text>
                    <br />
                    <Tag
                      color={
                        child.healthStatus === "Khỏe mạnh" ? "green" : "orange"
                      }
                    >
                      {child.healthStatus}
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={24}>
        {/* Left Column */}
        <Col span={16}>
          {/* Child Health Overview */}
          <Card
            title={
              <Space>
                <HeartOutlined />
                <span>Sức khỏe của {selectedChild.name}</span>
              </Space>
            }
            extra={
              <Button type="primary" icon={<EditOutlined />}>
                Cập nhật
              </Button>
            }
            style={{ marginBottom: 24 }}
          >
            <Row gutter={24}>
              <Col span={8}>
                <Card
                  size="small"
                  style={{ textAlign: "center", background: "#f6ffed" }}
                >
                  <Title level={4} style={{ color: "#52c41a", margin: 0 }}>
                    {selectedChild.height} cm
                  </Title>
                  <Text type="secondary">Chiều cao</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  size="small"
                  style={{ textAlign: "center", background: "#fff7e6" }}
                >
                  <Title level={4} style={{ color: "#fa8c16", margin: 0 }}>
                    {selectedChild.weight} kg
                  </Title>
                  <Text type="secondary">Cân nặng</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  size="small"
                  style={{ textAlign: "center", background: "#f0f5ff" }}
                >
                  <Title level={4} style={{ color: "#1890ff", margin: 0 }}>
                    {selectedChild.bloodType}
                  </Title>
                  <Text type="secondary">Nhóm máu</Text>
                </Card>
              </Col>
            </Row>

            <Divider />

            {selectedChild.allergies.length > 0 && (
              <div>
                <Text strong>Dị ứng: </Text>
                {selectedChild.allergies.map((allergy) => (
                  <Tag key={allergy} color="red" style={{ margin: "2px" }}>
                    {allergy}
                  </Tag>
                ))}
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Khám lần cuối: {selectedChild.lastCheckup}
              </Text>
            </div>
          </Card>

          {/* Recent Health Records */}
          <Card
            title="Hồ sơ sức khỏe gần đây"
            extra={
              <Button type="link" icon={<EyeOutlined />}>
                Xem tất cả
              </Button>
            }
            style={{ marginBottom: 24 }}
          >
            <Timeline>
              {recentHealthRecords.map((record) => (
                <Timeline.Item
                  key={record.id}
                  color={record.status === "completed" ? "green" : "blue"}
                >
                  <div>
                    <Text strong>{record.type}</Text>
                    <br />
                    <Text type="secondary">
                      {record.date} • {record.doctor}
                    </Text>
                    <br />
                    <Text>{record.diagnosis}</Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>

          {/* Upcoming Appointments */}
          <Card
            title="Lịch hẹn sắp tới"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Đặt lịch mới
              </Button>
            }
          >
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  size="small"
                  style={{ marginBottom: 12 }}
                >
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong>{appointment.type}</Text>
                      <br />
                      <Text type="secondary">
                        {appointment.date} • {appointment.time}
                      </Text>
                      <br />
                      <Text>{appointment.doctor}</Text>
                    </Col>
                    <Col>
                      <Tag color="blue">{appointment.status}</Tag>
                    </Col>
                  </Row>
                </Card>
              ))
            ) : (
              <Text type="secondary">Không có lịch hẹn nào</Text>
            )}
          </Card>
        </Col>

        {/* Right Column */}
        <Col span={8}>
          {/* Notifications */}
          <Card
            title={
              <Space>
                <BellOutlined />
                <span>Thông báo & Yêu cầu cần xác nhận</span>
                <Badge count={unreadNotifications.length} size="small" />
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            {unreadNotifications.map((notification) => (
              <Alert
                key={notification.id}
                message={notification.title}
                description={notification.message}
                type={notification.priority === "high" ? "warning" : "info"}
                showIcon
                style={{ marginBottom: 12 }}
                action={
                  <Button size="small" type="link">
                    Xác nhận
                  </Button>
                }
              />
            ))}

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Button type="link">Xem tất cả thông báo</Button>
            </div>
          </Card>

          {/* Vaccination Schedule */}
          <Card title="Lịch tiêm chủng sắp tới" style={{ marginBottom: 24 }}>
            {upcomingVaccinations.length > 0 ? (
              upcomingVaccinations.map((vaccination) => (
                <Card
                  key={vaccination.id}
                  size="small"
                  style={{ marginBottom: 12, background: "#fff7e6" }}
                >
                  <Text strong>{vaccination.vaccineName}</Text>
                  <br />
                  <Text type="secondary">
                    {vaccination.scheduledDate} • {vaccination.doseNumber}
                  </Text>
                  <br />
                  <Text style={{ fontSize: "12px" }}>{vaccination.notes}</Text>
                </Card>
              ))
            ) : (
              <Text type="secondary">Không có lịch tiêm chủng nào</Text>
            )}
          </Card>

          {/* Quick Actions */}
          <Card title="Hành động nhanh">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button block icon={<CalendarOutlined />}>
                Đặt lịch khám
              </Button>
              <Button block icon={<HeartOutlined />}>
                Cập nhật sức khỏe
              </Button>
              <Button block icon={<BellOutlined />}>
                Xem thông báo
              </Button>
              <Button block icon={<EyeOutlined />}>
                Xem hồ sơ đầy đủ
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
