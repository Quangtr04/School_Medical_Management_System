import React, { useState } from "react";
import { Form, Input, Radio, Select, Button, Space, message } from "antd";
import {
  UserOutlined,
  SmileOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  CommentOutlined,
  EllipsisOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  FormOutlined,
  TagOutlined,
  FlagOutlined,
  UsergroupAddOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  SendOutlined,
  HeartOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { MdClass } from "react-icons/md";
const { TextArea } = Input;
const { Option } = Select;
const AppointmentForm = () => {
  const [form] = Form.useForm();
  const [userType, setUserType] = useState("parent");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const onFinish = (values) => {
    setLoading(true);
    // Simulate API call with timeout
    setTimeout(() => {
      console.log("Received values of form: ", values);
      setLoading(false);
      messageApi.success({
        content: "Tin nhắn đã được gửi thành công!",
        duration: 5,
      });
      form.resetFields();
      setUserType("parent");
      setPriority("normal");
    }, 1500);
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    messageApi.error({
      content: "Vui lòng kiểm tra lại thông tin!",
      duration: 5,
    });
  };

  return (
    <>
      {contextHolder}
      <div className="flex flex-wrap lg:flex-nowrap gap-6">
        {/* Left Column: Send Message Form */}
        <div className="w-full lg:w-3/4 flex-shrink-0 bg-white border border-gray-200 rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
            <SendOutlined
              className="mr-2 text-blue-600"
              style={{ color: "blue" }}
            />
            Gửi tin nhắn cho phòng y tế
          </h2>
          <p className="text-gray-600 text-sm mb-6 border-b border-gray-100 pb-4">
            Điền thông tin bên dưới để gửi câu hỏi hoặc yêu cầu hỗ trợ. Chúng
            tôi sẽ phản hồi trong vòng 24 giờ.
          </p>
          <Form
            form={form}
            name="health_contact_form"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            initialValues={{
              userType: "parent",
              priority: "normal",
            }}
            className="space-y-5"
            requiredMark="optional"
          >
            {/* Bạn là: Radio Group */}
            <Form.Item
              label={
                <span className="flex items-center text-gray-700 font-medium">
                  <IdcardOutlined className="mr-2 text-blue-600" /> Bạn là:
                </span>
              }
              name="userType"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn bạn là ai!",
                },
              ]}
            >
              <Radio.Group
                onChange={(e) => setUserType(e.target.value)}
                value={userType}
                className="transition-all duration-300"
              >
                <Space direction="horizontal">
                  <Radio value="parent" className="hover:text-blue-600">
                    <span className="flex items-center">
                      <UserOutlined className="text-purple-500 mr-1" /> Phụ
                      huynh
                    </span>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            {/* Họ và tên & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={
                  <span className="flex items-center text-gray-700 font-medium">
                    <UsergroupAddOutlined className="mr-2 text-green-600" /> Họ
                    và tên
                  </span>
                }
                name="fullName"
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
                  className="rounded-md hover:border-blue-400 focus:border-blue-500"
                />
              </Form.Item>
              <Form.Item
                label={
                  <span className="flex items-center text-gray-700 font-medium">
                    <MailOutlined className="mr-2" style={{ color: "red" }} />{" "}
                    Email
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
                  className="rounded-md hover:border-blue-400 focus:border-blue-500"
                />
              </Form.Item>
            </div>
            {/* Số điện thoại & Lớp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={
                  <span className="flex items-center text-gray-700 font-medium">
                    <PhoneOutlined
                      className="mr-2 text-orange-600"
                      style={{ color: "oranged" }}
                    />{" "}
                    Số điện thoại
                  </span>
                }
                name="phoneNumber"
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
                  className="rounded-md hover:border-blue-400 focus:border-blue-500"
                />
              </Form.Item>
              <Form.Item
                label={
                  <span className="flex items-center text-gray-700 font-medium">
                    <MdClass className="mr-2 text-purple-600" /> Lớp (nếu là học
                    sinh)
                  </span>
                }
                name="class"
              >
                <Input
                  placeholder="VD: 8A, 9B"
                  className="rounded-md hover:border-blue-400 focus:border-blue-500"
                />
              </Form.Item>
            </div>
            {/* Loại yêu cầu */}
            <Form.Item
              label={
                <span className="flex items-center text-gray-700 font-medium">
                  <TagOutlined
                    className="mr-2 text-cyan-600"
                    style={{ color: "blue" }}
                  />{" "}
                  Loại yêu cầu
                </span>
              }
              name="requestType"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn loại yêu cầu!",
                },
              ]}
            >
              <Select
                placeholder="Chọn loại yêu cầu"
                className="rounded-md hover:border-blue-400 focus:border-blue-500"
                dropdownClassName="rounded-md shadow-lg"
              >
                <Option value="consultation">
                  <span className="flex items-center">
                    <QuestionCircleOutlined className="text-blue-500 mr-2" /> Tư
                    vấn sức khỏe
                  </span>
                </Option>
                <Option value="appointment">
                  <span className="flex items-center">
                    <CalendarOutlined className="text-green-500 mr-2" /> Đặt
                    lịch khám
                  </span>
                </Option>
                <Option value="feedback">
                  <span className="flex items-center">
                    <CommentOutlined className="text-orange-500 mr-2" /> Góp
                    ý/Phản hồi
                  </span>
                </Option>
                <Option value="other">
                  <span className="flex items-center">
                    <EllipsisOutlined className="text-gray-500 mr-2" /> Khác
                  </span>
                </Option>
              </Select>
            </Form.Item>
            {/* Tiêu đề */}
            <Form.Item
              label={
                <span className="flex items-center text-gray-700 font-medium">
                  <MessageOutlined
                    className="mr-2 text-indigo-600"
                    style={{ color: "purple" }}
                  />{" "}
                  Tiêu đề
                </span>
              }
              name="subject"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tiêu đề tin nhắn!",
                },
                {
                  min: 5,
                  message: "Tiêu đề phải có ít nhất 5 ký tự.",
                },
              ]}
            >
              <Input
                placeholder="Nhập tiêu đề"
                className="rounded-md hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>
            {/* Nội dung chi tiết */}
            <Form.Item
              label={
                <span className="flex items-center text-gray-700 font-medium">
                  <FormOutlined className="mr-2 text-teal-600" /> Nội dung chi
                  tiết
                </span>
              }
              name="messageContent"
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
                placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu của bạn"
                className="rounded-md hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>
            {/* Mức độ ưu tiên */}
            <Form.Item
              label={
                <span className="flex items-center text-gray-700 font-medium">
                  <FlagOutlined className="mr-2 text-rose-600" /> Mức độ ưu tiên
                </span>
              }
              name="priority"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn mức độ ưu tiên!",
                },
              ]}
              initialValue={priority} // Set initial value for Form.Item
            >
              <Radio.Group
                onChange={(e) => setPriority(e.target.value)}
                value={priority}
                className="priority-radio-group" // Add a class for custom styling
              >
                <Space direction="horizontal">
                  <Radio.Button
                    value="normal"
                    className="priority-radio-button"
                  >
                    <span className="flex items-center">
                      <SmileOutlined className="text-blue-500 mr-1" /> Thường
                    </span>
                  </Radio.Button>
                  <Radio.Button
                    value="important"
                    className="priority-radio-button"
                  >
                    <span className="flex items-center">
                      <ExclamationCircleOutlined className="text-orange-500 mr-1" />{" "}
                      Quan trọng
                    </span>
                  </Radio.Button>
                  <Radio.Button
                    value="urgent"
                    className="priority-radio-button"
                  >
                    <span className="flex items-center">
                      <FireOutlined className="text-red-600 mr-1" /> Khẩn cấp
                    </span>
                  </Radio.Button>
                </Space>
              </Radio.Group>
            </Form.Item>

            {/* Submit Button */}
            <Form.Item className="mt-8">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-10 text-base font-medium rounded-md bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                icon={<SendOutlined />}
              >
                {loading ? "Đang gửi..." : "Gửi đơn"}
              </Button>
            </Form.Item>
          </Form>
        </div>
        {/* Right Column: Contact Info & Quick Links */}
        <div className="w-full lg:w-1/4 flex-shrink-0 space-y-6">
          {/* Contact Information Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <EnvironmentOutlined className="text-blue-500 mr-2 text-2xl" />{" "}
              Thông tin liên hệ
            </h2>
            <div className="space-y-5">
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
                    <p className="text-gray-700 text-sm">
                      Hotline: 0912.345.678
                    </p>
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
                    <p className="text-gray-700 text-sm">
                      yte@truonghoc.edu.vn
                    </p>
                    <p className="text-gray-700 text-sm">
                      hotro@schoolhealth.vn
                    </p>
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
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-md">
            {/* Main Title with Icon */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <TeamOutlined className="text-blue-500 mr-2 text-2xl" /> Đội ngũ y
              tế
            </h2>
            <div className="space-y-5">
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
                      className="text-blue-600 hover:underline text-sm transition-all duration-200"
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
                      className="text-blue-600 hover:underline text-sm transition-all duration-200"
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
                      className="text-blue-600 hover:underline text-sm transition-all duration-200"
                    >
                      huong.lt@schoolhealth.vn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Quick Links Card */}
          {/* <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-md">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <LinkOutlined className="text-blue-500 mr-2 text-2xl" /> Liên kết
              nhanh
            </h2>
            <div className="space-y-3">
              <button
                onClick={() =>
                  document
                    .getElementById("documents-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200"
              >
              <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition-all duration-200">
                <FormOutlined className="mr-2" />
                Biểu mẫu y tế
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition-all duration-200">
                <CalendarOutlined className="mr-2" />
                Lịch tiêm chủng
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition-all duration-200">
                <FileTextOutlined className="mr-2" />
                Hướng dẫn sơ cấp cứu
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition-all duration-200">
                <HeartOutlined className="mr-2" />
                Kết quả khám sức khỏe
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
};
export default AppointmentForm;
