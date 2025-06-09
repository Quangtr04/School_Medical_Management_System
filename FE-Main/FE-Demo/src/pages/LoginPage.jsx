/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Button, Checkbox, Form, Input } from "antd";
import { EyeIcon, EyeOffIcon, HeartIcon } from "lucide-react"; // Import icons
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../configs/config-axios"; // Điều chỉnh lại đường dẫn api nếu cần

function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // Regex cơ bản cho email và số điện thoại Việt Nam
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Regex cho số điện thoại Việt Nam (ví dụ: bắt đầu bằng 0, dài 10 hoặc 11 số)
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/; // Thêm regex phù hợp với định dạng số điện thoại mong muốn

  const onFinish = async (values) => {
    console.log("Success:", values);
    try {
      await api.post("login", values);
      toast.success("Đăng nhập thành công!");
      navigate("/dashboard");
    } catch (e) {
      console.error("Lỗi đăng nhập:", e);
      const errorMessage =
        e.response && e.response.data
          ? e.response.data
          : "Đăng nhập thất bại. Vui lòng thử lại!";
      toast.error(errorMessage);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    toast.error(
      "Có lỗi trong việc điền thông tin. Vui lòng kiểm tra lại các trường đã nhập!"
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center">
      <div className="flex items-center">
        {" "}
        {/* Thêm class 'flex' và 'items-center' */}
        <HeartIcon className="h-8 w-8 text-blue-600" />
        {/* Đổi 'mb-8' thành 'ml-2' để có khoảng cách giữa icon và text, và căn giữa theo chiều dọc */}
        <div className="ml-2 text-xl font-bold text-gray-900">
          {" "}
          {/* Đổi kích thước text và màu cho phù hợp với logo */}
          SchoolHealth
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <p className="text-3xl font-bold text-gray-900 mb-8">
          Đăng nhập hệ thống <br /> Y tế học đường
        </p>

        <Form
          name="login"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="space-y-6"
        >
          {/* Username/Email/Phone Input with combined validation */}
          <Form.Item
            label={
              <span className="block text-left text-sm font-medium text-gray-700 mb-1">
                Số điện thoại hoặc Email
              </span>
            }
            name="username"
            rules={[
              {
                required: true,
                message: "Số điện thoại hoặc email không được để trống!",
              },
              {
                //validator sẽ nhận vào _(rule hiện tại) và value (giá trị input)
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve(); // required rule sẽ xử lý trống
                  }
                  const isEmail = emailRegex.test(value);
                  const isPhone = phoneRegex.test(value);

                  if (isEmail || isPhone) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "Vui lòng nhập định dạng email hoặc số điện thoại hợp lệ!"
                    )
                  );
                },
              },
              {
                max: 50, // Giới hạn ký tự tối đa cho cả email và SĐT
                message: "Giá trị nhập vào không được vượt quá 50 ký tự!",
              },
            ]}
          >
            <Input
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your phone number or email" // Cập nhật placeholder
              aria-label="Số điện thoại hoặc Email"
            />
          </Form.Item>

          {/* Password Input (unchanged) */}
          <Form.Item
            label={
              <span className="block text-left text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </span>
            }
            name="password"
            rules={[
              { required: true, message: "Mật khẩu không được để trống!" },
              {
                min: 6,
                message: "Mật khẩu phải có ít nhất 6 ký tự!",
              },
              {
                max: 30,
                message: "Mật khẩu không được vượt quá 30 ký tự!",
              },
            ]}
          >
            <Input.Password
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your Password"
              aria-label="Mật khẩu"
              iconRender={(visible) => (
                <span
                  onClick={() => setShowPassword(!visible)}
                  className="cursor-pointer"
                >
                  {visible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </span>
              )}
            />
          </Form.Item>

          {/* Remember me & Forgot Password (unchanged) */}
          <div className="flex items-center justify-between text-sm">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>
                <span className="ml-0 block text-gray-900">
                  Ghi nhớ đăng nhập
                </span>
              </Checkbox>
            </Form.Item>
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button (unchanged) */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default LoginForm;
