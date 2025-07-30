"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  List,
  Typography,
  Tag,
  Empty,
  Avatar,
  Divider,
  Modal,
  Table,
  Badge,
  Progress,
  Statistic,
  Button,
} from "antd";
import {
  UserOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  RightOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BellOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  FiUsers,
  FiHeart,
  FiAlertTriangle,
  FiCalendar,
  FiBell,
  FiBox,
  FiActivity,
} from "react-icons/fi";
import {
  format,
  parseISO,
  isWithinInterval,
  startOfDay,
  addDays,
} from "date-fns";
import { vi } from "date-fns/locale";
import { NavLink } from "react-router-dom";
import { IoWarningOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { FaSyringe, FaStethoscope } from "react-icons/fa";
import { TbNurse } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchApprovedStudentsByCampaignId } from "../../redux/nurse/vaccinations/vaccinationSlice";
import { fetchHealthExaminationById } from "../../redux/nurse/heathExaminations/heathExamination";
import { motion } from "framer-motion";
import _ from "lodash";
import Stepper, { Step } from "../../Animation/Step/Stepper";

const { Title, Text } = Typography;

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
  padding: "32px",
  color: "white",
  marginBottom: "32px",
  boxShadow: `0 20px 60px rgba(102, 126, 234, 0.4)`,
  position: "relative",
  overflow: "hidden",
};

// Utility functions (keeping your original logic)
function getRecentMedicalIncidents(medicalIncidents) {
  const today = startOfDay(new Date());
  const sevenDaysAgo = addDays(today, 14);
  return medicalIncidents
    .filter((item) => {
      if (!item?.occurred_at) return false;
      const incidentDate = parseISO(item.occurred_at);
      return isWithinInterval(incidentDate, {
        start: sevenDaysAgo,
        end: today,
      });
    })
    .map((item) => ({
      description: item.description,
      medication_used: item.medication_used,
      student_name: item.student_name,
      incidentTime: item.occurred_at,
      severity: item.severity_level || "N/A",
    }))
    .sort((a, b) => new Date(b.incidentTime) - new Date(a.incidentTime));
}

function getLowOrExpiredSupplies(medicalSupplies) {
  const today = new Date();
  return medicalSupplies.filter((item) => {
    const expiredDate = new Date(item.expired_date);
    const daysRemaining = (expiredDate - today) / (1000 * 60 * 60 * 24); //milliseconds sang ngày.

    return (
      item.quantity <= 50 || daysRemaining <= 30 || item.is_active === false
    );
  });
}

function getUpcomingAppointments(campaigns, examinations) {
  const todayDate = startOfDay(new Date());
  const endDate = addDays(todayDate, 14);
  const mappedVaccinations = campaigns
    .filter((item) => {
      if (
        !item ||
        !item.scheduled_date ||
        item.approval_status?.toUpperCase() !== "APPROVED"
      )
        return false;
      const scheduledDate = parseISO(item.scheduled_date);
      return isWithinInterval(scheduledDate, {
        start: todayDate,
        end: endDate,
      });
    })
    .map((item) => ({
      type: "Tiêm chủng",
      scheduled_date: item.scheduled_date,
      description: item.vaccine_name || "Tiêm chủng định kỳ",
      title: item.title,
      create_by: item.fullname,
      campaign_id: item.campaign_id,
    }));

  const mappedExaminations = examinations
    .filter((item) => {
      if (
        !item ||
        !item.scheduled_date ||
        item.approval_status?.toUpperCase() !== "APPROVED"
      )
        return false;
      const parsedDate = parseISO(item.scheduled_date);
      return isWithinInterval(parsedDate, { start: todayDate, end: endDate });
    })
    .map((item) => ({
      type: "Khám sức khỏe",
      scheduled_date: item.scheduled_date,
      description: item.description || "Khám định kỳ",
      title: item.title,
      create_by: item.fullname,
      checkup_id: item.checkup_id,
    }));

  return [...mappedVaccinations, ...mappedExaminations].sort(
    (a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date)
  );
}

const formatDateVN = (dateString) => {
  if (!dateString) return "";
  return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
};

const isNormalHealthStatus = (status) => {
  if (!status) return false;
  const normalized = status.toLowerCase().trim();
  return ["bình thường", "tốt"].includes(normalized);
};

// Enhanced Countdown component
function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.total <= 0)
    return (
      <div className="flex items-center gap-2">
        <CheckCircleOutlined style={{ color: modernTheme.colors.success }} />
        <span style={{ color: modernTheme.colors.success, fontWeight: 600 }}>
          Đã đến lịch hẹn
        </span>
      </div>
    );

  return (
    <div className="flex items-center gap-2">
      <ClockCircleOutlined style={{ color: modernTheme.colors.info }} />
      <span style={{ color: modernTheme.colors.info, fontWeight: 500 }}>
        Còn {timeLeft.days} ngày {timeLeft.hours}:{timeLeft.minutes}:
        {timeLeft.seconds}
      </span>
    </div>
  );
}

function calcTimeLeft(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const total = Math.max(0, target - now);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { total, days, hours, minutes, seconds };
}

export default function NurseDashboardEnhanced() {
  const user = useSelector((state) => state.auth.user);
  const children = useSelector((state) => state.studentRecord.healthRecords);
  const medicalIncidents = useSelector(
    (state) => state.medicalIncidents.records
  );
  const medicalSupplies = useSelector(
    (state) => state.medicalSupplies.supplies
  );
  const campaigns = useSelector((state) => state.vaccination.campaigns);
  const examinations = useSelector((state) => state.examination.records);

  // Loading states
  const studentLoading = useSelector((state) => state.studentRecord.loading);
  const incidentsLoading = useSelector(
    (state) => state.medicalIncidents.loading
  );
  const suppliesLoading = useSelector((state) => state.medicalSupplies.loading);
  const vaccinationLoading = useSelector((state) => state.vaccination.loading);
  const examinationLoading = useSelector((state) => state.examination.loading);

  const loading =
    studentLoading ||
    incidentsLoading ||
    suppliesLoading ||
    vaccinationLoading ||
    examinationLoading;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State management
  const [appointmentPage, setAppointmentPage] = useState(1);
  const appointmentPageSize = 3;

  const [studentHealthPage, setStudentHealthPage] = useState(1);
  const studentWithDangerHealthPageSize = 3;

  const [incidentPage, setIncidentPage] = useState(1);
  const incidentPageSize = 3;

  const [isStudentListModalVisible, setIsStudentListModalVisible] =
    useState(false);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [studentListLoading, setStudentListLoading] = useState(false);

  // Memoized data
  const upcomingAppointments = useMemo(
    () => getUpcomingAppointments(campaigns, examinations),
    [campaigns, examinations]
  );

  console.log(upcomingAppointments);

  const studentWithDangerHealth = useMemo(
    () =>
      children.filter((child) => {
        const status = child.health?.health_status;
        return !isNormalHealthStatus(status);
      }),
    [children]
  );

  const lowOrExpiredSupplies = useMemo(
    () => getLowOrExpiredSupplies(medicalSupplies),
    [medicalSupplies]
  );

  const recentMedicalIncidents = useMemo(
    () => getRecentMedicalIncidents(medicalIncidents),
    [medicalIncidents]
  );

  // Event handlers
  const handleViewStudentList = useCallback(
    async (item) => {
      setStudentListLoading(true);
      console.log(item);
      try {
        if (item.type === "Tiêm chủng") {
          navigate(`vaccination/${item.campaign_id}/student-list`);
        } else {
          navigate(`checkup/${item.checkup_id}/student-list`);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setStudentListLoading(false);
      }
      // try {
      //   const result = await dispatch(
      //     fetchApprovedStudentsByCampaignId(campaignOrCheckupId)
      //   ).unwrap();
      //   setApprovedStudents(result);
      //   setIsStudentListModalVisible(true);
      // } catch (err) {
      //   toast.error(err.message);
      // } finally {
      //   setStudentListLoading(false);
      // }
    },
    [dispatch, navigate]
  );

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

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
      },
    }),
  };

  // Loading state
  const renderLoadingState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center"
      style={{ background: modernTheme.colors.background }}
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{
            width: "80px",
            height: "80px",
            border: `4px solid ${modernTheme.colors.primary}`,
            borderTop: "4px solid transparent",
            borderRadius: "50%",
            margin: "0 auto 24px",
          }}
        />
        <Title
          level={3}
          style={{ color: modernTheme.colors.primary, margin: 0 }}
        >
          Đang tải dữ liệu bảng điều khiển...
        </Title>
        <Text style={{ color: "#6b7280", fontSize: "16px" }}>
          Vui lòng chờ trong giây lát
        </Text>
      </div>
    </motion.div>
  );

  if (loading) {
    return renderLoadingState();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen p-6"
      style={{
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
                <TbNurse size={64} color="white" />
              </motion.div>
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
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
                    Xin chào, Y tá {user.fullname} 🧑‍⚕️
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
                    ✨ Chúc bạn một ngày làm việc hiệu quả!
                  </Text>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Row gutter={[24, 24]} className="mb-8">
            {/* Total Students Card */}
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
                      <FiUsers size={36} color="white" />
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
                      value={children.length}
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

            {/* Students with Health Issues Card */}
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
                      <FiHeart size={36} color="white" />
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
                          Học sinh có vấn đề sức khỏe
                        </span>
                      }
                      value={studentWithDangerHealth.length}
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

            {/* Medical Incidents Card */}
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
                      "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                    border: "1px solid #f87171",
                  }}
                  bodyStyle={{ padding: "32px 24px" }}
                >
                  <div className="text-center">
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        borderRadius: "16px",
                        width: "80px",
                        height: "80px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      <IoWarningOutline size={36} color="white" />
                    </div>
                    <Statistic
                      title={
                        <span
                          style={{
                            color: "#991b1b",
                            fontWeight: "600",
                            fontSize: "16px",
                          }}
                        >
                          Sự cố y tế
                        </span>
                      }
                      value={medicalIncidents.length}
                      valueStyle={{
                        color: "#991b1b",
                        fontWeight: "800",
                        fontSize: "32px",
                      }}
                    />
                    <Badge
                      count={recentMedicalIncidents.length}
                      style={{
                        backgroundColor: "#ef4444",
                        marginTop: "8px",
                        marginLeft: "30px",
                      }}
                      offset={[15, 50]}
                    >
                      <span style={{ color: "#991b1b", fontSize: "14px" }}>
                        Gần đây
                      </span>
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Medical Supplies Card */}
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
                      <FiBox size={36} color="white" />
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
                          Vật tư cần chú ý
                        </span>
                      }
                      value={lowOrExpiredSupplies.length}
                      valueStyle={{
                        color: "#92400e",
                        fontWeight: "800",
                        fontSize: "32px",
                      }}
                    />
                    <div style={{ marginTop: "8px" }}>
                      <Tag color="warning" style={{ fontSize: "12px" }}>
                        Hết/Sắp hết hạn
                      </Tag>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* Enhanced Content Sections */}
        <Row gutter={[24, 24]}>
          {/* Upcoming Appointments */}
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Card
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                          borderRadius: modernTheme.borderRadius.md,
                          padding: "12px",
                          boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
                        }}
                      >
                        <FiCalendar size={20} color="white" />
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#1f2937",
                          }}
                        >
                          Lịch khám và tiêm chủng sắp tới
                        </span>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginTop: "2px",
                          }}
                        >
                          {upcomingAppointments.length} lịch hẹn trong 14 ngày
                          tới
                        </div>
                      </div>
                    </div>
                    <Badge
                      count={upcomingAppointments.length}
                      style={{ backgroundColor: modernTheme.colors.info }}
                    />
                  </div>
                }
                style={modernCardStyle}
                bodyStyle={{ padding: "24px" }}
              >
                <Stepper
                  onStepChange={(step) => {
                    setAppointmentPage(step);
                  }}
                  backButtonText="Trang trước"
                  nextButtonText="Trang sau"
                  disableStepIndicators={true}
                  currentStep={appointmentPage}
                >
                  {upcomingAppointments.length > 0 ? (
                    Array.from({
                      length: Math.ceil(
                        upcomingAppointments.length / appointmentPageSize
                      ),
                    }).map((_, idx) => (
                      <Step key={idx}>
                        <List
                          itemLayout="horizontal"
                          dataSource={upcomingAppointments.slice(
                            idx * appointmentPageSize,
                            (idx + 1) * appointmentPageSize
                          )}
                          renderItem={(item, index) => (
                            <motion.div
                              variants={listItemVariants}
                              initial="hidden"
                              animate="visible"
                              custom={index}
                            >
                              <List.Item
                                style={{
                                  padding: "16px",
                                  marginBottom: "12px",
                                  background:
                                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                                  borderRadius: modernTheme.borderRadius.lg,
                                  border: "1px solid #e2e8f0",
                                  cursor: "pointer",
                                  transition: "all 0.3s ease",
                                }}
                                className="hover:shadow-lg hover:-translate-y-1"
                                onClick={() => handleViewStudentList(item)}
                              >
                                <List.Item.Meta
                                  avatar={
                                    <Avatar
                                      size={48}
                                      icon={
                                        item.type === "Tiêm chủng" ? (
                                          <FaSyringe />
                                        ) : (
                                          <FaStethoscope />
                                        )
                                      }
                                      style={{
                                        backgroundColor:
                                          item.type === "Tiêm chủng"
                                            ? modernTheme.colors.info
                                            : modernTheme.colors.success,
                                        boxShadow:
                                          "0 4px 12px rgba(0, 0, 0, 0.15)",
                                      }}
                                    />
                                  }
                                  title={
                                    <div className="flex items-center gap-2">
                                      <Text
                                        strong
                                        style={{
                                          fontSize: "16px",
                                          color: "#1f2937",
                                        }}
                                      >
                                        {item.title}
                                      </Text>
                                      <Tag
                                        color={
                                          item.type === "Tiêm chủng"
                                            ? "blue"
                                            : "green"
                                        }
                                        style={{
                                          borderRadius:
                                            modernTheme.borderRadius.sm,
                                          fontWeight: "600",
                                        }}
                                      >
                                        {item.type}
                                      </Tag>
                                    </div>
                                  }
                                  description={
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <CalendarOutlined
                                          style={{
                                            color: modernTheme.colors.info,
                                          }}
                                        />
                                        <Text
                                          style={{
                                            color: "#6b7280",
                                            fontSize: "14px",
                                          }}
                                        >
                                          {formatDateVN(item.scheduled_date)}
                                        </Text>
                                      </div>
                                      <CountdownTimer
                                        targetDate={item.scheduled_date}
                                      />
                                      <div className="flex items-center gap-2">
                                        <UserOutlined
                                          style={{ color: "#8b5cf6" }}
                                        />
                                        <Text
                                          style={{
                                            color: "#6b7280",
                                            fontSize: "14px",
                                          }}
                                        >
                                          Tạo bởi: {item.create_by}
                                        </Text>
                                      </div>
                                    </div>
                                  }
                                />
                                <Button
                                  type="primary"
                                  ghost
                                  icon={<EyeOutlined />}
                                  style={{
                                    borderRadius: modernTheme.borderRadius.md,
                                    borderColor: modernTheme.colors.info,
                                    color: modernTheme.colors.info,
                                  }}
                                >
                                  Xem chi tiết
                                </Button>
                              </List.Item>
                            </motion.div>
                          )}
                        />
                      </Step>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
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
                        <FiCalendar size={32} color="#9ca3af" />
                      </div>
                      <Text style={{ color: "#6b7280", fontSize: "16px" }}>
                        Không có lịch hẹn nào sắp tới
                      </Text>
                    </div>
                  )}
                </Stepper>

                {/* {upcomingAppointments.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={upcomingAppointments.slice(0, 5)}
                    renderItem={(item, index) => (
                      <motion.div
                        variants={listItemVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                      >
                        <List.Item
                          style={{
                            padding: "16px",
                            marginBottom: "12px",
                            background:
                              "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                            borderRadius: modernTheme.borderRadius.lg,
                            border: "1px solid #e2e8f0",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                          className="hover:shadow-lg hover:-translate-y-1"
                          onClick={() =>
                            handleViewStudentList(
                              item.campaign_id || item.checkup_id
                            )
                          }
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                size={48}
                                icon={
                                  item.type === "Tiêm chủng" ? (
                                    <FaSyringe />
                                  ) : (
                                    <FaStethoscope />
                                  )
                                }
                                style={{
                                  backgroundColor:
                                    item.type === "Tiêm chủng"
                                      ? modernTheme.colors.info
                                      : modernTheme.colors.success,
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                }}
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
                                  color={
                                    item.type === "Tiêm chủng"
                                      ? "blue"
                                      : "green"
                                  }
                                  style={{
                                    borderRadius: modernTheme.borderRadius.sm,
                                    fontWeight: "600",
                                  }}
                                >
                                  {item.type}
                                </Tag>
                              </div>
                            }
                            description={
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CalendarOutlined
                                    style={{ color: modernTheme.colors.info }}
                                  />
                                  <Text
                                    style={{
                                      color: "#6b7280",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {formatDateVN(item.scheduled_date)}
                                  </Text>
                                </div>
                                <CountdownTimer
                                  targetDate={item.scheduled_date}
                                />
                                <div className="flex items-center gap-2">
                                  <UserOutlined style={{ color: "#8b5cf6" }} />
                                  <Text
                                    style={{
                                      color: "#6b7280",
                                      fontSize: "14px",
                                    }}
                                  >
                                    Tạo bởi: {item.create_by}
                                  </Text>
                                </div>
                              </div>
                            }
                          />
                          <Button
                            type="primary"
                            ghost
                            icon={<EyeOutlined />}
                            style={{
                              borderRadius: modernTheme.borderRadius.md,
                              borderColor: modernTheme.colors.info,
                              color: modernTheme.colors.info,
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </List.Item>
                      </motion.div>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
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
                      <FiCalendar size={32} color="#9ca3af" />
                    </div>
                    <Text style={{ color: "#6b7280", fontSize: "16px" }}>
                      Không có lịch hẹn nào sắp tới
                    </Text>
                  </div>
                )} */}
              </Card>
            </motion.div>
          </Col>

          {/* Recent Medical Incidents */}
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                          borderRadius: modernTheme.borderRadius.md,
                          padding: "12px",
                          boxShadow: "0 8px 32px rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        <FiAlertTriangle size={20} color="white" />
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#1f2937",
                          }}
                        >
                          Sự cố y khoa gần đây
                        </span>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginTop: "2px",
                          }}
                        >
                          {recentMedicalIncidents.length} sự cố trong 14 ngày
                          qua
                        </div>
                      </div>
                    </div>
                    <NavLink
                      to="/nurse/medical-incidents"
                      style={{
                        color: modernTheme.colors.error,
                        textDecoration: "none",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      Xem tất cả <RightOutlined />
                    </NavLink>
                  </div>
                }
                style={modernCardStyle}
                bodyStyle={{ padding: "24px" }}
              >
                {recentMedicalIncidents.length > 0 ? (
                  <Stepper
                    onStepChange={(step) => {
                      setIncidentPage(step);
                    }}
                    backButtonText="Trang trước"
                    nextButtonText="Trang sau"
                    disableStepIndicators={true}
                    currentStep={incidentPage}
                  >
                    {Array.from({
                      length: Math.ceil(
                        recentMedicalIncidents.length / incidentPageSize
                      ),
                    }).map((_, idx) => (
                      <Step key={idx}>
                        <List
                          itemLayout="horizontal"
                          dataSource={recentMedicalIncidents.slice(
                            idx * incidentPageSize,
                            (idx + 1) * incidentPageSize
                          )}
                          renderItem={(item, index) => (
                            <motion.div
                              variants={listItemVariants}
                              initial="hidden"
                              animate="visible"
                              custom={index}
                            >
                              <List.Item
                                style={{
                                  padding: "16px",
                                  marginBottom: "12px",
                                  background:
                                    "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                                  borderRadius: modernTheme.borderRadius.lg,
                                  border: "1px solid #fecaca",
                                  transition: "all 0.3s ease",
                                }}
                                className="hover:shadow-lg hover:-translate-y-1"
                              >
                                <List.Item.Meta
                                  avatar={
                                    <Avatar
                                      size={48}
                                      icon={<WarningOutlined />}
                                      style={{
                                        backgroundColor:
                                          modernTheme.colors.error,
                                        boxShadow:
                                          "0 4px 12px rgba(239, 68, 68, 0.3)",
                                      }}
                                    />
                                  }
                                  title={
                                    <Text
                                      strong
                                      style={{
                                        fontSize: "16px",
                                        color: "#1f2937",
                                      }}
                                    >
                                      {item.student_name}
                                    </Text>
                                  }
                                  description={
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <CalendarOutlined
                                          style={{
                                            color: modernTheme.colors.error,
                                          }}
                                        />
                                        <Text
                                          style={{
                                            color: "#6b7280",
                                            fontSize: "14px",
                                          }}
                                        >
                                          {formatDateVN(item.incidentTime)}
                                        </Text>
                                        <Tag
                                          color="red"
                                          style={{
                                            borderRadius:
                                              modernTheme.borderRadius.sm,
                                            fontWeight: "600",
                                          }}
                                        >
                                          {item.severity}
                                        </Tag>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MedicineBoxOutlined
                                          style={{ color: "#8b5cf6" }}
                                        />
                                        <Text
                                          style={{
                                            color: "#6b7280",
                                            fontSize: "14px",
                                          }}
                                        >
                                          Thuốc: {item.medication_used}
                                        </Text>
                                      </div>
                                    </div>
                                  }
                                />
                              </List.Item>
                            </motion.div>
                          )}
                        />
                      </Step>
                    ))}
                  </Stepper>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
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
                      <FiAlertTriangle size={32} color="#9ca3af" />
                    </div>
                    <Text style={{ color: "#6b7280", fontSize: "16px" }}>
                      Không có sự cố gần đây
                    </Text>
                  </div>
                )}
              </Card>
            </motion.div>
          </Col>

          {/* Health Alerts */}
          <Col xs={24}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <Card
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                          borderRadius: modernTheme.borderRadius.md,
                          padding: "12px",
                          boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
                        }}
                      >
                        <FiBell size={20} color="white" />
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#1f2937",
                          }}
                        >
                          Cảnh báo sức khỏe học sinh
                        </span>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginTop: "2px",
                          }}
                        >
                          {studentWithDangerHealth.length} học sinh cần chú ý
                        </div>
                      </div>
                    </div>
                    <Badge
                      count={studentWithDangerHealth.length}
                      style={{ backgroundColor: modernTheme.colors.warning }}
                    />
                  </div>
                }
                style={modernCardStyle}
                bodyStyle={{ padding: "24px" }}
              >
                <Stepper
                  onStepChange={(step) => {
                    setStudentHealthPage(step); // Sync inputPage when step changes
                  }}
                  backButtonText="Trang trước"
                  nextButtonText="Trang sau"
                  disableStepIndicators={true}
                  currentStep={studentHealthPage}
                >
                  {Array.from({
                    length: Math.ceil(
                      studentWithDangerHealth.length /
                        studentWithDangerHealthPageSize
                    ),
                  }).map((_, idx) => (
                    <Step key={idx}>
                      <List
                        itemLayout="horizontal"
                        dataSource={studentWithDangerHealth.slice(
                          idx * studentWithDangerHealthPageSize,
                          (idx + 1) * studentWithDangerHealthPageSize
                        )}
                        renderItem={(item, index) => {
                          let healthColor = "orange";
                          const status =
                            item.health?.health_status?.toLowerCase() || "";
                          if (
                            [
                              "nguy kịch",
                              "nguy hiểm",
                              "critical",
                              "danger",
                            ].includes(status)
                          )
                            healthColor = "red";

                          return (
                            <motion.div
                              variants={listItemVariants}
                              initial="hidden"
                              animate="visible"
                              custom={index}
                            >
                              <List.Item
                                style={{
                                  padding: "20px",
                                  marginBottom: "16px",
                                  background:
                                    "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                                  borderRadius: modernTheme.borderRadius.lg,
                                  border: "1px solid #fde68a",
                                  cursor: "pointer",
                                  transition: "all 0.3s ease",
                                }}
                                className="hover:shadow-lg hover:-translate-y-1"
                                onClick={() =>
                                  navigate(
                                    `/nurse/students-record/${item.student_id}`
                                  )
                                }
                              >
                                <List.Item.Meta
                                  avatar={
                                    <Avatar
                                      size={56}
                                      icon={<ExclamationCircleOutlined />}
                                      style={{
                                        backgroundColor:
                                          modernTheme.colors.warning,
                                        boxShadow:
                                          "0 4px 12px rgba(245, 158, 11, 0.3)",
                                      }}
                                    />
                                  }
                                  title={
                                    <div className="flex items-center gap-2">
                                      <Text
                                        strong
                                        style={{
                                          fontSize: "18px",
                                          color: "#1f2937",
                                        }}
                                      >
                                        {item.student_name}
                                      </Text>
                                      <Tag
                                        color={healthColor}
                                        style={{
                                          borderRadius:
                                            modernTheme.borderRadius.sm,
                                          fontWeight: "600",
                                        }}
                                      >
                                        {item.health?.health_status || "N/A"}
                                      </Tag>
                                    </div>
                                  }
                                  description={
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <TeamOutlined
                                          style={{
                                            color: modernTheme.colors.info,
                                          }}
                                        />
                                        <Text
                                          style={{
                                            color: "#6b7280",
                                            fontSize: "14px",
                                          }}
                                        >
                                          Lớp: {item.class_name}
                                        </Text>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <CalendarOutlined
                                          style={{ color: "#8b5cf6" }}
                                        />
                                        <Text
                                          style={{
                                            color: "#6b7280",
                                            fontSize: "14px",
                                          }}
                                        >
                                          Ngày sinh:{" "}
                                          {formatDateVN(
                                            item.student_date_of_birth
                                          )}
                                        </Text>
                                      </div>
                                    </div>
                                  }
                                />
                                <Button
                                  type="primary"
                                  ghost
                                  icon={<EyeOutlined />}
                                  style={{
                                    borderRadius: modernTheme.borderRadius.md,
                                    borderColor: modernTheme.colors.warning,
                                    color: modernTheme.colors.warning,
                                  }}
                                >
                                  Xem hồ sơ
                                </Button>
                              </List.Item>
                            </motion.div>
                          );
                        }}
                      />
                      {/* ) : (
                      <div
                        style={{ textAlign: "center", padding: "40px 20px" }}
                      >
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
                          <FiBell size={32} color="#9ca3af" />
                        </div>
                        <Text style={{ color: "#6b7280", fontSize: "16px" }}>
                          Không có cảnh báo sức khỏe
                        </Text>
                      </div> */}
                    </Step>
                  ))}
                </Stepper>

                {/* {studentWithDangerHealth.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={studentWithDangerHealth.slice(0, 6)}
                    renderItem={(item, index) => {
                      let healthColor = "orange";
                      const status =
                        item.health?.health_status?.toLowerCase() || "";
                      if (
                        [
                          "nguy kịch",
                          "nguy hiểm",
                          "critical",
                          "danger",
                        ].includes(status)
                      )
                        healthColor = "red";

                      return (
                        <motion.div
                          variants={listItemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={index}
                        >
                          <List.Item
                            style={{
                              padding: "20px",
                              marginBottom: "16px",
                              background:
                                "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                              borderRadius: modernTheme.borderRadius.lg,
                              border: "1px solid #fde68a",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                            className="hover:shadow-lg hover:-translate-y-1"
                            onClick={() =>
                              navigate(
                                `/nurse/students-record/${item.student_id}`
                              )
                            }
                          >
                            <List.Item.Meta
                              avatar={
                                <Avatar
                                  size={56}
                                  icon={<ExclamationCircleOutlined />}
                                  style={{
                                    backgroundColor: modernTheme.colors.warning,
                                    boxShadow:
                                      "0 4px 12px rgba(245, 158, 11, 0.3)",
                                  }}
                                />
                              }
                              title={
                                <div className="flex items-center gap-2">
                                  <Text
                                    strong
                                    style={{
                                      fontSize: "18px",
                                      color: "#1f2937",
                                    }}
                                  >
                                    {item.student_name}
                                  </Text>
                                  <Tag
                                    color={healthColor}
                                    style={{
                                      borderRadius: modernTheme.borderRadius.sm,
                                      fontWeight: "600",
                                    }}
                                  >
                                    {item.health?.health_status || "N/A"}
                                  </Tag>
                                </div>
                              }
                              description={
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <TeamOutlined
                                      style={{ color: modernTheme.colors.info }}
                                    />
                                    <Text
                                      style={{
                                        color: "#6b7280",
                                        fontSize: "14px",
                                      }}
                                    >
                                      Lớp: {item.class_name}
                                    </Text>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CalendarOutlined
                                      style={{ color: "#8b5cf6" }}
                                    />
                                    <Text
                                      style={{
                                        color: "#6b7280",
                                        fontSize: "14px",
                                      }}
                                    >
                                      Ngày sinh:{" "}
                                      {formatDateVN(item.student_date_of_birth)}
                                    </Text>
                                  </div>
                                </div>
                              }
                            />
                            <Button
                              type="primary"
                              ghost
                              icon={<EyeOutlined />}
                              style={{
                                borderRadius: modernTheme.borderRadius.md,
                                borderColor: modernTheme.colors.warning,
                                color: modernTheme.colors.warning,
                              }}
                            >
                              Xem hồ sơ
                            </Button>
                          </List.Item>
                        </motion.div>
                      );
                    }}
                  />
                ) : (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
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
                      <FiBell size={32} color="#9ca3af" />
                    </div>
                    <Text style={{ color: "#6b7280", fontSize: "16px" }}>
                      Không có cảnh báo sức khỏe
                    </Text>
                  </div>
                )} */}
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Enhanced Modal */}
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
                  Danh sách học sinh đã duyệt
                </span>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  Thông tin chi tiết học sinh tham gia
                </div>
              </div>
            </div>
          }
          open={isStudentListModalVisible}
          onCancel={() => setIsStudentListModalVisible(false)}
          footer={null}
          centered
          width={1000}
          styles={{
            content: {
              borderRadius: modernTheme.borderRadius.xl,
              boxShadow: modernTheme.shadows.card,
            },
          }}
        >
          <Divider style={{ margin: "24px 0" }} />
          <Table
            dataSource={approvedStudents}
            rowKey="id"
            pagination={{
              pageSize: 6,
              showSizeChanger: false,
              className: "pt-4 text-sm",
            }}
            loading={studentListLoading}
            style={{
              borderRadius: modernTheme.borderRadius.lg,
              overflow: "hidden",
            }}
            columns={[
              {
                title: (
                  <div className="flex items-center gap-2">
                    <UserOutlined style={{ color: modernTheme.colors.info }} />
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
                      color: modernTheme.colors.info,
                    }}
                  >
                    {text}
                  </Text>
                ),
              },
              {
                title: (
                  <div className="flex items-center gap-2">
                    <UserOutlined
                      style={{ color: modernTheme.colors.secondary }}
                    />
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
                      color: modernTheme.colors.secondary,
                    }}
                  >
                    {text}
                  </Text>
                ),
              },
              {
                title: (
                  <div className="flex items-center gap-2">
                    <UserOutlined
                      style={{ color: modernTheme.colors.success }}
                    />
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
                      style={{ color: modernTheme.colors.warning }}
                    />
                    <span className="font-semibold">Lớp</span>
                  </div>
                ),
                dataIndex: "class_name",
                key: "class_name",
                render: (text) => (
                  <Tag
                    color="gold"
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
                    <CalendarOutlined style={{ color: "#8b5cf6" }} />
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
                    <MedicineBoxOutlined
                      style={{ color: modernTheme.colors.error }}
                    />
                    <span className="font-semibold">Thời gian tiêm</span>
                  </div>
                ),
                dataIndex: "vaccinated_at",
                key: "vaccinated_at",
                render: (date) =>
                  date ? format(parseISO(date), "dd/MM/yyyy HH:mm:ss") : "N/A",
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
        </Modal>
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx global>{`
        .ant-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ant-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
        }
        .ant-list-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ant-list-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 2px solid #e2e8f0;
          font-weight: 700;
          color: #1e293b;
          padding: 16px;
          font-size: 14px;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f0f9ff !important;
        }
        .ant-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ant-btn:hover {
          transform: translateY(-1px);
        }
        .ant-statistic-content {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </motion.div>
  );
}
