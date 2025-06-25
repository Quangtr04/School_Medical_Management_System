import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  message,
  Descriptions,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { parentData } from "../../data/parentData";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ChildrenInfoPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const handleEdit = (child) => {
    setSelectedChild(child);
    setIsEditing(true);
    setIsModalVisible(true);
    form.setFieldsValue(child);
  };

  const handleAdd = () => {
    setSelectedChild(null);
    setIsEditing(false);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    console.log("Form values:", values);
    message.success(
      isEditing ? "Cập nhật thành công!" : "Thêm con thành công!"
    );
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Thông tin con em</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm con
          </Button>
        </Col>
      </Row>

      {/* Parent Information */}
      <Card title="Thông tin phụ huynh" style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col span={4}>
            <Avatar size={80} icon={<UserOutlined />} />
          </Col>
          <Col span={20}>
            <Descriptions column={2}>
              <Descriptions.Item label="Họ và tên" span={1}>
                {parentData.user.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={1}>
                <Space>
                  <MailOutlined />
                  {parentData.user.email}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={1}>
                <Space>
                  <PhoneOutlined />
                  {parentData.user.phone}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={1}>
                <Space>
                  <HomeOutlined />
                  {parentData.user.address}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Children Information */}
      <Row gutter={24}>
        {parentData.children.map((child) => (
          <Col key={child.id} span={12} style={{ marginBottom: 24 }}>
            <Card
              title={
                <Space>
                  <Avatar size="large" icon={<UserOutlined />} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      {child.name}
                    </Title>
                    <Text type="secondary">{child.age} tuổi</Text>
                  </div>
                </Space>
              }
              extra={
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(child)}
                >
                  Chỉnh sửa
                </Button>
              }
              style={{ height: "100%" }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Ngày sinh">
                  {child.dateOfBirth}
                </Descriptions.Item>
                <Descriptions.Item label="Lớp học">
                  {child.class}
                </Descriptions.Item>
                <Descriptions.Item label="Trường học">
                  {child.school}
                </Descriptions.Item>
                <Descriptions.Item label="Chiều cao">
                  {child.height} cm
                </Descriptions.Item>
                <Descriptions.Item label="Cân nặng">
                  {child.weight} kg
                </Descriptions.Item>
                <Descriptions.Item label="Nhóm máu">
                  <Tag color="blue">{child.bloodType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tình trạng sức khỏe">
                  <Tag
                    color={
                      child.healthStatus === "Khỏe mạnh" ? "green" : "orange"
                    }
                  >
                    {child.healthStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Dị ứng">
                  {child.allergies.length > 0 ? (
                    child.allergies.map((allergy) => (
                      <Tag key={allergy} color="red" style={{ margin: "2px" }}>
                        {allergy}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary">Không có</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Khám lần cuối">
                  {child.lastCheckup}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add/Edit Child Modal */}
      <Modal
        title={isEditing ? "Chỉnh sửa thông tin con" : "Thêm con mới"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ và tên"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh!" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Lớp học"
                name="class"
                rules={[{ required: true, message: "Vui lòng nhập lớp học!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Trường học"
                name="school"
                rules={[
                  { required: true, message: "Vui lòng nhập tên trường!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Chiều cao (cm)" name="height">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Cân nặng (kg)" name="weight">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Nhóm máu" name="bloodType">
                <Select>
                  <Option value="A">A</Option>
                  <Option value="B">B</Option>
                  <Option value="AB">AB</Option>
                  <Option value="O">O</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Dị ứng (nếu có)" name="allergies">
            <Select mode="tags" placeholder="Nhập các chất gây dị ứng">
              <Option value="Đậu phộng">Đậu phộng</Option>
              <Option value="Tôm cua">Tôm cua</Option>
              <Option value="Sữa">Sữa</Option>
              <Option value="Trứng">Trứng</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ảnh đại diện" name="avatar">
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {isEditing ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
