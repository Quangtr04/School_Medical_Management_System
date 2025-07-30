"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Spin,
  Empty,
  Button,
  Table,
  Tag,
  Space,
  Row,
  Col,
  Statistic,
  Avatar,
} from "antd";
import { FiFileText, FiRefreshCcw } from "react-icons/fi";
import {
  LoadingOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { format, parseISO } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingCheckupRequests,
  fetchPendingVaccineCampaigns,
  respondToCheckupRequest,
  respondToVaccineRequest,
} from "../../redux/manager/managerSlice";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const { Text, Title } = Typography;

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
  background: `linear-gradient(135deg, ${modernTheme.colors.primary} 0%, ${modernTheme.colors.secondary} 100%)`,
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

export default function ManagerDashboardPage() {
  const dispatch = useDispatch();
  const {
    pendingCheckupRequests,
    pendingVaccineCampaigns,
    loading,
    loadingVaccineCampaigns,
  } = useSelector((state) => state.manager);

  // State loading cho từng request
  const [processingId, setProcessingId] = useState(null);
  const [processingType, setProcessingType] = useState(null);

  useEffect(() => {
    dispatch(fetchPendingCheckupRequests());
    dispatch(fetchPendingVaccineCampaigns());
  }, [dispatch]);

  const handleReviewRequest = React.useCallback(
    (record, action) => {
      setProcessingId(
        record.checkup_id ? record.checkup_id : record.campaign_id
      );
      setProcessingType(record.type);
      if (record.type === "CHECKUP") {
        dispatch(
          respondToCheckupRequest({ requestId: record.checkup_id, action })
        )
          .unwrap()
          .then(() => {
            toast.success(
              `Đã ${
                action === "APPROVED" ? "duyệt" : "từ chối"
              } lịch khám thành công`
            );
            setProcessingId(null);
            setProcessingType(null);
          })
          .catch((err) => {
            toast.error(
              `Đã ${
                action === "APPROVED" ? "duyệt" : "từ chối"
              }  lịch khám thất bại`
            );
            setProcessingId(null);
            setProcessingType(null);
          });
      } else if (record.type === "VACCINE") {
        dispatch(
          respondToVaccineRequest({
            campaign_id: record.campaign_id,
            action,
          })
        )
          .unwrap()
          .then(() => {
            toast.success(
              `Đã ${
                action === "APPROVED" ? "duyệt" : "từ chối"
              } chiến dịch tiêm thành công`
            );
            setProcessingId(null);
            setProcessingType(null);
          })
          .catch((err) => {
            toast.error(
              `Đã ${
                action === "APPROVED" ? "duyệt" : "từ chối"
              } chiến dịch tiêm thất bại`
            );
            setProcessingId(null);
            setProcessingType(null);
          });
      }
    },
    [dispatch]
  );

  const combinedRequests = React.useMemo(
    () => [
      ...(pendingCheckupRequests || [])
        .filter((item) => item.approval_status === "PENDING")
        .map((item) => ({
          ...item,
          type: "CHECKUP",
        })),
      ...(pendingVaccineCampaigns || [])
        .filter((item) => item.approval_status === "PENDING")
        .map((item) => ({
          ...item,
          type: "VACCINE",
        })),
    ],
    [pendingCheckupRequests, pendingVaccineCampaigns]
  );

  // Calculate statistics
  const statistics = {
    total: combinedRequests.length,
    checkups: combinedRequests.filter((r) => r.type === "CHECKUP").length,
    vaccines: combinedRequests.filter((r) => r.type === "VACCINE").length,
    processing: processingId ? 1 : 0,
  };

  // Reset loading khi hết đơn
  useEffect(() => {
    if (combinedRequests.length === 0) {
      setProcessingId(null);
      setProcessingType(null);
    }
  }, [combinedRequests]);

  // Enhanced columns configuration
  const columns = [
    {
      title: (
        <div className="flex items-center gap-2">
          <FileTextOutlined style={{ color: modernTheme.colors.primary }} />
          <span className="font-semibold">Thông tin yêu cầu</span>
        </div>
      ),
      key: "request_info",
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={48}
            icon={
              record.type === "CHECKUP" ? (
                <HeartOutlined />
              ) : (
                <MedicineBoxOutlined />
              )
            }
            style={{
              backgroundColor:
                record.type === "CHECKUP"
                  ? modernTheme.colors.success
                  : modernTheme.colors.info,
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            }}
          />
          <div>
            <Text
              strong
              style={{ color: "#1f2937", fontSize: "14px", display: "block" }}
            >
              {record.title}
            </Text>
            <Tag
              color={record.type === "CHECKUP" ? "geekblue" : "purple"}
              style={{
                borderRadius: modernTheme.borderRadius.sm,
                fontSize: "11px",
                fontWeight: 500,
                marginTop: "4px",
              }}
            >
              {record.type === "CHECKUP" ? "Khám Sức Khỏe" : "Tiêm Chủng"}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <UserOutlined style={{ color: modernTheme.colors.success }} />
          <span className="font-semibold">Người tạo đơn</span>
        </div>
      ),
      dataIndex: "fullname",
      key: "nurseName",
      width: 160,
      render: (name) => (
        <div className="flex items-center gap-2">
          <Avatar
            size={32}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#f56a00" }}
          />
          <Text style={{ fontSize: "14px", fontWeight: 500 }}>{name}</Text>
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
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Text
          style={{ fontSize: "13px", color: "#6b7280" }}
          ellipsis={{ tooltip: text }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <CalendarOutlined style={{ color: modernTheme.colors.secondary }} />
          <span className="font-semibold">Ngày tạo</span>
        </div>
      ),
      dataIndex: "created_at",
      key: "created_at",
      width: 140,
      render: (date) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined style={{ color: "#6b7280", fontSize: "14px" }} />
          <Text style={{ fontSize: "13px" }}>
            {date ? format(parseISO(date), "dd/MM/yyyy") : "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <DollarCircleOutlined style={{ color: modernTheme.colors.info }} />
          <span className="font-semibold">Nhà tài trợ</span>
        </div>
      ),
      dataIndex: "sponsor",
      key: "sponsor",
      width: 140,
      render: (sponsor) => (
        <Tag
          color="cyan"
          style={{
            borderRadius: modernTheme.borderRadius.md,
            fontSize: "12px",
            fontWeight: 500,
            padding: "4px 8px",
          }}
        >
          {sponsor}
        </Tag>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <TeamOutlined style={{ color: modernTheme.colors.warning }} />
          <span className="font-semibold">Lớp áp dụng</span>
        </div>
      ),
      dataIndex: "class",
      key: "class_name",
      width: 120,
      render: (text) => (
        <Tag
          color="blue"
          style={{
            borderRadius: modernTheme.borderRadius.md,
            fontSize: "12px",
            fontWeight: 500,
            padding: "4px 8px",
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <SettingOutlined style={{ color: "#8c8c8c" }} />
          <span className="font-semibold">Thao tác</span>
        </div>
      ),
      key: "actions",
      width: 160,
      render: (_, record) => {
        const isProcessing =
          processingId === (record.checkup_id || record.campaign_id) &&
          processingType === record.type;
        const isDisabled = processingId && !isProcessing;

        return (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleReviewRequest(record, "APPROVED")}
              loading={isProcessing}
              disabled={isDisabled}
              style={{
                width: "100%",
                borderRadius: modernTheme.borderRadius.md,
                background: modernTheme.colors.success,
                border: "none",
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                fontWeight: 500,
                fontSize: "12px",
              }}
              className="hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Duyệt
            </Button>
            <Button
              danger
              icon={<ExclamationCircleOutlined />}
              onClick={() => handleReviewRequest(record, "DECLINED")}
              loading={isProcessing}
              disabled={isDisabled}
              style={{
                width: "100%",
                borderRadius: modernTheme.borderRadius.md,
                fontWeight: 500,
                fontSize: "12px",
              }}
              className="hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Từ chối
            </Button>
          </Space>
        );
      },
    },
  ];

  const isLoading = loading || loadingVaccineCampaigns;

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
                <FiFileText style={{ fontSize: "48px", color: "white" }} />
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
                  Bảng Điều Khiển Quản Lý 📋
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
                  ⭐ Quản lý các yêu cầu y tế từ y tá
                </Text>
              </div>
            </div>
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
                      <FileTextOutlined
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
                          Tổng yêu cầu
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
                      <HeartOutlined
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
                          Khám sức khỏe
                        </span>
                      }
                      value={statistics.checkups}
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
                      "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                    border: "1px solid #c4b5fd",
                  }}
                  bodyStyle={{ padding: "32px 24px" }}
                >
                  <div className="text-center">
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                        borderRadius: "16px",
                        width: "80px",
                        height: "80px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)",
                      }}
                    >
                      <MedicineBoxOutlined
                        style={{ fontSize: "36px", color: "white" }}
                      />
                    </div>
                    <Statistic
                      title={
                        <span
                          style={{
                            color: "#6b21a8",
                            fontWeight: "600",
                            fontSize: "16px",
                          }}
                        >
                          Tiêm chủng
                        </span>
                      }
                      value={statistics.vaccines}
                      valueStyle={{
                        color: "#6b21a8",
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
                      <ClockCircleOutlined
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
                          Đang xử lý
                        </span>
                      }
                      value={statistics.processing}
                      valueStyle={{
                        color: "#92400e",
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

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {isLoading ? (
            <Card style={modernCardStyle} bodyStyle={{ padding: "80px 0" }}>
              <div className="text-center flex flex-col items-center justify-center gap-4">
                <Spin
                  indicator={
                    <LoadingOutlined
                      style={{
                        fontSize: 48,
                        color: modernTheme.colors.primary,
                      }}
                      spin
                    />
                  }
                />
                <Title level={4} style={{ color: "#64748b", marginBottom: 0 }}>
                  Đang tải danh sách yêu cầu...
                </Title>
                <Text style={{ color: "#9ca3af", fontSize: "16px" }}>
                  Vui lòng chờ trong giây lát
                </Text>
              </div>
            </Card>
          ) : (
            <Card style={modernCardStyle} bodyStyle={{ padding: 0 }}>
              {/* Enhanced Table Header */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  borderBottom: "2px solid #e2e8f0",
                  padding: "24px",
                  borderRadius: `${modernTheme.borderRadius.xl} ${modernTheme.borderRadius.xl} 0 0`,
                }}
              >
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
                  <FiFileText
                    style={{
                      color: modernTheme.colors.primary,
                      fontSize: "24px",
                    }}
                  />
                  Các yêu cầu đang chờ duyệt ({combinedRequests.length})
                </Title>
                <Text
                  style={{
                    color: "#64748b",
                    marginTop: "8px",
                    fontSize: "16px",
                  }}
                >
                  Quản lý và phê duyệt các yêu cầu khám sức khỏe và tiêm chủng
                </Text>
              </div>

              {/* Enhanced Table or Empty State */}
              <div style={{ overflow: "hidden" }}>
                {combinedRequests.length > 0 ? (
                  <Table
                    dataSource={combinedRequests}
                    columns={columns}
                    rowKey={(record) => record.checkup_id || record.campaign_id}
                    pagination={{
                      pageSize: 8,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => (
                        <span style={{ color: "#64748b", fontWeight: 500 }}>
                          Hiển thị {range[0]}-{range[1]} trong tổng số {total}{" "}
                          yêu cầu
                        </span>
                      ),
                      style: { padding: "16px 24px" },
                    }}
                    scroll={{ x: 1400 }}
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
                ) : (
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
                          <CheckCircleOutlined />
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
                            🎉 Tuyệt vời! Không có yêu cầu nào đang chờ duyệt
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
                            Tất cả các yêu cầu đã được xử lý hoặc chưa có yêu
                            cầu mới nào được gửi lên. Hệ thống sẽ tự động cập
                            nhật khi có yêu cầu mới.
                          </Text>
                          <div style={{ marginTop: "24px" }}>
                            <Button
                              type="primary"
                              icon={<FiRefreshCcw />}
                              onClick={() => {
                                dispatch(fetchPendingCheckupRequests());
                                dispatch(fetchPendingVaccineCampaigns());
                              }}
                              style={{
                                height: "44px",
                                borderRadius: modernTheme.borderRadius.lg,
                                background: modernTheme.colors.primary,
                                border: "none",
                                fontWeight: 500,
                                boxShadow:
                                  "0 4px 12px rgba(102, 126, 234, 0.3)",
                              }}
                            >
                              Kiểm tra lại
                            </Button>
                          </div>
                        </div>
                      }
                    />
                  </div>
                )}
              </div>
            </Card>
          )}
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
