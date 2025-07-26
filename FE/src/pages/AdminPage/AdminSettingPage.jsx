// src/pages/AdminPage/SettingsPage.jsx

import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Switch,
  Checkbox,
  Card,
  Space,
  Typography,
  message,
  Spin,
  Upload,
  ColorPicker,
} from "antd";
import {
  FiSettings,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit,
  FiUpload,
  FiSave,
  FiInfo,
  FiMonitor,
  FiBell,
  FiAlertTriangle,
  FiRepeat,
  FiCalendar,
  FiDroplet,
  FiActivity,
} from "react-icons/fi";
import { LoadingOutlined } from "@ant-design/icons";
import mockSettingsData from "../../data/schoolInfor";
const { Title, Paragraph } = Typography;

export default function AdminSettingPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  // Hàm giả lập lấy dữ liệu cài đặt ban đầu
  const fetchSettings = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      form.setFieldsValue({
        schoolName: mockSettingsData.schoolName,
        schoolEmail: mockSettingsData.schoolEmail,
        schoolPhone: mockSettingsData.schoolPhone,
        schoolAddress: mockSettingsData.schoolAddress,
        primaryThemeColor: mockSettingsData.primaryThemeColor,
        secondaryThemeColor: mockSettingsData.secondaryThemeColor,
        enableNotifications: mockSettingsData.enableNotifications,
        alertViaEmail: mockSettingsData.alertViaEmail,
        alertViaSMS: mockSettingsData.alertViaSMS,
        enableActivityLog: mockSettingsData.enableActivityLog,
        autoBackup: mockSettingsData.autoBackup,
        backupFrequency: mockSettingsData.backupFrequency,
      });

      if (mockSettingsData.logoUrl) {
        setLogoFile({
          uid: "-1",
          name: "current_logo.png",
          status: "done",
          url: mockSettingsData.logoUrl,
        });
      }
      message.success("Tải cài đặt thành công!");
    } catch (error) {
      console.error("Lỗi khi tải cài đặt:", error);
      message.error("Không thể tải cài đặt. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (values) => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const payload = {
        ...values,
        primaryThemeColor:
          typeof values.primaryThemeColor === "object"
            ? values.primaryThemeColor.toHexString()
            : values.primaryThemeColor,
        secondaryThemeColor:
          typeof values.secondaryThemeColor === "object"
            ? values.secondaryThemeColor.toHexString()
            : values.secondaryThemeColor,
      };

      console.log("Mô phỏng việc lưu cài đặt:", payload);
      if (logoFile && logoFile.originFileObj) {
        console.log("Mô phỏng việc upload logo mới:", logoFile.name);
      }

      message.success("Cài đặt đã được lưu thành công!");
    } catch (error) {
      console.error("Lỗi khi lưu cài đặt:", error);
      message.error("Không thể lưu cài đặt. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const props = {
    name: "logo",
    listType: "picture-card",
    maxCount: 1,
    fileList: logoFile ? [logoFile] : [],
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Ảnh phải nhỏ hơn 2MB!");
      }
      if (isJpgOrPng && isLt2M) {
        setLogoFile(file);
      }
      return false;
    },
    onRemove: () => {
      setLogoFile(null);
      return true;
    },
  };

  return (
    <div className="min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPjwvc3ZnPg==')] bg-fixed">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-5 rounded-lg bg-gradient-to-r from-[#3B62F6]/[.10] to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#3B62F6]/[.10] rounded-full border border-[#3B62F6]">
              <FiSettings className="w-10 h-10 text-3xl text-[#3B62F6]" />
            </div>{" "}
            <div>
              <h1 className="text-gray-900 font-semibold text-3xl mb-2">
                Cấu hình hệ thống
              </h1>
              <p className="text-gray-500 flex items-center gap-2 text-sm">
                <span>
                  <FiMonitor />
                </span>
                Quản lý thông tin và cài đặt hệ thống
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
            <p className="text-gray-500">Đang tải cài đặt hệ thống...</p>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveSettings}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Thông tin trường học Card */}
            <Card
              title={
                <span className="flex items-center gap-2 text-gray-900 text-lg font-semibold">
                  <FiInfo className="text-[#3B62F6]" /> Thông tin trường học
                </span>
              }
              className="!bg-white !rounded-lg !shadow-lg !overflow-hidden !border !border-gray-200/[.50]"
            >
              <Form.Item
                name="schoolName"
                label={
                  <span className="flex items-center gap-2 text-gray-900">
                    Tên trường
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập tên trường!" },
                ]}
              >
                <Input
                  placeholder="Tên trường học"
                  prefix={<FiEdit />}
                  className="!border !border-gray-200 !rounded-lg focus:!ring-2 focus:!ring-blue-900 focus:!outline-none hover:!border-[#3B62F6]/[.50] !transition-colors !bg-white !text-gray-900"
                />
              </Form.Item>
              <Form.Item
                name="schoolEmail"
                label={
                  <span className="flex items-center gap-2 text-gray-900">
                    Email
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email!",
                    type: "email",
                  },
                ]}
              >
                <Input
                  placeholder="Email liên hệ"
                  prefix={<FiMail />}
                  className="!border !border-gray-200 !rounded-lg focus:!ring-2 focus:!ring-blue-900 focus:!outline-none hover:!border-[#3B62F6]/[.50] !transition-colors !bg-white !text-gray-900"
                />
              </Form.Item>
              <Form.Item
                name="schoolPhone"
                label={
                  <span className="flex items-center gap-2 text-gray-900">
                    Số điện thoại
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^(0|\+84)[3|5|7|7|8|9][0-9]{8}$/,
                    message: "Số điện thoại không hợp lệ! (ví dụ: 0912345678)",
                  },
                ]}
              >
                <Input
                  placeholder="Số điện thoại liên hệ"
                  prefix={<FiPhone />}
                  className="!border !border-gray-200 !rounded-lg focus:!ring-2 focus:!ring-blue-900 focus:!outline-none hover:!border-[#3B62F6]/[.50] !transition-colors !bg-white !text-gray-900"
                />
              </Form.Item>
              <Form.Item
                name="schoolAddress"
                label={
                  <span className="flex items-center gap-2 text-gray-900">
                    Địa chỉ
                  </span>
                }
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
              >
                <Input.TextArea
                  placeholder="Địa chỉ trường học"
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  prefix={<FiMapPin />}
                  className="!border !border-gray-200 !rounded-lg focus:!ring-2 focus:!ring-blue-900 focus:!outline-none hover:!border-[#3B62F6]/[.50] !transition-colors !bg-white !text-gray-900"
                />
              </Form.Item>
              <Form.Item
                name="logoUpload"
                label={
                  <span className="flex items-center gap-2 text-gray-900">
                    <FiUpload className="text-[#3B62F6]" /> Logo trường
                  </span>
                }
              >
                <Upload {...props}>
                  {logoFile ? null : (
                    <Button
                      type="dashed"
                      icon={<FiUpload />}
                      className="!border !border-gray-200 !rounded-lg !text-gray-900 hover:!border-[#3B62F6]/[.50] hover:!text-[#3B62F6] !transition-colors"
                    >
                      Tải lên logo
                    </Button>
                  )}
                </Upload>
                {logoFile && logoFile.url && !logoFile.originFileObj && (
                  <div className="mt-2 text-center">
                    <img
                      src={logoFile.url}
                      alt="Current Logo"
                      className="max-w-[150px] max-h-[150px] object-contain mx-auto"
                    />
                    <Paragraph className="text-gray-500 text-sm">
                      Logo hiện tại
                    </Paragraph>
                  </div>
                )}
              </Form.Item>
            </Card>

            {/* Cài đặt hệ thống Card */}
            <Card
              title={
                <span className="flex items-center gap-2 text-gray-900 text-lg font-semibold">
                  <FiSettings className="text-[#3B62F6]" /> Cài đặt hệ thống
                </span>
              }
              className="!bg-white !rounded-lg !shadow-lg !overflow-hidden !border !border-gray-200/[.50]"
            >
              <Form.Item
                name="primaryThemeColor"
                label={
                  <span className="flex items-center gap-2 text-gray-900">
                    <FiDroplet className="text-[#3B62F6]" /> Màu chủ đạo
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng chọn màu chủ đạo!" },
                ]}
              >
                <ColorPicker
                  format="hex"
                  onChangeComplete={(color) =>
                    form.setFieldsValue({
                      primaryThemeColor: color.toHexString(),
                    })
                  }
                  className="w-full"
                  style={{ width: "100%", height: "36px" }}
                  getPopupContainer={(trigger) => trigger.parentNode}
                />
              </Form.Item>
              <Form.Item
                name="secondaryThemeColor"
                label={
                  <span className="flex items-center gap-2 text-gray-900">
                    <FiDroplet className="text-[#3B62F6]" /> Màu phụ
                  </span>
                }
                rules={[{ required: true, message: "Vui lòng chọn màu phụ!" }]}
              >
                <ColorPicker
                  format="hex"
                  onChangeComplete={(color) =>
                    form.setFieldsValue({
                      secondaryThemeColor: color.toHexString(),
                    })
                  }
                  className="w-full"
                  style={{ width: "100%", height: "36px" }}
                  getPopupContainer={(trigger) => trigger.parentNode}
                />
              </Form.Item>

              <Form.Item
                name="enableNotifications"
                valuePropName="checked"
                label={
                  <span className="flex items-center gap-2 text-gray-900">
                    <FiBell className="text-[#3B62F6]" /> Bật thông báo
                  </span>
                }
              >
                <Switch
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                  className="bg-gray-300 data-[state=checked]:bg-[#3B62F6]"
                />
              </Form.Item>

              <Form.Item
                name="alertViaEmail"
                valuePropName="checked"
                label={
                  <span className="flex items-center gap-2 text-gray-900">
                    <FiMail className="text-[#3B62F6]" /> Cảnh báo qua email
                  </span>
                }
              >
                <Checkbox>Bật</Checkbox>
              </Form.Item>

              <Form.Item
                name="alertViaSMS"
                valuePropName="checked"
                label={
                  <span className="flex items-center gap-2 text-gray-900">
                    <FiPhone className="text-[#3B62F6]" /> Cảnh báo qua SMS
                  </span>
                }
              >
                <Checkbox>Bật</Checkbox>
              </Form.Item>

              <Form.Item
                name="enableActivityLog"
                valuePropName="checked"
                label={
                  <span className="flex items-center gap-2 text-gray-900">
                    <FiActivity className="text-[#3B62F6]" /> Ghi nhật ký hoạt
                    động
                  </span>
                }
              >
                <Switch
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                  className="bg-gray-300 data-[state=checked]:bg-[#3B62F6]"
                />
              </Form.Item>

              <Form.Item
                name="autoBackup"
                valuePropName="checked"
                label={
                  <span className="flex items-center gap-2 text-gray-900">
                    <FiRepeat className="text-[#3B62F6]" /> Tự động sao lưu
                  </span>
                }
              >
                <Switch
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                  className="bg-gray-300 data-[state=checked]:bg-[#3B62F6]"
                  onChange={(checked) => {
                    form.setFieldsValue({ autoBackup: checked });
                    if (!checked) {
                      form.setFieldsValue({ backupFrequency: undefined });
                    }
                  }}
                />
              </Form.Item>

              {form.getFieldValue("autoBackup") && (
                <Form.Item
                  name="backupFrequency"
                  label={
                    <span className="flex items-center gap-2 text-gray-900">
                      <FiCalendar className="text-[#3B62F6]" /> Tần suất sao lưu
                    </span>
                  }
                  rules={[
                    {
                      required: form.getFieldValue("autoBackup"),
                      message: "Vui lòng chọn tần suất sao lưu!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Ví dụ: Hàng ngày, Hàng tuần"
                    className="!border !border-gray-200 !rounded-lg focus:!ring-2 focus:!ring-blue-900 focus:!outline-none hover:!border-[#3B62F6]/[.50] !transition-colors !bg-white !text-gray-900"
                  />
                </Form.Item>
              )}

              {/* Button lưu */}
              <Form.Item className="mt-6 text-right">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  icon={<FiSave className="mr-2" />}
                  className="flex items-center justify-center ml-auto px-6 py-2 !bg-[#3B62F6] !text-white !rounded-lg hover:!bg-[#3B62F6]/[.90] transition-all transform hover:scale-105 shadow-lg hover:shadow-[#3B62F6]/30 !border-none"
                >
                  Lưu cấu hình
                </Button>
              </Form.Item>
            </Card>
          </Form>
        )}
      </div>
    </div>
  );
}
