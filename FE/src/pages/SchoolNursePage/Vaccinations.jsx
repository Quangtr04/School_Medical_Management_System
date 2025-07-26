"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Select,
  Tag,
  Modal,
  Form,
  message,
  Typography,
  Tooltip,
  Empty,
  Card,
  Row,
  Col,
  DatePicker,
  List,
  InputNumber,
  Statistic,
  Badge,
  Progress,
  Avatar,
  Alert,
  Divider,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  CalendarOutlined,
  BarcodeOutlined,
  ContainerOutlined,
  CommentOutlined,
  ScheduleOutlined,
  TeamOutlined,
  EyeOutlined,
  ExclamationCircleFilled,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  BellOutlined,
  TrophyOutlined,
  HeartFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import {
  format,
  parseISO,
  isWithinInterval,
  isAfter,
  isToday,
  startOfDay,
  addDays,
  differenceInCalendarDays,
} from "date-fns";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllVaccineCampaigns,
  createVaccinationCampaign,
  updateStudentVaccineDetail,
  fetchApprovedStudentsByCampaignId,
} from "../../redux/nurse/vaccinations/vaccinationSlice";
import { toast } from "react-toastify";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import Stepper, { Step } from "../../Animation/Step/Stepper";
import { TbVaccine } from "react-icons/tb";
import { FaMagnifyingGlass } from "react-icons/fa6";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

// Modern design system
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
  boxShadow: `0 20px 60px rgba(22, 119, 255, 0.4)`,
  position: "relative",
  overflow: "hidden",
};

// Enhanced status configuration

const statusConfig = {
  APPROVED: {
    color: modernTheme.colors.success,
    bgColor: "#f6ffed",
    borderColor: "#b7eb8f",
    text: "Đã duyệt",
    icon: <CheckCircleOutlined />,
  },
  PENDING: {
    color: modernTheme.colors.warning,
    bgColor: "#fff7e6",
    borderColor: "#ffd666",
    text: "Đang chờ",
    icon: <ClockCircleOutlined />,
  },
  REJECTED: {
    color: modernTheme.colors.error,
    bgColor: "#fff2f0",
    borderColor: "#ffadd2",
    text: "Đã từ chối",
    icon: <ExclamationCircleFilled />,
  },
};

export default function VaccinationEnhanced() {
  const dispatch = useDispatch();
  const { campaigns, loading } = useSelector((state) => state.vaccination);
  const token = localStorage.getItem("accessToken");

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [classFilter, setClassFilter] = useState(null);
  const [yearFilter, setYearFilter] = useState("");

  const [isCreateNewScheduleModalVisible, setCreateNewScheduleModal] =
    useState(false);
  const [isStudentListModalVisible, setIsStudentListModalVisible] =
    useState(false);
  const [isViewStudentModalVisible, setIsViewStudentModalVisible] =
    useState(false);

  const [approvedStudents, setApprovedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [selectedUpcomingExamination, setSelectedUpcomingExamination] =
    useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const [formCreateNewSchedule] = Form.useForm();
  const [formUpdateStudentDetail] = Form.useForm();

  const user = useSelector((state) => state.auth.user);

  // Memoized calculations
  const stats = useMemo(() => {
    if (!Array.isArray(campaigns)) {
      return {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        completionRate: 0,
      };
    }

    const total = campaigns.length;
    const approved = campaigns.filter(
      (item) => item?.approval_status === "APPROVED"
    ).length;
    const pending = campaigns.filter(
      (item) => item?.approval_status === "PENDING"
    ).length;
    const rejected = campaigns.filter(
      (item) => item?.approval_status === "REJECTED"
    ).length;
    const completionRate =
      total > 0 ? Math.round(((approved + rejected) / total) * 100) : 0;

    return { total, approved, pending, rejected, completionRate };
  }, [campaigns]);

  const yearOptions = useMemo(() => {
    if (!Array.isArray(campaigns)) return [];
    return Array.from(
      new Set(
        campaigns
          .map((camp) =>
            camp?.scheduled_date
              ? moment(camp.scheduled_date).format("YYYY")
              : null
          )
          .filter(Boolean)
      )
    );
  }, [campaigns]);

  const upcomingVaccinations = useMemo(() => {
    if (!Array.isArray(campaigns)) return [];
    const today = startOfDay(new Date());
    return campaigns.filter((item) => {
      if (!item || !item.scheduled_date || item.approval_status !== "APPROVED")
        return false;
      try {
        const parsedDate = parseISO(item.scheduled_date);
        return (
          isAfter(parsedDate, today) ||
          isToday(parsedDate) ||
          isWithinInterval(parsedDate, { start: today, end: addDays(today, 7) })
        );
      } catch (error) {
        return false;
      }
    });
  }, [campaigns]);

  const classOptions = useMemo(() => {
    return [1, 2, 3, 4, 5].map((classNumber) => ({
      label: `Lớp ${classNumber}`,
      value: classNumber,
    }));
  }, []);

  const filteredCampaigns = useMemo(() => {
    if (!Array.isArray(campaigns)) return [];

    const searchTitle = searchQuery.trim().toLowerCase();
    const searchStatus = statusFilter?.trim().toLowerCase();
    const searchClass = classFilter;

    return campaigns.filter((camp) => {
      if (!camp) return false;

      const matchesSearch =
        !searchTitle ||
        (camp.title && camp.title.toLowerCase().includes(searchTitle));
      const matchesStatus =
        !searchStatus ||
        (camp.approval_status &&
          camp.approval_status.toLowerCase().includes(searchStatus));
      const matchesClass = !searchClass || camp.class === searchClass;
      const matchesYear =
        !yearFilter ||
        (camp.scheduled_date &&
          moment(camp.scheduled_date).format("YYYY") === yearFilter);

      return matchesSearch && matchesStatus && matchesClass && matchesYear;
    });
  }, [campaigns, searchQuery, statusFilter, classFilter, yearFilter]);

  // Event handlers
  const fetchCampaigns = useCallback(async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchAllVaccineCampaigns());
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    fetchCampaigns();
    toast.success("Dữ liệu đã được làm mới");
  }, [fetchCampaigns]);

  const showNewScheduleModal = useCallback(() => {
    formCreateNewSchedule.resetFields();
    setCreateNewScheduleModal(true);
  }, [formCreateNewSchedule]);

  const handleCreateNewScheduleModalOk = useCallback(async () => {
    try {
      const values = await formCreateNewSchedule.validateFields();
      const payload = {
        title: values.title,
        description: values.description,
        scheduled_date: values.scheduled_date
          ? values.scheduled_date.format("YYYY-MM-DD")
          : null,
        sponsor: values.sponsor,
        className: values.className,
      };
      await dispatch(
        createVaccinationCampaign({ token, campaignData: payload })
      ).unwrap();
      toast.success("Tạo lịch tiêm chủng thành công");
      setCreateNewScheduleModal(false);
      formCreateNewSchedule.resetFields();
      dispatch(fetchAllVaccineCampaigns());
    } catch (err) {
      toast.error(err?.message || "Có lỗi xảy ra");
    }
  }, [dispatch, formCreateNewSchedule, token]);

  const handleCancelCreateNewScheduleModal = useCallback(() => {
    setCreateNewScheduleModal(false);
    formCreateNewSchedule.resetFields();
  }, [formCreateNewSchedule]);

  const handleViewStudentList = useCallback(
    async (campaignId) => {
      try {
        const result = await dispatch(
          fetchApprovedStudentsByCampaignId(campaignId)
        ).unwrap();
        setApprovedStudents(result);
        setIsStudentListModalVisible(true);
      } catch (err) {
        message.error(err.message || "Tải danh sách học sinh thất bại.");
      }
    },
    [dispatch]
  );

  const handleViewStudentDetail = useCallback((selectedStudent) => {
    setSelectedStudent(selectedStudent);
    setIsViewStudentModalVisible(true);
    setIsStudentListModalVisible(false);
  }, []);

  const handleYearFilterChange = useCallback((value) => {
    if (value) {
      if (value.localeCompare(2000) && value <= 2030) {
        setYearFilter(value);
        setPagination((curr) => ({ ...curr, current: 1 }));
      }
      return value;
    } else {
      setYearFilter("");
    }
  }, []);

  const handleFinishUpdateStudentDetail = useCallback(
    async (values) => {
      if (!selectedStudent?.id) {
        message.error("Không tìm thấy học sinh để cập nhật.");
        return;
      }
      const formData = {
        vaccinated_at: values.vaccinated_at
          ? values.vaccinated_at.format("YYYY-MM-DD")
          : null,
        vaccine_name: values.vaccine_name || "",
        dose_number: values.dose_number || null,
        reaction: values.reaction || "",
        follow_up_required: values.follow_up_required === "Có" ? "Có" : "Không",
        note: values.note || "",
      };
      try {
        await dispatch(
          updateStudentVaccineDetail({
            vaccine_id: selectedStudent.id,
            values: formData,
          })
        ).unwrap();
        toast.success("Cập nhật ghi chú tiêm thành công!");
        setIsViewStudentModalVisible(false);
        if (selectedStudent.campaign_id) {
          handleViewStudentList(selectedStudent.campaign_id);
        }
      } catch (error) {
        message.error(
          "Cập nhật thất bại: " + (error.message || "Lỗi không xác định")
        );
      }
    },
    [dispatch, selectedStudent, handleViewStudentList]
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
    dispatch(fetchAllVaccineCampaigns());
  }, [dispatch]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: (campaigns || []).length,
    }));
  }, [campaigns]);

  useEffect(() => {
    if (selectedStudent && isViewStudentModalVisible) {
      formUpdateStudentDetail.resetFields();
      formUpdateStudentDetail.setFieldsValue({
        student_id: selectedStudent.student_id,
        full_name: selectedStudent.full_name,
        student_code: selectedStudent.student_code,
        class_name: selectedStudent.class_name,
        date_of_birth: selectedStudent.date_of_birth
          ? dayjs(selectedStudent.date_of_birth)
          : null,
        vaccinated_at: selectedStudent.vaccinated_at
          ? dayjs(selectedStudent.vaccinated_at)
          : null,
        campaign_id: selectedStudent.campaign_id,
        vaccine_name: selectedStudent.vaccine_name,
        dose_number: selectedStudent.dose_number
          ? Number(selectedStudent.dose_number)
          : null,
        follow_up_required:
          selectedStudent.follow_up_required === "Có" ? "Có" : "Không",
        reaction: selectedStudent.reaction,
        note: selectedStudent.note,
      });
    }
  }, [selectedStudent, isViewStudentModalVisible, formUpdateStudentDetail]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        title: (
          <div className="flex items-center gap-2">
            <BarcodeOutlined style={{ color: modernTheme.colors.primary }} />
            <span className="font-semibold">Mã lịch trình</span>
          </div>
        ),
        dataIndex: "campaign_id",
        key: "campaign_id",
        width: 140,
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
                    color: modernTheme.colors.primary,
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
            <ContainerOutlined style={{ color: modernTheme.colors.success }} />
            <span className="font-semibold">Tiêu đề</span>
          </div>
        ),
        dataIndex: "title",
        key: "title",
        ellipsis: true,
        align: "center",
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
            <UserOutlined style={{ color: modernTheme.colors.secondary }} />
            <span className="font-semibold">Được tạo bởi</span>
          </div>
        ),
        dataIndex: "fullname",
        key: "created_by",
        align: "center",
        render: (text) => (
          <div className="flex items-center gap-2">
            <Avatar
              size="small"
              style={{ backgroundColor: modernTheme.colors.secondary }}
            >
              {text?.charAt(0)?.toUpperCase()}
            </Avatar>
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
            <CommentOutlined style={{ color: "#6b7280" }} />
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
            <TeamOutlined style={{ color: "#8b5cf6" }} />
            <span className="font-semibold">Lớp</span>
          </div>
        ),
        dataIndex: "class",
        key: "class",
        align: "center",
        render: (text) => (
          <Tag
            color="purple"
            style={{
              borderRadius: modernTheme.borderRadius.sm,
              fontWeight: "600",
            }}
          >
            Lớp {text}
          </Tag>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <CalendarOutlined style={{ color: "#f97316" }} />
            <span className="font-semibold">Ngày tạo</span>
          </div>
        ),
        dataIndex: "created_at",
        key: "created_at",
        align: "center",
        render: (date) => (
          <div className="flex flex-col items-center gap-1">
            <div
              style={{
                background: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)",
                padding: "6px",
                borderRadius: modernTheme.borderRadius.sm,
                border: "1px solid #fb923c",
              }}
            >
              <CalendarOutlined
                style={{ color: "#ea580c", fontSize: "16px" }}
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
            <ScheduleOutlined style={{ color: modernTheme.colors.info }} />
            <span className="font-semibold">Ngày dự kiến</span>
          </div>
        ),
        dataIndex: "scheduled_date",
        key: "scheduled_date",
        align: "center",
        render: (date) => (
          <div className="flex flex-col items-center gap-1">
            <div
              style={{
                background: "linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)",
                padding: "6px",
                borderRadius: modernTheme.borderRadius.sm,
                border: "1px solid #34d399",
              }}
            >
              <ScheduleOutlined
                style={{ color: "#059669", fontSize: "16px" }}
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
            <TrophyOutlined style={{ color: "#ec4899" }} />
            <span className="font-semibold">Nhà tài trợ</span>
          </div>
        ),
        dataIndex: "sponsor",
        key: "sponsor",
        ellipsis: true,
        render: (text) => (
          <div className="flex items-center gap-2">
            <TrophyOutlined style={{ color: "#ec4899", fontSize: "14px" }} />
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
            <EditOutlined style={{ color: "#6b7280" }} />
            <span className="font-semibold">Hành động</span>
          </div>
        ),
        key: "actions",
        align: "center",
        render: (_, record) => (
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
              onClick={() => {
                if (record.approval_status === "APPROVED") {
                  handleViewStudentList(record.campaign_id);
                } else {
                  toast.warning("Lịch trình này chưa được duyệt.");
                }
              }}
            />
          </Tooltip>
        ),
      },
    ],
    [renderStatusTag, handleViewStudentList]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: modernTheme.colors.background,
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
                  <TbVaccine style={{ fontSize: "48px", color: "white" }} />
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
                    Quản lý tiêm chủng
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
                    Theo dõi và quản lý các chiến dịch tiêm chủng cho học sinh
                  </Text>
                </div>
              </div>
            </Col>
            <Col>
              <Space size="middle">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showNewScheduleModal}
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
                  Lịch trình mới
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
                        Tổng chiến dịch
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
                        <MedicineBoxOutlined
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

        {/* Enhanced Upcoming Vaccinations */}
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
                      background: `linear-gradient(135deg, ${modernTheme.colors.primary} 0%, ${modernTheme.colors.secondary} 100%)`,
                      borderRadius: modernTheme.borderRadius.md,
                      padding: "20px",
                      boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
                      marginLeft: "5px",
                      marginTop: "10px",
                      marginBottom: "5px",
                    }}
                  >
                    <TbVaccine style={{ color: "white", fontSize: "35px" }} />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#1f2937",
                      }}
                    >
                      Lịch tiêm sắp tới
                    </span>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        marginTop: "2px",
                      }}
                    >
                      Các chiến dịch tiêm chủng trong 7 ngày tới
                    </div>
                  </div>
                </div>
              </div>
            }
            style={{ ...modernCardStyle, marginBottom: "32px" }}
            bodyStyle={{ padding: "24px" }}
          >
            {upcomingVaccinations.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={upcomingVaccinations}
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
                          "linear-gradient(135deg, #c0dcf5 0%, #f0fdf4 100%)",
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
                            setSelectedUpcomingExamination(item);
                          }}
                          style={{
                            borderRadius: modernTheme.borderRadius.md,
                            borderColor: "#0f8eef",
                            color: "#0f8eef",
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
                                "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",

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
                              <CalendarOutlined style={{ color: "#1389f2" }} />
                              <Text
                                style={{ color: "#6b7280", fontSize: "14px" }}
                              >
                                Ngày tiêm:{" "}
                                <Text strong style={{ color: "#0085fd" }}>
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
                  <MedicineBoxOutlined
                    style={{ fontSize: "32px", color: "#9ca3af" }}
                  />
                </div>
                <Text style={{ color: "#6b7280", fontSize: "16px" }}>
                  Không có lịch tiêm sắp tới
                </Text>
                <div style={{ marginTop: "8px" }}>
                  <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                    Tất cả các chiến dịch đã được lên lịch hoặc hoàn thành
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
                    Danh sách chiến dịch tiêm chủng
                  </Title>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      marginTop: "4px",
                    }}
                  >
                    Quản lý và theo dõi tất cả các chiến dịch tiêm chủng
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
                    {filteredCampaigns.length} kết quả
                  </Text>
                </div>
              </div>

              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Input
                    placeholder="Tìm kiếm theo tiêu đề..."
                    icon={<FaMagnifyingGlass></FaMagnifyingGlass>}
                    style={{
                      borderRadius: modernTheme.borderRadius.lg,
                      height: "48px",
                      background: "#f9fafb",
                      border: "2px solid #f3f4f6",
                      fontSize: "14px",
                    }}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    value={searchQuery}
                  />
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Trạng thái"
                    onChange={setStatusFilter}
                    allowClear
                    style={{ width: "100%", height: "48px" }}
                    value={statusFilter}
                  >
                    <Option value="PENDING">Đang chờ</Option>
                    <Option value="APPROVED">Đã duyệt</Option>
                    <Option value="REJECTED">Đã từ chối</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Lớp"
                    onChange={setClassFilter}
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
                    {yearOptions.map((year) => (
                      <Option key={year} value={year}>
                        Năm {year}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </div>

            {/* Enhanced Table */}
            <div style={{ padding: "0", marginTop: "15px" }}>
              <Stepper
                onStepChange={(step) => {
                  setPagination((prev) => ({ ...prev, current: step }));
                }}
                backButtonText="Trang trước"
                nextButtonText="Trang sau"
                disableStepIndicators={true}
                currentStep={pagination.current}
              >
                {filteredCampaigns.length === 0 ? (
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
                        <MedicineBoxOutlined
                          style={{ fontSize: "40px", color: "#9ca3af" }}
                        />
                      </div>
                      <Title
                        level={4}
                        style={{ color: "#6b7280", marginBottom: "8px" }}
                      >
                        Không tìm thấy chiến dịch nào
                      </Title>
                      <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                        Thử thay đổi bộ lọc hoặc tạo chiến dịch mới
                      </Text>
                    </div>
                  </Step>
                ) : (
                  Array.from({
                    length: Math.ceil(
                      filteredCampaigns.length / pagination.pageSize
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
                            dataSource={filteredCampaigns.slice(
                              idx * pagination.pageSize,
                              (idx + 1) * pagination.pageSize
                            )}
                            rowKey="campaign_id"
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
                                  description="Không tìm thấy chiến dịch tiêm chủng nào"
                                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                              ),
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

        {/* Enhanced Create Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div
                style={{
                  background: `linear-gradient(135deg, ${modernTheme.colors.primary} 0%, #60a5fa 100%)`,
                  borderRadius: modernTheme.borderRadius.md,
                  padding: "12px",
                  boxShadow: "0 8px 32px rgba(22, 119, 255, 0.3)",
                }}
              >
                <MedicineBoxOutlined
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
                  Tạo lịch tiêm chủng mới
                </span>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  Tạo chiến dịch tiêm chủng cho học sinh
                </div>
              </div>
            </div>
          }
          open={isCreateNewScheduleModalVisible}
          onOk={handleCreateNewScheduleModalOk}
          onCancel={handleCancelCreateNewScheduleModal}
          confirmLoading={loading}
          width={800}
          style={{ top: 20 }}
          styles={{
            content: {
              borderRadius: modernTheme.borderRadius.xl,
              boxShadow: modernTheme.shadows.card,
            },
          }}
          okText="Tạo lịch trình"
          cancelText="Hủy"
        >
          <Divider style={{ margin: "24px 0" }} />
          <Form
            form={formCreateNewSchedule}
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
                      <ContainerOutlined
                        style={{ color: modernTheme.colors.primary }}
                      />
                      Tiêu đề chiến dịch
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập tiêu đề!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập tiêu đề chiến dịch tiêm chủng"
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
                    placeholder="Mô tả chi tiết về nội dung và mục đích của chiến dịch tiêm chủng"
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
                      Ngày tiêm
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày tiêm!" },
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
                    placeholder="Chọn ngày thực hiện tiêm"
                    disabledDate={(current) =>
                      current &&
                      current < moment().add(2, "days").startOf("day")
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
                      <TrophyOutlined style={{ color: "#f97316" }} />
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
          </Form>
        </Modal>

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
                  Học sinh tham gia chiến dịch tiêm chủng
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
          {!approvedStudents || approvedStudents.length === 0 ? (
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
                Chưa có học sinh nào được phân công cho chiến dịch này
              </Text>
            </div>
          ) : (
            <Table
              dataSource={approvedStudents}
              rowKey="id"
              pagination={{
                pageSize: 6,
                showSizeChanger: false,
                className: "pt-4 text-sm",
              }}
              style={{
                borderRadius: modernTheme.borderRadius.lg,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              columns={[
                {
                  title: (
                    <div className="flex items-center gap-2">
                      <BarcodeOutlined style={{ color: "#06b6d4" }} />
                      <span className="font-semibold">Mã lịch khám</span>
                    </div>
                  ),
                  dataIndex: "campaign_id",
                  key: "campaign_id",
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
                        color: "#8b5cf6",
                      }}
                    >
                      {text}
                    </Text>
                  ),
                },
                {
                  title: (
                    <div className="flex items-center gap-2">
                      <UserOutlined style={{ color: "#3b82f6" }} />
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
                      <MedicineBoxOutlined style={{ color: "#ec4899" }} />
                      <span className="font-semibold">Thời gian tiêm</span>
                    </div>
                  ),
                  dataIndex: "vaccinated_at",
                  key: "vaccinated_at",
                  render: (date) =>
                    date
                      ? format(parseISO(date), "dd/MM/yyyy HH:mm:ss")
                      : "N/A",
                },
                {
                  title: (
                    <div className="flex items-center gap-2">
                      <EyeOutlined style={{ color: "#6366f1" }} />
                      <span className="font-semibold">Thao tác</span>
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
                        onClick={() => handleViewStudentDetail(record)}
                      />
                    </Tooltip>
                  ),
                },
              ]}
              locale={{
                emptyText: (
                  <Empty
                    description="Không có học sinh nào trong lịch trình này."
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          )}
        </Modal>

        {/* Student Detail Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div
                style={{
                  background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                  borderRadius: modernTheme.borderRadius.md,
                  padding: "12px",
                  boxShadow: "0 8px 32px rgba(19, 194, 194, 0.3)",
                }}
              >
                <UserOutlined style={{ color: "white", fontSize: "20px" }} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                >
                  Chi tiết học sinh
                </span>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  Cập nhật thông tin tiêm chủng
                </div>
              </div>
            </div>
          }
          open={isViewStudentModalVisible}
          onCancel={() => {
            setIsViewStudentModalVisible(false);
            setIsStudentListModalVisible(true);
          }}
          centered
          width={700}
          style={{ top: 20 }}
          styles={{
            content: {
              borderRadius: modernTheme.borderRadius.xl,
              boxShadow: modernTheme.shadows.card,
            },
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsViewStudentModalVisible(false);
                setIsStudentListModalVisible(true);
              }}
              size="large"
              style={{
                borderRadius: modernTheme.borderRadius.md,
                height: "48px",
                paddingLeft: "24px",
                paddingRight: "24px",
                fontWeight: "600",
              }}
            >
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => formUpdateStudentDetail.submit()}
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
        >
          <Divider style={{ margin: "24px 0" }} />
          <Form
            layout="vertical"
            form={formUpdateStudentDetail}
            onFinish={handleFinishUpdateStudentDetail}
            style={{ marginTop: "24px" }}
          >
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
                    value={selectedStudent?.full_name}
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
                      <BarcodeOutlined
                        style={{ color: modernTheme.colors.secondary }}
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
                    value={selectedStudent?.class_name}
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
                      selectedStudent?.date_of_birth
                        ? dayjs(selectedStudent.date_of_birth)
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

            <Form.Item
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
                value={selectedStudent?.campaign_id}
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  fontSize: "14px",
                  backgroundColor: "#f9fafb",
                }}
              />
            </Form.Item>

            <Form.Item
              name="vaccinated_at"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <CalendarOutlined style={{ color: "#ec4899" }} />
                  Ngày tiêm chủng
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng chọn ngày tiêm chủng!" },
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
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item
              name="vaccine_name"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <MedicineBoxOutlined
                    style={{ color: modernTheme.colors.success }}
                  />
                  Tên vắc xin
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập tên vắc xin!" },
              ]}
            >
              <Input
                placeholder="Tên vắc xin đã tiêm"
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  fontSize: "14px",
                  border: "2px solid #f3f4f6",
                }}
              />
            </Form.Item>

            <Form.Item
              name="dose_number"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <ContainerOutlined style={{ color: "#8b5cf6" }} />
                  Số mũi
                </span>
              }
              rules={[{ required: true, message: "Vui lòng nhập số mũi!" }]}
            >
              <InputNumber
                min={1}
                style={{
                  width: "100%",
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  fontSize: "14px",
                }}
                placeholder="Số mũi đã tiêm"
              />
            </Form.Item>

            <Form.Item
              name="follow_up_required"
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
                placeholder="Chọn trạng thái"
                style={{
                  height: "48px",
                  fontSize: "14px",
                }}
              >
                <Option value="Có">Có</Option>
                <Option value="Không">Không</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="reaction"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <CommentOutlined style={{ color: "#ec4899" }} />
                  Phản ứng sau tiêm
                </span>
              }
            >
              <TextArea
                rows={3}
                placeholder="Mô tả phản ứng (nếu có)"
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  fontSize: "14px",
                  border: "2px solid #f3f4f6",
                }}
              />
            </Form.Item>

            <Form.Item
              name="note"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <EditOutlined style={{ color: "#06b6d4" }} />
                  Ghi chú
                </span>
              }
            >
              <TextArea
                rows={3}
                placeholder="Thêm ghi chú khác"
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  fontSize: "14px",
                  border: "2px solid #f3f4f6",
                }}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Upcoming Examination Detail Modal */}
        <Modal
          title={null}
          open={!!selectedUpcomingExamination}
          onCancel={() => setSelectedUpcomingExamination(null)}
          destroyOnClose={false}
          footer={[
            <Button
              key="close"
              type="primary"
              size="large"
              style={{
                background: `linear-gradient(135deg, ${modernTheme.colors.primary} 0%, #60a5fa 100%)`,
                borderRadius: modernTheme.borderRadius.md,
                height: "48px",
                paddingLeft: "32px",
                paddingRight: "32px",
                fontWeight: "700",
                border: "none",
                boxShadow: "0 8px 32px rgba(22, 119, 255, 0.3)",
              }}
              onClick={() => setSelectedUpcomingExamination(null)}
            >
              Đóng
            </Button>,
          ]}
          width={700}
          style={{ top: 20 }}
          styles={{
            content: {
              borderRadius: modernTheme.borderRadius.xl,
              boxShadow: modernTheme.shadows.card,
            },
          }}
        >
          <AnimatePresence mode="wait">
            {selectedUpcomingExamination && (
              <motion.div
                key="modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 40 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                style={{
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: 17,
                }}
              >
                {/* Enhanced Header */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${modernTheme.colors.primary} 0%, #60a5fa 100%)`,
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
                      <MedicineBoxOutlined
                        style={{ fontSize: "32px", color: "white" }}
                      />
                    </div>
                    <div>
                      <Title
                        level={2}
                        style={{ color: "white", margin: 0, fontWeight: "800" }}
                      >
                        {selectedUpcomingExamination.title}
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "16px",
                          fontWeight: "500",
                        }}
                      >
                        Mã chiến dịch: {selectedUpcomingExamination.campaign_id}
                      </Text>
                    </div>
                  </div>
                </div>

                {/* Status Alert */}
                {selectedUpcomingExamination.scheduled_date && (
                  <Alert
                    message="Thông tin lịch tiêm"
                    description={(() => {
                      try {
                        const today = new Date();
                        const scheduled = new Date(
                          selectedUpcomingExamination.scheduled_date
                        );
                        if (
                          scheduled.getFullYear() === today.getFullYear() &&
                          scheduled.getMonth() === today.getMonth() &&
                          scheduled.getDate() === today.getDate()
                        ) {
                          return "Đã đến ngày tiêm - Cần thực hiện ngay hôm nay";
                        }
                        const days = differenceInCalendarDays(scheduled, today);
                        if (days >= 0 && days <= 30) {
                          return `Sắp diễn ra trong ${days} ngày - Cần chuẩn bị sẵn sàng`;
                        }
                        return "Lịch tiêm đã được lên kế hoạch";
                      } catch (error) {
                        return "Thông tin lịch tiêm";
                      }
                    })()}
                    type="info"
                    showIcon
                    style={{
                      borderRadius: modernTheme.borderRadius.lg,
                      marginBottom: "32px",
                      border: `1px solid ${modernTheme.colors.primary}`,
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
                  <div
                    style={{
                      fontWeight: 600,
                      color: modernTheme.colors.primary,
                      fontSize: 18,
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <InfoCircleOutlined /> Thông tin chi tiết
                  </div>
                  <div style={{ borderTop: "1px solid #f0f0f0" }}>
                    {[
                      {
                        label: "Trạng thái",
                        value: renderStatusTag(
                          selectedUpcomingExamination.approval_status
                        ),
                      },
                      {
                        label: "Người tạo đơn",
                        value: selectedUpcomingExamination.fullname,
                      },
                      {
                        label: "Mô tả",
                        value: selectedUpcomingExamination.description,
                      },
                      {
                        label: "Ngày tạo",
                        value: selectedUpcomingExamination.created_at
                          ? format(
                              parseISO(selectedUpcomingExamination.created_at),
                              "dd/MM/yyyy"
                            )
                          : "",
                      },
                      {
                        label: "Ngày tiêm",
                        value: selectedUpcomingExamination.scheduled_date
                          ? format(
                              parseISO(
                                selectedUpcomingExamination.scheduled_date
                              ),
                              "dd/MM/yyyy"
                            )
                          : "",
                      },
                      {
                        label: "Nhà tài trợ",
                        value: selectedUpcomingExamination.sponsor,
                      },
                      {
                        label: "Khối áp dụng",
                        value: `Lớp ${selectedUpcomingExamination.class}`,
                      },
                    ].map((item, idx, arr) => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "16px 0",
                          borderBottom:
                            idx < arr.length - 1 ? "1px solid #f0f0f0" : "none",
                        }}
                      >
                        <span
                          style={{
                            color: "#374151",
                            fontWeight: 600,
                            fontSize: 15,
                          }}
                        >
                          {item.label}
                        </span>
                        <span
                          style={{
                            color: "#1f2937",
                            fontWeight: 500,
                            fontSize: 15,
                          }}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
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
        .ant-card-head {
          border: none !important;
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
          border-color: ${modernTheme.colors.primary} !important;
          box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1) !important;
        }
        .ant-select-focused .ant-select-selector {
          border-color: ${modernTheme.colors.primary} !important;
          box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1) !important;
        }
      `}</style>
    </motion.div>
  );
}
