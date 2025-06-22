/* eslint-disable no-unused-vars */
// src/pages/AdminPage/ManagerManagementPage.jsx

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
  FiBriefcase, // Icon for Role
  FiUsers, // Icon for Manager/Staff
  FiLock, // Add lock icon for password
  FiActivity, // Add icon for status (optional, not mandatory)
} from "react-icons/fi"; // Add FiUsers, FiLock, FiActivity icons
import { format } from "date-fns";
import debounce from "lodash/debounce";
import { v4 as uuidv4 } from "uuid";
import api from "../../configs/config-axios";
import { toast } from "react-toastify";

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// Removed color variables:
// const primaryColor = "hsl(221 83% 53%)";
// const primaryForeground = "hsl(210 20% 98%)";
// const secondaryColor = "hsl(210 40% 96.1%)";
// const secondaryForeground = "hsl(222.2 47.4% 11.2%)";
// const foregroundColor = "hsl(222.2 47.4% 11.2%)";
// const mutedForegroundColor = "hsl(215.4 16.3% 46.9%)";
// const cardColor = "hsl(0 0% 100%)";
// const backgroundColor = "hsl(0 0% 100%)";
// const borderColor = "hsl(214.3 31.6% 91.4%)";
// const inputColor = "hsl(214.3 31.6% 91.4%)";
// const ringColor = "hsl(222.2 84% 4.9%)";
// const activeTagColor = "hsl(142.1 76.2% 36.3%)";
// const inactiveTagColor = "hsl(0 84.2% 60.2%)";

export default function ManagerManagementPage() {
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [managers, setManagers] = useState([]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchText(value);
    }, 300),
    []
  );

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/managers");
      console.log(response.data.data);

      if (response.data && Array.isArray(response.data.data)) {
        const formattedManagers = response.data.data.map((manager) => ({
          ...manager,
          key: manager.user_id,
          registrationDate: manager.created_at
            ? new Date(manager.created_at)
            : null,
        }));
        setManagers(formattedManagers);
      } else {
        console.warn(
          "Backend did not return manager data as an array in response.data.data:",
          response.data
        );
        setManagers([]);
        message.warn("No manager data found or data format is incorrect.");
      }
    } catch (error) {
      console.error("Error fetching managers from backend:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // toast.error(error.response.data.message);
        // message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        // toast.error("Không thể tải dữ liệu quản lý. Vui lòng thử lại.");
        // message.error("Không thể tải dữ liệu quản lý. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleAddManager = () => {
    setEditingManager(null);
    form.resetFields();
    form.setFieldsValue({ status: "Active" });
    setIsModalVisible(true);
  };

  const handleEditManager = (record) => {
    setEditingManager(record);
    form.setFieldsValue({
      ...record,
      status: record.is_active ? "Active" : "Inactive",
    });
    setIsModalVisible(true);
  };

  const handleDeleteManager = async (userId) => {
    try {
      setLoading(true);
      await api.delete(`/admin/managers/${userId}`);
      message.success("Đã xóa tài khoản quản lý thành công!");
      fetchManagers();
    } catch (error) {
      console.error("Lỗi khi xóa manager:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        message.error("Không thể xóa tài khoản quản lý. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        is_active: values.status === "Active",
      };
      delete payload.status;

      if (editingManager) {
        await api.put(`/admin/managers/${editingManager.user_id}`, payload);
        message.success("Cập nhật tài khoản quản lý thành công!");
      } else {
        await api.post(`/admin/managers`, payload);
        message.success("Thêm tài khoản quản lý thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchManagers();
    } catch (error) {
      console.error("Lỗi khi thêm/cập nhật manager:", error);
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
      setIsSubmitting(false);
    }
  };

  const filteredManagers = managers.filter((manager) =>
    Object.values(manager).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const columns = [
    {
      title: (
        <span
          className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
        >
          <FiUser className={`text-[hsl(221_83%_53%)]`} /> Full Name
        </span>
      ),
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: (
        <span
          className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
        >
          <FiMail className={`text-[hsl(221_83%_53%)]`} /> Email
        </span>
      ),
      dataIndex: "email",
      key: "email",
    },
    {
      title: (
        <span
          className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
        >
          <FiPhone className={`text-[hsl(221_83%_53%)]`} /> Phone Number
        </span>
      ),
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: (
        <span
          className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
        >
          <FiBriefcase className={`text-[hsl(221_83%_53%)]`} /> Role{" "}
        </span>
      ),
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active) => (
        <Tag
          className={`!px-3 !py-1 !rounded-full !text-xs !flex !items-center !gap-2 !w-fit !border-none ${
            is_active
              ? `!bg-[hsl(142.1_76.2%_36.3%)]/[.20] !text-[hsl(142.1_76.2%_36.3%)]`
              : `!bg-[hsl(0_84.2%_60.2%)]/[.20] !text-[hsl(0_84.2%_60.2%)]`
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              is_active
                ? `bg-[hsl(142.1_76.2%_36.3%)]`
                : `bg-[hsl(0_84.2%_60.2%)]`
            }`}
          ></span>
          {is_active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: (
        <span
          className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
        >
          <FiCalendar className={`text-[hsl(221_83%_53%)]`} /> Registration Date
        </span>
      ),
      dataIndex: "registrationDate",
      key: "registrationDate",
      render: (date) => (date ? format(date, "MMM dd, yyyy") : "N/A"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            className={`p-2 text-[hsl(215.4_16.3%_46.9%)] hover:text-[hsl(221_83%_53%)] rounded-full hover:bg-[hsl(221_83%_53%)]/[.10] transition-all transform hover:scale-110 flex items-center justify-center`}
            onClick={() => handleEditManager(record)}
            type="text"
            icon={<FiEdit2 />}
          />
          <Popconfirm
            title="Are you sure you want to delete this account?"
            onConfirm={() => handleDeleteManager(record.user_id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <Button
              className={`p-2 text-[hsl(215.4_16.3%_46.9%)] hover:text-[hsl(0_84.2%_60.2%)] rounded-full hover:bg-[hsl(0_84.2%_60.2%)]/[.10] transition-all transform hover:scale-110 flex items-center justify-center`}
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
    <div
      className={`min-h-screen bg-[hsl(0_0%_100%)] p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPjwvc3ZnPg==')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header
          className={
            "mb-5 rounded-lg bg-gradient-to-r from-green-600/[.10] to-transparent"
          }
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-5 bg-bule-600/10 rounded-full border border-green-600`}
            >
              <FiUsers className={`w-10 h-10 text-3x1 text-green-500`} />
            </div>
            <div>
              <h1
                className={`text-[hsl(222.2_47.4%_11.2%)] font-bold text-3xl mb-2`}
              >
                Quản lý tài khoản Manager
              </h1>
              <p
                className={`text-[hsl(215.4_16.3%_46.9%)] flex items-center gap-2 text-sm`}
              >
                <span>💼</span>
                Quản lý và giám sát tài khoản Manager hiệu quả
              </p>
            </div>
          </div>
        </header>

        {/* Search and Add Button Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
            <input
              type="text"
              placeholder="Tìm kiếm thông tin ph..."
              className="w-full pl-10 pr-4 py-2 border border-[hsl(214.3_31.6%_91.4%)] rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(222.2_84%_4.9%)]"
              onChange={handleSearch}
            />
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined className="mr-2" />}
            onClick={handleAddManager}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white !rounded-lg hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/30 !border-none"
          >
            Thêm tài khoản Manager
          </Button>
        </div>

        {/* Table Section */}
        <Card
          className={`!bg-[hsl(0_0%_100%)] !rounded-lg !shadow-lg !overflow-hidden !border !border-[hsl(214.3_31.6%_91.4%)]/[.50]`}
        >
          {loading ? (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
              <p className={`text-[hsl(215.4_16.3%_46.9%)]`}>Loading data...</p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredManagers}
              rowKey="key"
              pagination={{
                pageSize: 10,
                className: `
                  [&_.ant-pagination-prev]:!rounded-md [&_.ant-pagination-prev]:!border [&_.ant-pagination-prev]:!border-[hsl(214.3_31.6%_91.4%)] [&_.ant-pagination-prev]:!text-[hsl(222.2_47.4%_11.2%)] [&_.ant-pagination-prev]:hover:!border-[hsl(221_83%_53%)] [&_.ant-pagination-prev]:hover:!text-[hsl(221_83%_53%)] [&_.ant-pagination-prev]:!transition-colors
                  [&_.ant-pagination-next]:!rounded-md [&_.ant-pagination-next]:!border [&_.ant-pagination-next]:!border-[hsl(214.3_31.6%_91.4%)] [&_.ant-pagination-next]:!text-[hsl(222.2_47.4%_11.2%)] [&_.ant-pagination-next]:hover:!border-[hsl(221_83%_53%)] [&_.ant-pagination-next]:hover:!text-[hsl(221_83%_53%)] [&_.ant-pagination-next]:!transition-colors
                  [&_.ant-pagination-item]:!rounded-md [&_.ant-pagination-item]:!border [&_.ant-pagination-item]:!border-[hsl(214.3_31.6%_91.4%)] [&_.ant-pagination-item]:!text-[hsl(222.2_47.4%_11.2%)] [&_.ant-pagination-item]:hover:!border-[hsl(221_83%_53%)] [&_.ant-pagination-item]:hover:!text-[hsl(221_83%_53%)] [&_.ant-pagination-item]:!transition-colors
                  [&_.ant-pagination-item-active]:!bg-[hsl(221_83%_53%)] [&_.ant-pagination-item-active]:!text-[hsl(210_20%_98%)] [&_.ant-pagination-item-active]:!border-[hsl(221_83%_53%)] [&_.ant-pagination-item-active]:hover:!bg-[hsl(221_83%_53%)]/[.90] [&_.ant-pagination-item-active]:hover:!text-[hsl(210_20%_98%)]
                  [&_.ant-pagination-disabled]:!opacity-50 [&_.ant-pagination-disabled]:!cursor-not-allowed
                  p-4 border-t border-[hsl(214.3_31.6%_91.4%)] bg-[hsl(0_0%_100%)]
                `,
              }}
              scroll={{ x: "max-content" }}
              locale={{ emptyText: "No manager data available" }}
              className={`
                !bg-[hsl(0_0%_100%)]
                [&_.ant-table]:!bg-[hsl(0_0%_100%)]
                [&_.ant-table-thead_>_tr_>_th]:!bg-[hsl(210_40%_96.1%)] [&_.ant-table-thead_>_tr_>_th]:!text-[hsl(222.2_47.4%_11.2%)] [&_.ant-table-thead_>_tr_>_th]:!px-6 [&_.ant-table-thead_>_tr_>_th]:!py-3 [&_.ant-table-thead_>_tr_>_th]:!font-semibold
                [&_.ant-table-tbody_>_tr]:!border-b [&_.ant-table-tbody_>_tr]:!border-[hsl(214.3_31.6%_91.4%)]
                [&_.ant-table-tbody_>_tr:last-child_>_td]:!border-b-0
                [&_.ant-table-tbody_>_tr:hover]:!bg-[hsl(210_40%_96.1%)]/[.50]
                [&_.ant-table-tbody_>_tr_>_td]:!text-[hsl(222.2_47.4%_11.2%)] [&_.ant-table-tbody_>_tr_>_td]:!px-6 [&_.ant-table-tbody_>_tr_>_td]:!py-4
                !rounded-lg !overflow-hidden
              `}
            />
          )}
        </Card>

        {/* Modal Section */}
        <Modal
          title={
            editingManager ? "Edit Manager Account" : "Add New Manager Account"
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          className={`
            [&_.ant-modal-content]:!bg-[hsl(0_0%_100%)] [&_.ant-modal-content]:!p-6 [&_.ant-modal-content]:!rounded-lg [&_.ant-modal-content]:!shadow-lg
            [&_.ant-modal-header]:!bg-[hsl(0_0%_100%)] [&_.ant-modal-header]:!border-b [&_.ant-modal-header]:!border-[hsl(214.3_31.6%_91.4%)]/[.50] [&_.ant-modal-header]:!p-6
            [&_.ant-modal-title]:!text-[hsl(222.2_47.4%_11.2%)] [&_.ant-modal-title]:!text-xl [&_.ant-modal-title]:!font-semibold
          `}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={
              editingManager
                ? {
                    ...editingManager,
                    status: editingManager.is_active ? "Active" : "Inactive",
                  }
                : { status: "Active" }
            }
          >
            {/* Full Name */}
            <Form.Item
              name="full_name"
              label={
                <span
                  className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
                >
                  <FiUser className={`text-[hsl(221_83%_53%)]`} /> Full Name
                </span>
              }
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
                className={`!border !border-[hsl(214.3_31.6%_91.4%)] !rounded-lg focus:!ring-2 focus:!ring-[hsl(222.2_84%_4.9%)] focus:!outline-none hover:!border-[hsl(221_83%_53%)]/[.50] !transition-colors !bg-[hsl(0_0%_100%)] !text-[hsl(222.2_47.4%_11.2%)]`}
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              name="email"
              label={
                <span
                  className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
                >
                  <FiMail className={`text-[hsl(221_83%_53%)]`} /> Email
                </span>
              }
              rules={[
                { required: true, message: "Please enter email!" },
                { type: "email", message: "Invalid email!" },
                { max: 100, message: "Email must not exceed 100 characters." },
              ]}
            >
              <Input
                placeholder="Email address"
                className={`!border !border-[hsl(214.3_31.6%_91.4%)] !rounded-lg focus:!ring-2 focus:!ring-[hsl(222.2_84%_4.9%)] focus:!outline-none hover:!border-[hsl(221_83%_53%)]/[.50] !transition-colors !bg-[hsl(0_0%_100%)] !text-[hsl(222.2_47.4%_11.2%)]`}
              />
            </Form.Item>

            {/* Phone Number */}
            <Form.Item
              name="phone"
              label={
                <span
                  className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
                >
                  <FiPhone className={`text-[hsl(221_83%_53%)]`} /> Phone Number
                </span>
              }
              rules={[
                { required: true, message: "Please enter phone number!" },
                {
                  pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
                  message:
                    "Invalid phone number (e.g., 0912345678 or +84912345678).",
                },
              ]}
            >
              <Input
                placeholder="Contact phone number"
                className={`!border !border-[hsl(214.3_31.6%_91.4%)] !rounded-lg focus:!ring-2 focus:!ring-[hsl(222.2_84%_4.9%)] focus:!outline-none hover:!border-[hsl(221_83%_53%)]/[.50] !transition-colors !bg-[hsl(0_0%_100%)] !text-[hsl(222.2_47.4%_11.2%)]`}
              />
            </Form.Item>

            {/* Role (Specific for Managers) */}
            <Form.Item
              name="role"
              label={
                <span
                  className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
                >
                  <FiBriefcase className={`text-[hsl(221_83%_53%)]`} /> Role
                </span>
              }
              rules={[
                { required: true, message: "Please enter role!" },
                { min: 3, message: "Role must be at least 3 characters." },
                { max: 50, message: "Role must not exceed 50 characters." },
              ]}
            >
              <Input
                placeholder="e.g., Senior Manager, Department Head"
                className={`!border !border-[hsl(214.3_31.6%_91.4%)] !rounded-lg focus:!ring-2 focus:!ring-[hsl(222.2_84%_4.9%)] focus:!outline-none hover:!border-[hsl(221_83%_53%)]/[.50] !transition-colors !bg-[hsl(0_0%_100%)] !text-[hsl(222.2_47.4%_11.2%)]`}
              />
            </Form.Item>

            {/* Status */}
            <Form.Item
              name="status"
              label={
                <span
                  className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
                >
                  <FiActivity className={`text-[hsl(221_83%_53%)]`} /> Status
                </span>
              }
              rules={[{ required: true, message: "Please select status!" }]}
            >
              <Select
                placeholder="Select status"
                className={`!border !border-[hsl(214.3_31.6%_91.4%)] !rounded-lg focus:!ring-2 focus:!ring-[hsl(222.2_84%_4.9%)] focus:!outline-none hover:!border-[hsl(221_83%_53%)]/[.50] !transition-colors
                  [&_.ant-select-selector]:!bg-[hsl(0_0%_100%)] [&_.ant-select-selector]:!text-[hsl(222.2_47.4%_11.2%)]`}
              >
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>

            {/* Password (only for new manager) */}
            {!editingManager && (
              <Form.Item
                name="password"
                label={
                  <span
                    className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
                  >
                    <FiLock className={`text-[hsl(221_83%_53%)]`} /> Password
                  </span>
                }
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
                  className={`!border !border-[hsl(214.3_31.6%_91.4%)] !rounded-lg focus:!ring-2 focus:!ring-[hsl(222.2_84%_4.9%)] focus:!outline-none hover:!border-[hsl(221_83%_53%)]/[.50] !transition-colors !bg-[hsl(0_0%_100%)] !text-[hsl(222.2_47.4%_11.2%)]`}
                />
              </Form.Item>
            )}

            <Form.Item className="mt-5 text-right">
              <Space>
                <Button
                  onClick={() => setIsModalVisible(false)}
                  disabled={isSubmitting}
                  className={`px-4 py-2 !border !border-[hsl(214.3_31.6%_91.4%)] !rounded-lg hover:!bg-[hsl(210_40%_96.1%)] !transition-colors !text-[hsl(222.2_47.4%_11.2%)]`}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  className={`px-4 py-2 !bg-[hsl(221_83%_53%)] !text-[hsl(210_20%_98%)] !rounded-lg hover:!bg-[hsl(221_83%_53%)]/[.90] !transition-colors disabled:!opacity-50 !border-none`}
                >
                  {editingManager ? "Update" : "Add New"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
