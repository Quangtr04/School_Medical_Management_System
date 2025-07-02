import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Spin,
  Empty,
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
import moment from "moment";
import {
  getParentChildren,
  getParentProfile,
  setSelectedChild,
} from "../../redux/parent/parentSlice";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ChildrenInfoPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { children, profile, loading, error } = useSelector(
    (state) => state.parent
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user?.id) {
      dispatch(getParentProfile(user.id));
      dispatch(getParentChildren());
    }
  }, [dispatch, user]);

  const handleEdit = (child) => {
    dispatch(setSelectedChild(child));
    setIsEditing(true);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...child,
      dateOfBirth: child.dateOfBirth ? moment(child.dateOfBirth) : null,
      allergies: child.allergies ? child.allergies.join(", ") : "",
    });
  };

  const handleAdd = () => {
    dispatch(setSelectedChild(null));
    setIsEditing(false);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    console.log("Form values:", values);
    // Here you would dispatch an action to update or add a child
    // For example: dispatch(updateChildInfo(values)) or dispatch(addChildInfo(values))
    message.success(
      isEditing ? "Cập nhật thành công!" : "Thêm con thành công!"
    );
    setIsModalVisible(false);
    form.resetFields();
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
            <Avatar
              size={80}
              src={profile?.avatar}
              icon={!profile?.avatar && <UserOutlined />}
            />
          </Col>
          <Col span={20}>
            <Descriptions column={2}>
              <Descriptions.Item label="Họ và tên" span={1}>
                {profile?.name || user?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={1}>
                <Space>
                  <MailOutlined />
                  {profile?.email || user?.email || "N/A"}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={1}>
                <Space>
                  <PhoneOutlined />
                  {profile?.phone || user?.phone || "N/A"}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={1}>
                <Space>
                  <HomeOutlined />
                  {profile?.address || "N/A"}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Children Information */}
      <Row gutter={24}>
        {children && children.length > 0 ? (
          children.map((child) => (
            <Col key={child.id} span={12} style={{ marginBottom: 24 }}>
              <Card
                title={
                  <Space>
                    <Avatar
                      size="large"
                      src={child.avatar}
                      icon={!child.avatar && <UserOutlined />}
                    />
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        {child.name}
                      </Title>
                      <Text type="secondary">{child.age || "N/A"} tuổi</Text>
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
                    {child.dateOfBirth
                      ? moment(child.dateOfBirth).format("DD/MM/YYYY")
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lớp học">
                    {child.class || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trường học">
                    {child.school || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chiều cao">
                    {child.height ? `${child.height} cm` : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cân nặng">
                    {child.weight ? `${child.weight} kg` : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nhóm máu">
                    {child.bloodType ? (
                      <Tag color="blue">{child.bloodType}</Tag>
                    ) : (
                      "N/A"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tình trạng sức khỏe">
                    {child.healthStatus ? (
                      <Tag
                        color={
                          child.healthStatus === "Khỏe mạnh"
                            ? "green"
                            : "orange"
                        }
                      >
                        {child.healthStatus}
                      </Tag>
                    ) : (
                      "N/A"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dị ứng">
                    {child.allergies && child.allergies.length > 0 ? (
                      child.allergies.map((allergy) => (
                        <Tag
                          key={allergy}
                          color="red"
                          style={{ margin: "2px" }}
                        >
                          {allergy}
                        </Tag>
                      ))
                    ) : (
                      <Text type="secondary">Không có</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Khám lần cuối">
                    {child.lastCheckup
                      ? moment(child.lastCheckup).format("DD/MM/YYYY")
                      : "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Card>
              <Empty description="Không có thông tin con em" />
            </Card>
          </Col>
        )}
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

          <Form.Item label="Tình trạng sức khỏe" name="healthStatus">
            <Select>
              <Option value="Khỏe mạnh">Khỏe mạnh</Option>
              <Option value="Cần theo dõi">Cần theo dõi</Option>
              <Option value="Bệnh mãn tính">Bệnh mãn tính</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Dị ứng (ngăn cách bởi dấu phẩy)" name="allergies">
            <Input />
          </Form.Item>

          <Form.Item label="Ảnh đại diện" name="avatar">
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {isEditing ? "Cập nhật" : "Thêm mới"}
            </Button>
            <Button
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
