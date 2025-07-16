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
  Select,
  Divider,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FormOutlined,
  SendOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import api from "../../configs/config-axios";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SupportRequestPage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [displayName, setDisplayName] = useState("");
  const [requestType, setRequestType] = useState("account_change");

  // Log user data to see what's available
  useEffect(() => {
    console.log("Current user data:", user);
    if (user) {
      // Log all keys in the user object
      console.log("User object keys:", Object.keys(user));

      // Check for both fullname and full_name properties
      const name = user.fullname || user.full_name || user.username || "";
      console.log("Setting display name:", name);
      setDisplayName(name);
    }
  }, [user]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        full_name: displayName,
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, form, displayName]);

  // Update form when displayName changes
  useEffect(() => {
    if (displayName) {
      form.setFieldValue("full_name", displayName);
    }
  }, [displayName, form]);

  const onFinish = async (values) => {
    setLoading(true);

    try {
      // Prepare data for API
      const requestData = {
        full_name: displayName,
        email: values.email,
        phone: values.phone,
        req_type: values.request_type,
        title: values.title,
        text: values.message,
        target_role_id: 1, // Target role ID for admin
      };

      // Get token from localStorage
      const token = localStorage.getItem("accessToken");

      // Send request to API
      const response = await api.post("/parent/send-request", requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      messageApi.success({
        content: "Yêu cầu hỗ trợ đã được gửi thành công!",
        duration: 5,
      });

      // Reset form but keep user data
      form.resetFields(["request_type", "title", "message"]);

      // Re-set user data
      form.setFieldsValue({
        full_name: displayName,
        email: user?.email || "",
        phone: user?.phone || "",
      });
    } catch (error) {
      console.error("Error sending support request:", error);
      messageApi.error({
        content:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau!",
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTypeChange = (value) => {
    setRequestType(value);

    // Set default title based on request type
    switch (value) {
      case "account_change":
        form.setFieldValue("title", "Yêu cầu thay đổi thông tin tài khoản");
        break;
      case "technical_issue":
        form.setFieldValue("title", "Báo cáo sự cố kỹ thuật");
        break;
      case "other":
        form.setFieldValue("title", "Yêu cầu hỗ trợ khác");
        break;
      default:
        break;
    }
  };

  return (
    <>
      {contextHolder}
      <div className="p-6">
        <Card className="shadow-md">
          <Title level={2} className="text-center mb-6 text-blue-600">
            <QuestionCircleOutlined className="mr-2" />
            Yêu cầu hỗ trợ
          </Title>

          <Text className="block text-gray-600 mb-8 text-center">
            Điền thông tin bên dưới để gửi yêu cầu hỗ trợ hoặc thay đổi thông
            tin tài khoản. Quản trị viên sẽ xem xét và phản hồi yêu cầu của bạn
            trong thời gian sớm nhất.
          </Text>

          <Form
            form={form}
            name="support_request_form"
            layout="vertical"
            onFinish={onFinish}
            className="max-w-3xl mx-auto"
            requiredMark="optional"
            initialValues={{
              full_name: displayName,
              email: user?.email || "",
              phone: user?.phone || "",
              request_type: "account_change",
              title: "Yêu cầu thay đổi thông tin tài khoản",
            }}
          >
            {/* Loại yêu cầu */}
            <Form.Item
              label={
                <span className="flex items-center text-gray-700 font-medium">
                  <InfoCircleOutlined className="mr-2 text-blue-600" /> Loại yêu
                  cầu
                </span>
              }
              name="request_type"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn loại yêu cầu!",
                },
              ]}
            >
              <Select
                placeholder="Chọn loại yêu cầu"
                onChange={handleRequestTypeChange}
                size="large"
                className="rounded-md"
              >
                <Option value="account_change">
                  Thay đổi thông tin tài khoản
                </Option>
                <Option value="technical_issue">Sự cố kỹ thuật</Option>
                <Option value="other">Yêu cầu khác</Option>
              </Select>
            </Form.Item>

            {requestType === "account_change" && (
              <div className="mb-6 bg-blue-50 p-4 rounded-md">
                <Paragraph className="text-blue-800 mb-2">
                  <InfoCircleOutlined className="mr-2" /> Thông tin về yêu cầu
                  thay đổi tài khoản:
                </Paragraph>
                <ul className="list-disc pl-8 text-sm text-gray-700">
                  <li>
                    Yêu cầu của bạn sẽ được gửi trực tiếp đến quản trị viên hệ
                    thống.
                  </li>
                  <li>
                    Vui lòng nêu rõ thông tin cần thay đổi và lý do trong phần
                    nội dung.
                  </li>
                  <li>
                    Quản trị viên sẽ liên hệ với bạn nếu cần thêm thông tin.
                  </li>
                </ul>
              </div>
            )}

            {/* Họ và tên & Email */}
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <span className="flex items-center text-gray-700 font-medium">
                      <UserOutlined className="mr-2 text-green-600" /> Họ và tên
                    </span>
                  }
                  name="full_name"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập họ và tên của bạn!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập họ và tên"
                    className="rounded-md bg-gray-50"
                    size="large"
                    disabled
                    value={
                      displayName ||
                      (user &&
                        (user.fullname ||
                          user.full_name ||
                          user.username ||
                          ""))
                    }
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
                      <PhoneOutlined className="mr-2 text-orange-600" /> Số điện
                      thoại
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
                    className={`rounded-md ${user?.phone ? "bg-gray-50" : ""}`}
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
                      <FormOutlined className="mr-2 text-indigo-600" /> Tiêu đề
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
                    placeholder="Tiêu đề yêu cầu hỗ trợ"
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
                rows={6}
                placeholder={
                  requestType === "account_change"
                    ? "Mô tả chi tiết thông tin tài khoản cần thay đổi và lý do. Ví dụ: Tôi muốn thay đổi số điện thoại từ 0123456789 thành 0987654321 vì đã đổi số mới."
                    : requestType === "technical_issue"
                    ? "Mô tả chi tiết sự cố kỹ thuật bạn đang gặp phải. Vui lòng cung cấp các bước để tái hiện lại sự cố nếu có thể."
                    : "Mô tả chi tiết yêu cầu hỗ trợ của bạn."
                }
                className="rounded-md"
                size="large"
              />
            </Form.Item>

            <Divider />

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
                {loading ? "Đang gửi..." : "Gửi yêu cầu hỗ trợ"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default SupportRequestPage;
