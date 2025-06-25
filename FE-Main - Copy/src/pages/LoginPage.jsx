/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"; // Thêm useEffect
import { Button, Checkbox, Form, Input } from "antd";
import { EyeIcon, EyeOffIcon, HeartIcon } from "lucide-react";
import { toast } from "react-toastify";
import { NavLink, useNavigate } from "react-router-dom";
// import api from "../configs/config-axios"; // Không cần gọi api trực tiếp ở đây nữa

import { useDispatch, useSelector } from "react-redux"; // Import hooks từ react-redux
import { LoadingOutlined } from "@ant-design/icons"; // Import icon loading
import { clearAuthError, loginUser } from "../redux/auth/authSlice";

function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // Khởi tạo dispatch
  const dispatch = useDispatch();

  // Lấy trạng thái từ Redux store
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Regex cơ bản cho email và số điện thoại Việt Nam
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

  // Xử lý chuyển hướng sau khi đăng nhập thành công
  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Đăng nhập thành công! Đang chuyển hướng...");
      // Lấy role_id từ localStorage (nơi authSlice đã lưu)
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const role_id = currentUser?.role_id; // Đảm bảo currentUser không null

      switch (role_id) {
        case 1: // Admin
          navigate("/admin");
          break;
        case 2: // Manager
          navigate("/manager");
          break;
        case 3: // Nurse
          navigate("/nurse");
          break;
        case 4: // Parent
          navigate("/parent");
          break;
        default:
          navigate("/"); // Điều hướng về trang chủ mặc định
          toast.warn("Vai trò không xác định, chuyển hướng về trang chủ.");
          break;
      }
    }
  }, [isAuthenticated, navigate]); // Thêm navigate vào dependency array

  // Xử lý thông báo lỗi từ Redux
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError()); // Xóa lỗi sau khi hiển thị để không hiển thị lại
    }
  }, [error, dispatch]); // Thêm dispatch vào dependency array

  const onFinish = async (values) => {
    console.log("Success:", values);
    dispatch(loginUser(values));
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
        <NavLink to="/">
          <div className="flex ml-2 text-xl font-bold text-gray-900">
            <HeartIcon className="h-8 w-8 text-blue-600" /> SchoolHealth
          </div>
        </NavLink>
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
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve();
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
                max: 50,
                message: "Giá trị nhập vào không được vượt quá 50 ký tự!",
              },
            ]}
          >
            <Input
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your phone number or email"
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
                  {!visible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
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
              href="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button (updated to use Redux loading state) */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              loading={loading} // Sử dụng trạng thái loading từ Redux
              icon={loading ? <LoadingOutlined /> : null} // Hiển thị icon loading khi đang loading
            >
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default LoginForm;
