import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Row,
  Col,
  Spin,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  FormOutlined,
  SendOutlined,
} from "@ant-design/icons";
import axios from "axios";
import api from "../../configs/config-axios";

const { Title, Text } = Typography;
const { TextArea } = Input;

const AppointmentRequestPage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [displayName, setDisplayName] = useState("");

  // Add error boundary and authentication check
  useEffect(() => {
    console.log("AppointmentRequestPage - Component mounted");
    console.log("Current user data:", user);

    // Check if user is authenticated
    const token = localStorage.getItem("accessToken");
    if (!user && !token) {
      console.log("No user or token found, redirecting to login");
      navigate("/login");
      return;
    }

    if (user) {
      // Log all keys in the user object
      console.log("User object keys:", Object.keys(user));

      // Check for both fullname and full_name properties
      const name = user.fullname || user.full_name || user.username || "";
      console.log("Setting display name:", name);
      setDisplayName(name);
    }
  }, [user, navigate]);

  // Pre-fill form with user data if available
  useEffect(() => {
    try {
      if (user) {
        console.log("Pre-filling form with user data");
        form.setFieldsValue({
          full_name: displayName,
          email: user.email || "",
          phone: user.phone || "",
        });
      }
    } catch (error) {
      console.error("Error setting form values:", error);
    }
  }, [user, form, displayName]);

  // Update form when displayName changes
  useEffect(() => {
    try {
      if (displayName) {
        console.log("Updating form with display name:", displayName);
        form.setFieldValue("full_name", displayName);
      }
    } catch (error) {
      console.error("Error updating display name:", error);
    }
  }, [displayName, form]);

  const onFinish = async (values) => {
    console.log("Form submitted with values:", values);
    setLoading(true);

    try {
      // Check authentication before making request
      const token = localStorage.getItem("accessToken");
      if (!token) {
        messageApi.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
        return;
      }

      // Prepare data for API
      const requestData = {
        full_name: displayName,
        email: values.email,
        phone: values.phone,
        req_type: "appointment", // Fixed value for appointment requests
        title: values.title,
        text: values.message,
        target_role_id: 3, // Target role ID for medical staff (nurse)
        preferred_date: null, // No date/time selection anymore
      };

      console.log("Sending request data:", requestData);

      // Send request to API
      const response = await api.post("/parent/send-request", requestData);

      console.log("API Response:", response.data);

      messageApi.success({
        content: "Yêu cầu đặt lịch hẹn đã được gửi thành công!",
        duration: 5,
      });

      // Reset form but keep user data
      form.resetFields(["title", "message"]);

      // Re-set user data
      form.setFieldsValue({
        full_name: displayName,
        email: user?.email || "",
        phone: user?.phone || "",
      });
    } catch (error) {
      console.error("Error sending appointment request:", error);

      // Handle different error types
      if (error.response?.status === 401) {
        messageApi.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");
        navigate("/login");
      } else if (error.response?.status === 500) {
        messageApi.error("Lỗi server. Vui lòng thử lại sau.");
      } else {
        messageApi.error({
          content:
            error.response?.data?.message ||
            "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau!",
          duration: 5,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="p-6">
        {/* Loading spinner while checking authentication */}
        {loading && !user && (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        )}

        {/* Only render form if user is authenticated */}
        {user && (
          <Card className="shadow-md">
            <Title level={2} className="text-center mb-6 text-blue-600">
              <CalendarOutlined className="mr-2" />
              Đặt lịch hẹn với phòng y tế
            </Title>

            <Text className="block text-gray-600 mb-8 text-center">
              Điền thông tin bên dưới để gửi yêu cầu đặt lịch hẹn. Phòng y tế sẽ
              liên hệ với bạn để xác nhận thời gian và chi tiết cuộc hẹn.
            </Text>

            <Form
              form={form}
              name="appointment_request_form"
              layout="vertical"
              onFinish={onFinish}
              className="max-w-3xl mx-auto"
              requiredMark="optional"
              initialValues={{
                full_name: displayName,
                email: user?.email || "",
                phone: user?.phone || "",
              }}
            >
              {/* Họ và tên & Email */}
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <span className="flex items-center text-gray-700 font-medium">
                        <UserOutlined className="mr-2 text-green-600" /> Họ và
                        tên
                      </span>
                    }
                    name="full_name"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập họ và tên của bạn!",
                      },
                      {
                        min: 3,
                        message: "Họ và tên phải có ít nhất 3 ký tự.",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập họ và tên"
                      className="rounded-md bg-gray-50"
                      size="large"
                      disabled
                      value={displayName}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <span className="flex items-center text-gray-700 font-medium">
                        <MailOutlined className="mr-2 text-red-600" /> Email
                      </span>
                    }
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập email của bạn!",
                      },
                      {
                        type: "email",
                        message: "Email không hợp lệ!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập email"
                      className="rounded-md bg-gray-50"
                      size="large"
                      disabled
                      value={user?.email || ""}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Số điện thoại & Tiêu đề */}
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <span className="flex items-center text-gray-700 font-medium">
                        <PhoneOutlined className="mr-2 text-orange-600" /> Số
                        điện thoại
                      </span>
                    }
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại!",
                      },
                      {
                        pattern: /^\d{10,11}$/,
                        message: "Số điện thoại không hợp lệ (10-11 chữ số).",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập số điện thoại"
                      className={`rounded-md ${
                        user?.phone ? "bg-gray-50" : ""
                      }`}
                      size="large"
                      disabled={!!user?.phone}
                      value={user?.phone || ""}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <span className="flex items-center text-gray-700 font-medium">
                        <FormOutlined className="mr-2 text-indigo-600" /> Tiêu
                        đề
                      </span>
                    }
                    name="title"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tiêu đề yêu cầu!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Ví dụ: Khám sức khỏe định kỳ"
                      className="rounded-md"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Nội dung chi tiết */}
              <Form.Item
                label={
                  <span className="flex items-center text-gray-700 font-medium">
                    <FormOutlined className="mr-2 text-teal-600" /> Nội dung chi
                    tiết
                  </span>
                }
                name="message"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập nội dung chi tiết!",
                  },
                  {
                    min: 10,
                    message: "Nội dung phải có ít nhất 10 ký tự.",
                  },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Mô tả lý do bạn cần đặt lịch hẹn và các thông tin cần thiết khác"
                  className="rounded-md"
                  size="large"
                />
              </Form.Item>

              {/* Submit Button */}
              <Form.Item className="mt-8">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-12 text-base font-medium rounded-md bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  icon={<SendOutlined />}
                  size="large"
                >
                  {loading ? "Đang gửi..." : "Gửi yêu cầu đặt lịch"}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}
      </div>
    </>
  );
};
export default AppointmentRequestPage;
