import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Calendar,
  Badge,
  Alert,
  Avatar,
  Progress,
} from "antd";
import {
  CalendarOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { parentData, vaccinations } from "../../data/parentData";

const { Title, Text } = Typography;

export default function VaccinationsPage() {
  const [selectedChild, setSelectedChild] = useState(parentData.children[0]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const childVaccinations = vaccinations.filter(
    (vaccination) => vaccination.childId === selectedChild.id
  );

  const completedVaccinations = childVaccinations.filter(
    (v) => v.status === "completed"
  ).length;
  const upcomingVaccinations = childVaccinations.filter(
    (v) => v.status === "upcoming"
  ).length;
  const progressPercentage = Math.round(
    (completedVaccinations / childVaccinations.length) * 100
  );

  const columns = [
    {
      title: "Tên vaccine",
      dataIndex: "vaccineName",
      key: "vaccineName",
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Ngày tiêm dự kiến",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Ngày tiêm thực tế",
      dataIndex: "actualDate",
      key: "actualDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let icon = null;
        let text = status;

        switch (status) {
          case "completed":
            color = "green";
            icon = <CheckCircleOutlined />;
            text = "Đã tiêm";
            break;
          case "upcoming":
            color = "orange";
            icon = <ClockCircleOutlined />;
            text = "Sắp tới";
            break;
          case "overdue":
            color = "red";
            icon = <ExclamationCircleOutlined />;
            text = "Quá hạn";
            break;
          default:
            break;
        }

        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
    },
  ];

  const getListData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayVaccinations = childVaccinations.filter(
      (v) => v.scheduledDate === dateStr || v.actualDate === dateStr
    );

    return dayVaccinations.map((v) => ({
      type:
        v.status === "completed"
          ? "success"
          : v.status === "upcoming"
          ? "warning"
          : "error",
      content: v.vaccineName,
    }));
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ padding: "0" }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              <MedicineBoxOutlined style={{ marginRight: 8 }} />
              Lịch tiêm chủng
            </Title>
          </Col>
        </Row>
      </Card>

      {/* Child Selection */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {parentData.children.map((child) => (
          <Col xs={24} sm={12} md={8} key={child.id}>
            <Card
              hoverable
              style={{
                border:
                  selectedChild.id === child.id
                    ? "2px solid #1890ff"
                    : "1px solid #d9d9d9",
                backgroundColor:
                  selectedChild.id === child.id ? "#f0f9ff" : "#fff",
              }}
              onClick={() => setSelectedChild(child)}
            >
              <Space>
                <Avatar size={48} icon={<UserOutlined />} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {child.name}
                  </Title>
                  <Text type="secondary">{child.class}</Text>
                  <br />
                  <Progress
                    percent={progressPercentage}
                    size="small"
                    format={(percent) => `${percent}% hoàn thành`}
                  />
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Vaccination Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <CheckCircleOutlined
                style={{ fontSize: 32, color: "#52c41a", marginBottom: 8 }}
              />
              <Title level={3} style={{ margin: 0, color: "#52c41a" }}>
                {completedVaccinations}
              </Title>
              <Text type="secondary">Đã tiêm</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <ClockCircleOutlined
                style={{ fontSize: 32, color: "#faad14", marginBottom: 8 }}
              />
              <Title level={3} style={{ margin: 0, color: "#faad14" }}>
                {upcomingVaccinations}
              </Title>
              <Text type="secondary">Sắp tới</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Progress
                type="circle"
                percent={progressPercentage}
                format={(percent) => `${percent}%`}
              />
              <br />
              <Text type="secondary">Hoàn thành</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Upcoming Vaccinations Alert */}
      {upcomingVaccinations > 0 && (
        <Alert
          message="Có lịch tiêm chủng sắp tới"
          description={`${selectedChild.name} có ${upcomingVaccinations} mũi vaccine cần tiêm trong thời gian tới. Vui lòng sắp xếp thời gian phù hợp.`}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[16, 16]}>
        {/* Vaccination Table */}
        <Col xs={24} lg={14}>
          <Card title="Danh sách vaccine" extra={<MedicineBoxOutlined />}>
            <Table
              columns={columns}
              dataSource={childVaccinations}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="middle"
            />
          </Card>
        </Col>

        {/* Calendar */}
        <Col xs={24} lg={10}>
          <Card title="Lịch tiêm" extra={<CalendarOutlined />}>
            <Calendar
              cellRender={dateCellRender}
              onSelect={setSelectedDate}
              fullscreen={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
