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
  Descriptions,
  Avatar,
  Timeline,
  Divider,
} from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  HeartOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { parentData, healthRecords } from "../../data/parentData";

const { Title, Text } = Typography;

export default function HealthRecordsPage() {
  const [selectedChild, setSelectedChild] = useState(parentData.children[0]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const childHealthRecords = healthRecords.filter(
    (record) => record.childId === selectedChild.id
  );

  const columns = [
    {
      title: "Ngày khám",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Loại khám",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = "blue";
        if (type === "Khám bệnh") color = "red";
        if (type === "Khám định kỳ") color = "green";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctor",
      key: "doctor",
    },
    {
      title: "Kết quả",
      dataIndex: "result",
      key: "result",
      render: (result) => {
        let color = "green";
        if (result.includes("cần theo dõi") || result.includes("cảnh báo")) {
          color = "orange";
        }
        if (result.includes("bệnh") || result.includes("nghiêm trọng")) {
          color = "red";
        }
        return <Tag color={color}>{result}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => viewRecord(record)}
          >
            Xem chi tiết
          </Button>
          <Button icon={<DownloadOutlined />} size="small">
            Tải xuống
          </Button>
        </Space>
      ),
    },
  ];

  const viewRecord = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  return (
    <div style={{ padding: "0" }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              <HeartOutlined style={{ marginRight: 8 }} />
              Hồ sơ sức khỏe
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

      {/* Health Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Lịch sử khám bệnh" extra={<CalendarOutlined />}>
            <Table
              columns={columns}
              dataSource={childHealthRecords}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Thông tin sức khỏe" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Chiều cao">
                {selectedChild.height} cm
              </Descriptions.Item>
              <Descriptions.Item label="Cân nặng">
                {selectedChild.weight} kg
              </Descriptions.Item>
              <Descriptions.Item label="Nhóm máu">
                {selectedChild.bloodType}
              </Descriptions.Item>
              <Descriptions.Item label="Dị ứng">
                {selectedChild.allergies.length > 0
                  ? selectedChild.allergies.join(", ")
                  : "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Lần khám cuối">
                {new Date(selectedChild.lastCheckup).toLocaleDateString(
                  "vi-VN"
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Timeline sức khỏe">
            <Timeline
              items={childHealthRecords.slice(0, 5).map((record) => ({
                children: (
                  <div>
                    <Text strong>{record.type}</Text>
                    <br />
                    <Text type="secondary">{record.date}</Text>
                    <br />
                    <Tag color="blue">{record.result}</Tag>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết hồ sơ sức khỏe"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            Tải xuống
          </Button>,
        ]}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions title="Thông tin khám bệnh" bordered column={2}>
              <Descriptions.Item label="Ngày khám" span={2}>
                {new Date(selectedRecord.date).toLocaleDateString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Loại khám">
                <Tag color="blue">{selectedRecord.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Bác sĩ">
                {selectedRecord.doctor}
              </Descriptions.Item>
              <Descriptions.Item label="Kết quả" span={2}>
                <Tag color="green">{selectedRecord.result}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Chi tiết" span={2}>
                {selectedRecord.details}
              </Descriptions.Item>
              <Descriptions.Item label="Đơn thuốc" span={2}>
                {selectedRecord.prescription || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedRecord.notes || "Không có"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
