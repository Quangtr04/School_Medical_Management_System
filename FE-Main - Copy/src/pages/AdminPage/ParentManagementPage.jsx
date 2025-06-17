/* eslint-disable no-unused-vars */
// src/pages/AdminPage/ParentManagementPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Popconfirm,
  message,
  Typography,
  Card,
  Tag,
  Spin,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import api from "../../configs/config-axios";
import { toast } from "react-toastify";

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function ParentManagementPage() {
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [parents, setParents] = useState([]);

  // --- Hàm để lấy dữ liệu Parents từ Backend ---
  const fetchParents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/parents");
      console.log(response.data.data);

      if (response.data && Array.isArray(response.data.data)) {
        const formattedParents = response.data.data.map((parent) => ({
          ...parent,
          key: parent.user_id,
          registeredDate: parent.created_at
            ? new Date(parent.created_at).toLocaleDateString("vi-VN")
            : "N/A",
        }));
        setParents(formattedParents);
        message.success("Tải dữ liệu phụ huynh thành công!");
      } else {
        console.warn(
          "Backend không trả về dữ liệu phụ huynh dưới dạng mảng trong response.data.data:",
          response.data
        );
        setParents([]);
        message.warn(
          "Không tìm thấy dữ liệu phụ huynh hoặc dữ liệu không đúng định dạng."
        );
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu parents từ backend:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        toast.error("Không thể tải dữ liệu phụ huynh. Vui lòng thử lại.");
        message.error("Không thể tải dữ liệu phụ huynh. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  // Mở modal thêm Parent
  const handleAddParent = () => {
    setEditingParent(null);
    form.resetFields();
    form.setFieldsValue({ status: "Active" });
    setIsModalVisible(true);
  };

  // Mở modal sửa Parent
  const handleEditParent = (record) => {
    setEditingParent(record);
    form.setFieldsValue({
      ...record,
      status: record.is_active ? "Active" : "Inactive",
    });
    setIsModalVisible(true);
  };

  // --- Hàm xóa Parent từ Backend ---
  const handleDeleteParent = async (userId) => {
    try {
      setLoading(true);
      await api.delete(`/admin/parents/${userId}`);
      message.success("Đã xóa tài khoản Phụ huynh thành công!");
      fetchParents();
    } catch (error) {
      console.error("Lỗi khi xóa parent:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        message.error("Không thể xóa tài khoản Phụ huynh. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Xử lý submit form (thêm mới hoặc cập nhật lên Backend) ---
  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        is_active: values.status === "Active",
      };
      delete payload.status;

      if (editingParent) {
        // Cập nhật Parent hiện có
        await api.put(`/admin/parents/${editingParent.user_id}`, payload);
        message.success("Cập nhật tài khoản Phụ huynh thành công!");
      } else {
        // Thêm Parent mới
        await api.post(`/admin/parents`, payload);
        message.success("Thêm tài khoản Phụ huynh thành công!");
      }
      setIsModalVisible(false);
      fetchParents();
      form.resetFields();
    } catch (error) {
      console.error("Lỗi khi thêm/cập nhật parent:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        message.error("Thao tác thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Lọc dữ liệu hiển thị trên bảng dựa trên searchText
  const filteredParents = parents.filter((parent) =>
    Object.values(parent).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // Các cột của bảng
  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "full_name", // Đảm bảo tên trường này khớp với backend (ảnh chụp cho thấy 'full_name' trong console)
      key: "full_name",
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "registeredDate",
      key: "registeredDate",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditParent(record)}
            type="primary"
            ghost
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tài khoản này?"
            onConfirm={() => handleDeleteParent(record.user_id)}
            okText="Có"
            cancelText="Không"
            placement="topRight"
          >
            <Button icon={<DeleteOutlined />} danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>Quản lý tài khoản Phụ huynh</Title>
      <Paragraph type="secondary">
        Quản lý danh sách các tài khoản phụ huynh trong hệ thống.
      </Paragraph>

      <Card
        extra={
          <Space>
            <Search
              placeholder="Tìm kiếm phụ huynh..."
              allowClear
              enterButton
              style={{ width: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => setSearchText(value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddParent}
            >
              Thêm Phụ huynh
            </Button>
          </Space>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredParents}
            rowKey="key"
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Không có dữ liệu phụ huynh" }}
          />
        )}
      </Card>

      <Modal
        title={
          editingParent
            ? "Sửa tài khoản Phụ huynh"
            : "Thêm tài khoản Phụ huynh mới"
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null} // Đặt footer là null để tùy chỉnh nút submit
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={
            editingParent
              ? {
                  ...editingParent,
                  status: editingParent.is_active ? "Active" : "Inactive",
                }
              : { status: "Active" }
          }
        >
          {/* Full Name */}
          <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[
              { required: true, message: "Vui lòng nhập họ và tên!" },
              {
                pattern: /^[\p{L}\s]+$/u, // Cho phép chữ cái (bao gồm tiếng Việt) và khoảng trắng
                message: "Họ và tên chỉ chứa chữ cái và khoảng trắng.",
              },
              { min: 3, message: "Họ và tên phải có ít nhất 3 ký tự." },
              { max: 50, message: "Họ và tên không quá 50 ký tự." },
            ]}
          >
            <Input placeholder="Họ và tên đầy đủ" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
              { max: 100, message: "Email không quá 100 ký tự." },
            ]}
          >
            <Input placeholder="Địa chỉ email" />
          </Form.Item>

          {/* Phone Number */}
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/, // Regex cho SĐT Việt Nam (0xxxxxxxxx hoặc +84xxxxxxxxx)
                message:
                  "Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678).",
              },
            ]}
          >
            <Input placeholder="Số điện thoại liên hệ" />
          </Form.Item>

          {/* Status */}
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="Active">Hoạt động</Option>
              <Option value="Inactive">Không hoạt động</Option>
            </Select>
          </Form.Item>

          {/* Password (only for new parent) */}
          {!editingParent && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự." },
                { max: 50, message: "Mật khẩu không quá 50 ký tự." },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,50}$/,
                  message:
                    "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt.",
                },
              ]}
            >
              <Input.Password placeholder="Mật khẩu cho tài khoản mới" />
            </Form.Item>
          )}

          <Form.Item style={{ marginTop: "20px", textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => setIsModalVisible(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingParent ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
