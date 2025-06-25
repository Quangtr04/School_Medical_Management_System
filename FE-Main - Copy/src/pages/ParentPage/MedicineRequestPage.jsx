import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Table,
  Tag,
  Space,
  Modal,
  DatePicker,
  TimePicker,
  message,
  Alert,
  Divider,
  Avatar,
} from "antd";
import {
  MedicineBoxOutlined,
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { parentData } from "../../data/parentData";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function MedicineRequestPage() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [medicineRequests, setMedicineRequests] = useState([
    {
      id: 1,
      childId: 1,
      childName: "Nguyễn Văn An",
      medicineName: "Paracetamol",
      dosage: "5ml",
      frequency: "3 lần/ngày",
      duration: "3 ngày",
      time: "8:00, 12:00, 18:00",
      notes: "Uống sau ăn",
      status: "pending",
      requestDate: "2023-12-20",
      prescription: "prescription1.pdf",
    },
    {
      id: 2,
      childId: 1,
      childName: "Nguyễn Văn An",
      medicineName: "Vitamin C",
      dosage: "1 viên",
      frequency: "1 lần/ngày",
      duration: "7 ngày",
      time: "8:00",
      notes: "Uống sau bữa sáng",
      status: "approved",
      requestDate: "2023-12-18",
      prescription: "prescription2.pdf",
    },
  ]);

  const handleSubmit = (values) => {
    const newRequest = {
      id: medicineRequests.length + 1,
      childId: selectedChild?.id,
      childName: selectedChild?.name,
      ...values,
      status: "pending",
      requestDate: moment().format("YYYY-MM-DD"),
    };

    setMedicineRequests([...medicineRequests, newRequest]);
    message.success("Gửi yêu cầu thuốc thành công!");
    setIsModalVisible(false);
    form.resetFields();
    setSelectedChild(null);
  };
  const handleEdit = (record) => {
    setSelectedChild(
      parentData.children.find((child) => child.id === record.childId)
    );
    form.setFieldsValue({
      ...record,
      time: record.time,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa yêu cầu này?",
      onOk: () => {
        setMedicineRequests(medicineRequests.filter((req) => req.id !== id));
        message.success("Đã xóa yêu cầu thuốc");
      },
    });
  };

  const columns = [
    {
      title: "Con em",
      dataIndex: "childName",
      key: "childName",
      render: (name) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Tên thuốc",
      dataIndex: "medicineName",
      key: "medicineName",
      render: (name) => (
        <Text strong style={{ color: "#1890ff" }}>
          {name}
        </Text>
      ),
    },
    {
      title: "Liều dùng",
      dataIndex: "dosage",
      key: "dosage",
    },
    {
      title: "Tần suất",
      dataIndex: "frequency",
      key: "frequency",
    },
    {
      title: "Thời gian uống",
      dataIndex: "time",
      key: "time",
      render: (time) => (
        <div>
          {time.split(", ").map((t, index) => (
            <Tag key={index} color="blue" style={{ margin: "2px" }}>
              {t}
            </Tag>
          ))}
        </div>
      ),
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
          case "pending":
            color = "orange";
            icon = <ClockCircleOutlined />;
            text = "Chờ duyệt";
            break;
          case "approved":
            color = "green";
            icon = <CheckCircleOutlined />;
            text = "Đã duyệt";
            break;
          case "rejected":
            color = "red";
            text = "Từ chối";
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
      title: "Ngày gửi",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} size="small">
            Xem
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(record)}
              >
                Sửa
              </Button>
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(record.id)}
              >
                Xóa
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "0" }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              <MedicineBoxOutlined style={{ marginRight: 8 }} />
              Gửi thuốc cho con
            </Title>
            <Text type="secondary">
              Gửi yêu cầu cho y tá trường để hỗ trợ uống thuốc cho con
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setIsModalVisible(true)}
            >
              Gửi yêu cầu mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Instructions */}
      <Alert
        message="Hướng dẫn gửi thuốc"
        description={
          <div>
            <p>
              • Chỉ gửi thuốc có đơn thuốc từ bác sĩ hoặc thuốc không cần đơn
            </p>
            <p>• Ghi rõ liều dùng, thời gian uống và ghi chú đặc biệt</p>
            <p>• Đính kèm đơn thuốc hoặc hướng dẫn sử dụng (nếu có)</p>
            <p>• Y tá trường sẽ xem xét và phản hồi trong vòng 24h</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Medicine Requests Table */}
      <Card title="Danh sách yêu cầu gửi thuốc">
        <Table
          columns={columns}
          dataSource={medicineRequests}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={
          selectedChild ? "Chỉnh sửa yêu cầu thuốc" : "Gửi yêu cầu thuốc mới"
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedChild(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 20 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="childId"
                label="Chọn con"
                rules={[{ required: true, message: "Vui lòng chọn con" }]}
              >
                <Select
                  placeholder="Chọn con của bạn"
                  onChange={(value) => {
                    const child = parentData.children.find(
                      (c) => c.id === value
                    );
                    setSelectedChild(child);
                  }}
                >
                  {parentData.children.map((child) => (
                    <Option key={child.id} value={child.id}>
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        {child.name} - {child.class}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="medicineName"
                label="Tên thuốc"
                rules={[{ required: true, message: "Vui lòng nhập tên thuốc" }]}
              >
                <Input placeholder="VD: Paracetamol, Vitamin C..." />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="dosage"
                label="Liều dùng"
                rules={[{ required: true, message: "Vui lòng nhập liều dùng" }]}
              >
                <Input placeholder="VD: 5ml, 1 viên..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="frequency"
                label="Tần suất"
                rules={[{ required: true, message: "Vui lòng nhập tần suất" }]}
              >
                <Input placeholder="VD: 3 lần/ngày" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="duration"
                label="Thời gian điều trị"
                rules={[{ required: true, message: "Vui lòng nhập thời gian" }]}
              >
                <Input placeholder="VD: 3 ngày, 1 tuần..." />
              </Form.Item>
            </Col>
          </Row>{" "}
          <Form.Item
            name="time"
            label="Giờ uống thuốc"
            rules={[
              { required: true, message: "Vui lòng nhập giờ uống thuốc" },
            ]}
          >
            <Input placeholder="VD: 8:00, 12:00, 18:00 (phân cách bằng dấu phẩy)" />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú đặc biệt">
            <TextArea
              rows={3}
              placeholder="VD: Uống sau ăn, tránh uống cùng sữa..."
            />
          </Form.Item>
          <Form.Item name="prescription" label="Đơn thuốc / Hướng dẫn (nếu có)">
            <Upload beforeUpload={() => false} accept=".pdf,.jpg,.jpeg,.png">
              <Button icon={<UploadOutlined />}>Tải lên file đơn thuốc</Button>
            </Upload>
          </Form.Item>
          <Divider />
          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setSelectedChild(null);
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Gửi yêu cầu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
