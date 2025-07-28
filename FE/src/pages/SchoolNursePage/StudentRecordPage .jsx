"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Form,
  Tooltip,
  Avatar,
  Empty,
  Card,
  Select,
  Row,
  Col,
  Statistic,
  Typography,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
  UserOutlined,
  IdcardOutlined,
  TeamOutlined,
  CalendarOutlined,
  HeartOutlined,
  SafetyOutlined,
  MedicineBoxOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { differenceInYears, parseISO } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllStudentHealthRecords,
  clearHealthRecordsError,
  clearHealthRecordsSuccess,
} from "../../redux/nurse/studentRecords/studentRecord";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Stepper, { Step } from "../../Animation/Step/Stepper";
import { toast } from "react-toastify";
import { PiStudent } from "react-icons/pi";

const { Text, Title } = Typography;

// Modern design system
const modernTheme = {
  colors: {
    primary: "#667eea",
    secondary: "#764ba2",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    cardBackground: "rgba(255, 255, 255, 0.95)",
    glassMorphism: "rgba(255, 255, 255, 0.25)",
  },
  shadows: {
    card: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    hover: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  },
  borderRadius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "9999px",
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
};

const gradientHeaderStyle = {
  background: `linear-gradient(135deg, ${modernTheme.colors.primary} 0%, ${modernTheme.colors.secondary} 100%)`,
  borderRadius: modernTheme.borderRadius.xl,
  padding: "40px",
  color: "white",
  marginBottom: "32px",
  boxShadow: `0 20px 60px rgba(102, 126, 234, 0.4)`,
  position: "relative",
  overflow: "hidden",
};

const normalHealthStatus = (status) => {
  if (!status) return false;
  const normalized = status.toLowerCase().trim();
  const normalKeywords = ["tốt", "bình thường"];
  return normalKeywords.some((keyword) => normalized.includes(keyword));
};

function RenderLoadingState() {
  return (
    <div
      className="text-center py-16 flex flex-col items-center justify-center gap-6"
      style={{
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        style={{
          background: `linear-gradient(135deg, ${modernTheme.colors.primary} 0%, ${modernTheme.colors.secondary} 100%)`,
          borderRadius: "50%",
          padding: "20px",
          boxShadow: modernTheme.shadows.card,
        }}
      >
        <LoadingOutlined style={{ fontSize: 40, color: "white" }} spin />
      </motion.div>
      <div>
        <Title level={4} style={{ color: "#6b7280", marginBottom: "8px" }}>
          Đang tải dữ liệu
        </Title>
        <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
          Vui lòng chờ trong giây lát...
        </Text>
      </div>
    </div>
  );
}

function filterRecords(healthRecords, searchQuery, classSearch) {
  if (!Array.isArray(healthRecords)) return [];

  const query = searchQuery?.trim().toLowerCase();
  const classQuery = classSearch?.trim().toLowerCase();

  return healthRecords.filter((record) => {
    const name = record?.student_name?.toLowerCase() || "";
    const code = record?.student_code?.toLowerCase() || "";
    const className = record?.class_name?.toLowerCase() || "";

    const matchQuery = !query || name.includes(query) || code.includes(query);
    const matchClass = !classQuery || className.includes(classQuery);

    return matchQuery && matchClass;
  });
}

// MotionRow component for animating table rows
const MotionRow = ({ children, ...props }) => (
  <motion.tr
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{
      duration: 0.4,
      delay: props["data-row-key"] ? (props["data-row-key"] % 10) * 0.03 : 0,
      ease: "easeOut",
    }}
    {...props}
  >
    {children}
  </motion.tr>
);

export default function StudentRecordPage() {
  const dispatch = useDispatch();
  const { healthRecords, loading, error, success } = useSelector(
    (state) => state.studentRecord
  );
  const navigate = useNavigate();

  const studentWithHealthDanger = useMemo(
    () =>
      healthRecords.filter((rec) => {
        const status = rec?.health?.health_status;
        return !normalHealthStatus(status);
      }),
    [healthRecords]
  );

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState(null);
  const [form] = Form.useForm();

  // Memoized statistics
  const stats = useMemo(() => {
    if (!Array.isArray(healthRecords)) {
      return {
        total: 0,
        healthy: 0,
        needsAttention: 0,
        averageAge: 0,
      };
    }

    const total = healthRecords.length;
    const healthy = healthRecords.length - studentWithHealthDanger.length;
    const needsAttention = studentWithHealthDanger.length;

    return { total, healthy, needsAttention };
  }, [healthRecords]);

  // Class options for filter
  const classOptions = useMemo(() => {
    if (!Array.isArray(healthRecords)) return [];
    const classes = [
      ...new Set(
        healthRecords.map((record) => record.class_name).filter(Boolean)
      ),
    ];
    return classes.map((className) => ({
      label: className,
      value: className,
    }));
  }, [healthRecords]);

  useEffect(() => {
    dispatch(fetchAllStudentHealthRecords());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      form.resetFields();
      dispatch(clearHealthRecordsSuccess());
      dispatch(fetchAllStudentHealthRecords());
    }
  }, [success, dispatch, form]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearHealthRecordsError());
    }
  }, [error, dispatch]);

  const filteredHealthRecords = useMemo(() => {
    let filtered = filterRecords(healthRecords, searchQuery, classFilter);
    return filtered;
  }, [healthRecords, searchQuery, classFilter]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, total: filteredHealthRecords.length }));
  }, [filteredHealthRecords.length]);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handleClassFilterChange = useCallback((value) => {
    setClassFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const columns = useMemo(
    () => [
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <IdcardOutlined style={{ color: modernTheme.colors.info }} />
            <span className="font-semibold">Mã học sinh</span>
          </div>
        ),
        dataIndex: "student_code",
        key: "student_code",
        width: 140,
        align: "center",
        render: (text) => (
          <div className="flex justify-center">
            <div
              style={{
                background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
                padding: "8px 12px",
                borderRadius: modernTheme.borderRadius.md,
                border: "1px solid #bae6fd",
              }}
            >
              <Text
                code
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: modernTheme.colors.info,
                }}
              >
                {text}
              </Text>
            </div>
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <UserOutlined style={{ color: modernTheme.colors.success }} />
            <span className="font-semibold">Họ và tên</span>
          </div>
        ),
        dataIndex: "student_name",
        key: "student_name",
        width: 220,
        render: (text, record) => (
          <div className="flex items-center gap-3">
            <Avatar
              size={40}
              src={record.avatar_url}
              icon={<UserOutlined />}
              style={{
                background: `linear-gradient(135deg, ${modernTheme.colors.success} 0%, #34d399 100%)`,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
            />
            <div>
              <Text strong style={{ color: "#1f2937", fontSize: "14px" }}>
                {text}
              </Text>
            </div>
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <TeamOutlined style={{ color: modernTheme.colors.warning }} />
            <span className="font-semibold">Lớp</span>
          </div>
        ),
        dataIndex: "class_name",
        key: "class_name",
        width: 120,
        align: "center",
        render: (text) => (
          <Tag
            style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              border: "1px solid #fbbf24",
              borderRadius: modernTheme.borderRadius.md,
              color: "#92400e",
              fontWeight: "600",
              padding: "4px 12px",
            }}
          >
            {text}
          </Tag>
        ),
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <CalendarOutlined style={{ color: "#ec4899" }} />
            <span className="font-semibold">Tuổi</span>
          </div>
        ),
        dataIndex: "student_date_of_birth",
        key: "age",
        align: "center",
        width: 100,
        render: (dob) => (
          <div className="flex flex-col items-center gap-1">
            <div
              style={{
                background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
                padding: "6px",
                borderRadius: modernTheme.borderRadius.sm,
                border: "1px solid #f9a8d4",
              }}
            >
              <CalendarOutlined
                style={{ color: "#ec4899", fontSize: "14px" }}
              />
            </div>
            <Text
              style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}
            >
              {dob
                ? `${differenceInYears(new Date(), parseISO(dob))} tuổi`
                : "N/A"}
            </Text>
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <HeartOutlined style={{ color: "#ef4444" }} />
            <span className="font-semibold">Tình trạng sức khỏe</span>
          </div>
        ),
        dataIndex: "medical_conditions",
        key: "medical_conditions",
        align: "center",
        width: 280,
        render: (conditions) => (
          <div className="flex justify-center">
            {conditions && conditions.length > 0 ? (
              <div className="flex flex-wrap gap-1 justify-center">
                {conditions.slice(0, 2).map((condition, index) => (
                  <Tag
                    key={index}
                    style={{
                      background:
                        "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                      border: "1px solid #fecaca",
                      borderRadius: modernTheme.borderRadius.sm,
                      color: "#dc2626",
                      fontWeight: "600",
                      fontSize: "11px",
                      padding: "2px 8px",
                    }}
                  >
                    {condition.toUpperCase()}
                  </Tag>
                ))}
                {conditions.length > 2 && (
                  <Tooltip title={conditions.slice(2).join(", ")}>
                    <Tag
                      style={{
                        background:
                          "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                        border: "1px solid #d1d5db",
                        borderRadius: modernTheme.borderRadius.sm,
                        color: "#6b7280",
                        fontWeight: "600",
                        fontSize: "11px",
                        padding: "2px 8px",
                      }}
                    >
                      +{conditions.length - 2}
                    </Tag>
                  </Tooltip>
                )}
              </div>
            ) : (
              <Tag
                icon={<SafetyOutlined />}
                style={{
                  background:
                    "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                  border: "1px solid #86efac",
                  borderRadius: modernTheme.borderRadius.md,
                  color: "#166534",
                  fontWeight: "600",
                  padding: "4px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Khỏe mạnh
              </Tag>
            )}
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <EditOutlined style={{ color: "#6b7280" }} />
            <span className="font-semibold">Hành động</span>
          </div>
        ),
        key: "actions",
        align: "center",
        width: 120,
        render: (_, record) => (
          <div className="flex justify-center">
            <Tooltip title="Xem chi tiết hồ sơ sức khỏe">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  height: "32px",
                  width: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() =>
                  navigate(`/nurse/students-record/${record.student_id}`)
                }
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    [navigate]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          style={gradientHeaderStyle}
        >
          {/* Background decoration */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "200px",
              height: "200px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              transform: "translate(50%, -50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "150px",
              height: "150px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
              transform: "translate(-50%, 50%)",
            }}
          />

          <Row
            align="middle"
            justify="space-between"
            style={{ position: "relative", zIndex: 1 }}
          >
            <Col>
              <div className="flex items-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: modernTheme.borderRadius.xl,
                    padding: "24px",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <PiStudent style={{ fontSize: "48px", color: "white" }} />
                </motion.div>
                <div>
                  <Title
                    level={1}
                    style={{
                      color: "white",
                      margin: 0,
                      fontSize: "36px",
                      fontWeight: "800",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Hồ sơ sức khỏe học sinh
                  </Title>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "18px",
                      display: "block",
                      marginTop: "8px",
                      fontWeight: "500",
                    }}
                  >
                    Quản lý và theo dõi tình trạng sức khỏe của tất cả học sinh
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </motion.div>

        {/* Enhanced Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
            <Col xs={24} sm={12} md={8}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card
                  style={{
                    ...modernCardStyle,
                    background:
                      "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    border: "1px solid #93c5fd",
                  }}
                  bodyStyle={{ padding: "24px" }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "#1e40af",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        Tổng học sinh
                      </span>
                    }
                    value={stats.total}
                    prefix={
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                          borderRadius: "8px",
                          padding: "8px",
                          display: "inline-flex",
                          marginRight: "8px",
                        }}
                      >
                        <UserOutlined
                          style={{ color: "white", fontSize: "16px" }}
                        />
                      </div>
                    }
                    valueStyle={{
                      color: "#1e40af",
                      fontWeight: "800",
                      fontSize: "32px",
                    }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card
                  style={{
                    ...modernCardStyle,
                    background:
                      "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                    border: "1px solid #86efac",
                  }}
                  bodyStyle={{ padding: "24px" }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "#166534",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        Khỏe mạnh
                      </span>
                    }
                    value={stats.healthy}
                    prefix={
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          borderRadius: "8px",
                          padding: "8px",
                          display: "inline-flex",
                          marginRight: "8px",
                        }}
                      >
                        <SafetyOutlined
                          style={{ color: "white", fontSize: "16px" }}
                        />
                      </div>
                    }
                    valueStyle={{
                      color: "#166534",
                      fontWeight: "800",
                      fontSize: "32px",
                    }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card
                  style={{
                    ...modernCardStyle,
                    background:
                      "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    border: "1px solid #fbbf24",
                  }}
                  bodyStyle={{ padding: "24px" }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "#92400e",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        Cần theo dõi
                      </span>
                    }
                    value={studentWithHealthDanger.length}
                    prefix={
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                          borderRadius: "8px",
                          padding: "8px",
                          display: "inline-flex",
                          marginRight: "8px",
                        }}
                      >
                        <HeartOutlined
                          style={{ color: "white", fontSize: "16px" }}
                        />
                      </div>
                    }
                    valueStyle={{
                      color: "#92400e",
                      fontWeight: "800",
                      fontSize: "32px",
                    }}
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* Enhanced Main Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card style={modernCardStyle} bodyStyle={{ padding: "0" }}>
            {/* Enhanced Filters */}
            <div style={{ padding: "32px 32px 0 32px" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Title
                    level={3}
                    style={{ margin: 0, color: "#1f2937", fontWeight: "700" }}
                  >
                    Danh sách học sinh
                  </Title>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      marginTop: "4px",
                    }}
                  >
                    Quản lý và theo dõi hồ sơ sức khỏe của tất cả học sinh
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  <FilterOutlined style={{ color: "#6b7280" }} />
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {filteredHealthRecords.length} kết quả
                  </Text>
                </div>
              </div>

              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={12}>
                  <Input
                    placeholder="Tìm kiếm theo mã, tên hoặc lớp..."
                    style={{
                      borderRadius: modernTheme.borderRadius.lg,
                      height: "48px",
                      background: "#f9fafb",
                      border: "2px solid #f3f4f6",
                      fontSize: "14px",
                    }}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Lọc theo lớp"
                    onChange={handleClassFilterChange}
                    allowClear
                    style={{ width: "100%", height: "48px" }}
                    value={classFilter}
                  >
                    {classOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </div>

            {/* Enhanced Table */}
            <div style={{ padding: "32px" }}>
              {loading && !healthRecords.length ? (
                <RenderLoadingState />
              ) : (
                <Stepper
                  onStepChange={(step) => {
                    setPagination((prev) => ({ ...prev, current: step }));
                  }}
                  backButtonText="Trang trước"
                  nextButtonText="Trang sau"
                  disableStepIndicators={true}
                  currentStep={pagination.current}
                >
                  {filteredHealthRecords.length === 0 ? (
                    <Step key="empty">
                      <div
                        style={{ textAlign: "center", padding: "60px 20px" }}
                      >
                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                            borderRadius: "50%",
                            width: "100px",
                            height: "100px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                          }}
                        >
                          <UserOutlined
                            style={{ fontSize: "40px", color: "#9ca3af" }}
                          />
                        </div>
                        <Title
                          level={4}
                          style={{ color: "#6b7280", marginBottom: "8px" }}
                        >
                          Không tìm thấy học sinh nào
                        </Title>
                        <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                          Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                        </Text>
                      </div>
                    </Step>
                  ) : (
                    Array.from({
                      length: Math.ceil(
                        filteredHealthRecords.length / pagination.pageSize
                      ),
                    }).map((_, idx) => (
                      <Step key={idx}>
                        <AnimatePresence mode="wait">
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                          >
                            <Table
                              columns={columns}
                              dataSource={filteredHealthRecords.slice(
                                idx * pagination.pageSize,
                                (idx + 1) * pagination.pageSize
                              )}
                              rowKey="student_id"
                              size="middle"
                              scroll={{ x: 1200 }}
                              pagination={false}
                              loading={loading}
                              style={{
                                borderRadius: modernTheme.borderRadius.lg,
                                overflow: "hidden",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                              }}
                              rowClassName={(record, index) =>
                                index % 2 === 0
                                  ? "table-row-light"
                                  : "table-row-dark"
                              }
                              locale={{
                                emptyText: (
                                  <Empty
                                    description="Không tìm thấy học sinh nào"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                  />
                                ),
                              }}
                              components={{
                                body: {
                                  row: (props) => (
                                    <AnimatePresence>
                                      <MotionRow {...props} />
                                    </AnimatePresence>
                                  ),
                                },
                              }}
                            />
                          </motion.div>
                        </AnimatePresence>
                      </Step>
                    ))
                  )}
                </Stepper>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 2px solid #e2e8f0;
          font-weight: 700;
          color: #1e293b;
          padding: 20px 16px;
          font-size: 14px;
          text-align: center; /* Căn giữa header */
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9;
          padding: 20px 16px;
          text-align: center; /* ✅ Căn giữa toàn bộ nội dung cell */
        }

        .ant-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
        }
        .ant-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ant-btn:hover {
          transform: translateY(-2px);
        }
        .ant-select-selector {
          border-radius: ${modernTheme.borderRadius.lg} !important;
          height: 48px !important;
          border: 2px solid #f3f4f6 !important;
        }
        .ant-input {
          border-radius: ${modernTheme.borderRadius.lg} !important;
          border: 2px solid #f3f4f6 !important;
        }
        .ant-input:focus,
        .ant-input-focused {
          border-color: ${modernTheme.colors.info} !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }
        .ant-select-focused .ant-select-selector {
          border-color: ${modernTheme.colors.info} !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }

        .ant-table-tbody > tr:hover {
          background: linear-gradient(
            135deg,
            #f0f9ff 0%,
            #e0f2fe 100%
          ) !important;
        }
      `}</style>
    </motion.div>
  );
}
