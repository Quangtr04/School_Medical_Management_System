/* eslint-disable no-unused-vars */
// src/pages/AdminPage/NurseManagementPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Popconfirm,
  Typography,
  Card,
  Tag,
  Spin,
  Select,
  DatePicker,
} from "antd";
import {
  LoadingOutlined,
  UserAddOutlined,
  HeartOutlined,
  WarningOutlined,
  ContainerOutlined,
} from "@ant-design/icons";
import {
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiBriefcase,
  FiHome,
  FiTag,
  FiLock,
} from "react-icons/fi";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { FaStethoscope } from "react-icons/fa";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  clearAdminError,
} from "../../redux/admin/adminSlice";
import dayjs from "dayjs";
import { vi } from "date-fns/locale";

const { Option } = Select;

const StatCardIcon = ({ icon: IconComponent, color }) => (
  <div
    style={{
      backgroundColor: color,
      borderRadius: "8px",
      padding: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      color: "white",
      width: "56px",
      height: "56px",
    }}
  >
    <IconComponent />
  </div>
);

const NursePageHeader = ({ title, description, icon, statistics = [] }) => {
  return (
    <header className="mb-5 rounded-lg bg-gradient-to-r from-red-600/[.10] to-transparent">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-5 bg-red-600/10 rounded-full border border-red-600 ml-5 mt-5">
            {React.cloneElement(icon, { className: "w-10 h-10 text-red-600" })}
          </div>
        )}
        <div>
          <h1
            className="text-gray-900 text-3xl"
            style={{ fontWeight: 700, marginTop: 30 }}
          >
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 flex items-center gap-2 text-sm">
              <span>👩‍⚕️</span> {description}
            </p>
          )}
        </div>
      </div>
      {statistics.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistics.map((stat, index) => (
            <Card
              key={index}
              className="!rounded-lg !shadow-sm !border !border-gray-200/[.50]"
            >
              <div className="flex items-center gap-4">
                {stat.icon && stat.color && (
                  <StatCardIcon icon={stat.icon} color={stat.color} />
                )}
                <div>
                  <div className="text-gray-500 text-sm">{stat.title}</div>
                  <div className="text-2xl font-bold mt-1">
                    {stat.value}
                    {stat.subValue && (
                      <span className="text-base text-gray-400">
                        {" "}
                        / {stat.subValue}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </header>
  );
};

export default function NurseManagementPage() {
  const dispatch = useDispatch();
  const {
    users: nurses = [],
    loading,
    error,
  } = useSelector((state) => state.admin);

  const pageStatistics = [
    {
      title: "Tổng số y tá",
      value: nurses.length,
      icon: FaStethoscope,
      color: "#f5222d",
    },
    {
      title: "Tài khoản đang hoạt động",
      value: nurses.filter((n) => n.is_active).length,
      icon: HeartOutlined,
      color: "#52c41a",
    },
    {
      title: "Tài khoản bị vô hiệu hóa",
      value: nurses.filter((n) => !n.is_active).length,
      icon: WarningOutlined,
      color: "#ff4d4f",
    },
    {
      title: "Tài khoản mới trong tháng",
      value: "0",
      subValue: "0",
      icon: ContainerOutlined,
      color: "#9254de",
    },
  ];
  console.log(nurses);

  const [searchText, setSearchText] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNurse, setEditingNurse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  const CURRENT_ROLE_INFO = {
    id: 3,
    name: "Y tá",
    path: "School Nurse",
    tagColor: "red",
    endpoint: "/admin/nurses",
    registerEndpoint: "/admin/register",
  };

  const fetchNursesData = useCallback(async () => {
    dispatch(
      fetchUsers({
        endpointPath: /*CURRENT_ROLE_INFO.endpoint,*/ "/admin/nurses",
        params: { search: searchText },
      })
    );
  }, [dispatch, searchText]);

  useEffect(() => {
    fetchNursesData();
  }, [fetchNursesData]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminError());
    }
  }, [error, dispatch]);

  const handleAddNurse = () => {
    setEditingNurse(null);
    form.resetFields();
    form.setFieldsValue({
      status: "Hoạt động",
      major: "Y tá",
      gender: undefined,
      fullname: "",
      email: "",
      phone: "",
      address: "",
      dayofbirth: null,
      // password: "",
    });
    setIsModalVisible(true);
  };

  const handleEditNurse = (record) => {
    setEditingNurse(record);
    form.setFieldsValue({
      ...record,
      status: record.is_active || false,
      dayofbirth: record.dayOfBirth ? dayjs(record.dayOfBirth) : null,
    });
    setIsModalVisible(true);
  };

  const handleDeleteNurse = async (userId) => {
    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(
        deleteUser({ endpointPath: CURRENT_ROLE_INFO.endpoint, id: userId })
      );
      if (deleteUser.fulfilled.match(resultAction)) {
        toast.success("Đã xóa tài khoản y tá thành công!");
        fetchNursesData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        is_active: values.status || false,
        dayofbirth: values.dayofbirth
          ? dayjs(values.dayofbirth).format("YYYY-MM-DD")
          : null,
      };

      if (editingNurse) {
        dispatch(
          updateUser({
            endpointPath: "/admin/nurses",
            user_id: editingNurse.user_id,
            userData: payload,
          })
        )
          .unwrap()
          .then(() => {
            toast.success("Cập nhật tài khoản y tá thành công!");
            setIsModalVisible(false);
            dispatch(fetchUsers({ endpointPath: "/admin/nurses" }));
            form.resetFields();
          })
          .catch((error) => {
            toast.error("Cập nhật thất bại: " + error.message);
          });
      } else {
        await dispatch(
          createUser({
            endpointPath: CURRENT_ROLE_INFO.registerEndpoint,
            userData: {
              ...payload,
              role_name: CURRENT_ROLE_INFO.path,
            },
          })
        )
          .unwrap()
          .then(() => {
            toast.success("Thêm tài khoản y tá thành công!");
            setIsModalVisible(false);
            form.resetFields();
            dispatch(fetchUsers({ endpointPath: "/admin/nurses" }));
          })
          .catch((error) => {
            const errorMessage = error?.message || "Thêm tài khoản thất bại!";
            toast.error(errorMessage);
          });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredNurses = nurses.filter((nurse) =>
    Object.values(nurse).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const showNoResultsImage =
    !loading && filteredNurses.length === 0 && searchText !== "";
  const showEmptyTableOnInitialLoad =
    !loading && nurses.length === 0 && searchText === "";
  const showTableWithData = filteredNurses.length > 0;

  const columns = [
    {
      title: (
        <span className="flex items-center gap-2 text-gray-900">
          <FiUser className="text-blue-600" />
          Họ và tên
        </span>
      ),
      dataIndex: "fullname",
      key: "fullname",
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
          <FiPhone className="text-blue-600" />
          Số điện Thoại
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
        <span className="flex items-center gap-2 text-gray-900">
          <FiCalendar className="text-blue-600" /> Ngày đăng kí
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
            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-all transform hover:scale-110 flex items-center justify-center"
            onClick={() => handleEditNurse(record)}
            type="text"
            icon={<FiEdit2 />}
            disabled={isSubmitting}
          >
            Cập nhật
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tài khoản này không?"
            onConfirm={() => handleDeleteNurse(record.user_id)}
            okText="Có"
            cancelText="Không"
            placement="topRight"
          >
            <Button
              className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-all transform hover:scale-110 flex items-center justify-center"
              danger
              type="text"
              icon={<FiTrash2 />}
              disabled={isSubmitting}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,...')] bg-fixed">
      <div className="max-w-7xl mx-auto">
        <NursePageHeader
          title="Quản lý tài khoản Y tá"
          description="Quản lý và giám sát tài khoản y tá một cách hiệu quả"
          icon={<FaStethoscope />}
          statistics={pageStatistics}
        />
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm thông tin y tá..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddNurse}
            className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white !rounded-lg hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-red-500/30 !border-none"
            disabled={isSubmitting}
          >
            <UserAddOutlined className="mr-2" />
            Thêm tài khoản Y tá
          </button>
        </div>

        <Card className="!bg-white !rounded-lg !shadow-sm !p-6 !overflow-hidden !border !border-gray-200/[.50]">
          {loading && filteredNurses.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : showNoResultsImage ? (
            <div className="text-center py-12">
              <img
                src="https://images.unsplash.com/photo-1584982751601-97dcc096659c"
                alt="Không tìm thấy"
                className="w-48 h-48 object-cover mx-auto mb-4 rounded-full"
              />
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Không tìm thấy y tá
              </h3>
              <p className="text-gray-600">
                Không có kết quả phù hợp với tiêu chí tìm kiếm.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                dataSource={nurses}
                rowKey="user_id"
                pagination={{
                  pageSize: 10,
                  className: "...",
                }}
                scroll={{ x: "max-content" }}
                locale={{
                  emptyText:
                    searchText === "" && nurses.length === 0 ? (
                      <span className="text-gray-500">
                        Chưa có dữ liệu y tá. Nhấn "Thêm tài khoản Y tá" để bắt
                        đầu.
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        Không có y tá nào phù hợp với tiêu chí tìm kiếm.
                      </span>
                    ),
                }}
                className="..."
              />
            </div>
          )}
        </Card>

        {/* Modal Cập nhập hoặc Thêm y tá */}
        <Modal
          title={
            editingNurse
              ? "Chỉnh sửa tài khoản Y tá"
              : "Thêm tài khoản Y tá mới"
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          className="..."
        >
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Form.Item
              name="fullname"
              label={
                <span className="flex items-center gap-2">
                  <FiUser className="text-blue-500" /> Họ và tên
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập họ tên!" },
                {
                  pattern: /^[\p{L}\s]{3,50}$/u,
                  message: "Chỉ chứa chữ và khoảng trắng.",
                },
                { min: 3, message: "Ít nhất 3 ký tự." },
                { max: 50, message: "Không vượt quá 50 ký tự." },
              ]}
            >
              <Input placeholder="Nhập họ và tên" className="..." />
            </Form.Item>
            <Form.Item
              name="dayofbirth"
              label={
                <span className="flex items-center gap-2">
                  <FiCalendar className="text-blue-500" /> Ngày sinh
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn Ngày tháng năm sinh!",
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item
              name="major"
              label={
                <span className="flex items-center gap-2">
                  <FiBriefcase className="text-blue-500" /> Nghề nghiệp
                </span>
              }
              initialValue="Y tá"
              readOnly
              rules={[
                { required: true, message: "Vui lòng nhập nghề nghiệp!" },
              ]}
            >
              <Input placeholder="Nhập nghề nghiệp" readOnly className="..." />
            </Form.Item>
            <Form.Item
              name="gender"
              label={
                <span className="flex items-center gap-2">
                  <FiUser className="text-blue-500" /> Giới tính
                </span>
              }
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
              initialValue={editingNurse ? editingNurse.gender : undefined}
            >
              <Select placeholder="Chọn giới tính" className="...">
                <Option value="Male">Nam</Option>
                <Option value="Female">Nữ</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="address"
              label={
                <span className="flex items-center gap-2">
                  <FiHome className="text-blue-500" /> Địa chỉ
                </span>
              }
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <Input placeholder="Địa chỉ thường chú" className="..." />
            </Form.Item>
            <Form.Item
              name="email"
              label={
                <span className="flex items-center gap-2">
                  <FiMail className="text-blue-500" /> Email
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
                { max: 100, message: "Không vượt quá 100 ký tự." },
              ]}
            >
              <Input placeholder="Địa chỉ email" className="..." />
            </Form.Item>
            <Form.Item
              name="phone"
              label={
                <span className="flex items-center gap-2">
                  <FiPhone className="text-blue-500" /> Số điện thoại
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
                  message:
                    "SĐT không hợp lệ (VD: 0912345678 hoặc +84912345678)",
                },
              ]}
            >
              <Input placeholder="Số điện thoại liên hệ" className="..." />
            </Form.Item>
            <Form.Item
              name="status"
              label={
                <span className="flex items-center gap-2">
                  <FiTag className="text-blue-500" /> Trạng thái
                </span>
              }
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái" className="...">
                <Option value={true}>Hoạt động</Option>
                <Option value={false}>Ngưng hoạt động</Option>
              </Select>
            </Form.Item>
            {/* {!editingNurse && (
              <Form.Item
                name="password"
                label={
                  <span className="flex items-center gap-2">
                    <FiLock className="text-blue-500" /> Mật khẩu
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Ít nhất 6 ký tự." },
                  { max: 50, message: "Không vượt quá 50 ký tự." },
                  {
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,50}$/,
                    message:
                      "Phải có chữ hoa, chữ thường, số và ký tự đặc biệt.",
                  },
                ]}
              >
                <Input.Password
                  placeholder="Mật khẩu cho tài khoản mới"
                  className="..."
                />
              </Form.Item>
            )} */}
            <Form.Item className="mt-5 text-right">
              <Space>
                <Button
                  onClick={() => setIsModalVisible(false)}
                  disabled={isSubmitting}
                  className="..."
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  className="..."
                >
                  {editingNurse ? "Cập nhật" : "Thêm mới"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
