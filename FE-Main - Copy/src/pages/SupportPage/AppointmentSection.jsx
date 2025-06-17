import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FormOutlined,
  HeartOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  EnvironmentOutlined,
  TeamOutlined, // Import TeamOutlined for the main title icon
} from "@ant-design/icons";
import { Form, Input, Radio, Select, Button, Space } from "antd"; // Add Input, Radio, Select, Button, Space
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const { TextArea } = Input; // Destructure TextArea from Input
const { Option } = Select; // Destructure Option from Select

const AppointmentSection = () => {
  const [form] = Form.useForm(); // Hook to get form instance for programmatic control
  const [userType, setUserType] = useState("student"); // State for "Bạn là:" radio group
  const [priority, setPriority] = useState("normal"); // State for "Mức độ ưu tiên" radio group

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
    // Here you would typically send the data to your backend API
    alert("Tin nhắn đã được gửi thành công!");
    form.resetFields(); // Reset form fields after successful submission
    setUserType("student"); // Reset radio group state
    setPriority("normal"); // Reset priority radio group state
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    // You can add custom error handling here if needed
  };

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-4 p-4">
      {/* Left Column: Send Message Form (Now uses Ant Design Form) */}
      <div className="w-full lg:w-3/4 flex-shrink-0 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Gửi tin nhắn cho phòng y tế
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Điền thông tin bên dưới để gửi câu hỏi hoặc yêu cầu hỗ trợ. Chúng tôi
          sẽ phản hồi trong vòng 24 giờ.
        </p>

        <Form
          form={form}
          name="health_contact_form"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{
            userType: "student",
            priority: "normal",
          }}
          className="space-y-4" // Tailwind spacing for form items
        >
          {/* Bạn là: Radio Group */}
          <Form.Item
            label="Bạn là:"
            name="userType"
            rules={[{ required: true, message: "Vui lòng chọn bạn là ai!" }]}
          >
            <Radio.Group
              onChange={(e) => setUserType(e.target.value)}
              value={userType}
            >
              <Space direction="horizontal">
                <Radio value="student">Học sinh</Radio>
                <Radio value="parent">Phụ huynh</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {/* Họ và tên & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên của bạn!" },
                { min: 3, message: "Họ và tên phải có ít nhất 3 ký tự." },
              ]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email của bạn!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
          </div>

          {/* Số điện thoại & Lớp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^\d{10,11}$/,
                  message: "Số điện thoại không hợp lệ (10-11 chữ số).",
                }, // Simple regex for 10-11 digits
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item
              label="Lớp (nếu là học sinh)"
              name="class"
              // No 'required' rule, as it's optional for parents
            >
              <Input placeholder="VD: 8A, 9B" />
            </Form.Item>
          </div>

          {/* Loại yêu cầu */}
          <Form.Item
            label="Loại yêu cầu"
            name="requestType"
            rules={[{ required: true, message: "Vui lòng chọn loại yêu cầu!" }]}
          >
            <Select placeholder="Chọn loại yêu cầu">
              <Option value="consultation">Tư vấn sức khỏe</Option>
              <Option value="appointment">Đặt lịch khám</Option>
              <Option value="feedback">Góp ý/Phản hồi</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          {/* Tiêu đề */}
          <Form.Item
            label="Tiêu đề"
            name="subject"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề tin nhắn!" },
              { min: 5, message: "Tiêu đề phải có ít nhất 5 ký tự." },
            ]}
          >
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>

          {/* Nội dung chi tiết */}
          <Form.Item
            label="Nội dung chi tiết"
            name="messageContent"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung chi tiết!" },
              { min: 10, message: "Nội dung phải có ít nhất 10 ký tự." },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu của bạn"
            />
          </Form.Item>

          {/* Mức độ ưu tiên */}
          <Form.Item
            label="Mức độ ưu tiên"
            name="priority"
            rules={[
              { required: true, message: "Vui lòng chọn mức độ ưu tiên!" },
            ]}
          >
            <Radio.Group
              onChange={(e) => setPriority(e.target.value)}
              value={priority}
            >
              <Space direction="horizontal">
                <Radio value="normal">
                  <CheckCircleOutlined className="text-blue-500 mr-1" /> Thường
                </Radio>
                <Radio value="important">
                  <CheckCircleOutlined className="text-orange-500 mr-1" /> Quan
                  trọng
                </Radio>
                <Radio value="urgent">
                  <CheckCircleOutlined className="text-red-600 mr-1" /> Khẩn cấp
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Gửi tin nhắn
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Right Column: Contact Info & Quick Links (RESTORED) */}
      <div className="w-full lg:w-1/4 flex-shrink-0 space-y-4">
        {/* Contact Information Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <EnvironmentOutlined className="text-blue-500 mr-2 text-2xl" />{" "}
            Thông tin liên hệ
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-blue-50 text-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <EnvironmentOutlined className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">Địa chỉ</span>
                  <p className="text-gray-700 text-sm leading-snug">
                    Phòng Y tế - Tầng 1, Khu A, Trường THCS Nguyễn Du
                    <br />
                    123 Nguyễn Du, Q.1, TP.HCM
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-blue-50 text-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <PhoneOutlined className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">
                    Điện thoại
                  </span>
                  <p className="text-gray-700 text-sm">
                    Văn phòng: 028.3123.4567
                  </p>
                  <p className="text-gray-700 text-sm">Hotline: 0912.345.678</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-blue-50 text-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <MailOutlined className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">Email</span>
                  <p className="text-gray-700 text-sm">yte@truonghoc.edu.vn</p>
                  <p className="text-gray-700 text-sm">hotro@schoolhealth.vn</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-blue-50 text-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <ClockCircleOutlined className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">
                    Giờ làm việc
                  </span>
                  <p className="text-gray-700 text-sm">T2-T6: 7:00 - 17:00</p>
                  <p className="text-gray-700 text-sm">T7: 7:00 - 11:30</p>
                  <p className="text-gray-700 text-sm">CN: Nghỉ</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Team Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          {/* Main Title with Icon */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <TeamOutlined className="text-blue-500 mr-2 text-2xl" /> Đội ngũ y
            tế
          </h2>
          <div className="space-y-4">
            {/* BS. Nguyễn Thị Lan */}
            <div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-green-50 text-green-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <UserOutlined className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">
                    BS. Nguyễn Thị Lan
                  </span>
                  <p className="text-gray-700 text-sm">Trưởng phòng y tế</p>
                  <a
                    href="mailto:lan.nt@schoolhealth.vn"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    lan.nt@schoolhealth.vn
                  </a>
                </div>
              </div>
            </div>
            {/* Y tá Trần Văn Bình */}
            <div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-green-50 text-green-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <UserOutlined className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">
                    Y tá Trần Văn Bình
                  </span>
                  <p className="text-gray-700 text-sm">Y tá trường học</p>
                  <a
                    href="mailto:binh.tv@schoolhealth.vn"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    binh.tv@schoolhealth.vn
                  </a>
                </div>
              </div>
            </div>
            {/* Điều dưỡng Lê Thị Hương */}
            <div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-purple-50 text-purple-600 rounded-full w-10 h-10 flex items-center justify-center">
                  <UserOutlined className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">
                    Điều dưỡng Lê Thị Hương
                  </span>
                  <p className="text-gray-700 text-sm">Điều dưỡng</p>
                  <a
                    href="mailto:huong.lt@schoolhealth.vn"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    huong.lt@schoolhealth.vn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Liên kết nhanh
          </h2>
          <div className="space-y-3">
            <NavLink
              to="/#documents-section"
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
            >
              <FormOutlined className="mr-2" />
              Biểu mẫu y tế
            </NavLink>
            <NavLink
              to="/#documents-section"
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
            >
              <CalendarOutlined className="mr-2" />
              Lịch tiêm chủng
            </NavLink>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50">
              <FileTextOutlined className="mr-2" />
              Hướng dẫn sơ cấp cứu
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50">
              <HeartOutlined className="mr-2" />
              Kết quả khám sức khỏe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSection;
