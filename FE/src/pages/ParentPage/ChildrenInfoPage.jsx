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
  EyeOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  getParentChildren,
  getParentProfile,
  setSelectedChild,
  getChildDetails,
} from "../../redux/parent/parentSlice";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ChildrenInfoPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { children, profile, loading, error, selectedChild } = useSelector(
    (state) => state.parent
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [detailModalVisible, setDetailModalVisible] = useState(false);

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
      dateOfBirth: child.date_of_birth ? moment(child.date_of_birth) : null,
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
    // Here you would dispatch an action to update or add a child
    // For example: dispatch(updateChildInfo(values)) or dispatch(addChildInfo(values))
    message.success(
      isEditing ? "Cập nhật thành công!" : "Thêm con thành công!"
    );
    setIsModalVisible(false);
    form.resetFields();
  };

  const showStudentDetail = (child) => {
    dispatch(getChildDetails(child.student_id || child.id));
    setDetailModalVisible(true);
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

  // Helper function to extract data from student object
  const getStudentData = (child) => {
    // Access health object if it exists
    const health = child.health || {};

    // Extract data from nested structure or use direct properties
    return {
      id: child.student_id || child.id || "",
      name: child.student_name || child.name || "",
      gender: child.student_gender || child.gender || "",
      date_of_birth: child.student_date_of_birth || child.date_of_birth || "",
      class_name: child.class_name || "",
      grade: child.grade || "",
      height: health.height_cm || child.height || "",
      weight: health.weight_kg || child.weight || "",
      blood_type: health.blood_type || child.blood_type || "",
      allergies: child.allergies || [],
      medical_conditions: child.medical_conditions || [],
    };
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
          children.map((child) => {
            const studentData = getStudentData(child);
            return (
              <Col key={studentData.id} span={12} style={{ marginBottom: 24 }}>
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
                          {studentData.name || "Chưa cập nhật"}
                        </Title>
                        <Text type="secondary">
                          {studentData.date_of_birth
                            ? `${moment().diff(
                                moment(studentData.date_of_birth),
                                "years"
                              )} tuổi`
                            : "Chưa cập nhật"}
                        </Text>
                      </div>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => showStudentDetail(child)}
                      >
                        Xem chi tiết
                      </Button>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(child)}
                      >
                        Chỉnh sửa
                      </Button>
                    </Space>
                  }
                  style={{ height: "100%" }}
                >
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Ngày sinh">
                      {studentData.date_of_birth
                        ? moment(studentData.date_of_birth).format("DD/MM/YYYY")
                        : "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới tính">
                      {studentData.gender || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Lớp">
                      {studentData.class_name || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nhóm máu">
                      {studentData.blood_type || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Chiều cao">
                      {studentData.height
                        ? `${studentData.height} cm`
                        : "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cân nặng">
                      {studentData.weight
                        ? `${studentData.weight} kg`
                        : "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dị ứng">
                      {studentData.allergies && studentData.allergies.length > 0
                        ? studentData.allergies.join(", ")
                        : "Không có"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            );
          })
        ) : (
          <Col span={24}>
            <Empty
              description="Chưa có thông tin con em"
              style={{ margin: "40px 0" }}
            />
          </Col>
        )}
      </Row>

      {/* Add/Edit Child Modal */}
      <Modal
        title={isEditing ? "Chỉnh sửa thông tin con" : "Thêm con mới"}
        open={isModalVisible}
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

      {/* Student Detail Modal */}
      <Modal
        title="Chi tiết học sinh"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedChild ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Họ và tên">
              {selectedChild.full_name || selectedChild.name || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Mã học sinh">
              {selectedChild.student_id || selectedChild.id || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {selectedChild.date_of_birth
                ? moment(selectedChild.date_of_birth).format("DD/MM/YYYY")
                : "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {selectedChild.gender || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Lớp">
              {selectedChild.class_name || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Nhóm máu">
              {selectedChild.health?.blood_type ||
                selectedChild.blood_type ||
                "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Chiều cao">
              {selectedChild.health?.height_cm || selectedChild.height
                ? `${
                    selectedChild.health?.height_cm || selectedChild.height
                  } cm`
                : "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Cân nặng">
              {selectedChild.health?.weight_kg || selectedChild.weight
                ? `${
                    selectedChild.health?.weight_kg || selectedChild.weight
                  } kg`
                : "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Dị ứng">
              {selectedChild.health?.allergies || selectedChild.allergies
                ? (
                    selectedChild.health?.allergies || selectedChild.allergies
                  ).join(", ")
                : "Không có"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
            <p>Đang tải thông tin...</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
