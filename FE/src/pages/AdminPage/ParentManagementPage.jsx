/* eslint-disable no-unused-vars */
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
  CheckCircleOutlined,
  CloseCircleOutlined,
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
  FiUserPlus,
} from "react-icons/fi";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import { toast } from "react-toastify";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  clearAdminError,
  createStudent,
} from "../../redux/admin/adminSlice";
import dayjs from "dayjs";

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

const ParentPageHeader = ({ title, description, icon, statistics = [] }) => {
  return (
    <header className="mb-5 rounded-lg bg-gradient-to-r from-blue-600/[.10] to-transparent">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-5 bg-blue-600/10 rounded-full border border-blue-600">
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

export default function ParentManagementPage() {
  const dispatch = useDispatch();
  const {
    users: parents = [],
    loading,
    error,
  } = useSelector((state) => state.admin);

  const children = useSelector((state) => state.studentRecord.healthRecords);

  // Bước 1: Lấy mã student_code cuối cùng
  const lastStudentCode =
    children.length > 0 ? children[children.length - 1].student_code : "STU000";

  // Bước 2: Tách phần số từ mã cuối và tăng lên
  const numericPart = parseInt(lastStudentCode.replace("STU", ""), 10); // "006" → 6
  //Số 10 trong parseInt(..., 10) là hệ cơ số (radix) mà bạn muốn chuyển chuỗi thành số.
  const nextCodeNumber = numericPart + 1;

  // Bước 3: Tạo mã mới có định dạng STUxxx
  const newStudentCode = `STU${nextCodeNumber.toString().padStart(3, "0")}`;

  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [addStudentForParentForm] = Form.useForm();

  const [modalAddStudentForParent, setModalAddStudentForParent] =
    useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

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

  const handleSearchChange = (value) => {
    debouncedSearch(value);
  };

  const fetchParentsData = useCallback(async () => {
    dispatch(
      fetchUsers({
        endpointPath: CURRENT_ROLE_INFO.endpoint,
        params: { search: searchText }, // Truyền search text cho API nếu backend hỗ trợ
      })
    );
  }, [dispatch, searchText]);

  // useEffect NÀY GỌI fetchParentsData MỖI KHI fetchParentsData THAY ĐỎI (tức là khi searchText thay đổi)
  useEffect(() => {
    fetchParentsData();
  }, [fetchParentsData]);

  useEffect(() => {
    if (error) {
      toast.error(error); // Hiển thị lỗi từ Redux
      dispatch(clearAdminError()); // Xóa lỗi sau khi hiển thị
    }
  }, [error, dispatch]);

  const handleAddParent = () => {
    setEditingParent(null);
    form.resetFields();
    form.setFieldsValue({
      status: true, // Trạng thái mặc định
      gender: undefined, // Bắt buộc nếu dùng Select
    }); // Đặt mặc định trạng thái Active
    setIsModalVisible(true);
  };

  const handleEditParent = (record) => {
    setEditingParent(record);
    form.setFieldsValue({
      ...record,
      status: record.is_active ? true : false,
      dayofbirth: record.dayOfBirth ? dayjs(record.dayOfBirth) : null,
    });
    setIsModalVisible(true);
  };

  const handleDeleteParent = (userId) => {
    setIsSubmitting(true); // Bắt đầu loading

    dispatch(
      deleteUser({ endpointPath: CURRENT_ROLE_INFO.endpoint, id: userId })
    )
      .unwrap()
      .then(() => {
        toast.success("Đã xóa tài khoản Phụ huynh thành công!");
        fetchParentsData(); // Tải lại dữ liệu bảng sau khi xóa
      })
      .catch((error) => {
        toast.error(error?.message || "Xóa tài khoản thất bại!");
      })
      .finally(() => {
        setIsSubmitting(false); // Kết thúc loading
      });
  };

  const handleAddStudentForParent = (parentRecord) => {
    setModalAddStudentForParent(true);
    setSelectedParent(parentRecord);
  };

  const handleFormSubmit = (values) => {
    setIsSubmitting(true); // Bắt đầu loading

    const payload = {
      ...values,
      is_active: values.status ? true : false,
      dayofbirth: values.dayofbirth
        ? dayjs(values.dayofbirth).format("YYYY-MM-DD")
        : null,
    };

    if (editingParent) {
      // Cập nhật tài khoản phụ huynh
      dispatch(
        updateUser({
          endpointPath: "/admin/parents",
          user_id: editingParent.user_id,
          userData: payload,
        })
      )
        .unwrap()
        .then(() => {
          toast.success("Cập nhật tài khoản Phụ huynh thành công!");
          setIsModalVisible(false);
          form.resetFields();
          fetchParentsData();
        })
        .catch((error) => {
          toast.error(error?.message || "Cập nhật thất bại");
        })
        .finally(() => {
          setIsSubmitting(false); // Kết thúc loading
        });
    } else {
      // Tạo tài khoản phụ huynh mới
      dispatch(
        createUser({
          endpointPath: "/admin/register",
          userData: {
            ...payload,
            role_id: CURRENT_ROLE_INFO.id,
            role_name: "Parent",
          },
        })
      )
        .unwrap()
        .then(() => {
          toast.success("Thêm tài khoản Phụ huynh thành công!");
          setIsModalVisible(false);
          form.resetFields();
          fetchParentsData();
        })
        .catch((error) => {
          toast.error(error?.message || "Thêm tài khoản thất bại");
        })
        .finally(() => {
          setIsSubmitting(false); // Kết thúc loading
        });
    }
  };

  const handleSubmitAddStudentForParentForm = (values) => {
    const payload = {
      ...values,
      parent_id: selectedParent?.user_id,
      day_of_birth: values.day_of_birth.format("YYYY-MM-DD"), // 👈 Format rõ ràng
    };

    dispatch(createStudent(payload))
      .unwrap()
      .then(() => {
        toast.success("Thêm học sinh thành công!");
        setModalAddStudentForParent(false);
        setSelectedParent(null);
        addStudentForParentForm.resetFields();
      })
      .catch(() => {
        toast.error("Thêm học sinh thất bại!");
      });
  };
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
          icon={is_active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={is_active ? "success" : "error"}
        >
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
      align: "center",
      render: (_, record) => (
        <Space size="small">
          {/* Nút cập nhật */}
          <Button
            className="p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-100 transition-all transform hover:scale-110 flex items-center justify-center"
            onClick={() => handleEditParent(record)}
            type="text"
            icon={<FiEdit2 />}
            disabled={isSubmitting}
          >
            Cập Nhật
          </Button>

          {/* ✅ Nút thêm học sinh */}
          <Button
            className="p-2 text-green-500 hover:text-green-700 rounded-full hover:bg-green-100 transition-all transform hover:scale-110 flex items-center justify-center"
            onClick={() => handleAddStudentForParent(record)}
            type="text"
            icon={<FiUserPlus />} // dùng react-icons/fi nếu có
            disabled={isSubmitting}
          >
            Thêm học sinh
          </Button>

          {/* Nút xóa */}
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
    <div className="min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPjwvc3ZnPg==')] bg-fixed">
      <div className="max-w-7xl mx-auto">
        <ParentPageHeader
          title="Parent Account Management"
          description="Manage and oversee parent accounts efficiently"
          icon={<FiUser />} // Sử dụng FiUser từ react-icons/fi
        />

        {/* Search and Add Button Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={`Tìm kiếm thông tin ${CURRENT_ROLE_INFO.name}`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleSearchChange(e.target.value)}
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

        {/* Modal Thêm tài khỏản */}
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
              <Input placeholder="Nhập nghề nghiệp" className="..." />
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
                <Option value={true}>Hoạt động</Option>
                <Option value={false}>Ngưng hoạt động</Option>
              </Select>
            </Form.Item>

            {/* Password (only for new parent)
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
            )} */}

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

        {/* Modal thêm thông tin học sinh cho phụ huynh */}
        <Modal
          open={modalAddStudentForParent}
          title={`Thêm học sinh cho phụ huynh: ${
            selectedParent?.full_name || ""
          }`}
          onCancel={() => {
            setModalAddStudentForParent(false);
            setSelectedParent(null);
            addStudentForParentForm.resetFields();
          }}
          onOk={() => addStudentForParentForm.submit()}
          okText="Thêm"
          cancelText="Hủy"
        >
          <Form
            form={addStudentForParentForm}
            layout="vertical"
            onFinish={(values) => handleSubmitAddStudentForParentForm(values)}
          >
            <Form.Item
              hidden
              name="parent_id"
              label="Mã phụ huynh"
              initialValue={selectedParent?.user_id} // <-- Giá trị sinh tự động
            >
              <Input hidden />
            </Form.Item>

            <Form.Item
              name="student_code"
              label="Mã học sinh"
              initialValue={newStudentCode}
              hidden={newStudentCode} // <-- Giá trị sinh tự động
            >
              <Input readOnly />
            </Form.Item>

            {/* Tên học sinh */}
            <Form.Item
              name="full_name"
              label="Tên học sinh"
              rules={[
                { required: true, message: "Vui lòng nhập tên học sinh" },
                {
                  min: 2,
                  message: "Tên học sinh phải có ít nhất 2 ký tự",
                },
                {
                  max: 50,
                  message: "Tên học sinh không vượt quá 50 ký tự",
                },
                {
                  validator: (_, value) => {
                    if (!value || /^[^\d]*$/.test(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject("Tên học sinh không được chứa số");
                  },
                },
              ]}
            >
              <Input placeholder="Nhập tên học sinh" />
            </Form.Item>

            {/* Giới tính */}
            <Form.Item
              name="gender"
              label="Giới tính"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Select placeholder="Chọn giới tính" allowClear>
                <Select.Option value="male">Nam</Select.Option>
                <Select.Option value="female">Nữ</Select.Option>
              </Select>
            </Form.Item>

            {/* Ngày sinh */}
            <Form.Item
              name="day_of_birth"
              label="Ngày sinh"
              rules={[
                { required: true, message: "Vui lòng chọn ngày sinh" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const today = new Date();
                    const selected = new Date(value.format("YYYY-MM-DD"));
                    if (selected >= today) {
                      return Promise.reject(
                        "Ngày sinh không hợp lệ (trong tương lai)"
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>

            {/* Lớp */}
            <Form.Item
              name="class_name"
              label="Lớp"
              rules={[{ required: true, message: "Vui lòng chọn lớp" }]}
            >
              <Select placeholder="Chọn lớp học">
                {[
                  "1A1",
                  "1B",
                  "1C",
                  "2A",
                  "2B",
                  "2C",
                  "3A",
                  "3B",
                  "3C",
                  "4A",
                  "4B",
                  "4C",
                  "5A",
                  "5B",
                  "5C",
                ].map((className) => (
                  <Select.Option key={className} value={className}>
                    {className}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
