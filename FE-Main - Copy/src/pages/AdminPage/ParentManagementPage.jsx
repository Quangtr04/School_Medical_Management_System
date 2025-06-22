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
  UserAddOutlined,
} from "@ant-design/icons";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
} from "react-icons/fi";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import { v4 as uuidv4 } from "uuid";
import api from "../../configs/config-axios"; // Đã kích hoạt lại
import { toast } from "react-toastify"; // Đã kích hoạt lại

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function ParentManagementPage() {
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [loading, setLoading] = useState(false); // Dùng cho loading bảng
  const [isSubmitting, setIsSubmitting] = useState(false); // Dùng cho loading modal (thêm/sửa/xóa)
  const [form] = Form.useForm();
  const [parents, setParents] = useState([]);

  // Sử dụng useCallback với debounce cho tìm kiếm
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchText(value);
    }, 300), // Độ trễ 300ms
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const fetchParents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/parents"); // Gọi API thực tế
      console.log(response.data.data);

      if (response.data && Array.isArray(response.data.data)) {
        const formattedParents = response.data.data.map((parent) => ({
          ...parent,
          key: parent.user_id,
          registrationDate: parent.created_at
            ? new Date(parent.created_at)
            : null,
        }));
        setParents(formattedParents);
        toast.success("Tải dữ liệu phụ huynh thành công!"); // Sử dụng toast
      } else {
        console.warn(
          "Backend không trả về dữ liệu phụ huynh dưới dạng mảng trong response.data.data:",
          response.data
        );
        setParents([]);
        toast.warn(
          "Không tìm thấy dữ liệu phụ huynh hoặc dữ liệu không đúng định dạng."
        ); // Sử dụng toast
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu parents từ backend:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(`Lỗi: ${error.response.data.message}`); // Sử dụng toast
      } else {
        toast.error("Không thể tải dữ liệu phụ huynh. Vui lòng thử lại."); // Sử dụng toast
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const handleAddParent = () => {
    setEditingParent(null);
    form.resetFields();
    form.setFieldsValue({ status: "Active" }); // Đặt mặc định trạng thái Active
    setIsModalVisible(true);
  };

  const handleEditParent = (record) => {
    setEditingParent(record);
    form.setFieldsValue({
      ...record,
      status: record.is_active ? "Active" : "Inactive",
    });
    setIsModalVisible(true);
  };

  const handleDeleteParent = async (userId) => {
    setLoading(true); // Dùng loading của bảng vì đây là thao tác thay đổi dữ liệu bảng
    try {
      await api.delete(`/admin/parents/${userId}`); // Gọi API thực tế
      toast.success("Đã xóa tài khoản Phụ huynh thành công!"); // Sử dụng toast
      fetchParents(); // Tải lại dữ liệu bảng
    } catch (error) {
      console.error("Lỗi khi xóa parent:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(`Lỗi: ${error.response.data.message}`); // Sử dụng toast
      } else {
        toast.error("Không thể xóa tài khoản Phụ huynh. Vui lòng thử lại."); // Sử dụng toast
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true); // Bắt đầu loading cho form submit
    try {
      const payload = {
        ...values,
        is_active: values.status === "Active",
      };
      delete payload.status;

      if (editingParent) {
        await api.put(`/admin/parents/${editingParent.user_id}`, payload); // Gọi API thực tế
        toast.success("Cập nhật tài khoản Phụ huynh thành công!"); // Sử dụng toast
      } else {
        await api.post(`/admin/parents`, payload); // Gọi API thực tế
        toast.success("Thêm tài khoản Phụ huynh thành công!"); // Sử dụng toast
      }
      setIsModalVisible(false); // Đóng modal ngay sau khi submit thành công
      form.resetFields(); // Reset form ngay sau khi submit thành công
      fetchParents(); // Tải lại dữ liệu bảng
    } catch (error) {
      console.error("Lỗi khi thêm/cập nhật parent:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(`Lỗi: ${error.response.data.message}`); // Sử dụng toast
      } else {
        toast.error("Thao tác thất bại. Vui lòng kiểm tra lại thông tin."); // Sử dụng toast
      }
    } finally {
      setIsSubmitting(false); // Kết thúc loading cho form submit
    }
  };

  const filteredParents = parents.filter((parent) =>
    Object.values(parent).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const columns = [
    {
      title: (
        <span className="flex items-center gap-2">
          <FiUser className="text-blue-600" /> Họ và tên
        </span>
      ),
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <FiMail className="text-blue-600" /> Email
        </span>
      ),
      dataIndex: "email",
      key: "email",
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <FiPhone className="text-blue-600" /> Số điện thoại
        </span>
      ),
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active) => (
        <Tag
          className={`!px-3 !py-1 !rounded-full !text-xs !flex !items-center !gap-2 !w-fit !border-none ${
            is_active
              ? "!bg-emerald-100 !text-emerald-600"
              : "!bg-red-100 !text-red-600"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              is_active ? "bg-emerald-600" : "bg-red-600"
            }`}
          ></span>
          {is_active ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <FiCalendar className="text-blue-600" /> Ngày đăng ký
        </span>
      ),
      dataIndex: "created_at", // Giữ nguyên dataIndex là 'created_at' để lấy dữ liệu từ API
      key: "created_at",
      render: (dateString) =>
        dateString ? format(new Date(dateString), "MMM dd, yyyy") : "N/A",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            className="p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-100 transition-all transform hover:scale-110 flex items-center justify-center"
            onClick={() => handleEditParent(record)}
            type="text"
            icon={<FiEdit2 />}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tài khoản này?"
            onConfirm={() => handleDeleteParent(record.user_id)}
            okText="Có"
            cancelText="Không"
            placement="topRight"
          >
            <Button
              className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-all transform hover:scale-110 flex items-center justify-center"
              danger
              type="text"
              icon={<FiTrash2 />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPjwvc3ZnPg==')] bg-fixed">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-5 rounded-lg bg-gradient-to-r from-blue-600/[.10] to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-5 bg-blue-600/10 rounded-full border border-blue-600">
              <FiUser className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-3xl mb-2">
                Parent Account Management
              </h1>
              <p className="text-gray-500 flex items-center gap-2 text-sm">
                <span>👨‍👩‍👧‍👦</span> Manage and oversee parent accounts efficiently
              </p>
            </div>
          </div>
        </header>

        {/* Search and Add Button Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm thông tin ph..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleSearchChange}
            />
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined className="mr-2" />}
            onClick={handleAddParent}
            className="flex items-center justify-center px-8 py-2 !bg-blue-600 !text-white !rounded-lg hover:!bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-600/30 !border-none"
          >
            Thêm tài khoản Phụ huynh
          </Button>
        </div>

        {/* Table Section */}
        <Card className="!bg-white !rounded-lg !shadow-sm !p-6 !overflow-hidden !border !border-gray-200/[.50]">
          {loading ? (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredParents}
              rowKey="key"
              pagination={{
                pageSize: 10,
                className: `
                  [&_.ant-pagination-prev]:!rounded-md [&_.ant-pagination-prev]:!border [&_.ant-pagination-prev]:!border-gray-300 [&_.ant-pagination-prev]:!text-gray-900 [&_.ant-pagination-prev]:hover:!border-blue-600 [&_.ant-pagination-prev]:hover:!text-blue-600 [&_.ant-pagination-prev]:!transition-colors
                  [&_.ant-pagination-next]:!rounded-md [&_.ant-pagination-next]:!border [&_.ant-pagination-next]:!border-gray-300 [&_.ant-pagination-next]:!text-gray-900 [&_.ant-pagination-next]:hover:!border-blue-600 [&_.ant-pagination-next]:hover:!text-blue-600 [&_.ant-pagination-next]:!transition-colors
                  [&_.ant-pagination-item]:!rounded-md [&_.ant-pagination-item]:!border [&_.ant-pagination-item]:!border-gray-300 [&_.ant-pagination-item]:!text-gray-900 [&_.ant-pagination-item]:hover:!border-blue-600 [&_.ant-pagination-item]:hover:!text-blue-600 [&_.ant-pagination-item]:!transition-colors
                  [&_.ant-pagination-item-active]:!bg-blue-600 [&_.ant-pagination-item-active]:!text-white [&_.ant-pagination-item-active]:!border-blue-600 [&_.ant-pagination-item-active]:hover:!bg-blue-700 [&_.ant-pagination-item-active]:hover:!text-white
                  [&_.ant-pagination-disabled]:!opacity-50 [&_.ant-pagination-disabled]:!cursor-not-allowed
                  p-4 border-t border-gray-200 bg-white
                `,
              }}
              scroll={{ x: "max-content" }}
              locale={{
                emptyText: (
                  <span className="text-gray-500">
                    Không có dữ liệu phụ huynh
                  </span>
                ),
              }}
              className={`
                !bg-white
                [&_.ant-table]:!bg-white
                [&_.ant-table-thead_>_tr_>_th]:!bg-blue-50/[.50] [&_.ant-table-thead_>_tr_>_th]:!text-gray-900 [&_.ant-table-thead_>_tr_>_th]:!px-6 [&_.ant-table-thead_>_tr_>_th]:!py-3 [&_.ant-table-thead_>_tr_>_th]:!font-semibold
                [&_.ant-table-tbody_>_tr]:!border-b [&_.ant-table-tbody_>_tr]:!border-gray-200
                [&_.ant-table-tbody_>_tr:last-child_>_td]:!border-b-0
                [&_.ant-table-tbody_>_tr:hover]:!bg-blue-50/[.50]
                [&_.ant-table-tbody_>_tr_>_td]:!text-gray-900 [&_.ant-table-tbody_>_tr_>_td]:!px-6 [&_.ant-table-tbody_>_tr_>_td]:!py-4
                !rounded-lg !overflow-hidden
              `}
            />
          )}
        </Card>

        {/* Modal Section */}
        <Modal
          title={
            editingParent
              ? "Sửa tài khoản Phụ huynh"
              : "Thêm tài khoản Phụ huynh mới"
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          className={`
            [&_.ant-modal-content]:!bg-white [&_.ant-modal-content]:!p-6 [&_.ant-modal-content]:!rounded-lg [&_.ant-modal-content]:!shadow-lg
            [&_.ant-modal-header]:!bg-white [&_.ant-modal-header]:!border-b [&_.ant-modal-header]:!border-gray-200/50 [&_.ant-modal-header]:!p-6
            [&_.ant-modal-title]:!text-gray-900 [&_.ant-modal-title]:!text-xl [&_.ant-modal-title]:!font-semibold
          `}
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
              label={<span className="text-gray-900">Họ và tên</span>}
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên!" },
                {
                  pattern: /^[\p{L}\s]{3,50}$/u,
                  message: "Họ và tên chỉ chứa chữ cái và khoảng trắng.",
                },
                { min: 3, message: "Họ và tên phải có ít nhất 3 ký tự." },
                { max: 50, message: "Họ và tên không quá 50 ký tự." },
              ]}
            >
              <Input
                placeholder="Họ và tên đầy đủ"
                className="!border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-blue-500 focus:!outline-none hover:!border-blue-600/50 !transition-colors !bg-white !text-gray-900"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              name="email"
              label={<span className="text-gray-900">Email</span>}
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
                { max: 100, message: "Email không quá 100 ký tự." },
              ]}
            >
              <Input
                placeholder="Địa chỉ email"
                className="!border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-blue-500 focus:!outline-none hover:!border-blue-600/50 !transition-colors !bg-white !text-gray-900"
              />
            </Form.Item>

            {/* Phone Number */}
            <Form.Item
              name="phone"
              label={<span className="text-gray-900">Số điện thoại</span>}
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
                  message:
                    "Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678).",
                },
              ]}
            >
              <Input
                placeholder="Số điện thoại liên hệ"
                className="!border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-blue-500 focus:!outline-none hover:!border-blue-600/50 !transition-colors !bg-white !text-gray-900"
              />
            </Form.Item>

            {/* Status */}
            <Form.Item
              name="status"
              label={<span className="text-gray-900">Trạng thái</span>}
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select
                placeholder="Chọn trạng thái"
                className="!border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-blue-500 focus:!outline-none hover:!border-blue-600/50 !transition-colors
                  [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!text-gray-900"
              >
                <Option value="Active">Hoạt động</Option>
                <Option value="Inactive">Không hoạt động</Option>
              </Select>
            </Form.Item>

            {/* Password (only for new parent) */}
            {!editingParent && (
              <Form.Item
                name="password"
                label={<span className="text-gray-900">Mật khẩu</span>}
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
                <Input.Password
                  placeholder="Mật khẩu cho tài khoản mới"
                  className="!border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-blue-500 focus:!outline-none hover:!border-blue-600/50 !transition-colors !bg-white !text-gray-900"
                />
              </Form.Item>
            )}

            <Form.Item className="mt-5 text-right">
              <Space>
                <Button
                  onClick={() => setIsModalVisible(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 !border !border-gray-300 !rounded-lg hover:!bg-gray-100 !transition-colors !text-gray-900"
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  className="px-4 py-2 !bg-blue-600 !text-white !rounded-lg hover:!bg-blue-700 !transition-colors disabled:!opacity-50 !border-none"
                >
                  {editingParent ? "Cập nhật" : "Thêm mới"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
