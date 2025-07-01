import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Spin,
  Empty,
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
import moment from "moment";
import {
  getParentChildren,
  getChildDetails,
  getParentProfile,
  getParentNotifications,
} from "../../redux/parent/parentSlice";

const { Title, Text, Paragraph } = Typography;

export default function ParentDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { children, selectedChild, profile, notifications, loading, error } =
    useSelector((state) => state.parent);

  // Mock data for demonstration
  const [healthRecords, setHealthRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    dispatch(getParentChildren());
    if (user?.id) {
      dispatch(getParentProfile(user.id));
      dispatch(getParentNotifications());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (children && children.length > 0 && !selectedChild) {
      dispatch(getChildDetails(children[0].id));
    }
  }, [dispatch, children, selectedChild]);

  useEffect(() => {
    if (selectedChild?.id) {
      // Mock health records data
      const mockHealthRecords = [
        {
          id: 1,
          childId: selectedChild.id,
          type: "Khám định kỳ",
          date: moment().subtract(10, "days").format("DD/MM/YYYY"),
          doctor: "Bác sĩ Nguyễn Văn A",
          diagnosis: "Sức khỏe tốt, phát triển bình thường",
          status: "completed",
        },
        {
          id: 2,
          childId: selectedChild.id,
          type: "Khám bệnh",
          date: moment().subtract(30, "days").format("DD/MM/YYYY"),
          doctor: "Bác sĩ Trần Thị B",
          diagnosis: "Cảm cúm nhẹ, đã kê đơn thuốc",
          status: "completed",
        },
      ];

      // Mock vaccination data
      const mockVaccinations = [
        {
          id: 1,
          childId: selectedChild.id,
          vaccineName: "Vắc xin phòng cúm",
          scheduledDate: moment().add(10, "days").format("YYYY-MM-DD"),
          status: "upcoming",
        },
        {
          id: 2,
          childId: selectedChild.id,
          vaccineName: "Vắc xin MMR",
          scheduledDate: moment().subtract(30, "days").format("YYYY-MM-DD"),
          status: "completed",
        },
      ];

      // Mock appointment data
      const mockAppointments = [
        {
          id: 1,
          childId: selectedChild.id,
          type: "Khám định kỳ",
          date: moment().add(5, "days").format("DD/MM/YYYY"),
          time: "09:00",
          doctor: "Bác sĩ Nguyễn Văn A",
          location: "Phòng y tế trường học",
        },
        {
          id: 2,
          childId: selectedChild.id,
          type: "Khám răng",
          date: moment().add(15, "days").format("DD/MM/YYYY"),
          time: "14:30",
          doctor: "Bác sĩ Lê Thị C",
          location: "Phòng khám nha khoa trường học",
        },
      ];

      setHealthRecords(mockHealthRecords);
      setVaccinations(mockVaccinations);
      setAppointments(mockAppointments);
    }
  }, [selectedChild]);

  // Get recent data for selected child
  const recentHealthRecords =
    selectedChild && healthRecords
      ? healthRecords
          .filter((record) => record.childId === selectedChild.id)
          .slice(0, 3)
      : [];

  const upcomingVaccinations =
    selectedChild && vaccinations
      ? vaccinations.filter(
          (vac) => vac.childId === selectedChild.id && vac.status === "upcoming"
        )
      : [];

  const upcomingAppointments =
    selectedChild && appointments
      ? appointments
          .filter((apt) => apt.childId === selectedChild.id)
          .slice(0, 2)
      : [];

  const unreadNotifications = notifications
    ? notifications.filter((notif) => !notif.isRead).slice(0, 4)
    : [];

  const handleSelectChild = (child) => {
    dispatch(getChildDetails(child.id));
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  if (!children || children.length === 0) {
    return (
      <Card>
        <Empty description="Không có thông tin con em" />
      </Card>
    );
  }

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
            Xin chào, {profile?.name || user?.name || "Phụ huynh"}!
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
          {children.map((child) => (
            <Col key={child.id} span={12}>
              <Card
                hoverable
                onClick={() => handleSelectChild(child)}
                style={{
                  border:
                    selectedChild?.id === child.id
                      ? "2px solid #1890ff"
                      : "1px solid #d9d9d9",
                  borderRadius: "8px",
                }}
              >
                <Space>
                  <Avatar
                    size={48}
                    src={child.avatar}
                    icon={!child.avatar && <UserOutlined />}
                  />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      {child.name}
                    </Title>
                    <Text type="secondary">
                      {child.age || "N/A"} tuổi • {child.class || "N/A"}
                    </Text>
                    <br />
                    <Tag
                      color={
                        child.healthStatus === "Khỏe mạnh" ? "green" : "orange"
                      }
                    >
                      {child.healthStatus || "Chưa có thông tin"}
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {selectedChild && (
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
                      {selectedChild.height || "N/A"} cm
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
                      {selectedChild.weight || "N/A"} kg
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
                      {selectedChild.bloodType || "N/A"}
                    </Title>
                    <Text type="secondary">Nhóm máu</Text>
                  </Card>
                </Col>
              </Row>

              <Divider />

              {selectedChild.allergies &&
                selectedChild.allergies.length > 0 && (
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
                  Khám lần cuối:{" "}
                  {selectedChild.lastCheckup
                    ? moment(selectedChild.lastCheckup).format("DD/MM/YYYY")
                    : "N/A"}
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
              {recentHealthRecords.length > 0 ? (
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
              ) : (
                <Empty description="Không có hồ sơ sức khỏe gần đây" />
              )}
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
                        <Text>
                          {appointment.doctor} • {appointment.location}
                        </Text>
                      </Col>
                      <Col>
                        <Space>
                          <Button size="small">Hủy</Button>
                          <Button type="primary" size="small">
                            Xác nhận
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                ))
              ) : (
                <Empty description="Không có lịch hẹn sắp tới" />
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
                  <span>Thông báo</span>
                  {unreadNotifications.length > 0 && (
                    <Badge count={unreadNotifications.length} />
                  )}
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              {unreadNotifications.length > 0 ? (
                <div>
                  {unreadNotifications.map((notification) => (
                    <Alert
                      key={notification.id}
                      message={notification.title}
                      description={notification.content}
                      type={notification.type}
                      showIcon
                      style={{ marginBottom: 12 }}
                    />
                  ))}
                  <Button type="link" block>
                    Xem tất cả thông báo
                  </Button>
                </div>
              ) : (
                <Empty description="Không có thông báo mới" />
              )}
            </Card>

            {/* Upcoming Vaccinations */}
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  <span>Lịch tiêm chủng sắp tới</span>
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              {upcomingVaccinations.length > 0 ? (
                <div>
                  {upcomingVaccinations.map((vaccination) => (
                    <Alert
                      key={vaccination.id}
                      message={vaccination.vaccineName}
                      description={`Ngày tiêm: ${moment(
                        vaccination.scheduledDate
                      ).format("DD/MM/YYYY")}`}
                      type="warning"
                      showIcon
                      style={{ marginBottom: 12 }}
                    />
                  ))}
                  <Button type="link" block>
                    Xem tất cả lịch tiêm chủng
                  </Button>
                </div>
              ) : (
                <Empty description="Không có lịch tiêm chủng sắp tới" />
              )}
            </Card>

            {/* Health Tips */}
            <Card title="Mẹo sức khỏe">
              <ul style={{ paddingLeft: 20 }}>
                <li>
                  <Text>
                    Đảm bảo con bạn uống đủ nước mỗi ngày, đặc biệt trong thời
                    tiết nóng
                  </Text>
                </li>
                <li>
                  <Text>
                    Khuyến khích con tham gia hoạt động thể chất ít nhất 60 phút
                    mỗi ngày
                  </Text>
                </li>
                <li>
                  <Text>
                    Đảm bảo con ngủ đủ 8-10 tiếng mỗi đêm để phát triển khỏe
                    mạnh
                  </Text>
                </li>
                <li>
                  <Text>
                    Hạn chế thời gian sử dụng thiết bị điện tử của con
                  </Text>
                </li>
              </ul>
              <Button type="link" block>
                Xem thêm mẹo sức khỏe
              </Button>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
