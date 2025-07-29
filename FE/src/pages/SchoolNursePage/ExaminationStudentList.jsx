"use client";

/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  Table,
  Tag,
  Card,
  Input,
  Button,
  Typography,
  Empty,
  Badge,
  Tooltip,
  Row,
  Col,
  Form,
  Modal,
  InputNumber,
  Select,
  DatePicker,
  Space,
  Statistic,
  Avatar,
  Progress,
} from "antd";
import {
  SearchOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  TeamOutlined,
  BarcodeOutlined,
  CalculatorFilled,
  EyeOutlined,
  HeartFilled,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  AlertOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { toast } from "react-toastify";
import {
  fetchAllHealthExaminations,
  fetchHealthExaminationById,
  updateStundentRecord,
} from "../../redux/nurse/heathExaminations/heathExamination";
import { FaEarListen, FaWeightScale } from "react-icons/fa6";
import { MdBloodtype, MdHeight, MdOutlineDangerous } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

const { Title, Text } = Typography;
const { Option } = Select;

// Modern theme configuration
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
  background: `linear-gradient(135deg, ${modernTheme.colors.success} 0%, ${modernTheme.colors.success} 100%)`,
  borderRadius: modernTheme.borderRadius.xl,
  padding: "40px",
  color: "white",
  marginBottom: "32px",
  boxShadow: `0 20px 60px rgba(102, 126, 234, 0.4)`,
  position: "relative",
  overflow: "hidden",
};

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

// Motion Row component for animating table rows
const MotionRow = ({ children, ...props }) => (
  <motion.tr
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{
      duration: 0.4,
      delay: props["data-row-key"] ? (props["data-row-key"] % 10) * 0.03 : 0,
    }}
    {...props}
  >
    {children}
  </motion.tr>
);

export default function ExaminationStudentList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const examination = useSelector((state) => state.examination.records);
  const loadingStudentList = useSelector((state) => state.examination.loading);

  const examinationById = examination?.find(
    (ex) => ex.checkup_id === Number(id)
  );

  const [updateStudentRecModal, setUpdateStudentRecModal] = useState(false);
  const [approvedStudentList, setApprovedStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updateExaminationForm] = Form.useForm();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  console.log(approvedStudentList);

  useEffect(() => {
    const fetchStudents = async () => {
      if (id) {
        const data = await dispatch(fetchHealthExaminationById(id)).unwrap();
        setApprovedStudentList(data);
      }
    };
    fetchStudents();
  }, [id, navigate, examinationById, updateStudentRecModal, dispatch]);

  useEffect(() => {
    if (selectedStudent) {
      const validateValue = {
        ...selectedStudent,
        checked_at: selectedStudent.checked_at
          ? dayjs(selectedStudent.checked_at)
          : null,
        full_name: selectedStudent.full_name,
        student_code: selectedStudent.student_code,
        class_name: selectedStudent.class_name,
        date_of_birth: selectedStudent.date_of_birth
          ? dayjs(selectedStudent.date_of_birth)
          : null,
        height_cm: selectedStudent.height_cm ?? null,
        weight_kg: selectedStudent.weight_kg ?? null,
        vision_left: selectedStudent.vision_left ?? null,
        vision_right: selectedStudent.vision_right ?? null,
        hearing_left: selectedStudent.hearing_left ?? null,
        hearing_right: selectedStudent.hearing_right ?? null,
        blood_pressure: selectedStudent.blood_pressure ?? null,
        abnormal_signs: selectedStudent.abnormal_signs ?? "",
        needs_counseling: selectedStudent.needs_counseling ?? false,
        notes: selectedStudent.notes ?? "",
      };
      updateExaminationForm.setFieldsValue(validateValue);
    }
  }, [selectedStudent, updateStudentRecModal, updateExaminationForm]);

  const handleEditRecord = useCallback(
    (record) => {
      setSelectedStudent(record);
      setUpdateStudentRecModal(true);
    },
    [updateExaminationForm]
  );

  const handleUpdateRecord = useCallback(
    async (values) => {
      if (!selectedStudent?.id) {
        toast.error("Không tìm thấy học sinh để cập nhật.");
        return;
      }
      const formData = {
        ...values,
        checked_at: dayjs(values.checked_at).isValid()
          ? dayjs(values.checked_at).format("YYYY-MM-DD")
          : null,
      };
      try {
        const payload = {
          id: selectedStudent.id,
          values: formData,
        };
        await dispatch(updateStundentRecord(payload)).unwrap();
        toast.success("Cập nhật thành công!");
        dispatch(fetchAllHealthExaminations());
        setUpdateStudentRecModal(false);
      } catch (error) {
        toast.error(error.message || "Cập nhật thất bại!");
      }
    },
    [dispatch, selectedStudent, setUpdateStudentRecModal]
  );

  // Calculate statistics
  const statistics = {
    total: approvedStudentList.length,
    examined: approvedStudentList.filter((s) => s.checked_at).length,
    needsCounseling: approvedStudentList.filter((s) => s.needs_counseling)
      .length,
    normal: approvedStudentList.filter(
      (s) => !s.needs_counseling && s.checked_at
    ).length,
  };

  // Filter students
  const filteredStudents = approvedStudentList.filter((student) => {
    const matchesSearch =
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "examined" && student.checked_at) ||
      (statusFilter === "pending" && !student.checked_at) ||
      (statusFilter === "counseling" && student.needs_counseling) ||
      (statusFilter === "normal" &&
        !student.needs_counseling &&
        student.checked_at);

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2">
          <BarcodeOutlined style={{ color: modernTheme.colors.primary }} />
          <span className="font-semibold">Mã học sinh</span>
        </div>
      ),
      dataIndex: "student_code",
      key: "student_code",
      width: 140,
      render: (code) => (
        <Badge
          count={code}
          style={{
            backgroundColor: modernTheme.colors.primary,
            borderRadius: modernTheme.borderRadius.md,
            fontSize: "12px",
            fontWeight: 600,
            boxShadow: `0 2px 8px rgba(102, 126, 234, 0.3)`,
          }}
        />
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <UserOutlined style={{ color: modernTheme.colors.success }} />
          <span className="font-semibold">Thông tin học sinh</span>
        </div>
      ),
      dataIndex: "full_name",
      key: "full_name",
      width: 220,
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{
              backgroundColor: modernTheme.colors.info,
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            }}
          />
          <div>
            <Text strong style={{ color: "#1f2937", fontSize: "14px" }}>
              {name}
            </Text>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              Lớp: {record.class_name}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <CalendarOutlined style={{ color: modernTheme.colors.warning }} />
          <span className="font-semibold">Ngày sinh</span>
        </div>
      ),
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      width: 140,
      render: (dob) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined style={{ color: "#6b7280", fontSize: "14px" }} />
          <Text style={{ fontSize: "14px" }}>
            {dayjs(dob).format("DD/MM/YYYY")}
          </Text>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <MedicineBoxOutlined style={{ color: modernTheme.colors.info }} />
          <span className="font-semibold">Chỉ số sức khỏe</span>
        </div>
      ),
      key: "health_metrics",
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Chiều cao:</span>
            <span className="font-medium">
              {record.height_cm ? `${record.height_cm}cm` : "-"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Cân nặng:</span>
            <span className="font-medium">
              {record.weight_kg ? `${record.weight_kg}kg` : "-"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Huyết áp:</span>
            <span className="font-medium">{record.blood_pressure || "-"}</span>
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <EyeOutlined style={{ color: modernTheme.colors.secondary }} />
          <span className="font-semibold">Thị lực / Thính lực</span>
        </div>
      ),
      key: "senses",
      width: 180,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Thị lực:</span>
            <span className="font-medium">
              {record.vision_left || "-"} / {record.vision_right || "-"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Thính lực:</span>
            <span className="font-medium">
              {record.hearing_left || "-"} / {record.hearing_right || "-"}
            </span>
          </div>
        </div>
      ),
    },

    {
      title: (
        <div className="flex items-center gap-2">
          <SafetyOutlined style={{ color: modernTheme.colors.warning }} />
          <span className="font-semibold">Tình trạng</span>
        </div>
      ),
      key: "status",
      width: 160,
      render: (_, record) => {
        const hasAbnormalSigns =
          record.abnormal_signs && record.abnormal_signs !== "Không";
        const needsCounseling = record.needs_counseling;
        const isExamined = record.checked_at;

        if (!isExamined) {
          return (
            <Tag
              icon={<ClockCircleOutlined />}
              style={{
                color: "#6b7280",
                backgroundColor: "#f9fafb",
                borderColor: "#e5e7eb",
                borderRadius: modernTheme.borderRadius.full,
                padding: "4px 12px",
                fontWeight: 500,
                fontSize: "12px",
              }}
            >
              Chưa khám
            </Tag>
          );
        }

        if (needsCounseling || hasAbnormalSigns) {
          return (
            <Tag
              icon={<ExclamationCircleOutlined />}
              style={{
                color: modernTheme.colors.error,
                backgroundColor: "#fef2f2",
                borderColor: "#fecaca",
                borderRadius: modernTheme.borderRadius.full,
                padding: "4px 12px",
                fontWeight: 500,
                fontSize: "12px",
              }}
            >
              Cần tư vấn
            </Tag>
          );
        }

        return (
          <Tag
            icon={<CheckCircleOutlined />}
            style={{
              color: modernTheme.colors.success,
              backgroundColor: "#f0fdf4",
              borderColor: "#bbf7d0",
              borderRadius: modernTheme.borderRadius.full,
              padding: "4px 12px",
              fontWeight: 500,
              fontSize: "12px",
            }}
          >
            Bình thường
          </Tag>
        );
      },
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <EditOutlined style={{ color: "#8c8c8c" }} />
          <span className="font-semibold">Thao tác</span>
        </div>
      ),
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Tooltip title="Cập nhật hồ sơ khám">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditRecord(record)}
            style={{
              borderRadius: modernTheme.borderRadius.sm,
              background: `linear-gradient(135deg, ${modernTheme.colors.primary} 0%, ${modernTheme.colors.secondary} 100%)`,
              border: "none",
              boxShadow: `0 4px 12px rgba(102, 126, 234, 0.4)`,
            }}
            className="hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Cập nhật
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
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
          transition={{ delay: 0.2, duration: 0.6 }}
          style={gradientHeaderStyle}
        >
          <div
            className="flex items-center justify-between"
            style={{ position: "relative", zIndex: 1 }}
          >
            <div className="flex items-center gap-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: modernTheme.borderRadius.xl,
                  padding: "20px",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <HeartFilled style={{ fontSize: "48px", color: "white" }} />
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
                  Khám Sức Khỏe Học Sinh 🏥
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
                  📅 Ngày khám{" "}
                  {examinationById?.scheduled_date
                    ? dayjs(examinationById.scheduled_date).format("DD/MM/YYYY")
                    : "Chưa xác định"}
                </Text>
              </div>
            </div>
            <Space size="middle">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/nurse/checkups")}
                style={{
                  height: "44px",
                  borderRadius: modernTheme.borderRadius.lg,
                  background: modernTheme.colors.glassMorphism,
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  backdropFilter: "blur(10px)",
                  fontWeight: 500,
                }}
              >
                Quay lại
              </Button>
            </Space>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  style={{
                    ...modernCardStyle,
                    background:
                      "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    border: "1px solid #93c5fd",
                  }}
                  bodyStyle={{ padding: "32px 24px" }}
                >
                  <div className="text-center">
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                        borderRadius: "16px",
                        width: "80px",
                        height: "80px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)",
                      }}
                    >
                      <TeamOutlined
                        style={{ fontSize: "36px", color: "white" }}
                      />
                    </div>
                    <Statistic
                      title={
                        <span
                          style={{
                            color: "#1e40af",
                            fontWeight: "600",
                            fontSize: "16px",
                          }}
                        >
                          Tổng học sinh
                        </span>
                      }
                      value={statistics.total}
                      valueStyle={{
                        color: "#1e40af",
                        fontWeight: "800",
                        fontSize: "32px",
                      }}
                    />
                  </div>
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  style={{
                    ...modernCardStyle,
                    background:
                      "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                    border: "1px solid #86efac",
                  }}
                  bodyStyle={{ padding: "32px 24px" }}
                >
                  <div className="text-center">
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        borderRadius: "16px",
                        width: "80px",
                        height: "80px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      <CheckCircleOutlined
                        style={{ fontSize: "36px", color: "white" }}
                      />
                    </div>
                    <Statistic
                      title={
                        <span
                          style={{
                            color: "#166534",
                            fontWeight: "600",
                            fontSize: "16px",
                          }}
                        >
                          Đã khám
                        </span>
                      }
                      value={statistics.examined}
                      valueStyle={{
                        color: "#166534",
                        fontWeight: "800",
                        fontSize: "32px",
                      }}
                    />
                    <Progress
                      percent={Math.round(
                        (statistics.examined / statistics.total) * 100
                      )}
                      size="small"
                      strokeColor="#10b981"
                      style={{ marginTop: "12px" }}
                    />
                  </div>
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  style={{
                    ...modernCardStyle,
                    background:
                      "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    border: "1px solid #fbbf24",
                  }}
                  bodyStyle={{ padding: "32px 24px" }}
                >
                  <div className="text-center">
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                        borderRadius: "16px",
                        width: "80px",
                        height: "80px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: "0 10px 30px rgba(245, 158, 11, 0.3)",
                      }}
                    >
                      <ExclamationCircleOutlined
                        style={{ fontSize: "36px", color: "white" }}
                      />
                    </div>
                    <Statistic
                      title={
                        <span
                          style={{
                            color: "#92400e",
                            fontWeight: "600",
                            fontSize: "16px",
                          }}
                        >
                          Cần tư vấn
                        </span>
                      }
                      value={statistics.needsCounseling}
                      valueStyle={{
                        color: "#92400e",
                        fontWeight: "800",
                        fontSize: "32px",
                      }}
                    />
                    <Badge
                      count={statistics.needsCounseling}
                      style={{ backgroundColor: "#f59e0b", marginTop: "8px" }}
                    />
                  </div>
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={3}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  style={{
                    ...modernCardStyle,
                    background:
                      "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                    border: "1px solid #86efac",
                  }}
                  bodyStyle={{ padding: "32px 24px" }}
                >
                  <div className="text-center">
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        borderRadius: "16px",
                        width: "80px",
                        height: "80px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      <SafetyOutlined
                        style={{ fontSize: "36px", color: "white" }}
                      />
                    </div>
                    <Statistic
                      title={
                        <span
                          style={{
                            color: "#166534",
                            fontWeight: "600",
                            fontSize: "16px",
                          }}
                        >
                          Bình thường
                        </span>
                      }
                      value={statistics.normal}
                      valueStyle={{
                        color: "#166534",
                        fontWeight: "800",
                        fontSize: "32px",
                      }}
                    />
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card style={modernCardStyle} bodyStyle={{ padding: 0 }}>
            {/* Enhanced Table Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                borderBottom: "2px solid #e2e8f0",
                padding: "24px",
                borderRadius: `${modernTheme.borderRadius.xl} ${modernTheme.borderRadius.xl} 0 0`,
              }}
            >
              <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <div>
                    <Title
                      level={3}
                      style={{
                        color: "#1e293b",
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        fontWeight: 700,
                        fontSize: "24px",
                      }}
                    >
                      <UserOutlined
                        style={{
                          color: modernTheme.colors.primary,
                          fontSize: "24px",
                        }}
                      />
                      Danh sách học sinh khám sức khỏe
                    </Title>
                    <Text
                      style={{
                        color: "#64748b",
                        marginTop: "8px",
                        fontSize: "16px",
                      }}
                    >
                      Hiển thị {filteredStudents.length} / {statistics.total}{" "}
                      học sinh
                    </Text>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <Space
                    size="middle"
                    style={{ width: "100%", justifyContent: "flex-end" }}
                  >
                    <Select
                      placeholder="Lọc theo trạng thái"
                      value={statusFilter}
                      onChange={setStatusFilter}
                      style={{ width: 180 }}
                      suffixIcon={<FilterOutlined />}
                    >
                      <Option value="all">Tất cả</Option>
                      <Option value="examined">Đã khám</Option>
                      <Option value="pending">Chưa khám</Option>
                      <Option value="counseling">Cần tư vấn</Option>
                      <Option value="normal">Bình thường</Option>
                    </Select>
                    <Input
                      placeholder="Tìm kiếm học sinh..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: 280 }}
                    />
                  </Space>
                </Col>
              </Row>
            </div>

            {/* Enhanced Table */}
            <div style={{ overflow: "hidden" }}>
              <Table
                columns={columns}
                dataSource={filteredStudents}
                rowKey="id"
                loading={loadingStudentList}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => (
                    <span style={{ color: "#64748b", fontWeight: 500 }}>
                      Hiển thị {range[0]}-{range[1]} trong tổng số {total} học
                      sinh
                    </span>
                  ),
                  style: { padding: "16px 24px" },
                }}
                scroll={{ x: 1400 }}
                locale={{
                  emptyText: (
                    <div style={{ padding: "80px 0" }}>
                      <Empty
                        image={
                          <div
                            style={{
                              fontSize: "80px",
                              color: "#d1d5db",
                              marginBottom: "24px",
                            }}
                          >
                            <FileTextOutlined />
                          </div>
                        }
                        description={
                          <div style={{ marginBottom: "32px" }}>
                            <Title
                              level={3}
                              style={{
                                color: "#64748b",
                                marginBottom: "12px",
                                fontWeight: 600,
                              }}
                            >
                              {searchTerm || statusFilter !== "all"
                                ? "Không tìm thấy học sinh phù hợp"
                                : "Chưa có học sinh nào trong danh sách"}
                            </Title>
                            <Text
                              style={{
                                color: "#9ca3af",
                                fontSize: "16px",
                                maxWidth: "400px",
                                display: "block",
                                margin: "0 auto",
                                lineHeight: "1.6",
                              }}
                            >
                              {searchTerm || statusFilter !== "all"
                                ? "Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm"
                                : "Danh sách học sinh sẽ hiển thị ở đây khi có dữ liệu"}
                            </Text>
                            {(searchTerm || statusFilter !== "all") && (
                              <div style={{ marginTop: "24px" }}>
                                <Space>
                                  <Button
                                    onClick={() => setSearchTerm("")}
                                    style={{
                                      height: "40px",
                                      borderRadius: modernTheme.borderRadius.lg,
                                      border: "1px solid #d1d5db",
                                      color: "#64748b",
                                    }}
                                  >
                                    Xóa từ khóa
                                  </Button>
                                  <Button
                                    onClick={() => setStatusFilter("all")}
                                    style={{
                                      height: "40px",
                                      borderRadius: modernTheme.borderRadius.lg,
                                      border: "1px solid #d1d5db",
                                      color: "#64748b",
                                    }}
                                  >
                                    Xóa bộ lọc
                                  </Button>
                                </Space>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </div>
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
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Update Modal */}
        <Modal
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "24px",
                fontWeight: 700,
                color: "white",
              }}
            >
              <EditOutlined style={{ color: "white", fontSize: "28px" }} />
              Cập nhật hồ sơ khám sức khỏe
            </div>
          }
          open={updateStudentRecModal}
          onCancel={() => setUpdateStudentRecModal(false)}
          footer={null}
          width={900}
          style={{ top: 20 }}
          styles={{
            header: {
              background: `linear-gradient(135deg, ${modernTheme.colors.primary} 0%, ${modernTheme.colors.secondary} 100%)`,
              borderRadius: `${modernTheme.borderRadius.xl} ${modernTheme.borderRadius.xl} 0 0`,
              padding: "24px 32px",
              border: "none",
            },
            body: {
              padding: "32px",
              maxHeight: "70vh",
              overflowY: "auto",
            },
            content: {
              borderRadius: modernTheme.borderRadius.xl,
              boxShadow: modernTheme.shadows.hover,
              overflow: "hidden",
            },
          }}
        >
          <Form
            layout="vertical"
            form={updateExaminationForm}
            onFinish={handleUpdateRecord}
            requiredMark={false}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {/* Student Information Section */}
            <div
              style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                borderRadius: modernTheme.borderRadius.lg,
                padding: "24px",
                marginBottom: "24px",
                border: "1px solid #e2e8f0",
              }}
            >
              <Title
                level={4}
                style={{
                  color: "#1e293b",
                  marginBottom: "20px",
                  fontWeight: 600,
                }}
              >
                📋 Thông tin học sinh
              </Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <UserOutlined
                          style={{
                            color: modernTheme.colors.primary,
                            marginRight: "8px",
                          }}
                        />
                        Họ và tên
                      </span>
                    }
                  >
                    <Input
                      readOnly
                      value={selectedStudent?.full_name}
                      style={{
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <BarcodeOutlined
                          style={{
                            color: modernTheme.colors.secondary,
                            marginRight: "8px",
                          }}
                        />
                        Mã học sinh
                      </span>
                    }
                  >
                    <Input
                      readOnly
                      value={selectedStudent?.student_code}
                      style={{
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <TeamOutlined
                          style={{
                            color: modernTheme.colors.success,
                            marginRight: "8px",
                          }}
                        />
                        Lớp
                      </span>
                    }
                  >
                    <Input
                      readOnly
                      value={selectedStudent?.class_name}
                      style={{
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <CalendarOutlined
                          style={{
                            color: modernTheme.colors.warning,
                            marginRight: "8px",
                          }}
                        />
                        Ngày sinh
                      </span>
                    }
                  >
                    <DatePicker
                      disabled
                      value={
                        selectedStudent?.date_of_birth
                          ? dayjs(selectedStudent.date_of_birth)
                          : null
                      }
                      style={{
                        width: "100%",
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                      }}
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Examination Details Section */}
            <div
              style={{
                background: "linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)",
                borderRadius: modernTheme.borderRadius.lg,
                padding: "24px",
                marginBottom: "24px",
                border: "1px solid #fbbf24",
              }}
            >
              <Title
                level={4}
                style={{
                  color: "#92400e",
                  marginBottom: "20px",
                  fontWeight: 600,
                }}
              >
                🩺 Thông tin khám
              </Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="checkup_id"
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <BarcodeOutlined
                          style={{
                            color: modernTheme.colors.info,
                            marginRight: "8px",
                          }}
                        />
                        Mã lịch khám
                      </span>
                    }
                  >
                    <Input
                      readOnly
                      style={{
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="checked_at"
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <CalculatorFilled
                          style={{
                            color: modernTheme.colors.info,
                            marginRight: "8px",
                          }}
                        />
                        Ngày khám
                      </span>
                    }
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày khám!" },
                    ]}
                  >
                    <DatePicker
                      showTime={{
                        defaultValue: dayjs(),
                        disabledHours: () =>
                          Array.from({ length: 24 }, (_, i) => i).filter(
                            (hour) => hour < 6 || hour > 17
                          ),
                      }}
                      placeholder="Chọn ngày và giờ khám"
                      style={{
                        width: "100%",
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                      }}
                      format="DD/MM/YYYY HH:mm"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Health Metrics Section */}
            <div
              style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                borderRadius: modernTheme.borderRadius.lg,
                padding: "24px",
                marginBottom: "24px",
                border: "1px solid #86efac",
              }}
            >
              <Title
                level={4}
                style={{
                  color: "#166534",
                  marginBottom: "20px",
                  fontWeight: 600,
                }}
              >
                📏 Chỉ số cơ thể
              </Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="height_cm"
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <MdHeight
                          style={{
                            color: modernTheme.colors.primary,
                            marginRight: "8px",
                          }}
                        />
                        Chiều cao (cm)
                      </span>
                    }
                    rules={[
                      { required: true, message: "Vui lòng nhập chiều cao!" },
                    ]}
                  >
                    <InputNumber
                      min={30}
                      max={250}
                      placeholder="Nhập chiều cao"
                      style={{
                        width: "100%",
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="weight_kg"
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <FaWeightScale
                          style={{
                            color: modernTheme.colors.primary,
                            marginRight: "8px",
                          }}
                        />
                        Cân nặng (kg)
                      </span>
                    }
                    rules={[
                      { required: true, message: "Vui lòng nhập cân nặng!" },
                    ]}
                  >
                    <InputNumber
                      min={5}
                      max={200}
                      placeholder="Nhập cân nặng"
                      style={{
                        width: "100%",
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="blood_pressure"
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <MdBloodtype
                          style={{ color: "#ef4444", marginRight: "8px" }}
                        />
                        Huyết áp
                      </span>
                    }
                  >
                    <Input
                      placeholder="Ví dụ: 120/80"
                      style={{
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Sensory Tests Section */}
            <div
              style={{
                background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                borderRadius: modernTheme.borderRadius.lg,
                padding: "24px",
                marginBottom: "24px",
                border: "1px solid #c4b5fd",
              }}
            >
              <Title
                level={4}
                style={{
                  color: "#6b21a8",
                  marginBottom: "20px",
                  fontWeight: 600,
                }}
              >
                👁️ Kiểm tra thị lực & thính lực
              </Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="vision_left"
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <EyeOutlined
                          style={{
                            color: modernTheme.colors.primary,
                            marginRight: "8px",
                          }}
                        />
                        Thị lực mắt trái
                      </span>
                    }
                  >
                    <InputNumber
                      min={0.1}
                      max={2.0}
                      step={0.1}
                      placeholder="Ví dụ: 1.0"
                      style={{
                        width: "100%",
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="vision_right"
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <EyeOutlined
                          style={{
                            color: modernTheme.colors.primary,
                            marginRight: "8px",
                          }}
                        />
                        Thị lực mắt phải
                      </span>
                    }
                  >
                    <InputNumber
                      min={0.1}
                      max={2.0}
                      step={0.1}
                      placeholder="Ví dụ: 1.0"
                      style={{
                        width: "100%",
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="hearing_left"
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <FaEarListen
                          style={{
                            color: modernTheme.colors.primary,
                            marginRight: "8px",
                          }}
                        />
                        Thính lực tai trái
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn thính lực tai trái!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn tình trạng thính lực"
                      style={{
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                      }}
                    >
                      <Option value="Bình thường">Bình thường</Option>
                      <Option value="Kém">Kém</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="hearing_right"
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <FaEarListen
                          style={{
                            color: modernTheme.colors.secondary,
                            marginRight: "8px",
                          }}
                        />
                        Thính lực tai phải
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn thính lực tai phải!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn tình trạng thính lực"
                      style={{
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                      }}
                    >
                      <Option value="Bình thường">Bình thường</Option>
                      <Option value="Kém">Kém</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Health Assessment Section */}
            <div
              style={{
                background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                borderRadius: modernTheme.borderRadius.lg,
                padding: "24px",
                marginBottom: "24px",
                border: "1px solid #fca5a5",
              }}
            >
              <Title
                level={4}
                style={{
                  color: "#991b1b",
                  marginBottom: "20px",
                  fontWeight: 600,
                }}
              >
                ⚠️ Đánh giá sức khỏe
              </Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="abnormal_signs"
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <MdOutlineDangerous
                          style={{
                            color: modernTheme.colors.error,
                            marginRight: "8px",
                          }}
                        />
                        Dấu hiệu bất thường
                      </span>
                    }
                  >
                    <Select
                      placeholder="Chọn tình trạng"
                      style={{
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                      }}
                    >
                      <Option value="Không">Không</Option>
                      <Option value="Có">Có</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="need_counseling"
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <AlertOutlined
                          style={{
                            color: modernTheme.colors.warning,
                            marginRight: "8px",
                          }}
                        />
                        Cần tư vấn thêm
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn trạng thái tư vấn!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn trạng thái"
                      style={{
                        borderRadius: modernTheme.borderRadius.md,
                        height: "44px",
                      }}
                    >
                      <Option value={false}>Không</Option>
                      <Option value={true}>Có</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="notes"
                    label={
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
                        <EditOutlined
                          style={{
                            color: modernTheme.colors.info,
                            marginRight: "8px",
                          }}
                        />
                        Ghi chú thêm
                      </span>
                    }
                    rules={[
                      {
                        max: 500,
                        message: "Ghi chú không được vượt quá 500 ký tự!",
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Nhập ghi chú bổ sung về tình trạng sức khỏe của học sinh..."
                      style={{
                        borderRadius: modernTheme.borderRadius.md,
                        fontSize: "14px",
                        border: "2px solid #f3f4f6",
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Hidden ID Field */}
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>

            {/* Form Actions */}
            <div style={{ textAlign: "right", marginTop: "32px" }}>
              <Space size="middle">
                <Button
                  onClick={() => setUpdateStudentRecModal(false)}
                  style={{
                    borderRadius: modernTheme.borderRadius.md,
                    height: "44px",
                    padding: "0 24px",
                    border: "1px solid #d1d5db",
                    color: "#6b7280",
                  }}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    borderRadius: modernTheme.borderRadius.md,
                    height: "44px",
                    padding: "0 24px",
                    background: `linear-gradient(135deg, ${modernTheme.colors.primary} 0%, ${modernTheme.colors.secondary} 100%)`,
                    border: "none",
                    boxShadow: modernTheme.shadows.card,
                    fontWeight: 600,
                  }}
                  className="hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Cập nhật hồ sơ
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>
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
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9;
          padding: 20px 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f0f9ff !important;
          transform: translateY(-2px);
        }
        .ant-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ant-card:hover {
          transform: translateY(-4px);
          box-shadow: ${modernTheme.shadows.hover} !important;
        }
        .ant-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ant-btn:hover {
          transform: translateY(-2px);
        }
        .ant-input,
        .ant-input-number,
        .ant-picker,
        .ant-select-selector {
          border-radius: ${modernTheme.borderRadius.md} !important;
          border: 2px solid #f3f4f6 !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ant-input:focus,
        .ant-input-focused,
        .ant-input-number:focus,
        .ant-input-number-focused,
        .ant-picker-focused,
        .ant-select-focused .ant-select-selector {
          border-color: ${modernTheme.colors.primary} !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        .ant-pagination-item {
          border-radius: ${modernTheme.borderRadius.md} !important;
          border: 1px solid #e5e7eb !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .ant-pagination-item:hover {
          border-color: ${modernTheme.colors.primary} !important;
          transform: translateY(-1px) !important;
        }
        .ant-pagination-item-active {
          background: ${modernTheme.colors.primary} !important;
          border-color: ${modernTheme.colors.primary} !important;
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
          border-color: ${modernTheme.colors.primary} !important;
          transform: translateY(-1px) !important;
        }
        .ant-modal-content {
          border-radius: ${modernTheme.borderRadius.xl} !important;
          box-shadow: ${modernTheme.shadows.hover} !important;
          overflow: hidden;
        }
        .ant-statistic-content {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ant-form-item-label > label {
          font-weight: 600;
          color: #374151;
        }
        .ant-empty-description {
          color: #6b7280;
        }
      `}</style>
    </motion.div>
  );
}
