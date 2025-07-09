/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/pages/AdminPage/ParentManagementPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
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
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  LoadingOutlined,
  UserAddOutlined,
  UserOutlined, // Icon cho Header chính
  HeartOutlined, // Icon mẫu cho thống kê
  WarningOutlined, // Icon mẫu cho thống kê
  ContainerOutlined, // Icon mẫu cho thống kê
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
  FiBriefcase,
  FiHome,
  FiTag,
} from "react-icons/fi";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import { toast } from "react-toastify"; // Giữ lại toast để hiển thị thông báo trực tiếp
import { VscAccount } from "react-icons/vsc";

// Import các action từ adminSlice
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  clearAdminError,
} from "../../redux/admin/adminSlice";

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// Component con cho icon của Stat Card
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

// PageHeader component (được nhúng trực tiếp vào ParentManagementPage)
const ParentPageHeader = ({ title, description, icon, statistics = [] }) => {
  return (
    <header className="mb-5 rounded-lg bg-gradient-to-r from-blue-600/[.10] to-transparent">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-5 bg-blue-600/10 rounded-full border border-blue-600">
            {/* Sử dụng React Element trực tiếp */}
            {React.cloneElement(icon, { className: "w-10 h-10 text-blue-600" })}
          </div>
        )}
        <div>
          <h1 className="text-gray-900 font-bold text-3xl mb-2">{title}</h1>
          {description && (
            <p className="text-gray-500 flex items-center gap-2 text-sm">
              <span>👨‍👩‍👧‍👦</span> {description}
            </p>
          )}
        </div>
      </div>

      {/* Các card thống kê - Chỉ hiển thị nếu có dữ liệu statistics */}
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
                  {stat.percentage && (
                    <Tag color="green" bordered={false} className="mt-1">
                      {stat.percentage}% so với tháng trước
                    </Tag>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </header>
  );
};

export default function ParentManagementPage() {
  const dispatch = useDispatch();
  const {
    users: parents,
    totalUsers,
    loading,
    error,
  } = useSelector((state) => state.admin); // Lấy `users` từ Redux và đổi tên thành `parents`

  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Dùng cho loading modal (thêm/sửa/xóa)
  const [form] = Form.useForm();

  // Thông tin vai trò Phụ huynh (để truyền vào adminSlice)
  const CURRENT_ROLE_INFO = {
    id: 4, // role_id cho Parent
    name: "Phụ huynh",
    path: "parents",
    tagColor: "purple",
    endpoint: "/admin/parents", // Endpoint API
  };

  // Sử dụng useCallback với debounce cho tìm kiếm
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchText(value);
      // Gọi fetchParents ngay sau khi searchText được cập nhật nếu muốn filter ngay lập tức
      // Hoặc giữ nguyên logic hiện tại để filter trên client-side
    }, 300), // Độ trễ 300ms
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const fetchParentsData = useCallback(async () => {
    dispatch(
      fetchUsers({
        endpointPath: CURRENT_ROLE_INFO.endpoint,
        params: { search: searchText }, // Truyền search text cho API nếu backend hỗ trợ
      })
    );
  }, [dispatch, searchText]); // <- QUAN TRỌNG: searchText là dependency

  // useEffect NÀY GỌI fetchParentsData MỖI KHI fetchParentsData THAY ĐỎI (tức là khi searchText thay đổi)
  useEffect(() => {
    fetchParentsData();
  }, [fetchParentsData]); // <- QUAN TRỌNG: fetchParentsData là dependency

  useEffect(() => {
    if (error) {
      toast.error(error); // Hiển thị lỗi từ Redux
      dispatch(clearAdminError()); // Xóa lỗi sau khi hiển thị
    }
  }, [error, dispatch]);

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
    setIsSubmitting(true); // Bắt đầu loading cho xóa
    try {
      const resultAction = await dispatch(
        deleteUser({ endpointPath: CURRENT_ROLE_INFO.endpoint, id: userId })
      );
      if (deleteUser.fulfilled.match(resultAction)) {
        toast.success("Đã xóa tài khoản Phụ huynh thành công!");
        fetchParentsData(); // Tải lại dữ liệu bảng sau khi xóa
      } else if (deleteUser.rejected.match(resultAction)) {
        toast.error(resultAction.payload);
      }
    } finally {
      setIsSubmitting(false); // Kết thúc loading
    }
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true); // Bắt đầu loading cho form submit
    try {
      const payload = {
        ...values,
        is_active: values.status === "Active",
      };
      delete payload.status; // Xóa trường status không cần thiết trong payload API

      if (editingParent) {
        const resultAction = await dispatch(
          updateUser({
            endpointPath: CURRENT_ROLE_INFO.endpoint,
            id: editingParent.user_id, // Sử dụng user_id từ editingParent
            userData: payload,
          })
        );
        //resultAction sẽ có dang:
        // {
        //   type: "admin/createUser/fulfilled", // Đây là type action cho thunk thành công
        //   payload: /* GIÁ TRỊ TỪ `response.data.data` */,
        //   // Có thể có các thuộc tính khác tùy thuộc vào Redux Toolkit version và cấu hình
        // }
        if (updateUser.fulfilled.match(resultAction)) {
          toast.success("Cập nhật tài khoản Phụ huynh thành công!");
          setIsModalVisible(false); // Đóng modal ngay sau khi submit thành công
          form.resetFields(); // Reset form ngay sau khi submit thành công
          fetchParentsData(); // Tải lại dữ liệu bảng
        } else if (updateUser.rejected.match(resultAction)) {
          toast.error(resultAction.payload);
        }
      } else {
        const resultAction = await dispatch(
          createUser({
            endpointPath: CURRENT_ROLE_INFO.endpoint,
            userData: { ...payload, role_id: CURRENT_ROLE_INFO.id }, // Thêm role_id khi tạo mới
          })
        );
        if (createUser.fulfilled.match(resultAction)) {
          toast.success("Thêm tài khoản Phụ huynh thành công!");
          setIsModalVisible(false); // Đóng modal ngay sau khi submit thành công
          form.resetFields(); // Reset form ngay sau khi submit thành công
          fetchParentsData(); // Tải lại dữ liệu bảng
        } else if (createUser.rejected.match(resultAction)) {
          toast.error(resultAction.payload);
        }
      }
    } finally {
      setIsSubmitting(false); // Kết thúc loading cho form submit
    }
  };

  console.log(parents);

  // Filter dữ liệu trên client-side dựa vào searchText từ Redux `users`
  // Nếu backend của bạn hỗ trợ lọc theo search query, hãy gửi `searchText` trong `fetchUsers`
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
      dataIndex: "fullname",
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
        dateString ? format(new Date(dateString), "MMM dd, yyyy") : "N/A", // Changed to 'yyyy' for year
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
            disabled={isSubmitting} // Disable khi đang submit
          >
            Cập Nhập
          </Button>
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
              disabled={isSubmitting} // Disable khi đang submit
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Dữ liệu thống kê mẫu cho ParentPageHeader
  // CẦN THAY THẾ BẰNG DỮ LIỆU THỰC TẾ TỪ API
  const pageStatistics = [
    {
      title: "Tổng số phụ huynh",
      value: totalUsers, // Lấy từ Redux
      percentage: "+5", // Giá trị mẫu, cần thay bằng dữ liệu API
      icon: UserOutlined,
      color: "#348afe", // Màu xanh dương
    },
    {
      title: "Phụ huynh hoạt động",
      value: parents.filter((p) => p.is_active).length, // Tính toán từ dữ liệu hiện có
      percentage: "+2",
      icon: VscAccount,
      color: "#52c41a", // Màu xanh lá cây
    },
    {
      title: "Phụ huynh không hoạt động",
      value: parents.filter((p) => !p.is_active).length, // Tính toán từ dữ liệu hiện có
      percentage: "-1",
      icon: WarningOutlined,
      color: "#ff4d4f", // Màu đỏ
    },
    {
      title: "Phụ huynh mới tháng này",
      value: "0", // Cần dữ liệu từ API
      subValue: "0", // Cần dữ liệu từ API
      percentage: "+0",
      icon: ContainerOutlined,
      color: "#9254de", // Màu tím
    },
  ];

  // HERE IS THE FIX: The return statement MUST be inside the function body
  return (
    <div className="min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPjwvc3ZnPg==')] bg-fixed">
      <div className="max-w-7xl mx-auto">
        <ParentPageHeader
          title="Parent Account Management"
          description="Manage and oversee parent accounts efficiently"
          icon={<FiUser />} // Sử dụng FiUser từ react-icons/fi
          statistics={pageStatistics}
        />

        {/* Search and Add Button Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={`Tìm kiếm thông tin ${CURRENT_ROLE_INFO.name}`}
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
          {loading ? ( // Sử dụng loading từ Redux
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
              rowKey="user_id" // Đảm bảo key đúng là user_id từ API của bạn
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

            {/* dayofbirth */}
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

            {/* Major */}
            <Form.Item
              name="major"
              label={
                <span className="flex items-center gap-2">
                  <FiBriefcase className="text-blue-500" /> Nghề nghiệp
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập nghề nghiệp!" },
              ]}
            >
              {/* Sử dụng Input và đặt nó ReadOnly nếu không muốn người dùng chỉnh sửa */}
              <Input
                placeholder="Nhập nghề nghiệp"
                // <--- Đặt readOnly để người dùng không sửa được
                className="..."
              />
            </Form.Item>

            {/* gender */}
            <Form.Item
              name="gender"
              label={
                <span className="flex items-center gap-2">
                  <FiUser className="text-blue-500" /> Giới tính
                </span>
              }
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
              // initialValue có thể để trống hoặc đặt giá trị mặc định "Nam" hoặc "Nữ"
              // initialValue={editingNurse ? (editingNurse.gender === 'male' ? 'Nam' : 'Nữ') : undefined}
              // Hoặc nếu backend lưu 'Nam'/'Nữ' thì giữ nguyên:
              initialValue={editingParent ? editingParent.gender : undefined} // Dựa vào dữ liệu từ backend
            >
              <Select placeholder="Chọn giới tính" className="...">
                <Option value="Male">Nam</Option>
                <Option value="Female">Nữ</Option>
                {/* Nếu bạn có thêm giới tính khác, có thể thêm Option ở đây */}
              </Select>
            </Form.Item>

            {/* Address */}
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

            {/* Email */}
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

            {/* Số điện thoại */}
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

            {/* Trạng thái */}
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
                <Option value="Hoạt động">Hoạt động</Option>
                <Option value="Ngưng hoạt động">Ngưng hoạt động</Option>
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
