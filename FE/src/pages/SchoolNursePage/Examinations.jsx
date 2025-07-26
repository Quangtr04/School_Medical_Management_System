/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Card,
  Modal,
  Form,
  DatePicker,
  Select,
  Tooltip,
  message,
  Tag,
  Empty,
  Row,
  Col,
  List,
  Descriptions,
  Badge,
  Statistic,
  Avatar,
  Progress,
  Divider,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  EyeOutlined,
  IdcardOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  SettingOutlined,
  UserOutlined,
  ManOutlined,
  WomanOutlined,
  TeamOutlined,
  HeartFilled,
  ExclamationCircleFilled,
  InfoCircleOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  TrophyOutlined,
  BellOutlined,
  CommentOutlined,
  BarcodeOutlined,
  CalculatorFilled,
} from "@ant-design/icons";
import moment from "moment";
import {
  format,
  parseISO,
  isWithinInterval,
  addDays,
  startOfDay,
} from "date-fns";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  createHealthExaminationSchedule,
  fetchAllHealthExaminations,
  updateHealthExaminationSchedule,
  clearHealthExaminationsError,
  clearHealthExaminationsSuccess,
  fetchHealthExaminationById,
  updateStundentRecord,
} from "../../redux/nurse/heathExaminations/heathExamination";
import { Typography } from "antd";
import { differenceInCalendarDays } from "date-fns";
import Stepper, { Step } from "../../Animation/Step/Stepper";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdBloodtype,
  MdHealthAndSafety,
  MdHeight,
  MdOutlineDangerous,
} from "react-icons/md";
import dayjs from "dayjs";
import { FaEarDeaf, FaEarListen, FaWeightScale } from "react-icons/fa6";

const { TextArea } = Input;
const { Option } = Select;
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

// Enhanced status configuration
const statusConfig = {
  APPROVED: {
    color: modernTheme.colors.success,
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    text: "Đã duyệt",
    icon: <CheckCircleOutlined />,
  },
  PENDING: {
    color: modernTheme.colors.warning,
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    text: "Đang chờ",
    icon: <ClockCircleOutlined />,
  },
  DECLINED: {
    color: modernTheme.colors.error,
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
    text: "Đã từ chối",
    icon: <ExclamationCircleFilled />,
  },
};

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

export default function Examination() {
  // Redux hooks
  const dispatch = useDispatch();
  const examinations = useSelector((state) => state.examination?.records || []);
  const loading = useSelector((state) => state.examination?.loading || false);
  const error = useSelector((state) => state.examination?.error || null);
  const success = useSelector((state) => state.examination?.success || false);

  // State management
  const [approveStudentDetail, setApproveStudentDetail] = useState(null);
  const [approveStudentDetailModal, setApproveStudentDetailModal] =
    useState(false);

  const [isStudentListModalVisible, setIsStudentListModalVisible] =
    useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [yearFilter, setYearFilter] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentExamination, setCurrentExamination] = useState(null);
  const [approvedStudent, setApprovedStudents] = useState(null);
  const [selectedExaminationDetail, setSelectedExaminationDetail] =
    useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const [form] = Form.useForm();
  const [formUpdateStudentRecord] = Form.useForm();
  // Memoized calculations
  const stats = useMemo(() => {
    if (!Array.isArray(examinations)) {
      return {
        total: 0,
        approved: 0,
        pending: 0,
        declined: 0,
        completionRate: 0,
      };
    }

    const total = examinations.length;
    const approved = examinations.filter(
      (item) => item?.approval_status === "APPROVED"
    ).length;
    const pending = examinations.filter(
      (item) => item?.approval_status === "PENDING"
    ).length;
    const declined = examinations.filter(
      (item) => item?.approval_status === "DECLINED"
    ).length;
    const completionRate =
      total > 0 ? Math.round(((approved + declined) / total) * 100) : 0;

    return { total, approved, pending, declined, completionRate };
  }, [examinations]);

  const yearOption = useMemo(() => {
    if (!Array.isArray(examinations)) return [];
    return Array.from(
      new Set(
        examinations
          .map((ex) =>
            ex?.scheduled_date ? dayjs(ex.scheduled_date).format("YYYY") : null
          )
          .filter(Boolean)
      )
    );
  }, [examinations]);

  const upcomingExaminations = useMemo(() => {
    if (!Array.isArray(examinations)) return [];
    const today = startOfDay(new Date());
    return examinations.filter((item) => {
      if (
        !item ||
        !item.scheduled_date ||
        item.approval_status !== "APPROVED"
      ) {
        return false;
      }
      try {
        const parsedDate = parseISO(item.scheduled_date);
        return isWithinInterval(parsedDate, {
          start: today,
          end: addDays(today, 14),
        });
      } catch (error) {
        toast.error(error.message);
        return false;
      }
    });
  }, [examinations]);

  const classOptions = useMemo(() => {
    return [1, 2, 3, 4, 5].map((classNumber) => ({
      label: `Lớp ${classNumber}`,
      value: classNumber,
    }));
  }, []);

  const filteredExaminations = useMemo(() => {
    if (!Array.isArray(examinations)) return [];

    const search = searchQuery.trim().toLowerCase();
    const searchStatus = statusFilter?.trim().toLowerCase();
    const searchClass = classFilter;

    return examinations.filter((item) => {
      if (!item) return false;

      const matchesSearch =
        !search || (item.title && item.title.toLowerCase().includes(search));
      const matchesStatus =
        !searchStatus ||
        (item.approval_status &&
          item.approval_status.toLowerCase().includes(searchStatus));
      const matchesClass = !searchClass || item.class === searchClass;
      const matchesYear =
        !yearFilter ||
        (item.scheduled_date &&
          dayjs(item.scheduled_date).format("YYYY") === yearFilter);

      return matchesSearch && matchesStatus && matchesClass && matchesYear;
    });
  }, [examinations, searchQuery, statusFilter, classFilter, yearFilter]);

  // Event handlers
  const fetchExaminations = useCallback(async () => {
    try {
      await dispatch(fetchAllHealthExaminations());
    } catch (error) {
      console.error("Error fetching examinations:", error);
    }
  }, [dispatch]);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handleClassFilterChange = useCallback((value) => {
    setClassFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handleYearFilterChange = useCallback((value) => {
    if (value) {
      if (Number.parseInt(value) >= 2000 && Number.parseInt(value) <= 2030) {
        setYearFilter(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
      }
    } else {
      setYearFilter("");
    }
  }, []);

  const showModal = useCallback(
    (record = null) => {
      setCurrentExamination(record);
      if (record) {
        form.setFieldsValue({
          title: record.title,
          description: record.description,
          scheduled_date: record?.scheduled_date
            ? dayjs(record.scheduled_date)
            : null,
          sponsor: record?.sponsor,
          className: record?.className,
        });
      } else {
        form.resetFields();
      }
      setIsModalVisible(true);
    },
    [form]
  );

  const handleViewApprovedStudentDetali = useCallback((record) => {
    setApproveStudentDetail(record);
    setApproveStudentDetailModal(true);
    setIsStudentListModalVisible(false);
  }, []);

  const handleFormSubmit = useCallback(
    async (values) => {
      try {
        const formattedValues = {
          ...values,
          scheduled_date: values.scheduled_date
            ? values.scheduled_date.format("YYYY-MM-DD")
            : null,
        };

        if (currentExamination) {
          await dispatch(
            updateHealthExaminationSchedule({
              id: currentExamination.id,
              scheduleData: formattedValues,
            })
          ).unwrap();
          toast.success("Cập nhật đơn khám thành công");
        } else {
          await dispatch(createHealthExaminationSchedule(formattedValues))
            .unwrap()
            .then(() => {
              toast.success("Tạo lịch khám sức khỏe thành công");
              dispatch(fetchAllHealthExaminations());
              form.resetFields();
              setIsModalVisible(false);
            });
        }
      } catch (error) {
        toast.error(error?.message || "Có lỗi xảy ra");
      }
    },
    [dispatch, currentExamination, form]
  );

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
    setCurrentExamination(null);
    form.resetFields();

    formUpdateStudentRecord.resetFields();
    setApproveStudentDetailModal(false);
  }, [form, formUpdateStudentRecord]);

  const handleUpdateStudentRecord = useCallback(
    async (values) => {
      console.log("Values từ form", values);

      if (!approveStudentDetail.student_id) {
        toast.error("Không tìm thấy học sinh để cập nhập");
        return;
      }
      const formData = {
        ...values,
        checked_at: dayjs(values.checked_at).isValid()
          ? dayjs(values.checked_at).format("YYYY-MM-DD")
          : null,

        // checked_at = val
      };
      console.log("Dữ liệu gửi đi:", formData);

      try {
        await dispatch(
          updateStundentRecord({
            id: values.id,
            values: formData, // <- sửa từ `valus` thành `values`
          })
        )
          .unwrap()
          .then(() => {
            toast.success("Cập nhật hồ sơ học sinh thành công");
            fetchExaminations();
            setApproveStudentDetailModal(false);
          });
      } catch (error) {
        toast.error(error.message);
      }
    },
    [dispatch, approveStudentDetail, fetchAllHealthExaminations]
  );

  const renderStatusTag = useCallback((status) => {
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <Tag
        icon={config.icon}
        style={{
          color: config.color,
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: modernTheme.borderRadius.md,
          padding: "6px 12px",
          fontWeight: "600",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {config.text}
      </Tag>
    );
  }, []);

  // Effects
  useEffect(() => {
    fetchExaminations();
  }, [fetchExaminations]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearHealthExaminationsError());
    }
    if (success) {
      dispatch(clearHealthExaminationsSuccess());
      fetchExaminations();
    }
  }, [error, success, dispatch, fetchExaminations]);

  useEffect(() => {
    if (approveStudentDetail && approveStudentDetailModal) {
      const validateValue = {
        ...approveStudentDetail,
        checked_at: approveStudentDetail.checked_at
          ? dayjs(approveStudentDetail.checked_at)
          : null,
      };
      formUpdateStudentRecord.setFieldsValue(validateValue);
    }
  }, [
    approveStudentDetail,
    approveStudentDetailModal,
    formUpdateStudentRecord,
  ]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        title: (
          <div className="flex items-center gap-2">
            <IdcardOutlined style={{ color: modernTheme.colors.info }} />
            <span className="font-semibold">Mã đơn khám</span>
          </div>
        ),
        dataIndex: "checkup_id",
        key: "checkup_id",
        width: 160,
        align: "center",
        render: (text, record) => (
          <div className="flex flex-col items-center gap-1">
            <Badge
              count={record.approval_status === "PENDING" ? "Mới" : ""}
              size="small"
              style={{ backgroundColor: modernTheme.colors.success }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
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
            </Badge>
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <FileTextOutlined style={{ color: modernTheme.colors.success }} />
            <span className="font-semibold">Tiêu đề đơn khám</span>
          </div>
        ),
        dataIndex: "title",
        key: "title",
        render: (text) => (
          <div className="flex items-center gap-2">
            <div
              style={{
                width: "4px",
                height: "24px",
                background: `linear-gradient(135deg, ${modernTheme.colors.success} 0%, #34d399 100%)`,
                borderRadius: "2px",
              }}
            />
            <Text strong style={{ color: "#1f2937", fontSize: "14px" }}>
              {text}
            </Text>
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <FileTextOutlined style={{ color: modernTheme.colors.warning }} />
            <span className="font-semibold">Mô tả</span>
          </div>
        ),
        dataIndex: "description",
        key: "description",
        ellipsis: true,
        render: (text) => (
          <Tooltip title={text}>
            <Text
              ellipsis
              style={{
                maxWidth: "200px",
                color: "#6b7280",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              {text}
            </Text>
          </Tooltip>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <CalendarOutlined style={{ color: "#ec4899" }} />
            <span className="font-semibold">Ngày khám</span>
          </div>
        ),
        dataIndex: "scheduled_date",
        key: "scheduled_date",
        align: "center",
        render: (date) => (
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
                style={{ color: "#ec4899", fontSize: "16px" }}
              />
            </div>
            <Text
              style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}
            >
              {date ? format(parseISO(date), "dd/MM/yyyy") : "N/A"}
            </Text>
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <CalendarOutlined style={{ color: "#8b5cf6" }} />
            <span className="font-semibold">Ngày tạo</span>
          </div>
        ),
        dataIndex: "created_at",
        key: "created_at",
        align: "center",
        render: (created_at) => (
          <div className="flex flex-col items-center gap-1">
            <div
              style={{
                background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
                padding: "6px",
                borderRadius: modernTheme.borderRadius.sm,
                border: "1px solid #c4b5fd",
              }}
            >
              <CalendarOutlined
                style={{ color: "#8b5cf6", fontSize: "16px" }}
              />
            </div>
            <Text
              style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}
            >
              {created_at ? dayjs(created_at).format("DD/MM/YYYY") : "N/A"}
            </Text>
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <CheckCircleOutlined style={{ color: "#06b6d4" }} />
            <span className="font-semibold">Trạng thái</span>
          </div>
        ),
        dataIndex: "approval_status",
        key: "approval_status",
        align: "center",
        render: (status) => (
          <div className="flex justify-center">{renderStatusTag(status)}</div>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <DollarCircleOutlined style={{ color: "#f97316" }} />
            <span className="font-semibold">Nhà tài trợ</span>
          </div>
        ),
        dataIndex: "sponsor",
        key: "sponsor",
        render: (text) => (
          <div className="flex items-center gap-2">
            <TrophyOutlined style={{ color: "#f97316", fontSize: "14px" }} />
            <Text
              style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}
            >
              {text}
            </Text>
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <SettingOutlined style={{ color: "#6b7280" }} />
            <span className="font-semibold">Hành động</span>
          </div>
        ),
        key: "actions",
        align: "center",
        render: (_, record) => (
          <Space size="small">
            <Tooltip title="Xem danh sách học sinh">
              <Button
                type="primary"
                icon={<EyeOutlined style={{ fontSize: "20px" }} />}
                size="lg"
                style={{
                  borderRadius: "4px", // 👈 góc vuông
                  background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                }}
                onClick={async () => {
                  if (record.approval_status === "APPROVED") {
                    try {
                      const result = await dispatch(
                        fetchHealthExaminationById(record.checkup_id)
                      ).unwrap();
                      setApprovedStudents(result);
                      setIsStudentListModalVisible(true);
                      console.log(result);
                    } catch (err) {
                      toast.error(
                        err?.message || "Tải danh sách học sinh thất bại."
                      );
                    }
                  } else if (record.approval_status === "PENDING") {
                    toast.warning("Đơn khám này chưa được duyệt.");
                  } else {
                    toast.error("Đơn khám này này đã bị từ chối");
                  }
                }}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [renderStatusTag, dispatch]
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
                  <MdHealthAndSafety
                    style={{ fontSize: "48px", color: "white" }}
                  />
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
                    Quản lý khám sức khỏe
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
                    Theo dõi và quản lý các đợt khám sức khỏe định kỳ cho học
                    sinh
                  </Text>
                </div>
              </div>
            </Col>
            <Col>
              <Space size="middle">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                  size="large"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    borderColor: "rgba(255,255,255,0.3)",
                    borderRadius: modernTheme.borderRadius.md,
                    height: "48px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    fontWeight: "600",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 8px 32px rgba(255,255,255,0.2)",
                  }}
                >
                  Tạo đơn khám mới
                </Button>
              </Space>
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
                        Tổng đơn khám
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
                        <FileTextOutlined
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
                        Đang chờ duyệt
                      </span>
                    }
                    value={stats.pending}
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
                        <ClockCircleOutlined
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
                        Đã duyệt
                      </span>
                    }
                    value={stats.approved}
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
                        <CheckCircleOutlined
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
          </Row>
        </motion.div>

        {/* Enhanced Upcoming Examinations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      borderRadius: modernTheme.borderRadius.md,
                      padding: "12px",
                      boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <CalendarOutlined
                      style={{ color: "white", fontSize: "24px" }}
                    />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#1f2937",
                      }}
                    >
                      Lịch khám sắp tới
                    </span>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        marginTop: "2px",
                      }}
                    >
                      Các đợt khám trong 14 ngày tới
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    count={upcomingExaminations.length}
                    style={{
                      backgroundColor: modernTheme.colors.success,
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                    }}
                  />
                  {upcomingExaminations.length > 0 && (
                    <Button
                      type="text"
                      icon={<BellOutlined />}
                      style={{ color: modernTheme.colors.warning }}
                    >
                      Thông báo
                    </Button>
                  )}
                </div>
              </div>
            }
            style={{ ...modernCardStyle, marginBottom: "32px" }}
            bodyStyle={{ padding: "24px" }}
          >
            {upcomingExaminations.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={upcomingExaminations}
                renderItem={(item, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <List.Item
                      style={{
                        padding: "20px",
                        marginBottom: "16px",
                        background:
                          "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
                        borderRadius: modernTheme.borderRadius.lg,
                        border: "1px solid #bbf7d0",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.1)",
                        transition: "all 0.3s ease",
                      }}
                      actions={[
                        <Button
                          type="primary"
                          ghost
                          onClick={() => {
                            setSelectedExaminationDetail(item);
                            setIsDetailModalVisible(true);
                          }}
                          style={{
                            borderRadius: modernTheme.borderRadius.md,
                            borderColor: modernTheme.colors.success,
                            color: modernTheme.colors.success,
                            fontWeight: "600",
                          }}
                          key="view-details"
                        >
                          Xem chi tiết
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            size={56}
                            style={{
                              background:
                                "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
                            }}
                            icon={<HeartFilled />}
                          />
                        }
                        title={
                          <div className="flex items-center gap-2">
                            <Text
                              strong
                              style={{ fontSize: "16px", color: "#1f2937" }}
                            >
                              {item.title}
                            </Text>
                            <Tag
                              color="success"
                              style={{
                                borderRadius: modernTheme.borderRadius.sm,
                                fontWeight: "600",
                              }}
                            >
                              Lớp {item.class}
                            </Tag>
                          </div>
                        }
                        description={
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CalendarOutlined
                                style={{ color: modernTheme.colors.success }}
                              />
                              <Text
                                style={{ color: "#6b7280", fontSize: "14px" }}
                              >
                                Ngày khám:{" "}
                                <Text
                                  strong
                                  style={{ color: modernTheme.colors.success }}
                                >
                                  {item.scheduled_date
                                    ? (() => {
                                        try {
                                          const today = new Date();
                                          const days = differenceInCalendarDays(
                                            parseISO(item.scheduled_date),
                                            today
                                          );
                                          return `${format(
                                            parseISO(item.scheduled_date),
                                            "dd/MM/yyyy"
                                          )} ${
                                            days === 0
                                              ? "(Hôm nay)"
                                              : `(${days} ngày nữa)`
                                          }`;
                                        } catch (error) {
                                          return "N/A";
                                        }
                                      })()
                                    : "N/A"}
                                </Text>
                              </Text>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrophyOutlined style={{ color: "#f97316" }} />
                              <Text
                                style={{ color: "#6b7280", fontSize: "14px" }}
                              >
                                Nhà tài trợ: <Text strong>{item.sponsor}</Text>
                              </Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  </motion.div>
                )}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                    borderRadius: "50%",
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <CalendarOutlined
                    style={{ fontSize: "32px", color: "#9ca3af" }}
                  />
                </div>
                <Text style={{ color: "#6b7280", fontSize: "16px" }}>
                  Không có lịch khám sắp tới
                </Text>
                <div style={{ marginTop: "8px" }}>
                  <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                    Tất cả các đợt khám đã được lên lịch hoặc hoàn thành
                  </Text>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Enhanced Main Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
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
                    Danh sách đơn khám
                  </Title>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      marginTop: "4px",
                    }}
                  >
                    Quản lý và theo dõi tất cả các đơn khám sức khỏe
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
                    {filteredExaminations.length} kết quả
                  </Text>
                </div>
              </div>

              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Input
                    placeholder="Tìm kiếm theo tiêu đề, mô tả..."
                    style={{
                      borderRadius: modernTheme.borderRadius.lg,
                      height: "48px",
                      background: "#f9fafb",
                      border: "2px solid #f3f4f6",
                      fontSize: "14px",
                    }}
                    onPressEnter={(e) => handleSearch(e.target.value)}
                    onBlur={(e) => handleSearch(e.target.value)}
                  />
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Trạng thái"
                    onChange={handleStatusFilterChange}
                    allowClear
                    style={{ width: "100%", height: "48px" }}
                    value={statusFilter}
                  >
                    <Option value="PENDING">Đang chờ</Option>
                    <Option value="APPROVED">Đã duyệt</Option>
                    <Option value="DECLINED">Đã từ chối</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Lớp"
                    onChange={handleClassFilterChange}
                    allowClear
                    style={{ width: "100%", height: "48px" }}
                    value={classFilter}
                  >
                    {classOptions.map((cls) => (
                      <Option key={cls.value} value={cls.value}>
                        {cls.label}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Năm"
                    allowClear
                    style={{ width: "100%", height: "48px" }}
                    onChange={handleYearFilterChange}
                    value={yearFilter || undefined}
                    showSearch
                    optionFilterProp="children"
                  >
                    {yearOption.map((year) => (
                      <Option key={year} value={year}>
                        Năm {year}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </div>

            {/* Enhanced Table */}
            <div style={{ padding: "32px" }}>
              <Stepper
                onStepChange={(step) => {
                  setPagination((prev) => ({ ...prev, current: step }));
                }}
                backButtonText="Trang trước"
                nextButtonText="Trang sau"
                disableStepIndicators={true}
                currentStep={pagination.current}
              >
                {filteredExaminations.length === 0 ? (
                  <Step key="empty">
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
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
                        <FileTextOutlined
                          style={{ fontSize: "40px", color: "#9ca3af" }}
                        />
                      </div>
                      <Title
                        level={4}
                        style={{ color: "#6b7280", marginBottom: "8px" }}
                      >
                        Không tìm thấy đơn khám nào
                      </Title>
                      <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                        Thử thay đổi bộ lọc hoặc tạo đơn khám mới
                      </Text>
                    </div>
                  </Step>
                ) : (
                  Array.from({
                    length: Math.ceil(
                      filteredExaminations.length / pagination.pageSize
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
                            dataSource={filteredExaminations.slice(
                              idx * pagination.pageSize,
                              (idx + 1) * pagination.pageSize
                            )}
                            rowKey="checkup_id"
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
                                  description="Không tìm thấy đơn khám sức khỏe nào"
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
            </div>
          </Card>
        </motion.div>

        {/* Keep all existing modals with enhanced styling... */}
        {/* Enhanced Create/Edit Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div
                style={{
                  background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                  borderRadius: modernTheme.borderRadius.md,
                  padding: "12px",
                  boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
                }}
              >
                <FileTextOutlined
                  style={{ color: "white", fontSize: "20px" }}
                />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                >
                  {currentExamination
                    ? "Chỉnh sửa đơn khám"
                    : "Tạo đơn khám mới"}
                </span>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  {currentExamination
                    ? "Cập nhật thông tin đơn khám"
                    : "Tạo đơn khám sức khỏe định kỳ"}
                </div>
              </div>
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={800}
          style={{ top: 20 }}
          styles={{
            content: {
              borderRadius: modernTheme.borderRadius.xl,
              boxShadow: modernTheme.shadows.card,
            },
          }}
        >
          <Divider style={{ margin: "24px 0" }} />
          <Form
            onFinish={handleFormSubmit}
            form={form}
            layout="vertical"
            style={{ marginTop: "24px" }}
          >
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="title"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <FileTextOutlined
                        style={{ color: modernTheme.colors.info }}
                      />
                      Tiêu đề đơn khám
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập tiêu đề!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập tiêu đề đơn khám sức khỏe"
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <EditOutlined
                        style={{ color: modernTheme.colors.success }}
                      />
                      Mô tả chi tiết
                    </span>
                  }
                  rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Mô tả chi tiết về nội dung và mục đích của đợt khám sức khỏe"
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="scheduled_date"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <CalendarOutlined style={{ color: "#ec4899" }} />
                      Ngày khám
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày khám!" },
                  ]}
                >
                  <DatePicker
                    style={{
                      width: "100%",
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
                    }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày thực hiện khám"
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="className"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <TeamOutlined style={{ color: "#8b5cf6" }} />
                      Lớp áp dụng
                    </span>
                  }
                  rules={[{ required: true, message: "Vui lòng chọn lớp!" }]}
                >
                  <Select
                    placeholder="Chọn lớp học áp dụng"
                    style={{
                      height: "48px",
                      fontSize: "14px",
                    }}
                  >
                    {classOptions.map((cls) => (
                      <Option key={cls.value} value={cls.value}>
                        {cls.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="sponsor"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <DollarCircleOutlined style={{ color: "#f97316" }} />
                      Nhà tài trợ
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập nhà tài trợ!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập tên tổ chức hoặc cá nhân tài trợ"
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Divider style={{ margin: "32px 0" }} />
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleCancel}
                size="large"
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  fontWeight: "600",
                  border: "2px solid #f3f4f6",
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{
                  background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  paddingLeft: "32px",
                  paddingRight: "32px",
                  fontWeight: "700",
                  border: "none",
                  boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
                }}
              >
                {currentExamination ? "Cập nhật đơn khám" : "Tạo đơn khám mới"}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Keep existing Student List Modal and Detail Modal with similar enhancements... */}
        {/* Student List Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div
                style={{
                  background: `linear-gradient(135deg, ${modernTheme.colors.success} 0%, #34d399 100%)`,
                  borderRadius: modernTheme.borderRadius.md,
                  padding: "12px",
                  boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
                }}
              >
                <TeamOutlined style={{ color: "white", fontSize: "20px" }} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                >
                  Danh sách học sinh
                </span>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  Học sinh tham gia đợt khám sức khỏe
                </div>
              </div>
            </div>
          }
          open={isStudentListModalVisible}
          onCancel={() => setIsStudentListModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setIsStudentListModalVisible(false)}
              size="large"
              style={{
                borderRadius: modernTheme.borderRadius.md,
                height: "48px",
                paddingLeft: "24px",
                paddingRight: "24px",
                fontWeight: "600",
              }}
            >
              Đóng
            </Button>,
          ]}
          width={1000}
          styles={{
            content: {
              borderRadius: modernTheme.borderRadius.xl,
              boxShadow: modernTheme.shadows.card,
            },
          }}
        >
          {!approvedStudent || approvedStudent.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
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
                <TeamOutlined style={{ fontSize: "40px", color: "#9ca3af" }} />
              </div>
              <Title
                level={4}
                style={{ color: "#6b7280", marginBottom: "8px" }}
              >
                Không có học sinh nào
              </Title>
              <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                Chưa có học sinh nào được phân công cho đợt khám này
              </Text>
            </div>
          ) : (
            <Table
              dataSource={approvedStudent}
              rowKey="id"
              pagination={false}
              style={{
                borderRadius: modernTheme.borderRadius.lg,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              columns={[
                {
                  title: (
                    <div className="flex items-center gap-2">
                      <IdcardOutlined style={{ color: "#06b6d4" }} />
                      <span className="font-semibold">Mã học sinh</span>
                    </div>
                  ),
                  dataIndex: "student_code",
                  key: "student_code",
                  render: (text) => (
                    <Text
                      code
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#06b6d4",
                      }}
                    >
                      {text}
                    </Text>
                  ),
                },
                {
                  title: (
                    <div className="flex items-center gap-2">
                      <UserOutlined style={{ color: "#8b5cf6" }} />
                      <span className="font-semibold">Họ và tên</span>
                    </div>
                  ),
                  dataIndex: "full_name",
                  key: "full_name",
                  render: (text) => (
                    <Text strong style={{ color: "#1f2937", fontSize: "14px" }}>
                      {text}
                    </Text>
                  ),
                },
                {
                  title: (
                    <div className="flex items-center gap-2">
                      <UserOutlined style={{ color: "#3b82f6" }} />
                      <span className="font-semibold">Giới tính</span>
                    </div>
                  ),
                  dataIndex: "gender",
                  key: "gender",
                  render: (gender) =>
                    gender === "Nam" ? (
                      <Tag
                        color="blue"
                        icon={<ManOutlined />}
                        style={{
                          borderRadius: modernTheme.borderRadius.sm,
                          fontWeight: "600",
                        }}
                      >
                        Nam
                      </Tag>
                    ) : (
                      <Tag
                        color="magenta"
                        icon={<WomanOutlined />}
                        style={{
                          borderRadius: modernTheme.borderRadius.sm,
                          fontWeight: "600",
                        }}
                      >
                        Nữ
                      </Tag>
                    ),
                },
                {
                  title: (
                    <div className="flex items-center gap-2">
                      <CalendarOutlined style={{ color: "#f59e0b" }} />
                      <span className="font-semibold">Ngày sinh</span>
                    </div>
                  ),
                  dataIndex: "date_of_birth",
                  key: "dob",
                  render: (dob) => {
                    try {
                      return dob ? format(parseISO(dob), "dd/MM/yyyy") : "N/A";
                    } catch (error) {
                      return "N/A";
                    }
                  },
                },
                {
                  title: (
                    <div className="flex items-center gap-2">
                      <TeamOutlined
                        style={{ color: modernTheme.colors.success }}
                      />
                      <span className="font-semibold">Lớp</span>
                    </div>
                  ),
                  dataIndex: "class_name",
                  key: "class_name",
                  render: (text) => (
                    <Tag
                      color="success"
                      style={{
                        borderRadius: modernTheme.borderRadius.sm,
                        fontWeight: "600",
                      }}
                    >
                      {text}
                    </Tag>
                  ),
                },
                {
                  title: (
                    <div className="flex items-center gap-2">
                      <EyeOutlined style={{ color: "#6366f1" }} />
                      <span className="font-semibold">Hành động</span>
                    </div>
                  ),
                  key: "action",
                  align: "center",
                  render: (_, record) => (
                    <Tooltip title="Xem chi tiết học sinh">
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="small"
                        style={{
                          borderRadius: modernTheme.borderRadius.md,
                          background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)`,
                          border: "none",
                          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                        }}
                        onClick={() => handleViewApprovedStudentDetali(record)}
                      />
                    </Tooltip>
                  ),
                },
              ]}
            />
          )}
        </Modal>

        {/* Enhanced Detail Modal */}
        <Modal
          title={null}
          open={isDetailModalVisible}
          onCancel={() => {
            setIsDetailModalVisible(false);
            setSelectedExaminationDetail(null);
          }}
          footer={[
            <Button
              key="close"
              type="primary"
              size="large"
              style={{
                background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                borderRadius: modernTheme.borderRadius.md,
                height: "48px",
                paddingLeft: "32px",
                paddingRight: "32px",
                fontWeight: "700",
                border: "none",
                boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
              }}
              onClick={() => {
                setIsDetailModalVisible(false);
                setSelectedExaminationDetail(null);
              }}
            >
              Đóng
            </Button>,
          ]}
          width={800}
          style={{ top: 20 }}
          styles={{
            content: {
              borderRadius: modernTheme.borderRadius.xl,
              boxShadow: modernTheme.shadows.card,
            },
          }}
        >
          {selectedExaminationDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {/* Enhanced Header */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                  borderRadius: modernTheme.borderRadius.lg,
                  padding: "32px",
                  color: "white",
                  marginBottom: "32px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Background decoration */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "120px",
                    height: "120px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                    transform: "translate(30%, -30%)",
                  }}
                />

                <div
                  className="flex items-center gap-4"
                  style={{ position: "relative", zIndex: 1 }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: modernTheme.borderRadius.lg,
                      padding: "16px",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <FileTextOutlined
                      style={{ fontSize: "32px", color: "white" }}
                    />
                  </div>
                  <div>
                    <Title
                      level={2}
                      style={{ color: "white", margin: 0, fontWeight: "800" }}
                    >
                      {selectedExaminationDetail.title}
                    </Title>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Mã đơn khám: {selectedExaminationDetail.checkup_id}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              {selectedExaminationDetail.scheduled_date && (
                <Alert
                  message="Thông tin lịch khám"
                  description={(() => {
                    try {
                      const today = new Date();
                      const scheduled = new Date(
                        selectedExaminationDetail.scheduled_date
                      );
                      if (
                        scheduled.getFullYear() === today.getFullYear() &&
                        scheduled.getMonth() === today.getMonth() &&
                        scheduled.getDate() === today.getDate()
                      ) {
                        return "Đã đến ngày khám - Cần thực hiện ngay hôm nay";
                      }
                      const days = differenceInCalendarDays(scheduled, today);
                      if (days >= 0 && days <= 30) {
                        return `Sắp diễn ra trong ${days} ngày - Cần chuẩn bị sẵn sàng`;
                      }
                      return "Lịch khám đã được lên kế hoạch";
                    } catch (error) {
                      return "Thông tin lịch khám";
                    }
                  })()}
                  type="info"
                  showIcon
                  style={{
                    borderRadius: modernTheme.borderRadius.lg,
                    marginBottom: "32px",
                    border: `1px solid ${modernTheme.colors.info}`,
                    background:
                      "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  }}
                />
              )}

              {/* Enhanced Details */}
              <Card
                style={{
                  borderRadius: modernTheme.borderRadius.lg,
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <Descriptions
                  title={
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        style={{
                          background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                          borderRadius: modernTheme.borderRadius.md,
                          padding: "8px",
                        }}
                      >
                        <InfoCircleOutlined
                          style={{ color: "white", fontSize: "16px" }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        Thông tin chi tiết
                      </span>
                    </div>
                  }
                  column={1}
                  labelStyle={{
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                  contentStyle={{
                    fontWeight: "500",
                    color: "#1f2937",
                    fontSize: "14px",
                  }}
                >
                  <Descriptions.Item label="Trạng thái">
                    {renderStatusTag(selectedExaminationDetail.approval_status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả chi tiết">
                    <Text style={{ lineHeight: "1.6" }}>
                      {selectedExaminationDetail.description}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày khám">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined style={{ color: "#ec4899" }} />
                      <Text strong>
                        {selectedExaminationDetail.scheduled_date
                          ? (() => {
                              try {
                                return format(
                                  parseISO(
                                    selectedExaminationDetail.scheduled_date
                                  ),
                                  "dd/MM/yyyy"
                                );
                              } catch (error) {
                                return "N/A";
                              }
                            })()
                          : "N/A"}
                      </Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined style={{ color: "#8b5cf6" }} />
                      <Text>
                        {selectedExaminationDetail.created_at
                          ? (() => {
                              try {
                                return format(
                                  parseISO(
                                    selectedExaminationDetail.created_at
                                  ),
                                  "dd/MM/yyyy"
                                );
                              } catch (error) {
                                return "N/A";
                              }
                            })()
                          : "N/A"}
                      </Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nhà tài trợ">
                    <div className="flex items-center gap-2">
                      <TrophyOutlined style={{ color: "#f97316" }} />
                      <Text strong>{selectedExaminationDetail.sponsor}</Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Lớp áp dụng">
                    <Tag
                      color="success"
                      style={{
                        borderRadius: modernTheme.borderRadius.sm,
                        fontWeight: "600",
                        fontSize: "14px",
                        padding: "4px 12px",
                      }}
                    >
                      Lớp {selectedExaminationDetail.class}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </motion.div>
          )}
        </Modal>

        {/* Student Detail Modal */}
        <Modal
          open={approveStudentDetailModal}
          title="Thông tin chi tiết học sinh"
          onCancel={() => {
            setApproveStudentDetailModal(false);
            setApproveStudentDetail(null);
          }}
          centered
          footer={[
            <Button
              key="close"
              type="primary"
              size="large"
              style={{
                background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                borderRadius: modernTheme.borderRadius.md,
                height: "48px",
                paddingLeft: "32px",
                paddingRight: "32px",
                fontWeight: "700",
                border: "none",
                boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
              }}
              onClick={() => {
                setApproveStudentDetailModal(false);
                setApproveStudentDetail(null);
              }}
            >
              Đóng
            </Button>,

            <Button
              key="submit"
              type="primary"
              onClick={() => formUpdateStudentRecord.submit()}
              loading={loading}
              size="large"
              style={{
                background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                borderRadius: modernTheme.borderRadius.md,
                height: "48px",
                paddingLeft: "32px",
                paddingRight: "32px",
                fontWeight: "700",
                border: "none",
                boxShadow: "0 8px 32px rgba(19, 194, 194, 0.3)",
              }}
            >
              Cập nhật
            </Button>,
          ]}
          width={800}
          style={{ top: 20 }}
          styles={{
            content: {
              borderRadius: modernTheme.borderRadius.xl,
              boxShadow: modernTheme.shadows.card,
            },
          }}
        >
          <Divider style={{ margin: "24px 0" }} />

          <Form
            layout="vertical"
            form={formUpdateStudentRecord}
            style={{ marginTop: "24px" }}
            onFinish={handleUpdateStudentRecord}
            onCancel={() => handleCancel()}
            requiredMark={false}
          >
            {/* thông tin ko đc chỉnh sửa */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <UserOutlined
                        style={{ color: modernTheme.colors.primary }}
                      />
                      Họ và tên học sinh
                    </span>
                  }
                >
                  <Input
                    readOnly
                    value={approveStudentDetail?.full_name}
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      backgroundColor: "#f9fafb",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="student_id"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <BarcodeOutlined
                        style={{ color: modernTheme.colors.secondary }}
                      />
                      Mã học sinh
                    </span>
                  }
                >
                  <Input
                    readOnly
                    value={approveStudentDetail?.student_code}
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      backgroundColor: "#f9fafb",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <TeamOutlined
                        style={{ color: modernTheme.colors.success }}
                      />
                      Lớp
                    </span>
                  }
                >
                  <Input
                    readOnly
                    value={approveStudentDetail?.class_name}
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      backgroundColor: "#f9fafb",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <CalendarOutlined style={{ color: "#f59e0b" }} />
                      Ngày sinh
                    </span>
                  }
                >
                  <DatePicker
                    readOnly
                    value={
                      approveStudentDetail?.date_of_birth
                        ? dayjs(approveStudentDetail.date_of_birth)
                        : null
                    }
                    style={{
                      width: "100%",
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      backgroundColor: "#f9fafb",
                    }}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* checkup_id */}
            <Form.Item
              name="checkup_id"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <BarcodeOutlined style={{ color: "#06b6d4" }} />
                  Mã lịch khám
                </span>
              }
            >
              <Input
                readOnly
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  fontSize: "14px",
                  backgroundColor: "#f9fafb",
                }}
              />
            </Form.Item>

            <Form.Item
              name="checked_at"
              placeholder="Ngày khám"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <CalculatorFilled style={{ color: "#06b6d4" }} />
                  Ngày khám
                </span>
              }
              rules={[{ required: true, message: "Vui lòng chọn ngày khám!" }]}
            >
              <DatePicker
                value={
                  approveStudentDetail?.checked_at
                    ? dayjs(approveStudentDetail?.checked_at)
                    : null
                }
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
                showTime={{ defaultValue: dayjs() }} // ✅ Tự động chọn giờ hiện tại
                placeholder="Chọn ngày khám"
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  fontSize: "14px",
                  width: "100vh",
                }}
                format="YYYY-MM-DD HH:mm"
              ></DatePicker>
            </Form.Item>
            {/* các triệu chứng */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="hearing_left"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <FaEarListen
                        style={{ color: modernTheme.colors.primary }}
                      />
                      Thính lực trái
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn thính lực trái!",
                    },
                  ]}
                >
                  <Select
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      backgroundColor: "#f9fafb",
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
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <FaEarListen
                        style={{ color: modernTheme.colors.secondary }}
                      />
                      Thính lực phải
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn thính lực trái!",
                    },
                  ]}
                >
                  <Select
                    type="string"
                    value={approveStudentDetail?.hearing_right || "Chưa khám"}
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    <Option value="Bình thường">Bình thường</Option>
                    <Option value="Kém">Kém</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="abnormal_signs"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <MdOutlineDangerous
                        style={{ color: modernTheme.colors.success }}
                      />
                      Dấu hiệu bất thường
                    </span>
                  }
                  rules={[{ max: 255, message: "Tối đa 255 ký tự!" }]}
                >
                  <Select
                    value={approveStudentDetail?.abnormal_signs || "Chưa khám"}
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                    }}
                  >
                    <Option value={"Có"}>Có</Option>
                    <Option value={"Không"}>Không</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="blood_pressure"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <MdBloodtype style={{ color: "red" }} />
                      Huyết áp
                    </span>
                  }
                  // rules={[
                  //   { required: true, message: "Vui lòng nhập huyết áp!" },
                  // ]}
                >
                  <Input
                    value={approveStudentDetail?.blood_pressure}
                    style={{
                      width: "100%",
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* weight-height */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="height_cm"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <MdHeight style={{ color: modernTheme.colors.primary }} />
                      Chiều cao
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Chiều cao hợp lệ từ 30 - 250 cm",
                    },
                  ]}
                >
                  <Input
                    type="number"
                    min={30}
                    max={200}
                    value={approveStudentDetail?.height_cm}
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="weight_kg"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <FaWeightScale
                        style={{ color: modernTheme.colors.primary }}
                      />
                      Cân nặng
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Cân nặng hợp lệ từ 5 - 200 kg",
                    },
                  ]}
                >
                  <Input
                    type="number"
                    min={5}
                    max={200}
                    value={approveStudentDetail?.weight_kg}
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* vision */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="vision_left"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <EyeOutlined
                        style={{ color: modernTheme.colors.primary }}
                      />
                      Thị lực trái
                    </span>
                  }
                >
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    value={approveStudentDetail?.vision_left}
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="vision_right"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <EyeOutlined
                        style={{ color: modernTheme.colors.primary }}
                      />
                      Thị lực phải
                    </span>
                  }
                >
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    value={approveStudentDetail?.vision_right}
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* need_counseling */}
            <Form.Item
              name="need_counseling"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <EyeOutlined style={{ color: "#f97316" }} />
                  Cần theo dõi thêm
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn trạng thái theo dõi!",
                },
              ]}
            >
              <Select
                value={approveStudentDetail?.need_counseling}
                placeholder="Chọn trạng thái"
                style={{
                  height: "48px",
                  fontSize: "14px",
                }}
              >
                <Option value={true}>Có</Option>
                <Option value={false}>Không</Option>
              </Select>
            </Form.Item>
            {/* notes */}
            <Form.Item
              name="notes"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <EditOutlined style={{ color: "#06b6d4" }} />
                  Ghi chú
                </span>
              }
              rules={[{ max: 500, message: "Không nhập quá 500 ký tự" }]}
            >
              <TextArea
                rows={3}
                value={approveStudentDetail?.notes}
                placeholder="Thêm ghi chú khác"
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  fontSize: "14px",
                  border: "2px solid #f3f4f6",
                }}
              />
            </Form.Item>
            {/* HiddenID */}
            <Form.Item
              name="id"
              value={approveStudentDetail?.id}
              style={{ padding: 0 }}
            ></Form.Item>
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
        .ant-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
      `}</style>
    </motion.div>
  );
}
