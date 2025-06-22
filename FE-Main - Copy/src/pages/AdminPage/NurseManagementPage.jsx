/* eslint-disable no-unused-vars */
// src/pages/AdminPage/NurseManagementPage.jsx

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
import { LoadingOutlined, UserAddOutlined } from "@ant-design/icons";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiBriefcase, // Icon cho Specialty
  FiAward, // Icon có thể dùng cho Role/Experience
} from "react-icons/fi";
import { format } from "date-fns";
import debounce from "lodash/debounce"; // Đảm bảo bạn đã cài đặt: npm install lodash.debounce
import { v4 as uuidv4 } from "uuid";
import api from "../../configs/config-axios";
import { toast } from "react-toastify";
import { FaStethoscope } from "react-icons/fa";

const { Option } = Select;

export default function NurseManagementPage() {
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNurse, setEditingNurse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Dùng cho loading modal (thêm/sửa)
  const [form] = Form.useForm();
  const [nurses, setNurses] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Sử dụng debounce cho handleSearch
  const debouncedSetSearchText = useCallback(
    debounce((value) => {
      setSearchText(value);
    }, 300),
    []
  );

  const fetchNurses = useCallback(async () => {
    setLoading(true); // Bắt đầu loading cho bảng
    try {
      const response = await api.get("/admin/nurses");
      console.log(response.data.data);

      if (response.data && Array.isArray(response.data.data)) {
        const formattedNurses = response.data.data.map((nurse) => ({
          ...nurse,
          key: nurse.user_id,
          registrationDate: nurse.created_at
            ? new Date(nurse.created_at)
            : null,
        }));
        setNurses(formattedNurses);
        toast.success("Tải dữ liệu y tá thành công!"); // Sử dụng toast
      } else {
        console.warn(
          "Backend không trả về dữ liệu y tá dưới dạng mảng trong response.data.data:",
          response.data
        );
        setNurses([]);
        toast.warn(
          "Không tìm thấy dữ liệu y tá hoặc dữ liệu không đúng định dạng."
        ); // Sử dụng toast
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu nurses từ backend:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(`Lỗi: ${error.response.data.message}`); // Sử dụng toast
      } else {
        toast.error("Không thể tải dữ liệu y tá. Vui lòng thử lại."); // Sử dụng toast
      }
    } finally {
      setLoading(false); // Kết thúc loading cho bảng
      setInitialLoadComplete(true);
    }
  }, []);

  useEffect(() => {
    fetchNurses();
  }, [fetchNurses]);

  const handleAddNurse = () => {
    setEditingNurse(null);
    form.resetFields();
    form.setFieldsValue({ status: "Active" });
    setIsModalVisible(true);
  };

  const handleEditNurse = (record) => {
    setEditingNurse(record);
    form.setFieldsValue({
      ...record,
      status: record.is_active ? "Active" : "Inactive",
    });
    setIsModalVisible(true);
  };

  const handleDeleteNurse = async (userId) => {
    try {
      setLoading(true); // Bắt đầu loading cho bảng
      await api.delete(`/admin/nurses/${userId}`);
      toast.success("Đã xóa tài khoản y tá thành công!"); // Sử dụng toast
      fetchNurses();
    } catch (error) {
      console.error("Lỗi khi xóa nurse:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(`Lỗi: ${error.response.data.message}`); // Sử dụng toast
      } else {
        toast.error("Không thể xóa tài khoản y tá. Vui lòng thử lại."); // Sử dụng toast
      }
    } finally {
      setLoading(false); // Kết thúc loading cho bảng
    }
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true); // Bắt đầu loading cho form submit trong modal
    try {
      const payload = {
        ...values,
        is_active: values.status === "Active",
      };
      delete payload.status;

      if (editingNurse) {
        await api.put(`/admin/nurses/${editingNurse.user_id}`, payload);
        toast.success("Cập nhật tài khoản y tá thành công!"); // Sử dụng toast
      } else {
        await api.post(`/admin/nurses`, payload);
        toast.success("Thêm tài khoản y tá thành công!"); // Sử dụng toast
      }
      setIsModalVisible(false); // Đóng modal ngay lập tức sau khi API call thành công
      form.resetFields(); // Reset form ngay lập tức
      fetchNurses(); // Gọi fetchNurses để cập nhật bảng (nó sẽ tự quản lý loading của nó)
    } catch (error) {
      console.error("Lỗi khi thêm/cập nhật nurse:", error);
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
      setIsSubmitting(false); // Kết thúc loading cho form submit trong modal
    }
  };

  const filteredNurses = nurses.filter((nurse) =>
    Object.values(nurse).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // Logic hiển thị mới
  const showNoResultsImage =
    initialLoadComplete && filteredNurses.length === 0 && searchText !== "";
  const showEmptyTableOnInitialLoad =
    initialLoadComplete && nurses.length === 0 && searchText === "";
  const showTableWithData =
    filteredNurses.length > 0 ||
    (initialLoadComplete && nurses.length === 0 && searchText === "");

  const columns = [
    {
      title: (
        <span className="flex items-center gap-2 text-gray-900">
          <FiUser className="text-blue-600" /> Full Name
        </span>
      ),
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: (
        <span className="flex items-center gap-2 text-gray-900">
          <FiMail className="text-blue-600" /> Email
        </span>
      ),
      dataIndex: "email",
      key: "email",
    },
    {
      title: (
        <span className="flex items-center gap-2 text-gray-900">
          <FiPhone className="text-blue-600" /> Phone Number
        </span>
      ),
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: (
        <span className="flex items-center gap-2 text-gray-900">
          <FiBriefcase className="text-blue-600" /> Specialty{" "}
        </span>
      ),
      dataIndex: "specialty",
      key: "specialty",
    },
    {
      title: "Status",
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
          {is_active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-2 text-gray-900">
          <FiCalendar className="text-blue-600" /> Registration Date
        </span>
      ),
      dataIndex: "created_at", // Giữ nguyên dataIndex là 'created_at' để lấy dữ liệu từ API
      key: "created_at",
      render: (dateString) =>
        dateString ? format(new Date(dateString), "MMM dd, yyyy") : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-all transform hover:scale-110 flex items-center justify-center"
            onClick={() => handleEditNurse(record)}
            type="text"
            icon={<FiEdit2 />}
          />
          <Popconfirm
            title="Are you sure you want to delete this account?"
            onConfirm={() => handleDeleteNurse(record.user_id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <Button
              className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-all transform hover:scale-110 flex items-center justify-center"
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
        <header className="mb-5 rounded-lg bg-gradient-to-r from-red-600/[.10] to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-5 bg-blue-600/10 rounded-full border border-red-600">
              <FaStethoscope className="w-10 h-10 text-red-500" />
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm thông tin y tá..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchText}
              onChange={(e) => debouncedSetSearchText(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddNurse}
            className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white !rounded-lg hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-red-500/30 !border-none"
          >
            <UserAddOutlined className="mr-2" />
            Thêm tài khoản Y Tá
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          {loading && !initialLoadComplete ? (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
              <p className="text-gray-500">Loading data...</p>
            </div>
          ) : showNoResultsImage ? (
            <div className="text-center py-12">
              <img
                src="https://images.unsplash.com/photo-1584982751601-97dcc096659c"
                alt="No results found"
                className="w-48 h-48 object-cover mx-auto mb-4 rounded-full"
              />
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                No Nurses Found
              </h3>
              <p className="text-gray-600">
                No nurses match your search criteria.
              </p>
            </div>
          ) : showTableWithData || showEmptyTableOnInitialLoad ? (
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                dataSource={filteredNurses}
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
                  emptyText:
                    searchText === "" && nurses.length === 0 ? (
                      <span className="text-gray-500">
                        No nurse data available. Click "Add New Nurse" to get
                        started.
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        No nurses match your search criteria.
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
            </div>
          ) : null}{" "}
        </div>

        {/* Modal Section */}
        <Modal
          title={editingNurse ? "Edit Nurse Account" : "Add New Nurse Account"}
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
              editingNurse
                ? {
                    ...editingNurse,
                    status: editingNurse.is_active ? "Active" : "Inactive",
                  }
                : { status: "Active" }
            }
          >
            {/* Full Name */}
            <Form.Item
              name="full_name"
              label={<span className="text-gray-900">Full Name</span>}
              rules={[
                { required: true, message: "Please enter full name!" },
                {
                  pattern: /^[\p{L}\s]{3,50}$/u,
                  message: "Full name should only contain letters and spaces.",
                },
                { min: 3, message: "Full name must be at least 3 characters." },
                {
                  max: 50,
                  message: "Full name must not exceed 50 characters.",
                },
              ]}
            >
              <Input
                placeholder="Full Name"
                className="!border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-blue-500 focus:!outline-none hover:!border-blue-600/50 !transition-colors !bg-white !text-gray-900"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              name="email"
              label={<span className="text-gray-900">Email</span>}
              rules={[
                { required: true, message: "Please enter email!" },
                { type: "email", message: "Invalid email!" },
                { max: 100, message: "Email must not exceed 100 characters." },
              ]}
            >
              <Input
                placeholder="Email address"
                className="!border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-blue-500 focus:!outline-none hover:!border-blue-600/50 !transition-colors !bg-white !text-gray-900"
              />
            </Form.Item>

            {/* Phone Number */}
            <Form.Item
              name="phone"
              label={<span className="text-gray-900">Phone Number</span>}
              rules={[
                { required: true, message: "Please enter phone number!" },
                {
                  pattern: /^(0|\+84)[3|5|7|7|8|9][0-9]{8}$/,
                  message:
                    "Invalid phone number (e.g., 0912345678 or +84912345678).",
                },
              ]}
            >
              <Input
                placeholder="Contact phone number"
                className="!border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-blue-500 focus:!outline-none hover:!border-blue-600/50 !transition-colors !bg-white !text-gray-900"
              />
            </Form.Item>

            {/* Specialty (Specific for Nurses) */}
            <Form.Item
              name="specialty"
              label={<span className="text-gray-900">Specialty</span>}
              rules={[
                { required: true, message: "Please enter specialty!" },
                { min: 3, message: "Specialty must be at least 3 characters." },
                {
                  max: 50,
                  message: "Specialty must not exceed 50 characters.",
                },
              ]}
            >
              <Input
                placeholder="e.g., Pediatric Nurse, Critical Care"
                className="!border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-blue-500 focus:!outline-none hover:!border-blue-600/50 !transition-colors !bg-white !text-gray-900"
              />
            </Form.Item>

            {/* Status */}
            <Form.Item
              name="status"
              label={<span className="text-gray-900">Status</span>}
              rules={[{ required: true, message: "Please select status!" }]}
            >
              <Select
                placeholder="Select status"
                className="!border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-blue-500 focus:!outline-none hover:!border-blue-600/50 !transition-colors
                  [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!text-gray-900"
              >
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>

            {/* Password (only for new nurse) */}
            {!editingNurse && (
              <Form.Item
                name="password"
                label={<span className="text-gray-900">Password</span>}
                rules={[
                  { required: true, message: "Please enter password!" },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters.",
                  },
                  {
                    max: 50,
                    message: "Password must not exceed 50 characters.",
                  },
                  {
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,50}$/,
                    message:
                      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
                  },
                ]}
              >
                <Input.Password
                  placeholder="Password for new account"
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
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  className="px-4 py-2 !bg-blue-600 !text-white !rounded-lg hover:!bg-blue-700 !transition-colors disabled:!opacity-50 !border-none"
                >
                  {editingNurse ? "Update" : "Add New"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
