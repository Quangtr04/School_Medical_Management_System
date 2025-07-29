"use client";
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
  Select,
  DatePicker,
  Row,
  Col,
  Avatar,
  Tooltip,
  Badge,
  Empty,
} from "antd";
import {
  UserAddOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  ExportOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { FaStethoscope, FaUserNurse } from "react-icons/fa";
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
const { Title, Text } = Typography;

// Modern theme configuration
const modernTheme = {
  colors: {
    primary: "#1677ff",
    secondary: "#722ed1",
    success: "#52c41a",
    warning: "#faad14",
    error: "#ff4d4f",
    info: "#13c2c2",
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    cardBackground: "rgba(255, 255, 255, 0.95)",
    glassMorphism: "rgba(255, 255, 255, 0.25)",
    nurseTheme: {
      primary: "#f5222d",
      secondary: "#ff7875",
      light: "#fff2f0",
      gradient: "linear-gradient(135deg, #f5222d 0%, #ff7875 100%)",
    },
  },
  shadows: {
    card: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    hover: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    glow: "0 0 20px rgba(245, 34, 45, 0.3)",
  },
  borderRadius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "9999px",
  },
  animations: {
    spring: { type: "spring", stiffness: 300, damping: 30 },
    smooth: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

// Enhanced card styles
const modernCardStyle = {
  borderRadius: modernTheme.borderRadius.xl,
  background: modernTheme.colors.cardBackground,
  boxShadow: modernTheme.shadows.card,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(20px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  marginTop: "12px",
};

const gradientHeaderStyle = {
  background: modernTheme.colors.nurseTheme.gradient,
  borderRadius: modernTheme.borderRadius.xl,
  padding: "40px",
  color: "white",
  marginBottom: "32px",
  boxShadow: modernTheme.shadows.glow,
  position: "relative",
  overflow: "hidden",
};

// Enhanced Statistics Card Component
const StatisticsCard = ({
  title,
  value,
  subValue,
  icon: IconComponent,
  color,
  trend,
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    transition={modernTheme.animations.spring}
  >
    <Card
      style={{
        ...modernCardStyle,
        background: `linear-gradient(135deg, ${color}08 0%, ${color}03 100%)`,
        borderLeft: `4px solid ${color}`,
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Text style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
            {title}
          </Text>
          <div className="flex items-baseline gap-2 mt-2">
            <Title
              level={2}
              style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}
            >
              {value}
            </Title>
            {subValue && (
              <Text style={{ color: "#94a3b8", fontSize: "16px" }}>
                / {subValue}
              </Text>
            )}
          </div>
        </div>
        <div
          style={{
            backgroundColor: color,
            borderRadius: modernTheme.borderRadius.lg,
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 8px 16px ${color}40`,
          }}
        >
          <IconComponent style={{ fontSize: "28px", color: "white" }} />
        </div>
      </div>
    </Card>
  </motion.div>
);

// Enhanced Page Header Component
const NursePageHeader = ({ title, description, icon, statistics = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={modernTheme.animations.smooth}
    >
      <Card style={gradientHeaderStyle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {icon && (
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                style={{
                  padding: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: modernTheme.borderRadius.full,
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                {React.cloneElement(icon, {
                  style: { fontSize: "48px", color: "white" },
                })}
              </motion.div>
            )}
            <div>
              <Title
                level={1}
                style={{
                  color: "white",
                  margin: 0,
                  fontWeight: 800,
                  fontSize: "36px",
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {title}
              </Title>
              {description && (
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "18px",
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>👩‍⚕️</span> {description}
                </Text>
              )}
            </div>
          </div>

          {/* Floating decoration */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              right: "40px",
              top: "20px",
              opacity: 0.1,
              fontSize: "120px",
              color: "white",
            }}
          >
            <FaUserNurse />
          </motion.div>
        </div>
      </Card>

      {/* Statistics Grid */}
      {statistics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...modernTheme.animations.smooth, delay: 0.2 }}
          style={{ marginTop: "32px" }}
        >
          <Row gutter={[24, 24]}>
            {statistics.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <StatisticsCard {...stat} />
              </Col>
            ))}
          </Row>
        </motion.div>
      )}
    </motion.div>
  );
};

// Enhanced Filter Bar Component
const FilterBar = ({
  searchText,
  setSearchText,
  onAddNurse,
  onRefresh,
  isSubmitting,
  totalCount,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...modernTheme.animations.smooth, delay: 0.3 }}
  >
    <Card style={modernCardStyle}>
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Input
            placeholder="Tìm kiếm y tá theo tên, email, số điện thoại..."
            prefix={<SearchOutlined style={{ color: "#64748b" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              height: "48px",
              borderRadius: modernTheme.borderRadius.lg,
              border: "2px solid #f1f5f9",
              fontSize: "14px",
            }}
            allowClear
          />
        </Col>

        <Col>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Text
              style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}
            >
              Tổng cộng:{" "}
              <strong style={{ color: "#1e293b" }}>{totalCount}</strong> y tá
            </Text>

            <Space size="middle">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAddNurse}
                disabled={isSubmitting}
                style={{
                  height: "48px",
                  padding: "0 24px",
                  borderRadius: modernTheme.borderRadius.lg,
                  background: modernTheme.colors.nurseTheme.gradient,
                  border: "none",
                  boxShadow: modernTheme.shadows.glow,
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Thêm Y tá mới
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </Card>
  </motion.div>
);

export default function NurseManagementPage() {
  const dispatch = useDispatch();
  const {
    users: nurses = [],
    loading,
    error,
  } = useSelector((state) => state.admin);

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

  // Enhanced statistics with trends
  const pageStatistics = [
    {
      title: "Tổng số y tá",
      value: nurses.length,
      icon: FaStethoscope,
      color: modernTheme.colors.nurseTheme.primary,
      trend: 12,
    },
    {
      title: "Đang hoạt động",
      value: nurses.filter((n) => n.is_active).length,
      icon: CheckCircleOutlined,
      color: modernTheme.colors.success,
      trend: 8,
    },
    {
      title: "Tạm ngưng",
      value: nurses.filter((n) => !n.is_active).length,
      icon: CloseCircleOutlined,
      color: modernTheme.colors.error,
      trend: -5,
    },
    {
      title: "Mới trong tháng",
      value: nurses.filter((n) => {
        const createdDate = new Date(n.created_at);
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        return createdDate >= monthAgo;
      }).length,
      icon: UserAddOutlined,
      color: modernTheme.colors.secondary,
      trend: 25,
    },
  ];

  const fetchNursesData = useCallback(async () => {
    dispatch(
      fetchUsers({
        endpointPath: "/admin/nurses",
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
      status: true,
      major: "Y tá",
      gender: undefined,
      fullname: "",
      email: "",
      phone: "",
      address: "",
      dayofbirth: null,
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

  // Enhanced table columns
  const columns = [
    {
      title: "Thông tin y tá",
      key: "nurseInfo",
      width: 280,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={48}
            style={{
              backgroundColor: modernTheme.colors.nurseTheme.primary,
              fontSize: "18px",
              fontWeight: 600,
            }}
            icon={<UserOutlined />}
          >
            {record.fullname?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <Text
              strong
              style={{ fontSize: "15px", color: "#1e293b", display: "block" }}
            >
              {record.fullname}
            </Text>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              <MailOutlined style={{ color: "#64748b", fontSize: "12px" }} />
              <Text style={{ color: "#64748b", fontSize: "13px" }}>
                {record.email}
              </Text>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "2px",
              }}
            >
              <PhoneOutlined style={{ color: "#64748b", fontSize: "12px" }} />
              <Text style={{ color: "#64748b", fontSize: "13px" }}>
                {record.phone}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 140,
      render: (is_active) => (
        <Badge
          status={is_active ? "success" : "error"}
          text={
            <span
              style={{
                color: is_active
                  ? modernTheme.colors.success
                  : modernTheme.colors.error,
                fontWeight: 500,
                fontSize: "13px",
              }}
            >
              {is_active ? "Hoạt động" : "Tạm ngưng"}
            </span>
          }
        />
      ),
    },
    {
      title: "Thông tin cá nhân",
      key: "personalInfo",
      width: 200,
      render: (_, record) => (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <HomeOutlined style={{ color: "#64748b", fontSize: "12px" }} />
            <Text style={{ color: "#374151", fontSize: "13px" }}>
              {record.address || "Chưa cập nhật"}
            </Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarOutlined style={{ color: "#64748b", fontSize: "12px" }} />
            <Text style={{ color: "#374151", fontSize: "13px" }}>
              {record.dayOfBirth
                ? format(new Date(record.dayOfBirth), "dd/MM/yyyy", {
                    locale: vi,
                  })
                : "Chưa cập nhật"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Ngày tham gia",
      dataIndex: "created_at",
      key: "created_at",
      width: 140,
      render: (dateString) => (
        <div>
          <Text style={{ color: "#374151", fontSize: "13px", fontWeight: 500 }}>
            {dateString
              ? format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
              : "Chưa có"}
          </Text>
          {dateString && (
            <Text
              style={{ color: "#64748b", fontSize: "12px", display: "block" }}
            >
              {format(new Date(dateString), "HH:mm", { locale: vi })}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditNurse(record)}
              disabled={isSubmitting}
              style={{
                color: modernTheme.colors.primary,
                borderRadius: modernTheme.borderRadius.md,
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa tài khoản y tá"
            description="Bạn có chắc chắn muốn xóa tài khoản này không?"
            onConfirm={() => handleDeleteNurse(record.user_id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              danger: true,
              style: { borderRadius: modernTheme.borderRadius.md },
            }}
            cancelButtonProps={{
              style: { borderRadius: modernTheme.borderRadius.md },
            }}
          >
            <Tooltip title="Xóa tài khoản">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={isSubmitting}
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: modernTheme.colors.background,
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Enhanced Header */}
        <NursePageHeader
          title="Quản lý Y tá"
          description="Quản lý và giám sát tài khoản y tá một cách hiệu quả"
          icon={<FaStethoscope />}
          statistics={pageStatistics}
        />

        {/* Enhanced Filter Bar */}
        <FilterBar
          searchText={searchText}
          setSearchText={setSearchText}
          onAddNurse={handleAddNurse}
          onRefresh={fetchNursesData}
          isSubmitting={isSubmitting}
          totalCount={filteredNurses.length}
        />

        {/* Enhanced Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...modernTheme.animations.smooth, delay: 0.4 }}
          style={{ marginTop: "24px" }}
        >
          <Card style={modernCardStyle}>
            <Table
              columns={columns}
              dataSource={filteredNurses}
              rowKey="user_id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => (
                  <Text style={{ color: "#64748b", fontWeight: 500 }}>
                    Hiển thị {range[0]}-{range[1]} trong tổng số {total} y tá
                  </Text>
                ),
                style: { padding: "16px 0" },
              }}
              scroll={{ x: 1000 }}
              locale={{
                emptyText: (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={modernTheme.animations.smooth}
                    style={{ padding: "64px 0" }}
                  >
                    <Empty
                      image={
                        <div
                          style={{
                            fontSize: "64px",
                            color: "#d1d5db",
                            marginBottom: "16px",
                          }}
                        >
                          <FaUserNurse />
                        </div>
                      }
                      description={
                        <div>
                          <Title
                            level={4}
                            style={{ color: "#64748b", marginBottom: "8px" }}
                          >
                            {searchText
                              ? "Không tìm thấy y tá"
                              : "Chưa có y tá nào"}
                          </Title>
                          <Text
                            style={{
                              color: "#9ca3af",
                              maxWidth: "400px",
                              display: "block",
                              margin: "0 auto",
                            }}
                          >
                            {searchText
                              ? `Không có y tá nào phù hợp với từ khóa "${searchText}"`
                              : "Danh sách y tá sẽ hiển thị ở đây khi có dữ liệu."}
                          </Text>
                          {searchText && (
                            <Button
                              onClick={() => setSearchText("")}
                              style={{
                                marginTop: "16px",
                                borderRadius: modernTheme.borderRadius.lg,
                              }}
                            >
                              Xóa bộ lọc
                            </Button>
                          )}
                        </div>
                      }
                    />
                  </motion.div>
                ),
              }}
            />
          </Card>
        </motion.div>

        {/* Enhanced Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  backgroundColor: modernTheme.colors.nurseTheme.primary,
                  borderRadius: modernTheme.borderRadius.md,
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserOutlined style={{ color: "white", fontSize: "16px" }} />
              </div>
              <span style={{ fontSize: "18px", fontWeight: 600 }}>
                {editingNurse ? "Chỉnh sửa thông tin Y tá" : "Thêm Y tá mới"}
              </span>
            </div>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
          style={{ top: 20 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            style={{ marginTop: "24px" }}
          >
            <Row gutter={16}>
              {/* Personal Information Section */}
              <Col span={24}>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "16px",
                    borderRadius: modernTheme.borderRadius.lg,
                    marginBottom: "24px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Title
                    level={5}
                    style={{ margin: "0 0 16px 0", color: "#1e293b" }}
                  >
                    👤 Thông tin cá nhân
                  </Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="fullname"
                        label="Họ và tên"
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
                        <Input
                          placeholder="Nhập họ và tên"
                          style={{
                            height: "40px",
                            borderRadius: modernTheme.borderRadius.md,
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="dayofbirth"
                        label="Ngày sinh"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn ngày sinh!",
                          },
                        ]}
                      >
                        <DatePicker
                          style={{
                            width: "100%",
                            height: "40px",
                            borderRadius: modernTheme.borderRadius.md,
                          }}
                          format="DD/MM/YYYY"
                          placeholder="Chọn ngày sinh"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="gender"
                        label="Giới tính"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn giới tính!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Chọn giới tính"
                          style={{ height: "40px" }}
                        >
                          <Option value="Male">Nam</Option>
                          <Option value="Female">Nữ</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[
                          { required: true, message: "Vui lòng nhập địa chỉ!" },
                        ]}
                      >
                        <Input
                          placeholder="Nhập địa chỉ thường trú"
                          style={{
                            height: "40px",
                            borderRadius: modernTheme.borderRadius.md,
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* Contact Information Section */}
              <Col span={24}>
                <div
                  style={{
                    backgroundColor: "#f0f9ff",
                    padding: "16px",
                    borderRadius: modernTheme.borderRadius.lg,
                    marginBottom: "24px",
                    border: "1px solid #bae6fd",
                  }}
                >
                  <Title
                    level={5}
                    style={{ margin: "0 0 16px 0", color: "#1e293b" }}
                  >
                    📞 Thông tin liên hệ
                  </Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email!" },
                          { type: "email", message: "Email không hợp lệ!" },
                          { max: 100, message: "Không vượt quá 100 ký tự." },
                        ]}
                      >
                        <Input
                          placeholder="Nhập địa chỉ email"
                          style={{
                            height: "40px",
                            borderRadius: modernTheme.borderRadius.md,
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số điện thoại!",
                          },
                          {
                            pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
                            message:
                              "SĐT không hợp lệ (VD: 0912345678 hoặc +84912345678)",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Nhập số điện thoại"
                          style={{
                            height: "40px",
                            borderRadius: modernTheme.borderRadius.md,
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* Work Information Section */}
              <Col span={24}>
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    padding: "16px",
                    borderRadius: modernTheme.borderRadius.lg,
                    marginBottom: "24px",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <Title
                    level={5}
                    style={{ margin: "0 0 16px 0", color: "#1e293b" }}
                  >
                    💼 Thông tin công việc
                  </Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="major"
                        label="Chuyên môn"
                        initialValue="Y tá"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập chuyên môn!",
                          },
                        ]}
                      >
                        <Input
                          readOnly
                          style={{
                            height: "40px",
                            borderRadius: modernTheme.borderRadius.md,
                            backgroundColor: "#f9fafb",
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="status"
                        label="Trạng thái hoạt động"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn trạng thái!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Chọn trạng thái"
                          style={{ height: "40px" }}
                        >
                          <Option value={true}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <CheckCircleOutlined
                                style={{ color: modernTheme.colors.success }}
                              />
                              Hoạt động
                            </div>
                          </Option>
                          <Option value={false}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <CloseCircleOutlined
                                style={{ color: modernTheme.colors.error }}
                              />
                              Tạm ngưng
                            </div>
                          </Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            {/* Form Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                paddingTop: "24px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <Button
                onClick={() => setIsModalVisible(false)}
                disabled={isSubmitting}
                style={{
                  height: "40px",
                  padding: "0 24px",
                  borderRadius: modernTheme.borderRadius.md,
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                style={{
                  height: "40px",
                  padding: "0 24px",
                  borderRadius: modernTheme.borderRadius.md,
                  background: modernTheme.colors.nurseTheme.gradient,
                  border: "none",
                  fontWeight: 600,
                }}
              >
                {editingNurse ? "Cập nhật thông tin" : "Thêm y tá mới"}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

{
  /* Enhanced Global Styles */
}
<style jsx global>{`
  .ant-table-thead > tr > th {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 2px solid #e2e8f0;
    font-weight: 700;
    color: #1e293b;
    padding: 20px 16px;
    font-size: 14px;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f1f5f9;
    padding: 20px 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .ant-table-tbody > tr:hover > td {
    background-color: #f8fafc;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .ant-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .ant-card:hover {
    transform: translateY(-2px);
    box-shadow: ${modernTheme.shadows.hover} !important;
  }

  .ant-btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .ant-btn:hover {
    transform: translateY(-1px);
  }

  .ant-input,
  .ant-input-number,
  .ant-picker,
  .ant-select-selector {
    border-radius: ${modernTheme.borderRadius.md} !important;
    border: 2px solid #f3f4f6 !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .ant-input:focus,
  .ant-input-focused,
  .ant-input-number:focus,
  .ant-input-number-focused,
  .ant-picker-focused,
  .ant-select-focused .ant-select-selector {
    border-color: ${modernTheme.colors.nurseTheme.primary} !important;
    box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.1) !important;
  }

  .ant-pagination-item {
    border-radius: ${modernTheme.borderRadius.md} !important;
    border: 1px solid #e5e7eb !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .ant-pagination-item:hover {
    border-color: ${modernTheme.colors.nurseTheme.primary} !important;
    transform: translateY(-1px) !important;
  }

  .ant-pagination-item-active {
    background: ${modernTheme.colors.nurseTheme.primary} !important;
    border-color: ${modernTheme.colors.nurseTheme.primary} !important;
  }

  .ant-pagination-item-active a {
    color: white !important;
  }

  .ant-pagination-prev,
  .ant-pagination-next {
    border-radius: ${modernTheme.borderRadius.md} !important;
    border: 1px solid #e5e7eb !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .ant-pagination-prev:hover,
  .ant-pagination-next:hover {
    border-color: ${modernTheme.colors.nurseTheme.primary} !important;
    transform: translateY(-1px) !important;
  }

  .ant-modal-content {
    border-radius: ${modernTheme.borderRadius.xl} !important;
    box-shadow: ${modernTheme.shadows.hover} !important;
    overflow: hidden;
  }

  .ant-modal-header {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 24px !important;
    border-bottom: 1px solid #e2e8f0 !important;
  }

  .ant-modal-body {
    padding: 0 24px 24px 24px !important;
  }

  .ant-empty-image {
    margin-bottom: 16px !important;
  }

  .ant-badge-status-dot {
    width: 8px !important;
    height: 8px !important;
  }

  .ant-avatar {
    border: 2px solid rgba(245, 34, 45, 0.1) !important;
  }
`}</style>;
