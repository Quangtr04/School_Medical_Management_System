"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  DatePicker,
  Tag,
  message,
  Tooltip,
  Card,
  Spin,
  Empty,
  InputNumber,
  Row,
  Col,
  Statistic,
  Typography,
  Divider,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  IdcardOutlined,
  UserOutlined,
  TeamOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  EyeOutlined,
  EditOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { FiAlertTriangle } from "react-icons/fi";
import { MdOutlineDangerous } from "react-icons/md";
import moment from "moment";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import {
  fetchAllMedicalIncidents,
  createMedicalIncident,
  updateMedicalIncident,
  setMedicalIncidentPagination,
  clearMedicalIncidentsSuccess,
  clearMedicalIncidentsError,
  updateMedicalIncidentStatus,
} from "../../redux/nurse/medicalIncidents/medicalIncidents";
import { fetchMedicalSupplies } from "../../redux/nurse/medicalSupplies/medicalSupplies";
import Stepper, { Step } from "../../Animation/Step/Stepper";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

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

// Status configuration
const STATUS_MAP = {
  NEW: "Mới",
  IN_PROGRESS: "Đang tiến hành",
  RESOLVED: "Đã giải quyết",
  MONITORING: "Đang theo dõi",
};

const statusConfig = {
  RESOLVED: {
    color: modernTheme.colors.success,
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    text: "Đã giải quyết",
    icon: <CheckCircleOutlined />,
  },
  MONITORING: {
    color: modernTheme.colors.info,
    bgColor: "#dbeafe",
    borderColor: "#93c5fd",
    text: "Đang theo dõi",
    icon: <EyeOutlined />,
  },
  NEW: {
    color: "#6b7280",
    bgColor: "#f9fafb",
    borderColor: "#d1d5db",
    text: "Mới",
    icon: <ClockCircleOutlined />,
  },
  IN_PROGRESS: {
    color: modernTheme.colors.warning,
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    text: "Đang tiến hành",
    icon: <SyncOutlined spin />,
  },
};

const getStatusTag = (status) => {
  const config = statusConfig[status] || statusConfig.NEW;
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
};

const renderLoadingState = () => (
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
        background: `linear-gradient(135deg, ${modernTheme.colors.error} 0%, #f87171 100%)`,
        borderRadius: "50%",
        padding: "20px",
        boxShadow: modernTheme.shadows.card,
      }}
    >
      <LoadingOutlined style={{ fontSize: 40, color: "white" }} spin />
    </motion.div>
    <div>
      <Title level={4} style={{ color: "#6b7280", marginBottom: "8px" }}>
        Đang tải dữ liệu sự cố y tế
      </Title>
      <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
        Vui lòng chờ trong giây lát...
      </Text>
    </div>
  </div>
);

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

export default function MedicalIncident() {
  const dispatch = useDispatch();
  const {
    records: incidents,
    loading,
    pagination,
  } = useSelector((state) => state.medicalIncidents);
  const { supplies: medicalSupplies } = useSelector(
    (state) => state.medicalSupplies
  );
  const children = useSelector((state) => state.studentRecord.healthRecords);

  const [searchStudenName, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [addMedicalIncidentModal, setIsModalVisible] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null);
  const [form] = Form.useForm();
  const [selectedParentName, setSelectedParentName] = useState("");
  const [medicalIncidentsDetailModal, setMedicalIncidentsDetailModal] =
    useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const medicationUsed = Form.useWatch("medication_used", form) || [];
  const [selectedStatus, setSelectedStatus] = useState();

  // Statistics calculation
  const stats = useMemo(() => {
    if (!Array.isArray(incidents)) {
      return {
        total: 0,
        resolved: 0,
        inProgress: 0,
        new: 0,
        monitoring: 0,
      };
    }

    const total = incidents.length;
    const resolved = incidents.filter(
      (item) => item.status === "RESOLVED"
    ).length;
    const inProgress = incidents.filter(
      (item) => item.status === "IN_PROGRESS"
    ).length;
    const newIncidents = incidents.filter(
      (item) => item.status === "NEW"
    ).length;
    const monitoring = incidents.filter(
      (item) => item.status === "MONITORING"
    ).length;

    return { total, resolved, inProgress, new: newIncidents, monitoring };
  }, [incidents]);

  const dateList = Array.from(
    new Set(
      incidents.map((inc) =>
        inc.occurred_at ? dayjs(inc.occurred_at).format("YYYY-MM-DD") : null
      )
    )
  ).filter(Boolean);

  // Fetch medical supplies
  useEffect(() => {
    dispatch(fetchMedicalSupplies({ page: 1, pageSize: 5 }));
  }, [dispatch]);

  // Fetch incidents
  const loadIncidents = useCallback(() => {
    dispatch(
      fetchAllMedicalIncidents({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchStudenName,
        status: statusFilter,
      })
    );
  }, [dispatch, searchStudenName, statusFilter, pagination]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const filteredIncidents = useMemo(() => {
    const searchStatus = statusFilter?.trim().toLowerCase();
    const searchStudentName = searchStudenName?.trim().toLowerCase();
    const searchType = typeFilter?.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchSearchName =
        !searchStudentName ||
        (incident.student_name &&
          incident.student_name.toLowerCase().includes(searchStudentName));
      const matchedStatus =
        !searchStatus ||
        (incident.status &&
          incident.status.toLowerCase().includes(searchStatus));
      const matchedSearchType =
        !searchType ||
        (incident.severity_level &&
          incident.severity_level.toLowerCase().includes(searchType));
      const matchedDate =
        !dateFilter ||
        (incident.occurred_at &&
          moment(incident.occurred_at).format("YYYY-MM-DD") ===
            moment(dateFilter).format("YYYY-MM-DD"));

      return (
        matchSearchName && matchedStatus && matchedSearchType && matchedDate
      );
    });
  }, [statusFilter, searchStudenName, typeFilter, incidents, dateFilter]);

  const handleSearch = useCallback(
    (value) => {
      setSearchQuery(value);
      dispatch(setMedicalIncidentPagination({ current: 1 }));
    },
    [dispatch]
  );

  const handleStatusFilterChange = useCallback(
    (value) => {
      setStatusFilter(value);
      dispatch(setMedicalIncidentPagination({ current: 1 }));
    },
    [dispatch]
  );

  const handleTypeFilterChange = useCallback(
    (value) => {
      setTypeFilter(value);
      dispatch(setMedicalIncidentPagination({ current: 1 }));
    },
    [dispatch]
  );

  const hadleDateFilterChange = useCallback(
    (date) => {
      setDateFilter(date || null);
      dispatch(setMedicalIncidentPagination({ current: 1 }));
    },
    [dispatch]
  );

  const showModal = useCallback(
    (incident) => {
      if (incident) {
        setCurrentIncident(incident);
        form.setFieldsValue({
          ...incident,
          occurred_at: incident.occurred_at
            ? moment(incident.occurred_at)
            : null,
          resolved_at: incident.resolved_at
            ? moment(incident.resolved_at)
            : null,
          medication_used: incident.medication_used?.map((item) => ({
            supply_name: item.supply_name,
            quantity_used: item.quantity_used,
          })),
          parent_name: incident.parent_name,
        });
        setSelectedParentName(incident.parent_name || "");
      } else {
        setCurrentIncident(null);
        form.resetFields();
        setSelectedParentName("");
      }
      setIsModalVisible(true);
    },
    [form]
  );

  const showIncidentDetailModal = useCallback((incident) => {
    setMedicalIncidentsDetailModal(true);
    setSelectedIncident(incident);
  }, []);

  const handleModalOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        occurred_at: values.occurred_at
          ? values.occurred_at.format("YYYY-MM-DDTHH:mm:ss")
          : null,
        resolved_at: values.resolved_at
          ? values.resolved_at.format("YYYY-MM-DDTHH:mm:ss")
          : null,
        medication_used: values.medication_used || [],
      };

      if (currentIncident) {
        dispatch(
          updateMedicalIncident({
            id: currentIncident.id,
            incidentData: payload,
          })
        )
          .unwrap()
          .then(() => {
            toast.success("Cập nhật sự kiện thành công!");
            form.resetFields();
            setIsModalVisible(false);
            dispatch(fetchAllMedicalIncidents({ page: 1, limit: 10 }));
            setCurrentIncident(null);
            setSelectedParentName("");
          })
          .catch((err) => {
            toast.error("Đã có lỗi xảy ra khi cập nhật sự kiện!");
          });
      } else {
        dispatch(createMedicalIncident(payload))
          .unwrap()
          .then(() => {
            toast.success("Ghi nhận sự kiện thành công!");
            form.resetFields();
            setIsModalVisible(false);
            dispatch(fetchAllMedicalIncidents({ page: 1, limit: 10 }));
            setCurrentIncident(null);
            setSelectedParentName("");
          })
          .catch((err) => {
            toast.error("Đã có lỗi xảy ra khi ghi nhận sự kiện!");
          });
      }
    } catch (info) {
      message.error("Vui lòng điền đầy đủ và chính xác thông tin!");
    }
  }, [form, currentIncident, dispatch]);

  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
    setCurrentIncident(null);
    form.resetFields();
    setSelectedParentName("");
    dispatch(clearMedicalIncidentsError());
    dispatch(clearMedicalIncidentsSuccess());
  }, [form, dispatch]);

  const handleUpdateStatus = useCallback(async () => {
    if (!selectedIncident) return;
    const statusToUpdate = selectedStatus || selectedIncident.status;
    await dispatch(
      updateMedicalIncidentStatus({
        event_id: selectedIncident.event_id,
        status: statusToUpdate,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Cập nhật trạng thái thành công!");
        setMedicalIncidentsDetailModal(false);
        setSelectedIncident(null);
        setSelectedStatus(undefined);
        dispatch(
          fetchAllMedicalIncidents({
            page: pagination.current,
            pageSize: pagination.pageSize,
          })
        );
      })
      .catch(() => {
        toast.error("Cập nhật trạng thái thất bại!");
      });
  }, [dispatch, selectedIncident, selectedStatus, pagination]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        title: (
          <div className="flex items-center gap-2">
            <IdcardOutlined style={{ color: modernTheme.colors.info }} />
            <span className="font-semibold">Mã sự cố</span>
          </div>
        ),
        dataIndex: "event_id",
        key: "event_id",
        width: 120,
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
          <div className="flex items-center gap-2">
            <UserOutlined style={{ color: modernTheme.colors.success }} />
            <span className="font-semibold">Học sinh</span>
          </div>
        ),
        dataIndex: "student_name",
        key: "studentName",
        width: 180,
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
            <TeamOutlined style={{ color: modernTheme.colors.warning }} />
            <span className="font-semibold">Lớp</span>
          </div>
        ),
        dataIndex: "class_name",
        key: "className",
        width: 100,
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
          <div className="flex items-center gap-2">
            <WarningOutlined style={{ color: modernTheme.colors.error }} />
            <span className="font-semibold">Mức độ</span>
          </div>
        ),
        dataIndex: "severity_level",
        key: "type",
        width: 120,
        align: "center",
        render: (level) => {
          let bgColor = "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)";
          let borderColor = "#86efac";
          let textColor = "#166534";

          if (level === "Nặng" || level === "Nguy kịch") {
            bgColor = "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)";
            borderColor = "#fca5a5";
            textColor = "#dc2626";
          } else if (level === "Vừa") {
            bgColor = "linear-gradient(135deg, #fffbeb 0%, #fde68a 100%)";
            borderColor = "#fbbf24";
            textColor = "#d97706";
          }

          return (
            <Tag
              style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: modernTheme.borderRadius.md,
                color: textColor,
                fontWeight: "600",
                padding: "4px 12px",
                fontSize: "11px",
              }}
            >
              {level}
            </Tag>
          );
        },
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <CalendarOutlined style={{ color: "#ec4899" }} />
            <span className="font-semibold">Thời gian</span>
          </div>
        ),
        dataIndex: "occurred_at",
        key: "incidentTime",
        width: 140,
        align: "center",
        render: (time) => (
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
              {time ? format(parseISO(time), "dd/MM/yyyy") : "N/A"}
            </Text>
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <FileTextOutlined style={{ color: "#06b6d4" }} />
            <span className="font-semibold">Mô tả</span>
          </div>
        ),
        dataIndex: "description",
        key: "description",
        ellipsis: true,
        render: (description) => (
          <Tooltip title={description}>
            <Text
              ellipsis
              style={{
                maxWidth: "200px",
                color: "#6b7280",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              {description || "Không có mô tả"}
            </Text>
          </Tooltip>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <CheckCircleOutlined style={{ color: "#06b6d4" }} />
            <span className="font-semibold">Trạng thái</span>
          </div>
        ),
        dataIndex: "status",
        key: "status",
        align: "center",
        width: 140,
        render: (status) => (
          <div className="flex justify-center">{getStatusTag(status)}</div>
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
        width: 120,
        render: (_, record) => (
          <Tooltip title="Xem chi tiết sự cố">
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
              onClick={() => showIncidentDetailModal(record)}
            />
          </Tooltip>
        ),
      },
    ],
    [showIncidentDetailModal]
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
                  <MdOutlineDangerous
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
                    Sự cố y tế
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
                    Theo dõi và quản lý các sự kiện y tế tại trường học
                  </Text>
                </div>
              </div>
            </Col>
            <Col>
              <Space size="middle">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal(null)}
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
                  Thêm sự cố y tế
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
            <Col xs={24} sm={12} md={6}>
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
                        Tổng sự cố
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
            <Col xs={24} sm={12} md={6}>
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
                        Đã giải quyết
                      </span>
                    }
                    value={stats.resolved}
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
            <Col xs={24} sm={12} md={6}>
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
                        Đang xử lý
                      </span>
                    }
                    value={stats.inProgress}
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
                        <SyncOutlined
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
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card
                  style={{
                    ...modernCardStyle,
                    background:
                      "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                    border: "1px solid #d1d5db",
                  }}
                  bodyStyle={{ padding: "24px" }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "#374151",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        Mới
                      </span>
                    }
                    value={stats.new}
                    prefix={
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
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
                      color: "#374151",
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
                    Danh sách sự cố y tế
                  </Title>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      marginTop: "4px",
                    }}
                  >
                    Theo dõi và quản lý các sự kiện y tế tại trường học
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
                    {filteredIncidents.length} kết quả
                  </Text>
                </div>
              </div>

              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={6}>
                  <Input
                    placeholder="Tìm kiếm sự cố..."
                    style={{
                      borderRadius: modernTheme.borderRadius.lg,
                      height: "48px",
                      background: "#f9fafb",
                      border: "2px solid #f3f4f6",
                      fontSize: "14px",
                    }}
                    onPressEnter={(e) => handleSearch(e.target.value)}
                    onBlur={(e) => handleSearch(e.target.value)}
                    defaultValue={searchStudenName}
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
                    <Option value="RESOLVED">Đã giải quyết</Option>
                    <Option value="IN_PROGRESS">Đang tiến hành</Option>
                    <Option value="NEW">Mới</Option>
                    <Option value="MONITORING">Đang theo dõi</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Mức độ"
                    onChange={handleTypeFilterChange}
                    allowClear
                    style={{ width: "100%", height: "48px" }}
                    value={typeFilter}
                  >
                    {Array.from(
                      new Set(
                        incidents
                          .map((inc) => inc.severity_level)
                          .filter(Boolean)
                      )
                    ).map((level) => (
                      <Option key={level} value={level}>
                        {level}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Ngày xảy ra"
                    style={{ width: "100%", height: "48px" }}
                    onChange={hadleDateFilterChange}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    value={dateFilter || null} // chỉ giữ nguyên chuỗi (YYYY-MM-DD)
                  >
                    {dateList.map((date, idx) => (
                      <Select.Option key={idx} value={date}>
                        {moment(date).format("DD/MM/YYYY")}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </div>

            {/* Enhanced Table */}
            <div style={{ padding: "32px" }}>
              {loading && incidents?.length === 0 ? (
                renderLoadingState()
              ) : (
                <Stepper
                  initialStep={pagination.current}
                  onStepChange={(step) =>
                    dispatch(setMedicalIncidentPagination({ current: step }))
                  }
                  backButtonText="Trang trước"
                  nextButtonText="Trang sau"
                  disableStepIndicators={true}
                  currentStep={pagination.current}
                >
                  {filteredIncidents.length === 0 ? (
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
                          <FiAlertTriangle
                            style={{ fontSize: "40px", color: "#9ca3af" }}
                          />
                        </div>
                        <Title
                          level={4}
                          style={{ color: "#6b7280", marginBottom: "8px" }}
                        >
                          Không tìm thấy sự cố y tế nào
                        </Title>
                        <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                          Thử thay đổi bộ lọc hoặc thêm sự cố mới
                        </Text>
                      </div>
                    </Step>
                  ) : (
                    Array.from({
                      length: Math.ceil(
                        filteredIncidents.length / pagination.pageSize
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
                              dataSource={filteredIncidents.slice(
                                idx * pagination.pageSize,
                                (idx + 1) * pagination.pageSize
                              )}
                              rowKey="event_id"
                              pagination={false}
                              scroll={{ x: 1200 }}
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
                                    description="Không tìm thấy sự kiện y tế nào"
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

        {/* Enhanced Add Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div
                style={{
                  background: `linear-gradient(135deg, ${modernTheme.colors.error} 0%, #f87171 100%)`,
                  borderRadius: modernTheme.borderRadius.md,
                  padding: "12px",
                  boxShadow: "0 8px 32px rgba(239, 68, 68, 0.3)",
                }}
              >
                <MdOutlineDangerous
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
                  {currentIncident
                    ? "Cập nhật sự cố y tế"
                    : "Ghi lại sự kiện y tế mới"}
                </span>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  {currentIncident
                    ? "Cập nhật thông tin sự cố"
                    : "Ghi nhận sự kiện y tế tại trường"}
                </div>
              </div>
            </div>
          }
          open={addMedicalIncidentModal}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          confirmLoading={loading}
          maskClosable={!loading}
          width={800}
          style={{ top: 20 }}
          styles={{
            content: {
              borderRadius: modernTheme.borderRadius.xl,
              boxShadow: modernTheme.shadows.card,
            },
          }}
          okText={currentIncident ? "Cập nhật sự cố" : "Ghi lại sự cố"}
          cancelText="Hủy bỏ"
        >
          <Divider style={{ margin: "24px 0" }} />
          <Form
            form={form}
            layout="vertical"
            name="incident_form"
            style={{ marginTop: "24px" }}
          >
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <FileTextOutlined
                        style={{ color: modernTheme.colors.info }}
                      />
                      Tên sự cố
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập tên sự cố!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập tên sự cố y tế"
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
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
                      <UserOutlined
                        style={{ color: modernTheme.colors.success }}
                      />
                      Chọn học sinh
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn học sinh!" },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn học sinh"
                    optionLabelProp="label"
                    style={{ height: "48px", fontSize: "14px" }}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(studentId) => {
                      const selectedStudent = children.find(
                        (c) => c.student_id === studentId
                      );
                      if (selectedStudent) {
                        form.setFieldsValue({
                          parent_name: selectedStudent.parent_name,
                          student_name: selectedStudent.student_name,
                        });
                      }
                    }}
                  >
                    {children.map((child) => (
                      <Select.Option
                        key={child.student_id}
                        value={child.student_id}
                        label={child.student_name}
                      >
                        {child.student_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="parent_name"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <TeamOutlined
                        style={{ color: modernTheme.colors.warning }}
                      />
                      Phụ huynh
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
              </Col>
              <Col span={12}>
                <Form.Item
                  name="severity_level"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <WarningOutlined
                        style={{ color: modernTheme.colors.error }}
                      />
                      Mức độ nghiêm trọng
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn mức độ nghiêm trọng!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Chọn mức độ nghiêm trọng"
                    style={{ height: "48px", fontSize: "14px" }}
                  >
                    <Option value="Nhẹ">Nhẹ</Option>
                    <Option value="Vừa">Vừa</Option>
                    <Option value="Nặng">Nặng</Option>
                    <Option value="Nguy kịch">Nguy kịch</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="occurred_at"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <CalendarOutlined style={{ color: "#ec4899" }} />
                      Thời gian xảy ra
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn thời gian!" },
                  ]}
                >
                  <DatePicker
                    showTime={{ format: "HH:mm:ss" }}
                    format="DD/MM/YYYY - HH:mm:ss"
                    style={{
                      width: "100%",
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
                    }}
                    disabledDate={
                      (current) =>
                        (current && current < moment().startOf("day")) ||
                        current.day() === 0 || // Chủ Nhật
                        current.day() === 6 // Thứ Bảy
                    }
                    disabledTime={() => ({
                      disabledHours: () => {
                        let hours = [];
                        for (let i = 0; i < 6; i++) hours.push(i); // 0h → 5h
                        for (let i = 18; i < 24; i++) hours.push(i); // 18h → 23h
                        return hours;
                      },
                      disabledMinutes: (selectedHour) => {
                        if (selectedHour === 17) {
                          return Array.from({ length: 59 }, (_, i) => i + 1); // Disable 1 → 59 phút
                        }
                        return [];
                      },
                      disabledSeconds: () => [], // Cho tất cả giây
                    })}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.List
              name="medication_used"
              rules={[
                {
                  validator: async (_, meds) => {
                    if (!meds || meds.length < 1) {
                      return Promise.reject(
                        new Error("Vui lòng chọn thuốc hoặc vật tư!")
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <MedicineBoxOutlined
                      style={{ color: modernTheme.colors.success }}
                    />
                    <span
                      style={{
                        fontWeight: "600",
                        color: "#374151",
                        fontSize: "16px",
                      }}
                    >
                      Thuốc sử dụng
                    </span>
                  </div>

                  {fields.map(({ key, name, ...restField }) => {
                    const currentSupplyName = medicationUsed[name]?.supply_name;
                    const selectedSupplyInfo = medicalSupplies?.find(
                      (supply) => supply.name === currentSupplyName
                    );
                    const availableQuantity = selectedSupplyInfo?.quantity || 0;

                    return (
                      <div
                        key={key}
                        style={{
                          background:
                            "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                          padding: "16px",
                          borderRadius: modernTheme.borderRadius.lg,
                          border: "1px solid #e2e8f0",
                          marginBottom: "16px",
                        }}
                      >
                        <Row gutter={16} align="middle">
                          <Col span={10}>
                            <Form.Item
                              {...restField}
                              name={[name, "supply_name"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng chọn thuốc!",
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                showSearch
                                placeholder="Chọn thuốc"
                                style={{ height: "40px" }}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.children
                                    ?.toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={() => {
                                  form.setFields([
                                    {
                                      name: [name, "quantity_used"],
                                      value: undefined,
                                    },
                                  ]);
                                }}
                              >
                                {medicalSupplies?.map((supply) => (
                                  <Option key={supply.id} value={supply.name}>
                                    {supply.name}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, "quantity_used"]}
                              rules={[
                                { required: true, message: "Nhập số lượng!" },
                                {
                                  type: "number",
                                  min: 1,
                                  message: "Số lượng phải lớn hơn 0",
                                },
                                ({ getFieldValue }) => ({
                                  validator(_, value) {
                                    if (
                                      !selectedSupplyInfo ||
                                      !value ||
                                      value <= availableQuantity
                                    ) {
                                      return Promise.resolve();
                                    }
                                    return Promise.reject(
                                      new Error(
                                        `Số lượng còn lại trong kho: ${availableQuantity}.`
                                      )
                                    );
                                  },
                                }),
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber
                                min={1}
                                max={
                                  selectedSupplyInfo
                                    ? availableQuantity
                                    : Number.POSITIVE_INFINITY
                                }
                                placeholder="Số lượng"
                                style={{ width: "100%", height: "40px" }}
                                disabled={!currentSupplyName}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Text
                              style={{ color: "#6b7280", fontSize: "12px" }}
                            >
                              Còn: {availableQuantity}
                            </Text>
                          </Col>
                          <Col span={2}>
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                              style={{ height: "40px", width: "40px" }}
                            />
                          </Col>
                        </Row>
                      </div>
                    );
                  })}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      style={{
                        height: "48px",
                        borderRadius: modernTheme.borderRadius.md,
                        border: "2px dashed #d1d5db",
                        fontWeight: "600",
                      }}
                    >
                      Thêm thuốc
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="resolution_notes"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <SafetyOutlined style={{ color: "#06b6d4" }} />
                      Hướng giải quyết
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập giải pháp!" },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Mô tả cách xử lý sự cố..."
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
                  name="resolved_at"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <CheckCircleOutlined
                        style={{ color: modernTheme.colors.success }}
                      />
                      Thời gian giải quyết
                    </span>
                  }
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm:ss"
                    style={{
                      width: "100%",
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
                    }}
                    disabledDate={(current) =>
                      current && current < moment().startOf("day")
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <InfoCircleOutlined style={{ color: "#8b5cf6" }} />
                      Trạng thái
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn trạng thái!" },
                  ]}
                >
                  <Select
                    placeholder="Chọn trạng thái"
                    style={{ height: "48px", fontSize: "14px" }}
                  >
                    {Object.entries(STATUS_MAP).map(([key, label]) => (
                      <Option key={key} value={key}>
                        {label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="description_detail"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <FileTextOutlined style={{ color: "#6b7280" }} />
                      Mô tả chi tiết (Tùy chọn)
                    </span>
                  }
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Thêm thông tin chi tiết về sự cố..."
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Enhanced Detail Modal */}
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
                <EyeOutlined style={{ color: "white", fontSize: "20px" }} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                >
                  Chi tiết sự cố y tế
                </span>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  Thông tin chi tiết và cập nhật trạng thái
                </div>
              </div>
            </div>
          }
          open={medicalIncidentsDetailModal}
          onCancel={() => {
            setMedicalIncidentsDetailModal(false);
            setSelectedIncident(null);
            setSelectedStatus(undefined);
          }}
          footer={[
            <Button
              key="close"
              onClick={() => {
                setMedicalIncidentsDetailModal(false);
                setSelectedIncident(null);
                setSelectedStatus(undefined);
              }}
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
              Đóng
            </Button>,
            <Button
              key="edit"
              type="primary"
              icon={<EditOutlined />}
              onClick={handleUpdateStatus}
              disabled={
                !selectedStatus || selectedStatus === selectedIncident?.status
              }
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
          {selectedIncident ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: "24px" }}
            >
              <Form
                layout="vertical"
                initialValues={{
                  ...selectedIncident,
                  occurred_at: selectedIncident.occurred_at
                    ? moment(selectedIncident.occurred_at)
                    : null,
                  resolved_at: selectedIncident.resolved_at
                    ? moment(selectedIncident.resolved_at)
                    : null,
                  medication_used: selectedIncident.medication_used,
                  parent_name: selectedIncident.parent_name,
                }}
              >
                <Row gutter={[24, 24]}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span
                          className="flex items-center gap-2"
                          style={{ fontWeight: "600", color: "#374151" }}
                        >
                          <IdcardOutlined
                            style={{ color: modernTheme.colors.info }}
                          />
                          Mã sự kiện
                        </span>
                      }
                    >
                      <Input
                        value={selectedIncident.event_id}
                        readOnly
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
                          <UserOutlined
                            style={{ color: modernTheme.colors.success }}
                          />
                          Học sinh
                        </span>
                      }
                    >
                      <Input
                        value={selectedIncident.student_name}
                        readOnly
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
                            style={{ color: modernTheme.colors.warning }}
                          />
                          Phụ huynh
                        </span>
                      }
                    >
                      <Input
                        value={selectedIncident.parent_name || "Không rõ"}
                        readOnly
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
                          <TeamOutlined style={{ color: "#8b5cf6" }} />
                          Lớp
                        </span>
                      }
                    >
                      <Input
                        value={selectedIncident.class_name}
                        readOnly
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
                          <CalendarOutlined style={{ color: "#ec4899" }} />
                          Thời gian xảy ra
                        </span>
                      }
                    >
                      <DatePicker
                        value={
                          selectedIncident.occurred_at
                            ? moment(selectedIncident.occurred_at)
                            : null
                        }
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        disabled
                        style={{
                          width: "100%",
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
                          <WarningOutlined
                            style={{ color: modernTheme.colors.error }}
                          />
                          Mức độ nghiêm trọng
                        </span>
                      }
                    >
                      <Input
                        value={selectedIncident.severity_level}
                        readOnly
                        style={{
                          borderRadius: modernTheme.borderRadius.md,
                          height: "48px",
                          fontSize: "14px",
                          backgroundColor: "#f9fafb",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={
                        <span
                          className="flex items-center gap-2"
                          style={{ fontWeight: "600", color: "#374151" }}
                        >
                          <FileTextOutlined style={{ color: "#06b6d4" }} />
                          Mô tả
                        </span>
                      }
                    >
                      <Input.TextArea
                        value={selectedIncident.description}
                        readOnly
                        rows={3}
                        style={{
                          borderRadius: modernTheme.borderRadius.md,
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
                          <InfoCircleOutlined style={{ color: "#8b5cf6" }} />
                          Trạng thái
                        </span>
                      }
                      name="status"
                    >
                      <Select
                        value={selectedStatus || selectedIncident.status}
                        onChange={(value) => setSelectedStatus(value)}
                        style={{
                          width: "100%",
                          height: "48px",
                          fontSize: "14px",
                        }}
                      >
                        {Object.entries(STATUS_MAP).map(([key, label]) => (
                          <Option key={key} value={key}>
                            {label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span
                          className="flex items-center gap-2"
                          style={{ fontWeight: "600", color: "#374151" }}
                        >
                          <MedicineBoxOutlined
                            style={{ color: modernTheme.colors.success }}
                          />
                          Vật tư đã sử dụng
                        </span>
                      }
                    >
                      <Input
                        value={selectedIncident.medication_used}
                        readOnly
                        style={{
                          borderRadius: modernTheme.borderRadius.md,
                          height: "48px",
                          fontSize: "14px",
                          backgroundColor: "#f9fafb",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={
                        <span
                          className="flex items-center gap-2"
                          style={{ fontWeight: "600", color: "#374151" }}
                        >
                          <SafetyOutlined style={{ color: "#06b6d4" }} />
                          Hướng giải quyết
                        </span>
                      }
                    >
                      <Input.TextArea
                        value={selectedIncident.resolution_notes || "Chưa có"}
                        readOnly
                        rows={3}
                        style={{
                          borderRadius: modernTheme.borderRadius.md,
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
                          <CheckCircleOutlined
                            style={{ color: modernTheme.colors.success }}
                          />
                          Thời gian giải quyết
                        </span>
                      }
                    >
                      <DatePicker
                        value={
                          selectedIncident.resolved_at
                            ? moment(selectedIncident.resolved_at)
                            : null
                        }
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        disabled
                        style={{
                          width: "100%",
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
                          <FileTextOutlined style={{ color: "#6b7280" }} />
                          Mô tả chi tiết
                        </span>
                      }
                    >
                      <Input.TextArea
                        value={
                          selectedIncident.description_detail || "Không có"
                        }
                        readOnly
                        rows={3}
                        style={{
                          borderRadius: modernTheme.borderRadius.md,
                          fontSize: "14px",
                          backgroundColor: "#f9fafb",
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </motion.div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
            </div>
          )}
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
