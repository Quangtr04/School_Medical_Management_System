/* eslint-disable no-unused-vars */
// src/pages/AdminPage/ManagerManagementPage.jsx

import React, { useState, useEffect } from "react";
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
  EditOutlined, // Giữ lại EditOutlined cho nút chỉnh sửa
  DeleteOutlined,
  SearchOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  FiEdit2,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiBriefcase,
  FiUsers,
  FiLock,
  FiActivity,
  FiSearch,
} from "react-icons/fi";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUsers,
  updateUser, // Chỉ giữ lại updateUser
  deleteUser,
} from "../../redux/admin/adminSlice";
import { toast } from "react-toastify";
// Đảm bảo đường dẫn chính xác
import { vi } from "date-fns/locale";

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// Định nghĩa thông tin cụ thể cho vai trò Manager
const CURRENT_ROLE_INFO = {
  id: 2, // Giả sử role_id cho Manager là 2. Hãy điều chỉnh theo hệ thống ID của bạn.
  name: "Quản lý", // Tên vai trò
  path: "managers", // Đường dẫn trong URL nếu có
  tagColor: "blue", // Màu tag nếu bạn muốn sử dụng cho role tag
  endpoint: "/admin/managers", // Endpoint API cụ thể cho Managers
};

export default function ManagerManagementPage() {
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  // Lấy trạng thái từ Redux store
  const { users, loading, error } = useSelector((state) => state.admin);
  console.log(users);

  // Fetch users (managers) khi component mount
  useEffect(() => {
    dispatch(fetchUsers({ endpointPath: CURRENT_ROLE_INFO.endpoint }));
  }, [dispatch]);

  // XÓA HÀM handleAddManager() VÀ CÁC CHỖ GỌI NÓ
  // const handleAddManager = () => {
  //   setEditingManager(null);
  //   form.resetFields();
  //   form.setFieldsValue({ status: "Active" });
  //   setIsModalVisible(true);
  // };

  const handleEditManager = (record) => {
    setEditingManager(record);
    form.setFieldsValue({
      ...record,
      status: record.is_active ? "Active" : "Inactive", // Ánh xạ boolean sang chuỗi trạng thái
    });
    setIsModalVisible(true);
  };

  const handleDeleteManager = async (userId) => {
    try {
      await dispatch(
        deleteUser({ endpointPath: CURRENT_ROLE_INFO.endpoint, id: userId })
      ).unwrap();
      message.success("Đã xóa tài khoản quản lý thành công!");
      // Re-fetch users để cập nhật danh sách sau khi xóa
      dispatch(fetchUsers({ endpointPath: CURRENT_ROLE_INFO.endpoint }));
    } catch (error) {
      console.error("Lỗi khi xóa manager:", error);
      message.error(
        `Lỗi: ${
          error.message || "Không thể xóa tài khoản quản lý. Vui lòng thử lại."
        }`
      );
    }
  };

  const handleFormSubmit = async (values) => {
    console.log(values);

    try {
      const payload = {
        ...values,
        is_active: values.status === "Active", // Ánh xạ chuỗi trạng thái sang boolean
      };
      delete payload.status; // Xóa trường 'status' vì API mong đợi 'is_active'

      // CHỈ GIỮ LẠI LOGIC CẬP NHẬT
      // Bỏ qua `if (editingManager)` và `else` vì giờ chỉ có cập nhật
      if (!editingManager) {
        // Thực tế, nút "Thêm" đã bị loại bỏ,
        // nên không thể vào được đây.
        // Đây là một defensive check.
        message.error("Không thể thêm mới tài khoản quản lý từ đây.");
        setIsModalVisible(false);
        return;
      }

      await dispatch(
        updateUser({
          endpointPath: "/admin/managers",
          id: editingManager.user_id, // Giả sử user_id là định danh duy nhất
          userData: payload,
        })
      )
        .unwrap()
        .then(() => {
          toast.success("Cập nhật tài khoản quản lý thành công!");
          setIsModalVisible(false);
          form.resetFields();
          // Re-fetch users để cập nhật danh sách sau khi cập nhật
          dispatch(fetchUsers({ endpointPath: CURRENT_ROLE_INFO.endpoint }));
        });
    } catch (error) {
      toast.error(
        `Lỗi: ${
          error.message || "Thao tác thất bại. Vui lòng kiểm tra lại thông tin."
        }`
      );
    }
  };

  // Lọc managers (hiện tại là users) dựa trên searchText
  const filteredManagers = users.filter((manager) =>
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
          <FiUser className={`text-[hsl(221_83%_53%)]`} /> Tên đầy đủ
        </span>
      ),
      dataIndex: "fullname",
      key: "fullname",
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
          <FiPhone className={`text-[hsl(221_83%_53%)]`} /> Số điện thoại
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
          <FiBriefcase className={`text-[hsl(221_83%_53%)]`} /> Vai trò{" "}
        </span>
      ),
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Trạng thái",
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
          {is_active ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: (
        <span
          className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
        >
          <FiCalendar className={`text-[hsl(221_83%_53%)]`} /> Ngày đăng ký
        </span>
      ),
      dataIndex: "created_at",
      key: "created_at",
      render: (dateString) =>
        dateString ? (
          <span className="text-gray-700">
            {format(new Date(dateString), "dd/MM/yyyy", { locale: vi })}
          </span>
        ) : (
          <Tag color="default">Chưa có</Tag>
        ),
    },
    {
      title: "Hành động",
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
            title="Bạn có chắc chắn muốn xóa tài khoản này không?"
            onConfirm={() => handleDeleteManager(record.user_id)}
            okText="Có"
            cancelText="Không"
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
              <Title
                level={1}
                className={`!text-[hsl(222.2_47.4%_11.2%)] !font-bold !text-3xl !mb-2`}
              >
                Quản lý tài khoản {CURRENT_ROLE_INFO.name}
              </Title>
              <Paragraph
                className={`!text-[hsl(215.4_16.3%_46.9%)] flex items-center gap-2 text-sm`}
              >
                <span>💼</span>
                Quản lý và giám sát tài khoản {CURRENT_ROLE_INFO.name} hiệu quả
              </Paragraph>
            </div>
          </div>
        </header>

        {/* Search Section (Removed Add Button) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={`Tìm kiếm thông tin ${CURRENT_ROLE_INFO.name}`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          {/* ĐÃ XÓA NÚT "Thêm tài khoản Quản lý" Ở ĐÂY */}
          {/* <Button
            type="primary"
            icon={<PlusOutlined className="mr-2" />}
            onClick={handleAddManager}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white !rounded-lg hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/30 !border-none"
          >
            Thêm tài khoản {CURRENT_ROLE_INFO.name}
          </Button> */}
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
              <p className={`text-[hsl(215.4_16.3%_46.9%)]`}>
                Đang tải dữ liệu...
              </p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredManagers}
              rowKey="user_id"
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
              locale={{
                emptyText: `Không có dữ liệu ${CURRENT_ROLE_INFO.name.toLowerCase()} nào`,
              }}
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
        {/* Modal chỉ hiển thị khi có editingManager (chế độ chỉnh sửa) */}
        {editingManager && (
          <Modal
            title={
              <Title
                level={4}
                className="!text-[hsl(222.2_47.4%_11.2%)] !font-semibold !mb-0"
              >
                Chỉnh sửa tài khoản {CURRENT_ROLE_INFO.name}
              </Title>
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
                  : {} // Khi chỉ có chỉnh sửa, initialValues phải luôn dựa vào editingManager
              }
            >
              {/* Full Name */}
              <Form.Item
                name="full_name"
                label={
                  <span
                    className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
                  >
                    <FiUser className={`text-[hsl(221_83%_53%)]`} /> Tên đầy đủ
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập tên đầy đủ!" },
                  {
                    pattern: /^[\p{L}\s]{3,50}$/u,
                    message:
                      "Tên đầy đủ chỉ được chứa chữ cái và khoảng trắng.",
                  },
                  { min: 3, message: "Tên đầy đủ phải có ít nhất 3 ký tự." },
                  {
                    max: 50,
                    message: "Tên đầy đủ không được vượt quá 50 ký tự.",
                  },
                ]}
              >
                <Input
                  placeholder="Tên đầy đủ"
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
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                  { max: 100, message: "Email không được vượt quá 100 ký tự." },
                ]}
              >
                <Input
                  placeholder="Địa chỉ email"
                  className={`!border !border-[hsl(214.3_31.6%_91.4%)] !rounded-lg focus:!ring-2 focus:!ring-[hsl(222.2_84%_4%)] focus:!outline-none hover:!border-[hsl(221_83%_53%)]/[.50] !transition-colors !bg-[hsl(0_0%_100%)] !text-[hsl(222.2_47.4%_11.2%)]`}
                />
              </Form.Item>

              {/* Phone Number */}
              <Form.Item
                name="phone"
                label={
                  <span
                    className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
                  >
                    <FiPhone className={`text-[hsl(221_83%_53%)]`} /> Số điện
                    thoại
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
                    message:
                      "Số điện thoại không hợp lệ (ví dụ: 0912345678 hoặc +84912345678).",
                  },
                ]}
              >
                <Input
                  placeholder="Số điện thoại liên hệ"
                  className={`!border !border-[hsl(214.3_31.6%_91.4%)] !rounded-lg focus:!ring-2 focus:!ring-[hsl(222.2_84%_4.9%)] focus:!outline-none hover:!border-[hsl(221_83%_53%)]/[.50] !transition-colors !bg-[hsl(0_0%_100%)] !text-[hsl(222.2_47.4%_11.2%)]`}
                />
              </Form.Item>

              {/* Role (Specific for Managers) - Keep as Input or potentially hide if always "Quản lý" */}
              <Form.Item
                name="role" // Tên trường này có thể cần khớp với cách API của bạn xử lý vai trò
                label={
                  <span
                    className={`flex items-center gap-2 text-[hsl(222.2_47.4%_11.2%)]`}
                  >
                    <FiBriefcase className={`text-[hsl(221_83%_53%)]`} /> Vai
                    trò
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập vai trò!" },
                  { min: 3, message: "Vai trò phải có ít nhất 3 ký tự." },
                  { max: 50, message: "Vai trò không được vượt quá 50 ký tự." },
                ]}
              >
                <Input
                  placeholder="Ví dụ: Quản lý cấp cao, Trưởng phòng"
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
                    <FiActivity className={`text-[hsl(221_83%_53%)]`} /> Trạng
                    thái
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select
                  placeholder="Chọn trạng thái"
                  className={`!border !border-[hsl(214.3_31.6%_91.4%)] !rounded-lg focus:!ring-2 focus:!ring-[hsl(222.2_84%_4.9%)] focus:!outline-none hover:!border-[hsl(221_83%_53%)]/[.50] !transition-colors
                  [&_.ant-select-selector]:!bg-[hsl(0_0%_100%)] [&_.ant-select-selector]:!text-[hsl(222.2_47.4%_11.2%)]`}
                >
                  <Option value="Active">Hoạt động</Option>
                  <Option value="Inactive">Không hoạt động</Option>
                </Select>
              </Form.Item>

              {/* Removed Password field since it's only for adding, which is removed */}
              {/* {!editingManager && (
              <Form.Item
                name="password"
                label={...}
                rules={...}
              >
                <Input.Password ... />
              </Form.Item>
            )} */}

              <Form.Item className="mt-5 text-right">
                <Space>
                  <Button
                    onClick={() => setIsModalVisible(false)}
                    disabled={loading}
                    className={`px-4 py-2 !border !border-[hsl(214.3_31.6%_91.4%)] !rounded-lg hover:!bg-[hsl(210_40%_96.1%)] !transition-colors !text-[hsl(222.2_47.4%_11.2%)]`}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className={`px-4 py-2 !bg-[hsl(221_83%_53%)] !text-[hsl(210_20%_98%)] !rounded-lg hover:!bg-[hsl(221_83%_53%)]/[.90] !transition-colors disabled:!opacity-50 !border-none`}
                  >
                    Cập nhật
                    {/* Luôn là "Cập nhật" vì không còn chức năng thêm mới */}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        )}
      </div>
    </div>
  );
}
