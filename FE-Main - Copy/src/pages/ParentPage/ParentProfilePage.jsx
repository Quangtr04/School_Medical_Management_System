import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  Form,
  Input,
  Spin,
  message,
  Tabs,
  Descriptions,
  Upload,
  Modal,
  Divider,
  DatePicker,
  Select,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  UploadOutlined,
  IdcardOutlined,
  CloseOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  getParentProfile,
  updateParentProfile,
  getParentChildren,
} from "../../redux/parent/parentSlice";
import api from "../../configs/config-axios";
import { format } from "date-fns";
import moment from "moment";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function ParentProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, children, loading, error, success } = useSelector(
    (state) => state.parent
  );

  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Fetch profile data
  useEffect(() => {
    console.log("Current user:", user);
    if (user?.user_id) {
      console.log("Fetching profile with user_id:", user.user_id);
      dispatch(getParentProfile(user.user_id));
      dispatch(getParentChildren());
    }
  }, [dispatch, user]);

  // Log profile data when it changes
  useEffect(() => {
    console.log("Profile data in component:", profile);
  }, [profile]);

  // Set form values when profile data is loaded
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dayOfBirth: user.dayOfBirth ? moment(user.dayOfBirth) : null,
      });
    }
  }, [user, form]);

  // Handle form submission
  const handleSubmit = (values) => {
    console.log("Form values:", values);

    // Lấy user_id từ user object
    const userId = user?.user_id;
    console.log("Updating profile for user ID:", userId);

    if (!userId) {
      message.error("Không tìm thấy ID người dùng!");
      return;
    }

    // Tạo object dữ liệu để gửi đi
    const profileData = {
      fullname: values.fullname,
      email: values.email,
      phone: values.phone,
      address: values.address,
      gender: values.gender,
      dayOfBirth: values.dayOfBirth
        ? values.dayOfBirth.format("YYYY-MM-DD")
        : null,
    };

    // Gửi request cập nhật thông tin
    updateProfileDirectly(profileData, userId);
  };

  // Handle avatar change
  const handleAvatarChange = ({ fileList }) => {
    if (fileList.length > 0) {
      setAvatar(fileList[fileList.length - 1]);
    } else {
      setAvatar(null);
    }
  };

  // Preview avatar
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  // Convert file to base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Cập nhật trực tiếp bằng axios
  const updateProfileDirectly = async (profileData, userId) => {
    try {
      message.loading({ content: "Đang cập nhật...", key: "updateProfile" });

      console.log("Sending direct update with:", profileData);
      console.log("To endpoint:", `/parent/profile/${userId}`);

      const response = await api.patch(
        `/parent/profile/${userId}`,
        profileData
      );

      console.log("Update response:", response.data);
      message.success({
        content: "Cập nhật thông tin thành công!",
        key: "updateProfile",
      });

      // Cập nhật lại dữ liệu trong Redux store
      dispatch(getParentProfile(userId));
      setEditing(false);
    } catch (error) {
      console.error("Direct update error:", error);

      let errorMessage = "Cập nhật thất bại!";
      if (error.response) {
        console.error("Error response:", error.response.data);
        errorMessage =
          error.response.data?.message ||
          `Lỗi máy chủ: ${error.response.status}`;
      }

      message.error({ content: errorMessage, key: "updateProfile" });
    }
  };

  // Kiểm tra token
  const checkToken = () => {
    const token = localStorage.getItem("accessToken");
    console.log("Current token:", token);
    message.info(token ? "Token đã được lưu" : "Không tìm thấy token");
  };

  // Test API trực tiếp
  const testDirectAPI = async () => {
    const userId = user?.id || user?.user_id;
    if (!userId) {
      message.error("Không tìm thấy ID người dùng!");
      return;
    }

    try {
      message.loading({ content: "Đang kiểm tra API...", key: "testAPI" });

      // Test GET API
      console.log("Testing GET API:", `/parent/profile/${userId}`);
      const getResponse = await api.get(`/parent/profile/${userId}`);
      console.log("GET response:", getResponse.data);

      // Test PATCH API với dữ liệu đơn giản
      const testData = {
        fullname: profile?.fullname || user?.fullname,
        test_field: "Test value " + new Date().toISOString(),
      };
      console.log("Testing PATCH API with:", testData);
      const patchResponse = await api.patch(
        `/parent/profile/${userId}`,
        testData
      );
      console.log("PATCH response:", patchResponse.data);

      message.success({
        content: "API hoạt động bình thường!",
        key: "testAPI",
      });

      // Cập nhật lại dữ liệu
      dispatch(getParentProfile(userId));
    } catch (error) {
      console.error("API test error:", error);

      let errorMessage = "Lỗi khi test API!";
      if (error.response) {
        console.error("Error response:", error.response.data);
        errorMessage =
          error.response.data?.message ||
          `Lỗi máy chủ: ${error.response.status}`;
      }

      message.error({ content: errorMessage, key: "testAPI" });
    }
  };

  if (loading && !profile) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <Text style={{ display: "block", marginTop: 16 }}>
          Đang tải thông tin...
        </Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Hồ sơ phụ huynh</Title>

      <Tabs defaultActiveKey="profile">
        <TabPane tab="Thông tin cá nhân" key="profile">
          <Card>
            {!editing ? (
              // View mode
              <>
                <div style={{ textAlign: "right", marginBottom: 16 }}>
                  <Button onClick={checkToken} style={{ marginRight: 8 }}>
                    Kiểm tra token
                  </Button>
                  <Button
                    icon={<SaveOutlined />}
                    onClick={() =>
                      dispatch(getParentProfile(user?.id || user?.user_id))
                    }
                    style={{ marginRight: 8 }}
                  >
                    Tải lại
                  </Button>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setEditing(true)}
                  >
                    Chỉnh sửa
                  </Button>
                </div>

                <Row gutter={24}>
                  <Col xs={24} sm={6} md={4} style={{ textAlign: "center" }}>
                    <Avatar
                      size={120}
                      src={profile?.avatar}
                      icon={!profile?.avatar && <UserOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={18} md={20}>
                    <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                      <Descriptions.Item label="Họ và tên">
                        {user?.fullname || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        <MailOutlined /> {user?.email || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        <PhoneOutlined /> {user?.phone || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ">
                        <HomeOutlined /> {user?.address || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày sinh">
                        <CalendarOutlined />{" "}
                        {user?.dayOfBirth
                          ? format(new Date(user.dayOfBirth), "dd/MM/yyyy")
                          : "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giới tính">
                        <IdcardOutlined /> {user?.gender || "Chưa cập nhật"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
              </>
            ) : (
              // Edit mode
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  fullname: user?.fullname || "",
                  email: user?.email || "",
                  phone: user?.phone || "",
                  address: user?.address || "",
                  gender: user?.gender || "",
                  dayOfBirth: user?.dayOfBirth ? moment(user.dayOfBirth) : null,
                }}
              >
                <div style={{ textAlign: "right", marginBottom: 16 }}>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => setEditing(false)}
                    style={{ marginRight: 8 }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={loading}
                  >
                    Lưu thay đổi
                  </Button>
                </div>

                <Row gutter={24}>
                  <Col xs={24} sm={6} md={4} style={{ textAlign: "center" }}>
                    <Upload
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleAvatarChange}
                      onPreview={handlePreview}
                    >
                      {avatar ? (
                        <img
                          src={avatar.url || avatar.preview || profile?.avatar}
                          alt="avatar"
                          style={{ width: "100%" }}
                        />
                      ) : (
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                        </div>
                      )}
                    </Upload>
                  </Col>
                  <Col xs={24} sm={18} md={20}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="fullname"
                          label="Họ và tên"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập họ và tên!",
                            },
                          ]}
                        >
                          <Input
                            prefix={<UserOutlined />}
                            placeholder="Họ và tên"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="email"
                          label="Email"
                          rules={[
                            {
                              type: "email",
                              message: "Email không hợp lệ!",
                            },
                            {
                              required: true,
                              message: "Vui lòng nhập email!",
                            },
                          ]}
                        >
                          <Input
                            prefix={<MailOutlined />}
                            placeholder="Email"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="phone"
                          label="Số điện thoại"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số điện thoại!",
                            },
                          ]}
                        >
                          <Input
                            prefix={<PhoneOutlined />}
                            placeholder="Số điện thoại"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="gender"
                          label="Giới tính"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn giới tính!",
                            },
                          ]}
                        >
                          <Select placeholder="Chọn giới tính">
                            <Select.Option value="Male">Nam</Select.Option>
                            <Select.Option value="Female">Nữ</Select.Option>
                            <Select.Option value="Other">Khác</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      name="address"
                      label="Địa chỉ"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập địa chỉ!",
                        },
                      ]}
                    >
                      <Input prefix={<HomeOutlined />} placeholder="Địa chỉ" />
                    </Form.Item>
                    <Form.Item
                      name="dayOfBirth"
                      label="Ngày sinh"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập ngày sinh!",
                        },
                      ]}
                    >
                      <DatePicker
                        prefix={<CalendarOutlined />}
                        placeholder="Ngày sinh"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
          </Card>
        </TabPane>

        <TabPane tab="Thông tin con em" key="children">
          <Card>
            <Title level={4}>Danh sách con em</Title>
            {children && children.length > 0 ? (
              children.map((child, index) => (
                <Card
                  key={child.student_id || index}
                  style={{ marginBottom: 16 }}
                  type="inner"
                >
                  <Row gutter={24}>
                    <Col xs={24} sm={6} md={4} style={{ textAlign: "center" }}>
                      <Avatar
                        size={80}
                        src={child.avatar}
                        icon={!child.avatar && <UserOutlined />}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Text strong>{child.full_name}</Text>
                      </div>
                      <div>
                        <Text type="secondary">
                          {child.student_code || `Học sinh ${index + 1}`}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={18} md={20}>
                      <Descriptions
                        column={{ xs: 1, sm: 2 }}
                        bordered
                        size="small"
                      >
                        <Descriptions.Item label="Ngày sinh">
                          {child.date_of_birth
                            ? format(
                                new Date(child.date_of_birth),
                                "dd/MM/yyyy"
                              )
                            : "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                          {child.gender || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Lớp">
                          {child.class_name || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khối">
                          {child.grade || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nhóm máu">
                          {child.blood_type || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chiều cao">
                          {child.height_cm
                            ? `${child.height_cm} cm`
                            : "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cân nặng">
                          {child.weight_kg
                            ? `${child.weight_kg} kg`
                            : "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Dị ứng">
                          {child.allergies || "Không có"}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                  </Row>
                </Card>
              ))
            ) : (
              <Text type="secondary">Chưa có thông tin con em</Text>
            )}
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
}
